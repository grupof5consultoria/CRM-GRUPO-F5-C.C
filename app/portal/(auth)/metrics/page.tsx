import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MetricsForm } from "./MetricsForm";

export const metadata = { title: "Métricas | Portal do Cliente" };

function generatePeriods(count = 6): string[] {
  const periods: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    periods.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return periods;
}

export default async function PortalMetricsPage() {
  const session = await getSession();
  if (!session?.clientId) redirect("/portal/login");

  const client = await prisma.client.findUnique({
    where: { id: session.clientId },
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
  });

  if (!client) redirect("/portal/login");

  const hasMeta = !!client.metaAdAccountId;
  const hasGoogle = !!client.googleAdsCustomerId;

  const periods = generatePeriods(6);
  const currentPeriod = periods[0];

  if (!hasMeta && !hasGoogle) {
    return (
      <main className="flex-1 p-6 bg-[#111111] min-h-screen flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] border border-[#262626] flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-300 font-medium mb-1">Métricas não configuradas</p>
          <p className="text-sm text-gray-600">Entre em contato com nossa equipe para ativar o acompanhamento de métricas.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-5 bg-[#111111] min-h-screen max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Métricas</h1>
        <p className="text-sm text-gray-500 mt-1">Preencha seus resultados mensais</p>
      </div>

      {/* Summary of latest entries */}
      {client.metricEntries.length > 0 && (
        <div className="mb-6 space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Últimos registros</p>
          {client.metricEntries.slice(0, 4).map((e) => {
            const hasRevenue = e.revenue != null;
            const hasLeads = e.leadsScheduled != null;
            return (
              <div key={`${e.platform}-${e.period}`} className="bg-[#1a1a1a] border border-[#262626] rounded-xl px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${e.platform === "meta" ? "bg-blue-400" : "bg-red-400"}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-300">{e.platform === "meta" ? "Meta" : "Google"} — {e.period}</p>
                    <p className="text-xs text-gray-600">{hasLeads ? `${e.leadsScheduled} leads` : "sem leads"} · {hasRevenue ? `R$ ${Number(e.revenue).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}` : "sem faturamento"}</p>
                  </div>
                </div>
                {hasRevenue && e.spend && (
                  <span className={`text-xs font-bold ${Number(e.revenue) >= Number(e.spend) ? "text-emerald-400" : "text-red-400"}`}>
                    {Number(e.spend) > 0 ? `${(((Number(e.revenue) - Number(e.spend)) / Number(e.spend)) * 100).toFixed(0)}% ROI` : ""}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-5">
        <p className="text-sm font-semibold text-white mb-4">Lançar Resultados</p>
        <MetricsForm
          entries={client.metricEntries}
          periods={periods}
          currentPeriod={currentPeriod}
          hasMeta={hasMeta}
          hasGoogle={hasGoogle}
        />
      </div>
    </main>
  );
}
