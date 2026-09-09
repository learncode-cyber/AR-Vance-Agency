import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({
      riskScore: 30,
      anomalyScore: 0.3,
      severity: "low",
      isAnomaly: false,
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
