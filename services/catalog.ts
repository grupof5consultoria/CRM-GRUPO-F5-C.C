import { prisma } from "@/lib/prisma";
import { ChargeType } from "@prisma/client";

export async function getServiceCategories() {
  return prisma.serviceCategory.findMany({ orderBy: { name: "asc" } });
}

export async function getServices(filters?: { categoryId?: string; isActive?: boolean }) {
  return prisma.service.findMany({
    where: {
      ...(filters?.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters?.isActive !== undefined ? { isActive: filters.isActive } : {}),
    },
    include: { category: { select: { id: true, name: true } } },
    orderBy: { name: "asc" },
  });
}

export async function getServiceById(id: string) {
  return prisma.service.findUnique({
    where: { id },
    include: { category: true },
  });
}

export async function createService(data: {
  name: string;
  description?: string;
  categoryId: string;
  defaultHours?: string;
  defaultValue: string;
  chargeType: ChargeType;
}) {
  return prisma.service.create({
    data: {
      name: data.name,
      description: data.description || null,
      categoryId: data.categoryId,
      defaultHours: data.defaultHours ? parseFloat(data.defaultHours) : null,
      defaultValue: parseFloat(data.defaultValue),
      chargeType: data.chargeType,
    },
  });
}

export async function updateService(
  id: string,
  data: {
    name?: string;
    description?: string;
    categoryId?: string;
    defaultHours?: string;
    defaultValue?: string;
    chargeType?: ChargeType;
    isActive?: boolean;
  }
) {
  return prisma.service.update({
    where: { id },
    data: {
      ...data,
      defaultHours: data.defaultHours !== undefined ? parseFloat(data.defaultHours) : undefined,
      defaultValue: data.defaultValue !== undefined ? parseFloat(data.defaultValue) : undefined,
    },
  });
}

export const CHARGE_TYPE_LABELS: Record<ChargeType, string> = {
  one_time: "Avulso",
  recurring: "Recorrente",
  hourly: "Por Hora",
};
