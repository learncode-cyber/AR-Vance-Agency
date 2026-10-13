import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { verifyStripeSignature } from '@/lib/stripe-webhook'

/**
 * Stripe webhook handler
 */
export async function POST(req: Request) {
  // SECURITY: previously this endpoint trusted any JSON body, so anyone could POST a
  // forged `payment_intent.succeeded` and mark an order as paid. Now the Stripe
  // signature is verified over the RAW body, and with no secret configured the
  // endpoint refuses (fail closed) instead of accepting unsigned events.
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    console.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET is not set; rejecting webhook')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
  }
  const rawBody = await req.text()
  const sig = verifyStripeSignature(rawBody, req.headers.get('stripe-signature'), secret)
  if (!sig.ok) {
    console.warn('[stripe-webhook] signature rejected:', sig.reason)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    const event = JSON.parse(rawBody)

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object

        const transaction = await prisma.paymentTransaction.findFirst({
          where: { externalId: paymentIntent.id },
          include: { order: true },
        })

        // Stripe retries webhooks; only act (and email) once per payment.
        if (transaction && transaction.status !== 'succeeded') {
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
              // `charge.refunded` is a boolean in Stripe's API; the refunded amount (in cents) is `amount_refunded`.
              amount: (Number(charge.amount_refunded) || 0) / 100,
              reason: 'Customer requested refund',
              status: 'completed',
              refundId: charge.refunds?.data?.[0]?.id || '',
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
