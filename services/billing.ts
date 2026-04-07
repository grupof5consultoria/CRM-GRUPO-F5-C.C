import { prisma } from "@/lib/prisma";
import { ChargeStatus } from "@prisma/client";

export async function getCharges(filters?: { clientId?: string; contractId?: string; status?: ChargeStatus }) {
  return prisma.charge.findMany({
    where: {
      ...(filters?.clientId ? { clientId: filters.clientId } : {}),
      ...(filters?.contractId ? { contractId: filters.contractId } : {}),
      ...(filters?.status ? { status: filters.status } : {}),
    },
    include: {
      client: { select: { id: true, name: true } },
      contract: { select: { id: true, title: true } },
    },
    orderBy: { dueDate: "asc" },
  });
}

export async function getChargeById(id: string) {
  return prisma.charge.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true } },
      contract: { select: { id: true, title: true } },
      events: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function createCharge(data: {
  clientId: string;
  contractId?: string;
  description: string;
  value: string;
  dueDate: string;
}) {
  const charge = await prisma.charge.create({
    data: {
      clientId: data.clientId,
      contractId: data.contractId || null,
      description: data.description,
      value: parseFloat(data.value),
      dueDate: new Date(data.dueDate),
    },
  });

  await prisma.chargeEvent.create({
    data: { chargeId: charge.id, type: "created", description: "Cobrança criada." },
  });

  return charge;
}

export async function updateChargeStatus(chargeId: string, status: ChargeStatus) {
  const data: { status: ChargeStatus; paidAt?: Date } = { status };
  if (status === "paid") data.paidAt = new Date();

  await prisma.charge.update({ where: { id: chargeId }, data });

  await prisma.chargeEvent.create({
    data: {
      chargeId,
      type: "status_changed",
      description: `Status alterado para: ${CHARGE_STATUS_LABELS[status]}`,
    },
  });
}

export const CHARGE_STATUS_LABELS: Record<ChargeStatus, string> = {
  pending: "Pendente",
  paid: "Pago",
  overdue: "Vencido",
  cancelled: "Cancelado",
  refunded: "Estornado",
};

export const CHARGE_STATUS_VARIANTS: Record<ChargeStatus, "default" | "success" | "warning" | "danger" | "info" | "gray"> = {
  pending: "warning",
  paid: "success",
  overdue: "danger",
  cancelled: "gray",
  refunded: "info",
};
