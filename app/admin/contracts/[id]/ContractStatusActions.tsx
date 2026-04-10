"use client";

import { useState } from "react";
import { updateContractStatusAction, sendForSignatureAction } from "../actions";
import { Button } from "@/components/ui/Button";
import { ContractStatus } from "@prisma/client";
import { CONTRACT_STATUS_LABELS } from "@/services/contracts";

export function ContractStatusActions({
  contractId,
  currentStatus,
  signedToken,
}: {
  contractId: string;
  currentStatus: ContractStatus;
  signedToken: string;
}) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const signingUrl = typeof window !== "undefined"
    ? `${window.location.origin}/portal/assinar/${signedToken}`
    : `/portal/assinar/${signedToken}`;

  async function handleSend() {
    setLoading(true);
    await sendForSignatureAction(contractId);
    setLoading(false);
  }

  async function handleStatus(status: ContractStatus) {
    setLoading(true);
    await updateContractStatusAction(contractId, status);
    setLoading(false);
  }

  function copyLink() {
    navigator.clipboard.writeText(signingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (currentStatus === "draft") {
    return (
      <div className="space-y-2">
        <button
          onClick={handleSend}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl py-2.5 transition-colors"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
          Enviar para Assinatura
        </button>
      </div>
    );
  }

  if (currentStatus === "pending_signature") {
    return (
      <div className="space-y-3">
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
          <p className="text-xs font-semibold text-amber-400 mb-2">Link de assinatura</p>
          <p className="text-[10px] text-amber-300/70 break-all font-mono mb-2">{signingUrl}</p>
          <button
            onClick={copyLink}
            className="w-full text-xs bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400 rounded-lg py-1.5 transition-colors"
          >
            {copied ? "Copiado!" : "Copiar link"}
          </button>
        </div>
        <button
          onClick={() => handleStatus("draft")}
          disabled={loading}
          className="w-full text-xs text-gray-600 hover:text-gray-400 py-1 transition-colors"
        >
          ← Voltar para Rascunho
        </button>
      </div>
    );
  }

  if (currentStatus === "active") {
    return (
      <div className="space-y-2">
        <button
          onClick={() => handleStatus("paused")}
          disabled={loading}
          className="w-full text-xs border border-[#333] hover:border-amber-600 text-gray-500 hover:text-amber-400 rounded-xl py-2 transition-colors"
        >
          Pausar Contrato
        </button>
        <button
          onClick={() => handleStatus("finished")}
          disabled={loading}
          className="w-full text-xs border border-[#333] hover:border-blue-600 text-gray-500 hover:text-blue-400 rounded-xl py-2 transition-colors"
        >
          Finalizar Contrato
        </button>
        <button
          onClick={() => handleStatus("cancelled")}
          disabled={loading}
          className="w-full text-xs border border-[#333] hover:border-red-600 text-gray-500 hover:text-red-400 rounded-xl py-2 transition-colors"
        >
          Cancelar Contrato
        </button>
      </div>
    );
  }

  if (currentStatus === "paused") {
    return (
      <div className="space-y-2">
        <button
          onClick={() => handleStatus("active")}
          disabled={loading}
          className="w-full text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white rounded-xl py-2.5 transition-colors"
        >
          Reativar Contrato
        </button>
        <button
          onClick={() => handleStatus("cancelled")}
          disabled={loading}
          className="w-full text-xs border border-[#333] hover:border-red-600 text-gray-500 hover:text-red-400 rounded-xl py-2 transition-colors"
        >
          Cancelar Contrato
        </button>
      </div>
    );
  }

  return (
    <p className="text-xs text-gray-600 text-center">
      Nenhuma ação disponível para este status.
    </p>
  );
}
