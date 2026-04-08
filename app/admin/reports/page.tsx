import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default async function ReportsPage() {
  const now = new Date();

  // Last 6 months
  const months: { label: string; year: number; month: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }

  const [paidCharges, clients, leads, tasks] = await Promise.all([
    prisma.charge.findMany({
      where: { status: "paid", paidAt: { not: null } },
      select: { value: true, paidAt: true },
    }),
    prisma.client.findMany({
      where: { status: "active" },
      select: { monthlyValue: true, name: true },
      orderBy: { monthlyValue: "desc" },
    }),
    prisma.lead.findMany({
      select: { status: true },
    }),
    prisma.task.findMany({
      select: { status: true },
    }),
  ]);

  // Revenue by month
  const revenueByMonth = months.map(({ label, year, month }) => {
    const total = paidCharges
      .filter((c) => {
        const d = new Date(c.paidAt!);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .reduce((sum, c) => sum + Number(c.value), 0);
    return { label, total };
  });

  const maxRevenue = Math.max(...revenueByMonth.map((m) => m.total), 1);

  // MRR = sum of active clients' monthly values
  const mrr = clients.reduce((sum, c) => sum + Number(c.monthlyValue ?? 0), 0);

  // Pipeline stats
  const pipelineGroups = [
    { label: "Prospecção", statuses: ["new", "contacted", "qualified"] },
    { label: "Negociação", statuses: ["proposal_sent", "negotiation"] },
    { label: "Clientes", statuses: ["onboarding", "active_client", "upsell_opportunity"] },
    { label: "Encerrados", statuses: ["closed_won", "closed_lost", "churned", "at_risk_churn"] },
  ];

  const pipelineCounts = pipelineGroups.map(({ label, statuses }) => ({
    label,
    count: leads.filter((l) => statuses.includes(l.status)).length,
  }));
  const maxPipeline = Math.max(...pipelineCounts.map((p) => p.count), 1);

  // Task stats
  const taskStatusLabels: Record<string, string> = {
    backlog: "Backlog",
    todo: "A fazer",
    in_progress: "Em andamento",
    in_review: "Em revisão",
    done: "Concluída",
    cancelled: "Cancelada",
  };
  const taskStatusColors: Record<string, string> = {
    backlog: "bg-gray-600",
    todo: "bg-blue-500",
    in_progress: "bg-amber-500",
    in_review: "bg-violet-500",
    done: "bg-emerald-500",
    cancelled: "bg-gray-700",
  };
  const taskCounts = Object.keys(taskStatusLabels).map((status) => ({
    label: taskStatusLabels[status],
    color: taskStatusColors[status],
    count: tasks.filter((t) => t.status === status).length,
  }));
  const totalTasks = tasks.length || 1;

  // Top clients by MRR
  const topClients = clients.filter((c) => c.monthlyValue && Number(c.monthlyValue) > 0).slice(0, 8);
  const maxClientMRR = Number(topClients[0]?.monthlyValue ?? 1);

  // Summary stats
  const currentMonthRevenue = revenueByMonth[revenueByMonth.length - 1]?.total ?? 0;
  const prevMonthRevenue = revenueByMonth[revenueByMonth.length - 2]?.total ?? 0;
  const revenueGrowth = prevMonthRevenue > 0 ? ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 : 0;

  const wonLeads = leads.filter((l) => l.status === "closed_won").length;
  const lostLeads = leads.filter((l) => l.status === "closed_lost").length;
  const conversionRate = wonLeads + lostLeads > 0 ? (wonLeads / (wonLeads + lostLeads)) * 100 : 0;

  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const taskCompletionRate = tasks.length > 0 ? (doneTasks / tasks.length) * 100 : 0;

  return (
    <>
      <Topbar title="Relatórios" />
      <main className="flex-1 p-6 bg-[#111111] min-h-screen space-y-6">

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "MRR Atual",
              value: `R$ ${mrr.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
              sub: "receita mensal recorrente",
              color: "emerald",
            },
            {
              label: "Receita no Mês",
              value: `R$ ${currentMonthRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
              sub: revenueGrowth >= 0 ? `+${revenueGrowth.toFixed(1)}% vs mês anterior` : `${revenueGrowth.toFixed(1)}% vs mês anterior`,
              color: revenueGrowth >= 0 ? "violet" : "red",
            },
            {
              label: "Taxa de Conversão",
              value: `${conversionRate.toFixed(1)}%`,
              sub: `${wonLeads} ganhos / ${lostLeads} perdidos`,
              color: "amber",
            },
            {
              label: "Conclusão de Tarefas",
              value: `${taskCompletionRate.toFixed(1)}%`,
              sub: `${doneTasks} de ${tasks.length} tarefas`,
              color: "blue",
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="relative bg-[#1a1a1a] rounded-2xl border border-[#262626] p-4 overflow-hidden"
            >
              <span
                className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)" }}
              />
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{kpi.label}</p>
              <p className={`text-xl font-bold text-${kpi.color}-400`}>{kpi.value}</p>
              <p className="text-xs text-gray-600 mt-0.5">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Revenue chart + Pipeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Revenue bar chart */}
          <Card>
            <CardHeader><CardTitle>Receita dos Últimos 6 Meses</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-end gap-3 h-40">
                {revenueByMonth.map((m) => {
                  const pct = (m.total / maxRevenue) * 100;
                  return (
                    <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-gray-600">
                        {m.total > 0 ? `R$${(m.total / 1000).toFixed(0)}k` : "—"}
                      </span>
                      <div className="w-full flex items-end" style={{ height: "100px" }}>
                        <div
                          className="w-full rounded-t-lg transition-all relative overflow-hidden"
                          style={{
                            height: `${Math.max(pct, 2)}%`,
                            background: "linear-gradient(180deg, #7c3aed 0%, #6d28d9 100%)",
                          }}
                        >
                          <span
                            className="absolute inset-0 pointer-events-none"
                            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)" }}
                          />
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-500 capitalize">{m.label}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Pipeline funnel */}
          <Card>
            <CardHeader><CardTitle>Pipeline de Leads</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {pipelineCounts.map((p, i) => {
                const pct = (p.count / maxPipeline) * 100;
                const colors = ["bg-violet-500", "bg-amber-500", "bg-emerald-500", "bg-gray-500"];
                return (
                  <div key={p.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">{p.label}</span>
                      <span className="text-xs font-semibold text-gray-300">{p.count}</span>
                    </div>
                    <div className="h-2 bg-[#262626] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${colors[i]}`}
                        style={{ width: `${Math.max(pct, p.count > 0 ? 2 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Tasks + Top Clients */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Task breakdown */}
          <Card>
            <CardHeader><CardTitle>Distribuição de Tarefas</CardTitle></CardHeader>
            <CardContent className="space-y-2.5">
              {taskCounts.map((t) => {
                const pct = (t.count / totalTasks) * 100;
                return (
                  <div key={t.label}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${t.color}`} />
                        <span className="text-xs text-gray-400">{t.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">{pct.toFixed(0)}%</span>
                        <span className="text-xs font-semibold text-gray-300 w-4 text-right">{t.count}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-[#262626] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${t.color}`}
                        style={{ width: `${Math.max(pct, t.count > 0 ? 2 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Top clients by MRR */}
          <Card>
            <CardHeader><CardTitle>Top Clientes por MRR</CardTitle></CardHeader>
            <CardContent>
              {topClients.length === 0 ? (
                <p className="text-sm text-gray-600 text-center py-6">Nenhum cliente com valor mensal cadastrado.</p>
              ) : (
                <div className="space-y-2.5">
                  {topClients.map((c) => {
                    const pct = (Number(c.monthlyValue) / maxClientMRR) * 100;
                    return (
                      <div key={c.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-400 truncate max-w-[60%]">{c.name}</span>
                          <span className="text-xs font-semibold text-emerald-400">
                            R$ {Number(c.monthlyValue).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                          </span>
                        </div>
                        <div className="h-1.5 bg-[#262626] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              background: "linear-gradient(90deg, #10b981, #059669)",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </main>
    </>
  );
}
