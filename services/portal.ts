import { prisma } from "@/lib/prisma";

/**
 * Todas as funções exigem o clientId da sessão.
 * Nunca retornam dados de outro cliente.
 */

export async function getPortalDashboard(clientId: string) {
  const now = new Date();
  const [client, activeContracts, pendingCharges, overdueCharges, tasks] = await Promise.all([
    prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true, name: true, status: true },
    }),
    prisma.contract.count({ where: { clientId, status: "active" } }),
    prisma.charge.count({ where: { clientId, status: "pending" } }),
    prisma.charge.findMany({
      where: { clientId, status: "pending", dueDate: { lt: now } },
      select: { id: true, description: true, value: true, dueDate: true, paymentLink: true },
      orderBy: { dueDate: "asc" },
      take: 3,
    }),
    prisma.task.findMany({
      where: { clientId, isClientVisible: true, status: { notIn: ["done", "cancelled"] } },
      select: { id: true, title: true, status: true, dueDate: true },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
  ]);

  return { client, activeContracts, pendingCharges, overdueCharges, tasks };
}

export async function getPortalContracts(clientId: string) {
  return prisma.contract.findMany({
    where: { clientId },
    select: {
      id: true,
      title: true,
      status: true,
      value: true,
      startDate: true,
      endDate: true,
      notes: true,
      signedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPortalContract(clientId: string, contractId: string) {
  return prisma.contract.findFirst({
    where: { id: contractId, clientId },
    select: {
      id: true,
      title: true,
      status: true,
      value: true,
      startDate: true,
      endDate: true,
      notes: true,
      signedAt: true,
      createdAt: true,
    },
  });
}

export async function getPortalCharges(clientId: string) {
  return prisma.charge.findMany({
    where: { clientId },
    select: {
      id: true,
      description: true,
      value: true,
      status: true,
      dueDate: true,
      paidAt: true,
      paymentLink: true,
      contract: { select: { id: true, title: true } },
    },
    orderBy: { dueDate: "desc" },
  });
}

export async function getPortalAccount(clientId: string) {
  return prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      document: true,
      status: true,
      createdAt: true,
      contacts: {
        select: { id: true, name: true, email: true, phone: true, role: true, isPrimary: true },
        orderBy: { isPrimary: "desc" },
      },
    },
  });
}
