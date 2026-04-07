"use client";

import { useActionState } from "react";
import { createProposalAction } from "../actions";
import { Topbar } from "@/components/layout/Topbar";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const initialState = { error: undefined as string | undefined };

export default function NewProposalPage() {
  const [state, formAction, isPending] = useActionState(createProposalAction, initialState);

  return (
    <>
      <Topbar title="Nova Proposta" />
      <main className="flex-1 p-6 max-w-2xl">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
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
        </div>
      </main>
    </>
  );
}
