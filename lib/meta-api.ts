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
  budget: number;
}

export async function fetchMetaInsights(
  adAccountId: string,
  accessToken: string,
  period: string // "2024-01"
): Promise<MetaInsights | null> {
  const [year, month] = period.split("-").map(Number);
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;

  // ── 1. Insights ─────────────────────────────────────────────────────────────
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
    time_range: JSON.stringify({ since: startDate, until: endDate }),
    level: "account",
    access_token: accessToken,
  });

  const insightsRes = await fetch(
    `https://graph.facebook.com/v19.0/act_${adAccountId}/insights?${insightsParams}`,
    { next: { revalidate: 0 } }
  );
  const insightsData = await insightsRes.json();
  if (insightsData.error) throw new Error(`Meta API (insights): ${insightsData.error.message}`);

  const row = insightsData.data?.[0];

  // ── 2. Budget (campaigns) ────────────────────────────────────────────────────
  const budgetParams = new URLSearchParams({
    fields: "daily_budget,lifetime_budget",
    effective_status: JSON.stringify(["ACTIVE", "PAUSED"]),
    access_token: accessToken,
  });
  const budgetRes = await fetch(
    `https://graph.facebook.com/v19.0/act_${adAccountId}/campaigns?${budgetParams}`,
    { next: { revalidate: 0 } }
  );
  const budgetData = await budgetRes.json();
  const campaigns: Array<{ daily_budget?: string; lifetime_budget?: string }> =
    budgetData.data ?? [];
  const totalBudget = campaigns.reduce((sum, c) => {
    const val = c.daily_budget ?? c.lifetime_budget ?? "0";
    return sum + parseInt(val) / 100; // Meta returns cents
  }, 0);

  if (!row) {
    return {
      spend: 0, impressions: 0, clicks: 0, leadsFromAds: 0,
      reach: 0, cpm: 0, linkClicks: 0, cpc: 0, ctr: 0,
      costPerResult: 0, budget: totalBudget,
    };
  }

  const leadAction = (row.actions as Array<{ action_type: string; value: string }> | undefined)
    ?.find((a) => a.action_type === "lead" || a.action_type === "onsite_conversion.lead_grouped");

  const costPerLead = (row.cost_per_action_type as Array<{ action_type: string; value: string }> | undefined)
    ?.find((a) => a.action_type === "lead" || a.action_type === "onsite_conversion.lead_grouped");

  return {
    spend: parseFloat(row.spend ?? "0"),
    impressions: parseInt(row.impressions ?? "0"),
    clicks: parseInt(row.clicks ?? "0"),
    leadsFromAds: parseInt(leadAction?.value ?? "0"),
    reach: parseInt(row.reach ?? "0"),
    cpm: parseFloat(row.cpm ?? "0"),
    linkClicks: parseInt(row.inline_link_clicks ?? "0"),
    cpc: parseFloat(row.cost_per_inline_link_click ?? "0"),
    ctr: parseFloat(row.inline_link_click_ctr ?? "0"),
    costPerResult: parseFloat(costPerLead?.value ?? "0"),
    budget: totalBudget,
  };
}
