import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

const BASE = "https://odontopulsef5.com.br";

export async function GET(req: NextRequest) {
  const code     = req.nextUrl.searchParams.get("code");
  const clientId = req.nextUrl.searchParams.get("state");
  const error    = req.nextUrl.searchParams.get("error");

  if (error || !code || !clientId) {
    return NextResponse.redirect(`${BASE}/admin/connections?error=google_auth_denied`);
  }

  // Troca code por tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      client_id:     process.env.GOOGLE_ADS_CLIENT_ID,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
      redirect_uri:  `${BASE}/api/auth/google/callback`,
      grant_type:    "authorization_code",
    }),
  });

  const tokens = await tokenRes.json();

  if (!tokens.refresh_token && !tokens.access_token) {
    const detail = encodeURIComponent(tokens.error_description ?? tokens.error ?? "unknown");
    return NextResponse.redirect(`${BASE}/admin/connections?error=google_token_failed&detail=${detail}`);
  }

  // Busca as contas Google Ads acessíveis
  const accessToken = tokens.access_token;
  const managerId   = process.env.GOOGLE_ADS_MANAGER_ID?.replace(/-/g, "");
  const devToken    = process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? "";

  let accounts: { id: string; name: string }[] = [];

  try {
    const headers: Record<string, string> = {
      Authorization:    `Bearer ${accessToken}`,
      "developer-token": devToken,
      "Content-Type":   "application/json",
    };
    if (managerId) headers["login-customer-id"] = managerId;

    const res = await fetch(
      "https://googleads.googleapis.com/v17/customers:listAccessibleCustomers",
      { headers }
    );
    const data = await res.json();

    // data.resourceNames = ["customers/123456789", ...]
    if (data.resourceNames?.length) {
      accounts = data.resourceNames.map((r: string) => {
        const id = r.replace("customers/", "");
        return { id, name: id };
      });
    }
  } catch {
    // Se falhar ao buscar contas, salva só o refresh token e redireciona
  }

  const refreshToken = tokens.refresh_token ?? null;

  // Salva sempre o refresh token
  if (refreshToken) {
    await prisma.client.update({
      where: { id: clientId },
      data: { googleRefreshToken: refreshToken },
    });
  }

  // Se encontrou só 1 conta, salva o Customer ID diretamente
  if (accounts.length === 1) {
    await prisma.client.update({
      where: { id: clientId },
      data: { googleAdsCustomerId: accounts[0].id },
    });
    return NextResponse.redirect(`${BASE}/admin/connections?success=google_connected`);
  }

  // Sempre redireciona para seleção manual (múltiplas contas ou nenhuma detectada)
  const cookieStore = await cookies();
  cookieStore.set("google_accounts", JSON.stringify(accounts), { maxAge: 300, path: "/" });
  cookieStore.set("google_client_id", clientId, { maxAge: 300, path: "/" });
  return NextResponse.redirect(`${BASE}/admin/connections/google-select`);
}
