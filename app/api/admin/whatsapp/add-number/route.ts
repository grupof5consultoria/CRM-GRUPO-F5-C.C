import { NextRequest, NextResponse } from "next/server";
import { requireInternalAuth } from "@/lib/auth";

const WABA_ID     = process.env.META_WABA_ID!;
const SYSTEM_TOKEN = process.env.META_SYSTEM_TOKEN!;

// POST /api/admin/whatsapp/add-number
// Body: { phoneNumber: "+5511999999999", displayName: "Dra. Ana" }
// 1. Registra o número no WABA
// 2. Solicita código de verificação via SMS
// Retorna: { phoneNumberId }
export async function POST(req: NextRequest) {
  await requireInternalAuth();
  const { phoneNumber, displayName } = await req.json();

  if (!phoneNumber) return NextResponse.json({ error: "Número obrigatório" }, { status: 400 });

  // Limpa o número — remove +, espaços, traços
  const cleaned = phoneNumber.replace(/\D/g, "");
  // Separa código do país (primeiros 2 dígitos para Brasil = 55)
  const cc    = cleaned.startsWith("55") ? "55" : cleaned.slice(0, 2);
  const local = cleaned.startsWith("55") ? cleaned.slice(2) : cleaned.slice(2);

  // 1. Adicionar número ao WABA
  const addRes = await fetch(`https://graph.facebook.com/v19.0/${WABA_ID}/phone_numbers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cc,
      phone_number: local,
      migrate_phone_number: false,
      display_phone_number: phoneNumber,
      verified_name: displayName ?? "WhatsApp Business",
      access_token: SYSTEM_TOKEN,
    }),
  });
  const addData = await addRes.json();

  if (addData.error) {
    return NextResponse.json({ error: `Meta API: ${addData.error.message}` }, { status: 400 });
  }

  const phoneNumberId: string = addData.id;

  // 2. Solicitar código SMS
  const codeRes = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/request_code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code_method: "SMS",
      language: "pt_BR",
      access_token: SYSTEM_TOKEN,
    }),
  });
  const codeData = await codeRes.json();

  if (codeData.error) {
    return NextResponse.json({ error: `Erro ao enviar SMS: ${codeData.error.message}` }, { status: 400 });
  }

  return NextResponse.json({ success: true, phoneNumberId });
}
