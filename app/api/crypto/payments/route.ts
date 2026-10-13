import { NextResponse } from "next/server";
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function POST(req: Request) {
  if (!(await getAdminSession())) return unauthorized()
  try {
    const { orderId, amount, currency } = await req.json();
    return NextResponse.json({
      paymentId: "p-" + Date.now(),
      orderId,
      amount,
      currency,
      status: "pending",
      walletAddress: "0x" + Math.random().toString(16).substring(2, 42),
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  if (!(await getAdminSession())) return unauthorized()
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");

  return NextResponse.json({
    orderId,
    payments: [],
  });
}
