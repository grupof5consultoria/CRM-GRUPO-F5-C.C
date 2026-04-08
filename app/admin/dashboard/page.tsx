import { Topbar } from "@/components/layout/Topbar";
import { StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { TASK_STATUS_VARIANTS } from "@/services/tasks";
import { CHARGE_STATUS_VARIANTS } from "@/services/billing";
import { getSession } from "@/lib/auth";

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
    totalMRR,
  ] = await Promise.all([
    prisma.client.count({ where: { status: "active" } }),
    prisma.lead.count({ where: { status: { notIn: ["closed_won", "closed_lost", "churned"] } } }),
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
    prisma.client.aggregate({
      where: { status: "active", monthlyValue: { not: null } },
      _sum: { monthlyValue: true },
    }),
  ]);

  return {
    activeClients, openLeads, openProposals, pendingContracts,
    overdueCharges, pendingCharges, overdueTasks, waitingClientTasks,
    mrr: Number(totalMRR._sum.monthlyValue ?? 0),
  };
}

export default async function DashboardPage() {
  const [data, session] = await Promise.all([getDashboardData(), getSession()]);
  const firstName = session?.name?.split(" ")[0] ?? "Usuário";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <>
      <Topbar title="Dashboard" />
      <main className="flex-1 p-6 space-y-6">

        {/* Welcome */}
        <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #312e81 0%, #4338ca 50%, #6366f1 100%)" }}>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/5 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-violet-400/10 blur-2xl" />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white">{greeting}, {firstName}!</h2>
            <p className="text-indigo-200/80 text-sm mt-1">Aqui está o resumo da sua operação.</p>
            <div className="flex items-center gap-6 mt-4">
              <div>
                <p className="text-indigo-200/60 text-xs">MRR Ativo</p>
                <p className="text-white text-xl font-bold">R$ {data.mrr.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <p className="text-indigo-200/60 text-xs">Pipeline</p>
                <p className="text-white text-xl font-bold">{data.openLeads} leads</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <p className="text-indigo-200/60 text-xs">Pendências</p>
                <p className="text-white text-xl font-bold">{data.pendingCharges + data.overdueTasks.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/clients?status=active">
            <StatCard title="Clientes Ativos" value={data.activeClients} variant="success"
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" /></svg>} />
          </Link>
          <Link href="/admin/crm">
            <StatCard title="Leads no Pipeline" value={data.openLeads} variant="default"
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" /></svg>} />
          </Link>
          <Link href="/admin/proposals">
            <StatCard title="Propostas Abertas" value={data.openProposals} variant="warning"
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586l5.414 5.414V19a2 2 0 01-2 2z" /></svg>} />
          </Link>
          <Link href="/admin/billing">
            <StatCard title="Cobranças Pendentes" value={data.pendingCharges} variant="danger"
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1" /></svg>} />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tarefas atrasadas */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/50 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Tarefas Atrasadas</h3>
              <Link href="/admin/tasks" className="text-xs text-indigo-500 hover:text-indigo-400 font-medium">Ver todas →</Link>
            </div>
            {data.overdueTasks.length === 0 ? (
              <div className="text-center py-6">
                <span className="text-3xl">🎉</span>
                <p className="text-sm text-gray-400 mt-2">Nenhuma tarefa atrasada!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.overdueTasks.map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-sm p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <div>
                      <Link href={`/admin/tasks/${t.id}`} className="font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">{t.title}</Link>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t.assignee.name}{t.client ? ` · ${t.client.name}` : ""}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-red-500 font-medium">{new Date(t.dueDate!).toLocaleDateString("pt-BR")}</span>
                      <Badge variant={TASK_STATUS_VARIANTS[t.status]}>{t.status === "in_progress" ? "Em andamento" : "Pendente"}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cobranças vencidas */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/50 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Cobranças Vencidas</h3>
              <Link href="/admin/billing" className="text-xs text-indigo-500 hover:text-indigo-400 font-medium">Ver todas →</Link>
            </div>
            {data.overdueCharges.length === 0 ? (
              <div className="text-center py-6">
                <span className="text-3xl">💰</span>
                <p className="text-sm text-gray-400 mt-2">Nenhuma cobrança vencida!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.overdueCharges.map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-sm p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{c.description}</p>
                      <Link href={`/admin/clients/${c.client.id}`} className="text-xs text-gray-500 hover:text-indigo-500">{c.client.name}</Link>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-red-500 font-medium">{new Date(c.dueDate).toLocaleDateString("pt-BR")}</span>
                      <span className="font-bold text-gray-900 dark:text-white">R$ {Number(c.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contratos pendentes */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/50 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Contratos Aguardando</h3>
              <Link href="/admin/contracts" className="text-xs text-indigo-500 hover:text-indigo-400 font-medium">Ver todos →</Link>
            </div>
            {data.pendingContracts === 0 ? (
              <div className="text-center py-6">
                <span className="text-3xl">📋</span>
                <p className="text-sm text-gray-400 mt-2">Nenhum contrato pendente!</p>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{data.pendingContracts}</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">contrato{data.pendingContracts > 1 ? "s" : ""} aguardando assinatura</p>
                  <p className="text-xs text-gray-500">Necessitam ação imediata</p>
                </div>
              </div>
            )}
          </div>

          {/* Aguardando cliente */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/50 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Aguardando Cliente</h3>
              <Link href="/admin/tasks?status=waiting_client" className="text-xs text-indigo-500 hover:text-indigo-400 font-medium">Ver todas →</Link>
            </div>
            {data.waitingClientTasks.length === 0 ? (
              <div className="text-center py-6">
                <span className="text-3xl">⏳</span>
                <p className="text-sm text-gray-400 mt-2">Nada aguardando cliente!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.waitingClientTasks.map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-sm p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <Link href={`/admin/tasks/${t.id}`} className="font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">{t.title}</Link>
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
