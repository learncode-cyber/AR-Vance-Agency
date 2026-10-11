import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      facets: {
        categories: [],
        tags: [],
        authors: [],
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to get facets" }, { status: 500 });
  }
}
