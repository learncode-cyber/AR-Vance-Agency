import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Case Studies & Portfolio',
  description: 'Selected client work from AR Vance Agency across SEO, paid media and web development.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
