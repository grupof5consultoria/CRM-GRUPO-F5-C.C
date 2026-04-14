import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchMetaCampaignInsights } from "@/lib/meta-api";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.clientId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const dateFrom = searchParams.get("dateFrom");
  const dateTo   = searchParams.get("dateTo");
  if (!dateFrom || !dateTo) return NextResponse.json({ error: "Parâmetros ausentes" }, { status: 400 });

  const client = await prisma.client.findUnique({
    where: { id: session.clientId },
    select: { metaAdAccountId: true, metaAccessToken: true },
  });

  if (!client?.metaAdAccountId || !client?.metaAccessToken) {
    return NextResponse.json({ campaigns: [] });
  }

  try {
    const campaigns = await fetchMetaCampaignInsights(
      client.metaAdAccountId,
      client.metaAccessToken,
      dateFrom,
      dateTo
    );
    return NextResponse.json({ campaigns });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erro ao buscar campanhas" }, { status: 500 });
  }
}
