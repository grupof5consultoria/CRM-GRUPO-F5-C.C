import type { AdInsights } from "./meta-api";

async function getGoogleAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
    next: { revalidate: 0 },
  });

  const data = await res.json();
  if (!data.access_token) {
    throw new Error(`Google OAuth: ${data.error_description ?? "Failed to get access token"}`);
  }
  return data.access_token;
}

export async function fetchGoogleAdsInsights(
  customerId: string,
  refreshToken: string,
  period: string // "2024-01"
): Promise<AdInsights | null> {
  const [year, month] = period.split("-").map(Number);
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;

  const accessToken = await getGoogleAccessToken(refreshToken);
  const cleanId = customerId.replace(/-/g, "");
  const managerId = process.env.GOOGLE_ADS_MANAGER_ID?.replace(/-/g, "");

  const query = `
    SELECT
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions
    FROM customer
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
  `;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "developer-token": process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? "",
    "Content-Type": "application/json",
  };
  if (managerId) headers["login-customer-id"] = managerId;

  const res = await fetch(
    `https://googleads.googleapis.com/v17/customers/${cleanId}/googleAds:search`,
    { method: "POST", headers, body: JSON.stringify({ query }), next: { revalidate: 0 } }
  );

  const data = await res.json();
  if (!res.ok) {
    const msg = data.error?.message ?? JSON.stringify(data);
    throw new Error(`Google Ads API: ${msg}`);
  }

  const results: Array<{ metrics?: { costMicros?: number; impressions?: number; clicks?: number; conversions?: number } }> =
    data.results ?? [];

  const totals = results.reduce(
    (acc, row) => ({
      costMicros: acc.costMicros + Number(row.metrics?.costMicros ?? 0),
      impressions: acc.impressions + Number(row.metrics?.impressions ?? 0),
      clicks: acc.clicks + Number(row.metrics?.clicks ?? 0),
      conversions: acc.conversions + Number(row.metrics?.conversions ?? 0),
    }),
    { costMicros: 0, impressions: 0, clicks: 0, conversions: 0 }
  );

  return {
    spend: totals.costMicros / 1_000_000,
    impressions: totals.impressions,
    clicks: totals.clicks,
    leadsFromAds: Math.round(totals.conversions),
  };
}
