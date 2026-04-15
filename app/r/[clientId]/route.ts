import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { encodeRefZW } from "@/lib/tracking-encode";

const SOURCE_LABELS: Record<string, string> = {
  "google-ads":          "Google Ads",
  "meta-ads":            "Meta Ads",
  "google-meu-negocio":  "Google Meu Negócio",
  "instagram-bio":       "Instagram",
};

function detectDevice(ua: string): string {
  if (/mobile|android|iphone|ipad|ipod/i.test(ua)) return "mobile";
  if (/tablet/i.test(ua)) return "tablet";
  return "desktop";
}

async function getGeoFromIp(ip: string): Promise<{ city?: string; state?: string; country?: string }> {
  try {
    const res  = await fetch(`http://ip-api.com/json/${ip}?fields=city,regionName,country&lang=pt-BR`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) return {};
    const data = await res.json();
    return { city: data.city, state: data.regionName, country: data.country };
  } catch {
    return {};
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  const { searchParams } = new URL(req.url);

  const campaignId = searchParams.get("camp");
  const source     = searchParams.get("src") ?? "other";

  // Validate client and campaign
  const [client, campaign] = await Promise.all([
    prisma.client.findUnique({
      where: { id: clientId },
      include: { whatsappAccounts: { where: { status: "active" }, take: 1 } },
    }),
    campaignId
      ? prisma.trackingCampaign.findUnique({ where: { id: campaignId }, select: { message: true } })
      : null,
  ]);

  if (!client) {
    return NextResponse.redirect("https://wa.me/");
  }

  // Get WhatsApp number
  const whatsapp = client.whatsappAccounts[0]?.phoneNumber?.replace(/\D/g, "") ?? client.phone?.replace(/\D/g, "");

  if (!whatsapp) {
    return NextResponse.json({ error: "Cliente sem WhatsApp configurado" }, { status: 400 });
  }

  // Get IP and headers
  const headersList = await headers();
  const forwarded   = headersList.get("x-forwarded-for");
  const ip          = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  const ua          = headersList.get("user-agent") ?? "";
  const device      = detectDevice(ua);

  // Geo lookup
  const geo = ip !== "unknown" && !ip.startsWith("127.") && !ip.startsWith("::1")
    ? await getGeoFromIp(ip)
    : {};

  // Create tracking click
  let ref = "";
  try {
    if (campaignId) {
      const click = await prisma.trackingClick.create({
        data: {
          campaignId,
          source,
          city:    geo.city,
          state:   geo.state,
          country: geo.country,
          device,
          ip,
        },
      });
      ref = click.ref;
    }
  } catch {
    // Non-blocking — proceed even if DB fails
  }

  // Build pre-filled WhatsApp message with invisible tracking code
  const baseMessage = campaign?.message?.trim() || "Olá! Gostaria de saber mais sobre os serviços.";
  const invisible   = ref ? encodeRefZW(ref) : "";
  const fullMessage = baseMessage + invisible;

  const message = encodeURIComponent(fullMessage);
  const waUrl       = `https://wa.me/${whatsapp}?text=${message}`;

  return NextResponse.redirect(waUrl);
}
