"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireInternalAuth } from "@/lib/auth";
import { createLead, updateLead, addLeadActivity, getLeadById } from "@/services/leads";
import { LeadStatus } from "@prisma/client";

const leadSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
  nextFollowUp: z.string().optional(),
});

export async function createLeadAction(_prev: { error?: string }, formData: FormData) {
  const session = await requireInternalAuth();

  const parsed = leadSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    company: formData.get("company"),
    notes: formData.get("notes"),
    nextFollowUp: formData.get("nextFollowUp"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const valueRaw = formData.get("value") as string;
  const source   = (formData.get("source") as string) || undefined;
  const platforms = formData.getAll("platforms") as string[];

  const lead = await createLead({
    ...parsed.data,
    value: valueRaw ? parseFloat(valueRaw) : undefined,
    source,
    platforms,
    ownerId: session.userId,
  });

  await addLeadActivity({
    leadId: lead.id,
    userId: session.userId,
    type: "created",
    description: "Lead criado no sistema.",
  });

  revalidatePath("/admin/crm");
  redirect(`/admin/crm/${lead.id}`);
}

export async function updateLeadAction(_prev: { error?: string }, formData: FormData) {
  const session = await requireInternalAuth();

  const id     = formData.get("id") as string;
  const status = formData.get("status") as LeadStatus | null;

  const parsed = leadSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    company: formData.get("company"),
    notes: formData.get("notes"),
    nextFollowUp: formData.get("nextFollowUp"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const lostReason = formData.get("lostReason") as string | null;
  const valueRaw   = formData.get("value") as string;
  const source     = (formData.get("source") as string) || null;
  const platforms  = formData.getAll("platforms") as string[];

  await updateLead(id, {
    ...parsed.data,
    status: status ?? undefined,
    lostReason: lostReason ?? undefined,
    value: valueRaw ? parseFloat(valueRaw) : null,
    source,
    platforms,
  });

  await addLeadActivity({
    leadId: id,
    userId: session.userId,
    type: "updated",
    description: "Informações do lead atualizadas.",
  });

  revalidatePath(`/admin/crm/${id}`);
  revalidatePath("/admin/crm");
  return { error: undefined };
}

export async function addActivityAction(_prev: { error?: string }, formData: FormData) {
  const session = await requireInternalAuth();

  const leadId = formData.get("leadId") as string;
  const type = formData.get("type") as string;
  const description = formData.get("description") as string;

  if (!description?.trim()) return { error: "Descrição obrigatória" };

  await addLeadActivity({ leadId, userId: session.userId, type, description });

  revalidatePath(`/admin/crm/${leadId}`);
  return { error: undefined };
}

export async function updateLeadStatusAction(leadId: string, status: LeadStatus, lostReason?: string) {
  const session = await requireInternalAuth();

  await updateLead(leadId, { status, lostReason });

  await addLeadActivity({
    leadId,
    userId: session.userId,
    type: "status_changed",
    description: `Status alterado para: ${status}${lostReason ? ` — Motivo: ${lostReason}` : ""}`,
  });

  revalidatePath(`/admin/crm/${leadId}`);
  revalidatePath("/admin/crm");
}

export async function updateLeadQuickAction(leadId: string, data: {
  status?: LeadStatus;
  nextFollowUp?: string | null;
  notes?: string;
  platforms?: string[];
  value?: number | null;
  source?: string | null;
}) {
  const session = await requireInternalAuth();

  await updateLead(leadId, {
    ...(data.status ? { status: data.status } : {}),
    ...(data.nextFollowUp !== undefined ? { nextFollowUp: data.nextFollowUp ?? undefined } : {}),
    ...(data.notes !== undefined ? { notes: data.notes } : {}),
    ...(data.platforms !== undefined ? { platforms: data.platforms } : {}),
    ...(data.value !== undefined ? { value: data.value } : {}),
    ...(data.source !== undefined ? { source: data.source } : {}),
  });

  if (data.status) {
    await addLeadActivity({
      leadId,
      userId: session.userId,
      type: "status_changed",
      description: `Status alterado para: ${data.status}`,
    });
  }

  revalidatePath(`/admin/crm/${leadId}`);
  revalidatePath("/admin/crm");
}

export async function getLeadDetailsAction(leadId: string) {
  await requireInternalAuth();
  return getLeadById(leadId);
}
