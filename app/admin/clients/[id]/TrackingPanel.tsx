"use client";

import { useState } from "react";

const SOURCES = [
  { key: "google-ads",         label: "Google Ads",          icon: "🔵" },
  { key: "meta-ads",           label: "Meta Ads",            icon: "🟣" },
  { key: "google-meu-negocio", label: "Google Meu Negócio",  icon: "📍" },
  { key: "instagram-bio",      label: "Instagram Bio",       icon: "📸" },
];

const BASE_URL = "https://crm-grupo-f5-c-c.vercel.app";

interface Campaign {
  id:   string;
  name: string;
  type: string;
}

interface Props {
  clientId:   string;
  campaigns:  Campaign[];
}

function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={copy}
      className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
      style={copied
        ? { background: "rgba(16,185,129,0.15)", color: "#10b981" }
        : { background: "rgba(139,92,246,0.15)", color: "#a78bfa" }
      }
    >
      {copied ? "✓ Copiado" : "Copiar"}
    </button>
  );
}

export function TrackingPanel({ clientId, campaigns: initialCampaigns }: Props) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [name, setName]           = useState("");
  const [type, setType]           = useState("frio");
  const [creating, setCreating]   = useState(false);
  const [selected, setSelected]   = useState<string>(initialCampaigns[0]?.id ?? "");

  async function createCampaign() {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res  = await fetch("/api/admin/tracking/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, name: name.trim(), type }),
      });
      const data = await res.json();
      if (data.id) {
        const next = [...campaigns, data];
        setCampaigns(next);
        setSelected(data.id);
        setName("");
      }
    } finally {
      setCreating(false);
    }
  }

  const activeCampaign = campaigns.find(c => c.id === selected);

  return (
    <div className="space-y-6">

      {/* Criar campanha */}
      <div className="bg-[#111] border border-[#262626] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1e1e1e] bg-[#0d0d0d]">
          <h2 className="text-sm font-bold text-white">Nova Campanha de Rastreamento</h2>
          <p className="text-xs text-gray-500 mt-0.5">Crie uma campanha para gerar as URLs de rastreamento</p>
        </div>
        <div className="p-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nome da campanha (ex: Implante Frio Janeiro)"
            className="flex-1 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500"
          />
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
          >
            <option value="frio">Lead Frio</option>
            <option value="remarketing">Remarketing</option>
          </select>
          <button
            onClick={createCampaign}
            disabled={creating || !name.trim()}
            className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white text-sm font-semibold transition-colors"
          >
            {creating ? "Criando..." : "Criar"}
          </button>
        </div>
      </div>

      {/* Selecionar campanha */}
      {campaigns.length > 0 && (
        <div className="bg-[#111] border border-[#262626] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1e1e1e] bg-[#0d0d0d]">
            <h2 className="text-sm font-bold text-white">URLs de Rastreamento</h2>
            <p className="text-xs text-gray-500 mt-0.5">Selecione a campanha e copie a URL para cada plataforma</p>
          </div>

          <div className="p-6 space-y-4">
            {/* Campaign selector */}
            <div className="flex flex-wrap gap-2">
              {campaigns.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    selected === c.id
                      ? "bg-violet-500/20 border-violet-500/50 text-violet-300"
                      : "bg-[#1a1a1a] border-[#2e2e2e] text-gray-400 hover:border-violet-500/30"
                  }`}
                >
                  {c.name}
                  <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                    c.type === "remarketing"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-blue-500/20 text-blue-400"
                  }`}>
                    {c.type === "remarketing" ? "Remarketing" : "Lead Frio"}
                  </span>
                </button>
              ))}
            </div>

            {/* URLs per platform */}
            {activeCampaign && (
              <div className="space-y-3 mt-2">
                {SOURCES.map(src => {
                  const url = `${BASE_URL}/r/${clientId}?camp=${activeCampaign.id}&src=${src.key}`;
                  return (
                    <div key={src.key} className="bg-[#0d0d0d] border border-[#1e1e1e] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{src.icon}</span>
                          <span className="text-sm font-semibold text-white">{src.label}</span>
                        </div>
                        <CopyButton url={url} />
                      </div>
                      <p className="text-[11px] text-gray-600 font-mono break-all leading-relaxed">{url}</p>
                    </div>
                  );
                })}

                <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <p className="text-xs text-blue-400 font-semibold mb-1">Como usar</p>
                  <ul className="text-xs text-blue-300/70 space-y-1 list-disc list-inside">
                    <li>Coloque a URL do <strong>Meta Ads</strong> como destino do anúncio de conversa</li>
                    <li>Coloque a URL do <strong>Google Ads</strong> na campanha de tráfego</li>
                    <li>Coloque a URL do <strong>Instagram Bio</strong> no link da bio</li>
                    <li>Coloque a URL do <strong>Google Meu Negócio</strong> no botão de contato</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
