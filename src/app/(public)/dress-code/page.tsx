import Link from 'next/link'

const PALETTE = [
  { name: 'Royal Purple',  hex: '#6B21A8', light: false },
  { name: 'Lavender',      hex: '#C4B5FD', light: true  },
  { name: 'Gold',          hex: '#C9A84C', light: false },
  { name: 'Ivory / Cream', hex: '#FEF7ED', light: true, border: true },
  { name: 'Earth Brown',   hex: '#92400E', light: false },
  { name: 'Sage Green',    hex: '#86A790', light: false },
]

const GUIDES = [
  {
    group: 'Ladies',
    emoji: '👗',
    tag: 'She',
    items: [
      { icon: '✦', text: 'Elegant gowns or cocktail dresses in wedding palette colours' },
      { icon: '✦', text: 'Fascinator or headpieces warmly encouraged' },
      { icon: '✦', text: 'Heels or elegant flats — your comfort matters' },
      { icon: '✦', text: 'Kente, Ankara, or Kaba & Slit in palette colours celebrated' },
      { icon: '⚠', text: 'Please avoid white, ivory or any shade that may resemble bridal attire', warn: true },
    ],
  },
  {
    group: 'Gentlemen',
    emoji: '🤵',
    tag: 'He',
    items: [
      { icon: '✦', text: 'Formal suit or African formal wear (Kente, Ankara warmly welcomed)' },
      { icon: '✦', text: 'Traditional attire in palette colours is highly appreciated' },
      { icon: '✦', text: 'Smart shoes — no trainers please' },
      { icon: '✦', text: 'Pocket square or tie in wedding colours adds a lovely touch' },
    ],
  },
]

export default function DressCodePage() {
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
            Smart Formal · African Formal · Embrace the palette
          </p>
        </div>
      </section>

      {/* ── Colour Palette ─────────────────────────────── */}
      <section className="bg-soft-gradient py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-lavender-500/80 text-xs uppercase tracking-[0.4em] font-sans mb-3 text-purple-400">
              Our colours
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-purple-900">Wedding Colour Palette</h2>
            <p className="text-earth-500 font-sans text-sm mt-3 max-w-sm mx-auto">
              We invite you to dress in shades from this palette to make our day even more beautiful
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {PALETTE.map(c => (
              <div key={c.name} className="group cursor-default">
                <div
                  className={`w-full aspect-square rounded-2xl mb-3 shadow-lg transition-transform
                               duration-300 group-hover:-translate-y-1 group-hover:shadow-xl
                               ${c.border ? 'border-2 border-lavender-200' : ''}`}
                  style={{ backgroundColor: c.hex }}
                />
                <p className={`text-xs text-center font-sans leading-tight
                               ${c.name === 'Ivory / Cream' ? 'text-earth-500' : 'text-earth-600'}`}>
                  {c.name}
                </p>
                <p className="text-[10px] text-center text-earth-400 font-mono mt-0.5">{c.hex}</p>
              </div>
            ))}
          </div>
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

      {/* ── African Wear Spotlight ──────────────────────── */}
      <section className="bg-soft-gradient py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl border border-lavender-100 shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">🌍</div>
            <h3 className="font-serif text-2xl text-purple-900 mb-3">African Formal Wear Welcome</h3>
            <p className="text-earth-600 font-sans text-sm leading-relaxed mb-6 max-w-md mx-auto">
              We celebrate our heritage! Kente cloth, Ankara prints, Kaba &amp; Slit,
              and all forms of African formal attire in our wedding palette are warmly
              embraced and encouraged.
            </p>
            <div className="ornament-line max-w-32 mx-auto text-lavender-300 text-xs">✦</div>
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
