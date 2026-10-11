import { NextResponse } from "next/server";
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function GET() {
  if (!(await getAdminSession())) return unauthorized()
  return NextResponse.json({ tenants: [] });
}

export async function POST(req: Request) {
  if (!(await getAdminSession())) return unauthorized()
  try {
    const { name, slug } = await req.json();
    return NextResponse.json({ tenantId: "t-" + Date.now(), name, slug });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
