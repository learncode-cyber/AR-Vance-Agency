import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendOrderConfirmationEmail } from '@/lib/email'

/**
 * Stripe webhook handler
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const event = body

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object

        const transaction = await prisma.paymentTransaction.findFirst({
          where: { externalId: paymentIntent.id },
          include: { order: true },
        })

        if (transaction) {
          await prisma.paymentTransaction.update({
            where: { id: transaction.id },
            data: { status: 'succeeded' },
          })

          await prisma.order.update({
            where: { id: transaction.orderId },
            data: { paymentStatus: 'completed' },
          })

          // Send confirmation email
          await sendOrderConfirmationEmail(
            transaction.orderId,
            transaction.order.customerEmail,
            transaction.order.customerName,
            transaction.order.orderNumber
          )

          console.log('✅ Payment succeeded for order:', transaction.orderId)
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object

        const transaction = await prisma.paymentTransaction.findFirst({
          where: { externalId: paymentIntent.id },
        })

        if (transaction) {
          await prisma.paymentTransaction.update({
            where: { id: transaction.id },
            data: {
              status: 'failed',
              errorMessage: 'Payment failed',
            },
          })

          console.log('❌ Payment failed for order:', transaction.orderId)
        }
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object

        const transaction = await prisma.paymentTransaction.findFirst({
          where: { externalId: charge.payment_intent },
        })

        if (transaction) {
          await prisma.refund.create({
            data: {
              orderId: transaction.orderId,
              paymentTransactionId: transaction.id,
              amount: charge.refunded / 100,
              reason: 'Customer requested refund',
              status: 'completed',
              refundId: charge.refund?.id || '',
            },
          })

          console.log('💰 Refund processed for order:', transaction.orderId)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }
}
