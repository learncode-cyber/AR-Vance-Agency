'use client'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { BLOCK_TYPES, newBlock, type BlockType, type PageBlock } from '@/lib/page-blocks'
import PageBlocks from '@/components/PageBlocks'

type PageData = { id: string; title: string; slug: string; description: string; status: string; seoTitle: string; seoDescription: string; ogImage: string; blocks: PageBlock[] }
const LABEL: Record<BlockType, string> = { hero: 'Hero banner', text: 'Text section', image: 'Image', cta: 'Call to action', columns: 'Feature columns', faq: 'FAQ' }

// Marketing editor: create-free editing of a page's metadata and its sections (add, edit, reorder, delete, upload images).
export default function PageEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [page, setPage] = useState<PageData | null>(null)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [addType, setAddType] = useState<BlockType>('text')
  const [dragFrom, setDragFrom] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  useEffect(() => {
    fetch(`/api/admin/pages/${id}`).then(async (r) => {
      const j = await r.json()
      if (r.ok) setPage(j.data); else setMsg({ ok: false, text: j.error ?? 'Could not load page' })
    })
  }, [id])

  if (!page) return <div className="admin-content">{msg ? <p style={{ color: '#B91C1C' }}>{msg.text}</p> : 'Loading…'}</div>

  const set = (patch: Partial<PageData>) => setPage({ ...page, ...patch })
  const setBlock = (i: number, patch: Record<string, unknown>) => {
    const blocks = page.blocks.map((b, idx) => (idx === i ? ({ ...b, ...patch } as PageBlock) : b))
    set({ blocks })
  }
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= page.blocks.length) return
    const blocks = [...page.blocks]
    ;[blocks[i], blocks[j]] = [blocks[j], blocks[i]]
    set({ blocks })
  }
  // Drag-and-drop reorder: drag a section card onto another position.
  const dropAt = (to: number) => {
    if (dragFrom === null || dragFrom === to) { setDragFrom(null); setOverIndex(null); return }
    const blocks = [...page!.blocks]
    const [moved] = blocks.splice(dragFrom, 1)
    blocks.splice(to, 0, moved)
    set({ blocks })
    setDragFrom(null); setOverIndex(null)
  }
  const remove = (i: number) => {
    if (!confirm('Remove this section?')) return
    set({ blocks: page.blocks.filter((_, idx) => idx !== i) })
  }
  const add = () => set({ blocks: [...page.blocks, newBlock(addType)] })

  async function upload(i: number, file: File, field: 'image' | 'src') {
    const fd = new FormData(); fd.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const j = await res.json()
    if (!res.ok) { setMsg({ ok: false, text: j.error ?? 'Upload failed' }); return }
    setBlock(i, { [field]: j.data.url })
    setMsg({ ok: true, text: 'Image uploaded. Save the page to publish the change.' })
  }

  async function save(status?: string) {
    setSaving(true); setMsg(null)
    const body = { title: page!.title, slug: page!.slug, description: page!.description, seoTitle: page!.seoTitle, seoDescription: page!.seoDescription, ogImage: page!.ogImage, blocks: page!.blocks, ...(status ? { status } : {}) }
    const res = await fetch(`/api/admin/pages/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const j = await res.json().catch(() => ({}))
    setSaving(false)
    if (!res.ok) { setMsg({ ok: false, text: j.error ?? 'Save failed' }); return }
    if (status) set({ status })
    setMsg({ ok: true, text: status === 'published' ? 'Published.' : 'Saved.' })
  }

  const field = (label: string, el: React.ReactNode) => <label style={{ display: 'grid', gap: '.3rem' }}><span className="form-label">{label}</span>{el}</label>

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Edit page: {page.title}</h1>
        <div className="admin-actions">
          {page.status === 'published' && <Link className="admin-btn" href={`/p/${page.slug}`} target="_blank">View live</Link>}
          <button className="admin-btn" disabled={saving} onClick={() => save()}>Save draft</button>
          <button className="admin-btn admin-btn-primary" disabled={saving} onClick={() => save('published')}>{page.status === 'published' ? 'Update' : 'Publish'}</button>
        </div>
      </div>
      <div className="admin-content">
        {msg && <div className={msg.ok ? 'form-msg' : 'form-error-msg'}>{msg.text}</div>}

        <section className="admin-card" style={{ display: 'grid', gap: '.9rem', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}>
          <h3 style={{ gridColumn: '1/-1' }}>Page settings</h3>
          {field('Title', <input className="form-input" value={page.title} onChange={(e) => set({ title: e.target.value })} />)}
          {field('URL slug (/p/…)', <input className="form-input" value={page.slug} onChange={(e) => set({ slug: e.target.value })} />)}
          {field('Status', <input className="form-input" value={page.status} readOnly />)}
          {field('Short description', <input className="form-input" value={page.description} onChange={(e) => set({ description: e.target.value })} />)}
          {field('SEO title', <input className="form-input" value={page.seoTitle} onChange={(e) => set({ seoTitle: e.target.value })} />)}
          {field('SEO description', <input className="form-input" value={page.seoDescription} onChange={(e) => set({ seoDescription: e.target.value })} />)}
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '1.25rem', alignItems: 'start' }}>
        <section className="admin-card" style={{ display: 'grid', gap: '1rem' }}>
          <h3>Sections ({page.blocks.length}) <span style={{ fontSize: '.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>— drag a section by its title to reorder</span></h3>
          {page.blocks.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No sections yet. Add one below.</p>}
          {page.blocks.map((b, i) => (
            <div key={b.id}
              draggable
              onDragStart={(e) => { setDragFrom(i); e.dataTransfer.effectAllowed = 'move' }}
              onDragOver={(e) => { e.preventDefault(); setOverIndex(i) }}
              onDragLeave={() => setOverIndex(null)}
              onDrop={(e) => { e.preventDefault(); dropAt(i) }}
              onDragEnd={() => { setDragFrom(null); setOverIndex(null) }}
              style={{ border: `2px ${overIndex === i && dragFrom !== null ? 'dashed var(--emerald)' : 'solid var(--border-color)'}`, borderRadius: 12, padding: '1rem', display: 'grid', gap: '.6rem', opacity: dragFrom === i ? 0.5 : 1, background: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
                <strong style={{ color: 'var(--navy)', cursor: 'grab' }}>⠿ {i + 1}. {LABEL[b.type]}</strong>
                <div className="admin-actions">
                  <button className="admin-btn" onClick={() => move(i, -1)} disabled={i === 0}>↑ Up</button>
                  <button className="admin-btn" onClick={() => move(i, 1)} disabled={i === page.blocks.length - 1}>↓ Down</button>
                  <button className="admin-btn admin-btn-delete" onClick={() => remove(i)}>Delete</button>
                </div>
              </div>

              {b.type === 'hero' && <>
                {field('Headline', <input className="form-input" value={b.title} onChange={(e) => setBlock(i, { title: e.target.value })} />)}
                {field('Subtitle', <textarea className="form-textarea" value={b.subtitle} onChange={(e) => setBlock(i, { subtitle: e.target.value })} />)}
                <div className="form-row">{field('Button text', <input className="form-input" value={b.ctaText} onChange={(e) => setBlock(i, { ctaText: e.target.value })} />)}{field('Button link', <input className="form-input" value={b.ctaHref} onChange={(e) => setBlock(i, { ctaHref: e.target.value })} />)}</div>
                {field('Background image (optional)', <><input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(i, e.target.files[0], 'image')} />{b.image && <img src={b.image} alt="" style={{ maxWidth: 240, marginTop: '.4rem', borderRadius: 8 }} />}</>)}
              </>}

              {b.type === 'text' && <>
                {field('Heading', <input className="form-input" value={b.heading} onChange={(e) => setBlock(i, { heading: e.target.value })} />)}
                {field('Text (blank line = new paragraph)', <textarea className="form-textarea" rows={6} value={b.body} onChange={(e) => setBlock(i, { body: e.target.value })} />)}
              </>}

              {b.type === 'image' && <>
                {field('Image', <><input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(i, e.target.files[0], 'src')} />{b.src && <img src={b.src} alt="" style={{ maxWidth: 320, marginTop: '.4rem', borderRadius: 8 }} />}</>)}
                <div className="form-row">{field('Alt text (for SEO & accessibility)', <input className="form-input" value={b.alt} onChange={(e) => setBlock(i, { alt: e.target.value })} />)}{field('Caption', <input className="form-input" value={b.caption} onChange={(e) => setBlock(i, { caption: e.target.value })} />)}</div>
              </>}

              {b.type === 'cta' && <>
                {field('Title', <input className="form-input" value={b.title} onChange={(e) => setBlock(i, { title: e.target.value })} />)}
                {field('Body', <input className="form-input" value={b.body} onChange={(e) => setBlock(i, { body: e.target.value })} />)}
                <div className="form-row">{field('Button text', <input className="form-input" value={b.buttonText} onChange={(e) => setBlock(i, { buttonText: e.target.value })} />)}{field('Button link', <input className="form-input" value={b.buttonHref} onChange={(e) => setBlock(i, { buttonHref: e.target.value })} />)}</div>
              </>}

              {b.type === 'columns' && <>
                {b.items.map((it, k) => (
                  <div key={k} className="form-row">
                    {field(`Item ${k + 1} title`, <input className="form-input" value={it.title} onChange={(e) => setBlock(i, { items: b.items.map((x, n) => n === k ? { ...x, title: e.target.value } : x) })} />)}
                    {field('Text', <input className="form-input" value={it.body} onChange={(e) => setBlock(i, { items: b.items.map((x, n) => n === k ? { ...x, body: e.target.value } : x) })} />)}
                  </div>
                ))}
                <button className="admin-btn" disabled={b.items.length >= 6} onClick={() => setBlock(i, { items: [...b.items, { title: 'New point', body: '' }] })}>+ Add item</button>
              </>}

              {b.type === 'faq' && <>
                {b.items.map((it, k) => (
                  <div key={k} style={{ display: 'grid', gap: '.4rem' }}>
                    <input className="form-input" value={it.q} placeholder="Question" onChange={(e) => setBlock(i, { items: b.items.map((x, n) => n === k ? { ...x, q: e.target.value } : x) })} />
                    <textarea className="form-textarea" value={it.a} placeholder="Answer" onChange={(e) => setBlock(i, { items: b.items.map((x, n) => n === k ? { ...x, a: e.target.value } : x) })} />
                  </div>
                ))}
                <button className="admin-btn" disabled={b.items.length >= 30} onClick={() => setBlock(i, { items: [...b.items, { q: 'New question?', a: '' }] })}>+ Add question</button>
              </>}
            </div>
          ))}
          <div className="admin-actions" style={{ alignItems: 'center' }}>
            <select className="form-input" style={{ width: 'auto' }} value={addType} onChange={(e) => setAddType(e.target.value as BlockType)}>
              {BLOCK_TYPES.map((t) => <option key={t} value={t}>{LABEL[t]}</option>)}
            </select>
            <button className="admin-btn admin-btn-primary" onClick={add}>+ Add section</button>
          </div>
        </section>
        <section className="admin-card" style={{ position: 'sticky', top: 16, maxHeight: '85vh', overflow: 'auto', padding: 0 }}>
          <div style={{ padding: '.6rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '.85rem', color: 'var(--text-muted)' }}>Live preview (unsaved changes shown)</div>
          <div style={{ transform: 'scale(.8)', transformOrigin: 'top left', width: '125%' }}>
            <PageBlocks blocks={page.blocks} />
          </div>
        </section>
        </div>
      </div>
    </>
  )
}
