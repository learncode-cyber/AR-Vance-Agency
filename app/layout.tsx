import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { getSettings } from '@/lib/settings'

// PRIMARY: Roboto (Body + Headings)
const roboto = localFont({
  src: [
    { path: '../public/fonts/Roboto-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../public/fonts/Roboto-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: '../public/fonts/Roboto-Bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-body',
  display: 'swap',
})

// SECONDARY: JetBrains Mono (Code/Technical content)
const jetBrainsMono = localFont({
  src: [
    { path: '../public/fonts/JetBrainsMono-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../public/fonts/JetBrainsMono-Bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-mono',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings()
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    title: { default: s.seoDefaultTitle || s.siteName, template: s.seoTitleTemplate || `%s | ${s.siteName}` },
    description: s.seoDefaultDesc || s.siteDescription,
    robots: { index: true, follow: true },
    openGraph: { type: 'website', siteName: s.siteName },
    twitter: { card: 'summary_large_image' },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings()

  // GA4 measurement ID can come from Settings (admin-editable) or env var fallback
  const GA_ID = s.ga4MeasurementId || process.env.NEXT_PUBLIC_GA_ID || ''
  const ADS_ID = s.googleAdsConversionId || ''
  const PIXEL_ID = s.metaPixelId || ''

  // gtag.js is shared by both GA4 and Google Ads — load it once if either is configured
  const needsGtag = Boolean(GA_ID || ADS_ID)

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: s.siteName,
    description: s.siteDescription,
    url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    email: s.contactEmail,
    ...(s.contactPhone && { telephone: s.contactPhone }),
    sameAs: [s.socialLinkedin, s.socialTwitter, s.socialFacebook, s.socialInstagram].filter(Boolean),
    ...(s.parentBrandName && s.parentBrandUrl && {
      parentOrganization: {
        '@type': 'Organization',
        name: s.parentBrandName,
        url: s.parentBrandUrl,
      },
      brand: {
        '@type': 'Brand',
        name: s.siteName,
        description: s.parentBrandRelationship,
      },
    }),
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent theme flash before hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('site-theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){}`,
          }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />

        {/* ── Google Analytics 4 + Google Ads (shared gtag.js loader) ── */}
        {needsGtag && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID || ADS_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  ${GA_ID  ? `gtag('config', '${GA_ID}');`  : ''}
                  ${ADS_ID ? `gtag('config', '${ADS_ID}');` : ''}
                `,
              }}
            />
          </>
        )}

        {/* ── Meta (Facebook/Instagram) Pixel ── */}
        {PIXEL_ID && (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
                  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
                  document,'script','https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '${PIXEL_ID}');
                  fbq('track', 'PageView');
                `,
              }}
            />
            <noscript>
              <img
                height="1" width="1" alt=""
                style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
              />
            </noscript>
          </>
        )}
      </head>
      <body className={`${roboto.variable} ${jetBrainsMono.variable}`}>
        {children}
      </body>
    </html>
  )
}
