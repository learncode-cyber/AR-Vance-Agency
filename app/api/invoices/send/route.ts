import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { invoiceId, email } = await req.json();
    return NextResponse.json({
      invoiceId,
      email,
      status: "sent",
      message: "Invoice sent successfully",
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
