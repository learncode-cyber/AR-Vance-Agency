import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "AI API endpoints available",
    endpoints: [
      "POST /api/ai/recommendations - Get AI recommendations",
      "POST /api/ai/sentiment - Analyze text sentiment",
      "POST /api/ai/predictions - Get predictions",
      "POST /api/ai/chatbot - Chat with AI",
    ],
  });
}
