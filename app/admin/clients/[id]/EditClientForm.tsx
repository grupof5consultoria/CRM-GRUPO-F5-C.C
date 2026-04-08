"use client";

import { useActionState } from "react";
import { updateClientAction } from "../actions";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

interface Client { id: string; name: string; email: string | null; phone: string | null; document: string | null; notes: string | null; status: string; ownerId: string; monthlyValue?: { toString(): string } | number | null; startDate?: Date | string | null; }
interface User { id: string; name: string; }
const initialState = { error: undefined as string | undefined };

const STATUS_OPTIONS = [
  { value: "active", label: "Ativo" },
  { value: "inactive", label: "Inativo" },
  { value: "blocked", label: "Bloqueado" },
];

export function EditClientForm({ client, users }: { client: Client; users: User[] }) {
  const [state, formAction, isPending] = useActionState(updateClientAction, initialState);
  const userOptions = users.map((u) => ({ value: u.id, label: u.name }));

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={client.id} />
      {state.error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{state.error}</div>}
      <Input label="Nome *" name="name" defaultValue={client.name} required />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Email" name="email" type="email" defaultValue={client.email ?? ""} />
        <Input label="Telefone" name="phone" defaultValue={client.phone ?? ""} />
        <Input label="CPF / CNPJ" name="document" defaultValue={client.document ?? ""} />
        <Input label="Valor Mensal (R$)" name="monthlyValue" type="number" step="0.01" placeholder="0,00" defaultValue={client.monthlyValue != null ? Number(client.monthlyValue).toFixed(2) : ""} />
        <Input label="Início do contrato" name="startDate" type="date" defaultValue={client.startDate ? new Date(client.startDate).toISOString().split("T")[0] : ""} />
        <Select label="Status" name="status" options={STATUS_OPTIONS} defaultValue={client.status} />
        <Select label="Responsável" name="ownerId" options={userOptions} defaultValue={client.ownerId} />
      </div>
      <Textarea label="Observações" name="notes" defaultValue={client.notes ?? ""} />
      <Button type="submit" variant="secondary" size="sm" loading={isPending}>Salvar</Button>
    </form>
  );
}
