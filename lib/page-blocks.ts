import { z } from 'zod'

// Block types a marketer can add to a page from the admin editor (Elementor-style sections).
const img = z.string().max(500).refine((v) => v === '' || v.startsWith('/') || /^https?:\/\//.test(v), 'Image must be a local path or https URL').default('')

export const blockSchema = z.discriminatedUnion('type', [
  z.object({ id: z.string().max(40), type: z.literal('hero'), title: z.string().max(200), subtitle: z.string().max(500).default(''), ctaText: z.string().max(60).default(''), ctaHref: z.string().max(300).default(''), image: img }),
  z.object({ id: z.string().max(40), type: z.literal('text'), heading: z.string().max(200).default(''), body: z.string().max(20000).default('') }),
  z.object({ id: z.string().max(40), type: z.literal('image'), src: img, alt: z.string().max(200).default(''), caption: z.string().max(300).default('') }),
  z.object({ id: z.string().max(40), type: z.literal('cta'), title: z.string().max(200), body: z.string().max(500).default(''), buttonText: z.string().max(60), buttonHref: z.string().max(300) }),
  z.object({ id: z.string().max(40), type: z.literal('columns'), items: z.array(z.object({ title: z.string().max(120), body: z.string().max(1000).default('') })).max(6) }),
  z.object({ id: z.string().max(40), type: z.literal('faq'), items: z.array(z.object({ q: z.string().max(300), a: z.string().max(2000).default('') })).max(30) }),
])
export type PageBlock = z.infer<typeof blockSchema>
export const blocksSchema = z.array(blockSchema).max(40)

export const BLOCK_TYPES = ['hero', 'text', 'image', 'cta', 'columns', 'faq'] as const
export type BlockType = (typeof BLOCK_TYPES)[number]

export function newBlock(type: BlockType): PageBlock {
  const id = Math.random().toString(36).slice(2, 10)
  switch (type) {
    case 'hero': return { id, type, title: 'Your headline', subtitle: 'A short supporting line.', ctaText: '', ctaHref: '', image: '' }
    case 'text': return { id, type, heading: 'Section heading', body: 'Write your paragraph here.\n\nLeave a blank line to start a new paragraph.' }
    case 'image': return { id, type, src: '', alt: '', caption: '' }
    case 'cta': return { id, type, title: 'Ready to start?', body: '', buttonText: 'Get in touch', buttonHref: '/contact' }
    case 'columns': return { id, type, items: [{ title: 'Point one', body: '' }, { title: 'Point two', body: '' }] }
    case 'faq': return { id, type, items: [{ q: 'Question?', a: 'Answer.' }] }
  }
}

export function slugify(input: string): string {
  return input.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 120)
}
