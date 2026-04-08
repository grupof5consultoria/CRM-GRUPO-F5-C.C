"use client";

import { useState } from "react";
import { markChargeAsPaidAction, markChargeAsOverdueAction } from "./actions";
import { ChargeStatus } from "@prisma/client";

export function ChargeActions({ chargeId, status }: { chargeId: string; status: ChargeStatus }) {
  const [loading, setLoading] = useState(false);

  if (status === "paid") {
    return <span className="text-emerald-500 text-lg" title="Pago">✅</span>;
  }

  if (status === "overdue") {
    return <span className="text-red-400 text-lg" title="Não pago">❌</span>;
  }

  if (status === "cancelled" || status === "refunded") {
    return null;
  }

  async function handlePaid() {
    setLoading(true);
    await markChargeAsPaidAction(chargeId);
    setLoading(false);
  }

  async function handleNotPaid() {
    setLoading(true);
    await markChargeAsOverdueAction(chargeId);
    setLoading(false);
  }

  return (
    <div className="flex gap-1">
      <button
        onClick={handlePaid}
        disabled={loading}
        title="Pagou ✅"
        className="text-2xl hover:scale-110 transition-transform disabled:opacity-50 leading-none"
      >
        ✅
      </button>
      <button
        onClick={handleNotPaid}
        disabled={loading}
        title="Não pagou ❌"
        className="text-2xl hover:scale-110 transition-transform disabled:opacity-50 leading-none"
      >
        ❌
      </button>
    </div>
  );
}
