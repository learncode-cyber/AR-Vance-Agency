import { NextRequest, NextResponse } from 'next/server'
import { prospectingAgent } from '@/services/agents/ProspectingAgent'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { criteria } = await req.json()
  const prospects = await prospectingAgent.findProspects(criteria)
  return NextResponse.json(prospects)
}
