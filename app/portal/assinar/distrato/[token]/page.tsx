import { notFound } from "next/navigation";
import { getContractByDistratoToken } from "@/services/contracts";
import { renderDistrato, DistratoVars } from "@/lib/contractTemplate";
import { SignDistratoClient } from "./SignDistratoClient";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function SignDistratoPage({ params }: PageProps) {
  const { token } = await params;

  const contract = await getContractByDistratoToken(token);

  if (!contract || !contract.nomeContratante) notFound();

  if (contract.status === "cancelled" && contract.distratoSignedAt) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#1a1a1a] rounded-2xl border border-emerald-500/30 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Distrato já assinado</h1>
          <p className="text-xs text-gray-600 mt-2">
            Assinado em {new Date(contract.distratoSignedAt).toLocaleString("pt-BR")}
          </p>
        </div>
      </div>
    );
  }

  if (contract.status !== "pending_cancellation") {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#1a1a1a] rounded-2xl border border-[#262626] p-8 text-center">
          <p className="text-gray-500 text-sm">Este distrato não está disponível para assinatura.</p>
        </div>
      </div>
    );
  }

  const signedDate = contract.signedAt ?? contract.createdAt;
  const now = new Date();

  const mesesDecorridos = Math.max(0, Math.round(
    (now.getTime() - signedDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  ));
  const mesesTotal = contract.meses ?? 3;
  const mesesRestantes = Math.max(0, mesesTotal - mesesDecorridos);
  const valorMensal = Number(contract.value ?? 0);
  const valorMulta = valorMensal * mesesRestantes * 0.3;

  const vars: DistratoVars = {
    nomeContratante: contract.nomeContratante,
    cpfContratante: contract.cpfContratante ?? "",
    plano: contract.plano ?? "START",
    valorMensal,
    mesesTotal,
    mesesDecorridos,
    mesesRestantes,
    valorMulta,
    dataAssinatura: signedDate.toLocaleDateString("pt-BR"),
    dataDistrato: now.toLocaleDateString("pt-BR"),
  };

  const distratoText = renderDistrato(vars);

  return (
    <SignDistratoClient
      token={token}
      distratoText={distratoText}
      nomeContratante={vars.nomeContratante}
      cpfContratante={vars.cpfContratante}
      valorMulta={vars.valorMulta}
    />
  );
}
