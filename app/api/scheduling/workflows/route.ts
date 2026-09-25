import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    workflows: [
      { id: "1", name: "Onboarding", steps: 5, status: "active" },
      { id: "2", name: "Approval", steps: 3, status: "active" },
    ],
  });
}

export async function POST(req: Request) {
  try {
    const { name, steps } = await req.json();
    return NextResponse.json({
      workflowId: "workflow-" + Date.now(),
      name,
      steps: steps.length,
      status: "active",
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
