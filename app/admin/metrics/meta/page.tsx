import { Topbar } from "@/components/layout/Topbar";
import { getMetricsClients } from "@/services/metrics";
import { prisma } from "@/lib/prisma";
import { MetaMetricsTable } from "./MetaMetricsTable";

export const metadata = { title: "Meta Ads — Métricas | Gestão Interna" };

export default async function MetaMetricsPage() {
  const [clients, allClients] = await Promise.all([
    getMetricsClients("meta"),
    prisma.client.findMany({
      where: { status: "active" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <>
      <Topbar title="Métricas — Meta Ads" backHref="/admin/metrics/meta" backLabel="Métricas" />
      <main className="flex-1 p-6 bg-[#111111] min-h-screen space-y-6">
        <MetaMetricsTable clients={clients} allClients={allClients} />
      </main>
    </>
  );
}
