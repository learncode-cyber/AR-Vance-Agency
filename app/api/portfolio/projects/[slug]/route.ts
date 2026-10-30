import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Public endpoint. Previously this returned ANY project by slug — including
// unpublished drafts — with internal fields (budget, clientId, team, PM, PDF…).
// Now: published only, and only the fields the public case-study page renders.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  try {
    const project = await prisma.project.findFirst({
      where: { slug, published: true },
      select: {
        id: true, slug: true, name: true, description: true, category: true, coverImage: true,
        gallery: true, beforeAfterGallery: true, technologies: true,
        roi: true, completionRate: true, clientSatisfaction: true, resultsHighlights: true, keyMetrics: true,
        challenge: true, solution: true, outcome: true,
        testimonial: true, testimonialAuthor: true, testimonialRole: true, testimonialImage: true,
        showMetrics: true, showTestimonial: true,
        seoTitle: true, seoDescription: true, publishedAt: true,
        client: { select: { name: true } },
      },
    })
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    return NextResponse.json({ data: project })
  } catch {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }
}
