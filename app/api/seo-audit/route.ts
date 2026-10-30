import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { sendContactEmail } from '@/lib/email'

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().default(''),
  website: z.string().trim().min(4).max(300).regex(/^(https?:\/\/)?[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i, 'Enter a valid website address'),
  company: z.string().trim().max(200).optional().default(''),
  goal: z.string().trim().max(500).optional().default(''),
  auditType: z.enum(['seo', 'marketing', 'business']).optional().default('seo'),
})

// Dedicated Free SEO Audit request: stored as a CRM lead (source "seo_audit") and sent to the team.
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!(await rateLimit(ip, 'seo-audit', 5, 60 * 60)).success) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid form' }, { status: 400 })
  const d = parsed.data
  const url = /^https?:\/\//i.test(d.website) ? d.website : `https://${d.website}`
  const label = { seo: 'Free SEO Audit', marketing: 'Free Marketing Audit', business: 'Free Business Audit' }[d.auditType]
  const message = `Audit: ${label}\nWebsite: ${url}\nGoal: ${d.goal || '—'}`
  try {
    const lead = await prisma.lead.create({
      data: {
        name: d.name, email: d.email, phone: d.phone, company: d.company,
        subject: `${label} request`, service: d.auditType + '-audit', message,
        source: 'seo_audit', stage: 'new',
      },
      select: { id: true },
    })
    sendContactEmail({ name: d.name, email: d.email, subject: `${label} request`, service: d.auditType + '-audit', message }).catch(() => {})
    return NextResponse.json({ success: true, requestId: lead.id, message: 'Thanks! We will send your SEO audit within 2 business days.' }, { status: 201 })
  } catch (error) {
    console.error('[seo-audit] save failed:', (error as Error).name)
    return NextResponse.json({ error: 'Could not submit your request. Please try again.' }, { status: 500 })
  }
}
