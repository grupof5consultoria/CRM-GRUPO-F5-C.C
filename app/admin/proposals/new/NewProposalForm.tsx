"use client";

import { useActionState } from "react";
import { createProposalAction } from "../actions";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const initialState = { error: undefined as string | undefined };

export function NewProposalForm() {
  const [state, formAction, isPending] = useActionState(createProposalAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}
      <Input label="Título da Proposta *" name="title" required placeholder="Ex: Desenvolvimento de Site Institucional" />
      <Input label="Validade" name="validUntil" type="date" />
      <Textarea label="Observações iniciais" name="notes" placeholder="Contexto, escopo geral, condições..." />
      <p className="text-xs text-gray-400">
        Após criar, você poderá adicionar os itens e enviar o link ao cliente.
      </p>
      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={isPending}>Criar Proposta</Button>
        <Link href="/admin/proposals">
          <Button type="button" variant="secondary">Cancelar</Button>
        </Link>
      </div>
    </form>
  );
}
