import { NextResponse } from "next/server";
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function POST(req: Request) {
  if (!(await getAdminSession())) return unauthorized()
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
