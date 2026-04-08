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

function KpiCard({
  label, value, sub, accent, href,
}: {
  label: string; value: string; sub?: string; accent: string; href?: string;
}) {
  const inner = (
    <div className={`relative bg-[#1a1a1a] rounded-2xl border border-[#262626] p-5 overflow-hidden h-full ${href ? "hover:border-violet-500/30 transition-all" : ""}`}>
      <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 60%)" }} />
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent}`}>{value}</p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : <div>{inner}</div>;
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
  } catch {
    // DB temporarily unavailable — render with empty state
  }

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const investment = Number(metricEntry?.spend ?? 0);
  const closed = attendances.filter((a) => a.status === "closed");
  const notClosed = attendances.filter((a) => a.status === "not_closed");
  const revenue = closed.reduce((s, a) => s + Number(a.valueClosed ?? 0), 0);
  const avgTicket = closed.length > 0 ? revenue / closed.length : 0;
  const roi = investment > 0 ? ((revenue - investment) / investment) * 100 : null;
  const convRate = attendances.length > 0 ? (closed.length / attendances.length) * 100 : 0;
  const totalFollowUps = attendances.reduce((s, a) => s + a.followUpCount, 0);

  // ── By origin ─────────────────────────────────────────────────────────────
  const byOrigin: Record<string, number> = {};
  attendances.forEach((a) => { byOrigin[a.origin] = (byOrigin[a.origin] ?? 0) + 1; });
  const ORIGIN_LABELS: Record<string, string> = {
    meta_ads: "Meta Ads", google_ads: "Google Ads",
    referral: "Indicação", organic: "Orgânico", other: "Outro",
  };

  // ── Trend (last 4 months) ─────────────────────────────────────────────────
  const trend = periods.slice(0, 4).reverse().map((p) => {
    const me = metricEntries.find((e) => e.period === p);
    const closedGroups = attendanceGroups.filter(
      (g) => g.period === p && g.status === "closed"
    );
    const periodRevenue = closedGroups.reduce(
      (s, g) => s + Number(g._sum?.valueClosed ?? 0), 0
    );
    return {
      period: p,
      investment: Number(me?.spend ?? 0),
      revenue: periodRevenue,
    };
  });
  const maxTrend = Math.max(...trend.flatMap((t) => [t.investment, t.revenue]), 1);

  // ── Format period label ───────────────────────────────────────────────────
  const [y, m] = period.split("-");
  const periodLabel = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("pt-BR", {
    month: "long", year: "numeric",
  });

  return (
    <main className="flex-1 p-5 bg-[#111111] min-h-screen max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white capitalize">Olá, {session.name.split(" ")[0]}!</h1>
          <p className="text-sm text-gray-500 mt-0.5 capitalize">{periodLabel}</p>
        </div>
        {/* Period selector */}
        <PeriodSelect periods={periods} current={period} />
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard
          label="Investimento"
          value={investment > 0 ? fmtR(investment) : "—"}
          sub={investment > 0 ? "Meta Ads" : "sem dados de campanha"}
          accent="text-amber-400"
        />
        <KpiCard
          label="Faturamento"
          value={revenue > 0 ? fmtR(revenue) : "—"}
          sub={closed.length > 0 ? `${closed.length} fechamento${closed.length > 1 ? "s" : ""}` : "nenhum fechamento"}
          accent="text-emerald-400"
        />
        <KpiCard
          label="ROI"
          value={roi !== null ? `${roi >= 0 ? "+" : ""}${roi.toFixed(0)}%` : "—"}
          sub={roi !== null ? "retorno sobre investimento" : "sem dados suficientes"}
          accent={roi !== null ? (roi >= 0 ? "text-emerald-400" : "text-red-400") : "text-gray-500"}
        />
        <KpiCard
          label="Ticket Médio"
          value={avgTicket > 0 ? fmtR(avgTicket) : "—"}
          sub={avgTicket > 0 ? "por fechamento" : "nenhum fechamento"}
          accent="text-violet-400"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#1a1a1a] rounded-2xl border border-[#262626] p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Atendimentos</p>
          <p className="text-xl font-bold text-gray-200">{attendances.length}</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-2xl border border-[#262626] p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Conversão</p>
          <p className="text-xl font-bold text-blue-400">{convRate.toFixed(0)}%</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-2xl border border-[#262626] p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Follow-ups</p>
          <p className="text-xl font-bold text-amber-400">{totalFollowUps}</p>
        </div>
      </div>

      {/* Meta Ads strip */}
      {metricEntry && (
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Meta Ads</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Alcance", value: metricEntry.reach?.toLocaleString("pt-BR") ?? "—" },
              { label: "Impressões", value: metricEntry.impressions?.toLocaleString("pt-BR") ?? "—" },
              { label: "Leads gerados", value: metricEntry.leadsFromAds?.toLocaleString("pt-BR") ?? "—" },
              { label: "CPM", value: metricEntry.cpm ? `R$ ${Number(metricEntry.cpm).toFixed(2)}` : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#111111] rounded-xl px-3 py-2.5">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-sm font-semibold text-gray-200 mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attendance status breakdown */}
      {attendances.length > 0 && (
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-4">
          <p className="text-sm font-semibold text-white mb-3">Atendimentos por Status</p>
          <div className="space-y-2.5">
            {[
              { status: "closed",     label: "Fechou",       color: "bg-emerald-500", textColor: "text-emerald-400" },
              { status: "scheduled",  label: "Agendado",     color: "bg-blue-500",    textColor: "text-blue-400" },
              { status: "follow_up",  label: "Em follow-up", color: "bg-amber-500",   textColor: "text-amber-400" },
              { status: "not_closed", label: "Não fechou",   color: "bg-red-500",     textColor: "text-red-400" },
            ].map(({ status, label, color, textColor }) => {
              const count = attendances.filter((a) => a.status === status).length;
              const pct = attendances.length > 0 ? (count / attendances.length) * 100 : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium ${textColor}`}>{label}</span>
                    <span className="text-xs text-gray-400">{count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 bg-[#262626] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Origin breakdown */}
      {Object.keys(byOrigin).length > 0 && (
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-4">
          <p className="text-sm font-semibold text-white mb-3">Origem dos Contatos</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(byOrigin).sort((a, b) => b[1] - a[1]).map(([origin, count]) => (
              <div key={origin} className="flex items-center gap-1.5 bg-[#111111] rounded-xl px-3 py-2">
                <span className="text-xs text-gray-400">{ORIGIN_LABELS[origin] ?? origin}</span>
                <span className="text-xs font-bold text-violet-400">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trend chart - last 4 months */}
      {trend.some((t) => t.investment > 0 || t.revenue > 0) && (
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-4">
          <p className="text-sm font-semibold text-white mb-1">Últimos 4 meses</p>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-amber-400 inline-block" /><span className="text-xs text-gray-500">Investimento</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-emerald-400 inline-block" /><span className="text-xs text-gray-500">Faturamento</span></div>
          </div>
          <div className="flex items-end gap-3 h-28">
            {trend.map((t) => {
              const invPct = (t.investment / maxTrend) * 100;
              const revPct = (t.revenue / maxTrend) * 100;
              const [, mm] = t.period.split("-");
              const monthName = new Date(0, Number(mm) - 1).toLocaleDateString("pt-BR", { month: "short" });
              return (
                <div key={t.period} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center gap-1" style={{ height: "80px" }}>
                    <div
                      className="flex-1 rounded-t-lg bg-amber-400/70 transition-all"
                      style={{ height: `${Math.max(invPct, t.investment > 0 ? 4 : 0)}%` }}
                    />
                    <div
                      className="flex-1 rounded-t-lg bg-emerald-400/70 transition-all"
                      style={{ height: `${Math.max(revPct, t.revenue > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-600 capitalize">{monthName}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {attendances.length === 0 && !metricEntry && (
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-10 text-center">
          <svg className="w-10 h-10 text-gray-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm text-gray-500 font-medium">Nenhum dado em {period}</p>
          <p className="text-xs text-gray-700 mt-1">Registre seus atendimentos para ver os resultados aqui.</p>
          <Link
            href="/portal/atendimentos"
            className="inline-block mt-4 text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            Registrar atendimento →
          </Link>
        </div>
      )}

    </main>
  );
}
