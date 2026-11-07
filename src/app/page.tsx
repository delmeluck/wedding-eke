'use client'

import Image from 'next/image'
import Link from 'next/link'
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
  '✦ 17 December 2026',
  '✦ E & E',
  '✦ A Celebration of Love',
  '✦ With Joy & Faith',
  '✦ Save the Date',
  '✦ December 2026',
  '✦ Ghana',
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

  /* Site content from admin */
  const [siteContent, setSiteContent] = useState<Record<string, string>>({})
  useEffect(() => {
    fetch('/api/content').then(r => r.json()).then(setSiteContent).catch(() => {})
  }, [])

  /* Section visibility */
  const showMosaic   = siteContent['section_show_mosaic']   !== 'false'
  const showCouple   = siteContent['section_show_couple']   !== 'false'
  const showGallery  = siteContent['section_show_gallery']  !== 'false'
  const showMarquee  = siteContent['section_show_marquee']  !== 'false'
  const showSaveDate = siteContent['section_show_savedate'] !== 'false'
  const showBento    = siteContent['section_show_bento']    !== 'false'
  const showRsvpCta  = siteContent['section_show_rsvp_cta'] !== 'false'

  /* Content fields with hardcoded fallbacks */
  const groomName      = siteContent['groom_name']      || 'Ekow'
  const brideName      = siteContent['bride_name']      || 'Ekua'
  const weddingDate    = siteContent['wedding_date']    || 'Friday, 19 December 2026'
  const engagementDate = siteContent['engagement_date'] || 'Wednesday, 17 December 2026'
  const venueWedding   = siteContent['venue_wedding']   || 'Accra, Ghana'
  const venueEngagement = siteContent['venue_engagement'] || 'Ghana'
  const rsvpDeadline   = siteContent['rsvp_deadline']   || '20 November 2026'
  const storyText      = siteContent['story_text']      || null
  const heroTagline    = siteContent['hero_tagline']    || null
  const heroSubtitle   = siteContent['hero_subtitle']   || null
  const dressCodeNote  = siteContent['dress_code_note'] || null

  /* Parallax hero */
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroBgY     = useTransform(heroScroll, [0, 1], ['0%', '45%'])
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
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{ backgroundColor: 'rgb(255,244,225)' }}
      >
        {/* Hero background */}
        <motion.div style={{ y: heroBgY }} className="absolute inset-0 pointer-events-none">
          {/* Inpainted photo — contain on mobile (full image visible), cover on desktop */}
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src="/hero-bg-clean.webp"
              alt=""
              fill
              className="object-contain object-top md:object-cover md:object-[center_top]"
              priority
              sizes="100vw"
            />
          </div>
          {/* Very light lavender wash to unify palette and boost text legibility */}
          <div className="absolute inset-0" style={{ background: 'rgba(242,232,250,0.28)' }} />
        </motion.div>

        {/* Sparkle particles */}
        {SPARKLES.map((s, i) => (
          <span
            key={i}
            className="sparkle"
            style={{ top: s.top, left: s.left, width: s.size, height: s.size, '--dur': s.dur, '--delay': s.delay } as React.CSSProperties}
          />
        ))}

        {/* Ring ornaments removed for clean photo look */}

        {/* Falling rose-gold petal rain */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" style={{ zIndex: 2 }}>
          <style>{`
            @keyframes petalFall {
              0%   { transform: translateY(-60px) rotate(0deg)   translateX(0px);  opacity:0; }
              8%   { opacity:0.85; }
              85%  { opacity:0.5; }
              100% { transform: translateY(108vh) rotate(500deg) translateX(35px); opacity:0; }
            }
          `}</style>
          {([
            {l:'3%', d:0,   sz:11, r:20},  {l:'9%', d:1.3, sz:9,  r:-15},
            {l:'14%',d:2.7, sz:13, r:30},  {l:'20%',d:0.5, sz:8,  r:-22},
            {l:'24%',d:3.4, sz:10, r:12},  {l:'75%',d:1.9, sz:9,  r:-28},
            {l:'79%',d:0.8, sz:12, r:18},  {l:'84%',d:2.3, sz:8,  r:-12},
            {l:'88%',d:4.1, sz:11, r:33},  {l:'93%',d:0.4, sz:9,  r:-20},
            {l:'6%', d:4.8, sz:8,  r:25},  {l:'17%',d:5.3, sz:10, r:-32},
            {l:'77%',d:4.4, sz:8,  r:22},  {l:'91%',d:6.0, sz:10, r:-16},
            {l:'11%',d:7.1, sz:9,  r:15},  {l:'82%',d:7.6, sz:11, r:-8},
            {l:'19%',d:8.2, sz:8,  r:40},  {l:'87%',d:8.9, sz:9,  r:-35},
          ] as {l:string;d:number;sz:number;r:number}[]).map((p,i)=>(
            <svg key={i} width={p.sz} height={p.sz*1.6}
              style={{position:'absolute',left:p.l,top:'-50px',opacity:0,
                animation:`petalFall ${8+(i%6)*0.9}s ease-in ${p.d}s infinite`}}
              viewBox="-1 -1 2 3.2" fill="none">
              <path d="M0 0 C-0.7-0.5-1.1 0.6 0 2 C1.1 0.6 0.7-0.5 0 0"
                fill="#B79AD8" fillOpacity="0.65" stroke="#8F5DAF" strokeWidth="0.08"
                transform={`rotate(${p.r},0,1)`}/>
            </svg>
          ))}
        </div>

        {/* Left floral decoration — hidden, real flowers in hero photo */}
        <div className="absolute left-0 top-0 bottom-0 w-[clamp(130px,20vw,280px)] pointer-events-none select-none overflow-hidden" style={{ zIndex: 3, display: 'none' }}>
          <svg viewBox="0 0 220 900" className="w-full h-full" fill="none" stroke="#B79AD8" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.85 }}>
            <style>{`
              @keyframes roseBloom {
                0%   { opacity:0; transform:scale(0) rotate(-20deg); }
                60%  { opacity:1; transform:scale(1.18) rotate(4deg); }
                100% { opacity:1; transform:scale(1) rotate(0deg); }
              }
              @keyframes roseSway  { 0%,100%{transform:rotate(-5deg);} 50%{transform:rotate(5deg);} }
              @keyframes roseSwayR { 0%,100%{transform:rotate(5deg);}  50%{transform:rotate(-5deg);} }
              .r1,.r2,.r3,.r4,.r5,.r6,.r7,.r8,.r9,.r10,
              .r11,.r12,.r13,.r14,.r15,.r16,.r17,.r18,.r19,.r20,
              .r21,.r22,.r23,.r24,.r25,.r26,.r27,.r28,.r29,.r30 { transform-box:fill-box; transform-origin:center; }
              .r1  { animation: roseBloom 1.3s cubic-bezier(.34,1.56,.64,1) .2s  both, roseSway  7s   ease-in-out 1.5s infinite; }
              .r2  { animation: roseBloom 1.2s cubic-bezier(.34,1.56,.64,1) .5s  both, roseSwayR 8s   ease-in-out 1.7s infinite; }
              .r3  { animation: roseBloom 1.1s cubic-bezier(.34,1.56,.64,1) .7s  both, roseSway  6.5s ease-in-out 1.8s infinite; }
              .r4  { animation: roseBloom 1.4s cubic-bezier(.34,1.56,.64,1) 1.0s both, roseSwayR 9s   ease-in-out 2.4s infinite; }
              .r5  { animation: roseBloom 1.2s cubic-bezier(.34,1.56,.64,1) 1.3s both, roseSway  7.5s ease-in-out 2.5s infinite; }
              .r6  { animation: roseBloom 1.3s cubic-bezier(.34,1.56,.64,1) 1.6s both, roseSwayR 8.5s ease-in-out 2.9s infinite; }
              .r7  { animation: roseBloom 1.1s cubic-bezier(.34,1.56,.64,1) 1.9s both, roseSway  6s   ease-in-out 3.0s infinite; }
              .r8  { animation: roseBloom 1.4s cubic-bezier(.34,1.56,.64,1) 2.2s both, roseSwayR 9.5s ease-in-out 3.6s infinite; }
              .r9  { animation: roseBloom 1.2s cubic-bezier(.34,1.56,.64,1) 2.5s both, roseSway  7s   ease-in-out 3.7s infinite; }
              .r10 { animation: roseBloom 1.3s cubic-bezier(.34,1.56,.64,1) 2.8s both, roseSwayR 8s   ease-in-out 4.1s infinite; }
              .r11 { animation: roseBloom 1.1s cubic-bezier(.34,1.56,.64,1) .35s both, roseSway  7.5s ease-in-out 1.6s infinite; }
              .r12 { animation: roseBloom 1.2s cubic-bezier(.34,1.56,.64,1) .65s both, roseSwayR 6.5s ease-in-out 1.9s infinite; }
              .r13 { animation: roseBloom 1.3s cubic-bezier(.34,1.56,.64,1) .85s both, roseSway  9s   ease-in-out 2.2s infinite; }
              .r14 { animation: roseBloom 1.1s cubic-bezier(.34,1.56,.64,1) 1.15s both, roseSwayR 7s  ease-in-out 2.6s infinite; }
              .r15 { animation: roseBloom 1.2s cubic-bezier(.34,1.56,.64,1) 1.45s both, roseSway  8s  ease-in-out 2.8s infinite; }
              .r16 { animation: roseBloom 1.3s cubic-bezier(.34,1.56,.64,1) 1.75s both, roseSwayR 6s  ease-in-out 3.2s infinite; }
              .r17 { animation: roseBloom 1.1s cubic-bezier(.34,1.56,.64,1) 2.05s both, roseSway  9.5s ease-in-out 3.4s infinite; }
              .r18 { animation: roseBloom 1.2s cubic-bezier(.34,1.56,.64,1) 2.35s both, roseSwayR 7.5s ease-in-out 3.8s infinite; }
              .r19 { animation: roseBloom 1.1s cubic-bezier(.34,1.56,.64,1) 2.65s both, roseSway  8.5s ease-in-out 4.0s infinite; }
              .r20 { animation: roseBloom 1.3s cubic-bezier(.34,1.56,.64,1) 2.95s both, roseSwayR 7s  ease-in-out 4.3s infinite; }
              .r21 { animation: roseBloom 1.0s cubic-bezier(.34,1.56,.64,1) .42s both, roseSway  6.8s ease-in-out 1.5s infinite; }
              .r22 { animation: roseBloom 1.0s cubic-bezier(.34,1.56,.64,1) .58s both, roseSwayR 7.2s ease-in-out 1.7s infinite; }
              .r23 { animation: roseBloom 1.0s cubic-bezier(.34,1.56,.64,1) .92s both, roseSway  8.1s ease-in-out 2.1s infinite; }
              .r24 { animation: roseBloom 1.0s cubic-bezier(.34,1.56,.64,1) 1.08s both, roseSwayR 6.4s ease-in-out 2.3s infinite; }
              .r25 { animation: roseBloom 1.0s cubic-bezier(.34,1.56,.64,1) 1.38s both, roseSway  7.8s ease-in-out 2.6s infinite; }
              .r26 { animation: roseBloom 1.0s cubic-bezier(.34,1.56,.64,1) 1.52s both, roseSwayR 8.8s ease-in-out 2.8s infinite; }
              .r27 { animation: roseBloom 1.0s cubic-bezier(.34,1.56,.64,1) 1.82s both, roseSway  6.2s ease-in-out 3.1s infinite; }
              .r28 { animation: roseBloom 1.0s cubic-bezier(.34,1.56,.64,1) 1.98s both, roseSwayR 9.2s ease-in-out 3.3s infinite; }
              .r29 { animation: roseBloom 1.0s cubic-bezier(.34,1.56,.64,1) 2.28s both, roseSway  7.4s ease-in-out 3.6s infinite; }
              .r30 { animation: roseBloom 1.0s cubic-bezier(.34,1.56,.64,1) 2.48s both, roseSwayR 8.3s ease-in-out 3.9s infinite; }
            `}</style>

            {/* Rose 1 — (110,65) R=20 */}
            <g transform="translate(110,65)"><g className="r1">
              {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.7" d="M0 0 C-9.5-5.1-12.9-24.5 0-34 C12.9-24.5 9.5-5.1 0 0" transform={`rotate(${a})`}/>)}
              {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-7.5-3.4-10.2-17.7 0-21.1 C10.2-17.7 7.5-3.4 0 0" transform={`rotate(${a})`}/>)}
              <circle r="7.5" fill="#B8845A" stroke="none"/>
            </g></g>

            {/* Rose 2 — (25,155) R=18 */}
            <g transform="translate(25,155)"><g className="r2">
              {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.7" d="M0 0 C-8.5-4.6-11.6-22.1 0-30.6 C11.6-22.1 8.5-4.6 0 0" transform={`rotate(${a})`}/>)}
              {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-6.8-3.1-9.2-16 0-19 C9.2-16 6.8-3.1 0 0" transform={`rotate(${a})`}/>)}
              <circle r="6.8" fill="#B8845A" stroke="none"/>
            </g></g>

            {/* Rose 3 — (175,210) R=14 */}
            <g transform="translate(175,210)"><g className="r3">
              {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.6" d="M0 0 C-6.6-3.6-9-17.2 0-23.8 C9-17.2 6.6-3.6 0 0" transform={`rotate(${a})`}/>)}
              {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.4" d="M0 0 C-5.3-2.4-7.1-12.4 0-14.8 C7.1-12.4 5.3-2.4 0 0" transform={`rotate(${a})`}/>)}
              <circle r="5.3" fill="#B8845A" stroke="none"/>
            </g></g>

            {/* Rose 4 — (60,320) R=26 */}
            <g transform="translate(60,320)"><g className="r4">
              {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.8" d="M0 0 C-12.4-6.6-16.8-31.8 0-44.2 C16.8-31.8 12.4-6.6 0 0" transform={`rotate(${a})`}/>)}
              {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.6" d="M0 0 C-9.7-4.4-13.3-23 0-27.4 C13.3-23 9.7-4.4 0 0" transform={`rotate(${a})`}/>)}
              <circle r="9.4" fill="#B8845A" stroke="none"/>
            </g></g>

            {/* Rose 5 — (160,415) R=18 */}
            <g transform="translate(160,415)"><g className="r5">
              {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.7" d="M0 0 C-8.5-4.6-11.6-22.1 0-30.6 C11.6-22.1 8.5-4.6 0 0" transform={`rotate(${a})`}/>)}
              {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-6.8-3.1-9.2-16 0-19 C9.2-16 6.8-3.1 0 0" transform={`rotate(${a})`}/>)}
              <circle r="6.8" fill="#B8845A" stroke="none"/>
            </g></g>

            {/* Rose 6 — (20,510) R=22 */}
            <g transform="translate(20,510)"><g className="r6">
              {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.7" d="M0 0 C-10.5-5.6-14.3-26.9 0-37.4 C14.3-26.9 10.5-5.6 0 0" transform={`rotate(${a})`}/>)}
              {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-8.2-3.7-11.2-19.5 0-23.1 C11.2-19.5 8.2-3.7 0 0" transform={`rotate(${a})`}/>)}
              <circle r="8.2" fill="#B8845A" stroke="none"/>
            </g></g>

            {/* Rose 7 — (170,600) R=14 */}
            <g transform="translate(170,600)"><g className="r7">
              {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.6" d="M0 0 C-6.6-3.6-9-17.2 0-23.8 C9-17.2 6.6-3.6 0 0" transform={`rotate(${a})`}/>)}
              {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.4" d="M0 0 C-5.3-2.4-7.1-12.4 0-14.8 C7.1-12.4 5.3-2.4 0 0" transform={`rotate(${a})`}/>)}
              <circle r="5.3" fill="#B8845A" stroke="none"/>
            </g></g>

            {/* Rose 8 — (50,700) R=26 */}
            <g transform="translate(50,700)"><g className="r8">
              {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.8" d="M0 0 C-12.4-6.6-16.8-31.8 0-44.2 C16.8-31.8 12.4-6.6 0 0" transform={`rotate(${a})`}/>)}
              {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.6" d="M0 0 C-9.7-4.4-13.3-23 0-27.4 C13.3-23 9.7-4.4 0 0" transform={`rotate(${a})`}/>)}
              <circle r="9.4" fill="#B8845A" stroke="none"/>
            </g></g>

            {/* Rose 9 — (155,785) R=18 */}
            <g transform="translate(155,785)"><g className="r9">
              {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.7" d="M0 0 C-8.5-4.6-11.6-22.1 0-30.6 C11.6-22.1 8.5-4.6 0 0" transform={`rotate(${a})`}/>)}
              {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-6.8-3.1-9.2-16 0-19 C9.2-16 6.8-3.1 0 0" transform={`rotate(${a})`}/>)}
              <circle r="6.8" fill="#B8845A" stroke="none"/>
            </g></g>

            {/* Rose 10 — (65,870) R=22 */}
            <g transform="translate(65,870)"><g className="r10">
              {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.7" d="M0 0 C-10.5-5.6-14.3-26.9 0-37.4 C14.3-26.9 10.5-5.6 0 0" transform={`rotate(${a})`}/>)}
              {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-8.2-3.7-11.2-19.5 0-23.1 C11.2-19.5 8.2-3.7 0 0" transform={`rotate(${a})`}/>)}
              <circle r="8.2" fill="#B8845A" stroke="none"/>
            </g></g>

            {/* Rose 11 — (80,120) R=14 */}
            <g transform="translate(80,120)"><g className="r11">
              {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.6" d="M0 0 C-6.6-3.6-9-17.2 0-23.8 C9-17.2 6.6-3.6 0 0" transform={`rotate(${a})`}/>)}
              {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.4" d="M0 0 C-5.3-2.4-7.1-12.4 0-14.8 C7.1-12.4 5.3-2.4 0 0" transform={`rotate(${a})`}/>)}
              <circle r="5.3" fill="#B8845A" stroke="none"/>
            </g></g>

            {/* Rose 12 — (185,310) R=18 */}
            <g transform="translate(185,310)"><g className="r12">
              {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.7" d="M0 0 C-8.5-4.6-11.6-22.1 0-30.6 C11.6-22.1 8.5-4.6 0 0" transform={`rotate(${a})`}/>)}
              {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-6.8-3.1-9.2-16 0-19 C9.2-16 6.8-3.1 0 0" transform={`rotate(${a})`}/>)}
              <circle r="6.8" fill="#B8845A" stroke="none"/>
            </g></g>

            {/* Rose 13 — (35,390) R=14 */}
            <g transform="translate(35,390)"><g className="r13">
              {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.6" d="M0 0 C-6.6-3.6-9-17.2 0-23.8 C9-17.2 6.6-3.6 0 0" transform={`rotate(${a})`}/>)}
              {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.4" d="M0 0 C-5.3-2.4-7.1-12.4 0-14.8 C7.1-12.4 5.3-2.4 0 0" transform={`rotate(${a})`}/>)}
              <circle r="5.3" fill="#B8845A" stroke="none"/>
            </g></g>

            {/* Rose 14 — (125,480) R=22 */}
            <g transform="translate(125,480)"><g className="r14">
              {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.7" d="M0 0 C-10.5-5.6-14.3-26.9 0-37.4 C14.3-26.9 10.5-5.6 0 0" transform={`rotate(${a})`}/>)}
              {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-8.2-3.7-11.2-19.5 0-23.1 C11.2-19.5 8.2-3.7 0 0" transform={`rotate(${a})`}/>)}
              <circle r="8.2" fill="#B8845A" stroke="none"/>
            </g></g>

            {/* Rose 15 — (90,575) R=18 */}
            <g transform="translate(90,575)"><g className="r15">
              {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.7" d="M0 0 C-8.5-4.6-11.6-22.1 0-30.6 C11.6-22.1 8.5-4.6 0 0" transform={`rotate(${a})`}/>)}
              {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-6.8-3.1-9.2-16 0-19 C9.2-16 6.8-3.1 0 0" transform={`rotate(${a})`}/>)}
              <circle r="6.8" fill="#B8845A" stroke="none"/>
            </g></g>

            {/* Rose 16 — (195,665) R=14 */}
            <g transform="translate(195,665)"><g className="r16">
              {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.6" d="M0 0 C-6.6-3.6-9-17.2 0-23.8 C9-17.2 6.6-3.6 0 0" transform={`rotate(${a})`}/>)}
              {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.4" d="M0 0 C-5.3-2.4-7.1-12.4 0-14.8 C7.1-12.4 5.3-2.4 0 0" transform={`rotate(${a})`}/>)}
              <circle r="5.3" fill="#B8845A" stroke="none"/>
            </g></g>

            {/* Rose 17 — (115,760) R=18 */}
            <g transform="translate(115,760)"><g className="r17">
              {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.7" d="M0 0 C-8.5-4.6-11.6-22.1 0-30.6 C11.6-22.1 8.5-4.6 0 0" transform={`rotate(${a})`}/>)}
              {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-6.8-3.1-9.2-16 0-19 C9.2-16 6.8-3.1 0 0" transform={`rotate(${a})`}/>)}
              <circle r="6.8" fill="#B8845A" stroke="none"/>
            </g></g>

            {/* Rose 18 — (30,840) R=14 */}
            <g transform="translate(30,840)"><g className="r18">
              {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.6" d="M0 0 C-6.6-3.6-9-17.2 0-23.8 C9-17.2 6.6-3.6 0 0" transform={`rotate(${a})`}/>)}
              {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.4" d="M0 0 C-5.3-2.4-7.1-12.4 0-14.8 C7.1-12.4 5.3-2.4 0 0" transform={`rotate(${a})`}/>)}
              <circle r="5.3" fill="#B8845A" stroke="none"/>
            </g></g>

            {/* Rose 19 — (195,130) R=18 */}
            <g transform="translate(195,130)"><g className="r19">
              {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.7" d="M0 0 C-8.5-4.6-11.6-22.1 0-30.6 C11.6-22.1 8.5-4.6 0 0" transform={`rotate(${a})`}/>)}
              {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-6.8-3.1-9.2-16 0-19 C9.2-16 6.8-3.1 0 0" transform={`rotate(${a})`}/>)}
              <circle r="6.8" fill="#B8845A" stroke="none"/>
            </g></g>

            {/* Rose 20 — (195,490) R=14 */}
            <g transform="translate(195,490)"><g className="r20">
              {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.6" d="M0 0 C-6.6-3.6-9-17.2 0-23.8 C9-17.2 6.6-3.6 0 0" transform={`rotate(${a})`}/>)}
              {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.4" d="M0 0 C-5.3-2.4-7.1-12.4 0-14.8 C7.1-12.4 5.3-2.4 0 0" transform={`rotate(${a})`}/>)}
              <circle r="5.3" fill="#B8845A" stroke="none"/>
            </g></g>

            {/* Bouquet cluster A — gap y≈255-275 */}
            <g transform="translate(148,253)"><g className="r21">
              {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.7" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-4.5-2.4-6-11.5 0-16 C6-11.5 4.5-2.4 0 0" transform={`rotate(${a})`}/>)}
              {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.85" stroke="#B79AD8" strokeWidth="0.4" d="M0 0 C-3.5-1.6-4.8-8.3 0-9.9 C4.8-8.3 3.5-1.6 0 0" transform={`rotate(${a})`}/>)}
              <circle r="3.5" fill="#B8845A" stroke="none"/>
            </g></g>
            <g transform="translate(48,272)"><g className="r22">
              {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.7" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-4.5-2.4-6-11.5 0-16 C6-11.5 4.5-2.4 0 0" transform={`rotate(${a})`}/>)}
              {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.85" stroke="#B79AD8" strokeWidth="0.4" d="M0 0 C-3.5-1.6-4.8-8.3 0-9.9 C4.8-8.3 3.5-1.6 0 0" transform={`rotate(${a})`}/>)}
              <circle r="3.5" fill="#B8845A" stroke="none"/>
            </g></g>

            {/* Bouquet cluster B — gap y≈348-370 */}
            <g transform="translate(105,348)"><g className="r23">
              {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.7" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-4.5-2.4-6-11.5 0-16 C6-11.5 4.5-2.4 0 0" transform={`rotate(${a})`}/>)}
              {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.85" stroke="#B79AD8" strokeWidth="0.4" d="M0 0 C-3.5-1.6-4.8-8.3 0-9.9 C4.8-8.3 3.5-1.6 0 0" transform={`rotate(${a})`}/>)}
              <circle r="3.5" fill="#B8845A" stroke="none"/>
            </g></g>
            <g transform="translate(178,368)"><g className="r24">
              {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.7" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-4.5-2.4-6-11.5 0-16 C6-11.5 4.5-2.4 0 0" transform={`rotate(${a})`}/>)}
              {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.85" stroke="#B79AD8" strokeWidth="0.4" d="M0 0 C-3.5-1.6-4.8-8.3 0-9.9 C4.8-8.3 3.5-1.6 0 0" transform={`rotate(${a})`}/>)}
              <circle r="3.5" fill="#B8845A" stroke="none"/>
            </g></g>

            {/* Bouquet cluster C — gap y≈448-464 */}
            <g transform="translate(38,448)"><g className="r25">
              {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.7" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-4.5-2.4-6-11.5 0-16 C6-11.5 4.5-2.4 0 0" transform={`rotate(${a})`}/>)}
              {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.85" stroke="#B79AD8" strokeWidth="0.4" d="M0 0 C-3.5-1.6-4.8-8.3 0-9.9 C4.8-8.3 3.5-1.6 0 0" transform={`rotate(${a})`}/>)}
              <circle r="3.5" fill="#B8845A" stroke="none"/>
            </g></g>
            <g transform="translate(132,464)"><g className="r26">
              {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.7" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-4.5-2.4-6-11.5 0-16 C6-11.5 4.5-2.4 0 0" transform={`rotate(${a})`}/>)}
              {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.85" stroke="#B79AD8" strokeWidth="0.4" d="M0 0 C-3.5-1.6-4.8-8.3 0-9.9 C4.8-8.3 3.5-1.6 0 0" transform={`rotate(${a})`}/>)}
              <circle r="3.5" fill="#B8845A" stroke="none"/>
            </g></g>

            {/* Bouquet cluster D — gap y≈535-552 */}
            <g transform="translate(192,537)"><g className="r27">
              {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.7" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-4.5-2.4-6-11.5 0-16 C6-11.5 4.5-2.4 0 0" transform={`rotate(${a})`}/>)}
              {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.85" stroke="#B79AD8" strokeWidth="0.4" d="M0 0 C-3.5-1.6-4.8-8.3 0-9.9 C4.8-8.3 3.5-1.6 0 0" transform={`rotate(${a})`}/>)}
              <circle r="3.5" fill="#B8845A" stroke="none"/>
            </g></g>
            <g transform="translate(62,552)"><g className="r28">
              {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.7" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-4.5-2.4-6-11.5 0-16 C6-11.5 4.5-2.4 0 0" transform={`rotate(${a})`}/>)}
              {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.85" stroke="#B79AD8" strokeWidth="0.4" d="M0 0 C-3.5-1.6-4.8-8.3 0-9.9 C4.8-8.3 3.5-1.6 0 0" transform={`rotate(${a})`}/>)}
              <circle r="3.5" fill="#B8845A" stroke="none"/>
            </g></g>

            {/* Bouquet cluster E — gap y≈632-650 */}
            <g transform="translate(48,632)"><g className="r29">
              {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.7" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-4.5-2.4-6-11.5 0-16 C6-11.5 4.5-2.4 0 0" transform={`rotate(${a})`}/>)}
              {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.85" stroke="#B79AD8" strokeWidth="0.4" d="M0 0 C-3.5-1.6-4.8-8.3 0-9.9 C4.8-8.3 3.5-1.6 0 0" transform={`rotate(${a})`}/>)}
              <circle r="3.5" fill="#B8845A" stroke="none"/>
            </g></g>
            <g transform="translate(148,648)"><g className="r30">
              {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.7" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-4.5-2.4-6-11.5 0-16 C6-11.5 4.5-2.4 0 0" transform={`rotate(${a})`}/>)}
              {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.85" stroke="#B79AD8" strokeWidth="0.4" d="M0 0 C-3.5-1.6-4.8-8.3 0-9.9 C4.8-8.3 3.5-1.6 0 0" transform={`rotate(${a})`}/>)}
              <circle r="3.5" fill="#B8845A" stroke="none"/>
            </g></g>
          </svg>
        </div>

        {/* Right floral decoration — hidden, real flowers in hero photo */}
        <div className="absolute right-0 top-0 bottom-0 w-[clamp(130px,20vw,280px)] pointer-events-none select-none overflow-hidden" style={{ zIndex: 3, display: 'none' }}>
          <svg viewBox="0 0 220 900" className="w-full h-full" fill="none" stroke="#B79AD8" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.85 }}>
            <g transform="translate(220,0) scale(-1,1)">
              <g transform="translate(110,65)"><g className="r1">
                {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.7" d="M0 0 C-9.5-5.1-12.9-24.5 0-34 C12.9-24.5 9.5-5.1 0 0" transform={`rotate(${a})`}/>)}
                {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-7.5-3.4-10.2-17.7 0-21.1 C10.2-17.7 7.5-3.4 0 0" transform={`rotate(${a})`}/>)}
                <circle r="7.5" fill="#B8845A" stroke="none"/>
              </g></g>
              <g transform="translate(25,155)"><g className="r2">
                {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.7" d="M0 0 C-8.5-4.6-11.6-22.1 0-30.6 C11.6-22.1 8.5-4.6 0 0" transform={`rotate(${a})`}/>)}
                {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-6.8-3.1-9.2-16 0-19 C9.2-16 6.8-3.1 0 0" transform={`rotate(${a})`}/>)}
                <circle r="6.8" fill="#B8845A" stroke="none"/>
              </g></g>
              <g transform="translate(175,210)"><g className="r3">
                {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.6" d="M0 0 C-6.6-3.6-9-17.2 0-23.8 C9-17.2 6.6-3.6 0 0" transform={`rotate(${a})`}/>)}
                {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.4" d="M0 0 C-5.3-2.4-7.1-12.4 0-14.8 C7.1-12.4 5.3-2.4 0 0" transform={`rotate(${a})`}/>)}
                <circle r="5.3" fill="#B8845A" stroke="none"/>
              </g></g>
              <g transform="translate(60,320)"><g className="r4">
                {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.8" d="M0 0 C-12.4-6.6-16.8-31.8 0-44.2 C16.8-31.8 12.4-6.6 0 0" transform={`rotate(${a})`}/>)}
                {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.6" d="M0 0 C-9.7-4.4-13.3-23 0-27.4 C13.3-23 9.7-4.4 0 0" transform={`rotate(${a})`}/>)}
                <circle r="9.4" fill="#B8845A" stroke="none"/>
              </g></g>
              <g transform="translate(160,415)"><g className="r5">
                {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.7" d="M0 0 C-8.5-4.6-11.6-22.1 0-30.6 C11.6-22.1 8.5-4.6 0 0" transform={`rotate(${a})`}/>)}
                {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-6.8-3.1-9.2-16 0-19 C9.2-16 6.8-3.1 0 0" transform={`rotate(${a})`}/>)}
                <circle r="6.8" fill="#B8845A" stroke="none"/>
              </g></g>
              <g transform="translate(20,510)"><g className="r6">
                {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.7" d="M0 0 C-10.5-5.6-14.3-26.9 0-37.4 C14.3-26.9 10.5-5.6 0 0" transform={`rotate(${a})`}/>)}
                {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-8.2-3.7-11.2-19.5 0-23.1 C11.2-19.5 8.2-3.7 0 0" transform={`rotate(${a})`}/>)}
                <circle r="8.2" fill="#B8845A" stroke="none"/>
              </g></g>
              <g transform="translate(170,600)"><g className="r7">
                {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.6" d="M0 0 C-6.6-3.6-9-17.2 0-23.8 C9-17.2 6.6-3.6 0 0" transform={`rotate(${a})`}/>)}
                {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.4" d="M0 0 C-5.3-2.4-7.1-12.4 0-14.8 C7.1-12.4 5.3-2.4 0 0" transform={`rotate(${a})`}/>)}
                <circle r="5.3" fill="#B8845A" stroke="none"/>
              </g></g>
              <g transform="translate(50,700)"><g className="r8">
                {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.8" d="M0 0 C-12.4-6.6-16.8-31.8 0-44.2 C16.8-31.8 12.4-6.6 0 0" transform={`rotate(${a})`}/>)}
                {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.6" d="M0 0 C-9.7-4.4-13.3-23 0-27.4 C13.3-23 9.7-4.4 0 0" transform={`rotate(${a})`}/>)}
                <circle r="9.4" fill="#B8845A" stroke="none"/>
              </g></g>
              <g transform="translate(155,785)"><g className="r9">
                {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.7" d="M0 0 C-8.5-4.6-11.6-22.1 0-30.6 C11.6-22.1 8.5-4.6 0 0" transform={`rotate(${a})`}/>)}
                {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-6.8-3.1-9.2-16 0-19 C9.2-16 6.8-3.1 0 0" transform={`rotate(${a})`}/>)}
                <circle r="6.8" fill="#B8845A" stroke="none"/>
              </g></g>
              <g transform="translate(65,870)"><g className="r10">
                {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.7" d="M0 0 C-10.5-5.6-14.3-26.9 0-37.4 C14.3-26.9 10.5-5.6 0 0" transform={`rotate(${a})`}/>)}
                {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-8.2-3.7-11.2-19.5 0-23.1 C11.2-19.5 8.2-3.7 0 0" transform={`rotate(${a})`}/>)}
                <circle r="8.2" fill="#B8845A" stroke="none"/>
              </g></g>
              <g transform="translate(80,120)"><g className="r11">
                {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.6" d="M0 0 C-6.6-3.6-9-17.2 0-23.8 C9-17.2 6.6-3.6 0 0" transform={`rotate(${a})`}/>)}
                {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.4" d="M0 0 C-5.3-2.4-7.1-12.4 0-14.8 C7.1-12.4 5.3-2.4 0 0" transform={`rotate(${a})`}/>)}
                <circle r="5.3" fill="#B8845A" stroke="none"/>
              </g></g>
              <g transform="translate(185,310)"><g className="r12">
                {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.7" d="M0 0 C-8.5-4.6-11.6-22.1 0-30.6 C11.6-22.1 8.5-4.6 0 0" transform={`rotate(${a})`}/>)}
                {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-6.8-3.1-9.2-16 0-19 C9.2-16 6.8-3.1 0 0" transform={`rotate(${a})`}/>)}
                <circle r="6.8" fill="#B8845A" stroke="none"/>
              </g></g>
              <g transform="translate(35,390)"><g className="r13">
                {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.6" d="M0 0 C-6.6-3.6-9-17.2 0-23.8 C9-17.2 6.6-3.6 0 0" transform={`rotate(${a})`}/>)}
                {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.4" d="M0 0 C-5.3-2.4-7.1-12.4 0-14.8 C7.1-12.4 5.3-2.4 0 0" transform={`rotate(${a})`}/>)}
                <circle r="5.3" fill="#B8845A" stroke="none"/>
              </g></g>
              <g transform="translate(125,480)"><g className="r14">
                {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.7" d="M0 0 C-10.5-5.6-14.3-26.9 0-37.4 C14.3-26.9 10.5-5.6 0 0" transform={`rotate(${a})`}/>)}
                {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-8.2-3.7-11.2-19.5 0-23.1 C11.2-19.5 8.2-3.7 0 0" transform={`rotate(${a})`}/>)}
                <circle r="8.2" fill="#B8845A" stroke="none"/>
              </g></g>
              <g transform="translate(90,575)"><g className="r15">
                {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.7" d="M0 0 C-8.5-4.6-11.6-22.1 0-30.6 C11.6-22.1 8.5-4.6 0 0" transform={`rotate(${a})`}/>)}
                {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-6.8-3.1-9.2-16 0-19 C9.2-16 6.8-3.1 0 0" transform={`rotate(${a})`}/>)}
                <circle r="6.8" fill="#B8845A" stroke="none"/>
              </g></g>
              <g transform="translate(195,665)"><g className="r16">
                {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.6" d="M0 0 C-6.6-3.6-9-17.2 0-23.8 C9-17.2 6.6-3.6 0 0" transform={`rotate(${a})`}/>)}
                {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.4" d="M0 0 C-5.3-2.4-7.1-12.4 0-14.8 C7.1-12.4 5.3-2.4 0 0" transform={`rotate(${a})`}/>)}
                <circle r="5.3" fill="#B8845A" stroke="none"/>
              </g></g>
              <g transform="translate(115,760)"><g className="r17">
                {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.7" d="M0 0 C-8.5-4.6-11.6-22.1 0-30.6 C11.6-22.1 8.5-4.6 0 0" transform={`rotate(${a})`}/>)}
                {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-6.8-3.1-9.2-16 0-19 C9.2-16 6.8-3.1 0 0" transform={`rotate(${a})`}/>)}
                <circle r="6.8" fill="#B8845A" stroke="none"/>
              </g></g>
              <g transform="translate(30,840)"><g className="r18">
                {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.6" d="M0 0 C-6.6-3.6-9-17.2 0-23.8 C9-17.2 6.6-3.6 0 0" transform={`rotate(${a})`}/>)}
                {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.4" d="M0 0 C-5.3-2.4-7.1-12.4 0-14.8 C7.1-12.4 5.3-2.4 0 0" transform={`rotate(${a})`}/>)}
                <circle r="5.3" fill="#B8845A" stroke="none"/>
              </g></g>
              <g transform="translate(195,130)"><g className="r19">
                {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.7" d="M0 0 C-8.5-4.6-11.6-22.1 0-30.6 C11.6-22.1 8.5-4.6 0 0" transform={`rotate(${a})`}/>)}
                {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-6.8-3.1-9.2-16 0-19 C9.2-16 6.8-3.1 0 0" transform={`rotate(${a})`}/>)}
                <circle r="6.8" fill="#B8845A" stroke="none"/>
              </g></g>
              <g transform="translate(195,490)"><g className="r20">
                {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.65" stroke="#B79AD8" strokeWidth="0.6" d="M0 0 C-6.6-3.6-9-17.2 0-23.8 C9-17.2 6.6-3.6 0 0" transform={`rotate(${a})`}/>)}
                {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.8" stroke="#B79AD8" strokeWidth="0.4" d="M0 0 C-5.3-2.4-7.1-12.4 0-14.8 C7.1-12.4 5.3-2.4 0 0" transform={`rotate(${a})`}/>)}
                <circle r="5.3" fill="#B8845A" stroke="none"/>
              </g></g>
              <g transform="translate(148,253)"><g className="r21">
                {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.7" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-4.5-2.4-6-11.5 0-16 C6-11.5 4.5-2.4 0 0" transform={`rotate(${a})`}/>)}
                {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.85" stroke="#B79AD8" strokeWidth="0.4" d="M0 0 C-3.5-1.6-4.8-8.3 0-9.9 C4.8-8.3 3.5-1.6 0 0" transform={`rotate(${a})`}/>)}
                <circle r="3.5" fill="#B8845A" stroke="none"/>
              </g></g>
              <g transform="translate(48,272)"><g className="r22">
                {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.7" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-4.5-2.4-6-11.5 0-16 C6-11.5 4.5-2.4 0 0" transform={`rotate(${a})`}/>)}
                {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.85" stroke="#B79AD8" strokeWidth="0.4" d="M0 0 C-3.5-1.6-4.8-8.3 0-9.9 C4.8-8.3 3.5-1.6 0 0" transform={`rotate(${a})`}/>)}
                <circle r="3.5" fill="#B8845A" stroke="none"/>
              </g></g>
              <g transform="translate(105,348)"><g className="r23">
                {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.7" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-4.5-2.4-6-11.5 0-16 C6-11.5 4.5-2.4 0 0" transform={`rotate(${a})`}/>)}
                {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.85" stroke="#B79AD8" strokeWidth="0.4" d="M0 0 C-3.5-1.6-4.8-8.3 0-9.9 C4.8-8.3 3.5-1.6 0 0" transform={`rotate(${a})`}/>)}
                <circle r="3.5" fill="#B8845A" stroke="none"/>
              </g></g>
              <g transform="translate(178,368)"><g className="r24">
                {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.7" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-4.5-2.4-6-11.5 0-16 C6-11.5 4.5-2.4 0 0" transform={`rotate(${a})`}/>)}
                {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.85" stroke="#B79AD8" strokeWidth="0.4" d="M0 0 C-3.5-1.6-4.8-8.3 0-9.9 C4.8-8.3 3.5-1.6 0 0" transform={`rotate(${a})`}/>)}
                <circle r="3.5" fill="#B8845A" stroke="none"/>
              </g></g>
              <g transform="translate(38,448)"><g className="r25">
                {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.7" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-4.5-2.4-6-11.5 0-16 C6-11.5 4.5-2.4 0 0" transform={`rotate(${a})`}/>)}
                {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.85" stroke="#B79AD8" strokeWidth="0.4" d="M0 0 C-3.5-1.6-4.8-8.3 0-9.9 C4.8-8.3 3.5-1.6 0 0" transform={`rotate(${a})`}/>)}
                <circle r="3.5" fill="#B8845A" stroke="none"/>
              </g></g>
              <g transform="translate(132,464)"><g className="r26">
                {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.7" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-4.5-2.4-6-11.5 0-16 C6-11.5 4.5-2.4 0 0" transform={`rotate(${a})`}/>)}
                {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.85" stroke="#B79AD8" strokeWidth="0.4" d="M0 0 C-3.5-1.6-4.8-8.3 0-9.9 C4.8-8.3 3.5-1.6 0 0" transform={`rotate(${a})`}/>)}
                <circle r="3.5" fill="#B8845A" stroke="none"/>
              </g></g>
              <g transform="translate(192,537)"><g className="r27">
                {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.7" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-4.5-2.4-6-11.5 0-16 C6-11.5 4.5-2.4 0 0" transform={`rotate(${a})`}/>)}
                {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.85" stroke="#B79AD8" strokeWidth="0.4" d="M0 0 C-3.5-1.6-4.8-8.3 0-9.9 C4.8-8.3 3.5-1.6 0 0" transform={`rotate(${a})`}/>)}
                <circle r="3.5" fill="#B8845A" stroke="none"/>
              </g></g>
              <g transform="translate(62,552)"><g className="r28">
                {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.7" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-4.5-2.4-6-11.5 0-16 C6-11.5 4.5-2.4 0 0" transform={`rotate(${a})`}/>)}
                {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.85" stroke="#B79AD8" strokeWidth="0.4" d="M0 0 C-3.5-1.6-4.8-8.3 0-9.9 C4.8-8.3 3.5-1.6 0 0" transform={`rotate(${a})`}/>)}
                <circle r="3.5" fill="#B8845A" stroke="none"/>
              </g></g>
              <g transform="translate(48,632)"><g className="r29">
                {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.7" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-4.5-2.4-6-11.5 0-16 C6-11.5 4.5-2.4 0 0" transform={`rotate(${a})`}/>)}
                {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.85" stroke="#B79AD8" strokeWidth="0.4" d="M0 0 C-3.5-1.6-4.8-8.3 0-9.9 C4.8-8.3 3.5-1.6 0 0" transform={`rotate(${a})`}/>)}
                <circle r="3.5" fill="#B8845A" stroke="none"/>
              </g></g>
              <g transform="translate(148,648)"><g className="r30">
                {[0,72,144,216,288].map(a=><path key={a} fill="#B79AD8" fillOpacity="0.7" stroke="#B79AD8" strokeWidth="0.5" d="M0 0 C-4.5-2.4-6-11.5 0-16 C6-11.5 4.5-2.4 0 0" transform={`rotate(${a})`}/>)}
                {[36,108,180,252,324].map(a=><path key={a} fill="#C8A2C8" fillOpacity="0.85" stroke="#B79AD8" strokeWidth="0.4" d="M0 0 C-3.5-1.6-4.8-8.3 0-9.9 C4.8-8.3 3.5-1.6 0 0" transform={`rotate(${a})`}/>)}
                <circle r="3.5" fill="#B8845A" stroke="none"/>
              </g></g>
            </g>
          </svg>
        </div>

        {/* Left aside */}
        <motion.aside
          initial={{ opacity: 0, x: -30 }}
          animate={heroReady ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.6 }}
          className="absolute left-[7%] top-[22%] z-10 hidden lg:block"
          style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '14px', lineHeight: 1.7, letterSpacing: '4px', color: '#432b50' }}
        >
          TWO HEARTS<br/>A SHARED<br/>TOMORROW
          <div style={{ width: '58px', borderTop: '1px solid #432b5066', marginTop: '20px' }} />
        </motion.aside>

        {/* Right aside */}
        <motion.aside
          initial={{ opacity: 0, x: 30 }}
          animate={heroReady ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.7 }}
          className="absolute right-[5%] top-[36%] z-10 text-center hidden lg:block"
          style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '14px', lineHeight: 1.7, letterSpacing: '4px', color: '#432b50' }}
        >
          LOVE<br/>CULTURE<br/>FAMILY<br/>FOREVER
          <div style={{ width: '58px', borderTop: '1px solid #432b5066', marginTop: '20px', margin: '20px auto 0' }} />
        </motion.aside>

        {/* Hero content */}
        <motion.div
          className="relative z-10 text-center px-6 max-w-3xl mx-auto pt-20 md:pt-24"
          style={{ opacity: heroOpacity }}
        >
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={heroReady ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-[12px] uppercase font-sans mb-6"
            style={{ letterSpacing: '6px', color: '#432b50cc' }}
          >
            You are cordially invited to celebrate
          </motion.p>

          {/* Monogram — large serif, deep purple */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 20 }}
            animate={heroReady ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ duration: 1.1, delay: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
            style={{ fontFamily: 'Georgia, serif', color: '#8F5DAF', letterSpacing: '-18px', lineHeight: 0.78, margin: '0 0 12px', fontSize: 'clamp(5rem, 13vw, 11rem)' }}
          >
            E<span style={{ fontStyle: 'italic', fontSize: '0.72em', letterSpacing: '-4px' }}>&amp;</span>E
          </motion.div>

          {/* Names */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={heroReady ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.4rem, 3.5vw, 2.4rem)', letterSpacing: '10px', color: '#432b50', margin: '0 0 6px', fontWeight: 'normal' }}
          >
            EKOW <i>&amp;</i> EKUA
          </motion.h2>

          {/* Ornament */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0.4 }}
            animate={heroReady ? { opacity: 1, scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.65 }}
            style={{ fontSize: '22px', margin: '10px 0', color: '#8F5DAFaa' }}
          >
            ✤
          </motion.div>

          {/* Date */}
          <motion.h3
            initial={{ opacity: 0, y: 15 }}
            animate={heroReady ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.75 }}
            style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(0.9rem, 2vw, 1.2rem)', letterSpacing: '9px', color: '#432b50', margin: '8px 0 4px', fontWeight: 'normal' }}
          >
            {engagementDate.replace('Wednesday, ', '').replace('Thursday, ', '').toUpperCase()}
          </motion.h3>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroReady ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="flex flex-col items-center gap-3"
          >
            <Link
              href="/rsvp"
              className="inline-block rounded-full text-white text-[12px] font-sans tracking-[4px] px-16 py-5 transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(90deg,#B79AD8,#77539a)' }}
            >
              RSVP NOW →
            </Link>
            <Link
              href="/program"
              className="text-[10px] font-sans tracking-[3px] pb-1 transition-opacity hover:opacity-70"
              style={{ color: '#432b50', borderBottom: '1px solid #432b5055' }}
            >
              VIEW WEDDING DETAILS
            </Link>
          </motion.div>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={heroReady ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 1.1 }}
          className="relative z-10 w-full px-4 mt-10 pb-12"
        >
          <p className="text-center text-[10px] uppercase font-sans mb-5" style={{ letterSpacing: '4px', color: '#432b5077' }}>
            Counting down to the big day
          </p>
          <Countdown />
        </motion.div>

        {/* Scroll indicator */}
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
          <div className="relative w-7 h-7">
            <span className="absolute inset-0 rounded-full border animate-pulse-ring" style={{ borderColor: '#8F5DAF55' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <ArrowDown size={13} className="animate-bounce" style={{ color: '#8F5DAF' }} />
            </div>
          </div>
          <span className="text-[9px] uppercase tracking-[0.3em] font-sans" style={{ color: '#432b5077' }}>Scroll to Explore</span>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          GOLD MARQUEE BAND
      ════════════════════════════════════════════════ */}
      {showMarquee && <div
        className="marquee-wrap overflow-hidden border-y py-3.5"
        style={{ background: '#f1e8f1', borderColor: '#8F5DAF30' }}
        aria-hidden="true"
      >
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span
              key={i}
              className="inline-block px-7 font-sans text-xs tracking-[0.3em] uppercase select-none"
              style={{ color: '#8F5DAF' }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>}

      {/* ════════════════════════════════════════════════
          PHOTO MOSAIC  — "A Wedding in the Making"
      ════════════════════════════════════════════════ */}
      {showMosaic && <section
        ref={mosaicRef}
        className="relative py-24 px-4 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #f8f4ff 0%, #fef7ed 100%)' }}
      >
        {/* Decorative bg text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="font-script text-[22vw] leading-none" style={{ color: 'rgba(91,78,154,0.04)' }}>
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
            <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.42em] font-sans mb-3" style={{ color: '#7B6DAF' }}>
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

          {/* Photo grid — coming soon */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4"
            style={{ gridTemplateRows: '280px 280px' }}
            variants={fadeUp}
            initial="hidden"
            animate={mosaicInView ? 'visible' : 'hidden'}
            transition={{ delay: 0.1 }}
          >
            {/* Left tall */}
            <div
              className="rounded-2xl row-span-2 border-2 border-dashed flex flex-col items-center justify-center gap-4"
              style={{ borderColor: 'rgba(183,154,216,0.3)', background: 'rgba(183,154,216,0.06)' }}
            >
              <p className="font-script text-5xl" style={{ color: '#C9A227' }}>E &amp; E</p>
              <p className="text-xs uppercase tracking-[0.4em] text-center font-sans leading-relaxed" style={{ color: '#8F5DAF' }}>
                Our Photos<br />Coming Soon
              </p>
              <div className="text-3xl opacity-40">📸</div>
            </div>
            {/* Top right */}
            <div
              className="rounded-2xl border-2 border-dashed flex items-center justify-center"
              style={{ borderColor: 'rgba(183,154,216,0.25)', background: 'rgba(183,154,216,0.04)' }}
            >
              <div className="text-4xl opacity-25">✦</div>
            </div>
            {/* Bottom right */}
            <div
              className="rounded-2xl border-2 border-dashed flex items-center justify-center"
              style={{ borderColor: 'rgba(183,154,216,0.25)', background: 'rgba(183,154,216,0.04)' }}
            >
              <div className="text-4xl opacity-25">✦</div>
            </div>
            {/* 4th cell desktop */}
            <div
              className="hidden md:flex rounded-2xl border-2 border-dashed items-center justify-center"
              style={{ borderColor: 'rgba(183,154,216,0.25)', background: 'rgba(183,154,216,0.04)' }}
            >
              <div className="text-4xl opacity-25">✦</div>
            </div>
          </motion.div>

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
      </section>}

      {/* ════════════════════════════════════════════════
          SAVE THE DATE  — timeline (existing)
      ════════════════════════════════════════════════ */}
      {showSaveDate && <section className="relative py-28 px-4 overflow-hidden" style={{ background: 'linear-gradient(180deg, #f5f3ff 0%, #fef7ed 100%)' }}>
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
                  <p className="font-serif text-xl text-earth-800 font-semibold mb-2">{engagementDate}</p>
                  <div className="flex items-center gap-1.5 text-earth-500 text-sm md:justify-end">
                    <MapPin size={14} />
                    <span>{venueEngagement}</span>
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
                  <p className="font-serif text-xl text-earth-800 font-semibold mb-2">{weddingDate}</p>
                  <div className="flex items-center gap-1.5 text-earth-500 text-sm">
                    <MapPin size={14} />
                    <span>{venueWedding}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>}

      {/* ════════════════════════════════════════════════
          MEET THE COUPLE
      ════════════════════════════════════════════════ */}
      {showCouple && <section
        ref={coupleRef}
        className="relative py-28 px-4 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1A1640 0%, #252048 50%, #110E38 100%)' }}
      >
        {/* Ambient glows */}
        <div className="absolute top-0 left-0 w-[50vw] h-64 rounded-full opacity-30 pointer-events-none"
             style={{ background: 'radial-gradient(ellipse at left, #5B4E9A, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[40vw] h-64 rounded-full opacity-20 pointer-events-none"
             style={{ background: 'radial-gradient(ellipse at right, #4A3D7A, transparent 70%)' }} />

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
            <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.45em] font-sans mb-3" style={{ color: '#D8BFD8', opacity: 0.65 }}>
              The Celebration
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-serif text-4xl md:text-5xl mb-3" style={{ color: 'white' }}>
              Meet the Couple
            </motion.h2>
            <motion.div variants={fadeUp} className="ornament-line max-w-52 mx-auto text-xs" style={{ color: 'rgba(201,168,76,0.5)' }}>
              ✦
            </motion.div>
            <motion.p variants={fadeUp} className="mt-5 font-sans max-w-lg mx-auto leading-relaxed text-sm" style={{ color: '#D8BFD8', opacity: 0.7 }}>
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
                    background: 'linear-gradient(135deg, #252048, #5B4E9A, #3D3575)',
                    border: '2px solid rgba(201,168,76,0.4)',
                  }}
                >
                  <span
                    className="font-script"
                    style={{
                      fontSize: '3.5rem',
                      backgroundImage: 'linear-gradient(135deg, #C8956C, #e0d080, #C8956C)',
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

              <h3 className="font-serif text-2xl text-white mb-1">{groomName}</h3>
              <p className="font-sans text-xs uppercase tracking-[0.3em] mb-4" style={{ color: '#C8956C' }}>
                The Groom
              </p>
              <div className="w-16 h-px mx-auto mb-4" style={{ background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.5), transparent)' }} />
              <p className="font-sans text-sm leading-relaxed" style={{ color: '#D8BFD8', opacity: 0.75 }}>
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
                    background: 'linear-gradient(135deg, #3D3575, #7B6DAF, #5B4E9A)',
                    border: '2px solid rgba(201,168,76,0.4)',
                  }}
                >
                  <span
                    className="font-script"
                    style={{
                      fontSize: '3.5rem',
                      backgroundImage: 'linear-gradient(135deg, #C8956C, #e0d080, #C8956C)',
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

              <h3 className="font-serif text-2xl text-white mb-1">{brideName}</h3>
              <p className="font-sans text-xs uppercase tracking-[0.3em] mb-4" style={{ color: '#C8956C' }}>
                The Bride
              </p>
              <div className="w-16 h-px mx-auto mb-4" style={{ background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.5), transparent)' }} />
              <p className="font-sans text-sm leading-relaxed" style={{ color: '#D8BFD8', opacity: 0.75 }}>
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
              <Heart size={18} className="fill-current" style={{ color: '#C8956C' }} />
              <div className="h-px flex-1 max-w-[80px]" style={{ background: 'linear-gradient(to left, transparent, rgba(201,168,76,0.35))' }} />
            </div>
            <p className="font-serif italic text-xl" style={{ color: 'rgba(204,160,204,0.75)' }}>
              &ldquo;Two hearts, one story, forever written in love.&rdquo;
            </p>
          </motion.div>
        </div>
      </section>}

      {/* ════════════════════════════════════════════════
          OUR STORY — dramatic quote
      ════════════════════════════════════════════════ */}
      <section className="py-28 px-4 bg-purple-950 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[65vw] h-72 rounded-full pointer-events-none"
             style={{ background: 'radial-gradient(ellipse at top, rgba(91,78,154,0.25), transparent 70%)' }} />
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
              {storyText ?? 'Ekow and Ekua invite you to witness their union — a celebration of love, faith, and family. Together with their families, they joyfully request the honour of your presence on their special day.'}
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
      {showGallery && <section
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

        {/* Coming soon — placeholder strip */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={galleryInView ? 'visible' : 'hidden'}
          transition={{ delay: 0.25 }}
          className="px-4 md:px-8"
        >
          <div className="flex items-center justify-center gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className="flex-shrink-0 rounded-2xl flex flex-col items-center justify-center gap-3 border-2 border-dashed"
                style={{
                  width: 260, height: 360,
                  borderColor: 'rgba(183,154,216,0.35)',
                  background: 'linear-gradient(160deg, rgba(183,154,216,0.08) 0%, rgba(201,162,39,0.05) 100%)',
                }}
              >
                {i === 1 ? (
                  <>
                    <p className="font-script text-4xl" style={{ color: '#C9A227' }}>E &amp; E</p>
                    <p className="text-xs uppercase tracking-[0.4em] font-sans text-center px-4" style={{ color: '#8F5DAF' }}>
                      Photos<br />Coming Soon
                    </p>
                    <div className="text-2xl opacity-60">📷</div>
                  </>
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center border border-dashed" style={{ borderColor: 'rgba(183,154,216,0.4)', color: 'rgba(143,93,175,0.3)' }}>
                    ✦
                  </div>
                )}
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
      </section>}

      {/* ════════════════════════════════════════════════
          WEDDING DETAILS — Bento grid
      ════════════════════════════════════════════════ */}
      {showBento && <section
        ref={bentoSecRef}
        className="py-24 px-4 border-t"
        style={{ background: 'linear-gradient(180deg, #1A1640 0%, #252048 100%)', borderColor: 'rgba(91,78,154,0.5)' }}
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
      </section>}

      {/* ════════════════════════════════════════════════
          RSVP CTA — dramatic close
      ════════════════════════════════════════════════ */}
      {showRsvpCta && <section className="relative py-36 px-4 overflow-hidden bg-cream">
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
            <strong className="text-earth-800">{rsvpDeadline}</strong>.
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
              <span>{weddingDate.replace('Friday, ', '').replace('Saturday, ', '')}</span>
            </div>
            <span className="hidden sm:block text-earth-300">·</span>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-gold" />
              <span>{venueWedding}</span>
            </div>
          </div>
        </div>
      </section>}
    </>
  )
}
