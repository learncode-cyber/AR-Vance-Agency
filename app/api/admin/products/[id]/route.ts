import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  price: z.number().min(0).optional(),
  comparePrice: z.number().min(0).optional(),
  cost: z.number().min(0).optional(),
  stock: z.number().min(0).optional(),
  isFeatured: z.boolean().optional(),
  active: z.boolean().optional(),
  published: z.boolean().optional(),
})

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  try {
    const product = await prisma.product.findUniqueOrThrow({
      where: { id: params.id },
      include: { category: true, reviews: true },
    })

    return NextResponse.json({ data: product })
  } catch (error) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = updateProductSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message },
      { status: 400 }
    )
  }

  try {
    const product = await prisma.product.update({
      where: { id: params.id },
      data: parsed.data,
      include: { category: true },
    })

    return NextResponse.json({ data: product })
  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  try {
    await prisma.product.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Product deleted' })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
