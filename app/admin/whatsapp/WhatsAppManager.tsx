"use client";

import { useState } from "react";

interface Account {
  id: string;
  phoneNumber: string;
  phoneNumberId: string;
  displayName: string | null;
  status: string;
  verifiedAt: Date | null;
  wabaId: string | null;
  _count: { conversations: number };
}

interface Client {
  id: string;
  name: string;
  whatsappAccounts: Account[];
}

interface Props {
  clients: Client[];
}

interface ConnectForm {
  clientId: string;
  phoneNumber: string;
  phoneNumberId: string;
  accessToken: string;
  wabaId: string;
  displayName: string;
}

const EMPTY_FORM: ConnectForm = {
  clientId: "",
  phoneNumber: "",
  phoneNumberId: "",
  accessToken: "",
  wabaId: "",
  displayName: "",
};

function StatusBadge({ status }: { status: string }) {
  if (status === "active") return (
    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      Ativo
    </span>
  );
  if (status === "pending") return (
    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">Aguardando</span>
  );
  return (
    <span className="text-[10px] font-bold text-gray-500 bg-[#1a1a1a] border border-[#2a2a2a] px-2 py-0.5 rounded-full">Desconectado</span>
  );
}

export function WhatsAppManager({ clients }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ConnectForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ error?: string; success?: string } | null>(null);

  // Flatten all connected accounts for the overview
  const allAccounts = clients.flatMap(c =>
    c.whatsappAccounts.map(a => ({ ...a, clientName: c.name }))
  );

  function setField(k: keyof ConnectForm, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    if (!form.clientId || !form.phoneNumber || !form.phoneNumberId || !form.accessToken) {
      setResult({ error: "Preencha todos os campos obrigatórios." });
      return;
    }
    setSaving(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/whatsapp/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) {
        setResult({ error: data.error });
      } else {
        setResult({ success: `✓ ${data.account.phoneNumber} conectado com sucesso!` });
        setForm(EMPTY_FORM);
        setShowForm(false);
        // Reload to refresh account list
        window.location.reload();
      }
    } catch {
      setResult({ error: "Erro de conexão. Tente novamente." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Connected accounts */}
      <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#262626]">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <p className="text-sm font-bold text-white">Números Conectados</p>
            {allAccounts.length > 0 && (
              <span className="text-xs text-gray-600">{allAccounts.length} número{allAccounts.length !== 1 ? "s" : ""}</span>
            )}
          </div>
          <button
            onClick={() => { setShowForm(s => !s); setResult(null); }}
            className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-2 rounded-xl transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showForm ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
            </svg>
            {showForm ? "Cancelar" : "Conectar número"}
          </button>
        </div>

        {/* Connect form */}
        {showForm && (
          <form onSubmit={handleConnect} className="px-5 py-5 border-b border-[#262626] bg-[#141414]">
            <p className="text-sm font-semibold text-white mb-4">Conectar número da cliente</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Client */}
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-500 mb-1.5 block">Cliente *</label>
                <select
                  value={form.clientId}
                  onChange={e => setField("clientId", e.target.value)}
                  className="w-full bg-[#111] border border-[#333] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                  required
                >
                  <option value="">Selecione a cliente</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Phone number display */}
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Número de telefone *</label>
                <input
                  type="text"
                  placeholder="+5511999999999"
                  value={form.phoneNumber}
                  onChange={e => setField("phoneNumber", e.target.value)}
                  className="w-full bg-[#111] border border-[#333] rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50"
                  required
                />
              </div>

              {/* Display name */}
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Nome de exibição</label>
                <input
                  type="text"
                  placeholder="Dra. Ana Silva"
                  value={form.displayName}
                  onChange={e => setField("displayName", e.target.value)}
                  className="w-full bg-[#111] border border-[#333] rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              {/* Phone Number ID */}
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">
                  Phone Number ID *
                  <span className="ml-1 text-gray-700">(Meta Dashboard)</span>
                </label>
                <input
                  type="text"
                  placeholder="123456789012345"
                  value={form.phoneNumberId}
                  onChange={e => setField("phoneNumberId", e.target.value)}
                  className="w-full bg-[#111] border border-[#333] rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 font-mono"
                  required
                />
              </div>

              {/* WABA ID */}
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">
                  WABA ID
                  <span className="ml-1 text-gray-700">(opcional)</span>
                </label>
                <input
                  type="text"
                  placeholder="WhatsApp Business Account ID"
                  value={form.wabaId}
                  onChange={e => setField("wabaId", e.target.value)}
                  className="w-full bg-[#111] border border-[#333] rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 font-mono"
                />
              </div>

              {/* Access Token */}
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-500 mb-1.5 block">
                  Access Token *
                  <span className="ml-1 text-gray-700">(token permanente do sistema)</span>
                </label>
                <input
                  type="password"
                  placeholder="EAAxxxxxxx..."
                  value={form.accessToken}
                  onChange={e => setField("accessToken", e.target.value)}
                  className="w-full bg-[#111] border border-[#333] rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 font-mono"
                  required
                />
              </div>
            </div>

            {result?.error && (
              <p className="mt-3 text-xs text-red-400 bg-red-500/10 rounded-xl px-3 py-2">{result.error}</p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="mt-4 w-full py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-colors"
            >
              {saving ? "Verificando com Meta..." : "Verificar e Conectar"}
            </button>
          </form>
        )}

        {result?.success && (
          <div className="px-5 py-3 bg-emerald-500/5 border-b border-emerald-500/10">
            <p className="text-xs text-emerald-400">{result.success}</p>
          </div>
        )}

        {/* Account list */}
        {allAccounts.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-gray-600">Nenhum número conectado ainda.</p>
            <p className="text-xs text-gray-700 mt-1">Clique em "Conectar número" para começar.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1e1e1e]">
            {allAccounts.map(account => (
              <div key={account.id} className="px-5 py-4 flex items-center gap-4">
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white">{account.displayName ?? account.phoneNumber}</p>
                    <StatusBadge status={account.status} />
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <p className="text-xs text-gray-600">{(account as { clientName: string }).clientName}</p>
                    <span className="text-gray-700">·</span>
                    <p className="text-xs text-gray-600 font-mono">{account.phoneNumber}</p>
                    <span className="text-gray-700">·</span>
                    <p className="text-xs text-gray-600 font-mono">ID: {account.phoneNumberId.slice(-8)}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-emerald-400">{account._count.conversations}</p>
                  <p className="text-xs text-gray-600">conversas</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Per-client breakdown */}
      {clients.some(c => c.whatsappAccounts.length > 0) && (
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#262626]">
            <p className="text-sm font-bold text-white">Por Cliente</p>
          </div>
          <div className="divide-y divide-[#1e1e1e]">
            {clients.filter(c => c.whatsappAccounts.length > 0).map(c => {
              const totalConv = c.whatsappAccounts.reduce((s, a) => s + a._count.conversations, 0);
              return (
                <div key={c.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{c.name}</p>
                    <p className="text-xs text-gray-600">
                      {c.whatsappAccounts.map(a => a.phoneNumber).join(", ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">{totalConv}</p>
                    <p className="text-xs text-gray-600">conversas</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
