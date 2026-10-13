import { NextResponse } from 'next/server'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { fireServerSideConversions } from '@/lib/conversions'

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

    // Everything below must succeed or fail together: creating the order,
    // incrementing each product's purchase count, and clearing the cart
    // were previously three separate, sequential, non-transactional steps
    // (plus a per-item loop of individual product.update calls). A crash
    // partway through used to leave the order created but counts
    // un-updated and the cart un-cleared. Reading the cart inside the
    // transaction too avoids acting on stale data from a concurrent request.
    const order = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUniqueOrThrow({
        where: { sessionId },
        include: { items: { include: { product: true } } },
      })

      if (cart.items.length === 0) {
        throw new Error('EMPTY_CART')
      }

      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}` // random suffix: two orders in the same millisecond used to collide on the unique orderNumber
      const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const tax = subtotal * 0.1 // 10% tax
      const shipping = 50 // Fixed shipping
      const total = subtotal + tax + shipping

      const createdOrder = await tx.order.create({
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

      // Reserve stock atomically: the `stock >= quantity` condition is part of the UPDATE
      // itself, so two buyers racing for the last unit can't both succeed (previously stock
      // was never reduced at all, so the shop could oversell indefinitely). If any line is
      // short, the whole transaction — including the order row — rolls back.
      for (const item of cart.items) {
        const res = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity }, purchaseCount: { increment: item.quantity } },
        })
        if (res.count !== 1) throw new Error(`OUT_OF_STOCK:${item.product.name}`)
      }

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      })

      return createdOrder
    })

    // GA4 'purchase' — the master prompt's taxonomy explicitly calls for
    // this event; nothing fired it anywhere in the app before. No gclid/
    // fbp/fbc capture exists on checkout yet, so this is GA4-only for now
    // (same caveat as the booking flow's 'schedule' event).
    fireServerSideConversions({
      ga4EventName: 'purchase',
      recordId: order.id,
      ga4Params: { transaction_id: order.orderNumber, value: order.total, currency: 'USD' },
      conversionValue: order.total,
    }).catch(err => console.error('[orders] Conversion dispatch error:', err))

    return NextResponse.json({ data: order }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'EMPTY_CART') {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }
    if (error instanceof Error && error.message.startsWith('OUT_OF_STOCK:')) {
      return NextResponse.json({ error: `Sorry, "${error.message.slice('OUT_OF_STOCK:'.length)}" is no longer available in the requested quantity.` }, { status: 409 })
    }
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
