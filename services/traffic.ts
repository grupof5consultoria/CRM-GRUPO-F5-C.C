import { prisma } from "@/lib/prisma";

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function getTrafficSettings(clientId: string) {
  return prisma.trafficSettings.findUnique({ where: { clientId } });
}

export async function upsertTrafficSettings(clientId: string, data: {
  platforms?: string[];
  caMeta?: string | null;
  caGoogle?: string | null;
  dailyBudget?: number | null;
  monthlyBudget?: number | null;
  driveLink?: string | null;
}) {
  return prisma.trafficSettings.upsert({
    where: { clientId },
    create: { clientId, ...data },
    update: data,
  });
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const TRAFFIC_TASK_TYPES = [
  { type: "optimization_daily",   title: "Otimização Diária",       frequency: "daily" },
  { type: "optimization_weekly",  title: "Otimização Semanal",      frequency: "weekly" },
  { type: "optimization_monthly", title: "Otimização Mensal",       frequency: "monthly" },
  { type: "report_weekly",        title: "Relatório Semanal",       frequency: "weekly" },
  { type: "report_monthly",       title: "Relatório Mensal",        frequency: "monthly" },
  { type: "measurement",          title: "Mensuração",              frequency: "monthly" },
  { type: "audience_update",      title: "Atualização de Públicos", frequency: "monthly" },
  { type: "instagram_check",      title: "Análise do Instagram",    frequency: "weekly" },
] as const;

export async function getTrafficTasks(clientId: string) {
  return prisma.trafficTask.findMany({
    where: { clientId },
    orderBy: { createdAt: "asc" },
  });
}

export async function createDefaultTrafficTasks(clientId: string) {
  // Only create if none exist yet
  const existing = await prisma.trafficTask.count({ where: { clientId } });
  if (existing > 0) return;

  await prisma.trafficTask.createMany({
    data: TRAFFIC_TASK_TYPES.map(t => ({
      clientId,
      type: t.type,
      title: t.title,
      frequency: t.frequency,
    })),
  });
}

export async function updateTrafficTask(taskId: string, data: {
  status?: string;
  assignedTo?: string | null;
  comment?: string | null;
  dueDate?: Date | null;
  completedAt?: Date | null | undefined;
}) {
  // Remove undefined keys so Prisma doesn't overwrite with undefined
  const payload = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
  return prisma.trafficTask.update({ where: { id: taskId }, data: payload });
}

// ─── Campaign Optimizations ───────────────────────────────────────────────────

export async function getCampaignOptimizations(clientId: string) {
  return prisma.campaignOptimization.findMany({
    where: { clientId },
    orderBy: { date: "desc" },
  });
}

export async function createCampaignOptimization(clientId: string, data: {
  date: string;
  platform: string;
  campaignName?: string;
  description?: string;
  frequencyType?: string;
  assignedTo?: string;
  comment?: string;
}) {
  return prisma.campaignOptimization.create({ data: { clientId, ...data } });
}

export async function updateCampaignOptimization(id: string, data: {
  date?: string;
  platform?: string;
  campaignName?: string | null;
  description?: string | null;
  frequencyType?: string | null;
  assignedTo?: string | null;
  comment?: string | null;
}) {
  return prisma.campaignOptimization.update({ where: { id }, data });
}

export async function deleteCampaignOptimization(id: string) {
  return prisma.campaignOptimization.delete({ where: { id } });
}

// ─── Audience Updates ─────────────────────────────────────────────────────────

export async function getAudienceUpdates(clientId: string) {
  return prisma.audienceUpdate.findMany({
    where: { clientId },
    orderBy: [{ audienceType: "asc" }, { createdAt: "asc" }],
  });
}

export async function createAudienceUpdate(clientId: string, data: {
  audienceType: string;
  name: string;
  windowDays?: number | null;
  assignedTo?: string | null;
  comment?: string | null;
  lastUpdated?: Date | null;
}) {
  return prisma.audienceUpdate.create({ data: { clientId, ...data } });
}

export async function updateAudienceUpdate(id: string, data: {
  name?: string;
  windowDays?: number | null;
  assignedTo?: string | null;
  comment?: string | null;
  lastUpdated?: Date | null;
}) {
  return prisma.audienceUpdate.update({ where: { id }, data });
}

export async function deleteAudienceUpdate(id: string) {
  return prisma.audienceUpdate.delete({ where: { id } });
}

// ─── Instagram Tracking ───────────────────────────────────────────────────────

export async function getInstagramTracking(clientId: string) {
  return prisma.instagramTracking.findMany({
    where: { clientId },
    orderBy: { weekReference: "desc" },
  });
}

export async function upsertInstagramTracking(clientId: string, data: {
  weekReference: string;
  postedDaily?: string | null;
  postedWeekly?: boolean | null;
  assignedTo?: string | null;
  comment?: string | null;
}) {
  return prisma.instagramTracking.upsert({
    where: { clientId_weekReference: { clientId, weekReference: data.weekReference } },
    create: { clientId, ...data },
    update: { postedDaily: data.postedDaily, postedWeekly: data.postedWeekly, assignedTo: data.assignedTo, comment: data.comment },
  });
}

export async function deleteInstagramTracking(id: string) {
  return prisma.instagramTracking.delete({ where: { id } });
}
