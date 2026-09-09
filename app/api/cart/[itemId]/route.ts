import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'

const updateSchema = z.object({
  quantity: z.number().min(1).max(999).optional(),
})

export async function PATCH(req: Request, { params }: { params: { itemId: string } }) {
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message },
      { status: 400 }
    )
  }

  try {
    const cartItem = await prisma.cartItem.update({
      where: { id: params.itemId },
      data: parsed.data,
      include: { product: true },
    })

    return NextResponse.json({ data: cartItem })
  } catch (error) {
    console.error('Update cart item error:', error)
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request, { params }: { params: { itemId: string } }) {
  try {
    await prisma.cartItem.delete({
      where: { id: params.itemId },
    })

    return NextResponse.json({ message: 'Item removed' })
  } catch (error) {
    console.error('Delete cart item error:', error)
    return NextResponse.json(
      { error: 'Failed to delete cart item' },
      { status: 500 }
    )
  }
}
