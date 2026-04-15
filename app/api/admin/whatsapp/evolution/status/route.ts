import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const EVO_URL = process.env.EVOLUTION_API_URL?.replace(/\/$/, "");
const EVO_KEY = process.env.EVOLUTION_API_KEY;

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  if (!EVO_URL || !EVO_KEY) {
    return NextResponse.json({ error: "Evolution API não configurada" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const instanceName = searchParams.get("instanceName");
  const clientId     = searchParams.get("clientId");

  if (!instanceName) return NextResponse.json({ error: "instanceName obrigatório" }, { status: 400 });

  try {
    const res  = await fetch(`${EVO_URL}/instance/connectionState/${instanceName}`, {
      headers: { apikey: EVO_KEY },
    });
    const data = await res.json();

    const state = data?.instance?.state ?? data?.state ?? "unknown";

    if (state === "open") {
      // Parse phone — Evolution returns "5511999999999@s.whatsapp.net" or just the number
      const rawPhone = data?.instance?.owner ?? data?.instance?.profileName ?? "";
      const phone    = rawPhone.replace(/@.*$/, "").replace(/^\+/, "");
      const display  = `+${phone}`;

      // Save to database if clientId provided
      if (clientId) {
        try {
          // Remove old active accounts for this instance
          await prisma.whatsAppAccount.deleteMany({
            where: { clientId, phoneNumberId: instanceName },
          });

          // Create new active account
          await prisma.whatsAppAccount.create({
            data: {
              clientId,
              phoneNumber:   display || `+${instanceName}`,
              phoneNumberId: instanceName,
              displayName:   instanceName,
              accessToken:   instanceName, // Evolution uses instanceName, not a token
              status:        "active",
              verifiedAt:    new Date(),
            },
          });
        } catch (dbErr) {
          console.error("[evolution/status] DB save error:", dbErr);
        }
      }

      return NextResponse.json({ status: "open", phone: display });
    }

    // QR may have rotated — return new one if present
    if (data?.qrcode?.base64) {
      return NextResponse.json({ status: "qr", qr: data.qrcode.base64 });
    }

    return NextResponse.json({ status: state });
  } catch (err) {
    console.error("[evolution/status]", err);
    return NextResponse.json({ error: "Falha ao verificar status" }, { status: 500 });
  }
}
