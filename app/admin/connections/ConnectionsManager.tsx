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

type PlatformKey = "meta" | "google" | "whatsapp";

// ─── Platform forms ───────────────────────────────────────────────────────────

function MetaForm({ client, onClose }: { client: Client; onClose: () => void }) {
  const [state, action, pending] = useActionState(saveClientCredentialsAction, {});
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="clientId" value={client.id} />
      <input type="hidden" name="googleAdsCustomerId" value={client.googleAdsCustomerId ?? ""} />
      <a href={`/api/auth/meta?clientId=${client.id}`}
        className="flex items-center justify-center gap-2 w-full py-2 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold hover:bg-blue-500/20 transition-all">
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        {client.metaAdAccountId ? "Reconectar via Meta" : "Conectar via Meta"}
      </a>
      <p className="text-[10px] text-gray-700 text-center">ou preencha manualmente</p>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">ID da Conta de Anúncio</label>
        <input name="metaAdAccountId" defaultValue={client.metaAdAccountId ?? ""} placeholder="ex: 123456789"
          className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-blue-500/50" />
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Access Token</label>
        <input name="metaAccessToken" type="password" placeholder="••••••••••••"
          className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-blue-500/50" />
        <p className="text-[10px] text-gray-700 mt-1">Deixe em branco para manter o token atual.</p>
      </div>
      {state?.error && <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{state.error}</p>}
      {state?.success && <p className="text-xs text-emerald-400 bg-emerald-500/10 rounded-lg px-3 py-2">Salvo!</p>}
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={pending}
          className="flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors">
          {pending ? "Salvando..." : "Salvar"}
        </button>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs text-gray-600 hover:text-gray-300 transition-colors border border-[#2a2a2a] hover:border-[#3a3a3a]">
          Cancelar
        </button>
      </div>
    </form>
  );
}

function GoogleForm({ client, onClose }: { client: Client; onClose: () => void }) {
  const [state, action, pending] = useActionState(saveClientCredentialsAction, {});
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="clientId" value={client.id} />
      <input type="hidden" name="metaAdAccountId" value={client.metaAdAccountId ?? ""} />
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Customer ID</label>
        <input name="googleAdsCustomerId" defaultValue={client.googleAdsCustomerId ?? ""} placeholder="ex: 123-456-7890"
          className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-red-500/50" />
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Refresh Token</label>
        <input name="googleRefreshToken" type="password" placeholder="••••••••••••"
          className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-red-500/50" />
        <p className="text-[10px] text-gray-700 mt-1">Deixe em branco para manter o token atual.</p>
      </div>
      {state?.error && <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{state.error}</p>}
      {state?.success && <p className="text-xs text-emerald-400 bg-emerald-500/10 rounded-lg px-3 py-2">Salvo!</p>}
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={pending}
          className="flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 transition-colors">
          {pending ? "Salvando..." : "Salvar"}
        </button>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs text-gray-600 hover:text-gray-300 transition-colors border border-[#2a2a2a] hover:border-[#3a3a3a]">
          Cancelar
        </button>
      </div>
    </form>
  );
}

function WhatsAppForm({ client, onClose }: { client: Client; onClose: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [numbers, setNumbers] = useState<{ phoneNumberId: string; phoneNumber: string; displayName: string; verificationStatus: string }[]>([]);
  const [selectedNumberId, setSelectedNumberId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLoadNumbers() {
    setLoading(true); setError(null);
    const res = await fetch("/api/admin/whatsapp/list-numbers");
    const data = await res.json();
    setLoading(false);
    if (data.error) { setError(data.error); return; }
    setNumbers(data.numbers ?? []);
  }

  // Load numbers on mount
  useState(() => { handleLoadNumbers(); });

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedNumberId) { setError("Selecione um número."); return; }
    setLoading(true); setError(null);
    const res = await fetch("/api/admin/whatsapp/request-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumberId: selectedNumberId }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.error) { setError(data.error); return; }
    setStep(2);
  }

  async function handleConfirmCode(e: React.FormEvent) {
    e.preventDefault();
    if (!code) { setError("Digite o código."); return; }
    setLoading(true); setError(null);
    const res = await fetch("/api/admin/whatsapp/confirm-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: client.id, phoneNumber, displayName, phoneNumberId: selectedNumberId, code }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.error) { setError(data.error); return; }
    setStep(3);
    setTimeout(() => { onClose(); window.location.reload(); }, 2000);
  }

  const selectedNum = numbers.find(n => n.phoneNumberId === selectedNumberId);

  return (
    <div className="space-y-4">
      {/* Steps indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
              step === s ? "bg-emerald-500 text-white" :
              step > s  ? "bg-emerald-500/20 text-emerald-400" :
              "bg-[#1a1a1a] text-gray-600"
            }`}>{step > s ? "✓" : s}</div>
            {s < 3 && <div className={`h-px w-8 ${step > s ? "bg-emerald-500/40" : "bg-[#2a2a2a]"}`} />}
          </div>
        ))}
        <span className="text-xs text-gray-600 ml-1">
          {step === 1 ? "Selecionar número" : step === 2 ? "Confirmar SMS" : "Conectado!"}
        </span>
      </div>

      {/* Step 1 — Select number from WABA */}
      {step === 1 && (
        <form onSubmit={handleSendCode} className="space-y-3">
          {loading && <p className="text-xs text-gray-500 animate-pulse">Buscando números do WABA...</p>}

          {!loading && numbers.length === 0 && !error && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 space-y-2">
              <p className="text-xs text-amber-400 font-semibold">Nenhum número encontrado no WABA</p>
              <p className="text-xs text-gray-500">Primeiro adicione o número no Meta Business Manager:</p>
              <ol className="text-xs text-gray-500 list-decimal list-inside space-y-1">
                <li>Acesse <strong className="text-gray-400">business.facebook.com</strong></li>
                <li>Configurações → WhatsApp Accounts → seu WABA</li>
                <li>Adicionar número de telefone</li>
                <li>Volte aqui e clique em <strong className="text-gray-400">Atualizar</strong></li>
              </ol>
              <button type="button" onClick={handleLoadNumbers}
                className="text-xs text-emerald-400 hover:text-emerald-300 underline">
                Atualizar lista →
              </button>
            </div>
          )}

          {numbers.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs text-gray-500 block">Selecione o número a conectar</label>
              {numbers.map(n => (
                <label key={n.phoneNumberId} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedNumberId === n.phoneNumberId
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-[#2a2a2a] hover:border-[#3a3a3a]"
                }`}>
                  <input type="radio" name="number" value={n.phoneNumberId}
                    checked={selectedNumberId === n.phoneNumberId}
                    onChange={() => {
                      setSelectedNumberId(n.phoneNumberId);
                      setPhoneNumber(n.phoneNumber);
                      setDisplayName(n.displayName);
                    }}
                    className="accent-emerald-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium">{n.phoneNumber}</p>
                    <p className="text-xs text-gray-500">{n.displayName}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${
                    n.verificationStatus === "VERIFIED"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-amber-500/10 text-amber-400"
                  }`}>
                    {n.verificationStatus === "VERIFIED" ? "Verificado" : "Não verificado"}
                  </span>
                </label>
              ))}
              <button type="button" onClick={handleLoadNumbers}
                className="text-xs text-gray-600 hover:text-gray-400 underline">
                Atualizar lista
              </button>
            </div>
          )}

          {error && <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-2">
            <button type="submit" disabled={loading || !selectedNumberId}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-colors">
              {loading ? "Enviando SMS..." : "Enviar código SMS →"}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs text-gray-600 hover:text-gray-300 border border-[#2a2a2a]">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Step 2 — SMS code */}
      {step === 2 && (
        <form onSubmit={handleConfirmCode} className="space-y-3">
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-3">
            <p className="text-xs text-emerald-400 font-semibold">SMS enviado para {selectedNum?.phoneNumber ?? phoneNumber}</p>
            <p className="text-xs text-gray-600 mt-0.5">Peça o código de verificação para a doutora e digite abaixo.</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Código recebido por SMS *</label>
            <input value={code} onChange={e => setCode(e.target.value)}
              placeholder="123456" maxLength={6} autoFocus
              className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl px-3 py-2 text-2xl font-bold text-white text-center placeholder-gray-700 tracking-widest focus:outline-none focus:border-emerald-500/50" required />
          </div>
          {error && <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-colors">
              {loading ? "Verificando..." : "Confirmar e Conectar →"}
            </button>
            <button type="button" onClick={() => { setStep(1); setError(null); }}
              className="px-4 py-2 rounded-xl text-xs text-gray-600 hover:text-gray-300 border border-[#2a2a2a]">
              Voltar
            </button>
          </div>
        </form>
      )}

      {/* Step 3 — Success */}
      {step === 3 && (
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-bold text-white">WhatsApp conectado!</p>
          <p className="text-xs text-gray-600 mt-1">{phoneNumber} está ativo e rastreando conversas.</p>
        </div>
      )}
    </div>
  );
}

// ─── Platform cell (table column) ────────────────────────────────────────────

interface PlatformCellProps {
  connected: boolean;
  detail?: string;
  color: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
  isOpen: boolean;
  onToggle: () => void;
}

function PlatformCell({ connected, detail, color, bgColor, borderColor, dotColor, isOpen, onToggle }: PlatformCellProps) {
  return (
    <div className="flex flex-col items-start gap-2">
      {connected ? (
        <>
          <span className={`flex items-center gap-2 text-xs font-bold ${color} ${bgColor} px-3 py-1.5 rounded-xl border ${borderColor}`}>
            <span className={`w-2 h-2 rounded-full ${dotColor} animate-pulse`} />
            Ativo
          </span>
          {detail && <p className="text-xs text-gray-500 font-mono">{detail}</p>}
          <button onClick={onToggle}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
              isOpen
                ? "text-gray-400 border-[#333] bg-[#1a1a1a]"
                : "text-gray-400 border-[#2a2a2a] hover:border-[#444] hover:text-white bg-[#161616]"
            }`}>
            {isOpen ? "↑ Fechar" : "Editar"}
          </button>
        </>
      ) : (
        <button onClick={onToggle}
          className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border transition-all ${
            isOpen
              ? `${color} ${bgColor} ${borderColor}`
              : `text-gray-500 border-[#2a2a2a] hover:${color} hover:${bgColor} hover:${borderColor} bg-[#141414]`
          }`}>
          <span className="text-lg leading-none">{isOpen ? "×" : "+"}</span>
          {isOpen ? "Cancelar" : "Conectar"}
        </button>
      )}
    </div>
  );
}

// ─── Client row ───────────────────────────────────────────────────────────────

function ClientRow({ client, index }: { client: Client; index: number }) {
  const [openPlatform, setOpenPlatform] = useState<PlatformKey | null>(null);

  const hasMeta   = !!client.metaAdAccountId;
  const hasGoogle = !!client.googleAdsCustomerId;
  const hasWA     = client.whatsappAccounts.some(a => a.status === "active");
  const connected = [hasMeta, hasGoogle, hasWA].filter(Boolean).length;

  function toggle(p: PlatformKey) { setOpenPlatform(prev => prev === p ? null : p); }

  const initials = client.name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

  return (
    <>
      {/* Main row */}
      <tr className={`border-b border-[#1a1a1a] hover:bg-[#141414] transition-colors group ${openPlatform ? "bg-[#141414]" : ""}`}>
        {/* Client */}
        <td className="px-5 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-600/30 to-violet-800/20 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-violet-300">{initials}</span>
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">{client.name}</p>
              <div className="flex items-center gap-1.5 mt-1">
                {[hasMeta, hasGoogle, hasWA].map((v, i) => (
                  <span key={i} className={`w-2 h-2 rounded-full ${v ? ["bg-blue-400", "bg-red-400", "bg-emerald-400"][i] : "bg-[#2a2a2a]"}`} />
                ))}
                <span className="text-xs text-gray-600 ml-1">{connected}/3 ativas</span>
              </div>
            </div>
          </div>
        </td>

        {/* Meta */}
        <td className="px-5 py-5">
          <PlatformCell
            connected={hasMeta}
            detail={hasMeta ? `act_${client.metaAdAccountId?.slice(-8)}` : undefined}
            color="text-blue-400" bgColor="bg-blue-500/10" borderColor="border-blue-500/25" dotColor="bg-blue-400"
            isOpen={openPlatform === "meta"} onToggle={() => toggle("meta")}
          />
        </td>

        {/* Google */}
        <td className="px-5 py-5">
          <PlatformCell
            connected={hasGoogle}
            detail={hasGoogle ? client.googleAdsCustomerId! : undefined}
            color="text-red-400" bgColor="bg-red-500/10" borderColor="border-red-500/25" dotColor="bg-red-400"
            isOpen={openPlatform === "google"} onToggle={() => toggle("google")}
          />
        </td>

        {/* WhatsApp */}
        <td className="px-5 py-5">
          <PlatformCell
            connected={hasWA}
            detail={hasWA ? client.whatsappAccounts.find(a => a.status === "active")?.phoneNumber : undefined}
            color="text-emerald-400" bgColor="bg-emerald-500/10" borderColor="border-emerald-500/25" dotColor="bg-emerald-400"
            isOpen={openPlatform === "whatsapp"} onToggle={() => toggle("whatsapp")}
          />
        </td>
      </tr>

      {/* Expandable form row */}
      {openPlatform && (
        <tr className="border-b border-[#1a1a1a] bg-[#0f0f0f]">
          <td colSpan={4} className="px-5 py-5">
            <div className="max-w-lg">
              {/* Form header */}
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-1 h-4 rounded-full ${openPlatform === "meta" ? "bg-blue-500" : openPlatform === "google" ? "bg-red-500" : "bg-emerald-500"}`} />
                <p className="text-xs font-bold text-white uppercase tracking-widest">
                  {openPlatform === "meta" ? "Meta Ads" : openPlatform === "google" ? "Google Ads" : "WhatsApp Business"} — {client.name}
                </p>
              </div>
              {openPlatform === "meta"     && <MetaForm     client={client} onClose={() => setOpenPlatform(null)} />}
              {openPlatform === "google"   && <GoogleForm   client={client} onClose={() => setOpenPlatform(null)} />}
              {openPlatform === "whatsapp" && <WhatsAppForm client={client} onClose={() => setOpenPlatform(null)} />}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function ConnectionsManager({ clients }: { clients: Client[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | PlatformKey>("all");

  const filtered = clients.filter(c => {
    if (!c.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "meta")      return !!c.metaAdAccountId;
    if (filter === "google")    return !!c.googleAdsCustomerId;
    if (filter === "whatsapp")  return c.whatsappAccounts.some(a => a.status === "active");
    return true;
  });

  const totalMeta   = clients.filter(c => c.metaAdAccountId).length;
  const totalGoogle = clients.filter(c => c.googleAdsCustomerId).length;
  const totalWA     = clients.filter(c => c.whatsappAccounts.some(a => a.status === "active")).length;
  const total       = clients.length;

  return (
    <div className="space-y-6">

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { key: "meta" as const,      label: "Meta Ads",   count: totalMeta,   color: "text-blue-400",    glow: "shadow-blue-500/10",   border: "border-blue-500/15",   bg: "from-blue-500/8",
            icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
          { key: "google" as const,    label: "Google Ads", count: totalGoogle, color: "text-red-400",     glow: "shadow-red-500/10",    border: "border-red-500/15",    bg: "from-red-500/8",
            icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z"/></svg> },
          { key: "whatsapp" as const,  label: "WhatsApp",   count: totalWA,     color: "text-emerald-400", glow: "shadow-emerald-500/10", border: "border-emerald-500/15", bg: "from-emerald-500/8",
            icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> },
        ].map(s => {
          const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
          return (
            <button key={s.key} onClick={() => setFilter(f => f === s.key ? "all" : s.key)}
              className={`relative overflow-hidden bg-gradient-to-br ${s.bg} to-transparent border ${s.border} rounded-2xl px-5 py-4 text-left transition-all hover:scale-[1.01] shadow-lg ${s.glow} ${filter === s.key ? "ring-1 ring-white/10" : ""}`}>
              <div className="flex items-start justify-between mb-3">
                <span className={`${s.color} opacity-70`}>{s.icon}</span>
                <span className={`text-xs font-bold ${s.color}`}>{pct}%</span>
              </div>
              <p className={`text-3xl font-black ${s.color} leading-none`}>{s.count}<span className="text-base font-normal text-gray-600">/{total}</span></p>
              <p className="text-xs text-gray-500 mt-1.5">{s.label}</p>
              {/* Progress bar */}
              <div className="mt-3 h-0.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${s.color.replace("text-", "bg-")} opacity-60 transition-all duration-700`} style={{ width: `${pct}%` }} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Table card */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden shadow-2xl">

        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <p className="text-sm font-bold text-white">Clientes</p>
            {filter !== "all" && (
              <span className="text-[10px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full capitalize">
                Filtro: {filter === "meta" ? "Meta Ads" : filter === "google" ? "Google Ads" : "WhatsApp"}
                <button onClick={() => setFilter("all")} className="ml-1.5 opacity-60 hover:opacity-100">×</button>
              </span>
            )}
          </div>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Buscar cliente..." value={search} onChange={e => setSearch(e.target.value)}
              className="bg-[#1a1a1a] border border-[#262626] rounded-xl pl-8 pr-4 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 w-48" />
          </div>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1a1a1a]">
              <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-600 uppercase tracking-widest w-64">Cliente</th>
              <th className="px-5 py-3 text-left text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Meta Ads
                </div>
              </th>
              <th className="px-5 py-3 text-left text-[10px] font-bold text-red-700 uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z"/></svg>
                  Google Ads
                </div>
              </th>
              <th className="px-5 py-3 text-left text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((client, i) => (
              <ClientRow key={client.id} client={client} index={i} />
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-12 text-center text-sm text-gray-600">Nenhum cliente encontrado.</td></tr>
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#1a1a1a] flex items-center justify-between">
          <p className="text-xs text-gray-700">{filtered.length} cliente{filtered.length !== 1 ? "s" : ""}</p>
          <p className="text-xs text-gray-700">{totalMeta + totalGoogle + totalWA} conexões ativas</p>
        </div>
      </div>
    </div>
  );
}
