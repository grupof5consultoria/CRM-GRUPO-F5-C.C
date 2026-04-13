"use client";

import { useState } from "react";
import { useActionState } from "react";
import { updateLeadAction } from "../actions";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

const SOURCE_OPTIONS = [
  { value: "indicacao",  label: "Indicação" },
  { value: "google",     label: "Google" },
  { value: "anuncio",    label: "Anúncio Pago" },
  { value: "instagram",  label: "Instagram" },
  { value: "organico",   label: "Orgânico" },
  { value: "outro",      label: "Outro" },
];

const PLATFORM_OPTIONS = [
  { value: "meta_ads",   label: "Meta Ads" },
  { value: "google_ads", label: "Google Ads" },
];

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  notes: string | null;
  nextFollowUp: Date | null;
  status: string;
  value?: { toString(): string } | number | null;
  source?: string | null;
  platforms?: string[];
}

const initialState = { error: undefined as string | undefined };

export function EditLeadForm({ lead }: { lead: Lead }) {
  const [state, formAction, isPending] = useActionState(updateLeadAction, initialState);
  const [platforms, setPlatforms] = useState<string[]>(lead.platforms ?? []);

  function togglePlatform(p: string) {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={lead.id} />
      <input type="hidden" name="status" value={lead.status} />
      {platforms.map(p => <input key={p} type="hidden" name="platforms" value={p} />)}

      {state.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Input label="Nome *" name="name" defaultValue={lead.name} required />
        </div>
        <Input label="Empresa" name="company" defaultValue={lead.company ?? ""} />
        <Input label="Email" name="email" type="email" defaultValue={lead.email ?? ""} />
        <Input label="Telefone" name="phone" defaultValue={lead.phone ?? ""} />
        <Input
          label="Valor potencial (R$)"
          name="value"
          type="number"
          step="0.01"
          placeholder="0,00"
          defaultValue={lead.value != null ? Number(lead.value).toFixed(2) : ""}
        />
        <Input
          label="Próximo Follow-up"
          name="nextFollowUp"
          type="date"
          defaultValue={lead.nextFollowUp ? new Date(lead.nextFollowUp).toISOString().split("T")[0] : ""}
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Como nos conheceu</label>
          <select name="source" defaultValue={lead.source ?? ""} className="w-full rounded-xl border border-[#333] bg-[#1a1a1a] text-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
            <option value="">Selecione...</option>
            {SOURCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Plataformas</label>
          <div className="flex gap-2 pt-1">
            {PLATFORM_OPTIONS.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => togglePlatform(p.value)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                  platforms.includes(p.value)
                    ? "bg-violet-500/10 border-violet-500 text-violet-300"
                    : "bg-[#111] border-[#333] text-gray-500"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Textarea label="Observações" name="notes" defaultValue={lead.notes ?? ""} />

      <Button type="submit" variant="secondary" size="sm" loading={isPending}>
        Salvar Alterações
      </Button>
    </form>
  );
}
