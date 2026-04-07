import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPortalCharges } from "@/services/portal";
import { Badge } from "@/components/ui/Badge";
import { CHARGE_STATUS_LABELS, CHARGE_STATUS_VARIANTS } from "@/services/billing";
import Link from "next/link";

export const metadata = { title: "Cobranças | Portal do Cliente" };

export default async function PortalBillingPage() {
  const session = await getSession();
  if (!session?.clientId) redirect("/portal/login");

  const charges = await getPortalCharges(session.clientId);
  const now = new Date();

  const totalPending = charges.filter((c) => c.status === "pending").reduce((s, c) => s + Number(c.value), 0);
  const totalPaid = charges.filter((c) => c.status === "paid").reduce((s, c) => s + Number(c.value), 0);

  return (
    <main className="flex-1 p-6 space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Cobranças</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-sm text-gray-500">Pendente a Pagar</p>
          <p className={`text-xl font-bold mt-1 ${totalPending > 0 ? "text-yellow-600" : "text-gray-400"}`}>
            R$ {totalPending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-sm text-gray-500">Total Pago</p>
          <p className="text-xl font-bold text-green-600 mt-1">
            R$ {totalPaid.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {charges.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center">
          <p className="text-gray-400 text-sm">Nenhuma cobrança encontrada.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {charges.map((c) => {
            const isOverdue = c.status === "pending" && new Date(c.dueDate) < now;
            return (
              <div key={c.id} className={`bg-white rounded-xl border shadow-sm p-5 ${isOverdue ? "border-red-200" : "border-gray-200"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-900">{c.description}</p>
                    {c.contract && (
                      <p className="text-xs text-gray-500 mt-0.5">{c.contract.title}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                        Vencimento: {new Date(c.dueDate).toLocaleDateString("pt-BR")}
                        {isOverdue && " ⚠️ Vencida"}
                      </span>
                      {c.paidAt && (
                        <span className="text-green-600">
                          Pago em {new Date(c.paidAt).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="font-semibold text-gray-900">
                      R$ {Number(c.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    <Badge variant={CHARGE_STATUS_VARIANTS[c.status]}>
                      {CHARGE_STATUS_LABELS[c.status]}
                    </Badge>
                    {c.paymentLink && c.status === "pending" && (
                      <a
                        href={c.paymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Pagar agora
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
