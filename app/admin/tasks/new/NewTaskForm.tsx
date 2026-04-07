"use client";

import { useActionState } from "react";
import { createTaskAction } from "../actions";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface User { id: string; name: string; }
interface Client { id: string; name: string; }
const initialState = { error: undefined as string | undefined };

export function NewTaskForm({ users, clients }: { users: User[]; clients: Client[] }) {
  const [state, formAction, isPending] = useActionState(createTaskAction, initialState);
  const userOptions = users.map((u) => ({ value: u.id, label: u.name }));
  const clientOptions = [{ value: "", label: "Nenhum (tarefa interna)" }, ...clients.map((c) => ({ value: c.id, label: c.name }))];

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{state.error}</div>}
      <Input label="Título *" name="title" required placeholder="Descreva a tarefa brevemente" />
      <Textarea label="Descrição" name="description" placeholder="Detalhes, critérios de aceite, contexto..." />
      <div className="grid grid-cols-2 gap-4">
        <Select label="Responsável" name="assigneeId" options={userOptions} placeholder="Selecione..." required />
        <Select label="Cliente" name="clientId" options={clientOptions} />
        <Input label="Prazo" name="dueDate" type="date" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isClientVisible" className="accent-blue-600" />
        Visível no portal do cliente
      </label>
      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={isPending}>Criar Tarefa</Button>
        <Link href="/admin/tasks"><Button type="button" variant="secondary">Cancelar</Button></Link>
      </div>
    </form>
  );
}
