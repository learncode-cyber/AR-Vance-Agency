import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    jobs: [
      { id: "1", name: "Email Campaign", schedule: "0 9 * * *", status: "active" },
      { id: "2", name: "Daily Report", schedule: "0 17 * * *", status: "active" },
    ],
  });
}

export async function POST(req: Request) {
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
