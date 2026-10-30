import { NextResponse } from "next/server";
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function GET(req: Request) {
  return NextResponse.json({ branding: {} });
}

export async function PUT(req: Request) {
  if (!(await getAdminSession())) return unauthorized()
  try {
    const body = await req.json();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
