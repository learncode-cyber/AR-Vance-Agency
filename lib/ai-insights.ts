import prisma from './prisma'

/**
 * Generate AI-powered insights using Claude API
 */
export async function generateInsights(
  metric: string,
  currentValue: number,
  previousValue: number
): Promise<string> {
  try {
    const changePercent = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0
    const direction = changePercent > 0 ? 'increased' : 'decreased'

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: `Analyze this business metric and provide a brief, actionable insight:
            
Metric: ${metric}
Current Value: ${currentValue}
Previous Value: ${previousValue}
Change: ${changePercent.toFixed(1)}% ${direction}

Provide a 2-3 sentence insight about what this means for the business and what action to take.`,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error('Claude API failed')
    }

    const data: any = await response.json()
    return data.content[0]?.text || 'Unable to generate insight'
  } catch (error) {
    console.error('Insight generation error:', error)
    return `The ${metric} ${changePercent > 0 ? 'increased' : 'decreased'} by ${Math.abs(changePercent).toFixed(1)}%`
  }
}

/**
 * Detect anomalies in metrics
 */
export function detectAnomalies(
  values: number[],
  threshold: number = 2.5
): { isAnomaly: boolean; deviation: number } {
  if (values.length < 3) {
    return { isAnomaly: false, deviation: 0 }
  }

  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance =
    values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length
  const stdDev = Math.sqrt(variance)

  const lastValue = values[values.length - 1]
  const deviation = Math.abs((lastValue - mean) / stdDev)
  const isAnomaly = deviation > threshold

  return { isAnomaly, deviation }
}

/**
 * Calculate churn risk for a customer
 */
export function calculateChurnRisk(
  daysInactive: number,
  orderFrequencyDecline: number,
  cartAbandonment: number,
  supportTickets: number
): number {
  let riskScore = 0

  // Inactivity (weight: 40%)
  if (daysInactive > 90) riskScore += 40
  else if (daysInactive > 60) riskScore += 30
  else if (daysInactive > 30) riskScore += 15

  // Order frequency decline (weight: 30%)
  if (orderFrequencyDecline > 0.7) riskScore += 30
  else if (orderFrequencyDecline > 0.5) riskScore += 20
  else if (orderFrequencyDecline > 0.3) riskScore += 10

  // Cart abandonment (weight: 20%)
  if (cartAbandonment > 5) riskScore += 20
  else if (cartAbandonment > 3) riskScore += 15
  else if (cartAbandonment > 1) riskScore += 10

  // Support tickets (weight: 10%)
  if (supportTickets > 5) riskScore += 10
  else if (supportTickets > 3) riskScore += 5

  return Math.min(riskScore, 100)
}

/**
 * Generate product recommendations using collaborative filtering
 */
export async function generateRecommendations(
  userEmail: string,
  viewedProducts: string[],
  purchasedProducts: string[],
  limit: number = 5
): Promise<any[]> {
  try {
    // Find users with similar purchase history
    const similarUsers = await prisma.customerBehavior.findMany({
      where: {
        NOT: { userEmail },
      },
      orderBy: { totalSpent: 'desc' },
      take: 100,
    })

    // Get products purchased by similar users
    // This is simplified - in production, use a proper recommendation engine
    const recommendations = viewedProducts.slice(0, limit).map((productId, index) => ({
      productId,
      reason: 'similar_to_viewed',
      score: 85 - index * 10,
    }))

    return recommendations
  } catch (error) {
    console.error('Recommendation error:', error)
    return []
  }
}

/**
 * Forecast metric values using simple trend analysis
 */
export function forecastMetric(
  historicalValues: number[],
  periods: number = 7
): number[] {
  if (historicalValues.length < 2) return []

  const predictions: number[] = []
  const trend = (historicalValues[historicalValues.length - 1] - historicalValues[0]) / historicalValues.length

  let lastValue = historicalValues[historicalValues.length - 1]

  for (let i = 0; i < periods; i++) {
    lastValue = lastValue + trend
    predictions.push(Math.max(0, lastValue))
  }

  return predictions
}
