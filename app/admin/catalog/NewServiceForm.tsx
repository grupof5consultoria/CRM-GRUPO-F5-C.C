"use client";

import { useActionState } from "react";
import { createServiceAction } from "./actions";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

interface Category { id: string; name: string; }
const initialState = { error: undefined as string | undefined };

const CHARGE_OPTIONS = [
  { value: "one_time", label: "Avulso" },
  { value: "recurring", label: "Recorrente" },
  { value: "hourly", label: "Por Hora" },
];

export function NewServiceForm({ categories }: { categories: Category[] }) {
  const [state, formAction, isPending] = useActionState(createServiceAction, initialState);

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));

  return (
    <form action={formAction} className="space-y-3">
      {state.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <Input label="Nome *" name="name" required placeholder="Ex: Desenvolvimento de Site" />
      <Textarea label="Descrição" name="description" placeholder="Descreva o serviço..." rows={2} />
      <Select label="Categoria *" name="categoryId" options={categoryOptions} placeholder="Selecione..." required />
      <Input label="Valor Padrão (R$) *" name="defaultValue" type="number" step="0.01" min="0" required placeholder="0,00" />
      <Input label="Horas Padrão" name="defaultHours" type="number" step="0.5" min="0" placeholder="Ex: 8" />
      <Select label="Tipo de Cobrança *" name="chargeType" options={CHARGE_OPTIONS} required />

      <Button type="submit" className="w-full" loading={isPending}>
        Cadastrar Serviço
      </Button>
    </form>
  );
}
