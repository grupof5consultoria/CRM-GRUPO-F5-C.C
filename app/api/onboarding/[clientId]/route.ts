import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireInternalAuth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  await requireInternalAuth();
  const { clientId } = await params;

  const tasks = await prisma.onboardingTask.findMany({
    where: { clientId },
    orderBy: { stepNumber: "asc" },
  });

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  return NextResponse.json({ tasks, progress, done, total });
}
