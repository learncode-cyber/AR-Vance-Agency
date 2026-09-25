import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const affiliateId = searchParams.get("affiliateId");

  return NextResponse.json({
    affiliateId,
    metrics: {
      totalEarnings: 5000,
      pendingEarnings: 1200,
      totalReferrals: 45,
      conversionRate: 8.5,
    },
  });
}
