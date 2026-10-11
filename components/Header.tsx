'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/lib/theme-context';

export function Header() {
  const { mode, toggleMode, setAccent } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-navy-500 to-gold-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            AR
          </div>
          <span className="text-xl font-bold text-navy-900 dark:text-white hidden sm:inline">
            AR Vance
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-slate-600 dark:text-slate-300 hover:text-navy-500 transition">
            Home
          </Link>
          <Link href="/agents" className="text-slate-600 dark:text-slate-300 hover:text-navy-500 transition">
            Agents
          </Link>
          <Link href="/services" className="text-slate-600 dark:text-slate-300 hover:text-navy-500 transition">
            Services
          </Link>
          <Link href="/blog" className="text-slate-600 dark:text-slate-300 hover:text-navy-500 transition">
            Blog
          </Link>
        </nav>

        {/* Theme Controls */}
        <div className="flex items-center gap-4">
          {/* Theme Switcher */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-full p-1">
            <button
              onClick={() => setAccent('navy')}
              className="w-6 h-6 rounded-full bg-navy-500 hover:scale-110 transition"
              title="Navy Theme"
            />
            <button
              onClick={() => setAccent('emerald')}
              className="w-6 h-6 rounded-full bg-emerald-500 hover:scale-110 transition"
              title="Emerald Theme"
            />
            <button
              onClick={() => setAccent('gold')}
              className="w-6 h-6 rounded-full bg-gold-500 hover:scale-110 transition"
              title="Gold Theme"
            />
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleMode}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-navy-900 dark:text-yellow-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
          >
            {mode === 'light' ? '🌙' : '☀️'}
          </button>

          {/* Mobile Menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 space-y-2">
          <Link href="/" className="block px-4 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
            Home
          </Link>
          <Link href="/agents" className="block px-4 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
            Agents
          </Link>
          <Link href="/services" className="block px-4 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
            Services
          </Link>
          <Link href="/blog" className="block px-4 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
            Blog
          </Link>
        </nav>
      )}
    </header>
  );
}
