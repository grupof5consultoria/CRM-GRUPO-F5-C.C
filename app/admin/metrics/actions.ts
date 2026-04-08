"use server";

import { revalidatePath } from "next/cache";
import { requireInternalAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchMetaInsights } from "@/lib/meta-api";
import { fetchGoogleAdsInsights, type GoogleInsights } from "@/lib/google-ads-api";

export async function syncMetricsAction(
  clientId: string,
  platform: "meta" | "google",
  period: string
): Promise<{ error?: string; success?: boolean }> {
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
    let data;
    if (platform === "meta") {
      if (!client.metaAdAccountId || !client.metaAccessToken)
        return { error: "Credenciais Meta não configuradas" };
      data = await fetchMetaInsights(client.metaAdAccountId, client.metaAccessToken, period);
    } else {
      if (!client.googleAdsCustomerId || !client.googleRefreshToken)
        return { error: "Credenciais Google Ads não configuradas" };
      data = await fetchGoogleAdsInsights(client.googleAdsCustomerId, client.googleRefreshToken, period);
    }

    if (!data) return { error: "Nenhum dado retornado pela API" };

    const entry = {
      spend: data.spend,
      impressions: data.impressions,
      clicks: data.clicks,
      leadsFromAds: data.leadsFromAds,
      ...(platform === "meta" && "reach" in data ? {
        reach: (data as import("@/lib/meta-api").MetaInsights).reach,
        cpm: (data as import("@/lib/meta-api").MetaInsights).cpm,
        linkClicks: (data as import("@/lib/meta-api").MetaInsights).linkClicks,
        cpc: (data as import("@/lib/meta-api").MetaInsights).cpc,
        ctr: (data as import("@/lib/meta-api").MetaInsights).ctr,
        costPerResult: (data as import("@/lib/meta-api").MetaInsights).costPerResult,
        budget: (data as import("@/lib/meta-api").MetaInsights).budget,
      } : {}),
      ...(platform === "google" ? {
        cpc: (data as GoogleInsights).cpc,
        costPerResult: (data as GoogleInsights).costPerResult,
      } : {}),
    };

    await prisma.clientMetricEntry.upsert({
      where: { clientId_platform_period: { clientId, platform, period } },
      create: { clientId, platform, period, ...entry, syncedAt: new Date() },
      update: { ...entry, syncedAt: new Date() },
    });

    revalidatePath("/admin/metrics");
    return { success: true };
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
  await prisma.client.update({
    where: { id: clientId },
    data: {
      metaAdAccountId: (formData.get("metaAdAccountId") as string) || null,
      metaAccessToken: (formData.get("metaAccessToken") as string) || null,
      googleAdsCustomerId: (formData.get("googleAdsCustomerId") as string) || null,
      googleRefreshToken: (formData.get("googleRefreshToken") as string) || null,
    },
  });

  revalidatePath(`/admin/clients/${clientId}`);
  return { success: true };
}
