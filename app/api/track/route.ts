import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  sessionId: z.string().min(8).max(100),
  eventType: z.enum(['form_start', 'field_focus', 'field_complete', 'form_submit', 'form_error']),
  fieldName: z.string().max(50).optional().default(''),
  page: z.string().max(300).optional().default(''),
})

/**
 * Fire-and-forget interaction logging for the Contact form — lets the
 * admin see funnel drop-off ("15 people focused the phone field but
 * never submitted") without recording any typed content. Never blocks
 * or breaks the form on failure.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 })

    await prisma.formEvent.create({ data: parsed.data })
    return NextResponse.json({ ok: true })
  } catch {
    // Tracking must never surface an error to the visitor
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
