import { Topbar } from "@/components/layout/Topbar";
import { requireInternalAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReportView } from "./ReportView";

export const metadata = { title: "Relatório | Gestão Interna" };

function generatePeriods(count = 12): string[] {
  const periods: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    periods.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return periods;
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string; period?: string }>;
}) {
  await requireInternalAuth();

  const { clientId, period: rawPeriod } = await searchParams;
  const periods = generatePeriods(12);
  const period = rawPeriod ?? periods[0];

  const clients = await prisma.client.findMany({
    where: { status: "active" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const selectedClientId = clientId ?? (clients[0]?.id ?? null);

  if (!selectedClientId) {
    return (
      <>
        <Topbar title="Relatório" />
        <main className="flex-1 p-6 bg-[#111111] min-h-screen flex items-center justify-center">
          <p className="text-gray-600 text-sm">Nenhum cliente cadastrado.</p>
        </main>
      </>
    );
  }

  // Aggregate all daily entries for the selected month
  const dailyEntries = await prisma.clientMetricEntry.findMany({
    where: {
      clientId: selectedClientId,
      platform: "meta",
      date: { gte: `${period}-01`, lte: `${period}-31` },
    },
  });
  let metricEntry: (typeof dailyEntries)[0] | null = null;
  if (dailyEntries.length > 0) {
    let spend = 0, impressions = 0, clicks = 0, leadsFromAds = 0, reach = 0, linkClicks = 0;
    let leadsScheduled: number | null = null, revenue = 0;
    for (const e of dailyEntries) {
      spend += Number(e.spend ?? 0);
      impressions += e.impressions ?? 0;
      clicks += e.clicks ?? 0;
      leadsFromAds += e.leadsFromAds ?? 0;
      reach += e.reach ?? 0;
      linkClicks += e.linkClicks ?? 0;
      if (e.leadsScheduled != null) leadsScheduled = (leadsScheduled ?? 0) + e.leadsScheduled;
      revenue += Number(e.revenue ?? 0);
    }
    const cpm = impressions > 0 ? (spend / impressions) * 1000 : null;
    const cpc = linkClicks > 0 ? spend / linkClicks : null;
    const ctr = impressions > 0 ? (linkClicks / impressions) * 100 : null;
    const costPerResult = leadsFromAds > 0 ? spend / leadsFromAds : null;
    // Use Prisma's Decimal-compatible representation via type assertion
    metricEntry = {
      ...dailyEntries[0],
      spend: spend as unknown as (typeof dailyEntries)[0]["spend"],
      impressions,
      clicks,
      leadsFromAds,
      reach,
      linkClicks,
      leadsScheduled,
      revenue: revenue as unknown as (typeof dailyEntries)[0]["revenue"],
      cpm: cpm as unknown as (typeof dailyEntries)[0]["cpm"],
      cpc: cpc as unknown as (typeof dailyEntries)[0]["cpc"],
      ctr: ctr as unknown as (typeof dailyEntries)[0]["ctr"],
      costPerResult: costPerResult as unknown as (typeof dailyEntries)[0]["costPerResult"],
    };
  }

  // Period boundaries for lead filtering
  const [periodYear, periodMonth] = period.split("-").map(Number);
  const periodStart = new Date(periodYear, periodMonth - 1, 1);
  const periodEnd   = new Date(periodYear, periodMonth, 0, 23, 59, 59, 999);

  // These tables may not exist yet if prisma db push hasn't been run
  let dbReady = true;
  let attendances: Awaited<ReturnType<typeof prisma.attendance.findMany<{
    include: { service: { select: { name: true } } }
  }>>> = [];
  let services: Awaited<ReturnType<typeof prisma.clientService.findMany>> = [];
  let patientLeads: Array<{
    id: string; name: string; phone: string | null; photoUrl: string | null;
    origin: string; source: string | null; city: string | null; state: string | null;
    device: string | null; campaignType: string | null; status: string; createdAt: Date;
  }> = [];
  try {
    const results = await Promise.all([
      prisma.attendance.findMany({
        where: { clientId: selectedClientId, period },
        include: { service: { select: { name: true } } },
        orderBy: { contactDate: "desc" },
      }),
      prisma.clientService.findMany({
        where: { clientId: selectedClientId },
        orderBy: { name: "asc" },
      }),
      prisma.patientLead.findMany({
        where: {
          clientId: selectedClientId,
          createdAt: { gte: periodStart, lte: periodEnd },
        },
        select: {
          id: true, name: true, phone: true, photoUrl: true,
          origin: true, source: true, city: true, state: true,
          device: true, campaignType: true, status: true, createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);
    attendances = results[0];
    services = results[1];
    patientLeads = results[2].map((l) => ({ ...l, origin: l.origin as string, status: l.status as string }));
  } catch {
    dbReady = false;
  }

  return (
    <>
      <Topbar title="Relatório" />
      <main className="flex-1 p-6 bg-[#111111] min-h-screen space-y-6">
        {!dbReady && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl px-5 py-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-amber-400">Tabelas de atendimentos não encontradas</p>
              <p className="text-xs text-amber-400/70 mt-0.5">Execute <code className="bg-amber-500/10 px-1 rounded">npx prisma db push</code> no terminal para criar as tabelas no banco de dados.</p>
            </div>
          </div>
        )}
        <ReportView
          clients={clients}
          selectedClientId={selectedClientId}
          period={period}
          periods={periods}
          metricEntry={metricEntry}
          attendances={attendances}
          services={services}
          patientLeads={patientLeads}
        />
      </main>
    </>
  );
}
