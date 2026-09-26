'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, MapPin } from 'lucide-react'
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
    const seen = sessionStorage.getItem('eke-welcome-v4')
    if (!seen) {
      const t = setTimeout(() => setOpen(true), 1400)
      return () => clearTimeout(t)
    }
  }, [])

  function dismiss() {
    sessionStorage.setItem('eke-welcome-v4', '1')
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
          {/* Backdrop — lavender wash with blur */}
          <motion.div
            className="absolute inset-0 overflow-hidden"
            onClick={dismiss}
            style={{
              background: 'linear-gradient(135deg, rgba(244,237,251,0.92) 0%, rgba(237,224,240,0.94) 50%, rgba(233,216,238,0.92) 100%)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            {/* Soft glow orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
                 style={{ background: 'radial-gradient(circle, rgba(154,121,180,0.18), transparent 70%)' }} />

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
            className="relative z-10 w-full max-w-[400px] mx-auto"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: -30 }}
            transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            {/* Close button */}
            <button
              onClick={dismiss}
              aria-label="Close"
              className="absolute -top-3 -right-3 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(154,121,180,0.25)',
                boxShadow: '0 2px 12px rgba(126,90,152,0.15)',
              }}
            >
              <X size={14} style={{ color: '#7e5a98' }} />
            </button>

            {/* Card body */}
            <div
              className="relative rounded-[28px] overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.78)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(154,121,180,0.22)',
                boxShadow: '0 32px 80px rgba(126,90,152,0.18), 0 0 0 1px rgba(255,255,255,0.6) inset',
              }}
            >
              {/* Top accent line */}
              <div className="h-[2px] w-full" style={{ background: 'linear-gradient(90deg, transparent, #9a79b4 30%, #c3a8d8 50%, #9a79b4 70%, transparent)' }} />

              <div className="px-8 pt-7 pb-6">

                {/* SVG ornament */}
                <div className="flex justify-center mb-4">
                  <svg width="120" height="44" viewBox="0 0 120 44" fill="none" aria-hidden="true">
                    <path d="M5 28 Q15 13 25 20" stroke="#9a79b4" strokeWidth="1" fill="none" opacity="0.6"/>
                    <path d="M8 33 Q16 20 22 26" stroke="#9a79b4" strokeWidth="0.7" fill="none" opacity="0.4"/>
                    <ellipse cx="15" cy="16" rx="7" ry="4" fill="none" stroke="#9a79b4" strokeWidth="0.7" opacity="0.45" transform="rotate(-30 15 16)"/>
                    <ellipse cx="10" cy="23" rx="5" ry="3" fill="none" stroke="#9a79b4" strokeWidth="0.7" opacity="0.35" transform="rotate(-45 10 23)"/>
                    <path d="M115 28 Q105 13 95 20" stroke="#9a79b4" strokeWidth="1" fill="none" opacity="0.6"/>
                    <path d="M112 33 Q104 20 98 26" stroke="#9a79b4" strokeWidth="0.7" fill="none" opacity="0.4"/>
                    <ellipse cx="105" cy="16" rx="7" ry="4" fill="none" stroke="#9a79b4" strokeWidth="0.7" opacity="0.45" transform="rotate(30 105 16)"/>
                    <ellipse cx="110" cy="23" rx="5" ry="3" fill="none" stroke="#9a79b4" strokeWidth="0.7" opacity="0.35" transform="rotate(45 110 23)"/>
                    <line x1="30" y1="22" x2="46" y2="22" stroke="#9a79b4" strokeWidth="0.6" opacity="0.5"/>
                    <line x1="74" y1="22" x2="90" y2="22" stroke="#9a79b4" strokeWidth="0.6" opacity="0.5"/>
                    <path d="M60 16 L64 22 L60 28 L56 22 Z" fill="#9a79b4" opacity="0.7"/>
                  </svg>
                </div>

                {/* Eyebrow */}
                <p className="text-center font-sans text-[10px] uppercase tracking-[0.45em] mb-4"
                   style={{ color: '#432b5099' }}>
                  You are cordially invited
                </p>

                {/* Monogram — Georgia serif matching hero */}
                <div className="text-center mb-1">
                  <span
                    className="block leading-none select-none"
                    style={{
                      fontFamily: 'Georgia, serif',
                      fontSize: 'clamp(3.8rem, 16vw, 5rem)',
                      color: '#7e5a98',
                      letterSpacing: '-6px',
                      lineHeight: 0.85,
                    }}
                  >
                    E<span style={{ fontStyle: 'italic', fontSize: '0.72em', letterSpacing: '-2px' }}>&amp;</span>E
                  </span>
                </div>

                {/* Names */}
                <h2 className="text-center font-serif text-lg tracking-[0.18em] mb-5"
                    style={{ color: '#432b50', fontStyle: 'italic' }}>
                  Ekow &amp; Ekua
                </h2>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(154,121,180,0.35))' }} />
                  <span style={{ color: '#9a79b480', fontSize: '18px' }}>✤</span>
                  <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(154,121,180,0.35))' }} />
                </div>

                {/* Date & Venue */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-3 rounded-xl px-4 py-3"
                       style={{ background: 'rgba(154,121,180,0.08)', border: '1px solid rgba(154,121,180,0.15)' }}>
                    <Calendar size={14} style={{ color: '#9a79b4', flexShrink: 0 }} />
                    <div>
                      <p className="font-sans text-sm font-medium leading-tight" style={{ color: '#432b50' }}>19 December 2026</p>
                      <p className="font-sans text-[11px] mt-0.5" style={{ color: '#432b5077' }}>Wedding Ceremony · 10:00 AM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl px-4 py-3"
                       style={{ background: 'rgba(154,121,180,0.08)', border: '1px solid rgba(154,121,180,0.15)' }}>
                    <MapPin size={14} style={{ color: '#9a79b4', flexShrink: 0 }} />
                    <div>
                      <p className="font-sans text-sm font-medium leading-tight" style={{ color: '#432b50' }}>Wedding Ceremony</p>
                      <p className="font-sans text-[11px] mt-0.5" style={{ color: '#432b5077' }}>Accra, Ghana</p>
                    </div>
                  </div>
                </div>

                {/* Primary CTA — matches hero RSVP button */}
                <button
                  onClick={dismiss}
                  className="w-full py-3.5 rounded-full font-sans font-semibold text-sm tracking-widest text-white transition-all duration-300 hover:-translate-y-0.5 mb-3"
                  style={{
                    background: 'linear-gradient(90deg, #9a79b4, #77539a)',
                    boxShadow: '0 8px 28px rgba(126,90,152,0.32)',
                  }}
                >
                  OPEN YOUR INVITATION
                </button>

                {/* Secondary CTA */}
                <Link
                  href="/rsvp"
                  onClick={dismiss}
                  className="block w-full py-3 text-center rounded-full font-sans text-sm transition-all duration-200 hover:bg-purple-50"
                  style={{ color: '#7e5a98', border: '1px solid rgba(154,121,180,0.3)' }}
                >
                  RSVP Now →
                </Link>
              </div>

              {/* Bottom accent line */}
              <div className="h-[2px] w-full" style={{ background: 'linear-gradient(90deg, transparent, #9a79b4 30%, #c3a8d8 50%, #9a79b4 70%, transparent)' }} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
