"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireInternalAuth } from "@/lib/auth";
import { createContract, updateContractStatus } from "@/services/contracts";
import { ContractStatus } from "@prisma/client";

export async function createContractAction(_prev: { error?: string }, formData: FormData) {
  const session = await requireInternalAuth();

  const title = formData.get("title") as string;
  const clientId = formData.get("clientId") as string;

  if (!title?.trim()) return { error: "Título obrigatório" };
  if (!clientId) return { error: "Cliente obrigatório" };

  const contract = await createContract({
    title,
    clientId,
    proposalId: (formData.get("proposalId") as string) || undefined,
    startDate: (formData.get("startDate") as string) || undefined,
    endDate: (formData.get("endDate") as string) || undefined,
    value: (formData.get("value") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
    creatorId: session.userId,
  });

  redirect(`/admin/contracts/${contract.id}`);
}

export async function updateContractStatusAction(contractId: string, status: ContractStatus) {
  await requireInternalAuth();
  await updateContractStatus(contractId, status);
  revalidatePath(`/admin/contracts/${contractId}`);
  revalidatePath("/admin/contracts");
}
