import { prisma } from "@/lib/prisma";
import { ClientStatus, ClientHealth } from "@prisma/client";

export async function getClients(filters?: { status?: ClientStatus; search?: string; health?: ClientHealth }) {
  return prisma.client.findMany({
    where: {
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.health ? { health: filters.health } : {}),
      ...(filters?.search
        ? {
            OR: [
              { name: { contains: filters.search, mode: "insensitive" } },
              { email: { contains: filters.search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      owner: { select: { id: true, name: true } },
      _count: { select: { contracts: true, charges: true, tasks: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function updateClientHealth(clientId: string, health: ClientHealth, note?: string) {
  await prisma.client.update({ where: { id: clientId }, data: { health, healthNote: note || null } });
  await prisma.clientHealthLog.create({ data: { clientId, health, note: note || null } });
}

export async function getClientHealthLogs(clientId: string) {
  return prisma.clientHealthLog.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
}

export async function getClientById(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true } },
      contacts: { orderBy: { isPrimary: "desc" } },
      healthLogs: { orderBy: { createdAt: "desc" }, take: 8 },
      contracts: {
        select: { id: true, title: true, status: true, value: true, startDate: true },
        orderBy: { createdAt: "desc" },
      },
      charges: {
        select: { id: true, description: true, value: true, status: true, dueDate: true },
        orderBy: { dueDate: "desc" },
        take: 5,
      },
      tasks: {
        select: { id: true, title: true, status: true, dueDate: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });
}

export async function createClient(data: {
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  notes?: string;
  monthlyValue?: number;
  ownerId: string;
}) {
  return prisma.client.create({
    data: {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      document: data.document || null,
      notes: data.notes || null,
      monthlyValue: data.monthlyValue ?? null,
      ownerId: data.ownerId,
    },
  });
}

export async function updateClient(
  id: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    document?: string;
    notes?: string;
    status?: ClientStatus;
    ownerId?: string;
    monthlyValue?: number | null;
  }
) {
  return prisma.client.update({ where: { id }, data });
}

export async function getTotalMRR() {
  const result = await prisma.client.aggregate({
    where: { status: "active", monthlyValue: { not: null } },
    _sum: { monthlyValue: true },
  });
  return Number(result._sum.monthlyValue ?? 0);
}

export async function addClientContact(data: {
  clientId: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  isPrimary?: boolean;
}) {
  return prisma.clientContact.create({ data });
}

export async function deleteClientContact(id: string) {
  return prisma.clientContact.delete({ where: { id } });
}

export async function getInternalUsersForSelect() {
  return prisma.user.findMany({
    where: {
      isActive: true,
      role: { in: ["owner", "admin", "operations_manager", "sales", "finance", "operations"] },
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  active: "Ativo",
  inactive: "Inativo",
  blocked: "Bloqueado",
};

export const CLIENT_STATUS_VARIANTS: Record<ClientStatus, "success" | "gray" | "danger"> = {
  active: "success",
  inactive: "gray",
  blocked: "danger",
};
