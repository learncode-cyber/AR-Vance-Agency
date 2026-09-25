import { NextRequest, NextResponse } from 'next/server'
import { decisionJournal } from '@/services/journal/DecisionJournal'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { decisionId, initialThoughts } = await req.json()
  
  const entry = await decisionJournal.createEntry(
    session.user.organizationId,
    decisionId,
    initialThoughts
  )

  return NextResponse.json(entry)
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const limit = req.nextUrl.searchParams.get('limit')
  const entries = await decisionJournal.getJournalEntries(
    session.user.organizationId,
    limit ? parseInt(limit) : 100
  )

  return NextResponse.json({ entries })
}
