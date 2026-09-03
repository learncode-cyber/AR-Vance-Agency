import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const createProductSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().min(10),
  price: z.number().min(0),
  comparePrice: z.number().min(0).optional().default(0),
  cost: z.number().min(0).optional().default(0),
  stock: z.number().min(0).optional().default(0),
  sku: z.string().unique(),
  categoryId: z.string(),
  weight: z.number().optional().default(0),
  material: z.string().optional().default(''),
  color: z.string().optional().default(''),
  tags: z.string().optional().default(''),
  isFeatured: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
  published: z.boolean().optional().default(true),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const category = url.searchParams.get('category')
  const skip = (page - 1) * limit

  const where: any = {}
  if (category) {
    where.categoryId = category
  }

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      data: products,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Products fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = createProductSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message },
      { status: 400 }
    )
  }

  try {
    // Generate slug
    const slug = parsed.data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const product = await prisma.product.create({
      data: {
        ...parsed.data,
        slug,
      },
      include: { category: true },
    })

    return NextResponse.json({ data: product }, { status: 201 })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
