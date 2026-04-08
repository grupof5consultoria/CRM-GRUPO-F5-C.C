"use client";

import { useState } from "react";
import { fetchCampaignsAction } from "../actions";

interface RawAction { action_type: string; value: number; costPer: number | null; }

interface Campaign {
  campaignId: string;
  campaignName: string;
  spend: number;
  impressions: number;
  leadsFromAds: number;
  conversations: number;
  newFollowers: number;
  costPerResult: number;
  costPerConversation: number;
  costPerFollower: number;
  rawActions: RawAction[];
}

// Human-readable labels for Meta action types (pt-BR)
const ACTION_LABELS: Record<string, string> = {
  "follow":                                                     "Seguidores Ganhos",
  "like":                                                       "Curtidas / Seguidores",
  "page_fan":                                                   "Seguidores da Página",
  "onsite_conversion.post_reactions":                           "Reações",
  "onsite_conversion.post_save":                                "Salvamentos",
  "comment":                                                    "Comentários",
  "post_engagement":                                            "Engajamento no Post",
  "page_engagement":                                            "Engajamento na Página",
  "video_view":                                                 "Visualizações de Vídeo",
  "link_click":                                                 "Cliques no Link",
  "lead":                                                       "Leads",
  "onsite_conversion.lead_grouped":                             "Leads (agrupado)",
  "onsite_conversion.messaging_conversation_started_7d":        "Conversas Iniciadas (7d)",
  "onsite_conversion.total_messaging_connection":               "Conexões Mensagens",
  "onsite_conversion.messaging_first_reply":                    "Primeiras Respostas",
  "onsite_conversion.messaging_welcome_message_sent":           "Msg de Boas-vindas",
  "app_install":                                                "Instalações do App",
  "offsite_conversion.fb_pixel_purchase":                       "Compras",
  "offsite_conversion.fb_pixel_lead":                           "Leads (pixel)",
};

function actionLabel(type: string) {
  return ACTION_LABELS[type] ?? type.split(".").pop()?.replace(/_/g, " ") ?? type;
}

// Action types already shown in the fixed metric grid (avoid duplicating)
const KNOWN_TYPES = new Set([
  "lead", "onsite_conversion.lead_grouped",
  "onsite_conversion.messaging_conversation_started_7d",
  "onsite_conversion.total_messaging_connection",
  "onsite_conversion.messaging_first_reply",
  "follow", "like", "page_fan", "onsite_conversion.post_reactions",
]);

interface Props {
  clientId: string;
  clientName: string;
  dateFrom: string;
  dateTo: string;
}

function fmtR(v: number) {
  if (!v) return "—";
  return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}
function fmtN(v: number) {
  return v ? v.toLocaleString("pt-BR") : "—";
}

const MEDAL = ["🥇", "🥈", "🥉"];

export function CampaignInsights({ clientId, clientName, dateFrom, dateTo }: Props) {
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    const res = await fetchCampaignsAction(clientId, dateFrom, dateTo);
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    // Ordenar por mais conversas, depois por mais leads
    const sorted = [...(res.campaigns ?? [])].sort((a, b) =>
      b.conversations !== a.conversations
        ? b.conversations - a.conversations
        : b.leadsFromAds - a.leadsFromAds
    );
    setCampaigns(sorted);
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#262626]">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <div>
            <p className="text-sm font-bold text-white">Campanhas — {clientName}</p>
            <p className="text-xs text-gray-600">{dateFrom} → {dateTo}</p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-blue-400 text-xs font-semibold px-3 py-2 rounded-xl transition-all disabled:opacity-50"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? "Carregando..." : campaigns ? "Atualizar" : "Carregar campanhas"}
        </button>
      </div>

      {/* Content */}
      {error && (
        <div className="px-5 py-4">
          <p className="text-xs text-red-400 bg-red-500/10 rounded-xl px-3 py-2">{error}</p>
        </div>
      )}

      {!campaigns && !error && !loading && (
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-gray-600">Clique em "Carregar campanhas" para ver o ranking.</p>
        </div>
      )}

      {loading && (
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-gray-500">Buscando campanhas na Meta...</p>
        </div>
      )}

      {campaigns && campaigns.length === 0 && (
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-gray-600">Nenhuma campanha encontrada no período.</p>
        </div>
      )}

      {campaigns && campaigns.length > 0 && (() => {
        // Performance alert: compute avg cost per conversation
        const withConv = campaigns.filter(c => c.conversations > 0 && c.costPerConversation > 0);
        const avgCpC = withConv.length > 0
          ? withConv.reduce((s, c) => s + c.costPerConversation, 0) / withConv.length
          : null;

        return (
        <div className="divide-y divide-[#1e1e1e]">
          {/* Totals */}
          <div className="px-5 py-3 bg-[#111111] flex items-center gap-6 flex-wrap text-xs">
            <div>
              <p className="text-gray-600">Total conversas</p>
              <p className="font-bold text-blue-400 text-sm">{fmtN(campaigns.reduce((s, c) => s + c.conversations, 0))}</p>
            </div>
            <div>
              <p className="text-gray-600">Total leads</p>
              <p className="font-bold text-gray-300 text-sm">{fmtN(campaigns.reduce((s, c) => s + c.leadsFromAds, 0))}</p>
            </div>
            <div>
              <p className="text-gray-600">Total investido</p>
              <p className="font-bold text-amber-400 text-sm">{fmtR(campaigns.reduce((s, c) => s + c.spend, 0))}</p>
            </div>
            {avgCpC && (
              <div>
                <p className="text-gray-600">Custo médio/conv</p>
                <p className="font-bold text-blue-300 text-sm">{fmtR(avgCpC)}</p>
              </div>
            )}
            <div>
              <p className="text-gray-600">{campaigns.length} campanha{campaigns.length !== 1 ? "s" : ""}</p>
            </div>
          </div>

          {/* Campaign rows */}
          {campaigns.map((c, i) => {
            const alertLevel = avgCpC && c.costPerConversation > 0
              ? c.costPerConversation >= avgCpC * 2 ? "red"
              : c.costPerConversation >= avgCpC * 1.5 ? "yellow"
              : null
              : null;

            return (
            <div key={c.campaignId} className="px-5 py-4 hover:bg-[#222] transition-colors">
              <div className="flex items-start gap-3">
                {/* Medal / rank */}
                <span className="text-lg flex-shrink-0 mt-0.5">
                  {i < 3 ? MEDAL[i] : <span className="text-xs text-gray-600 font-bold w-6 text-center inline-block">#{i + 1}</span>}
                </span>

                {/* Campaign info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white truncate">{c.campaignName}</p>
                    {alertLevel === "red" && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-red-500/15 text-red-400 border border-red-500/20 flex-shrink-0">
                        Custo alto
                      </span>
                    )}
                    {alertLevel === "yellow" && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/20 flex-shrink-0">
                        Atenção
                      </span>
                    )}
                  </div>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                    <div className="bg-[#111111] rounded-xl px-3 py-2">
                      <p className="text-xs text-gray-600 mb-0.5">Conversas</p>
                      <p className="text-sm font-bold text-blue-400">{fmtN(c.conversations)}</p>
                    </div>
                    <div className="bg-[#111111] rounded-xl px-3 py-2">
                      <p className="text-xs text-gray-600 mb-0.5">Custo por Conversa</p>
                      <p className="text-sm font-bold text-blue-300">{c.costPerConversation > 0 ? fmtR(c.costPerConversation) : "—"}</p>
                    </div>
                    <div className="bg-[#111111] rounded-xl px-3 py-2">
                      <p className="text-xs text-gray-600 mb-0.5">Investimento</p>
                      <p className="text-sm font-bold text-amber-400">{fmtR(c.spend)}</p>
                    </div>
                    <div className="bg-[#111111] rounded-xl px-3 py-2">
                      <p className="text-xs text-gray-600 mb-0.5">Impressões</p>
                      <p className="text-sm font-bold text-gray-400">{fmtN(c.impressions)}</p>
                    </div>
                    <div className={`rounded-xl px-3 py-2 ${c.newFollowers > 0 ? "bg-[#111111] border border-pink-500/20" : "bg-[#111111]"}`}>
                      <p className="text-xs text-gray-600 mb-0.5">Seguidores Ganhos</p>
                      <p className={`text-sm font-bold ${c.newFollowers > 0 ? "text-pink-400" : "text-gray-700"}`}>
                        {c.newFollowers > 0 ? fmtN(c.newFollowers) : "—"}
                      </p>
                      {c.costPerFollower > 0 && (
                        <p className="text-xs text-gray-600 mt-0.5">{fmtR(c.costPerFollower)}/seguidor</p>
                      )}
                    </div>
                  </div>

                  {/* Extra actions — anything the API returned that isn't in the fixed grid */}
                  {c.rawActions.filter(a => !KNOWN_TYPES.has(a.action_type)).length > 0 && (
                    <div className="mt-3 border-t border-[#1a1a1a] pt-3">
                      <p className="text-[10px] text-gray-700 uppercase tracking-wider font-semibold mb-2">Todos os resultados da campanha</p>
                      <div className="flex flex-wrap gap-2">
                        {c.rawActions.map(a => (
                          <div key={a.action_type} className="bg-[#111111] rounded-xl px-3 py-2 min-w-[110px]">
                            <p className="text-[10px] text-gray-600 mb-0.5 leading-tight">{actionLabel(a.action_type)}</p>
                            <p className="text-sm font-bold text-gray-200">{fmtN(a.value)}</p>
                            {a.costPer != null && a.costPer > 0 && (
                              <p className="text-[10px] text-gray-600 mt-0.5">{fmtR(a.costPer)}/result.</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            );
          })}
        </div>
        );
      })()}
    </div>
  );
}
