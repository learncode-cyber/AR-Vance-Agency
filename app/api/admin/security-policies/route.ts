import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const updatePolicySchema = z.object({
  minLength: z.number().optional(),
  requireUppercase: z.boolean().optional(),
  requireLowercase: z.boolean().optional(),
  requireNumbers: z.boolean().optional(),
  requireSpecial: z.boolean().optional(),
  expiryDays: z.number().optional(),
  sessionTimeout: z.number().optional(),
  twoFactorRequired: z.boolean().optional(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  try {
    let policy = await prisma.securityPolicy.findFirst()

    if (!policy) {
      policy = await prisma.securityPolicy.create({
        data: {
          name: 'Default Security Policy',
        },
      })
    }

    return NextResponse.json({ data: policy })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch security policy' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = updatePolicySchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    let policy = await prisma.securityPolicy.findFirst()

    if (!policy) {
      policy = await prisma.securityPolicy.create({
        data: {
          name: 'Default Security Policy',
          ...parsed.data,
        },
      })
    } else {
      policy = await prisma.securityPolicy.update({
        where: { id: policy.id },
        data: parsed.data,
      })
    }

    return NextResponse.json({ data: policy })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update security policy' }, { status: 500 })
  }
}
