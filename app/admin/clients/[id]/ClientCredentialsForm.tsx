"use client";

import { useActionState } from "react";
import { saveClientCredentialsAction } from "@/app/admin/metrics/actions";

interface Props {
  clientId: string;
  metaAdAccountId: string | null;
  googleAdsCustomerId: string | null;
  hasMeta: boolean;
  hasGoogle: boolean;
}

export function ClientCredentialsForm({ clientId, metaAdAccountId, googleAdsCustomerId, hasMeta, hasGoogle }: Props) {
  const [state, action, pending] = useActionState(saveClientCredentialsAction, {});

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="clientId" value={clientId} />

      {/* Meta */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Meta Ads</p>
          {hasMeta && <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Configurado</span>}
        </div>
        <div className="grid grid-cols-1 gap-2">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">ID da Conta de Anúncio</label>
            <input
              name="metaAdAccountId"
              defaultValue={metaAdAccountId ?? ""}
              placeholder="ex: 123456789 (sem act_)"
              className="w-full bg-[#111111] border border-[#333333] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Access Token (long-lived)</label>
            <input
              name="metaAccessToken"
              type="password"
              placeholder="••••••••••••"
              className="w-full bg-[#111111] border border-[#333333] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-violet-500 transition-colors"
            />
            <p className="text-xs text-gray-700 mt-1">Deixe em branco para manter o token atual.</p>
          </div>
        </div>
      </div>

      {/* Google */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Google Ads</p>
          {hasGoogle && <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Configurado</span>}
        </div>
        <div className="grid grid-cols-1 gap-2">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Customer ID</label>
            <input
              name="googleAdsCustomerId"
              defaultValue={googleAdsCustomerId ?? ""}
              placeholder="ex: 123-456-7890"
              className="w-full bg-[#111111] border border-[#333333] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Refresh Token</label>
            <input
              name="googleRefreshToken"
              type="password"
              placeholder="••••••••••••"
              className="w-full bg-[#111111] border border-[#333333] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-violet-500 transition-colors"
            />
            <p className="text-xs text-gray-700 mt-1">Deixe em branco para manter o token atual.</p>
          </div>
        </div>
      </div>

      {state?.error && <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{state.error}</p>}
      {state?.success && <p className="text-xs text-emerald-400 bg-emerald-500/10 rounded-lg px-3 py-2">Credenciais salvas!</p>}

      <button
        type="submit"
        disabled={pending}
        className="relative w-full py-2 rounded-xl text-sm font-semibold text-white overflow-hidden transition-all disabled:opacity-50"
        style={{ background: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 40%, #5b21b6 100%)" }}
      >
        <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%)" }} />
        <span className="relative">{pending ? "Salvando..." : "Salvar Credenciais"}</span>
      </button>
    </form>
  );
}
