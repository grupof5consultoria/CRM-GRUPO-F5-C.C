import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireInternalAuth } from "@/lib/auth";

// GET /api/clients/[id]/meta
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireInternalAuth();
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    select: { metaFaturamento: true },
  });
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ metaFaturamento: client.metaFaturamento?.toString() ?? null });
}

// PATCH /api/clients/[id]/meta
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireInternalAuth();
  const { id } = await params;
  const { metaFaturamento } = await req.json() as { metaFaturamento: string | null };

  const updated = await prisma.client.update({
    where: { id },
    data: { metaFaturamento: metaFaturamento ? parseFloat(metaFaturamento) : null },
    select: { metaFaturamento: true },
  });

  return NextResponse.json({ metaFaturamento: updated.metaFaturamento?.toString() ?? null });
}
