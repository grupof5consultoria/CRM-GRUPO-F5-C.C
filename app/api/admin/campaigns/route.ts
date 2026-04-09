import { NextRequest, NextResponse } from "next/server";
import { requireInternalAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function randomCode(length = 6): string {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// GET /api/admin/campaigns?clientId=xxx
export async function GET(req: NextRequest) {
  await requireInternalAuth();
  const clientId = new URL(req.url).searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ error: "clientId obrigatório" }, { status: 400 });

  const campaigns = await prisma.whatsAppCampaign.findMany({
    where: { clientId },
    include: { whatsAppAccount: { select: { phoneNumber: true, displayName: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ campaigns });
}

// POST /api/admin/campaigns
export async function POST(req: NextRequest) {
  await requireInternalAuth();
  const {
    clientId, whatsAppAccountId, name, origin, defaultMessage,
    utmSource, utmMedium, utmCampaign, utmContent,
    adPlatformCampaignId, adPlatformCampaignName,
  } = await req.json();

  if (!clientId || !name || !origin || !defaultMessage) {
    return NextResponse.json({ error: "clientId, name, origin e defaultMessage são obrigatórios" }, { status: 400 });
  }

  // Generate unique campaign code
  let campaignCode = randomCode(6);
  let attempts = 0;
  while (attempts < 10) {
    const exists = await prisma.whatsAppCampaign.findUnique({ where: { campaignCode } });
    if (!exists) break;
    campaignCode = randomCode(6);
    attempts++;
  }

  const campaign = await prisma.whatsAppCampaign.create({
    data: {
      clientId,
      whatsAppAccountId: whatsAppAccountId || null,
      name,
      origin,
      campaignCode,
      defaultMessage,
      utmSource: utmSource || null,
      utmMedium: utmMedium || null,
      utmCampaign: utmCampaign || null,
      utmContent: utmContent || null,
      adPlatformCampaignId: adPlatformCampaignId || null,
      adPlatformCampaignName: adPlatformCampaignName || null,
    },
    include: { whatsAppAccount: { select: { phoneNumber: true, displayName: true } } },
  });

  return NextResponse.json({ campaign });
}

// DELETE /api/admin/campaigns?id=xxx
export async function DELETE(req: NextRequest) {
  await requireInternalAuth();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  await prisma.whatsAppCampaign.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
