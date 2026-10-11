// lib/ai/validation/schemas.ts
/**
 * Zod Schemas for AI Output Validation
 * All AI responses must conform to these schemas
 */

import { z } from 'zod'

/**
 * Generic AI Response Schema
 */
export const AIResponseSchema = z.object({
  content: z.string().min(1, 'Content cannot be empty'),
  confidence: z.number().min(0).max(1).optional(),
  reasoning: z.string().optional(),
  timestamp: z.date().optional(),
})

/**
 * Lead Intelligence Output Schema
 */
export const LeadIntelligenceSchema = z.object({
  company: z.string(),
  industry: z.string(),
  website: z.string().url().optional(),
  description: z.string(),
  targetAudience: z.string(),
  painPoints: z.array(z.string()).min(1),
  opportunityAreas: z.array(z.string()).min(1),
  leadScore: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1),
  evidence: z.array(z.string()),
})

/**
 * Business Audit Output Schema
 */
export const BusinessAuditSchema = z.object({
  category: z.enum(['website', 'seo', 'marketing', 'business']),
  problems: z.array(
    z.object({
      issue: z.string(),
      impact: z.enum(['critical', 'high', 'medium', 'low']),
      priority: z.number().min(1).max(5),
      recommendation: z.string(),
      expectedOutcome: z.string(),
      confidence: z.number().min(0).max(1),
      evidence: z.array(z.string()),
    })
  ),
})

/**
 * Content Generation Schema
 */
export const ContentGenerationSchema = z.object({
  type: z.enum(['blog', 'social', 'email', 'landing_page', 'ad_copy']),
  content: z.string().min(10, 'Content too short'),
  title: z.string().optional(),
  seoKeywords: z.array(z.string()).optional(),
  tone: z.enum(['professional', 'casual', 'persuasive', 'educational']),
  wordCount: z.number().min(10),
  callToAction: z.string().optional(),
})

/**
 * SEO Optimization Schema
 */
export const SEOOptimizationSchema = z.object({
  currentScore: z.number().min(0).max(100),
  targetScore: z.number().min(0).max(100),
  issues: z.array(
    z.object({
      type: z.enum(['technical', 'content', 'structure', 'performance']),
      issue: z.string(),
      impact: z.enum(['critical', 'high', 'medium', 'low']),
      solution: z.string(),
      priority: z.number().min(1).max(5),
    })
  ),
  improvements: z.array(
    z.object({
      area: z.string(),
      change: z.string(),
      expectedImprovement: z.string(),
    })
  ),
})

/**
 * Decision Schema with reasoning
 */
export const DecisionSchema = z.object({
  decision: z.string(),
  reasoning: z.string(),
  alternatives: z.array(
    z.object({
      option: z.string(),
      pros: z.array(z.string()),
      cons: z.array(z.string()),
      score: z.number().min(0).max(10),
    })
  ),
  confidence: z.number().min(0).max(1),
  nextSteps: z.array(z.string()),
  risks: z.array(z.string()).optional(),
})

/**
 * Proposal Schema
 */
export const ProposalSchema = z.object({
  title: z.string(),
  summary: z.string(),
  problem: z.string(),
  solution: z.string(),
  deliverables: z.array(z.string()).min(1),
  timeline: z.object({
    startDate: z.string(),
    endDate: z.string(),
    phases: z.array(
      z.object({
        name: z.string(),
        duration: z.string(),
        deliverables: z.array(z.string()),
      })
    ),
  }),
  pricing: z.object({
    amount: z.number().min(0),
    currency: z.string().default('USD'),
    paymentTerms: z.string(),
  }),
  successMetrics: z.array(z.string()),
})

/**
 * Email Generation Schema
 */
export const EmailSchema = z.object({
  subject: z.string().max(100, 'Subject too long'),
  to: z.string().email(),
  body: z.string().min(50, 'Email body too short'),
  htmlBody: z.string().optional(),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
  attachments: z.array(z.string()).optional(),
  sendAt: z.date().optional(),
})

/**
 * Social Media Post Schema
 */
export const SocialMediaPostSchema = z.object({
  platform: z.enum(['linkedin', 'facebook', 'twitter', 'instagram']),
  content: z.string().max(3000),
  hashtags: z.array(z.string()),
  mentions: z.array(z.string()).optional(),
  imageUrl: z.string().url().optional(),
  scheduledFor: z.date().optional(),
  engagementGoal: z.string().optional(),
})

/**
 * Analytics Report Schema
 */
export const AnalyticsReportSchema = z.object({
  period: z.object({
    startDate: z.string(),
    endDate: z.string(),
  }),
  metrics: z.object({
    pageViews: z.number(),
    uniqueVisitors: z.number(),
    bounceRate: z.number(),
    avgSessionDuration: z.number(),
    conversionRate: z.number(),
  }),
  topPages: z.array(
    z.object({
      page: z.string(),
      views: z.number(),
      conversions: z.number(),
    })
  ),
  trends: z.array(z.string()),
  recommendations: z.array(z.string()),
})

// Export type helpers
export type LeadIntelligence = z.infer<typeof LeadIntelligenceSchema>
export type BusinessAudit = z.infer<typeof BusinessAuditSchema>
export type ContentGeneration = z.infer<typeof ContentGenerationSchema>
export type SEOOptimization = z.infer<typeof SEOOptimizationSchema>
export type Decision = z.infer<typeof DecisionSchema>
export type Proposal = z.infer<typeof ProposalSchema>
export type Email = z.infer<typeof EmailSchema>
export type SocialMediaPost = z.infer<typeof SocialMediaPostSchema>
export type AnalyticsReport = z.infer<typeof AnalyticsReportSchema>
