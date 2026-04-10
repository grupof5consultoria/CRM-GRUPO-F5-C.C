import { notFound } from "next/navigation";
import { getContractByToken } from "@/services/contracts";
import { renderContract, ContractVars } from "@/lib/contractTemplate";
import { SignContractClient } from "./SignContractClient";

interface PageProps {
  params: Promise<{ token: string }>;
}

export const metadata = { title: "Assinar Contrato | Grupo F5" };

export default async function SignContractPage({ params }: PageProps) {
  const { token } = await params;
  const contract = await getContractByToken(token);

  if (!contract) notFound();

  if (contract.status === "active" && contract.signedAt) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#1a1a1a] rounded-2xl border border-emerald-500/30 p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-white mb-2">Contrato já assinado</h1>
          <p className="text-sm text-gray-400">
            Este contrato foi assinado em{" "}
            <span className="text-white">{new Date(contract.signedAt).toLocaleString("pt-BR")}</span>.
          </p>
        </div>
      </div>
    );
  }

  if (contract.status !== "pending_signature") {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#1a1a1a] rounded-2xl border border-[#333] p-8 text-center">
          <h1 className="text-lg font-bold text-white mb-2">Link inválido</h1>
          <p className="text-sm text-gray-500">Este contrato não está disponível para assinatura.</p>
        </div>
      </div>
    );
  }

  const vars: ContractVars = {
    plano: contract.plano ?? "START",
    nomeContratante: contract.nomeContratante ?? contract.client.name,
    enderecoContratante: contract.enderecoContratante ?? "",
    cidadeEstadoCep: contract.cidadeEstadoCep ?? "",
    cpfContratante: contract.cpfContratante ?? "",
    meses: contract.meses ?? 3,
    valorMensal: Number(contract.value ?? 0),
    valorMensalExtenso: contract.valorMensalExtenso ?? "",
    diaVencimento: contract.diaVencimento ?? 10,
    publicoAlvo: contract.publicoAlvo ?? "",
  };

  const contractText = renderContract(vars);

  return (
    <SignContractClient
      token={token}
      contractText={contractText}
      nomeContratante={vars.nomeContratante}
      cpfContratante={vars.cpfContratante}
    />
  );
}
