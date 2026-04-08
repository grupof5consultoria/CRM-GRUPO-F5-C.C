"use client";

import { useState } from "react";
import { fetchCampaignsAction } from "../actions";

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
}

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

      {campaigns && campaigns.length > 0 && (
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
            <div>
              <p className="text-gray-600">{campaigns.length} campanha{campaigns.length !== 1 ? "s" : ""}</p>
            </div>
          </div>

          {/* Campaign rows */}
          {campaigns.map((c, i) => (
            <div key={c.campaignId} className="px-5 py-4 hover:bg-[#222] transition-colors">
              <div className="flex items-start gap-3">
                {/* Medal / rank */}
                <span className="text-lg flex-shrink-0 mt-0.5">
                  {i < 3 ? MEDAL[i] : <span className="text-xs text-gray-600 font-bold w-6 text-center inline-block">#{i + 1}</span>}
                </span>

                {/* Campaign info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{c.campaignName}</p>

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
                    {c.newFollowers > 0 && (
                      <div className="bg-[#111111] border border-pink-500/20 rounded-xl px-3 py-2">
                        <p className="text-xs text-gray-600 mb-0.5">Seguidores Ganhos</p>
                        <p className="text-sm font-bold text-pink-400">{fmtN(c.newFollowers)}</p>
                        {c.costPerFollower > 0 && (
                          <p className="text-xs text-gray-600 mt-0.5">{fmtR(c.costPerFollower)}/seguidor</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
