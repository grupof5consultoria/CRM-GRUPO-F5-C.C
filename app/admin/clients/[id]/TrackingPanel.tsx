"use client";

import { useState } from "react";

// Quais plataformas aparecem para cada tipo de campanha
const TYPE_SOURCES: Record<string, string[]> = {
  frio:        ["google-ads", "meta-ads"],
  remarketing: ["google-ads", "meta-ads"],
  organico:    ["google-meu-negocio", "instagram-bio"],
};

const CAMPAIGN_TYPES = [
  { value: "frio",        label: "🧊 Lead Frio",      desc: "Tráfego pago para público novo — Google Ads e Meta Ads" },
  { value: "remarketing", label: "🎯 Remarketing",    desc: "Tráfego pago para quem já interagiu — Google Ads e Meta Ads" },
  { value: "organico",    label: "🌱 Orgânico",       desc: "Tráfego gratuito — Instagram Bio e Google Meu Negócio" },
];

const SOURCES = [
  {
    key:   "google-ads",
    label: "Google Ads",
    desc:  "Campanhas de tráfego pago no Google",
    color: "#1a73e8",
    bg:    "rgba(26,115,232,0.1)",
    border:"rgba(26,115,232,0.25)",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.25 17.292l-4.5-4.364 1.857-1.858 2.643 2.506 5.643-5.784 1.857 1.857-7.5 7.643z"/>
      </svg>
    ),
  },
  {
    key:   "meta-ads",
    label: "Meta Ads",
    desc:  "Anúncios no Facebook e Instagram",
    color: "#1877f2",
    bg:    "rgba(24,119,242,0.1)",
    border:"rgba(24,119,242,0.25)",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    key:   "google-meu-negocio",
    label: "Google Meu Negócio",
    desc:  "Perfil de empresa no Google Maps",
    color: "#34a853",
    bg:    "rgba(52,168,83,0.1)",
    border:"rgba(52,168,83,0.25)",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    ),
  },
  {
    key:   "instagram-bio",
    label: "Instagram Bio",
    desc:  "Link na bio do perfil do Instagram",
    color: "#e1306c",
    bg:    "rgba(225,48,108,0.1)",
    border:"rgba(225,48,108,0.25)",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
];

const BASE_URL = "https://crm-grupo-f5-c-c.vercel.app";

interface Campaign {
  id:             string;
  name:           string;
  type:           string;
  message?:       string;
  landingPageUrl?: string | null;
  createdAt?:     string;
  _count?:        { clicks: number };
}

interface ClientOption {
  id:               string;
  name:             string;
  trackingCampaigns: Campaign[];
}

interface Props {
  clients: ClientOption[];
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
      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
      style={copied
        ? { background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)" }
        : { background: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.3)" }
      }
    >
      {copied ? (
        <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Copiado</>
      ) : (
        <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copiar</>
      )}
    </button>
  );
}

export function TrackingPanel({ clients }: Props) {
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id ?? "");
  const [campaigns, setCampaigns] = useState<Campaign[]>(
    () => clients.find(c => c.id === clients[0]?.id)?.trackingCampaigns ?? []
  );
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    () => clients[0]?.trackingCampaigns[0]?.id ?? ""
  );
  const [name, setName]               = useState("");
  const [type, setType]               = useState("frio");
  const [message, setMessage]         = useState("");
  const [landingPageUrl, setLpUrl]    = useState("");
  const [creating, setCreating]       = useState(false);
  const [showForm, setShowForm]       = useState(false);

  const selectedType = CAMPAIGN_TYPES.find(t => t.value === type);

  function handleClientChange(id: string) {
    setSelectedClientId(id);
    const c = clients.find(cl => cl.id === id)?.trackingCampaigns ?? [];
    setCampaigns(c);
    setSelectedCampaignId(c[0]?.id ?? "");
    setShowForm(false);
  }

  async function createCampaign() {
    if (!name.trim() || !selectedClientId) return;
    setCreating(true);
    try {
      const res  = await fetch("/api/admin/tracking/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClientId, name: name.trim(), type, message, landingPageUrl }),
      });
      const data = await res.json();
      if (data.id) {
        const next = [{ ...data, _count: { clicks: 0 } }, ...campaigns];
        setCampaigns(next);
        setSelectedCampaignId(data.id);
        setName("");
        setMessage("");
        setLpUrl("");
        setShowForm(false);
      }
    } finally {
      setCreating(false);
    }
  }

  const activeCampaign = campaigns.find(c => c.id === selectedCampaignId);

  return (
    <div className="space-y-5">

      {/* Client selector + New Campaign button */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <select
            value={selectedClientId}
            onChange={e => handleClientChange(e.target.value)}
            className="w-full bg-[#111] border border-[#262626] hover:border-[#333] rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-violet-500 transition-colors"
          >
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: showForm ? "rgba(139,92,246,0.2)" : "linear-gradient(135deg, #7c3aed, #4f46e5)",
            color: "#fff",
            border: showForm ? "1px solid rgba(139,92,246,0.4)" : "none",
          }}
        >
          <svg className={`w-4 h-4 transition-transform ${showForm ? "rotate-45" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova Campanha
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-[#111] border border-violet-500/30 rounded-2xl p-5 space-y-4"
          style={{ boxShadow: "0 0 30px rgba(124,58,237,0.08)" }}>
          <p className="text-sm font-semibold text-white">Nova campanha de rastreamento</p>

          {/* Type selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {CAMPAIGN_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className="text-left p-3 rounded-xl border transition-all"
                style={type === t.value ? {
                  background: "rgba(124,58,237,0.12)",
                  borderColor: "rgba(124,58,237,0.4)",
                } : {
                  background: "#0d0d0d",
                  borderColor: "#2a2a2a",
                }}
              >
                <p className={`text-xs font-semibold ${type === t.value ? "text-violet-300" : "text-gray-400"}`}>{t.label}</p>
                <p className="text-[10px] text-gray-600 mt-0.5 leading-tight">{t.desc}</p>
              </button>
            ))}
          </div>

          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={type === "organico" ? "Ex: Bio Instagram Dra. Letícia" : "Ex: Implante Frio Janeiro"}
            className="w-full bg-[#0d0d0d] border border-[#2e2e2e] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
          />

          {/* Landing Page URL — só para orgânico */}
          {type === "organico" && (
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                URL da Landing Page <span className="text-gray-700">(opcional)</span>
              </label>
              <input
                type="url"
                value={landingPageUrl}
                onChange={e => setLpUrl(e.target.value)}
                placeholder="Ex: https://www.dracamilasantiago.com.br"
                className="w-full bg-[#0d0d0d] border border-[#2e2e2e] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors font-mono"
              />
              <p className="text-[11px] text-gray-700 mt-1">
                Se preenchido, o link leva o usuário para a LP com <span className="text-violet-400 font-mono">?src=</span> — ideal para Instagram Bio e Google Meu Negócio.
              </p>
            </div>
          )}

          {/* Mensagem WhatsApp — só sem LP */}
          {!(type === "organico" && landingPageUrl.trim()) && (
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                Mensagem pré-preenchida no WhatsApp
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={3}
                placeholder={
                  type === "organico"
                    ? "Ex: Olá! Vi o perfil da doutora no Instagram e gostaria de agendar uma avaliação."
                    : "Ex: Olá! Vi o anúncio e gostaria de saber mais sobre implantes dentários."
                }
                className="w-full bg-[#0d0d0d] border border-[#2e2e2e] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors resize-none"
              />
              <p className="text-[11px] text-gray-700 mt-1">
                O código de rastreamento <span className="text-violet-400 font-mono">[TRK:...]</span> é adicionado automaticamente ao final.
              </p>
            </div>
          )}

          <button
            onClick={createCampaign}
            disabled={creating || !name.trim()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40 transition-all"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
          >
            {creating ? "Criando..." : "Criar campanha"}
          </button>
        </div>
      )}

      {/* Empty state */}
      {campaigns.length === 0 && (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-16 text-center">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
            <svg className="w-7 h-7 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-white font-semibold mb-1">Nenhuma campanha criada</p>
          <p className="text-sm text-gray-600">Crie uma campanha para gerar os links de rastreamento por plataforma.</p>
        </div>
      )}

      {/* Campaign selector pills */}
      {campaigns.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {campaigns.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCampaignId(c.id)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all"
              style={selectedCampaignId === c.id ? {
                background: "rgba(124,58,237,0.15)",
                borderColor: "rgba(124,58,237,0.4)",
                color: "#c4b5fd",
              } : {
                background: "#111",
                borderColor: "#1e1e1e",
                color: "#6b7280",
              }}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${c.type === "remarketing" ? "bg-amber-400" : "bg-blue-400"}`} />
              {c.name}
              {c._count !== undefined && (
                <span className="ml-0.5 text-[10px] opacity-60">{c._count.clicks} cliques</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Platform URLs */}
      {activeCampaign && (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.4)" }}>

          {/* Campaign header */}
          {(() => {
            const typeInfo = CAMPAIGN_TYPES.find(t => t.value === activeCampaign.type);
            const activeSources = TYPE_SOURCES[activeCampaign.type] ?? Object.keys(TYPE_SOURCES).flatMap(k => TYPE_SOURCES[k]);
            return (
              <>
                <div className="px-6 py-4 border-b border-[#1e1e1e] flex items-center justify-between"
                  style={{ background: "linear-gradient(90deg, rgba(124,58,237,0.08), transparent)" }}>
                  <div>
                    <p className="text-sm font-bold text-white">{activeCampaign.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        activeCampaign.type === "remarketing" ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                        : activeCampaign.type === "organico"  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                        : "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                      }`}>
                        {typeInfo?.label ?? activeCampaign.type}
                      </span>
                      {activeCampaign._count !== undefined && (
                        <span className="text-[10px] text-gray-600">{activeCampaign._count.clicks} clique{activeCampaign._count.clicks !== 1 ? "s" : ""} registrado{activeCampaign._count.clicks !== 1 ? "s" : ""}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">{activeSources.length} URL{activeSources.length !== 1 ? "s" : ""} gerada{activeSources.length !== 1 ? "s" : ""}</p>
                </div>

                {/* Platform cards */}
                <div className="divide-y divide-[#1a1a1a]">
                  {SOURCES.filter(s => activeSources.includes(s.key)).map(src => {
                    const url = `${BASE_URL}/r/${selectedClientId}?camp=${activeCampaign.id}&src=${src.key}`;
                    return (
                      <div key={src.key} className="px-6 py-4 flex items-center gap-4 group hover:bg-white/[0.02] transition-colors">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                          style={{ background: src.bg, border: `1px solid ${src.border}`, color: src.color }}>
                          {src.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-semibold text-white">{src.label}</p>
                            {activeCampaign.landingPageUrl ? (
                              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">→ Landing Page</span>
                            ) : (
                              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">→ WhatsApp</span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-600 font-mono truncate">{url}</p>
                        </div>
                        <CopyButton url={url} />
                      </div>
                    );
                  })}
                </div>

                {/* Footer tip */}
                <div className="px-6 py-4 border-t border-[#1a1a1a] bg-[#0d0d0d]">
                  <div className="flex items-start gap-2.5">
                    <span className="text-base mt-0.5">💡</span>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>Cada clique captura <span className="text-gray-400">cidade, estado e dispositivo</span> automaticamente via IP.</p>
                      {activeCampaign.type === "organico"
                        ? <p>Cole a URL do <span className="text-gray-400">Instagram Bio</span> no link da bio e a do <span className="text-gray-400">Google Meu Negócio</span> no botão de contato do perfil.</p>
                        : <p>Cole a URL do <span className="text-gray-400">Meta Ads</span> como destino do anúncio e a do <span className="text-gray-400">Google Ads</span> na campanha de tráfego.</p>
                      }
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
