import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableBody, TableRow, TableTh, TableTd, EmptyRow } from "@/components/ui/Table";
import { getClients, CLIENT_STATUS_LABELS, CLIENT_STATUS_VARIANTS } from "@/services/clients";

export const metadata = { title: "Clientes | Gestão Interna" };

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string }>;
}

export default async function ClientsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const clients = await getClients({ search: params.search, status: params.status as "active" | "inactive" | "blocked" | undefined });

  return (
    <>
      <Topbar title="Clientes" />
      <main className="flex-1 p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form className="flex gap-2 flex-1">
            <input
              name="search"
              defaultValue={params.search}
              placeholder="Buscar por nome ou email..."
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select name="status" defaultValue={params.status ?? ""} className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todos</option>
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
              <TableTh>Nome</TableTh>
              <TableTh>Contato</TableTh>
              <TableTh>Status</TableTh>
              <TableTh>Responsável</TableTh>
              <TableTh>Contratos</TableTh>
              <TableTh>Tarefas</TableTh>
              <TableTh></TableTh>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.length === 0 ? (
              <EmptyRow cols={7} message="Nenhum cliente encontrado." />
            ) : (
              clients.map((c) => (
                <TableRow key={c.id}>
                  <TableTd>
                    <span className="font-medium text-gray-900">{c.name}</span>
                    {c.document && <p className="text-xs text-gray-400">{c.document}</p>}
                  </TableTd>
                  <TableTd>
                    <div className="text-xs">
                      {c.email && <p>{c.email}</p>}
                      {c.phone && <p className="text-gray-500">{c.phone}</p>}
                    </div>
                  </TableTd>
                  <TableTd>
                    <Badge variant={CLIENT_STATUS_VARIANTS[c.status]}>
                      {CLIENT_STATUS_LABELS[c.status]}
                    </Badge>
                  </TableTd>
                  <TableTd>{c.owner.name}</TableTd>
                  <TableTd>{c._count.contracts}</TableTd>
                  <TableTd>{c._count.tasks}</TableTd>
                  <TableTd>
                    <Link href={`/admin/clients/${c.id}`} className="text-blue-600 hover:underline text-xs font-medium">
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
