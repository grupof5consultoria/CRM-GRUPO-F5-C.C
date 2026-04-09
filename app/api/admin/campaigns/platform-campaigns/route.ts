import { NextRequest, NextResponse } from "next/server";
import { requireInternalAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface PlatformCampaign {
  id: string;
  name: string;
  status: string;
}

// GET /api/admin/campaigns/platform-campaigns?clientId=xxx&platform=meta|google
export async function GET(req: NextRequest) {
  await requireInternalAuth();
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  const platform = searchParams.get("platform") as "meta" | "google" | null;

  if (!clientId || !platform) {
    return NextResponse.json({ error: "clientId e platform são obrigatórios" }, { status: 400 });
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      metaAdAccountId: true,
      metaAccessToken: true,
      googleAdsCustomerId: true,
      googleRefreshToken: true,
    },
  });

  if (!client) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });

  if (platform === "meta") {
    return fetchMetaCampaigns(client.metaAdAccountId, client.metaAccessToken);
  }

  if (platform === "google") {
    return fetchGoogleCampaigns(client.googleAdsCustomerId, client.googleRefreshToken);
  }

  return NextResponse.json({ campaigns: [] });
}

// ── Meta Ads ─────────────────────────────────────────────────────────────────

async function fetchMetaCampaigns(adAccountId: string | null, accessToken: string | null) {
  if (!adAccountId || !accessToken) {
    return NextResponse.json({ error: "Meta Ads não configurado para este cliente", campaigns: [] });
  }

  const params = new URLSearchParams({
    fields: "id,name,status,objective",
    limit: "100",
    access_token: accessToken,
  });

  const res = await fetch(
    `https://graph.facebook.com/v19.0/act_${adAccountId}/campaigns?${params}`,
    { next: { revalidate: 0 } }
  );
  const data = await res.json();

  if (data.error) {
    return NextResponse.json({ error: `Meta API: ${data.error.message}`, campaigns: [] });
  }

  const campaigns: PlatformCampaign[] = (data.data ?? [])
    .filter((c: Record<string, string>) => c.status !== "DELETED")
    .map((c: Record<string, string>) => ({
      id: c.id,
      name: c.name,
      status: c.status, // ACTIVE, PAUSED, ARCHIVED
    }));

  return NextResponse.json({ campaigns });
}

// ── Google Ads ────────────────────────────────────────────────────────────────

const GOOGLE_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID ?? "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";
const GOOGLE_DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? "";

async function fetchGoogleCampaigns(customerId: string | null, refreshToken: string | null) {
  if (!customerId || !refreshToken) {
    return NextResponse.json({ error: "Google Ads não configurado para este cliente", campaigns: [] });
  }

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_DEVELOPER_TOKEN) {
    return NextResponse.json({ error: "Credenciais Google Ads não configuradas no servidor", campaigns: [] });
  }

  // Step 1: refresh access token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    return NextResponse.json({ error: "Falha ao renovar token Google", campaigns: [] });
  }

  // Step 2: query campaigns via Google Ads API
  const cleanCustomerId = customerId.replace(/-/g, "");
  const queryRes = await fetch(
    `https://googleads.googleapis.com/v17/customers/${cleanCustomerId}/googleAds:search`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokenData.access_token}`,
        "developer-token": GOOGLE_DEVELOPER_TOKEN,
      },
      body: JSON.stringify({
        query: "SELECT campaign.id, campaign.name, campaign.status FROM campaign WHERE campaign.status != 'REMOVED' ORDER BY campaign.name ASC LIMIT 100",
      }),
    }
  );
  const queryData = await queryRes.json();

  if (queryData.error || !queryData.results) {
    return NextResponse.json({ error: `Google Ads API: ${queryData.error?.message ?? "sem resultados"}`, campaigns: [] });
  }

  const campaigns: PlatformCampaign[] = queryData.results.map((r: Record<string, Record<string, string>>) => ({
    id: String(r.campaign.id),
    name: r.campaign.name,
    status: r.campaign.status,
  }));

  return NextResponse.json({ campaigns });
}
