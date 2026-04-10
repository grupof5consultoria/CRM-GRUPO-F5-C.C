import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireInternalAuth } from "@/lib/auth";

// PATCH /api/estrategias/[id] — salva o mapa mental
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireInternalAuth();
  const { id } = await params;
  const { nodes } = await req.json() as { nodes: unknown };

  const updated = await prisma.strategy.update({
    where: { id },
    data: { nodes: nodes as object },
  });

  return NextResponse.json(updated);
}

// DELETE /api/estrategias/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireInternalAuth();
  const { id } = await params;
  await prisma.strategy.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
