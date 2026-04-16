import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
  const clientId     = searchParams.get("clientId");

  if (!instanceName) return NextResponse.json({ error: "instanceName obrigatório" }, { status: 400 });

  try {
    const res  = await fetch(`${EVO_URL}/instance/connectionState/${instanceName}`, {
      headers: { apikey: EVO_KEY },
    });
    const data = await res.json();

    const state = data?.instance?.state ?? data?.state ?? "unknown";

    if (state === "open") {
      // Parse phone — Evolution API v2 may use ownerJid, owner, or profileName
      let rawPhone =
        data?.instance?.ownerJid ??
        data?.instance?.owner ??
        data?.ownerJid ??
        data?.instance?.profileName ??
        "";

      // If phone is still empty, try /instance/fetchInstances for richer data
      if (!rawPhone) {
        try {
          const fetchRes  = await fetch(`${EVO_URL}/instance/fetchInstances`, {
            headers: { apikey: EVO_KEY },
          });
          const fetchData = await fetchRes.json();
          const instances = Array.isArray(fetchData) ? fetchData : (fetchData?.instances ?? [fetchData]);
          const match     = instances.find(
            (i: Record<string, unknown>) =>
              (i.instance as Record<string, unknown>)?.instanceName === instanceName ||
              (i.instanceName as string) === instanceName
          );
          rawPhone =
            (match?.instance as Record<string, unknown>)?.ownerJid as string ??
            (match?.instance as Record<string, unknown>)?.owner as string ??
            (match?.ownerJid as string) ??
            (match?.owner as string) ??
            (match?.profileName as string) ??
            "";
        } catch (_) { /* ignore */ }
      }

      const phone   = rawPhone.replace(/@.*$/, "").replace(/^\+/, "");
      const display = phone ? `+${phone}` : "";

      // Save to database if clientId provided
      if (clientId) {
        try {
          // Remove old active accounts for this instance
          await prisma.whatsAppAccount.deleteMany({
            where: { clientId, phoneNumberId: instanceName },
          });

          // Create new active account
          await prisma.whatsAppAccount.create({
            data: {
              clientId,
              phoneNumber:   display || instanceName,
              phoneNumberId: instanceName,
              displayName:   display || instanceName,
              accessToken:   instanceName, // Evolution uses instanceName, not a token
              status:        "active",
              verifiedAt:    new Date(),
            },
          });
        } catch (dbErr) {
          console.error("[evolution/status] DB save error:", dbErr);
        }
      }

      return NextResponse.json({ status: "open", phone: display || instanceName });
    }

    // QR may have rotated — return new one if present
    if (data?.qrcode?.base64) {
      return NextResponse.json({ status: "qr", qr: data.qrcode.base64 });
    }

    return NextResponse.json({ status: state });
  } catch (err) {
    console.error("[evolution/status]", err);
    return NextResponse.json({ error: "Falha ao verificar status" }, { status: 500 });
  }
}
