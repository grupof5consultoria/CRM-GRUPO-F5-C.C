"use client";

import { useState } from "react";
import Link from "next/link";
import { updateContractStatusAction, sendForSignatureAction, renewContractAction, requestCancellationAction, finishContractAction } from "../actions";
import { ContractStatus } from "@prisma/client";
import { CONTRACT_STATUS_LABELS } from "@/services/contracts";

// ─── Reason options ───────────────────────────────────────────────────────────

const FINISH_REASONS = [
  { value: "fim_prazo",      label: "Fim do prazo contratual" },
  { value: "servico_entregue", label: "Serviço entregue / concluído" },
  { value: "acordo_mutuo",   label: "Acordo mútuo" },
  { value: "cliente_solicitou", label: "Cliente solicitou encerramento" },
  { value: "nao_renovacao",  label: "Optou por não renovar" },
  { value: "outro",          label: "Outro motivo" },
];

const CANCEL_REASONS = [
  { value: "preco",          label: "Preço / Custo-benefício" },
  { value: "resultado",      label: "Insatisfação com resultados" },
  { value: "concorrente",    label: "Migrou para concorrente" },
  { value: "encerramento",   label: "Encerrou o negócio" },
  { value: "pausa",          label: "Pausa temporária" },
  { value: "atendimento",    label: "Atendimento / Suporte" },
  { value: "escopo",         label: "Não precisava mais do serviço" },
  { value: "inadimplencia",  label: "Inadimplência" },
  { value: "outro",          label: "Outro motivo" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function ContractStatusActions({
  contractId,
  currentStatus,
  signedToken,
  distratoToken,
}: {
  contractId: string;
  currentStatus: ContractStatus;
  signedToken: string;
  distratoToken?: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showRenew, setShowRenew] = useState(false);
  const [renewMonths, setRenewMonths] = useState<3 | 6 | 12>(3);

  // Finish modal
  const [showFinish, setShowFinish] = useState(false);
  const [finishReason, setFinishReason] = useState("");
  const [finishNote, setFinishNote] = useState("");
  const [finishError, setFinishError] = useState("");

  // Cancel modal
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelNote, setCancelNote] = useState("");
  const [cancelError, setCancelError] = useState("");

  const signingUrl = typeof window !== "undefined"
    ? `${window.location.origin}/portal/assinar/${signedToken}`
    : `/portal/assinar/${signedToken}`;

  const distratoUrl = typeof window !== "undefined" && distratoToken
    ? `${window.location.origin}/portal/assinar/distrato/${distratoToken}`
    : distratoToken ? `/portal/assinar/distrato/${distratoToken}` : null;

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

  async function handleRenew() {
    setLoading(true);
    await renewContractAction(contractId, renewMonths);
    setShowRenew(false);
    setLoading(false);
  }

  async function handleFinish() {
    if (!finishReason) { setFinishError("Selecione o motivo"); return; }
    setFinishError("");
    setLoading(true);
    await finishContractAction(contractId, finishReason, finishNote || undefined);
    setShowFinish(false);
    setLoading(false);
  }

  async function handleRequestCancellation() {
    if (!cancelReason) { setCancelError("Selecione o motivo do cancelamento"); return; }
    setCancelError("");
    setLoading(true);
    await requestCancellationAction(contractId, cancelReason, cancelNote || undefined);
    setShowCancelConfirm(false);
    setLoading(false);
  }

  function copyLink(url: string) {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Draft ─────────────────────────────────────────────────────────────────
  if (currentStatus === "draft") {
    return (
      <div className="space-y-2">
        <button
          onClick={handleSend}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl py-2.5 transition-colors"
        >
          {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
          Enviar para Assinatura
        </button>
      </div>
    );
  }

  // ── Pending signature ──────────────────────────────────────────────────────
  if (currentStatus === "pending_signature") {
    return (
      <div className="space-y-3">
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
          <p className="text-xs font-semibold text-amber-400 mb-2">Link de assinatura</p>
          <p className="text-[10px] text-amber-300/70 break-all font-mono mb-2">{signingUrl}</p>
          <button
            onClick={() => copyLink(signingUrl)}
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

  // ── Active ─────────────────────────────────────────────────────────────────
  if (currentStatus === "active") {
    return (
      <div className="space-y-2">
        {!showRenew && !showCancelConfirm && !showFinish && (
          <button
            onClick={() => setShowRenew(true)}
            className="w-full text-xs border border-[#333] hover:border-violet-600 text-gray-500 hover:text-violet-400 rounded-xl py-2 transition-colors"
          >
            Renovar Contrato
          </button>
        )}

        {showRenew && (
          <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-3 space-y-3">
            <p className="text-xs font-semibold text-violet-400">Renovar por quantos meses?</p>
            <div className="flex gap-2">
              {([3, 6, 12] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setRenewMonths(m)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    renewMonths === m
                      ? "bg-violet-600 border-violet-500 text-white"
                      : "border-[#444] text-gray-500 hover:border-violet-600 hover:text-violet-400"
                  }`}
                >
                  +{m}m
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowRenew(false)} className="flex-1 text-xs border border-[#333] text-gray-600 rounded-lg py-1.5 hover:text-gray-400">Cancelar</button>
              <button onClick={handleRenew} disabled={loading} className="flex-1 text-xs bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg py-1.5 disabled:opacity-50">
                {loading ? "..." : "Confirmar"}
              </button>
            </div>
          </div>
        )}

        {/* Finalizar */}
        {!showRenew && !showCancelConfirm && !showFinish && (
          <button
            onClick={() => setShowFinish(true)}
            className="w-full text-xs border border-[#333] hover:border-blue-600 text-gray-500 hover:text-blue-400 rounded-xl py-2 transition-colors"
          >
            Finalizar Contrato
          </button>
        )}

        {showFinish && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 space-y-3">
            <p className="text-xs font-semibold text-blue-400">Motivo da finalização</p>
            <select
              value={finishReason}
              onChange={e => { setFinishReason(e.target.value); setFinishError(""); }}
              className="w-full bg-[#111] border border-[#333] rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="">Selecione...</option>
              {FINISH_REASONS.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <textarea
              value={finishNote}
              onChange={e => setFinishNote(e.target.value)}
              rows={2}
              placeholder="Observações adicionais (opcional)..."
              className="w-full bg-[#111] border border-[#333] rounded-lg px-2.5 py-2 text-white text-xs placeholder-gray-600 resize-none focus:outline-none focus:border-blue-500"
            />
            {finishError && <p className="text-red-400 text-[11px]">{finishError}</p>}
            <div className="flex gap-2">
              <button onClick={() => setShowFinish(false)} className="flex-1 text-xs border border-[#333] text-gray-600 rounded-lg py-1.5 hover:text-gray-400">Voltar</button>
              <button onClick={handleFinish} disabled={loading} className="flex-1 text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg py-1.5 disabled:opacity-50">
                {loading ? "..." : "Finalizar"}
              </button>
            </div>
          </div>
        )}

        {/* Cancelar */}
        {!showRenew && !showCancelConfirm && !showFinish && (
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="w-full text-xs border border-[#333] hover:border-red-600 text-gray-500 hover:text-red-400 rounded-xl py-2 transition-colors"
          >
            Cancelar Contrato
          </button>
        )}

        {showCancelConfirm && <CancelModal
          loading={loading}
          reason={cancelReason}
          note={cancelNote}
          error={cancelError}
          onReasonChange={v => { setCancelReason(v); setCancelError(""); }}
          onNoteChange={setCancelNote}
          onBack={() => setShowCancelConfirm(false)}
          onConfirm={handleRequestCancellation}
        />}
      </div>
    );
  }

  // ── Paused ─────────────────────────────────────────────────────────────────
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
          onClick={() => setShowCancelConfirm(true)}
          className="w-full text-xs border border-[#333] hover:border-red-600 text-gray-500 hover:text-red-400 rounded-xl py-2 transition-colors"
        >
          Cancelar Contrato
        </button>
        {showCancelConfirm && <CancelModal
          loading={loading}
          reason={cancelReason}
          note={cancelNote}
          error={cancelError}
          onReasonChange={v => { setCancelReason(v); setCancelError(""); }}
          onNoteChange={setCancelNote}
          onBack={() => setShowCancelConfirm(false)}
          onConfirm={handleRequestCancellation}
        />}
      </div>
    );
  }

  // ── Pending cancellation ───────────────────────────────────────────────────
  if (currentStatus === "pending_cancellation") {
    return (
      <div className="space-y-3">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
          <p className="text-xs font-semibold text-red-400 mb-1">Distrato aguardando assinatura</p>
          <p className="text-[11px] text-red-300/60 mb-3">O cliente precisa assinar o Termo de Distrato no portal.</p>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 mb-3">
            <p className="text-[10px] text-amber-400 font-medium">Cobranças pendentes canceladas ✓</p>
            <p className="text-[10px] text-amber-300/70">Cliente marcado como inativo ✓</p>
          </div>
          {distratoUrl && (
            <>
              <p className="text-[10px] text-red-300/50 break-all font-mono mb-2">{distratoUrl}</p>
              <button
                onClick={() => copyLink(distratoUrl)}
                className="w-full text-xs bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-lg py-1.5 transition-colors mb-2"
              >
                {copied ? "Copiado!" : "Copiar link do distrato"}
              </button>
              <Link href={`/api/contracts/${contractId}/distrato-pdf`} target="_blank">
                <button className="w-full text-xs border border-[#333] hover:border-[#555] text-gray-500 hover:text-gray-300 rounded-lg py-1.5 transition-colors">
                  Ver Distrato em PDF
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <p className="text-xs text-gray-600 text-center">
      Nenhuma ação disponível para este status.
    </p>
  );
}

// ─── CancelModal sub-component ────────────────────────────────────────────────

function CancelModal({
  loading, reason, note, error,
  onReasonChange, onNoteChange, onBack, onConfirm,
}: {
  loading: boolean;
  reason: string;
  note: string;
  error: string;
  onReasonChange: (v: string) => void;
  onNoteChange: (v: string) => void;
  onBack: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 space-y-3">
      <p className="text-xs font-semibold text-red-400">Cancelar Contrato — Gerar Distrato</p>
      <p className="text-[11px] text-red-300/70 leading-relaxed">
        Irá gerar um Termo de Distrato com multa de 30%. Cobranças pendentes serão canceladas e o cliente será marcado como inativo automaticamente.
      </p>

      <div>
        <p className="text-[11px] text-gray-500 mb-1">Motivo do cancelamento <span className="text-red-400">*</span></p>
        <select
          value={reason}
          onChange={e => onReasonChange(e.target.value)}
          className="w-full bg-[#111] border border-[#333] rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none focus:border-red-500"
        >
          <option value="">Selecione...</option>
          {CANCEL_REASONS.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      <textarea
        value={note}
        onChange={e => onNoteChange(e.target.value)}
        rows={2}
        placeholder="Detalhes adicionais (opcional)..."
        className="w-full bg-[#111] border border-[#333] rounded-lg px-2.5 py-2 text-white text-xs placeholder-gray-600 resize-none focus:outline-none focus:border-red-500"
      />

      {error && <p className="text-red-400 text-[11px]">{error}</p>}

      <div className="flex gap-2">
        <button onClick={onBack} className="flex-1 text-xs border border-[#333] text-gray-600 rounded-lg py-1.5 hover:text-gray-400">
          Voltar
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 text-xs bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg py-1.5 disabled:opacity-50"
        >
          {loading ? "..." : "Gerar Distrato"}
        </button>
      </div>
    </div>
  );
}
