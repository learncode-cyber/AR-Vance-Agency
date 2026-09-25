import { NextRequest, NextResponse } from 'next/server'
import { decisionJournal } from '@/services/journal/DecisionJournal'
import { auth } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { status, outcome, impact } = await req.json()
  
  const entry = await decisionJournal.updateEntry(params.id, status, outcome, impact)
  return NextResponse.json(entry)
}
