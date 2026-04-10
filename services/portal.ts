import { prisma } from "@/lib/prisma";

/**
 * Todas as funções exigem o clientId da sessão.
 * Nunca retornam dados de outro cliente.
 */

export async function getPortalDashboard(clientId: string) {
  const now = new Date();
  const [client, activeContracts, pendingCharges, overdueCharges, tasks] = await Promise.all([
    prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true, name: true, status: true },
    }),
    prisma.contract.count({ where: { clientId, status: "active" } }),
    prisma.charge.count({ where: { clientId, status: "pending" } }),
    prisma.charge.findMany({
      where: { clientId, status: "pending", dueDate: { lt: now } },
      select: { id: true, description: true, value: true, dueDate: true, paymentLink: true },
      orderBy: { dueDate: "asc" },
      take: 3,
    }),
    prisma.task.findMany({
      where: { clientId, isClientVisible: true, status: { notIn: ["done", "cancelled"] } },
      select: { id: true, title: true, status: true, dueDate: true },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
  ]);

  return { client, activeContracts, pendingCharges, overdueCharges, tasks };
}

export async function getPortalContracts(clientId: string) {
  return prisma.contract.findMany({
    where: { clientId },
    select: {
      id: true,
      title: true,
      status: true,
      value: true,
      startDate: true,
      endDate: true,
      notes: true,
      signedAt: true,
      signedToken: true,
      distratoToken: true,
      distratoSignedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPortalContract(clientId: string, contractId: string) {
  return prisma.contract.findFirst({
    where: { id: contractId, clientId },
    select: {
      id: true,
      title: true,
      status: true,
      value: true,
      startDate: true,
      endDate: true,
      notes: true,
      signedAt: true,
      createdAt: true,
    },
  });
}

export async function getPortalCharges(clientId: string) {
  return prisma.charge.findMany({
    where: { clientId },
    select: {
      id: true,
      description: true,
      value: true,
      status: true,
      dueDate: true,
      paidAt: true,
      paymentLink: true,
      contract: { select: { id: true, title: true } },
    },
    orderBy: { dueDate: "desc" },
  });
}

/**
 * Returns aggregated metrics for a given month period ("YYYY-MM").
 * Daily API entries (YYYY-MM-DD) are summed; manual entry at "YYYY-MM-01"
 * provides leadsScheduled and revenue.
 */
export async function getPortalReport(clientId: string, period: string) {
  const dateFrom = `${period}-01`;
  const dateTo   = `${period}-31`;

  const [entries, attendances] = await Promise.all([
    prisma.clientMetricEntry.findMany({
      where: { clientId, platform: "meta", date: { gte: dateFrom, lte: dateTo } },
    }),
    prisma.attendance.findMany({
      where: { clientId, period },
      include: { service: { select: { name: true } } },
      orderBy: { contactDate: "desc" },
    }).catch(() => []),
  ]);

  // Aggregate daily entries into a single summary
  let spend = 0, impressions = 0, leadsFromAds = 0, reach = 0, cpmTotal = 0, cpmCount = 0;
  let conversations = 0;
  let leadsScheduled: number | null = null, revenue: number | null = null;
  for (const e of entries) {
    spend += Number(e.spend ?? 0);
    impressions += e.impressions ?? 0;
    leadsFromAds += e.leadsFromAds ?? 0;
    reach += e.reach ?? 0;
    conversations += e.conversations ?? 0;
    if (e.cpm != null) { cpmTotal += Number(e.cpm); cpmCount++; }
    if (e.leadsScheduled != null) leadsScheduled = (leadsScheduled ?? 0) + e.leadsScheduled;
    if (e.revenue != null) revenue = (revenue ?? 0) + Number(e.revenue);
  }

  const metricEntry = entries.length > 0
    ? {
        spend: { toString: () => String(spend) },
        impressions,
        leadsFromAds,
        leadsScheduled,
        revenue: revenue != null ? { toString: () => String(revenue) } : null,
        reach,
        conversations,
        costPerConversation: conversations > 0 && spend > 0 ? spend / conversations : null,
        cpm: cpmCount > 0 ? { toString: () => String(cpmTotal / cpmCount) } : null,
      }
    : null;

  return { metricEntry, attendances };
}

export async function getPortalTrend(clientId: string, periods: string[]) {
  // Build a date range covering all requested periods
  if (periods.length === 0) return { metricEntries: [], attendanceGroups: [] };

  const sorted = [...periods].sort();
  const dateFrom = `${sorted[0]}-01`;
  const dateTo   = `${sorted[sorted.length - 1]}-31`;

  const [rawEntries, attendanceGroups] = await Promise.all([
    prisma.clientMetricEntry.findMany({
      where: { clientId, platform: "meta", date: { gte: dateFrom, lte: dateTo } },
      select: { date: true, spend: true },
    }),
    prisma.attendance.groupBy({
      by: ["period", "status"],
      where: { clientId, period: { in: periods } },
      _count: { id: true },
      _sum: { valueClosed: true },
    }).catch(() => []),
  ]);

  // Group by period (YYYY-MM) and sum spend
  const byPeriod = new Map<string, number>();
  for (const e of rawEntries) {
    const p = e.date.substring(0, 7);
    if (periods.includes(p)) {
      byPeriod.set(p, (byPeriod.get(p) ?? 0) + Number(e.spend ?? 0));
    }
  }

  const metricEntries = Array.from(byPeriod.entries()).map(([period, spend]) => ({
    period,
    spend: { toString: () => String(spend) },
  }));

  return { metricEntries, attendanceGroups };
}

export async function getPortalAccount(clientId: string) {
  return prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      document: true,
      status: true,
      createdAt: true,
      contacts: {
        select: { id: true, name: true, email: true, phone: true, role: true, isPrimary: true },
        orderBy: { isPrimary: "desc" },
      },
    },
  });
}
