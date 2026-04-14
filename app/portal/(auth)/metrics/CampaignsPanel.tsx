"use client";

import { useEffect, useState } from "react";
import type { MetaCampaignInsight } from "@/lib/meta-api";

const OBJECTIVE_LABELS: Record<string, string> = {
  MESSAGES: "Mensagens",
  LEAD_GENERATION: "Geração de Leads",
  LINK_CLICKS: "Tráfego",
  CONVERSIONS: "Conversões",
  BRAND_AWARENESS: "Reconhecimento",
  REACH: "Alcance",
  VIDEO_VIEWS: "Visualizações",
  POST_ENGAGEMENT: "Engajamento",
  PAGE_LIKES: "Curtidas",
  OUTCOME_LEADS: "Leads",
  OUTCOME_TRAFFIC: "Tráfego",
  OUTCOME_ENGAGEMENT: "Engajamento",
  OUTCOME_AWARENESS: "Reconhecimento",
  OUTCOME_SALES: "Vendas",
};

const STATUS_CONFIG: Record<string, { label: string; dot: string }> = {
  ACTIVE:    { label: "Ativa",    dot: "#22c55e" },
  PAUSED:    { label: "Pausada",  dot: "#f59e0b" },
  ARCHIVED:  { label: "Arquivada",dot: "#6b7280" },
  DELETED:   { label: "Deletada", dot: "#ef4444" },
};

function fmt(v: number, type: "R$" | "%" | "n") {
  if (!v || v === 0) return "—";
  if (type === "R$") return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (type === "%") return `${v.toFixed(2)}%`;
  return v.toLocaleString("pt-BR");
}

function getMainResult(c: MetaCampaignInsight) {
  if (c.conversations > 0) return { label: "Conversas", value: fmt(c.conversations, "n"), cost: fmt(c.costPerConversation, "R$") };
  if (c.leadsFromAds > 0)  return { label: "Leads",     value: fmt(c.leadsFromAds, "n"),  cost: fmt(c.costPerResult, "R$") };
  if (c.newFollowers > 0)  return { label: "Seguidores", value: fmt(c.newFollowers, "n"),  cost: fmt(c.costPerFollower, "R$") };
  // fallback to raw actions
  const top = c.rawActions[0];
  if (top) return { label: top.action_type.split(".").pop() ?? "Resultado", value: fmt(top.value, "n"), cost: top.costPer ? fmt(top.costPer, "R$") : "—" };
  return { label: "Resultado", value: "—", cost: "—" };
}

interface Props { dateFrom: string; dateTo: string }

export function CampaignsPanel({ dateFrom, dateTo }: Props) {
  const [campaigns, setCampaigns] = useState<MetaCampaignInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/portal/metrics/campaigns?dateFrom=${dateFrom}&dateTo=${dateTo}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error);
        setCampaigns(d.campaigns ?? []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [dateFrom, dateTo]);

  if (loading) return (
    <div className="bg-[#111] rounded-2xl p-8 text-center space-y-2">
      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-xs text-gray-600">Buscando campanhas...</p>
    </div>
  );

  if (error) return (
    <div className="bg-[#111] rounded-2xl p-6 text-center">
      <p className="text-xs text-red-500">Erro ao carregar campanhas</p>
      <p className="text-[10px] text-gray-700 mt-1">{error}</p>
    </div>
  );

  if (campaigns.length === 0) return (
    <div className="bg-[#111] rounded-2xl p-8 text-center">
      <p className="text-xs text-gray-600">Nenhuma campanha encontrada neste período.</p>
    </div>
  );

  // Sort by spend desc
  const sorted = [...campaigns].sort((a, b) => b.spend - a.spend);

  return (
    <div className="space-y-3">
      {sorted.map((c) => {
        const result = getMainResult(c);
        const statusCfg = STATUS_CONFIG[c.status] ?? { label: c.status, dot: "#6b7280" };
        const objLabel = OBJECTIVE_LABELS[c.objective] ?? c.objective;

        return (
          <div key={c.campaignId} className="bg-[#111] rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#1a1a1a] flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white leading-snug truncate">{c.campaignName}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {objLabel && (
                    <span className="text-[10px] text-gray-600 bg-[#1a1a1a] px-2 py-0.5 rounded-md">{objLabel}</span>
                  )}
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: statusCfg.dot }} />
                    <span className="text-[10px] text-gray-600">{statusCfg.label}</span>
                  </div>
                  {c.dailyBudget > 0 && (
                    <span className="text-[10px] text-gray-600">
                      R$ {c.dailyBudget.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}/dia
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-white">{fmt(c.spend, "R$")}</p>
                <p className="text-[10px] text-gray-600">investido</p>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-3 divide-x divide-[#1a1a1a]">
              <div className="px-3 py-3 text-center">
                <p className="text-xs font-semibold text-white">{result.value}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">{result.label}</p>
              </div>
              <div className="px-3 py-3 text-center">
                <p className="text-xs font-semibold text-white">{result.cost}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">Custo/{result.label.toLowerCase().replace(/s$/, "")}</p>
              </div>
              <div className="px-3 py-3 text-center">
                <p className="text-xs font-semibold text-white">{fmt(c.impressions, "n")}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">Impressões</p>
              </div>
            </div>

            {/* Secondary KPIs */}
            <div className="grid grid-cols-3 divide-x divide-[#1a1a1a] border-t border-[#1a1a1a]">
              <div className="px-3 py-2.5 text-center">
                <p className="text-[11px] font-medium text-gray-400">{fmt(c.clicks, "n")}</p>
                <p className="text-[10px] text-gray-600">Cliques</p>
              </div>
              <div className="px-3 py-2.5 text-center">
                <p className="text-[11px] font-medium text-gray-400">{fmt(c.ctrLink, "%")}</p>
                <p className="text-[10px] text-gray-600">CTR link</p>
              </div>
              <div className="px-3 py-2.5 text-center">
                <p className="text-[11px] font-medium text-gray-400">{fmt(c.cpm, "R$")}</p>
                <p className="text-[10px] text-gray-600">CPM</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
