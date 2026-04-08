import { Topbar } from "@/components/layout/Topbar";
import { getAllMetricClients } from "@/services/metrics";
import { MetricsTabs } from "./MetricsTabs";

export const metadata = { title: "Métricas | Gestão Interna" };

function generatePeriods(count = 12): string[] {
  const periods: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    periods.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return periods;
}

export default async function MetricsPage() {
  const periods = generatePeriods(12);
  const currentPeriod = periods[0];
  const clients = await getAllMetricClients();

  const totalMeta = clients.filter((c) => c.metaAdAccountId).length;
  const totalGoogle = clients.filter((c) => c.googleAdsCustomerId).length;

  return (
    <>
      <Topbar title="Métricas" />
      <main className="flex-1 p-6 bg-[#111111] min-h-screen space-y-6">

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative bg-[#1a1a1a] rounded-2xl border border-[#262626] p-4 overflow-hidden">
            <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)" }} />
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Clientes Meta</p>
            <p className="text-2xl font-bold text-blue-400">{totalMeta}</p>
            <p className="text-xs text-gray-600 mt-0.5">com credenciais ativas</p>
          </div>
          <div className="relative bg-[#1a1a1a] rounded-2xl border border-[#262626] p-4 overflow-hidden">
            <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)" }} />
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Clientes Google</p>
            <p className="text-2xl font-bold text-red-400">{totalGoogle}</p>
            <p className="text-xs text-gray-600 mt-0.5">com credenciais ativas</p>
          </div>
          <div className="relative bg-[#1a1a1a] rounded-2xl border border-[#262626] p-4 overflow-hidden">
            <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)" }} />
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Período Atual</p>
            <p className="text-2xl font-bold text-violet-400">{currentPeriod}</p>
            <p className="text-xs text-gray-600 mt-0.5">selecione outro no filtro</p>
          </div>
          <div className="relative bg-[#1a1a1a] rounded-2xl border border-[#262626] p-4 overflow-hidden">
            <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)" }} />
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Clientes</p>
            <p className="text-2xl font-bold text-gray-300">{clients.length}</p>
            <p className="text-xs text-gray-600 mt-0.5">em pelo menos 1 plataforma</p>
          </div>
        </div>

        {/* Notice about ENV vars */}
        {(totalMeta > 0 || totalGoogle > 0) && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl px-4 py-3 text-xs text-amber-400 flex items-start gap-2">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Para sincronizar Google Ads, configure as variáveis de ambiente: <strong>GOOGLE_ADS_CLIENT_ID</strong>, <strong>GOOGLE_ADS_CLIENT_SECRET</strong>, <strong>GOOGLE_ADS_DEVELOPER_TOKEN</strong> e <strong>GOOGLE_ADS_MANAGER_ID</strong> (opcional). Meta Ads usa apenas o token por cliente.
            </span>
          </div>
        )}

        <MetricsTabs
          clients={clients as Parameters<typeof MetricsTabs>[0]["clients"]}
          currentPeriod={currentPeriod}
          periods={periods}
        />
      </main>
    </>
  );
}
