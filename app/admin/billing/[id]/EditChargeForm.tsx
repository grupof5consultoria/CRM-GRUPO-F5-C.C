"use client";

import { useActionState, useState } from "react";
import { updateChargeAction } from "./actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const PAYMENT_OPTIONS = [
  { value: "pix", label: "💠 PIX" },
  { value: "boleto", label: "📄 Boleto" },
  { value: "credit_card", label: "💳 Cartão de Crédito" },
  { value: "bank_transfer", label: "🏦 Transferência" },
  { value: "cash", label: "💵 Dinheiro" },
];

interface Charge {
  id: string;
  description: string;
  value: { toString(): string } | number;
  dueDate: Date | string;
  paymentMethod: string;
  isRecurring: boolean;
  recurrenceDay: number | null;
  client: { id: string; name: string };
}

const initialState = { error: undefined as string | undefined };

export function EditChargeForm({ charge }: { charge: Charge }) {
  const [state, formAction, isPending] = useActionState(updateChargeAction, initialState);
  const [isRecurring, setIsRecurring] = useState(charge.isRecurring);

  const dueDateStr = new Date(charge.dueDate).toISOString().split("T")[0];

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={charge.id} />

      {state.error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {state.error}
        </div>
      )}

      <div className="bg-indigo-50 dark:bg-indigo-950 rounded-xl px-4 py-2.5 text-sm">
        <p className="text-indigo-500 text-xs font-medium">Cliente</p>
        <p className="font-semibold text-indigo-700 dark:text-indigo-300">{charge.client.name}</p>
      </div>

      <Input label="Descrição *" name="description" defaultValue={charge.description} required />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Valor (R$) *" name="value" type="number" step="0.01" min="0.01" defaultValue={Number(charge.value).toFixed(2)} required />
        <Input label="Vencimento *" name="dueDate" type="date" defaultValue={dueDateStr} required />
      </div>

      {/* Forma de pagamento */}
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Forma de Pagamento</p>
        <div className="grid grid-cols-3 gap-1.5">
          {PAYMENT_OPTIONS.map((opt) => (
            <label key={opt.value} className="cursor-pointer">
              <input type="radio" name="paymentMethod" value={opt.value} defaultChecked={charge.paymentMethod === opt.value} className="sr-only peer" />
              <div className="text-center text-xs px-2 py-2 rounded-xl border border-gray-200 dark:border-gray-700 peer-checked:border-indigo-500 peer-checked:bg-indigo-50 dark:peer-checked:bg-indigo-950 peer-checked:text-indigo-700 dark:peer-checked:text-indigo-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400 font-medium">
                {opt.label}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Recorrência */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
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
              defaultValue={charge.recurrenceDay ?? new Date(charge.dueDate).getDate()}
              className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Ao confirmar ✅ pagamento, a data de vencimento avança automaticamente para o próximo mês nesse dia.
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={isPending}>Salvar Alterações</Button>
        <Link href="/admin/billing">
          <Button type="button" variant="secondary">Cancelar</Button>
        </Link>
      </div>
    </form>
  );
}
