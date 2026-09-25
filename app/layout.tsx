import type { Metadata } from 'next';
import { ThemeProvider } from '@/lib/theme-context';
import { AgentsChat } from '@/components/AgentsChat';
import './globals.css';

export const metadata: Metadata = {
  title: 'AR Vance Agency OS',
  description: 'Premium Digital Agency Platform with AI Agents',
  keywords: ['agency', 'automation', 'ai', 'crm', 'marketing'],
  authors: [{ name: 'AR Vance Agency' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#1a3a52" />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <AgentsChat />
        </ThemeProvider>
      </body>
    </html>
  );
}
