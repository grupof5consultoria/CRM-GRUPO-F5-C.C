import { NextResponse } from "next/server";
import { requireInternalAuth } from "@/lib/auth";

const WABA_ID      = process.env.META_WABA_ID!;
const SYSTEM_TOKEN = process.env.META_SYSTEM_TOKEN!;

// GET /api/admin/whatsapp/list-numbers
// Lists all phone numbers registered in the WABA
export async function GET() {
  await requireInternalAuth();

  const params = new URLSearchParams({
    fields: "id,display_phone_number,verified_name,code_verification_status,quality_rating",
    access_token: SYSTEM_TOKEN,
    limit: "50",
  });

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${WABA_ID}/phone_numbers?${params}`,
    { next: { revalidate: 0 } }
  );
  const data = await res.json();

  if (data.error) {
    return NextResponse.json({ error: `Meta API: ${data.error.message}` }, { status: 400 });
  }

  const numbers = (data.data ?? []).map((n: Record<string, string>) => ({
    phoneNumberId:       n.id,
    phoneNumber:         n.display_phone_number,
    displayName:         n.verified_name,
    verificationStatus:  n.code_verification_status, // VERIFIED | NOT_VERIFIED
    qualityRating:       n.quality_rating,
  }));

  return NextResponse.json({ numbers });
}
