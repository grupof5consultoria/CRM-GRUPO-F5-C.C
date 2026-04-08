"use client";

import { useState, useActionState } from "react";
import { createPortalAccessAction, resetPortalPasswordAction, deletePortalAccessAction } from "../actions";

interface PortalUser {
  id: string;         // ClientUser.id
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
  };
}

interface Props {
  clientId: string;
  portalUsers: PortalUser[];
  portalUrl: string;
}

function CreateForm({ clientId }: { clientId: string }) {
  const [state, action, pending] = useActionState(createPortalAccessAction, {});
  const [show, setShow] = useState(false);

  if (state.success) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-400 py-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Acesso criado com sucesso!
      </div>
    );
  }

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="relative w-full py-2.5 rounded-xl text-sm font-semibold text-white overflow-hidden"
        style={{ background: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 40%, #5b21b6 100%)" }}
      >
        <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%)" }} />
        <span className="relative flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Criar Acesso ao Portal
        </span>
      </button>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="clientId" value={clientId} />
      {state.error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{state.error}</p>
      )}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Nome completo</label>
        <input
          name="name"
          type="text"
          required
          placeholder="Dr. João Silva"
          className="w-full bg-[#111111] border border-[#333] rounded-xl px-3 py-2 text-sm text-gray-300 placeholder-gray-700 focus:outline-none focus:border-violet-500"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Email de acesso</label>
        <input
          name="email"
          type="email"
          required
          placeholder="dr.joao@clinica.com"
          className="w-full bg-[#111111] border border-[#333] rounded-xl px-3 py-2 text-sm text-gray-300 placeholder-gray-700 focus:outline-none focus:border-violet-500"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Senha (mín. 6 caracteres)</label>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="••••••••"
          className="w-full bg-[#111111] border border-[#333] rounded-xl px-3 py-2 text-sm text-gray-300 placeholder-gray-700 focus:outline-none focus:border-violet-500"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShow(false)}
          className="flex-1 py-2 rounded-xl text-sm text-gray-500 border border-[#333] hover:border-[#444] hover:text-gray-300 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending}
          className="relative flex-1 py-2 rounded-xl text-sm font-semibold text-white overflow-hidden disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 40%, #5b21b6 100%)" }}
        >
          <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%)" }} />
          <span className="relative">{pending ? "Criando..." : "Criar"}</span>
        </button>
      </div>
    </form>
  );
}

function ResetPasswordForm({ userId, clientId }: { userId: string; clientId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(resetPortalPasswordAction, {});

  if (state.success && open) setOpen(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-gray-500 hover:text-amber-400 transition-colors"
      >
        Redefinir senha
      </button>
    );
  }

  return (
    <form action={action} className="flex items-center gap-2 mt-2">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="clientId" value={clientId} />
      {state.error && <p className="text-xs text-red-400">{state.error}</p>}
      <input
        name="password"
        type="password"
        minLength={6}
        required
        placeholder="Nova senha"
        className="flex-1 bg-[#111111] border border-[#333] rounded-xl px-3 py-1.5 text-xs text-gray-300 placeholder-gray-700 focus:outline-none focus:border-violet-500"
      />
      <button
        type="submit"
        disabled={pending}
        className="text-xs text-violet-400 hover:text-violet-300 transition-colors disabled:opacity-60 whitespace-nowrap"
      >
        {pending ? "..." : "Salvar"}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
      >
        ✕
      </button>
    </form>
  );
}

export function PortalAccessCard({ clientId, portalUsers, portalUrl }: Props) {
  const [copied, setCopied] = useState(false);

  function copyUrl() {
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      {/* Portal URL */}
      <div>
        <p className="text-xs text-gray-500 mb-1.5">Link de acesso do cliente</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-[#111111] border border-[#333] rounded-xl px-3 py-2 text-xs text-violet-400 truncate">
            {portalUrl}
          </code>
          <button
            onClick={copyUrl}
            className="flex-shrink-0 text-xs px-3 py-2 bg-[#111111] border border-[#333] rounded-xl text-gray-500 hover:text-gray-300 hover:border-[#444] transition-all"
          >
            {copied ? "Copiado!" : "Copiar"}
          </button>
        </div>
      </div>

      {/* Existing portal users */}
      {portalUsers.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 font-medium">Usuários com acesso</p>
          {portalUsers.map((pu) => (
            <div key={pu.id} className="bg-[#111111] border border-[#333] rounded-xl px-3 py-3 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-violet-600/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200">{pu.user.name}</p>
                    <p className="text-xs text-gray-500">{pu.user.email}</p>
                  </div>
                </div>
                <form action={() => deletePortalAccessAction(pu.id, pu.userId, clientId)}>
                  <button
                    type="submit"
                    className="text-gray-700 hover:text-red-400 transition-colors"
                    title="Remover acesso"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </form>
              </div>
              <ResetPasswordForm userId={pu.user.id} clientId={clientId} />
            </div>
          ))}
        </div>
      )}

      {/* Create new access */}
      <CreateForm clientId={clientId} />
    </div>
  );
}
