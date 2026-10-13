import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function POST(req: NextRequest) {
  if (!(await getAdminSession())) return unauthorized()
  try {
    const { type, id } = await req.json();

    return NextResponse.json({
      success: true,
      type,
      id,
      message: `Cache invalidated for ${type}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to invalidate cache" },
      { status: 500 }
    );
  }
}
