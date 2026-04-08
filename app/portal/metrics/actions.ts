"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { upsertManualMetrics } from "@/services/metrics";

export async function savePortalMetricsAction(
  _prev: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await getSession();
  if (!session?.clientId) return { error: "Não autenticado" };

  const platform = formData.get("platform") as string;
  const period = formData.get("period") as string;
  const leadsScheduledRaw = formData.get("leadsScheduled") as string;
  const revenueRaw = formData.get("revenue") as string;

  if (!platform || !period) return { error: "Dados incompletos" };

  const leadsScheduled = leadsScheduledRaw ? parseInt(leadsScheduledRaw) : null;
  const revenue = revenueRaw ? parseFloat(revenueRaw.replace(",", ".")) : null;

  await upsertManualMetrics(session.clientId, platform, period, leadsScheduled, revenue);

  revalidatePath("/portal/metrics");
  revalidatePath("/admin/metrics");
  return { success: true };
}
