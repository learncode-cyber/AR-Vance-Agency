import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tasks = await prisma.aITask.findMany({
    where: { organizationId: session.user.organizationId },
    take: 50,
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json({ tasks })
}
