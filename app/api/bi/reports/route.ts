import { NextResponse } from "next/server";
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function POST(req: Request) {
  if (!(await getAdminSession())) return unauthorized()
  try {
    const { type, format } = await req.json();
    return NextResponse.json({ reportId: "rep-" + Date.now(), type, format });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function GET() {
  if (!(await getAdminSession())) return unauthorized()
  return NextResponse.json({ reports: [] });
}
