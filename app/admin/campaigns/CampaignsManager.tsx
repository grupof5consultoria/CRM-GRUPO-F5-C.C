"use client";

import { useState } from "react";

const ORIGIN_OPTIONS = [
  { value: "meta_ads",       label: "Meta Ads (anúncio pago)",     color: "bg-blue-500" },
  { value: "instagram",      label: "Instagram (orgânico)",         color: "bg-pink-500" },
  { value: "google_ads",     label: "Google Ads (anúncio pago)",    color: "bg-[#1a73e8]" },
  { value: "google_organic", label: "Google (orgânico)",            color: "bg-[#34A853]" },
  { value: "referral",       label: "Indicação",                    color: "bg-violet-500" },
  { value: "other",          label: "Outro",                        color: "bg-gray-500" },
];

interface Account { id: string; phoneNumber: string; displayName: string | null }
interface Campaign {
  id: string;
  name: string;
  origin: string;
  campaignCode: string;
  defaultMessage: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  isActive: boolean;
  createdAt: string;
  whatsAppAccount: { phoneNumber: string; displayName: string | null } | null;
}
interface Client {
  id: string;
  name: string;
  whatsappAccounts: Account[];
  whatsappCampaigns: Campaign[];
}

function buildWaLink(phone: string, message: string, code: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  const fullMessage = `${message} [ref:${code}]`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(fullMessage)}`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors flex-shrink-0"
    >
      {copied ? (
        <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Copiado!</>
      ) : (
        <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copiar link</>
      )}
    </button>
  );
}

export function CampaignsManager({ clients }: { clients: Client[] }) {
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id ?? "");
  const [campaigns, setCampaigns] = useState<Campaign[]>(() =>
    clients.find(c => c.id === clients[0]?.id)?.whatsappCampaigns ?? []
  );
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    origin: "meta_ads",
    whatsAppAccountId: "",
    defaultMessage: "",
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    utmContent: "",
  });

  const selectedClient = clients.find(c => c.id === selectedClientId);

  function handleClientChange(id: string) {
    setSelectedClientId(id);
    setCampaigns(clients.find(c => c.id === id)?.whatsappCampaigns ?? []);
    setShowForm(false);
    setForm({ name: "", origin: "meta_ads", whatsAppAccountId: "", defaultMessage: "", utmSource: "", utmMedium: "", utmCampaign: "", utmContent: "" });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.defaultMessage) { setError("Nome e mensagem são obrigatórios"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, clientId: selectedClientId, whatsAppAccountId: form.whatsAppAccountId || null }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setCampaigns(prev => [data.campaign, ...prev]);
      setShowForm(false);
      setForm({ name: "", origin: "meta_ads", whatsAppAccountId: "", defaultMessage: "", utmSource: "", utmMedium: "", utmCampaign: "", utmContent: "" });
    } catch {
      setError("Erro ao criar campanha");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir campanha? O link deixará de funcionar.")) return;
    await fetch(`/api/admin/campaigns?id=${id}`, { method: "DELETE" });
    setCampaigns(prev => prev.filter(c => c.id !== id));
  }

  const inputClass = "w-full bg-[#111] border border-[#333] rounded-xl px-3 py-2.5 text-sm text-gray-300 placeholder-gray-700 focus:outline-none focus:border-violet-500";

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Client selector */}
      <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-gray-500 mb-1.5">Cliente</label>
            <select
              value={selectedClientId}
              onChange={e => handleClientChange(e.target.value)}
              className={inputClass}
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="pt-5">
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nova Campanha
            </button>
          </div>
        </div>
      </div>

      {/* WhatsApp not connected warning */}
      {selectedClient && selectedClient.whatsappAccounts.length === 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-sm text-amber-400">
          Este cliente não tem WhatsApp conectado. Vá em <strong>Conexões</strong> para conectar primeiro.
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="bg-[#1a1a1a] border border-violet-500/30 rounded-2xl p-5 space-y-4">
          <p className="text-sm font-semibold text-white">Nova Campanha — {selectedClient?.name}</p>
          {error && <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">{error}</p>}

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Nome da campanha</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Implante Dezembro 2025"
                  className={inputClass}
                />
              </div>

              {/* Origin */}
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Canal de origem</label>
                <select
                  value={form.origin}
                  onChange={e => setForm(f => ({ ...f, origin: e.target.value }))}
                  className={inputClass}
                >
                  {ORIGIN_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* WhatsApp account */}
              {selectedClient && selectedClient.whatsappAccounts.length > 0 && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Número do WhatsApp</label>
                  <select
                    value={form.whatsAppAccountId}
                    onChange={e => setForm(f => ({ ...f, whatsAppAccountId: e.target.value }))}
                    className={inputClass}
                  >
                    <option value="">Selecionar número</option>
                    {selectedClient.whatsappAccounts.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.displayName ? `${a.displayName} — ` : ""}{a.phoneNumber}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Default message */}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Mensagem padrão</label>
              <textarea
                value={form.defaultMessage}
                onChange={e => setForm(f => ({ ...f, defaultMessage: e.target.value }))}
                placeholder="Ex: Olá! Vi o anúncio e gostaria de saber mais sobre os tratamentos disponíveis."
                rows={3}
                className={inputClass + " resize-none"}
              />
              <p className="text-xs text-gray-600 mt-1">O código de rastreamento <code className="text-violet-400">[ref:XXXXXX]</code> será adicionado automaticamente ao final.</p>
            </div>

            {/* UTM fields */}
            <details className="group">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400 select-none">
                Parâmetros UTM (opcional) <span className="text-gray-700">▸</span>
              </summary>
              <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { key: "utmSource",   label: "utm_source",   placeholder: "meta" },
                  { key: "utmMedium",   label: "utm_medium",   placeholder: "paid" },
                  { key: "utmCampaign", label: "utm_campaign", placeholder: "implante-dez" },
                  { key: "utmContent",  label: "utm_content",  placeholder: "video-1" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs text-gray-600 mb-1">{label}</label>
                    <input
                      value={form[key as keyof typeof form]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
            </details>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                {saving ? "Criando..." : "Criar campanha"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setError(""); }}
                className="px-5 py-2.5 rounded-xl bg-[#262626] hover:bg-[#333] text-gray-400 text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Campaign list */}
      <div className="space-y-3">
        {campaigns.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-12 text-center">
            <p className="text-sm text-gray-600">Nenhuma campanha criada para este cliente.</p>
            <p className="text-xs text-gray-700 mt-1">Crie uma campanha para gerar o link rastreado de WhatsApp.</p>
          </div>
        ) : (
          campaigns.map(campaign => {
            const account = campaign.whatsAppAccount;
            const waLink = account ? buildWaLink(account.phoneNumber, campaign.defaultMessage, campaign.campaignCode) : null;
            const originOpt = ORIGIN_OPTIONS.find(o => o.value === campaign.origin);
            const isExpanded = expandedId === campaign.id;

            return (
              <div key={campaign.id} className="bg-[#1a1a1a] border border-[#262626] rounded-2xl overflow-hidden">
                {/* Header row */}
                <div className="flex items-center gap-4 px-4 py-4">
                  {/* Origin dot */}
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${originOpt?.color ?? "bg-gray-500"}`} />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{campaign.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {originOpt?.label} · código <code className="text-violet-400 font-mono">{campaign.campaignCode}</code>
                      {account && <> · {account.displayName ?? account.phoneNumber}</>}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {waLink ? (
                      <CopyButton text={waLink} />
                    ) : (
                      <span className="text-xs text-amber-500/70 px-3 py-1.5 rounded-lg bg-amber-500/10">sem número</span>
                    )}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : campaign.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-300 hover:bg-[#262626] transition-colors"
                    >
                      <svg className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(campaign.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-700 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-[#262626] px-4 py-4 space-y-3 bg-[#111]">
                    {/* Preview message */}
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Mensagem que o lead enviará:</p>
                      <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl px-3 py-2.5 text-sm text-gray-300">
                        {campaign.defaultMessage} <span className="text-violet-400/60 font-mono text-xs">[ref:{campaign.campaignCode}]</span>
                      </div>
                    </div>

                    {/* wa.me link */}
                    {waLink && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Link gerado:</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-[#1a1a1a] border border-[#262626] rounded-xl px-3 py-2 overflow-hidden">
                            <p className="text-xs font-mono text-gray-500 truncate">{waLink}</p>
                          </div>
                          <CopyButton text={waLink} />
                        </div>
                      </div>
                    )}

                    {/* UTM params */}
                    {(campaign.utmSource || campaign.utmMedium || campaign.utmCampaign || campaign.utmContent) && (
                      <div className="flex flex-wrap gap-2">
                        {campaign.utmSource   && <span className="text-xs bg-[#262626] text-gray-400 px-2 py-1 rounded-lg font-mono">utm_source={campaign.utmSource}</span>}
                        {campaign.utmMedium   && <span className="text-xs bg-[#262626] text-gray-400 px-2 py-1 rounded-lg font-mono">utm_medium={campaign.utmMedium}</span>}
                        {campaign.utmCampaign && <span className="text-xs bg-[#262626] text-gray-400 px-2 py-1 rounded-lg font-mono">utm_campaign={campaign.utmCampaign}</span>}
                        {campaign.utmContent  && <span className="text-xs bg-[#262626] text-gray-400 px-2 py-1 rounded-lg font-mono">utm_content={campaign.utmContent}</span>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
