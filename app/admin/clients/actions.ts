"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireInternalAuth } from "@/lib/auth";
import { createClient, updateClient, addClientContact, deleteClientContact } from "@/services/clients";
import { ClientStatus } from "@prisma/client";

export async function createClientAction(_prev: { error?: string }, formData: FormData) {
  const session = await requireInternalAuth();

  const name = formData.get("name") as string;
  if (!name?.trim()) return { error: "Nome obrigatório" };

  const client = await createClient({
    name,
    email: (formData.get("email") as string) || undefined,
    phone: (formData.get("phone") as string) || undefined,
    document: (formData.get("document") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
    ownerId: (formData.get("ownerId") as string) || session.userId,
  });

  redirect(`/admin/clients/${client.id}`);
}

export async function updateClientAction(_prev: { error?: string }, formData: FormData) {
  await requireInternalAuth();

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  if (!name?.trim()) return { error: "Nome obrigatório" };

  await updateClient(id, {
    name,
    email: (formData.get("email") as string) || undefined,
    phone: (formData.get("phone") as string) || undefined,
    document: (formData.get("document") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
    status: (formData.get("status") as ClientStatus) || undefined,
    ownerId: (formData.get("ownerId") as string) || undefined,
  });

  revalidatePath(`/admin/clients/${id}`);
  return { error: undefined };
}

export async function addContactAction(_prev: { error?: string }, formData: FormData) {
  await requireInternalAuth();

  const clientId = formData.get("clientId") as string;
  const name = formData.get("name") as string;
  if (!name?.trim()) return { error: "Nome obrigatório" };

  await addClientContact({
    clientId,
    name,
    email: (formData.get("email") as string) || undefined,
    phone: (formData.get("phone") as string) || undefined,
    role: (formData.get("role") as string) || undefined,
    isPrimary: formData.get("isPrimary") === "true",
  });

  revalidatePath(`/admin/clients/${clientId}`);
  return { error: undefined };
}

export async function deleteContactAction(contactId: string, clientId: string) {
  await requireInternalAuth();
  await deleteClientContact(contactId);
  revalidatePath(`/admin/clients/${clientId}`);
}
