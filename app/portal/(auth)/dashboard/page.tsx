import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPortalDashboard } from "@/services/portal";
import { Badge } from "@/components/ui/Badge";
import { TASK_STATUS_LABELS, TASK_STATUS_VARIANTS } from "@/services/tasks";
import Link from "next/link";

export const metadata = { title: "Início | Portal do Cliente" };

export default async function PortalDashboardPage() {
  const session = await getSession();
  if (!session?.clientId) redirect("/portal/login");

  const data = await getPortalDashboard(session.clientId);
  if (!data.client) redirect("/portal/login");

  const now = new Date();

  return (
    <main className="flex-1 p-6 bg-[#111111] min-h-screen space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Olá, {session.name}!</h1>
        <p className="text-sm text-gray-500 mt-1">Bem-vindo ao portal de {data.client.name}.</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/portal/contracts">
          <div className="relative bg-[#1a1a1a] rounded-2xl border border-[#262626] p-5 hover:border-violet-500/40 transition-all overflow-hidden group cursor-pointer">
            <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)" }} />
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Contratos Ativos</p>
            <p className="text-2xl font-bold text-violet-400">{data.activeContracts}</p>
          </div>
        </Link>
        <Link href="/portal/billing">
          <div className="relative bg-[#1a1a1a] rounded-2xl border border-[#262626] p-5 hover:border-violet-500/40 transition-all overflow-hidden cursor-pointer">
            <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)" }} />
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Cobranças Pendentes</p>
            <p className={`text-2xl font-bold mt-1 ${data.pendingCharges > 0 ? "text-amber-400" : "text-gray-600"}`}>
              {data.pendingCharges}
            </p>
          </div>
        </Link>
        <Link href="/portal/billing">
          <div className="relative bg-[#1a1a1a] rounded-2xl border border-[#262626] p-5 hover:border-violet-500/40 transition-all overflow-hidden cursor-pointer">
            <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)" }} />
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Cobranças Vencidas</p>
            <p className={`text-2xl font-bold mt-1 ${data.overdueCharges.length > 0 ? "text-red-400" : "text-gray-600"}`}>
              {data.overdueCharges.length}
            </p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cobranças vencidas */}
        {data.overdueCharges.length > 0 && (
          <div className="bg-[#1a1a1a] rounded-2xl border border-red-500/20 p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider">Cobranças Vencidas</h2>
            </div>
            <div className="space-y-3">
              {data.overdueCharges.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-200">{c.description}</p>
                    <p className="text-xs text-red-400 mt-0.5">
                      Venceu em {new Date(c.dueDate).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="font-semibold text-white">
                      R$ {Number(c.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    {c.paymentLink && (
                      <a
                        href={c.paymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-3 py-1 rounded-lg text-white font-medium transition-all overflow-hidden relative"
                        style={{ background: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 40%, #5b21b6 100%)" }}
                      >
                        Pagar
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tarefas em andamento */}
        {data.tasks.length > 0 && (
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#262626] p-6">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Andamento do Projeto</h2>
            <div className="space-y-3">
              {data.tasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between text-sm">
                  <p className="text-gray-300">{t.title}</p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {t.dueDate && (
                      <span className={`text-xs ${new Date(t.dueDate) < now ? "text-red-400" : "text-gray-600"}`}>
                        {new Date(t.dueDate).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                    <Badge variant={TASK_STATUS_VARIANTS[t.status]}>
                      {TASK_STATUS_LABELS[t.status]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.overdueCharges.length === 0 && data.tasks.length === 0 && (
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#262626] p-6 col-span-2">
            <div className="text-center py-4">
              <svg className="w-8 h-8 text-emerald-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-gray-500">Tudo em dia! Nenhuma pendência no momento.</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
