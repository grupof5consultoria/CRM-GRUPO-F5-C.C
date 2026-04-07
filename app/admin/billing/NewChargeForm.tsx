"use client";

import { useActionState } from "react";
import { createChargeAction } from "./actions";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

interface Client { id: string; name: string; }
const initialState = { error: undefined as string | undefined };

export function NewChargeForm({ clients }: { clients: Client[] }) {
  const [state, formAction, isPending] = useActionState(createChargeAction, initialState);
  const clientOptions = clients.map((c) => ({ value: c.id, label: c.name }));

  return (
    <form action={formAction} className="space-y-3">
      {state.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{state.error}</div>
      )}
      {state.error === undefined && state.error !== undefined && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">Cobrança criada!</div>
      )}

      <Select label="Cliente *" name="clientId" options={clientOptions} placeholder="Selecione..." required />
      <Input label="Descrição *" name="description" required placeholder="Ex: Mensalidade Novembro/2025" />
      <Input label="Valor (R$) *" name="value" type="number" step="0.01" min="0.01" required placeholder="0,00" />
      <Input label="Vencimento *" name="dueDate" type="date" required />

      <Button type="submit" className="w-full" loading={isPending}>
        Criar Cobrança
      </Button>

      <p className="text-xs text-gray-400 text-center">
        Se o gateway estiver configurado, o link de pagamento será gerado automaticamente.
      </p>
    </form>
  );
}
