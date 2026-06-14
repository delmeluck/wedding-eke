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

  const navBg = isHome
    ? scrolled
      ? 'bg-purple-950/95 backdrop-blur-md shadow-lg shadow-purple-950/20'
      : 'bg-transparent'
    : 'bg-purple-950 shadow-md'

  return (
    <>
      {/* Scroll progress bar */}
      <div
        id="scroll-progress"
        style={{ transform: `scaleX(${progress})` }}
      />

      <nav className={cn('fixed top-0 left-0 right-0 z-50 transition-all duration-500', navBg)}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link
            href="/"
            className="font-script text-3xl text-gold tracking-wider hover:opacity-80 transition-opacity select-none"
          >
            E &amp; E
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-0.5">
            {links.map(({ href, label }) => {
              const active = pathname === href
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      'relative px-4 py-2 rounded-full text-sm font-sans font-medium transition-all duration-250',
                      active
                        ? 'text-white'
                        : 'text-lavender-200 hover:text-white'
                    )}
                  >
                    {active && (
                      <span className="absolute inset-0 rounded-full bg-white/10 ring-1 ring-white/20" />
                    )}
                    <span className="relative">{label}</span>
                  </Link>
                </li>
              )
            })}
            <li className="ml-3">
              <Link
                href="/rsvp"
                className="btn-primary !py-2 !px-5 !text-sm !shadow-sm"
              >
                RSVP
              </Link>
            </li>
          </ul>

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
