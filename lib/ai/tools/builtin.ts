import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { registerTool, getTool } from './registry'

// Read-only, bounded, field-limited tools. No raw SQL, no writes, no email send.
// (Write tools — e.g. send email, change stage — need the L3 approval flow and
// are intentionally NOT registered here.)

const STAGES = ['new', 'qualifying', 'proposal_sent', 'won', 'lost'] as const

export function registerBuiltinTools(): void {
  if (getTool('crm.search_leads')) return

  registerTool({
    name: 'crm.search_leads',
    description: 'Search CRM leads by stage and/or text (name, company, subject). Returns at most 20, no contact details beyond email domain.',
    permission: 'manage_crm',
    timeoutMs: 8000,
    readOnly: true,
    inputSchema: z.object({
      stage: z.enum(STAGES).optional(),
      query: z.string().max(100).optional(),
      limit: z.number().int().min(1).max(20).default(10),
    }),
    outputSchema: z.object({
      leads: z.array(z.object({ id: z.string(), name: z.string(), company: z.string(), subject: z.string(), stage: z.string(), service: z.string(), valueEstimate: z.number().nullable(), createdAt: z.date() })),
    }),
    handler: async ({ stage, query, limit }) => ({
      leads: await prisma.lead.findMany({
        where: {
          ...(stage ? { stage } : {}),
          ...(query ? { OR: [{ name: { contains: query } }, { company: { contains: query } }, { subject: { contains: query } }] } : {}),
        },
        select: { id: true, name: true, company: true, subject: true, stage: true, service: true, valueEstimate: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
    }),
  })

  registerTool({
    name: 'crm.lead_stats',
    description: 'Lead counts per pipeline stage and total estimated value of open leads.',
    permission: 'manage_crm',
    timeoutMs: 8000,
    readOnly: true,
    inputSchema: z.object({}),
    outputSchema: z.object({ byStage: z.record(z.number()), openValue: z.number() }),
    handler: async () => {
      const [groups, open] = await Promise.all([
        prisma.lead.groupBy({ by: ['stage'], _count: { _all: true } }),
        prisma.lead.aggregate({ where: { stage: { notIn: ['won', 'lost'] } }, _sum: { valueEstimate: true } }),
      ])
      return { byStage: Object.fromEntries(groups.map((g) => [g.stage, g._count._all])), openValue: open._sum.valueEstimate ?? 0 }
    },
  })

  registerTool({
    name: 'content.list_posts',
    description: 'List recent published blog posts (title, slug, category, date).',
    permission: 'manage_content',
    timeoutMs: 8000,
    readOnly: true,
    inputSchema: z.object({ limit: z.number().int().min(1).max(30).default(10) }),
    outputSchema: z.object({ posts: z.array(z.object({ title: z.string(), slug: z.string(), category: z.string(), publishedAt: z.date() })) }),
    handler: async ({ limit }) => ({
      posts: await prisma.blogPost.findMany({
        where: { active: true },
        select: { title: true, slug: true, category: true, publishedAt: true },
        orderBy: { publishedAt: 'desc' },
        take: limit,
      }),
    }),
  })

  registerTool({
    name: 'services.list',
    description: 'List active agency services (title, slug, short description).',
    permission: 'manage_content',
    timeoutMs: 8000,
    readOnly: true,
    inputSchema: z.object({}),
    outputSchema: z.object({ services: z.array(z.object({ title: z.string(), slug: z.string(), shortDesc: z.string() })) }),
    handler: async () => ({
      services: await prisma.service.findMany({ where: { active: true }, select: { title: true, slug: true, shortDesc: true }, orderBy: { order: 'asc' }, take: 50 }),
    }),
  })

  registerTool({
    name: 'analytics.lead_trend',
    description: 'Number of leads created per day over the last N days (max 90).',
    permission: 'view_analytics',
    timeoutMs: 10000,
    readOnly: true,
    inputSchema: z.object({ days: z.number().int().min(1).max(90).default(30) }),
    outputSchema: z.object({ days: z.number(), total: z.number(), perDay: z.record(z.number()) }),
    handler: async ({ days }) => {
      const since = new Date(Date.now() - days * 86_400_000)
      const rows = await prisma.lead.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true }, take: 5000 })
      const perDay: Record<string, number> = {}
      for (const r of rows) { const k = r.createdAt.toISOString().slice(0, 10); perDay[k] = (perDay[k] ?? 0) + 1 }
      return { days, total: rows.length, perDay }
    },
  })
}
