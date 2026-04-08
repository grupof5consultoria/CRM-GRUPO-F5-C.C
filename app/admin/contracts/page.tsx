import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableBody, TableRow, TableTh, TableTd, EmptyRow } from "@/components/ui/Table";
import { getContracts, CONTRACT_STATUS_LABELS, CONTRACT_STATUS_VARIANTS } from "@/services/contracts";

export const metadata = { title: "Contratos | Gestão Interna" };

export default async function ContractsPage() {
  const contracts = await getContracts();

  const activeCount = contracts.filter(c => c.status === "active").length;
  const pendingCount = contracts.filter(c => c.status === "pending_signature").length;
  const totalValue = contracts.filter(c => c.status === "active").reduce((s, c) => s + Number(c.value ?? 0), 0);

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
              <TableTh>Título</TableTh>
              <TableTh>Cliente</TableTh>
              <TableTh>Valor</TableTh>
              <TableTh>Status</TableTh>
              <TableTh>Início</TableTh>
              <TableTh>Fim</TableTh>
              <TableTh>Proposta</TableTh>
              <TableTh></TableTh>
            </TableRow>
          </TableHead>
          <TableBody>
            {contracts.length === 0 ? (
              <EmptyRow cols={8} message="Nenhum contrato criado ainda." />
            ) : (
              contracts.map((c) => (
                <TableRow key={c.id}>
                  <TableTd>
                    <span className="font-medium text-white">{c.title}</span>
                  </TableTd>
                  <TableTd><span className="text-gray-400">{c.client.name}</span></TableTd>
                  <TableTd>
                    {c.value ? (
                      <span className="font-semibold text-white">
                        R$ {Number(c.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    ) : <span className="text-gray-400">—</span>}
                  </TableTd>
                  <TableTd>
                    <Badge variant={CONTRACT_STATUS_VARIANTS[c.status]}>
                      {CONTRACT_STATUS_LABELS[c.status]}
                    </Badge>
                  </TableTd>
                  <TableTd>
                    <span className="text-gray-400">
                      {c.startDate ? new Date(c.startDate).toLocaleDateString("pt-BR") : "—"}
                    </span>
                  </TableTd>
                  <TableTd>
                    <span className="text-gray-400">
                      {c.endDate ? new Date(c.endDate).toLocaleDateString("pt-BR") : "—"}
                    </span>
                  </TableTd>
                  <TableTd>
                    {c.proposal ? (
                      <Link href={`/admin/proposals/${c.proposal.id}`} className="text-violet-400 hover:underline text-xs">
                        Ver proposta
                      </Link>
                    ) : <span className="text-gray-400">—</span>}
                  </TableTd>
                  <TableTd>
                    <Link href={`/admin/contracts/${c.id}`} className="text-violet-400 hover:underline text-xs font-medium">
                      Ver
                    </Link>
                  </TableTd>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </main>
    </>
  );
}
