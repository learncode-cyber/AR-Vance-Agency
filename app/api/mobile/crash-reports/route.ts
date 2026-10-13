import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'

const crashReportSchema = z.object({
  deviceId: z.string(),
  appVersion: z.string(),
  osVersion: z.string(),
  errorMessage: z.string(),
  stackTrace: z.string().optional().default(''),
  userEmail: z.string().email().optional(),
  lastScreen: z.string().optional(),
})

export async function POST(req: Request) {
  const __ip = ((req)?.headers?.get?.('x-forwarded-for') || 'unknown').split(',')[0].trim()
  if (!(await rateLimit(__ip, 'mobile-api', 60, 60)).success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  const body = await req.json()
  const parsed = crashReportSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message },
      { status: 400 }
    )
  }

  try {
    const crashReport = await prisma.crashReport.create({
      data: parsed.data,
    })

    // Log crash for monitoring
    console.error(`CRASH REPORT: ${parsed.data.errorMessage} on ${parsed.data.osVersion}`)

    return NextResponse.json({
      data: {
        crashId: crashReport.id,
        reported: true,
      },
    })
  } catch (error) {
    console.error('Crash report error:', error)
    return NextResponse.json(
      { error: 'Failed to report crash' },
      { status: 500 }
    )
  }
}
