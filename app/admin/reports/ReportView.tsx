"use client";

import { useRouter } from "next/navigation";

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Agendado",
  closed: "Fechou",
  not_closed: "Não fechou",
  follow_up: "Em follow-up",
};

const STATUS_COLORS: Record<string, string> = {
  scheduled: "text-blue-400 bg-blue-400/10",
  closed: "text-emerald-400 bg-emerald-400/10",
  not_closed: "text-red-400 bg-red-400/10",
  follow_up: "text-amber-400 bg-amber-400/10",
};

const ORIGIN_LABELS: Record<string, string> = {
  meta_ads: "Meta Ads",
  google_ads: "Google Ads",
  referral: "Indicação",
  organic: "Orgânico",
  other: "Outro",
};

interface MetricEntry {
  spend: { toString(): string } | null;
  impressions: number | null;
  leadsFromAds: number | null;
  reach: number | null;
  cpm: { toString(): string } | null;
  costPerResult: { toString(): string } | null;
}

interface Attendance {
  id: string;
  serviceId: string | null;
  service: { name: string } | null;
  valueQuoted: { toString(): string } | null;
  valueClosed: { toString(): string } | null;
  status: string;
  lostReason: string | null;
  followUpCount: number;
  origin: string;
  contactDate: Date;
  notes: string | null;
}

interface ClientService {
  id: string;
  name: string;
  price: { toString(): string } | null;
}

interface SimpleClient { id: string; name: string; }

interface Props {
  clients: SimpleClient[];
  selectedClientId: string;
  period: string;
  periods: string[];
  metricEntry: MetricEntry | null;
  attendances: Attendance[];
  services: ClientService[];
}

function fmtR(v: { toString(): string } | null | undefined) {
  if (!v) return "—";
  return `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}
function fmtN(v: number | null | undefined) {
  return v == null ? "—" : v.toLocaleString("pt-BR");
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent: string }) {
  return (
    <div className="relative bg-[#1a1a1a] rounded-2xl border border-[#262626] p-4 overflow-hidden">
      <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 60%)" }} />
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent}`}>{value}</p>
      {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
    </div>
  );
}

export function ReportView({ clients, selectedClientId, period, periods, metricEntry, attendances, services }: Props) {
  const router = useRouter();

  function navigate(clientId: string, p: string) {
    router.push(`/admin/reports?clientId=${clientId}&period=${p}`);
  }

  // ── Computed stats ────────────────────────────────────────────────────────

  const closed = attendances.filter((a) => a.status === "closed");
  const notClosed = attendances.filter((a) => a.status === "not_closed");
  const scheduled = attendances.filter((a) => a.status === "scheduled");
  const followUp = attendances.filter((a) => a.status === "follow_up");

  const totalRevenue = closed.reduce((s, a) => s + Number(a.valueClosed ?? 0), 0);
  const totalQuoted = attendances.reduce((s, a) => s + Number(a.valueQuoted ?? 0), 0);
  const avgTicket = closed.length > 0 ? totalRevenue / closed.length : 0;
  const conversionRate = attendances.length > 0 ? (closed.length / attendances.length) * 100 : 0;
  const totalFollowUps = attendances.reduce((s, a) => s + a.followUpCount, 0);

  const investment = Number(metricEntry?.spend ?? 0);
  const roi = investment > 0 ? ((totalRevenue - investment) / investment) * 100 : null;

  // Loss reasons grouped
  const lostReasons: Record<string, number> = {};
  notClosed.forEach((a) => {
    const r = a.lostReason?.trim() || "Não informado";
    lostReasons[r] = (lostReasons[r] ?? 0) + 1;
  });
  const sortedReasons = Object.entries(lostReasons).sort((a, b) => b[1] - a[1]);

  // By origin
  const byOrigin: Record<string, number> = {};
  attendances.forEach((a) => { byOrigin[a.origin] = (byOrigin[a.origin] ?? 0) + 1; });
  const totalByOrigin = Object.values(byOrigin).reduce((s, n) => s + n, 0);

  // By service
  const byService: Record<string, { total: number; closed: number; revenue: number }> = {};
  attendances.forEach((a) => {
    const name = a.service?.name
      ?? (a.notes?.startsWith("Serviço:") ? a.notes.split("|")[0].replace("Serviço:", "").trim() : "Sem serviço");
    if (!byService[name]) byService[name] = { total: 0, closed: 0, revenue: 0 };
    byService[name].total++;
    if (a.status === "closed") {
      byService[name].closed++;
      byService[name].revenue += Number(a.valueClosed ?? 0);
    }
  });
  const sortedServices = Object.entries(byService).sort((a, b) => b[1].revenue - a[1].revenue);

  return (
    <div className="space-y-6">

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={selectedClientId}
          onChange={(e) => navigate(e.target.value, period)}
          className="bg-[#1a1a1a] border border-[#262626] rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-violet-500 min-w-[200px]"
        >
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={period}
          onChange={(e) => navigate(selectedClientId, e.target.value)}
          className="bg-[#1a1a1a] border border-[#262626] rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-violet-500"
        >
          {periods.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Investimento Meta" value={fmtR(metricEntry?.spend)} sub={metricEntry ? undefined : "sem dados Meta"} accent="text-amber-400" />
        <StatCard label="Faturamento" value={`R$ ${totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`} sub={`${closed.length} fechamento${closed.length !== 1 ? "s" : ""}`} accent="text-emerald-400" />
        <StatCard
          label="ROI"
          value={roi !== null ? `${roi >= 0 ? "+" : ""}${roi.toFixed(0)}%` : "—"}
          sub={roi !== null ? "retorno sobre investimento" : "sem dados de investimento"}
          accent={roi !== null ? (roi >= 0 ? "text-emerald-400" : "text-red-400") : "text-gray-500"}
        />
        <StatCard label="Ticket Médio" value={avgTicket > 0 ? `R$ ${avgTicket.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}` : "—"} sub={closed.length > 0 ? `${closed.length} fechamento${closed.length !== 1 ? "s" : ""}` : undefined} accent="text-violet-400" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Atendimentos" value={String(attendances.length)} accent="text-gray-300" />
        <StatCard label="Taxa de Conversão" value={`${conversionRate.toFixed(1)}%`} sub={`${closed.length} fecharam de ${attendances.length}`} accent="text-blue-400" />
        <StatCard label="Não Fecharam" value={String(notClosed.length)} sub={notClosed.length > 0 ? `${sortedReasons[0]?.[0] ?? ""}` : undefined} accent="text-red-400" />
        <StatCard label="Total Follow-ups" value={String(totalFollowUps)} sub={`média ${attendances.length > 0 ? (totalFollowUps / attendances.length).toFixed(1) : "0"} por atendimento`} accent="text-amber-400" />
      </div>

      {/* Meta Ads data strip */}
      {metricEntry && (
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Meta Ads — {period}</p>
          </div>
          <div className="flex flex-wrap gap-6">
            <div><p className="text-xs text-gray-600">Alcance</p><p className="text-sm font-bold text-gray-300">{fmtN(metricEntry.reach)}</p></div>
            <div><p className="text-xs text-gray-600">Impressões</p><p className="text-sm font-bold text-gray-300">{fmtN(metricEntry.impressions)}</p></div>
            <div><p className="text-xs text-gray-600">Leads (ads)</p><p className="text-sm font-bold text-gray-300">{fmtN(metricEntry.leadsFromAds)}</p></div>
            <div><p className="text-xs text-gray-600">CPM</p><p className="text-sm font-bold text-gray-300">{fmtR(metricEntry.cpm)}</p></div>
            <div><p className="text-xs text-gray-600">Custo por Resultado</p><p className="text-sm font-bold text-gray-300">{fmtR(metricEntry.costPerResult)}</p></div>
          </div>
        </div>
      )}

      {/* Main grid: analysis */}
      {attendances.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* By service */}
          <div className="lg:col-span-2 bg-[#1a1a1a] border border-[#262626] rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#262626]">
              <p className="text-sm font-semibold text-white">Por Serviço</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e1e1e]">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Serviço</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecharam</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Faturamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]">
                {sortedServices.map(([name, stats]) => (
                  <tr key={name} className="hover:bg-[#222] transition-colors">
                    <td className="px-4 py-3 text-gray-300">{name}</td>
                    <td className="px-4 py-3 text-right text-gray-400">{stats.total}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-emerald-400">{stats.closed}</span>
                      <span className="text-gray-600 text-xs ml-1">({stats.total > 0 ? ((stats.closed / stats.total) * 100).toFixed(0) : 0}%)</span>
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-400 font-medium">
                      {stats.revenue > 0 ? `R$ ${stats.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sidebar: motivos de perda + origem */}
          <div className="space-y-4">

            {/* Loss reasons */}
            {sortedReasons.length > 0 && (
              <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-[#262626]">
                  <p className="text-sm font-semibold text-white">Motivos de Perda</p>
                </div>
                <div className="p-4 space-y-2">
                  {sortedReasons.map(([reason, count]) => (
                    <div key={reason} className="flex items-center justify-between gap-2">
                      <p className="text-xs text-gray-400 truncate flex-1">{reason}</p>
                      <span className="text-xs font-bold text-red-400 flex-shrink-0">{count}×</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Origin */}
            <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#262626]">
                <p className="text-sm font-semibold text-white">Origem dos Contatos</p>
              </div>
              <div className="p-4 space-y-2.5">
                {Object.entries(byOrigin).sort((a, b) => b[1] - a[1]).map(([origin, count]) => {
                  const pct = totalByOrigin > 0 ? (count / totalByOrigin) * 100 : 0;
                  return (
                    <div key={origin}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">{ORIGIN_LABELS[origin] ?? origin}</span>
                        <span className="text-xs font-semibold text-gray-300">{count}</span>
                      </div>
                      <div className="h-1.5 bg-[#262626] rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-violet-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance detail table */}
      <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#262626] flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Atendimentos em {period}</p>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span className="text-blue-400">{scheduled.length} ag.</span>
            <span className="text-emerald-400">{closed.length} fecharam</span>
            <span className="text-red-400">{notClosed.length} perdidos</span>
            <span className="text-amber-400">{followUp.length} follow-up</span>
          </div>
        </div>

        {attendances.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-gray-600">Nenhum atendimento registrado pelo cliente neste período.</p>
            <p className="text-xs text-gray-700 mt-1">O cliente registra atendimentos pelo portal em "Atendimentos".</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e1e1e] bg-[#111111]">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Serviço</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Origem</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Orçado</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fechado</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Follow-ups</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Motivo perda</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]">
                {attendances.map((a) => {
                  const serviceName = a.service?.name
                    ?? (a.notes?.startsWith("Serviço:") ? a.notes.split("|")[0].replace("Serviço:", "").trim() : "—");
                  return (
                    <tr key={a.id} className="hover:bg-[#222] transition-colors">
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(a.contactDate).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3 text-gray-300 max-w-[180px] truncate">{serviceName}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg whitespace-nowrap ${STATUS_COLORS[a.status]}`}>
                          {STATUS_LABELS[a.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{ORIGIN_LABELS[a.origin] ?? a.origin}</td>
                      <td className="px-4 py-3 text-right text-gray-400 whitespace-nowrap">{fmtR(a.valueQuoted)}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <span className={a.valueClosed ? "text-emerald-400 font-medium" : "text-gray-700"}>
                          {fmtR(a.valueClosed)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-amber-400">{a.followUpCount > 0 ? a.followUpCount : "—"}</td>
                      <td className="px-4 py-3 text-xs text-red-400/80 max-w-[200px] truncate">{a.lostReason ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
