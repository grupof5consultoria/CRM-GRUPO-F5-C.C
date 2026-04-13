"use server";

import { revalidatePath } from "next/cache";
import { requireInternalAuth } from "@/lib/auth";
import { createTeamMember, updateTeamMember, updateOffboardingItem } from "@/services/agencia";
import { TeamMemberRole, TeamMemberStatus } from "@prisma/client";

export async function createTeamMemberAction(_prev: { error?: string }, formData: FormData) {
  await requireInternalAuth();

  const name = formData.get("name") as string;
  if (!name?.trim()) return { error: "Nome obrigatório" };

  await createTeamMember({
    name,
    role: (formData.get("role") as TeamMemberRole) || "other",
    email: (formData.get("email") as string) || undefined,
    whatsapp: (formData.get("whatsapp") as string) || undefined,
    joinedAt: (formData.get("joinedAt") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  });

  revalidatePath("/admin/agencia/pessoas");
  return { error: undefined };
}

export async function updateTeamMemberAction(id: string, data: {
  status?: TeamMemberStatus;
  notes?: string;
}) {
  await requireInternalAuth();
  await updateTeamMember(id, data);
  revalidatePath("/admin/agencia/pessoas");
}

export async function toggleOffboardingAction(itemId: string, revoked: boolean) {
  await requireInternalAuth();
  await updateOffboardingItem(itemId, revoked);
  revalidatePath("/admin/agencia/pessoas");
}
