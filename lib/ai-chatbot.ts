import prisma from './prisma'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

/**
 * Get Claude AI response
 * Uses Anthropic API for intelligent responses
 */
export async function getChatbotResponse(
  botId: string,
  userMessage: string,
  conversationHistory: Message[] = []
): Promise<string> {
  try {
    // Get bot configuration
    const bot = await prisma.chatBot.findUniqueOrThrow({
      where: { id: botId },
    })

    if (!bot.active) {
      throw new Error('Chatbot is inactive')
    }

    // Prepare messages for Claude API
    const messages: Message[] = [
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ]

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: bot.aiModel,
        max_tokens: bot.maxTokens,
        temperature: bot.temperature,
        system: bot.systemPrompt,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Claude API error:', error)
      throw new Error('Failed to get AI response')
    }

    const data: any = await response.json()
    const assistantMessage = data.content[0]?.text || 'Unable to generate response'

    return assistantMessage
  } catch (error) {
    console.error('Chatbot response error:', error)
    throw error
  }
}

/**
 * Check if message requires human escalation
 */
export async function shouldEscalate(message: string): Promise<boolean> {
  const escalationKeywords = ['angry', 'urgent', 'complaint', 'refund', 'cancel', 'support', 'help me']

  return escalationKeywords.some((keyword) => message.toLowerCase().includes(keyword))
}

/**
 * Detect message sentiment
 */
export function detectSentiment(message: string): 'positive' | 'negative' | 'neutral' {
  const positiveWords = ['good', 'great', 'excellent', 'love', 'happy', 'thanks', 'perfect']
  const negativeWords = ['bad', 'terrible', 'hate', 'angry', 'sad', 'disappointed', 'wrong']

  const lowerMessage = message.toLowerCase()

  const positiveCount = positiveWords.filter((w) => lowerMessage.includes(w)).length
  const negativeCount = negativeWords.filter((w) => lowerMessage.includes(w)).length

  if (negativeCount > positiveCount) return 'negative'
  if (positiveCount > negativeCount) return 'positive'
  return 'neutral'
}
