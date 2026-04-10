"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MindNode {
  id: string;
  text: string;
  children: MindNode[];
}

interface Strategy {
  id: string;
  clientId: string;
  month: string;
  nodes: MindNode;
  client: { id: string; name: string };
  updatedAt: string;
}

interface Client { id: string; name: string }

// ─── Node colors by level ─────────────────────────────────────────────────────

const LEVEL_COLORS = [
  { bg: "bg-violet-600",  border: "border-violet-500",  text: "text-white",      line: "#7c3aed" },
  { bg: "bg-blue-600",    border: "border-blue-500",    text: "text-white",      line: "#2563eb" },
  { bg: "bg-emerald-600", border: "border-emerald-500", text: "text-white",      line: "#059669" },
  { bg: "bg-amber-500",   border: "border-amber-400",   text: "text-white",      line: "#d97706" },
  { bg: "bg-pink-600",    border: "border-pink-500",    text: "text-white",      line: "#db2777" },
  { bg: "bg-cyan-600",    border: "border-cyan-500",    text: "text-white",      line: "#0891b2" },
];

function nodeColor(level: number) {
  return LEVEL_COLORS[level % LEVEL_COLORS.length];
}

function genId() {
  return Math.random().toString(36).substring(2, 10);
}

// ─── Mind map node (recursive) ────────────────────────────────────────────────

function MindMapNode({
  node, level, onUpdate, onDelete, onAdd,
}: {
  node: MindNode;
  level: number;
  onUpdate: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onAdd:    (parentId: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(node.text);
  const inputRef = useRef<HTMLInputElement>(null);
  const color = nodeColor(level);

  const commit = () => {
    setEditing(false);
    if (draft.trim() && draft !== node.text) onUpdate(node.id, draft.trim());
    else setDraft(node.text);
  };

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  return (
    <div className="flex items-start gap-0">
      {/* Node + children wrapper */}
      <div className="flex items-start gap-3">
        {/* Node pill */}
        <div className="flex flex-col items-center">
          <div className={`flex items-center gap-1.5 ${color.bg} rounded-xl px-3 py-2 shadow-lg group min-w-[80px]`}>
            {editing ? (
              <input
                ref={inputRef}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setEditing(false); setDraft(node.text); } }}
                className="bg-transparent text-white text-sm font-medium outline-none w-full min-w-[80px]"
              />
            ) : (
              <span
                className={`text-sm font-medium ${color.text} cursor-pointer select-none`}
                onDoubleClick={() => setEditing(true)}
              >
                {node.text}
              </span>
            )}
            {/* Actions (show on hover) */}
            <div className="hidden group-hover:flex items-center gap-1 ml-1 flex-shrink-0">
              <button
                onClick={() => onAdd(node.id)}
                title="Adicionar filho"
                className="w-4 h-4 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white text-xs leading-none transition-colors"
              >+</button>
              {level > 0 && (
                <button
                  onClick={() => onDelete(node.id)}
                  title="Remover nó"
                  className="w-4 h-4 rounded-full bg-white/20 hover:bg-red-500 flex items-center justify-center text-white text-xs leading-none transition-colors"
                >×</button>
              )}
            </div>
          </div>
        </div>

        {/* Children */}
        {node.children.length > 0 && (
          <div className="flex flex-col gap-3 mt-1">
            {/* Horizontal connector + vertical bracket */}
            <div className="flex items-start gap-0">
              <div className="flex flex-col items-center self-stretch">
                <div className="w-6 border-t-2 mt-4" style={{ borderColor: color.line }} />
              </div>
              <div
                className="flex flex-col gap-3 border-l-2 pl-3"
                style={{ borderColor: color.line }}
              >
                {node.children.map(child => (
                  <MindMapNode
                    key={child.id}
                    node={child}
                    level={level + 1}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onAdd={onAdd}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Mind map editor ──────────────────────────────────────────────────────────

function MindMapEditor({
  strategy,
  onSave,
  onClose,
}: {
  strategy: Strategy;
  onSave: (id: string, nodes: MindNode) => Promise<void>;
  onClose: () => void;
}) {
  const [nodes, setNodes] = useState<MindNode>(strategy.nodes);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty]   = useState(false);

  // Deep update helpers
  function updateNodeText(root: MindNode, id: string, text: string): MindNode {
    if (root.id === id) return { ...root, text };
    return { ...root, children: root.children.map(c => updateNodeText(c, id, text)) };
  }

  function addChild(root: MindNode, parentId: string): MindNode {
    if (root.id === parentId) {
      return { ...root, children: [...root.children, { id: genId(), text: "Novo nó", children: [] }] };
    }
    return { ...root, children: root.children.map(c => addChild(c, parentId)) };
  }

  function deleteNode(root: MindNode, id: string): MindNode {
    return { ...root, children: root.children.filter(c => c.id !== id).map(c => deleteNode(c, id)) };
  }

  const handleUpdate = (id: string, text: string) => {
    setNodes(prev => updateNodeText(prev, id, text));
    setDirty(true);
  };

  const handleAdd = (parentId: string) => {
    setNodes(prev => addChild(prev, parentId));
    setDirty(true);
  };

  const handleDelete = (id: string) => {
    setNodes(prev => deleteNode(prev, id));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(strategy.id, nodes);
    setSaving(false);
    setDirty(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a]/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] bg-[#111111]">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-violet-400" />
          <div>
            <h2 className="text-sm font-semibold text-gray-200">{strategy.client.name}</h2>
            <p className="text-xs text-gray-500">{formatMonth(strategy.month)} — Mapa Mental Estratégico</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-gray-600 mr-2">Duplo clique no nó para editar · Hover para adicionar filhos</p>
          {dirty && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs px-4 py-2 rounded-xl font-medium transition-colors"
            >
              {saving ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              Salvar
            </button>
          )}
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors ml-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto p-10">
        <div className="inline-flex">
          <MindMapNode
            node={nodes}
            level={0}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onAdd={handleAdd}
          />
        </div>
      </div>
    </div>
  );
}

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
    if (activeStrategy?.id === id) setActiveStrategy(prev => prev ? { ...prev, nodes } : prev);
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
          strategy={activeStrategy}
          onSave={saveStrategy}
          onClose={() => setActiveStrategy(null)}
        />
      )}
    </div>
  );
}
