"use client";

import { useState } from "react";
import { markChargeAsPaidAction, cancelChargeAction } from "./actions";
import { ChargeStatus } from "@prisma/client";

export function ChargeActions({ chargeId, status }: { chargeId: string; status: ChargeStatus }) {
  const [loading, setLoading] = useState(false);

  if (status === "paid" || status === "cancelled" || status === "refunded") {
    return null;
  }

  async function handlePaid() {
    if (!confirm("Marcar cobrança como paga?")) return;
    setLoading(true);
    await markChargeAsPaidAction(chargeId);
    setLoading(false);
  }

  async function handleCancel() {
    if (!confirm("Cancelar esta cobrança?")) return;
    setLoading(true);
    await cancelChargeAction(chargeId);
    setLoading(false);
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handlePaid}
        disabled={loading}
        className="text-xs text-green-600 hover:underline disabled:opacity-50"
      >
        Pago
      </button>
      <button
        onClick={handleCancel}
        disabled={loading}
        className="text-xs text-red-400 hover:underline disabled:opacity-50"
      >
        Cancelar
      </button>
    </div>
  );
}
