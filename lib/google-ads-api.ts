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

// Auto-detects the latest supported Google Ads API version
let _cachedVersion: string | null = null;
async function getLatestApiVersion(): Promise<string> {
  if (_cachedVersion) return _cachedVersion;
  // Try from newest to oldest
  const candidates = ["v24", "v23", "v22", "v21", "v20"];
  for (const v of candidates) {
    const res = await fetch(`https://googleads.googleapis.com/${v}/customers:listAccessibleCustomers`, {
      method: "GET",
      headers: { "Authorization": "Bearer test" },
    });
    // 401 = version exists (unauthorized), 404 = version doesn't exist
    if (res.status === 401) {
      _cachedVersion = v;
      return v;
    }
  }
  _cachedVersion = "v20"; // safe fallback
  return "v20";
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
  const [accessToken, apiVersion] = await Promise.all([
    getGoogleAccessToken(refreshToken),
    getLatestApiVersion(),
  ]);
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
  // Only send login-customer-id when manager is different from the customer being accessed
  if (managerId && managerId !== cleanId) headers["login-customer-id"] = managerId;

  const res = await fetch(
    `https://googleads.googleapis.com/${apiVersion}/customers/${cleanId}/googleAds:search`,
    { method: "POST", headers, body: JSON.stringify({ query }), next: { revalidate: 0 } }
  );

  const text = await res.text();
  if (!res.ok) {
    // Try to parse JSON error, fallback to raw text
    let msg = text;
    try { const d = JSON.parse(text); msg = d.error?.message ?? d[0]?.error?.message ?? JSON.stringify(d); } catch {}
    throw new Error(`Google Ads API (${res.status}): ${msg.substring(0, 300)}`);
  }
  const data = JSON.parse(text);

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
