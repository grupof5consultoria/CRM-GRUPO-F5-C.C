"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireInternalAuth } from "@/lib/auth";
import { createContract, updateContractStatus, sendContractForSignature } from "@/services/contracts";
import { ContractStatus } from "@prisma/client";

export async function createContractAction(_prev: { error?: string }, formData: FormData) {
  const session = await requireInternalAuth();

  const clientId = formData.get("clientId") as string;
  if (!clientId) return { error: "Cliente obrigatório" };

  const mesosRaw = formData.get("meses") as string;
  const diaRaw = formData.get("diaVencimento") as string;
  const valueRaw = formData.get("value") as string;

  const title = formData.get("title") as string || "Contrato";

  const contract = await createContract({
    title,
    clientId,
    value: valueRaw || undefined,
    creatorId: session.userId,
    meses: mesosRaw ? parseInt(mesosRaw) : undefined,
    plano: (formData.get("plano") as string) || undefined,
    diaVencimento: diaRaw ? parseInt(diaRaw) : undefined,
    publicoAlvo: (formData.get("publicoAlvo") as string) || undefined,
    nomeContratante: (formData.get("nomeContratante") as string) || undefined,
    cpfContratante: (formData.get("cpfContratante") as string) || undefined,
    enderecoContratante: (formData.get("enderecoContratante") as string) || undefined,
    cidadeEstadoCep: (formData.get("cidadeEstadoCep") as string) || undefined,
    valorMensalExtenso: (formData.get("valorMensalExtenso") as string) || undefined,
  });

  redirect(`/admin/contracts/${contract.id}`);
}

export async function updateContractStatusAction(contractId: string, status: ContractStatus) {
  await requireInternalAuth();
  await updateContractStatus(contractId, status);
  revalidatePath(`/admin/contracts/${contractId}`);
  revalidatePath("/admin/contracts");
}

export async function sendForSignatureAction(contractId: string) {
  await requireInternalAuth();
  await sendContractForSignature(contractId);
  revalidatePath(`/admin/contracts/${contractId}`);
  revalidatePath("/admin/contracts");
}
