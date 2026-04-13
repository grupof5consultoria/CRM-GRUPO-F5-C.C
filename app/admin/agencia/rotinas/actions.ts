"use server";

import { createMeeting, updateMeeting } from "@/services/agencia";
import { revalidatePath } from "next/cache";

export async function createMeetingAction(formData: FormData) {
  const participantsRaw = formData.get("participants") as string ?? "";
  const participants = participantsRaw.split(",").map(s => s.trim()).filter(Boolean);

  await createMeeting({
    type: formData.get("type") as string,
    scheduledAt: formData.get("scheduledAt") as string || undefined,
    participants,
    meetingLink: formData.get("meetingLink") as string || undefined,
    responsible: formData.get("responsible") as string || undefined,
  });

  revalidatePath("/admin/agencia/rotinas");
}

export async function updateMeetingAction(id: string, data: Record<string, string>) {
  await updateMeeting(id, data);
  revalidatePath("/admin/agencia/rotinas");
}
