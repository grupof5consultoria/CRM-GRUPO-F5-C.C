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
          <button
            onClick={handlePaid}
            disabled={loading}
            title="Marcar como pago"
            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-40"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button
            onClick={handleNotPaid}
            disabled={loading}
            title="Marcar como vencido"
            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-40"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </>
      )}
      {status === "paid" && (
        <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400" title="Pago">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
      {status === "overdue" && (
        <span className="p-1.5 rounded-lg bg-red-500/10 text-red-400" title="Vencido">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </span>
      )}

      <button
        onClick={handleDelete}
        disabled={loading}
        title="Excluir cobrança"
        className="p-1.5 rounded-lg text-gray-600 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-40"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}
