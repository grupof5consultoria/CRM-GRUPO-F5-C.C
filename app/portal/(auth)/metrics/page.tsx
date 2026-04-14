import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MetricsForm } from "./MetricsForm";
import { MetricsPeriodSelect } from "./MetricsPeriodSelect";

export const metadata = { title: "Métricas | Portal do Cliente" };

// ── Helpers ───────────────────────────────────────────────────────────────────
function generatePeriods(count = 6): string[] {
  const periods: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    periods.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return periods;
}
function todayStr() { return new Date().toISOString().split("T")[0]; }
function firstOfMonthStr() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), 1).toISOString().split("T")[0];
}
function fmtR(v: number | null) {
  if (!v || v === 0) return "—";
  return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}
function fmtN(v: number | null) {
  if (!v || v === 0) return "—";
  return v.toLocaleString("pt-BR");
}
function fmtPct(v: number | null) {
  if (!v || v === 0) return "—";
  return `${v.toFixed(2)}%`;
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const IcoDollar  = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const IcoChat    = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>;
const IcoEye     = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>;
const IcoTrend   = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>;
const IcoLink    = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.1-1.1m-.758-4.9a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>;
const IcoTarget  = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth={1.5}/><circle cx="12" cy="12" r="6" strokeWidth={1.5}/><circle cx="12" cy="12" r="2" strokeWidth={1.5}/></svg>;
const IcoUsers   = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
const IcoBars    = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>;

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-[#111] rounded-2xl p-3 flex flex-col justify-between gap-3 min-h-[80px]">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] text-gray-500 leading-snug">{label}</p>
        <span className="text-blue-500/70 flex-shrink-0">{icon}</span>
      </div>
      <p className="text-xl font-bold text-white leading-none">{value}</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function PortalMetricsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; dateFrom?: string; dateTo?: string }>;
}) {
  const session = await getSession();
  if (!session?.clientId) redirect("/portal/login");

  const periods = generatePeriods(6);
  const { period: rawPeriod, dateFrom: rawFrom, dateTo: rawTo } = await searchParams;

  // Support both old period param and new dateFrom/dateTo
  let dateFrom: string;
  let dateTo: string;
  if (rawFrom && rawTo) {
    dateFrom = rawFrom;
    dateTo   = rawTo;
  } else if (rawPeriod && periods.includes(rawPeriod)) {
    dateFrom = `${rawPeriod}-01`;
    dateTo   = new Date(Number(rawPeriod.split("-")[0]), Number(rawPeriod.split("-")[1]), 0).toISOString().split("T")[0];
  } else {
    dateFrom = firstOfMonthStr();
    dateTo   = todayStr();
  }
  const period = rawPeriod && periods.includes(rawPeriod) ? rawPeriod : periods[0];

  const client = await prisma.client.findUnique({
    where: { id: session.clientId },
    select: {
      id: true,
      name: true,
      metaAdAccountId: true,
      googleAdsCustomerId: true,
      metricEntries: { orderBy: { date: "desc" }, take: 365 },
    },
  });
  if (!client) redirect("/portal/login");

  const hasMeta   = !!client.metaAdAccountId;
  const hasGoogle = !!client.googleAdsCustomerId;

  // ── Aggregate for selected period ─────────────────────────────────────────
  const periodEntries = client.metricEntries.filter(
    (e) => e.platform === "meta" && e.date >= dateFrom && e.date <= dateTo
  );

  let spend = 0, conversations = 0, impressions = 0, reach = 0;
  let clicks = 0, linkClicks = 0, leadsFromAds = 0;
  let cpmSum = 0, cpcSum = 0, ctrSum = 0, cprSum = 0;
  let cpmCount = 0, cpcCount = 0, ctrCount = 0, cprCount = 0;

  for (const e of periodEntries) {
    spend         += Number(e.spend         ?? 0);
    conversations += e.conversations        ?? 0;
    impressions   += e.impressions          ?? 0;
    reach         += e.reach               ?? 0;
    clicks        += e.clicks              ?? 0;
    linkClicks    += e.linkClicks          ?? 0;
    leadsFromAds  += e.leadsFromAds        ?? 0;
    if (e.cpm)           { cpmSum += Number(e.cpm);           cpmCount++; }
    if (e.cpc)           { cpcSum += Number(e.cpc);           cpcCount++; }
    if (e.ctr)           { ctrSum += Number(e.ctr);           ctrCount++; }
    if (e.costPerResult) { cprSum += Number(e.costPerResult); cprCount++; }
  }

  // Para campanhas de mensagens, o "resultado" é conversa. Para leads, é lead.
  const resultados   = leadsFromAds > 0 ? leadsFromAds : conversations;
  const resultLabel  = leadsFromAds > 0 ? "Resultados (Leads)" : "Resultados (Conversas)";

  const costPerConv = conversations > 0 && spend > 0 ? spend / conversations : null;
  const costPerResult = resultados > 0 && spend > 0 ? spend / resultados : null;
  const cpmAvg      = cpmCount > 0 ? cpmSum / cpmCount : null;
  const cpcAvg      = cpcCount > 0 ? cpcSum / cpcCount : null;
  const ctrAvg      = ctrCount > 0 ? ctrSum / ctrCount : null;
  const ctrLink     = impressions > 0 && linkClicks > 0 ? (linkClicks / impressions) * 100 : null;
  const cpcLink     = linkClicks > 0 && spend > 0 ? spend / linkClicks : null;
  const frequency   = reach > 0 && impressions > 0 ? impressions / reach : null;
  const cprAvg      = cprCount > 0 ? cprSum / cprCount : null;

  const hasData = hasMeta && periodEntries.length > 0;

  // ── Chart: last 14 days of period ─────────────────────────────────────────
  const dailyEntries = periodEntries
    .slice(0, 14)
    .reverse()
    .map((e) => ({
      date:          e.date.slice(5),
      spend:         Number(e.spend ?? 0),
      conversations: e.conversations ?? 0,
    }));
  const maxSpend = Math.max(...dailyEntries.map((e) => e.spend), 1);
  const maxConv  = Math.max(...dailyEntries.map((e) => e.conversations), 1);

  // ── Period label ──────────────────────────────────────────────────────────
  const fmtDate = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  const periodLabel = dateFrom === dateTo ? fmtDate(dateFrom) : `${fmtDate(dateFrom)} — ${fmtDate(dateTo)}`;

  return (
    <main className="flex-1 bg-[#0d0d0d] min-h-screen w-full overflow-x-hidden">
      <div className="w-full px-4 pt-6 pb-24 space-y-6">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <p className="text-[11px] text-gray-600 uppercase tracking-widest">Meta Ads</p>
            </div>
            <h1 className="text-2xl font-bold text-white">Métricas</h1>
            <p className="text-sm text-gray-600 capitalize mt-0.5">{periodLabel}</p>
          </div>
          <MetricsPeriodSelect currentFrom={dateFrom} currentTo={dateTo} />
        </div>

        {/* ── Sem conexão ─────────────────────────────────────────────────── */}
        {!hasMeta && !hasGoogle && (
          <div className="text-center py-20">
            <p className="text-gray-600 text-sm">Métricas não configuradas.</p>
            <p className="text-xs text-gray-700 mt-1">Entre em contato com nossa equipe para ativar.</p>
          </div>
        )}

        {hasMeta && (
          <>
            {hasData ? (
              <>
                {/* ── Seção 1: KPIs principais ───────────────────────────── */}
                <div className="space-y-2">
                  <p className="text-[11px] text-gray-600 uppercase tracking-widest">Visão geral</p>
                  <div className="grid grid-cols-2 gap-2">
                    <KpiCard label="Investimento"        value={fmtR(spend)}           icon={<IcoDollar />} />
                    <KpiCard label={resultLabel}         value={fmtN(resultados)}      icon={<IcoUsers />} />
                    <KpiCard label="Custo por Resultado" value={fmtR(costPerResult)}   icon={<IcoDollar />} />
                    <KpiCard label="Conversas WhatsApp"  value={fmtN(conversations)}   icon={<IcoChat />} />
                    <KpiCard label="Impressões"          value={fmtN(impressions)}     icon={<IcoEye />} />
                    <KpiCard label="Alcance"             value={fmtN(reach)}           icon={<IcoEye />} />
                  </div>
                </div>

                {/* ── Seção 2: Cliques e CTR ─────────────────────────────── */}
                <div className="space-y-2">
                  <p className="text-[11px] text-gray-600 uppercase tracking-widest">Cliques e engajamento</p>
                  <div className="grid grid-cols-2 gap-2">
                    <KpiCard label="Cliques (todos)"      value={fmtN(clicks)}      icon={<IcoTrend />} />
                    <KpiCard label="Cliques no link"      value={fmtN(linkClicks)}  icon={<IcoLink />} />
                    <KpiCard label="CTR (todos)"          value={fmtPct(ctrAvg)}    icon={<IcoTrend />} />
                    <KpiCard label="CTR (cliques no link)"value={fmtPct(ctrLink)}   icon={<IcoTrend />} />
                  </div>
                </div>

                {/* ── Seção 3: Custo e eficiência ────────────────────────── */}
                <div className="space-y-2">
                  <p className="text-[11px] text-gray-600 uppercase tracking-widest">Custo e eficiência</p>
                  <div className="grid grid-cols-2 gap-2">
                    <KpiCard label="CPM médio"              value={fmtR(cpmAvg)}                                    icon={<IcoTarget />} />
                    <KpiCard label="CPC médio"              value={fmtR(cpcAvg)}                                    icon={<IcoTarget />} />
                    <KpiCard label="CPC médio (no link)"    value={fmtR(cpcLink)}                                   icon={<IcoLink />} />
                    <KpiCard label="Custo por Resultado"    value={fmtR(cprAvg)}                                    icon={<IcoDollar />} />
                    <KpiCard label="Frequência"             value={frequency ? frequency.toFixed(2) : "—"}          icon={<IcoBars />} />
                  </div>
                </div>

                {/* ── Performance chart ───────────────────────────────────── */}
                {dailyEntries.length > 1 && (
                  <div className="bg-[#111] rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">Performance</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-1 rounded-full bg-amber-400 inline-block" />
                          <span className="text-[10px] text-gray-500">Investimento</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-1 rounded-full bg-blue-400 inline-block" />
                          <span className="text-[10px] text-gray-500">Conversas</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-end gap-1" style={{ height: "88px" }}>
                      {dailyEntries.map((e) => (
                        <div key={e.date} className="flex-1 flex items-end gap-px" style={{ height: "88px" }}>
                          <div className="flex-1 rounded-t bg-amber-400/60" style={{ height: `${Math.max((e.spend / maxSpend) * 100, e.spend > 0 ? 4 : 0)}%` }} />
                          <div className="flex-1 rounded-t bg-blue-400/60" style={{ height: `${Math.max((e.conversations / maxConv) * 100, e.conversations > 0 ? 4 : 0)}%` }} />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-1">
                      {dailyEntries.map((e) => (
                        <div key={e.date} className="flex-1 text-center">
                          <span className="text-[9px] text-gray-700">{e.date.replace("-", "/")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Campanhas (placeholder) ─────────────────────────────── */}
                <div className="bg-[#111] rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#1f1f1f] flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Campanhas</p>
                    <span className="text-[10px] text-gray-600 bg-[#1f1f1f] px-2 py-1 rounded-lg">Em breve</span>
                  </div>
                  <div className="px-5 py-8 text-center space-y-1">
                    <p className="text-xs text-gray-600">Detalhamento por campanha disponível em breve.</p>
                    <p className="text-[10px] text-gray-700">Requer integração avançada com a Meta Ads API.</p>
                  </div>
                </div>

                {/* ── Melhores anúncios (placeholder) ─────────────────────── */}
                <div className="bg-[#111] rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#1f1f1f] flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Melhores Anúncios</p>
                    <span className="text-[10px] text-gray-600 bg-[#1f1f1f] px-2 py-1 rounded-lg">Em breve</span>
                  </div>
                  <div className="px-5 py-8 text-center space-y-1">
                    <p className="text-xs text-gray-600">Ranking de criativos por CPR disponível em breve.</p>
                    <p className="text-[10px] text-gray-700">Requer integração avançada com a Meta Ads API.</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-600 text-sm">Nenhum dado de Meta Ads em {period}.</p>
                <p className="text-xs text-gray-700 mt-1">Solicite a sincronização para a equipe.</p>
              </div>
            )}
          </>
        )}

        {/* ── Divider ─────────────────────────────────────────────────────── */}
        {(hasMeta || hasGoogle) && <div className="h-px bg-[#1a1a1a]" />}

        {/* ── Lançamento manual ───────────────────────────────────────────── */}
        {(hasMeta || hasGoogle) && (
          <div className="space-y-3">
            <p className="text-[11px] text-gray-600 uppercase tracking-widest">Lançar resultados</p>
            <div className="bg-[#111] rounded-2xl p-5">
              <MetricsForm
                entries={client.metricEntries}
                periods={periods}
                currentPeriod={period}
                hasMeta={hasMeta}
                hasGoogle={hasGoogle}
                dateFrom={dateFrom}
                dateTo={dateTo}
              />
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
