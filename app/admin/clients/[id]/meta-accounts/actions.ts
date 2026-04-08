"use server";

import { cookies } from "next/headers";
import { requireInternalAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function saveMetaAccountAction(
  clientId: string,
  adAccountId: string,
  token: string
): Promise<{ error?: string; success?: boolean }> {
  await requireInternalAuth();

  await prisma.client.update({
    where: { id: clientId },
    data: { metaAdAccountId: adAccountId, metaAccessToken: token },
  });

  // Limpar o cookie temporário
  const cookieStore = await cookies();
  cookieStore.delete("meta_pending");

  return { success: true };
}
