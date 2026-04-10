import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireInternalAuth } from "@/lib/auth";
import { createOnboardingForClient } from "@/app/actions/onboarding";

// POST /api/onboarding/init — cria ou recria as etapas (force=true para recriar)
export async function POST(req: NextRequest) {
  await requireInternalAuth();
  const { clientId, force } = await req.json() as { clientId: string; force?: boolean };
  if (!clientId) return NextResponse.json({ error: "clientId obrigatório" }, { status: 400 });

  const existing = await prisma.onboardingTask.count({ where: { clientId } });

  if (existing > 0 && !force) {
    return NextResponse.json({ error: "Onboarding já existe" }, { status: 409 });
  }

  if (existing > 0 && force) {
    // Apaga todas as etapas antigas antes de recriar
    await prisma.onboardingTask.deleteMany({ where: { clientId } });
  }

  await createOnboardingForClient(clientId);
  return NextResponse.json({ ok: true });
}
