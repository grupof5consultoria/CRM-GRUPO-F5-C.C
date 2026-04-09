import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPortalReport, getPortalTrend } from "@/services/portal";
import Link from "next/link";
import { PeriodSelect } from "./PeriodSelect";

export const metadata = { title: "Dashboard | Portal do Cliente" };

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
  return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`;
}

export default async function PortalDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const session = await getSession();
  if (!session?.clientId) redirect("/portal/login");

  const periods = generatePeriods(6);
  const { period: rawPeriod } = await searchParams;
  const period = rawPeriod ?? periods[0];

  let metricEntry = null as Awaited<ReturnType<typeof getPortalReport>>["metricEntry"];
  let attendances: Awaited<ReturnType<typeof getPortalReport>>["attendances"] = [];
  let metricEntries: Awaited<ReturnType<typeof getPortalTrend>>["metricEntries"] = [];
  let attendanceGroups: Awaited<ReturnType<typeof getPortalTrend>>["attendanceGroups"] = [];

  try {
    const [report, trend] = await Promise.all([
      getPortalReport(session.clientId, period),
      getPortalTrend(session.clientId, periods.slice(0, 4)),
    ]);
    metricEntry = report.metricEntry;
    attendances = report.attendances;
    metricEntries = trend.metricEntries;
    attendanceGroups = trend.attendanceGroups;
  } catch { /* DB temporarily unavailable */ }

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const investment = Number(metricEntry?.spend ?? 0);
  const closed     = attendances.filter((a) => a.status === "closed");
  const revenue    = closed.reduce((s, a) => s + Number(a.valueClosed ?? 0), 0);
  const avgTicket  = closed.length > 0 ? revenue / closed.length : 0;
  const roi        = investment > 0 ? ((revenue - investment) / investment) * 100 : null;
  const convRate   = attendances.length > 0 ? (closed.length / attendances.length) * 100 : 0;

  // ── By origin ─────────────────────────────────────────────────────────────
  const byOrigin: Record<string, number> = {};
  attendances.forEach((a) => { byOrigin[a.origin] = (byOrigin[a.origin] ?? 0) + 1; });
  const ORIGIN_LABELS: Record<string, string> = {
    meta_ads: "Meta Ads", google_ads: "Google Ads", instagram: "Instagram",
    google_organic: "Google orgânico", referral: "Indicação", organic: "Orgânico", other: "Outro",
  };

  // ── Trend ─────────────────────────────────────────────────────────────────
  const trendData = periods.slice(0, 4).reverse().map((p) => {
    const me = metricEntries.find((e) => e.period === p);
    const periodRevenue = attendanceGroups
      .filter((g) => g.period === p && g.status === "closed")
      .reduce((s, g) => s + Number(g._sum?.valueClosed ?? 0), 0);
    return { period: p, investment: Number(me?.spend ?? 0), revenue: periodRevenue };
  });
  const maxTrend = Math.max(...trendData.flatMap((t) => [t.investment, t.revenue]), 1);

  // ── Period label ──────────────────────────────────────────────────────────
  const [y, m] = period.split("-");
  const periodLabel = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("pt-BR", {
    month: "long", year: "numeric",
  });

  const firstName = session.name.split(" ")[0];

  return (
    <main className="flex-1 bg-[#0d0d0d] min-h-screen">
      <div className="max-w-xl mx-auto px-5 pt-8 pb-24 space-y-10">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-widest mb-1">Visão geral</p>
            <h1 className="text-2xl font-bold text-white capitalize">{firstName}</h1>
            <p className="text-sm text-gray-600 mt-0.5 capitalize">{periodLabel}</p>
          </div>
          <PeriodSelect periods={periods} current={period} />
        </div>

        {/* ── Primary KPIs ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-px bg-[#1a1a1a] rounded-3xl overflow-hidden">
          {[
            { label: "Faturamento",  value: revenue > 0 ? fmtR(revenue) : "—",    accent: "text-emerald-400", sub: closed.length > 0 ? `${closed.length} fechamento${closed.length > 1 ? "s" : ""}` : "nenhum fechamento" },
            { label: "Investimento", value: investment > 0 ? fmtR(investment) : "—", accent: "text-amber-400", sub: investment > 0 ? "Meta Ads" : "sem dados" },
            { label: "ROI",          value: roi !== null ? `${roi >= 0 ? "+" : ""}${roi.toFixed(0)}%` : "—", accent: roi !== null ? (roi >= 0 ? "text-emerald-400" : "text-red-400") : "text-gray-600", sub: "retorno sobre investimento" },
            { label: "Ticket médio", value: avgTicket > 0 ? fmtR(avgTicket) : "—", accent: "text-violet-400", sub: "por fechamento" },
          ].map(({ label, value, accent, sub }) => (
            <div key={label} className="bg-[#111] px-5 py-6">
              <p className="text-[11px] text-gray-600 uppercase tracking-widest mb-2">{label}</p>
              <p className={`text-2xl font-black ${accent} leading-none`}>{value}</p>
              <p className="text-xs text-gray-700 mt-1.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* ── Secondary stats ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-1">
          {[
            { label: "Atendimentos", value: attendances.length, accent: "text-white" },
            { label: "Conversão",    value: `${convRate.toFixed(0)}%`, accent: "text-blue-400" },
            { label: "Não fechou",   value: attendances.filter(a => a.status === "not_closed").length, accent: "text-red-400" },
            { label: "Follow-ups",   value: attendances.reduce((s, a) => s + a.followUpCount, 0), accent: "text-amber-400" },
          ].map(({ label, value, accent }) => (
            <div key={label} className="text-center">
              <p className={`text-xl font-black ${accent}`}>{value}</p>
              <p className="text-[10px] text-gray-600 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Divider ─────────────────────────────────────────────────────── */}
        <div className="h-px bg-[#1a1a1a]" />

        {/* ── Status breakdown ────────────────────────────────────────────── */}
        {attendances.length > 0 && (
          <div className="space-y-1">
            <p className="text-[11px] text-gray-600 uppercase tracking-widest mb-4">Atendimentos por status</p>
            {[
              { status: "closed",     label: "Fechou",       bar: "bg-emerald-500", text: "text-emerald-400" },
              { status: "scheduled",  label: "Agendado",     bar: "bg-blue-500",    text: "text-blue-400" },
              { status: "follow_up",  label: "Follow-up",    bar: "bg-amber-500",   text: "text-amber-400" },
              { status: "not_closed", label: "Não fechou",   bar: "bg-red-500",     text: "text-red-400" },
              { status: "no_show",    label: "Não compareceu", bar: "bg-orange-500", text: "text-orange-400" },
            ].map(({ status, label, bar, text }) => {
              const count = attendances.filter((a) => a.status === status).length;
              if (count === 0) return null;
              const pct = (count / attendances.length) * 100;
              return (
                <div key={status} className="flex items-center gap-3">
                  <p className={`text-xs w-28 flex-shrink-0 ${text}`}>{label}</p>
                  <div className="flex-1 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-gray-600 w-8 text-right flex-shrink-0">{count}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Origin ──────────────────────────────────────────────────────── */}
        {Object.keys(byOrigin).length > 0 && (
          <div>
            <p className="text-[11px] text-gray-600 uppercase tracking-widest mb-4">Origem dos contatos</p>
            <div className="space-y-3">
              {Object.entries(byOrigin).sort((a, b) => b[1] - a[1]).map(([origin, count]) => {
                const pct = (count / attendances.length) * 100;
                return (
                  <div key={origin} className="flex items-center gap-3">
                    <p className="text-xs text-gray-400 w-32 flex-shrink-0 truncate">{ORIGIN_LABELS[origin] ?? origin}</p>
                    <div className="flex-1 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-violet-500" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-gray-600 w-8 text-right flex-shrink-0">{count}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Meta Ads ────────────────────────────────────────────────────── */}
        {metricEntry && (
          <div>
            <p className="text-[11px] text-gray-600 uppercase tracking-widest mb-4">Meta Ads</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Conversas",      value: metricEntry.conversations > 0 ? metricEntry.conversations.toLocaleString("pt-BR") : "—" },
                { label: "Custo/conversa", value: metricEntry.costPerConversation ? `R$ ${metricEntry.costPerConversation.toFixed(2)}` : "—" },
                { label: "Impressões",     value: metricEntry.impressions?.toLocaleString("pt-BR") ?? "—" },
                { label: "Alcance",        value: metricEntry.reach?.toLocaleString("pt-BR") ?? "—" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#111] rounded-2xl px-4 py-4">
                  <p className="text-[10px] text-gray-600 uppercase tracking-widest">{label}</p>
                  <p className="text-lg font-bold text-blue-400 mt-1">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Trend ───────────────────────────────────────────────────────── */}
        {trendData.some((t) => t.investment > 0 || t.revenue > 0) && (
          <div>
            <p className="text-[11px] text-gray-600 uppercase tracking-widest mb-4">Últimos 4 meses</p>
            <div className="flex items-end gap-4 h-24">
              {trendData.map((t) => {
                const invH = (t.investment / maxTrend) * 100;
                const revH = (t.revenue / maxTrend) * 100;
                const [, mm] = t.period.split("-");
                const mon = new Date(0, Number(mm) - 1).toLocaleDateString("pt-BR", { month: "short" });
                return (
                  <div key={t.period} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end justify-center gap-1" style={{ height: "72px" }}>
                      <div className="flex-1 rounded-t-md bg-amber-400/50" style={{ height: `${Math.max(invH, t.investment > 0 ? 4 : 0)}%` }} />
                      <div className="flex-1 rounded-t-md bg-emerald-400/50" style={{ height: `${Math.max(revH, t.revenue > 0 ? 4 : 0)}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-700 capitalize">{mon}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-1 rounded-full bg-amber-400/50 inline-block" /><span className="text-[10px] text-gray-600">Investimento</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-1 rounded-full bg-emerald-400/50 inline-block" /><span className="text-[10px] text-gray-600">Faturamento</span></div>
            </div>
          </div>
        )}

        {/* ── Empty state ─────────────────────────────────────────────────── */}
        {attendances.length === 0 && !metricEntry && (
          <div className="text-center py-16">
            <p className="text-gray-600 text-sm">Nenhum dado em {period}</p>
            <Link href="/portal/atendimentos" className="inline-block mt-4 text-xs text-violet-400 hover:text-violet-300 transition-colors">
              Registrar atendimento →
            </Link>
          </div>
        )}

      </div>
    </main>
  );
}
