import { NextResponse } from "next/server";
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function GET(req: Request) {
  if (!(await getAdminSession())) return unauthorized()
  const { searchParams } = new URL(req.url);
  const metric = searchParams.get("metric") || "revenue";
  return NextResponse.json({ metric, data: [] });
}
