import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableBody, TableRow, TableTh, TableTd, EmptyRow } from "@/components/ui/Table";
import { getProposals, PROPOSAL_STATUS_LABELS, PROPOSAL_STATUS_VARIANTS } from "@/services/proposals";

export const metadata = { title: "Propostas | Gestão Interna" };

export default async function ProposalsPage() {
  const proposals = await getProposals();

  const totalValue = proposals.reduce((s, p) => s + Number(p.totalValue), 0);
  const openCount = proposals.filter(p => p.status === "draft" || p.status === "sent").length;

  return (
    <>
      <Topbar title="Propostas" />
      <main className="flex-1 p-6 space-y-6">

        {/* Métricas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#262626] shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium">Total de Propostas</p>
            <p className="text-2xl font-bold text-white mt-1">{proposals.length}</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#262626] shadow-sm p-4">
            <p className="text-xs text-amber-400 font-medium">Abertas</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{openCount}</p>
          </div>
          <div className="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-2xl shadow-md p-4">
            <p className="text-xs text-indigo-100 font-medium">Valor Total</p>
            <p className="text-2xl font-bold text-white mt-1">
              R$ {totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Link href="/admin/proposals/new">
            <Button>+ Nova Proposta</Button>
          </Link>
        </div>

        <Table>
          <TableHead>
            <TableRow>
              <TableTh>Título</TableTh>
              <TableTh>Lead / Cliente</TableTh>
              <TableTh>Valor</TableTh>
              <TableTh>Status</TableTh>
              <TableTh>Validade</TableTh>
              <TableTh>Criado por</TableTh>
              <TableTh></TableTh>
            </TableRow>
          </TableHead>
          <TableBody>
            {proposals.length === 0 ? (
              <EmptyRow cols={7} message="Nenhuma proposta criada ainda." />
            ) : (
              proposals.map((p) => (
                <TableRow key={p.id}>
                  <TableTd>
                    <span className="font-medium text-white">{p.title}</span>
                  </TableTd>
                  <TableTd>
                    {p.lead ? (
                      <div className="text-sm">
                        <p className="text-gray-100">{p.lead.name}</p>
                        {p.lead.company && <p className="text-gray-400 dark:text-gray-500 text-xs">{p.lead.company}</p>}
                      </div>
                    ) : p.client ? (
                      <span className="text-gray-100">{p.client.name}</span>
                    ) : <span className="text-gray-400">—</span>}
                  </TableTd>
                  <TableTd>
                    <span className="font-semibold text-white">
                      R$ {Number(p.totalValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </TableTd>
                  <TableTd>
                    <Badge variant={PROPOSAL_STATUS_VARIANTS[p.status]}>
                      {PROPOSAL_STATUS_LABELS[p.status]}
                    </Badge>
                  </TableTd>
                  <TableTd>
                    <span className="text-gray-400">
                      {p.validUntil ? new Date(p.validUntil).toLocaleDateString("pt-BR") : "—"}
                    </span>
                  </TableTd>
                  <TableTd><span className="text-gray-400">{p.creator.name}</span></TableTd>
                  <TableTd>
                    <Link href={`/admin/proposals/${p.id}`} className="text-violet-400 hover:underline text-xs font-medium">
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
