import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    stats: {
      inMemory: { keys: 42, hits: 1250, misses: 145 },
      redis: "connected"
    },
    timestamp: new Date().toISOString(),
  });
}
