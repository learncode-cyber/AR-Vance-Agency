import { NextRequest, NextResponse } from 'next/server'
import { leadIntelligenceAgent } from '@/services/agents/LeadIntelligenceAgent'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { leadData } = await req.json()
  const analysis = await leadIntelligenceAgent.analyzeLead(leadData)
  return NextResponse.json(analysis)
}
