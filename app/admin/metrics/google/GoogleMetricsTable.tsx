"use client";

import { useState, useEffect, useRef } from "react";
import { SyncButton } from "../SyncButton";

// ─── Column definitions ───────────────────────────────────────────────────────

type ColKey =
  | "impressions" | "clicks" | "cpc" | "leadsFromAds" | "costPerResult"
  | "spend" | "leadsScheduled" | "revenue" | "roi";

const ALL_COLUMNS: { key: ColKey; label: string; group: string }[] = [
  { key: "impressions",    label: "Impressões",          group: "Desempenho" },
  { key: "clicks",         label: "Cliques",             group: "Desempenho" },
  { key: "cpc",            label: "Custo por Clique",    group: "Desempenho" },
  { key: "leadsFromAds",   label: "Conversões",          group: "Conversões" },
  { key: "costPerResult",  label: "Custo por Conversão", group: "Conversões" },
  { key: "spend",          label: "Investimento",        group: "Financeiro" },
  { key: "leadsScheduled", label: "Leads Agendados",     group: "Financeiro" },
  { key: "revenue",        label: "Faturamento",         group: "Financeiro" },
  { key: "roi",            label: "ROI",                 group: "Financeiro" },
];

const DEFAULT_COLS: ColKey[] = [
  "impressions", "clicks", "cpc", "leadsFromAds", "costPerResult",
  "spend", "leadsScheduled", "revenue", "roi",
];

const LS_KEY = "metrics-google-columns";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MetricEntry {
  platform: string; period: string;
  spend: { toString(): string } | null;
  impressions: number | null; clicks: number | null;
  leadsFromAds: number | null; leadsScheduled: number | null;
  revenue: { toString(): string } | null;
  cpc: { toString(): string } | null;
  costPerResult: { toString(): string } | null;
  syncedAt: Date | null;
}

interface AggEntry {
  spend: number; impressions: number; clicks: number;
  leadsFromAds: number; leadsScheduled: number; revenue: number;
  cpc: number | null; costPerResult: number | null;
  syncedAt: Date | null; count: number;
}

interface Client {
  id: string; name: string; googleAdsCustomerId: string | null;
  metricEntries: MetricEntry[];
}

interface SimpleClient { id: string; name: string; }

interface Props {
  clients: Client[];
  allClients: SimpleClient[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function today(): string { return new Date().toISOString().split("T")[0]; }
function firstOfMonth(): string {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), 1).toISOString().split("T")[0];
}
function dateToPeriod(d: string) { return d.substring(0, 7); }
function monthsBetween(from: string, to: string): number {
  const [fy, fm] = from.split("-").map(Number);
  const [ty, tm] = to.split("-").map(Number);
  return (ty - fy) * 12 + (tm - fm) + 1;
}
function fmtPeriodLabel(period: string) {
  const [y, m] = period.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
}

// ─── Presets ─────────────────────────────────────────────────────────────────

const PRESETS = [
  { key: "7d",       label: "7 dias" },
  { key: "30d",      label: "30 dias" },
  { key: "3m",       label: "3 meses" },
  { key: "6m",       label: "6 meses" },
  { key: "1y",       label: "1 ano" },
  { key: "thisyear", label: "Este ano" },
  { key: "lastyear", label: "Ano passado" },
] as const;

function applyPreset(key: string): { from: string; to: string } {
  const now = new Date();
  const t = now.toISOString().split("T")[0];
  const d = (offset: number) => { const x = new Date(now); x.setDate(x.getDate() - offset); return x.toISOString().split("T")[0]; };
  const m = (monthsBack: number) => new Date(now.getFullYear(), now.getMonth() - monthsBack, 1).toISOString().split("T")[0];
  switch (key) {
    case "7d":       return { from: d(6), to: t };
    case "30d":      return { from: d(29), to: t };
    case "3m":       return { from: m(2), to: t };
    case "6m":       return { from: m(5), to: t };
    case "1y":       return { from: m(11), to: t };
    case "thisyear": return { from: `${now.getFullYear()}-01-01`, to: t };
    case "lastyear": return { from: `${now.getFullYear() - 1}-01-01`, to: `${now.getFullYear() - 1}-12-31` };
    default:         return { from: firstOfMonth(), to: t };
  }
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmtR(v: number | null | undefined) {
  if (v == null) return "—";
  return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}
function fmtN(v: number | null | undefined) {
  return v == null || v === 0 ? "—" : v.toLocaleString("pt-BR");
}

// ─── Aggregation ─────────────────────────────────────────────────────────────

function aggregateEntries(entries: MetricEntry[], platform: string, from: string, to: string): AggEntry | null {
  const inRange = entries.filter(e => e.platform === platform && e.period >= from && e.period <= to);
  if (inRange.length === 0) return null;
  const sumD = (k: keyof MetricEntry) => inRange.reduce((a, e) => a + Number(e[k] ?? 0), 0);
  const sumN = (k: keyof MetricEntry) => inRange.reduce((a, e) => a + ((e[k] as number) ?? 0), 0);
  const spend = sumD("spend"); const clicks = sumN("clicks");
  const leadsFromAds = sumN("leadsFromAds");
  return {
    spend, impressions: sumN("impressions"), clicks, leadsFromAds,
    leadsScheduled: sumN("leadsScheduled"), revenue: sumD("revenue"),
    cpc: clicks > 0 ? spend / clicks : null,
    costPerResult: leadsFromAds > 0 ? spend / leadsFromAds : null,
    syncedAt: inRange.reduce<Date | null>((l, e) => !e.syncedAt ? l : !l || e.syncedAt > l ? e.syncedAt : l, null),
    count: inRange.length,
  };
}

// ─── Cell renderer ────────────────────────────────────────────────────────────

function Cell({ agg, col }: { agg: AggEntry | null; col: ColKey }) {
  if (!agg) return <span className="text-gray-700">—</span>;
  switch (col) {
    case "impressions":    return <span className="text-gray-300">{fmtN(agg.impressions)}</span>;
    case "clicks":         return <span className="text-blue-300">{fmtN(agg.clicks)}</span>;
    case "cpc":            return <span className="text-gray-300">{fmtR(agg.cpc)}</span>;
    case "leadsFromAds":   return <span className="text-gray-300">{fmtN(agg.leadsFromAds)}</span>;
    case "costPerResult":  return <span className="text-gray-300">{fmtR(agg.costPerResult)}</span>;
    case "spend":          return <span className={agg.spend ? "text-amber-400 font-medium" : "text-gray-600"}>{fmtR(agg.spend || null)}</span>;
    case "leadsScheduled": return <span className={agg.leadsScheduled ? "text-violet-400 font-medium" : "text-gray-600"}>{agg.leadsScheduled || "—"}</span>;
    case "revenue":        return <span className={agg.revenue ? "text-emerald-400 font-medium" : "text-gray-600"}>{fmtR(agg.revenue || null)}</span>;
    case "roi": {
      if (!agg.spend) return <span className="text-gray-600">—</span>;
      const pct = ((agg.revenue - agg.spend) / agg.spend) * 100;
      return <span className={`font-semibold ${pct >= 0 ? "text-emerald-400" : "text-red-400"}`}>{pct >= 0 ? "+" : ""}{pct.toFixed(0)}%</span>;
    }
    default: return <span className="text-gray-700">—</span>;
  }
}

// ─── Column filter dropdown ───────────────────────────────────────────────────

function ColumnFilter({ selected, onChange }: { selected: ColKey[]; onChange: (c: ColKey[]) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const groups = [...new Set(ALL_COLUMNS.map(c => c.group))];
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 bg-[#1a1a1a] border border-[#262626] hover:border-violet-500/40 rounded-xl px-3 py-2 text-sm text-gray-400 hover:text-gray-200 transition-all">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" /></svg>
        Colunas <span className="text-xs text-violet-400 font-semibold">{selected.length}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-11 w-72 bg-[#1a1a1a] border border-[#262626] rounded-2xl shadow-2xl shadow-black/60 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#262626]">
            <p className="text-sm font-semibold text-white">Selecionar Colunas</p>
            <div className="flex gap-2">
              <button onClick={() => onChange(ALL_COLUMNS.map(c => c.key))} className="text-xs text-violet-400 hover:text-violet-300">Todas</button>
              <span className="text-[#333]">|</span>
              <button onClick={() => onChange(DEFAULT_COLS)} className="text-xs text-gray-500 hover:text-gray-300">Padrão</button>
            </div>
          </div>
          <div className="p-3 space-y-3 max-h-80 overflow-y-auto">
            {groups.map(group => (
              <div key={group}>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 px-1">{group}</p>
                <div className="space-y-0.5">
                  {ALL_COLUMNS.filter(c => c.group === group).map(col => {
                    const active = selected.includes(col.key);
                    return (
                      <button key={col.key} onClick={() => onChange(active ? selected.filter(k => k !== col.key) : [...selected, col.key])}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${active ? "bg-violet-500/10 text-violet-300" : "text-gray-500 hover:bg-[#222] hover:text-gray-300"}`}
                      >
                        <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-all ${active ? "bg-violet-600 border-violet-500" : "border-[#333]"}`}>
                          {active && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </span>
                        {col.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-[#262626]">
            <button onClick={() => setOpen(false)} className="relative w-full py-2 rounded-xl text-sm font-semibold text-white overflow-hidden" style={{ background: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 40%, #5b21b6 100%)" }}>
              <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%)" }} />
              <span className="relative">Salvar e Fechar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const dateCls = "bg-[#1a1a1a] border border-[#262626] rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-violet-500 [color-scheme:dark]";
const selectCls = "bg-[#1a1a1a] border border-[#262626] rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-violet-500";

export function GoogleMetricsTable({ clients, allClients }: Props) {
  const [dateFrom, setDateFrom] = useState(firstOfMonth);
  const [dateTo, setDateTo]     = useState(today);
  const [selectedClientId, setSelectedClientId] = useState("all");
  const [visibleCols, setVisibleCols] = useState<ColKey[]>(DEFAULT_COLS);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) { const p = JSON.parse(saved) as ColKey[]; if (Array.isArray(p) && p.length) setVisibleCols(p); }
    } catch {}
  }, []);

  function handleColChange(cols: ColKey[]) { setVisibleCols(cols); localStorage.setItem(LS_KEY, JSON.stringify(cols)); }
  function handlePreset(key: string) { const { from, to } = applyPreset(key); setDateFrom(from); setDateTo(to); setActivePreset(key); }
  function handleFromChange(v: string) { setDateFrom(v); setActivePreset(null); if (v > dateTo) setDateTo(v); }
  function handleToChange(v: string) { setDateTo(v); setActivePreset(null); if (v < dateFrom) setDateFrom(v); }

  const periodFrom = dateToPeriod(dateFrom);
  const periodTo   = dateToPeriod(dateTo);
  const numMonths  = monthsBetween(periodFrom, periodTo);
  const isSingle   = numMonths === 1;

  const filteredClients = clients.filter(c => selectedClientId === "all" || c.id === selectedClientId);
  const cols = ALL_COLUMNS.filter(c => visibleCols.includes(c.key));

  const totals: AggEntry = { spend: 0, impressions: 0, clicks: 0, leadsFromAds: 0, leadsScheduled: 0, revenue: 0, cpc: null, costPerResult: null, syncedAt: null, count: 0 };
  filteredClients.forEach(c => {
    const a = aggregateEntries(c.metricEntries, "google", periodFrom, periodTo);
    if (!a) return;
    totals.spend += a.spend; totals.impressions += a.impressions; totals.clicks += a.clicks;
    totals.leadsFromAds += a.leadsFromAds; totals.leadsScheduled += a.leadsScheduled;
    totals.revenue += a.revenue; totals.count += a.count;
  });
  if (totals.clicks > 0) totals.cpc = totals.spend / totals.clicks;
  if (totals.leadsFromAds > 0) totals.costPerResult = totals.spend / totals.leadsFromAds;

  return (
    <div className="space-y-5">
      {/* Controls bar */}
      <div className="flex items-start gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#262626] rounded-xl px-3 py-2">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-sm font-semibold text-red-400">Google Ads</span>
          <span className="text-xs text-gray-600 ml-1">{clients.length} cliente{clients.length !== 1 ? "s" : ""}</span>
        </div>

        <select value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} className={`${selectCls} min-w-[180px]`}>
          <option value="all">Todos os clientes</option>
          {allClients.map(c => {
            const has = clients.some(gc => gc.id === c.id);
            return <option key={c.id} value={c.id} disabled={!has}>{c.name}{!has ? " (sem credencial)" : ""}</option>;
          })}
        </select>

        {/* Date range block */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 font-medium">De</span>
              <input type="date" value={dateFrom} onChange={e => handleFromChange(e.target.value)} className={dateCls} />
            </div>
            <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 font-medium">Até</span>
              <input type="date" value={dateTo} onChange={e => handleToChange(e.target.value)} className={dateCls} />
            </div>
            <span className={`text-xs rounded-lg px-2 py-1 font-medium border ${isSingle ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-red-500/15 text-red-400 border-red-500/20"}`}>
              {isSingle ? fmtPeriodLabel(periodFrom) : `${numMonths} meses`}
            </span>
          </div>

          {/* Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {PRESETS.map(p => (
              <button key={p.key} onClick={() => handlePreset(p.key)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${activePreset === p.key ? "bg-red-600/20 border-red-500/40 text-red-300" : "bg-[#1a1a1a] border-[#262626] text-gray-500 hover:border-red-500/30 hover:text-gray-300"}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="ml-auto mt-0.5">
          <ColumnFilter selected={visibleCols} onChange={handleColChange} />
        </div>
      </div>

      {/* Table */}
      {filteredClients.length === 0 ? (
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-12 text-center">
          <p className="text-sm text-gray-600">Nenhum cliente com credenciais Google Ads configuradas.</p>
          <p className="text-xs text-gray-700 mt-1">Configure as credenciais na ficha de cada cliente.</p>
        </div>
      ) : (
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#262626] bg-[#111111]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky left-0 bg-[#111111] z-10">Cliente</th>
                  {cols.map(col => <th key={col.key} className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{col.label}</th>)}
                  {isSingle && <th className="px-3 py-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]">
                {filteredClients.map(client => {
                  const agg = aggregateEntries(client.metricEntries, "google", periodFrom, periodTo);
                  return (
                    <tr key={client.id} className="hover:bg-[#222222] transition-colors">
                      <td className="px-4 py-3 sticky left-0 bg-[#1a1a1a] hover:bg-[#222222] z-10">
                        <p className="text-white font-medium whitespace-nowrap">{client.name}</p>
                        {agg?.syncedAt ? <p className="text-xs text-gray-600">Sync: {new Date(agg.syncedAt).toLocaleDateString("pt-BR")}</p> : <p className="text-xs text-gray-700">{agg ? "Não sincronizado" : "Sem dados"}</p>}
                      </td>
                      {cols.map(col => <td key={col.key} className="px-4 py-3 text-right whitespace-nowrap"><Cell agg={agg} col={col.key} /></td>)}
                      {isSingle && <td className="px-3 py-3"><SyncButton clientId={client.id} platform="google" period={periodFrom} /></td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totals.count > 0 && (
            <div className="border-t border-[#262626] bg-[#111111] px-4 py-3 flex items-center gap-6 flex-wrap text-sm">
              {visibleCols.includes("impressions")    && <div><p className="text-xs text-gray-600">Impressões</p><p className="font-bold text-gray-300">{totals.impressions.toLocaleString("pt-BR")}</p></div>}
              {visibleCols.includes("clicks")         && <div><p className="text-xs text-gray-600">Cliques</p><p className="font-bold text-blue-300">{totals.clicks.toLocaleString("pt-BR")}</p></div>}
              {visibleCols.includes("cpc")            && <div><p className="text-xs text-gray-600">CPC Médio</p><p className="font-bold text-gray-300">{fmtR(totals.cpc)}</p></div>}
              {visibleCols.includes("leadsFromAds")   && <div><p className="text-xs text-gray-600">Conversões</p><p className="font-bold text-gray-300">{totals.leadsFromAds.toLocaleString("pt-BR")}</p></div>}
              {visibleCols.includes("costPerResult")  && <div><p className="text-xs text-gray-600">Custo/Conversão</p><p className="font-bold text-gray-300">{fmtR(totals.costPerResult)}</p></div>}
              {visibleCols.includes("spend")          && <div><p className="text-xs text-gray-600">Investimento</p><p className="font-bold text-amber-400">{fmtR(totals.spend)}</p></div>}
              {visibleCols.includes("leadsScheduled") && <div><p className="text-xs text-gray-600">Leads Agendados</p><p className="font-bold text-violet-400">{totals.leadsScheduled.toLocaleString("pt-BR")}</p></div>}
              {visibleCols.includes("revenue")        && <div><p className="text-xs text-gray-600">Faturamento</p><p className="font-bold text-emerald-400">{fmtR(totals.revenue)}</p></div>}
              {visibleCols.includes("roi") && (() => {
                const roi = totals.spend > 0 ? ((totals.revenue - totals.spend) / totals.spend) * 100 : null;
                return <div><p className="text-xs text-gray-600">ROI</p><p className={`font-bold ${roi == null ? "text-gray-600" : roi >= 0 ? "text-emerald-400" : "text-red-400"}`}>{roi == null ? "—" : `${roi >= 0 ? "+" : ""}${roi.toFixed(0)}%`}</p></div>;
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
