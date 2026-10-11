import { NextResponse } from "next/server";
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function GET() {
  if (!(await getAdminSession())) return unauthorized()
  return NextResponse.json({
    dashboards: [],
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: Request) {
  if (!(await getAdminSession())) return unauthorized()
  try {
    const { name } = await req.json();
    return NextResponse.json({ id: "dash-" + Date.now(), name, created: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
