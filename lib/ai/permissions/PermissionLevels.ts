export enum PermissionLevel {
  L1 = 1, // Observe (read/analyze/monitor)
  L2 = 2, // Recommend (draft/predict)
  L3 = 3, // Approval Required (send, publish, change pricing)
  L4 = 4  // Controlled Autonomy (low-risk only)
}

export interface PermissionConfig {
  level: PermissionLevel
  canObserve: boolean
  canRecommend: boolean
  canApprove: boolean
  canExecute: boolean
  requiresApprovalFor: string[]
  dailyBudgetLimit?: number
  monthlyBudgetLimit?: number
}

export const PERMISSION_CONFIGS: Record<PermissionLevel, PermissionConfig> = {
  [PermissionLevel.L1]: {
    level: PermissionLevel.L1,
    canObserve: true,
    canRecommend: false,
    canApprove: false,
    canExecute: false,
    requiresApprovalFor: [],
    dailyBudgetLimit: 0,
  },
  [PermissionLevel.L2]: {
    level: PermissionLevel.L2,
    canObserve: true,
    canRecommend: true,
    canApprove: false,
    canExecute: false,
    requiresApprovalFor: ['send_proposal', 'publish', 'change_budget'],
    dailyBudgetLimit: 0,
  },
  [PermissionLevel.L3]: {
    level: PermissionLevel.L3,
    canObserve: true,
    canRecommend: true,
    canApprove: true,
    canExecute: false,
    requiresApprovalFor: ['large_budget_change', 'public_announcement'],
    dailyBudgetLimit: 50000,
  },
  [PermissionLevel.L4]: {
    level: PermissionLevel.L4,
    canObserve: true,
    canRecommend: true,
    canApprove: true,
    canExecute: true,
    requiresApprovalFor: [],
    dailyBudgetLimit: 100000,
  },
}

export function getPermissionConfig(level: PermissionLevel): PermissionConfig {
  return PERMISSION_CONFIGS[level]
}
