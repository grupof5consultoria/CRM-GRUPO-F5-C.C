"use client";

import { useActionState, useState } from "react";
import { toggleChecklistItemAction, addChecklistItemAction } from "../actions";
import { Button } from "@/components/ui/Button";

interface Item { id: string; text: string; isDone: boolean; }
const initialState = { error: undefined as string | undefined };

export function ChecklistSection({ items, taskId }: { items: Item[]; taskId: string }) {
  const [addState, addAction, isAdding] = useActionState(addChecklistItemAction, initialState);
  const [toggling, setToggling] = useState<string | null>(null);

  async function handleToggle(itemId: string, isDone: boolean) {
    setToggling(itemId);
    await toggleChecklistItemAction(itemId, isDone, taskId);
    setToggling(null);
  }

  return (
    <div className="space-y-4">
      {items.length === 0 && <p className="text-sm text-gray-400">Nenhum item no checklist.</p>}
      <div className="space-y-2">
        {items.map((item) => (
          <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={item.isDone}
              disabled={toggling === item.id}
              onChange={() => handleToggle(item.id, !item.isDone)}
              className="accent-blue-600 w-4 h-4 flex-shrink-0"
            />
            <span className={`text-sm ${item.isDone ? "line-through text-gray-400" : "text-gray-700"}`}>
              {item.text}
            </span>
          </label>
        ))}
      </div>

      <form action={addAction} className="flex gap-2">
        <input type="hidden" name="taskId" value={taskId} />
        <input name="text" placeholder="Novo item do checklist..." required
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <Button type="submit" size="sm" loading={isAdding}>Adicionar</Button>
      </form>
      {addState.error && <p className="text-xs text-red-600">{addState.error}</p>}
    </div>
  );
}
