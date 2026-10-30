import { NextResponse } from "next/server";
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function GET() {
  if (!(await getAdminSession())) return unauthorized()
  return NextResponse.json({
    active: 3,
    resolved: 12,
    alerts: [
      { id: 1, type: "error_rate", severity: "high", message: "High error rate", resolved: false },
      { id: 2, type: "performance", severity: "medium", message: "Slow API response", resolved: false },
    ],
  });
}

export async function PATCH(req: Request) {
  if (!(await getAdminSession())) return unauthorized()
  const { alertId, resolved } = await req.json();
  return NextResponse.json({ id: alertId, resolved, updated: true });
}
