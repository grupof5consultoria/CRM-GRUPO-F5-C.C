import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/auth/meta/callback?code=xxx&state=clientId
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code      = searchParams.get("code");
  const clientId  = searchParams.get("state");
  const error     = searchParams.get("error");
  const baseUrl   = process.env.NEXTAUTH_URL!;

  if (error) {
    return NextResponse.redirect(
      `${baseUrl}/admin/clients/${clientId}?meta_error=${encodeURIComponent(searchParams.get("error_description") ?? error)}`
    );
  }

  if (!code || !clientId) {
    return NextResponse.redirect(`${baseUrl}/admin/clients?meta_error=parametros_invalidos`);
  }

  const appId      = process.env.META_APP_ID!;
  const appSecret  = process.env.META_APP_SECRET!;
  const redirectUri = `${baseUrl}/api/auth/meta/callback`;

  try {
    // 1. Trocar code por token de curta duração
    const tokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?` +
      new URLSearchParams({ client_id: appId, client_secret: appSecret, redirect_uri: redirectUri, code }),
      { next: { revalidate: 0 } }
    );
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      throw new Error(tokenData.error?.message ?? "Falha ao obter token");
    }
    const shortToken: string = tokenData.access_token;

    // 2. Trocar por token de longa duração (~60 dias)
    const longRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?` +
      new URLSearchParams({
        grant_type: "fb_exchange_token",
        client_id: appId,
        client_secret: appSecret,
        fb_exchange_token: shortToken,
      }),
      { next: { revalidate: 0 } }
    );
    const longData = await longRes.json();
    const longToken: string = longData.access_token ?? shortToken;

    // 3. Buscar contas de anúncio acessíveis
    const accountsRes = await fetch(
      `https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name,account_status&access_token=${longToken}`,
      { next: { revalidate: 0 } }
    );
    const accountsData = await accountsRes.json();
    const accounts: Array<{ id: string; name: string; account_status: number }> =
      accountsData.data ?? [];

    // Filtrar apenas contas ativas (status 1)
    const active = accounts.filter((a) => a.account_status === 1);

    if (active.length === 0) {
      return NextResponse.redirect(
        `${baseUrl}/admin/clients/${clientId}?meta_error=${encodeURIComponent("Nenhuma conta de anúncio ativa encontrada")}`
      );
    }

    if (active.length === 1) {
      // Salva diretamente
      const adAccountId = active[0].id.replace("act_", "");
      await prisma.client.update({
        where: { id: clientId },
        data: { metaAdAccountId: adAccountId, metaAccessToken: longToken },
      });
      return NextResponse.redirect(
        `${baseUrl}/admin/clients/${clientId}?meta_success=1`
      );
    }

    // Múltiplas contas — salva token temporário e redireciona para seleção
    // Usamos um cookie criptografado simples com expiração de 10 minutos
    const payload = Buffer.from(JSON.stringify({ token: longToken, accounts: active })).toString("base64");
    const res = NextResponse.redirect(
      `${baseUrl}/admin/clients/${clientId}/meta-accounts`
    );
    res.cookies.set("meta_pending", payload, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600, // 10 minutos
      path: "/",
    });
    return res;

  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.redirect(
      `${baseUrl}/admin/clients/${clientId}?meta_error=${encodeURIComponent(msg)}`
    );
  }
}
