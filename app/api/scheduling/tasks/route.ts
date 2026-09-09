import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    tasks: [
      { id: "1", title: "Complete Report", status: "pending", priority: "high" },
      { id: "2", title: "Review Documents", status: "in_progress", priority: "medium" },
    ],
  });
}

export async function POST(req: Request) {
  try {
    const { title, assignedTo, priority } = await req.json();
    return NextResponse.json({
      taskId: "task-" + Date.now(),
      title,
      assignedTo,
      priority,
      status: "pending",
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
