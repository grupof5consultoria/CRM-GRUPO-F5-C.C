"use client";

import { useState, useTransition } from "react";
import { PatientLeadStatus, AttendanceOrigin } from "@prisma/client";
import { updatePatientLeadStatusAction } from "./actions";
import { ChatPanel, type ChatLead } from "./ChatPanel";

// ─── Types ────────────────────────────────────────────────────────────────────

type PatientLead = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  photoUrl: string | null;
  city: string | null;
  state: string | null;
  status: PatientLeadStatus;
  origin: AttendanceOrigin;
  treatmentValue: unknown;
  lostReason: string | null;
  scheduledAt: Date | null;
  notes: string | null;
  source: string | null;
  createdAt: Date;
  client: { id: string; name: string };
  assignee: { name: string } | null;
};

// ─── Columns ──────────────────────────────────────────────────────────────────

type Column = {
  id: PatientLeadStatus;
  label: string;
  accent: string;
  dot: string;
  ring: string;
  emoji: string;
  isFollowup?: boolean;
};

const COLUMNS: Column[] = [
  {
    id: "novo_lead",
    label: "Novo Lead",
    accent: "from-indigo-500 to-indigo-600",
    dot: "bg-indigo-400",
    ring: "ring-indigo-500/30",
    emoji: "✨",
  },
  {
    id: "followup_1",
    label: "1º Follow-up",
    accent: "from-sky-400 to-sky-500",
    dot: "bg-sky-400",
    ring: "ring-sky-500/30",
    emoji: "📲",
    isFollowup: true,
  },
  {
    id: "followup_2",
    label: "2º Follow-up",
    accent: "from-cyan-500 to-cyan-600",
    dot: "bg-cyan-400",
    ring: "ring-cyan-500/30",
    emoji: "📲",
    isFollowup: true,
  },
  {
    id: "followup_3",
    label: "3º Follow-up",
    accent: "from-teal-500 to-teal-600",
    dot: "bg-teal-400",
    ring: "ring-teal-500/30",
    emoji: "📲",
    isFollowup: true,
  },
  {
    id: "agendado",
    label: "Agendado",
    accent: "from-amber-500 to-amber-600",
    dot: "bg-amber-400",
    ring: "ring-amber-500/30",
    emoji: "📅",
  },
  {
    id: "consulta_realizada",
    label: "Consulta",
    accent: "from-violet-500 to-violet-600",
    dot: "bg-violet-400",
    ring: "ring-violet-500/30",
    emoji: "🦷",
  },
  {
    id: "fechado",
    label: "Fechado",
    accent: "from-emerald-500 to-emerald-600",
    dot: "bg-emerald-400",
    ring: "ring-emerald-500/30",
    emoji: "🎉",
  },
  {
    id: "perdido",
    label: "Perdido",
    accent: "from-red-500 to-red-600",
    dot: "bg-red-400",
    ring: "ring-red-500/30",
    emoji: "❌",
  },
];

// Colunas legado — ainda visíveis se tiverem leads
const LEGACY_COLUMNS: Column[] = [
  {
    id: "em_contato",
    label: "Em Contato",
    accent: "from-slate-500 to-slate-600",
    dot: "bg-slate-400",
    ring: "ring-slate-500/30",
    emoji: "📞",
  },
  {
    id: "proposta_enviada",
    label: "Proposta",
    accent: "from-orange-500 to-orange-600",
    dot: "bg-orange-400",
    ring: "ring-orange-500/30",
    emoji: "📋",
  },
];

const ALL_COLUMNS = [...COLUMNS, ...LEGACY_COLUMNS];

// ─── Labels ───────────────────────────────────────────────────────────────────

const ORIGIN_LABELS: Record<AttendanceOrigin, string> = {
  meta_ads:        "Meta Ads",
  google_ads:      "Google Ads",
  instagram:       "Instagram",
  google_organic:  "Google Orgânico",
  referral:        "Indicação",
  organic:         "Orgânico",
  other:           "Outro",
};

const ORIGIN_COLOR: Record<AttendanceOrigin, string> = {
  meta_ads:       "text-blue-400 bg-blue-500/10 border-blue-500/20",
  google_ads:     "text-red-400 bg-red-500/10 border-red-500/20",
  instagram:      "text-pink-400 bg-pink-500/10 border-pink-500/20",
  google_organic: "text-green-400 bg-green-500/10 border-green-500/20",
  referral:       "text-purple-400 bg-purple-500/10 border-purple-500/20",
  organic:        "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  other:          "text-gray-400 bg-gray-500/10 border-gray-500/20",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(val: unknown): string {
  const n = Number(val);
  if (!val || isNaN(n)) return "";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "hoje";
  if (days === 1) return "ontem";
  if (days < 7) return `${days}d atrás`;
  if (days < 30) return `${Math.floor(days / 7)}sem atrás`;
  return `${Math.floor(days / 30)}m atrás`;
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function LeadCard({
  lead,
  column,
  onMove,
  onChat,
}: {
  lead: PatientLead;
  column: Column;
  onMove: (id: string, status: PatientLeadStatus) => void;
  onChat?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [lostReason, setLostReason] = useState(lead.lostReason ?? "");
  const [showLostModal, setShowLostModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<PatientLeadStatus | null>(null);

  function handleMoveClick(status: PatientLeadStatus) {
    if (status === "perdido") {
      setPendingStatus(status);
      setShowLostModal(true);
      return;
    }
    onMove(lead.id, status);
  }

  function confirmLost() {
    if (!pendingStatus) return;
    startTransition(async () => {
      await updatePatientLeadStatusAction(lead.id, pendingStatus, lostReason || undefined);
      onMove(lead.id, pendingStatus);
      setShowLostModal(false);
    });
  }

  const value = formatCurrency(lead.treatmentValue);

  // Follow-up sequence shortcut buttons (only when not in follow-up cols)
  const followupCols = COLUMNS.filter(c => c.isFollowup);

  return (
    <>
      <div
        className={`
          relative bg-[#1a1a1a] border border-[#262626] rounded-xl p-3 cursor-pointer
          hover:border-[#333] transition-all duration-150
          ring-1 ${column.ring} hover:ring-2
          ${isPending ? "opacity-50 pointer-events-none" : ""}
        `}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${column.dot}`} />
            <span className="font-semibold text-white text-sm truncate">{lead.name}</span>
          </div>
          {value && (
            <span className="text-emerald-400 text-xs font-bold flex-shrink-0">{value}</span>
          )}
        </div>

        {/* Cliente */}
        <div className="text-xs text-gray-500 mb-2 truncate">
          🦷 {lead.client.name}
        </div>

        {/* Origin + action buttons */}
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${ORIGIN_COLOR[lead.origin]}`}>
            {ORIGIN_LABELS[lead.origin]}
          </span>
          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
            {/* Chat button (only when WhatsApp instance available) */}
            {onChat && (
              <button
                onClick={onChat}
                className="flex items-center gap-1 text-[10px] text-[#25D366] hover:text-[#22c55e] transition-colors font-medium"
                title="Abrir conversa"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.529 5.855L0 24l6.335-1.502A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.935 0-3.741-.516-5.299-1.415l-.38-.224-3.762.892.952-3.655-.247-.397A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
                Conversa
              </button>
            )}
          </div>
        </div>

        {/* Date */}
        <div className="text-[10px] text-gray-600">{timeAgo(lead.createdAt)}</div>

        {/* Follow-up quick buttons (always visible on card) */}
        {!column.isFollowup && column.id !== "fechado" && column.id !== "perdido" && column.id !== "agendado" && column.id !== "consulta_realizada" && (
          <div className="flex gap-1 mt-2 pt-2 border-t border-[#262626]" onClick={e => e.stopPropagation()}>
            {followupCols.map(f => (
              <button
                key={f.id}
                onClick={() => handleMoveClick(f.id)}
                disabled={isPending}
                className={`flex-1 py-1 rounded-lg text-[9px] font-semibold transition-all border ${
                  f.id === "followup_1" ? "border-sky-500/30 text-sky-400 hover:bg-sky-500/10" :
                  f.id === "followup_2" ? "border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10" :
                  "border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
                }`}
              >
                {f.emoji} {f.label.replace("Follow-up", "FU")}
              </button>
            ))}
          </div>
        )}

        {/* Expanded section */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-[#262626] space-y-2" onClick={e => e.stopPropagation()}>
            {lead.scheduledAt && (
              <div className="text-xs text-amber-400">
                📅 {new Date(lead.scheduledAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
              </div>
            )}
            {lead.notes && (
              <p className="text-xs text-gray-500 line-clamp-3">{lead.notes}</p>
            )}
            {lead.assignee && (
              <p className="text-[10px] text-gray-600">👤 {lead.assignee.name}</p>
            )}

            {/* All move buttons */}
            <div className="flex flex-wrap gap-1 pt-1">
              {ALL_COLUMNS.filter(c => c.id !== column.id).map(c => (
                <button
                  key={c.id}
                  onClick={() => handleMoveClick(c.id)}
                  disabled={isPending}
                  className="text-[10px] px-2 py-1 rounded-lg bg-[#252525] hover:bg-[#2e2e2e] text-gray-400 hover:text-white border border-[#333] transition-all"
                >
                  → {c.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lost reason modal */}
      {showLostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowLostModal(false)}>
          <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-bold mb-3">Motivo da perda</h3>
            <textarea
              className="w-full bg-[#111] border border-[#333] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-violet-500"
              rows={3}
              placeholder="Ex: Preço, não compareceu, escolheu outra clínica..."
              value={lostReason}
              onChange={e => setLostReason(e.target.value)}
            />
            <div className="flex gap-2 mt-3">
              <button onClick={() => setShowLostModal(false)} className="flex-1 py-2 rounded-xl border border-[#333] text-gray-400 text-sm hover:border-[#444] transition-colors">
                Cancelar
              </button>
              <button onClick={confirmLost} disabled={isPending} className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Board ────────────────────────────────────────────────────────────────────

export function KanbanCliente({
  leads: initialLeads,
  instanceMap = {},
}: {
  leads: PatientLead[];
  instanceMap?: Record<string, string>; // clientId → instanceName (Evolution)
}) {
  const [leads, setLeads]   = useState(initialLeads);
  const [dragId, setDragId] = useState<string | null>(null);
  const [chatState, setChatState] = useState<{ lead: ChatLead; instanceName: string } | null>(null);

  const chatLead         = chatState?.lead ?? null;
  const chatInstanceName = chatState?.instanceName ?? null;

  function handleMove(id: string, status: PatientLeadStatus) {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    updatePatientLeadStatusAction(id, status);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDrop(e: React.DragEvent, targetStatus: PatientLeadStatus) {
    e.preventDefault();
    if (!dragId) return;
    handleMove(dragId, targetStatus);
    setDragId(null);
  }

  // Cols to show: always show main COLUMNS; show legacy only if they have leads
  const visibleColumns = [
    ...COLUMNS,
    ...LEGACY_COLUMNS.filter(lc => leads.some(l => l.status === lc.id)),
  ];

  const activeleads = leads.filter(l => l.status !== "perdido");
  const closedLeads = leads.filter(l => l.status === "fechado");
  const totalValue  = closedLeads.reduce((s, l) => s + Number(l.treatmentValue ?? 0), 0);

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
        <span className="text-white font-medium">{activeleads.length}</span>
        <span>leads no pipeline</span>
        <span>·</span>
        <span className="text-emerald-400 font-medium">{closedLeads.length}</span>
        <span>fechados</span>
        {totalValue > 0 && (
          <>
            <span>·</span>
            <span className="text-emerald-400 font-semibold">
              {totalValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} em tratamentos
            </span>
          </>
        )}
      </div>

      {/* Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-6" style={{ minWidth: 0 }}>
        {visibleColumns.map(col => {
          const colLeads = leads.filter(l => l.status === col.id);
          return (
            <div
              key={col.id}
              className="flex-shrink-0 w-[240px] flex flex-col"
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, col.id)}
            >
              {/* Header */}
              <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl bg-gradient-to-r ${col.accent} mb-3`}>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{col.emoji}</span>
                  <span className="text-white text-xs font-bold">{col.label}</span>
                  {col.isFollowup && (
                    <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full text-white/80">FU</span>
                  )}
                </div>
                <span className="bg-black/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {colLeads.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-2 flex-1">
                {colLeads.map(lead => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={() => setDragId(lead.id)}
                    onDragEnd={() => setDragId(null)}
                    className={dragId === lead.id ? "opacity-40" : ""}
                  >
                    <LeadCard
                      lead={lead}
                      column={col}
                      onMove={handleMove}
                      onChat={instanceMap[lead.client.id]
                        ? () => setChatState({
                            instanceName: instanceMap[lead.client.id],
                            lead: {
                              id:       lead.id,
                              name:     lead.name,
                              phone:    lead.phone,
                              photoUrl: lead.photoUrl,
                              city:     lead.city,
                              state:    lead.state,
                              origin:   lead.origin,
                              client:   lead.client,
                            },
                          })
                        : undefined
                      }
                    />
                  </div>
                ))}
                {colLeads.length === 0 && (
                  <div className="h-16 border border-dashed border-[#222] rounded-xl flex items-center justify-center text-gray-700 text-xs">
                    Arraste aqui
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Chat Panel ──────────────────────────────────────────────────────── */}
      {chatLead && chatInstanceName && (
        <ChatPanel
          lead={chatLead}
          instanceName={chatInstanceName}
          onClose={() => setChatState(null)}
        />
      )}
    </div>
  );
}
