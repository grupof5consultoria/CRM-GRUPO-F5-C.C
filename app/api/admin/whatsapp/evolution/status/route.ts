import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const EVO_URL = process.env.EVOLUTION_API_URL?.replace(/\/$/, "");
const EVO_KEY = process.env.EVOLUTION_API_KEY;

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  if (!EVO_URL || !EVO_KEY) {
    return NextResponse.json({ error: "Evolution API não configurada" }, { status: 500 });
  }

  const { searchParams } = await Promise.resolve(new URL(req.url));
  const instanceName = searchParams.get("instanceName");
  if (!instanceName) return NextResponse.json({ error: "instanceName obrigatório" }, { status: 400 });

  try {
    const res  = await fetch(`${EVO_URL}/instance/connectionState/${instanceName}`, {
      headers: { apikey: EVO_KEY },
    });
    const data = await res.json();

    const state = data?.instance?.state ?? data?.state ?? "unknown";

    if (state === "open") {
      const phone = data?.instance?.owner ?? null;
      return NextResponse.json({ status: "open", phone });
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
