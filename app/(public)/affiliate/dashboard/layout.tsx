import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Affiliate Dashboard',
  description: 'Your referral link and commission history.',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
