import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableBody, TableRow, TableTh, TableTd, EmptyRow } from "@/components/ui/Table";
import { getProposals, PROPOSAL_STATUS_LABELS, PROPOSAL_STATUS_VARIANTS } from "@/services/proposals";

export const metadata = { title: "Propostas | Gestão Interna" };

export default async function ProposalsPage() {
  const proposals = await getProposals();

  return (
    <>
      <Topbar title="Propostas" />
      <main className="flex-1 p-6">
        <div className="flex justify-end mb-6">
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
                    <span className="font-medium text-gray-900">{p.title}</span>
                  </TableTd>
                  <TableTd>
                    {p.lead ? (
                      <div className="text-sm">
                        <p>{p.lead.name}</p>
                        {p.lead.company && <p className="text-gray-400 text-xs">{p.lead.company}</p>}
                      </div>
                    ) : p.client ? (
                      <span>{p.client.name}</span>
                    ) : "—"}
                  </TableTd>
                  <TableTd>
                    R$ {Number(p.totalValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </TableTd>
                  <TableTd>
                    <Badge variant={PROPOSAL_STATUS_VARIANTS[p.status]}>
                      {PROPOSAL_STATUS_LABELS[p.status]}
                    </Badge>
                  </TableTd>
                  <TableTd>
                    {p.validUntil ? new Date(p.validUntil).toLocaleDateString("pt-BR") : "—"}
                  </TableTd>
                  <TableTd>{p.creator.name}</TableTd>
                  <TableTd>
                    <Link href={`/admin/proposals/${p.id}`} className="text-blue-600 hover:underline text-xs font-medium">
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
