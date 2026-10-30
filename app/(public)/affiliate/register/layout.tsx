import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Affiliate Program',
  description: 'Join the AR Vance Affiliate Program and earn commission on every sale you refer.',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
