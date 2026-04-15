import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decodeRefZW } from "@/lib/tracking-encode";

const EVO_URL = process.env.EVOLUTION_API_URL?.replace(/\/$/, "");
const EVO_KEY = process.env.EVOLUTION_API_KEY;

type AttendanceOriginType = "meta_ads" | "google_ads" | "instagram" | "google_organic" | "referral" | "organic" | "other";

function mapSource(source: string): AttendanceOriginType {
  const map: Record<string, AttendanceOriginType> = {
    "google-ads":          "google_ads",
    "meta-ads":            "meta_ads",
    "google-meu-negocio":  "google_organic",
    "instagram-bio":       "instagram",
  };
  return map[source] ?? "other";
}

async function fetchProfilePhoto(instanceName: string, phone: string): Promise<string | null> {
  if (!EVO_URL || !EVO_KEY) return null;
  try {
    const res = await fetch(`${EVO_URL}/chat/fetchProfilePictureUrl/${instanceName}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: EVO_KEY },
      body: JSON.stringify({ number: phone }),
    });
    const data = await res.json();
    return data?.profilePictureUrl ?? data?.picture ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const event        = body?.event;
    const instanceName = body?.instance;
    const data         = body?.data;

    if (!event || !instanceName) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // ── Connection state changed ─────────────────────────────────────────────
    if (event === "connection.update") {
      const state = data?.state;

      if (state === "close" || state === "connecting") {
        await prisma.whatsAppAccount.updateMany({
          where: { phoneNumberId: instanceName, status: "active" },
          data:  { status: "inactive" },
        });
      }

      if (state === "open") {
        await prisma.whatsAppAccount.updateMany({
          where: { phoneNumberId: instanceName, status: "inactive" },
          data:  { status: "active", verifiedAt: new Date() },
        });
      }
    }

    // ── Incoming message → create lead ───────────────────────────────────────
    if (event === "messages.upsert") {
      // Ignore messages sent by the account itself
      if (data?.key?.fromMe) return NextResponse.json({ ok: true });

      const remoteJid = data?.key?.remoteJid ?? "";

      // Ignore group messages
      if (remoteJid.includes("@g.us")) return NextResponse.json({ ok: true });

      const phone      = remoteJid.replace("@s.whatsapp.net", "");
      const senderName = (data?.pushName ?? "").trim();
      const messageText =
        data?.message?.conversation ??
        data?.message?.extendedTextMessage?.text ??
        data?.message?.buttonsResponseMessage?.selectedDisplayText ??
        "";

      if (!phone) return NextResponse.json({ ok: true });

      // Find client from instance
      const account = await prisma.whatsAppAccount.findFirst({
        where:  { phoneNumberId: instanceName, status: "active" },
        select: { clientId: true },
      });
      if (!account) return NextResponse.json({ ok: true });

      const { clientId } = account;

      // ── Step 1: Try zero-width decode ──────────────────────────────────────
      let trackingClickId: string | null = null;
      let clickData: { source: string; city: string | null; state: string | null; device: string | null; campaign: { name: string; type: string } } | null = null;

      const decodedRef = decodeRefZW(messageText);
      if (decodedRef) {
        const click = await prisma.trackingClick.findUnique({
          where:   { ref: decodedRef },
          include: { campaign: { select: { name: true, type: true } }, patientLead: true },
        });
        if (click && !click.patientLead) {
          trackingClickId = click.id;
          clickData = {
            source:   click.source,
            city:     click.city,
            state:    click.state,
            device:   click.device,
            campaign: click.campaign,
          };
        }
      }

      // ── Step 2: Fallback — time window (last 30 min) ───────────────────────
      if (!trackingClickId) {
        const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
        const recentClick = await prisma.trackingClick.findFirst({
          where: {
            campaign: { clientId },
            clickedAt: { gte: thirtyMinAgo },
            patientLead: null,
          },
          orderBy: { clickedAt: "desc" },
          include: { campaign: { select: { name: true, type: true } } },
        });
        if (recentClick) {
          trackingClickId = recentClick.id;
          clickData = {
            source:   recentClick.source,
            city:     recentClick.city,
            state:    recentClick.state,
            device:   recentClick.device,
            campaign: recentClick.campaign,
          };
        }
      }

      // ── Fetch profile photo (non-blocking) ─────────────────────────────────
      const photoUrl = await fetchProfilePhoto(instanceName, phone);

      // ── Check if lead already exists ───────────────────────────────────────
      const existing = await prisma.patientLead.findFirst({
        where: { clientId, phone: { contains: phone } },
      });

      if (existing) {
        // Update with tracking data if not yet linked
        if (trackingClickId && !existing.trackingClickId) {
          await prisma.patientLead.update({
            where: { id: existing.id },
            data: {
              trackingClickId,
              city:         clickData?.city     ?? existing.city,
              state:        clickData?.state    ?? existing.state,
              device:       clickData?.device   ?? existing.device,
              campaignType: clickData?.campaign.type ?? existing.campaignType,
              photoUrl:     photoUrl ?? existing.photoUrl ?? undefined,
            },
          });
        }
        return NextResponse.json({ ok: true });
      }

      // ── Create new lead ────────────────────────────────────────────────────
      await prisma.patientLead.create({
        data: {
          clientId,
          name:           senderName || `+${phone}`,
          phone:          `+${phone}`,
          photoUrl:       photoUrl ?? undefined,
          city:           clickData?.city    ?? undefined,
          state:          clickData?.state   ?? undefined,
          device:         clickData?.device  ?? undefined,
          source:         clickData?.campaign.name ?? instanceName,
          campaignType:   clickData?.campaign.type ?? undefined,
          origin:         mapSource(clickData?.source ?? ""),
          trackingClickId: trackingClickId ?? undefined,
          status:         "novo_lead",
        },
      });

      console.log(`[evolution/webhook] Novo lead criado: ${senderName || phone} | cliente: ${clientId} | origem: ${clickData?.source ?? "direto"}`);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[evolution/webhook]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
