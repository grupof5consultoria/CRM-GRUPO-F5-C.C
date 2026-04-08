"use client";

import { useActionState, useState } from "react";
import { createChargeAction } from "./actions";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

interface Client { id: string; name: string; }
const initialState = { error: undefined as string | undefined };

const PAYMENT_OPTIONS = [
  { value: "pix", label: "💠 PIX" },
  { value: "boleto", label: "📄 Boleto" },
  { value: "credit_card", label: "💳 Cartão de Crédito" },
  { value: "bank_transfer", label: "🏦 Transferência" },
  { value: "cash", label: "💵 Dinheiro" },
];

export function NewChargeForm({ clients }: { clients: Client[] }) {
  const [state, formAction, isPending] = useActionState(createChargeAction, initialState);
  const [isRecurring, setIsRecurring] = useState(false);
  const clientOptions = clients.map((c) => ({ value: c.id, label: c.name }));

  return (
    <form action={formAction} className="space-y-3">
      {state.error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-400">{state.error}</div>
      )}

      <Select label="Cliente *" name="clientId" options={clientOptions} placeholder="Selecione..." />
      <Input label="Descrição *" name="description" required placeholder="Ex: Mensalidade Novembro/2025" />
      <Input label="Valor (R$) *" name="value" type="number" step="0.01" min="0.01" required placeholder="0,00" />
      <Input label="Vencimento *" name="dueDate" type="date" required />

      {/* Forma de pagamento */}
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Forma de Pagamento</p>
        <div className="grid grid-cols-3 gap-1.5">
          {PAYMENT_OPTIONS.map((opt) => (
            <label key={opt.value} className="cursor-pointer">
              <input type="radio" name="paymentMethod" value={opt.value} defaultChecked={opt.value === "pix"} className="sr-only peer" />
              <div className="text-center text-xs px-2 py-2 rounded-xl border border-gray-200 dark:border-gray-700 peer-checked:border-indigo-500 peer-checked:bg-indigo-50 dark:peer-checked:bg-indigo-950 peer-checked:text-indigo-700 dark:peer-checked:text-indigo-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400 font-medium">
                {opt.label}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Recorrência */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="w-4 h-4 rounded accent-indigo-600"
          />
          <input type="hidden" name="isRecurring" value={isRecurring ? "true" : "false"} />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">🔄 Cobrança Recorrente</span>
        </label>

        {isRecurring && (
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">Dia do vencimento todo mês</label>
            <input
              type="number"
              name="recurrenceDay"
              min={1}
              max={31}
              placeholder="Ex: 10"
              className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-400 mt-1">Os próximos vencimentos serão gerados automaticamente nesse dia.</p>
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" loading={isPending}>
        Criar Cobrança
      </Button>
    </form>
  );
}
