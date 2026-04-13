"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireInternalAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PatientLeadStatus, AttendanceOrigin } from "@prisma/client";

const patientLeadSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  notes: z.string().optional(),
  source: z.string().optional(),
});

export async function createPatientLeadAction(_prev: { error?: string }, formData: FormData) {
  const session = await requireInternalAuth();

  const parsed = patientLeadSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    notes: formData.get("notes"),
    source: formData.get("source"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const clientId       = formData.get("clientId") as string;
  const origin         = (formData.get("origin") as AttendanceOrigin) || "other";
  const treatmentValue = formData.get("treatmentValue") as string;

  if (!clientId) return { error: "Selecione um cliente (doutora)" };

  const lead = await prisma.patientLead.create({
    data: {
      ...parsed.data,
      clientId,
      origin,
      treatmentValue: treatmentValue ? parseFloat(treatmentValue) : undefined,
      assigneeId: session.userId,
    },
  });

  revalidatePath("/admin/crm-cliente");
  redirect(`/admin/crm-cliente`);

  return { error: undefined };
}

export async function updatePatientLeadStatusAction(
  leadId: string,
  status: PatientLeadStatus,
  lostReason?: string
) {
  await requireInternalAuth();

  await prisma.patientLead.update({
    where: { id: leadId },
    data: { status, lostReason: lostReason ?? null },
  });

  revalidatePath("/admin/crm-cliente");
}

export async function updatePatientLeadAction(leadId: string, data: {
  name?: string;
  phone?: string;
  email?: string;
  notes?: string;
  source?: string;
  status?: PatientLeadStatus;
  origin?: AttendanceOrigin;
  treatmentValue?: number | null;
  lostReason?: string | null;
  scheduledAt?: string | null;
}) {
  await requireInternalAuth();

  await prisma.patientLead.update({
    where: { id: leadId },
    data: {
      ...data,
      treatmentValue: data.treatmentValue ?? undefined,
      lostReason: data.lostReason ?? undefined,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
    },
  });

  revalidatePath("/admin/crm-cliente");
}

export async function deletePatientLeadAction(leadId: string) {
  await requireInternalAuth();

  await prisma.patientLead.delete({ where: { id: leadId } });

  revalidatePath("/admin/crm-cliente");
}
