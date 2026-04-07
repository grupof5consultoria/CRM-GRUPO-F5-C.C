import { notFound } from "next/navigation";
import { getProposalByToken } from "@/services/proposals";
import { AcceptProposalButton } from "./AcceptProposalButton";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function PublicProposalPage({ params }: PageProps) {
  const { token } = await params;
  const proposal = await getProposalByToken(token);

  if (!proposal) notFound();

  const recipient = proposal.lead ?? proposal.client;
  const isExpired = proposal.validUntil && new Date(proposal.validUntil) < new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-3xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Sua Empresa</p>
              <p className="text-xs text-gray-500">Proposta Comercial</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Data de emissão</p>
            <p className="text-sm font-medium text-gray-700">
              {new Date(proposal.createdAt).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        {/* Título */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900">{proposal.title}</h1>
          {recipient && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">Preparado para</p>
              <p className="font-semibold text-gray-800 mt-0.5">{recipient.name}</p>
              {"company" in recipient && typeof (recipient as { company?: unknown }).company === "string" && (recipient as { company: string }).company && (
                <p className="text-sm text-gray-500">{(recipient as { company: string }).company}</p>
              )}
              {typeof recipient.email === "string" && recipient.email && (
                <p className="text-sm text-gray-500">{recipient.email}</p>
              )}
            </div>
          )}
        </div>

        {/* Escopo / Observações */}
        {proposal.notes && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Escopo do Projeto</h2>
            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{proposal.notes}</p>
          </div>
        )}

        {/* Itens */}
        {proposal.items.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Investimento</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-8 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Descrição</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Qtd</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Unit.</th>
                  <th className="px-8 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {proposal.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-8 py-4 text-gray-800">{item.description}</td>
                    <td className="px-4 py-4 text-center text-gray-600">{Number(item.quantity)}</td>
                    <td className="px-4 py-4 text-right text-gray-600">
                      R$ {Number(item.unitValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-8 py-4 text-right font-medium text-gray-900">
                      R$ {Number(item.totalValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                <tr>
                  <td colSpan={3} className="px-8 py-4 text-sm font-semibold text-gray-700 text-right">
                    Total do Investimento
                  </td>
                  <td className="px-8 py-4 text-right text-lg font-bold text-blue-600">
                    R$ {Number(proposal.totalValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Validade */}
        {proposal.validUntil && (
          <div className={`rounded-xl border p-5 text-sm ${isExpired ? "bg-red-50 border-red-200 text-red-700" : "bg-blue-50 border-blue-200 text-blue-700"}`}>
            {isExpired
              ? `⚠️ Esta proposta expirou em ${new Date(proposal.validUntil).toLocaleDateString("pt-BR")}.`
              : `✅ Proposta válida até ${new Date(proposal.validUntil).toLocaleDateString("pt-BR")}.`}
          </div>
        )}

        {/* Aceite */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          {proposal.status === "accepted" ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-lg font-semibold text-green-700">Proposta Aceita</p>
              {proposal.acceptedAt && (
                <p className="text-sm text-gray-500 mt-1">
                  Aceita em {new Date(proposal.acceptedAt).toLocaleDateString("pt-BR")}
                  {proposal.acceptedBy && ` por ${proposal.acceptedBy}`}
                </p>
              )}
            </div>
          ) : proposal.status === "sent" && !isExpired ? (
            <div className="text-center">
              <h2 className="text-base font-semibold text-gray-900 mb-2">Aceitar Proposta</h2>
              <p className="text-sm text-gray-500 mb-6">
                Ao aceitar, você confirma o interesse nos serviços descritos acima.
              </p>
              <AcceptProposalButton token={token} />
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center">
              Esta proposta não está disponível para aceite.
            </p>
          )}
        </div>
      </main>

      <footer className="max-w-3xl mx-auto px-6 pb-10 text-center text-xs text-gray-400">
        Proposta gerada pelo Sistema de Gestão Interna
      </footer>
    </div>
  );
}
