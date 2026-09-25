// lib/ai/types.ts
/**
 * Core AI Types and Interfaces
 * Used across all AI infrastructure
 */

export type AIProviderType = 'gemini' | 'openai' | 'mock' | 'local'
export type AITaskStatus = 'queued' | 'running' | 'waiting_approval' | 'completed' | 'failed' | 'cancelled'
export type EvidenceType = 'observed' | 'estimated' | 'inferred' | 'unknown'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

/**
 * AI Provider Interface
 * All providers must implement this interface
 */
export interface IAIProvider {
  name: AIProviderType
  displayName: string
  isConfigured(): boolean
  
  generateText(request: AIGenerateRequest): Promise<AIResponse>
  generateStructuredOutput<T>(request: AIGenerateRequest, schema: z.ZodSchema<T>): Promise<AIStructuredResponse<T>>
  
  countTokens(text: string): Promise<number>
  estimateCost(tokens: number): number
}

/**
 * AI Generation Request
 */
export interface AIGenerateRequest {
  prompt: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  topP?: number
  topK?: number
  stopSequences?: string[]
  retryCount?: number
  timeout?: number // milliseconds
  metadata?: Record<string, any>
}

/**
 * AI Response from provider
 */
export interface AIResponse {
  content: string
  tokensUsed: {
    input: number
    output: number
    total: number
  }
  model: string
  provider: AIProviderType
  timestamp: Date
  requestId: string
  finishReason?: string
}

/**
 * Structured AI Response
 */
export interface AIStructuredResponse<T> extends AIResponse {
  data: T
  validationPassed: boolean
  validationErrors?: string[]
}

/**
 * AI Task
 */
export interface AITask {
  id: string
  userId: string
  organizationId: string
  clientId?: string
  projectId?: string
  agent: string
  provider: AIProviderType
  model: string
  
  status: AITaskStatus
  input: string
  output?: string
  
  inputTokens: number
  outputTokens: number
  
  error?: string
  errorCode?: string
  
  confidence?: number
  reasoning?: string
  
  requiresApproval: boolean
  approvedBy?: string
  approvedAt?: Date
  
  requestId: string
  traceId?: string
  
  createdAt: Date
  completedAt?: Date
}

/**
 * AI Evidence
 */
export interface AIEvidence {
  id: string
  taskId: string
  
  source: string // 'observed', 'api', 'database', 'user_input'
  sourceType: string // 'website', 'api_response', 'database_query'
  sourceUrl?: string
  sourceData: string
  
  confidence: number // 0.0-1.0
  evidenceType: EvidenceType
  
  timestamp: Date
  freshness: number // seconds old
  
  used: boolean
  weight: number // importance in decision
}

/**
 * AI Decision
 */
export interface AIDecision {
  id: string
  taskId: string
  
  userRequest: string
  context: string
  
  agentSelected: string
  toolsCalled: string[]
  evidenceUsed: string[]
  
  reasoning: string
  alternatives: Record<string, string>
  
  confidence: number
  riskLevel: RiskLevel
  
  requiresApproval: boolean
  approvalReason?: string
  
  actionTaken?: string
  actionResult?: string
  outcome?: 'success' | 'partial' | 'failed' | 'manual_override'
  
  feedback?: string
  feedbackScore?: number // 1-5
}

/**
 * AI Agent
 */
export interface AIAgent {
  id: string
  name: string
  displayName: string
  version: string
  description: string
  
  capabilities: string[]
  systemPrompt: string
  
  provider: AIProviderType
  model: string
  temperature: number
  maxTokens: number
  
  tools: string[]
  permissions: string[]
  riskLevel: RiskLevel
  
  isActive: boolean
  requiresApproval: boolean
  
  totalTasks: number
  successfulTasks: number
  failedTasks: number
}

/**
 * AI Validation Result
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  data?: any
}

/**
 * AI Error
 */
export class AIError extends Error {
  constructor(
    public code: string,
    public message: string,
    public details?: any,
    public isRetryable: boolean = false
  ) {
    super(message)
    this.name = 'AIError'
  }
}

/**
 * AI Provider Configuration
 */
export interface AIProviderConfig {
  name: AIProviderType
  displayName: string
  apiKey?: string
  apiUrl?: string
  rateLimit: number // requests per minute
  tokenBudget: number // tokens per day
  timeout: number // milliseconds
  retryCount: number
  retryDelay: number // milliseconds
  cacheEnabled: boolean
  cacheTTL: number // seconds
  [key: string]: any
}

/**
 * Token Usage
 */
export interface TokenUsage {
  provider: AIProviderType
  model: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  estimatedCost: number
  timestamp: Date
}

/**
 * Rate Limit State
 */
export interface RateLimitState {
  userId: string
  provider: AIProviderType
  requestCount: number
  tokenCount: number
  windowStart: Date
  windowEnd: Date
  remaining: {
    requests: number
    tokens: number
  }
}

/**
 * Health Check Result
 */
export interface ProviderHealthStatus {
  provider: AIProviderType
  isHealthy: boolean
  lastCheck: Date
  responseTime: number // milliseconds
  tokenUsage: {
    today: number
    budget: number
    remaining: number
  }
  errorRate: number // 0.0-1.0
  requestCount: number
}
