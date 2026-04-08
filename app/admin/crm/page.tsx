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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#262626] shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" /></svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Total Pipeline</p>
                <p className="text-2xl font-bold text-white">{leads.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#262626] shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-xs text-emerald-400 font-medium">Clientes Ativos</p>
                <p className="text-2xl font-bold text-emerald-400">{activeClients}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#262626] shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              <div>
                <p className="text-xs text-violet-400 font-medium">Em Onboarding</p>
                <p className="text-2xl font-bold text-violet-400">{onboarding}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#262626] shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${atRisk > 0 ? "bg-red-500/10" : "bg-[#222222]"}`}>
                <svg className={`w-5 h-5 ${atRisk > 0 ? "text-red-400" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
              </div>
              <div>
                <p className="text-xs text-red-400 font-medium">Risco de Churn</p>
                <p className={`text-2xl font-bold ${atRisk > 0 ? "text-red-400" : "text-gray-600"}`}>{atRisk}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros + toggle de view */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <form className="flex gap-2 flex-1 flex-wrap">
            <input
              name="search"
              defaultValue={params.search}
              placeholder="Buscar por nome, empresa..."
              className="flex-1 min-w-40 rounded-xl border border-[#333333] bg-[#1a1a1a] text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <select
              name="status"
              defaultValue={params.status ?? ""}
              className="rounded-xl border border-[#333333] bg-[#1a1a1a] text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
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
            <div className="flex rounded-xl border border-[#262626] overflow-hidden bg-[#1a1a1a]">
              <Link
                href={`/admin/crm?view=kanban${params.search ? `&search=${params.search}` : ""}${params.status ? `&status=${params.status}` : ""}`}
                className={`px-3 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors ${view === "kanban" ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-white"}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                Kanban
              </Link>
              <Link
                href={`/admin/crm?view=list${params.search ? `&search=${params.search}` : ""}${params.status ? `&status=${params.status}` : ""}`}
                className={`px-3 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors ${view === "list" ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-white"}`}
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
                        <span className="font-medium text-gray-100">{lead.name}</span>
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
