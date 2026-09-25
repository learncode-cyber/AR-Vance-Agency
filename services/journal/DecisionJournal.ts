import { prisma } from '@/lib/prisma'

export interface JournalEntry {
  id: string
  organizationId: string
  decisionId: string
  status: string // pending, executed, completed, failed, revised
  outcome: string
  impact: number // -1 to 1 scale
  learnings: string[]
  improvements: string[]
  executedAt?: Date
  completedAt?: Date
}

export class DecisionJournal {
  async createEntry(
    organizationId: string,
    decisionId: string,
    initialThoughts: string
  ) {
    const entryId = `journal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    return prisma.journalEntry.create({
      data: {
        id: entryId,
        organizationId,
        decisionId,
        status: 'pending',
        initialThoughts,
        createdAt: new Date(),
      }
    })
  }

  async updateEntry(entryId: string, status: string, outcome?: string, impact?: number) {
    const data: any = { status, updatedAt: new Date() }
    
    if (outcome) data.outcome = outcome
    if (impact !== undefined) data.impact = impact
    
    if (status === 'completed') data.completedAt = new Date()
    if (status === 'executed') data.executedAt = new Date()

    return prisma.journalEntry.update({
      where: { id: entryId },
      data
    })
  }

  async recordLearning(entryId: string, learning: string, importance: number = 0.5) {
    const entry = await prisma.journalEntry.findUnique({ where: { id: entryId } })
    if (!entry) throw new Error('Entry not found')

    const learnings = entry.learnings ? JSON.parse(entry.learnings) : []
    learnings.push({ text: learning, importance, date: new Date() })

    return prisma.journalEntry.update({
      where: { id: entryId },
      data: { learnings: JSON.stringify(learnings) }
    })
  }

  async recordImprovement(entryId: string, improvement: string) {
    const entry = await prisma.journalEntry.findUnique({ where: { id: entryId } })
    if (!entry) throw new Error('Entry not found')

    const improvements = entry.improvements ? JSON.parse(entry.improvements) : []
    improvements.push({ text: improvement, date: new Date() })

    return prisma.journalEntry.update({
      where: { id: entryId },
      data: { improvements: JSON.stringify(improvements) }
    })
  }

  async getJournalEntries(organizationId: string, limit: number = 100) {
    return prisma.journalEntry.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  }

  async getEntryStats(organizationId: string) {
    const entries = await prisma.journalEntry.findMany({
      where: { organizationId }
    })

    const completed = entries.filter(e => e.status === 'completed').length
    const failed = entries.filter(e => e.status === 'failed').length
    const avgImpact = entries.length > 0
      ? entries.reduce((sum, e) => sum + (e.impact || 0), 0) / entries.length
      : 0

    const totalLearnings = entries.reduce((sum, e) => {
      const learnings = e.learnings ? JSON.parse(e.learnings) : []
      return sum + learnings.length
    }, 0)

    return {
      totalEntries: entries.length,
      completed,
      failed,
      successRate: entries.length > 0 ? (completed / entries.length) * 100 : 0,
      averageImpact: avgImpact,
      totalLearnings,
      avgLearningsPerEntry: entries.length > 0 ? totalLearnings / entries.length : 0
    }
  }
}

export const decisionJournal = new DecisionJournal()
