"use client";

import { useState, useEffect, useRef } from "react";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { saveClientCredentialsAction } from "@/app/admin/metrics/actions";

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Platform logos ───────────────────────────────────────────────────────────

function WhatsAppLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function MetaLogo() {
  return (
    <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
      <defs>
        <linearGradient id="meta-a" x1="18" y1="6.45" x2="18" y2="22.21" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0064e1"/>
          <stop offset=".4" stopColor="#0064e1"/>
          <stop offset=".83" stopColor="#0073ee"/>
          <stop offset="1" stopColor="#0082fb"/>
        </linearGradient>
        <linearGradient id="meta-b" x1="18" y1="22.66" x2="18" y2="29.91" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0082fb"/>
          <stop offset="1" stopColor="#0064e0"/>
        </linearGradient>
      </defs>
      <path d="M6.68 21.37C6.68 23.29 7.12 24.76 7.88 25.73C8.62 26.67 9.67 27.13 11 27.13C12.46 27.13 13.59 26.6 15.05 24.76C16.23 23.24 17.63 20.95 18.59 19.44L20.17 16.96C21.25 15.24 22.52 13.33 23.93 12.04C25.08 10.99 26.33 10.42 27.6 10.42C29.76 10.42 31.73 11.65 33.22 13.97C34.85 16.49 35.64 19.64 35.64 22.91C35.64 24.86 35.25 26.36 34.55 27.56C33.87 28.73 32.56 29.91 30.22 29.91V26.68C32.28 26.68 32.83 24.76 32.83 23.01C32.83 20.35 32.2 17.38 30.87 15.2C29.89 13.61 28.65 12.66 27.34 12.66C25.92 12.66 24.79 13.63 23.53 15.49C22.84 16.51 22.13 17.8 21.32 19.25L19.7 22.12C18.08 25.02 17.13 26.57 16.13 27.71C14.85 29.15 13.69 29.91 11.63 29.91C9.4 29.91 7.82 29.05 6.77 27.72C5.77 26.43 5.25 24.62 5.25 22.44L6.68 21.37Z" fill="url(#meta-a)"/>
      <path d="M5.25 22.91C5.25 20.16 5.92 17.3 7.32 15.09C8.44 13.27 10.01 11.77 11.91 11.07C13.33 10.53 14.89 10.42 16.38 10.87C17.91 11.33 19.27 12.36 20.28 13.68C21.29 15 21.88 16.54 21.95 18.08C22.04 19.72 21.52 21.31 20.55 22.56C19.56 23.83 18.1 24.71 16.51 25.09C15.46 25.34 14.35 25.31 13.3 25.02L13.74 22.14C14.43 22.34 15.17 22.36 15.88 22.19C16.95 21.93 17.84 21.27 18.42 20.37C19.02 19.44 19.18 18.26 18.89 17.15C18.62 16.1 17.99 15.17 17.09 14.55C16.19 13.93 15.07 13.62 13.91 13.78C12.22 14.01 10.88 15.19 9.96 16.49C8.75 18.19 8.08 20.52 8.08 22.91H5.25Z" fill="url(#meta-b)"/>
    </svg>
  );
}

function GoogleAdsLogo() {
  return (
    <svg viewBox="0 0 192 192" fill="none" className="w-full h-full">
      <path d="M136.594 191.955c29.81 0 55.405-24.065 55.405-55.405 0-29.81-24.065-55.405-55.405-55.405-29.81 0-55.406 24.065-55.406 55.405.001 29.81 25.596 55.405 55.406 55.405z" fill="#FBBC04"/>
      <path d="M55.405 110.595C25.596 110.595 0 134.66 0 165.5 0 195.31 24.065 221 55.405 221c29.81 0 55.406-24.065 55.406-55.405 0-29.81-25.596-55-55.406-55z" fill="#34A853"/>
      <path d="M55.562.021c-15.287 0-29.435 5.924-40.228 15.778C5.54 25.653 0 39.65 0 55.562c0 15.287 5.615 29.435 15.334 39.853l120.636-95.31C122.52 5.87 109.612.02 95.697.02H55.562z" fill="#4285F4"/>
      <path d="M135.988.021H95.697c14.226 0 27.133 5.847 36.273 15.085L15.334 110.595C25.128 121.013 39.2 127.551 55.562 127.551h80.426c31.37 0 55.406-25.596 55.406-55.405C191.394 24.086 167.358.02 135.988.02z" fill="#EA4335"/>
    </svg>
  );
}

// ─── Inline forms ─────────────────────────────────────────────────────────────

function MetaForm({ client, onClose }: { client: Client; onClose: () => void }) {
  const [state, action, pending] = useActionState(saveClientCredentialsAction, {});
  if (state?.success) { onClose(); return null; }
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="clientId" value={client.id} />
      <input type="hidden" name="googleAdsCustomerId" value={client.googleAdsCustomerId ?? ""} />
      <a href={`/api/auth/meta?clientId=${client.id}`}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold hover:bg-blue-500/20 transition-all">
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        {client.metaAdAccountId ? "Reconectar via Meta" : "Conectar via Meta"}
      </a>
      <p className="text-[10px] text-gray-700 text-center">ou preencha manualmente</p>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">ID da Conta de Anúncio</label>
        <input name="metaAdAccountId" defaultValue={client.metaAdAccountId ?? ""} placeholder="ex: 123456789"
          className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-blue-500/50" />
      </div>
      <input type="hidden" name="metaAccessToken" value="" />
      {state?.error && <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{state.error}</p>}
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={pending}
          className="flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors">
          {pending ? "Salvando..." : "Salvar"}
        </button>
        <button type="button" onClick={onClose}
          className="px-4 py-2 rounded-xl text-xs text-gray-600 hover:text-gray-300 transition-colors border border-[#2a2a2a]">
          Cancelar
        </button>
      </div>
    </form>
  );
}

function GoogleForm({ client, onClose }: { client: Client; onClose: () => void }) {
  const [state, action, pending] = useActionState(saveClientCredentialsAction, {});
  if (state?.success) { onClose(); return null; }
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="clientId" value={client.id} />
      <input type="hidden" name="metaAdAccountId" value={client.metaAdAccountId ?? ""} />
      <a href={`/api/auth/google?clientId=${client.id}`}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-all">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        {client.googleRefreshToken ? "Reconectar via Google" : "Conectar via Google"}
      </a>
      <p className="text-[10px] text-gray-700 text-center">ou preencha manualmente</p>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Customer ID</label>
        <input name="googleAdsCustomerId" defaultValue={client.googleAdsCustomerId ?? ""} placeholder="ex: 123-456-7890"
          className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-red-500/50" />
      </div>
      <input type="hidden" name="googleRefreshToken" value="" />
      {state?.error && <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{state.error}</p>}
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={pending}
          className="flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 transition-colors">
          {pending ? "Salvando..." : "Salvar"}
        </button>
        <button type="button" onClick={onClose}
          className="px-4 py-2 rounded-xl text-xs text-gray-600 hover:text-gray-300 transition-colors border border-[#2a2a2a]">
          Cancelar
        </button>
      </div>
    </form>
  );
}

function WhatsAppForm({ client, onClose }: { client: Client; onClose: () => void }) {
  const [step, setStep]           = useState<"idle" | "loading" | "qr" | "connected" | "error">("idle");
  const [qrBase64, setQrBase64]   = useState<string | null>(null);
  const [instanceName, setInstanceName] = useState(
    client.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").slice(0, 40)
  );
  const [error, setError]         = useState<string | null>(null);
  const [connectedNumber, setConnectedNumber] = useState<string | null>(null);
  const pollRef                   = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopPolling() {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }

  useEffect(() => () => stopPolling(), []);

  async function handleConnect() {
    setStep("loading");
    setError(null);
    setQrBase64(null);

    const res  = await fetch("/api/admin/whatsapp/evolution/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: client.id, instanceName }),
    });
    const data = await res.json();

    if (data.error) { setError(data.detail ? `${data.error}: ${data.detail}` : data.error); setStep("error"); return; }
    if (data.qr)    { setQrBase64(data.qr); setStep("qr"); startPolling(); return; }
    // already connected
    setConnectedNumber(data.phone ?? null);
    setStep("connected");
  }

  function startPolling() {
    stopPolling();
    pollRef.current = setInterval(async () => {
      const res  = await fetch(`/api/admin/whatsapp/evolution/status?instanceName=${encodeURIComponent(instanceName)}&clientId=${client.id}`);
      const data = await res.json();
      if (data.status === "open") {
        stopPolling();
        setConnectedNumber(data.phone ?? null);
        setStep("connected");
        setTimeout(() => { onClose(); window.location.reload(); }, 2000);
      }
      if (data.qr) setQrBase64(data.qr); // refresh QR if rotated
    }, 4000);
  }

  return (
    <div className="space-y-4">

      {/* ── idle ── */}
      {(step === "idle" || step === "error") && (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Nome da instância</label>
            <input
              value={instanceName}
              onChange={e => setInstanceName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-"))}
              placeholder="ex: dra-ana-paula"
              className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 font-mono"
            />
            <p className="text-[10px] text-gray-700 mt-1">Identificador único no Evolution API. Use apenas letras, números e hífens.</p>
          </div>
          {error && <p className="text-xs text-red-400 bg-red-500/10 rounded-xl px-3 py-2">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleConnect}
              disabled={!instanceName}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#25D366] hover:bg-[#20bc59] disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m0 14v1m8-8h-1M5 12H4m15.07-6.07-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707" />
              </svg>
              Gerar QR Code
            </button>
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs text-gray-600 hover:text-gray-300 border border-[#2a2a2a]">Cancelar</button>
          </div>
        </div>
      )}

      {/* ── loading ── */}
      {step === "loading" && (
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="w-8 h-8 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500">Criando instância na Evolution API...</p>
        </div>
      )}

      {/* ── QR code ── */}
      {step === "qr" && qrBase64 && (
        <div className="space-y-3">
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <p className="text-xs text-emerald-400 font-semibold">Aguardando leitura do QR Code...</p>
          </div>

          <div className="flex justify-center">
            <div className="p-3 bg-white rounded-2xl shadow-lg shadow-black/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrBase64.startsWith("data:") ? qrBase64 : `data:image/png;base64,${qrBase64}`}
                alt="QR Code WhatsApp"
                className="w-52 h-52 rounded-lg"
              />
            </div>
          </div>

          <ol className="space-y-1.5 text-xs text-gray-500">
            <li className="flex items-start gap-2"><span className="text-[#25D366] font-bold flex-shrink-0">1.</span> Abra o WhatsApp no celular do cliente</li>
            <li className="flex items-start gap-2"><span className="text-[#25D366] font-bold flex-shrink-0">2.</span> Vá em <strong className="text-gray-300">Configurações → Aparelhos conectados → Conectar aparelho</strong></li>
            <li className="flex items-start gap-2"><span className="text-[#25D366] font-bold flex-shrink-0">3.</span> Aponte a câmera para o QR Code acima</li>
          </ol>

          <p className="text-[10px] text-gray-700 text-center">O QR Code expira em ~60 segundos e é atualizado automaticamente</p>

          <button
            onClick={() => { stopPolling(); setStep("idle"); setQrBase64(null); }}
            className="w-full py-2 rounded-xl text-xs text-gray-600 hover:text-gray-300 border border-[#2a2a2a] transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* ── connected ── */}
      {step === "connected" && (
        <div className="text-center py-4 space-y-3">
          <div className="w-14 h-14 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-[#25D366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-white">WhatsApp conectado!</p>
            {connectedNumber && <p className="text-xs text-gray-500 mt-1">{connectedNumber}</p>}
          </div>
          <p className="text-[10px] text-gray-600">Recarregando...</p>
        </div>
      )}

    </div>
  );
}

// ─── Client row inside a platform card ───────────────────────────────────────

type FormType = "meta" | "google" | "whatsapp";

function ClientPlatformRow({
  client,
  platform,
  connected,
  detail,
}: {
  client: Client;
  platform: FormType;
  connected: boolean;
  detail?: string;
}) {
  const [open, setOpen] = useState(false);
  const initials = client.name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

  const accentConnected = {
    meta: "text-[#1877F2] bg-[#1877F2]/10 border-[#1877F2]/25",
    google: "text-[#EA4335] bg-[#EA4335]/10 border-[#EA4335]/25",
    whatsapp: "text-[#25D366] bg-[#25D366]/10 border-[#25D366]/25",
  }[platform];

  const btnConnect = {
    meta: "bg-[#1877F2] hover:bg-[#1877F2]/80",
    google: "bg-[#EA4335] hover:bg-[#EA4335]/80",
    whatsapp: "bg-[#25D366] hover:bg-[#25D366]/80",
  }[platform];

  return (
    <div className={`rounded-2xl border transition-all ${open ? "border-[#333]" : "border-[#1f1f1f] hover:border-[#2a2a2a]"} bg-[#141414]`}>
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer"
        onClick={() => setOpen(o => !o)}
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-violet-300">{initials}</span>
        </div>

        {/* Name + detail */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{client.name}</p>
          {detail && <p className="text-xs text-gray-600 font-mono truncate">{detail}</p>}
        </div>

        {/* Status badge */}
        {connected ? (
          <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-xl border flex-shrink-0 ${accentConnected}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            Ativo
          </span>
        ) : (
          <span className="text-xs text-gray-600 flex-shrink-0">Não conectado</span>
        )}

        {/* Chevron */}
        <svg className={`w-4 h-4 text-gray-600 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Expanded form */}
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-[#222]">
          {platform === "meta"      && <MetaForm      client={client} onClose={() => setOpen(false)} />}
          {platform === "google"    && <GoogleForm     client={client} onClose={() => setOpen(false)} />}
          {platform === "whatsapp"  && <WhatsAppForm   client={client} onClose={() => setOpen(false)} />}
        </div>
      )}
    </div>
  );
}

// ─── Platform card ────────────────────────────────────────────────────────────

function PlatformCard({
  platform,
  title,
  subtitle,
  logo,
  logoWrapperClass,
  clients,
}: {
  platform: FormType;
  title: string;
  subtitle: string;
  logo: React.ReactNode;
  logoWrapperClass: string;
  clients: Client[];
}) {
  const connectedCount = clients.filter(c => {
    if (platform === "meta")     return !!c.metaAdAccountId;
    if (platform === "google")   return !!c.googleAdsCustomerId;
    if (platform === "whatsapp") return c.whatsappAccounts.some(a => a.status === "active");
    return false;
  }).length;

  const gradients: Record<FormType, string> = {
    meta:      "from-[#1877F2]/10 to-transparent border-[#1877F2]/15",
    google:    "from-[#EA4335]/10 to-transparent border-[#EA4335]/15",
    whatsapp:  "from-[#25D366]/10 to-transparent border-[#25D366]/15",
  };

  const accentBar: Record<FormType, string> = {
    whatsapp: "bg-[#25D366]",
    meta:     "bg-[#1877F2]",
    google:   "bg-[#EA4335]",
  };

  return (
    <div className={`bg-gradient-to-r ${gradients[platform]} border rounded-3xl overflow-hidden`}>
      {/* Card header — horizontal banner */}
      <div className="flex items-center gap-6 px-8 py-7">
        {/* Logo block */}
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 p-4 ${logoWrapperClass}`}>
          {logo}
        </div>

        {/* Title + subtitle */}
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-8 flex-shrink-0">
          <div className="text-center">
            <p className="text-4xl font-black text-white">{connectedCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">conectado{connectedCount !== 1 ? "s" : ""}</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-black text-gray-600">{clients.length - connectedCount}</p>
            <p className="text-xs text-gray-600 mt-0.5">pendente{(clients.length - connectedCount) !== 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      {/* Accent divider */}
      <div className={`h-0.5 ${accentBar[platform]} opacity-20`} />

      {/* Client grid */}
      <div className="px-8 py-5">
        {clients.length === 0 ? (
          <p className="text-sm text-gray-600 text-center py-6">Nenhum cliente ativo.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {clients.map(client => {
              let connected = false;
              let detail: string | undefined;

              if (platform === "meta") {
                connected = !!client.metaAdAccountId;
                detail = connected ? `act_${client.metaAdAccountId}` : undefined;
              } else if (platform === "google") {
                connected = !!client.googleAdsCustomerId;
                detail = connected ? client.googleAdsCustomerId! : undefined;
              } else {
                const active = client.whatsappAccounts.find(a => a.status === "active");
                connected = !!active;
                detail = active
                  ? `${active.phoneNumber}${active.displayName ? ` · ${active.displayName}` : ""}`
                  : undefined;
              }

              return (
                <ClientPlatformRow
                  key={client.id}
                  client={client}
                  platform={platform}
                  connected={connected}
                  detail={detail}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

const TABS = [
  { key: "meta",      label: "Meta Ads",   color: "text-blue-400",    border: "border-blue-500",    dot: "bg-blue-500" },
  { key: "google",    label: "Google Ads", color: "text-red-400",     border: "border-red-500",     dot: "bg-red-500" },
  { key: "whatsapp",  label: "WhatsApp",   color: "text-emerald-400", border: "border-emerald-500", dot: "bg-emerald-500" },
] as const;

type TabKey = typeof TABS[number]["key"];

export function ConnectionsManager({ clients }: { clients: Client[] }) {
  const params = useSearchParams();
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const rawTab = params.get("tab") as TabKey | null;
  const activeTab: TabKey = TABS.some(t => t.key === rawTab) ? (rawTab as TabKey) : "meta";

  useEffect(() => {
    if (params.get("success") === "google_connected") {
      setToast({ msg: "Google Ads conectado com sucesso!", ok: true });
      setTimeout(() => setToast(null), 4000);
    }
    if (params.get("error")) {
      const detail = params.get("detail") ? ` (${decodeURIComponent(params.get("detail")!)})` : "";
      const msgs: Record<string, string> = {
        google_auth_denied: "Autorização negada pelo Google.",
        google_token_failed: `Falha ao obter token do Google.${detail}`,
        google_session_expired: "Sessão expirada. Tente novamente.",
      };
      setToast({ msg: msgs[params.get("error")!] ?? "Erro ao conectar Google.", ok: false });
      setTimeout(() => setToast(null), 5000);
    }
  }, [params]);

  return (
    <div className="flex flex-col gap-6">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-xl border transition-all ${
          toast.ok ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"
        }`}>
          {toast.msg}
        </div>
      )}

      {activeTab === "meta" && (
        <PlatformCard
          platform="meta"
          title="Meta Ads"
          subtitle="Facebook · Instagram · anúncios"
          logo={<MetaLogo />}
          logoWrapperClass="bg-[#1877F2]/10"
          clients={clients}
        />
      )}
      {activeTab === "google" && (
        <PlatformCard
          platform="google"
          title="Google Ads"
          subtitle="Search · Display · campanhas"
          logo={<GoogleAdsLogo />}
          logoWrapperClass="bg-white/5"
          clients={clients}
        />
      )}
      {activeTab === "whatsapp" && (
        <PlatformCard
          platform="whatsapp"
          title="WhatsApp"
          subtitle="Mensagens · conversas · notificações"
          logo={<WhatsAppLogo />}
          logoWrapperClass="bg-[#25D366]/10"
          clients={clients}
        />
      )}
    </div>
  );
}
