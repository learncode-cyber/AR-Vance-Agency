import { getSettings } from '@/lib/settings'
import { getActiveServices } from '@/lib/data'

export const revalidate = 3600

export async function GET() {
  const [settings, services] = await Promise.all([getSettings(), getActiveServices()])

  const body = `# ${settings.siteName}

> ${settings.tagline}

${settings.siteDescription}

## Services
${services.map(s => `- ${s.title}: ${s.shortDesc}`).join('\n')}

## Contact
- Email: ${settings.contactEmail}
${settings.contactPhone ? `- Phone: ${settings.contactPhone}` : ''}
${settings.address ? `- Location: ${settings.address}` : ''}

## Pages
- Homepage: /
- Services: /services
- Portfolio (case studies): /portfolio
- About: /about
- Blog (guides & insights): /blog
- Contact: /contact
`

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
