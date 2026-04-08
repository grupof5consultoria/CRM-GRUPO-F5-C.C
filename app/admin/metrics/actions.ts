"use server";

import { revalidatePath } from "next/cache";
import { requireInternalAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchMetaInsights, fetchMetaCampaignInsights, type MetaDailyInsight } from "@/lib/meta-api";
import { fetchGoogleAdsInsights, type GoogleDailyInsight } from "@/lib/google-ads-api";

export async function syncMetricsAction(
  clientId: string,
  platform: "meta" | "google",
  dateFrom: string, // "2024-01-01"
  dateTo: string    // "2024-01-31"
): Promise<{ error?: string; success?: boolean; count?: number }> {
  await requireInternalAuth();

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      metaAdAccountId: true,
      metaAccessToken: true,
      googleAdsCustomerId: true,
      googleRefreshToken: true,
    },
  });

  if (!client) return { error: "Cliente não encontrado" };

  try {
    let metaData: MetaDailyInsight[] = [];
    let googleData: GoogleDailyInsight[] = [];

    if (platform === "meta") {
      if (!client.metaAdAccountId || !client.metaAccessToken)
        return { error: "Credenciais Meta não configuradas" };
      metaData = await fetchMetaInsights(client.metaAdAccountId, client.metaAccessToken, dateFrom, dateTo);
    } else {
      if (!client.googleAdsCustomerId || !client.googleRefreshToken)
        return { error: "Credenciais Google Ads não configuradas" };
      googleData = await fetchGoogleAdsInsights(client.googleAdsCustomerId, client.googleRefreshToken, dateFrom, dateTo);
    }

    const rows = platform === "meta" ? metaData : googleData;
    if (rows.length === 0) return { error: "Nenhum dado retornado pela API para o período" };

    const now = new Date();
    let count = 0;

    for (const row of rows) {
      const base = {
        spend: row.spend,
        impressions: row.impressions,
        clicks: row.clicks,
        leadsFromAds: row.leadsFromAds,
      };

      const entry = platform === "meta"
        ? {
            ...base,
            reach: (row as MetaDailyInsight).reach,
            cpm: (row as MetaDailyInsight).cpm,
            linkClicks: (row as MetaDailyInsight).linkClicks,
            cpc: (row as MetaDailyInsight).cpc,
            ctr: (row as MetaDailyInsight).ctr,
            costPerResult: (row as MetaDailyInsight).costPerResult,
            conversations: (row as MetaDailyInsight).conversations,
          }
        : {
            ...base,
            cpc: (row as GoogleDailyInsight).cpc,
            costPerResult: (row as GoogleDailyInsight).costPerResult,
          };

      await prisma.clientMetricEntry.upsert({
        where: { clientId_platform_date: { clientId, platform, date: row.date } },
        create: { clientId, platform, date: row.date, ...entry, syncedAt: now },
        update: { ...entry, syncedAt: now },
      });
      count++;
    }

    return { success: true, count };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao sincronizar" };
  }
}

export async function saveClientCredentialsAction(
  _prev: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  await requireInternalAuth();

  const clientId = formData.get("clientId") as string;

  // Só atualiza os tokens se o campo foi preenchido — evita apagar tokens salvos via OAuth
  const metaToken    = (formData.get("metaAccessToken") as string) || undefined;
  const googleToken  = (formData.get("googleRefreshToken") as string) || undefined;

  await prisma.client.update({
    where: { id: clientId },
    data: {
      metaAdAccountId:      (formData.get("metaAdAccountId") as string) || null,
      ...(metaToken !== undefined   && { metaAccessToken: metaToken }),
      googleAdsCustomerId:  (formData.get("googleAdsCustomerId") as string) || null,
      ...(googleToken !== undefined && { googleRefreshToken: googleToken }),
    },
  });

  revalidatePath(`/admin/clients/${clientId}`);
  return { success: true };
}

export async function saveMetaGoalAction(
  clientId: string,
  metaConvGoal: number | null
): Promise<{ error?: string; success?: boolean }> {
  await requireInternalAuth();
  await prisma.client.update({
    where: { id: clientId },
    data: { metaConvGoal },
  });
  return { success: true };
}

export async function fetchCampaignsAction(
  clientId: string,
  dateFrom: string,
  dateTo: string
) {
  await requireInternalAuth();

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { metaAdAccountId: true, metaAccessToken: true },
  });

  if (!client?.metaAdAccountId || !client?.metaAccessToken)
    return { error: "Credenciais Meta não configuradas" };

  try {
    const campaigns = await fetchMetaCampaignInsights(
      client.metaAdAccountId,
      client.metaAccessToken,
      dateFrom,
      dateTo
    );
    return { campaigns };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao buscar campanhas" };
  }
}
