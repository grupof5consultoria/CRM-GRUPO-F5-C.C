import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPortalContracts } from "@/services/portal";
import { Badge } from "@/components/ui/Badge";
import { CONTRACT_STATUS_LABELS, CONTRACT_STATUS_VARIANTS } from "@/services/contracts";

export const metadata = { title: "Contratos | Portal do Cliente" };

export default async function PortalContractsPage() {
  const session = await getSession();
  if (!session?.clientId) redirect("/portal/login");

  const contracts = await getPortalContracts(session.clientId);

  return (
    <main className="flex-1 p-6">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Meus Contratos</h1>

      {contracts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center">
          <p className="text-gray-400 text-sm">Nenhum contrato encontrado.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">{c.title}</h2>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 flex-wrap">
                    {c.startDate && (
                      <span>Início: {new Date(c.startDate).toLocaleDateString("pt-BR")}</span>
                    )}
                    {c.endDate && (
                      <span>Término: {new Date(c.endDate).toLocaleDateString("pt-BR")}</span>
                    )}
                    {c.signedAt && (
                      <span className="text-green-600">
                        Assinado em {new Date(c.signedAt).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {c.value && (
                    <span className="text-sm font-semibold text-gray-700">
                      R$ {Number(c.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  )}
                  <Badge variant={CONTRACT_STATUS_VARIANTS[c.status]}>
                    {CONTRACT_STATUS_LABELS[c.status]}
                  </Badge>
                </div>
              </div>

              {c.notes && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 whitespace-pre-line">{c.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
