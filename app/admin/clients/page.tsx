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

        {/* MRR total */}
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-2xl px-5 py-3 shadow-md">
            <p className="text-indigo-100 text-xs font-medium">MRR Total (clientes ativos)</p>
            <p className="text-white text-2xl font-bold">
              R$ {totalMRR.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Cards de alerta rápido */}
        {(atRisk > 0 || attention > 0) && (
          <div className="flex gap-3 mb-5">
            {atRisk > 0 && (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2.5 text-sm">
                <span>🔴</span>
                <span className="font-semibold text-red-700 dark:text-red-400">{atRisk} cliente{atRisk > 1 ? "s" : ""} em risco</span>
              </div>
            )}
            {attention > 0 && (
              <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2.5 text-sm">
                <span>🟡</span>
                <span className="font-semibold text-amber-700 dark:text-amber-400">{attention} requere{attention > 1 ? "m" : ""} atenção</span>
              </div>
            )}
          </div>
        )}

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
              <TableTh>Status</TableTh>
              <TableTh>Responsável</TableTh>
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
