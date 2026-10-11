export class PatternRecognition {
  analyzePatterns(entries: any[]): any {
    const patterns: Record<string, number> = {}

    // Analyze decision types
    entries.forEach(e => {
      if (e.outcome) {
        const outcomeType = e.outcome.substring(0, 20)
        patterns[outcomeType] = (patterns[outcomeType] || 0) + 1
      }
    })

    // Analyze success patterns
    const successful = entries.filter(e => e.status === 'completed' && (e.impact || 0) > 0)
    const failed = entries.filter(e => e.status === 'failed' || (e.impact || 0) < 0)

    return {
      patterns,
      successRate: entries.length > 0 ? (successful.length / entries.length) * 100 : 0,
      failureRate: entries.length > 0 ? (failed.length / entries.length) * 100 : 0,
      topPatterns: Object.entries(patterns)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([pattern, count]) => ({ pattern, count }))
    }
  }

  extractLearnings(entries: any[]): string[] {
    const allLearnings: string[] = []

    entries.forEach(e => {
      if (e.learnings) {
        const learnings = JSON.parse(e.learnings)
        learnings.forEach((l: any) => {
          if (l.text && !allLearnings.includes(l.text)) {
            allLearnings.push(l.text)
          }
        })
      }
    })

    return allLearnings.slice(0, 20) // Top 20
  }

  identifyImprovements(entries: any[]): string[] {
    const improvements: string[] = []

    entries.forEach(e => {
      if (e.improvements) {
        const imps = JSON.parse(e.improvements)
        imps.forEach((imp: any) => {
          if (imp.text && !improvements.includes(imp.text)) {
            improvements.push(imp.text)
          }
        })
      }
    })

    return improvements.slice(0, 20) // Top 20
  }
}

export const patternRecognition = new PatternRecognition()
