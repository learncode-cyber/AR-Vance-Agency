import { NextResponse } from "next/server";
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function GET() {
  if (!(await getAdminSession())) return unauthorized()
  return NextResponse.json({
    errors_30min: 0,
    errors_24h: 5,
    active_users: 42,
    api_calls_24h: 1250,
    uptime_percentage: 99.98,
    avg_response_time: 245,
  });
}
