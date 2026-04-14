"use client";

import { useEffect, useState } from "react";
import type { MetaAdInsight } from "@/lib/meta-api";

function fmt(v: number, type: "R$" | "%" | "n") {
  if (!v || v === 0) return "—";
  if (type === "R$") return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (type === "%") return `${v.toFixed(2)}%`;
  return v.toLocaleString("pt-BR");
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

function getMainResult(ad: MetaAdInsight) {
  if (ad.conversations > 0) return { label: "Conversas", value: ad.conversations, cost: ad.costPerConversation };
  if (ad.leadsFromAds > 0)  return { label: "Leads",     value: ad.leadsFromAds,  cost: ad.spend > 0 && ad.leadsFromAds > 0 ? ad.spend / ad.leadsFromAds : 0 };
  if (ad.newFollowers > 0)  return { label: "Seguidores", value: ad.newFollowers,  cost: ad.spend > 0 && ad.newFollowers > 0 ? ad.spend / ad.newFollowers : 0 };
  const top = ad.rawActions[0];
  if (top) return { label: top.action_type.split(".").pop() ?? "Resultado", value: top.value, cost: top.costPer ?? 0 };
  return { label: "Resultado", value: 0, cost: 0 };
}

const PALETTE = ["#7c3aed","#0ea5e9","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#84cc16"];

interface Props { dateFrom: string; dateTo: string }

export function AdsPanel({ dateFrom, dateTo }: Props) {
  const [ads, setAds] = useState<MetaAdInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/portal/metrics/ads?dateFrom=${dateFrom}&dateTo=${dateTo}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error);
        setAds(d.ads ?? []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [dateFrom, dateTo]);

  if (loading) return (
    <div className="bg-[#111] rounded-2xl p-8 text-center space-y-2">
      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-xs text-gray-600">Buscando anúncios...</p>
    </div>
  );

  if (error) return (
    <div className="bg-[#111] rounded-2xl p-6 text-center">
      <p className="text-xs text-red-500">Erro ao carregar anúncios</p>
      <p className="text-[10px] text-gray-700 mt-1">{error}</p>
    </div>
  );

  if (ads.length === 0) return (
    <div className="bg-[#111] rounded-2xl p-8 text-center">
      <p className="text-xs text-gray-600">Nenhum anúncio encontrado neste período.</p>
    </div>
  );

  // Sort by result desc, then by spend
  const sorted = [...ads].sort((a, b) => {
    const ra = getMainResult(a).value;
    const rb = getMainResult(b).value;
    if (rb !== ra) return rb - ra;
    return b.spend - a.spend;
  }).slice(0, 10); // top 10

  const maxResult = Math.max(...sorted.map(a => getMainResult(a).value), 1);

  return (
    <div className="space-y-3">
      {/* Podium - top 3 */}
      {sorted.length >= 3 && (
        <div className="bg-[#111] rounded-2xl p-4 space-y-3">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest">Top 3 anúncios</p>
          {sorted.slice(0, 3).map((ad, i) => {
            const result = getMainResult(ad);
            const pct = maxResult > 0 ? (result.value / maxResult) * 100 : 0;
            const color = PALETTE[i];
            const medals = ["🥇", "🥈", "🥉"];
            return (
              <div key={ad.adId} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{medals[i]}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-300 truncate">{ad.adName}</p>
                    <p className="text-[10px] text-gray-600 truncate">{ad.adsetName}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-white">{result.value > 0 ? fmt(result.value, "n") : "—"}</p>
                    <p className="text-[10px] text-gray-600">{result.label}</p>
                  </div>
                </div>
                <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      <div className="bg-[#111] rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1a1a1a]">
          <p className="text-xs font-semibold text-white">Todos os anúncios</p>
        </div>
        <div className="divide-y divide-[#1a1a1a]">
          {sorted.map((ad, i) => {
            const result = getMainResult(ad);
            const color = PALETTE[i % PALETTE.length];
            return (
              <div key={ad.adId} className="px-4 py-3 flex items-center gap-3">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 text-white" style={{ background: `${color}30`, border: `1px solid ${color}50`, color }}>
                  {initials(ad.adName)}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-300 truncate">{ad.adName}</p>
                  <p className="text-[10px] text-gray-600 truncate">{ad.adsetName}</p>
                </div>

                {/* Result */}
                <div className="text-center flex-shrink-0">
                  <p className="text-xs font-semibold text-white">{result.value > 0 ? fmt(result.value, "n") : "—"}</p>
                  <p className="text-[10px] text-gray-600">{result.label}</p>
                </div>

                {/* Spend */}
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold text-white">{fmt(ad.spend, "R$")}</p>
                  <p className="text-[10px] text-gray-600">gasto</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
