import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    errors_30min: 0,
    errors_24h: 5,
    active_users: 42,
    api_calls_24h: 1250,
    uptime_percentage: 99.98,
    avg_response_time: 245,
  });
}
