import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function DELETE(req: NextRequest) {
  if (!(await getAdminSession())) return unauthorized()
  try {
    return NextResponse.json({
      success: true,
      message: "All caches cleared",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to clear cache" },
      { status: 500 }
    );
  }
}
