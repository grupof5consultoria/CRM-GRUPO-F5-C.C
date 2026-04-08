export interface AdInsights {
  spend: number;
  impressions: number;
  clicks: number;
  leadsFromAds: number;
}

export async function fetchMetaInsights(
  adAccountId: string,
  accessToken: string,
  period: string // "2024-01"
): Promise<AdInsights | null> {
  const [year, month] = period.split("-").map(Number);
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;

  const params = new URLSearchParams({
    fields: "spend,impressions,clicks,actions",
    time_range: JSON.stringify({ since: startDate, until: endDate }),
    level: "account",
    access_token: accessToken,
  });

  const res = await fetch(
    `https://graph.facebook.com/v19.0/act_${adAccountId}/insights?${params}`,
    { next: { revalidate: 0 } }
  );

  const data = await res.json();
  if (data.error) throw new Error(`Meta API: ${data.error.message}`);

  const row = data.data?.[0];
  if (!row) return { spend: 0, impressions: 0, clicks: 0, leadsFromAds: 0 };

  const leadAction = row.actions?.find(
    (a: { action_type: string; value: string }) =>
      a.action_type === "lead" || a.action_type === "onsite_conversion.lead_grouped"
  );

  return {
    spend: parseFloat(row.spend ?? "0"),
    impressions: parseInt(row.impressions ?? "0"),
    clicks: parseInt(row.clicks ?? "0"),
    leadsFromAds: parseInt(leadAction?.value ?? "0"),
  };
}
