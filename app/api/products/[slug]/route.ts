import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    const product = await prisma.product.findUniqueOrThrow({
      where: { slug: params.slug },
      include: {
        category: true,
        reviews: {
          where: { approved: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    // Increment view count
    await prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    })

    return NextResponse.json({ data: product })
  } catch (error) {
    console.error('Product fetch error:', error)
    return NextResponse.json(
      { error: 'Product not found' },
      { status: 404 }
    )
  }
}
