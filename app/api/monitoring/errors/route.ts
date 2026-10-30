import { NextResponse } from "next/server";
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function GET(req: Request) {
  if (!(await getAdminSession())) return unauthorized()
  const { searchParams } = new URL(req.url);
  const days = searchParams.get("days") || "7";

  return NextResponse.json({
    total: 15,
    days: parseInt(days),
    errors: [
      { id: 1, message: "TypeError", count: 5, lastOccurred: new Date() },
      { id: 2, message: "NetworkError", count: 3, lastOccurred: new Date() },
    ],
  });
}
