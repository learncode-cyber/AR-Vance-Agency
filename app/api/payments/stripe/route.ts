import { NextResponse } from 'next/server'

// DISABLED on purpose (security).
//
// The previous version of this route was a fake payment flow that anyone on the
// internet could abuse without logging in:
//   1. POST {orderId, amount: 0, email} returned a made-up `paymentIntentId`
//   2. PATCH {paymentIntentId} then marked that order's paymentStatus "completed"
// i.e. any order could be flagged as PAID for free. It also copied
// STRIPE_SECRET_KEY into the database in plaintext.
//
// No page in the site calls it. Real Stripe payments must be confirmed only by the
// signature-verified webhook (POST /api/webhooks/stripe) after a genuine
// PaymentIntent/Checkout Session is created server-side with the amount taken from
// the order in the database — never from the client.
const disabled = () =>
  NextResponse.json({ error: 'Online card payment is not enabled on this site.' }, { status: 501 })

export async function POST() {
  return disabled()
}

export async function PATCH() {
  return disabled()
}
