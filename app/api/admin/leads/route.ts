import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function GET() {
  const session = await getAdminSession()
  if (!session) return unauthorized()
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ data: leads })
}
