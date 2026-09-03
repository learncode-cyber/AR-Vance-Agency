import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  try {
    const project = await prisma.project.findUniqueOrThrow({
      where: { slug },
      include: { client: { select: { name: true } } },
    })

    return NextResponse.json({ data: project })
  } catch {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }
}
