export interface GoogleInsights {
  spend: number;
  impressions: number;
  clicks: number;
  leadsFromAds: number; // conversions
  cpc: number;          // average CPC
  costPerResult: number; // cost per conversion
}

export interface GoogleDailyInsight extends GoogleInsights {
  date: string; // "YYYY-MM-DD"
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
  dateFrom: string, // "2024-01-01"
  dateTo: string    // "2024-01-31"
): Promise<GoogleDailyInsight[]> {
  const accessToken = await getGoogleAccessToken(refreshToken);
  const cleanId = customerId.replace(/-/g, "");
  const managerId = process.env.GOOGLE_ADS_MANAGER_ID?.replace(/-/g, "");

  // segments.date causes daily grouping automatically
  const query = `
    SELECT
      segments.date,
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.average_cpc,
      metrics.cost_per_conversion
    FROM customer
    WHERE segments.date BETWEEN '${dateFrom}' AND '${dateTo}'
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
    segments?: { date?: string };
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

  return results.map((row) => {
    const costMicros = Number(row.metrics?.costMicros ?? 0);
    const clicks = Number(row.metrics?.clicks ?? 0);
    const conversions = Number(row.metrics?.conversions ?? 0);
    const cpcMicros = Number(row.metrics?.averageCpc ?? 0);
    const cpc = (cpcMicros > 0 ? cpcMicros : clicks > 0 ? costMicros / clicks : 0) / 1_000_000;
    const costPerResult = conversions > 0 ? (costMicros / conversions) / 1_000_000 : 0;

    return {
      date: row.segments?.date ?? "",
      spend: costMicros / 1_000_000,
      impressions: Number(row.metrics?.impressions ?? 0),
      clicks,
      leadsFromAds: Math.round(conversions),
      cpc,
      costPerResult,
    };
  }).filter((r) => r.date !== "");
}
