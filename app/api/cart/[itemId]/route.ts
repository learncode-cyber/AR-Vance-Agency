import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const CART_COOKIE = 'cart_session_id'
const updateSchema = z.object({
  quantity: z.number().int().min(1).max(999).optional(),
})

// SECURITY: these handlers used to update/delete ANY cart item by id, so one
// visitor could change or empty another visitor's cart. Now the item must belong
// to the cart of the caller's own session cookie; otherwise 404 (not 403, so item
// ids can't be probed).
async function findOwnedItem(itemId: string) {
  const sessionId = (await cookies()).get(CART_COOKIE)?.value
  if (!sessionId) return null
  return prisma.cartItem.findFirst({ where: { id: itemId, cart: { sessionId } }, select: { id: true } })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params
  const parsed = updateSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid data' }, { status: 400 })
  }

  try {
    if (!(await findOwnedItem(itemId))) return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
    const cartItem = await prisma.cartItem.update({ where: { id: itemId }, data: parsed.data, include: { product: true } })
    return NextResponse.json({ data: cartItem })
  } catch (error) {
    console.error('Update cart item error:', error)
    return NextResponse.json({ error: 'Failed to update cart item' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params
  try {
    if (!(await findOwnedItem(itemId))) return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
    await prisma.cartItem.delete({ where: { id: itemId } })
    return NextResponse.json({ message: 'Item removed' })
  } catch (error) {
    console.error('Delete cart item error:', error)
    return NextResponse.json({ error: 'Failed to delete cart item' }, { status: 500 })
  }
}
