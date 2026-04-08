"use client";

import { useState } from "react";
import { SyncButton } from "./SyncButton";

type Platform = "meta" | "google";

interface MetricEntry {
  platform: string;
  period: string;
  spend: { toString(): string } | null;
  impressions: number | null;
  clicks: number | null;
  leadsFromAds: number | null;
  leadsScheduled: number | null;
  revenue: { toString(): string } | null;
  syncedAt: Date | null;
}

interface Client {
  id: string;
  name: string;
  metaAdAccountId: string | null;
  googleAdsCustomerId: string | null;
  metricEntries: MetricEntry[];
}

interface Props {
  clients: Client[];
  currentPeriod: string;
  periods: string[];
}

function fmt(value: { toString(): string } | null | undefined) {
  if (value == null) return "—";
  return `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

function num(v: number | null | undefined) {
  if (v == null) return "—";
  return v.toLocaleString("pt-BR");
}

function roi(spend: { toString(): string } | null, revenue: { toString(): string } | null) {
  const s = Number(spend ?? 0);
  const r = Number(revenue ?? 0);
  if (!s) return "—";
  const pct = ((r - s) / s) * 100;
  const color = pct >= 0 ? "text-emerald-400" : "text-red-400";
  return <span className={color}>{pct >= 0 ? "+" : ""}{pct.toFixed(0)}%</span>;
}

export function MetricsTabs({ clients, currentPeriod, periods }: Props) {
  const [tab, setTab] = useState<Platform>("meta");
  const [period, setPeriod] = useState(currentPeriod);

  const platformClients = clients.filter((c) =>
    tab === "meta" ? c.metaAdAccountId : c.googleAdsCustomerId
  );

  const tabConfig = {
    meta: { label: "Meta Ads", color: "text-blue-400", bg: "bg-blue-500", icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z" />
      </svg>
    )},
    google: { label: "Google Ads", color: "text-red-400", bg: "bg-red-500", icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
      </svg>
    )},
  };

  return (
    <div className="space-y-6">
      {/* Tabs + period */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-1 bg-[#1a1a1a] border border-[#262626] rounded-xl p-1">
          {(["meta", "google"] as Platform[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t
                  ? "bg-[#262626] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <span className={tab === t ? tabConfig[t].color : ""}>{tabConfig[t].icon}</span>
              {tabConfig[t].label}
            </button>
          ))}
        </div>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="bg-[#1a1a1a] border border-[#262626] rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-violet-500"
        >
          {periods.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {platformClients.length === 0 ? (
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-12 text-center">
          <p className="text-sm text-gray-600">
            Nenhum cliente com credenciais de {tabConfig[tab].label} configuradas.
          </p>
          <p className="text-xs text-gray-700 mt-1">
            Configure as credenciais na ficha de cada cliente.
          </p>
        </div>
      ) : (
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#262626] bg-[#111111]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Investimento</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Impressões</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliques</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Leads (ads)</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Leads Agendados</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Faturamento</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ROI</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]">
                {platformClients.map((client) => {
                  const entry = client.metricEntries.find(
                    (e) => e.platform === tab && e.period === period
                  );
                  return (
                    <tr key={client.id} className="hover:bg-[#222222] transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-white font-medium">{client.name}</p>
                          {entry?.syncedAt && (
                            <p className="text-xs text-gray-600 mt-0.5">
                              Sync: {new Date(entry.syncedAt).toLocaleDateString("pt-BR")}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={entry?.spend ? "text-amber-400 font-medium" : "text-gray-600"}>
                          {fmt(entry?.spend)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-400">{num(entry?.impressions)}</td>
                      <td className="px-4 py-3 text-right text-gray-400">{num(entry?.clicks)}</td>
                      <td className="px-4 py-3 text-right text-gray-400">{num(entry?.leadsFromAds)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={entry?.leadsScheduled ? "text-violet-400 font-medium" : "text-gray-600"}>
                          {entry?.leadsScheduled ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={entry?.revenue ? "text-emerald-400 font-medium" : "text-gray-600"}>
                          {fmt(entry?.revenue)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {roi(entry?.spend ?? null, entry?.revenue ?? null)}
                      </td>
                      <td className="px-4 py-3">
                        <SyncButton clientId={client.id} platform={tab} period={period} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals row */}
          {platformClients.some((c) => c.metricEntries.some((e) => e.platform === tab && e.period === period)) && (
            <div className="border-t border-[#262626] bg-[#111111] px-4 py-3 flex items-center gap-6 flex-wrap">
              {(() => {
                const entries = platformClients
                  .map((c) => c.metricEntries.find((e) => e.platform === tab && e.period === period))
                  .filter(Boolean) as MetricEntry[];
                const totalSpend = entries.reduce((s, e) => s + Number(e.spend ?? 0), 0);
                const totalRevenue = entries.reduce((s, e) => s + Number(e.revenue ?? 0), 0);
                const totalLeadsAds = entries.reduce((s, e) => s + (e.leadsFromAds ?? 0), 0);
                const totalLeadsSched = entries.reduce((s, e) => s + (e.leadsScheduled ?? 0), 0);
                const totalRoi = totalSpend ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;
                return (
                  <>
                    <div><p className="text-xs text-gray-600">Total Investido</p><p className="text-sm font-bold text-amber-400">R$ {totalSpend.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p></div>
                    <div><p className="text-xs text-gray-600">Total Faturado</p><p className="text-sm font-bold text-emerald-400">R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p></div>
                    <div><p className="text-xs text-gray-600">Leads (ads)</p><p className="text-sm font-bold text-gray-300">{totalLeadsAds.toLocaleString("pt-BR")}</p></div>
                    <div><p className="text-xs text-gray-600">Leads Agendados</p><p className="text-sm font-bold text-violet-400">{totalLeadsSched.toLocaleString("pt-BR")}</p></div>
                    <div><p className="text-xs text-gray-600">ROI Médio</p><p className={`text-sm font-bold ${totalRoi >= 0 ? "text-emerald-400" : "text-red-400"}`}>{totalRoi >= 0 ? "+" : ""}{totalRoi.toFixed(0)}%</p></div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
