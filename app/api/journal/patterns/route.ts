import { NextRequest, NextResponse } from 'next/server'
import { decisionJournal } from '@/services/journal/DecisionJournal'
import { patternRecognition } from '@/lib/ai/journal/PatternRecognition'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const entries = await decisionJournal.getJournalEntries(session.user.organizationId, 500)
  const patterns = patternRecognition.analyzePatterns(entries)
  const learnings = patternRecognition.extractLearnings(entries)
  const improvements = patternRecognition.identifyImprovements(entries)

  return NextResponse.json({ patterns, learnings, improvements })
}
