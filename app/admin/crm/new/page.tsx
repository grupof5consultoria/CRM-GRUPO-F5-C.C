"use client";

import { useActionState } from "react";
import { createLeadAction } from "../actions";
import { Topbar } from "@/components/layout/Topbar";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const initialState = { error: undefined as string | undefined };

export default function NewLeadPage() {
  const [state, formAction, isPending] = useActionState(createLeadAction, initialState);

  return (
    <>
      <Topbar title="Novo Lead" />
      <main className="flex-1 p-6 max-w-2xl">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <form action={formAction} className="space-y-4">
            {state.error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {state.error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Input label="Nome *" name="name" required placeholder="Nome do lead ou contato" />
              </div>
              <Input label="Empresa" name="company" placeholder="Nome da empresa" />
              <Input label="Email" name="email" type="email" placeholder="email@exemplo.com" />
              <Input label="Telefone" name="phone" placeholder="(11) 99999-9999" />
              <Input label="Próximo Follow-up" name="nextFollowUp" type="date" />
            </div>

            <Textarea label="Observações" name="notes" placeholder="Contexto, necessidades, pontos importantes..." />

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={isPending}>
                Criar Lead
              </Button>
              <Link href="/admin/crm">
                <Button type="button" variant="secondary">Cancelar</Button>
              </Link>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
