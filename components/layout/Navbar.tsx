'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ADMIN_PATH } from '@/lib/admin-path'

const NAV_LINKS = [
  { href: '/',          label: 'Home'      },
  { href: '/services',  label: 'Services'  },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/about',     label: 'About'     },
  { href: '/blog',      label: 'Blog'      },
]

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}
function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}
function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open,     setOpen]     = useState(false)
  const [theme,    setTheme]    = useState<'dark'|'light'>('dark')

  useEffect(() => {
    const saved = (localStorage.getItem('site-theme') as 'dark'|'light') ?? 'dark'
    setTheme(saved)
  }, [])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 55)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('site-theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  // Admin has its own layout — Navbar hides there
  if (pathname?.startsWith(`/${ADMIN_PATH}`)) return null

  return (
    <header className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <Link href="/" className="navbar-logo">Digital<span>Arch</span></Link>

      <nav>
        <button
          className="burger"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
        >
          <span style={open ? { transform: 'rotate(45deg) translate(5px,5px)' }    : {}} />
          <span style={open ? { opacity: 0 }                                         : {}} />
          <span style={open ? { transform: 'rotate(-45deg) translate(5px,-5px)' } : {}} />
        </button>

        <ul className={`navbar-links${open ? ' open' : ''}`}>
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={pathname === href || (href !== '/' && pathname?.startsWith(href)) ? 'active' : ''}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="navbar-right">
        <button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
        <Link href="/contact" className="navbar-cta">
          Get Started <ArrowIcon />
        </Link>
      </div>
    </header>
  )
}
