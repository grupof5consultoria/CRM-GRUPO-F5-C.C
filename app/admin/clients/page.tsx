import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableBody, TableRow, TableTh, TableTd, EmptyRow } from "@/components/ui/Table";
import { getClients, getTotalMRR, CLIENT_STATUS_LABELS, CLIENT_STATUS_VARIANTS } from "@/services/clients";
import { CLIENT_HEALTH_LABELS, CLIENT_HEALTH_VARIANTS, CLIENT_HEALTH_COLORS } from "@/utils/status-labels";
import { ClientHealth } from "@prisma/client";

export const metadata = { title: "Clientes | Gestão Interna" };

const HEALTH_EMOJI: Record<ClientHealth, string> = {
  thriving: "🟢",
  stable: "🔵",
  attention: "🟡",
  at_risk: "🔴",
};

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string; health?: string }>;
}

export default async function ClientsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [clients, totalMRR] = await Promise.all([
    getClients({
      search: params.search,
      status: params.status as "active" | "inactive" | "blocked" | undefined,
      health: params.health as ClientHealth | undefined,
    }),
    getTotalMRR(),
  ]);

  const atRisk = clients.filter(c => c.health === "at_risk").length;
  const attention = clients.filter(c => c.health === "attention").length;

  return (
    <>
      <Topbar title="Clientes" />
      <main className="flex-1 p-6">

        {/* Métricas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-2xl shadow-md p-4">
            <p className="text-indigo-100 text-xs font-medium">MRR Total</p>
            <p className="text-white text-2xl font-bold mt-1">
              R$ {totalMRR.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/50 shadow-sm p-4">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Clientes Ativos</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{clients.filter(c => c.status === "active").length}</p>
          </div>
          {atRisk > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-red-200 dark:border-red-800/50 shadow-sm p-4">
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">Em Risco</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{atRisk}</p>
            </div>
          )}
          {attention > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-amber-200 dark:border-amber-800/50 shadow-sm p-4">
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Requer Atenção</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{attention}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form className="flex gap-2 flex-1 flex-wrap">
            <input
              name="search"
              defaultValue={params.search}
              placeholder="Buscar por nome ou email..."
              className="flex-1 min-w-40 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select name="health" defaultValue={params.health ?? ""} className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Toda saúde</option>
              <option value="thriving">🟢 Ativo e Engajado</option>
              <option value="stable">🔵 Estável</option>
              <option value="attention">🟡 Requer Atenção</option>
              <option value="at_risk">🔴 Em Risco</option>
            </select>
            <select name="status" defaultValue={params.status ?? ""} className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Todo status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
              <option value="blocked">Bloqueados</option>
            </select>
            <Button type="submit" variant="secondary">Filtrar</Button>
          </form>
          <Link href="/admin/clients/new">
            <Button>+ Novo Cliente</Button>
          </Link>
        </div>

        <Table>
          <TableHead>
            <TableRow>
              <TableTh>Saúde</TableTh>
              <TableTh>Nome</TableTh>
              <TableTh>Contato</TableTh>
              <TableTh>Valor/mês</TableTh>
              <TableTh>Tempo</TableTh>
              <TableTh>Status</TableTh>
              <TableTh></TableTh>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.length === 0 ? (
              <EmptyRow cols={8} message="Nenhum cliente encontrado." />
            ) : (
              clients.map((c) => (
                <TableRow key={c.id}>
                  <TableTd>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{HEALTH_EMOJI[c.health]}</span>
                      <span className={`text-xs font-semibold ${CLIENT_HEALTH_COLORS[c.health]}`}>
                        {CLIENT_HEALTH_LABELS[c.health]}
                      </span>
                    </div>
                  </TableTd>
                  <TableTd>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{c.name}</span>
                    {c.document && <p className="text-xs text-gray-400">{c.document}</p>}
                  </TableTd>
                  <TableTd>
                    <div className="text-xs">
                      {c.email && <p>{c.email}</p>}
                      {c.phone && <p className="text-gray-500">{c.phone}</p>}
                    </div>
                  </TableTd>
                  <TableTd>
                    {c.monthlyValue != null ? (
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        R$ {Number(c.monthlyValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </TableTd>
                  <TableTd>
                    {c.startDate ? (() => {
                      const months = (new Date().getFullYear() - new Date(c.startDate).getFullYear()) * 12 + (new Date().getMonth() - new Date(c.startDate).getMonth());
                      const years = Math.floor(months / 12);
                      return (
                        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                          {years > 0 ? `${years}a ${months % 12}m` : `${months}m`}
                        </span>
                      );
                    })() : <span className="text-gray-300 text-xs">—</span>}
                  </TableTd>
                  <TableTd>
                    <Badge variant={CLIENT_STATUS_VARIANTS[c.status]}>
                      {CLIENT_STATUS_LABELS[c.status]}
                    </Badge>
                  </TableTd>
                  <TableTd>{c.owner.name}</TableTd>
                  <TableTd>
                    <Link href={`/admin/clients/${c.id}`} className="text-indigo-600 hover:underline text-xs font-medium">
                      Ver ficha
                    </Link>
                  </TableTd>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </main>
    </>
  );
}
