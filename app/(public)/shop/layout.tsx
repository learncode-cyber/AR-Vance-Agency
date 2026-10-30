import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Digital products and services from AR Vance Agency.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
