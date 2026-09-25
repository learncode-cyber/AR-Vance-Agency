import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const metric = searchParams.get("metric") || "revenue";
  return NextResponse.json({ metric, data: [] });
}
