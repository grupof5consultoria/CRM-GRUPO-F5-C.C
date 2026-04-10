"use client";

import { useState, useEffect, useCallback } from "react";
import { MindMapEditor, MindNode } from "./MindMapEditor";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Strategy {
  id: string;
  clientId: string;
  month: string;
  nodes: MindNode;
  client: { id: string; name: string };
  updatedAt: string;
}

interface Client { id: string; name: string }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function currentMonth() {
  return new Date().toISOString().substring(0, 7);
}

function formatMonth(month: string) {
  const [y, m] = month.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function prevMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return d.toISOString().substring(0, 7);
}

function nextMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m, 1);
  return d.toISOString().substring(0, 7);
}

function countNodes(node: MindNode): number {
  return 1 + node.children.reduce((s, c) => s + countNodes(c), 0);
}

// ─── Main component ───────────────────────────────────────────────────────────

export function StrategiesClient({ clients }: { clients: Client[] }) {
  const [month, setMonth]               = useState(currentMonth);
  const [strategies, setStrategies]     = useState<Strategy[]>([]);
  const [loading, setLoading]           = useState(true);
  const [creating, setCreating]         = useState<string | null>(null);
  const [activeStrategy, setActiveStrategy] = useState<Strategy | null>(null);

  const load = useCallback(async (m: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/estrategias?month=${m}`);
      const data = await res.json();
      setStrategies(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(month); }, [month, load]);

  const handleMonthChange = (m: string) => {
    setMonth(m);
  };

  const createStrategy = async (clientId: string) => {
    setCreating(clientId);
    try {
      const res = await fetch("/api/estrategias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, month }),
      });
      const s = await res.json();
      setStrategies(prev => [...prev.filter(x => x.clientId !== clientId), s]);
      setActiveStrategy(s);
    } finally {
      setCreating(null);
    }
  };

  const saveStrategy = async (id: string, nodes: MindNode) => {
    await fetch(`/api/estrategias/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodes }),
    });
    setStrategies(prev => prev.map(s => s.id === id ? { ...s, nodes } : s));
    setActiveStrategy(prev => prev?.id === id ? { ...prev, nodes } : prev);
  };

  const strategyMap = new Map(strategies.map(s => [s.clientId, s]));

  return (
    <div className="space-y-6">
      {/* Month navigator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 bg-[#1a1a1a] border border-[#262626] rounded-2xl px-4 py-2.5">
          <button
            onClick={() => handleMonthChange(prevMonth(month))}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#262626] text-gray-400 hover:text-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-2 min-w-[180px] justify-center">
            <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-semibold text-gray-200 capitalize">{formatMonth(month)}</span>
          </div>
          <button
            onClick={() => handleMonthChange(nextMonth(month))}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#262626] text-gray-400 hover:text-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="text-xs text-gray-600">
          {strategies.length} de {clients.length} clientes com estratégia
        </div>
      </div>

      {/* Client cards grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {clients.map(client => {
            const strategy = strategyMap.get(client.id);
            const isCreating = creating === client.id;

            return (
              <div
                key={client.id}
                className={`bg-[#1a1a1a] border rounded-2xl p-5 flex flex-col gap-4 transition-all ${
                  strategy ? "border-violet-800/40 hover:border-violet-600/60 cursor-pointer" : "border-[#262626] hover:border-[#333]"
                }`}
                onClick={() => strategy && setActiveStrategy(strategy)}
              >
                {/* Client name */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-violet-600/20 border border-violet-700/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-violet-400">
                      {client.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-200 truncate">{client.name}</p>
                    <p className="text-xs text-gray-600 capitalize">{formatMonth(month)}</p>
                  </div>
                </div>

                {/* Strategy info or create button */}
                {strategy ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Nós no mapa</span>
                      <span className="font-semibold text-violet-400">{countNodes(strategy.nodes)}</span>
                    </div>
                    <div className="w-full bg-[#262626] rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-violet-600 to-violet-400"
                        style={{ width: `${Math.min(countNodes(strategy.nodes) * 10, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-violet-400">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Clique para editar
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={e => { e.stopPropagation(); createStrategy(client.id); }}
                    disabled={isCreating}
                    className="w-full flex items-center justify-center gap-2 border border-dashed border-[#333] hover:border-violet-700/60 hover:bg-violet-600/5 text-gray-600 hover:text-violet-400 text-xs py-3 rounded-xl transition-all"
                  >
                    {isCreating
                      ? <div className="w-3.5 h-3.5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                      : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    }
                    Criar estratégia
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Mind map editor overlay */}
      {activeStrategy && (
        <MindMapEditor
          initialNodes={activeStrategy.nodes}
          clientName={activeStrategy.client.name}
          month={activeStrategy.month}
          onSave={(nodes) => saveStrategy(activeStrategy.id, nodes)}
          onClose={() => setActiveStrategy(null)}
        />
      )}
    </div>
  );
}
