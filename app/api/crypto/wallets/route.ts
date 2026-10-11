import { NextResponse } from "next/server";
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function GET(req: Request) {
  if (!(await getAdminSession())) return unauthorized()
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  return NextResponse.json({
    userId,
    wallets: [],
    totalBalance: 0,
  });
}

export async function POST(req: Request) {
  if (!(await getAdminSession())) return unauthorized()
  try {
    const { userId, walletType } = await req.json();
    return NextResponse.json({
      walletId: "w-" + Date.now(),
      walletType,
      address: "0x" + Math.random().toString(16).substring(2, 42),
      balance: 0,
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
