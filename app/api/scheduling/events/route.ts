import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    events: [
      { id: "1", title: "Team Meeting", startTime: new Date(), status: "scheduled" },
      { id: "2", title: "Client Call", startTime: new Date(), status: "scheduled" },
    ],
  });
}

export async function POST(req: Request) {
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
