import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireInternalAuth } from "@/lib/auth";

// GET /api/estrategias?month=2026-04
export async function GET(req: NextRequest) {
  await requireInternalAuth();
  const month = req.nextUrl.searchParams.get("month") ?? new Date().toISOString().substring(0, 7);

  const strategies = await prisma.strategy.findMany({
    where: { month },
    include: { client: { select: { id: true, name: true } } },
    orderBy: { client: { name: "asc" } },
  });

  return NextResponse.json(strategies);
}

// POST /api/estrategias — cria nova estratégia
export async function POST(req: NextRequest) {
  await requireInternalAuth();
  const { clientId, month } = await req.json() as { clientId: string; month: string };

  const strategy = await prisma.strategy.upsert({
    where: { clientId_month: { clientId, month } },
    update: {},
    create: {
      clientId,
      month,
      nodes: {
        id: "root",
        text: "Estratégia",
        children: [],
      },
    },
    include: { client: { select: { id: true, name: true } } },
  });

  return NextResponse.json(strategy);
}
