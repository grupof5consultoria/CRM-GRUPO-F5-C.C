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

// ─── Field label map ──────────────────────────────────────────────────────────

const FIELD_LABELS: Record<string, string> = {
  // Etapa 1
  cnpj:             "CNPJ da Empresa",
  endereco_empresa: "Endereço da Empresa",
  socio_nome:       "Nome Completo do Sócio ADM",
  socio_endereco:   "Endereço do Sócio ADM (com CEP)",
  socio_cpf:        "CPF do Sócio ADM",
  socio_email:      "Email do Sócio ADM",
  resp_nome:        "Nome Completo — Resp. Financeiro",
  resp_telefone:    "Telefone WhatsApp (DDD) — Resp. Financeiro",
  resp_email:       "Email — Resp. Financeiro",
  // Etapa 2
  linkContrato:     "Link do Contrato",
  dataEnvio:        "Data de Envio",
  observacoes:      "Observações",
  // Etapas 6 e 13
  dataReuniao:      "Data da Reunião",
  linkReuniao:      "Link da Reunião (Meet/Zoom)",
  // Etapa 8
  linkDrive:        "Link da Pasta no Google Drive",
  // Etapa 9
  loginGoogle:      "Login Google",
  senhaGoogle:      "Senha Google",
  loginFacebook:    "Login Facebook",
  senhaFacebook:    "Senha Facebook",
  loginInstagram:   "Login Instagram",
  senhaInstagram:   "Senha Instagram",
  // Etapa 16
  linkFormulario:   "Link do Formulário",
};

// Campos que são senhas (mostrar input type=password)
const PASSWORD_FIELDS = new Set(["senhaGoogle", "senhaFacebook", "senhaInstagram"]);
// Campos de data
const DATE_FIELDS = new Set(["dataEnvio", "dataReuniao"]);

// Status config
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

// ─── Component ────────────────────────────────────────────────────────────────

export function OnboardingPanel({ clientId, clientName: _clientName, clientNiche }: Props) {
  const [tasks, setTasks]               = useState<OnboardingTask[]>([]);
  const [progress, setProgress]         = useState(0);
  const [done, setDone]                 = useState(0);
  const [total, setTotal]               = useState(0);
  const [loading, setLoading]           = useState(true);
  const [expanded, setExpanded]         = useState<Set<string>>(new Set());
  const [saving, setSaving]             = useState<Set<string>>(new Set());
  const [aiLoading, setAiLoading]       = useState(false);
  const [aiError, setAiError]           = useState("");
  const [nicheInput, setNicheInput]     = useState(clientNiche ?? "");
  const [initializing, setInitializing] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Set<string>>(new Set());

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

  const initOnboarding = async (force = false) => {
    setInitializing(true);
    try {
      await fetch("/api/onboarding/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, force }),
      });
      await load();
    } finally {
      setInitializing(false);
    }
  };

  const toggleExpand = (id: string) =>
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const togglePassword = (key: string) =>
    setShowPasswords(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });

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
      setTasks(prev => {
        const next = prev.map(t => t.id === task.id ? { ...t, ...updated } : t);
        const d = next.filter(t => t.status === "done").length;
        setDone(d);
        setProgress(Math.round((d / next.length) * 100));
        return next;
      });
    } finally {
      setSaving(prev => { const n = new Set(prev); n.delete(task.id); return n; });
    }
  };

  const toggleChecklist = (task: OnboardingTask, itemId: string) => {
    const items = task.data?.checklistItems ?? [];
    patchTask(task, { data: { ...task.data, checklistItems: items.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i) } });
  };

  const updateField = (task: OnboardingTask, key: string, value: string) =>
    patchTask(task, { data: { ...task.data, fields: { ...task.data?.fields, [key]: value } } });

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
      const pretty = json.budget_split
        ? `Divisão de verba: ${json.budget_split}\n\nCampanhas: ${(json.campaigns as string[]).join(", ")}\n\nPúblicos: ${(json.audiences as string[]).join(", ")}\n\nCriativos: ${(json.creatives as string[]).join(", ")}\n\nConcorrentes: ${(json.competitors as string[]).join(", ")}`
        : json.raw ?? JSON.stringify(json, null, 2);
      patchTask(task, { data: { ...task.data, estrategiaIA: pretty } });
    } catch {
      setAiError("Erro ao gerar estratégia");
    } finally {
      setAiLoading(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────────────────
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 flex flex-col items-center gap-4">
        <svg className="w-10 h-10 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <div>
          <p className="text-sm text-gray-400 font-medium">Onboarding não iniciado</p>
          <p className="text-xs text-gray-600 mt-1">Clique abaixo para criar as 16 etapas</p>
        </div>
        <button
          onClick={initOnboarding}
          disabled={initializing}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm px-5 py-2.5 rounded-xl font-medium transition-colors"
        >
          {initializing
            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          }
          Iniciar Onboarding
        </button>
      </div>
    );
  }

  // ── Tasks ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Barra de progresso */}
      <div className="bg-[#111111] border border-[#262626] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-gray-200">Progresso do Onboarding</p>
            <p className="text-xs text-gray-500 mt-0.5">{done} de {total} etapas concluídas</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (confirm("Isso vai apagar as etapas atuais e recriar com o template atualizado. Continuar?")) {
                  initOnboarding(true);
                }
              }}
              disabled={initializing}
              title="Recriar etapas com template atualizado"
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Recriar
            </button>
            <span className="text-2xl font-bold text-violet-400">{progress}%</span>
          </div>
        </div>
        <div className="w-full bg-[#262626] rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Etapas */}
      <div className="space-y-2">
        {tasks.map((task) => {
          const isExpanded  = expanded.has(task.id);
          const isSaving    = saving.has(task.id);
          const checklist   = task.data?.checklistItems ?? [];
          const fields      = task.data?.fields ?? {};
          const checkedCount = checklist.filter(i => i.checked).length;

          return (
            <div
              key={task.id}
              className={`border rounded-xl overflow-hidden transition-all ${
                task.status === "done"        ? "border-emerald-800/40 bg-emerald-950/10" :
                task.status === "in_progress" ? "border-blue-800/40 bg-blue-950/10" :
                                               "border-[#262626] bg-[#1a1a1a]"
              }`}
            >
              {/* Cabeçalho da etapa */}
              <button
                onClick={() => toggleExpand(task.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/[0.02] transition-colors"
              >
                <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  task.status === "done"        ? "bg-emerald-500 text-white" :
                  task.status === "in_progress" ? "bg-blue-500 text-white" :
                                                 "bg-[#2a2a2a] text-gray-500"
                }`}>
                  {task.status === "done"
                    ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                    : task.stepNumber
                  }
                </span>

                <span className={`flex-1 text-sm font-medium ${task.status === "done" ? "text-gray-400 line-through" : "text-gray-200"}`}>
                  {task.title}
                </span>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {checklist.length > 0 && (
                    <span className="text-xs text-gray-600">{checkedCount}/{checklist.length}</span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[task.status]}`}>
                    {STATUS_LABELS[task.status]}
                  </span>
                  <svg className={`w-4 h-4 text-gray-600 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Corpo expandido */}
              {isExpanded && (
                <div className="px-4 pb-5 space-y-5 border-t border-[#262626]">
                  {/* Status + Responsável */}
                  <div className="flex flex-wrap gap-2 pt-4">
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
                    {isSaving && <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin self-center" />}
                  </div>

                  {/* ── Campos de texto (todos os steps com fields, exceto step 13 que tem IA) ── */}
                  {Object.keys(fields).length > 0 && task.stepNumber !== 13 && (
                    <div className="space-y-3">
                      {/* Etapa 9: separar em grupos Google / Facebook / Instagram */}
                      {task.stepNumber === 9 ? (
                        <div className="space-y-4">
                          {[
                            { label: "Google",    login: "loginGoogle",    senha: "senhaGoogle" },
                            { label: "Facebook",  login: "loginFacebook",  senha: "senhaFacebook" },
                            { label: "Instagram", login: "loginInstagram", senha: "senhaInstagram" },
                          ].map(platform => (
                            <div key={platform.label} className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4 space-y-3">
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{platform.label}</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="text-xs text-gray-500 mb-1 block">Login / Email</label>
                                  <input
                                    type="text"
                                    defaultValue={fields[platform.login] ?? ""}
                                    onBlur={e => { if (e.target.value !== (fields[platform.login] ?? "")) updateField(task, platform.login, e.target.value); }}
                                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-violet-500"
                                    placeholder="email@exemplo.com"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500 mb-1 block">Senha</label>
                                  <div className="relative">
                                    <input
                                      type={showPasswords.has(platform.senha) ? "text" : "password"}
                                      defaultValue={fields[platform.senha] ?? ""}
                                      onBlur={e => { if (e.target.value !== (fields[platform.senha] ?? "")) updateField(task, platform.senha, e.target.value); }}
                                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 pr-10 text-sm text-gray-300 focus:outline-none focus:border-violet-500"
                                      placeholder="••••••••"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => togglePassword(platform.senha)}
                                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
                                    >
                                      {showPasswords.has(platform.senha)
                                        ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                                        : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                      }
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        /* Campos genéricos para outras etapas */
                        Object.entries(fields).filter(([k]) => k !== "estrategiaIA").map(([key, val]) => (
                          <div key={key}>
                            <label className="text-xs text-gray-500 mb-1 block">{FIELD_LABELS[key] ?? key}</label>
                            {key === "observacoes" ? (
                              <textarea
                                defaultValue={val}
                                rows={3}
                                onBlur={e => { if (e.target.value !== val) updateField(task, key, e.target.value); }}
                                className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-violet-500 resize-none"
                              />
                            ) : PASSWORD_FIELDS.has(key) ? (
                              <div className="relative">
                                <input
                                  type={showPasswords.has(key) ? "text" : "password"}
                                  defaultValue={val}
                                  onBlur={e => { if (e.target.value !== val) updateField(task, key, e.target.value); }}
                                  className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 pr-10 text-sm text-gray-300 focus:outline-none focus:border-violet-500"
                                />
                                <button type="button" onClick={() => togglePassword(key)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                </button>
                              </div>
                            ) : (
                              <input
                                type={DATE_FIELDS.has(key) ? "date" : "text"}
                                defaultValue={val}
                                onBlur={e => { if (e.target.value !== val) updateField(task, key, e.target.value); }}
                                className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-violet-500 [color-scheme:dark]"
                              />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* ── Checklist ─────────────────────────────────────────────── */}
                  {checklist.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Checklist</p>
                      {checklist.map(item => (
                        <label key={item.id} className="flex items-start gap-2.5 cursor-pointer">
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

                  {/* ── Etapa 13: Elaborador de estratégia com IA ─────────────── */}
                  {task.stepNumber === 13 && (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-violet-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                        Elaborador de Estratégia com IA
                      </p>

                      {/* Campos de data/link da reunião */}
                      {["dataReuniao", "linkReuniao"].map(key => (
                        <div key={key}>
                          <label className="text-xs text-gray-500 mb-1 block">{FIELD_LABELS[key]}</label>
                          <input
                            type={key === "dataReuniao" ? "date" : "text"}
                            defaultValue={fields[key] ?? ""}
                            onBlur={e => { if (e.target.value !== (fields[key] ?? "")) updateField(task, key, e.target.value); }}
                            className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-violet-500 [color-scheme:dark]"
                          />
                        </div>
                      ))}

                      {/* Nicho + botão IA */}
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
                            {aiLoading
                              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            }
                            Gerar Estratégia
                          </button>
                        </div>
                        {aiError && <p className="text-xs text-red-400 mt-1">{aiError}</p>}
                      </div>

                      {/* Resultado da IA */}
                      {task.data?.estrategiaIA && (
                        <div className="bg-violet-950/30 border border-violet-800/40 rounded-xl p-4">
                          <p className="text-xs font-semibold text-violet-300 mb-2 flex items-center gap-1.5">
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
