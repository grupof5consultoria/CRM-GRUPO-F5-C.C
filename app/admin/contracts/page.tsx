import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableBody, TableRow, TableTh, TableTd, EmptyRow } from "@/components/ui/Table";
import { getContractsList, CONTRACT_STATUS_LABELS, CONTRACT_STATUS_VARIANTS } from "@/services/contracts";

export const metadata = { title: "Contratos | Gestão Interna" };

function computeDates(c: {
  startDate: Date | null;
  endDate: Date | null;
  signedAt: Date | null;
  meses: number | null;
}) {
  const inicio = c.startDate ?? c.signedAt ?? null;
  let fim = c.endDate ?? null;
  if (!fim && inicio && c.meses) {
    fim = new Date(inicio);
    fim.setMonth(fim.getMonth() + c.meses);
  }
  return { inicio, fim };
}

export default async function ContractsPage() {
  const contracts = await getContractsList();

  const activeCount  = contracts.filter(c => c.status === "active").length;
  const pendingCount = contracts.filter(c => c.status === "pending_signature").length;
  const totalValue   = contracts.filter(c => c.status === "active").reduce((s, c) => s + Number(c.value ?? 0), 0);

  return (
    <>
      <Topbar title="Contratos" />
      <main className="flex-1 p-6 space-y-6">

        {/* Métricas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#262626] shadow-sm p-4">
            <p className="text-xs text-emerald-400 font-medium">Ativos</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{activeCount}</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#262626] shadow-sm p-4">
            <p className="text-xs text-amber-400 font-medium">Aguardando Assinatura</p>
            <p className={`text-2xl font-bold mt-1 ${pendingCount > 0 ? "text-amber-400" : "text-gray-600"}`}>{pendingCount}</p>
          </div>
          <div className="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-2xl shadow-md p-4">
            <p className="text-xs text-indigo-100 font-medium">Valor Contratado (Ativos)</p>
            <p className="text-2xl font-bold text-white mt-1">
              R$ {totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Link href="/admin/contracts/new">
            <Button>+ Novo Contrato</Button>
          </Link>
        </div>

        <Table>
          <TableHead>
            <TableRow>
              <TableTh>Cliente</TableTh>
              <TableTh>Plano</TableTh>
              <TableTh>Valor</TableTh>
              <TableTh>Status</TableTh>
              <TableTh>Início</TableTh>
              <TableTh>Fim</TableTh>
              <TableTh>Contrato</TableTh>
              <TableTh></TableTh>
            </TableRow>
          </TableHead>
          <TableBody>
            {contracts.length === 0 ? (
              <EmptyRow cols={8} message="Nenhum contrato criado ainda." />
            ) : (
              contracts.map((c) => {
                const { inicio, fim } = computeDates(c);
                return (
                  <TableRow key={c.id}>
                    <TableTd>
                      <Link href={`/admin/clients/${c.client.id}`} className="font-medium text-white hover:text-violet-400 transition-colors">
                        {c.client.name}
                      </Link>
                    </TableTd>
                    <TableTd>
                      <span className="text-violet-400 font-medium text-sm">{c.plano ?? "—"}</span>
                    </TableTd>
                    <TableTd>
                      {c.value ? (
                        <span className="font-semibold text-white">
                          R$ {Number(c.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      ) : <span className="text-gray-600">—</span>}
                    </TableTd>
                    <TableTd>
                      <Badge variant={CONTRACT_STATUS_VARIANTS[c.status]}>
                        {CONTRACT_STATUS_LABELS[c.status]}
                      </Badge>
                    </TableTd>
                    <TableTd>
                      <span className="text-gray-400 text-sm">
                        {inicio ? new Date(inicio).toLocaleDateString("pt-BR") : <span className="text-gray-600">—</span>}
                      </span>
                    </TableTd>
                    <TableTd>
                      <span className="text-gray-400 text-sm">
                        {fim ? new Date(fim).toLocaleDateString("pt-BR") : <span className="text-gray-600">—</span>}
                      </span>
                    </TableTd>

                    {/* Paperclip PDF */}
                    <TableTd>
                      {c.signedToken ? (
                        <Link href={`/api/contracts/${c.id}/pdf`} target="_blank" title="Ver contrato em PDF">
                          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-violet-400 transition-colors group">
                            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            <span className="hidden sm:inline">PDF</span>
                          </span>
                        </Link>
                      ) : (
                        <span className="text-gray-700">—</span>
                      )}
                    </TableTd>

                    <TableTd>
                      <Link href={`/admin/contracts/${c.id}`} className="text-violet-400 hover:underline text-xs font-medium">
                        Ver
                      </Link>
                    </TableTd>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </main>
    </>
  );
}
