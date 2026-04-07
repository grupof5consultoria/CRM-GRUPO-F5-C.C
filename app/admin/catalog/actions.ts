"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireInternalAuth } from "@/lib/auth";
import { createService, updateService } from "@/services/catalog";
import { ChargeType } from "@prisma/client";

const serviceSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Categoria obrigatória"),
  defaultHours: z.string().optional(),
  defaultValue: z.string().min(1, "Valor obrigatório"),
  chargeType: z.enum(["one_time", "recurring", "hourly"]),
});

export async function createServiceAction(_prev: { error?: string }, formData: FormData) {
  await requireInternalAuth();

  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    defaultHours: formData.get("defaultHours"),
    defaultValue: formData.get("defaultValue"),
    chargeType: formData.get("chargeType"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await createService(parsed.data as { name: string; description?: string; categoryId: string; defaultHours?: string; defaultValue: string; chargeType: ChargeType });

  revalidatePath("/admin/catalog");
  return { error: undefined };
}

export async function updateServiceAction(_prev: { error?: string }, formData: FormData) {
  await requireInternalAuth();

  const id = formData.get("id") as string;
  const isActive = formData.get("isActive") === "true";

  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    defaultHours: formData.get("defaultHours"),
    defaultValue: formData.get("defaultValue"),
    chargeType: formData.get("chargeType"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await updateService(id, { ...parsed.data, isActive } as Parameters<typeof updateService>[1]);

  revalidatePath("/admin/catalog");
  return { error: undefined };
}

export async function toggleServiceAction(id: string, isActive: boolean) {
  await requireInternalAuth();
  await updateService(id, { isActive: !isActive });
  revalidatePath("/admin/catalog");
}
