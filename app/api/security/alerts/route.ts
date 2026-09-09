import { NextResponse } from "next/server";

export async function GET(req: Request) {
  return NextResponse.json({ alerts: [], count: 0 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({ alertId: "alert-" + Date.now(), sent: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
