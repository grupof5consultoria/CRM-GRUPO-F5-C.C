import { redirect, notFound } from "next/navigation";
import { requireInternalAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PrintButton } from "./PrintButton";

function generatePeriods(count = 6): string[] {
  const periods: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    periods.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return periods;
}

function fmtR(v: number) {
  return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}
function fmtN(v: number) {
  return v.toLocaleString("pt-BR");
}

export default async function MetaReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ period?: string }>;
}) {
  await requireInternalAuth();

  const { clientId } = await params;
  const { period: rawPeriod } = await searchParams;
  const periods = generatePeriods(6);
  const period = rawPeriod && periods.includes(rawPeriod) ? rawPeriod : periods[0];

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true, name: true, email: true, metaConvGoal: true,
      metricEntries: {
        where: {
          platform: "meta",
          date: { gte: `${period}-01`, lte: `${period}-31` },
        },
        orderBy: { date: "asc" },
      },
    },
  });

  if (!client) notFound();

  // Aggregate
  let spend = 0, conversations = 0, impressions = 0, reach = 0, leadsFromAds = 0, linkClicks = 0;
  let cpmTotal = 0, cpmCount = 0;
  for (const e of client.metricEntries) {
    spend         += Number(e.spend ?? 0);
    conversations += e.conversations ?? 0;
    impressions   += e.impressions ?? 0;
    reach         += e.reach ?? 0;
    leadsFromAds  += e.leadsFromAds ?? 0;
    linkClicks    += e.linkClicks ?? 0;
    if (e.cpm != null) { cpmTotal += Number(e.cpm); cpmCount++; }
  }
  const costPerConv = conversations > 0 ? spend / conversations : null;
  const costPerLead = leadsFromAds > 0 ? spend / leadsFromAds : null;
  const cpm         = cpmCount > 0 ? cpmTotal / cpmCount : null;
  const goalPct     = client.metaConvGoal && client.metaConvGoal > 0
    ? Math.min((conversations / client.metaConvGoal) * 100, 100)
    : null;

  const [y, m] = period.split("-");
  const periodLabel = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("pt-BR", {
    month: "long", year: "numeric",
  });

  const today = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  // Daily data for mini chart
  const days = client.metricEntries.filter(e => (e.conversations ?? 0) > 0 || Number(e.spend ?? 0) > 0);
  const maxConv = Math.max(...days.map(e => e.conversations ?? 0), 1);

  return (
    <>
      {/* Print-only global styles */}
      <style>{`
        @media print {
          @page { margin: 20mm 15mm; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <div className="min-h-screen bg-white text-gray-900 font-sans">
        {/* Toolbar — hidden on print */}
        <div className="print:hidden bg-gray-50 border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/admin/metrics/meta" className="text-sm text-gray-500 hover:text-gray-700">← Voltar</a>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-600">Relatório Meta Ads · {client.name} · {periodLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            {periods.map(p => (
              <a
                key={p}
                href={`/admin/reports/${clientId}?period=${p}`}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${p === period ? "bg-violet-600 text-white border-violet-600" : "border-gray-200 text-gray-500 hover:border-gray-400"}`}
              >
                {p}
              </a>
            ))}
            <PrintButton />
          </div>
        </div>

        {/* Report content */}
        <div className="max-w-[800px] mx-auto px-8 py-10">

          {/* Header */}
          <div className="flex items-start justify-between mb-8 pb-6 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2L5 13.5H11.5L10 22L19 10.5H12.5L14 2Z" fill="white" fillOpacity="0.95" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-violet-600 uppercase tracking-widest">Grupo F5</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
              <p className="text-sm text-gray-500 mt-0.5 capitalize">Relatório Meta Ads · {periodLabel}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Gerado em</p>
              <p className="text-sm font-medium text-gray-600">{today}</p>
            </div>
          </div>

          {/* KPI grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { label: "Conversas Iniciadas", value: conversations > 0 ? fmtN(conversations) : "—", sub: "via WhatsApp", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
              { label: "Custo por Conversa",  value: costPerConv ? fmtR(costPerConv) : "—",         sub: "por conversa iniciada", color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100" },
              { label: "Investimento Total",  value: spend > 0 ? fmtR(spend) : "—",                sub: "valor usado no período", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
              { label: "Leads Gerados",       value: leadsFromAds > 0 ? fmtN(leadsFromAds) : "—",   sub: costPerLead ? `${fmtR(costPerLead)}/lead` : "via anúncios", color: "text-gray-700", bg: "bg-gray-50", border: "border-gray-100" },
            ].map(k => (
              <div key={k.label} className={`${k.bg} border ${k.border} rounded-2xl px-5 py-4`}>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{k.label}</p>
                <p className={`text-3xl font-bold ${k.color}`}>{k.value}</p>
                <p className="text-xs text-gray-400 mt-1">{k.sub}</p>
              </div>
            ))}
          </div>

          {/* Secondary metrics */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: "Impressões",   value: impressions > 0 ? fmtN(impressions) : "—" },
              { label: "Alcance",      value: reach > 0 ? fmtN(reach) : "—" },
              { label: "CPM Médio",    value: cpm ? fmtR(cpm) : "—" },
            ].map(k => (
              <div key={k.label} className="border border-gray-100 rounded-xl px-4 py-3 text-center">
                <p className="text-xs text-gray-400 mb-1">{k.label}</p>
                <p className="text-lg font-bold text-gray-700">{k.value}</p>
              </div>
            ))}
          </div>

          {/* Goal progress (if set) */}
          {client.metaConvGoal && goalPct !== null && (
            <div className="border border-violet-100 bg-violet-50 rounded-2xl px-5 py-4 mb-8">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-violet-700">Meta de Conversas</p>
                <p className="text-sm font-bold text-violet-600">{conversations}/{client.metaConvGoal}</p>
              </div>
              <div className="h-3 bg-white rounded-full overflow-hidden border border-violet-100">
                <div
                  className={`h-full rounded-full ${goalPct >= 100 ? "bg-emerald-500" : "bg-violet-500"}`}
                  style={{ width: `${goalPct}%` }}
                />
              </div>
              <p className="text-xs text-violet-400 mt-1.5">
                {goalPct >= 100 ? "Meta atingida!" : `${goalPct.toFixed(0)}% da meta — faltam ${client.metaConvGoal - conversations} conversas`}
              </p>
            </div>
          )}

          {/* Daily chart */}
          {days.length > 0 && (
            <div className="mb-8">
              <p className="text-sm font-semibold text-gray-700 mb-3">Evolução Diária — Conversas</p>
              <div className="flex items-end gap-0.5 h-24 border-b border-gray-100 pb-1">
                {client.metricEntries.map((e, i) => {
                  const conv = e.conversations ?? 0;
                  const pct  = (conv / maxConv) * 100;
                  const [, , dd] = e.date.split("-");
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                      <div
                        className="w-full rounded-t bg-blue-400"
                        style={{ height: `${Math.max(pct, conv > 0 ? 4 : 0)}%` }}
                        title={`${dd}: ${conv} conv`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] text-gray-300 mt-1">
                <span>01</span>
                <span>{String(new Date(Number(y), Number(m), 0).getDate()).padStart(2, "0")}</span>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-100 pt-5 flex items-center justify-between">
            <p className="text-xs text-gray-400">Grupo F5 Consultoria · grupof5consultoria@gmail.com</p>
            <p className="text-xs text-gray-300">Dados via Meta Ads API · {periodLabel}</p>
          </div>

        </div>
      </div>
    </>
  );
}
