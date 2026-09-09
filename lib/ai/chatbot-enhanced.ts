import Anthropic from '@anthropic-ai/sdk';
import { NLPProcessor } from './nlp';
import { logger } from '../logging';

interface ConversationContext {
  userId: string;
  history: Array<{ role: string; content: string }>;
  metadata: Record<string, any>;
}

export class EnhancedChatbot {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async respond(
    userMessage: string,
    context: ConversationContext
  ): Promise<string> {
    try {
      // Analyze user intent
      const intent = NLPProcessor.classifyIntent(userMessage);
      
      // Extract entities
      const entities = NLPProcessor.extractEntities(userMessage);

      // Build system prompt with context
      const systemPrompt = this.buildSystemPrompt(context, intent);

      // Call Claude API
      const response = await this.client.messages.create({
        model: 'claude-opus-4-1',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          ...context.history,
          {
            role: 'user',
            content: userMessage,
          },
        ],
      });

      const assistantMessage =
        response.content[0].type === 'text' ? response.content[0].text : '';

      // Log interaction
      logger.info('Chatbot response generated', 'EnhancedChatbot', {
        intent: intent.intent,
        entities: entities.length,
      });

      return assistantMessage;
    } catch (error) {
      logger.error('Chatbot error', error, 'EnhancedChatbot');
      return 'Sorry, I encountered an error. Please try again.';
    }
  }

  private buildSystemPrompt(
    context: ConversationContext,
    intent: { intent: string; confidence: number }
  ): string {
    const basePrompt = `You are a helpful AI assistant for AR Vance Agency. 
You help users with product recommendations, support questions, and general inquiries.

Current user context:
- User ID: ${context.metadata.userId || 'unknown'}
- Conversation history length: ${context.history.length}

Detected intent: ${intent.intent} (confidence: ${(intent.confidence * 100).toFixed(0)}%)

Guidelines:
1. Be friendly and professional
2. Provide helpful recommendations when appropriate
3. For technical issues, suggest contacting support
4. Keep responses concise and clear
5. Use the conversation history to maintain context`;

    return basePrompt;
  }

  // Get FAQ answer if available
  static async getFAQAnswer(question: string): Promise<string | null> {
    const faqResponses: Record<string, string> = {
      'what is your return policy': 'We offer 30-day returns on most items. Please contact support for details.',
      'how do i track my order': 'You can track your order in your account dashboard under "Orders".',
      'what payment methods do you accept': 'We accept credit cards, PayPal, and bank transfers.',
      'how long does shipping take': 'Standard shipping takes 5-7 business days. Express options available.',
    };

    const lowerQuestion = question.toLowerCase();
    for (const [key, answer] of Object.entries(faqResponses)) {
      if (lowerQuestion.includes(key)) {
        return answer;
      }
    }

    return null;
  }
}
