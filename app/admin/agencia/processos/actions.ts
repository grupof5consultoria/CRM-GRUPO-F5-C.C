"use server";

import { createProcess, updateProcess, deleteProcess } from "@/services/agencia";
import { revalidatePath } from "next/cache";

export async function createProcessAction(formData: FormData) {
  await createProcess({
    role:        formData.get("role") as string,
    title:       formData.get("title") as string,
    description: formData.get("description") as string,
    frequency:   formData.get("frequency") as string,
    tool:        (formData.get("tool") as string) || undefined,
  });
  revalidatePath("/admin/agencia/processos");
}

export async function updateProcessAction(id: string, data: {
  title?: string; description?: string; frequency?: string; tool?: string | null;
}) {
  await updateProcess(id, data);
  revalidatePath("/admin/agencia/processos");
}

export async function deleteProcessAction(id: string) {
  await deleteProcess(id);
  revalidatePath("/admin/agencia/processos");
}
