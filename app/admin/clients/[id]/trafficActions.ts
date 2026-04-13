"use server";

import { revalidatePath } from "next/cache";
import { requireInternalAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  upsertTrafficSettings,
  createDefaultTrafficTasks,
  updateTrafficTask,
  createCampaignOptimization,
  updateCampaignOptimization,
  deleteCampaignOptimization,
  createAudienceUpdate,
  updateAudienceUpdate,
  deleteAudienceUpdate,
  upsertInstagramTracking,
  deleteInstagramTracking,
} from "@/services/traffic";

function nextDueDate(frequency: string | null | undefined): Date {
  const now = new Date();
  if (frequency === "daily")   { now.setDate(now.getDate() + 1); return now; }
  if (frequency === "weekly")  { now.setDate(now.getDate() + 7); return now; }
  if (frequency === "monthly") { now.setMonth(now.getMonth() + 1); return now; }
  return now;
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function saveTrafficSettingsAction(
  _prev: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  await requireInternalAuth();

  const clientId = formData.get("clientId") as string;
  const platforms = formData.getAll("platforms") as string[];
  const dailyRaw = formData.get("dailyBudget") as string;
  const monthlyRaw = formData.get("monthlyBudget") as string;

  await upsertTrafficSettings(clientId, {
    platforms,
    caMeta: (formData.get("caMeta") as string) || null,
    caGoogle: (formData.get("caGoogle") as string) || null,
    dailyBudget: dailyRaw ? parseFloat(dailyRaw.replace(",", ".")) : null,
    monthlyBudget: monthlyRaw ? parseFloat(monthlyRaw.replace(",", ".")) : null,
    driveLink: (formData.get("driveLink") as string) || null,
  });

  // Auto-create default recurring tasks if first time
  await createDefaultTrafficTasks(clientId);

  revalidatePath(`/admin/clients/${clientId}`);
  return { success: true };
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export async function updateTrafficTaskAction(
  taskId: string,
  clientId: string,
  data: { status?: string; assignedTo?: string | null; comment?: string | null; dueDate?: string | null }
) {
  await requireInternalAuth();

  const task = await prisma.trafficTask.findUnique({ where: { id: taskId } });
  if (!task) return;

  const markingDone = data.status === "done" && task.status !== "done";

  await updateTrafficTask(taskId, {
    status: data.status,
    assignedTo: data.assignedTo,
    comment: data.comment,
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
    completedAt: markingDone ? new Date() : (data.status !== "done" ? null : undefined),
  });

  // Auto-generate next recurrence when task is marked done
  if (markingDone && task.frequency) {
    await prisma.trafficTask.create({
      data: {
        clientId,
        type: task.type,
        title: task.title,
        frequency: task.frequency,
        assignedTo: data.assignedTo ?? task.assignedTo,
        status: "pending",
        dueDate: nextDueDate(task.frequency),
      },
    });
  }

  revalidatePath(`/admin/tasks/traffic/${clientId}`);
}

// ─── Optimizations ────────────────────────────────────────────────────────────

export async function addOptimizationAction(
  _prev: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  await requireInternalAuth();

  const clientId = formData.get("clientId") as string;
  const platform = formData.get("platform") as string;
  const date = formData.get("date") as string;

  if (!platform || !date) return { error: "Plataforma e data são obrigatórias" };

  await createCampaignOptimization(clientId, {
    date,
    platform,
    campaignName: (formData.get("campaignName") as string) || undefined,
    description: (formData.get("description") as string) || undefined,
    frequencyType: (formData.get("frequencyType") as string) || undefined,
    assignedTo: (formData.get("assignedTo") as string) || undefined,
    comment: (formData.get("comment") as string) || undefined,
  });

  revalidatePath(`/admin/clients/${clientId}`);
  return { success: true };
}

export async function deleteOptimizationAction(id: string, clientId: string) {
  await requireInternalAuth();
  await deleteCampaignOptimization(id);
  revalidatePath(`/admin/clients/${clientId}`);
}

// ─── Audiences ────────────────────────────────────────────────────────────────

export async function addAudienceAction(
  _prev: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  await requireInternalAuth();

  const clientId = formData.get("clientId") as string;
  const audienceType = formData.get("audienceType") as string;
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Nome do público é obrigatório" };

  const windowDaysRaw = formData.get("windowDays") as string;
  const lastUpdatedRaw = formData.get("lastUpdated") as string;

  await createAudienceUpdate(clientId, {
    audienceType,
    name,
    windowDays: windowDaysRaw ? parseInt(windowDaysRaw) : null,
    assignedTo: (formData.get("assignedTo") as string) || null,
    comment: (formData.get("comment") as string) || null,
    lastUpdated: lastUpdatedRaw ? new Date(lastUpdatedRaw) : null,
  });

  revalidatePath(`/admin/tasks/traffic/${clientId}`);
  revalidatePath(`/admin/tasks/traffic`);
  return { success: true };
}

export async function updateAudienceAction(
  _prev: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  await requireInternalAuth();

  const id = formData.get("id") as string;
  const clientId = formData.get("clientId") as string;
  const windowDaysRaw = formData.get("windowDays") as string;
  const lastUpdatedRaw = formData.get("lastUpdated") as string;

  await updateAudienceUpdate(id, {
    name: (formData.get("name") as string)?.trim() || undefined,
    windowDays: windowDaysRaw ? parseInt(windowDaysRaw) : null,
    assignedTo: (formData.get("assignedTo") as string) || null,
    comment: (formData.get("comment") as string) || null,
    lastUpdated: lastUpdatedRaw ? new Date(lastUpdatedRaw) : null,
  });

  revalidatePath(`/admin/tasks/traffic/${clientId}`);
  revalidatePath(`/admin/tasks/traffic`);
  return { success: true };
}

export async function deleteAudienceAction(id: string, clientId: string) {
  await requireInternalAuth();
  await deleteAudienceUpdate(id);
  revalidatePath(`/admin/tasks/traffic/${clientId}`);
  revalidatePath(`/admin/tasks/traffic`);
}

// ─── Instagram ────────────────────────────────────────────────────────────────

export async function saveInstagramTrackingAction(
  _prev: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  await requireInternalAuth();

  const clientId = formData.get("clientId") as string;
  const weekReference = formData.get("weekReference") as string;

  if (!weekReference) return { error: "Semana de referência obrigatória" };

  const postedWeeklyRaw = formData.get("postedWeekly") as string;

  await upsertInstagramTracking(clientId, {
    weekReference,
    postedDaily: (formData.get("postedDaily") as string) || null,
    postedWeekly: postedWeeklyRaw ? postedWeeklyRaw === "true" : null,
    assignedTo: (formData.get("assignedTo") as string) || null,
    comment: (formData.get("comment") as string) || null,
  });

  revalidatePath(`/admin/clients/${clientId}`);
  return { success: true };
}

export async function deleteInstagramTrackingAction(id: string, clientId: string) {
  await requireInternalAuth();
  await deleteInstagramTracking(id);
  revalidatePath(`/admin/clients/${clientId}`);
}
