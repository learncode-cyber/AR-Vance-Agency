import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Affiliate Sign-in',
  description: 'Sign in to your affiliate dashboard.',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
