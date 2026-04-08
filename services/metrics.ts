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
        orderBy: { date: "desc" },
        take: 400, // ~13 months of daily data
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
        orderBy: { date: "desc" },
        take: 400,
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getClientMetricEntry(clientId: string, platform: string, date: string) {
  return prisma.clientMetricEntry.findUnique({
    where: { clientId_platform_date: { clientId, platform, date } },
  });
}

/**
 * Called from the client portal form.
 * `period` is "YYYY-MM"; we store it as date "YYYY-MM-01" so it lives in the
 * same table as daily API entries without conflicting with them.
 */
export async function upsertManualMetrics(
  clientId: string,
  platform: string,
  period: string, // "YYYY-MM"
  leadsScheduled: number | null,
  revenue: number | null
) {
  const date = period.length === 7 ? `${period}-01` : period;
  return prisma.clientMetricEntry.upsert({
    where: { clientId_platform_date: { clientId, platform, date } },
    create: { clientId, platform, date, leadsScheduled, revenue },
    update: { leadsScheduled, revenue },
  });
}
