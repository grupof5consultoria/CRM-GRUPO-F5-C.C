"use client";

import { useState } from "react";
import { changeProposalStatusAction } from "../actions";
import { Button } from "@/components/ui/Button";
import { ProposalStatus } from "@prisma/client";
import { PROPOSAL_STATUS_LABELS } from "@/services/proposals";

export function ProposalStatusActions({
  proposalId,
  currentStatus,
}: {
  proposalId: string;
  currentStatus: ProposalStatus;
}) {
  const [loading, setLoading] = useState(false);

  async function change(status: ProposalStatus) {
    setLoading(true);
    await changeProposalStatusAction(proposalId, status);
    setLoading(false);
  }

  return (
    <div className="space-y-2 text-sm">
      <p className="text-gray-500 text-xs mb-3">
        Status atual: <strong>{PROPOSAL_STATUS_LABELS[currentStatus]}</strong>
      </p>

      {currentStatus === "draft" && (
        <Button className="w-full" onClick={() => change("sent")} loading={loading}>
          Marcar como Enviada
        </Button>
      )}
      {currentStatus === "sent" && (
        <>
          <Button className="w-full" variant="secondary" onClick={() => change("draft")} loading={loading}>
            Voltar para Rascunho
          </Button>
          <Button className="w-full" variant="danger" onClick={() => change("rejected")} loading={loading}>
            Marcar como Recusada
          </Button>
          <Button className="w-full" onClick={() => change("expired")} loading={loading} variant="ghost">
            Marcar como Expirada
          </Button>
        </>
      )}
      {(currentStatus === "accepted" || currentStatus === "rejected" || currentStatus === "expired") && (
        <p className="text-xs text-gray-400 text-center">Proposta finalizada.</p>
      )}
    </div>
  );
}
