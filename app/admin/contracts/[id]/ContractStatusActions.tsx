"use client";

import { useState } from "react";
import { updateContractStatusAction } from "../actions";
import { Button } from "@/components/ui/Button";
import { ContractStatus } from "@prisma/client";
import { CONTRACT_STATUS_LABELS } from "@/services/contracts";

const TRANSITIONS: Record<ContractStatus, { status: ContractStatus; label: string; variant: "primary" | "secondary" | "danger" | "ghost" }[]> = {
  draft: [
    { status: "pending_signature", label: "Enviar para Assinatura", variant: "primary" },
  ],
  pending_signature: [
    { status: "active", label: "Marcar como Assinado / Ativo", variant: "primary" },
    { status: "draft", label: "Voltar para Rascunho", variant: "ghost" },
  ],
  active: [
    { status: "paused", label: "Pausar Contrato", variant: "secondary" },
    { status: "finished", label: "Finalizar Contrato", variant: "secondary" },
    { status: "cancelled", label: "Cancelar Contrato", variant: "danger" },
  ],
  paused: [
    { status: "active", label: "Reativar Contrato", variant: "primary" },
    { status: "cancelled", label: "Cancelar Contrato", variant: "danger" },
  ],
  cancelled: [],
  finished: [],
};

export function ContractStatusActions({
  contractId,
  currentStatus,
}: {
  contractId: string;
  currentStatus: ContractStatus;
}) {
  const [loading, setLoading] = useState(false);

  const actions = TRANSITIONS[currentStatus];

  async function handleAction(status: ContractStatus) {
    setLoading(true);
    await updateContractStatusAction(contractId, status);
    setLoading(false);
  }

  if (actions.length === 0) {
    return (
      <p className="text-xs text-gray-400 text-center">
        Contrato {CONTRACT_STATUS_LABELS[currentStatus].toLowerCase()}. Nenhuma ação disponível.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 mb-3">
        Status atual: <strong>{CONTRACT_STATUS_LABELS[currentStatus]}</strong>
      </p>
      {actions.map((action) => (
        <Button
          key={action.status}
          variant={action.variant}
          className="w-full"
          loading={loading}
          onClick={() => handleAction(action.status)}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}
