import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableBody, TableRow, TableTh, TableTd, EmptyRow } from "@/components/ui/Table";
import { getLeads } from "@/services/leads";
import { LEAD_STATUS_LABELS, LEAD_STATUS_VARIANTS } from "@/utils/status-labels";
import { LeadStatus } from "@prisma/client";
import { KanbanBoard } from "./KanbanBoard";

export const metadata = { title: "CRM | Gestão Interna" };

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "new", label: "🆕 Novo Lead" },
  { value: "contacted", label: "📞 Em Contato" },
  { value: "qualified", label: "✅ Qualificado" },
  { value: "proposal_sent", label: "📄 Proposta Enviada" },
  { value: "negotiation", label: "🤝 Em Negociação" },
  { value: "onboarding", label: "🚀 Onboarding" },
  { value: "active_client", label: "💚 Cliente Ativo" },
  { value: "upsell_opportunity", label: "📈 Upsell" },
  { value: "at_risk_churn", label: "⚠️ Risco de Churn" },
  { value: "closed_won", label: "🏆 Fechado (Ganho)" },
  { value: "closed_lost", label: "❌ Fechado (Perdido)" },
  { value: "churned", label: "💔 Churn" },
];

interface PageProps {
  searchParams: Promise<{ status?: string; search?: string; view?: string }>;
}

export default async function CRMPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const view = params.view === "list" ? "list" : "kanban";

  const leads = await getLeads({
    status: params.status as LeadStatus | undefined,
    search: params.search,
  });

  const activeClients = leads.filter(l => l.status === "active_client").length;
  const atRisk = leads.filter(l => l.status === "at_risk_churn").length;
  const onboarding = leads.filter(l => l.status === "onboarding").length;

  return (
    <>
      <Topbar title="CRM" />
      <main className="flex-1 p-6">

        {/* Métricas rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total no pipeline</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{leads.length}</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950 rounded-2xl border border-emerald-200 dark:border-emerald-800 px-4 py-3 shadow-sm">
            <p className="text-xs text-emerald-600 dark:text-emerald-400">Clientes Ativos</p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{activeClients}</p>
          </div>
          <div className="bg-violet-50 dark:bg-violet-950 rounded-2xl border border-violet-200 dark:border-violet-800 px-4 py-3 shadow-sm">
            <p className="text-xs text-violet-600 dark:text-violet-400">Em Onboarding</p>
            <p className="text-2xl font-bold text-violet-700 dark:text-violet-300">{onboarding}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-950 rounded-2xl border border-red-200 dark:border-red-800 px-4 py-3 shadow-sm">
            <p className="text-xs text-red-600 dark:text-red-400">Risco de Churn</p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-300">{atRisk}</p>
          </div>
        </div>

        {/* Filtros + toggle de view */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <form className="flex gap-2 flex-1 flex-wrap">
            <input
              name="search"
              defaultValue={params.search}
              placeholder="Buscar por nome, empresa..."
              className="flex-1 min-w-40 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              name="status"
              defaultValue={params.status ?? ""}
              className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <input type="hidden" name="view" value={view} />
            <Button type="submit" variant="secondary">Filtrar</Button>
          </form>

          <div className="flex items-center gap-2">
            {/* Toggle view */}
            <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900">
              <Link
                href={`/admin/crm?view=kanban${params.search ? `&search=${params.search}` : ""}${params.status ? `&status=${params.status}` : ""}`}
                className={`px-3 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors ${view === "kanban" ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                Kanban
              </Link>
              <Link
                href={`/admin/crm?view=list${params.search ? `&search=${params.search}` : ""}${params.status ? `&status=${params.status}` : ""}`}
                className={`px-3 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors ${view === "list" ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Lista
              </Link>
            </div>

            <Link href="/admin/crm/new">
              <Button>+ Novo</Button>
            </Link>
          </div>
        </div>

        {/* Conteúdo */}
        {view === "kanban" ? (
          <KanbanBoard leads={leads} />
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableTh>Nome</TableTh>
                  <TableTh>Empresa</TableTh>
                  <TableTh>Contato</TableTh>
                  <TableTh>Status</TableTh>
                  <TableTh>Responsável</TableTh>
                  <TableTh>Follow-up</TableTh>
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
                        <span className="font-medium text-gray-900 dark:text-gray-100">{lead.name}</span>
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
                        <Link href={`/admin/crm/${lead.id}`} className="text-indigo-600 hover:underline text-xs font-medium">
                          Ver detalhes
                        </Link>
                      </TableTd>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <p className="text-xs text-gray-400 mt-3">{leads.length} registro(s)</p>
          </>
        )}
      </main>
    </>
  );
}
