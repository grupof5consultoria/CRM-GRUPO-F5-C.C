"use client";

import { useActionState } from "react";
import { createPatientLeadAction } from "../actions";
import Link from "next/link";

type Client = { id: string; name: string };

const ORIGINS = [
  { value: "meta_ads",       label: "Meta Ads (Facebook/Instagram)" },
  { value: "google_ads",     label: "Google Ads" },
  { value: "instagram",      label: "Instagram Orgânico" },
  { value: "google_organic", label: "Google Orgânico" },
  { value: "referral",       label: "Indicação" },
  { value: "organic",        label: "Orgânico" },
  { value: "other",          label: "Outro" },
];

export function NewPatientLeadForm({ clients }: { clients: Client[] }) {
  const [state, action, isPending] = useActionState(createPatientLeadAction, {});

  return (
    <form action={action} className="max-w-xl mx-auto space-y-5">
      {state.error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
          {state.error}
        </div>
      )}

      {/* Cliente (doutora) */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1.5">
          Cliente (Doutora) <span className="text-red-400">*</span>
        </label>
        <select
          name="clientId"
          required
          className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-pink-500 transition-colors"
        >
          <option value="">Selecione a doutora...</option>
          {clients.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Nome do paciente */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1.5">
          Nome do Paciente <span className="text-red-400">*</span>
        </label>
        <input
          name="name"
          required
          type="text"
          placeholder="Ex: Maria Silva"
          className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-pink-500 transition-colors"
        />
      </div>

      {/* Telefone */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1.5">WhatsApp</label>
        <input
          name="phone"
          type="tel"
          placeholder="Ex: 65999991234"
          className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-pink-500 transition-colors"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1.5">Email</label>
        <input
          name="email"
          type="email"
          placeholder="paciente@email.com"
          className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-pink-500 transition-colors"
        />
      </div>

      {/* Origem */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1.5">Origem do Lead</label>
        <select
          name="origin"
          className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-pink-500 transition-colors"
        >
          {ORIGINS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Campanha / fonte */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1.5">Campanha / Fonte</label>
        <input
          name="source"
          type="text"
          placeholder="Ex: Campanha Implante Março, UTM..."
          className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-pink-500 transition-colors"
        />
      </div>

      {/* Valor do tratamento */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1.5">Valor Estimado do Tratamento (R$)</label>
        <input
          name="treatmentValue"
          type="number"
          step="0.01"
          min="0"
          placeholder="Ex: 3500.00"
          className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-pink-500 transition-colors"
        />
      </div>

      {/* Observações */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1.5">Observações</label>
        <textarea
          name="notes"
          rows={3}
          placeholder="Interesse do paciente, histórico, detalhes..."
          className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-pink-500 transition-colors resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Link
          href="/admin/crm-cliente"
          className="flex-1 py-2.5 rounded-xl border border-[#2e2e2e] text-gray-400 text-sm font-medium text-center hover:border-[#3e3e3e] hover:text-gray-300 transition-colors"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Criando..." : "Criar Lead"}
        </button>
      </div>
    </form>
  );
}
