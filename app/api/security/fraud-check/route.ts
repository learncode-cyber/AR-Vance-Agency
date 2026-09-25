import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({
      riskScore: 25,
      fraudProbability: 0.25,
      riskLevel: "low",
      requiresReview: false,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
