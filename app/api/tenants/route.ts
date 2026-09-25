import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ tenants: [] });
}

export async function POST(req: Request) {
  try {
    const { name, slug } = await req.json();
    return NextResponse.json({ tenantId: "t-" + Date.now(), name, slug });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
