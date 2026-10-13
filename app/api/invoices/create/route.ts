import { NextResponse } from "next/server";
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function POST(req: Request) {
  if (!(await getAdminSession())) return unauthorized()
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
