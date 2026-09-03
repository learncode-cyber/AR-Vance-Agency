import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ── Settings (single row) ──
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      siteName: 'AR Vance Agency',
      tagline: 'Smart digital solutions for businesses worldwide.',
      siteDescription: 'AR Vance Agency delivers SEO, digital marketing, paid advertising, analytics, WordPress development and AI automation for global businesses.',
      founded: '2021',
      contactEmail: 'hello@arvance.agency',
      contactPhone: '+880 100-000-0000',
      address: 'Dhaka, Bangladesh',
      socialLinkedin: 'https://linkedin.com/company/arvance',
      socialTwitter: 'https://twitter.com/arvance',
      heroSubtitle: 'AR Vance Agency offers innovative web design, SEO, and digital marketing services for businesses in the USA, UAE, UK, Australia & beyond.',
      ctaSubtitle: "Let's build a strategy that transforms your business, engages your audience, and drives real measurable results.",
      seoDefaultTitle: 'AR Vance Agency — SEO, Digital Marketing & Web Development',
      seoDefaultDesc: 'Expert SEO, digital marketing, paid ads, analytics, WordPress development and AI automation. Serving clients in USA, UAE, UK, Australia & 15+ countries.',
    },
  })

  // ── Stats ──
  const stats = [
    { value: '200+', label: 'Clients Worldwide' },
    { value: '4+',   label: 'Years Experience' },
    { value: '98%',  label: 'Client Satisfaction' },
    { value: '15+',  label: 'Countries Served' },
  ]
  for (const [i, s] of stats.entries()) {
    await prisma.stat.upsert({ where: { id: `stat-${i}` }, update: s, create: { id: `stat-${i}`, ...s, order: i } })
  }

  // ── Admin user ──
  const passwordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!', 10)
  await prisma.user.upsert({
    where: { email: 'admin@arvance.agency' },
    update: {},
    create: { email: 'admin@arvance.agency', passwordHash, fullName: 'Admin', role: 'admin' },
  })

  // ── Services ──
  const services = [
    { slug: 'search-engine-optimization', emoji: '🔍', title: 'Search Engine Optimization', shortDesc: 'Data-driven SEO strategies that boost your organic rankings and drive sustainable global traffic.', longDesc: 'We build sustainable organic growth engines — from technical audits to content strategy and link building — that keep your site ranking for the long term.', features: ['Full technical SEO audit','Keyword research & strategy','On-page optimisation','Content planning & creation','Link building & outreach','Monthly performance reporting'], order: 1 },
    { slug: 'digital-marketing-strategy', emoji: '📣', title: 'Digital Marketing Strategy', shortDesc: 'Comprehensive cross-channel marketing plans that build brand authority and drive measurable growth.', longDesc: 'A data-backed, cross-channel marketing blueprint tailored to your business goals, audience, and market.', features: ['Market & competitor analysis','Audience persona mapping','Multi-channel strategy','Content calendar planning','KPI framework & goals','Quarterly strategy review'], order: 2 },
    { slug: 'paid-advertising', emoji: '🎯', title: 'Paid Advertising (PPC)', shortDesc: 'High-ROI Google Ads & Meta campaigns managed by certified specialists.', longDesc: 'From Google Search to Meta, TikTok and LinkedIn — we manage high-converting ad campaigns that maximise your return on every dollar spent.', features: ['Google Ads (Search, Display, Shopping)','Meta Ads (Facebook & Instagram)','LinkedIn & TikTok campaigns','A/B creative testing','Conversion rate optimisation','Transparent weekly reporting'], order: 3 },
    { slug: 'analytics-tracking', emoji: '📊', title: 'Analytics & Tracking', shortDesc: 'Advanced GA4 setup, custom dashboards, and actionable insights.', longDesc: 'Stop guessing and start knowing. We set up robust analytics infrastructure so every decision is grounded in real data.', features: ['GA4 setup & migration','Google Tag Manager configuration','Custom event & goal tracking','Looker Studio dashboards','Funnel & cohort analysis','Monthly insight reports'], order: 4 },
    { slug: 'wordpress-development', emoji: '🌐', title: 'WordPress Development', shortDesc: 'Fast, mobile-friendly, conversion-focused WordPress sites.', longDesc: 'We design and build fast, accessible, and beautifully branded WordPress websites that are easy for your team to manage.', features: ['Custom theme development','WooCommerce online stores','Page speed optimisation','Mobile-first responsive design','SEO-ready architecture','Ongoing maintenance plans'], order: 5 },
    { slug: 'ai-automation-solutions', emoji: '🤖', title: 'AI & Automation Solutions', shortDesc: 'Intelligent workflow automation and smart systems that free your team to focus on growth.', longDesc: 'From chatbots to workflow automation and custom AI integrations — we help forward-thinking businesses leverage emerging technology.', features: ['Workflow automation (Make / Zapier)','AI chatbot development','CRM & tool integrations','Custom API development','Process audit & optimisation','Training & documentation'], order: 6 },
  ]
  for (const s of services) {
    await prisma.service.upsert({ where: { slug: s.slug }, update: s, create: s })
  }

  // ── Portfolio ──
  const portfolio = [
    { slug: 'luxeshop-ecommerce-revamp', title: 'LuxeShop E-commerce Revamp', emoji: '🛍️', category: 'Web Dev', tags: ['Web Dev','SEO'], result: '+150% organic traffic in 90 days', shortDesc: 'Full Shopify rebuild with technical SEO, speed optimisation, and structured data.', challenge: 'LuxeShop had a poorly structured, slow Shopify site that ranked on page 3.', solution: 'Complete Shopify theme rebuild with Core Web Vitals optimisation and schema markup.', results: ['150% increase in organic traffic','Top 5 rankings for 40+ keywords','42% improvement in conversion rate'], client: 'LuxeShop UK', order: 1 },
    { slug: 'medicare-clinic-digital-presence', title: 'MediCare Clinic Digital Presence', emoji: '🏥', category: 'Ads', tags: ['WordPress','Ads'], result: '4× more patient enquiries per month', shortDesc: 'New WordPress site paired with a tightly-managed Google Ads campaign.', challenge: 'A private clinic with no digital presence, losing patients to competitors.', solution: 'Built a fast WordPress site with local SEO, launched targeted Google Ads.', results: ['4× increase in monthly enquiries','Cost-per-lead under £18','First page for 12 local keywords'], client: 'MediCare Private Clinic', order: 2 },
    { slug: 'dubai-realty-seo-campaign', title: 'Dubai Realty SEO Campaign', emoji: '🏨', category: 'SEO', tags: ['SEO'], result: "#1 for 'Dubai luxury apartments' in 5 months", shortDesc: 'Comprehensive international SEO strategy with multilingual content.', challenge: 'A luxury real estate brand competing against dominant portals.', solution: 'Built topical authority, implemented hreflang, acquired editorial links.', results: ['#1 ranking for primary keyword','220% increase in organic leads','35 high-DA backlinks acquired'], client: 'Dubai Luxury Realty', order: 3 },
  ]
  for (const p of portfolio) {
    await prisma.portfolioItem.upsert({ where: { slug: p.slug }, update: p, create: p })
  }

  // ── Blog ──
  const posts = [
    { slug: 'seo-guide-2025', title: 'The Complete SEO Guide for 2025: What Actually Works', excerpt: "Google's algorithm has changed significantly. Here's what top-performing agencies are doing differently.", content: 'Search engine optimisation in 2025 is fundamentally different from what it was even two years ago.\n\n## E-E-A-T is Non-Negotiable\n\nGoogle places enormous weight on Experience, Expertise, Authoritativeness, and Trustworthiness.\n\n## Technical SEO is the Foundation\n\nCore Web Vitals are a ranking factor — your LCP should be under 2.5s.', category: 'SEO', author: 'Ruhi Ahmed', authorRole: 'Founder & CEO', readTime: '8 min read', tags: ['SEO','Content'], featured: true },
    { slug: 'ga4-setup-guide', title: 'GA4 Setup for Agencies: The Complete Configuration Checklist', excerpt: 'Most GA4 installations are missing 60% of the events they should be tracking.', content: 'Google Analytics 4 is now the default analytics platform, but most businesses have implemented it incorrectly.\n\n## Essential Events to Track\n\n- Form submissions\n- Phone number clicks\n- Video engagement\n- Scroll depth', category: 'Analytics', author: 'Ruhi Ahmed', authorRole: 'Founder & CEO', readTime: '12 min read', tags: ['Analytics','GA4'], featured: true },
  ]
  for (const p of posts) {
    await prisma.blogPost.upsert({ where: { slug: p.slug }, update: p, create: p })
  }

  // ── Team ──
  const team = [
    { name: 'Ruhi Ahmed', role: 'Founder & CEO', bio: 'Digital strategist with 4+ years scaling brands across the USA, UAE, UK and beyond.', emoji: '👨‍💻', order: 1 },
    { name: 'Layla Hassan', role: 'Head of SEO', bio: 'Technical SEO specialist with deep expertise in international search.', emoji: '📈', order: 2 },
    { name: 'James Thornton', role: 'Lead Developer', bio: 'Full-stack developer specialising in high-performance WordPress and Next.js.', emoji: '💻', order: 3 },
  ]
  for (const [i, t] of team.entries()) {
    await prisma.teamMember.upsert({ where: { id: `team-${i}` }, update: t, create: { id: `team-${i}`, ...t } })
  }

  // ── Testimonials ──
  const testimonials = [
    { name: 'Sarah Mitchell', role: 'CEO, LuxeRetail UK', initials: 'SM', rating: 5, text: 'DigitalArch tripled our organic traffic in under 4 months. Exceptional results.', order: 1 },
    { name: 'Ahmed Al Rashid', role: 'Founder, Dubai Realty', initials: 'AR', rating: 5, text: 'The paid ads team cut our cost-per-lead by 40% while doubling volume.', order: 2 },
    { name: 'Priya Sharma', role: 'CMO, TechStartup India', initials: 'PS', rating: 5, text: 'From a broken WordPress site to a high-converting platform in 6 weeks.', order: 3 },
  ]
  for (const [i, t] of testimonials.entries()) {
    await prisma.testimonial.upsert({ where: { id: `testi-${i}` }, update: t, create: { id: `testi-${i}`, ...t } })
  }

  console.log('✅ Seed complete. Admin login: admin@arvance.agency / (see SEED_ADMIN_PASSWORD env or default ChangeMe123!)')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
