'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, MapPin, Heart } from 'lucide-react'
import Link from 'next/link'

const PETALS = [
  { left: '5%',  dur: '7s',  delay: '0s',    w: 10, h: 14 },
  { left: '15%', dur: '9s',  delay: '0.8s',  w: 8,  h: 11 },
  { left: '25%', dur: '8s',  delay: '2s',    w: 12, h: 16 },
  { left: '35%', dur: '10s', delay: '1s',    w: 7,  h: 10 },
  { left: '45%', dur: '7s',  delay: '3s',    w: 9,  h: 13 },
  { left: '55%', dur: '11s', delay: '0.3s',  w: 11, h: 15 },
  { left: '65%', dur: '8s',  delay: '1.8s',  w: 8,  h: 11 },
  { left: '75%', dur: '9s',  delay: '2.5s',  w: 13, h: 17 },
  { left: '85%', dur: '7s',  delay: '0.6s',  w: 9,  h: 12 },
  { left: '92%', dur: '10s', delay: '3.5s',  w: 7,  h: 10 },
  { left: '20%', dur: '12s', delay: '4s',    w: 14, h: 18 },
  { left: '80%', dur: '8s',  delay: '5s',    w: 10, h: 14 },
]

export function WelcomeModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const seen = sessionStorage.getItem('eke-welcome-v3')
    if (!seen) {
      const t = setTimeout(() => setOpen(true), 1400)
      return () => clearTimeout(t)
    }
  }, [])

  function dismiss() {
    sessionStorage.setItem('eke-welcome-v3', '1')
    setOpen(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 overflow-hidden"
            onClick={dismiss}
          >
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, #0d0110 0%, #1e0422 40%, #0a0a12 70%, #1a0510 100%)',
              }}
            />
            {/* Radial glow center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
                 style={{ background: 'radial-gradient(circle, #6b2568, transparent 70%)' }} />

            {/* Falling petals */}
            {PETALS.map((p, i) => (
              <span
                key={i}
                className="petal absolute top-0"
                style={{
                  left: p.left,
                  width: p.w,
                  height: p.h,
                  '--dur': p.dur,
                  '--delay': p.delay,
                } as React.CSSProperties}
              />
            ))}
          </motion.div>

          {/* Invitation card */}
          <motion.div
            className="relative z-10 w-full max-w-[420px] mx-auto"
            initial={{ scale: 0.7, opacity: 0, y: 60 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: -40 }}
            transition={{ duration: 0.75, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            {/* Close button */}
            <button
              onClick={dismiss}
              aria-label="Close"
              className="absolute -top-3 -right-3 z-20 w-9 h-9 rounded-full border border-white/20
                         bg-purple-950/80 backdrop-blur-sm flex items-center justify-center
                         hover:bg-white/10 transition-colors group"
            >
              <X size={15} className="text-white/60 group-hover:text-white/90 transition-colors" />
            </button>

            {/* Card body */}
            <div
              className="relative rounded-[28px] overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, #2d0b30 0%, #3e1040 40%, #1e0820 100%)',
                boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(201,168,76,0.25), inset 0 1px 0 rgba(201,168,76,0.2)',
              }}
            >
              {/* Top shimmer bar */}
              <div className="h-[1.5px] w-full" style={{ background: 'linear-gradient(90deg, transparent 0%, #C9A84C 30%, #f0e080 50%, #C9A84C 70%, transparent 100%)' }} />

              <div className="px-8 pt-8 pb-6">
                {/* SVG Wreath ornament */}
                <div className="flex justify-center mb-4">
                  <svg width="120" height="50" viewBox="0 0 120 50" fill="none" aria-hidden="true">
                    {/* Left leaf sprigs */}
                    <path d="M5 30 Q15 15 25 22" stroke="#C9A84C" strokeWidth="1" fill="none" opacity="0.7"/>
                    <path d="M8 35 Q16 22 22 28" stroke="#C9A84C" strokeWidth="0.7" fill="none" opacity="0.5"/>
                    <ellipse cx="15" cy="18" rx="7" ry="4" fill="none" stroke="#C9A84C" strokeWidth="0.7" opacity="0.5" transform="rotate(-30 15 18)"/>
                    <ellipse cx="10" cy="25" rx="5" ry="3" fill="none" stroke="#C9A84C" strokeWidth="0.7" opacity="0.4" transform="rotate(-45 10 25)"/>
                    {/* Right leaf sprigs */}
                    <path d="M115 30 Q105 15 95 22" stroke="#C9A84C" strokeWidth="1" fill="none" opacity="0.7"/>
                    <path d="M112 35 Q104 22 98 28" stroke="#C9A84C" strokeWidth="0.7" fill="none" opacity="0.5"/>
                    <ellipse cx="105" cy="18" rx="7" ry="4" fill="none" stroke="#C9A84C" strokeWidth="0.7" opacity="0.5" transform="rotate(30 105 18)"/>
                    <ellipse cx="110" cy="25" rx="5" ry="3" fill="none" stroke="#C9A84C" strokeWidth="0.7" opacity="0.4" transform="rotate(45 110 25)"/>
                    {/* Center divider lines */}
                    <line x1="30" y1="25" x2="46" y2="25" stroke="#C9A84C" strokeWidth="0.6" opacity="0.6"/>
                    <line x1="74" y1="25" x2="90" y2="25" stroke="#C9A84C" strokeWidth="0.6" opacity="0.6"/>
                    {/* Center diamond */}
                    <path d="M60 19 L64 25 L60 31 L56 25 Z" fill="#C9A84C" opacity="0.9"/>
                    <path d="M60 21 L63 25 L60 29 L57 25 Z" fill="#e0d080" opacity="0.6"/>
                  </svg>
                </div>

                {/* Eyebrow */}
                <p className="text-center font-sans text-[10px] uppercase tracking-[0.5em] mb-4"
                   style={{ color: '#cca0cc', opacity: 0.7 }}>
                  You are cordially invited
                </p>

                {/* Monogram */}
                <div className="text-center mb-0">
                  <span
                    className="font-script block leading-none"
                    style={{
                      fontSize: 'clamp(4rem, 18vw, 5.5rem)',
                      backgroundImage: 'linear-gradient(135deg, #C9A84C 0%, #e0d080 35%, #f5eba0 50%, #C9A84C 65%, #a0732c 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundSize: '200% auto',
                      animation: 'shimmer 4s linear infinite',
                    }}
                  >
                    E &amp; E
                  </span>
                </div>

                {/* Names */}
                <h2 className="text-center font-serif text-xl text-white/85 tracking-[0.2em] mb-5">
                  Ekow &amp; Ekua
                </h2>

                {/* Heart divider */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.4))' }} />
                  <Heart size={12} className="text-gold fill-current flex-shrink-0" style={{ color: '#C9A84C' }} />
                  <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(201,168,76,0.4))' }} />
                </div>

                {/* Date & Venue */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-3 rounded-xl px-4 py-3 border border-white/8"
                       style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <Calendar size={14} style={{ color: '#C9A84C', flexShrink: 0 }} />
                    <div>
                      <p className="text-white/85 font-sans text-sm font-medium leading-tight">19 December 2026</p>
                      <p className="font-sans text-[11px] mt-0.5" style={{ color: '#cca0cc', opacity: 0.65 }}>Wedding Ceremony · 10:00 AM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl px-4 py-3 border border-white/8"
                       style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <MapPin size={14} style={{ color: '#C9A84C', flexShrink: 0 }} />
                    <div>
                      <p className="text-white/85 font-sans text-sm font-medium leading-tight">Bethany Methodist Church</p>
                      <p className="font-sans text-[11px] mt-0.5" style={{ color: '#cca0cc', opacity: 0.65 }}>Dzorwulu, Accra, Ghana</p>
                    </div>
                  </div>
                </div>

                {/* Primary CTA */}
                <button
                  onClick={dismiss}
                  className="w-full py-3.5 rounded-full font-sans font-bold text-sm tracking-wider transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl mb-3"
                  style={{
                    background: 'linear-gradient(135deg, #C9A84C 0%, #e0c060 40%, #C9A84C 80%)',
                    backgroundSize: '200% auto',
                    color: '#1a0420',
                    animation: 'shimmer 4s linear infinite',
                    boxShadow: '0 8px 30px rgba(201,168,76,0.35)',
                  }}
                >
                  Open Your Invitation ✨
                </button>

                {/* Secondary CTA */}
                <Link
                  href="/rsvp"
                  onClick={dismiss}
                  className="block w-full py-3 text-center rounded-full font-sans text-sm transition-all duration-300 border hover:bg-white/5"
                  style={{ color: '#cca0cc', borderColor: 'rgba(201,168,76,0.25)' }}
                >
                  RSVP Now →
                </Link>
              </div>

              {/* Bottom shimmer bar */}
              <div className="h-[1.5px] w-full" style={{ background: 'linear-gradient(90deg, transparent 0%, #C9A84C 30%, #f0e080 50%, #C9A84C 70%, transparent 100%)' }} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
