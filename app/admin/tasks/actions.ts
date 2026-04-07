"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireInternalAuth } from "@/lib/auth";
import { createTask, updateTaskStatus, toggleChecklistItem, addChecklistItem, addTaskComment } from "@/services/tasks";
import { TaskStatus } from "@prisma/client";

export async function createTaskAction(_prev: { error?: string }, formData: FormData) {
  const session = await requireInternalAuth();

  const title = formData.get("title") as string;
  if (!title?.trim()) return { error: "Título obrigatório" };

  const task = await createTask({
    title,
    description: (formData.get("description") as string) || undefined,
    assigneeId: (formData.get("assigneeId") as string) || session.userId,
    clientId: (formData.get("clientId") as string) || undefined,
    dueDate: (formData.get("dueDate") as string) || undefined,
    isClientVisible: formData.get("isClientVisible") === "on",
  });

  redirect(`/admin/tasks/${task.id}`);
}

export async function updateTaskStatusAction(taskId: string, status: TaskStatus) {
  const session = await requireInternalAuth();
  await updateTaskStatus(taskId, status, session.userId);
  revalidatePath(`/admin/tasks/${taskId}`);
  revalidatePath("/admin/tasks");
}

export async function toggleChecklistItemAction(itemId: string, isDone: boolean, taskId: string) {
  await requireInternalAuth();
  await toggleChecklistItem(itemId, isDone);
  revalidatePath(`/admin/tasks/${taskId}`);
}

export async function addChecklistItemAction(_prev: { error?: string }, formData: FormData) {
  await requireInternalAuth();
  const taskId = formData.get("taskId") as string;
  const text = formData.get("text") as string;
  if (!text?.trim()) return { error: "Texto obrigatório" };
  await addChecklistItem(taskId, text);
  revalidatePath(`/admin/tasks/${taskId}`);
  return { error: undefined };
}

export async function addCommentAction(_prev: { error?: string }, formData: FormData) {
  const session = await requireInternalAuth();
  const taskId = formData.get("taskId") as string;
  const content = formData.get("content") as string;
  if (!content?.trim()) return { error: "Comentário obrigatório" };
  await addTaskComment(taskId, session.userId, content);
  revalidatePath(`/admin/tasks/${taskId}`);
  return { error: undefined };
}
