import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const updateLocalizationSchema = z.object({
  defaultLanguage: z.string().optional(),
  supportedLanguages: z.array(z.string()).optional(),
  detectBrowser: z.boolean().optional(),
  fallbackLanguage: z.string().optional(),
  translationService: z.string().optional(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  try {
    let config = await prisma.localizationConfig.findFirst()

    if (!config) {
      config = await prisma.localizationConfig.create({
        data: {
          defaultLanguage: 'en',
        },
      })
    }

    return NextResponse.json({ data: config })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch localization config' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = updateLocalizationSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    let config = await prisma.localizationConfig.findFirst()

    if (!config) {
      config = await prisma.localizationConfig.create({
        data: {
          defaultLanguage: 'en',
        },
      })
    }

    const updated = await prisma.localizationConfig.update({
      where: { id: config.id },
      data: {
        defaultLanguage: parsed.data.defaultLanguage || config.defaultLanguage,
        supportedLanguages: JSON.stringify(parsed.data.supportedLanguages || JSON.parse(config.supportedLanguages)),
        detectBrowser: parsed.data.detectBrowser !== undefined ? parsed.data.detectBrowser : config.detectBrowser,
        fallbackLanguage: parsed.data.fallbackLanguage || config.fallbackLanguage,
        translationService: parsed.data.translationService || config.translationService,
      },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update localization config' }, { status: 500 })
  }
}
