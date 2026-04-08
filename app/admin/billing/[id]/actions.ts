"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireInternalAuth } from "@/lib/auth";
import { updateCharge } from "@/services/billing";
import { PaymentMethod } from "@prisma/client";

export async function updateChargeAction(_prev: { error?: string }, formData: FormData) {
  await requireInternalAuth();

  const id = formData.get("id") as string;
  const description = formData.get("description") as string;
  const value = formData.get("value") as string;
  const dueDate = formData.get("dueDate") as string;
  const paymentMethod = formData.get("paymentMethod") as PaymentMethod;
  const isRecurring = formData.get("isRecurring") === "true";
  const recurrenceDayRaw = formData.get("recurrenceDay") as string;

  if (!description?.trim()) return { error: "Descrição obrigatória" };
  if (!value || parseFloat(value) <= 0) return { error: "Valor inválido" };
  if (!dueDate) return { error: "Data de vencimento obrigatória" };

  await updateCharge(id, {
    description,
    value: parseFloat(value),
    dueDate: new Date(dueDate),
    paymentMethod,
    isRecurring,
    recurrenceDay: recurrenceDayRaw ? parseInt(recurrenceDayRaw) : null,
  });

  revalidatePath("/admin/billing");
  redirect("/admin/billing");
}
