import { prisma } from '@/lib/prisma'
import { aiTaskEngine } from '../AITaskEngine'

export interface WorkflowTask {
  id: string
  agent: string
  input: string
  dependsOn?: string[]
  priority: number
}

export class AIOrchestrator {
  async createWorkflow(userId: string, orgId: string, tasks: WorkflowTask[]) {
    const workflowId = `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const taskResults = new Map()
    const queue = tasks.sort((a, b) => b.priority - a.priority)

    for (const task of queue) {
      // Check dependencies
      const deps = task.dependsOn || []
      const depsMet = deps.every(dep => taskResults.has(dep))
      
      if (!depsMet) {
        console.log(`⏳ Waiting for dependencies: ${task.id}`)
        continue
      }

      // Resolve input with previous results
      let resolvedInput = task.input
      for (const [depId, result] of taskResults) {
        resolvedInput = resolvedInput.replace(`{${depId}}`, result)
      }

      // Create task
      const aiTask = await aiTaskEngine.createTask(userId, orgId, task.agent, resolvedInput)
      taskResults.set(task.id, aiTask.result || '')
    }

    return { workflowId, tasks: Array.from(taskResults.entries()) }
  }

  async getWorkflowStatus(workflowId: string) {
    return prisma.aITask.findMany({
      where: { requestId: { contains: workflowId } }
    })
  }
}

export const aiOrchestrator = new AIOrchestrator()
