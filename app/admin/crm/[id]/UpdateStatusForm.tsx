"use client";

import { useState } from "react";
import { updateLeadStatusAction } from "../actions";
import { Button } from "@/components/ui/Button";
import { LeadStatus } from "@prisma/client";
import { LEAD_STATUS_LABELS, LEAD_STATUS_VARIANTS } from "@/utils/status-labels";
import { Badge } from "@/components/ui/Badge";

const PIPELINE: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "proposal_sent",
  "negotiation",
  "closed_won",
  "closed_lost",
  "onboarding",
  "active_client",
  "upsell_opportunity",
  "at_risk_churn",
  "churned",
];

export function UpdateStatusForm({
  leadId,
  currentStatus,
}: {
  leadId: string;
  currentStatus: LeadStatus;
}) {
  const [loading, setLoading] = useState(false);
  const [showLostReason, setShowLostReason] = useState(false);
  const [lostReason, setLostReason] = useState("");

  async function handleChange(status: LeadStatus) {
    if (status === "closed_lost") {
      setShowLostReason(true);
      return;
    }
    setLoading(true);
    await updateLeadStatusAction(leadId, status);
    setLoading(false);
  }

  async function handleLost() {
    setLoading(true);
    await updateLeadStatusAction(leadId, "closed_lost", lostReason);
    setLoading(false);
    setShowLostReason(false);
  }

  return (
    <div className="space-y-2">
      {PIPELINE.map((status) => (
        <button
          key={status}
          onClick={() => handleChange(status)}
          disabled={loading || status === currentStatus}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
            status === currentStatus
              ? "bg-blue-50 border border-blue-200 font-semibold cursor-default"
              : "hover:bg-gray-50 border border-transparent"
          }`}
        >
          <Badge variant={LEAD_STATUS_VARIANTS[status]}>
            {LEAD_STATUS_LABELS[status]}
          </Badge>
          {status === currentStatus && (
            <span className="ml-2 text-xs text-blue-600">atual</span>
          )}
        </button>
      ))}

      {showLostReason && (
        <div className="mt-3 space-y-2 border-t pt-3">
          <p className="text-xs font-medium text-gray-700">Motivo da perda:</p>
          <input
            type="text"
            value={lostReason}
            onChange={(e) => setLostReason(e.target.value)}
            placeholder="Ex: Preço, concorrência, prazo..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <Button size="sm" variant="danger" onClick={handleLost} loading={loading}>
              Confirmar Perda
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowLostReason(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
