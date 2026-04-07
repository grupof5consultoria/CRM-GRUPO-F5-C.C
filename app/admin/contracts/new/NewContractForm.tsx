"use client";

import { useActionState, useState } from "react";
import { createContractAction } from "../actions";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface Client { id: string; name: string; }
interface Proposal {
  id: string;
  title: string;
  totalValue: { toString(): string };
  lead: { name: string; company: string | null } | null;
  client: { id: string; name: string } | null;
}

const initialState = { error: undefined as string | undefined };

export function NewContractForm({ clients, proposals }: { clients: Client[]; proposals: Proposal[] }) {
  const [state, formAction, isPending] = useActionState(createContractAction, initialState);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  const clientOptions = clients.map((c) => ({ value: c.id, label: c.name }));
  const proposalOptions = [
    { value: "", label: "Nenhuma (contrato manual)" },
    ...proposals.map((p) => ({
      value: p.id,
      label: `${p.title} — R$ ${Number(p.totalValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    })),
  ];

  function handleProposalChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const p = proposals.find((p) => p.id === e.target.value) ?? null;
    setSelectedProposal(p);
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <Input label="Título do Contrato *" name="title" required placeholder="Ex: Contrato de Desenvolvimento — Cliente X" />

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Vincular a Proposta</label>
        <select
          name="proposalId"
          onChange={handleProposalChange}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {proposalOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {proposals.length === 0 && (
          <p className="text-xs text-gray-400 mt-1">
            Nenhuma proposta aceita disponível.{" "}
            <Link href="/admin/proposals" className="text-blue-600 hover:underline">Ver propostas</Link>
          </p>
        )}
      </div>

      <Select
        label="Cliente *"
        name="clientId"
        options={clientOptions}
        placeholder="Selecione o cliente..."
        required
        defaultValue={selectedProposal?.client?.id ?? ""}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input label="Data de Início" name="startDate" type="date" />
        <Input label="Data de Término" name="endDate" type="date" />
        <div className="col-span-2">
          <Input
            label="Valor do Contrato (R$)"
            name="value"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            defaultValue={selectedProposal ? Number(selectedProposal.totalValue).toFixed(2) : ""}
          />
        </div>
      </div>

      <Textarea label="Observações" name="notes" placeholder="Condições, escopo, responsabilidades..." />

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={isPending}>Criar Contrato</Button>
        <Link href="/admin/contracts">
          <Button type="button" variant="secondary">Cancelar</Button>
        </Link>
      </div>
    </form>
  );
}
