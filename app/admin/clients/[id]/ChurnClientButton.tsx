"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { churnClientAction } from "../actions";

const CHURN_REASONS = [
  { value: "preco",         label: "Preço / Custo-benefício" },
  { value: "resultado",     label: "Insatisfação com resultados" },
  { value: "concorrente",   label: "Migrou para concorrente" },
  { value: "encerramento",  label: "Encerrou o negócio" },
  { value: "pausa",         label: "Pausa temporária" },
  { value: "atendimento",   label: "Atendimento / Suporte" },
  { value: "escopo",        label: "Não precisava mais do serviço" },
  { value: "outro",         label: "Outro motivo" },
];

export function ChurnClientButton({ clientId, clientName }: { clientId: string; clientName: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleConfirm() {
    if (!reason) { setError("Selecione o motivo da saída"); return; }
    setError("");
    startTransition(async () => {
      const res = await churnClientAction(clientId, reason, note);
      if (res.error) { setError(res.error); return; }
      setOpen(false);
      router.push("/admin/clients");
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 transition-all"
      >
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Encerrar Cliente
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-bold text-base">Encerrar Cliente</h3>
                <p className="text-gray-500 text-sm">{clientName}</p>
              </div>
            </div>

            <p className="text-gray-400 text-sm mb-5">
              O cliente será marcado como <span className="text-red-400 font-medium">inativo</span> e o motivo ficará registrado no histórico. Esta ação pode ser revertida editando o status do cliente.
            </p>

            {/* Motivo */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Motivo da saída <span className="text-red-400">*</span>
              </label>
              <select
                value={reason}
                onChange={e => { setReason(e.target.value); setError(""); }}
                className="w-full bg-[#111] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
              >
                <option value="">Selecione...</option>
                {CHURN_REASONS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* Detalhes */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Detalhes adicionais
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={3}
                placeholder="Ex: Cliente alegou que encontrou serviço mais barato no mercado, manteve boa relação..."
                className="w-full bg-[#111] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 resize-none focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm mb-4">{error}</p>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#2e2e2e] text-gray-400 text-sm font-medium hover:border-[#3e3e3e] hover:text-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "Encerrando..." : "Confirmar Encerramento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
