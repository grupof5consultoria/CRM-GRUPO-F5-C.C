"use client";

import { useState, useActionState } from "react";
import { savePortalMetricsAction } from "./actions";

type Platform = "meta" | "google";

interface Entry {
  platform: string;
  date: string;
  leadsScheduled: number | null;
  revenue: { toString(): string } | null;
  spend: { toString(): string } | null;
  leadsFromAds: number | null;
}

interface Props {
  entries: Entry[];
  periods: string[];
  currentPeriod: string;
  hasMeta: boolean;
  dateFrom?: string;
  dateTo?: string;
  hasGoogle: boolean;
}

function fmt(v: { toString(): string } | null | undefined) {
  if (!v) return null;
  return `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

export function MetricsForm({ entries, periods, currentPeriod, hasMeta, hasGoogle, dateFrom, dateTo }: Props) {
  const [tab, setTab] = useState<Platform>(hasMeta ? "meta" : "google");
  const [period, setPeriod] = useState(currentPeriod);
  const [state, action, pending] = useActionState(savePortalMetricsAction, {});

  // Daily entries: find the manual summary stored at "YYYY-MM-01", or aggregate spend/leadsFromAds
  const periodEntries = entries.filter((e) => e.platform === tab && e.date.startsWith(period));
  const manualEntry = periodEntries.find((e) => e.leadsScheduled != null || e.revenue != null);
  const aggSpend = periodEntries.reduce((s, e) => s + Number(e.spend ?? 0), 0);
  const aggLeads = periodEntries.reduce((s, e) => s + (e.leadsFromAds ?? 0), 0);
  const entry = periodEntries.length > 0
    ? {
        spend: aggSpend > 0 ? { toString: () => String(aggSpend) } : null,
        leadsFromAds: aggLeads > 0 ? aggLeads : null,
        leadsScheduled: manualEntry?.leadsScheduled ?? null,
        revenue: manualEntry?.revenue ?? null,
      }
    : undefined;

  const platformLabel = tab === "meta" ? "Meta Ads" : "Google Ads";
  const platformColor = tab === "meta" ? "text-blue-400" : "text-red-400";

  return (
    <div className="space-y-5">
      {/* Platform tabs */}
      {hasMeta && hasGoogle && (
        <div className="flex gap-1 bg-[#1a1a1a] border border-[#262626] rounded-xl p-1">
          {(["meta", "google"] as Platform[]).filter((p) => (p === "meta" ? hasMeta : hasGoogle)).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setTab(p)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === p ? "bg-[#262626] text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {p === "meta" ? "Meta Ads" : "Google Ads"}
            </button>
          ))}
        </div>
      )}

      {/* Period */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Período</label>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="w-full bg-[#111111] border border-[#333333] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
        >
          {periods.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Read-only data from API */}
      {(entry?.spend || entry?.leadsFromAds) && (
        <div className="bg-[#111111] rounded-xl border border-[#262626] p-4 space-y-2">
          <p className={`text-xs font-semibold uppercase tracking-wider ${platformColor}`}>{platformLabel} — Dados da Plataforma</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {entry.spend && (
              <div>
                <p className="text-xs text-gray-600">Investimento</p>
                <p className="font-semibold text-amber-400">{fmt(entry.spend)}</p>
              </div>
            )}
            {entry.leadsFromAds != null && (
              <div>
                <p className="text-xs text-gray-600">Leads (plataforma)</p>
                <p className="font-semibold text-gray-300">{entry.leadsFromAds}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual input form */}
      <form action={action} className="space-y-4">
        <input type="hidden" name="platform" value={tab} />
        <input type="hidden" name="period" value={period} />

        <div>
          <label className="text-xs text-gray-500 mb-1 block">
            Leads Agendados
            <span className="text-gray-700 ml-1">(preenchido por você)</span>
          </label>
          <input
            name="leadsScheduled"
            type="number"
            min="0"
            defaultValue={entry?.leadsScheduled ?? ""}
            placeholder="0"
            className="w-full bg-[#111111] border border-[#333333] rounded-xl px-3 py-3 text-lg font-semibold text-violet-400 placeholder-gray-700 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">
            Valor Faturado (R$)
            <span className="text-gray-700 ml-1">(preenchido por você)</span>
          </label>
          <input
            name="revenue"
            type="number"
            min="0"
            step="0.01"
            defaultValue={entry?.revenue != null ? Number(entry.revenue).toFixed(2) : ""}
            placeholder="0,00"
            className="w-full bg-[#111111] border border-[#333333] rounded-xl px-3 py-3 text-lg font-semibold text-emerald-400 placeholder-gray-700 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        {state.error && <p className="text-sm text-red-400 bg-red-500/10 rounded-xl px-3 py-2">{state.error}</p>}
        {state.success && <p className="text-sm text-emerald-400 bg-emerald-500/10 rounded-xl px-3 py-2">Dados salvos com sucesso!</p>}

        <button
          type="submit"
          disabled={pending}
          className="relative w-full py-3.5 rounded-xl text-base font-semibold text-white overflow-hidden transition-all disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 40%, #5b21b6 100%)" }}
        >
          <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%)" }} />
          <span className="relative">{pending ? "Salvando..." : "Salvar Dados"}</span>
        </button>
      </form>
    </div>
  );
}
