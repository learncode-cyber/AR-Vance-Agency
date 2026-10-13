import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { hasPermission, logActivity } from '@/lib/rbac'

// Mirrors the real `TeamMember` columns and the admin form
// (the old schema required `position`/`department`, which the model and the
// form don't have, so every create returned 400 or a Prisma error).
const optionalStr = (max: number) => z.string().max(max).optional()

const createTeamMemberSchema = z.object({
  slug: z.string().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers and hyphens'),
  email: z.string().email(),
  name: z.string().min(2).max(120),
  role: z.string().min(1).max(120),
  bio: z.string().min(1),
  shortBio: optionalStr(300),
  avatar: optionalStr(500),
  coverImage: optionalStr(500),
  emoji: optionalStr(8),
  specialization: optionalStr(200),
  experience: optionalStr(200),
  skills: z.array(z.string().max(80)).max(50).optional(),
  achievements: z.string().optional(),
  linkedin: optionalStr(300),
  twitter: optionalStr(300),
  website: optionalStr(300),
  phone: optionalStr(40),
  order: z.number().int().optional(),
  active: z.boolean().optional(),
  featured: z.boolean().optional(),
  canEditProfile: z.boolean().optional(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const published = new URL(req.url).searchParams.get('published')
  const where = published === 'true' ? { active: true } : {}

  try {
    const members = await prisma.teamMember.findMany({ where, orderBy: { order: 'asc' } })
    return NextResponse.json({ data: members })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  if (!(await hasPermission(session.userId, 'manage_content'))) {
    return NextResponse.json({ error: 'Access Denied' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const parsed = createTeamMemberSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid data' }, { status: 400 })
  }

  // Drop empty-string optionals so DB defaults apply.
  const data = Object.fromEntries(
    Object.entries(parsed.data).filter(([, v]) => v !== undefined && v !== '')
  ) as typeof parsed.data

  try {
    const member = await prisma.teamMember.create({ data: { ...data, skills: data.skills ?? [] } })
    await logActivity(session.userId, 'team_member_created', 'team', member.id, member.name)
    return NextResponse.json({ data: member }, { status: 201 })
  } catch (error) {
    if ((error as { code?: string })?.code === 'P2002') {
      return NextResponse.json({ error: 'A team member with this email or slug already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 })
  }
}
