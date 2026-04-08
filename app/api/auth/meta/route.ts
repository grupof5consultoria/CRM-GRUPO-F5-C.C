import { NextRequest, NextResponse } from "next/server";
import { requireInternalAuth } from "@/lib/auth";

// GET /api/auth/meta?clientId=xxx
// Inicia o fluxo OAuth da Meta — redireciona para o login do Facebook
export async function GET(req: NextRequest) {
  await requireInternalAuth();

  const clientId = req.nextUrl.searchParams.get("clientId");
  if (!clientId) {
    return NextResponse.json({ error: "clientId obrigatório" }, { status: 400 });
  }

  const appId = process.env.META_APP_ID!;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/meta/callback`;

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    state: clientId,
    scope: "ads_read,ads_management",
    response_type: "code",
  });

  return NextResponse.redirect(
    `https://www.facebook.com/v19.0/dialog/oauth?${params}`
  );
}
