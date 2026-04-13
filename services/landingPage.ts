import { prisma } from "@/lib/prisma";

export const LANDING_PHASES = [
  { phaseNumber: 1, title: "Briefing" },
  { phaseNumber: 2, title: "Configuração da Estrutura de Copy" },
  { phaseNumber: 3, title: "Designer" },
  { phaseNumber: 4, title: "SEO" },
  { phaseNumber: 5, title: "Contratar Domínio" },
  { phaseNumber: 6, title: "Apresentar Esboço" },
  { phaseNumber: 7, title: "Ajustes e Correções" },
];

export const PHASE_STATUS_LABELS: Record<string, string> = {
  not_started:    "Não iniciado",
  in_progress:    "Em andamento",
  done:           "Concluído",
  waiting_client: "Aguardando cliente",
};

export const PHASE_STATUS_COLORS: Record<string, string> = {
  not_started:    "text-gray-500 bg-[#222] border-[#333]",
  in_progress:    "text-amber-400 bg-amber-500/10 border-amber-500/30",
  done:           "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  waiting_client: "text-blue-400 bg-blue-500/10 border-blue-500/30",
};

export async function getLandingPageProject(clientId: string) {
  return prisma.landingPageProject.findUnique({
    where: { clientId },
    include: { phases: { orderBy: { phaseNumber: "asc" } } },
  });
}

export async function createLandingPageProject(clientId: string, companyName: string) {
  const existing = await prisma.landingPageProject.findUnique({ where: { clientId } });
  if (existing) return existing;

  const project = await prisma.landingPageProject.create({
    data: { clientId, companyName },
  });

  await prisma.landingPagePhase.createMany({
    data: LANDING_PHASES.map(p => ({ projectId: project.id, ...p })),
  });

  return project;
}

export async function updateLandingPageBriefing(projectId: string, data: {
  companyName?: string;
  services?: string | null;
  colorPrimary?: string | null;
  colorSecondary?: string | null;
  references?: string | null;
  domain?: string | null;
  hasDomain?: boolean;
  businessHours?: string | null;
  businessDays?: string[];
  wantsBlog?: boolean;
  purpose?: string | null;
}) {
  return prisma.landingPageProject.update({ where: { id: projectId }, data });
}

export async function updateLandingPagePhase(phaseId: string, data: {
  status?: string;
  assignedTo?: string | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  comment?: string | null;
}) {
  const phase = await prisma.landingPagePhase.update({ where: { id: phaseId }, data });

  // Recalculate progress
  const allPhases = await prisma.landingPagePhase.findMany({ where: { projectId: phase.projectId } });
  const done = allPhases.filter(p => p.status === "done").length;
  const progress = Math.round((done / allPhases.length) * 100);
  await prisma.landingPageProject.update({ where: { id: phase.projectId }, data: { progress } });

  return phase;
}

export async function getAllLandingProjects() {
  return prisma.landingPageProject.findMany({
    include: {
      client: { select: { id: true, name: true } },
      phases: { orderBy: { phaseNumber: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
}
