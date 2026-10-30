import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Confirm Your Affiliate Email',
  description: 'Confirm your affiliate account.',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
