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

  const { searchParams } = new URL(req.url);
  const instanceName = searchParams.get("instanceName");
  const phone       = searchParams.get("phone");

  if (!instanceName || !phone) {
    return NextResponse.json({ error: "instanceName e phone são obrigatórios" }, { status: 400 });
  }

  // Normalize: keep only digits, build remoteJid
  const cleanPhone = phone.replace(/\D/g, "");
  const remoteJid  = `${cleanPhone}@s.whatsapp.net`;

  try {
    const res = await fetch(`${EVO_URL}/chat/findMessages/${instanceName}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: EVO_KEY },
      body: JSON.stringify({
        where: { key: { remoteJid } },
        limit: 60,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[chat/messages] Evolution error:", res.status, text);
      return NextResponse.json({ messages: [] }); // return empty, don't crash UI
    }

    const data = await res.json();

    // Handle multiple Evolution API response formats
    const records: unknown[] =
      data?.messages?.records ??
      data?.records ??
      (Array.isArray(data?.messages) ? data.messages : []) ??
      [];

    const messages = (records as Record<string, unknown>[])
      .map((m) => {
        const key     = m.key as Record<string, unknown> | undefined;
        const message = m.message as Record<string, unknown> | undefined;
        const extText = (message?.extendedTextMessage as Record<string, unknown> | undefined)?.text;
        const btnText = (message?.buttonsResponseMessage as Record<string, unknown> | undefined)?.selectedDisplayText;

        return {
          id:        (key?.id as string) ?? `${Date.now()}-${Math.random()}`,
          fromMe:    (key?.fromMe as boolean) ?? false,
          text:      (message?.conversation as string) ?? (extText as string) ?? (btnText as string) ?? "[mídia]",
          timestamp: m.messageTimestamp
            ? new Date(Number(m.messageTimestamp) * 1000).toISOString()
            : new Date().toISOString(),
          pushName:  (m.pushName as string) ?? null,
        };
      })
      // Sort oldest → newest
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return NextResponse.json(
      { messages },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[chat/messages]", err);
    return NextResponse.json({ messages: [] }); // fail gracefully
  }
}
