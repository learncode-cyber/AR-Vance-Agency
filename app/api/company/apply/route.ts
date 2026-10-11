import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'

const applicationSchema = z.object({
  companyLegalName: z.string().min(2).max(255),
  registrationNumber: z.string().min(1).max(100),
  websiteUrl: z.string().max(300).optional(),
  authorizedRepName: z.string().min(2).max(100),
  contactEmail: z.string().email().max(200),
  contactPhone: z.string().min(3).max(40),
})

// Public "company application" form.
// Before: validated, then only console.log'ed the data (incl. personal details)
// and returned a fake "APP-<timestamp>" id — submissions were silently lost.
// Now: saved as a CRM lead (source "company_application") so it shows in the
// admin Leads board, with a real id back to the visitor and no PII in logs.
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!(await rateLimit(ip, 'company-apply', 5, 60 * 60)).success) {
    return NextResponse.json({ error: 'Too many submissions. Please try again later.' }, { status: 429 })
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form submission' }, { status: 400 })
  }

  const field = (k: string) => form.get(k)?.toString().trim() || ''
  const parsed = applicationSchema.safeParse({
    companyLegalName: field('companyLegalName'),
    registrationNumber: field('registrationNumber'),
    websiteUrl: field('websiteUrl'),
    authorizedRepName: field('authorizedRepName'),
    contactEmail: field('contactEmail'),
    contactPhone: field('contactPhone'),
  })
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid form data', details: parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })) }, { status: 400 })
  }
  const d = parsed.data
  const idFile = form.get('idFile')
  const fileNote = idFile instanceof File && idFile.size > 0 ? `${idFile.name} (${idFile.size} bytes) — NOT stored, request it from the applicant` : 'none'

  try {
    const lead = await prisma.lead.create({
      data: {
        name: d.authorizedRepName,
        email: d.contactEmail,
        phone: d.contactPhone,
        company: d.companyLegalName,
        subject: 'Company application',
        service: 'automation-services',
        message: `Registration number: ${d.registrationNumber}\nWebsite: ${d.websiteUrl || '—'}\nID document: ${fileNote}`,
        source: 'company_application',
        stage: 'new',
      },
      select: { id: true },
    })
    return NextResponse.json({ success: true, message: 'Application submitted successfully', applicationId: lead.id })
  } catch (error) {
    console.error('[company-apply] failed to save application:', (error as Error).name)
    return NextResponse.json({ error: 'Failed to process application' }, { status: 500 })
  }
}
