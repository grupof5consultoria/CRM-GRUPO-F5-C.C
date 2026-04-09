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
  objective: string;
  status: string;
  startDate: string;
  dailyBudget: number;
  spend: number;
  impressions: number;
  clicks: number;
  cpc: number;
  ctr: number;
  ctrLink: number;
  cpm: number;
  leadsFromAds: number;
  conversations: number;
  newFollowers: number;
  costPerResult: number;
  costPerConversation: number;
  costPerFollower: number;
  /** All non-zero actions returned by the API — used to surface metrics for any campaign type */
  rawActions: Array<{ action_type: string; value: number; costPer: number | null }>;
}

export async function fetchMetaCampaignInsights(
  adAccountId: string,
  accessToken: string,
  dateFrom: string,
  dateTo: string
): Promise<MetaCampaignInsight[]> {
  const insightsParams = new URLSearchParams({
    fields: [
      "campaign_name", "campaign_id",
      "spend", "impressions",
      "inline_link_clicks", "cpm", "ctr",
      "inline_link_click_ctr", "cost_per_inline_link_click",
      "cost_per_action_type", "actions",
    ].join(","),
    time_range: JSON.stringify({ since: dateFrom, until: dateTo }),
    level: "campaign",
    access_token: accessToken,
  });

  const metaParams = new URLSearchParams({
    fields: "id,name,objective,status,start_time,daily_budget,lifetime_budget",
    limit: "500",
    access_token: accessToken,
  });

  const [insightsRes, metaRes] = await Promise.all([
    fetch(`https://graph.facebook.com/v19.0/act_${adAccountId}/insights?${insightsParams}`, { next: { revalidate: 0 } }),
    fetch(`https://graph.facebook.com/v19.0/act_${adAccountId}/campaigns?${metaParams}`, { next: { revalidate: 0 } }),
  ]);

  const data = await insightsRes.json();
  const metaData = await metaRes.json();

  if (data.error) throw new Error(`Meta API (campaigns): ${data.error.message}`);

  // Build metadata lookup map
  type CampaignMeta = { objective: string; status: string; startDate: string; dailyBudget: number };
  const metaMap = new Map<string, CampaignMeta>();
  for (const c of (metaData.data ?? [])) {
    metaMap.set(c.id as string, {
      objective:   (c.objective as string) ?? "",
      status:      (c.status    as string) ?? "",
      startDate:   c.start_time ? (c.start_time as string).substring(0, 10) : "",
      dailyBudget: c.daily_budget
        ? parseInt(c.daily_budget as string) / 100
        : c.lifetime_budget ? parseInt(c.lifetime_budget as string) / 100 : 0,
    });
  }

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
    // "Ganho de seguidores" may report under different action types depending on placement
    const followAction       = actions?.find((a) =>
      a.action_type === "follow" ||
      a.action_type === "like" ||
      a.action_type === "page_fan" ||
      a.action_type === "onsite_conversion.post_reactions"
    );
    const costPerLead        = costPerAction?.find((a) => a.action_type === "lead" || a.action_type === "onsite_conversion.lead_grouped");
    const costPerFollowAction = costPerAction?.find((a) =>
      a.action_type === "follow" ||
      a.action_type === "like" ||
      a.action_type === "page_fan"
    );

    const spend         = parseFloat((row.spend as string) ?? "0");
    const leadsFromAds  = parseInt(leadAction?.value ?? "0");
    const conversations = parseInt(conversationAction?.value ?? "0");
    const newFollowers  = parseInt(followAction?.value ?? "0");
    const costPerResult = parseFloat(costPerLead?.value ?? "0");
    const costPerConversation = conversations > 0 ? spend / conversations : 0;
    const costPerFollower = costPerFollowAction
      ? parseFloat(costPerFollowAction.value)
      : newFollowers > 0 ? spend / newFollowers : 0;

    // Build raw actions list (all non-zero) for surfacing any campaign type result
    const rawActions = (actions ?? [])
      .map(a => {
        const v = parseInt(a.value ?? "0");
        const cpa = costPerAction?.find(c => c.action_type === a.action_type);
        return {
          action_type: a.action_type,
          value: v,
          costPer: cpa ? parseFloat(cpa.value) : (v > 0 ? spend / v : null),
        };
      })
      .filter(a => a.value > 0)
      .sort((a, b) => b.value - a.value);

    const campaignId = (row.campaign_id as string) ?? "";
    const meta = metaMap.get(campaignId) ?? { objective: "", status: "", startDate: "", dailyBudget: 0 };

    return {
      campaignId,
      campaignName:        (row.campaign_name as string) ?? "Campanha sem nome",
      objective:           meta.objective,
      status:              meta.status,
      startDate:           meta.startDate,
      dailyBudget:         meta.dailyBudget,
      spend,
      impressions:         parseInt((row.impressions as string) ?? "0"),
      clicks:              parseInt((row.inline_link_clicks as string) ?? "0"),
      cpc:                 parseFloat((row.cost_per_inline_link_click as string) ?? "0"),
      ctr:                 parseFloat((row.ctr as string) ?? "0"),
      ctrLink:             parseFloat((row.inline_link_click_ctr as string) ?? "0"),
      cpm:                 parseFloat((row.cpm as string) ?? "0"),
      leadsFromAds,
      conversations,
      newFollowers,
      costPerResult,
      costPerConversation,
      costPerFollower,
      rawActions,
    };
  }).filter((r) => r.campaignId !== "");
}

// ─── Dados por anúncio (ad-level) ────────────────────────────────────────────

export interface MetaAdInsight {
  adId: string;
  adName: string;
  adsetId: string;
  adsetName: string;
  campaignId: string;
  spend: number;
  impressions: number;
  conversations: number;
  leadsFromAds: number;
  newFollowers: number;
  costPerConversation: number;
  rawActions: Array<{ action_type: string; value: number; costPer: number | null }>;
}

export async function fetchMetaAdInsights(
  adAccountId: string,
  accessToken: string,
  dateFrom: string,
  dateTo: string,
  campaignId?: string
): Promise<MetaAdInsight[]> {
  const params = new URLSearchParams({
    fields: [
      "ad_id",
      "ad_name",
      "adset_id",
      "adset_name",
      "campaign_id",
      "spend",
      "impressions",
      "actions",
      "cost_per_action_type",
    ].join(","),
    time_range: JSON.stringify({ since: dateFrom, until: dateTo }),
    level: "ad",
    access_token: accessToken,
  });
  if (campaignId) {
    params.set("filtering", JSON.stringify([{ field: "campaign.id", operator: "IN", value: [campaignId] }]));
  }

  const res = await fetch(
    `https://graph.facebook.com/v19.0/act_${adAccountId}/insights?${params}`,
    { next: { revalidate: 0 } }
  );
  const data = await res.json();
  if (data.error) throw new Error(`Meta API (ads): ${data.error.message}`);

  const rows: Array<Record<string, unknown>> = data.data ?? [];

  return rows.map(row => {
    const actions = row.actions as Array<{ action_type: string; value: string }> | undefined;
    const costPerAction = row.cost_per_action_type as Array<{ action_type: string; value: string }> | undefined;

    const conversationAction = actions?.find(a =>
      a.action_type === "onsite_conversion.messaging_conversation_started_7d" ||
      a.action_type === "onsite_conversion.total_messaging_connection" ||
      a.action_type === "onsite_conversion.messaging_first_reply"
    );
    const leadAction = actions?.find(a =>
      a.action_type === "lead" || a.action_type === "onsite_conversion.lead_grouped"
    );
    const followAction = actions?.find(a =>
      a.action_type === "follow" || a.action_type === "like" || a.action_type === "page_fan"
    );

    const spend = parseFloat((row.spend as string) ?? "0");
    const conversations = parseInt(conversationAction?.value ?? "0");

    const rawActions = (actions ?? [])
      .map(a => {
        const v = parseInt(a.value ?? "0");
        const cpa = costPerAction?.find(c => c.action_type === a.action_type);
        return {
          action_type: a.action_type,
          value: v,
          costPer: cpa ? parseFloat(cpa.value) : (v > 0 ? spend / v : null),
        };
      })
      .filter(a => a.value > 0)
      .sort((a, b) => b.value - a.value);

    return {
      adId:               (row.ad_id as string) ?? "",
      adName:             (row.ad_name as string) ?? "Anúncio sem nome",
      adsetId:            (row.adset_id as string) ?? "",
      adsetName:          (row.adset_name as string) ?? "Conjunto sem nome",
      campaignId:         (row.campaign_id as string) ?? "",
      spend,
      impressions:        parseInt((row.impressions as string) ?? "0"),
      conversations,
      leadsFromAds:       parseInt(leadAction?.value ?? "0"),
      newFollowers:       parseInt(followAction?.value ?? "0"),
      costPerConversation: conversations > 0 ? spend / conversations : 0,
      rawActions,
    };
  }).filter(r => r.adId !== "");
}
