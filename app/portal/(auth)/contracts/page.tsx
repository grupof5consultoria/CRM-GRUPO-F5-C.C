import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPortalContracts } from "@/services/portal";
import { Badge } from "@/components/ui/Badge";
import { CONTRACT_STATUS_LABELS, CONTRACT_STATUS_VARIANTS } from "@/services/contracts";
import Link from "next/link";

export const metadata = { title: "Contratos | Portal do Cliente" };

export default async function PortalContractsPage() {
  const session = await getSession();
  if (!session?.clientId) redirect("/portal/login");

  const contracts = await getPortalContracts(session.clientId);

  return (
    <main className="flex-1 p-4 md:p-6 bg-[#111111] min-h-screen">
      <h1 className="text-xl font-bold text-white mb-6">Meus Contratos</h1>

      {contracts.length === 0 ? (
        <div className="bg-[#1a1a1a] rounded-2xl border border-[#262626] p-10 text-center">
          <p className="text-gray-600 text-sm">Nenhum contrato encontrado.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map((c) => (
            <div key={c.id} className={`bg-[#1a1a1a] rounded-2xl border p-6 transition-all ${
              c.status === "pending_signature"
                ? "border-amber-500/40 shadow-lg shadow-amber-900/10"
                : "border-[#262626]"
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold text-white">{c.title}</h2>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                    {c.startDate && (
                      <span>Início: {new Date(c.startDate).toLocaleDateString("pt-BR")}</span>
                    )}
                    {c.endDate && (
                      <span>Término: {new Date(c.endDate).toLocaleDateString("pt-BR")}</span>
                    )}
                    {c.signedAt && (
                      <span className="text-emerald-400">
                        Assinado em {new Date(c.signedAt).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {c.value && (
                    <span className="text-sm font-semibold text-gray-300">
                      R$ {Number(c.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  )}
                  <Badge variant={CONTRACT_STATUS_VARIANTS[c.status]}>
                    {CONTRACT_STATUS_LABELS[c.status]}
                  </Badge>
                </div>
              </div>

              {/* PDF link for signed or active contracts */}
              {(c.status === "active" || c.status === "pending_signature") && c.signedToken && (
                <div className="mt-3 flex justify-end">
                  <Link href={`/portal/assinar/${c.signedToken}/pdf`} target="_blank">
                    <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 border border-[#2a2a2a] hover:border-[#444] rounded-lg px-3 py-1.5 transition-all">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Ver / Baixar PDF
                    </button>
                  </Link>
                </div>
              )}

              {/* Pending signature CTA */}
              {c.status === "pending_signature" && c.signedToken && (
                <div className="mt-4 pt-4 border-t border-[#262626]">
                  <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-amber-400">Assinatura pendente</p>
                      <p className="text-xs text-amber-300/70 mt-0.5">Este contrato aguarda a sua assinatura digital.</p>
                    </div>
                    <Link href={`/portal/assinar/${c.signedToken}`}>
                      <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold rounded-xl px-4 py-2 transition-colors whitespace-nowrap">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Assinar agora
                      </button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
