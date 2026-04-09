"use client";

import { useState } from "react";
import { useActionState } from "react";
import { saveClientCredentialsAction } from "@/app/admin/metrics/actions";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WhatsAppAccount {
  id: string;
  phoneNumber: string;
  phoneNumberId: string;
  displayName: string | null;
  status: string;
  verifiedAt: Date | null;
  _count: { conversations: number };
}

interface Client {
  id: string;
  name: string;
  metaAdAccountId: string | null;
  metaAccessToken: string | null;
  googleAdsCustomerId: string | null;
  googleRefreshToken: string | null;
  whatsappAccounts: WhatsAppAccount[];
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function ConnectedBadge() {
  return (
    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      Conectado
    </span>
  );
}
function NotConnectedBadge() {
  return (
    <span className="text-[10px] font-bold text-gray-600 bg-[#1a1a1a] border border-[#2a2a2a] px-2 py-0.5 rounded-full">
      Não conectado
    </span>
  );
}

// ─── Meta form (reuses existing server action) ───────────────────────────────

function MetaForm({ client, onClose }: { client: Client; onClose: () => void }) {
  const [state, action, pending] = useActionState(saveClientCredentialsAction, {});

  return (
    <form action={action} className="space-y-3 mt-4 pt-4 border-t border-[#2a2a2a]">
      <input type="hidden" name="clientId" value={client.id} />
      {/* Clear google fields so they aren't accidentally wiped */}
      <input type="hidden" name="googleAdsCustomerId" value={client.googleAdsCustomerId ?? ""} />

      <p className="text-xs font-semibold text-blue-400 mb-3">Configurar Meta Ads</p>

      <a
        href={`/api/auth/meta?clientId=${client.id}`}
        className="flex items-center justify-center gap-2 w-full py-2 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold hover:bg-blue-500/20 transition-all"
      >
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        {client.metaAdAccountId ? "Reconectar via Meta" : "Conectar via Meta"}
      </a>

      <p className="text-[10px] text-gray-700 text-center">ou preencha manualmente</p>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">ID da Conta de Anúncio</label>
        <input
          name="metaAdAccountId"
          defaultValue={client.metaAdAccountId ?? ""}
          placeholder="ex: 123456789 (sem act_)"
          className="w-full bg-[#111] border border-[#333] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-blue-500/50"
        />
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Access Token (long-lived)</label>
        <input
          name="metaAccessToken"
          type="password"
          placeholder="••••••••••••"
          className="w-full bg-[#111] border border-[#333] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-blue-500/50"
        />
        <p className="text-[10px] text-gray-700 mt-1">Deixe em branco para manter o token atual.</p>
      </div>

      {state?.error && <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{state.error}</p>}
      {state?.success && <p className="text-xs text-emerald-400 bg-emerald-500/10 rounded-lg px-3 py-2">Salvo!</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors"
        >
          {pending ? "Salvando..." : "Salvar"}
        </button>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs text-gray-500 hover:text-gray-300 transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  );
}

// ─── Google form ──────────────────────────────────────────────────────────────

function GoogleForm({ client, onClose }: { client: Client; onClose: () => void }) {
  const [state, action, pending] = useActionState(saveClientCredentialsAction, {});

  return (
    <form action={action} className="space-y-3 mt-4 pt-4 border-t border-[#2a2a2a]">
      <input type="hidden" name="clientId" value={client.id} />
      {/* Preserve meta fields */}
      <input type="hidden" name="metaAdAccountId" value={client.metaAdAccountId ?? ""} />

      <p className="text-xs font-semibold text-red-400 mb-3">Configurar Google Ads</p>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">Customer ID</label>
        <input
          name="googleAdsCustomerId"
          defaultValue={client.googleAdsCustomerId ?? ""}
          placeholder="ex: 123-456-7890"
          className="w-full bg-[#111] border border-[#333] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-red-500/50"
        />
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Refresh Token</label>
        <input
          name="googleRefreshToken"
          type="password"
          placeholder="••••••••••••"
          className="w-full bg-[#111] border border-[#333] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-red-500/50"
        />
        <p className="text-[10px] text-gray-700 mt-1">Deixe em branco para manter o token atual.</p>
      </div>

      {state?.error && <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{state.error}</p>}
      {state?.success && <p className="text-xs text-emerald-400 bg-emerald-500/10 rounded-lg px-3 py-2">Salvo!</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 transition-colors"
        >
          {pending ? "Salvando..." : "Salvar"}
        </button>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs text-gray-500 hover:text-gray-300 transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  );
}

// ─── WhatsApp form ────────────────────────────────────────────────────────────

function WhatsAppForm({ client, onClose }: { client: Client; onClose: () => void }) {
  const [form, setForm] = useState({ phoneNumber: "", phoneNumberId: "", accessToken: "", wabaId: "", displayName: "" });
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ error?: string; success?: string } | null>(null);

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.phoneNumber || !form.phoneNumberId || !form.accessToken) {
      setResult({ error: "Preencha todos os campos obrigatórios." });
      return;
    }
    setSaving(true);
    setResult(null);
    const res = await fetch("/api/admin/whatsapp/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: client.id, ...form }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.error) { setResult({ error: data.error }); return; }
    setResult({ success: `${data.account.phoneNumber} conectado!` });
    setTimeout(() => { onClose(); window.location.reload(); }, 1200);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-4 pt-4 border-t border-[#2a2a2a]">
      <p className="text-xs font-semibold text-emerald-400 mb-3">Conectar WhatsApp</p>

      <div className="bg-[#111] border border-[#2a2a2a] rounded-xl px-3 py-3 text-xs text-gray-600 space-y-1">
        <p className="text-gray-500 font-semibold">Como obter os dados:</p>
        <p>1. Acesse <span className="text-gray-400">developers.facebook.com</span> → Seu App → WhatsApp</p>
        <p>2. Em "Phone Numbers", copie o <span className="text-gray-400">Phone Number ID</span></p>
        <p>3. Gere um token permanente em "System Users" do Business Manager</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Número *</label>
          <input value={form.phoneNumber} onChange={e => set("phoneNumber", e.target.value)}
            placeholder="+5511999999999"
            className="w-full bg-[#111] border border-[#333] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50" required />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Nome</label>
          <input value={form.displayName} onChange={e => set("displayName", e.target.value)}
            placeholder="Dra. Ana"
            className="w-full bg-[#111] border border-[#333] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Phone Number ID *</label>
          <input value={form.phoneNumberId} onChange={e => set("phoneNumberId", e.target.value)}
            placeholder="12345678901234"
            className="w-full bg-[#111] border border-[#333] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 font-mono" required />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">WABA ID</label>
          <input value={form.wabaId} onChange={e => set("wabaId", e.target.value)}
            placeholder="Opcional"
            className="w-full bg-[#111] border border-[#333] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 font-mono" />
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Access Token *</label>
        <input value={form.accessToken} onChange={e => set("accessToken", e.target.value)} type="password"
          placeholder="EAAxxxxxxx..."
          className="w-full bg-[#111] border border-[#333] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 font-mono" required />
      </div>

      {result?.error && <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{result.error}</p>}
      {result?.success && <p className="text-xs text-emerald-400 bg-emerald-500/10 rounded-lg px-3 py-2">{result.success}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={saving}
          className="flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-colors">
          {saving ? "Verificando..." : "Verificar e Conectar"}
        </button>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs text-gray-500 hover:text-gray-300 transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  );
}

// ─── Platform slot ────────────────────────────────────────────────────────────

type PlatformKey = "meta" | "google" | "whatsapp";

interface PlatformSlotProps {
  label: string;
  color: string;          // tailwind text color
  accentColor: string;    // tailwind bg/border color for button
  connected: boolean;
  detail?: string;        // e.g. "act_12345" or "+5511..."
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  icon: React.ReactNode;
}

function PlatformSlot({ label, color, accentColor, connected, detail, isOpen, onToggle, children, icon }: PlatformSlotProps) {
  return (
    <div className={`rounded-2xl border transition-colors ${isOpen ? "border-[#333] bg-[#141414]" : "border-[#222] bg-[#111]"}`}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${connected ? `bg-${accentColor}-500/10 border border-${accentColor}-500/20` : "bg-[#1a1a1a] border border-[#2a2a2a]"}`}>
            <span className={connected ? color : "text-gray-700"}>{icon}</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-white">{label}</p>
            {detail && <p className="text-[10px] text-gray-600 font-mono mt-0.5">{detail}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {connected ? <ConnectedBadge /> : <NotConnectedBadge />}
          <button
            onClick={onToggle}
            className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors px-2 py-1 rounded-lg hover:bg-[#1a1a1a]"
          >
            {isOpen ? "Fechar" : connected ? "Editar" : "Conectar"}
          </button>
        </div>
      </div>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

// ─── Client card ──────────────────────────────────────────────────────────────

function ClientCard({ client }: { client: Client }) {
  const [openPlatform, setOpenPlatform] = useState<PlatformKey | null>(null);

  function toggle(p: PlatformKey) {
    setOpenPlatform(prev => prev === p ? null : p);
  }

  const hasMeta    = !!client.metaAdAccountId;
  const hasGoogle  = !!client.googleAdsCustomerId;
  const hasWA      = client.whatsappAccounts.some(a => a.status === "active");

  const connectedCount = [hasMeta, hasGoogle, hasWA].filter(Boolean).length;

  return (
    <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl overflow-hidden">
      {/* Client header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#262626]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <span className="text-sm font-bold text-violet-400">{client.name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="text-sm font-bold text-white">{client.name}</p>
            <p className="text-[10px] text-gray-600">{connectedCount}/3 integrações ativas</p>
          </div>
        </div>
        {/* Connection dots */}
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${hasMeta ? "bg-blue-400" : "bg-[#2a2a2a]"}`} title="Meta Ads" />
          <span className={`w-2 h-2 rounded-full ${hasGoogle ? "bg-red-400" : "bg-[#2a2a2a]"}`} title="Google Ads" />
          <span className={`w-2 h-2 rounded-full ${hasWA ? "bg-emerald-400" : "bg-[#2a2a2a]"}`} title="WhatsApp" />
        </div>
      </div>

      {/* Platforms */}
      <div className="p-4 space-y-3">
        {/* Meta */}
        <PlatformSlot
          label="Meta Ads"
          color="text-blue-400"
          accentColor="blue"
          connected={hasMeta}
          detail={hasMeta ? `act_${client.metaAdAccountId}` : undefined}
          isOpen={openPlatform === "meta"}
          onToggle={() => toggle("meta")}
          icon={
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          }
        >
          <MetaForm client={client} onClose={() => setOpenPlatform(null)} />
        </PlatformSlot>

        {/* Google */}
        <PlatformSlot
          label="Google Ads"
          color="text-red-400"
          accentColor="red"
          connected={hasGoogle}
          detail={hasGoogle ? client.googleAdsCustomerId! : undefined}
          isOpen={openPlatform === "google"}
          onToggle={() => toggle("google")}
          icon={
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z"/>
            </svg>
          }
        >
          <GoogleForm client={client} onClose={() => setOpenPlatform(null)} />
        </PlatformSlot>

        {/* WhatsApp */}
        <PlatformSlot
          label="WhatsApp Business"
          color="text-emerald-400"
          accentColor="emerald"
          connected={hasWA}
          detail={hasWA ? client.whatsappAccounts.find(a => a.status === "active")?.phoneNumber : undefined}
          isOpen={openPlatform === "whatsapp"}
          onToggle={() => toggle("whatsapp")}
          icon={
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          }
        >
          {/* Show existing accounts first */}
          {client.whatsappAccounts.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[#2a2a2a] space-y-2">
              {client.whatsappAccounts.map(acc => (
                <div key={acc.id} className="flex items-center justify-between bg-[#0d0d0d] rounded-xl px-3 py-2">
                  <div>
                    <p className="text-xs font-semibold text-white">{acc.displayName ?? acc.phoneNumber}</p>
                    <p className="text-[10px] text-gray-600 font-mono">{acc.phoneNumber} · ID {acc.phoneNumberId.slice(-8)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">{acc._count.conversations}</p>
                    <p className="text-[10px] text-gray-600">conv.</p>
                  </div>
                </div>
              ))}
              <p className="text-[10px] text-gray-700 text-center mt-2">Adicionar outro número:</p>
            </div>
          )}
          <WhatsAppForm client={client} onClose={() => setOpenPlatform(null)} />
        </PlatformSlot>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  clients: Client[];
}

export function ConnectionsManager({ clients }: Props) {
  const [search, setSearch] = useState("");

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // Summary stats
  const totalMeta    = clients.filter(c => c.metaAdAccountId).length;
  const totalGoogle  = clients.filter(c => c.googleAdsCustomerId).length;
  const totalWA      = clients.filter(c => c.whatsappAccounts.some(a => a.status === "active")).length;

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Meta Ads", count: totalMeta, total: clients.length, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
          { label: "Google Ads", count: totalGoogle, total: clients.length, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
          { label: "WhatsApp", count: totalWA, total: clients.length, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl px-5 py-4`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}<span className="text-sm font-normal text-gray-600">/{s.total}</span></p>
            <p className="text-xs text-gray-600 mt-0.5">clientes conectados</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-[#1a1a1a] border border-[#262626] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50"
        />
      </div>

      {/* Client cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(client => (
          <ClientCard key={client.id} client={client} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-10">
          <p className="text-sm text-gray-600">Nenhum cliente encontrado.</p>
        </div>
      )}
    </div>
  );
}
