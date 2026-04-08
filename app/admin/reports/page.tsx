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

  const [metricEntry, attendances, services] = await Promise.all([
    prisma.clientMetricEntry.findFirst({
      where: { clientId: selectedClientId, platform: "meta", period },
    }),
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

  return (
    <>
      <Topbar title="Relatório" />
      <main className="flex-1 p-6 bg-[#111111] min-h-screen space-y-6">
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
