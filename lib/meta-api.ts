export interface MetaInsights {
  // Shared
  spend: number;
  impressions: number;
  clicks: number;
  leadsFromAds: number;
  // Meta-specific
  reach: number;
  cpm: number;
  linkClicks: number;
  cpc: number;
  ctr: number;
  costPerResult: number;
}

export interface MetaDailyInsight extends MetaInsights {
  date: string; // "YYYY-MM-DD"
}

export async function fetchMetaInsights(
  adAccountId: string,
  accessToken: string,
  dateFrom: string, // "2024-01-01"
  dateTo: string    // "2024-01-31"
): Promise<MetaDailyInsight[]> {
  const insightsParams = new URLSearchParams({
    fields: [
      "reach",
      "spend",
      "impressions",
      "cpm",
      "inline_link_clicks",
      "cost_per_inline_link_click",
      "inline_link_click_ctr",
      "cost_per_action_type",
      "actions",
    ].join(","),
    time_range: JSON.stringify({ since: dateFrom, until: dateTo }),
    time_increment: "1", // daily breakdown
    level: "account",
    access_token: accessToken,
  });

  const insightsRes = await fetch(
    `https://graph.facebook.com/v19.0/act_${adAccountId}/insights?${insightsParams}`,
    { next: { revalidate: 0 } }
  );
  const insightsData = await insightsRes.json();
  if (insightsData.error) throw new Error(`Meta API (insights): ${insightsData.error.message}`);

  const rows: Array<Record<string, unknown>> = insightsData.data ?? [];

  return rows.map((row) => {
    const leadAction = (row.actions as Array<{ action_type: string; value: string }> | undefined)
      ?.find((a) => a.action_type === "lead" || a.action_type === "onsite_conversion.lead_grouped");

    const costPerLead = (row.cost_per_action_type as Array<{ action_type: string; value: string }> | undefined)
      ?.find((a) => a.action_type === "lead" || a.action_type === "onsite_conversion.lead_grouped");

    return {
      date: row.date_start as string,
      spend: parseFloat((row.spend as string) ?? "0"),
      impressions: parseInt((row.impressions as string) ?? "0"),
      clicks: parseInt((row.clicks as string) ?? "0"),
      leadsFromAds: parseInt(leadAction?.value ?? "0"),
      reach: parseInt((row.reach as string) ?? "0"),
      cpm: parseFloat((row.cpm as string) ?? "0"),
      linkClicks: parseInt((row.inline_link_clicks as string) ?? "0"),
      cpc: parseFloat((row.cost_per_inline_link_click as string) ?? "0"),
      ctr: parseFloat((row.inline_link_click_ctr as string) ?? "0"),
      costPerResult: parseFloat(costPerLead?.value ?? "0"),
    };
  });
}
