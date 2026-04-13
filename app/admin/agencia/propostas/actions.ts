"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireInternalAuth } from "@/lib/auth";
import { createProposal, updateProposalStatus } from "@/services/agencia";

export async function createProposalAction(_prev: { error?: string }, formData: FormData) {
  await requireInternalAuth();

  const clientId = formData.get("clientId") as string;
  if (!clientId) return { error: "Selecione um cliente" };

  const plan = formData.get("plan") as string;
  if (!plan) return { error: "Selecione o plano" };

  const discountApplied = formData.get("discountApplied") === "true";
  const adBudgetRaw = formData.get("adBudget") as string;

  await createProposal({
    clientId,
    plan,
    discountApplied,
    adBudget: adBudgetRaw ? parseFloat(adBudgetRaw) : undefined,
    notes: (formData.get("notes") as string) || undefined,
  });

  revalidatePath("/admin/agencia/propostas");
  redirect("/admin/agencia/propostas");
}

export async function updateProposalStatusAction(id: string, status: string) {
  await requireInternalAuth();
  await updateProposalStatus(id, status);
  revalidatePath("/admin/agencia/propostas");
}

export async function createClientForProposalAction(name: string, email?: string, phone?: string) {
  await requireInternalAuth();
  const { prisma } = await import("@/lib/prisma");
  const client = await prisma.client.create({
    data: { name, email: email || null, phone: phone || null, status: "active" },
    select: { id: true, name: true },
  });
  return client;
}
