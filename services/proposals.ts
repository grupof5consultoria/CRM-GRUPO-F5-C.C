import { prisma } from "@/lib/prisma";
import { ProposalStatus } from "@prisma/client";

export async function getProposals() {
  return prisma.proposal.findMany({
    include: {
      creator: { select: { id: true, name: true } },
      lead: { select: { id: true, name: true, company: true } },
      client: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getProposalById(id: string) {
  return prisma.proposal.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, name: true } },
      lead: { select: { id: true, name: true, company: true } },
      client: { select: { id: true, name: true } },
      items: { include: { service: { select: { id: true, name: true } } }, orderBy: { createdAt: "asc" } },
      events: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function getProposalByToken(token: string) {
  return prisma.proposal.findUnique({
    where: { token },
    include: {
      lead: { select: { name: true, company: true, email: true } },
      client: { select: { name: true, email: true } },
      items: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function createProposal(data: {
  title: string;
  leadId?: string;
  clientId?: string;
  validUntil?: string;
  notes?: string;
  creatorId: string;
}) {
  const proposal = await prisma.proposal.create({
    data: {
      title: data.title,
      leadId: data.leadId || null,
      clientId: data.clientId || null,
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
      notes: data.notes || null,
      creatorId: data.creatorId,
    },
  });

  await prisma.proposalEvent.create({
    data: { proposalId: proposal.id, type: "created", description: "Proposta criada." },
  });

  return proposal;
}

export async function upsertProposalItems(
  proposalId: string,
  items: { description: string; quantity: number; unitValue: number }[]
) {
  await prisma.proposalItem.deleteMany({ where: { proposalId } });

  const created = await Promise.all(
    items.map((item) =>
      prisma.proposalItem.create({
        data: {
          proposalId,
          description: item.description,
          quantity: item.quantity,
          unitValue: item.unitValue,
          totalValue: item.quantity * item.unitValue,
        },
      })
    )
  );

  const totalValue = created.reduce((sum, i) => sum + Number(i.totalValue), 0);
  await prisma.proposal.update({ where: { id: proposalId }, data: { totalValue } });

  return created;
}

export async function updateProposalStatus(proposalId: string, status: ProposalStatus) {
  await prisma.proposal.update({ where: { id: proposalId }, data: { status } });
  await prisma.proposalEvent.create({
    data: { proposalId, type: "status_changed", description: `Status alterado para: ${status}` },
  });
}

export async function acceptProposal(token: string, acceptedBy: string) {
  const proposal = await prisma.proposal.findUnique({ where: { token } });
  if (!proposal || proposal.status !== "sent") return null;

  await prisma.proposal.update({
    where: { token },
    data: { status: "accepted", acceptedAt: new Date(), acceptedBy },
  });

  await prisma.proposalEvent.create({
    data: { proposalId: proposal.id, type: "accepted", description: `Proposta aceita por: ${acceptedBy}` },
  });

  return proposal;
}

export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  draft: "Rascunho",
  sent: "Enviada",
  accepted: "Aceita",
  rejected: "Recusada",
  expired: "Expirada",
};

export const PROPOSAL_STATUS_VARIANTS: Record<ProposalStatus, "default" | "success" | "warning" | "danger" | "info" | "gray"> = {
  draft: "gray",
  sent: "default",
  accepted: "success",
  rejected: "danger",
  expired: "warning",
};
