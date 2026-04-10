import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireInternalAuth } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  await requireInternalAuth();
  const { taskId } = await params;
  const body = await req.json();

  const { status, assignedTo, data } = body as {
    status?: string;
    assignedTo?: string | null;
    data?: Record<string, unknown>;
  };

  const updated = await prisma.onboardingTask.update({
    where: { id: taskId },
    data: {
      ...(status !== undefined && { status }),
      ...(assignedTo !== undefined && { assignedTo }),
      ...(data !== undefined && { data }),
      ...(status === "done" && { completedAt: new Date() }),
      ...(status && status !== "done" && { completedAt: null }),
    },
  });

  return NextResponse.json(updated);
}
