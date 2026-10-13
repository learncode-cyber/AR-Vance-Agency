import type { Metadata } from 'next';
import { ThemeProvider } from '@/lib/theme-context';
import { AgentsChat } from '@/components/AgentsChat';
import { getSettings } from '@/lib/settings';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  // Previously a static object below, so the "SEO Title/Description" fields
  // editable in the admin settings panel had no effect anywhere — this was
  // the missing wire-up.
  const s = await getSettings();
  const template = s.seoTitleTemplate?.includes('%s')
    ? s.seoTitleTemplate.replace('%s', '%s') // Next's own template syntax also uses %s — pass through as-is
    : '%s | ' + s.siteName;

  return {
    title: {
      default: s.seoDefaultTitle || s.siteName,
      template,
    },
    description: s.seoDefaultDesc || s.siteDescription,
    keywords: ['agency', 'automation', 'ai', 'crm', 'marketing'],
    authors: [{ name: s.siteName }],
  };
}

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
