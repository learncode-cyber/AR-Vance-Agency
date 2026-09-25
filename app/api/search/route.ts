import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, index = "posts", page = 1, limit = 20 } = body;

    return NextResponse.json({
      total: 0,
      results: [],
      facets: {},
      took: 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
