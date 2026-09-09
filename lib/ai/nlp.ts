import { logger } from '../logging';

export class NLPProcessor {
  // Simple sentiment analysis
  static analyzeSentiment(text: string): {
    sentiment: 'positive' | 'negative' | 'neutral';
    score: number;
  } {
    const positiveWords = [
      'good', 'great', 'excellent', 'amazing', 'wonderful',
      'love', 'fantastic', 'awesome', 'best', 'perfect',
    ];
    const negativeWords = [
      'bad', 'terrible', 'awful', 'hate', 'horrible',
      'worst', 'useless', 'poor', 'disappointing', 'ugly',
    ];

    const lowerText = text.toLowerCase();
    let score = 0;
    let wordCount = 0;

    positiveWords.forEach((word) => {
      if (lowerText.includes(word)) {
        score += 1;
        wordCount += 1;
      }
    });

    negativeWords.forEach((word) => {
      if (lowerText.includes(word)) {
        score -= 1;
        wordCount += 1;
      }
    });

    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    let normalizedScore = 0.5;

    if (wordCount > 0) {
      normalizedScore = (score + wordCount) / (2 * wordCount);
      if (normalizedScore > 0.6) sentiment = 'positive';
      else if (normalizedScore < 0.4) sentiment = 'negative';
    }

    return { sentiment, score: normalizedScore };
  }

  // Extract keywords
  static extractKeywords(text: string, limit: number = 5): string[] {
    const words = text.toLowerCase().split(/\s+/);
    const stopwords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at',
      'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were',
    ]);

    const keywords = words
      .filter((word) => word.length > 3 && !stopwords.has(word))
      .slice(0, limit);

    return [...new Set(keywords)];
  }

  // Classify text intent
  static classifyIntent(
    text: string
  ): {
    intent: string;
    confidence: number;
  } {
    const lowerText = text.toLowerCase();

    const intents = {
      greeting: ['hello', 'hi', 'hey', 'good morning'],
      question: ['how', 'what', 'when', 'where', 'why', 'who', '?'],
      request: ['please', 'can you', 'would you', 'could you'],
      complaint: ['issue', 'problem', 'not working', 'broken', 'bug'],
      feedback: ['good', 'bad', 'like', 'dislike', 'opinion'],
    };

    let bestIntent = 'general';
    let maxScore = 0;

    Object.entries(intents).forEach(([intent, keywords]) => {
      const score = keywords.filter((keyword) => lowerText.includes(keyword))
        .length;
      if (score > maxScore) {
        maxScore = score;
        bestIntent = intent;
      }
    });

    const confidence = Math.min(maxScore / 3, 1);

    return { intent: bestIntent, confidence };
  }

  // Extract entities (simple version)
  static extractEntities(
    text: string
  ): {
    type: string;
    value: string;
  }[] {
    const entities: { type: string; value: string }[] = [];

    // Email regex
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
    const emails = text.match(emailRegex) || [];
    emails.forEach((email) => {
      entities.push({ type: 'email', value: email });
    });

    // Phone regex
    const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
    const phones = text.match(phoneRegex) || [];
    phones.forEach((phone) => {
      entities.push({ type: 'phone', value: phone });
    });

    return entities;
  }

  // Summarize text (simple)
  static summarizeText(text: string, sentenceCount: number = 2): string {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

    if (sentences.length <= sentenceCount) return text;

    // Score sentences by word frequency
    const words = text.toLowerCase().split(/\s+/);
    const wordFreq: Record<string, number> = {};

    words.forEach((word) => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    const scoredSentences = sentences.map((sentence) => {
      const sentenceWords = sentence.toLowerCase().split(/\s+/);
      const score = sentenceWords.reduce((sum, word) => sum + (wordFreq[word] || 0), 0);
      return { sentence: sentence.trim(), score };
    });

    const summary = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, sentenceCount)
      .map((s) => s.sentence)
      .join('. ');

    return summary + '.';
  }
}
