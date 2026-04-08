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

  const now = new Date();
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => t.status === "pending" || t.status === "in_progress").length;
  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== "done" && t.status !== "cancelled").length;
  const doneTasks = tasks.filter(t => t.status === "done").length;

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
      <main className="flex-1 p-6 space-y-6">

        {/* Métricas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#262626] shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium">Total</p>
            <p className="text-2xl font-bold text-white mt-1">{totalTasks}</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#262626] shadow-sm p-4">
            <p className="text-xs text-amber-400 font-medium">Em Andamento</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{pendingTasks}</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#262626] shadow-sm p-4">
            <p className="text-xs text-red-400 font-medium">Atrasadas</p>
            <p className={`text-2xl font-bold mt-1 ${overdueTasks > 0 ? "text-red-400" : "text-gray-600"}`}>{overdueTasks}</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#262626] shadow-sm p-4">
            <p className="text-xs text-emerald-400 font-medium">Concluídas</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{doneTasks}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <form className="flex gap-2 flex-1">
            <select name="status" defaultValue={params.status ?? ""} className="rounded-xl border border-[#333333] bg-[#1a1a1a] text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
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
                const isOverdue = t.dueDate && new Date(t.dueDate) < now && t.status !== "done" && t.status !== "cancelled";
                return (
                  <TableRow key={t.id}>
                    <TableTd><span className="font-medium text-white">{t.title}</span></TableTd>
                    <TableTd><Badge variant={TASK_STATUS_VARIANTS[t.status]}>{TASK_STATUS_LABELS[t.status]}</Badge></TableTd>
                    <TableTd><span className="text-gray-400">{t.client?.name ?? "—"}</span></TableTd>
                    <TableTd><span className="text-gray-400">{t.assignee.name}</span></TableTd>
                    <TableTd>
                      {t.dueDate ? (
                        <span className={isOverdue ? "text-red-500 font-semibold" : "text-gray-400"}>
                          {new Date(t.dueDate).toLocaleDateString("pt-BR")}
                          {isOverdue && " ⚠️"}
                        </span>
                      ) : <span className="text-gray-400">—</span>}
                    </TableTd>
                    <TableTd><span className="text-gray-600 dark:text-gray-400">{t._count.checklistItems > 0 ? `${t._count.checklistItems} itens` : "—"}</span></TableTd>
                    <TableTd>
                      <Link href={`/admin/tasks/${t.id}`} className="text-violet-400 hover:underline text-xs font-medium">Ver</Link>
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
