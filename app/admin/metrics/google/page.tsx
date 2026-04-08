import { Topbar } from "@/components/layout/Topbar";
import { getMetricsClients } from "@/services/metrics";
import { prisma } from "@/lib/prisma";
import { PlatformMetricsView } from "../PlatformMetricsView";

export const metadata = { title: "Google Ads — Métricas | Gestão Interna" };

function generatePeriods(count = 12): string[] {
  const periods: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    periods.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return periods;
}

export default async function GoogleMetricsPage() {
  const periods = generatePeriods(12);
  const currentPeriod = periods[0];

  const [clients, allClients] = await Promise.all([
    getMetricsClients("google"),
    prisma.client.findMany({
      where: { status: "active" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <>
      <Topbar title="Métricas — Google Ads" backHref="/admin/metrics/google" backLabel="Métricas" />
      <main className="flex-1 p-6 bg-[#111111] min-h-screen space-y-6">
        <PlatformMetricsView
          platform="google"
          clients={clients as Parameters<typeof PlatformMetricsView>[0]["clients"]}
          allClients={allClients}
          currentPeriod={currentPeriod}
          periods={periods}
        />
      </main>
    </>
  );
}
