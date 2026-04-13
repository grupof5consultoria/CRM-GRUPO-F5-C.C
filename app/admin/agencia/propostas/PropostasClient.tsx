"use client";

import { useTransition } from "react";
import Link from "next/link";
import { PLAN_CONFIG } from "@/lib/agencia-config";
import { updateProposalStatusAction } from "./actions";

type Proposal = {
  id: string; plan: string; status: string; priceImpl: unknown; priceMonthly: unknown;
  discountApplied: boolean; adBudget: unknown; notes: string | null;
  sentAt: Date | null; expiresAt: Date | null; createdAt: Date;
  client: { id: string; name: string };
};

const STATUS_BADGE: Record<string, string> = {
  draft:    "text-gray-400 bg-gray-500/10 border-gray-500/20",
  sent:     "text-amber-400 bg-amber-500/10 border-amber-500/20",
  accepted: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  rejected: "text-red-400 bg-red-500/10 border-red-500/20",
  expired:  "text-gray-600 bg-gray-500/5 border-gray-700",
};
const STATUS_LABEL: Record<string, string> = {
  draft: "Rascunho", sent: "Enviada", accepted: "Aceita", rejected: "Recusada", expired: "Expirada"
};

function ProposalCard({ p }: { p: Proposal }) {
  const [isPending, startTransition] = useTransition();
  const cfg = PLAN_CONFIG[p.plan as "start" | "scale"];

  function updateStatus(status: string) {
    startTransition(() => updateProposalStatusAction(p.id, status));
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-white font-semibold">{p.client.name}</p>
          <p className="text-violet-400 text-sm font-bold">{cfg?.label ?? p.plan.toUpperCase()}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${STATUS_BADGE[p.status]}`}>
            {STATUS_LABEL[p.status]}
          </span>
          <Link
            href={`/api/agencia/proposta/${p.id}`}
            target="_blank"
            className="text-[10px] px-2 py-0.5 rounded border border-violet-500/30 text-violet-400 hover:bg-violet-500/10 transition-colors"
          >
            Ver PDF
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
        <div>
          <p className="text-gray-600 mb-0.5">Implementação</p>
          <p className="text-white font-bold">R$ {Number(p.priceImpl).toLocaleString("pt-BR")}</p>
          {p.discountApplied && <p className="text-emerald-400">-R$ 500 desconto</p>}
        </div>
        <div>
          <p className="text-gray-600 mb-0.5">Mensalidade</p>
          <p className="text-white font-bold">R$ {Number(p.priceMonthly).toLocaleString("pt-BR")}/mês</p>
        </div>
        <div>
          <p className="text-gray-600 mb-0.5">Verba anúncios</p>
          <p className="text-gray-300">{p.adBudget ? `R$ ${Number(p.adBudget).toLocaleString("pt-BR")}/mês` : "—"}</p>
        </div>
      </div>

      {p.notes && <p className="text-xs text-gray-500 mb-4 italic">{p.notes}</p>}

      <div className="flex gap-2 flex-wrap">
        {p.status === "draft" && (
          <button onClick={() => updateStatus("sent")} disabled={isPending} className="text-xs px-3 py-1.5 border border-amber-500/30 text-amber-400 rounded-lg hover:bg-amber-500/10 transition-colors disabled:opacity-50">
            Marcar como Enviada
          </button>
        )}
        {p.status === "sent" && (
          <>
            <button onClick={() => updateStatus("accepted")} disabled={isPending} className="text-xs px-3 py-1.5 border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-500/10 transition-colors disabled:opacity-50">
              ✓ Aceita
            </button>
            <button onClick={() => updateStatus("rejected")} disabled={isPending} className="text-xs px-3 py-1.5 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50">
              ✗ Recusada
            </button>
          </>
        )}
        <p className="text-[10px] text-gray-700 self-center ml-auto">
          {new Date(p.createdAt).toLocaleDateString("pt-BR")}
          {p.expiresAt && p.status === "sent" && ` · expira ${new Date(p.expiresAt).toLocaleDateString("pt-BR")}`}
        </p>
      </div>
    </div>
  );
}

export function PropostasClient({ proposals }: { proposals: Proposal[] }) {
  if (proposals.length === 0) {
    return (
      <div className="text-center py-16 text-gray-600 text-sm">
        Nenhuma proposta criada ainda.<br />
        <span className="text-gray-700">Clique em "+ Nova Proposta" para começar.</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {proposals.map(p => <ProposalCard key={p.id} p={p} />)}
    </div>
  );
}
