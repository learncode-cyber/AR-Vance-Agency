import { NextResponse } from "next/server";
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function GET(req: Request) {
  if (!(await getAdminSession())) return unauthorized()
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
