import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Este endpoint é chamado automaticamente pelo Vercel Cron a cada 30 dias.
// Renova todos os tokens Meta que vão expirar em menos de 15 dias.
export async function GET(req: NextRequest) {
  // Proteção: só aceita chamadas do Vercel Cron ou com a chave correta
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const appId     = process.env.META_APP_ID!;
  const appSecret = process.env.META_APP_SECRET!;

  // Buscar todos os clientes com token Meta configurado
  const clients = await prisma.client.findMany({
    where: { metaAccessToken: { not: null } },
    select: { id: true, name: true, metaAccessToken: true },
  });

  const results = { renewed: 0, failed: 0, errors: [] as string[] };

  for (const client of clients) {
    if (!client.metaAccessToken) continue;

    try {
      const res = await fetch(
        `https://graph.facebook.com/v19.0/oauth/access_token?` +
        new URLSearchParams({
          grant_type:       "fb_exchange_token",
          client_id:        appId,
          client_secret:    appSecret,
          fb_exchange_token: client.metaAccessToken,
        }),
        { next: { revalidate: 0 } }
      );

      const data = await res.json();

      if (!data.access_token) {
        throw new Error(data.error?.message ?? "Token inválido");
      }

      await prisma.client.update({
        where: { id: client.id },
        data: { metaAccessToken: data.access_token },
      });

      results.renewed++;
    } catch (e) {
      results.failed++;
      results.errors.push(`${client.name}: ${e instanceof Error ? e.message : "erro desconhecido"}`);
    }
  }

  console.log(`[cron/renew-meta-tokens] renewed=${results.renewed} failed=${results.failed}`);
  return NextResponse.json(results);
}
