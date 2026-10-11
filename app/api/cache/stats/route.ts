import { NextResponse } from "next/server";
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function GET() {
  if (!(await getAdminSession())) return unauthorized()
  return NextResponse.json({
    stats: {
      inMemory: { keys: 42, hits: 1250, misses: 145 },
      redis: "connected"
    },
    timestamp: new Date().toISOString(),
  });
}
