"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireInternalAuth } from "@/lib/auth";
import { createClient, updateClient, addClientContact, deleteClientContact, updateClientHealth } from "@/services/clients";
import { ClientStatus, ClientHealth } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createOnboardingForClient } from "@/app/actions/onboarding";
import { createCharge } from "@/services/billing";
import { createGatewayCharge } from "@/lib/gateway";

export async function createClientAction(_prev: { error?: string }, formData: FormData) {
  const session = await requireInternalAuth();

  const name = formData.get("name") as string;
  if (!name?.trim()) return { error: "Nome obrigatório" };

  const monthlyValueRaw = formData.get("monthlyValue") as string;
  const dueDayRaw = formData.get("dueDay") as string;
  const dueDay = dueDayRaw ? parseInt(dueDayRaw) : 10;

  const client = await createClient({
    name,
    email: (formData.get("email") as string) || undefined,
    phone: (formData.get("phone") as string) || undefined,
    document: (formData.get("document") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
    monthlyValue: monthlyValueRaw ? parseFloat(monthlyValueRaw.replace(",", ".")) : undefined,
    startDate: (formData.get("startDate") as string) || undefined,
    ownerId: (formData.get("ownerId") as string) || session.userId,
    source: (formData.get("source") as string) || undefined,
  });

  await createOnboardingForClient(client.id);

  // Auto-generate first recurring charge if monthlyValue was provided
  if (monthlyValueRaw && parseFloat(monthlyValueRaw.replace(",", ".")) > 0) {
    const value = parseFloat(monthlyValueRaw.replace(",", "."));
    const now = new Date();
    const MONTHS_PT = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
    ];
    const monthLabel = `${MONTHS_PT[now.getMonth()]}/${now.getFullYear()}`;
    const description = `Mensalidade ${monthLabel}`;

    // Due date = current month + dueDay
    const dueDate = new Date(now.getFullYear(), now.getMonth(), dueDay);
    // If the day has already passed this month, push to next month
    if (dueDate < now) dueDate.setMonth(dueDate.getMonth() + 1);
    const dueDateStr = dueDate.toISOString().split("T")[0];

    const charge = await createCharge({
      clientId: client.id,
      description,
      value: String(value),
      dueDate: dueDateStr,
      paymentMethod: "pix",
      isRecurring: true,
      recurrenceDay: dueDay,
    });

    // Try to send to payment gateway
    const gatewayResult = await createGatewayCharge({
      customerName: name,
      customerEmail: (formData.get("email") as string) || undefined,
      customerDocument: (formData.get("document") as string) || undefined,
      description,
      value,
      dueDate: dueDateStr,
      internalChargeId: charge.id,
    });

    if (gatewayResult) {
      await prisma.charge.update({
        where: { id: charge.id },
        data: { externalId: gatewayResult.externalId, paymentLink: gatewayResult.paymentLink },
      });
    }
  }

  redirect(`/admin/clients/${client.id}`);
}

export async function updateClientAction(_prev: { error?: string }, formData: FormData) {
  await requireInternalAuth();

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  if (!name?.trim()) return { error: "Nome obrigatório" };

  const monthlyValueRaw = formData.get("monthlyValue") as string;
  const startDateRaw = formData.get("startDate") as string;
  await updateClient(id, {
    name,
    email: (formData.get("email") as string) || undefined,
    phone: (formData.get("phone") as string) || undefined,
    document: (formData.get("document") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
    status: (formData.get("status") as ClientStatus) || undefined,
    ownerId: (formData.get("ownerId") as string) || undefined,
    monthlyValue: monthlyValueRaw ? parseFloat(monthlyValueRaw.replace(",", ".")) : null,
    startDate: startDateRaw ? new Date(startDateRaw) : null,
    source: (formData.get("source") as string) || null,
  });

  revalidatePath(`/admin/clients/${id}`);
  return { error: undefined };
}

export async function addContactAction(_prev: { error?: string }, formData: FormData) {
  await requireInternalAuth();

  const clientId = formData.get("clientId") as string;
  const name = formData.get("name") as string;
  if (!name?.trim()) return { error: "Nome obrigatório" };

  await addClientContact({
    clientId,
    name,
    email: (formData.get("email") as string) || undefined,
    phone: (formData.get("phone") as string) || undefined,
    role: (formData.get("role") as string) || undefined,
    isPrimary: formData.get("isPrimary") === "true",
  });

  revalidatePath(`/admin/clients/${clientId}`);
  return { error: undefined };
}

export async function deleteContactAction(contactId: string, clientId: string) {
  await requireInternalAuth();
  await deleteClientContact(contactId);
  revalidatePath(`/admin/clients/${clientId}`);
}

export async function updateClientHealthAction(clientId: string, health: ClientHealth, note?: string) {
  await requireInternalAuth();
  await updateClientHealth(clientId, health, note);
  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/admin/clients");
}

// ─── Portal access ────────────────────────────────────────────────────────────

export async function createPortalAccessAction(
  _prev: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  await requireInternalAuth();

  const clientId = formData.get("clientId") as string;
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!name || !email || !password) return { error: "Nome, email e senha são obrigatórios" };
  if (password.length < 6) return { error: "Senha deve ter ao menos 6 caracteres" };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Já existe um usuário com esse email" };

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "client_admin",
      isActive: true,
    },
  });

  await prisma.clientUser.create({
    data: { clientId, userId: user.id },
  });

  revalidatePath(`/admin/clients/${clientId}`);
  return { success: true };
}

export async function resetPortalPasswordAction(
  _prev: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  await requireInternalAuth();

  const userId = formData.get("userId") as string;
  const clientId = formData.get("clientId") as string;
  const password = formData.get("password") as string;

  if (!password || password.length < 6) return { error: "Senha deve ter ao menos 6 caracteres" };

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  revalidatePath(`/admin/clients/${clientId}`);
  return { success: true };
}

export async function churnClientAction(
  clientId: string,
  churnReason: string,
  churnNote: string,
): Promise<{ error?: string }> {
  await requireInternalAuth();

  if (!churnReason?.trim()) return { error: "Informe o motivo da saída" };

  await prisma.client.update({
    where: { id: clientId },
    data: {
      status: "inactive",
      churnReason,
      churnNote: churnNote || null,
      churnedAt: new Date(),
    },
  });

  await prisma.clientHealthLog.create({
    data: {
      clientId,
      health: "at_risk",
      note: `Cliente encerrado. Motivo: ${churnReason}${churnNote ? ` — ${churnNote}` : ""}`,
    },
  });

  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/admin/clients");
  return {};
}

export async function deletePortalAccessAction(clientUserId: string, userId: string, clientId: string) {
  await requireInternalAuth();
  await prisma.clientUser.delete({ where: { id: clientUserId } });
  // Only delete the user if they have no other client links
  const otherLinks = await prisma.clientUser.count({ where: { userId } });
  if (otherLinks === 0) await prisma.user.delete({ where: { id: userId } });
  revalidatePath(`/admin/clients/${clientId}`);
}
