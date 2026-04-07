"use client";

import { useActionState } from "react";
import { addActivityAction } from "../actions";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

const ACTIVITY_TYPES = [
  { value: "note", label: "📝 Anotação" },
  { value: "call", label: "📞 Ligação" },
  { value: "email", label: "📧 Email" },
  { value: "meeting", label: "🤝 Reunião" },
];

const initialState = { error: undefined as string | undefined };

export function AddActivityForm({ leadId }: { leadId: string }) {
  const [state, formAction, isPending] = useActionState(addActivityAction, initialState);

  return (
    <form action={formAction} className="space-y-3 border border-gray-100 rounded-lg p-4 bg-gray-50">
      <input type="hidden" name="leadId" value={leadId} />

      {state.error && (
        <p className="text-xs text-red-600">{state.error}</p>
      )}

      <div className="flex gap-2">
        {ACTIVITY_TYPES.map((type) => (
          <label key={type.value} className="flex items-center gap-1 cursor-pointer">
            <input type="radio" name="type" value={type.value} defaultChecked={type.value === "note"} className="accent-blue-600" />
            <span className="text-sm">{type.label}</span>
          </label>
        ))}
      </div>

      <Textarea
        name="description"
        placeholder="Descreva a atividade, conversa ou observação..."
        rows={2}
      />

      <Button type="submit" size="sm" loading={isPending}>
        Registrar Atividade
      </Button>
    </form>
  );
}
