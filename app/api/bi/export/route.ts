import { NextResponse } from "next/server";
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function POST(req: Request) {
  if (!(await getAdminSession())) return unauthorized()
  try {
    const { type, format } = await req.json();
    return NextResponse.json({
      exportId: "exp-" + Date.now(),
      format,
      downloadUrl: "/exports/file." + format,
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
