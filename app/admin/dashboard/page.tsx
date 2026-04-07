import { Topbar } from "@/components/layout/Topbar";
import { StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { TASK_STATUS_VARIANTS } from "@/services/tasks";
import { CHARGE_STATUS_VARIANTS } from "@/services/billing";

export const metadata = { title: "Dashboard | Gestão Interna" };

async function getDashboardData() {
  const now = new Date();
  const [
    activeClients,
    openLeads,
    openProposals,
    pendingContracts,
    overdueCharges,
    pendingCharges,
    overdueTasks,
    waitingClientTasks,
  ] = await Promise.all([
    prisma.client.count({ where: { status: "active" } }),
    prisma.lead.count({ where: { status: { notIn: ["closed_won", "closed_lost"] } } }),
    prisma.proposal.count({ where: { status: { in: ["draft", "sent"] } } }),
    prisma.contract.count({ where: { status: "pending_signature" } }),
    prisma.charge.findMany({
      where: { status: "pending", dueDate: { lt: now } },
      include: { client: { select: { id: true, name: true } } },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
    prisma.charge.count({ where: { status: "pending" } }),
    prisma.task.findMany({
      where: { status: { in: ["pending", "in_progress"] }, dueDate: { lt: now } },
      include: { assignee: { select: { name: true } }, client: { select: { id: true, name: true } } },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
    prisma.task.findMany({
      where: { status: "waiting_client" },
      include: { client: { select: { id: true, name: true } } },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  return { activeClients, openLeads, openProposals, pendingContracts, overdueCharges, pendingCharges, overdueTasks, waitingClientTasks };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <>
      <Topbar title="Dashboard" />
      <main className="flex-1 p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/clients?status=active">
            <StatCard title="Clientes Ativos" value={data.activeClients} variant="success"
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" /></svg>} />
          </Link>
          <Link href="/admin/crm">
            <StatCard title="Leads em Aberto" value={data.openLeads} variant="default"
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" /></svg>} />
          </Link>
          <Link href="/admin/proposals">
            <StatCard title="Propostas em Aberto" value={data.openProposals} variant="warning"
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586l5.414 5.414V19a2 2 0 01-2 2z" /></svg>} />
          </Link>
          <Link href="/admin/billing">
            <StatCard title="Cobranças Pendentes" value={data.pendingCharges} variant="danger"
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1" /></svg>} />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tarefas atrasadas */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Tarefas Atrasadas</h3>
              <Link href="/admin/tasks" className="text-xs text-blue-600 hover:underline">Ver todas</Link>
            </div>
            {data.overdueTasks.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhuma tarefa atrasada. ✅</p>
            ) : (
              <div className="space-y-3">
                {data.overdueTasks.map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-sm">
                    <div>
                      <Link href={`/admin/tasks/${t.id}`} className="font-medium text-gray-900 hover:text-blue-600">{t.title}</Link>
                      <p className="text-xs text-gray-500">{t.assignee.name}{t.client ? ` · ${t.client.name}` : ""}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-red-600">{new Date(t.dueDate!).toLocaleDateString("pt-BR")}</span>
                      <Badge variant={TASK_STATUS_VARIANTS[t.status]}>{t.status === "in_progress" ? "Em andamento" : "Pendente"}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cobranças vencidas */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Cobranças Vencidas</h3>
              <Link href="/admin/billing" className="text-xs text-blue-600 hover:underline">Ver todas</Link>
            </div>
            {data.overdueCharges.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhuma cobrança vencida. ✅</p>
            ) : (
              <div className="space-y-3">
                {data.overdueCharges.map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{c.description}</p>
                      <Link href={`/admin/clients/${c.client.id}`} className="text-xs text-gray-500 hover:text-blue-600">{c.client.name}</Link>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-red-600">{new Date(c.dueDate).toLocaleDateString("pt-BR")}</span>
                      <span className="font-semibold text-gray-900">R$ {Number(c.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      <Badge variant={CHARGE_STATUS_VARIANTS[c.status]}>Vencida</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contratos pendentes assinatura */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Contratos Aguardando Assinatura</h3>
              <Link href="/admin/contracts" className="text-xs text-blue-600 hover:underline">Ver todos</Link>
            </div>
            {data.pendingContracts === 0 ? (
              <p className="text-sm text-gray-400">Nenhum contrato pendente. ✅</p>
            ) : (
              <p className="text-2xl font-bold text-yellow-600">{data.pendingContracts} contrato(s)</p>
            )}
          </div>

          {/* Tarefas aguardando cliente */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Aguardando Cliente</h3>
              <Link href="/admin/tasks?status=waiting_client" className="text-xs text-blue-600 hover:underline">Ver todas</Link>
            </div>
            {data.waitingClientTasks.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhuma tarefa aguardando. ✅</p>
            ) : (
              <div className="space-y-2">
                {data.waitingClientTasks.map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-sm">
                    <Link href={`/admin/tasks/${t.id}`} className="font-medium text-gray-900 hover:text-blue-600">{t.title}</Link>
                    {t.client && <span className="text-xs text-gray-500">{t.client.name}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
