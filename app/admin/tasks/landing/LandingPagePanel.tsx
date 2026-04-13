"use client";

import { useState, useActionState, useTransition } from "react";
import { saveBriefingAction, savePhaseAction } from "./actions";

const PHASE_STATUS_LABELS: Record<string, string> = {
  not_started:    "Não iniciado",
  in_progress:    "Em andamento",
  done:           "Concluído",
  waiting_client: "Aguardando cliente",
};

const PHASE_STATUS_COLORS: Record<string, string> = {
  not_started:    "text-gray-500 bg-[#222] border-[#333]",
  in_progress:    "text-amber-400 bg-amber-500/10 border-amber-500/30",
  done:           "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  waiting_client: "text-blue-400 bg-blue-500/10 border-blue-500/30",
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface Phase {
  id: string;
  phaseNumber: number;
  title: string;
  status: string;
  assignedTo?: string | null;
  startedAt?: Date | string | null;
  completedAt?: Date | string | null;
  comment?: string | null;
}

interface Project {
  id: string;
  clientId: string;
  companyName: string;
  services?: string | null;
  colorPrimary?: string | null;
  colorSecondary?: string | null;
  references?: string | null;
  domain?: string | null;
  hasDomain: boolean;
  businessHours?: string | null;
  businessDays: string[];
  wantsBlog: boolean;
  purpose?: string | null;
  progress: number;
  phases: Phase[];
}

const DAYS = [
  { value: "seg", label: "Seg" },
  { value: "ter", label: "Ter" },
  { value: "qua", label: "Qua" },
  { value: "qui", label: "Qui" },
  { value: "sex", label: "Sex" },
  { value: "sab", label: "Sáb" },
  { value: "dom", label: "Dom" },
];

const PURPOSE_OPTIONS = [
  { value: "ads",     label: "Anúncios pagos (Meta/Google)" },
  { value: "organic", label: "Tráfego orgânico" },
  { value: "both",    label: "Ambos" },
];

// ─── Main Panel ───────────────────────────────────────────────────────────────

export function LandingPagePanel({ project }: { project: Project }) {
  const done     = project.phases.filter(p => p.status === "done").length;
  const total    = project.phases.length;
  const pct      = project.progress;
  const allDone  = pct === 100;

  return (
    <div className="space-y-4">
      {/* Global progress */}
      <div className="bg-[#111] border border-[#262626] rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Progresso Geral</p>
          <span className={`text-sm font-bold ${allDone ? "text-emerald-400" : "text-violet-400"}`}>{pct}%</span>
        </div>
        <div className="h-2 bg-[#262626] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${allDone ? "bg-emerald-500" : "bg-violet-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-1.5">{done} de {total} fases concluídas</p>
      </div>

      {/* Phases */}
      {project.phases.map(phase => (
        phase.phaseNumber === 1
          ? <Phase1Card key={phase.id} phase={phase} project={project} />
          : <PhaseCard  key={phase.id} phase={phase} clientId={project.clientId} />
      ))}
    </div>
  );
}

// ─── Phase 1 — Briefing ───────────────────────────────────────────────────────

function Phase1Card({ phase, project }: { phase: Phase; project: Project }) {
  const [expanded, setExpanded] = useState(false);
  const [state, action, isPending] = useActionState(saveBriefingAction, {});
  const [hasDomain, setHasDomain] = useState(project.hasDomain);
  const [wantsBlog, setWantsBlog] = useState(project.wantsBlog);
  const [days, setDays] = useState<string[]>(project.businessDays);

  function toggleDay(d: string) {
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  }

  const cfg = PHASE_STATUS_COLORS[phase.status] ?? PHASE_STATUS_COLORS.not_started;

  return (
    <div className={`bg-[#1a1a1a] border rounded-2xl overflow-hidden ${phase.status === "done" ? "border-emerald-500/20" : "border-[#262626]"}`}>
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[#1f1f1f] transition-colors"
      >
        <PhaseNumber n={1} status={phase.status} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-200">Briefing</p>
          {phase.assignedTo && <p className="text-xs text-gray-600 mt-0.5">{phase.assignedTo}</p>}
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-lg border flex-shrink-0 ${cfg}`}>
          {PHASE_STATUS_LABELS[phase.status]}
        </span>
        <svg className={`w-4 h-4 text-gray-600 flex-shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <form action={action} className="border-t border-[#262626] p-5 space-y-4">
          <input type="hidden" name="projectId" value={project.id} />
          <input type="hidden" name="clientId" value={project.clientId} />
          <input type="hidden" name="hasDomain" value={String(hasDomain)} />
          <input type="hidden" name="wantsBlog" value={String(wantsBlog)} />
          {days.map(d => <input key={d} type="hidden" name="businessDays" value={d} />)}

          {state.error && <p className="text-red-400 text-xs">{state.error}</p>}
          {state.success && <p className="text-emerald-400 text-xs">Salvo!</p>}

          {/* Phase header fields */}
          <div className="grid grid-cols-2 gap-3">
            <FieldInput label="Responsável" name="assignedTo" defaultValue={phase.assignedTo ?? ""} placeholder="Nome" />
            <div>
              <label className="text-xs text-gray-500 block mb-1">Status</label>
              <select name="status" defaultValue={phase.status} className={INPUT_CLASS}>
                {Object.entries(PHASE_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Data de início</label>
              <input name="startedAt" type="date" defaultValue={phase.startedAt ? new Date(phase.startedAt).toISOString().split("T")[0] : ""} className={INPUT_CLASS} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Data de conclusão</label>
              <input name="completedAt" type="date" defaultValue={phase.completedAt ? new Date(phase.completedAt).toISOString().split("T")[0] : ""} className={INPUT_CLASS} />
            </div>
          </div>

          <hr className="border-[#262626]" />
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Campos do Briefing</p>

          {/* Briefing fields */}
          <FieldInput label="Nome da empresa" name="companyName" defaultValue={project.companyName} />

          <div>
            <label className="text-xs text-gray-500 block mb-1">Serviços oferecidos</label>
            <textarea name="services" rows={2} defaultValue={project.services ?? ""} placeholder="Ex: Implante, Clareamento, Ortodontia..." className={`${INPUT_CLASS} resize-none`} />
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Cor primária</label>
              <div className="flex items-center gap-2">
                <input name="colorPrimary" type="color" defaultValue={project.colorPrimary ?? "#6d28d9"} className="w-10 h-9 rounded-lg border border-[#333] bg-[#1a1a1a] cursor-pointer p-0.5" />
                <span className="text-xs text-gray-500">{project.colorPrimary ?? "—"}</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Cor secundária</label>
              <div className="flex items-center gap-2">
                <input name="colorSecondary" type="color" defaultValue={project.colorSecondary ?? "#7c3aed"} className="w-10 h-9 rounded-lg border border-[#333] bg-[#1a1a1a] cursor-pointer p-0.5" />
                <span className="text-xs text-gray-500">{project.colorSecondary ?? "—"}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Referências de sites</label>
            <textarea name="references" rows={2} defaultValue={project.references ?? ""} placeholder="Links de sites que o cliente gosta..." className={`${INPUT_CLASS} resize-none`} />
          </div>

          {/* Domain */}
          <div className="grid grid-cols-2 gap-3">
            <FieldInput label="Domínio" name="domain" defaultValue={project.domain ?? ""} placeholder="Ex: clinicaexemplo.com.br" />
            <div>
              <label className="text-xs text-gray-500 block mb-1">Já possui domínio?</label>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setHasDomain(true)} className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${hasDomain ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-[#111] border-[#333] text-gray-500"}`}>Sim</button>
                <button type="button" onClick={() => setHasDomain(false)} className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${!hasDomain ? "bg-red-500/10 border-red-500 text-red-400" : "bg-[#111] border-[#333] text-gray-500"}`}>Não</button>
              </div>
            </div>
          </div>

          <FieldInput label="Horário de funcionamento" name="businessHours" defaultValue={project.businessHours ?? ""} placeholder="Ex: Seg a Sex: 08h-18h / Sáb: 08h-12h" />

          {/* Business days */}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Dias de funcionamento</label>
            <div className="flex gap-1.5 flex-wrap">
              {DAYS.map(d => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => toggleDay(d.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${days.includes(d.value) ? "bg-violet-500/10 border-violet-500 text-violet-300" : "bg-[#111] border-[#333] text-gray-500"}`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Quer blog?</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setWantsBlog(true)} className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${wantsBlog ? "bg-violet-500/10 border-violet-500 text-violet-300" : "bg-[#111] border-[#333] text-gray-500"}`}>Sim</button>
                <button type="button" onClick={() => setWantsBlog(false)} className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${!wantsBlog ? "bg-red-500/10 border-red-500 text-red-400" : "bg-[#111] border-[#333] text-gray-500"}`}>Não</button>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Finalidade</label>
              <select name="purpose" defaultValue={project.purpose ?? ""} className={INPUT_CLASS}>
                <option value="">Selecione...</option>
                {PURPOSE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Comentários</label>
            <textarea name="comment" rows={2} defaultValue={phase.comment ?? ""} placeholder="Observações da fase..." className={`${INPUT_CLASS} resize-none`} />
          </div>

          <button type="submit" disabled={isPending} className="px-5 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-xl text-sm font-medium text-white transition-colors">
            {isPending ? "Salvando..." : "Salvar Briefing"}
          </button>
        </form>
      )}
    </div>
  );
}

// ─── Phases 2–7 ───────────────────────────────────────────────────────────────

function PhaseCard({ phase, clientId }: { phase: Phase; clientId: string }) {
  const [expanded, setExpanded] = useState(false);
  const [state, action, isPending] = useActionState(savePhaseAction, {});
  const cfg = PHASE_STATUS_COLORS[phase.status] ?? PHASE_STATUS_COLORS.not_started;

  return (
    <div className={`bg-[#1a1a1a] border rounded-2xl overflow-hidden ${phase.status === "done" ? "border-emerald-500/20" : "border-[#262626]"}`}>
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[#1f1f1f] transition-colors"
      >
        <PhaseNumber n={phase.phaseNumber} status={phase.status} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-200">{phase.title}</p>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-600">
            {phase.assignedTo && <span>{phase.assignedTo}</span>}
            {phase.completedAt && <span>Concluído {new Date(phase.completedAt).toLocaleDateString("pt-BR")}</span>}
          </div>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-lg border flex-shrink-0 ${cfg}`}>
          {PHASE_STATUS_LABELS[phase.status]}
        </span>
        <svg className={`w-4 h-4 text-gray-600 flex-shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <form action={action} className="border-t border-[#262626] p-5 space-y-3">
          <input type="hidden" name="phaseId"  value={phase.id} />
          <input type="hidden" name="clientId" value={clientId} />
          {state.error && <p className="text-red-400 text-xs">{state.error}</p>}
          {state.success && <p className="text-emerald-400 text-xs">Salvo!</p>}

          <div className="grid grid-cols-2 gap-3">
            <FieldInput label="Responsável" name="assignedTo" defaultValue={phase.assignedTo ?? ""} placeholder="Nome" />
            <div>
              <label className="text-xs text-gray-500 block mb-1">Status</label>
              <select name="status" defaultValue={phase.status} className={INPUT_CLASS}>
                {Object.entries(PHASE_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Data de início</label>
              <input name="startedAt" type="date" defaultValue={phase.startedAt ? new Date(phase.startedAt).toISOString().split("T")[0] : ""} className={INPUT_CLASS} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Data de conclusão</label>
              <input name="completedAt" type="date" defaultValue={phase.completedAt ? new Date(phase.completedAt).toISOString().split("T")[0] : ""} className={INPUT_CLASS} />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Comentários</label>
            <textarea name="comment" rows={2} defaultValue={phase.comment ?? ""} placeholder="Observações..." className={`${INPUT_CLASS} resize-none`} />
          </div>

          <button type="submit" disabled={isPending} className="px-5 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-xl text-sm font-medium text-white transition-colors">
            {isPending ? "Salvando..." : "Salvar"}
          </button>
        </form>
      )}
    </div>
  );
}

// ─── Shared ───────────────────────────────────────────────────────────────────

const INPUT_CLASS = "w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-500";

function FieldInput({ label, name, defaultValue, placeholder, type = "text" }: {
  label: string; name: string; defaultValue?: string; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="text-xs text-gray-500 block mb-1">{label}</label>
      <input name={name} type={type} defaultValue={defaultValue} placeholder={placeholder} className={INPUT_CLASS} />
    </div>
  );
}

function PhaseNumber({ n, status }: { n: number; status: string }) {
  return (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
      status === "done"           ? "bg-emerald-500 text-white" :
      status === "in_progress"    ? "bg-violet-600 text-white" :
      status === "waiting_client" ? "bg-blue-600 text-white" :
      "bg-[#262626] text-gray-500"
    }`}>
      {status === "done" ? (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      ) : n}
    </div>
  );
}
