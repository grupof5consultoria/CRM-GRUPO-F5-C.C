"use server";

import { revalidatePath } from "next/cache";
import { requireInternalAuth } from "@/lib/auth";
import {
  createLandingPageProject,
  updateLandingPageBriefing,
  updateLandingPagePhase,
  updateLandingPageGenerator,
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

export async function saveGeneratorAction(
  _prev: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  await requireInternalAuth();

  const projectId = formData.get("projectId") as string;
  const clientId  = formData.get("clientId") as string;

  const specialtiesRaw = formData.get("specialties") as string;
  const specialties = specialtiesRaw
    ? specialtiesRaw.split(",").map(s => s.trim()).filter(Boolean)
    : [];

  const testimonialsRaw = formData.get("testimonials") as string;
  let testimonials = null;
  try { testimonials = testimonialsRaw ? JSON.parse(testimonialsRaw) : null; } catch {}

  await updateLandingPageGenerator(projectId, {
    doctorName:      (formData.get("doctorName") as string) || null,
    clinicName:      (formData.get("clinicName") as string) || null,
    city:            (formData.get("city") as string) || null,
    whatsapp:        (formData.get("whatsapp") as string) || null,
    specialties,
    yearsExperience: formData.get("yearsExperience") ? Number(formData.get("yearsExperience")) : null,
    patientsCount:   (formData.get("patientsCount") as string) || null,
    proceduresCount: (formData.get("proceduresCount") as string) || null,
    googleRating:    (formData.get("googleRating") as string) || null,
    address:         (formData.get("address") as string) || null,
    slug:            (formData.get("slug") as string) || null,
    photoDentistUrl: (formData.get("photoDentistUrl") as string) || null,
    photoClinic1Url: (formData.get("photoClinic1Url") as string) || null,
    photoClinic2Url: (formData.get("photoClinic2Url") as string) || null,
    photoClinic3Url: (formData.get("photoClinic3Url") as string) || null,
    photoClinic4Url: (formData.get("photoClinic4Url") as string) || null,
    ogImageUrl:      (formData.get("ogImageUrl") as string) || null,
    testimonials,
  });

  revalidatePath(`/admin/tasks/landing/${clientId}`);
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
