import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { type, format } = await req.json();
    return NextResponse.json({ reportId: "rep-" + Date.now(), type, format });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ reports: [] });
}
