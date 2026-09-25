// lib/ai/AIProvider.ts
/**
 * Abstract AI Provider
 * All AI providers must extend this class
 */

import { z } from 'zod'
import {
  IAIProvider,
  AIGenerateRequest,
  AIResponse,
  AIStructuredResponse,
  AIProviderType,
  AIError,
  ValidationResult,
} from './types'

export abstract class AIProvider implements IAIProvider {
  abstract name: AIProviderType
  abstract displayName: string
  protected apiKey?: string
  protected timeout: number = 30000 // 30 seconds
  protected retryCount: number = 3
  protected retryDelay: number = 1000 // 1 second

  constructor(apiKey?: string) {
    this.apiKey = apiKey
  }

  abstract isConfigured(): boolean
  abstract generateText(request: AIGenerateRequest): Promise<AIResponse>
  abstract countTokens(text: string): Promise<number>
  abstract estimateCost(tokens: number): number

  /**
   * Generate structured output with validation
   */
  async generateStructuredOutput<T>(
    request: AIGenerateRequest,
    schema: z.ZodSchema<T>
  ): Promise<AIStructuredResponse<T>> {
    try {
      const response = await this.generateText(request)

      // Parse JSON from response
      let data: T
      try {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
          throw new Error('No JSON found in response')
        }
        data = JSON.parse(jsonMatch[0])
      } catch (parseError) {
        throw new AIError(
          'PARSE_ERROR',
          'Failed to parse JSON from AI response',
          { originalError: parseError },
          true // retryable
        )
      }

      // Validate against schema
      const validationResult = schema.safeParse(data)

      if (!validationResult.success) {
        throw new AIError(
          'VALIDATION_ERROR',
          'AI response did not match expected schema',
          { errors: validationResult.error.errors },
          true // retryable
        )
      }

      return {
        ...response,
        data: validationResult.data,
        validationPassed: true,
      }
    } catch (error) {
      if (error instanceof AIError) {
        throw error
      }
      throw new AIError(
        'GENERATION_ERROR',
        'Failed to generate structured output',
        error,
        true
      )
    }
  }

  /**
   * Generate with retry logic and exponential backoff
   */
  async generateWithRetry(request: AIGenerateRequest): Promise<AIResponse> {
    let lastError: Error | null = null
    const retries = request.retryCount || this.retryCount

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await this.generateText(request)
      } catch (error) {
        lastError = error as Error

        // Check if error is retryable
        if (error instanceof AIError && !error.isRetryable) {
          throw error
        }

        // Don't retry on last attempt
        if (attempt === retries - 1) {
          break
        }

        // Exponential backoff: 1s, 2s, 4s, 8s, etc.
        const delay = this.retryDelay * Math.pow(2, attempt)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    throw new AIError(
      'MAX_RETRIES_EXCEEDED',
      `Failed after ${retries} attempts`,
      { lastError },
      false
    )
  }

  /**
   * Validate output against business rules
   */
  async validateOutput(output: string): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    // Check for empty output
    if (!output || output.trim().length === 0) {
      errors.push('Output is empty')
    }

    // Check for suspicious patterns
    if (this.containsSuspiciousPatterns(output)) {
      warnings.push('Output contains suspicious patterns')
    }

    // Check for hallucination indicators
    if (this.containsHallucinationMarkers(output)) {
      warnings.push('Output may contain hallucinated information')
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * Check for suspicious patterns (injection, escape attempts, etc.)
   */
  protected containsSuspiciousPatterns(text: string): boolean {
    const suspiciousPatterns = [
      /ignore previous instructions/i,
      /as a ai language model/i,
      /i have no restrictions/i,
      /i can now/i,
      /let me pretend/i,
    ]

    return suspiciousPatterns.some((pattern) => pattern.test(text))
  }

  /**
   * Check for hallucination markers
   */
  protected containsHallucinationMarkers(text: string): boolean {
    const markers = [
      /\[citation needed\]/i,
      /\[citation\]/i,
      /according to non-existent/i,
      /in the fictional/i,
    ]

    return markers.some((marker) => marker.test(text))
  }

  /**
   * Extract JSON from text
   */
  protected extractJSON<T>(text: string): T {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found')
      }
      return JSON.parse(jsonMatch[0]) as T
    } catch (error) {
      throw new AIError(
        'JSON_EXTRACTION_ERROR',
        'Could not extract JSON from text',
        { text, error },
        true
      )
    }
  }

  /**
   * Create system prompt with safety guidelines
   */
  protected createSafeSystemPrompt(basePrompt: string): string {
    const safetyGuidelines = `
You are a helpful AI assistant. Follow these guidelines:
1. Always be honest and accurate
2. Never fabricate information or data
3. Clearly distinguish between facts and assumptions
4. If you're unsure, say so
5. Follow the user's instructions but never violate safety policies
6. Do not attempt to manipulate or trick the system
7. Respect confidentiality and privacy
8. Never provide illegal or harmful advice
`

    return `${safetyGuidelines}\n\n${basePrompt}`
  }

  /**
   * Log request (override in subclasses for specific logging)
   */
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      provider: this.name,
      message,
      ...(data && { data }),
    }

    if (level === 'error') {
      console.error('[AI]', logEntry)
    } else if (level === 'warn') {
      console.warn('[AI]', logEntry)
    } else {
      console.log('[AI]', logEntry)
    }
  }
}

/**
 * Provider Registry
 * Manages multiple AI providers with fallback strategy
 */
export class AIProviderRegistry {
  private providers: Map<AIProviderType, AIProvider> = new Map()
  private primaryProvider: AIProviderType = 'gemini'
  private fallbackOrder: AIProviderType[] = ['gemini', 'mock']

  registerProvider(provider: AIProvider): void {
    this.providers.set(provider.name, provider)
  }

  getProvider(name?: AIProviderType): AIProvider {
    const providerName = name || this.primaryProvider

    const provider = this.providers.get(providerName)
    if (!provider) {
      throw new AIError(
        'PROVIDER_NOT_FOUND',
        `AI Provider '${providerName}' not found`,
        undefined,
        false
      )
    }

    if (!provider.isConfigured()) {
      throw new AIError(
        'PROVIDER_NOT_CONFIGURED',
        `AI Provider '${providerName}' is not configured`,
        undefined,
        false
      )
    }

    return provider
  }

  /**
   * Get provider with automatic fallback
   */
  getProviderWithFallback(preferredProvider?: AIProviderType): AIProvider {
    const toTry = preferredProvider
      ? [preferredProvider, ...this.fallbackOrder.filter((p) => p !== preferredProvider)]
      : this.fallbackOrder

    for (const name of toTry) {
      try {
        return this.getProvider(name)
      } catch (error) {
        continue
      }
    }

    throw new AIError(
      'NO_PROVIDER_AVAILABLE',
      'No AI provider is available',
      undefined,
      false
    )
  }

  setPrimaryProvider(name: AIProviderType): void {
    if (!this.providers.has(name)) {
      throw new Error(`Provider '${name}' not registered`)
    }
    this.primaryProvider = name
  }

  setFallbackOrder(order: AIProviderType[]): void {
    this.fallbackOrder = order
  }

  listProviders(): Array<{ name: AIProviderType; configured: boolean }> {
    return Array.from(this.providers.values()).map((p) => ({
      name: p.name,
      configured: p.isConfigured(),
    }))
  }
}

// Singleton instance
let registry: AIProviderRegistry | null = null

export function getProviderRegistry(): AIProviderRegistry {
  if (!registry) {
    registry = new AIProviderRegistry()
  }
  return registry
}
