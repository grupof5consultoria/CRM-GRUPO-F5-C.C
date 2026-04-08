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
  platform: string;
  period: string;
  spend: { toString(): string } | null;
  impressions: number | null;
  clicks: number | null;
  leadsFromAds: number | null;
  leadsScheduled: number | null;
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
  id: string;
  name: string;
  googleAdsCustomerId: string | null;
  metricEntries: MetricEntry[];
}

interface SimpleClient { id: string; name: string; }

interface Props {
  clients: Client[];
  allClients: SimpleClient[];
  currentPeriod: string;
  periods: string[];
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

function aggregateEntries(
  entries: MetricEntry[], platform: string, from: string, to: string
): AggEntry | null {
  const inRange = entries.filter(
    (e) => e.platform === platform && e.period >= from && e.period <= to
  );
  if (inRange.length === 0) return null;

  const sumD = (key: keyof MetricEntry) =>
    inRange.reduce((a, e) => a + Number(e[key] ?? 0), 0);
  const sumN = (key: keyof MetricEntry) =>
    inRange.reduce((a, e) => a + ((e[key] as number) ?? 0), 0);

  const spend = sumD("spend");
  const impressions = sumN("impressions");
  const clicks = sumN("clicks");
  const leadsFromAds = sumN("leadsFromAds");
  const leadsScheduled = sumN("leadsScheduled");
  const revenue = sumD("revenue");

  const cpc = clicks > 0 ? spend / clicks : null;
  const costPerResult = leadsFromAds > 0 ? spend / leadsFromAds : null;

  const syncedAt = inRange.reduce<Date | null>(
    (latest, e) =>
      !e.syncedAt ? latest : !latest || e.syncedAt > latest ? e.syncedAt : latest,
    null
  );

  return {
    spend, impressions, clicks, leadsFromAds, leadsScheduled,
    revenue, cpc, costPerResult, syncedAt, count: inRange.length,
  };
}

// ─── Cell renderer ────────────────────────────────────────────────────────────

function Cell({ agg, col }: { agg: AggEntry | null; col: ColKey }) {
  if (!agg) return <span className="text-gray-700">—</span>;
  const v = agg;
  switch (col) {
    case "impressions":    return <span className="text-gray-300">{fmtN(v.impressions)}</span>;
    case "clicks":         return <span className="text-blue-300">{fmtN(v.clicks)}</span>;
    case "cpc":            return <span className="text-gray-300">{fmtR(v.cpc)}</span>;
    case "leadsFromAds":   return <span className="text-gray-300">{fmtN(v.leadsFromAds)}</span>;
    case "costPerResult":  return <span className="text-gray-300">{fmtR(v.costPerResult)}</span>;
    case "spend":          return <span className={v.spend ? "text-amber-400 font-medium" : "text-gray-600"}>{fmtR(v.spend || null)}</span>;
    case "leadsScheduled": return <span className={v.leadsScheduled ? "text-violet-400 font-medium" : "text-gray-600"}>{v.leadsScheduled || "—"}</span>;
    case "revenue":        return <span className={v.revenue ? "text-emerald-400 font-medium" : "text-gray-600"}>{fmtR(v.revenue || null)}</span>;
    case "roi": {
      if (!v.spend) return <span className="text-gray-600">—</span>;
      const pct = ((v.revenue - v.spend) / v.spend) * 100;
      return <span className={`font-semibold ${pct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
        {pct >= 0 ? "+" : ""}{pct.toFixed(0)}%
      </span>;
    }
    default: return <span className="text-gray-700">—</span>;
  }
}

// ─── Column filter dropdown ───────────────────────────────────────────────────

function ColumnFilter({ selected, onChange }: { selected: ColKey[]; onChange: (cols: ColKey[]) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function toggle(key: ColKey) {
    const next = selected.includes(key)
      ? selected.filter((k) => k !== key)
      : [...selected, key];
    onChange(next);
  }

  const groups = [...new Set(ALL_COLUMNS.map((c) => c.group))];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-[#1a1a1a] border border-[#262626] hover:border-violet-500/40 rounded-xl px-3 py-2 text-sm text-gray-400 hover:text-gray-200 transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
        </svg>
        Colunas
        <span className="text-xs text-violet-400 font-semibold">{selected.length}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-72 bg-[#1a1a1a] border border-[#262626] rounded-2xl shadow-2xl shadow-black/60 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#262626]">
            <p className="text-sm font-semibold text-white">Selecionar Colunas</p>
            <div className="flex gap-2">
              <button onClick={() => onChange(ALL_COLUMNS.map((c) => c.key))} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">Todas</button>
              <span className="text-[#333]">|</span>
              <button onClick={() => onChange(DEFAULT_COLS)} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Padrão</button>
            </div>
          </div>
          <div className="p-3 space-y-3 max-h-80 overflow-y-auto">
            {groups.map((group) => (
              <div key={group}>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 px-1">{group}</p>
                <div className="space-y-0.5">
                  {ALL_COLUMNS.filter((c) => c.group === group).map((col) => {
                    const active = selected.includes(col.key);
                    return (
                      <button key={col.key} onClick={() => toggle(col.key)}
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
            <button onClick={() => setOpen(false)}
              className="relative w-full py-2 rounded-xl text-sm font-semibold text-white overflow-hidden"
              style={{ background: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 40%, #5b21b6 100%)" }}
            >
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

export function GoogleMetricsTable({ clients, allClients, currentPeriod, periods }: Props) {
  const [periodFrom, setPeriodFrom] = useState(currentPeriod);
  const [periodTo, setPeriodTo]     = useState(currentPeriod);
  const [selectedClientId, setSelectedClientId] = useState("all");
  const [visibleCols, setVisibleCols] = useState<ColKey[]>(DEFAULT_COLS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ColKey[];
        if (Array.isArray(parsed) && parsed.length > 0) setVisibleCols(parsed);
      }
    } catch {}
  }, []);

  function handleColChange(cols: ColKey[]) {
    setVisibleCols(cols);
    localStorage.setItem(LS_KEY, JSON.stringify(cols));
  }

  function handleFromChange(val: string) {
    setPeriodFrom(val);
    if (val > periodTo) setPeriodTo(val);
  }
  function handleToChange(val: string) {
    setPeriodTo(val);
    if (val < periodFrom) setPeriodFrom(val);
  }

  const isRange = periodFrom !== periodTo;
  const rangeCount = isRange
    ? periods.filter((p) => p >= periodFrom && p <= periodTo).length
    : null;

  const filteredClients = clients.filter(
    (c) => selectedClientId === "all" || c.id === selectedClientId
  );
  const cols = ALL_COLUMNS.filter((c) => visibleCols.includes(c.key));

  // Aggregate totals
  const totalsAgg: AggEntry = {
    spend: 0, impressions: 0, clicks: 0,
    leadsFromAds: 0, leadsScheduled: 0, revenue: 0,
    cpc: null, costPerResult: null, syncedAt: null, count: 0,
  };
  filteredClients.forEach((c) => {
    const a = aggregateEntries(c.metricEntries, "google", periodFrom, periodTo);
    if (!a) return;
    totalsAgg.spend += a.spend;
    totalsAgg.impressions += a.impressions;
    totalsAgg.clicks += a.clicks;
    totalsAgg.leadsFromAds += a.leadsFromAds;
    totalsAgg.leadsScheduled += a.leadsScheduled;
    totalsAgg.revenue += a.revenue;
    totalsAgg.count += a.count;
  });
  if (totalsAgg.clicks > 0) totalsAgg.cpc = totalsAgg.spend / totalsAgg.clicks;
  if (totalsAgg.leadsFromAds > 0) totalsAgg.costPerResult = totalsAgg.spend / totalsAgg.leadsFromAds;

  const hasTotals = totalsAgg.count > 0;

  const selectCls = "bg-[#1a1a1a] border border-[#262626] rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-violet-500";

  return (
    <div className="space-y-5">
      {/* Controls bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#262626] rounded-xl px-3 py-2">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-sm font-semibold text-red-400">Google Ads</span>
          <span className="text-xs text-gray-600 ml-1">{clients.length} cliente{clients.length !== 1 ? "s" : ""}</span>
        </div>

        <select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)} className={`${selectCls} min-w-[180px]`}>
          <option value="all">Todos os clientes</option>
          {allClients.map((c) => {
            const has = clients.some((gc) => gc.id === c.id);
            return <option key={c.id} value={c.id} disabled={!has}>{c.name}{!has ? " (sem credencial)" : ""}</option>;
          })}
        </select>

        {/* Date range */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 font-medium">De</span>
            <select value={periodFrom} onChange={(e) => handleFromChange(e.target.value)} className={selectCls}>
              {periods.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 font-medium">Até</span>
            <select value={periodTo} onChange={(e) => handleToChange(e.target.value)} className={selectCls}>
              {periods.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          {isRange && (
            <span className="text-xs bg-red-500/15 text-red-400 border border-red-500/20 rounded-lg px-2 py-1 font-medium">
              {rangeCount} meses
            </span>
          )}
        </div>

        <div className="ml-auto">
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky left-0 bg-[#111111] z-10">
                    Cliente
                  </th>
                  {cols.map((col) => (
                    <th key={col.key} className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {col.label}
                    </th>
                  ))}
                  {!isRange && <th className="px-3 py-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]">
                {filteredClients.map((client) => {
                  const agg = aggregateEntries(client.metricEntries, "google", periodFrom, periodTo);
                  return (
                    <tr key={client.id} className="hover:bg-[#222222] transition-colors">
                      <td className="px-4 py-3 sticky left-0 bg-[#1a1a1a] hover:bg-[#222222] z-10">
                        <p className="text-white font-medium whitespace-nowrap">{client.name}</p>
                        {agg?.syncedAt ? (
                          <p className="text-xs text-gray-600">Sync: {new Date(agg.syncedAt).toLocaleDateString("pt-BR")}</p>
                        ) : (
                          <p className="text-xs text-gray-700">{agg ? "Não sincronizado" : "Sem dados"}</p>
                        )}
                      </td>
                      {cols.map((col) => (
                        <td key={col.key} className="px-4 py-3 text-right whitespace-nowrap">
                          <Cell agg={agg} col={col.key} />
                        </td>
                      ))}
                      {!isRange && (
                        <td className="px-3 py-3">
                          <SyncButton clientId={client.id} platform="google" period={periodFrom} />
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          {hasTotals && (
            <div className="border-t border-[#262626] bg-[#111111] px-4 py-3 flex items-center gap-6 flex-wrap text-sm">
              {visibleCols.includes("impressions")    && <div><p className="text-xs text-gray-600">Impressões</p><p className="font-bold text-gray-300">{totalsAgg.impressions.toLocaleString("pt-BR")}</p></div>}
              {visibleCols.includes("clicks")         && <div><p className="text-xs text-gray-600">Cliques</p><p className="font-bold text-blue-300">{totalsAgg.clicks.toLocaleString("pt-BR")}</p></div>}
              {visibleCols.includes("cpc")            && <div><p className="text-xs text-gray-600">CPC Médio</p><p className="font-bold text-gray-300">{fmtR(totalsAgg.cpc)}</p></div>}
              {visibleCols.includes("leadsFromAds")   && <div><p className="text-xs text-gray-600">Conversões</p><p className="font-bold text-gray-300">{totalsAgg.leadsFromAds.toLocaleString("pt-BR")}</p></div>}
              {visibleCols.includes("costPerResult")  && <div><p className="text-xs text-gray-600">Custo/Conversão</p><p className="font-bold text-gray-300">{fmtR(totalsAgg.costPerResult)}</p></div>}
              {visibleCols.includes("spend")          && <div><p className="text-xs text-gray-600">Investimento</p><p className="font-bold text-amber-400">{fmtR(totalsAgg.spend)}</p></div>}
              {visibleCols.includes("leadsScheduled") && <div><p className="text-xs text-gray-600">Leads Agendados</p><p className="font-bold text-violet-400">{totalsAgg.leadsScheduled.toLocaleString("pt-BR")}</p></div>}
              {visibleCols.includes("revenue")        && <div><p className="text-xs text-gray-600">Faturamento</p><p className="font-bold text-emerald-400">{fmtR(totalsAgg.revenue)}</p></div>}
              {visibleCols.includes("roi")            && (() => {
                const roi = totalsAgg.spend > 0 ? ((totalsAgg.revenue - totalsAgg.spend) / totalsAgg.spend) * 100 : null;
                return <div><p className="text-xs text-gray-600">ROI</p><p className={`font-bold ${roi == null ? "text-gray-600" : roi >= 0 ? "text-emerald-400" : "text-red-400"}`}>{roi == null ? "—" : `${roi >= 0 ? "+" : ""}${roi.toFixed(0)}%`}</p></div>;
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
