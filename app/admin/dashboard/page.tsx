import { Topbar } from "@/components/layout/Topbar";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";

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

// ─── Ícones inline ───────────────────────────────────────────────────────────

function IconUsers() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function IconTarget() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}
function IconDoc() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
function IconBilling() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function IconTrend() {
  return (
    <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}

// ─── Componente de stat card ──────────────────────────────────────────────────

type StatCardProps = {
  label: string;
  value: number;
  href: string;
  icon: React.ReactNode;
  gradient: string;
  iconBg: string;
  textColor: string;
  shimmer: string;
};

function StatCard({ label, value, href, icon, gradient, iconBg, textColor, shimmer }: StatCardProps) {
  return (
    <Link href={href}>
      <div
        className="relative rounded-2xl p-5 overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
        style={{ background: gradient }}
      >
        {/* Shine diagonal */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.03) 40%, transparent 60%)" }}
        />
        {/* Linha topo */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)" }}
        />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className={`text-xs font-medium uppercase tracking-wider mb-2 ${textColor} opacity-80`}>{label}</p>
            <p className="text-4xl font-bold text-white drop-shadow-sm">{value}</p>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg} ${textColor}`}>
            {icon}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Componente de painel ─────────────────────────────────────────────────────

type PanelProps = {
  title: string;
  href: string;
  hrefLabel: string;
  accentColor: string;
  accentHover: string;
  empty: boolean;
  emptyIcon: React.ReactNode;
  emptyText: string;
  children: React.ReactNode;
};

function Panel({ title, href, hrefLabel, accentColor, accentHover, empty, emptyIcon, emptyText, children }: PanelProps) {
  return (
    <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className={`w-1.5 h-5 rounded-full ${accentColor}`} />
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">{title}</h3>
        </div>
        <Link href={href} className={`text-xs font-medium transition-colors ${accentHover}`}>
          {hrefLabel} →
        </Link>
      </div>
      {empty ? (
        <div className="text-center py-8">
          <div className="flex justify-center mb-2">{emptyIcon}</div>
          <p className="text-sm text-gray-600">{emptyText}</p>
        </div>
      ) : children}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const [data, session] = await Promise.all([getDashboardData(), getSession()]);
  const firstName = session?.name?.split(" ")[0] ?? "Usuário";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <>
      <Topbar title="Dashboard" />
      <main className="relative flex-1 p-6 space-y-6 bg-[#111111] min-h-screen">
        <AnimatedBackground />

        <div className="relative z-10 space-y-6">

          {/* Cabeçalho */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">{greeting}, {firstName}</h2>
              <p className="text-gray-500 text-sm mt-0.5">Aqui está o resumo da sua operação hoje.</p>
            </div>
            {/* MRR Card */}
            <div
              className="hidden sm:flex flex-col items-end justify-center px-5 py-3 rounded-2xl border border-violet-500/20"
              style={{ background: "linear-gradient(135deg, rgba(109,40,217,0.18) 0%, rgba(124,58,237,0.08) 100%)" }}
            >
              <p className="text-[10px] text-violet-400/70 uppercase tracking-widest font-semibold mb-0.5">MRR Ativo</p>
              <p className="text-2xl font-bold text-violet-300">
                R$ {data.mrr.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Stat Cards — cada um com sua própria cor */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Clientes Ativos"
              value={data.activeClients}
              href="/admin/clients?status=active"
              icon={<IconUsers />}
              gradient="linear-gradient(135deg, #064e3b 0%, #059669 80%, #10b981 100%)"
              iconBg="bg-emerald-500/20"
              textColor="text-emerald-200"
              shimmer=""
            />
            <StatCard
              label="Leads no Pipeline"
              value={data.openLeads}
              href="/admin/crm"
              icon={<IconTarget />}
              gradient="linear-gradient(135deg, #1e3a8a 0%, #2563eb 80%, #3b82f6 100%)"
              iconBg="bg-blue-500/20"
              textColor="text-blue-200"
              shimmer=""
            />
            <StatCard
              label="Propostas Abertas"
              value={data.openProposals}
              href="/admin/proposals"
              icon={<IconDoc />}
              gradient="linear-gradient(135deg, #78350f 0%, #d97706 80%, #f59e0b 100%)"
              iconBg="bg-amber-500/20"
              textColor="text-amber-200"
              shimmer=""
            />
            <StatCard
              label="Cobranças Pendentes"
              value={data.pendingCharges}
              href="/admin/billing"
              icon={<IconBilling />}
              gradient="linear-gradient(135deg, #7f1d1d 0%, #dc2626 80%, #ef4444 100%)"
              iconBg="bg-red-500/20"
              textColor="text-red-200"
              shimmer=""
            />
          </div>

          {/* Divisor */}
          <div className="border-t border-[#262626]" />

          {/* Painéis de alertas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Tarefas Atrasadas — vermelho */}
            <Panel
              title="Tarefas Atrasadas"
              href="/admin/tasks"
              hrefLabel="Ver todas"
              accentColor="bg-red-500"
              accentHover="text-red-400 hover:text-red-300"
              empty={data.overdueTasks.length === 0}
              emptyIcon={<IconCheck />}
              emptyText="Nenhuma tarefa atrasada"
            >
              <div className="space-y-2">
                {data.overdueTasks.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-[#171717] border border-[#262626] hover:border-red-500/20 transition-all group">
                    <div className="min-w-0">
                      <Link href={`/admin/tasks/${t.id}`} className="text-sm font-medium text-gray-200 group-hover:text-red-400 transition-colors truncate block">
                        {t.title}
                      </Link>
                      <p className="text-xs text-gray-600 mt-0.5">{t.assignee.name}{t.client ? ` · ${t.client.name}` : ""}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-3 text-red-400">
                      <IconClock />
                      <span className="text-xs font-medium">{new Date(t.dueDate!).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Cobranças Vencidas — laranja */}
            <Panel
              title="Cobranças Vencidas"
              href="/admin/billing"
              hrefLabel="Ver todas"
              accentColor="bg-orange-500"
              accentHover="text-orange-400 hover:text-orange-300"
              empty={data.overdueCharges.length === 0}
              emptyIcon={<IconTrend />}
              emptyText="Nenhuma cobrança vencida"
            >
              <div className="space-y-2">
                {data.overdueCharges.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-[#171717] border border-[#262626] hover:border-orange-500/20 transition-all">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">{c.description}</p>
                      <Link href={`/admin/clients/${c.client.id}`} className="text-xs text-gray-600 hover:text-orange-400 transition-colors">
                        {c.client.name}
                      </Link>
                    </div>
                    <div className="flex-shrink-0 ml-3 text-right">
                      <p className="text-xs text-orange-400 font-medium">{new Date(c.dueDate).toLocaleDateString("pt-BR")}</p>
                      <p className="text-sm font-bold text-white">R$ {Number(c.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Contratos Pendentes — azul */}
            <Panel
              title="Contratos Aguardando"
              href="/admin/contracts"
              hrefLabel="Ver todos"
              accentColor="bg-blue-500"
              accentHover="text-blue-400 hover:text-blue-300"
              empty={data.pendingContracts === 0}
              emptyIcon={
                <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              }
              emptyText="Nenhum contrato pendente"
            >
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[#171717] border border-blue-500/20">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-blue-400">{data.pendingContracts}</span>
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">
                    contrato{data.pendingContracts > 1 ? "s" : ""} aguardando assinatura
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">Necessitam ação imediata</p>
                  <Link href="/admin/contracts" className="text-xs text-blue-400 hover:text-blue-300 font-medium mt-1.5 inline-block transition-colors">
                    Acessar contratos →
                  </Link>
                </div>
              </div>
            </Panel>

            {/* Aguardando Cliente — âmbar */}
            <Panel
              title="Aguardando Cliente"
              href="/admin/tasks?status=waiting_client"
              hrefLabel="Ver todas"
              accentColor="bg-amber-500"
              accentHover="text-amber-400 hover:text-amber-300"
              empty={data.waitingClientTasks.length === 0}
              emptyIcon={
                <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              emptyText="Nada aguardando cliente"
            >
              <div className="space-y-2">
                {data.waitingClientTasks.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-[#171717] border border-[#262626] hover:border-amber-500/20 transition-all group">
                    <Link href={`/admin/tasks/${t.id}`} className="text-sm font-medium text-gray-200 group-hover:text-amber-400 transition-colors truncate">
                      {t.title}
                    </Link>
                    {t.client && (
                      <span className="text-xs text-gray-600 flex-shrink-0 ml-3 bg-amber-500/5 border border-amber-500/10 px-2 py-0.5 rounded-full">
                        {t.client.name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Panel>

          </div>
        </div>
      </main>
    </>
  );
}
