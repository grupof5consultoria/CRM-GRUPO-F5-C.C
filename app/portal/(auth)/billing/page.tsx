import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPortalCharges } from "@/services/portal";
import { Badge } from "@/components/ui/Badge";
import { CHARGE_STATUS_LABELS, CHARGE_STATUS_VARIANTS } from "@/services/billing";

export const metadata = { title: "Cobranças | Portal do Cliente" };

export default async function PortalBillingPage() {
  const session = await getSession();
  if (!session?.clientId) redirect("/portal/login");

  const charges = await getPortalCharges(session.clientId);
  const now = new Date();

  const totalPending = charges.filter((c) => c.status === "pending").reduce((s, c) => s + Number(c.value), 0);
  const totalPaid = charges.filter((c) => c.status === "paid").reduce((s, c) => s + Number(c.value), 0);

  return (
    <main className="flex-1 p-4 md:p-6 bg-[#111111] min-h-screen space-y-6">
      <h1 className="text-xl font-bold text-white">Cobranças</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="relative bg-[#1a1a1a] rounded-2xl border border-[#262626] p-5 overflow-hidden">
          <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)" }} />
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Pendente a Pagar</p>
          <p className={`text-xl font-bold mt-1 ${totalPending > 0 ? "text-amber-400" : "text-gray-600"}`}>
            R$ {totalPending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="relative bg-[#1a1a1a] rounded-2xl border border-[#262626] p-5 overflow-hidden">
          <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)" }} />
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
        <div className="space-y-3">
          {charges.map((c) => {
            const isOverdue = c.status === "pending" && new Date(c.dueDate) < now;
            return (
              <div key={c.id} className={`bg-[#1a1a1a] rounded-2xl border p-4 md:p-5 ${isOverdue ? "border-red-500/30" : "border-[#262626]"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-200 truncate">{c.description}</p>
                    {c.contract && (
                      <p className="text-xs text-gray-600 mt-0.5 truncate">{c.contract.title}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-gray-500">
                      <span className={isOverdue ? "text-red-400 font-medium" : ""}>
                        Venc. {new Date(c.dueDate).toLocaleDateString("pt-BR")}
                        {isOverdue && " — Vencida"}
                      </span>
                      {c.paidAt && (
                        <span className="text-emerald-400">
                          Pago {new Date(c.paidAt).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="font-semibold text-white text-sm">
                      R$ {Number(c.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    <Badge variant={CHARGE_STATUS_VARIANTS[c.status]}>
                      {CHARGE_STATUS_LABELS[c.status]}
                    </Badge>
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
          })}
        </div>
      )}
    </main>
  );
}
