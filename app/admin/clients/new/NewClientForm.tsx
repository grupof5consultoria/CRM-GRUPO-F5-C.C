"use client";

import { useActionState } from "react";
import { createClientAction } from "../actions";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface User { id: string; name: string; }
const initialState = { error: undefined as string | undefined };

export function NewClientForm({ users }: { users: User[] }) {
  const [state, formAction, isPending] = useActionState(createClientAction, initialState);
  const userOptions = users.map((u) => ({ value: u.id, label: u.name }));

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{state.error}</div>
      )}
      <Input label="Nome *" name="name" required placeholder="Nome do cliente ou empresa" />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Email" name="email" type="email" placeholder="email@empresa.com" />
        <Input label="Telefone" name="phone" placeholder="(11) 99999-9999" />
        <Input label="CPF / CNPJ" name="document" placeholder="00.000.000/0001-00" />
        <Input label="Valor Mensal (R$)" name="monthlyValue" type="number" step="0.01" placeholder="0,00" />
        <Input label="Dia de vencimento" name="dueDay" type="number" min="1" max="31" placeholder="Ex: 10" />
        <Input label="Início do contrato" name="startDate" type="date" />
        <Select label="Responsável" name="ownerId" options={userOptions} placeholder="Selecione..." />
      </div>
      <Textarea label="Observações" name="notes" placeholder="Contexto, histórico, informações importantes..." />
      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={isPending}>Cadastrar Cliente</Button>
        <Link href="/admin/clients"><Button type="button" variant="secondary">Cancelar</Button></Link>
      </div>
    </form>
  );
}
