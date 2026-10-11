import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();
    return NextResponse.json({
      affiliateId: "aff-" + Date.now(),
      email,
      name,
      status: "pending",
      message: "Verification email sent",
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
