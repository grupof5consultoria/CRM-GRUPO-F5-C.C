import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableBody, TableRow, TableTh, TableTd, EmptyRow } from "@/components/ui/Table";
import { getTasks, TASK_STATUS_LABELS, TASK_STATUS_VARIANTS } from "@/services/tasks";
import { TaskStatus } from "@prisma/client";

export const metadata = { title: "Tarefas | Gestão Interna" };

interface PageProps { searchParams: Promise<{ status?: string; clientId?: string }> }

export default async function TasksPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const tasks = await getTasks({
    status: params.status as TaskStatus | undefined,
    clientId: params.clientId,
  });

  const STATUS_OPTIONS = [
    { value: "", label: "Todos" },
    { value: "pending", label: "Pendente" },
    { value: "in_progress", label: "Em Andamento" },
    { value: "waiting_client", label: "Aguardando Cliente" },
    { value: "done", label: "Concluída" },
    { value: "cancelled", label: "Cancelada" },
  ];

  return (
    <>
      <Topbar title="Tarefas" />
      <main className="flex-1 p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form className="flex gap-2 flex-1">
            <select name="status" defaultValue={params.status ?? ""} className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <Button type="submit" variant="secondary">Filtrar</Button>
          </form>
          <Link href="/admin/tasks/new"><Button>+ Nova Tarefa</Button></Link>
        </div>

        <Table>
          <TableHead>
            <TableRow>
              <TableTh>Título</TableTh>
              <TableTh>Status</TableTh>
              <TableTh>Cliente</TableTh>
              <TableTh>Responsável</TableTh>
              <TableTh>Prazo</TableTh>
              <TableTh>Checklist</TableTh>
              <TableTh></TableTh>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.length === 0 ? (
              <EmptyRow cols={7} message="Nenhuma tarefa encontrada." />
            ) : (
              tasks.map((t) => {
                const isOverdue = t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done" && t.status !== "cancelled";
                return (
                  <TableRow key={t.id}>
                    <TableTd><span className="font-medium text-gray-900">{t.title}</span></TableTd>
                    <TableTd><Badge variant={TASK_STATUS_VARIANTS[t.status]}>{TASK_STATUS_LABELS[t.status]}</Badge></TableTd>
                    <TableTd>{t.client?.name ?? "—"}</TableTd>
                    <TableTd>{t.assignee.name}</TableTd>
                    <TableTd>
                      {t.dueDate ? (
                        <span className={isOverdue ? "text-red-600 font-medium" : "text-gray-700"}>
                          {new Date(t.dueDate).toLocaleDateString("pt-BR")}
                          {isOverdue && " ⚠️"}
                        </span>
                      ) : "—"}
                    </TableTd>
                    <TableTd>{t._count.checklistItems > 0 ? `${t._count.checklistItems} itens` : "—"}</TableTd>
                    <TableTd>
                      <Link href={`/admin/tasks/${t.id}`} className="text-blue-600 hover:underline text-xs font-medium">Ver</Link>
                    </TableTd>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </main>
    </>
  );
}
