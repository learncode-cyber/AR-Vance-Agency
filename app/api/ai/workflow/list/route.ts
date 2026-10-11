import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function GET(_req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  // Previously filtered by session.user.organizationId, which doesn't exist
  // on the real JWT session (this app has no Organization model). Scoping to
  // the caller's own tasks is the safer equivalent: tasks are recorded with
  // the creating user's id.
  const tasks = await prisma.aITask.findMany({
    where: { userId: session.userId },
    take: 50,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ tasks })
}
