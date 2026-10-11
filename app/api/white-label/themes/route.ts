import { NextResponse } from "next/server";
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function GET() {
  if (!(await getAdminSession())) return unauthorized()
  return NextResponse.json({ themes: [] });
}

export async function POST(req: Request) {
  if (!(await getAdminSession())) return unauthorized()
  try {
    const body = await req.json();
    return NextResponse.json({ themeId: "t-" + Date.now() });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
