import { notFound } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { getProposalById, PROPOSAL_STATUS_LABELS, PROPOSAL_STATUS_VARIANTS } from "@/services/proposals";
import { ProposalItemsForm } from "./ProposalItemsForm";
import { ProposalStatusActions } from "./ProposalStatusActions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProposalDetailPage({ params }: PageProps) {
  const { id } = await params;
  const proposal = await getProposalById(id);
  if (!proposal) notFound();

  const publicUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/proposal/${proposal.token}`;

  return (
    <>
      <Topbar title="Detalhe da Proposta" />
      <main className="flex-1 p-6">
        <div className="mb-4">
          <Link href="/admin/proposals" className="text-sm text-blue-600 hover:underline">
            ← Voltar às Propostas
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Cabeçalho */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle>{proposal.title}</CardTitle>
                    {(proposal.lead || proposal.client) && (
                      <p className="text-sm text-gray-500 mt-1">
                        {proposal.lead?.name ?? proposal.client?.name}
                        {proposal.lead?.company && ` — ${proposal.lead.company}`}
                      </p>
                    )}
                  </div>
                  <Badge variant={PROPOSAL_STATUS_VARIANTS[proposal.status]}>
                    {PROPOSAL_STATUS_LABELS[proposal.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {proposal.notes && (
                  <p className="text-sm text-gray-600 mb-4 whitespace-pre-line">{proposal.notes}</p>
                )}
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-xs text-gray-500 flex-1 truncate">Link público:</span>
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline truncate max-w-xs"
                  >
                    {publicUrl}
                  </a>
                  <button
                    onClick={() => navigator.clipboard.writeText(publicUrl)}
                    className="text-xs text-gray-400 hover:text-gray-600 flex-shrink-0"
                  >
                    Copiar
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Itens */}
            <Card>
              <CardHeader><CardTitle>Itens da Proposta</CardTitle></CardHeader>
              <CardContent>
                <ProposalItemsForm proposal={proposal} />
              </CardContent>
            </Card>

            {/* Histórico */}
            {proposal.events.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Histórico</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {proposal.events.map((ev) => (
                    <div key={ev.id} className="flex gap-2 text-sm">
                      <span className="text-gray-400 text-xs mt-0.5 flex-shrink-0">
                        {new Date(ev.createdAt).toLocaleString("pt-BR")}
                      </span>
                      <span className="text-gray-700">{ev.description}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Ações</CardTitle></CardHeader>
              <CardContent>
                <ProposalStatusActions proposalId={proposal.id} currentStatus={proposal.status} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Resumo</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Valor Total</p>
                  <p className="text-xl font-bold text-gray-900">
                    R$ {Number(proposal.totalValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                {proposal.validUntil && (
                  <div>
                    <p className="text-gray-500">Válido até</p>
                    <p className="font-medium">{new Date(proposal.validUntil).toLocaleDateString("pt-BR")}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500">Criado por</p>
                  <p className="font-medium">{proposal.creator.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Criado em</p>
                  <p className="font-medium">{new Date(proposal.createdAt).toLocaleDateString("pt-BR")}</p>
                </div>
                {proposal.acceptedAt && (
                  <div>
                    <p className="text-gray-500">Aceita em</p>
                    <p className="font-medium text-green-700">{new Date(proposal.acceptedAt).toLocaleDateString("pt-BR")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
