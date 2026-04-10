"use client";

import { useState } from "react";

export function BillingHistoryToggle({
  monthCount,
  totalPaid,
  children,
}: {
  monthCount: number;
  totalPaid: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl text-sm text-gray-500 hover:text-gray-300 hover:border-[#444] transition-all"
      >
        <span className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 transition-transform ${open ? "rotate-90" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Histórico — {monthCount} {monthCount === 1 ? "mês anterior" : "meses anteriores"}
        </span>
        <span className="text-xs text-emerald-500 font-medium">
          R$ {totalPaid.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} recebido
        </span>
      </button>

      {open && <div className="mt-3 space-y-4">{children}</div>}
    </div>
  );
}
