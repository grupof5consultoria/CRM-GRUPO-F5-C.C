"use client";

import React from "react";
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
  instagram: "Instagram (orgânico)",
  google_organic: "Google (orgânico)",
  referral: "Indicação",
  organic: "Orgânico",
  other: "Outro",
};

// ── Platform logo components ──────────────────────────────────────────────────

function InstagramLogo() {
  return (
    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: "linear-gradient(135deg, #f09433 0%, #e6683c 20%, #dc2743 50%, #cc2366 75%, #bc1888 100%)" }}>
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4.5"/>
        <circle cx="17.5" cy="6.5" r="0.8" fill="white" stroke="none"/>
      </svg>
    </div>
  );
}

function GoogleOrganicLogo() {
  return (
    <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
      <svg viewBox="0 0 24 24" width="22" height="22">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57C21.36 18.13 22.56 15.41 22.56 12.25z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    </div>
  );
}

function GoogleAdsLogo() {
  return (
    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#1a73e8" }}>
      <svg viewBox="0 0 24 24" width="22" height="22">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57C21.36 18.13 22.56 15.41 22.56 12.25z" fill="white"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="rgba(255,255,255,0.75)"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="rgba(255,255,255,0.55)"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="rgba(255,255,255,0.55)"/>
      </svg>
    </div>
  );
}

function MetaAdsLogo() {
  return (
    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: "linear-gradient(135deg, #0668E1 0%, #0050A0 100%)" }}>
      <svg viewBox="0 0 24 24" width="22" height="22" fill="white">
        <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C18.34 21.21 22 17.06 22 12.06C22 6.53 17.5 2.04 12 2.04Z"/>
      </svg>
    </div>
  );
}

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
  leadName: string | null;
  leadPhone: string | null;
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

      {/* Leads Capturados */}
      <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#262626]">
          <p className="text-sm font-semibold text-white">Leads Capturados</p>
          <p className="text-xs text-gray-600 mt-0.5">{attendances.length} leads registrados no período</p>
        </div>
        <div className="p-4 space-y-4">

          {/* Source summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { key: "instagram", label: "Instagram", sub: "Orgânico", logo: <InstagramLogo />, bar: "linear-gradient(90deg,#f09433,#dc2743,#bc1888)" },
              { key: "google_organic", label: "Google", sub: "Orgânico", logo: <GoogleOrganicLogo />, bar: "#4285F4" },
              { key: "google_ads", label: "Google Ads", sub: "Anúncio pago", logo: <GoogleAdsLogo />, bar: "#1a73e8" },
              { key: "meta_ads", label: "Meta Ads", sub: "Anúncio pago", logo: <MetaAdsLogo />, bar: "#0668E1" },
            ].map(({ key, label, sub, logo, bar }) => {
              const count = key === "google_organic"
                ? (byOrigin["google_organic"] ?? 0) + (byOrigin["organic"] ?? 0)
                : (byOrigin[key] ?? 0);
              const pct = attendances.length > 0 ? (count / attendances.length) * 100 : 0;
              return (
                <div key={key} className="bg-[#111] border border-[#262626] rounded-xl p-3">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    {logo}
                    <div>
                      <p className="text-xs font-semibold text-gray-200 leading-tight">{label}</p>
                      <p className="text-xs text-gray-600 leading-tight">{sub}</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-white">{count}</p>
                  <div className="mt-1.5 h-1 bg-[#262626] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: bar }} />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{pct.toFixed(1)}%</p>
                </div>
              );
            })}
          </div>

          {/* Pills for other origins */}
          {(byOrigin["referral"] || byOrigin["other"]) && (
            <div className="flex flex-wrap gap-2">
              {byOrigin["referral"] && (
                <div className="flex items-center gap-2 bg-[#111] border border-[#262626] rounded-xl px-3 py-2">
                  <span className="w-2 h-2 rounded-full bg-violet-500" />
                  <span className="text-xs text-gray-400">Indicação</span>
                  <span className="text-sm font-bold text-white">{byOrigin["referral"]}</span>
                </div>
              )}
              {byOrigin["other"] && (
                <div className="flex items-center gap-2 bg-[#111] border border-[#262626] rounded-xl px-3 py-2">
                  <span className="w-2 h-2 rounded-full bg-gray-500" />
                  <span className="text-xs text-gray-400">Outro</span>
                  <span className="text-sm font-bold text-white">{byOrigin["other"]}</span>
                </div>
              )}
            </div>
          )}

          {/* Individual leads list */}
          {attendances.some(a => a.leadName || a.leadPhone) && (
            <div className="border border-[#262626] rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[#262626] bg-[#111]">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lista de Leads</p>
              </div>
              <div className="divide-y divide-[#1e1e1e]">
                {attendances.filter(a => a.leadName || a.leadPhone).map((a) => {
                  const originLogoMap: Record<string, React.ReactNode> = {
                    instagram: <InstagramLogo />,
                    google_organic: <GoogleOrganicLogo />,
                    organic: <GoogleOrganicLogo />,
                    google_ads: <GoogleAdsLogo />,
                    meta_ads: <MetaAdsLogo />,
                  };
                  const logo = originLogoMap[a.origin];
                  return (
                    <div key={a.id} className="flex items-center gap-4 px-4 py-3 hover:bg-[#1a1a1a] transition-colors">
                      {/* Logo */}
                      <div className="flex-shrink-0">
                        {logo ?? <div className="w-11 h-11 rounded-xl bg-[#262626] flex items-center justify-center"><span className="text-xs text-gray-600">?</span></div>}
                      </div>
                      {/* Name + phone */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">{a.leadName ?? "—"}</p>
                        <p className="text-xs text-gray-600">{a.leadPhone ?? "sem telefone"}</p>
                      </div>
                      {/* Origin label */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-500">{ORIGIN_LABELS[a.origin] ?? a.origin}</p>
                        <p className="text-xs text-gray-700">{new Date(a.contactDate).toLocaleDateString("pt-BR")}</p>
                      </div>
                      {/* Status badge */}
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg whitespace-nowrap flex-shrink-0 ${STATUS_COLORS[a.status]}`}>
                        {STATUS_LABELS[a.status]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

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
