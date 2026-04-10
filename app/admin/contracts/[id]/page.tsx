import { notFound } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/ui/Badge";
import { getContractById, CONTRACT_STATUS_LABELS, CONTRACT_STATUS_VARIANTS } from "@/services/contracts";
import { renderContract, ContractVars, DEFAULT_SERVICES } from "@/lib/contractTemplate";
import { ContractStatusActions } from "./ContractStatusActions";
import { SignatureBlock } from "@/components/contract/SignatureBlock";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ContractDetailPage({ params }: PageProps) {
  const { id } = await params;
  const contract = await getContractById(id);
  if (!contract) notFound();

  // Build rendered contract if template vars exist
  const hasVars = contract.nomeContratante && contract.cpfContratante && contract.meses;
  let renderedText: string | null = null;
  if (hasVars) {
    const vars: ContractVars = {
      plano: contract.plano ?? "START",
      nomeContratante: contract.nomeContratante!,
      enderecoContratante: contract.enderecoContratante ?? "",
      cidadeEstadoCep: contract.cidadeEstadoCep ?? "",
      cpfContratante: contract.cpfContratante!,
      meses: contract.meses!,
      valorMensal: Number(contract.value ?? 0),
      valorMensalExtenso: contract.valorMensalExtenso ?? "",
      servicos: contract.servicos.length > 0 ? contract.servicos : DEFAULT_SERVICES,
      diaVencimento: contract.diaVencimento ?? 10,
      publicoAlvo: contract.publicoAlvo ?? "",
    };
    renderedText = renderContract(vars);
  }

  return (
    <>
      <Topbar title="Contrato" />
      <main className="flex-1 p-6">
        <div className="mb-5">
          <Link href="/admin/contracts" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            ← Contratos
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Contract text ── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Header */}
            <div className="bg-[#1a1a1a] rounded-2xl border border-[#262626] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-base font-bold text-white">{contract.title}</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Cliente:{" "}
                    <Link href={`/admin/clients/${contract.client.id}`} className="text-violet-400 hover:underline">
                      {contract.client.name}
                    </Link>
                  </p>
                  {contract.nomeContratante && (
                    <p className="text-xs text-gray-600 mt-0.5">CPF: {contract.cpfContratante}</p>
                  )}
                </div>
                <Badge variant={CONTRACT_STATUS_VARIANTS[contract.status]}>
                  {CONTRACT_STATUS_LABELS[contract.status]}
                </Badge>
              </div>

              {/* Signature info */}
              {contract.signedAt && (
                <div className="mt-4 pt-4 border-t border-[#222] bg-emerald-500/5 rounded-xl p-3">
                  <p className="text-xs font-semibold text-emerald-400 mb-1">Assinado digitalmente</p>
                  <p className="text-xs text-gray-400">
                    Por: <span className="text-white">{contract.signedByName}</span> — CPF: {contract.signedByCpf}
                  </p>
                  <p className="text-xs text-gray-600">
                    Em {new Date(contract.signedAt).toLocaleString("pt-BR")} — IP: {contract.signedIp}
                  </p>
                </div>
              )}
            </div>

            {/* Contract text */}
            {renderedText ? (
              <div className="bg-[#111] rounded-2xl border border-[#1e1e1e] overflow-hidden">
                <div className="px-5 py-3 border-b border-[#1e1e1e] flex items-center gap-2">
                  <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-400">Texto do Contrato</span>
                </div>
                <div className="p-6">
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                    {renderedText}
                  </pre>
                  <SignatureBlock
                    nomeContratante={contract.nomeContratante!}
                    cpfContratante={contract.cpfContratante!}
                    signedByName={contract.signedByName}
                    signedByCpf={contract.signedByCpf}
                    signedAt={contract.signedAt}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-[#1a1a1a] rounded-2xl border border-dashed border-[#333] p-8 text-center">
                <p className="text-sm text-gray-600">Este contrato não tem template F5 associado.</p>
                <p className="text-xs text-gray-700 mt-1">Crie um novo contrato para usar o template com assinatura digital.</p>
              </div>
            )}

            {/* History */}
            {contract.events.length > 0 && (
              <div className="bg-[#1a1a1a] rounded-2xl border border-[#262626] overflow-hidden">
                <div className="px-5 py-3 border-b border-[#222]">
                  <p className="text-sm font-semibold text-gray-300">Histórico</p>
                </div>
                <div className="p-4 space-y-2">
                  {contract.events.map((ev) => (
                    <div key={ev.id} className="flex gap-3 text-sm">
                      <span className="text-gray-600 text-xs mt-0.5 flex-shrink-0 w-36">
                        {new Date(ev.createdAt).toLocaleString("pt-BR")}
                      </span>
                      <span className="text-gray-400 text-xs">{ev.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-5">
            {/* Actions */}
            <div className="bg-[#1a1a1a] rounded-2xl border border-[#262626] p-5">
              <p className="text-sm font-semibold text-gray-200 mb-4">Ações</p>
              <ContractStatusActions
                contractId={contract.id}
                currentStatus={contract.status}
                signedToken={contract.signedToken}
              />
            </div>

            {/* Details */}
            <div className="bg-[#1a1a1a] rounded-2xl border border-[#262626] p-5 space-y-4">
              <p className="text-sm font-semibold text-gray-200">Detalhes</p>

              {contract.value && (
                <div>
                  <p className="text-xs text-gray-500">Valor mensal</p>
                  <p className="text-xl font-bold text-white">
                    R$ {Number(contract.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}

              {contract.meses && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Duração</p>
                    <p className="text-sm font-semibold text-white">{contract.meses} meses</p>
                  </div>
                  {contract.diaVencimento && (
                    <div>
                      <p className="text-xs text-gray-500">Vencimento</p>
                      <p className="text-sm font-semibold text-white">Dia {contract.diaVencimento}</p>
                    </div>
                  )}
                </div>
              )}

              {contract.plano && (
                <div>
                  <p className="text-xs text-gray-500">Plano</p>
                  <p className="text-sm font-semibold text-violet-400">{contract.plano}</p>
                </div>
              )}

              {contract.startDate && (
                <div>
                  <p className="text-xs text-gray-500">Início</p>
                  <p className="text-sm font-medium text-white">{new Date(contract.startDate).toLocaleDateString("pt-BR")}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-500">Criado por</p>
                <p className="text-sm text-gray-300">{contract.creator.name}</p>
              </div>
            </div>

            {/* Charges link */}
            <Link href={`/admin/billing?contractId=${contract.id}`}>
              <div className="bg-[#1a1a1a] rounded-2xl border border-dashed border-[#333] hover:border-violet-600/40 p-4 text-center transition-colors cursor-pointer">
                <p className="text-xs text-gray-600 hover:text-violet-400 transition-colors">+ Criar Cobrança</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
