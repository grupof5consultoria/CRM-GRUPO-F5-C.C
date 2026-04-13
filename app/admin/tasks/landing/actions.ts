"use server";

import { revalidatePath } from "next/cache";
import { requireInternalAuth } from "@/lib/auth";
import {
  createLandingPageProject,
  updateLandingPageBriefing,
  updateLandingPagePhase,
} from "@/services/landingPage";

export async function createLandingPageAction(clientId: string, companyName: string) {
  await requireInternalAuth();
  await createLandingPageProject(clientId, companyName);
  revalidatePath(`/admin/tasks/landing`);
  revalidatePath(`/admin/tasks/landing/${clientId}`);
}

export async function saveBriefingAction(
  _prev: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  await requireInternalAuth();

  const projectId = formData.get("projectId") as string;
  const clientId  = formData.get("clientId") as string;
  const businessDays = formData.getAll("businessDays") as string[];

  await updateLandingPageBriefing(projectId, {
    companyName:    (formData.get("companyName") as string) || undefined,
    services:       (formData.get("services") as string) || null,
    colorPrimary:   (formData.get("colorPrimary") as string) || null,
    colorSecondary: (formData.get("colorSecondary") as string) || null,
    references:     (formData.get("references") as string) || null,
    domain:         (formData.get("domain") as string) || null,
    hasDomain:      formData.get("hasDomain") === "true",
    businessHours:  (formData.get("businessHours") as string) || null,
    businessDays,
    wantsBlog:      formData.get("wantsBlog") === "true",
    purpose:        (formData.get("purpose") as string) || null,
  });

  revalidatePath(`/admin/tasks/landing/${clientId}`);
  revalidatePath(`/admin/tasks/landing`);
  return { success: true };
}

export async function savePhaseAction(
  _prev: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  await requireInternalAuth();

  const phaseId  = formData.get("phaseId") as string;
  const clientId = formData.get("clientId") as string;
  const status   = formData.get("status") as string;
  const startedAtRaw   = formData.get("startedAt") as string;
  const completedAtRaw = formData.get("completedAt") as string;

  await updateLandingPagePhase(phaseId, {
    status,
    assignedTo:  (formData.get("assignedTo") as string) || null,
    startedAt:   startedAtRaw   ? new Date(startedAtRaw)   : null,
    completedAt: completedAtRaw ? new Date(completedAtRaw) : null,
    comment:     (formData.get("comment") as string) || null,
  });

  revalidatePath(`/admin/tasks/landing/${clientId}`);
  revalidatePath(`/admin/tasks/landing`);
  return { success: true };
}
