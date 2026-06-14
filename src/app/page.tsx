'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { Countdown } from '@/components/Countdown'
import { WelcomeModal } from '@/components/WelcomeModal'
import {
  Calendar, MapPin, Heart, Camera, Gift, Mail,
  ArrowDown, ChevronRight,
} from 'lucide-react'

/* ── Animation variants ────────────────────────────────── */
const fadeUp = {
  hidden:  { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.85, ease: [0.21, 0.47, 0.32, 0.98] } },
}
const fadeLeft = {
  hidden:  { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0,  transition: { duration: 0.8,  ease: [0.21, 0.47, 0.32, 0.98] } },
}
const fadeRight = {
  hidden:  { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0,  transition: { duration: 0.8,  ease: [0.21, 0.47, 0.32, 0.98] } },
}
const scaleIn = {
  hidden:  { opacity: 0, scale: 0.88 },
  visible: { opacity: 1, scale: 1,    transition: { duration: 0.7,  ease: [0.21, 0.47, 0.32, 0.98] } },
}
const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.13, delayChildren: 0.1 } },
}
const staggerFast = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

/* ── Sparkle particles ─────────────────────────────────── */
const SPARKLES = [
  { top: '14%', left: '7%',  dur: '5s', delay: '0s',   size: 3 },
  { top: '24%', left: '91%', dur: '7s', delay: '1.2s', size: 4 },
  { top: '58%', left: '4%',  dur: '6s', delay: '0.5s', size: 2 },
  { top: '72%', left: '87%', dur: '8s', delay: '2s',   size: 3 },
  { top: '42%', left: '14%', dur: '9s', delay: '3s',   size: 2 },
  { top: '82%', left: '74%', dur: '5s', delay: '1.5s', size: 4 },
  { top: '11%', left: '54%', dur: '6s', delay: '2.5s', size: 2 },
  { top: '51%', left: '49%', dur: '7s', delay: '0.8s', size: 3 },
  { top: '33%', left: '78%', dur: '6s', delay: '1.8s', size: 2 },
  { top: '64%', left: '32%', dur: '8s', delay: '0.4s', size: 3 },
]

/* ── Marquee items ─────────────────────────────────────── */
const MARQUEE_ITEMS = [
  '✦ Ekow & Ekua',
  '✦ 19 December 2026',
  '✦ Bethany Methodist Church',
  '✦ Accra, Ghana',
  '✦ E & E',
  '✦ A Celebration of Love',
  '✦ With Joy & Faith',
  '✦ Save the Date',
]

/* ── Wedding photos (Unsplash) ─────────────────────────── */
const MOSAIC_PHOTOS = [
  {
    src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=900&h=1200&fit=crop&auto=format&q=85',
    alt: 'Wedding couple walking together',
    caption: 'Together Forever',
    span: 'row-span-2',
  },
  {
    src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=700&h=500&fit=crop&auto=format&q=85',
    alt: 'Wedding reception celebration',
    caption: 'A Grand Celebration',
    span: '',
  },
  {
    src: 'https://images.unsplash.com/photo-1490750967868-88df5691cc14?w=700&h=500&fit=crop&auto=format&q=85',
    alt: 'Wedding flower bouquet',
    caption: 'In Full Bloom',
    span: '',
  },
]

const GALLERY_PHOTOS = [
  {
    src: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=600&h=800&fit=crop&auto=format&q=85',
    alt: 'Couple at golden sunset',
    caption: 'Our Journey',
  },
  {
    src: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&h=800&fit=crop&auto=format&q=85',
    alt: 'Beautiful wedding ceremony',
    caption: 'Sacred Union',
  },
  {
    src: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=600&h=800&fit=crop&auto=format&q=85',
    alt: 'Wedding elegance details',
    caption: 'Pure Elegance',
  },
  {
    src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=800&fit=crop&auto=format&q=85',
    alt: 'Couple embracing',
    caption: 'Endless Love',
  },
  {
    src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&h=800&fit=crop&auto=format&q=85',
    alt: 'Wedding reception',
    caption: 'Grand Celebration',
  },
  {
    src: 'https://images.unsplash.com/photo-1490750967868-88df5691cc14?w=600&h=800&fit=crop&auto=format&q=85',
    alt: 'Bridal bouquet',
    caption: 'In Full Bloom',
  },
]

/* ── Bento grid ────────────────────────────────────────── */
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

/* ── CSS reveal hooks (for existing sections) ──────────── */
function useReveal(rootMargin = '-80px') {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.disconnect() } },
      { rootMargin }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [rootMargin])
  return ref
}

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

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
export default function HomePage() {
  const [heroReady, setHeroReady] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setHeroReady(true), 80)
    return () => clearTimeout(t)
  }, [])

  /* Parallax hero */
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroBgY    = useTransform(heroScroll, [0, 1], ['0%', '45%'])
  const heroOpacity = useTransform(heroScroll, [0, 0.75], [1, 0])

  /* New sections — framer-motion useInView */
  const mosaicRef   = useRef<HTMLElement>(null)
  const coupleRef   = useRef<HTMLElement>(null)
  const galleryRef  = useRef<HTMLElement>(null)
  const quoteRef    = useRef<HTMLDivElement>(null)
  const bentoSecRef = useRef<HTMLElement>(null)

  const mosaicInView   = useInView(mosaicRef,   { once: true, margin: '-80px 0px' })
  const coupleInView   = useInView(coupleRef,   { once: true, margin: '-80px 0px' })
  const galleryInView  = useInView(galleryRef,  { once: true, margin: '-80px 0px' })
  const quoteInView    = useInView(quoteRef,    { once: true, margin: '-80px 0px' })
  const bentoSecInView = useInView(bentoSecRef, { once: true, margin: '-60px 0px' })

  /* Legacy reveal hooks for existing sections */
  const datesRef = useStaggerReveal('-60px')
  const ctaRef   = useReveal('-60px')

  return (
    <>
      <WelcomeModal />

      {/* ════════════════════════════════════════════════
          HERO  — cinematic parallax
      ════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-hero-gradient"
      >
        {/* Parallax glow layer */}
        <motion.div
          style={{ y: heroBgY }}
          className="absolute inset-0 pointer-events-none"
        >
          <div className="absolute top-[-12%] left-[-6%]  w-[55vw] h-[55vw] rounded-full bg-purple-700/25 blur-[110px]" />
          <div className="absolute bottom-[-12%] right-[-6%] w-[65vw] h-[65vw] rounded-full bg-earth-800/20 blur-[130px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45vw] h-[45vw] rounded-full bg-lavender-500/8 blur-[90px]" />
        </motion.div>

        {/* Sparkle particles */}
        {SPARKLES.map((s, i) => (
          <span
            key={i}
            className="sparkle"
            style={{ top: s.top, left: s.left, width: s.size, height: s.size, '--dur': s.dur, '--delay': s.delay } as React.CSSProperties}
          />
        ))}

        {/* Large rotating ring ornaments */}
        <div className="absolute top-14 right-10 w-36 h-36 opacity-[0.08] pointer-events-none hidden md:block">
          <div className="w-full h-full rounded-full border border-gold animate-rotate-slow" />
          <div className="absolute inset-5 rounded-full border border-gold/60 animate-rotate-slow" style={{ animationDirection: 'reverse', animationDuration: '18s' }} />
          <div className="absolute inset-10 rounded-full border border-gold/30 animate-rotate-slow" style={{ animationDuration: '12s' }} />
        </div>
        <div className="absolute bottom-28 left-10 w-28 h-28 opacity-[0.08] pointer-events-none hidden md:block">
          <div className="w-full h-full rounded-full border border-gold animate-rotate-slow" style={{ animationDuration: '28s' }} />
          <div className="absolute inset-5 rounded-full border border-gold/50 animate-rotate-slow" style={{ animationDirection: 'reverse', animationDuration: '20s' }} />
        </div>

        {/* Hero content */}
        <motion.div
          className="relative z-10 text-center px-6 max-w-3xl mx-auto"
          style={{ opacity: heroOpacity }}
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={heroReady ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-lavender-400/80 text-[11px] uppercase tracking-[0.48em] font-sans mb-7"
          >
            You are cordially invited to celebrate
          </motion.p>

          {/* Monogram */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={heroReady ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ duration: 1.1, delay: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="font-script leading-none mb-4"
            style={{
              fontSize: 'clamp(5rem, 16vw, 13rem)',
              backgroundImage: 'linear-gradient(135deg, #C9A84C 0%, #e0d080 40%, #f5eba0 50%, #C9A84C 65%, #a8832c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '200% auto',
              animation: 'shimmer 5s linear infinite',
              filter: 'drop-shadow(0 4px 24px rgba(201,168,76,0.25))',
            }}
          >
            E &amp; E
          </motion.div>

          {/* Names */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={heroReady ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="font-serif text-3xl sm:text-4xl md:text-5xl text-white/95 tracking-[0.12em] mb-1"
          >
            Ekow &amp; Ekua
          </motion.h1>

          {/* Ornament */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0.4 }}
            animate={heroReady ? { opacity: 1, scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.65 }}
            className="ornament-line max-w-[220px] mx-auto my-6 text-xs"
            style={{ color: 'rgba(201,168,76,0.55)' }}
          >
            ✦
          </motion.div>

          {/* Pill badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroReady ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.75 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10"
          >
            {[
              { icon: Calendar, text: '19 December 2026' },
              { icon: MapPin,   text: 'Bethany Methodist, Dzorwulu, Accra' },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 bg-white/8 backdrop-blur-sm border border-white/12 rounded-full px-5 py-2.5 text-lavender-200 text-sm hover:bg-white/12 transition-colors"
              >
                <Icon size={13} className="text-gold flex-shrink-0" />
                <span className="font-sans">{text}</span>
              </div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroReady ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/rsvp"
              className="btn-primary group text-sm"
            >
              RSVP Now
              <ChevronRight size={15} className="ml-1 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/program"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/25 text-white/90 text-sm font-sans font-medium tracking-wide hover:bg-white/10 transition-all duration-300 hover:-translate-y-0.5"
            >
              View Program
            </Link>
          </motion.div>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={heroReady ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 1.1 }}
          className="relative z-10 w-full px-4 mt-14 pb-12"
        >
          <p className="text-center text-lavender-400/55 text-[10px] uppercase tracking-[0.38em] mb-5 font-sans">
            Counting down to the big day
          </p>
          <Countdown />
        </motion.div>

        {/* Scroll indicator */}
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
          <div className="relative w-7 h-7">
            <span className="absolute inset-0 rounded-full border border-lavender-400/35 animate-pulse-ring" />
            <div className="absolute inset-0 flex items-center justify-center">
              <ArrowDown size={13} className="text-lavender-400 animate-bounce" />
            </div>
          </div>
          <span className="text-lavender-500/50 text-[9px] uppercase tracking-[0.3em] font-sans">Scroll</span>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          GOLD MARQUEE BAND
      ════════════════════════════════════════════════ */}
      <div
        className="marquee-wrap overflow-hidden border-y py-3.5"
        style={{ background: '#1a0820', borderColor: 'rgba(201,168,76,0.2)' }}
        aria-hidden="true"
      >
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span
              key={i}
              className="inline-block px-7 font-sans text-xs tracking-[0.3em] uppercase select-none"
              style={{ color: '#C9A84C' }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          PHOTO MOSAIC  — "A Wedding in the Making"
      ════════════════════════════════════════════════ */}
      <section
        ref={mosaicRef}
        className="relative py-24 px-4 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #f8f4ff 0%, #fef7ed 100%)' }}
      >
        {/* Decorative bg text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="font-script text-[22vw] leading-none" style={{ color: 'rgba(107,37,104,0.03)' }}>
            Love
          </span>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Section heading */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={mosaicInView ? 'visible' : 'hidden'}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.42em] font-sans mb-3" style={{ color: '#9e409b' }}>
              Preparations &amp; Celebrations
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-serif text-4xl md:text-5xl text-purple-900 mb-3">
              A Wedding in the Making
            </motion.h2>
            <motion.div variants={fadeUp} className="ornament-line max-w-52 mx-auto text-xs" style={{ color: 'rgba(201,168,76,0.6)' }}>
              ✦
            </motion.div>
            <motion.p variants={fadeUp} className="mt-5 text-earth-600 font-sans max-w-lg mx-auto leading-relaxed">
              Every detail carefully prepared, every moment filled with intention —
              Ekow &amp; Ekua's celebration is a testament to their love and legacy.
            </motion.p>
          </motion.div>

          {/* Photo grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4" style={{ gridTemplateRows: '280px 280px' }}>
            {/* Left tall — spans 2 rows */}
            <motion.div
              className="img-zoom relative rounded-2xl overflow-hidden row-span-2 shadow-xl shadow-purple-900/15 group cursor-pointer"
              variants={fadeLeft}
              initial="hidden"
              animate={mosaicInView ? 'visible' : 'hidden'}
              transition={{ delay: 0.1 }}
            >
              <Image
                src={MOSAIC_PHOTOS[0].src}
                alt={MOSAIC_PHOTOS[0].alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-950/75 via-purple-950/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-white font-serif text-xl leading-tight">{MOSAIC_PHOTOS[0].caption}</p>
                <p className="text-lavender-300/70 font-sans text-xs mt-1 uppercase tracking-wider">Ekow &amp; Ekua</p>
              </div>
            </motion.div>

            {/* Top right */}
            <motion.div
              className="img-zoom relative rounded-2xl overflow-hidden shadow-lg shadow-purple-900/10 group cursor-pointer"
              variants={fadeUp}
              initial="hidden"
              animate={mosaicInView ? 'visible' : 'hidden'}
              transition={{ delay: 0.25 }}
            >
              <Image
                src={MOSAIC_PHOTOS[1].src}
                alt={MOSAIC_PHOTOS[1].alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-950/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-serif text-base">{MOSAIC_PHOTOS[1].caption}</p>
              </div>
            </motion.div>

            {/* Bottom right */}
            <motion.div
              className="img-zoom relative rounded-2xl overflow-hidden shadow-lg shadow-purple-900/10 group cursor-pointer"
              variants={fadeUp}
              initial="hidden"
              animate={mosaicInView ? 'visible' : 'hidden'}
              transition={{ delay: 0.4 }}
            >
              <Image
                src={MOSAIC_PHOTOS[2].src}
                alt={MOSAIC_PHOTOS[2].alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-950/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-serif text-base">{MOSAIC_PHOTOS[2].caption}</p>
              </div>
            </motion.div>

            {/* Hidden 4th cell on mobile / extra on desktop */}
            <motion.div
              className="hidden md:block img-zoom relative rounded-2xl overflow-hidden shadow-lg shadow-purple-900/10 group cursor-pointer"
              variants={scaleIn}
              initial="hidden"
              animate={mosaicInView ? 'visible' : 'hidden'}
              transition={{ delay: 0.55 }}
            >
              <Image
                src={GALLERY_PHOTOS[0].src}
                alt={GALLERY_PHOTOS[0].alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-950/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-serif text-base">{GALLERY_PHOTOS[0].caption}</p>
              </div>
            </motion.div>
          </div>

          {/* Stat chips */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={mosaicInView ? 'visible' : 'hidden'}
            className="flex flex-wrap justify-center gap-4 mt-12"
          >
            {[
              { num: '2',   label: 'Days of Celebration', icon: '🎊' },
              { num: '2',   label: 'Venues in Ghana',     icon: '📍' },
              { num: '∞',   label: 'Years of Love Ahead', icon: '💍' },
              { num: '1',   label: 'Lifetime Together',   icon: '🕊️' },
            ].map(({ num, label, icon }) => (
              <motion.div
                key={label}
                variants={scaleIn}
                className="flex items-center gap-3 bg-white rounded-2xl border border-lavender-100 px-6 py-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <span className="text-2xl">{icon}</span>
                <div>
                  <p className="font-serif text-2xl font-bold text-purple-900 leading-none">{num}</p>
                  <p className="font-sans text-xs text-earth-600 mt-0.5">{label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          SAVE THE DATE  — timeline (existing)
      ════════════════════════════════════════════════ */}
      <section className="relative py-28 px-4 overflow-hidden" style={{ background: 'linear-gradient(180deg, #f5f3ff 0%, #fef7ed 100%)' }}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
          <span className="font-script text-[20vw] leading-none font-bold" style={{ color: 'rgba(107,33,168,0.035)' }}>
            E &amp; E
          </span>
        </div>
        <div className="max-w-4xl mx-auto">
          <div ref={datesRef}>
            <div className="text-center mb-16" data-stagger>
              <p className="font-script text-5xl text-purple-700 mb-2">Save the Date</p>
              <div className="ornament-line max-w-48 mx-auto text-lavender-300 text-xs mt-3">✦</div>
            </div>
            <div className="relative">
              <div className="timeline-line hidden md:block" />
              {/* Engagement */}
              <div className="flex flex-col md:flex-row items-center gap-6 mb-12" data-stagger>
                <div className="md:w-1/2 md:text-right order-2 md:order-1 reveal-right">
                  <p className="font-script text-3xl text-purple-700 mb-1">Engagement</p>
                  <p className="font-serif text-xl text-earth-800 font-semibold mb-2">Wednesday, 17 December 2026</p>
                  <div className="flex items-center gap-1.5 text-earth-500 text-sm md:justify-end">
                    <MapPin size={14} />
                    <span>Kasoa, Central Region, Ghana</span>
                  </div>
                </div>
                <div className="relative z-10 flex-shrink-0 order-1 md:order-2">
                  <div className="w-12 h-12 rounded-full bg-purple-800 flex items-center justify-center shadow-lg shadow-purple-900/30 ring-4 ring-lavender-100">
                    <span className="text-lg">💍</span>
                  </div>
                </div>
                <div className="md:w-1/2 order-3 reveal-left">
                  <div className="inline-flex items-center gap-3 bg-white rounded-2xl shadow-md border border-lavender-100 px-6 py-4">
                    <div className="text-center min-w-[48px]">
                      <p className="text-purple-800 font-serif font-bold text-3xl leading-none">17</p>
                      <p className="text-earth-500 text-xs uppercase tracking-wider mt-1">Dec 2026</p>
                    </div>
                    <div className="w-px h-10 bg-lavender-200" />
                    <div>
                      <p className="font-sans text-sm font-semibold text-earth-800">Engagement Celebration</p>
                      <p className="text-earth-500 text-xs mt-0.5">Family &amp; Friends Ceremony</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Wedding */}
              <div className="flex flex-col md:flex-row items-center gap-6" data-stagger>
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
                <div className="relative z-10 flex-shrink-0 order-1 md:order-2">
                  <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center shadow-lg shadow-gold/30 ring-4 ring-earth-100">
                    <span className="text-lg">💒</span>
                  </div>
                </div>
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
          MEET THE COUPLE
      ════════════════════════════════════════════════ */}
      <section
        ref={coupleRef}
        className="relative py-28 px-4 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #220828 0%, #350b36 50%, #1a0618 100%)' }}
      >
        {/* Ambient glows */}
        <div className="absolute top-0 left-0 w-[50vw] h-64 rounded-full opacity-30 pointer-events-none"
             style={{ background: 'radial-gradient(ellipse at left, #6b2568, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[40vw] h-64 rounded-full opacity-20 pointer-events-none"
             style={{ background: 'radial-gradient(ellipse at right, #7c3020, transparent 70%)' }} />

        {/* Decorative corner */}
        <div className="absolute top-8 right-8 opacity-[0.06] pointer-events-none hidden lg:block">
          <div className="w-40 h-40 rounded-full border-2 border-gold" />
          <div className="absolute inset-5 rounded-full border border-gold/60" />
          <div className="absolute inset-10 rounded-full border border-gold/30" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Heading */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={coupleInView ? 'visible' : 'hidden'}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.45em] font-sans mb-3" style={{ color: '#cca0cc', opacity: 0.65 }}>
              The Celebration
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-serif text-4xl md:text-5xl mb-3" style={{ color: 'white' }}>
              Meet the Couple
            </motion.h2>
            <motion.div variants={fadeUp} className="ornament-line max-w-52 mx-auto text-xs" style={{ color: 'rgba(201,168,76,0.5)' }}>
              ✦
            </motion.div>
            <motion.p variants={fadeUp} className="mt-5 font-sans max-w-lg mx-auto leading-relaxed text-sm" style={{ color: '#cca0cc', opacity: 0.7 }}>
              Two remarkable souls, united by love and guided by faith — beginning their greatest chapter together.
            </motion.p>
          </motion.div>

          {/* Couple cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            {/* Ekow */}
            <motion.div
              variants={fadeLeft}
              initial="hidden"
              animate={coupleInView ? 'visible' : 'hidden'}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-3xl p-8 text-center group hover:-translate-y-1 transition-transform duration-500"
            >
              {/* Portrait circle */}
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div
                  className="monogram-ring w-full h-full rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #350b36, #6b2568, #4f1750)',
                    border: '2px solid rgba(201,168,76,0.4)',
                  }}
                >
                  <span
                    className="font-script"
                    style={{
                      fontSize: '3.5rem',
                      backgroundImage: 'linear-gradient(135deg, #C9A84C, #e0d080, #C9A84C)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundSize: '200% auto',
                      animation: 'shimmer 4s linear infinite',
                    }}
                  >
                    E
                  </span>
                </div>
                {/* Ring emoji badge */}
                <div className="absolute -bottom-1 -right-1 w-9 h-9 bg-gold rounded-full flex items-center justify-center text-sm shadow-lg">
                  🤵
                </div>
              </div>

              <h3 className="font-serif text-2xl text-white mb-1">Ekow</h3>
              <p className="font-sans text-xs uppercase tracking-[0.3em] mb-4" style={{ color: '#C9A84C' }}>
                The Groom
              </p>
              <div className="w-16 h-px mx-auto mb-4" style={{ background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.5), transparent)' }} />
              <p className="font-sans text-sm leading-relaxed" style={{ color: '#cca0cc', opacity: 0.75 }}>
                A man of vision, integrity, and warmth — Ekow brings strength and tenderness to every room he enters.
                His love for Ekua is a reflection of his devotion to all that matters most.
              </p>

              {/* Small quote */}
              <p className="font-serif italic text-sm mt-5" style={{ color: 'rgba(201,168,76,0.7)' }}>
                &ldquo;She is everything I prayed for.&rdquo;
              </p>
            </motion.div>

            {/* Ekua */}
            <motion.div
              variants={fadeRight}
              initial="hidden"
              animate={coupleInView ? 'visible' : 'hidden'}
              transition={{ delay: 0.35 }}
              className="glass-card rounded-3xl p-8 text-center group hover:-translate-y-1 transition-transform duration-500"
            >
              {/* Portrait circle */}
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div
                  className="monogram-ring w-full h-full rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #4f1750, #9e409b, #6b2568)',
                    border: '2px solid rgba(201,168,76,0.4)',
                  }}
                >
                  <span
                    className="font-script"
                    style={{
                      fontSize: '3.5rem',
                      backgroundImage: 'linear-gradient(135deg, #C9A84C, #e0d080, #C9A84C)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundSize: '200% auto',
                      animation: 'shimmer 4s linear infinite',
                    }}
                  >
                    E
                  </span>
                </div>
                {/* Bride badge */}
                <div className="absolute -bottom-1 -right-1 w-9 h-9 bg-gold rounded-full flex items-center justify-center text-sm shadow-lg">
                  👰
                </div>
              </div>

              <h3 className="font-serif text-2xl text-white mb-1">Ekua</h3>
              <p className="font-sans text-xs uppercase tracking-[0.3em] mb-4" style={{ color: '#C9A84C' }}>
                The Bride
              </p>
              <div className="w-16 h-px mx-auto mb-4" style={{ background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.5), transparent)' }} />
              <p className="font-sans text-sm leading-relaxed" style={{ color: '#cca0cc', opacity: 0.75 }}>
                Grace personified — Ekua radiates joy, wisdom, and an effortless elegance that captivates all who
                know her. Her love for Ekow is written in every smile she graces him with.
              </p>

              <p className="font-serif italic text-sm mt-5" style={{ color: 'rgba(201,168,76,0.7)' }}>
                &ldquo;He makes my heart feel at home.&rdquo;
              </p>
            </motion.div>
          </div>

          {/* Bottom flourish */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={coupleInView ? 'visible' : 'hidden'}
            transition={{ delay: 0.6 }}
            className="text-center mt-14"
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px flex-1 max-w-[80px]" style={{ background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.35))' }} />
              <Heart size={18} className="fill-current" style={{ color: '#C9A84C' }} />
              <div className="h-px flex-1 max-w-[80px]" style={{ background: 'linear-gradient(to left, transparent, rgba(201,168,76,0.35))' }} />
            </div>
            <p className="font-serif italic text-xl" style={{ color: 'rgba(204,160,204,0.75)' }}>
              &ldquo;Two hearts, one story, forever written in love.&rdquo;
            </p>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          OUR STORY — dramatic quote
      ════════════════════════════════════════════════ */}
      <section className="py-28 px-4 bg-purple-950 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[65vw] h-72 rounded-full pointer-events-none"
             style={{ background: 'radial-gradient(ellipse at top, rgba(107,37,104,0.25), transparent 70%)' }} />
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="font-script text-[25vw] leading-none" style={{ color: 'rgba(201,168,76,0.025)' }}>
            Faith
          </span>
        </div>

        <div ref={quoteRef}>
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={quoteInView ? 'visible' : 'hidden'}
            className="max-w-3xl mx-auto text-center relative z-10"
          >
            <motion.p variants={fadeUp} className="font-script text-5xl text-gold mb-3">Our Story</motion.p>
            <motion.div variants={fadeUp} className="ornament-line max-w-40 mx-auto text-xs mb-10" style={{ color: 'rgba(201,168,76,0.35)' }}>✦</motion.div>

            <motion.p
              variants={scaleIn}
              className="font-serif italic text-2xl md:text-3xl leading-relaxed mb-8"
              style={{ color: '#d4b0d4' }}
            >
              &ldquo;Two hearts beating as one, <br className="hidden md:block" />
              in faith, in love, in joy.&rdquo;
            </motion.p>

            <motion.p variants={fadeUp} className="font-sans leading-relaxed text-base max-w-xl mx-auto mb-10" style={{ color: '#9e779e' }}>
              Ekow and Ekua invite you to witness their union — a celebration of love,
              faith, and family. Together with their families, they joyfully request
              the honour of your presence on their special day.
            </motion.p>

            <motion.div variants={fadeUp}>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border font-sans text-sm font-medium tracking-wide transition-all duration-300 hover:bg-white/8 hover:-translate-y-0.5"
                style={{ borderColor: 'rgba(204,160,204,0.3)', color: '#d4b0d4' }}
              >
                Get in Touch
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          GALLERY PREVIEW STRIP
      ════════════════════════════════════════════════ */}
      <section
        ref={galleryRef}
        className="py-24 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #fef7ed 0%, #f5f0ff 100%)' }}
      >
        {/* Heading */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={galleryInView ? 'visible' : 'hidden'}
          className="text-center mb-12 px-4"
        >
          <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.42em] font-sans mb-3 text-purple-600">
            A Glimpse of Forever
          </motion.p>
          <motion.h2 variants={fadeUp} className="font-serif text-4xl md:text-5xl text-purple-900 mb-3">
            Love in Every Frame
          </motion.h2>
          <motion.div variants={fadeUp} className="ornament-line max-w-48 mx-auto text-xs" style={{ color: 'rgba(201,168,76,0.55)' }}>
            ✦
          </motion.div>
        </motion.div>

        {/* Horizontal scroll strip */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={galleryInView ? 'visible' : 'hidden'}
          transition={{ delay: 0.25 }}
          className="px-4 md:px-8"
        >
          <div className="gallery-strip">
            {GALLERY_PHOTOS.map((photo, i) => (
              <div
                key={i}
                className="gallery-strip-item img-zoom relative rounded-2xl overflow-hidden shadow-lg shadow-purple-900/15 group cursor-pointer"
                style={{ width: 260, height: 360 }}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-108"
                  sizes="260px"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-purple-950/80 via-purple-950/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                {/* Caption */}
                <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-1 group-hover:translate-y-0 transition-transform duration-400">
                  <p className="font-script text-2xl text-white leading-tight">{photo.caption}</p>
                  <div className="w-8 h-px mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300" style={{ background: '#C9A84C' }} />
                </div>
                {/* Gold corner accent */}
                <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-5 h-5 border-t-2 border-l-2 rounded-tl-sm" style={{ borderColor: '#C9A84C' }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* View full gallery CTA */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={galleryInView ? 'visible' : 'hidden'}
          transition={{ delay: 0.5 }}
          className="text-center mt-10"
        >
          <Link href="/gallery" className="btn-primary group text-sm">
            <Camera size={15} className="mr-2" />
            View Full Gallery
            <ChevronRight size={15} className="ml-1 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════
          WEDDING DETAILS — Bento grid
      ════════════════════════════════════════════════ */}
      <section
        ref={bentoSecRef}
        className="py-24 px-4 border-t"
        style={{ background: 'linear-gradient(180deg, #200628 0%, #350b36 100%)', borderColor: 'rgba(107,37,104,0.5)' }}
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={bentoSecInView ? 'visible' : 'hidden'}
            className="text-center mb-12"
          >
            <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.4em] font-sans mb-3" style={{ color: '#9e779e' }}>
              Everything you need
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-serif text-4xl md:text-5xl text-white">
              Wedding Details
            </motion.h2>
          </motion.div>

          {/* Bento grid with staggered entrance */}
          <motion.div
            variants={staggerFast}
            initial="hidden"
            animate={bentoSecInView ? 'visible' : 'hidden'}
            className="grid grid-cols-2 md:grid-cols-3 auto-rows-[140px] gap-3"
          >
            {BENTO.map(({ icon: Icon, label, href, desc, size, accent, large }) => (
              <motion.div key={href} variants={scaleIn}>
                <Link
                  href={href}
                  className={`bento-card ${size} bg-gradient-to-br ${accent}
                              border border-white/8 rounded-2xl p-5
                              flex flex-col justify-between h-full
                              group cursor-pointer`}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                      <Icon size={18} className="text-gold" />
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all duration-300"
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
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          RSVP CTA — dramatic close
      ════════════════════════════════════════════════ */}
      <section className="relative py-36 px-4 overflow-hidden bg-cream">
        {/* Concentric ring animation */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-[700px] h-[700px] rounded-full border border-lavender-200/25 animate-spin-slow opacity-30" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-lavender-300/20 animate-spin-slow opacity-40"
               style={{ animationDirection: 'reverse', animationDuration: '28s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-lavender-200/30 animate-spin-slow opacity-50"
               style={{ animationDuration: '18s' }} />
        </div>

        {/* Subtle petal scatter in background */}
        {[...Array(6)].map((_, i) => (
          <span
            key={i}
            className="petal absolute"
            style={{
              left: `${10 + i * 16}%`,
              top: 0,
              width: 8 + (i % 3) * 3,
              height: 11 + (i % 3) * 4,
              '--dur': `${10 + i * 1.5}s`,
              '--delay': `${i * 1.2}s`,
              opacity: 0.4,
            } as React.CSSProperties}
          />
        ))}

        <div ref={ctaRef} className="reveal relative z-10 max-w-2xl mx-auto text-center">
          <p className="font-script text-6xl text-purple-700 mb-4">Join Us</p>
          <div className="ornament-line max-w-40 mx-auto text-lavender-300 text-xs mb-7">✦</div>

          <h2 className="font-serif text-3xl md:text-4xl text-purple-900 mb-6 leading-snug">
            Will you celebrate <br className="hidden sm:block" />with us?
          </h2>

          <p className="text-earth-600 font-sans leading-relaxed mb-10 max-w-md mx-auto">
            We would be overjoyed to celebrate this day with you. Please respond
            to your invitation before{' '}
            <strong className="text-earth-800">1 November 2026</strong>.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <Link href="/rsvp" className="btn-primary text-base px-10 py-4 group">
              RSVP Now
              <ChevronRight size={16} className="ml-1 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href="/contact" className="btn-secondary !text-sm">
              Contact Us
            </Link>
          </div>

          {/* Date reminder row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-earth-500 text-sm">
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
