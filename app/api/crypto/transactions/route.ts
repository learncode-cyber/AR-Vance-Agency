import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const walletId = searchParams.get("walletId");

  return NextResponse.json({
    walletId,
    transactions: [],
    count: 0,
  });
}
