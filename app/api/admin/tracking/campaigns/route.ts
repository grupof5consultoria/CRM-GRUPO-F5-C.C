import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { clientId, name, type, message } = await req.json();
  if (!clientId || !name || !type) {
    return NextResponse.json({ error: "clientId, name e type são obrigatórios" }, { status: 400 });
  }

  const campaign = await prisma.trackingCampaign.create({
    data: {
      clientId,
      name,
      type,
      message: message?.trim() || "Olá! Gostaria de saber mais sobre os serviços.",
    },
  });

  return NextResponse.json(campaign);
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ error: "clientId obrigatório" }, { status: 400 });

  const campaigns = await prisma.trackingCampaign.findMany({
    where: { clientId, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(campaigns);
}
