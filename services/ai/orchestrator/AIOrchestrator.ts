import { prisma } from '@/lib/prisma'
import { aiTaskEngine } from '../AITaskEngine'
import { hasPermission } from '@/lib/rbac'

export interface WorkflowTask {
  id: string
  agent: string
  input: string
  dependsOn?: string[]
  priority: number
}

const TASK_TIMEOUT_MS = 60_000

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Task "${label}" timed out after ${ms}ms`)), ms)
    ),
  ])
}

export class AIOrchestrator {
  async createWorkflow(userId: string, tasks: WorkflowTask[]) {
    // AI agents must not be reachable by just anyone who is logged in —
    // gate workflow execution the same way every other privileged admin
    // action is gated.
    const allowed = await hasPermission(userId, 'manage_ai')
    if (!allowed) {
      throw new Error('FORBIDDEN: missing manage_ai permission')
    }

    const workflowId = `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const taskResults = new Map<string, string>()
    const taskErrors = new Map<string, string>()
    let remaining = [...tasks].sort((a, b) => b.priority - a.priority)

    // Repeatedly sweep the remaining queue instead of a single pass, so a
    // task whose dependency hasn't run YET (but will) actually gets
    // executed once that dependency completes — the previous version
    // skipped such tasks with `continue` and never came back to them,
    // silently dropping them from the workflow forever. Each full pass
    // that makes zero progress means the remaining tasks can never be
    // satisfied (missing/failed dependency, or a cycle) — stop there
    // instead of looping forever.
    while (remaining.length > 0) {
      const stillWaiting: WorkflowTask[] = []
      let progressed = false

      for (const task of remaining) {
        const deps = task.dependsOn || []
        const depsMet = deps.every(dep => taskResults.has(dep) || taskErrors.has(dep))

        if (!depsMet) {
          stillWaiting.push(task)
          continue
        }

        // If a dependency failed outright, don't run this task on bad/
        // missing input — record it as failed and move on rather than
        // crashing the whole workflow.
        const failedDep = deps.find(dep => taskErrors.has(dep))
        if (failedDep) {
          taskErrors.set(task.id, `Skipped: dependency "${failedDep}" failed`)
          progressed = true
          continue
        }

        let resolvedInput = task.input
        for (const [depId, result] of taskResults) {
          resolvedInput = resolvedInput.replace(`{${depId}}`, result)
        }

        try {
          const aiTask = await withTimeout(
            (async () => {
              // NOTE: this app has no real multi-tenant Organization model —
              // organizationId on AITask is a plain metadata string field,
              // not a foreign key. 'default' is a placeholder until/unless
              // real multi-tenancy is introduced.
              const created = await aiTaskEngine.createTask(userId, 'default', task.agent, resolvedInput)
              // createTask only queues the row; it doesn't populate result
              // until processTask actually runs the provider call. The
              // previous version read aiTask.result immediately after
              // createTask and always got an empty string.
              await aiTaskEngine.processTask(created.id)
              return aiTaskEngine.getStatus(created.id)
            })(),
            TASK_TIMEOUT_MS,
            task.id
          )
          if (aiTask?.status === 'failed') {
            taskErrors.set(task.id, aiTask.error || 'Task failed')
          } else {
            taskResults.set(task.id, aiTask?.result || '')
          }
        } catch (err) {
          console.error(`AI workflow task "${task.id}" failed:`, err)
          taskErrors.set(task.id, err instanceof Error ? err.message : 'Unknown error')
        }
        progressed = true
      }

      if (!progressed) {
        // Nothing in this pass could run — remaining tasks depend on
        // something that will never resolve (unknown task id, or a
        // dependency cycle). Mark them failed instead of hanging.
        for (const task of stillWaiting) {
          taskErrors.set(task.id, 'Skipped: unresolved or circular dependency')
        }
        break
      }

      remaining = stillWaiting
    }

    return {
      workflowId,
      tasks: Array.from(taskResults.entries()),
      errors: Array.from(taskErrors.entries()),
    }
  }

  async getWorkflowStatus(workflowId: string) {
    return prisma.aITask.findMany({
      where: { requestId: { contains: workflowId } }
    })
  }
}

export const aiOrchestrator = new AIOrchestrator()
