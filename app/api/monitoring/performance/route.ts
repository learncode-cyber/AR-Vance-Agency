import { NextResponse } from "next/server";
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function GET() {
  if (!(await getAdminSession())) return unauthorized()
  return NextResponse.json({
    slowCalls: [
      { method: "GET", path: "/admin/analytics", duration: 3250 },
      { method: "POST", path: "/api/email/send", duration: 2890 },
    ],
    percentiles: { p50: 245, p95: 890, p99: 2340 },
    avgResponseTime: 245,
  });
}
