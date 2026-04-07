import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableBody, TableRow, TableTh, TableTd, EmptyRow } from "@/components/ui/Table";
import { getLeads, LEAD_STATUS_LABELS, LEAD_STATUS_VARIANTS } from "@/services/leads";
import { LeadStatus } from "@prisma/client";

export const metadata = { title: "CRM | Gestão Interna" };

const STATUS_OPTIONS = [
  { value: "", label: "Todos os status" },
  { value: "new", label: "Novo" },
  { value: "contacted", label: "Contatado" },
  { value: "qualified", label: "Qualificado" },
  { value: "proposal_sent", label: "Proposta Enviada" },
  { value: "negotiation", label: "Em Negociação" },
  { value: "closed_won", label: "Fechado (Ganho)" },
  { value: "closed_lost", label: "Fechado (Perdido)" },
];

interface PageProps {
  searchParams: Promise<{ status?: string; search?: string }>;
}

export default async function CRMPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const leads = await getLeads({
    status: params.status as LeadStatus | undefined,
    search: params.search,
  });

  return (
    <>
      <Topbar title="CRM — Leads" />
      <main className="flex-1 p-6">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form className="flex gap-2 flex-1">
            <input
              name="search"
              defaultValue={params.search}
              placeholder="Buscar por nome, empresa ou email..."
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              name="status"
              defaultValue={params.status ?? ""}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <Button type="submit" variant="secondary">Filtrar</Button>
          </form>
          <Link href="/admin/crm/new">
            <Button>+ Novo Lead</Button>
          </Link>
        </div>

        {/* Tabela */}
        <Table>
          <TableHead>
            <TableRow>
              <TableTh>Nome</TableTh>
              <TableTh>Empresa</TableTh>
              <TableTh>Contato</TableTh>
              <TableTh>Status</TableTh>
              <TableTh>Responsável</TableTh>
              <TableTh>Próximo Follow-up</TableTh>
              <TableTh></TableTh>
            </TableRow>
          </TableHead>
          <TableBody>
            {leads.length === 0 ? (
              <EmptyRow cols={7} message="Nenhum lead encontrado." />
            ) : (
              leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableTd>
                    <span className="font-medium text-gray-900">{lead.name}</span>
                  </TableTd>
                  <TableTd>{lead.company ?? "—"}</TableTd>
                  <TableTd>
                    <div className="text-xs">
                      {lead.email && <div>{lead.email}</div>}
                      {lead.phone && <div className="text-gray-500">{lead.phone}</div>}
                    </div>
                  </TableTd>
                  <TableTd>
                    <Badge variant={LEAD_STATUS_VARIANTS[lead.status]}>
                      {LEAD_STATUS_LABELS[lead.status]}
                    </Badge>
                  </TableTd>
                  <TableTd>{lead.owner.name}</TableTd>
                  <TableTd>
                    {lead.nextFollowUp
                      ? new Date(lead.nextFollowUp).toLocaleDateString("pt-BR")
                      : "—"}
                  </TableTd>
                  <TableTd>
                    <Link
                      href={`/admin/crm/${lead.id}`}
                      className="text-blue-600 hover:underline text-xs font-medium"
                    >
                      Ver detalhes
                    </Link>
                  </TableTd>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <p className="text-xs text-gray-400 mt-3">{leads.length} lead(s) encontrado(s)</p>
      </main>
    </>
  );
}
