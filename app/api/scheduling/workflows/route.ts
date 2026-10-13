import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession, unauthorized } from '@/lib/api-auth'

// NOTE: demo/stub endpoint (no persistence). Admin-only; validates input so bad
// bodies get 400 instead of a 500.
const createSchema = z.object({ name: z.string().min(1).max(200), steps: z.array(z.unknown()).max(100) })

export async function GET() {
  if (!(await getAdminSession())) return unauthorized()
  return NextResponse.json({
    workflows: [
      { id: "1", name: "Onboarding", steps: 5, status: "active" },
      { id: "2", name: "Approval", steps: 3, status: "active" },
    ],
  });
}

export async function POST(req: Request) {
  if (!(await getAdminSession())) return unauthorized()
  const parsed = createSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid workflow" }, { status: 400 });
  return NextResponse.json({
    workflowId: "workflow-" + Date.now(),
    name: parsed.data.name,
    steps: parsed.data.steps.length,
    status: "active",
  });
}
