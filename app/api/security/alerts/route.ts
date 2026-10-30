import { NextResponse } from "next/server";
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function GET(req: Request) {
  if (!(await getAdminSession())) return unauthorized()
  return NextResponse.json({ alerts: [], count: 0 });
}

export async function POST(req: Request) {
  if (!(await getAdminSession())) return unauthorized()
  try {
    const body = await req.json();
    return NextResponse.json({ alertId: "alert-" + Date.now(), sent: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
