import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const event        = body?.event;
    const instanceName = body?.instance;
    const data         = body?.data;

    if (!event || !instanceName) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // Connection state changed
    if (event === "connection.update") {
      const state = data?.state;

      if (state === "close" || state === "connecting") {
        // Mark account as inactive in DB
        await prisma.whatsAppAccount.updateMany({
          where: { phoneNumberId: instanceName, status: "active" },
          data:  { status: "inactive" },
        });

        console.log(`[evolution/webhook] Instance ${instanceName} disconnected (state: ${state})`);
      }

      if (state === "open") {
        // Mark back as active if reconnected automatically
        await prisma.whatsAppAccount.updateMany({
          where: { phoneNumberId: instanceName, status: "inactive" },
          data:  { status: "active", verifiedAt: new Date() },
        });

        console.log(`[evolution/webhook] Instance ${instanceName} reconnected`);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[evolution/webhook]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
