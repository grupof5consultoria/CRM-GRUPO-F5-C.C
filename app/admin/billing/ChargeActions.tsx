"use client";

import { useState } from "react";
import { markChargeAsPaidAction, markChargeAsOverdueAction, deleteChargeAction } from "./actions";
import { ChargeStatus } from "@prisma/client";

export function ChargeActions({ chargeId, status }: { chargeId: string; status: ChargeStatus }) {
  const [loading, setLoading] = useState(false);

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

  async function handleDelete() {
    if (!confirm("Excluir esta cobrança? Esta ação não pode ser desfeita.")) return;
    setLoading(true);
    await deleteChargeAction(chargeId);
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-1">
      {status === "pending" && (
        <>
          <button onClick={handlePaid} disabled={loading} title="Pagou" className="text-xl hover:scale-110 transition-transform disabled:opacity-50">✅</button>
          <button onClick={handleNotPaid} disabled={loading} title="Não pagou" className="text-xl hover:scale-110 transition-transform disabled:opacity-50">❌</button>
        </>
      )}
      {status === "paid" && <span className="text-emerald-500 text-xl" title="Pago">✅</span>}
      {status === "overdue" && <span className="text-red-400 text-xl" title="Vencido">❌</span>}

      <button
        onClick={handleDelete}
        disabled={loading}
        title="Excluir cobrança"
        className="ml-1 text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}
