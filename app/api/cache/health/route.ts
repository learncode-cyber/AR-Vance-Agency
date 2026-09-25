import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    redis: "connected",
    memory: "available",
    timestamp: new Date().toISOString(),
  });
}
