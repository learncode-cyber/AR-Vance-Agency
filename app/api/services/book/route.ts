import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const bookingSchema = z.object({
  fullName: z.string().min(2).max(100),
  companyName: z.string().optional(),
  email: z.string().email(),
  phone: z.string(),
  service: z.string().min(1),
  date: z.string(),
  time: z.string(),
  requirements: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = bookingSchema.parse(body);

    console.log("Booking submitted:", validatedData);

    return NextResponse.json({
      success: true,
      message: "Booking submitted successfully",
      bookingId: `BK-${Date.now()}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid form data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process booking" },
      { status: 500 }
    );
  }
}
