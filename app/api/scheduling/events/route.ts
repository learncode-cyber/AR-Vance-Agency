import { NextResponse } from "next/server";
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function GET() {
  if (!(await getAdminSession())) return unauthorized()
  return NextResponse.json({
    events: [
      { id: "1", title: "Team Meeting", startTime: new Date(), status: "scheduled" },
      { id: "2", title: "Client Call", startTime: new Date(), status: "scheduled" },
    ],
  });
}

export async function POST(req: Request) {
  if (!(await getAdminSession())) return unauthorized()
  try {
    const { title, startTime } = await req.json();
    return NextResponse.json({
      eventId: "event-" + Date.now(),
      title,
      startTime,
      status: "scheduled",
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
