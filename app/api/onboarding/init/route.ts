import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireInternalAuth } from "@/lib/auth";
import { createOnboardingForClient } from "@/app/actions/onboarding";

export async function POST(req: NextRequest) {
  await requireInternalAuth();
  const { clientId } = await req.json() as { clientId: string };
  if (!clientId) return NextResponse.json({ error: "clientId obrigatório" }, { status: 400 });

  const existing = await prisma.onboardingTask.count({ where: { clientId } });
  if (existing > 0) return NextResponse.json({ error: "Onboarding já existe" }, { status: 409 });

  await createOnboardingForClient(clientId);
  return NextResponse.json({ ok: true });
}
