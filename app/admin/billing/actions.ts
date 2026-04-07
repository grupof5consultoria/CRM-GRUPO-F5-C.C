"use server";

import { revalidatePath } from "next/cache";
import { requireInternalAuth } from "@/lib/auth";
import { createCharge, updateChargeStatus } from "@/services/billing";
import { prisma } from "@/lib/prisma";
import { createGatewayCharge } from "@/lib/gateway";
import { ChargeStatus } from "@prisma/client";

export async function createChargeAction(_prev: { error?: string }, formData: FormData) {
  await requireInternalAuth();

  const clientId = formData.get("clientId") as string;
  const description = formData.get("description") as string;
  const value = formData.get("value") as string;
  const dueDate = formData.get("dueDate") as string;

  if (!clientId) return { error: "Cliente obrigatório" };
  if (!description?.trim()) return { error: "Descrição obrigatória" };
  if (!value || parseFloat(value) <= 0) return { error: "Valor inválido" };
  if (!dueDate) return { error: "Data de vencimento obrigatória" };

  const charge = await createCharge({
    clientId,
    contractId: (formData.get("contractId") as string) || undefined,
    description,
    value,
    dueDate,
  });

  // Tenta enviar ao gateway
  const client = await prisma.client.findUnique({ where: { id: clientId }, select: { name: true, email: true, document: true } });

  const gatewayResult = await createGatewayCharge({
    customerName: client?.name ?? "",
    customerEmail: client?.email ?? undefined,
    customerDocument: client?.document ?? undefined,
    description,
    value: parseFloat(value),
    dueDate,
    internalChargeId: charge.id,
  });

  if (gatewayResult) {
    await prisma.charge.update({
      where: { id: charge.id },
      data: {
        externalId: gatewayResult.externalId,
        paymentLink: gatewayResult.paymentLink,
      },
    });
  }

  revalidatePath("/admin/billing");
  return { error: undefined };
}

export async function markChargeAsPaidAction(chargeId: string) {
  await requireInternalAuth();
  await updateChargeStatus(chargeId, "paid");
  revalidatePath("/admin/billing");
}

export async function cancelChargeAction(chargeId: string) {
  await requireInternalAuth();
  await updateChargeStatus(chargeId, "cancelled");
  revalidatePath("/admin/billing");
}
