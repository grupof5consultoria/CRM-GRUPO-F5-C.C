"use client";

import { useState, useActionState, useTransition } from "react";
import { TeamMemberRole, TeamMemberStatus } from "@prisma/client";
import { ROLE_LABELS, STATUS_LABELS } from "@/services/agencia";
import { createTeamMemberAction, updateTeamMemberAction, toggleOffboardingAction } from "./actions";

type OffboardingItem = { id: string; label: string; revoked: boolean; revokedAt: Date | null; responsible: string | null };
type Member = {
  id: string; name: string; role: TeamMemberRole; email: string | null;
  whatsapp: string | null; status: TeamMemberStatus; joinedAt: Date | null;
  notes: string | null; offboarding: OffboardingItem[];
};

const STATUS_DOT: Record<TeamMemberStatus, string> = {
  active: "bg-emerald-400", vacation: "bg-amber-400", dismissed: "bg-red-400"
};
const STATUS_COLOR: Record<TeamMemberStatus, string> = {
  active: "text-emerald-400", vacation: "text-amber-400", dismissed: "text-red-400"
};
const ROLE_COLOR: Record<TeamMemberRole, string> = {
  sdr: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  closer: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  cs: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  traffic_manager: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  designer: "text-pink-400 bg-pink-500/10 border-pink-500/20",
  manager: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  other: "text-gray-400 bg-gray-500/10 border-gray-500/20",
};

function NewMemberForm({ onClose }: { onClose: () => void }) {
  const [state, action, isPending] = useActionState(createTeamMemberAction, {});
  if (state.error === undefined && !isPending) { /* submitted */ }

  return (
    <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm">Novo Membro</h3>
        <button onClick={onClose} className="text-gray-600 hover:text-gray-400 text-lg leading-none">×</button>
      </div>
      <form action={async (fd) => { await action(fd); if (!state.error) onClose(); }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {state.error && <div className="col-span-2 text-red-400 text-sm">{state.error}</div>}
        <input name="name" required placeholder="Nome completo *" className="bg-[#111] border border-[#333] rounded-xl px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500" />
        <select name="role" className="bg-[#111] border border-[#333] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500">
          {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input name="email" type="email" placeholder="Email" className="bg-[#111] border border-[#333] rounded-xl px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500" />
        <input name="whatsapp" placeholder="WhatsApp" className="bg-[#111] border border-[#333] rounded-xl px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500" />
        <input name="joinedAt" type="date" className="bg-[#111] border border-[#333] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500" />
        <input name="notes" placeholder="Observações" className="bg-[#111] border border-[#333] rounded-xl px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500" />
        <div className="col-span-2 flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-[#333] rounded-xl text-gray-400 text-sm">Cancelar</button>
          <button type="submit" disabled={isPending} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-xl text-white text-sm font-medium disabled:opacity-50">
            {isPending ? "Salvando..." : "Adicionar"}
          </button>
        </div>
      </form>
    </div>
  );
}

function MemberCard({ member: m }: { member: Member }) {
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleStatus(status: TeamMemberStatus) {
    startTransition(() => updateTeamMemberAction(m.id, { status }));
  }

  function handleToggle(itemId: string, revoked: boolean) {
    startTransition(() => toggleOffboardingAction(itemId, revoked));
  }

  const offboardingDone = m.offboarding.filter(o => o.revoked).length;

  return (
    <div className={`bg-[#1a1a1a] border rounded-2xl overflow-hidden transition-all ${m.status === "dismissed" ? "border-red-500/20" : "border-[#262626]"}`}>
      <div className="p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${STATUS_DOT[m.status]}`} />
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{m.name}</p>
              <p className="text-gray-500 text-xs">{m.email ?? m.whatsapp ?? "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${ROLE_COLOR[m.role]}`}>{ROLE_LABELS[m.role]}</span>
            <span className={`text-xs font-medium ${STATUS_COLOR[m.status]}`}>{STATUS_LABELS[m.status]}</span>
            <svg className={`w-3.5 h-3.5 text-gray-600 transition-transform ${expanded ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#262626] p-4 space-y-4" onClick={e => e.stopPropagation()}>
          {/* Info */}
          {(m.whatsapp || m.joinedAt || m.notes) && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              {m.whatsapp && <div><span className="text-gray-600">WhatsApp: </span><span className="text-gray-300">{m.whatsapp}</span></div>}
              {m.joinedAt && <div><span className="text-gray-600">Entrada: </span><span className="text-gray-300">{new Date(m.joinedAt).toLocaleDateString("pt-BR")}</span></div>}
              {m.notes && <div className="col-span-2"><span className="text-gray-600">Obs: </span><span className="text-gray-400">{m.notes}</span></div>}
            </div>
          )}

          {/* Status actions */}
          {m.status !== "dismissed" && (
            <div className="flex gap-2 flex-wrap">
              {m.status !== "active" && (
                <button onClick={() => handleStatus("active")} disabled={isPending} className="text-xs px-3 py-1.5 border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-500/10 transition-colors">Ativar</button>
              )}
              {m.status !== "vacation" && (
                <button onClick={() => handleStatus("vacation")} disabled={isPending} className="text-xs px-3 py-1.5 border border-amber-500/30 text-amber-400 rounded-lg hover:bg-amber-500/10 transition-colors">Férias</button>
              )}
              <button onClick={() => handleStatus("dismissed")} disabled={isPending} className="text-xs px-3 py-1.5 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors">Desligar</button>
            </div>
          )}

          {/* Offboarding checklist */}
          {m.status === "dismissed" && m.offboarding.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">Checklist de Offboarding</p>
                <span className="text-[10px] text-gray-500">{offboardingDone}/{m.offboarding.length} concluído</span>
              </div>
              <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-3 space-y-2">
                {m.offboarding.map(o => (
                  <label key={o.id} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={o.revoked}
                      onChange={e => handleToggle(o.id, e.target.checked)}
                      className="w-3.5 h-3.5 rounded accent-red-500"
                    />
                    <span className={`text-xs ${o.revoked ? "line-through text-gray-600" : "text-gray-300"}`}>{o.label}</span>
                    {o.revoked && o.revokedAt && (
                      <span className="text-[10px] text-gray-600 ml-auto">{new Date(o.revokedAt).toLocaleDateString("pt-BR")}</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function PessoasClient({ members }: { members: Member[] }) {
  const [showForm, setShowForm] = useState(false);

  const active = members.filter(m => m.status === "active");
  const vacation = members.filter(m => m.status === "vacation");
  const dismissed = members.filter(m => m.status === "dismissed");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-4 text-sm text-gray-500">
          <span><span className="text-emerald-400 font-bold">{active.length}</span> ativos</span>
          <span><span className="text-amber-400 font-bold">{vacation.length}</span> em férias</span>
          <span><span className="text-red-400 font-bold">{dismissed.length}</span> desligados</span>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-xl text-white text-sm font-medium transition-colors">
            + Novo Membro
          </button>
        )}
      </div>

      {showForm && <NewMemberForm onClose={() => setShowForm(false)} />}

      {members.length === 0 ? (
        <div className="text-center py-12 text-gray-600 text-sm">Nenhum membro cadastrado ainda.</div>
      ) : (
        <div className="space-y-3">
          {[...active, ...vacation, ...dismissed].map(m => (
            <MemberCard key={m.id} member={m} />
          ))}
        </div>
      )}
    </div>
  );
}
