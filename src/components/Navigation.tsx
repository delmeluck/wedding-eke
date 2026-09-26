'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/',           label: 'Home' },
  { href: '/program',    label: 'Program' },
  { href: '/dress-code', label: 'Dress Code' },
  { href: '/gifts',      label: 'Gifts' },
  { href: '/gallery',    label: 'Gallery' },
  { href: '/contact',    label: 'Contact' },
]

export function Navigation() {
  const pathname  = usePathname()
  const [open, setOpen]       = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [progress, setProgress] = useState(0)
  const progressRef = useRef<HTMLDivElement>(null)
  const isHome = pathname === '/'

  useEffect(() => {
    function onScroll() {
      const sy  = window.scrollY
      const doc = document.documentElement
      const total = doc.scrollHeight - doc.clientHeight
      setScrolled(sy > 60)
      setProgress(total > 0 ? sy / total : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on route change
  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <>
      {/* Scroll progress bar */}
      <div
        id="scroll-progress"
        style={{ transform: `scaleX(${progress})` }}
      />

      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.18)',
          boxShadow: '0 4px 24px rgba(154,121,180,0.08)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 grid grid-cols-[auto_1fr_auto] items-center gap-4">

          {/* Logo */}
          <Link
            href="/"
            className="hover:opacity-80 transition-opacity select-none"
            style={{ fontFamily: 'Georgia, serif', fontSize: '1.875rem', letterSpacing: '-3px', lineHeight: 1, color: '#7e5a98' }}
          >
            E<span style={{ fontStyle: 'italic', fontSize: '0.72em', letterSpacing: '-1px' }}>&amp;</span>E
          </Link>

          {/* Desktop links — centered */}
          <ul className="hidden md:flex items-center justify-center gap-1">
            {links.map(({ href, label }) => {
              const active = pathname === href
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className="nav-link px-4 py-2 text-base font-sans font-medium tracking-wide"
                    style={{ color: '#9a79b4' }}
                    data-active={active ? 'true' : undefined}
                  >
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* RSVP — pinned to the right */}
          <div className="hidden md:flex justify-end">
            <Link
              href="/rsvp"
              className="btn-primary !py-2 !px-5 !text-sm !shadow-sm"
            >
              RSVP
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full
                       text-lavender-200 hover:text-white hover:bg-white/10
                       transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={cn(
            'md:hidden overflow-hidden transition-all duration-300 ease-spring',
            open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="bg-purple-950/98 backdrop-blur-md border-t border-purple-800/50 px-4 py-4 space-y-1">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center px-4 py-3 rounded-xl text-sm font-sans font-medium transition-all duration-200',
                  pathname === href
                    ? 'bg-white/10 text-white ring-1 ring-white/20'
                    : 'text-lavender-200 hover:text-white hover:bg-white/8'
                )}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/rsvp"
              className="block mt-2 btn-primary w-full text-center !text-sm"
            >
              RSVP Now
            </Link>
          </div>
        </div>
      </nav>
    </>
  )
}
