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

// Default dueDate = today (YYYY-MM-DD)
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function NewChargeForm({ clients, defaultClientId, defaultContractId }: {
  clients: Client[];
  defaultClientId?: string;
  defaultContractId?: string;
}) {
  const [state, formAction, isPending] = useActionState(createChargeAction, initialState);
  const [isRecurring, setIsRecurring] = useState(false);
  const clientOptions = clients.map((c) => ({ value: c.id, label: c.name }));

  return (
    <form action={formAction} className="space-y-3">
      {state.error && (
        <div className="rounded-xl bg-red-950 border border-red-800 px-3 py-2 text-sm text-red-400">{state.error}</div>
      )}

      {/* Hidden fields */}
      {defaultContractId && <input type="hidden" name="contractId" value={defaultContractId} />}

      <Select
        label="Cliente *"
        name="clientId"
        options={clientOptions}
        placeholder="Selecione..."
        defaultValue={defaultClientId}
      />
      <Input label="Descrição *" name="description" required placeholder="Ex: Mensalidade Abril/2025" />
      <Input label="Valor (R$) *" name="value" type="number" step="0.01" min="0.01" required placeholder="0,00" />
      <Input
        label="Vencimento *"
        name="dueDate"
        type="date"
        required
        defaultValue={todayStr()}
      />
      <p className="text-[11px] text-gray-600 -mt-1">
        Use a data do mês vigente (ex: 10/04/2025 para cobrança de Abril).
      </p>

      {/* Forma de pagamento */}
      <div>
        <p className="text-sm font-medium text-gray-300 mb-2">Forma de Pagamento</p>
        <div className="grid grid-cols-3 gap-1.5">
          {PAYMENT_OPTIONS.map((opt) => (
            <label key={opt.value} className="cursor-pointer">
              <input type="radio" name="paymentMethod" value={opt.value} defaultChecked={opt.value === "pix"} className="sr-only peer" />
              <div className="text-center text-xs px-2 py-2 rounded-xl border border-[#333] peer-checked:border-violet-500 peer-checked:bg-violet-950 peer-checked:text-violet-300 hover:bg-[#222] transition-colors text-gray-500 font-medium">
                {opt.label}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Recorrência */}
      <div className="border border-[#333] rounded-xl p-3 space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="w-4 h-4 rounded accent-violet-600"
          />
          <input type="hidden" name="isRecurring" value={isRecurring ? "true" : "false"} />
          <span className="text-sm font-medium text-gray-300">🔄 Cobrança Recorrente (mensal)</span>
        </label>

        {isRecurring && (
          <div>
            <label className="text-xs text-gray-500">Dia do vencimento todo mês</label>
            <input
              type="number"
              name="recurrenceDay"
              min={1}
              max={31}
              placeholder="Ex: 10"
              className="mt-1 block w-full rounded-xl border border-[#333] bg-[#111] text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <p className="text-xs text-gray-600 mt-1">
              Quando marcar como pago, a próxima cobrança é gerada automaticamente.
            </p>
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" loading={isPending}>
        Criar Cobrança
      </Button>
    </form>
  );
}
