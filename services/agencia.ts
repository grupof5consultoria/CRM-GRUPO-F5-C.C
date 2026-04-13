import { prisma } from "@/lib/prisma";
import { TeamMemberRole, TeamMemberStatus } from "@prisma/client";
import { OFFBOARDING_ITEMS, PLAN_CONFIG } from "@/lib/agencia-config";

export { ROLE_LABELS, STATUS_LABELS, OFFBOARDING_ITEMS, PLAN_CONFIG } from "@/lib/agencia-config";

export async function getTeamMembers() {
  return prisma.agencyTeamMember.findMany({
    include: { offboarding: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTeamMemberById(id: string) {
  return prisma.agencyTeamMember.findUnique({
    where: { id },
    include: { offboarding: { orderBy: { createdAt: "asc" } } },
  });
}

export async function createTeamMember(data: {
  name: string;
  role: TeamMemberRole;
  email?: string;
  whatsapp?: string;
  joinedAt?: string;
  notes?: string;
}) {
  return prisma.agencyTeamMember.create({
    data: {
      name: data.name,
      role: data.role,
      email: data.email || null,
      whatsapp: data.whatsapp || null,
      joinedAt: data.joinedAt ? new Date(data.joinedAt) : null,
      notes: data.notes || null,
    },
  });
}

export async function updateTeamMember(id: string, data: {
  name?: string;
  role?: TeamMemberRole;
  email?: string | null;
  whatsapp?: string | null;
  status?: TeamMemberStatus;
  joinedAt?: string | null;
  dismissedAt?: string | null;
  notes?: string | null;
}) {
  const member = await prisma.agencyTeamMember.update({
    where: { id },
    data: {
      ...data,
      joinedAt: data.joinedAt ? new Date(data.joinedAt) : data.joinedAt === null ? null : undefined,
      dismissedAt: data.dismissedAt ? new Date(data.dismissedAt) : data.dismissedAt === null ? null : undefined,
    },
  });

  // Auto-generate offboarding checklist when dismissed
  if (data.status === "dismissed") {
    const existing = await prisma.agencyOffboarding.count({ where: { memberId: id } });
    if (existing === 0) {
      await prisma.agencyOffboarding.createMany({
        data: OFFBOARDING_ITEMS.map(o => ({
          memberId: id,
          accessItem: o.item,
          label: o.label,
        })),
      });
    }
  }

  return member;
}

export async function updateOffboardingItem(id: string, revoked: boolean) {
  return prisma.agencyOffboarding.update({
    where: { id },
    data: {
      revoked,
      revokedAt: revoked ? new Date() : null,
    },
  });
}

// ─── Reuniões ─────────────────────────────────────────────────────────────────

export async function getMeetings() {
  return prisma.agencyMeeting.findMany({ orderBy: { scheduledAt: "desc" } });
}

export async function createMeeting(data: {
  type: string;
  scheduledAt?: string;
  participants: string[];
  meetingLink?: string;
  responsible?: string;
}) {
  return prisma.agencyMeeting.create({
    data: {
      type: data.type,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      participants: data.participants,
      meetingLink: data.meetingLink || null,
      responsible: data.responsible || null,
    },
  });
}

export async function updateMeeting(id: string, data: {
  status?: string;
  summary?: string;
  nextSteps?: string;
  scheduledAt?: string;
  meetingLink?: string;
}) {
  return prisma.agencyMeeting.update({
    where: { id },
    data: {
      ...data,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
    },
  });
}

// ─── Wiki ─────────────────────────────────────────────────────────────────────

export async function getWikiPages(section: string) {
  return prisma.agencyWikiPage.findMany({
    where: { section },
    orderBy: { updatedAt: "desc" },
  });
}

export async function upsertWikiPage(section: string, slug: string, title: string, content: string) {
  return prisma.agencyWikiPage.upsert({
    where: { section_slug: { section, slug } },
    create: { section, slug, title, content },
    update: { title, content, updatedAt: new Date() },
  });
}

// ─── Propostas Comerciais ─────────────────────────────────────────────────────

export async function getProposals() {
  return prisma.commercialProposal.findMany({
    include: { client: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProposalById(id: string) {
  return prisma.commercialProposal.findUnique({
    where: { id },
    include: { client: { select: { id: true, name: true, email: true, phone: true } } },
  });
}

export async function createProposal(data: {
  clientId: string;
  plan: string;
  discountApplied: boolean;
  adBudget?: number;
  notes?: string;
}) {
  const cfg = PLAN_CONFIG[data.plan as "start" | "scale"];
  return prisma.commercialProposal.create({
    data: {
      clientId: data.clientId,
      plan: data.plan,
      priceImpl: data.discountApplied ? cfg.priceImplDiscount : cfg.priceImpl,
      priceMonthly: cfg.priceMonthly,
      discountApplied: data.discountApplied,
      adBudget: data.adBudget ?? null,
      notes: data.notes || null,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
}

export async function updateProposalStatus(id: string, status: string) {
  return prisma.commercialProposal.update({
    where: { id },
    data: {
      status,
      sentAt: status === "sent" ? new Date() : undefined,
    },
  });
}
