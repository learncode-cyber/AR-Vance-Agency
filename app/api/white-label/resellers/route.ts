import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ resellers: [] });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({ resellerId: "r-" + Date.now() });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
