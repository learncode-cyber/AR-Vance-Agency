import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chat with Us',
  description: 'Ask a question about our SEO, marketing, web development or automation services.',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
