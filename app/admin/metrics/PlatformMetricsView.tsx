"use client";

import { useState } from "react";
import { SyncButton } from "./SyncButton";

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

interface SimpleClient {
  id: string;
  name: string;
}

interface Props {
  platform: "meta" | "google";
  clients: Client[];
  allClients: SimpleClient[];
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

function RoiCell({ spend, revenue }: { spend: { toString(): string } | null | undefined; revenue: { toString(): string } | null | undefined }) {
  const s = Number(spend ?? 0);
  const r = Number(revenue ?? 0);
  if (!s) return <span className="text-gray-600">—</span>;
  const pct = ((r - s) / s) * 100;
  return (
    <span className={pct >= 0 ? "text-emerald-400" : "text-red-400"}>
      {pct >= 0 ? "+" : ""}{pct.toFixed(0)}%
    </span>
  );
}

const platformConfig = {
  meta: {
    label: "Meta Ads",
    accentColor: "text-blue-400",
    dotColor: "bg-blue-400",
    credField: "metaAdAccountId" as keyof Client,
  },
  google: {
    label: "Google Ads",
    accentColor: "text-red-400",
    dotColor: "bg-red-400",
    credField: "googleAdsCustomerId" as keyof Client,
  },
};

export function PlatformMetricsView({ platform, clients, allClients, currentPeriod, periods }: Props) {
  const [period, setPeriod] = useState(currentPeriod);
  const [selectedClientId, setSelectedClientId] = useState<string>("all");

  const cfg = platformConfig[platform];

  // Filtered clients: those with credentials + optional single-client filter
  const filteredClients = clients.filter((c) =>
    selectedClientId === "all" || c.id === selectedClientId
  );

  const totalConfigured = clients.length;

  return (
    <div className="space-y-5">
      {/* Header bar: client selector + period */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Platform badge */}
        <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#262626] rounded-xl px-3 py-2">
          <span className={`w-2 h-2 rounded-full ${cfg.dotColor}`} />
          <span className={`text-sm font-semibold ${cfg.accentColor}`}>{cfg.label}</span>
          <span className="text-xs text-gray-600 ml-1">{totalConfigured} cliente{totalConfigured !== 1 ? "s" : ""}</span>
        </div>

        {/* Client selector */}
        <select
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
          className="bg-[#1a1a1a] border border-[#262626] rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-violet-500 min-w-[180px]"
        >
          <option value="all">Todos os clientes</option>
          {allClients.map((c) => {
            const hasCredential = clients.some((mc) => mc.id === c.id);
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

      {/* Empty state */}
      {filteredClients.length === 0 ? (
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-12 text-center">
          <p className="text-sm text-gray-600">
            Nenhum cliente com credenciais de {cfg.label} configuradas.
          </p>
          <p className="text-xs text-gray-700 mt-1">
            Configure as credenciais na ficha de cada cliente → card "Métricas — Plataformas".
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
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]">
                {filteredClients.map((client) => {
                  const entry = client.metricEntries.find(
                    (e) => e.platform === platform && e.period === period
                  );
                  return (
                    <tr key={client.id} className="hover:bg-[#222222] transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-white font-medium">{client.name}</p>
                          {entry?.syncedAt ? (
                            <p className="text-xs text-gray-600 mt-0.5">
                              Sync: {new Date(entry.syncedAt).toLocaleDateString("pt-BR")}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-700 mt-0.5">Não sincronizado</p>
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
                        <span className={entry?.leadsScheduled != null ? "text-violet-400 font-medium" : "text-gray-600"}>
                          {entry?.leadsScheduled ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={entry?.revenue ? "text-emerald-400 font-medium" : "text-gray-600"}>
                          {fmt(entry?.revenue)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        <RoiCell spend={entry?.spend} revenue={entry?.revenue} />
                      </td>
                      <td className="px-3 py-3">
                        <SyncButton clientId={client.id} platform={platform} period={period} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          {filteredClients.some((c) => c.metricEntries.some((e) => e.platform === platform && e.period === period)) && (
            <div className="border-t border-[#262626] bg-[#111111] px-4 py-3 flex items-center gap-6 flex-wrap">
              {(() => {
                const entries = filteredClients
                  .map((c) => c.metricEntries.find((e) => e.platform === platform && e.period === period))
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
                    <div><p className="text-xs text-gray-600">ROI</p><p className={`text-sm font-bold ${totalRoi >= 0 ? "text-emerald-400" : "text-red-400"}`}>{totalRoi >= 0 ? "+" : ""}{totalRoi.toFixed(0)}%</p></div>
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
