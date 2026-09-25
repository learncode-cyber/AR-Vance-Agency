import { NextRequest, NextResponse } from 'next/server'
import { decisionJournal } from '@/services/journal/DecisionJournal'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const stats = await decisionJournal.getEntryStats(session.user.organizationId)
  return NextResponse.json(stats)
}
