import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Book a Consultation',
  description: 'Book a free strategy consultation with AR Vance Agency. Choose a service and a time that suits you.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
