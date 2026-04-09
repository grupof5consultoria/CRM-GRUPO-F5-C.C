"use client";

import { useState } from "react";
import { fetchCampaignsAction, fetchAdsAction } from "../actions";

interface RawAction { action_type: string; value: number; costPer: number | null; }

interface Campaign {
  campaignId: string;
  campaignName: string;
  objective: string;
  status: string;
  startDate: string;
  dailyBudget: number;
  spend: number;
  impressions: number;
  clicks: number;
  cpc: number;
  ctr: number;
  ctrLink: number;
  cpm: number;
  leadsFromAds: number;
  conversations: number;
  newFollowers: number;
  costPerResult: number;
  costPerConversation: number;
  costPerFollower: number;
  rawActions: RawAction[];
}

interface AdInsight {
  adId: string; adName: string;
  adsetId: string; adsetName: string;
  campaignId: string;
  spend: number; impressions: number;
  conversations: number; leadsFromAds: number;
  newFollowers: number; costPerConversation: number;
  rawActions: RawAction[];
}

interface Props {
  clientId: string;
  clientName: string;
  dateFrom: string;
  dateTo: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtR(v: number) { return v ? `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"; }
function fmtN(v: number) { return v ? v.toLocaleString("pt-BR") : "—"; }
function fmtPct(v: number) { return v ? `${v.toFixed(2)}%` : "—"; }
function fmtDate(d: string) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

const OBJECTIVE_LABELS: Record<string, string> = {
  MESSAGES: "Mensagens", ENGAGEMENT: "Engajamento",
  LEAD_GENERATION: "Leads", TRAFFIC: "Tráfego",
  BRAND_AWARENESS: "Reconhecimento", VIDEO_VIEWS: "Visualizações",
  CONVERSIONS: "Conversões", APP_INSTALLS: "Instalações",
  REACH: "Alcance", OUTCOME_ENGAGEMENT: "Engajamento",
  OUTCOME_LEADS: "Leads", OUTCOME_TRAFFIC: "Tráfego",
  OUTCOME_AWARENESS: "Reconhecimento", OUTCOME_SALES: "Vendas",
  OUTCOME_APP_PROMOTION: "App",
};

const OBJECTIVE_COLORS: Record<string, string> = {
  MESSAGES: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  ENGAGEMENT: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  OUTCOME_ENGAGEMENT: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  LEAD_GENERATION: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  OUTCOME_LEADS: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  TRAFFIC: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  OUTCOME_TRAFFIC: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  BRAND_AWARENESS: "bg-gray-500/15 text-gray-400 border-gray-500/20",
  OUTCOME_AWARENESS: "bg-gray-500/15 text-gray-400 border-gray-500/20",
  CONVERSIONS: "bg-pink-500/15 text-pink-400 border-pink-500/20",
  OUTCOME_SALES: "bg-pink-500/15 text-pink-400 border-pink-500/20",
};

function ObjectiveBadge({ objective }: { objective: string }) {
  const label = OBJECTIVE_LABELS[objective] ?? objective.replace(/_/g, " ");
  const color = OBJECTIVE_COLORS[objective] ?? "bg-gray-500/15 text-gray-400 border-gray-500/20";
  return (
    <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${color}`}>
      {label}
    </span>
  );
}

function StatusDot({ status }: { status: string }) {
  const active = status === "ACTIVE";
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${active ? "text-emerald-400" : "text-gray-500"}`}>
      <span className={`w-2 h-2 rounded-full ${active ? "bg-emerald-400" : "bg-gray-600"}`} />
      {active ? "Ativo" : status ? status.toLowerCase() : "—"}
    </span>
  );
}

// ── Column header ─────────────────────────────────────────────────────────────
function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-3 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap text-right ${className}`}>
      {children}
    </th>
  );
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`px-3 py-3 text-xs text-right whitespace-nowrap ${className}`}>
      {children}
    </td>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function CampaignInsights({ clientId, clientName, dateFrom, dateTo }: Props) {
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adsState, setAdsState] = useState<Record<string, { loading: boolean; ads: AdInsight[] | null; error: string | null }>>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  async function load() {
    setLoading(true); setError(null);
    const res = await fetchCampaignsAction(clientId, dateFrom, dateTo);
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    const sorted = [...(res.campaigns ?? [])].sort((a, b) =>
      b.conversations !== a.conversations ? b.conversations - a.conversations : b.leadsFromAds - a.leadsFromAds
    );
    setCampaigns(sorted);
  }

  async function toggleExpand(campaignId: string) {
    const isOpen = expanded.has(campaignId);
    if (isOpen) {
      setExpanded(prev => { const s = new Set(prev); s.delete(campaignId); return s; });
      return;
    }
    setExpanded(prev => new Set([...prev, campaignId]));
    if (adsState[campaignId]?.ads != null) return;
    setAdsState(prev => ({ ...prev, [campaignId]: { loading: true, ads: null, error: null } }));
    const res = await fetchAdsAction(clientId, dateFrom, dateTo, campaignId);
    if (res.error) {
      setAdsState(prev => ({ ...prev, [campaignId]: { loading: false, ads: null, error: res.error! } }));
      return;
    }
    const sorted = [...(res.ads ?? [])].sort((a, b) => b.conversations - a.conversations || b.spend - a.spend);
    setAdsState(prev => ({ ...prev, [campaignId]: { loading: false, ads: sorted, error: null } }));
  }

  // Totals
  const totals = campaigns ? {
    spend:         campaigns.reduce((s, c) => s + c.spend, 0),
    cpc:           0,
    ctr:           0,
    ctrLink:       0,
    cpm:           0,
    impressions:   campaigns.reduce((s, c) => s + c.impressions, 0),
    conversations: campaigns.reduce((s, c) => s + c.conversations, 0),
    clicks:        campaigns.reduce((s, c) => s + c.clicks, 0),
  } : null;

  if (totals && totals.impressions > 0) {
    totals.cpm    = (totals.spend / totals.impressions) * 1000;
    totals.ctrLink = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
    totals.cpc    = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
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

      {/* Error */}
      {error && (
        <div className="px-5 py-4">
          <p className="text-xs text-red-400 bg-red-500/10 rounded-xl px-3 py-2">{error}</p>
        </div>
      )}

      {/* Empty / loading states */}
      {!campaigns && !error && !loading && (
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-gray-600">Clique em "Carregar campanhas" para ver o detalhamento.</p>
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

      {/* Table */}
      {campaigns && campaigns.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-[#222] bg-[#111]">
                <th className="px-3 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider text-left w-28">Objetivo</th>
                <th className="px-3 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider text-left">Campanha</th>
                <Th className="text-left w-24">Status</Th>
                <Th>Data início</Th>
                <Th>Orçamento</Th>
                <Th>Gasto</Th>
                <Th>CPC (todos)</Th>
                <Th>CPC (no link)</Th>
                <Th>CTR (todos)</Th>
                <Th>CTR (link)</Th>
                <Th>CPM</Th>
                <Th>Impressões</Th>
                <Th>Resultados</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e]">
              {campaigns.map((c) => {
                const isOpen = expanded.has(c.campaignId);
                const adState = adsState[c.campaignId];
                const adsByAdset: Record<string, AdInsight[]> = {};
                if (adState?.ads) {
                  for (const ad of adState.ads) {
                    if (!adsByAdset[ad.adsetId]) adsByAdset[ad.adsetId] = [];
                    adsByAdset[ad.adsetId].push(ad);
                  }
                }
                const results = c.conversations > 0 ? c.conversations : c.leadsFromAds > 0 ? c.leadsFromAds : c.newFollowers;
                const resultsLabel = c.conversations > 0 ? "Conv" : c.leadsFromAds > 0 ? "Leads" : c.newFollowers > 0 ? "Seg." : null;

                return (
                  <>
                    {/* Campaign row */}
                    <tr key={c.campaignId} className="hover:bg-[#1d1d1d] transition-colors">
                      <td className="px-3 py-3">
                        <ObjectiveBadge objective={c.objective} />
                      </td>
                      <td className="px-3 py-3">
                        <button
                          onClick={() => toggleExpand(c.campaignId)}
                          className="flex items-center gap-2 text-left group w-full"
                        >
                          <svg className={`w-3.5 h-3.5 text-gray-600 flex-shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <span className="text-gray-200 group-hover:text-white font-medium text-xs truncate max-w-[240px]">{c.campaignName}</span>
                          {adState?.loading && <span className="text-[10px] text-gray-600 ml-1">...</span>}
                        </button>
                      </td>
                      <td className="px-3 py-3"><StatusDot status={c.status} /></td>
                      <Td>{fmtDate(c.startDate)}</Td>
                      <Td>{c.dailyBudget > 0 ? fmtR(c.dailyBudget) : "—"}</Td>
                      <Td><span className="text-amber-400 font-medium">{fmtR(c.spend)}</span></Td>
                      <Td><span className="text-gray-300">{fmtR(c.cpc)}</span></Td>
                      <Td><span className="text-gray-300">{c.costPerConversation > 0 ? fmtR(c.costPerConversation) : "—"}</span></Td>
                      <Td><span className="text-gray-300">{fmtPct(c.ctr)}</span></Td>
                      <Td><span className="text-gray-300">{fmtPct(c.ctrLink)}</span></Td>
                      <Td><span className="text-gray-300">{fmtR(c.cpm)}</span></Td>
                      <Td><span className="text-gray-300">{fmtN(c.impressions)}</span></Td>
                      <Td>
                        {results > 0
                          ? <span className="text-blue-400 font-semibold">{fmtN(results)} <span className="text-gray-600 font-normal">{resultsLabel}</span></span>
                          : <span className="text-gray-700">0 Conv</span>
                        }
                      </Td>
                    </tr>

                    {/* Adset/Ad rows when expanded */}
                    {isOpen && adState?.ads && Object.entries(adsByAdset).map(([adsetId, ads]) => (
                      <>
                        {/* Adset row */}
                        <tr key={`adset-${adsetId}`} className="bg-[#161616] border-t border-[#1e1e1e]">
                          <td />
                          <td className="px-3 py-2 pl-10" colSpan={1}>
                            <div className="flex items-center gap-2">
                              <svg className="w-3 h-3 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                              <span className="text-[11px] text-gray-400 font-medium truncate max-w-[220px]">{ads[0].adsetName}</span>
                            </div>
                          </td>
                          <td /><td /><td />
                          <Td><span className="text-amber-400/70 text-[11px]">{fmtR(ads.reduce((s, a) => s + a.spend, 0))}</span></Td>
                          <td /><td /><td /><td /><td />
                          <Td><span className="text-gray-500 text-[11px]">{fmtN(ads.reduce((s, a) => s + a.impressions, 0))}</span></Td>
                          <Td><span className="text-blue-400/70 text-[11px]">{fmtN(ads.reduce((s, a) => s + a.conversations, 0))} Conv</span></Td>
                        </tr>

                        {/* Ad rows */}
                        {ads.map((ad) => (
                          <tr key={`ad-${ad.adId}`} className="bg-[#131313] border-t border-[#1a1a1a] hover:bg-[#181818] transition-colors">
                            <td />
                            <td className="px-3 py-2 pl-16" colSpan={1}>
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded bg-[#222] flex items-center justify-center flex-shrink-0">
                                  <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <span className="text-[11px] text-gray-500 truncate max-w-[200px]">{ad.adName}</span>
                              </div>
                            </td>
                            <td /><td /><td />
                            <Td><span className="text-amber-400/60 text-[11px]">{fmtR(ad.spend)}</span></Td>
                            <td /><td /><td /><td /><td />
                            <Td><span className="text-gray-600 text-[11px]">{fmtN(ad.impressions)}</span></Td>
                            <Td>
                              {ad.conversations > 0
                                ? <span className="text-blue-400/70 text-[11px]">{fmtN(ad.conversations)} Conv</span>
                                : <span className="text-gray-700 text-[11px]">0 Conv</span>
                              }
                            </Td>
                          </tr>
                        ))}
                      </>
                    ))}

                    {/* Error loading ads */}
                    {isOpen && adState?.error && (
                      <tr>
                        <td colSpan={13} className="px-5 py-2">
                          <p className="text-xs text-red-400 bg-red-500/10 rounded-xl px-3 py-2">{adState.error}</p>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>

            {/* Totals row */}
            {totals && (
              <tfoot>
                <tr className="border-t border-[#262626] bg-[#111]">
                  <td colSpan={5} />
                  <td className="px-3 py-3 text-right text-xs font-bold text-amber-400">{fmtR(totals.spend)}</td>
                  <td className="px-3 py-3 text-right text-xs text-gray-400">{totals.cpc > 0 ? fmtR(totals.cpc) : "—"}</td>
                  <td className="px-3 py-3 text-right text-xs text-gray-400">—</td>
                  <td className="px-3 py-3 text-right text-xs text-gray-400">{totals.ctrLink > 0 ? fmtPct(totals.ctrLink) : "—"}</td>
                  <td className="px-3 py-3 text-right text-xs text-gray-400">—</td>
                  <td className="px-3 py-3 text-right text-xs text-gray-400">{totals.cpm > 0 ? fmtR(totals.cpm) : "—"}</td>
                  <td className="px-3 py-3 text-right text-xs text-gray-400">{fmtN(totals.impressions)}</td>
                  <td className="px-3 py-3 text-right text-xs font-bold text-blue-400">{fmtN(totals.conversations)} Conv</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
}
