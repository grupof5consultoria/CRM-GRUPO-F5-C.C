export interface GoogleInsights {
  spend: number;
  impressions: number;
  clicks: number;
  leadsFromAds: number; // conversions
  cpc: number;          // average CPC
  costPerResult: number; // cost per conversion
}

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
): Promise<GoogleInsights | null> {
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
      metrics.conversions,
      metrics.average_cpc,
      metrics.cost_per_conversion
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

  type Row = {
    metrics?: {
      costMicros?: number;
      impressions?: number;
      clicks?: number;
      conversions?: number;
      averageCpc?: number;
      costPerConversion?: number;
    };
  };

  const results: Row[] = data.results ?? [];

  if (results.length === 0) {
    return {
      spend: 0, impressions: 0, clicks: 0, leadsFromAds: 0, cpc: 0, costPerResult: 0,
    };
  }

  const totals = results.reduce(
    (acc, row) => ({
      costMicros: acc.costMicros + Number(row.metrics?.costMicros ?? 0),
      impressions: acc.impressions + Number(row.metrics?.impressions ?? 0),
      clicks: acc.clicks + Number(row.metrics?.clicks ?? 0),
      conversions: acc.conversions + Number(row.metrics?.conversions ?? 0),
    }),
    { costMicros: 0, impressions: 0, clicks: 0, conversions: 0 }
  );

  // average_cpc and cost_per_conversion are already per-row averages in micros
  // Use the last non-zero row value, or calculate from totals as fallback
  const lastRow = results[results.length - 1];
  const cpcMicros = Number(lastRow?.metrics?.averageCpc ?? 0);
  const cpcCalc = totals.clicks > 0 ? totals.costMicros / totals.clicks : 0;
  const cpc = (cpcMicros > 0 ? cpcMicros : cpcCalc) / 1_000_000;

  const costPerConvCalc =
    totals.conversions > 0 ? totals.costMicros / totals.conversions / 1_000_000 : 0;

  return {
    spend: totals.costMicros / 1_000_000,
    impressions: totals.impressions,
    clicks: totals.clicks,
    leadsFromAds: Math.round(totals.conversions),
    cpc,
    costPerResult: costPerConvCalc,
  };
}
