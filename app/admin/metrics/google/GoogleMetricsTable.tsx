"use client";

import { useState } from "react";
import { SyncButton } from "../SyncButton";

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

function fmtR(v: { toString(): string } | null | undefined) {
  if (v == null) return "—";
  return `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}
function fmtN(v: number | null | undefined) {
  return v == null ? "—" : v.toLocaleString("pt-BR");
}

export function GoogleMetricsTable({ clients, allClients, currentPeriod, periods }: Props) {
  const [period, setPeriod] = useState(currentPeriod);
  const [selectedClientId, setSelectedClientId] = useState("all");

  const filteredClients = clients.filter((c) =>
    selectedClientId === "all" || c.id === selectedClientId
  );

  return (
    <div className="space-y-5">
      {/* Controls bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Google badge */}
        <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#262626] rounded-xl px-3 py-2">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-sm font-semibold text-red-400">Google Ads</span>
          <span className="text-xs text-gray-600 ml-1">{clients.length} cliente{clients.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Client selector */}
        <select
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
          className="bg-[#1a1a1a] border border-[#262626] rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-violet-500 min-w-[180px]"
        >
          <option value="all">Todos os clientes</option>
          {allClients.map((c) => {
            const hasCredential = clients.some((gc) => gc.id === c.id);
            return (
              <option key={c.id} value={c.id} disabled={!hasCredential}>
                {c.name}{!hasCredential ? " (sem credencial)" : ""}
              </option>
            );
          })}
        </select>

        {/* Period selector */}
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
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Impressões</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Cliques</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Custo por Clique</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Conversões</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Custo por Conversão</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Investimento</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Leads Agendados</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Faturamento</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">ROI</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]">
                {filteredClients.map((client) => {
                  const entry = client.metricEntries.find(
                    (e) => e.platform === "google" && e.period === period
                  );
                  const s = Number(entry?.spend ?? 0);
                  const r = Number(entry?.revenue ?? 0);
                  const roi = s ? ((r - s) / s) * 100 : null;

                  return (
                    <tr key={client.id} className="hover:bg-[#222222] transition-colors">
                      <td className="px-4 py-3 sticky left-0 bg-[#1a1a1a] hover:bg-[#222222] z-10">
                        <p className="text-white font-medium whitespace-nowrap">{client.name}</p>
                        {entry?.syncedAt ? (
                          <p className="text-xs text-gray-600">Sync: {new Date(entry.syncedAt).toLocaleDateString("pt-BR")}</p>
                        ) : (
                          <p className="text-xs text-gray-700">Não sincronizado</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-300 whitespace-nowrap">{fmtN(entry?.impressions)}</td>
                      <td className="px-4 py-3 text-right text-blue-300 whitespace-nowrap">{fmtN(entry?.clicks)}</td>
                      <td className="px-4 py-3 text-right text-gray-300 whitespace-nowrap">{fmtR(entry?.cpc)}</td>
                      <td className="px-4 py-3 text-right text-gray-300 whitespace-nowrap">{fmtN(entry?.leadsFromAds)}</td>
                      <td className="px-4 py-3 text-right text-gray-300 whitespace-nowrap">{fmtR(entry?.costPerResult)}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <span className={entry?.spend ? "text-amber-400 font-medium" : "text-gray-600"}>
                          {fmtR(entry?.spend)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <span className={entry?.leadsScheduled != null ? "text-violet-400 font-medium" : "text-gray-600"}>
                          {entry?.leadsScheduled ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <span className={entry?.revenue ? "text-emerald-400 font-medium" : "text-gray-600"}>
                          {fmtR(entry?.revenue)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {roi == null ? (
                          <span className="text-gray-600">—</span>
                        ) : (
                          <span className={`font-semibold ${roi >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {roi >= 0 ? "+" : ""}{roi.toFixed(0)}%
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <SyncButton clientId={client.id} platform="google" period={period} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          {filteredClients.some((c) => c.metricEntries.some((e) => e.platform === "google" && e.period === period)) && (
            <div className="border-t border-[#262626] bg-[#111111] px-4 py-3 flex items-center gap-6 flex-wrap text-sm">
              {(() => {
                const entries = filteredClients
                  .map((c) => c.metricEntries.find((e) => e.platform === "google" && e.period === period))
                  .filter(Boolean) as MetricEntry[];
                const totalSpend = entries.reduce((a, e) => a + Number(e.spend ?? 0), 0);
                const totalRevenue = entries.reduce((a, e) => a + Number(e.revenue ?? 0), 0);
                const totalImpressions = entries.reduce((a, e) => a + (e.impressions ?? 0), 0);
                const totalClicks = entries.reduce((a, e) => a + (e.clicks ?? 0), 0);
                const totalConversions = entries.reduce((a, e) => a + (e.leadsFromAds ?? 0), 0);
                const totalLeadsSched = entries.reduce((a, e) => a + (e.leadsScheduled ?? 0), 0);
                const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
                const avgCostPerConv = totalConversions > 0 ? totalSpend / totalConversions : 0;
                const roi = totalSpend ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;
                return (
                  <>
                    <div><p className="text-xs text-gray-600">Impressões</p><p className="font-bold text-gray-300">{totalImpressions.toLocaleString("pt-BR")}</p></div>
                    <div><p className="text-xs text-gray-600">Cliques</p><p className="font-bold text-blue-300">{totalClicks.toLocaleString("pt-BR")}</p></div>
                    <div><p className="text-xs text-gray-600">CPC Médio</p><p className="font-bold text-gray-300">R$ {avgCpc.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p></div>
                    <div><p className="text-xs text-gray-600">Conversões</p><p className="font-bold text-gray-300">{totalConversions.toLocaleString("pt-BR")}</p></div>
                    <div><p className="text-xs text-gray-600">Custo/Conversão</p><p className="font-bold text-gray-300">R$ {avgCostPerConv.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p></div>
                    <div><p className="text-xs text-gray-600">Investimento</p><p className="font-bold text-amber-400">R$ {totalSpend.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p></div>
                    <div><p className="text-xs text-gray-600">Leads Agendados</p><p className="font-bold text-violet-400">{totalLeadsSched.toLocaleString("pt-BR")}</p></div>
                    <div><p className="text-xs text-gray-600">Faturamento</p><p className="font-bold text-emerald-400">R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p></div>
                    <div><p className="text-xs text-gray-600">ROI</p><p className={`font-bold ${roi >= 0 ? "text-emerald-400" : "text-red-400"}`}>{roi >= 0 ? "+" : ""}{roi.toFixed(0)}%</p></div>
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
