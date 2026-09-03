import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { hasPermission, logActivity } from '@/lib/rbac'

const createTeamMemberSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  email: z.string().email(),
  position: z.string(),
  department: z.string().optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const published = url.searchParams.get('published')
  const department = url.searchParams.get('department')

  const where: any = {}
  if (published === 'true') where.published = true
  if (department) where.department = department

  try {
    const members = await prisma.teamMember.findMany({
      where,
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ data: members })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const hasAccess = await hasPermission(session.userId, 'manage_content')
  if (!hasAccess) {
    return NextResponse.json({ error: 'Access Denied' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = createTeamMemberSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    const member = await prisma.teamMember.create({
      data: {
        ...parsed.data,
        skills: JSON.stringify(parsed.data.skills || []),
      },
    })

    await logActivity(session.userId, 'team_member_created', 'team', member.id, member.name)

    return NextResponse.json({ data: member }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 })
  }
}
