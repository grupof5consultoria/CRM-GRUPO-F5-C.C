import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN ?? "grupof5-whatsapp-verify";

// ─── GET — Meta webhook verification challenge ────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode      = searchParams.get("hub.mode");
  const token     = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

// ─── POST — Receive messages ──────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: true });

  try {
    const entries: unknown[] = body?.entry ?? [];

    for (const entry of entries) {
      const e = entry as Record<string, unknown>;
      const changes: unknown[] = (e.changes as unknown[]) ?? [];

      for (const change of changes) {
        const c = change as Record<string, unknown>;
        if (c.field !== "messages") continue;

        const value    = c.value as Record<string, unknown>;
        const messages: unknown[] = (value?.messages as unknown[]) ?? [];
        const contacts: unknown[] = (value?.contacts as unknown[]) ?? [];
        const metadata = value?.metadata as Record<string, unknown> | undefined;
        const phoneNumberId = (metadata?.phone_number_id as string) ?? "";

        if (!phoneNumberId || messages.length === 0) continue;

        // Find the WhatsApp account by phone_number_id
        const account = await prisma.whatsAppAccount.findUnique({
          where: { phoneNumberId },
        });
        if (!account) continue;

        // Mark as active on first message if pending
        if (account.status !== "active") {
          await prisma.whatsAppAccount.update({
            where: { id: account.id },
            data: { status: "active", verifiedAt: new Date() },
          });
        }

        for (const msg of messages) {
          const m = msg as Record<string, unknown>;
          if (m.type === "reaction") continue;

          const from      = (m.from as string) ?? "unknown";
          const timestamp = m.timestamp ? new Date(Number(m.timestamp) * 1000) : new Date();
          const date      = timestamp.toISOString().split("T")[0];
          const period    = date.slice(0, 7); // "YYYY-MM"
          const msgText   = extractText(m);

          // ── Extract lead name from contacts ───────────────────────────
          const contactEntry = (contacts[0] as Record<string, unknown> | undefined);
          const leadName = (contactEntry?.profile as Record<string, unknown> | undefined)?.name as string | null ?? null;
          const leadPhone = from; // real phone number for callback

          // ── Detect origin ─────────────────────────────────────────────
          // Priority: [ref:CODE] in message > Meta CTWA referral > keyword fallback
          const campaignCode = extractCampaignCode(msgText);
          let origin: string = "organic";
          let campaignId: string | null = null;

          if (campaignCode) {
            // Look up campaign by code
            const campaign = await prisma.whatsAppCampaign.findUnique({
              where: { campaignCode },
            });
            if (campaign) {
              origin     = campaign.origin;
              campaignId = campaign.id;
            }
          } else {
            // Check Meta CTWA referral object
            const referral = m.referral as Record<string, unknown> | undefined;
            if (referral?.source_type === "ad") {
              origin = "meta_ads";
            } else if (referral?.source_type === "post") {
              origin = "instagram";
            } else {
              // Keyword fallback
              origin = detectOriginFromText(msgText);
            }
          }

          // ── Save to WhatsAppConversation (dedup per sender/day) ───────
          const existing = await prisma.whatsAppConversation.findFirst({
            where: { accountId: account.id, from: hashPhone(from), date },
          });

          if (!existing) {
            await prisma.whatsAppConversation.create({
              data: {
                accountId:    account.id,
                from:         hashPhone(from),
                firstMessage: msgText?.slice(0, 200) ?? null,
                campaignRef:  campaignId ?? origin,
                date,
                startedAt:    timestamp,
              },
            });
          }

          // ── Auto-create Attendance lead (dedup per phone/period) ──────
          const existingLead = await prisma.attendance.findFirst({
            where: { clientId: account.clientId, leadPhone, period },
          });

          if (!existingLead) {
            await prisma.attendance.create({
              data: {
                clientId:     account.clientId,
                leadName:     leadName,
                leadPhone:    leadPhone,
                origin:       origin as "meta_ads" | "google_ads" | "instagram" | "google_organic" | "referral" | "organic" | "other",
                status:       "follow_up",
                followUpCount: 0,
                contactDate:  timestamp,
                period,
                notes:        campaignCode ? `Lead via campanha [ref:${campaignCode}]` : "Lead via WhatsApp",
              },
            });
          }
        }
      }
    }
  } catch (err) {
    console.error("[WhatsApp Webhook]", err);
  }

  // Always return 200 to Meta
  return NextResponse.json({ ok: true });
}

function extractText(msg: Record<string, unknown>): string | null {
  if (msg.type === "text") {
    return ((msg.text as Record<string, unknown>)?.body as string) ?? null;
  }
  if (msg.type === "button") {
    return ((msg.button as Record<string, unknown>)?.text as string) ?? null;
  }
  if (msg.type === "interactive") {
    const interactive = msg.interactive as Record<string, unknown>;
    return (
      ((interactive?.button_reply as Record<string, unknown>)?.title as string) ??
      ((interactive?.list_reply as Record<string, unknown>)?.title as string) ??
      null
    );
  }
  return null;
}

// Extract [ref:XXXXXX] from message text
function extractCampaignCode(text: string | null): string | null {
  if (!text) return null;
  const match = text.match(/\[ref:([a-zA-Z0-9]{4,12})\]/);
  return match ? match[1] : null;
}

function detectOriginFromText(text: string | null): string {
  if (!text) return "organic";
  const lower = text.toLowerCase();
  if (lower.includes("instagram")) return "instagram";
  if (lower.includes("anuncio") || lower.includes("anúncio") || lower.includes("meta ads")) return "meta_ads";
  if (lower.includes("google ads")) return "google_ads";
  if (lower.includes("google")) return "google_organic";
  return "organic";
}

function hashPhone(phone: string): string {
  return phone.slice(0, -4) + "****";
}
