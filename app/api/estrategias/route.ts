import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireInternalAuth } from "@/lib/auth";

// GET /api/estrategias?month=2026-04
export async function GET(req: NextRequest) {
  await requireInternalAuth();
  const month = req.nextUrl.searchParams.get("month") ?? new Date().toISOString().substring(0, 7);

  const strategies = await prisma.strategy.findMany({
    where: { month },
    include: {
      client: { select: { id: true, name: true, metaFaturamento: true } },
    },
    orderBy: { client: { name: "asc" } },
  });

  // Calculate monthly revenue (sum of valueClosed where status=closed) per client
  const [year, monthNum] = month.split("-").map(Number);
  const startDate = new Date(year, monthNum - 1, 1);
  const endDate   = new Date(year, monthNum, 1);

  const revenueData = await prisma.attendance.groupBy({
    by: ["clientId"],
    where: {
      clientId: { in: strategies.map(s => s.clientId) },
      scheduledAt: { gte: startDate, lt: endDate },
      valueClosed: { gt: 0 },
    },
    _sum: { valueClosed: true },
  });

  const revenueMap = new Map(
    revenueData.map(r => [r.clientId, Number(r._sum.valueClosed ?? 0)])
  );

  const result = strategies.map(s => ({
    ...s,
    client: {
      ...s.client,
      metaFaturamento: s.client.metaFaturamento?.toString() ?? null,
    },
    faturamento: revenueMap.get(s.clientId) ?? 0,
  }));

  return NextResponse.json(result);
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
    include: {
      client: { select: { id: true, name: true, metaFaturamento: true } },
    },
  });

  return NextResponse.json({
    ...strategy,
    client: {
      ...strategy.client,
      metaFaturamento: strategy.client.metaFaturamento?.toString() ?? null,
    },
    faturamento: 0,
  });
}
