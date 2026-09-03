import { NextResponse } from 'next/server'
import { z } from 'zod'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'

const createOrderSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(5),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }),
  paymentMethod: z.enum(['stripe', 'paypal', 'bank_transfer']),
})

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = createOrderSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message },
      { status: 400 }
    )
  }

  try {
    const { customerName, customerEmail, customerPhone, shippingAddress, paymentMethod } = parsed.data

    // Get cart
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('cart_session_id')?.value

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 400 }
      )
    }

    const cart = await prisma.cart.findUniqueOrThrow({
      where: { sessionId },
      include: { items: { include: { product: true } } },
    })

    if (cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    // Create order
    const orderNumber = `ORD-${Date.now()}`
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const tax = subtotal * 0.1 // 10% tax
    const shipping = 50 // Fixed shipping
    const total = subtotal + tax + shipping

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress: JSON.stringify(shippingAddress),
        billingAddress: JSON.stringify(shippingAddress),
        subtotal,
        tax,
        shipping,
        total,
        paymentMethod,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            productName: item.product.name,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: true },
    })

    // Update product purchase count
    for (const item of cart.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { purchaseCount: { increment: item.quantity } },
      })
    }

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    })

    return NextResponse.json({ data: order }, { status: 201 })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
