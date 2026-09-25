import { NextRequest, NextResponse } from 'next/server'
import { decisionJournal } from '@/services/journal/DecisionJournal'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { entryId, learning, importance } = await req.json()
  
  const updated = await decisionJournal.recordLearning(entryId, learning, importance)
  return NextResponse.json(updated)
}
