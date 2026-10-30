import { NextResponse } from "next/server";
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function GET() {
  if (!(await getAdminSession())) return unauthorized()
  return NextResponse.json({
    tasks: [
      { id: "1", title: "Complete Report", status: "pending", priority: "high" },
      { id: "2", title: "Review Documents", status: "in_progress", priority: "medium" },
    ],
  });
}

export async function POST(req: Request) {
  if (!(await getAdminSession())) return unauthorized()
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
