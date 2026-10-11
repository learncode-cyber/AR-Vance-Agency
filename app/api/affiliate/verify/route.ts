import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    return NextResponse.json({
      verified: true,
      message: "Email verified successfully",
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
