import { prisma } from "@/lib/prisma";
import { LeadStatus } from "@prisma/client";

export async function getLeads(filters?: { status?: LeadStatus; search?: string }) {
  return prisma.lead.findMany({
    where: {
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.search
        ? {
            OR: [
              { name: { contains: filters.search, mode: "insensitive" } },
              { email: { contains: filters.search, mode: "insensitive" } },
              { company: { contains: filters.search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { owner: { select: { id: true, name: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getLeadById(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true } },
      activities: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
      proposals: {
        select: { id: true, title: true, status: true, totalValue: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function createLead(data: {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
  nextFollowUp?: string;
  ownerId: string;
}) {
  return prisma.lead.create({
    data: {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      company: data.company || null,
      notes: data.notes || null,
      nextFollowUp: data.nextFollowUp ? new Date(data.nextFollowUp) : null,
      ownerId: data.ownerId,
    },
  });
}

export async function updateLead(
  id: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    status?: LeadStatus;
    lostReason?: string;
    nextFollowUp?: string;
    notes?: string;
    ownerId?: string;
  }
) {
  return prisma.lead.update({
    where: { id },
    data: {
      ...data,
      nextFollowUp: data.nextFollowUp ? new Date(data.nextFollowUp) : undefined,
    },
  });
}

export async function addLeadActivity(data: {
  leadId: string;
  userId: string;
  type: string;
  description: string;
}) {
  return prisma.leadActivity.create({ data });
}

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Novo",
  contacted: "Contatado",
  qualified: "Qualificado",
  proposal_sent: "Proposta Enviada",
  negotiation: "Em Negociação",
  closed_won: "Fechado (Ganho)",
  closed_lost: "Fechado (Perdido)",
};

export const LEAD_STATUS_VARIANTS: Record<LeadStatus, "default" | "success" | "warning" | "danger" | "info" | "gray"> = {
  new: "default",
  contacted: "info",
  qualified: "warning",
  proposal_sent: "warning",
  negotiation: "info",
  closed_won: "success",
  closed_lost: "danger",
};
