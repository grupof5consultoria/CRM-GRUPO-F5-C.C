import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchMetaInsights } from "@/lib/meta-api";

/**
 * Cron diário: sincroniza ontem + hoje para todos os clientes Meta ativos.
 * Horário: 06:00 BRT (09:00 UTC) — dados do dia anterior já estão fechados.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const dateFrom = yesterday.toISOString().split("T")[0]; // ontem
  const dateTo   = now.toISOString().split("T")[0];       // hoje

  const clients = await prisma.client.findMany({
    where: {
      status: "active",
      metaAdAccountId:  { not: null },
      metaAccessToken:  { not: null },
    },
    select: { id: true, name: true, metaAdAccountId: true, metaAccessToken: true },
  });

  const results = {
    date: dateTo,
    synced: 0,
    skipped: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const client of clients) {
    try {
      const rows = await fetchMetaInsights(
        client.metaAdAccountId!,
        client.metaAccessToken!,
        dateFrom,
        dateTo
      );

      if (rows.length === 0) { results.skipped++; continue; }

      const syncedAt = new Date();
      for (const row of rows) {
        const entry = {
          spend:         row.spend,
          impressions:   row.impressions,
          clicks:        row.clicks,
          leadsFromAds:  row.leadsFromAds,
          reach:         row.reach,
          cpm:           row.cpm,
          linkClicks:    row.linkClicks,
          cpc:           row.cpc,
          ctr:           row.ctr,
          costPerResult: row.costPerResult,
          conversations: row.conversations,
          syncedAt,
        };
        await prisma.clientMetricEntry.upsert({
          where: { clientId_platform_date: { clientId: client.id, platform: "meta", date: row.date } },
          create: { clientId: client.id, platform: "meta", date: row.date, ...entry },
          update: entry,
        });
      }
      results.synced++;
    } catch (e) {
      results.failed++;
      results.errors.push(`${client.name}: ${e instanceof Error ? e.message : "erro"}`);
    }
  }

  console.log(`[cron/sync-metrics] ${JSON.stringify(results)}`);
  return NextResponse.json(results);
}
