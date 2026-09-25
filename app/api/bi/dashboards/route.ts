import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    dashboards: [],
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    return NextResponse.json({ id: "dash-" + Date.now(), name, created: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
