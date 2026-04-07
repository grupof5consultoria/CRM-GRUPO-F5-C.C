import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableBody, TableRow, TableTh, TableTd, EmptyRow } from "@/components/ui/Table";
import { getContracts, CONTRACT_STATUS_LABELS, CONTRACT_STATUS_VARIANTS } from "@/services/contracts";

export const metadata = { title: "Contratos | Gestão Interna" };

export default async function ContractsPage() {
  const contracts = await getContracts();

  return (
    <>
      <Topbar title="Contratos" />
      <main className="flex-1 p-6">
        <div className="flex justify-end mb-6">
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
                    <span className="font-medium text-gray-900">{c.title}</span>
                  </TableTd>
                  <TableTd>{c.client.name}</TableTd>
                  <TableTd>
                    {c.value
                      ? `R$ ${Number(c.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                      : "—"}
                  </TableTd>
                  <TableTd>
                    <Badge variant={CONTRACT_STATUS_VARIANTS[c.status]}>
                      {CONTRACT_STATUS_LABELS[c.status]}
                    </Badge>
                  </TableTd>
                  <TableTd>
                    {c.startDate ? new Date(c.startDate).toLocaleDateString("pt-BR") : "—"}
                  </TableTd>
                  <TableTd>
                    {c.endDate ? new Date(c.endDate).toLocaleDateString("pt-BR") : "—"}
                  </TableTd>
                  <TableTd>
                    {c.proposal ? (
                      <Link href={`/admin/proposals/${c.proposal.id}`} className="text-blue-600 hover:underline text-xs">
                        Ver proposta
                      </Link>
                    ) : "—"}
                  </TableTd>
                  <TableTd>
                    <Link href={`/admin/contracts/${c.id}`} className="text-blue-600 hover:underline text-xs font-medium">
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
