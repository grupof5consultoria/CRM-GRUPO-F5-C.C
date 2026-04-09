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

        const value = c.value as Record<string, unknown>;
        const messages: unknown[] = (value?.messages as unknown[]) ?? [];
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
          // Only process incoming messages (type: text, button, interactive, etc.)
          if (m.type === "reaction") continue;

          const from         = (m.from as string) ?? "unknown";
          const timestamp    = m.timestamp ? new Date(Number(m.timestamp) * 1000) : new Date();
          const date         = timestamp.toISOString().split("T")[0];
          const firstMessage = extractText(m);

          // Detect campaign reference from message text
          const campaignRef  = detectCampaignRef(firstMessage);

          // Deduplicate: one conversation per sender per day
          const existing = await prisma.whatsAppConversation.findFirst({
            where: { accountId: account.id, from: hashPhone(from), date },
          });
          if (existing) continue;

          await prisma.whatsAppConversation.create({
            data: {
              accountId:    account.id,
              from:         hashPhone(from),
              firstMessage: firstMessage?.slice(0, 200) ?? null,
              campaignRef,
              date,
              startedAt:    timestamp,
            },
          });
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

function detectCampaignRef(text: string | null): string | null {
  if (!text) return null;
  // Detect patterns like "vim pelo instagram", "vim pelo anuncio", UTM refs embedded in text
  const lower = text.toLowerCase();
  if (lower.includes("instagram")) return "instagram";
  if (lower.includes("anuncio") || lower.includes("anúncio") || lower.includes("meta ads")) return "meta_ads";
  if (lower.includes("facebook")) return "facebook";
  if (lower.includes("google")) return "google";
  return null;
}

// Simple one-way hash to avoid storing real phone numbers in plain text
function hashPhone(phone: string): string {
  // Replace last 4 digits with **** for basic privacy while still being useful for dedup
  return phone.slice(0, -4) + "****";
}
