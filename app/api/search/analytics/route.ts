import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const metric = searchParams.get("metric") || "popular";
    const days = parseInt(searchParams.get("days") || "7");

    return NextResponse.json({
      metric,
      days,
      data: [],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to get analytics" }, { status: 500 });
  }
}
