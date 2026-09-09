import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const days = searchParams.get("days") || "7";

  return NextResponse.json({
    total: 15,
    days: parseInt(days),
    errors: [
      { id: 1, message: "TypeError", count: 5, lastOccurred: new Date() },
      { id: 2, message: "NetworkError", count: 3, lastOccurred: new Date() },
    ],
  });
}
