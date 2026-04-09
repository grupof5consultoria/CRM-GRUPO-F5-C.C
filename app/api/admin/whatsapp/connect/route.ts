import { NextRequest, NextResponse } from "next/server";
import { requireInternalAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/admin/whatsapp/connect
// Body: { clientId, phoneNumber, phoneNumberId, accessToken, wabaId?, displayName? }
export async function POST(req: NextRequest) {
  await requireInternalAuth();
  const body = await req.json();
  const { clientId, phoneNumber, phoneNumberId, accessToken, wabaId, displayName } = body;

  if (!clientId || !phoneNumber || !phoneNumberId || !accessToken) {
    return NextResponse.json({ error: "Campos obrigatórios: clientId, phoneNumber, phoneNumberId, accessToken" }, { status: 400 });
  }

  // Verify token by calling Meta API
  const verifyRes = await fetch(
    `https://graph.facebook.com/v19.0/${phoneNumberId}?fields=display_phone_number,verified_name,quality_rating&access_token=${accessToken}`,
    { next: { revalidate: 0 } }
  );
  const verifyData = await verifyRes.json();

  if (verifyData.error) {
    return NextResponse.json({
      error: `Erro ao verificar com Meta: ${verifyData.error.message}`,
    }, { status: 400 });
  }

  // Subscribe webhook for this WABA
  if (wabaId) {
    await fetch(
      `https://graph.facebook.com/v19.0/${wabaId}/subscribed_apps`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: accessToken }),
      }
    ).catch(() => {/* non-fatal */});
  }

  // Upsert account
  const account = await prisma.whatsAppAccount.upsert({
    where: { phoneNumberId },
    create: {
      clientId,
      phoneNumber,
      phoneNumberId,
      displayName: displayName ?? verifyData.verified_name ?? null,
      accessToken,
      wabaId: wabaId ?? null,
      status: "active",
      verifiedAt: new Date(),
    },
    update: {
      clientId,
      phoneNumber,
      displayName: displayName ?? verifyData.verified_name ?? null,
      accessToken,
      wabaId: wabaId ?? null,
      status: "active",
      verifiedAt: new Date(),
    },
  });

  return NextResponse.json({
    success: true,
    account: {
      id: account.id,
      phoneNumber: account.phoneNumber,
      displayName: account.displayName,
      status: account.status,
      verifiedName: verifyData.verified_name,
      qualityRating: verifyData.quality_rating,
    },
  });
}
