import { NextResponse } from "next/server";
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function GET() {
  if (!(await getAdminSession())) return unauthorized()
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
