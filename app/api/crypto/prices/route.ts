import { NextResponse } from "next/server";

export async function GET(req: Request) {
  return NextResponse.json({
    prices: {
      BTC: 45000,
      ETH: 2500,
      USDC: 1.0,
      USDT: 1.0,
      DAI: 1.0,
    },
    timestamp: new Date().toISOString(),
  });
}
