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
  conversations: number;
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
      "campaign_name",
      "campaign_id",
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
    const actions = row.actions as Array<{ action_type: string; value: string }> | undefined;
    const costPerAction = row.cost_per_action_type as Array<{ action_type: string; value: string }> | undefined;

    const leadAction    = actions?.find((a) => a.action_type === "lead" || a.action_type === "onsite_conversion.lead_grouped");
    const costPerLead   = costPerAction?.find((a) => a.action_type === "lead" || a.action_type === "onsite_conversion.lead_grouped");

    // Conversas iniciadas via WhatsApp
    const conversationAction = actions?.find((a) =>
      a.action_type === "onsite_conversion.messaging_conversation_started_7d" ||
      a.action_type === "onsite_conversion.total_messaging_connection" ||
      a.action_type === "onsite_conversion.messaging_first_reply"
    );

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
      conversations: parseInt(conversationAction?.value ?? "0"),
    };
  });
}

// ─── Dados por campanha ───────────────────────────────────────────────────────

export interface MetaCampaignInsight {
  campaignId: string;
  campaignName: string;
  spend: number;
  impressions: number;
  leadsFromAds: number;
  conversations: number;
  costPerResult: number;
  costPerConversation: number;
}

export async function fetchMetaCampaignInsights(
  adAccountId: string,
  accessToken: string,
  dateFrom: string,
  dateTo: string
): Promise<MetaCampaignInsight[]> {
  const params = new URLSearchParams({
    fields: [
      "campaign_name",
      "campaign_id",
      "spend",
      "impressions",
      "cost_per_action_type",
      "actions",
    ].join(","),
    time_range: JSON.stringify({ since: dateFrom, until: dateTo }),
    level: "campaign",
    access_token: accessToken,
  });

  const res = await fetch(
    `https://graph.facebook.com/v19.0/act_${adAccountId}/insights?${params}`,
    { next: { revalidate: 0 } }
  );
  const data = await res.json();
  if (data.error) throw new Error(`Meta API (campaigns): ${data.error.message}`);

  const rows: Array<Record<string, unknown>> = data.data ?? [];

  return rows.map((row) => {
    const actions      = row.actions as Array<{ action_type: string; value: string }> | undefined;
    const costPerAction = row.cost_per_action_type as Array<{ action_type: string; value: string }> | undefined;

    const leadAction         = actions?.find((a) => a.action_type === "lead" || a.action_type === "onsite_conversion.lead_grouped");
    const conversationAction = actions?.find((a) =>
      a.action_type === "onsite_conversion.messaging_conversation_started_7d" ||
      a.action_type === "onsite_conversion.total_messaging_connection" ||
      a.action_type === "onsite_conversion.messaging_first_reply"
    );
    const costPerLead        = costPerAction?.find((a) => a.action_type === "lead" || a.action_type === "onsite_conversion.lead_grouped");

    const spend         = parseFloat((row.spend as string) ?? "0");
    const leadsFromAds  = parseInt(leadAction?.value ?? "0");
    const conversations = parseInt(conversationAction?.value ?? "0");
    const costPerResult = parseFloat(costPerLead?.value ?? "0");
    const costPerConversation = conversations > 0 ? spend / conversations : 0;

    return {
      campaignId:          (row.campaign_id as string) ?? "",
      campaignName:        (row.campaign_name as string) ?? "Campanha sem nome",
      spend,
      impressions:         parseInt((row.impressions as string) ?? "0"),
      leadsFromAds,
      conversations,
      costPerResult,
      costPerConversation,
    };
  }).filter((r) => r.campaignId !== "");
}
