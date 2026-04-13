"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { LeadStatus } from "@prisma/client";
import { updateLeadStatusAction } from "./actions";

// ─── Types ────────────────────────────────────────────────────────────────────

type Lead = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  status: LeadStatus;
  nextFollowUp: Date | string | null;
  updatedAt: Date | string;
  owner: { id: string; name: string };
};

interface Props {
  leads: Lead[];
  overdueCount: number;
  noActivityCount: number;
  atRiskCount: number;
}

// ─── Funil ────────────────────────────────────────────────────────────────────

const FUNNEL: { label: string; statuses: LeadStatus[]; color: string; dot: string; ring: string }[] = [
  { label: "Novo",        statuses: ["new"],                                    color: "text-indigo-400", dot: "bg-indigo-400", ring: "ring-indigo-500/40" },
  { label: "Em Contato",  statuses: ["contacted", "qualified"],                 color: "text-blue-400",   dot: "bg-blue-400",   ring: "ring-blue-500/40"  },
  { label: "Proposta",    statuses: ["proposal_sent", "negotiation"],           color: "text-amber-400",  dot: "bg-amber-400",  ring: "ring-amber-500/40" },
  { label: "Onboarding",  statuses: ["onboarding"],                             color: "text-violet-400", dot: "bg-violet-400", ring: "ring-violet-500/40"},
  { label: "Cliente",     statuses: ["active_client", "upsell_opportunity"],   color: "text-emerald-400",dot: "bg-emerald-400",ring: "ring-emerald-500/40"},
];

const ALL_STATUS_LABELS: Record<LeadStatus, string> = {
  new:                "Novo Lead",
  contacted:          "Em Contato",
  qualified:          "Qualificado",
  proposal_sent:      "Proposta Enviada",
  negotiation:        "Em Negociação",
  onboarding:         "Onboarding",
  active_client:      "Cliente Ativo",
  upsell_opportunity: "Upsell",
  at_risk_churn:      "Risco de Churn",
  closed_won:         "Fechado (Ganho)",
  closed_lost:        "Fechado (Perdido)",
  churned:            "Churn",
};

const STATUS_DOT: Partial<Record<LeadStatus, string>> = {
  new:                "bg-indigo-400",
  contacted:          "bg-blue-400",
  qualified:          "bg-cyan-400",
  proposal_sent:      "bg-amber-400",
  negotiation:        "bg-orange-400",
  onboarding:         "bg-violet-400",
  active_client:      "bg-emerald-400",
  upsell_opportunity: "bg-teal-400",
  at_risk_churn:      "bg-red-400",
  closed_won:         "bg-green-500",
  closed_lost:        "bg-gray-500",
  churned:            "bg-rose-400",
};

const PIPELINE_STATUSES: LeadStatus[] = [
  "new", "contacted", "qualified", "proposal_sent", "negotiation",
  "onboarding", "active_client", "upsell_opportunity", "at_risk_churn",
];

// ─── Component ────────────────────────────────────────────────────────────────

export function CRMView({ leads, overdueCount, noActivityCount, atRiskCount }: Props) {
  const [search, setSearch]           = useState("");
  const [activeStage, setActiveStage] = useState<string | null>(null); // funil stage label
  const [showClosed, setShowClosed]   = useState(false);

  const now = new Date();

  // Filtros
  const visibleLeads = leads.filter(l => {
    // Encerrados
    const isClosed = ["closed_won", "closed_lost", "churned"].includes(l.status);
    if (isClosed && !showClosed) return false;
    if (!isClosed && showClosed) return false;

    // Etapa do funil
    if (activeStage) {
      const stage = FUNNEL.find(f => f.label === activeStage);
      if (stage && !stage.statuses.includes(l.status)) return false;
    }

    // Busca
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        l.name.toLowerCase().includes(q) ||
        (l.company?.toLowerCase().includes(q) ?? false) ||
        (l.email?.toLowerCase().includes(q) ?? false)
      );
    }

    return true;
  });

  const pipelineLeads = leads.filter(l => PIPELINE_STATUSES.includes(l.status));

  return (
    <div className="space-y-5">

      {/* ── Atenção imediata ─────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <AttentionCard
          count={overdueCount}
          label="Follow-ups atrasados"
          color="text-red-400"
          bg="bg-red-500/10"
          border={overdueCount > 0 ? "border-red-500/30" : "border-[#262626]"}
          icon={
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          }
          onClick={() => { setActiveStage(null); setSearch(""); setShowClosed(false); }}
        />
        <AttentionCard
          count={noActivityCount}
          label="Sem atividade +7 dias"
          color="text-amber-400"
          bg="bg-amber-500/10"
          border={noActivityCount > 0 ? "border-amber-500/30" : "border-[#262626]"}
          icon={
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          }
        />
        <AttentionCard
          count={atRiskCount}
          label="Risco de churn"
          color="text-rose-400"
          bg="bg-rose-500/10"
          border={atRiskCount > 0 ? "border-rose-500/30" : "border-[#262626]"}
          icon={
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          }
          onClick={() => { setActiveStage(null); setSearch(""); setShowClosed(false); }}
        />
      </div>

      {/* ── Funil ────────────────────────────────────────────── */}
      <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-4">
        <div className="flex items-center gap-1 overflow-x-auto">
          {FUNNEL.map((stage, i) => {
            const count   = pipelineLeads.filter(l => stage.statuses.includes(l.status)).length;
            const isActive = activeStage === stage.label;
            return (
              <div key={stage.label} className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => setActiveStage(isActive ? null : stage.label)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? `bg-[#222] ring-1 ${stage.ring} ${stage.color}`
                      : "text-gray-500 hover:text-gray-300 hover:bg-[#222]"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${stage.dot}`} />
                  <span>{stage.label}</span>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                    isActive ? "bg-[#333]" : "bg-[#262626] text-gray-600"
                  }`}>{count}</span>
                </button>
                {i < FUNNEL.length - 1 && (
                  <svg className="w-3 h-3 text-gray-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            );
          })}

          <div className="ml-auto flex-shrink-0 pl-2 border-l border-[#262626]">
            <span className="text-xs text-gray-600 font-medium">{pipelineLeads.length} no pipeline</span>
          </div>
        </div>
      </div>

      {/* ── Barra de ações ───────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <svg className="w-4 h-4 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, empresa ou email..."
            className="w-full pl-9 pr-3 py-2 bg-[#1a1a1a] border border-[#262626] rounded-xl text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>

        <button
          onClick={() => { setShowClosed(v => !v); setActiveStage(null); }}
          className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
            showClosed
              ? "bg-gray-500/10 border-gray-500/30 text-gray-400"
              : "bg-[#1a1a1a] border-[#262626] text-gray-600 hover:text-gray-400"
          }`}
        >
          {showClosed ? "← Pipeline" : "Encerrados"}
        </button>

        <Link
          href="/admin/crm/new"
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-xl text-sm font-medium text-white transition-colors flex-shrink-0"
        >
          + Novo
        </Link>
      </div>

      {/* ── Lista de leads ───────────────────────────────────── */}
      <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl overflow-hidden">
        {visibleLeads.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-8 h-8 text-gray-700 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm text-gray-600">Nenhum lead encontrado</p>
          </div>
        ) : (
          <div className="divide-y divide-[#222]">
            {visibleLeads.map(lead => (
              <LeadRow key={lead.id} lead={lead} now={now} />
            ))}
          </div>
        )}
      </div>

      {visibleLeads.length > 0 && (
        <p className="text-xs text-gray-700">{visibleLeads.length} lead{visibleLeads.length !== 1 ? "s" : ""}</p>
      )}
    </div>
  );
}

// ─── LeadRow ──────────────────────────────────────────────────────────────────

function LeadRow({ lead, now }: { lead: Lead; now: Date }) {
  const [pending, startTransition] = useTransition();

  const followUp    = lead.nextFollowUp ? new Date(lead.nextFollowUp) : null;
  const isOverdue   = followUp && followUp < now;
  const isToday     = followUp && followUp.toDateString() === now.toDateString();
  const dot         = STATUS_DOT[lead.status] ?? "bg-gray-500";

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as LeadStatus;
    startTransition(() => updateLeadStatusAction(lead.id, next));
  }

  function followUpLabel() {
    if (!followUp) return null;
    const diff = Math.round((followUp.getTime() - now.getTime()) / 86400000);
    if (diff < 0)   return { text: `Atrasado ${Math.abs(diff)}d`, cls: "text-red-400" };
    if (diff === 0) return { text: "Hoje", cls: "text-sky-400" };
    if (diff === 1) return { text: "Amanhã", cls: "text-gray-400" };
    return { text: followUp.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }), cls: "text-gray-600" };
  }

  const fu = followUpLabel();

  return (
    <div className={`flex items-center gap-4 px-5 py-3.5 hover:bg-[#1f1f1f] transition-colors ${pending ? "opacity-50" : ""}`}>
      {/* Dot + Nome */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
        <div className="min-w-0">
          <Link href={`/admin/crm/${lead.id}`} className="text-sm font-medium text-gray-200 hover:text-violet-400 transition-colors truncate block">
            {lead.name}
          </Link>
          {lead.company && <p className="text-xs text-gray-600 truncate">{lead.company}</p>}
        </div>
      </div>

      {/* Status inline */}
      <select
        value={lead.status}
        onChange={handleStatusChange}
        disabled={pending}
        className="text-xs bg-[#222] border border-[#333] text-gray-400 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer flex-shrink-0"
      >
        {(Object.keys(ALL_STATUS_LABELS) as LeadStatus[]).map(s => (
          <option key={s} value={s}>{ALL_STATUS_LABELS[s]}</option>
        ))}
      </select>

      {/* Responsável */}
      <span className="text-xs text-gray-600 flex-shrink-0 w-20 truncate hidden sm:block">
        {lead.owner.name.split(" ")[0]}
      </span>

      {/* Follow-up */}
      <div className="w-24 text-right flex-shrink-0 hidden md:block">
        {fu ? (
          <span className={`text-xs font-medium ${fu.cls}`}>{fu.text}</span>
        ) : (
          <span className="text-xs text-gray-700">—</span>
        )}
      </div>

      {/* Link */}
      <Link href={`/admin/crm/${lead.id}`} className="text-gray-700 hover:text-violet-400 transition-colors flex-shrink-0">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}

// ─── AttentionCard ────────────────────────────────────────────────────────────

function AttentionCard({ count, label, color, bg, border, icon, onClick }: {
  count: number;
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-[#1a1a1a] border rounded-2xl p-4 transition-all hover:border-opacity-60 ${border}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl ${count > 0 ? bg : "bg-[#222]"} flex items-center justify-center flex-shrink-0`}>
          <svg className={`w-4.5 h-4.5 ${count > 0 ? color : "text-gray-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width:"18px",height:"18px"}}>
            {icon}
          </svg>
        </div>
        <div>
          <p className={`text-2xl font-bold ${count > 0 ? color : "text-gray-700"}`}>{count}</p>
          <p className="text-xs text-gray-600 leading-tight">{label}</p>
        </div>
      </div>
    </button>
  );
}
