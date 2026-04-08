import { prisma } from "@/lib/prisma";

export async function getMetricsClients(platform: "meta" | "google") {
  return prisma.client.findMany({
    where: {
      status: "active",
      ...(platform === "meta"
        ? { metaAdAccountId: { not: null } }
        : { googleAdsCustomerId: { not: null } }),
    },
    select: {
      id: true,
      name: true,
      metaAdAccountId: true,
      googleAdsCustomerId: true,
      metricEntries: {
        where: { platform },
        orderBy: { period: "desc" },
        take: 6,
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getAllMetricClients() {
  return prisma.client.findMany({
    where: {
      status: "active",
      OR: [
        { metaAdAccountId: { not: null } },
        { googleAdsCustomerId: { not: null } },
      ],
    },
    select: {
      id: true,
      name: true,
      metaAdAccountId: true,
      googleAdsCustomerId: true,
      metricEntries: {
        orderBy: { period: "desc" },
        take: 12,
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getClientMetricEntry(clientId: string, platform: string, period: string) {
  return prisma.clientMetricEntry.findUnique({
    where: { clientId_platform_period: { clientId, platform, period } },
  });
}

export async function upsertManualMetrics(
  clientId: string,
  platform: string,
  period: string,
  leadsScheduled: number | null,
  revenue: number | null
) {
  return prisma.clientMetricEntry.upsert({
    where: { clientId_platform_period: { clientId, platform, period } },
    create: { clientId, platform, period, leadsScheduled, revenue },
    update: { leadsScheduled, revenue },
  });
}
