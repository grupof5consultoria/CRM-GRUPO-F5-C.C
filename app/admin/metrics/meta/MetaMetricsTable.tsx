"use client";

import { useState, useEffect, useRef } from "react";
import { SyncButton } from "../SyncButton";
import { CampaignInsights } from "./CampaignInsights";

// ─── Column definitions ───────────────────────────────────────────────────────

type ColKey =
  | "reach" | "budget" | "spend" | "impressions" | "cpm"
  | "linkClicks" | "cpc" | "ctr" | "costPerResult"
  | "leadsFromAds" | "conversations" | "leadsScheduled" | "revenue" | "roi";

const ALL_COLUMNS: { key: ColKey; label: string; group: string }[] = [
  { key: "reach",         label: "Alcance",            group: "Entrega" },
  { key: "impressions",   label: "Impressões",          group: "Entrega" },
  { key: "cpm",           label: "CPM",                 group: "Entrega" },
  { key: "budget",        label: "Orçamento",           group: "Investimento" },
  { key: "spend",         label: "Valor Usado",         group: "Investimento" },
  { key: "linkClicks",    label: "Cliques no Link",     group: "Engajamento" },
  { key: "cpc",           label: "Custo por Clique",    group: "Engajamento" },
  { key: "ctr",           label: "CTR",                 group: "Engajamento" },
  { key: "costPerResult", label: "Custo por Resultado", group: "Resultados" },
  { key: "leadsFromAds",  label: "Leads (ads)",         group: "Resultados" },
  { key: "conversations", label: "Conversas WhatsApp",  group: "Resultados" },
  { key: "leadsScheduled",label: "Leads Agendados",     group: "Resultados" },
  { key: "revenue",       label: "Faturamento",         group: "Resultados" },
  { key: "roi",           label: "ROI",                 group: "Resultados" },
];

const DEFAULT_COLS: ColKey[] = [
  "reach", "budget", "spend", "impressions", "cpm",
  "linkClicks", "cpc", "ctr", "costPerResult",
  "leadsFromAds", "conversations", "leadsScheduled", "revenue", "roi",
];

const LS_KEY = "metrics-meta-columns";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MetricEntry {
  platform: string; date: string;
  spend: { toString(): string } | null;
  impressions: number | null; clicks: number | null;
  leadsFromAds: number | null; leadsScheduled: number | null;
  revenue: { toString(): string } | null;
  reach: number | null; cpm: { toString(): string } | null;
  linkClicks: number | null; cpc: { toString(): string } | null;
  ctr: { toString(): string } | null; costPerResult: { toString(): string } | null;
  conversations: number | null;
  budget: { toString(): string } | null; syncedAt: Date | null;
}

interface AggEntry {
  spend: number; impressions: number; reach: number; linkClicks: number;
  leadsFromAds: number; conversations: number; leadsScheduled: number; revenue: number; budget: number;
  cpm: number | null; cpc: number | null; ctr: number | null; costPerResult: number | null;
  syncedAt: Date | null; count: number;
}

interface Client {
  id: string; name: string; metaAdAccountId: string | null;
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
  { key: "today",     label: "Hoje" },
  { key: "yesterday", label: "Ontem" },
  { key: "7d",        label: "Últimos 7 dias" },
  { key: "30d",       label: "Últimos 30 dias" },
  { key: "thismonth", label: "Este mês" },
  { key: "lastmonth", label: "Mês passado" },
  { key: "3m",        label: "3 meses" },
  { key: "6m",        label: "6 meses" },
  { key: "thisyear",  label: "Este ano" },
  { key: "lastyear",  label: "Ano passado" },
] as const;

function applyPreset(key: string): { from: string; to: string } {
  const now = new Date();
  const t = now.toISOString().split("T")[0];
  const d = (offset: number) => {
    const x = new Date(now); x.setDate(x.getDate() - offset);
    return x.toISOString().split("T")[0];
  };
  const m = (monthsBack: number) =>
    new Date(now.getFullYear(), now.getMonth() - monthsBack, 1).toISOString().split("T")[0];

  switch (key) {
    case "today":     return { from: t, to: t };
    case "yesterday": { const y = d(1); return { from: y, to: y }; }
    case "7d":        return { from: d(6), to: t };
    case "30d":       return { from: d(29), to: t };
    case "thismonth": return { from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0], to: t };
    case "lastmonth": {
      const lmStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lmEnd   = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: lmStart.toISOString().split("T")[0], to: lmEnd.toISOString().split("T")[0] };
    }
    case "3m":        return { from: m(2), to: t };
    case "6m":        return { from: m(5), to: t };
    case "thisyear":  return { from: `${now.getFullYear()}-01-01`, to: t };
    case "lastyear":  return { from: `${now.getFullYear() - 1}-01-01`, to: `${now.getFullYear() - 1}-12-31` };
    default:          return { from: firstOfMonth(), to: t };
  }
}

// ─── Date range picker (compact dropdown) ─────────────────────────────────────

function fmtDateShort(iso: string) {
  const [, mm, dd] = iso.split("-");
  return `${dd}/${mm}`;
}

function DateRangePicker({
  dateFrom, dateTo, activePreset,
  onPreset, onFromChange, onToChange,
}: {
  dateFrom: string; dateTo: string; activePreset: string | null;
  onPreset: (k: string) => void;
  onFromChange: (v: string) => void;
  onToChange:   (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const label = activePreset
    ? PRESETS.find(p => p.key === activePreset)?.label ?? `${fmtDateShort(dateFrom)} → ${fmtDateShort(dateTo)}`
    : dateFrom === dateTo
      ? fmtDateShort(dateFrom)
      : `${fmtDateShort(dateFrom)} → ${fmtDateShort(dateTo)}`;

  const dateCls2 = "bg-[#111111] border border-[#333] rounded-lg px-2 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-violet-500 [color-scheme:dark] flex-1";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-[#1a1a1a] border border-[#262626] hover:border-violet-500/40 rounded-xl px-3 py-2 text-sm text-gray-300 transition-all"
      >
        <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="font-medium">{label}</span>
        <svg className={`w-3.5 h-3.5 text-gray-600 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-11 w-64 bg-[#1a1a1a] border border-[#262626] rounded-2xl shadow-2xl shadow-black/60 z-50 overflow-hidden">
          {/* Presets list */}
          <div className="p-2">
            {PRESETS.map(p => (
              <button
                key={p.key}
                onClick={() => { onPreset(p.key); setOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                  activePreset === p.key
                    ? "bg-violet-600/20 text-violet-300 font-semibold"
                    : "text-gray-400 hover:bg-[#262626] hover:text-gray-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom range */}
          <div className="border-t border-[#262626] px-3 py-3 space-y-2">
            <p className="text-[11px] text-gray-600 font-semibold uppercase tracking-wider">Personalizado</p>
            <div className="flex items-center gap-2">
              <input type="date" value={dateFrom} max={dateTo}
                onChange={e => { onFromChange(e.target.value); }}
                className={dateCls2}
              />
              <span className="text-gray-600 text-xs">→</span>
              <input type="date" value={dateTo} min={dateFrom}
                onChange={e => { onToChange(e.target.value); }}
                className={dateCls2}
              />
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-full py-1.5 rounded-lg text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmtR(v: number | null | undefined) {
  if (v == null) return "—";
  return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}
function fmtN(v: number | null | undefined) {
  return v == null || v === 0 ? "—" : v.toLocaleString("pt-BR");
}
function fmtPct(v: number | null | undefined) {
  return v == null ? "—" : `${v.toFixed(2)}%`;
}

// ─── Aggregation ─────────────────────────────────────────────────────────────

function aggregateEntries(entries: MetricEntry[], platform: string, from: string, to: string): AggEntry | null {
  const inRange = entries.filter(e => e.platform === platform && e.date >= from && e.date <= to);
  if (inRange.length === 0) return null;
  const sumD = (k: keyof MetricEntry) => inRange.reduce((a, e) => a + Number(e[k] ?? 0), 0);
  const sumN = (k: keyof MetricEntry) => inRange.reduce((a, e) => a + ((e[k] as number) ?? 0), 0);
  const spend = sumD("spend"); const impressions = sumN("impressions");
  const reach = sumN("reach"); const linkClicks = sumN("linkClicks");
  const leadsFromAds = sumN("leadsFromAds"); const conversations = sumN("conversations");
  const leadsScheduled = sumN("leadsScheduled");
  const revenue = sumD("revenue"); const budget = sumD("budget");
  return {
    spend, impressions, reach, linkClicks, leadsFromAds, conversations, leadsScheduled, revenue, budget,
    cpm: impressions > 0 ? (spend / impressions) * 1000 : null,
    cpc: linkClicks > 0 ? spend / linkClicks : null,
    ctr: impressions > 0 ? (linkClicks / impressions) * 100 : null,
    costPerResult: leadsFromAds > 0 ? spend / leadsFromAds : null,
    syncedAt: inRange.reduce<Date | null>((l, e) => !e.syncedAt ? l : !l || e.syncedAt > l ? e.syncedAt : l, null),
    count: inRange.length,
  };
}

// ─── Cell renderer ────────────────────────────────────────────────────────────

function Cell({ agg, col }: { agg: AggEntry | null; col: ColKey }) {
  if (!agg) return <span className="text-gray-700">—</span>;
  switch (col) {
    case "reach":         return <span className="text-gray-300">{fmtN(agg.reach)}</span>;
    case "impressions":   return <span className="text-gray-300">{fmtN(agg.impressions)}</span>;
    case "cpm":           return <span className="text-gray-300">{fmtR(agg.cpm)}</span>;
    case "budget":        return <span className="text-amber-300">{fmtR(agg.budget || null)}</span>;
    case "spend":         return <span className="text-amber-400 font-medium">{fmtR(agg.spend || null)}</span>;
    case "linkClicks":    return <span className="text-blue-300">{fmtN(agg.linkClicks)}</span>;
    case "cpc":           return <span className="text-gray-300">{fmtR(agg.cpc)}</span>;
    case "ctr":           return <span className="text-gray-300">{fmtPct(agg.ctr)}</span>;
    case "costPerResult": return <span className="text-gray-300">{fmtR(agg.costPerResult)}</span>;
    case "leadsFromAds":  return <span className="text-gray-300">{fmtN(agg.leadsFromAds)}</span>;
    case "conversations": return <span className="text-blue-300 font-medium">{fmtN(agg.conversations)}</span>;
    case "leadsScheduled":return <span className="text-violet-400 font-medium">{agg.leadsScheduled || "—"}</span>;
    case "revenue":       return <span className="text-emerald-400 font-medium">{fmtR(agg.revenue || null)}</span>;
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

export function MetaMetricsTable({ clients, allClients }: Props) {
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

  function handleColChange(cols: ColKey[]) {
    setVisibleCols(cols); localStorage.setItem(LS_KEY, JSON.stringify(cols));
  }
  function handlePreset(key: string) {
    const { from, to } = applyPreset(key);
    setDateFrom(from); setDateTo(to); setActivePreset(key);
  }
  function handleFromChange(v: string) {
    setDateFrom(v); setActivePreset(null);
    if (v > dateTo) setDateTo(v);
  }
  function handleToChange(v: string) {
    setDateTo(v); setActivePreset(null);
    if (v < dateFrom) setDateFrom(v);
  }

  const periodFrom  = dateToPeriod(dateFrom);
  const periodTo    = dateToPeriod(dateTo);
  const numMonths   = monthsBetween(periodFrom, periodTo);

  const filteredClients = clients.filter(c => selectedClientId === "all" || c.id === selectedClientId);
  const cols = ALL_COLUMNS.filter(c => visibleCols.includes(c.key));

  // Totals (current period)
  const totals: AggEntry = { spend: 0, impressions: 0, reach: 0, linkClicks: 0, leadsFromAds: 0, conversations: 0, leadsScheduled: 0, revenue: 0, budget: 0, cpm: null, cpc: null, ctr: null, costPerResult: null, syncedAt: null, count: 0 };
  filteredClients.forEach(c => {
    const a = aggregateEntries(c.metricEntries, "meta", dateFrom, dateTo);
    if (!a) return;
    totals.spend += a.spend; totals.impressions += a.impressions; totals.reach += a.reach;
    totals.linkClicks += a.linkClicks; totals.leadsFromAds += a.leadsFromAds;
    totals.conversations += a.conversations;
    totals.leadsScheduled += a.leadsScheduled; totals.revenue += a.revenue; totals.budget += a.budget;
    totals.count += a.count;
  });
  if (totals.impressions > 0) { totals.cpm = (totals.spend / totals.impressions) * 1000; totals.ctr = (totals.linkClicks / totals.impressions) * 100; }
  if (totals.linkClicks > 0) totals.cpc = totals.spend / totals.linkClicks;
  if (totals.leadsFromAds > 0) totals.costPerResult = totals.spend / totals.leadsFromAds;

  // Previous period (same duration immediately before dateFrom)
  const daysInRange = Math.round((new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / 86400000) + 1;
  const prevTo   = new Date(new Date(dateFrom).getTime() - 86400000).toISOString().split("T")[0];
  const prevFrom = new Date(new Date(dateFrom).getTime() - daysInRange * 86400000).toISOString().split("T")[0];
  const prevTotals: AggEntry = { spend: 0, impressions: 0, reach: 0, linkClicks: 0, leadsFromAds: 0, conversations: 0, leadsScheduled: 0, revenue: 0, budget: 0, cpm: null, cpc: null, ctr: null, costPerResult: null, syncedAt: null, count: 0 };
  filteredClients.forEach(c => {
    const a = aggregateEntries(c.metricEntries, "meta", prevFrom, prevTo);
    if (!a) return;
    prevTotals.spend += a.spend; prevTotals.conversations += a.conversations;
    prevTotals.leadsFromAds += a.leadsFromAds; prevTotals.count += a.count;
  });
  function pctChange(curr: number, prev: number) {
    if (prev === 0) return null;
    return ((curr - prev) / prev) * 100;
  }

  // Daily trend data for chart (single client only)
  const trendEntries = selectedClientId !== "all" && filteredClients.length === 1
    ? filteredClients[0].metricEntries.filter(e =>
        e.platform === "meta" && e.date >= dateFrom && e.date <= dateTo
      ).sort((a, b) => a.date.localeCompare(b.date))
    : [];
  const hasTrend = trendEntries.some(e => (e.conversations ?? 0) > 0);

  return (
    <div className="space-y-5">
      {/* Controls bar */}
      <div className="flex items-start gap-3 flex-wrap">
        {/* Platform badge */}
        <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#262626] rounded-xl px-3 py-2">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="text-sm font-semibold text-blue-400">Meta Ads</span>
          <span className="text-xs text-gray-600 ml-1">{clients.length} cliente{clients.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Client selector */}
        <select value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} className={`${selectCls} min-w-[180px]`}>
          <option value="all">Todos os clientes</option>
          {allClients.map(c => {
            const has = clients.some(mc => mc.id === c.id);
            return <option key={c.id} value={c.id} disabled={!has}>{c.name}{!has ? " (sem credencial)" : ""}</option>;
          })}
        </select>

        {/* Date range picker */}
        <DateRangePicker
          dateFrom={dateFrom}
          dateTo={dateTo}
          activePreset={activePreset}
          onPreset={handlePreset}
          onFromChange={handleFromChange}
          onToChange={handleToChange}
        />

        {/* Column filter */}
        <div className="ml-auto mt-0.5">
          <ColumnFilter selected={visibleCols} onChange={handleColChange} />
        </div>
      </div>

      {/* Table */}
      {filteredClients.length === 0 ? (
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-12 text-center">
          <p className="text-sm text-gray-600">Nenhum cliente com credenciais Meta Ads configuradas.</p>
        </div>
      ) : (
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#262626] bg-[#111111]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky left-0 bg-[#111111] z-10">Cliente</th>
                  {cols.map(col => <th key={col.key} className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{col.label}</th>)}
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]">
                {filteredClients.map(client => {
                  const agg = aggregateEntries(client.metricEntries, "meta", dateFrom, dateTo);
                  return (
                    <tr key={client.id} className="hover:bg-[#222222] transition-colors">
                      <td className="px-4 py-3 sticky left-0 bg-[#1a1a1a] hover:bg-[#222222] z-10">
                        <p className="text-white font-medium whitespace-nowrap">{client.name}</p>
                        {agg?.syncedAt ? <p className="text-xs text-gray-600">Sync: {new Date(agg.syncedAt).toLocaleDateString("pt-BR")}</p> : <p className="text-xs text-gray-700">{agg ? "Não sincronizado" : "Sem dados"}</p>}
                      </td>
                      {cols.map(col => <td key={col.key} className="px-4 py-3 text-right whitespace-nowrap"><Cell agg={agg} col={col.key} /></td>)}
                      <td className="px-3 py-3"><SyncButton clientId={client.id} platform="meta" dateFrom={dateFrom} dateTo={dateTo} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          {totals.count > 0 && (
            <div className="border-t border-[#262626] bg-[#111111] px-4 py-3 flex items-center gap-6 flex-wrap text-sm">
              {visibleCols.includes("spend") && (() => {
                const chg = pctChange(totals.spend, prevTotals.spend);
                return <div><p className="text-xs text-gray-600">Valor Usado</p><p className="font-bold text-amber-400">{fmtR(totals.spend)}</p>{chg !== null && <p className={`text-[10px] font-semibold ${chg >= 0 ? "text-red-400" : "text-emerald-400"}`}>{chg >= 0 ? "▲" : "▼"} {Math.abs(chg).toFixed(0)}% vs anterior</p>}</div>;
              })()}
              {visibleCols.includes("budget")        && <div><p className="text-xs text-gray-600">Orçamento</p><p className="font-bold text-amber-300">{fmtR(totals.budget)}</p></div>}
              {visibleCols.includes("impressions")   && <div><p className="text-xs text-gray-600">Impressões</p><p className="font-bold text-gray-300">{totals.impressions.toLocaleString("pt-BR")}</p></div>}
              {visibleCols.includes("reach")         && <div><p className="text-xs text-gray-600">Alcance</p><p className="font-bold text-gray-300">{totals.reach.toLocaleString("pt-BR")}</p></div>}
              {visibleCols.includes("linkClicks")    && <div><p className="text-xs text-gray-600">Cliques</p><p className="font-bold text-blue-300">{totals.linkClicks.toLocaleString("pt-BR")}</p></div>}
              {visibleCols.includes("cpm")           && <div><p className="text-xs text-gray-600">CPM Médio</p><p className="font-bold text-gray-300">{fmtR(totals.cpm)}</p></div>}
              {visibleCols.includes("cpc")           && <div><p className="text-xs text-gray-600">CPC Médio</p><p className="font-bold text-gray-300">{fmtR(totals.cpc)}</p></div>}
              {visibleCols.includes("ctr")           && <div><p className="text-xs text-gray-600">CTR Médio</p><p className="font-bold text-gray-300">{fmtPct(totals.ctr)}</p></div>}
              {visibleCols.includes("leadsFromAds") && (() => {
                const chg = pctChange(totals.leadsFromAds, prevTotals.leadsFromAds);
                return <div><p className="text-xs text-gray-600">Leads (ads)</p><p className="font-bold text-gray-300">{totals.leadsFromAds.toLocaleString("pt-BR")}</p>{chg !== null && <p className={`text-[10px] font-semibold ${chg >= 0 ? "text-emerald-400" : "text-red-400"}`}>{chg >= 0 ? "▲" : "▼"} {Math.abs(chg).toFixed(0)}%</p>}</div>;
              })()}
              {visibleCols.includes("conversations") && (() => {
                const chg = pctChange(totals.conversations, prevTotals.conversations);
                return <div><p className="text-xs text-gray-600">Conversas</p><p className="font-bold text-blue-300">{totals.conversations.toLocaleString("pt-BR")}</p>{chg !== null && <p className={`text-[10px] font-semibold ${chg >= 0 ? "text-emerald-400" : "text-red-400"}`}>{chg >= 0 ? "▲" : "▼"} {Math.abs(chg).toFixed(0)}%</p>}</div>;
              })()}
              {visibleCols.includes("leadsScheduled")&& <div><p className="text-xs text-gray-600">Leads Agendados</p><p className="font-bold text-violet-400">{totals.leadsScheduled.toLocaleString("pt-BR")}</p></div>}
              {visibleCols.includes("revenue")       && <div><p className="text-xs text-gray-600">Faturamento</p><p className="font-bold text-emerald-400">{fmtR(totals.revenue)}</p></div>}
              {visibleCols.includes("roi") && (() => {
                const roi = totals.spend > 0 ? ((totals.revenue - totals.spend) / totals.spend) * 100 : null;
                return <div><p className="text-xs text-gray-600">ROI</p><p className={`font-bold ${roi == null ? "text-gray-600" : roi >= 0 ? "text-emerald-400" : "text-red-400"}`}>{roi == null ? "—" : `${roi >= 0 ? "+" : ""}${roi.toFixed(0)}%`}</p></div>;
              })()}
            </div>
          )}
        </div>
      )}

      {/* Daily trend chart */}
      {hasTrend && (() => {
        type Bucket = { label: string; date: string; conversations: number; spend: number };
        let buckets: Bucket[];

        if (trendEntries.length > 45) {
          const weekMap = new Map<string, Bucket>();
          trendEntries.forEach(e => {
            const d = new Date(e.date);
            const ws = new Date(d); ws.setDate(d.getDate() - d.getDay());
            const key = ws.toISOString().split("T")[0];
            const [, mm, dd] = key.split("-");
            const ex = weekMap.get(key);
            if (!ex) weekMap.set(key, { label: `${dd}/${mm}`, date: key, conversations: e.conversations ?? 0, spend: Number(e.spend ?? 0) });
            else { ex.conversations += e.conversations ?? 0; ex.spend += Number(e.spend ?? 0); }
          });
          buckets = Array.from(weekMap.values());
        } else {
          buckets = trendEntries.map(e => {
            const [, mm, dd] = e.date.split("-");
            return { label: `${dd}/${mm}`, date: e.date, conversations: e.conversations ?? 0, spend: Number(e.spend ?? 0) };
          });
        }

        const maxConv  = Math.max(...buckets.map(b => b.conversations), 1);
        const maxSpend = Math.max(...buckets.map(b => b.spend), 1);
        const totalConv  = buckets.reduce((s, b) => s + b.conversations, 0);
        const totalSpend = buckets.reduce((s, b) => s + b.spend, 0);
        const CHART_H = 260;

        return (
          <div className="bg-[#141414] border border-[#1e1e1e] rounded-2xl overflow-hidden">
            {/* Top summary strip */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e1e]">
              <div>
                <p className="text-base font-bold text-white">Evolução Diária</p>
                <p className="text-xs text-gray-600 mt-0.5 capitalize">
                  {new Date(dateFrom + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} →{" "}
                  {new Date(dateTo + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  {trendEntries.length > 45 && <span className="ml-2 text-gray-700">· agrupado por semana</span>}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] text-gray-600 uppercase tracking-wider">Conversas</p>
                  <p className="text-lg font-bold text-blue-400">{totalConv.toLocaleString("pt-BR")}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-600 uppercase tracking-wider">Investimento</p>
                  <p className="text-lg font-bold text-amber-400">R$ {totalSpend.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</p>
                </div>
              </div>
            </div>

            {/* Chart area */}
            <div className="px-6 pt-5 pb-4">
              {/* Grid lines + bars */}
              <div className="relative" style={{ height: CHART_H }}>
                {/* Horizontal grid lines */}
                {[0, 1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="absolute left-0 right-0 border-t border-[#1e1e1e]"
                    style={{ bottom: `${(i / 4) * 100}%` }}
                  />
                ))}

                {/* Bars */}
                <div className="absolute inset-0 flex items-end gap-px">
                  {buckets.map((b, i) => {
                    const convPct  = (b.conversations / maxConv)  * 100;
                    const spendPct = (b.spend         / maxSpend) * 100;
                    return (
                      <div
                        key={i}
                        className="flex-1 flex items-end gap-px group relative"
                        style={{ height: "100%" }}
                      >
                        {/* Hover tooltip */}
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-20 pointer-events-none">
                          <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-3 py-2 shadow-xl whitespace-nowrap">
                            <p className="text-[10px] text-gray-500 mb-1">{b.label}</p>
                            <p className="text-xs font-bold text-blue-400">{b.conversations} conversas</p>
                            <p className="text-xs text-amber-400/80">R$ {b.spend.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</p>
                          </div>
                        </div>

                        {/* Conversation bar */}
                        <div
                          className="flex-1 rounded-t bg-blue-500/25 group-hover:bg-blue-500/40 transition-colors relative overflow-hidden"
                          style={{ height: `${Math.max(convPct, b.conversations > 0 ? 1 : 0)}%` }}
                        >
                          <div className="absolute inset-x-0 top-0 h-0.5 bg-blue-400/60" />
                        </div>

                        {/* Spend bar */}
                        <div
                          className="flex-1 rounded-t bg-amber-500/20 group-hover:bg-amber-500/35 transition-colors relative overflow-hidden"
                          style={{ height: `${Math.max(spendPct, b.spend > 0 ? 1 : 0)}%` }}
                        >
                          <div className="absolute inset-x-0 top-0 h-0.5 bg-amber-400/50" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* X-axis labels — show at most ~12 evenly spaced */}
              {(() => {
                const step = buckets.length <= 12 ? 1 : Math.ceil(buckets.length / 12);
                return (
                  <div className="flex items-center mt-3">
                    {buckets.map((b, i) => (
                      <div key={i} className="flex-1 text-center">
                        {i % step === 0 && (
                          <span className="text-[10px] text-gray-700">{b.label}</span>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-5 px-6 pb-4 text-xs text-gray-600">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-blue-500/40 border-t border-blue-400/60 inline-block" />
                Conversas WhatsApp
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-amber-500/30 border-t border-amber-400/50 inline-block" />
                Investimento
              </span>
            </div>
          </div>
        );
      })()}

      {/* Campaign insights — only when a single client is selected */}
      {selectedClientId !== "all" && (() => {
        const client = filteredClients.find(c => c.id === selectedClientId);
        return client ? (
          <CampaignInsights
            clientId={client.id}
            clientName={client.name}
            dateFrom={dateFrom}
            dateTo={dateTo}
          />
        ) : null;
      })()}
    </div>
  );
}
