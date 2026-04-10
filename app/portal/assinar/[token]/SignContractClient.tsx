"use client";

import { useState } from "react";
import Link from "next/link";
import { SignatureBlock } from "@/components/contract/SignatureBlock";

interface Props {
  token: string;
  contractText: string;
  nomeContratante: string;
  cpfContratante: string;
}

export function SignContractClient({ token, contractText, nomeContratante, cpfContratante }: Props) {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSign() {
    setError("");

    if (!nome.trim()) { setError("Digite seu nome completo."); return; }
    if (!cpf.trim()) { setError("Digite seu CPF."); return; }

    const normalise = (s: string) => s.replace(/\D/g, "");
    if (normalise(cpf) !== normalise(cpfContratante)) {
      setError("CPF não confere com o registrado no contrato. Verifique e tente novamente.");
      return;
    }

    if (!agreed) { setError("Você precisa confirmar que leu e concorda com os termos."); return; }

    setLoading(true);
    try {
      const res = await fetch(`/api/contratos/assinar/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, cpf }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Erro ao assinar. Tente novamente.");
      } else {
        setDone(true);
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#1a1a1a] rounded-2xl border border-emerald-500/30 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Contrato assinado!</h1>
          <p className="text-sm text-gray-400 mb-1">
            Assinado por <span className="text-white font-medium">{nome}</span>
          </p>
          <p className="text-xs text-gray-600">
            Data e hora: {new Date().toLocaleString("pt-BR")}
          </p>
          <p className="text-xs text-gray-600 mt-4">
            O Grupo F5 foi notificado. Em breve entraremos em contato.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M14 2L5 13.5H11.5L10 22L19 10.5H12.5L14 2Z" fill="white" fillOpacity="0.95" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-white">Grupo F5 — Assinatura de Contrato</h1>
          <p className="text-sm text-gray-500 mt-1">Leia o contrato abaixo com atenção antes de assinar</p>
        </div>

        {/* Contract text */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-[#262626] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#222] flex items-center gap-2">
            <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs font-medium text-gray-400 flex-1">Termos de Contrato de Prestação de Serviços</span>
            <Link href={`/portal/assinar/${token}/pdf`} target="_blank">
              <button className="flex items-center gap-1.5 text-xs bg-[#222] hover:bg-[#2a2a2a] border border-[#333] text-gray-400 hover:text-gray-200 rounded-lg px-3 py-1.5 transition-all">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Ver PDF
              </button>
            </Link>
          </div>
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
              {contractText}
            </pre>
            <SignatureBlock
              nomeContratante={nomeContratante}
              cpfContratante={cpfContratante}
            />
          </div>
        </div>

        {/* Signing form */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-[#262626] p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white">Confirme sua identidade para assinar</h2>

          <div>
            <label className="text-xs font-medium text-gray-400 block mb-1.5">Nome completo *</label>
            <input
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder={`Ex: ${nomeContratante}`}
              className="w-full rounded-xl border border-[#333] bg-[#111] px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-400 block mb-1.5">CPF *</label>
            <input
              value={cpf}
              onChange={e => setCpf(e.target.value)}
              placeholder="000.000.000-00"
              className="w-full rounded-xl border border-[#333] bg-[#111] px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <p className="text-[11px] text-gray-600 mt-1">Deve coincidir com o CPF registrado no contrato.</p>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-0.5 accent-violet-500 w-4 h-4 flex-shrink-0"
            />
            <span className="text-xs text-gray-400 leading-relaxed">
              Li e concordo com todos os termos e cláusulas do contrato acima. Entendo que esta assinatura digital tem validade jurídica conforme a Lei nº 14.063/2020.
            </span>
          </label>

          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={handleSign}
            disabled={loading || !agreed}
            className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl py-3 transition-colors"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            )}
            Assinar Contrato Digitalmente
          </button>

          <p className="text-[10px] text-gray-700 text-center">
            Ao assinar, seu nome, CPF, data/hora e endereço IP serão registrados como prova de assinatura.
          </p>
        </div>
      </div>
    </div>
  );
}
