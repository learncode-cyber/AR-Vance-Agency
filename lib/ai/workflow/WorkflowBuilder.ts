export interface WorkflowStep {
  id: string
  agent: string
  input: string
  dependsOn?: string[]
  maxRetries?: number
  timeout?: number
}

export class WorkflowBuilder {
  private steps: WorkflowStep[] = []

  addStep(step: WorkflowStep): this {
    this.steps.push(step)
    return this
  }

  addDependency(stepId: string, dependsOn: string[]): this {
    const step = this.steps.find(s => s.id === stepId)
    if (step) step.dependsOn = dependsOn
    return this
  }

  build() {
    return this.steps
  }

  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    const stepIds = new Set(this.steps.map(s => s.id))

    for (const step of this.steps) {
      if (!step.agent) errors.push(`Step ${step.id}: missing agent`)
      if (!step.input) errors.push(`Step ${step.id}: missing input`)

      for (const dep of step.dependsOn || []) {
        if (!stepIds.has(dep)) errors.push(`Step ${step.id}: dependency ${dep} not found`)
      }
    }

    return { valid: errors.length === 0, errors }
  }
}
