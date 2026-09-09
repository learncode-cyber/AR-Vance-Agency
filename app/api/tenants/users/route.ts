import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ users: [], count: 0 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({ userId: "u-" + Date.now() });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
