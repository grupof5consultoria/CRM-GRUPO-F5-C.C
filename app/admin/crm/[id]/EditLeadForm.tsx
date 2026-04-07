"use client";

import { useActionState } from "react";
import { updateLeadAction } from "../actions";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  notes: string | null;
  nextFollowUp: Date | null;
  status: string;
}

const initialState = { error: undefined as string | undefined };

export function EditLeadForm({ lead }: { lead: Lead }) {
  const [state, formAction, isPending] = useActionState(updateLeadAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={lead.id} />
      <input type="hidden" name="status" value={lead.status} />

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
          label="Próximo Follow-up"
          name="nextFollowUp"
          type="date"
          defaultValue={
            lead.nextFollowUp
              ? new Date(lead.nextFollowUp).toISOString().split("T")[0]
              : ""
          }
        />
      </div>

      <Textarea label="Observações" name="notes" defaultValue={lead.notes ?? ""} />

      <Button type="submit" variant="secondary" size="sm" loading={isPending}>
        Salvar Alterações
      </Button>
    </form>
  );
}
