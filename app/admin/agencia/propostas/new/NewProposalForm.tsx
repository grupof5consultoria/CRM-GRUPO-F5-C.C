"use client";

import { useActionState, useState } from "react";
import { createProposalAction } from "../actions";
import Link from "next/link";
import { PLAN_CONFIG } from "@/lib/agencia-config";

type Client = { id: string; name: string };

export function NewProposalForm({ clients }: { clients: Client[] }) {
  const [state, action, isPending] = useActionState(createProposalAction, {});
  const [plan, setPlan] = useState<"start" | "scale">("start");
  const [discount, setDiscount] = useState(false);

  const cfg = PLAN_CONFIG[plan];
  const implPrice = discount ? cfg.priceImplDiscount : cfg.priceImpl;

  return (
    <form action={action} className="space-y-6">
      {state.error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">{state.error}</div>
      )}

      {/* Cliente */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1.5">Cliente *</label>
        <select name="clientId" required className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500">
          <option value="">Selecione o cliente...</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Plano */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Plano</label>
        <div className="grid grid-cols-2 gap-3">
          {(["start", "scale"] as const).map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setPlan(p)}
              className={`p-4 rounded-xl border text-left transition-all ${plan === p ? "border-violet-500 bg-violet-500/10" : "border-[#2e2e2e] bg-[#1a1a1a] hover:border-[#3e3e3e]"}`}
            >
              <div className="font-bold text-white text-sm mb-1">{PLAN_CONFIG[p].label}</div>
              <div className="text-xs text-gray-400">R$ {PLAN_CONFIG[p].priceMonthly.toLocaleString("pt-BR")}/mês</div>
            </button>
          ))}
        </div>
        <input type="hidden" name="plan" value={plan} />
      </div>

      {/* Desconto */}
      <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-white">Desconto na reunião</span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="discountApplied" value="true" checked={discount} onChange={e => setDiscount(e.target.checked)} className="w-4 h-4 accent-violet-500" />
            <span className="text-sm text-gray-400">Aplicar desconto de R$ 500</span>
          </label>
        </div>
        <input type="hidden" name="discountApplied" value={String(discount)} />
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 text-xs mb-1">Implementação</p>
            <p className="text-white font-bold text-lg">R$ {implPrice.toLocaleString("pt-BR")}</p>
            {discount && <p className="text-emerald-400 text-xs">Economia de R$ 500</p>}
          </div>
          <div>
            <p className="text-gray-600 text-xs mb-1">Mensalidade (2º mês+)</p>
            <p className="text-white font-bold text-lg">R$ {cfg.priceMonthly.toLocaleString("pt-BR")}/mês</p>
          </div>
        </div>
      </div>

      {/* Verba de anúncios */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1.5">Verba de Anúncios (R$/mês)</label>
        <input name="adBudget" type="number" min="0" step="100" defaultValue="1500" className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500" />
        <p className="text-xs text-gray-600 mt-1">Pago diretamente às plataformas. Não incluso na mensalidade.</p>
      </div>

      {/* Observações */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1.5">Observações</label>
        <textarea name="notes" rows={3} placeholder="Ex: Cliente interessado em implante dentário..." className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 resize-none focus:outline-none focus:border-violet-500" />
      </div>

      {/* Serviços inclusos */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Inclusos no plano {cfg.label}</p>
        <ul className="space-y-1.5">
          {cfg.services.map((s, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-gray-300">
              <span className="text-violet-400">✓</span> {s}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-3">
        <Link href="/admin/agencia/propostas" className="flex-1 py-2.5 rounded-xl border border-[#2e2e2e] text-gray-400 text-sm font-medium text-center hover:border-[#3e3e3e] transition-colors">
          Cancelar
        </Link>
        <button type="submit" disabled={isPending} className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors disabled:opacity-50">
          {isPending ? "Criando..." : "Criar Proposta"}
        </button>
      </div>
    </form>
  );
}
