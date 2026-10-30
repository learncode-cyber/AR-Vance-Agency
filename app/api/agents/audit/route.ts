import { NextRequest, NextResponse } from 'next/server'
import { businessAuditAgent } from '@/services/agents/BusinessAuditAgent'
import { auth } from '@/lib/ai-session'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { businessData } = await req.json()
  const audit = await businessAuditAgent.auditBusiness(businessData)
  return NextResponse.json(audit)
}
