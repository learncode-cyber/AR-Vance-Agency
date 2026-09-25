import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { type, format } = await req.json();
    return NextResponse.json({
      exportId: "exp-" + Date.now(),
      format,
      downloadUrl: "/exports/file." + format,
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
