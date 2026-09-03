'use client'
import type { ReactElement } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ADMIN_PATH } from '@/lib/admin-path'

// hrefs are relative to the admin root — prefixed with ADMIN_PATH below,
// so the whole panel moves with it if the slug changes.
const NAV_SECTIONS = [
  {
    title: 'Overview',
    links: [{ href: '', label: 'Dashboard', icon: 'grid' }],
  },
  {
    title: 'Content',
    links: [
      { href: '/services',  label: 'Services',  icon: 'star' },
      { href: '/blog',      label: 'Blog',       icon: 'file' },
      { href: '/portfolio', label: 'Portfolio',  icon: 'briefcase' },
      { href: '/team',      label: 'Team',       icon: 'users' },
    ],
  },
  {
    title: 'Sales',
    links: [{ href: '/leads', label: 'Leads', icon: 'inbox' }],
  },
  {
    title: 'System',
    links: [
      { href: '/settings', label: 'Settings', icon: 'settings' },
      { href: '/api-keys', label: 'API Keys', icon: 'key' },
    ],
  },
]

const ICONS: Record<string, ReactElement> = {
  grid:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  star:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  file:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  briefcase: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  users:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  inbox:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
  settings:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  key:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
}

export default function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push(`/${ADMIN_PATH}/login`)
    router.refresh()
  }

  return (
    <aside className="admin-sidebar" id="admin-sidebar">
      <div className="admin-sidebar-logo">Digital<span>Arch</span> Admin</div>
      <nav className="admin-nav">
        {NAV_SECTIONS.map(section => (
          <div key={section.title}>
            <div className="admin-nav-section">{section.title}</div>
            {section.links.map(link => {
              const fullHref = `/${ADMIN_PATH}${link.href}`
              return (
                <Link
                  key={link.href}
                  href={fullHref}
                  className={`admin-nav-link${pathname === fullHref ? ' active' : ''}`}
                >
                  {ICONS[link.icon]}
                  {link.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>
      <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
        <p style={{ fontSize: '.78rem', color: 'var(--muted)', marginBottom: '.6rem' }}>{userName}</p>
        <button onClick={handleLogout} className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
          Log Out
        </button>
      </div>
    </aside>
  )
}
