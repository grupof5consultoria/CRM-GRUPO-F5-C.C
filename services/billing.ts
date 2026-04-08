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
  const charge = await prisma.charge.findUnique({ where: { id: chargeId } });
  if (!charge) return;

  // Se pago e recorrente: registra o pagamento no histórico e renova a cobrança para o próximo mês
  if (status === "paid" && charge.isRecurring) {
    const paidDate = new Date();
    const currentDue = new Date(charge.dueDate);
    const nextDue = new Date(currentDue);
    nextDue.setMonth(nextDue.getMonth() + 1);
    if (charge.recurrenceDay) nextDue.setDate(charge.recurrenceDay);

    // Registra pagamento no histórico e renova no lugar
    await prisma.charge.update({
      where: { id: chargeId },
      data: {
        status: "pending",
        paidAt: null,
        dueDate: nextDue,
      },
    });

    await prisma.chargeEvent.create({
      data: {
        chargeId,
        type: "paid",
        description: `Pagamento confirmado em ${paidDate.toLocaleDateString("pt-BR")}. Próximo vencimento: ${nextDue.toLocaleDateString("pt-BR")}.`,
      },
    });

    return;
  }

  // Para não-recorrentes ou outros status: comportamento normal
  const data: { status: ChargeStatus; paidAt?: Date | null } = { status };
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

export async function updateCharge(chargeId: string, data: {
  description?: string;
  value?: number;
  dueDate?: Date;
  paymentMethod?: import("@prisma/client").PaymentMethod;
  isRecurring?: boolean;
  recurrenceDay?: number | null;
}) {
  return prisma.charge.update({ where: { id: chargeId }, data });
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
