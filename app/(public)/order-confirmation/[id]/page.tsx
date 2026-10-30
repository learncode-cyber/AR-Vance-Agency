import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

// Checkout redirects here after an order is created, but this page did not exist,
// so every customer landed on a 404 right after ordering.
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Order confirmation', robots: { index: false, follow: false } }

const money = (n: number) => `$${n.toFixed(2)}`

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(id)) notFound()

  // Only what the customer needs; address/phone/email are not shown on this unauthenticated page.
  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      orderNumber: true, status: true, paymentStatus: true, paymentMethod: true,
      subtotal: true, tax: true, shipping: true, discount: true, total: true, createdAt: true,
      items: { select: { id: true, productName: true, quantity: true, price: true } },
    },
  })
  if (!order) notFound()

  const paid = order.paymentStatus === 'completed' || order.paymentStatus === 'succeeded'

  return (
    <main className="section-py">
      <div className="container max-w-2xl">
        <h1 className="page-banner-title">Thank you — order received</h1>
        <div className="admin-card" style={{ marginTop: '2rem' }}>
          <p>
            Order number: <strong>{order.orderNumber}</strong>
            <br />
            Placed: {order.createdAt.toLocaleString('en-GB', { timeZone: 'UTC' })} UTC
          </p>
          <p style={{ margin: '1rem 0' }}>
            {paid
              ? 'Payment received. We will process your order shortly.'
              : 'Payment is pending. Our team will contact you with payment instructions for your chosen method.'}
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {order.items.map((i) => (
                <tr key={i.id}>
                  <td style={{ padding: '.4rem 0' }}>{i.productName} × {i.quantity}</td>
                  <td style={{ textAlign: 'right' }}>{money(i.price * i.quantity)}</td>
                </tr>
              ))}
              <tr><td style={{ paddingTop: '.8rem' }}>Subtotal</td><td style={{ textAlign: 'right', paddingTop: '.8rem' }}>{money(order.subtotal)}</td></tr>
              {order.discount > 0 && <tr><td>Discount</td><td style={{ textAlign: 'right' }}>−{money(order.discount)}</td></tr>}
              <tr><td>Shipping</td><td style={{ textAlign: 'right' }}>{money(order.shipping)}</td></tr>
              <tr><td>Tax</td><td style={{ textAlign: 'right' }}>{money(order.tax)}</td></tr>
              <tr><td><strong>Total</strong></td><td style={{ textAlign: 'right' }}><strong>{money(order.total)}</strong></td></tr>
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: '1.5rem' }}>
          <Link href="/shop" className="btn btn-primary">Continue shopping</Link>
        </p>
      </div>
    </main>
  )
}
