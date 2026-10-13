import { NextResponse } from "next/server";
import { getAdminSession, unauthorized } from "@/lib/api-auth";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return unauthorized();

    const formData = await req.json();

    // Validate required fields
    if (!formData.fullName || !formData.email || !formData.jobTitle) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Team member onboarded:", formData);

    return NextResponse.json({
      success: true,
      message: "Team member onboarded successfully",
      data: {
        id: `tm-${Date.now()}`,
        ...formData,
      },
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to onboard team member" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return unauthorized();

    return NextResponse.json({
      teamMembers: [],
      total: 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}
