export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { PaletteDisplay } from '@/components/PaletteDisplay'
import { prisma } from '@/lib/prisma'

async function getDressCodeNote(): Promise<string | null> {
  try {
    const row = await prisma.siteContent.findUnique({ where: { key: 'dress_code_note' } })
    return row?.value ?? null
  } catch {
    return null
  }
}

const GUIDES = [
  {
    group: 'Ladies',
    emoji: '👗',
    tag: 'She',
    items: [
      { icon: '✦', text: 'Elegant Outfits in palette colors are celebrated (white wedding)' },
      { icon: '✦', text: 'Kente, African print is celebrated' },
      { icon: '✦', text: 'Heels or flats' },
    ],
  },
  {
    group: 'Gentlemen',
    emoji: '🤵',
    tag: 'He',
    items: [
      { icon: '✦', text: 'Formal suit/Traditional cloth/kaftan' },
      { icon: '✦', text: 'Pocket square or tie' },
      { icon: '✦', text: 'Smart shoes' },
    ],
  },
]

export default async function DressCodePage() {
  const dressCodeNote = await getDressCodeNote()
  return (
    <>
      {/* ── Page Hero ──────────────────────────────────── */}
      <section className="relative bg-hero-gradient pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-purple-700/20 blur-[80px]" />
          <div className="absolute bottom-0 left-[-5%] w-[25vw] h-[25vw] rounded-full bg-earth-800/15 blur-[60px]" />
        </div>
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <p className="text-lavender-400/60 text-xs uppercase tracking-[0.4em] font-sans mb-4">
            Ekow &amp; Ekua · 2026
          </p>
          <h1 className="font-script text-6xl md:text-7xl text-gold mb-3 drop-shadow-lg">Dress Code</h1>
          <div className="ornament-line max-w-40 mx-auto text-gold/40 text-xs mb-5">✦</div>
          <p className="text-lavender-200/70 font-sans text-sm">
            {dressCodeNote ?? 'Smart Formal · African Formal · Embrace the palette'}
          </p>
        </div>
      </section>

      {/* ── Colour Palette ─────────────────────────────── */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(180deg, #F5F3FF 0%, #FFF4E1 100%)' }}>
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.5em] font-sans mb-3" style={{ color: '#8F5DAF' }}>
              Our Colours
            </p>
            <h2 className="font-serif text-3xl md:text-4xl" style={{ color: '#432b50' }}>Wedding Colour Palette</h2>
            {/* Gold divider */}
            <div className="flex items-center justify-center gap-4 my-4">
              <div className="h-px flex-1 max-w-28" style={{ background: '#C9A227' }} />
              <span className="font-script text-2xl" style={{ color: '#C9A227' }}>Ekow &amp; Ekua</span>
              <div className="h-px flex-1 max-w-28" style={{ background: '#C9A227' }} />
            </div>
            <p className="font-sans text-sm mt-2 max-w-sm mx-auto" style={{ color: '#8F5DAF', opacity: 0.75 }}>
              We invite you to dress in shades from this palette to make our day even more beautiful
            </p>
          </div>

          <PaletteDisplay />

        </div>
      </section>

      {/* ── Ladies & Gents ─────────────────────────────── */}
      <section className="bg-purple-950 py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-lavender-500/60 text-xs uppercase tracking-[0.4em] font-sans mb-3">Dress Guide</p>
            <h2 className="font-serif text-3xl md:text-4xl text-white">What to Wear</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {GUIDES.map(g => (
              <div key={g.group}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-7
                           hover:bg-white/8 transition-colors duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">
                    {g.emoji}
                  </div>
                  <div>
                    <p className="text-lavender-400/60 text-xs uppercase tracking-widest">{g.tag}</p>
                    <h3 className="font-serif text-xl text-white">{g.group}</h3>
                  </div>
                </div>
                <ul className="space-y-3">
                  {g.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className={`mt-0.5 flex-shrink-0 text-xs font-bold ${
                        (item as any).warn ? 'text-yellow-400' : 'text-gold'
                      }`}>
                        {item.icon}
                      </span>
                      <span className={`text-sm leading-relaxed ${
                        (item as any).warn ? 'text-yellow-200/80' : 'text-lavender-300/80'
                      }`}>
                        {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Kind Note ──────────────────────────────────── */}
      <section className="bg-purple-950 py-14 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <p className="font-script text-4xl text-gold mb-3">A Kind Note</p>
          <p className="text-lavender-300/80 font-sans text-sm leading-relaxed mb-6">
            We want everyone to feel beautiful, celebrated, and comfortable. If you have any
            questions about the dress code, please don&apos;t hesitate to reach out.
          </p>
          <Link href="/contact" className="btn-primary !py-2.5 !px-6 !text-sm">
            Contact Us
          </Link>
        </div>
      </section>
    </>
  )
}
