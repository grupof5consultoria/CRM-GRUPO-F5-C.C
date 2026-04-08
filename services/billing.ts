import { prisma } from "@/lib/prisma";
import { ChargeStatus, PaymentMethod } from "@prisma/client";

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
  paymentMethod?: PaymentMethod;
  isRecurring?: boolean;
  recurrenceDay?: number;
}) {
  const charge = await prisma.charge.create({
    data: {
      clientId: data.clientId,
      contractId: data.contractId || null,
      description: data.description,
      value: parseFloat(data.value),
      dueDate: new Date(data.dueDate),
      paymentMethod: data.paymentMethod ?? "pix",
      isRecurring: data.isRecurring ?? false,
      recurrenceDay: data.recurrenceDay ?? null,
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

  const charge = await prisma.charge.update({
    where: { id: chargeId },
    data,
  });

  await prisma.chargeEvent.create({
    data: {
      chargeId,
      type: "status_changed",
      description: `Status alterado para: ${CHARGE_STATUS_LABELS[status]}`,
    },
  });

  // Se pago e recorrente, gera a próxima cobrança automaticamente
  if (status === "paid" && charge.isRecurring) {
    const currentDue = new Date(charge.dueDate);
    const nextDue = new Date(currentDue);
    nextDue.setMonth(nextDue.getMonth() + 1);

    // Usa o dia de recorrência definido ou mantém o mesmo dia
    if (charge.recurrenceDay) {
      nextDue.setDate(charge.recurrenceDay);
    }

    // Verifica se já existe cobrança pendente para o mesmo cliente no mesmo mês
    const alreadyExists = await prisma.charge.findFirst({
      where: {
        clientId: charge.clientId,
        description: charge.description,
        status: "pending",
        dueDate: {
          gte: new Date(nextDue.getFullYear(), nextDue.getMonth(), 1),
          lte: new Date(nextDue.getFullYear(), nextDue.getMonth() + 1, 0),
        },
      },
    });

    if (!alreadyExists) {
      const nextCharge = await prisma.charge.create({
        data: {
          clientId: charge.clientId,
          contractId: charge.contractId,
          description: charge.description,
          value: charge.value,
          dueDate: nextDue,
          paymentMethod: charge.paymentMethod,
          isRecurring: true,
          recurrenceDay: charge.recurrenceDay,
        },
      });

      await prisma.chargeEvent.create({
        data: {
          chargeId: nextCharge.id,
          type: "created",
          description: `Gerada automaticamente pela recorrência do mês anterior.`,
        },
      });
    }
  }

  return charge;
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
