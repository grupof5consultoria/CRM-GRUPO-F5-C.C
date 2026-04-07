"use client";

import { useState } from "react";
import { updateClientHealthAction } from "../actions";
import { Button } from "@/components/ui/Button";
import { ClientHealth } from "@prisma/client";
import { CLIENT_HEALTH_LABELS, CLIENT_HEALTH_VARIANTS } from "@/utils/status-labels";
import { Badge } from "@/components/ui/Badge";

const HEALTH_OPTIONS: { value: ClientHealth; emoji: string; description: string }[] = [
  { value: "thriving", emoji: "🟢", description: "Interagindo bem, resultados entregues" },
  { value: "stable", emoji: "🔵", description: "Tudo ok, relacionamento normal" },
  { value: "attention", emoji: "🟡", description: "Sumiu, resultado incerto, verificar" },
  { value: "at_risk", emoji: "🔴", description: "Pode cancelar, ação urgente necessária" },
];

export function UpdateHealthForm({
  clientId,
  currentHealth,
}: {
  clientId: string;
  currentHealth: ClientHealth;
}) {
  const [loading, setLoading] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState("");
  const [selected, setSelected] = useState<ClientHealth | null>(null);

  async function handleSelect(health: ClientHealth) {
    if (health === currentHealth) return;
    setSelected(health);
    setShowNote(true);
  }

  async function handleConfirm() {
    if (!selected) return;
    setLoading(true);
    await updateClientHealthAction(clientId, selected, note || undefined);
    setLoading(false);
    setShowNote(false);
    setNote("");
    setSelected(null);
  }

  return (
    <div className="space-y-2">
      {HEALTH_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => handleSelect(opt.value)}
          disabled={loading}
          className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all border ${
            opt.value === currentHealth
              ? "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 cursor-default"
              : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>{opt.emoji}</span>
              <Badge variant={CLIENT_HEALTH_VARIANTS[opt.value]}>
                {CLIENT_HEALTH_LABELS[opt.value]}
              </Badge>
            </div>
            {opt.value === currentHealth && (
              <span className="text-xs text-indigo-500 font-medium">atual</span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5 ml-6">{opt.description}</p>
        </button>
      ))}

      {showNote && selected && (
        <div className="mt-3 space-y-2 border-t dark:border-gray-700 pt-3">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Mudando para: {HEALTH_OPTIONS.find(o => o.value === selected)?.emoji} {CLIENT_HEALTH_LABELS[selected]}
          </p>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Motivo ou observação (opcional)..."
            className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleConfirm} loading={loading}>Confirmar</Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowNote(false); setSelected(null); }}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
