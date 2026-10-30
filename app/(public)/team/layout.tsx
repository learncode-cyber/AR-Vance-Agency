import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Our Team',
  description: 'Meet the specialists behind AR Vance Agency: SEO, paid media, analytics, web development and AI automation.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
