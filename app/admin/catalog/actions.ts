"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireInternalAuth } from "@/lib/auth";
import { createService, updateService } from "@/services/catalog";
import { ChargeType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// ─── Catálogo Padrão F5 ───────────────────────────────────────────────────────

const F5_CATALOG = [
  {
    category: { id: "cat-pacotes-f5",    name: "Pacotes F5" },
    services: [
      {
        id: "svc-f5-start-impl",
        name: "Implementação F5 Start",
        description: "Setup completo: pixel Meta, GA4, GTM, landing page da clínica, ativação do Portal do Cliente e planilha de controle.",
        defaultValue: 2500,
        chargeType: "one_time" as ChargeType,
      },
      {
        id: "svc-f5-start-monthly",
        name: "F5 Start — Mensalidade",
        description: "Anúncios Meta Ads e Google Ads · Relatório semanal e mensal · Planilha de controle · Acompanhamento comercial · Landing Page · Otimização de ficha Google.",
        defaultValue: 1800,
        chargeType: "recurring" as ChargeType,
      },
      {
        id: "svc-f5-scale-impl",
        name: "Implementação F5 Scale",
        description: "Setup completo: pixel, GA4, GTM, landing page, Portal do Cliente, CRM, automação via API e planilha de controle avançada.",
        defaultValue: 6500,
        chargeType: "one_time" as ChargeType,
      },
      {
        id: "svc-f5-scale-monthly",
        name: "F5 Scale — Mensalidade",
        description: "Meta Ads e Google Ads · CRM + Automação · Acompanhamento comercial completo · Google otimizado · API de automação · Automação de CRM · Landing Page.",
        defaultValue: 2300,
        chargeType: "recurring" as ChargeType,
      },
    ],
  },
  {
    category: { id: "cat-trafego-pago", name: "Tráfego Pago" },
    services: [
      {
        id: "svc-meta-ads",
        name: "Gestão Meta Ads",
        description: "Criação, gestão e otimização de campanhas no Meta Ads (Facebook e Instagram). Inclui relatório semanal e mensal.",
        defaultValue: 1800,
        chargeType: "recurring" as ChargeType,
      },
      {
        id: "svc-google-ads",
        name: "Gestão Google Ads",
        description: "Criação, gestão e otimização de campanhas no Google Ads (pesquisa, display e YouTube). Inclui relatório semanal e mensal.",
        defaultValue: 1800,
        chargeType: "recurring" as ChargeType,
      },
    ],
  },
  {
    category: { id: "cat-landing-page",  name: "Landing Page" },
    services: [
      {
        id: "svc-landing-page",
        name: "Landing Page Odontológica",
        description: "Criação completa de landing page de alta conversão. Entrega em até 5 dias úteis com 1 mês de suporte incluso.",
        defaultValue: 890,
        chargeType: "one_time" as ChargeType,
      },
      {
        id: "svc-landing-alteracao",
        name: "Alteração em Landing Page",
        description: "Cada alteração solicitada após o período de suporte gratuito (1 mês após entrega).",
        defaultValue: 70,
        chargeType: "one_time" as ChargeType,
      },
    ],
  },
];

export async function importF5CatalogAction(): Promise<{ error?: string; success?: boolean; created: number }> {
  await requireInternalAuth();

  let created = 0;

  for (const group of F5_CATALOG) {
    // Upsert category
    await prisma.serviceCategory.upsert({
      where: { id: group.category.id },
      update: { name: group.category.name },
      create: { id: group.category.id, name: group.category.name },
    });

    for (const svc of group.services) {
      const existing = await prisma.service.findUnique({ where: { id: svc.id } });
      if (!existing) {
        await prisma.service.create({
          data: {
            id: svc.id,
            name: svc.name,
            description: svc.description,
            categoryId: group.category.id,
            defaultValue: svc.defaultValue,
            chargeType: svc.chargeType,
          },
        });
        created++;
      }
    }
  }

  revalidatePath("/admin/catalog");
  return { success: true, created };
}

const serviceSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Categoria obrigatória"),
  defaultHours: z.string().optional(),
  defaultValue: z.string().min(1, "Valor obrigatório"),
  chargeType: z.enum(["one_time", "recurring", "hourly"]),
});

export async function createServiceAction(_prev: { error?: string }, formData: FormData) {
  await requireInternalAuth();

  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    defaultHours: formData.get("defaultHours"),
    defaultValue: formData.get("defaultValue"),
    chargeType: formData.get("chargeType"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await createService(parsed.data as { name: string; description?: string; categoryId: string; defaultHours?: string; defaultValue: string; chargeType: ChargeType });

  revalidatePath("/admin/catalog");
  return { error: undefined };
}

export async function updateServiceAction(_prev: { error?: string }, formData: FormData) {
  await requireInternalAuth();

  const id = formData.get("id") as string;
  const isActive = formData.get("isActive") === "true";

  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    defaultHours: formData.get("defaultHours"),
    defaultValue: formData.get("defaultValue"),
    chargeType: formData.get("chargeType"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await updateService(id, { ...parsed.data, isActive } as Parameters<typeof updateService>[1]);

  revalidatePath("/admin/catalog");
  return { error: undefined };
}

export async function toggleServiceAction(id: string, isActive: boolean) {
  await requireInternalAuth();
  await updateService(id, { isActive: !isActive });
  revalidatePath("/admin/catalog");
}
