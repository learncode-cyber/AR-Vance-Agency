import { NextResponse } from "next/server";

export async function GET(req: Request) {
  return NextResponse.json({ branding: {} });
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
