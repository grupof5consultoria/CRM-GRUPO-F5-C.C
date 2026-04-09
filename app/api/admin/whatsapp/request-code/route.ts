import { NextRequest, NextResponse } from "next/server";
import { requireInternalAuth } from "@/lib/auth";

const SYSTEM_TOKEN = process.env.META_SYSTEM_TOKEN!;

// POST /api/admin/whatsapp/request-code
// Body: { phoneNumberId }
// Requests SMS verification code for an existing WABA phone number
export async function POST(req: NextRequest) {
  await requireInternalAuth();
  const { phoneNumberId } = await req.json();

  if (!phoneNumberId) {
    return NextResponse.json({ error: "phoneNumberId obrigatório" }, { status: 400 });
  }

  const res = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/request_code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code_method: "SMS",
      language: "pt_BR",
      access_token: SYSTEM_TOKEN,
    }),
  });
  const data = await res.json();

  if (data.error) {
    return NextResponse.json({ error: `Erro ao enviar SMS: ${data.error.message}` }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
