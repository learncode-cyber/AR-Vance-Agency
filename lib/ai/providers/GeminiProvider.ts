// lib/ai/providers/GeminiProvider.ts
/**
 * Google Gemini AI Provider Implementation
 * Handles all interactions with Google's Gemini API
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { AIProvider } from '../AIProvider'
import { AIGenerateRequest, AIResponse, AIError } from '../types'

export class GeminiProvider extends AIProvider {
  name: 'gemini' = 'gemini'
  displayName: string = 'Google Gemini'

  private client: GoogleGenerativeAI | null = null
  private model: string = 'gemini-1.5-pro'
  private generationConfig: any = {
    temperature: 0.7,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
  }

  constructor(apiKey?: string) {
    super(apiKey || process.env.GEMINI_API_KEY)
    this.initialize()
  }

  isConfigured(): boolean {
    return !!this.apiKey && !!this.client
  }

  /**
   * Initialize Gemini client
   */
  private initialize(): void {
    if (!this.apiKey) {
      this.log('warn', 'Gemini API key not provided')
      return
    }

    try {
      this.client = new GoogleGenerativeAI(this.apiKey)
      this.log('info', 'Gemini client initialized successfully')
    } catch (error) {
      this.log('error', 'Failed to initialize Gemini client', error)
    }
  }

  /**
   * Generate text response from Gemini
   */
  async generateText(request: AIGenerateRequest): Promise<AIResponse> {
    if (!this.client) {
      throw new AIError(
        'CLIENT_NOT_INITIALIZED',
        'Gemini client is not initialized',
        undefined,
        false
      )
    }

    try {
      const requestId = this.generateRequestId()
      this.log('info', `Starting Gemini request [${requestId}]`)

      // Get model
      const model = this.client.getGenerativeModel({
        model: this.model,
        generationConfig: {
          ...this.generationConfig,
          temperature: request.temperature ?? this.generationConfig.temperature,
          maxOutputTokens: request.maxTokens ?? this.generationConfig.maxOutputTokens,
        },
      })

      // Prepare prompt with safety guidelines
      const systemPrompt = this.createSafeSystemPrompt(request.systemPrompt || '')
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${request.prompt}` : request.prompt

      // Generate with timeout
      const timeoutMs = request.timeout || this.timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

      try {
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        })

        clearTimeout(timeoutId)

        if (!result.response) {
          throw new AIError(
            'NO_RESPONSE',
            'Gemini returned no response',
            undefined,
            true
          )
        }

        const content = result.response.text()
        const usageMetadata = result.response.usageMetadata

        if (!content) {
          throw new AIError(
            'EMPTY_RESPONSE',
            'Gemini returned empty content',
            undefined,
            true
          )
        }

        // Validate output
        const validation = await this.validateOutput(content)
        if (!validation.valid) {
          this.log('warn', 'Output validation failed', validation.errors)
          // Don't throw - warnings are OK
        }

        this.log('info', `Gemini request completed [${requestId}]`)

        return {
          content,
          tokensUsed: {
            input: usageMetadata?.promptTokenCount || 0,
            output: usageMetadata?.candidatesTokenCount || 0,
            total: (usageMetadata?.promptTokenCount || 0) + (usageMetadata?.candidatesTokenCount || 0),
          },
          model: this.model,
          provider: this.name,
          timestamp: new Date(),
          requestId,
          finishReason: result.response.candidates?.[0]?.finishReason || 'STOP',
        }
      } catch (error) {
        clearTimeout(timeoutId)

        if (error instanceof AIError) {
          throw error
        }

        // Check for specific error types
        const errorMessage = (error as any)?.message || String(error)

        if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
          throw new AIError(
            'RATE_LIMIT_EXCEEDED',
            'Gemini API rate limit exceeded',
            { error },
            true
          )
        }

        if (errorMessage.includes('401') || errorMessage.includes('UNAUTHENTICATED')) {
          throw new AIError(
            'AUTHENTICATION_ERROR',
            'Gemini API authentication failed',
            { error },
            false
          )
        }

        if (errorMessage.includes('timeout') || errorMessage.includes('AbortError')) {
          throw new AIError(
            'TIMEOUT',
            `Request exceeded ${timeoutMs}ms timeout`,
            { error },
            true
          )
        }

        throw new AIError(
          'GENERATION_ERROR',
          'Failed to generate text with Gemini',
          { error },
          true
        )
      }
    } catch (error) {
      if (error instanceof AIError) {
        throw error
      }
      throw new AIError(
        'UNKNOWN_ERROR',
        'Unknown error during Gemini generation',
        { error },
        true
      )
    }
  }

  /**
   * Count tokens in text
   * Gemini has a built-in token counter
   */
  async countTokens(text: string): Promise<number> {
    if (!this.client) {
      // Fallback: rough estimate (1 token ≈ 4 characters)
      return Math.ceil(text.length / 4)
    }

    try {
      const model = this.client.getGenerativeModel({ model: this.model })
      const result = await model.countTokens(text)
      return result.totalTokens
    } catch (error) {
      this.log('warn', 'Token counting failed, using estimate', error)
      // Fallback to rough estimate
      return Math.ceil(text.length / 4)
    }
  }

  /**
   * Estimate cost (Gemini has complex pricing, this is simplified)
   * As of 2024: ~$0.075 per 1M input tokens, ~$0.30 per 1M output tokens
   */
  estimateCost(tokens: number): number {
    // Rough estimate: ~$0.00007 per 1000 tokens
    return tokens * 0.00007 / 1000
  }

  /**
   * Generate request ID for tracking
   */
  private generateRequestId(): string {
    return `gemini-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Set model
   */
  setModel(model: string): void {
    this.model = model
    this.log('info', `Model changed to ${model}`)
  }

  /**
   * Update generation config
   */
  updateGenerationConfig(config: Partial<typeof this.generationConfig>): void {
    this.generationConfig = { ...this.generationConfig, ...config }
    this.log('info', 'Generation config updated', config)
  }
}
