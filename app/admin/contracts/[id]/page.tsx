import { notFound } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { getContractById, CONTRACT_STATUS_LABELS, CONTRACT_STATUS_VARIANTS } from "@/services/contracts";
import { CHARGE_STATUS_LABELS, CHARGE_STATUS_VARIANTS } from "@/services/billing";
import { ContractStatusActions } from "./ContractStatusActions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ContractDetailPage({ params }: PageProps) {
  const { id } = await params;
  const contract = await getContractById(id);
  if (!contract) notFound();

  return (
    <>
      <Topbar title="Detalhe do Contrato" />
      <main className="flex-1 p-6">
        <div className="mb-4">
          <Link href="/admin/contracts" className="text-sm text-blue-600 hover:underline">
            ← Voltar aos Contratos
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Cabeçalho */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle>{contract.title}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      Cliente: <Link href={`/admin/clients/${contract.client.id}`} className="text-blue-600 hover:underline">{contract.client.name}</Link>
                    </p>
                    {contract.proposal && (
                      <p className="text-sm text-gray-500">
                        Proposta: <Link href={`/admin/proposals/${contract.proposal.id}`} className="text-blue-600 hover:underline">{contract.proposal.title}</Link>
                      </p>
                    )}
                  </div>
                  <Badge variant={CONTRACT_STATUS_VARIANTS[contract.status]}>
                    {CONTRACT_STATUS_LABELS[contract.status]}
                  </Badge>
                </div>
              </CardHeader>
              {contract.notes && (
                <CardContent>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{contract.notes}</p>
                </CardContent>
              )}
            </Card>

            {/* Cobranças vinculadas */}
            {contract.charges.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Cobranças</CardTitle>
                    <Link href={`/admin/billing?contractId=${contract.id}`} className="text-xs text-blue-600 hover:underline">
                      Ver todas
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {contract.charges.map((charge) => (
                    <div key={charge.id} className="flex items-center justify-between text-sm py-1">
                      <span className="text-gray-700">{charge.description}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">
                          {new Date(charge.dueDate).toLocaleDateString("pt-BR")}
                        </span>
                        <span className="font-medium">
                          R$ {Number(charge.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                        <Badge variant={CHARGE_STATUS_VARIANTS[charge.status]}>
                          {CHARGE_STATUS_LABELS[charge.status]}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Histórico */}
            {contract.events.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Histórico</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {contract.events.map((ev) => (
                    <div key={ev.id} className="flex gap-3 text-sm">
                      <span className="text-gray-400 text-xs mt-0.5 flex-shrink-0 w-36">
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
                <ContractStatusActions contractId={contract.id} currentStatus={contract.status} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Detalhes</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                {contract.value && (
                  <div>
                    <p className="text-gray-500">Valor</p>
                    <p className="text-xl font-bold text-gray-900">
                      R$ {Number(contract.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                )}
                {contract.startDate && (
                  <div>
                    <p className="text-gray-500">Início</p>
                    <p className="font-medium">{new Date(contract.startDate).toLocaleDateString("pt-BR")}</p>
                  </div>
                )}
                {contract.endDate && (
                  <div>
                    <p className="text-gray-500">Término</p>
                    <p className="font-medium">{new Date(contract.endDate).toLocaleDateString("pt-BR")}</p>
                  </div>
                )}
                {contract.signedAt && (
                  <div>
                    <p className="text-gray-500">Assinado em</p>
                    <p className="font-medium text-green-700">{new Date(contract.signedAt).toLocaleDateString("pt-BR")}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500">Criado por</p>
                  <p className="font-medium">{contract.creator.name}</p>
                </div>
                <div className="pt-2">
                  <Link href={`/admin/billing?contractId=${contract.id}`}>
                    <button className="w-full text-center text-sm text-blue-600 hover:underline border border-blue-200 rounded-lg px-3 py-2 hover:bg-blue-50 transition-colors">
                      + Criar Cobrança
                    </button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
