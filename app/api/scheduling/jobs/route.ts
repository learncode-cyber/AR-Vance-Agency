import { NextResponse } from "next/server";
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function GET() {
  if (!(await getAdminSession())) return unauthorized()
  return NextResponse.json({
    jobs: [
      { id: "1", name: "Email Campaign", schedule: "0 9 * * *", status: "active" },
      { id: "2", name: "Daily Report", schedule: "0 17 * * *", status: "active" },
    ],
  });
}

export async function POST(req: Request) {
  if (!(await getAdminSession())) return unauthorized()
  try {
    const { name, schedule } = await req.json();
    return NextResponse.json({
      jobId: "job-" + Date.now(),
      name,
      schedule,
      status: "active",
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
