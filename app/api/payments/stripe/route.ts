import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'

const createPaymentSchema = z.object({
  orderId: z.string(),
  amount: z.number().min(0),
  email: z.string().email(),
})

/**
 * Create Stripe payment intent
 * NOTE: Requires @stripe/stripe-js package
 */
export async function POST(req: Request) {
  const body = await req.json()
  const parsed = createPaymentSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message },
      { status: 400 }
    )
  }

  try {
    const { orderId, amount, email } = parsed.data

    // Get order
    const order = await prisma.order.findUniqueOrThrow({
      where: { id: orderId },
    })

    // Get or create payment gateway
    let gateway = await prisma.paymentGateway.findFirst({
      where: { type: 'stripe' },
    })

    if (!gateway) {
      gateway = await prisma.paymentGateway.create({
        data: {
          name: 'Stripe',
          type: 'stripe',
          apiKey: process.env.STRIPE_PUBLIC_KEY || '',
          secretKey: process.env.STRIPE_SECRET_KEY || '',
          testMode: true,
        },
      })
    }

    // Create transaction record
    const transaction = await prisma.paymentTransaction.create({
      data: {
        orderId,
        gatewayId: gateway.id,
        externalId: `stripe_${Date.now()}`,
        amount,
        currency: 'USD',
        status: 'pending',
        paymentMethod: 'card',
      },
    })

    // Return client secret (in production, integrate with actual Stripe API)
    return NextResponse.json({
      data: {
        clientSecret: `pi_${transaction.id}`,
        paymentIntentId: transaction.externalId,
        amount,
        email,
      },
    })
  } catch (error) {
    console.error('Stripe payment error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}

/**
 * Confirm payment
 */
export async function PATCH(req: Request) {
  const { paymentIntentId, status } = await req.json()

  if (!paymentIntentId) {
    return NextResponse.json(
      { error: 'Payment intent ID required' },
      { status: 400 }
    )
  }

  try {
    // Get transaction
    const transaction = await prisma.paymentTransaction.findUniqueOrThrow({
      where: { externalId: paymentIntentId },
    })

    // Update transaction
    await prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: { status: status || 'succeeded' },
    })

    // Update order
    await prisma.order.update({
      where: { id: transaction.orderId },
      data: { paymentStatus: 'completed' },
    })

    return NextResponse.json({
      data: {
        status: 'succeeded',
        orderId: transaction.orderId,
      },
    })
  } catch (error) {
    console.error('Payment confirmation error:', error)
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    )
  }
}
