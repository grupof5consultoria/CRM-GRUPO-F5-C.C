"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import Link from "next/link";
import { LeadStatus } from "@prisma/client";
import { updateLeadStatusAction, updateLeadQuickAction, getLeadDetailsAction } from "./actions";

// ─── Types ────────────────────────────────────────────────────────────────────

type Lead = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  status: LeadStatus;
  nextFollowUp: Date | null;
  value: unknown;
  source: string | null;
  platforms: string[];
  owner: { name: string };
};

type LeadDetail = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  status: LeadStatus;
  notes: string | null;
  nextFollowUp: Date | null;
  value: unknown;
  source: string | null;
  platforms: string[];
  owner: { id: string; name: string };
  activities: { id: string; type: string; description: string; createdAt: Date; user: { name: string } }[];
  proposals: { id: string; title: string; status: string; totalValue: unknown; createdAt: Date }[];
} | null;

// ─── Config ───────────────────────────────────────────────────────────────────

type Column = {
  id: string;
  label: string;
  statuses: LeadStatus[];
  defaultStatus: LeadStatus;
  accent: string;
  dot: string;
  ring: string;
};

const COLUMNS: Column[] = [
  { id: "novo",       label: "Novo",        statuses: ["new"],                                  defaultStatus: "new",          accent: "from-indigo-500 to-indigo-600",  dot: "bg-indigo-400",  ring: "ring-indigo-500/30"  },
  { id: "contato",    label: "Em Contato",  statuses: ["contacted", "qualified"],               defaultStatus: "contacted",    accent: "from-sky-500 to-sky-600",        dot: "bg-sky-400",     ring: "ring-sky-500/30"     },
  { id: "proposta",   label: "Proposta",    statuses: ["proposal_sent", "negotiation"],         defaultStatus: "proposal_sent",accent: "from-amber-500 to-amber-600",    dot: "bg-amber-400",   ring: "ring-amber-500/30"   },
  { id: "onboarding", label: "Onboarding",  statuses: ["onboarding"],                           defaultStatus: "onboarding",   accent: "from-violet-500 to-violet-600",  dot: "bg-violet-400",  ring: "ring-violet-500/30"  },
  { id: "cliente",    label: "Cliente",     statuses: ["active_client", "upsell_opportunity"],  defaultStatus: "active_client",accent: "from-emerald-500 to-emerald-600",dot: "bg-emerald-400", ring: "ring-emerald-500/30" },
];

const CHURN_COL = { id: "churn", label: "Risco de Churn", defaultStatus: "at_risk_churn" as LeadStatus };

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Novo Lead", contacted: "Em Contato", qualified: "Qualificado",
  proposal_sent: "Proposta Enviada", negotiation: "Em Negociação",
  onboarding: "Onboarding", active_client: "Cliente Ativo",
  upsell_opportunity: "Upsell", at_risk_churn: "Risco de Churn",
  closed_won: "Fechado (Ganho)", closed_lost: "Fechado (Perdido)", churned: "Churn",
};

const SOURCE_LABELS: Record<string, string> = {
  indicacao: "Indicação", google: "Google", anuncio: "Anúncio", instagram: "Instagram", organico: "Orgânico", outro: "Outro",
};

const SOURCE_COLOR: Record<string, string> = {
  indicacao: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  google:    "text-blue-400 bg-blue-500/10 border-blue-500/20",
  anuncio:   "text-orange-400 bg-orange-500/10 border-orange-500/20",
  instagram: "text-pink-400 bg-pink-500/10 border-pink-500/20",
  organico:  "text-green-400 bg-green-500/10 border-green-500/20",
  outro:     "text-gray-400 bg-gray-500/10 border-gray-500/20",
};

const STATUS_COLOR: Partial<Record<LeadStatus, string>> = {
  new: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  contacted: "text-sky-400 bg-sky-500/10 border-sky-500/20",
  qualified: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  proposal_sent: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  negotiation: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  onboarding: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  active_client: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  upsell_opportunity: "text-teal-400 bg-teal-500/10 border-teal-500/20",
  at_risk_churn: "text-red-400 bg-red-500/10 border-red-500/20",
  closed_won: "text-green-400 bg-green-500/10 border-green-500/20",
  closed_lost: "text-gray-400 bg-gray-500/10 border-gray-500/20",
  churned: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtValue(v: unknown): string | null {
  const n = Number(v);
  if (!v || isNaN(n) || n === 0) return null;
  return `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function colTotal(leads: Lead[]): string | null {
  const sum = leads.reduce((acc, l) => acc + (Number(l.value) || 0), 0);
  if (sum === 0) return null;
  return `R$ ${sum.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function followUpInfo(date: Date | null, now: Date) {
  if (!date) return null;
  const diff = Math.round((new Date(date).getTime() - now.getTime()) / 86400000);
  if (diff < 0)   return { label: `Atrasado ${Math.abs(diff)}d`, cls: "text-red-400 bg-red-500/10 border-red-500/20" };
  if (diff === 0) return { label: "Hoje",    cls: "text-red-400 bg-red-500/10 border-red-500/20" };
  if (diff === 1) return { label: "Amanhã",  cls: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
  if (diff <= 7)  return { label: `Em ${diff}d`, cls: "text-gray-500 bg-[#222] border-[#333]" };
  return { label: new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }), cls: "text-gray-600 bg-[#1a1a1a] border-[#2a2a2a]" };
}

// ─── KanbanCard ───────────────────────────────────────────────────────────────

function KanbanCard({ lead, now, onOpen, onDragStart }: {
  lead: Lead; now: Date; onOpen: (id: string) => void; onDragStart: (id: string) => void;
}) {
  const fu       = followUpInfo(lead.nextFollowUp, now);
  const isAtRisk = lead.status === "at_risk_churn";
  const isOverdue = fu?.cls.includes("red");
  const val      = fmtValue(lead.value);

  return (
    <div
      draggable
      onDragStart={(e) => { e.stopPropagation(); onDragStart(lead.id); }}
      onClick={() => onOpen(lead.id)}
      className={`group relative bg-[#1e1e1e] border rounded-xl p-4 cursor-pointer active:cursor-grabbing transition-all duration-150 hover:bg-[#252525] hover:shadow-xl hover:-translate-y-0.5 select-none ${
        isAtRisk ? "border-red-500/40" : isOverdue ? "border-amber-500/20" : "border-[#2e2e2e] hover:border-[#3a3a3a]"
      }`}
    >
      {isAtRisk && <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-red-500 rounded-full" />}

      {/* Nome + empresa */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors truncate">
            {lead.name}
          </p>
          {lead.company && <p className="text-xs text-gray-400 truncate mt-0.5">{lead.company}</p>}
        </div>
        {isAtRisk && <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1 animate-pulse" />}
      </div>

      {/* Badges: valor + source + platforms */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {val && (
          <span className="text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md">
            {val}
          </span>
        )}
        {lead.source && SOURCE_LABELS[lead.source] && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${SOURCE_COLOR[lead.source] ?? "text-gray-400 bg-[#222] border-[#333]"}`}>
            {SOURCE_LABELS[lead.source]}
          </span>
        )}
        {lead.platforms.includes("meta_ads") && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-md border text-blue-400 bg-blue-500/10 border-blue-500/20">Meta</span>
        )}
        {lead.platforms.includes("google_ads") && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-md border text-red-400 bg-red-500/10 border-red-500/20">Google</span>
        )}
      </div>

      {/* Rodapé: responsável + follow-up */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#2a2a2a]">
        <span className="text-xs text-gray-500 truncate">{lead.owner.name.split(" ")[0]}</span>
        {fu && (
          <span className={`text-xs px-2 py-0.5 rounded-md border font-medium flex-shrink-0 ${fu.cls}`}>
            {fu.label}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── KanbanBoard ──────────────────────────────────────────────────────────────

export function KanbanBoard({ leads: initialLeads }: { leads: Lead[] }) {
  const now = new Date();

  // Optimistic state para drag & drop
  const [leads, setLeads]           = useState(initialLeads);
  const [openId, setOpenId]         = useState<string | null>(null);
  const [detail, setDetail]         = useState<LeadDetail>(null);
  const [loadingPanel, setLoading]  = useState(false);
  const [dragId, setDragId]         = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [, startTransition]         = useTransition();

  // Sincroniza quando o server revalida
  useEffect(() => { setLeads(initialLeads); }, [initialLeads]);

  const pipeline = leads.filter(l => !["closed_won","closed_lost","churned","at_risk_churn"].includes(l.status));
  const atRisk   = leads.filter(l => l.status === "at_risk_churn");
  const overdue  = leads.filter(l => l.nextFollowUp && new Date(l.nextFollowUp) < now && !["closed_won","closed_lost","churned"].includes(l.status));

  // ── Drag & Drop ─────────────────────────────────────────────────────────────

  function handleDragStart(id: string) { setDragId(id); }
  function handleDragOver(e: React.DragEvent, colId: string) {
    e.preventDefault();
    setDragOverCol(colId);
  }
  function handleDragLeave() { setDragOverCol(null); }
  function handleDrop(targetColId: string) {
    if (!dragId) return;
    const allCols = [...COLUMNS, CHURN_COL];
    const col = allCols.find(c => c.id === targetColId);
    if (!col) return;
    const newStatus = col.defaultStatus;

    // Optimistic update
    setLeads(prev => prev.map(l => l.id === dragId ? { ...l, status: newStatus } : l));

    startTransition(() => updateLeadStatusAction(dragId, newStatus));
    setDragId(null);
    setDragOverCol(null);
  }

  // ── Panel ────────────────────────────────────────────────────────────────────

  async function openPanel(id: string) {
    setOpenId(id);
    setDetail(null);
    setLoading(true);
    const data = await getLeadDetailsAction(id);
    setDetail(data);
    setLoading(false);
  }
  function closePanel() { setOpenId(null); setDetail(null); }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="relative">
      {/* Stats */}
      <div className="flex items-center gap-4 mb-5 text-xs text-gray-600">
        <span>{pipeline.length} no pipeline</span>
        {overdue.length > 0 && <span className="text-red-400 font-medium">· {overdue.length} follow-up{overdue.length > 1 ? "s" : ""} atrasado{overdue.length > 1 ? "s" : ""}</span>}
        {atRisk.length > 0  && <span className="text-rose-400 font-medium">· {atRisk.length} em risco de churn</span>}
      </div>

      {/* Board */}
      <div className="overflow-x-auto pb-4 -mx-6 px-6">
        <div className="flex gap-4" style={{ minWidth: "max-content" }}>

          {COLUMNS.map(col => {
            const colLeads = leads.filter(l => col.statuses.includes(l.status));
            const total    = colTotal(colLeads);
            const isDragOver = dragOverCol === col.id;

            return (
              <div
                key={col.id}
                className={`w-80 flex-shrink-0 flex flex-col transition-all ${isDragOver ? "scale-[1.01]" : ""}`}
                onDragOver={e => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(col.id)}
              >
                {/* Header */}
                <div className={`flex items-center justify-between px-4 py-3 mb-3 rounded-xl bg-[#1a1a1a] border transition-all ${
                  isDragOver ? `border-transparent ring-2 ${col.ring}` : "border-[#2a2a2a]"
                }`}>
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                    <span className="text-sm font-semibold text-gray-200">{col.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {total && <span className="text-sm text-emerald-400 font-bold">{total}</span>}
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${col.accent} text-white`}>
                      {colLeads.length}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className={`space-y-2.5 min-h-[80px] rounded-xl transition-all p-1 -m-1 ${isDragOver ? "bg-white/[0.02]" : ""}`}>
                  {colLeads.length === 0 ? (
                    <div className={`h-16 rounded-xl border-2 border-dashed flex items-center justify-center transition-all ${
                      isDragOver ? "border-violet-500/30 bg-violet-500/5" : "border-[#2a2a2a]"
                    }`}>
                      <span className="text-xs text-gray-700">{isDragOver ? "Soltar aqui" : "Nenhum lead"}</span>
                    </div>
                  ) : (
                    colLeads.map(lead => (
                      <KanbanCard key={lead.id} lead={lead} now={now} onOpen={openPanel} onDragStart={handleDragStart} />
                    ))
                  )}
                </div>
              </div>
            );
          })}

          {/* Coluna Risco Churn */}
          {atRisk.length > 0 && (() => {
            const isDragOver = dragOverCol === CHURN_COL.id;
            const total = colTotal(atRisk);
            return (
              <div
                className={`w-80 flex-shrink-0 flex flex-col transition-all ${isDragOver ? "scale-[1.01]" : ""}`}
                onDragOver={e => handleDragOver(e, CHURN_COL.id)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(CHURN_COL.id)}
              >
                <div className={`flex items-center justify-between px-4 py-3 mb-3 rounded-xl bg-red-500/5 border transition-all ${
                  isDragOver ? "border-transparent ring-2 ring-red-500/30" : "border-red-500/20"
                }`}>
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-sm font-semibold text-red-400">Risco de Churn</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {total && <span className="text-sm text-red-400 font-bold">{total}</span>}
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">{atRisk.length}</span>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {atRisk.map(lead => (
                    <KanbanCard key={lead.id} lead={lead} now={now} onOpen={openPanel} onDragStart={handleDragStart} />
                  ))}
                </div>
              </div>
            );
          })()}

        </div>
      </div>

      {/* Side Panel */}
      {openId && (
        <LeadPanel leadId={openId} detail={detail} loading={loadingPanel} onClose={closePanel} />
      )}
    </div>
  );
}

// ─── LeadPanel ────────────────────────────────────────────────────────────────

const SOURCE_OPTIONS = [
  { value: "indicacao", label: "Indicação" },
  { value: "google",    label: "Google" },
  { value: "anuncio",   label: "Anúncio Pago" },
  { value: "instagram", label: "Instagram" },
  { value: "organico",  label: "Orgânico" },
  { value: "outro",     label: "Outro" },
];

function LeadPanel({ leadId, detail, loading, onClose }: {
  leadId: string; detail: LeadDetail; loading: boolean; onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [followUp, setFollowUp]    = useState("");
  const [notes, setNotes]          = useState("");
  const [status, setStatus]        = useState<LeadStatus | "">("");
  const [value, setValue]          = useState("");
  const [source, setSource]        = useState("");
  const [platforms, setPlatforms]  = useState<string[]>([]);
  const [saved, setSaved]          = useState(false);

  useEffect(() => {
    if (detail) {
      setFollowUp(detail.nextFollowUp ? new Date(detail.nextFollowUp).toISOString().split("T")[0] : "");
      setNotes(detail.notes ?? "");
      setStatus(detail.status);
      setValue(detail.value != null ? String(Number(detail.value)) : "");
      setSource(detail.source ?? "");
      setPlatforms(detail.platforms ?? []);
    }
  }, [detail]);

  function togglePlatform(p: string) {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  function handleSave() {
    if (!detail) return;
    startTransition(async () => {
      await updateLeadQuickAction(detail.id, {
        status: status as LeadStatus || undefined,
        nextFollowUp: followUp || null,
        notes,
        value: value ? parseFloat(value) : null,
        source: source || null,
        platforms,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  const val = detail ? fmtValue(detail.value) : null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-[400px] bg-[#111] border-l border-[#222] z-50 flex flex-col overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e1e]">
          {loading || !detail ? (
            <div className="space-y-2 flex-1">
              <div className="h-4 w-32 bg-[#222] rounded animate-pulse" />
              <div className="h-3 w-24 bg-[#1a1a1a] rounded animate-pulse" />
            </div>
          ) : (
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-white truncate">{detail.name}</h2>
              <div className="flex items-center gap-2 flex-wrap mt-1">
                {detail.company && <p className="text-xs text-gray-500 truncate">{detail.company}</p>}
                {val && <span className="text-xs font-bold text-emerald-400">{val}</span>}
                {detail.source && SOURCE_LABELS[detail.source] && (
                  <span className={`text-xs px-1.5 py-0.5 rounded border ${SOURCE_COLOR[detail.source] ?? ""}`}>
                    {SOURCE_LABELS[detail.source]}
                  </span>
                )}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 ml-3 flex-shrink-0">
            {detail && (
              <Link href={`/admin/crm/${detail.id}`} className="text-xs text-gray-600 hover:text-violet-400 transition-colors px-2 py-1 rounded-lg hover:bg-[#1a1a1a]">
                Ver perfil →
              </Link>
            )}
            <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-300 hover:bg-[#1a1a1a] transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading || !detail ? (
            <div className="p-6 space-y-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-16 bg-[#1e1e1e] rounded animate-pulse" />
                  <div className="h-8 bg-[#1a1a1a] rounded-lg animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 space-y-6">

              {/* Plataformas */}
              {detail.platforms.length > 0 && (
                <div className="flex gap-2">
                  {detail.platforms.includes("meta_ads") && (
                    <span className="text-xs px-3 py-1.5 rounded-lg border text-blue-400 bg-blue-500/10 border-blue-500/20 font-medium">Meta Ads</span>
                  )}
                  {detail.platforms.includes("google_ads") && (
                    <span className="text-xs px-3 py-1.5 rounded-lg border text-red-400 bg-red-500/10 border-red-500/20 font-medium">Google Ads</span>
                  )}
                </div>
              )}

              {/* Contato */}
              <section>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Contato</p>
                <div className="space-y-2">
                  {detail.email && (
                    <a href={`mailto:${detail.email}`} className="flex items-center gap-3 p-3 rounded-xl bg-[#161616] border border-[#222] hover:border-[#333] transition-all group">
                      <svg className="w-4 h-4 text-gray-600 group-hover:text-violet-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-400 truncate">{detail.email}</span>
                    </a>
                  )}
                  {detail.phone && (
                    <a href={`tel:${detail.phone}`} className="flex items-center gap-3 p-3 rounded-xl bg-[#161616] border border-[#222] hover:border-[#333] transition-all group">
                      <svg className="w-4 h-4 text-gray-600 group-hover:text-violet-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-sm text-gray-400">{detail.phone}</span>
                    </a>
                  )}
                  {!detail.email && !detail.phone && <p className="text-xs text-gray-700 italic">Sem dados de contato</p>}
                </div>
              </section>

              {/* Pipeline */}
              <section>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Pipeline</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600 block mb-1.5">Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value as LeadStatus)} className="w-full bg-[#161616] border border-[#262626] text-gray-300 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-violet-500">
                      {(Object.keys(STATUS_LABELS) as LeadStatus[]).map(s => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1.5">Próximo Follow-up</label>
                    <input type="date" value={followUp} onChange={e => setFollowUp(e.target.value)} className="w-full bg-[#161616] border border-[#262626] text-gray-300 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-violet-500" />
                  </div>
                </div>
              </section>

              {/* Valor + Origem */}
              <section>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Negócio</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600 block mb-1.5">Valor potencial (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={value}
                      onChange={e => setValue(e.target.value)}
                      placeholder="0,00"
                      className="w-full bg-[#161616] border border-[#262626] text-gray-300 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-violet-500 placeholder-gray-700"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1.5">Como nos conheceu</label>
                    <select value={source} onChange={e => setSource(e.target.value)} className="w-full bg-[#161616] border border-[#262626] text-gray-300 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-violet-500">
                      <option value="">Selecione...</option>
                      {SOURCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1.5">Plataformas de anúncio</label>
                    <div className="flex gap-2">
                      {[
                        { value: "meta_ads",   label: "Meta Ads",    cls: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
                        { value: "google_ads", label: "Google Ads",  cls: "text-red-400 bg-red-500/10 border-red-500/30" },
                      ].map(p => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => togglePlatform(p.value)}
                          className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                            platforms.includes(p.value)
                              ? p.cls
                              : "bg-[#161616] border-[#262626] text-gray-600"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Notas */}
              <section>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Notas</p>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Adicione observações sobre o lead..." className="w-full bg-[#161616] border border-[#262626] text-gray-300 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none placeholder-gray-700" />
              </section>

              {/* Propostas */}
              {detail.proposals.length > 0 && (
                <section>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Propostas</p>
                  <div className="space-y-2">
                    {detail.proposals.map(p => (
                      <Link key={p.id} href={`/admin/proposals/${p.id}`} className="flex items-center justify-between p-3 rounded-xl bg-[#161616] border border-[#222] hover:border-[#333] transition-all">
                        <span className="text-sm text-gray-400 truncate">{p.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-md border flex-shrink-0 ml-2 ${STATUS_COLOR[p.status as LeadStatus] ?? "text-gray-500 bg-[#222] border-[#333]"}`}>{p.status}</span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Atividade */}
              {detail.activities.length > 0 && (
                <section>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Atividade Recente</p>
                  <div className="space-y-2">
                    {detail.activities.slice(0, 5).map((a, i) => (
                      <div key={a.id} className="flex gap-3">
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#333] mt-1.5" />
                          {i < 4 && <div className="w-px flex-1 bg-[#222] mt-1" />}
                        </div>
                        <div className="pb-3 min-w-0">
                          <p className="text-xs text-gray-400 leading-relaxed">{a.description}</p>
                          <p className="text-xs text-gray-700 mt-0.5">{a.user.name.split(" ")[0]} · {new Date(a.createdAt).toLocaleDateString("pt-BR")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {detail && (
          <div className="px-6 py-4 border-t border-[#1e1e1e]">
            <button onClick={handleSave} disabled={pending} className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-xl text-sm font-semibold text-white transition-colors">
              {pending ? "Salvando..." : saved ? "Salvo!" : "Salvar alterações"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
