"use client";

import { useState, useEffect, useCallback } from "react";
import { MindMapEditor, MindNode } from "./MindMapEditor";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Strategy {
  id: string;
  clientId: string;
  month: string;
  nodes: MindNode;
  client: { id: string; name: string; metaFaturamento: string | null };
  updatedAt: string;
  faturamento: number;
}

function fmtBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 });
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
                className={`bg-[#1a1a1a] border rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 ${
                  strategy
                    ? "border-violet-800/40 hover:border-violet-500/60 hover:bg-[#1e1e1e] cursor-pointer hover:shadow-lg hover:shadow-violet-900/20"
                    : "border-[#262626] hover:border-[#333]"
                }`}
                onClick={() => strategy && setActiveStrategy(strategy)}
              >
                {/* Client name */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600/30 to-violet-800/30 border border-violet-600/40 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-violet-300">
                      {client.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-100 truncate">{client.name}</p>
                    <p className="text-xs text-gray-600 capitalize">{formatMonth(month)}</p>
                  </div>
                  {strategy && (
                    <div className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0" title="Mapa criado" />
                  )}
                </div>

                {/* Strategy info or create button */}
                {strategy ? (
                  <div className="space-y-3">
                    {/* META DE FATURAMENTO */}
                    {(() => {
                      const meta = strategy.client.metaFaturamento ? Number(strategy.client.metaFaturamento) : null;
                      const fat  = strategy.faturamento ?? 0;
                      const pct  = meta && meta > 0 ? Math.min(100, Math.round((fat / meta) * 100)) : null;

                      return meta !== null ? (
                        <div className="bg-[#111] border border-[#222] rounded-xl p-3 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500 font-medium flex items-center gap-1">
                              <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                              </svg>
                              META
                            </span>
                            <span className="text-emerald-400 font-bold">{fmtBRL(meta)}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Faturado</span>
                            <span className={`font-semibold ${fat >= meta ? "text-emerald-400" : "text-amber-400"}`}>{fmtBRL(fat)}</span>
                          </div>
                          <div className="w-full bg-[#222] rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all ${fat >= meta ? "bg-gradient-to-r from-emerald-600 to-emerald-400" : "bg-gradient-to-r from-amber-600 to-amber-400"}`}
                              style={{ width: `${pct ?? 0}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-gray-600 text-right">{pct !== null ? `${pct}% da meta` : "—"}</p>
                        </div>
                      ) : (
                        <div className="bg-[#111] border border-dashed border-[#2a2a2a] rounded-xl p-2.5 text-center">
                          <p className="text-[11px] text-gray-600">Meta de faturamento não definida</p>
                          <p className="text-[10px] text-gray-700">Configure no onboarding do cliente</p>
                        </div>
                      );
                    })()}

                    {/* Edit map button */}
                    <div className="w-full flex items-center justify-center gap-2 bg-violet-600/10 hover:bg-violet-600/20 border border-violet-700/40 hover:border-violet-500/60 text-violet-400 hover:text-violet-300 rounded-xl py-2.5 transition-all group">
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      <span className="text-sm font-semibold">Editar Mapa Mental</span>
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
