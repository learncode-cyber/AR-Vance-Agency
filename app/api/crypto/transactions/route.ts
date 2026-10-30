import { NextResponse } from "next/server";
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function GET(req: Request) {
  if (!(await getAdminSession())) return unauthorized()
  const { searchParams } = new URL(req.url);
  const walletId = searchParams.get("walletId");

  return NextResponse.json({
    walletId,
    transactions: [],
    count: 0,
  });
}
