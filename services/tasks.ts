import { prisma } from "@/lib/prisma";
import { TaskStatus } from "@prisma/client";

export async function getTasks(filters?: { status?: TaskStatus; assigneeId?: string; clientId?: string }) {
  return prisma.task.findMany({
    where: {
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.assigneeId ? { assigneeId: filters.assigneeId } : {}),
      ...(filters?.clientId ? { clientId: filters.clientId } : {}),
    },
    include: {
      assignee: { select: { id: true, name: true } },
      client: { select: { id: true, name: true } },
      _count: { select: { checklistItems: true, comments: true } },
    },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
  });
}

export async function getTaskById(id: string) {
  return prisma.task.findUnique({
    where: { id },
    include: {
      assignee: { select: { id: true, name: true } },
      client: { select: { id: true, name: true } },
      checklistItems: { orderBy: { createdAt: "asc" } },
      comments: { orderBy: { createdAt: "asc" } },
      events: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function createTask(data: {
  title: string;
  description?: string;
  assigneeId: string;
  clientId?: string;
  dueDate?: string;
  isClientVisible?: boolean;
}) {
  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description || null,
      assigneeId: data.assigneeId,
      clientId: data.clientId || null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      isClientVisible: data.isClientVisible ?? false,
    },
  });

  await prisma.taskEvent.create({
    data: { taskId: task.id, type: "created", description: "Tarefa criada." },
  });

  return task;
}

export async function updateTaskStatus(taskId: string, status: TaskStatus, userId: string) {
  await prisma.task.update({ where: { id: taskId }, data: { status } });
  await prisma.taskEvent.create({
    data: {
      taskId,
      type: "status_changed",
      description: `Status alterado para: ${TASK_STATUS_LABELS[status]}`,
    },
  });
}

export async function toggleChecklistItem(id: string, isDone: boolean) {
  return prisma.taskChecklistItem.update({ where: { id }, data: { isDone } });
}

export async function addChecklistItem(taskId: string, text: string) {
  return prisma.taskChecklistItem.create({ data: { taskId, text } });
}

export async function addTaskComment(taskId: string, authorId: string, content: string) {
  return prisma.taskComment.create({ data: { taskId, authorId, content } });
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Pendente",
  in_progress: "Em Andamento",
  waiting_client: "Aguardando Cliente",
  done: "Concluída",
  cancelled: "Cancelada",
};

export const TASK_STATUS_VARIANTS: Record<TaskStatus, "default" | "success" | "warning" | "danger" | "info" | "gray"> = {
  pending: "gray",
  in_progress: "default",
  waiting_client: "warning",
  done: "success",
  cancelled: "danger",
};
