import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const EVO_URL = process.env.EVOLUTION_API_URL?.replace(/\/$/, "");
const EVO_KEY = process.env.EVOLUTION_API_KEY;

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  if (!EVO_URL || !EVO_KEY) {
    return NextResponse.json({ error: "Evolution API não configurada" }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Body inválido" }, { status: 400 });

  const { instanceName, phone, text } = body as {
    instanceName?: string;
    phone?: string;
    text?: string;
  };

  if (!instanceName || !phone || !text?.trim()) {
    return NextResponse.json({ error: "instanceName, phone e text são obrigatórios" }, { status: 400 });
  }

  // Normalize phone: only digits (Evolution expects e.g. 5511999999999)
  const cleanPhone = phone.replace(/\D/g, "");

  try {
    const res = await fetch(`${EVO_URL}/message/sendText/${instanceName}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: EVO_KEY },
      body: JSON.stringify({
        number: cleanPhone,
        text:   text.trim(),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[chat/send] Evolution error:", res.status, detail);
      return NextResponse.json(
        { error: "Falha ao enviar mensagem", detail },
        { status: res.status }
      );
    }

    const data = await res.json().catch(() => ({}));
    return NextResponse.json({ ok: true, messageId: (data as Record<string, unknown>)?.key });
  } catch (err) {
    console.error("[chat/send]", err);
    return NextResponse.json({ error: "Erro interno ao enviar mensagem" }, { status: 500 });
  }
}
