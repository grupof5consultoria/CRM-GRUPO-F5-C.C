import { notFound } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { getTaskById, TASK_STATUS_LABELS, TASK_STATUS_VARIANTS } from "@/services/tasks";
import { TaskStatusActions } from "./TaskStatusActions";
import { ChecklistSection } from "./ChecklistSection";
import { CommentsSection } from "./CommentsSection";

interface PageProps { params: Promise<{ id: string }> }

export default async function TaskDetailPage({ params }: PageProps) {
  const { id } = await params;
  const task = await getTaskById(id);
  if (!task) notFound();

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done" && task.status !== "cancelled";
  const doneItems = task.checklistItems.filter((i) => i.isDone).length;

  return (
    <>
      <Topbar title="Detalhe da Tarefa" />
      <main className="flex-1 p-6">
        <div className="mb-4">
          <Link href="/admin/tasks" className="text-sm text-blue-600 hover:underline">← Voltar</Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <CardTitle>{task.title}</CardTitle>
                  <Badge variant={TASK_STATUS_VARIANTS[task.status]}>{TASK_STATUS_LABELS[task.status]}</Badge>
                </div>
                {task.description && <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">{task.description}</p>}
              </CardHeader>
            </Card>

            {/* Checklist */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Checklist</CardTitle>
                  {task.checklistItems.length > 0 && (
                    <span className="text-xs text-gray-500">{doneItems}/{task.checklistItems.length} concluídos</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ChecklistSection items={task.checklistItems} taskId={task.id} />
              </CardContent>
            </Card>

            {/* Comentários */}
            <Card>
              <CardHeader><CardTitle>Comentários</CardTitle></CardHeader>
              <CardContent>
                <CommentsSection comments={task.comments} taskId={task.id} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Status</CardTitle></CardHeader>
              <CardContent><TaskStatusActions taskId={task.id} currentStatus={task.status} /></CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Detalhes</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div><p className="text-gray-500">Responsável</p><p className="font-medium">{task.assignee.name}</p></div>
                {task.client && <div><p className="text-gray-500">Cliente</p><Link href={`/admin/clients/${task.client.id}`} className="text-blue-600 hover:underline font-medium">{task.client.name}</Link></div>}
                {task.dueDate && (
                  <div>
                    <p className="text-gray-500">Prazo</p>
                    <p className={`font-medium ${isOverdue ? "text-red-600" : ""}`}>
                      {new Date(task.dueDate).toLocaleDateString("pt-BR")}
                      {isOverdue && " ⚠️ Atrasada"}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500">Visível ao cliente</p>
                  <p className="font-medium">{task.isClientVisible ? "Sim" : "Não"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Criada em</p>
                  <p className="font-medium">{new Date(task.createdAt).toLocaleDateString("pt-BR")}</p>
                </div>
              </CardContent>
            </Card>

            {task.events.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Histórico</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {task.events.map((ev) => (
                    <div key={ev.id} className="text-xs text-gray-500">
                      <span>{new Date(ev.createdAt).toLocaleString("pt-BR")}</span>
                      <p className="text-gray-700">{ev.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
