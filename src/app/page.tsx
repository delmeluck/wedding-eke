'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Countdown } from '@/components/Countdown'
import {
  Calendar, MapPin, Heart, Camera, Gift, Mail,
  ArrowDown, ChevronRight
} from 'lucide-react'

/* ── Scroll-reveal hook ────────────────────────────── */
function useReveal(rootMargin = '-80px') {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible')
          obs.disconnect()
        }
      },
      { rootMargin }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [rootMargin])
  return ref
}

/* ── Stagger-reveal hook (animates children with delay) */
function useStaggerReveal(rootMargin = '-60px') {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const parent = ref.current
    if (!parent) return
    const children = Array.from(parent.querySelectorAll('[data-stagger]')) as HTMLElement[]
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          children.forEach((child, i) => {
            setTimeout(() => {
              child.classList.add('visible')
              // Also cascade to any nested reveal-* elements
              child.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach((nested, j) => {
                setTimeout(() => (nested as HTMLElement).classList.add('visible'), j * 80)
              })
            }, i * 120)
          })
          obs.disconnect()
        }
      },
      { rootMargin }
    )
    obs.observe(parent)
    return () => obs.disconnect()
  }, [rootMargin])
  return ref
}

/* ── Floating sparkle particles (pure CSS via style) ── */
const SPARKLES = [
  { top: '15%', left: '8%',  dur: '5s', delay: '0s',   size: 3 },
  { top: '25%', left: '92%', dur: '7s', delay: '1.2s', size: 4 },
  { top: '60%', left: '5%',  dur: '6s', delay: '0.5s', size: 2 },
  { top: '70%', left: '88%', dur: '8s', delay: '2s',   size: 3 },
  { top: '40%', left: '15%', dur: '9s', delay: '3s',   size: 2 },
  { top: '80%', left: '75%', dur: '5s', delay: '1.5s', size: 4 },
  { top: '10%', left: '55%', dur: '6s', delay: '2.5s', size: 2 },
  { top: '50%', left: '50%', dur: '7s', delay: '0.8s', size: 3 },
]

/* ── Bento grid card data ─────────────────────────── */
const BENTO = [
  {
    icon: Calendar, label: 'Program',    href: '/program',
    desc: 'Order of events',
    size: 'col-span-2 md:col-span-1 md:row-span-2',
    accent: 'from-purple-900 to-purple-800',
    large: true,
  },
  {
    icon: Heart,    label: 'Dress Code', href: '/dress-code',
    desc: 'What to wear',
    size: 'col-span-1',
    accent: 'from-earth-800 to-earth-700',
    large: false,
  },
  {
    icon: Gift,     label: 'Gifts',      href: '/gifts',
    desc: 'Registry & wishes',
    size: 'col-span-1',
    accent: 'from-purple-800 to-purple-700',
    large: false,
  },
  {
    icon: Camera,   label: 'Gallery',    href: '/gallery',
    desc: 'Photos & memories',
    size: 'col-span-1',
    accent: 'from-earth-700 to-earth-600',
    large: false,
  },
  {
    icon: MapPin,   label: 'RSVP',       href: '/rsvp',
    desc: 'Confirm your spot',
    size: 'col-span-2 md:col-span-1 md:row-span-2',
    accent: 'from-purple-950 to-purple-900',
    large: true,
  },
  {
    icon: Mail,     label: 'Contact',    href: '/contact',
    desc: 'Get in touch',
    size: 'col-span-1',
    accent: 'from-purple-900 to-earth-800',
    large: false,
  },
]

export default function HomePage() {
  /* hero text visibility after slight delay */
  const [heroReady, setHeroReady] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setHeroReady(true), 80)
    return () => clearTimeout(t)
  }, [])

  /* section refs */
  const storyRef  = useReveal('-60px')
  const bentoRef  = useStaggerReveal('-40px')
  const ctaRef    = useReveal('-60px')
  const datesRef  = useStaggerReveal('-60px')

  return (
    <>
      {/* ════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-hero-gradient">

        {/* Deep background glow layers */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%]  w-[50vw] h-[50vw] rounded-full bg-purple-700/25 blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[60vw] h-[60vw] rounded-full bg-earth-800/20 blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] rounded-full bg-lavender-500/8 blur-[80px]" />
        </div>

        {/* Sparkle particles */}
        {SPARKLES.map((s, i) => (
          <span
            key={i}
            className="sparkle"
            style={{
              top: s.top, left: s.left,
              width: s.size, height: s.size,
              '--dur': s.dur, '--delay': s.delay,
            } as React.CSSProperties}
          />
        ))}

        {/* Rotating ring ornament — top right */}
        <div className="absolute top-16 right-12 w-32 h-32 opacity-10 pointer-events-none hidden md:block">
          <div className="w-full h-full rounded-full border border-gold animate-rotate-slow" />
          <div className="absolute inset-4 rounded-full border border-gold/50 animate-rotate-slow" style={{ animationDirection: 'reverse', animationDuration: '15s' }} />
        </div>

        {/* Rotating ring ornament — bottom left */}
        <div className="absolute bottom-24 left-12 w-24 h-24 opacity-10 pointer-events-none hidden md:block">
          <div className="w-full h-full rounded-full border border-gold animate-rotate-slow" style={{ animationDuration: '25s' }} />
        </div>

        {/* ── Hero content ── */}
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">

          {/* Eyebrow */}
          <p className={`text-lavender-400/80 text-xs uppercase tracking-[0.45em] font-sans mb-6
                        transition-all duration-700 ${heroReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            You are cordially invited to celebrate
          </p>

          {/* Monogram */}
          <div
            className={`font-script leading-none mb-3
                        transition-all duration-1000 ease-spring
                        ${heroReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{
              fontSize: 'clamp(5rem, 15vw, 12rem)',
              color: '#C9A84C',
              textShadow: '0 2px 40px rgba(201,168,76,0.35), 0 0 80px rgba(201,168,76,0.15)',
              animationDelay: '0.1s',
              backgroundImage: 'linear-gradient(135deg, #C9A84C 0%, #e0d080 40%, #C9A84C 60%, #a8832c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '200% auto',
              animation: 'shimmer 4s linear infinite',
            }}
          >
            E &amp; E
          </div>

          {/* Full names */}
          <h1
            className={`font-serif text-3xl sm:text-4xl md:text-5xl text-white/95 tracking-wider mb-1
                        transition-all duration-700 delay-200
                        ${heroReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            Ekow &amp; Ekua
          </h1>

          {/* Ornament */}
          <div className={`ornament-line max-w-xs mx-auto my-6 text-gold/60
                          transition-all duration-700 delay-300
                          ${heroReady ? 'opacity-100' : 'opacity-0'}`}>
            ✦
          </div>

          {/* Date + venue pills */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-3 mb-10
                        transition-all duration-700 delay-400
                        ${heroReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <div className="flex items-center gap-2 bg-white/8 backdrop-blur-sm border border-white/10
                            rounded-full px-4 py-2 text-lavender-200 text-sm">
              <Calendar size={13} className="text-gold flex-shrink-0" />
              <span className="font-sans">19 December 2026</span>
            </div>
            <div className="flex items-center gap-2 bg-white/8 backdrop-blur-sm border border-white/10
                            rounded-full px-4 py-2 text-lavender-200 text-sm">
              <MapPin size={13} className="text-gold flex-shrink-0" />
              <span className="font-sans">Bethany Methodist, Dzorwulu, Accra</span>
            </div>
          </div>

          {/* CTAs */}
          <div
            className={`flex flex-wrap items-center justify-center gap-4
                        transition-all duration-700 delay-500
                        ${heroReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <Link href="/rsvp" className="btn-primary group">
              RSVP Now
              <ChevronRight size={16} className="ml-1 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/program"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/25
                         text-white/90 text-sm font-sans font-medium tracking-wide
                         hover:bg-white/10 transition-all duration-300 hover:-translate-y-0.5"
            >
              View Program
            </Link>
          </div>
        </div>

        {/* ── Countdown ── */}
        <div
          className={`relative z-10 w-full px-4 mt-14 pb-12
                      transition-all duration-1000 delay-700
                      ${heroReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <p className="text-center text-lavender-400/60 text-[10px] uppercase tracking-[0.35em] mb-5 font-sans">
            Counting down to the big day
          </p>
          <Countdown />
        </div>

        {/* ── Scroll indicator ── */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="relative w-7 h-7">
            {/* Pulsing ring */}
            <span className="absolute inset-0 rounded-full border border-lavender-400/40 animate-pulse-ring" />
            {/* Arrow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <ArrowDown size={14} className="text-lavender-400 animate-bounce" />
            </div>
          </div>
          <span className="text-lavender-500/60 text-[9px] uppercase tracking-[0.3em] font-sans">Scroll</span>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          SAVE THE DATE  — timeline
      ════════════════════════════════════════════════ */}
      <section className="relative py-28 px-4 overflow-hidden" style={{ background: 'linear-gradient(180deg, #f5f3ff 0%, #fef7ed 100%)' }}>

        {/* Large watermark text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
          <span
            className="font-script text-[20vw] leading-none font-bold"
            style={{ color: 'rgba(107,33,168,0.04)' }}
          >
            E &amp; E
          </span>
        </div>

        <div className="max-w-4xl mx-auto">
          <div ref={datesRef}>
            {/* Section heading */}
            <div className="text-center mb-16" data-stagger>
              <p className="font-script text-5xl text-purple-700 mb-2">Save the Date</p>
              <div className="ornament-line max-w-48 mx-auto text-lavender-300 text-xs mt-3">✦</div>
            </div>

            {/* Timeline */}
            <div className="relative">
              <div className="timeline-line hidden md:block" />

              {/* Engagement */}
              <div className="flex flex-col md:flex-row items-center gap-6 mb-12" data-stagger>
                {/* Left — text */}
                <div className="md:w-1/2 md:text-right order-2 md:order-1 reveal-right">
                  <p className="font-script text-3xl text-purple-700 mb-1">Engagement</p>
                  <p className="font-serif text-xl text-earth-800 font-semibold mb-2">Wednesday, 17 December 2026</p>
                  <div className="flex items-center gap-1.5 text-earth-500 text-sm md:justify-end">
                    <MapPin size={14} />
                    <span>Kasoa, Central Region, Ghana</span>
                  </div>
                </div>

                {/* Centre dot */}
                <div className="relative z-10 flex-shrink-0 order-1 md:order-2">
                  <div className="w-12 h-12 rounded-full bg-purple-800 flex items-center justify-center shadow-lg shadow-purple-900/30 ring-4 ring-lavender-100">
                    <span className="text-lg">💍</span>
                  </div>
                </div>

                {/* Right — date card */}
                <div className="md:w-1/2 order-3 reveal-left">
                  <div className="inline-flex items-center gap-3 bg-white rounded-2xl shadow-md border border-lavender-100 px-6 py-4">
                    <div className="text-center min-w-[48px]">
                      <p className="text-purple-800 font-serif font-bold text-3xl leading-none">17</p>
                      <p className="text-earth-500 text-xs uppercase tracking-wider mt-1">Dec 2026</p>
                    </div>
                    <div className="w-px h-10 bg-lavender-200" />
                    <div>
                      <p className="font-sans text-sm font-semibold text-earth-800">Engagement Celebration</p>
                      <p className="text-earth-500 text-xs mt-0.5">Family & Friends Ceremony</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wedding */}
              <div className="flex flex-col md:flex-row items-center gap-6" data-stagger>
                {/* Left — date card */}
                <div className="md:w-1/2 md:text-right order-3 md:order-1 reveal-right">
                  <div className="inline-flex items-center gap-3 bg-purple-950 rounded-2xl shadow-xl shadow-purple-950/20 px-6 py-4">
                    <div className="text-center min-w-[48px]">
                      <p className="text-gold font-serif font-bold text-3xl leading-none">19</p>
                      <p className="text-lavender-400 text-xs uppercase tracking-wider mt-1">Dec 2026</p>
                    </div>
                    <div className="w-px h-10 bg-purple-700" />
                    <div>
                      <p className="font-sans text-sm font-semibold text-white">Wedding Ceremony</p>
                      <p className="text-lavender-400 text-xs mt-0.5">10:00 AM · Reception follows</p>
                    </div>
                  </div>
                </div>

                {/* Centre dot */}
                <div className="relative z-10 flex-shrink-0 order-1 md:order-2">
                  <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center shadow-lg shadow-gold/30 ring-4 ring-earth-100">
                    <span className="text-lg">💒</span>
                  </div>
                </div>

                {/* Right — text */}
                <div className="md:w-1/2 order-2 reveal-left">
                  <p className="font-script text-3xl text-purple-700 mb-1">Wedding</p>
                  <p className="font-serif text-xl text-earth-800 font-semibold mb-2">Friday, 19 December 2026</p>
                  <div className="flex items-center gap-1.5 text-earth-500 text-sm">
                    <MapPin size={14} />
                    <span>Bethany Methodist Church, Dzorwulu, Accra</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          OUR STORY
      ════════════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-purple-950 relative overflow-hidden">

        {/* Soft glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60vw] h-64 bg-purple-800/20 blur-[80px] rounded-full pointer-events-none" />

        <div ref={storyRef} className="reveal max-w-3xl mx-auto text-center relative z-10">
          <p className="font-script text-5xl text-gold mb-3">Our Story</p>
          <div className="ornament-line max-w-40 mx-auto text-gold/40 text-xs mb-8">✦</div>

          <p className="font-serif italic text-2xl md:text-3xl text-lavender-200 leading-relaxed mb-8">
            &ldquo;Two hearts beating as one, <br className="hidden md:block" />
            in faith, in love, in joy.&rdquo;
          </p>

          <p className="text-lavender-400 font-sans leading-relaxed text-base max-w-xl mx-auto mb-10">
            Ekow and Ekua invite you to witness their union — a celebration of love,
            faith, and family. Together with their families, they joyfully request
            the honour of your presence on their special day.
          </p>

          <Link href="/contact" className="btn-secondary !border-lavender-400/40 !text-lavender-200 hover:!bg-white/8 !text-sm">
            Get in Touch
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          WEDDING DETAILS  — Bento grid
      ════════════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-purple-950 border-t border-purple-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-lavender-500/60 text-xs uppercase tracking-[0.4em] font-sans mb-3">
              Everything you need
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-white">Wedding Details</h2>
          </div>

          {/* Bento grid */}
          <div ref={bentoRef} className="grid grid-cols-2 md:grid-cols-3 auto-rows-[140px] gap-3">
            {BENTO.map(({ icon: Icon, label, href, desc, size, accent, large }, i) => (
              <Link
                key={href}
                href={href}
                data-stagger
                className={`reveal bento-card ${size} bg-gradient-to-br ${accent}
                            border border-white/8 rounded-2xl p-5
                            flex flex-col justify-between
                            group cursor-pointer`}
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center
                                  group-hover:bg-white/20 transition-colors duration-300">
                    <Icon size={18} className="text-gold" />
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5
                               transition-all duration-300"
                  />
                </div>

                <div>
                  <p className={`font-serif text-white ${large ? 'text-xl md:text-2xl' : 'text-base'} leading-snug`}>
                    {label}
                  </p>
                  <p className={`text-white/50 font-sans mt-1 ${large ? 'text-sm' : 'text-xs'}`}>
                    {desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          RSVP CTA
      ════════════════════════════════════════════════ */}
      <section className="relative py-32 px-4 overflow-hidden bg-cream">

        {/* Decorative rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full border border-lavender-200/40 animate-spin-slow opacity-40" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                          w-[400px] h-[400px] rounded-full border border-lavender-300/30 animate-spin-slow opacity-50"
               style={{ animationDirection: 'reverse', animationDuration: '25s' }} />
        </div>

        <div ref={ctaRef} className="reveal relative z-10 max-w-2xl mx-auto text-center">
          <p className="font-script text-6xl text-purple-700 mb-4">Join Us</p>
          <div className="ornament-line max-w-40 mx-auto text-lavender-300 text-xs mb-6">✦</div>

          <h2 className="font-serif text-3xl md:text-4xl text-purple-900 mb-6 leading-snug">
            Will you celebrate <br className="hidden sm:block" />with us?
          </h2>

          <p className="text-earth-600 font-sans leading-relaxed mb-10 max-w-md mx-auto">
            We would be overjoyed to celebrate this day with you. Please respond
            to your invitation before <strong className="text-earth-800">1 November 2026</strong>.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/rsvp" className="btn-primary text-base px-10 py-4 group">
              RSVP Now
              <ChevronRight size={16} className="ml-1 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href="/contact" className="btn-secondary !text-sm">
              Contact Us
            </Link>
          </div>

          {/* Small date reminder */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-earth-500 text-sm">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-gold" />
              <span>19 December 2026</span>
            </div>
            <span className="hidden sm:block text-earth-300">·</span>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-gold" />
              <span>Bethany Methodist Church, Dzorwulu, Accra</span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
