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

  const metricEntry = await prisma.clientMetricEntry.findFirst({
    where: { clientId: selectedClientId, platform: "meta", period },
  });

  // These tables may not exist yet if prisma db push hasn't been run
  let dbReady = true;
  let attendances: Awaited<ReturnType<typeof prisma.attendance.findMany<{
    include: { service: { select: { name: true } } }
  }>>> = [];
  let services: Awaited<ReturnType<typeof prisma.clientService.findMany>> = [];
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
    ]);
    attendances = results[0];
    services = results[1];
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
        />
      </main>
    </>
  );
}
