"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

// ─── Services ────────────────────────────────────────────────────────────────

export async function addServiceAction(
  _prev: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await getSession();
  if (!session?.clientId) redirect("/portal/login");

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Nome do serviço é obrigatório" };

  const priceRaw = formData.get("price") as string;
  const price = priceRaw ? parseFloat(priceRaw.replace(",", ".")) : null;

  await prisma.clientService.create({
    data: {
      clientId: session.clientId,
      name,
      description: (formData.get("description") as string)?.trim() || null,
      price: price && !isNaN(price) ? price : null,
    },
  });

  revalidatePath("/portal/atendimentos");
  return { success: true };
}

export async function toggleServiceAction(serviceId: string, isActive: boolean) {
  const session = await getSession();
  if (!session?.clientId) redirect("/portal/login");

  await prisma.clientService.updateMany({
    where: { id: serviceId, clientId: session.clientId },
    data: { isActive },
  });

  revalidatePath("/portal/atendimentos");
}

export async function deleteServiceAction(serviceId: string) {
  const session = await getSession();
  if (!session?.clientId) redirect("/portal/login");

  await prisma.clientService.deleteMany({
    where: { id: serviceId, clientId: session.clientId },
  });

  revalidatePath("/portal/atendimentos");
}

// ─── Attendances ─────────────────────────────────────────────────────────────

export async function addAttendanceAction(
  _prev: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await getSession();
  if (!session?.clientId) redirect("/portal/login");

  const serviceId = formData.get("serviceId") as string || null;
  const customService = (formData.get("customService") as string)?.trim() || null;
  const status = formData.get("status") as "scheduled" | "closed" | "not_closed" | "follow_up";
  const origin = formData.get("origin") as "meta_ads" | "google_ads" | "instagram" | "google_organic" | "referral" | "organic" | "other";
  const leadName = (formData.get("leadName") as string)?.trim() || null;
  const leadPhone = (formData.get("leadPhone") as string)?.trim() || null;
  const contactDateRaw = formData.get("contactDate") as string;
  const contactDate = contactDateRaw ? new Date(contactDateRaw) : new Date();
  const period = `${contactDate.getFullYear()}-${String(contactDate.getMonth() + 1).padStart(2, "0")}`;

  const valueQuotedRaw = formData.get("valueQuoted") as string;
  const valueClosedRaw = formData.get("valueClosed") as string;
  const valueQuoted = valueQuotedRaw ? parseFloat(valueQuotedRaw.replace(",", ".")) : null;
  const valueClosed = valueClosedRaw ? parseFloat(valueClosedRaw.replace(",", ".")) : null;

  const followUpCount = parseInt(formData.get("followUpCount") as string || "0") || 0;
  const lostReason = (formData.get("lostReason") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  // If serviceId is "outro" or empty, treat as no service link
  const resolvedServiceId = serviceId && serviceId !== "outro" ? serviceId : null;

  await prisma.attendance.create({
    data: {
      clientId: session.clientId,
      serviceId: resolvedServiceId,
      leadName,
      leadPhone,
      // Store custom service name in notes if no catalog service
      notes: resolvedServiceId ? notes : [customService ? `Serviço: ${customService}` : null, notes].filter(Boolean).join(" | ") || null,
      valueQuoted: valueQuoted && !isNaN(valueQuoted) ? valueQuoted : null,
      valueClosed: valueClosed && !isNaN(valueClosed) && status === "closed" ? valueClosed : null,
      status,
      lostReason: status === "not_closed" ? lostReason : null,
      followUpCount,
      origin,
      contactDate,
      period,
    },
  });

  revalidatePath("/portal/atendimentos");
  return { success: true };
}

export async function deleteAttendanceAction(attendanceId: string) {
  const session = await getSession();
  if (!session?.clientId) redirect("/portal/login");

  await prisma.attendance.deleteMany({
    where: { id: attendanceId, clientId: session.clientId },
  });

  revalidatePath("/portal/atendimentos");
}
