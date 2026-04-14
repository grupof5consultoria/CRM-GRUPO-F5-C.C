import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchMetaAdInsights } from "@/lib/meta-api";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.clientId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const dateFrom    = searchParams.get("dateFrom");
  const dateTo      = searchParams.get("dateTo");
  const campaignId  = searchParams.get("campaignId") ?? undefined;
  if (!dateFrom || !dateTo) return NextResponse.json({ error: "Parâmetros ausentes" }, { status: 400 });

  const client = await prisma.client.findUnique({
    where: { id: session.clientId },
    select: { metaAdAccountId: true, metaAccessToken: true },
  });

  if (!client?.metaAdAccountId || !client?.metaAccessToken) {
    return NextResponse.json({ ads: [] });
  }

  try {
    const ads = await fetchMetaAdInsights(
      client.metaAdAccountId,
      client.metaAccessToken,
      dateFrom,
      dateTo,
      campaignId
    );
    return NextResponse.json({ ads });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erro ao buscar anúncios" }, { status: 500 });
  }
}
