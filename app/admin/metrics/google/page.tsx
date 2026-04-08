import { Topbar } from "@/components/layout/Topbar";
import { getMetricsClients } from "@/services/metrics";
import { prisma } from "@/lib/prisma";
import { GoogleMetricsTable } from "./GoogleMetricsTable";

export const metadata = { title: "Google Ads — Métricas | Gestão Interna" };

export default async function GoogleMetricsPage() {
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
        <GoogleMetricsTable clients={clients} allClients={allClients} />
      </main>
    </>
  );
}
