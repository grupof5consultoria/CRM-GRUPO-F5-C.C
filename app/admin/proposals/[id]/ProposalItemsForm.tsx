"use client";

import { useActionState, useState } from "react";
import { saveProposalItemsAction } from "../actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

interface Item {
  id: string;
  description: string;
  quantity: { toString(): string } | number | string;
  unitValue: { toString(): string } | number | string;
  totalValue: { toString(): string } | number | string;
}

interface Proposal {
  id: string;
  notes: string | null;
  validUntil: Date | null;
  items: Item[];
}

const initialState = { error: undefined as string | undefined };

export function ProposalItemsForm({ proposal }: { proposal: Proposal }) {
  const [state, formAction, isPending] = useActionState(saveProposalItemsAction, initialState);
  const [items, setItems] = useState<{ description: string; quantity: string; unitValue: string }[]>(
    proposal.items.length > 0
      ? proposal.items.map((i) => ({
          description: i.description,
          quantity: i.quantity.toString(),
          unitValue: i.unitValue.toString(),
        }))
      : [{ description: "", quantity: "1", unitValue: "0" }]
  );

  function addItem() {
    setItems([...items, { description: "", quantity: "1", unitValue: "0" }]);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: string, value: string) {
    setItems(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  const total = items.reduce((sum, item) => {
    return sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unitValue) || 0);
  }, 0);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="proposalId" value={proposal.id} />

      {state.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* Itens */}
      <div className="space-y-3">
        <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-500 px-1">
          <span className="col-span-6">Descrição</span>
          <span className="col-span-2">Qtd</span>
          <span className="col-span-2">Valor Unit.</span>
          <span className="col-span-1">Total</span>
          <span className="col-span-1"></span>
        </div>

        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-start">
            <div className="col-span-6">
              <input
                name="description"
                value={item.description}
                onChange={(e) => updateItem(index, "description", e.target.value)}
                placeholder="Descrição do item ou serviço"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <input
                name="quantity"
                type="number"
                step="0.5"
                min="0"
                value={item.quantity}
                onChange={(e) => updateItem(index, "quantity", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <input
                name="unitValue"
                type="number"
                step="0.01"
                min="0"
                value={item.unitValue}
                onChange={(e) => updateItem(index, "unitValue", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-1 py-2 text-sm text-gray-600">
              {((parseFloat(item.quantity) || 0) * (parseFloat(item.unitValue) || 0)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <div className="col-span-1">
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-red-400 hover:text-red-600 py-2 px-1 text-lg leading-none"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="text-sm text-blue-600 hover:underline"
      >
        + Adicionar item
      </button>

      <div className="flex justify-end pt-2 border-t border-gray-100">
        <div className="text-right">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-xl font-bold text-gray-900">
            R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
        <Input
          label="Validade"
          name="validUntil"
          type="date"
          defaultValue={proposal.validUntil ? new Date(proposal.validUntil).toISOString().split("T")[0] : ""}
        />
        <div />
        <div className="col-span-2">
          <Textarea
            label="Observações / Escopo"
            name="notes"
            defaultValue={proposal.notes ?? ""}
            placeholder="Descreva o escopo, condições, prazo de entrega..."
          />
        </div>
      </div>

      <Button type="submit" loading={isPending}>Salvar Proposta</Button>
    </form>
  );
}
