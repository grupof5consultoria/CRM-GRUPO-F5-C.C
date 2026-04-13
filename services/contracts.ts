import { prisma } from "@/lib/prisma";
import { ContractStatus } from "@prisma/client";

export async function getContracts() {
  return prisma.contract.findMany({
    include: {
      client: { select: { id: true, name: true } },
      creator: { select: { id: true, name: true } },
      proposal: { select: { id: true, title: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}
// Alias with full fields for the list page
export async function getContractsList() {
  return prisma.contract.findMany({
    select: {
      id: true,
      title: true,
      status: true,
      value: true,
      startDate: true,
      endDate: true,
      meses: true,
      signedAt: true,
      signedToken: true,
      client: { select: { id: true, name: true } },
      proposal: { select: { id: true, title: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getContractById(id: string) {
  return prisma.contract.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, phone: true } },
      creator: { select: { id: true, name: true } },
      proposal: { select: { id: true, title: true, totalValue: true } },
      events: { orderBy: { createdAt: "desc" } },
      charges: {
        select: { id: true, description: true, value: true, status: true, dueDate: true },
        orderBy: { dueDate: "asc" },
      },
    },
  });
}

export async function getContractByToken(token: string) {
  return prisma.contract.findUnique({
    where: { signedToken: token },
    include: { client: { select: { id: true, name: true } } },
  });
}

export async function createContract(data: {
  title: string;
  clientId: string;
  proposalId?: string;
  startDate?: string;
  endDate?: string;
  value?: string;
  notes?: string;
  creatorId: string;
  // F5 template vars
  meses?: number;
  plano?: string;
  diaVencimento?: number;
  publicoAlvo?: string;
  nomeContratante?: string;
  cpfContratante?: string;
  enderecoContratante?: string;
  cidadeEstadoCep?: string;
  valorMensalExtenso?: string;
  servicos?: string[];
}) {
  const contract = await prisma.contract.create({
    data: {
      title: data.title,
      clientId: data.clientId,
      proposalId: data.proposalId || null,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      value: data.value ? parseFloat(data.value) : null,
      notes: data.notes || null,
      creatorId: data.creatorId,
      meses: data.meses ?? null,
      plano: data.plano || null,
      diaVencimento: data.diaVencimento ?? null,
      publicoAlvo: data.publicoAlvo || null,
      nomeContratante: data.nomeContratante || null,
      cpfContratante: data.cpfContratante || null,
      enderecoContratante: data.enderecoContratante || null,
      cidadeEstadoCep: data.cidadeEstadoCep || null,
      valorMensalExtenso: data.valorMensalExtenso || null,
      servicos: data.servicos ?? [],
    },
  });

  await prisma.contractEvent.create({
    data: { contractId: contract.id, type: "created", description: "Contrato criado." },
  });

  return contract;
}

export async function updateContractStatus(contractId: string, status: ContractStatus) {
  const data: { status: ContractStatus; signedAt?: Date } = { status };
  if (status === "active") data.signedAt = new Date();

  await prisma.contract.update({ where: { id: contractId }, data });

  await prisma.contractEvent.create({
    data: {
      contractId,
      type: "status_changed",
      description: `Status alterado para: ${CONTRACT_STATUS_LABELS[status]}`,
    },
  });
}

export async function signContract(token: string, signedByName: string, signedByCpf: string, ip: string) {
  const contract = await prisma.contract.findUnique({
    where: { signedToken: token },
    include: { client: { select: { id: true, name: true, email: true } } },
  });
  if (!contract) throw new Error("Contrato não encontrado");
  if (contract.status !== "pending_signature") throw new Error("Contrato não está aguardando assinatura");

  const now = new Date();

  await prisma.contract.update({
    where: { signedToken: token },
    data: {
      status: "active",
      signedAt: now,
      signedByName,
      signedByCpf,
      signedIp: ip,
    },
  });

  await prisma.contractEvent.create({
    data: {
      contractId: contract.id,
      type: "signed",
      description: `Contrato assinado digitalmente por ${signedByName} (CPF: ${signedByCpf}) — IP: ${ip}`,
    },
  });

  // ── Auto-create first billing charge ────────────────────────────────────────
  if (contract.value && Number(contract.value) > 0) {
    const MONTHS_PT = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
    ];
    const monthLabel = `${MONTHS_PT[now.getMonth()]}/${now.getFullYear()}`;
    const dueDay = contract.diaVencimento ?? 10;

    // Due date: current month at dueDay; if already passed, push to next month
    const dueDate = new Date(now.getFullYear(), now.getMonth(), dueDay);
    if (dueDate < now) dueDate.setMonth(dueDate.getMonth() + 1);
    const dueDateStr = dueDate.toISOString().split("T")[0];

    const charge = await prisma.charge.create({
      data: {
        clientId: contract.clientId,
        contractId: contract.id,
        description: `Mensalidade ${monthLabel} — ${contract.title}`,
        value: Number(contract.value),
        dueDate: new Date(dueDateStr),
        paymentMethod: "pix",
        isRecurring: true,
        recurrenceDay: dueDay,
      },
    });

    await prisma.chargeEvent.create({
      data: {
        chargeId: charge.id,
        type: "created",
        description: `Cobrança criada automaticamente após assinatura do contrato por ${signedByName}.`,
      },
    });
  }

  // ── Ensure client is marked active ──────────────────────────────────────────
  await prisma.client.update({
    where: { id: contract.clientId },
    data: { status: "active" },
  });

  return contract;
}

export async function sendContractForSignature(contractId: string) {
  await prisma.contract.update({
    where: { id: contractId },
    data: { status: "pending_signature" },
  });

  await prisma.contractEvent.create({
    data: {
      contractId,
      type: "status_changed",
      description: "Contrato enviado para assinatura digital.",
    },
  });
}

export async function getClientsForSelect() {
  return prisma.client.findMany({
    where: { status: { in: ["active", "prospect"] } },
    select: { id: true, name: true, document: true, status: true },
    orderBy: { name: "asc" },
  });
}

export async function getAcceptedProposalsWithoutContract() {
  return prisma.proposal.findMany({
    where: { status: "accepted", contract: null },
    select: {
      id: true,
      title: true,
      totalValue: true,
      lead: { select: { name: true, company: true } },
      client: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function renewContract(contractId: string, additionalMonths: number) {
  const contract = await prisma.contract.findUnique({ where: { id: contractId } });
  if (!contract) throw new Error("Contrato não encontrado");

  const currentMeses = contract.meses ?? 0;
  const newMeses = currentMeses + additionalMonths;

  // Extend endDate based on current endDate or signedAt or now
  const baseDate = contract.endDate ?? contract.signedAt ?? new Date();
  const newEndDate = new Date(baseDate);
  newEndDate.setMonth(newEndDate.getMonth() + additionalMonths);

  await prisma.contract.update({
    where: { id: contractId },
    data: { meses: newMeses, endDate: newEndDate },
  });

  await prisma.contractEvent.create({
    data: {
      contractId,
      type: "renewed",
      description: `Contrato renovado por mais ${additionalMonths} meses. Nova vigência: ${newMeses} meses total. Novo término: ${newEndDate.toLocaleDateString("pt-BR")}.`,
    },
  });
}

export async function finishContract(contractId: string, reason: string, note?: string) {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    select: { id: true, clientId: true, title: true },
  });
  if (!contract) throw new Error("Contrato não encontrado");

  await prisma.contract.update({
    where: { id: contractId },
    data: { status: "finished", finishReason: reason, finishNote: note || null },
  });

  await prisma.contractEvent.create({
    data: {
      contractId,
      type: "finished",
      description: `Contrato finalizado. Motivo: ${reason}${note ? ` — ${note}` : ""}`,
    },
  });
}

export async function requestCancellation(contractId: string, reason?: string, note?: string) {
  await prisma.contract.update({
    where: { id: contractId },
    data: {
      status: "pending_cancellation",
      ...(reason ? { cancelReason: reason } : {}),
      ...(note ? { cancelNote: note } : {}),
    },
  });

  // ── Cancel all pending charges for this contract ────────────────────────────
  await prisma.charge.updateMany({
    where: { contractId, status: "pending" },
    data: { status: "cancelled" },
  });

  // ── Mark client as inactive (churn) ────────────────────────────────────────
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    select: { clientId: true },
  });
  if (contract?.clientId) {
    await prisma.client.update({
      where: { id: contract.clientId },
      data: {
        status: "inactive",
        churnReason: reason ?? "cancelamento_contrato",
        churnNote: note ?? null,
        churnedAt: new Date(),
      },
    });

    await prisma.clientHealthLog.create({
      data: {
        clientId: contract.clientId,
        health: "at_risk",
        note: `Contrato cancelado. Motivo: ${reason ?? "não informado"}${note ? ` — ${note}` : ""}`,
      },
    });
  }

  await prisma.contractEvent.create({
    data: {
      contractId,
      type: "cancellation_requested",
      description: `Cancelamento solicitado${reason ? `. Motivo: ${reason}` : ""}. Cobranças pendentes canceladas. Cliente inativado. Distrato gerado e enviado ao portal para assinatura.`,
    },
  });
}

export async function getContractByDistratoToken(token: string) {
  return prisma.contract.findUnique({
    where: { distratoToken: token },
    include: { client: { select: { id: true, name: true } } },
  });
}

export async function signDistrato(token: string, signedByName: string, signedByCpf: string, ip: string) {
  const contract = await prisma.contract.findUnique({ where: { distratoToken: token } });
  if (!contract) throw new Error("Distrato não encontrado");
  if (contract.status !== "pending_cancellation") throw new Error("Distrato não está aguardando assinatura");

  await prisma.contract.update({
    where: { distratoToken: token },
    data: {
      status: "cancelled",
      distratoSignedAt: new Date(),
      distratoSignedByName: signedByName,
      distratoSignedByCpf: signedByCpf,
      distratoSignedIp: ip,
    },
  });

  await prisma.contractEvent.create({
    data: {
      contractId: contract.id,
      type: "distrato_signed",
      description: `Distrato assinado digitalmente por ${signedByName} (CPF: ${signedByCpf}) — IP: ${ip}`,
    },
  });

  return contract;
}

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  draft: "Rascunho",
  pending_signature: "Aguardando Assinatura",
  active: "Ativo",
  paused: "Pausado",
  cancelled: "Cancelado",
  finished: "Finalizado",
  pending_cancellation: "Distrato Pendente",
};

export const CONTRACT_STATUS_VARIANTS: Record<ContractStatus, "default" | "success" | "warning" | "danger" | "info" | "gray"> = {
  draft: "gray",
  pending_signature: "warning",
  active: "success",
  paused: "info",
  cancelled: "danger",
  finished: "default",
  pending_cancellation: "danger",
};
