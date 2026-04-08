import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MetricsForm } from "./MetricsForm";
import { MetricsPeriodSelect } from "./MetricsPeriodSelect";

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

function fmtR(v: number) {
  return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}
function fmtN(v: number) {
  return v.toLocaleString("pt-BR");
}

function KpiCard({
  label, value, sub, accent, highlight,
}: {
  label: string; value: string; sub?: string; accent: string; highlight?: boolean;
}) {
  return (
    <div className={`relative bg-[#111111] rounded-2xl border p-4 overflow-hidden ${highlight ? "border-blue-500/30" : "border-[#262626]"}`}>
      {highlight && <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(96,165,250,0.06) 0%, transparent 60%)" }} />}
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent}`}>{value}</p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
    </div>
  );
}

export default async function PortalMetricsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const session = await getSession();
  if (!session?.clientId) redirect("/portal/login");

  const periods = generatePeriods(6);
  const { period: rawPeriod } = await searchParams;
  const period = rawPeriod && periods.includes(rawPeriod) ? rawPeriod : periods[0];

  const client = await prisma.client.findUnique({
    where: { id: session.clientId },
    select: {
      id: true,
      name: true,
      metaAdAccountId: true,
      googleAdsCustomerId: true,
      metricEntries: {
        orderBy: { date: "desc" },
        take: 365,
      },
    },
  });

  if (!client) redirect("/portal/login");

  const hasMeta   = !!client.metaAdAccountId;
  const hasGoogle = !!client.googleAdsCustomerId;

  // ── Aggregate Meta Ads for selected period ────────────────────────────────
  const periodEntries = client.metricEntries.filter(
    (e) => e.platform === "meta" && e.date.startsWith(period)
  );

  let spend = 0, conversations = 0, impressions = 0, reach = 0, leadsFromAds = 0;
  for (const e of periodEntries) {
    spend        += Number(e.spend ?? 0);
    conversations += e.conversations ?? 0;
    impressions   += e.impressions ?? 0;
    reach         += e.reach ?? 0;
    leadsFromAds  += e.leadsFromAds ?? 0;
  }
  const costPerConversation = conversations > 0 && spend > 0 ? spend / conversations : null;
  const hasReport = hasMeta && periodEntries.length > 0 && spend > 0;

  // ── Period label ─────────────────────────────────────────────────────────
  const [y, m] = period.split("-");
  const periodLabel = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("pt-BR", {
    month: "long", year: "numeric",
  });

  return (
    <main className="flex-1 p-5 bg-[#111111] min-h-screen max-w-lg mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Métricas</h1>
          <p className="text-sm text-gray-500 mt-0.5 capitalize">{periodLabel}</p>
        </div>
        <MetricsPeriodSelect periods={periods} current={period} />
      </div>

      {/* ── Meta Ads Report ──────────────────────────────────────────────────── */}
      {hasMeta && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Relatório Meta Ads</p>
          </div>

          {hasReport ? (
            <>
              {/* Top KPIs */}
              <div className="grid grid-cols-2 gap-3">
                <KpiCard
                  label="Conversas Iniciadas"
                  value={conversations > 0 ? fmtN(conversations) : "—"}
                  sub="via WhatsApp"
                  accent="text-blue-400"
                  highlight
                />
                <KpiCard
                  label="Custo por Conversa"
                  value={costPerConversation ? fmtR(costPerConversation) : "—"}
                  sub={costPerConversation ? "por conversa iniciada" : "sem conversas"}
                  accent="text-blue-300"
                />
                <KpiCard
                  label="Investimento"
                  value={spend > 0 ? fmtR(spend) : "—"}
                  sub="total no período"
                  accent="text-amber-400"
                />
                <KpiCard
                  label="Leads Gerados"
                  value={leadsFromAds > 0 ? fmtN(leadsFromAds) : "—"}
                  sub="via anúncios"
                  accent="text-gray-300"
                />
              </div>

              {/* Secondary metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-500 mb-0.5">Impressões</p>
                  <p className="text-base font-bold text-gray-300">{impressions > 0 ? fmtN(impressions) : "—"}</p>
                </div>
                <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-500 mb-0.5">Alcance</p>
                  <p className="text-base font-bold text-gray-300">{reach > 0 ? fmtN(reach) : "—"}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-6 text-center">
              <p className="text-sm text-gray-600">Nenhum dado de Meta Ads em {period}.</p>
              <p className="text-xs text-gray-700 mt-1">Solicite a sincronização para a equipe.</p>
            </div>
          )}
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-[#1e1e1e]" />

      {/* ── Manual entry form ────────────────────────────────────────────────── */}
      {(hasMeta || hasGoogle) ? (
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-5">
          <p className="text-sm font-semibold text-white mb-1">Lançar Resultados</p>
          <p className="text-xs text-gray-600 mb-4">Informe os leads agendados e o faturamento do período.</p>
          <MetricsForm
            entries={client.metricEntries}
            periods={periods}
            currentPeriod={period}
            hasMeta={hasMeta}
            hasGoogle={hasGoogle}
          />
        </div>
      ) : (
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-10 text-center">
          <p className="text-sm text-gray-300 font-medium">Métricas não configuradas</p>
          <p className="text-xs text-gray-600 mt-1">Entre em contato com nossa equipe para ativar.</p>
        </div>
      )}

    </main>
  );
}
