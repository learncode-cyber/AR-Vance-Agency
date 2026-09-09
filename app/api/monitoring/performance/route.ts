import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    slowCalls: [
      { method: "GET", path: "/admin/analytics", duration: 3250 },
      { method: "POST", path: "/api/email/send", duration: 2890 },
    ],
    percentiles: { p50: 245, p95: 890, p99: 2340 },
    avgResponseTime: 245,
  });
}
