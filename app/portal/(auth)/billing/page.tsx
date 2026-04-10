import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPortalCharges } from "@/services/portal";
import { CHARGE_STATUS_LABELS, CHARGE_STATUS_VARIANTS } from "@/services/billing";

export const metadata = { title: "Cobranças | Portal do Cliente" };

const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function getPeriodLabel(dueDate: Date | string) {
  const d = new Date(dueDate);
  return `${MONTHS_PT[d.getMonth()]} ${d.getFullYear()}`;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  paid:    "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  overdue: "text-red-400 bg-red-500/10 border-red-500/30",
  cancelled: "text-gray-500 bg-[#222] border-[#333]",
  refunded:  "text-blue-400 bg-blue-500/10 border-blue-500/30",
};

export default async function PortalBillingPage() {
  const session = await getSession();
  if (!session?.clientId) redirect("/portal/login");

  const charges = await getPortalCharges(session.clientId);
  const now = new Date();

  const totalPending = charges.filter((c) => c.status === "pending").reduce((s, c) => s + Number(c.value), 0);
  const totalPaid    = charges.filter((c) => c.status === "paid").reduce((s, c) => s + Number(c.value), 0);

  // Separate current month charges from history
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const isCurrentMonth = (d: Date | string) => {
    const dd = new Date(d);
    return `${dd.getFullYear()}-${String(dd.getMonth() + 1).padStart(2, "0")}` === currentMonthKey;
  };

  const currentCharges = charges.filter(c => isCurrentMonth(c.dueDate));
  const historyCharges = charges.filter(c => !isCurrentMonth(c.dueDate));

  // Group history by month (descending)
  const grouped = new Map<string, { label: string; charges: typeof historyCharges }>();
  for (const c of historyCharges) {
    const d = new Date(c.dueDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = getPeriodLabel(c.dueDate);
    if (!grouped.has(key)) grouped.set(key, { label, charges: [] });
    grouped.get(key)!.charges.push(c);
  }
  const sortedHistory = Array.from(grouped.entries()).sort((a, b) => b[0].localeCompare(a[0]));

  return (
    <main className="flex-1 p-4 md:p-6 bg-[#111111] min-h-screen space-y-6">
      <h1 className="text-xl font-bold text-white">Cobranças</h1>

      {/* PIX key */}
      <div className="relative bg-[#1a1a1a] rounded-2xl border border-emerald-500/20 p-4 overflow-hidden">
        <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.06) 0%, transparent 60%)" }} />
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.9 2c-.8 0-1.6.3-2.2.9L4.9 7.7c-.6.6-.9 1.4-.9 2.2s.3 1.6.9 2.2l4.8 4.8c.6.6 1.4.9 2.2.9s1.6-.3 2.2-.9l4.8-4.8c.6-.6.9-1.4.9-2.2s-.3-1.6-.9-2.2L14.1 2.9c-.6-.6-1.4-.9-2.2-.9zm0 2c.3 0 .6.1.8.3l4.8 4.8c.2.2.3.5.3.8s-.1.6-.3.8L12.7 15.5c-.2.2-.5.3-.8.3s-.6-.1-.8-.3L6.3 10.7c-.2-.2-.3-.5-.3-.8s.1-.6.3-.8L11.1 4.3c.2-.2.5-.3.8-.3z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-0.5">Chave PIX</p>
            <p className="text-base font-bold text-white tracking-widest">502.786.368-37</p>
            <p className="text-xs text-gray-500 mt-0.5">Banco Itaú · Bruno Alves Nascimento</p>
          </div>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#1a1a1a] rounded-2xl border border-[#262626] p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Pendente</p>
          <p className={`text-xl font-bold mt-1 ${totalPending > 0 ? "text-amber-400" : "text-gray-600"}`}>
            R$ {totalPending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-[#1a1a1a] rounded-2xl border border-[#262626] p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Pago</p>
          <p className="text-xl font-bold text-emerald-400 mt-1">
            R$ {totalPaid.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {charges.length === 0 ? (
        <div className="bg-[#1a1a1a] rounded-2xl border border-[#262626] p-10 text-center">
          <p className="text-gray-600 text-sm">Nenhuma cobrança encontrada.</p>
        </div>
      ) : (
        <>
          {/* Mês atual em destaque */}
          {currentCharges.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-violet-400" />
                <h2 className="text-sm font-bold text-violet-300">
                  {MONTHS_PT[now.getMonth()]} {now.getFullYear()}
                  <span className="ml-2 text-xs font-normal text-violet-400">• Mês atual</span>
                </h2>
              </div>
              <div className="space-y-3">
                {currentCharges.map((c) => (
                  <ChargeCard key={c.id} c={c} now={now} />
                ))}
              </div>
            </div>
          )}

          {/* Histórico agrupado por mês */}
          {sortedHistory.map(([key, group]) => (
            <div key={key}>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold text-gray-500">{group.label}</h2>
              </div>
              <div className="space-y-3">
                {group.charges.map((c) => (
                  <ChargeCard key={c.id} c={c} now={now} />
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </main>
  );
}

function ChargeCard({ c, now }: { c: ReturnType<typeof Array.prototype.filter>[0]; now: Date }) {
  const isOverdue = c.status === "pending" && new Date(c.dueDate) < now;
  const isPaid    = c.status === "paid";
  const period    = getPeriodLabel(c.dueDate);
  const dueDay    = new Date(c.dueDate).getDate();

  const cardBorder = isPaid
    ? "border-emerald-500/25"
    : isOverdue
    ? "border-red-500/30"
    : "border-[#262626]";

  return (
    <div className={`bg-[#1a1a1a] rounded-2xl border ${cardBorder} p-4 md:p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Mês vigente em destaque */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg border ${
              isPaid
                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                : isOverdue
                ? "text-red-400 bg-red-500/10 border-red-500/30"
                : "text-violet-400 bg-violet-500/10 border-violet-500/20"
            }`}>
              {period}
            </span>
            {c.contract && (
              <span className="text-xs text-gray-600 truncate">{c.contract.title}</span>
            )}
          </div>

          <p className="font-medium text-gray-200 text-sm truncate">{c.description}</p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1.5 text-xs text-gray-500">
            {isPaid ? (
              <span className="text-emerald-400 font-medium">
                ✓ Pago em {new Date(c.paidAt!).toLocaleDateString("pt-BR")}
              </span>
            ) : (
              <span className={isOverdue ? "text-red-400 font-medium" : ""}>
                Vence dia {dueDay}
                {isOverdue && " — Atrasada"}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className="font-bold text-white text-base">
            R$ {Number(c.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
            isPaid
              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
              : isOverdue
              ? "text-red-400 bg-red-500/10 border-red-500/30"
              : "text-amber-400 bg-amber-500/10 border-amber-500/30"
          }`}>
            {CHARGE_STATUS_LABELS[c.status as keyof typeof CHARGE_STATUS_LABELS]}
          </span>
        </div>
      </div>

      {c.paymentLink && c.status === "pending" && (
        <a
          href={c.paymentLink}
          target="_blank"
          rel="noopener noreferrer"
          className="relative mt-3 flex items-center justify-center w-full text-sm px-4 py-2.5 rounded-xl text-white font-medium overflow-hidden transition-all"
          style={{ background: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 40%, #5b21b6 100%)" }}
        >
          <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)" }} />
          Pagar agora
        </a>
      )}
    </div>
  );
}
