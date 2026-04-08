"use client";

import Link from "next/link";
import { LeadStatus } from "@prisma/client";
import { LEAD_STATUS_LABELS, LEAD_STATUS_VARIANTS } from "@/utils/status-labels";
import { Badge } from "@/components/ui/Badge";
import { updateLeadStatusAction } from "./actions";
import { useState, useTransition } from "react";

type Lead = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  status: LeadStatus;
  nextFollowUp: Date | null;
  owner: { name: string };
};

const COLUMNS: { status: LeadStatus; label: string; dot: string; color: string; group: string }[] = [
  // Prospecção
  { status: "new",               label: "Novo Lead",        dot: "bg-indigo-400",  color: "border-t-indigo-400",  group: "Prospecção" },
  { status: "contacted",         label: "Em Contato",       dot: "bg-blue-400",    color: "border-t-blue-400",    group: "Prospecção" },
  { status: "qualified",         label: "Qualificado",      dot: "bg-cyan-400",    color: "border-t-cyan-400",    group: "Prospecção" },
  // Negociação
  { status: "proposal_sent",     label: "Proposta",         dot: "bg-amber-400",   color: "border-t-amber-400",   group: "Negociação" },
  { status: "negotiation",       label: "Negociação",       dot: "bg-orange-400",  color: "border-t-orange-400",  group: "Negociação" },
  // Clientes
  { status: "onboarding",        label: "Onboarding",       dot: "bg-violet-400",  color: "border-t-violet-400",  group: "Clientes" },
  { status: "active_client",     label: "Cliente Ativo",    dot: "bg-emerald-400", color: "border-t-emerald-400", group: "Clientes" },
  { status: "upsell_opportunity",label: "Upsell",           dot: "bg-teal-400",    color: "border-t-teal-400",    group: "Clientes" },
  // Atenção
  { status: "at_risk_churn",     label: "Risco de Churn",   dot: "bg-red-400",     color: "border-t-red-400",     group: "Atenção" },
  // Encerrados
  { status: "closed_won",        label: "Ganho",            dot: "bg-green-500",   color: "border-t-green-500",   group: "Encerrados" },
  { status: "closed_lost",       label: "Perdido",          dot: "bg-gray-400",    color: "border-t-gray-400",    group: "Encerrados" },
  { status: "churned",           label: "Churn",            dot: "bg-rose-400",    color: "border-t-rose-400",    group: "Encerrados" },
];

const PIPELINE_ORDER = COLUMNS.map(c => c.status);

function KanbanCard({ lead }: { lead: Lead }) {
  const [loading, startTransition] = useTransition();
  const currentIdx = PIPELINE_ORDER.indexOf(lead.status);
  const nextStatus = currentIdx < PIPELINE_ORDER.length - 1 ? PIPELINE_ORDER[currentIdx + 1] : null;

  const isOverdue = lead.nextFollowUp && new Date(lead.nextFollowUp) < new Date();

  function moveNext() {
    if (!nextStatus) return;
    startTransition(() => updateLeadStatusAction(lead.id, nextStatus));
  }

  return (
    <div className={`bg-[#1a1a1a] rounded-xl border border-[#262626] p-3 shadow-sm hover:shadow-md transition-all group ${loading ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between gap-1 mb-2">
        <Link href={`/admin/crm/${lead.id}`} className="font-semibold text-sm text-white hover:text-violet-400 leading-tight transition-colors">
          {lead.name}
        </Link>
        <Link href={`/admin/crm/${lead.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-violet-400 flex-shrink-0">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </Link>
      </div>

      {lead.company && (
        <p className="text-xs text-gray-500 mb-2 truncate">{lead.company}</p>
      )}

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-600">{lead.owner.name}</span>
        {lead.nextFollowUp && (
          <span className={`text-xs font-medium ${isOverdue ? "text-red-400" : "text-gray-600"}`}>
            {new Date(lead.nextFollowUp).toLocaleDateString("pt-BR")}
          </span>
        )}
      </div>

      {nextStatus && (
        <button
          onClick={moveNext}
          disabled={loading}
          className="mt-2 w-full text-xs text-violet-500 hover:text-violet-300 hover:bg-violet-500/10 rounded-lg py-1 transition-colors opacity-0 group-hover:opacity-100"
        >
          Mover → {COLUMNS.find(c => c.status === nextStatus)?.label}
        </button>
      )}
    </div>
  );
}

export function KanbanBoard({ leads }: { leads: Lead[] }) {
  const groups = ["Prospecção", "Negociação", "Clientes", "Atenção", "Encerrados"];

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-1 mb-4 flex-wrap">
        {groups.map(group => {
          const count = leads.filter(l => COLUMNS.find(c => c.status === l.status)?.group === group).length;
          return (
            <span key={group} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#1a1a1a] text-gray-500">
              {group} ({count})
            </span>
          );
        })}
      </div>

      <div className="flex gap-3" style={{ minWidth: "max-content" }}>
        {COLUMNS.map((col) => {
          const colLeads = leads.filter(l => l.status === col.status);
          return (
            <div key={col.status} className="w-56 flex-shrink-0">
              {/* Header da coluna */}
              <div className={`bg-[#1a1a1a] rounded-xl border-t-4 ${col.color} border border-[#262626] shadow-sm mb-2`}>
                <div className="px-3 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${col.dot}`} />
                    <span className="text-xs font-semibold text-gray-300">{col.label}</span>
                  </div>
                  <span className="text-xs font-bold bg-[#262626] text-gray-500 rounded-full w-5 h-5 flex items-center justify-center">
                    {colLeads.length}
                  </span>
                </div>
              </div>

              {/* Cards */}
              <div className="space-y-2">
                {colLeads.length === 0 ? (
                  <div className="border-2 border-dashed border-[#262626] rounded-xl h-20 flex items-center justify-center">
                    <span className="text-xs text-gray-600">Vazio</span>
                  </div>
                ) : (
                  colLeads.map(lead => <KanbanCard key={lead.id} lead={lead} />)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
