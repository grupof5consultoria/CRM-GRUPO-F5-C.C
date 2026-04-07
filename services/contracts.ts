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

export async function getContractById(id: string) {
  return prisma.contract.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true } },
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

export async function createContract(data: {
  title: string;
  clientId: string;
  proposalId?: string;
  startDate?: string;
  endDate?: string;
  value?: string;
  notes?: string;
  creatorId: string;
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

export async function getClientsForSelect() {
  return prisma.client.findMany({
    where: { status: "active" },
    select: { id: true, name: true },
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

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  draft: "Rascunho",
  pending_signature: "Aguardando Assinatura",
  active: "Ativo",
  paused: "Pausado",
  cancelled: "Cancelado",
  finished: "Finalizado",
};

export const CONTRACT_STATUS_VARIANTS: Record<ContractStatus, "default" | "success" | "warning" | "danger" | "info" | "gray"> = {
  draft: "gray",
  pending_signature: "warning",
  active: "success",
  paused: "info",
  cancelled: "danger",
  finished: "default",
};
