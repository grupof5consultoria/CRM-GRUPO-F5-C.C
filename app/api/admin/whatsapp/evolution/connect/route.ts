import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const EVO_URL    = process.env.EVOLUTION_API_URL?.replace(/\/$/, "");
const EVO_KEY    = process.env.EVOLUTION_API_KEY;
const WEBHOOK_URL = "https://crm-grupo-f5-c-c.vercel.app/api/webhooks/evolution";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  if (!EVO_URL || !EVO_KEY) {
    return NextResponse.json(
      { error: "Evolution API não configurada. Adicione EVOLUTION_API_URL e EVOLUTION_API_KEY nas variáveis de ambiente." },
      { status: 500 }
    );
  }

  const { instanceName, clientId } = await req.json();
  if (!instanceName || !clientId) {
    return NextResponse.json({ error: "instanceName e clientId são obrigatórios" }, { status: 400 });
  }

  try {
    // Create or fetch the instance
    const createRes = await fetch(`${EVO_URL}/instance/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: EVO_KEY },
      body: JSON.stringify({
        instanceName,
        qrcode: true,
        integration: "WHATSAPP-BAILEYS",
      }),
    });

    const createData = await createRes.json();

    // Register webhook for disconnection events
    await fetch(`${EVO_URL}/webhook/set/${instanceName}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: EVO_KEY },
      body: JSON.stringify({
        url:     WEBHOOK_URL,
        enabled: true,
        events:  ["CONNECTION_UPDATE"],
      }),
    }).catch(() => {}); // non-blocking

    // QR returned directly on create
    if (createData?.qrcode?.base64) {
      return NextResponse.json({ qr: createData.qrcode.base64 });
    }

    // Instance may already exist — fetch QR separately
    const qrRes = await fetch(`${EVO_URL}/instance/connect/${instanceName}`, {
      headers: { apikey: EVO_KEY },
    });
    const qrData = await qrRes.json();

    if (qrData?.base64) {
      return NextResponse.json({ qr: qrData.base64 });
    }

    // Instance already open (already connected)
    if (qrData?.instance?.state === "open") {
      const phone = qrData?.instance?.owner ?? null;
      return NextResponse.json({ connected: true, phone });
    }

    return NextResponse.json({ error: "Não foi possível obter o QR Code. Verifique a Evolution API." }, { status: 500 });
  } catch (err) {
    console.error("[evolution/connect]", err);
    return NextResponse.json({ error: "Falha ao conectar à Evolution API" }, { status: 500 });
  }
}
