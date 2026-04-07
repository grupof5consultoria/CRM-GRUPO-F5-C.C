"use client";

import { useActionState, useState } from "react";
import { addContactAction } from "../actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState = { error: undefined as string | undefined };

export function AddContactForm({ clientId }: { clientId: string }) {
  const [state, formAction, isPending] = useActionState(addContactAction, initialState);
  const [open, setOpen] = useState(false);

  if (!open) return (
    <button onClick={() => setOpen(true)} className="text-sm text-blue-600 hover:underline">+ Adicionar contato</button>
  );

  return (
    <form action={formAction} className="space-y-3 border border-gray-100 rounded-lg p-4 bg-gray-50">
      <input type="hidden" name="clientId" value={clientId} />
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <Input label="Nome *" name="name" required placeholder="Nome do contato" />
        <Input label="Cargo" name="role" placeholder="Ex: Diretor, TI..." />
        <Input label="Email" name="email" type="email" placeholder="email@empresa.com" />
        <Input label="Telefone" name="phone" placeholder="(11) 99999-9999" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPrimary" value="true" className="accent-blue-600" />
        Contato principal
      </label>
      <div className="flex gap-2">
        <Button type="submit" size="sm" loading={isPending}>Salvar</Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
      </div>
    </form>
  );
}
