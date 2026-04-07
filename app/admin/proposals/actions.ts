"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireInternalAuth } from "@/lib/auth";
import { createProposal, upsertProposalItems, updateProposalStatus } from "@/services/proposals";
import { ProposalStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function createProposalAction(_prev: { error?: string }, formData: FormData) {
  const session = await requireInternalAuth();

  const title = formData.get("title") as string;
  if (!title?.trim()) return { error: "Título obrigatório" };

  const proposal = await createProposal({
    title,
    leadId: (formData.get("leadId") as string) || undefined,
    clientId: (formData.get("clientId") as string) || undefined,
    validUntil: (formData.get("validUntil") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
    creatorId: session.userId,
  });

  redirect(`/admin/proposals/${proposal.id}`);
}

export async function saveProposalItemsAction(_prev: { error?: string }, formData: FormData) {
  await requireInternalAuth();

  const proposalId = formData.get("proposalId") as string;
  const descriptions = formData.getAll("description") as string[];
  const quantities = formData.getAll("quantity") as string[];
  const unitValues = formData.getAll("unitValue") as string[];

  const items = descriptions
    .map((desc, i) => ({
      description: desc,
      quantity: parseFloat(quantities[i]) || 1,
      unitValue: parseFloat(unitValues[i]) || 0,
    }))
    .filter((item) => item.description.trim());

  if (items.length === 0) return { error: "Adicione pelo menos um item." };

  await upsertProposalItems(proposalId, items);

  // Atualiza notas e validade
  const notes = formData.get("notes") as string;
  const validUntil = formData.get("validUntil") as string;
  await prisma.proposal.update({
    where: { id: proposalId },
    data: {
      notes: notes || null,
      validUntil: validUntil ? new Date(validUntil) : null,
    },
  });

  revalidatePath(`/admin/proposals/${proposalId}`);
  return { error: undefined };
}

export async function changeProposalStatusAction(proposalId: string, status: ProposalStatus) {
  await requireInternalAuth();
  await updateProposalStatus(proposalId, status);
  revalidatePath(`/admin/proposals/${proposalId}`);
  revalidatePath("/admin/proposals");
}
