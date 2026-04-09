"use client";

import { useState } from "react";
import { fetchCampaignsAction, fetchAdsAction } from "../actions";

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

interface AdInsight {
  adId: string;
  adName: string;
  adsetId: string;
  adsetName: string;
  campaignId: string;
  spend: number;
  impressions: number;
  conversations: number;
  leadsFromAds: number;
  newFollowers: number;
  costPerConversation: number;
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

function IdBadge({ label, id }: { label: string; id: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <button
      onClick={copy}
      title={`Copiar ${label} ID: ${id}`}
      className="inline-flex items-center gap-1 text-[10px] font-mono bg-[#111] border border-[#2a2a2a] hover:border-violet-500/40 text-gray-600 hover:text-gray-400 px-1.5 py-0.5 rounded-md transition-all"
    >
      <span className="text-gray-700">{label}</span>
      <span>{id.slice(-8)}</span>
      {copied
        ? <svg className="w-2.5 h-2.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
        : <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
      }
    </button>
  );
}

function AdRow({ ad }: { ad: AdInsight }) {
  const extraActions = ad.rawActions.filter(a => !KNOWN_TYPES.has(a.action_type));
  return (
    <div className="pl-4 border-l-2 border-[#2a2a2a] ml-4 py-3 hover:border-violet-500/30 transition-colors">
      {/* Ad name + IDs */}
      <div className="flex items-start gap-2 flex-wrap mb-2">
        <svg className="w-3.5 h-3.5 text-gray-700 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-xs font-semibold text-gray-300 flex-1">{ad.adName}</span>
        <div className="flex gap-1 flex-wrap">
          <IdBadge label="Ad" id={ad.adId} />
          <IdBadge label="Adset" id={ad.adsetId} />
        </div>
      </div>
      {/* Ad metrics */}
      <div className="flex flex-wrap gap-3 text-xs">
        {ad.conversations > 0 && (
          <span className="text-blue-400 font-bold">{fmtN(ad.conversations)} conv</span>
        )}
        {ad.costPerConversation > 0 && (
          <span className="text-blue-300">{fmtR(ad.costPerConversation)}/conv</span>
        )}
        {ad.leadsFromAds > 0 && (
          <span className="text-emerald-400">{fmtN(ad.leadsFromAds)} leads</span>
        )}
        {ad.newFollowers > 0 && (
          <span className="text-pink-400">{fmtN(ad.newFollowers)} seguidores</span>
        )}
        <span className="text-amber-400">{fmtR(ad.spend)}</span>
        <span className="text-gray-600">{fmtN(ad.impressions)} imp.</span>
        {extraActions.slice(0, 2).map(a => (
          <span key={a.action_type} className="text-gray-500">
            {fmtN(a.value)} {actionLabel(a.action_type).toLowerCase()}
          </span>
        ))}
      </div>
    </div>
  );
}

function AdsetGroup({ adsetName, adsetId, ads }: { adsetName: string; adsetId: string; ads: AdInsight[] }) {
  const [open, setOpen] = useState(true);
  const totalConv = ads.reduce((s, a) => s + a.conversations, 0);
  const totalSpend = ads.reduce((s, a) => s + a.spend, 0);
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 w-full text-left px-3 py-2 bg-[#161616] rounded-xl hover:bg-[#1c1c1c] transition-colors group"
      >
        <svg className={`w-3 h-3 text-gray-600 transition-transform ${open ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-xs font-semibold text-gray-400 flex-1">{adsetName}</span>
        <IdBadge label="Adset" id={adsetId} />
        <span className="text-[10px] text-gray-600">{ads.length} anúncio{ads.length !== 1 ? "s" : ""}</span>
        {totalConv > 0 && <span className="text-xs text-blue-400 font-bold">{fmtN(totalConv)} conv</span>}
        <span className="text-xs text-amber-500">{fmtR(totalSpend)}</span>
      </button>
      {open && (
        <div className="mt-1 space-y-1">
          {ads.map(ad => <AdRow key={ad.adId} ad={ad} />)}
        </div>
      )}
    </div>
  );
}

export function CampaignInsights({ clientId, clientName, dateFrom, dateTo }: Props) {
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Per-campaign ad data: campaignId → { loading, ads, error }
  const [adsState, setAdsState] = useState<Record<string, { loading: boolean; ads: AdInsight[] | null; error: string | null }>>({});
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set());

  async function load() {
    setLoading(true);
    setError(null);
    const res = await fetchCampaignsAction(clientId, dateFrom, dateTo);
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    const sorted = [...(res.campaigns ?? [])].sort((a, b) =>
      b.conversations !== a.conversations
        ? b.conversations - a.conversations
        : b.leadsFromAds - a.leadsFromAds
    );
    setCampaigns(sorted);
  }

  async function toggleAds(campaignId: string) {
    const isExpanded = expandedCampaigns.has(campaignId);
    if (isExpanded) {
      setExpandedCampaigns(prev => { const s = new Set(prev); s.delete(campaignId); return s; });
      return;
    }
    setExpandedCampaigns(prev => new Set([...prev, campaignId]));
    // Fetch if not already loaded
    if (adsState[campaignId]?.ads != null) return;
    setAdsState(prev => ({ ...prev, [campaignId]: { loading: true, ads: null, error: null } }));
    const res = await fetchAdsAction(clientId, dateFrom, dateTo, campaignId);
    if (res.error) {
      setAdsState(prev => ({ ...prev, [campaignId]: { loading: false, ads: null, error: res.error! } }));
      return;
    }
    const sortedAds = [...(res.ads ?? [])].sort((a, b) => b.conversations - a.conversations || b.spend - a.spend);
    setAdsState(prev => ({ ...prev, [campaignId]: { loading: false, ads: sortedAds, error: null } }));
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

      {/* States */}
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
        const withConv = campaigns.filter(c => c.conversations > 0 && c.costPerConversation > 0);
        const avgCpC = withConv.length > 0
          ? withConv.reduce((s, c) => s + c.costPerConversation, 0) / withConv.length
          : null;

        return (
          <div className="divide-y divide-[#1e1e1e]">
            {/* Totals bar */}
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

              const isExpanded = expandedCampaigns.has(c.campaignId);
              const adState = adsState[c.campaignId];

              // Group ads by adset
              const adsByAdset: Record<string, AdInsight[]> = {};
              if (adState?.ads) {
                for (const ad of adState.ads) {
                  if (!adsByAdset[ad.adsetId]) adsByAdset[ad.adsetId] = [];
                  adsByAdset[ad.adsetId].push(ad);
                }
              }

              return (
                <div key={c.campaignId} className="px-5 py-4 hover:bg-[#1d1d1d] transition-colors">
                  <div className="flex items-start gap-3">
                    {/* Medal / rank */}
                    <span className="text-lg flex-shrink-0 mt-0.5">
                      {i < 3 ? MEDAL[i] : <span className="text-xs text-gray-600 font-bold w-6 text-center inline-block">#{i + 1}</span>}
                    </span>

                    <div className="flex-1 min-w-0">
                      {/* Campaign name + IDs */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-semibold text-white">{c.campaignName}</p>
                        {alertLevel === "red" && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-red-500/15 text-red-400 border border-red-500/20 flex-shrink-0">Custo alto</span>
                        )}
                        {alertLevel === "yellow" && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/20 flex-shrink-0">Atenção</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <IdBadge label="Campaign" id={c.campaignId} />
                      </div>

                      {/* Metrics grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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

                      {/* Extra actions */}
                      {c.rawActions.filter(a => !KNOWN_TYPES.has(a.action_type)).length > 0 && (
                        <div className="mt-3 border-t border-[#1a1a1a] pt-3">
                          <p className="text-[10px] text-gray-700 uppercase tracking-wider font-semibold mb-2">Todos os resultados</p>
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

                      {/* Toggle ads button */}
                      <button
                        onClick={() => toggleAds(c.campaignId)}
                        className="mt-3 flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors"
                      >
                        <svg className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        {isExpanded ? "Ocultar anúncios" : "Ver conjuntos e anúncios"}
                        {adState?.loading && <span className="text-gray-600 font-normal ml-1">carregando...</span>}
                      </button>

                      {/* Ads expanded */}
                      {isExpanded && (
                        <div className="mt-3">
                          {adState?.error && (
                            <p className="text-xs text-red-400 bg-red-500/10 rounded-xl px-3 py-2">{adState.error}</p>
                          )}
                          {adState?.ads && Object.keys(adsByAdset).length === 0 && (
                            <p className="text-xs text-gray-600">Nenhum anúncio encontrado.</p>
                          )}
                          {adState?.ads && Object.entries(adsByAdset).map(([adsetId, ads]) => (
                            <AdsetGroup
                              key={adsetId}
                              adsetId={adsetId}
                              adsetName={ads[0].adsetName}
                              ads={ads}
                            />
                          ))}
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
