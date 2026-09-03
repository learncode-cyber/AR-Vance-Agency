import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import prisma from '@/lib/prisma'

const CART_COOKIE = 'cart_session_id'

async function getOrCreateCart() {
  const cookieStore = await cookies()
  let sessionId = cookieStore.get(CART_COOKIE)?.value

  if (!sessionId) {
    const newCart = await prisma.cart.create({
      data: { sessionId: require('crypto').randomUUID() },
    })
    sessionId = newCart.sessionId
    cookieStore.set(CART_COOKIE, sessionId, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })
  }

  return sessionId
}

export async function GET() {
  try {
    const sessionId = await getOrCreateCart()

    const cart = await prisma.cart.findUniqueOrThrow({
      where: { sessionId },
      include: {
        items: {
          include: { product: true },
        },
      },
    })

    return NextResponse.json({ data: cart })
  } catch (error) {
    console.error('Cart fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

const addToCartSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1).max(999),
})

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = addToCartSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message },
      { status: 400 }
    )
  }

  try {
    const { productId, quantity } = parsed.data
    const sessionId = await getOrCreateCart()

    // Get product
    const product = await prisma.product.findUniqueOrThrow({
      where: { id: productId },
    })

    // Check stock
    if (product.stock < quantity) {
      return NextResponse.json(
        { error: 'Not enough stock' },
        { status: 400 }
      )
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: (await prisma.cart.findUniqueOrThrow({ where: { sessionId } })).id, productId },
    })

    let cartItem

    if (existingItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: { increment: quantity } },
        include: { product: true },
      })
    } else {
      const cart = await prisma.cart.findUniqueOrThrow({ where: { sessionId } })
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          price: product.price,
        },
        include: { product: true },
      })
    }

    return NextResponse.json({ data: cartItem }, { status: 201 })
  } catch (error) {
    console.error('Add to cart error:', error)
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    )
  }
}
