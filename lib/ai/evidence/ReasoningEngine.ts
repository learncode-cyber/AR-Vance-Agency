export interface Reasoning {
  decision: string
  confidence: number
  evidence: string[]
  risks: string[]
  benefits: string[]
  alternatives: string[]
}

export class ReasoningEngine {
  async buildReasoning(
    decision: string,
    evidence: string[],
    confidence: number
  ): Promise<Reasoning> {
    return {
      decision,
      confidence,
      evidence,
      risks: this.identifyRisks(evidence),
      benefits: this.identifyBenefits(evidence),
      alternatives: this.suggestAlternatives(decision)
    }
  }

  private identifyRisks(evidence: string[]): string[] {
    // Simple pattern matching for risks
    const risks: string[] = []
    evidence.forEach(e => {
      if (e.toLowerCase().includes('uncertain') || e.toLowerCase().includes('low confidence')) {
        risks.push('Low confidence in available data')
      }
      if (e.toLowerCase().includes('small sample')) {
        risks.push('Limited sample size')
      }
    })
    return risks.length > 0 ? risks : ['General market risk']
  }

  private identifyBenefits(evidence: string[]): string[] {
    const benefits: string[] = []
    evidence.forEach(e => {
      if (e.toLowerCase().includes('proven') || e.toLowerCase().includes('successful')) {
        benefits.push('Proven approach with track record')
      }
      if (e.toLowerCase().includes('high confidence')) {
        benefits.push('High confidence in recommendation')
      }
    })
    return benefits.length > 0 ? benefits : ['Moves business forward']
  }

  private suggestAlternatives(decision: string): string[] {
    // Suggest alternatives based on decision
    if (decision.includes('budget')) {
      return ['Reduce scope', 'Phase implementation', 'Defer non-critical items']
    }
    if (decision.includes('publish')) {
      return ['Draft for review', 'Limited release', 'Schedule for later']
    }
    return ['Conservative approach', 'Pilot program', 'Further analysis']
  }
}

export const reasoningEngine = new ReasoningEngine()
