import { Topbar } from "@/components/layout/Topbar";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
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
      <main className="flex-1 p-6 space-y-6 bg-[#111111] min-h-screen">

        {/* Cabeçalho de boas-vindas */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{greeting}, {firstName}</h2>
            <p className="text-gray-500 text-sm mt-0.5">Aqui está o resumo da sua operação hoje.</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-600 uppercase tracking-widest font-medium">MRR Ativo</p>
            <p className="text-2xl font-bold text-violet-400">
              R$ {data.mrr.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Clientes Ativos", value: data.activeClients, href: "/admin/clients?status=active" },
            { label: "Leads no Pipeline", value: data.openLeads, href: "/admin/crm" },
            { label: "Propostas Abertas", value: data.openProposals, href: "/admin/proposals" },
            { label: "Cobranças Pendentes", value: data.pendingCharges, href: "/admin/billing" },
          ].map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-5 hover:border-violet-500/40 hover:bg-[#1f1f1f] transition-all group cursor-pointer">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p>
                <p className="text-4xl font-bold text-white mt-2 group-hover:text-violet-400 transition-colors">{stat.value}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Linha divisória sutil */}
        <div className="border-t border-[#262626]" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Tarefas atrasadas */}
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 bg-violet-500 rounded-full" />
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Tarefas Atrasadas</h3>
              </div>
              <Link href="/admin/tasks" className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors">
                Ver todas →
              </Link>
            </div>
            {data.overdueTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-3xl mb-2">🎉</p>
                <p className="text-sm text-gray-600">Nenhuma tarefa atrasada!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.overdueTasks.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-[#171717] border border-[#262626] hover:border-violet-500/20 transition-all">
                    <div className="min-w-0">
                      <Link href={`/admin/tasks/${t.id}`} className="text-sm font-medium text-gray-200 hover:text-violet-400 transition-colors truncate block">
                        {t.title}
                      </Link>
                      <p className="text-xs text-gray-600 mt-0.5">{t.assignee.name}{t.client ? ` · ${t.client.name}` : ""}</p>
                    </div>
                    <span className="text-xs text-red-400 font-medium flex-shrink-0 ml-3">
                      {new Date(t.dueDate!).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cobranças vencidas */}
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 bg-violet-500 rounded-full" />
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Cobranças Vencidas</h3>
              </div>
              <Link href="/admin/billing" className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors">
                Ver todas →
              </Link>
            </div>
            {data.overdueCharges.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-3xl mb-2">💰</p>
                <p className="text-sm text-gray-600">Nenhuma cobrança vencida!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.overdueCharges.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-[#171717] border border-[#262626] hover:border-violet-500/20 transition-all">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">{c.description}</p>
                      <Link href={`/admin/clients/${c.client.id}`} className="text-xs text-gray-600 hover:text-violet-400 transition-colors">
                        {c.client.name}
                      </Link>
                    </div>
                    <div className="flex-shrink-0 ml-3 text-right">
                      <p className="text-xs text-red-400 font-medium">{new Date(c.dueDate).toLocaleDateString("pt-BR")}</p>
                      <p className="text-sm font-bold text-white">R$ {Number(c.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contratos pendentes */}
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 bg-violet-500 rounded-full" />
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Contratos Aguardando</h3>
              </div>
              <Link href="/admin/contracts" className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors">
                Ver todos →
              </Link>
            </div>
            {data.pendingContracts === 0 ? (
              <div className="text-center py-8">
                <p className="text-3xl mb-2">📋</p>
                <p className="text-sm text-gray-600">Nenhum contrato pendente!</p>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-3 rounded-xl bg-[#171717] border border-violet-500/20">
                <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-violet-400">{data.pendingContracts}</span>
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">contrato{data.pendingContracts > 1 ? "s" : ""} aguardando assinatura</p>
                  <p className="text-xs text-gray-600 mt-0.5">Necessitam ação imediata</p>
                </div>
              </div>
            )}
          </div>

          {/* Aguardando cliente */}
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 bg-violet-500 rounded-full" />
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Aguardando Cliente</h3>
              </div>
              <Link href="/admin/tasks?status=waiting_client" className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors">
                Ver todas →
              </Link>
            </div>
            {data.waitingClientTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-3xl mb-2">⏳</p>
                <p className="text-sm text-gray-600">Nada aguardando cliente!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.waitingClientTasks.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-[#171717] border border-[#262626] hover:border-violet-500/20 transition-all">
                    <Link href={`/admin/tasks/${t.id}`} className="text-sm font-medium text-gray-200 hover:text-violet-400 transition-colors truncate">
                      {t.title}
                    </Link>
                    {t.client && <span className="text-xs text-gray-600 flex-shrink-0 ml-3">{t.client.name}</span>}
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
