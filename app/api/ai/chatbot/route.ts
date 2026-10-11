import { NextResponse } from "next/server";
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function POST(req: Request) {
  if (!(await getAdminSession())) return unauthorized()
  try {
    const body = await req.json();
    return NextResponse.json({
      response: "Hello! How can I help?",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
