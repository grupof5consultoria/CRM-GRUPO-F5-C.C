"use client";

import { useState } from "react";
import { saveMetaGoalAction } from "../actions";

interface Props {
  clientId: string;
  clientName: string;
  currentGoal: number | null;
  currentConversations: number;
  /** Average cost per conversation from last 60 days (null if no data) */
  avgCostPerConv: number | null;
  /** Current period label e.g. "abril 2025" */
  periodLabel: string;
}

function Ring({ pct }: { pct: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const filled = Math.min(pct / 100, 1) * circ;
  const color = pct >= 100 ? "#34d399" : pct >= 70 ? "#60a5fa" : pct >= 40 ? "#fbbf24" : "#f87171";
  return (
    <svg width="88" height="88" className="flex-shrink-0">
      <circle cx="44" cy="44" r={r} fill="none" stroke="#1e1e1e" strokeWidth="7" />
      <circle
        cx="44" cy="44" r={r} fill="none"
        stroke={color} strokeWidth="7"
        strokeDasharray={`${filled} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 44 44)"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text x="44" y="47" textAnchor="middle" dominantBaseline="middle" fill={color} fontSize="13" fontWeight="700">
        {pct >= 100 ? "✓" : `${Math.round(pct)}%`}
      </text>
    </svg>
  );
}

export function GoalWidget({
  clientId, clientName, currentGoal, currentConversations, avgCostPerConv, periodLabel,
}: Props) {
  const [goal, setGoal]       = useState<number | null>(currentGoal);
  const [editing, setEditing] = useState(false);
  const [input, setInput]     = useState(String(currentGoal ?? ""));
  const [saving, setSaving]   = useState(false);

  const pct = goal && goal > 0 ? (currentConversations / goal) * 100 : 0;

  // Smart suggestion: budget / avgCostPerConv — using R$1500 as default reference
  const suggested = avgCostPerConv && avgCostPerConv > 0
    ? Math.round(1500 / avgCostPerConv)
    : null;

  async function handleSave() {
    const v = parseInt(input);
    if (isNaN(v) || v <= 0) return;
    setSaving(true);
    await saveMetaGoalAction(clientId, v);
    setGoal(v);
    setEditing(false);
    setSaving(false);
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#262626]">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-violet-400" />
          <div>
            <p className="text-sm font-bold text-white">Meta de Conversas — {clientName}</p>
            <p className="text-xs text-gray-600 capitalize">{periodLabel}</p>
          </div>
        </div>
        <button
          onClick={() => { setInput(String(goal ?? "")); setEditing(!editing); }}
          className="text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors"
        >
          {editing ? "Cancelar" : goal ? "Editar meta" : "Definir meta"}
        </button>
      </div>

      <div className="px-5 py-4">
        {editing ? (
          /* ── Edit form ─────────────────────────────────────── */
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Meta de conversas no mês</label>
              <input
                type="number"
                min="1"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="ex: 40"
                className="w-full bg-[#111] border border-[#333] rounded-xl px-3 py-3 text-lg font-bold text-violet-400 placeholder-gray-700 focus:outline-none focus:border-violet-500"
                autoFocus
              />
            </div>

            {/* Smart suggestion */}
            {avgCostPerConv && (
              <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl px-4 py-3 space-y-1">
                <p className="text-xs font-semibold text-blue-400">Sugestão baseada no histórico</p>
                <p className="text-xs text-gray-500">
                  Custo médio por conversa (últimos 60 dias):
                  <span className="text-white font-semibold ml-1">
                    R$ {avgCostPerConv.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </p>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[1000, 1500, 2000].map(budget => {
                    const sug = Math.round(budget / avgCostPerConv);
                    return (
                      <button
                        key={budget}
                        type="button"
                        onClick={() => setInput(String(sug))}
                        className="bg-[#111] border border-[#262626] hover:border-violet-500/40 rounded-xl px-2 py-2 text-center transition-all"
                      >
                        <p className="text-[10px] text-gray-600">R$ {budget.toLocaleString("pt-BR")}</p>
                        <p className="text-sm font-bold text-blue-400">~{sug} conv</p>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-gray-700 mt-1">
                  * Estimativa. O custo real varia por período e campanha.
                </p>
              </div>
            )}

            {!avgCostPerConv && (
              <p className="text-xs text-gray-600 bg-[#111] border border-[#262626] rounded-xl px-3 py-2">
                Sincronize pelo menos 60 dias de dados para ver sugestões personalizadas.
              </p>
            )}

            <button
              onClick={handleSave}
              disabled={saving || !input || parseInt(input) <= 0}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-50 transition-colors"
            >
              {saving ? "Salvando..." : "Salvar Meta"}
            </button>
          </div>
        ) : goal ? (
          /* ── Progress view ─────────────────────────────────── */
          <div className="flex items-center gap-5">
            <Ring pct={pct} />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold text-white">{currentConversations.toLocaleString("pt-BR")}</span>
                <span className="text-sm text-gray-600">/ {goal.toLocaleString("pt-BR")} conversas</span>
              </div>
              <div className="h-2 bg-[#111] rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    pct >= 100 ? "bg-emerald-400" : pct >= 70 ? "bg-blue-400" : pct >= 40 ? "bg-amber-400" : "bg-red-400"
                  }`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-600">
                {pct >= 100
                  ? "Meta atingida! 🎉"
                  : `Faltam ${(goal - currentConversations).toLocaleString("pt-BR")} conversas`}
                {avgCostPerConv && pct < 100 && (
                  <span className="ml-2 text-gray-700">
                    · ~R$ {((goal - currentConversations) * avgCostPerConv).toLocaleString("pt-BR", { minimumFractionDigits: 0 })} estimados
                  </span>
                )}
              </p>
            </div>
          </div>
        ) : (
          /* ── No goal set ───────────────────────────────────── */
          <div className="text-center py-4">
            <p className="text-sm text-gray-600">Nenhuma meta definida para este cliente.</p>
            {suggested && (
              <p className="text-xs text-gray-700 mt-1">
                Sugestão com R$1.500: ~{suggested} conversas (baseado no histórico)
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
