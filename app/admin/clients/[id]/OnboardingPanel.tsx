"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChecklistItem { id: string; label: string; checked: boolean }
interface TaskData {
  checklistItems?: ChecklistItem[];
  fields?: Record<string, string>;
  estrategiaIA?: string;
}

interface OnboardingTask {
  id: string;
  stepNumber: number;
  title: string;
  status: string;
  assignedTo: string | null;
  createdAt: string;
  completedAt: string | null;
  data: TaskData | null;
}

interface Props {
  clientId: string;
  clientName: string;
  clientNiche?: string;
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  pending:     "Pendente",
  in_progress: "Em andamento",
  done:        "Concluído",
};

const STATUS_COLORS: Record<string, string> = {
  pending:     "bg-gray-700 text-gray-300",
  in_progress: "bg-blue-900/60 text-blue-300",
  done:        "bg-emerald-900/60 text-emerald-300",
};

const STATUS_DOT: Record<string, string> = {
  pending:     "bg-gray-500",
  in_progress: "bg-blue-400",
  done:        "bg-emerald-400",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function OnboardingPanel({ clientId, clientName, clientNiche }: Props) {
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [nicheInput, setNicheInput] = useState(clientNiche ?? "");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/onboarding/${clientId}`);
      const json = await res.json();
      setTasks(json.tasks ?? []);
      setProgress(json.progress ?? 0);
      setDone(json.done ?? 0);
      setTotal(json.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => { load(); }, [load]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const patchTask = async (
    task: OnboardingTask,
    updates: Partial<Pick<OnboardingTask, "status" | "assignedTo"> & { data: TaskData }>
  ) => {
    setSaving(prev => new Set(prev).add(task.id));
    try {
      const res = await fetch(`/api/onboarding/task/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const updated = await res.json();
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, ...updated } : t));

      // Recalc progress
      setTasks(prev => {
        const d = prev.filter(t => t.status === "done").length;
        setDone(d);
        setProgress(Math.round((d / prev.length) * 100));
        return prev;
      });
    } finally {
      setSaving(prev => { const next = new Set(prev); next.delete(task.id); return next; });
    }
  };

  const toggleChecklist = (task: OnboardingTask, itemId: string) => {
    const items = task.data?.checklistItems ?? [];
    const updated = items.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i);
    patchTask(task, { data: { ...task.data, checklistItems: updated } });
  };

  const updateField = (task: OnboardingTask, key: string, value: string) => {
    patchTask(task, { data: { ...task.data, fields: { ...task.data?.fields, [key]: value } } });
  };

  const generateStrategy = async (task: OnboardingTask) => {
    if (!nicheInput.trim()) { setAiError("Informe o nicho do cliente"); return; }
    setAiError("");
    setAiLoading(true);
    try {
      const res = await fetch("/api/onboarding/ai-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: nicheInput }),
      });
      const json = await res.json();
      const formatted = json.raw ?? JSON.stringify(json, null, 2);
      const pretty = json.budget_split
        ? `**Divisão de verba:** ${json.budget_split}\n\n**Campanhas:** ${(json.campaigns as string[]).join(", ")}\n\n**Públicos:** ${(json.audiences as string[]).join(", ")}\n\n**Criativos:** ${(json.creatives as string[]).join(", ")}\n\n**Concorrentes:** ${(json.competitors as string[]).join(", ")}`
        : formatted;
      patchTask(task, { data: { ...task.data, estrategiaIA: pretty } });
    } catch {
      setAiError("Erro ao gerar estratégia");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-500">Nenhum onboarding encontrado para este cliente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-gray-200">Progresso do Onboarding</p>
            <p className="text-xs text-gray-500 mt-0.5">{done} de {total} etapas concluídas</p>
          </div>
          <span className="text-2xl font-bold text-violet-400">{progress}%</span>
        </div>
        <div className="w-full bg-[#262626] rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {tasks.map((task) => {
          const isExpanded = expanded.has(task.id);
          const isSaving = saving.has(task.id);
          const checklist = task.data?.checklistItems ?? [];
          const fields = task.data?.fields ?? {};
          const allChecked = checklist.length > 0 && checklist.every(i => i.checked);
          const checkedCount = checklist.filter(i => i.checked).length;

          return (
            <div
              key={task.id}
              className={`border rounded-xl overflow-hidden transition-all ${
                task.status === "done"
                  ? "border-emerald-800/40 bg-emerald-950/10"
                  : task.status === "in_progress"
                  ? "border-blue-800/40 bg-blue-950/10"
                  : "border-[#262626] bg-[#1a1a1a]"
              }`}
            >
              {/* Header */}
              <button
                onClick={() => toggleExpand(task.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/[0.02] transition-colors"
              >
                {/* Step number */}
                <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  task.status === "done" ? "bg-emerald-500 text-white" :
                  task.status === "in_progress" ? "bg-blue-500 text-white" :
                  "bg-[#2a2a2a] text-gray-500"
                }`}>
                  {task.status === "done"
                    ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                    : task.stepNumber
                  }
                </span>

                {/* Title */}
                <span className={`flex-1 text-sm font-medium ${task.status === "done" ? "text-gray-400 line-through" : "text-gray-200"}`}>
                  {task.title}
                </span>

                {/* Badges */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {checklist.length > 0 && (
                    <span className="text-xs text-gray-600">
                      {checkedCount}/{checklist.length}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[task.status]}`}>
                    {STATUS_LABELS[task.status]}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-600 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Body */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-[#262626]">
                  {/* Actions row */}
                  <div className="flex flex-wrap gap-2 pt-3">
                    {/* Status */}
                    <select
                      value={task.status}
                      disabled={isSaving}
                      onChange={e => patchTask(task, { status: e.target.value })}
                      className="bg-[#111] border border-[#333] rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-violet-500"
                    >
                      <option value="pending">Pendente</option>
                      <option value="in_progress">Em andamento</option>
                      <option value="done">Concluído</option>
                    </select>

                    {/* Assigned to */}
                    <input
                      type="text"
                      placeholder="Responsável"
                      defaultValue={task.assignedTo ?? ""}
                      onBlur={e => {
                        const val = e.target.value.trim();
                        if (val !== (task.assignedTo ?? "")) patchTask(task, { assignedTo: val || null });
                      }}
                      className="bg-[#111] border border-[#333] rounded-lg px-3 py-1.5 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-violet-500 min-w-[140px]"
                    />

                    {task.completedAt && (
                      <span className="text-xs text-emerald-500 self-center">
                        Concluído em {new Date(task.completedAt).toLocaleDateString("pt-BR")}
                      </span>
                    )}

                    {isSaving && (
                      <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin self-center" />
                    )}
                  </div>

                  {/* Checklist */}
                  {checklist.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Checklist</p>
                      {checklist.map(item => (
                        <label key={item.id} className="flex items-start gap-2.5 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={() => toggleChecklist(task, item.id)}
                            className="mt-0.5 w-4 h-4 rounded border-[#444] bg-[#111] text-emerald-500 focus:ring-0 flex-shrink-0"
                          />
                          <span className={`text-sm leading-snug ${item.checked ? "line-through text-gray-600" : "text-gray-300"}`}>
                            {item.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Extra fields */}
                  {Object.keys(fields).length > 0 && task.stepNumber !== 14 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Campos</p>
                      {Object.entries(fields).filter(([k]) => k !== "estrategiaIA").map(([key, val]) => (
                        <div key={key}>
                          <label className="text-xs text-gray-500 mb-1 block">
                            {key === "linkContrato" ? "Link do Contrato" :
                             key === "dataEnvio" ? "Data de Envio" :
                             key === "dataReuniao" ? "Data da Reunião" :
                             key === "linkReuniao" ? "Link da Reunião (Meet/Zoom)" :
                             key === "linkFormulario" ? "Link do Formulário" :
                             key}
                          </label>
                          <input
                            type={key.startsWith("data") ? "date" : "text"}
                            defaultValue={val}
                            onBlur={e => {
                              if (e.target.value !== val) updateField(task, key, e.target.value);
                            }}
                            className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-violet-500 [color-scheme:dark]"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Step 14 — AI Strategy feature */}
                  {task.stepNumber === 14 && (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-violet-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                        </svg>
                        Elaborador de Estratégia com IA
                      </p>

                      {/* Meeting fields */}
                      {["dataReuniao", "linkReuniao"].map(key => (
                        <div key={key}>
                          <label className="text-xs text-gray-500 mb-1 block">
                            {key === "dataReuniao" ? "Data da Reunião" : "Link da Reunião (Meet/Zoom)"}
                          </label>
                          <input
                            type={key === "dataReuniao" ? "date" : "text"}
                            defaultValue={fields[key] ?? ""}
                            onBlur={e => { if (e.target.value !== (fields[key] ?? "")) updateField(task, key, e.target.value); }}
                            className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-violet-500 [color-scheme:dark]"
                          />
                        </div>
                      ))}

                      {/* Niche input + generate button */}
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Nicho do cliente</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={nicheInput}
                            onChange={e => setNicheInput(e.target.value)}
                            placeholder="Ex: Clínica Odontológica, E-commerce..."
                            className="flex-1 bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-violet-500"
                          />
                          <button
                            onClick={() => generateStrategy(task)}
                            disabled={aiLoading}
                            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors"
                          >
                            {aiLoading ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            )}
                            Gerar Estratégia
                          </button>
                        </div>
                        {aiError && <p className="text-xs text-red-400 mt-1">{aiError}</p>}
                      </div>

                      {/* AI Result */}
                      {task.data?.estrategiaIA && (
                        <div className="bg-violet-950/30 border border-violet-800/40 rounded-xl p-4 space-y-2">
                          <p className="text-xs font-semibold text-violet-300 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                            Estratégia gerada por IA
                          </p>
                          <div className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">
                            {task.data.estrategiaIA}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
