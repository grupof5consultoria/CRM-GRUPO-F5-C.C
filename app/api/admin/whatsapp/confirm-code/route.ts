import { NextRequest, NextResponse } from "next/server";
import { requireInternalAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const WABA_ID      = process.env.META_WABA_ID!;
const SYSTEM_TOKEN = process.env.META_SYSTEM_TOKEN!;

// POST /api/admin/whatsapp/confirm-code
// Body: { clientId, phoneNumber, displayName, phoneNumberId, code }
export async function POST(req: NextRequest) {
  await requireInternalAuth();
  const { clientId, phoneNumber, displayName, phoneNumberId, code } = await req.json();

  if (!phoneNumberId || !code) {
    return NextResponse.json({ error: "phoneNumberId e code são obrigatórios" }, { status: 400 });
  }

  // 1. Verificar código SMS
  const verifyRes = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/verify_code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, access_token: SYSTEM_TOKEN }),
  });
  const verifyData = await verifyRes.json();

  if (verifyData.error) {
    return NextResponse.json({ error: `Código inválido: ${verifyData.error.message}` }, { status: 400 });
  }

  // 2. Registrar o número na Cloud API
  const regRes = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      pin: "000000",
      access_token: SYSTEM_TOKEN,
    }),
  });
  const regData = await regRes.json();

  if (regData.error) {
    return NextResponse.json({ error: `Erro ao registrar: ${regData.error.message}` }, { status: 400 });
  }

  // 3. Salvar no banco
  const account = await prisma.whatsAppAccount.upsert({
    where: { phoneNumberId },
    create: {
      clientId,
      phoneNumber,
      phoneNumberId,
      displayName: displayName ?? null,
      accessToken: SYSTEM_TOKEN,
      wabaId: WABA_ID,
      status: "active",
      verifiedAt: new Date(),
    },
    update: {
      clientId,
      phoneNumber,
      displayName: displayName ?? null,
      accessToken: SYSTEM_TOKEN,
      wabaId: WABA_ID,
      status: "active",
      verifiedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true, account: { id: account.id, phoneNumber: account.phoneNumber, displayName: account.displayName } });
}
