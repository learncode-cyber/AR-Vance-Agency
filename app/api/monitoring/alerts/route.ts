import { NextResponse } from "next/server";

export async function GET() {
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
  const { alertId, resolved } = await req.json();
  return NextResponse.json({ id: alertId, resolved, updated: true });
}
