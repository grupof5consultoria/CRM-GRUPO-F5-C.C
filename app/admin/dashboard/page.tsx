import { Topbar } from "@/components/layout/Topbar";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { CountUp } from "@/components/ui/CountUp";
import { AnimatedBar } from "@/components/ui/AnimatedBar";

export const metadata = { title: "Dashboard | Gestão Interna" };

// ─── Helpers de data ──────────────────────────────────────────────────────────

function monthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

function currentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// ─── Dados ────────────────────────────────────────────────────────────────────

async function getDashboardData() {
  const now = new Date();
  const { start, end } = monthRange();
  const period = currentPeriod();

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
    // Novos
    patientLeadsByOrigin,
    patientLeadsByClient,
    adMetricsMeta,
    adMetricsGoogle,
    chargesPaid,
    attendancesClosedThisMonth,
    topClientsByRevenue,
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

    // Patient leads do mês agrupados por origem
    prisma.patientLead.groupBy({
      by: ["origin"],
      where: { createdAt: { gte: start, lte: end } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),

    // Top clientes por volume de leads no mês
    prisma.patientLead.groupBy({
      by: ["clientId"],
      where: { createdAt: { gte: start, lte: end } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),

    // Métricas Meta do mês (via ClientMetricEntry)
    prisma.clientMetricEntry.aggregate({
      where: { platform: "meta", date: { startsWith: period } },
      _sum: { spend: true, impressions: true, clicks: true, leadsFromAds: true, revenue: true, conversations: true },
    }),

    // Métricas Google do mês
    prisma.clientMetricEntry.aggregate({
      where: { platform: "google", date: { startsWith: period } },
      _sum: { spend: true, impressions: true, clicks: true, leadsFromAds: true, revenue: true, conversations: true },
    }),

    // Cobranças pagas no mês
    prisma.charge.aggregate({
      where: { status: "paid", paidAt: { gte: start, lte: end } },
      _sum: { value: true },
      _count: { id: true },
    }),

    // Atendimentos fechados no mês
    prisma.attendance.aggregate({
      where: { status: "closed", period },
      _sum: { valueClosed: true },
      _count: { id: true },
    }),

    // Top clientes por faturamento de pacientes no mês (portal de fechamento)
    prisma.attendance.groupBy({
      by: ["clientId"],
      where: { status: "closed", period, valueClosed: { not: null } },
      _sum: { valueClosed: true },
      orderBy: { _sum: { valueClosed: "desc" } },
      take: 5,
    }),
  ]);

  // Busca nomes dos clientes para patient leads e revenue
  const clientIdsFromLeads = patientLeadsByClient.map(r => r.clientId);
  const clientIdsFromRevenue = topClientsByRevenue.map(r => r.clientId);
  const allClientIds = [...new Set([...clientIdsFromLeads, ...clientIdsFromRevenue])];

  const clientNames = allClientIds.length > 0
    ? await prisma.client.findMany({
        where: { id: { in: allClientIds } },
        select: { id: true, name: true },
      })
    : [];

  const clientNameMap = Object.fromEntries(clientNames.map(c => [c.id, c.name]));

  return {
    activeClients, openLeads, openProposals, pendingContracts,
    overdueCharges, pendingCharges, overdueTasks, waitingClientTasks,
    mrr: Number(totalMRR._sum.monthlyValue ?? 0),
    // Leads
    patientLeadsByOrigin,
    patientLeadsByClient: patientLeadsByClient.map(r => ({
      clientId: r.clientId,
      name: clientNameMap[r.clientId] ?? "—",
      count: r._count.id,
    })),
    totalPatientLeadsMonth: patientLeadsByOrigin.reduce((s, r) => s + r._count.id, 0),
    // Anúncios
    adMeta: {
      spend: Number(adMetricsMeta._sum.spend ?? 0),
      impressions: Number(adMetricsMeta._sum.impressions ?? 0),
      clicks: Number(adMetricsMeta._sum.clicks ?? 0),
      leads: Number(adMetricsMeta._sum.leadsFromAds ?? 0),
      conversations: Number(adMetricsMeta._sum.conversations ?? 0),
      revenue: Number(adMetricsMeta._sum.revenue ?? 0),
    },
    adGoogle: {
      spend: Number(adMetricsGoogle._sum.spend ?? 0),
      impressions: Number(adMetricsGoogle._sum.impressions ?? 0),
      clicks: Number(adMetricsGoogle._sum.clicks ?? 0),
      leads: Number(adMetricsGoogle._sum.leadsFromAds ?? 0),
      conversations: Number(adMetricsGoogle._sum.conversations ?? 0),
      revenue: Number(adMetricsGoogle._sum.revenue ?? 0),
    },
    // Faturamento
    chargesPaidValue: Number(chargesPaid._sum.value ?? 0),
    chargesPaidCount: chargesPaid._count.id,
    attendanceRevenue: Number(attendancesClosedThisMonth._sum.valueClosed ?? 0),
    attendanceClosed: attendancesClosedThisMonth._count.id,
    topClientsByRevenue: topClientsByRevenue.map(r => ({
      clientId: r.clientId,
      name: clientNameMap[r.clientId] ?? "—",
      value: Number(r._sum.valueClosed ?? 0),
    })),
  };
}

// ─── Ícones ───────────────────────────────────────────────────────────────────

function IconUsers() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
}
function IconTarget() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
}
function IconDoc() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
}
function IconBilling() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
function IconClock() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
function IconCheck() {
  return <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
function IconTrend() {
  return <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
}

// ─── Labels de origem ─────────────────────────────────────────────────────────

const ORIGIN_LABEL: Record<string, string> = {
  meta_ads:       "Meta Ads",
  google_ads:     "Google Ads",
  instagram:      "Instagram",
  google_organic: "Google Orgânico",
  referral:       "Indicação",
  organic:        "Orgânico",
  other:          "Outros",
};
const ORIGIN_COLOR: Record<string, string> = {
  meta_ads:       "bg-blue-500",
  google_ads:     "bg-red-500",
  instagram:      "bg-pink-500",
  google_organic: "bg-emerald-500",
  referral:       "bg-violet-500",
  organic:        "bg-teal-500",
  other:          "bg-gray-500",
};

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}
function fmtInt(n: number) {
  return n.toLocaleString("pt-BR");
}
function cpl(spend: number, leads: number) {
  if (leads === 0) return "—";
  return `R$ ${fmt(spend / leads)}`;
}

// ─── Componentes base ─────────────────────────────────────────────────────────

function StatCard({ label, value, href, icon, gradient, iconBg, textColor }: {
  label: string; value: number; href: string; icon: React.ReactNode;
  gradient: string; iconBg: string; textColor: string;
}) {
  return (
    <Link href={href}>
      <div className="relative rounded-2xl p-5 overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl" style={{ background: gradient }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.03) 40%, transparent 60%)" }} />
        <div className="absolute top-0 left-0 right-0 h-px pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)" }} />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className={`text-xs font-medium uppercase tracking-wider mb-2 ${textColor} opacity-80`}>{label}</p>
            <p className="text-4xl font-bold text-white drop-shadow-sm">
              <CountUp to={value} duration={1600} />
            </p>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg} ${textColor}`}>{icon}</div>
        </div>
      </div>
    </Link>
  );
}

function Panel({ title, href, hrefLabel, accentColor, accentHover, empty, emptyIcon, emptyText, children }: {
  title: string; href: string; hrefLabel: string; accentColor: string; accentHover: string;
  empty: boolean; emptyIcon: React.ReactNode; emptyText: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className={`w-1.5 h-5 rounded-full ${accentColor}`} />
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">{title}</h3>
        </div>
        <Link href={href} className={`text-xs font-medium transition-colors ${accentHover}`}>{hrefLabel} →</Link>
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

  const now = new Date();
  const monthName = now.toLocaleString("pt-BR", { month: "long" });
  const monthLabel = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${now.getFullYear()}`;

  const totalAdSpend         = data.adMeta.spend + data.adGoogle.spend;
  const totalAdLeads         = data.adMeta.leads + data.adGoogle.leads;
  const totalAdConversations = data.adMeta.conversations + data.adGoogle.conversations;
  const totalAdRevenue       = data.adMeta.revenue + data.adGoogle.revenue;

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
            <div className="hidden sm:flex flex-col items-end justify-center px-5 py-3 rounded-2xl border border-violet-500/20" style={{ background: "linear-gradient(135deg, rgba(109,40,217,0.18) 0%, rgba(124,58,237,0.08) 100%)" }}>
              <p className="text-[10px] text-violet-400/70 uppercase tracking-widest font-semibold mb-0.5">MRR Ativo</p>
              <p className="text-2xl font-bold text-violet-300">
                R$ <CountUp to={data.mrr} decimals={2} duration={2000} />
              </p>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Clientes Ativos" value={data.activeClients} href="/admin/clients?status=active" icon={<IconUsers />} gradient="linear-gradient(135deg, #064e3b 0%, #059669 80%, #10b981 100%)" iconBg="bg-emerald-500/20" textColor="text-emerald-200" />
            <StatCard label="Leads no Pipeline" value={data.openLeads} href="/admin/crm" icon={<IconTarget />} gradient="linear-gradient(135deg, #1e3a8a 0%, #2563eb 80%, #3b82f6 100%)" iconBg="bg-blue-500/20" textColor="text-blue-200" />
            <StatCard label="Propostas Abertas" value={data.openProposals} href="/admin/proposals" icon={<IconDoc />} gradient="linear-gradient(135deg, #78350f 0%, #d97706 80%, #f59e0b 100%)" iconBg="bg-amber-500/20" textColor="text-amber-200" />
            <StatCard label="Cobranças Pendentes" value={data.pendingCharges} href="/admin/billing" icon={<IconBilling />} gradient="linear-gradient(135deg, #7f1d1d 0%, #dc2626 80%, #ef4444 100%)" iconBg="bg-red-500/20" textColor="text-red-200" />
          </div>

          {/* Divisor */}
          <div className="border-t border-[#262626]" />

          {/* ── Leads das Doutoras + Resultados dos Anúncios ── */}
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-4">{monthLabel} — Leads &amp; Anúncios</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* Leads das doutoras */}
              <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-5 rounded-full bg-violet-500" />
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Leads das Doutoras</h3>
                  </div>
                  <span className="text-xs font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-full">
                    {fmtInt(data.totalPatientLeadsMonth)} no mês
                  </span>
                </div>

                {data.totalPatientLeadsMonth === 0 ? (
                  <div className="text-center py-8 text-gray-600 text-sm">Nenhum lead registrado este mês</div>
                ) : (
                  <div className="space-y-4">
                    {/* Origens */}
                    <div className="space-y-2">
                      {data.patientLeadsByOrigin.map((r, idx) => {
                        const pct = data.totalPatientLeadsMonth > 0 ? (r._count.id / data.totalPatientLeadsMonth) * 100 : 0;
                        return (
                          <div key={r.origin}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ORIGIN_COLOR[r.origin] ?? "bg-gray-500"}`} />
                                <span className="text-xs text-gray-400">{ORIGIN_LABEL[r.origin] ?? r.origin}</span>
                              </div>
                              <span className="text-xs font-semibold text-white">{r._count.id}</span>
                            </div>
                            <div className="h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
                              <AnimatedBar pct={pct} colorClass={ORIGIN_COLOR[r.origin] ?? "bg-gray-500"} delay={idx * 80} />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Top clientes */}
                    {data.patientLeadsByClient.length > 0 && (
                      <div className="pt-3 border-t border-[#262626]">
                        <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-2">Top clientes</p>
                        <div className="space-y-1.5">
                          {data.patientLeadsByClient.map((c, i) => (
                            <div key={c.clientId} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-700 font-bold w-4">{i + 1}.</span>
                                <span className="text-xs text-gray-300 truncate max-w-[160px]">{c.name}</span>
                              </div>
                              <span className="text-xs font-semibold text-violet-400">{c.count} leads</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Resultados dos anúncios */}
              <div className="relative bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden">
                {/* Glow top */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />

                {/* Header */}
                <div className="px-6 pt-6 pb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">Resultados dos Anúncios</h3>
                      <p className="text-[10px] text-gray-600 mt-0.5">{monthLabel}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
                    {totalAdConversations > 0 ? `${fmtInt(totalAdConversations)} conversas` : totalAdLeads > 0 ? `${fmtInt(totalAdLeads)} leads` : "ao vivo"}
                  </span>
                </div>

                {totalAdSpend === 0 && totalAdLeads === 0 && totalAdConversations === 0 ? (
                  <div className="px-6 pb-8 text-center py-8 text-gray-600 text-sm">Nenhuma métrica registrada este mês</div>
                ) : (
                  <div className="px-6 pb-6 space-y-5">

                    {/* KPIs totais */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Investido", value: `R$ ${fmt(totalAdSpend)}`, sub: "total geral", color: "text-white", glow: "bg-white/5 border-white/10" },
                        { label: "Conversas", value: fmtInt(totalAdConversations), sub: "iniciadas", color: "text-emerald-400", glow: "bg-emerald-500/5 border-emerald-500/15" },
                        { label: "Custo/Conversa", value: totalAdConversations > 0 ? `R$ ${fmt(totalAdSpend / totalAdConversations)}` : "—", sub: "médio", color: "text-amber-400", glow: "bg-amber-500/5 border-amber-500/15" },
                      ].map(m => (
                        <div key={m.label} className={`${m.glow} border rounded-xl p-3 text-center`}>
                          <p className="text-[9px] text-gray-600 uppercase tracking-widest font-medium mb-1">{m.label}</p>
                          <p className={`text-base font-bold ${m.color}`}>{m.value}</p>
                          <p className="text-[9px] text-gray-700 mt-0.5">{m.sub}</p>
                        </div>
                      ))}
                    </div>

                    {/* Plataformas */}
                    <div className="space-y-3">
                      {[
                        {
                          platform: "Meta Ads",
                          d: data.adMeta,
                          textColor: "text-blue-400",
                          bgColor: "bg-blue-500/5",
                          borderColor: "border-blue-500/15",
                          barColor: "bg-blue-500",
                          badge: data.adMeta.conversations > 0 ? `${fmtInt(data.adMeta.conversations)} conversas` : "sem dados",
                          hasBadge: data.adMeta.conversations > 0,
                          metrics: [
                            { label: "Investido", value: `R$ ${fmt(data.adMeta.spend)}`, color: "text-white" },
                            { label: "Conversas", value: fmtInt(data.adMeta.conversations), color: "text-blue-400" },
                            { label: "Custo/Conv.", value: data.adMeta.conversations > 0 ? `R$ ${fmt(data.adMeta.spend / data.adMeta.conversations)}` : "—", color: "text-amber-400" },
                          ],
                          logo: (
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                          ),
                        },
                        {
                          platform: "Google Ads",
                          d: data.adGoogle,
                          textColor: "text-red-400",
                          bgColor: "bg-red-500/5",
                          borderColor: "border-red-500/15",
                          barColor: "bg-red-500",
                          badge: data.adGoogle.leads > 0 ? `${fmtInt(data.adGoogle.leads)} conversões` : "sem dados",
                          hasBadge: data.adGoogle.leads > 0,
                          metrics: [
                            { label: "Investido", value: `R$ ${fmt(data.adGoogle.spend)}`, color: "text-white" },
                            { label: "Conversões", value: fmtInt(data.adGoogle.leads), color: "text-red-400" },
                            { label: "Custo/Conv.", value: data.adGoogle.leads > 0 ? `R$ ${fmt(data.adGoogle.spend / data.adGoogle.leads)}` : "—", color: "text-amber-400" },
                          ],
                          logo: (
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                          ),
                        },
                      ].map(({ platform, d, textColor, bgColor, borderColor, barColor, badge, hasBadge, metrics, logo }) => {
                        const pct = totalAdSpend > 0 ? Math.min((d.spend / totalAdSpend) * 100, 100) : 0;
                        return (
                          <div key={platform} className={`${bgColor} ${borderColor} border rounded-xl p-4 space-y-3`}>
                            {/* Platform header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-lg ${bgColor} ${borderColor} border flex items-center justify-center ${textColor}`}>
                                  {logo}
                                </div>
                                <span className="text-xs font-semibold text-gray-300">{platform}</span>
                              </div>
                              <span className={`text-xs font-bold ${hasBadge ? textColor : "text-gray-700"}`}>
                                {badge}
                              </span>
                            </div>

                            {/* Métricas */}
                            <div className="grid grid-cols-3 gap-2 text-center">
                              {metrics.map(m => (
                                <div key={m.label}>
                                  <p className="text-[9px] text-gray-600 uppercase tracking-wider">{m.label}</p>
                                  <p className={`text-xs font-semibold mt-0.5 ${m.color}`}>{m.value}</p>
                                </div>
                              ))}
                            </div>

                            {/* Share bar */}
                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] text-gray-700">% do investimento total</span>
                                <span className={`text-[9px] font-semibold ${textColor}`}>{pct.toFixed(0)}%</span>
                              </div>
                              <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                                <AnimatedBar pct={pct} colorClass={barColor} height="h-1" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {totalAdRevenue > 0 && (
                      <div className="flex items-center justify-between pt-3 border-t border-[#1e1e1e]">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span className="text-xs text-gray-500">Faturamento atribuído</span>
                        </div>
                        <span className="text-sm font-bold text-emerald-400">R$ {fmt(totalAdRevenue)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Faturamento das Doutoras ── */}
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-4">{monthLabel} — Faturamento</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* Cobranças pagas */}
              <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-6">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-1.5 h-5 rounded-full bg-emerald-500" />
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Cobranças Pagas</h3>
                </div>
                <p className="text-3xl font-bold text-emerald-400 mb-1">R$ <CountUp to={data.chargesPaidValue} decimals={2} duration={1800} /></p>
                <p className="text-xs text-gray-600">{data.chargesPaidCount} cobrança{data.chargesPaidCount !== 1 ? "s" : ""} recebida{data.chargesPaidCount !== 1 ? "s" : ""} no mês</p>
                <div className="mt-4 pt-4 border-t border-[#262626]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">% do MRR recebido</span>
                    <span className="text-xs font-semibold text-emerald-400">
                      {data.mrr > 0 ? `${Math.round((data.chargesPaidValue / data.mrr) * 100)}%` : "—"}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                    <AnimatedBar pct={data.mrr > 0 ? Math.min((data.chargesPaidValue / data.mrr) * 100, 100) : 0} colorClass="bg-emerald-500" height="h-1.5" delay={300} />
                  </div>
                </div>
              </div>

              {/* Atendimentos fechados */}
              <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-6">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-1.5 h-5 rounded-full bg-violet-500" />
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Tratamentos Fechados</h3>
                </div>
                <p className="text-3xl font-bold text-violet-400 mb-1">R$ <CountUp to={data.attendanceRevenue} decimals={2} duration={1800} /></p>
                <p className="text-xs text-gray-600">{data.attendanceClosed} atendimento{data.attendanceClosed !== 1 ? "s" : ""} fechado{data.attendanceClosed !== 1 ? "s" : ""} no mês</p>
                <p className="text-[10px] text-gray-700 mt-4">Soma dos tratamentos fechados pelos portais das clínicas</p>
              </div>

              {/* Top clientes por faturamento */}
              <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-6">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-1.5 h-5 rounded-full bg-amber-500" />
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Faturamento das Doutoras</h3>
                </div>
                {data.topClientsByRevenue.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600">Sem dados este mês</p>
                    <p className="text-[10px] text-gray-700 mt-1">Preenchido a partir dos fechamentos no portal das clínicas</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.topClientsByRevenue.map((c, i) => {
                      const max = data.topClientsByRevenue[0]?.value ?? 1;
                      const pct = max > 0 ? (c.value / max) * 100 : 0;
                      return (
                        <div key={c.clientId}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-[10px] text-gray-700 font-bold w-4 flex-shrink-0">{i + 1}.</span>
                              <span className="text-xs text-gray-300 truncate">{c.name}</span>
                            </div>
                            <span className="text-xs font-bold text-amber-400 flex-shrink-0 ml-2">R$ {fmt(c.value)}</span>
                          </div>
                          <div className="h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                    <p className="text-[10px] text-gray-700 pt-1">Fonte: fechamentos registrados no portal de cada clínica</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Divisor */}
          <div className="border-t border-[#262626]" />

          {/* Painéis de alertas */}
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-4">Alertas Operacionais</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              <Panel title="Tarefas Atrasadas" href="/admin/tasks" hrefLabel="Ver todas" accentColor="bg-red-500" accentHover="text-red-400 hover:text-red-300" empty={data.overdueTasks.length === 0} emptyIcon={<IconCheck />} emptyText="Nenhuma tarefa atrasada">
                <div className="space-y-2">
                  {data.overdueTasks.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-[#171717] border border-[#262626] hover:border-red-500/20 transition-all group">
                      <div className="min-w-0">
                        <Link href={`/admin/tasks/${t.id}`} className="text-sm font-medium text-gray-200 group-hover:text-red-400 transition-colors truncate block">{t.title}</Link>
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

              <Panel title="Cobranças Vencidas" href="/admin/billing" hrefLabel="Ver todas" accentColor="bg-orange-500" accentHover="text-orange-400 hover:text-orange-300" empty={data.overdueCharges.length === 0} emptyIcon={<IconTrend />} emptyText="Nenhuma cobrança vencida">
                <div className="space-y-2">
                  {data.overdueCharges.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-[#171717] border border-[#262626] hover:border-orange-500/20 transition-all">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">{c.description}</p>
                        <Link href={`/admin/clients/${c.client.id}`} className="text-xs text-gray-600 hover:text-orange-400 transition-colors">{c.client.name}</Link>
                      </div>
                      <div className="flex-shrink-0 ml-3 text-right">
                        <p className="text-xs text-orange-400 font-medium">{new Date(c.dueDate).toLocaleDateString("pt-BR")}</p>
                        <p className="text-sm font-bold text-white">R$ {fmt(Number(c.value))}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Contratos Aguardando" href="/admin/contracts" hrefLabel="Ver todos" accentColor="bg-blue-500" accentHover="text-blue-400 hover:text-blue-300" empty={data.pendingContracts === 0} emptyIcon={<svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>} emptyText="Nenhum contrato pendente">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-[#171717] border border-blue-500/20">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-blue-400">{data.pendingContracts}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">contrato{data.pendingContracts > 1 ? "s" : ""} aguardando assinatura</p>
                    <p className="text-xs text-gray-600 mt-0.5">Necessitam ação imediata</p>
                    <Link href="/admin/contracts" className="text-xs text-blue-400 hover:text-blue-300 font-medium mt-1.5 inline-block transition-colors">Acessar contratos →</Link>
                  </div>
                </div>
              </Panel>

              <Panel title="Aguardando Cliente" href="/admin/tasks?status=waiting_client" hrefLabel="Ver todas" accentColor="bg-amber-500" accentHover="text-amber-400 hover:text-amber-300" empty={data.waitingClientTasks.length === 0} emptyIcon={<svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} emptyText="Nada aguardando cliente">
                <div className="space-y-2">
                  {data.waitingClientTasks.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-[#171717] border border-[#262626] hover:border-amber-500/20 transition-all group">
                      <Link href={`/admin/tasks/${t.id}`} className="text-sm font-medium text-gray-200 group-hover:text-amber-400 transition-colors truncate">{t.title}</Link>
                      {t.client && <span className="text-xs text-gray-600 flex-shrink-0 ml-3 bg-amber-500/5 border border-amber-500/10 px-2 py-0.5 rounded-full">{t.client.name}</span>}
                    </div>
                  ))}
                </div>
              </Panel>

            </div>
          </div>
        </div>
      </main>
    </>
  );
}
