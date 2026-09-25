import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { billTo, items, currency, language } = await req.json();
    return NextResponse.json({
      invoiceId: "inv-" + Date.now(),
      invoiceNumber: "INV-" + Math.random().toString().slice(2, 8),
      status: "draft",
      total: 0,
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
