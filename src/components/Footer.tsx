import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-purple-950 text-lavender-300 py-12 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="font-script text-5xl text-gold mb-2">E &amp; E</div>
        <p className="text-lavender-400 font-serif italic text-lg mb-6">Ekow &amp; Ekua</p>

        <div className="floral-divider text-purple-700 mb-6">✦ ✦ ✦</div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm mb-8">
          {[
            { href: '/program',    label: 'Program' },
            { href: '/rsvp',       label: 'RSVP' },
            { href: '/dress-code', label: 'Dress Code' },
            { href: '/gifts',      label: 'Gifts' },
            { href: '/gallery',    label: 'Gallery' },
            { href: '/contact',    label: 'Contact' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="hover:text-gold transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="text-earth-500 text-sm space-y-1">
          <p>📅 Engagement — 17 December 2026 · Kasoa</p>
          <p>💒 Wedding — 19 December 2026 · Bethany Methodist Church, Dzorwulu, Accra</p>
        </div>

        <div className="mt-8 pt-6 border-t border-purple-800 text-purple-600 text-xs">
          <p>Made with love for Ekow &amp; Ekua</p>
          <p className="mt-1">
            <Link href="/admin" className="hover:text-purple-400 transition-colors">
              Admin
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
