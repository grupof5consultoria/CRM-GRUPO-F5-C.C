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
    <main className="flex-1 p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Olá, {session.name}!</h1>
        <p className="text-sm text-gray-500 mt-1">Bem-vindo ao portal de {data.client.name}.</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/portal/contracts">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:border-blue-300 transition-colors cursor-pointer">
            <p className="text-sm text-gray-500">Contratos Ativos</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{data.activeContracts}</p>
          </div>
        </Link>
        <Link href="/portal/billing">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:border-blue-300 transition-colors cursor-pointer">
            <p className="text-sm text-gray-500">Cobranças Pendentes</p>
            <p className={`text-2xl font-bold mt-1 ${data.pendingCharges > 0 ? "text-yellow-600" : "text-gray-400"}`}>
              {data.pendingCharges}
            </p>
          </div>
        </Link>
        <Link href="/portal/billing">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:border-blue-300 transition-colors cursor-pointer">
            <p className="text-sm text-gray-500">Cobranças Vencidas</p>
            <p className={`text-2xl font-bold mt-1 ${data.overdueCharges.length > 0 ? "text-red-600" : "text-gray-400"}`}>
              {data.overdueCharges.length}
            </p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cobranças vencidas */}
        {data.overdueCharges.length > 0 && (
          <div className="bg-white rounded-xl border border-red-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-red-700 mb-4">⚠️ Cobranças Vencidas</h2>
            <div className="space-y-3">
              {data.overdueCharges.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{c.description}</p>
                    <p className="text-xs text-red-600">
                      Venceu em {new Date(c.dueDate).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="font-semibold text-gray-900">
                      R$ {Number(c.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    {c.paymentLink && (
                      <a href={c.paymentLink} target="_blank" rel="noopener noreferrer"
                        className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700">
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
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Andamento do Projeto</h2>
            <div className="space-y-3">
              {data.tasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between text-sm">
                  <p className="text-gray-800">{t.title}</p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {t.dueDate && (
                      <span className={`text-xs ${new Date(t.dueDate) < now ? "text-red-600" : "text-gray-400"}`}>
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
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 col-span-2">
            <p className="text-sm text-gray-400 text-center py-4">
              Tudo em dia! Nenhuma pendência no momento. ✅
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
