"use client";

import { useState, useTransition } from "react";
import { createMeetingAction, updateMeetingAction } from "./actions";

type Meeting = {
  id: string;
  type: string;
  status: string;
  scheduledAt: Date | null;
  participants: string[];
  meetingLink: string | null;
  responsible: string | null;
  summary: string | null;
  nextSteps: string | null;
  createdAt: Date;
};

const MEETING_TYPES: Record<string, { label: string; color: string; icon: string; description: string }> = {
  daily:        { label: "Daily",           color: "blue",    icon: "☀️", description: "Reunião diária de alinhamento da equipe" },
  weekly:       { label: "Semanal",         color: "violet",  icon: "📅", description: "Revisão semanal de resultados e prioridades" },
  monthly:      { label: "Mensal",          color: "amber",   icon: "📊", description: "Análise mensal completa e planejamento" },
  client:       { label: "Cliente",         color: "emerald", icon: "🤝", description: "Reunião de resultados com cliente" },
  onboarding:   { label: "Onboarding",      color: "pink",    icon: "🚀", description: "Onboarding de novo cliente" },
  retrospective:{ label: "Retrospectiva",   color: "orange",  icon: "🔁", description: "Retrospectiva de processos e melhorias" },
  other:        { label: "Outro",           color: "gray",    icon: "📋", description: "Outro tipo de reunião" },
};

const COLOR_MAP: Record<string, { bg: string; border: string; text: string }> = {
  blue:    { bg: "bg-blue-500/10",    border: "border-blue-500/20",    text: "text-blue-400" },
  violet:  { bg: "bg-violet-500/10",  border: "border-violet-500/20",  text: "text-violet-400" },
  amber:   { bg: "bg-amber-500/10",   border: "border-amber-500/20",   text: "text-amber-400" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
  pink:    { bg: "bg-pink-500/10",    border: "border-pink-500/20",    text: "text-pink-400" },
  orange:  { bg: "bg-orange-500/10",  border: "border-orange-500/20",  text: "text-orange-400" },
  gray:    { bg: "bg-gray-500/10",    border: "border-gray-500/20",    text: "text-gray-400" },
};

const STATUS_STYLE: Record<string, string> = {
  scheduled: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  done:      "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  cancelled: "text-red-400 bg-red-500/10 border-red-500/20",
};
const STATUS_LABEL: Record<string, string> = {
  scheduled: "Agendada",
  done: "Realizada",
  cancelled: "Cancelada",
};

const RECURRENT_MEETINGS = [
  { type: "daily",        day: "Segunda a Sexta", time: "09:00", participants: ["Toda equipe"] },
  { type: "weekly",       day: "Segunda-feira",   time: "14:00", participants: ["Gestão + CS"] },
  { type: "monthly",      day: "Última semana",   time: "A definir", participants: ["Toda equipe"] },
  { type: "retrospective",day: "Mensal",          time: "A definir", participants: ["Toda equipe"] },
];

function MeetingCard({ m, onUpdate }: { m: Meeting; onUpdate: (id: string, data: Record<string, string>) => void }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = MEETING_TYPES[m.type] ?? MEETING_TYPES.other;
  const colors = COLOR_MAP[cfg.color];

  return (
    <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl overflow-hidden">
      <div className="p-4 flex items-start gap-3">
        <span className="text-xl mt-0.5">{cfg.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-white font-semibold text-sm">{cfg.label}</p>
              {m.responsible && <p className="text-xs text-gray-500">Responsável: {m.responsible}</p>}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${STATUS_STYLE[m.status]}`}>
                {STATUS_LABEL[m.status]}
              </span>
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-[10px] px-2 py-0.5 rounded border border-[#333] text-gray-500 hover:text-gray-300 transition-colors"
              >
                {expanded ? "Fechar" : "Detalhes"}
              </button>
            </div>
          </div>
          <div className="flex gap-4 mt-2 text-xs text-gray-500">
            {m.scheduledAt && (
              <span>📅 {new Date(m.scheduledAt).toLocaleDateString("pt-BR")} às {new Date(m.scheduledAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
            )}
            {m.participants.length > 0 && (
              <span>👥 {m.participants.join(", ")}</span>
            )}
            {m.meetingLink && (
              <a href={m.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">🔗 Link</a>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-[#222] pt-4 space-y-3">
          {m.status === "scheduled" && (
            <div className="flex gap-2">
              <button
                onClick={() => onUpdate(m.id, { status: "done" })}
                className="text-xs px-3 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors"
              >
                ✓ Marcar como Realizada
              </button>
              <button
                onClick={() => onUpdate(m.id, { status: "cancelled" })}
                className="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
              >
                ✗ Cancelar
              </button>
            </div>
          )}
          <AteForm meetingId={m.id} summary={m.summary} nextSteps={m.nextSteps} onUpdate={onUpdate} />
        </div>
      )}
    </div>
  );
}

function AteForm({ meetingId, summary, nextSteps, onUpdate }: {
  meetingId: string;
  summary: string | null;
  nextSteps: string | null;
  onUpdate: (id: string, data: Record<string, string>) => void;
}) {
  const [sumText, setSumText] = useState(summary ?? "");
  const [nsText, setNsText] = useState(nextSteps ?? "");
  const [saved, setSaved] = useState(false);

  function save() {
    onUpdate(meetingId, { summary: sumText, nextSteps: nsText });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1">Resumo da reunião (ata)</label>
        <textarea
          value={sumText}
          onChange={e => setSumText(e.target.value)}
          rows={3}
          placeholder="O que foi discutido, decisões tomadas..."
          className="w-full bg-[#111] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white text-xs placeholder-gray-600 resize-none focus:outline-none focus:border-violet-500"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1">Próximos passos</label>
        <textarea
          value={nsText}
          onChange={e => setNsText(e.target.value)}
          rows={2}
          placeholder="Ações definidas, responsáveis, prazo..."
          className="w-full bg-[#111] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white text-xs placeholder-gray-600 resize-none focus:outline-none focus:border-violet-500"
        />
      </div>
      <button
        onClick={save}
        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${saved ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" : "border-violet-500/30 text-violet-400 hover:bg-violet-500/10"}`}
      >
        {saved ? "✓ Salvo!" : "Salvar ata"}
      </button>
    </div>
  );
}

function NewMeetingModal({ onClose }: { onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [participants, setParticipants] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("participants", participants);
    startTransition(async () => {
      await createMeetingAction(fd);
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-white font-bold text-lg mb-4">Registrar Reunião</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-400 block mb-1">Tipo de reunião *</label>
            <select name="type" required className="w-full bg-[#111] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500">
              {Object.entries(MEETING_TYPES).map(([k, v]) => (
                <option key={k} value={k}>{v.icon} {v.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-400 block mb-1">Data e hora</label>
            <input name="scheduledAt" type="datetime-local" className="w-full bg-[#111] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-400 block mb-1">Participantes (separados por vírgula)</label>
            <input
              value={participants}
              onChange={e => setParticipants(e.target.value)}
              placeholder="Ana, Carlos, Toda equipe..."
              className="w-full bg-[#111] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-400 block mb-1">Responsável</label>
            <input name="responsible" placeholder="Quem conduz a reunião" className="w-full bg-[#111] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-400 block mb-1">Link da reunião</label>
            <input name="meetingLink" type="url" placeholder="https://meet.google.com/..." className="w-full bg-[#111] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#2e2e2e] text-gray-400 text-sm hover:border-[#3e3e3e] transition-colors">Cancelar</button>
            <button type="submit" disabled={isPending} className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors disabled:opacity-50">
              {isPending ? "Registrando..." : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function RotinasClient({ meetings }: { meetings: Meeting[] }) {
  const [showNew, setShowNew] = useState(false);
  const [list, setList] = useState(meetings);
  const [, startTransition] = useTransition();

  function handleUpdate(id: string, data: Record<string, string>) {
    startTransition(async () => {
      await updateMeetingAction(id, data);
      setList(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
    });
  }

  const scheduled = list.filter(m => m.status === "scheduled");
  const done = list.filter(m => m.status === "done");

  return (
    <div>
      {showNew && <NewMeetingModal onClose={() => setShowNew(false)} />}

      {/* Recurrent schedule */}
      <div className="mb-6">
        <h2 className="text-white font-bold text-base mb-3">Calendário de Rotinas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {RECURRENT_MEETINGS.map(r => {
            const cfg = MEETING_TYPES[r.type];
            const colors = COLOR_MAP[cfg.color];
            return (
              <div key={r.type} className={`${colors.bg} border ${colors.border} rounded-2xl p-4`}>
                <div className="text-2xl mb-2">{cfg.icon}</div>
                <p className={`font-bold text-sm ${colors.text}`}>{cfg.label}</p>
                <p className="text-xs text-gray-500 mt-1">{r.day}</p>
                <p className="text-xs text-gray-500">{r.time}</p>
                <p className="text-xs text-gray-600 mt-2">{r.participants.join(", ")}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-base">Registro de Reuniões</h2>
        <button
          onClick={() => setShowNew(true)}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-xl text-white text-sm font-medium transition-colors"
        >
          + Registrar Reunião
        </button>
      </div>

      {/* Scheduled */}
      {scheduled.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Agendadas ({scheduled.length})</p>
          <div className="space-y-3">
            {scheduled.map(m => <MeetingCard key={m.id} m={m} onUpdate={handleUpdate} />)}
          </div>
        </div>
      )}

      {/* Done */}
      {done.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Realizadas ({done.length})</p>
          <div className="space-y-3">
            {done.map(m => <MeetingCard key={m.id} m={m} onUpdate={handleUpdate} />)}
          </div>
        </div>
      )}

      {list.length === 0 && (
        <div className="text-center py-16 text-gray-600 text-sm">
          Nenhuma reunião registrada ainda.<br />
          <span className="text-gray-700">Clique em "+ Registrar Reunião" para começar.</span>
        </div>
      )}
    </div>
  );
}
