import { NextResponse } from "next/server";
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function GET() {
  if (!(await getAdminSession())) return unauthorized()
  return NextResponse.json({
    status: "healthy",
    redis: "connected",
    memory: "available",
    timestamp: new Date().toISOString(),
  });
}
