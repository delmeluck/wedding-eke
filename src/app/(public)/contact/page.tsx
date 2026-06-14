export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { Phone, Mail, MapPin, ExternalLink, MessageCircle } from 'lucide-react'
import { generateQRCodeDataURL } from '@/lib/qrcode'

async function getContent() {
  const keys = ['contact_person_name', 'contact_person_phone', 'contact_person_email',
                 'contact_person2_name', 'contact_person2_phone']
  const rows = await prisma.siteContent.findMany({ where: { key: { in: keys } } })
  return Object.fromEntries(rows.map(r => [r.key, r.value]))
}

const VENUES = [
  {
    label:   'Engagement Ceremony',
    place:   'Kasoa',
    desc:    'Kasoa, Central Region, Ghana',
    date:    '17 December 2026',
    emoji:   '💍',
    mapLink: 'https://maps.google.com/?q=Kasoa,+Ghana',
  },
  {
    label:   'Wedding Ceremony',
    place:   'Bethany Methodist Church',
    desc:    'Dzorwulu, Accra, Ghana',
    date:    '19 December 2026',
    emoji:   '💒',
    mapLink: 'https://maps.google.com/?q=Bethany+Methodist+Church,+Dzorwulu,+Accra,+Ghana',
  },
]

export default async function ContactPage() {
  const [content, engQR, weddQR] = await Promise.all([
    getContent(),
    generateQRCodeDataURL('https://maps.google.com/?q=Kasoa,+Ghana'),
    generateQRCodeDataURL('https://maps.google.com/?q=Bethany+Methodist+Church,+Dzorwulu,+Accra,+Ghana'),
  ])

  const qrMap: Record<string, string> = {
    'Engagement Ceremony': engQR,
    'Wedding Ceremony':    weddQR,
  }

  const hasContacts = content.contact_person_name || content.contact_person2_name

  return (
    <>
      {/* ── Page Hero ──────────────────────────────────── */}
      <section className="relative bg-hero-gradient pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-purple-700/25 blur-[80px]" />
          <div className="absolute bottom-0 left-[-5%] w-[30vw] h-[30vw] rounded-full bg-earth-800/20 blur-[60px]" />
        </div>
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <p className="text-lavender-400/60 text-xs uppercase tracking-[0.4em] font-sans mb-4">
            Ekow &amp; Ekua · 2026
          </p>
          <h1 className="font-script text-6xl md:text-7xl text-gold mb-3 drop-shadow-lg">Contact</h1>
          <div className="ornament-line max-w-40 mx-auto text-gold/40 text-xs mb-5">✦</div>
          <p className="text-lavender-200/70 font-sans text-sm">
            Have a question? We&apos;re happy to help.
          </p>
        </div>
      </section>

      {/* ── Contact Persons ─────────────────────────────── */}
      <section className="bg-soft-gradient py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-purple-400 text-xs uppercase tracking-[0.4em] font-sans mb-3">Get in touch</p>
            <h2 className="font-serif text-3xl md:text-4xl text-purple-900">Contact Persons</h2>
          </div>

          {!hasContacts ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-lavender-100">
              <MessageCircle size={36} className="text-lavender-300 mx-auto mb-3" />
              <p className="font-serif text-xl text-earth-400 italic">Contact details coming soon</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {content.contact_person_name && (
                <ContactCard
                  badge="Primary Contact"
                  name={content.contact_person_name}
                  phone={content.contact_person_phone}
                  email={content.contact_person_email}
                />
              )}
              {content.contact_person2_name && (
                <ContactCard
                  badge="Secondary Contact"
                  name={content.contact_person2_name}
                  phone={content.contact_person2_phone}
                />
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Directions ─────────────────────────────────── */}
      <section className="bg-purple-950 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-lavender-500/60 text-xs uppercase tracking-[0.4em] font-sans mb-3">
              Getting here
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-white">Directions</h2>
            <p className="text-lavender-300/70 font-sans text-sm mt-3">
              Scan the QR code or tap the button to open directions in Google Maps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VENUES.map(v => (
              <div key={v.label}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-7
                           hover:bg-white/8 transition-colors duration-300">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">
                    {v.emoji}
                  </div>
                  <div>
                    <p className="text-lavender-400/60 text-[11px] uppercase tracking-widest">{v.date}</p>
                    <h3 className="font-serif text-lg text-white leading-snug">{v.label}</h3>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-lavender-300/70 text-sm mb-6">
                  <MapPin size={14} className="text-gold mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white/90 font-medium">{v.place}</p>
                    <p className="text-lavender-400/60 text-xs mt-0.5">{v.desc}</p>
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center bg-white rounded-2xl p-5 mb-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrMap[v.label]}
                    alt={`Directions QR for ${v.label}`}
                    className="w-40 h-40"
                  />
                  <p className="text-earth-400 text-xs mt-3 font-sans">Scan to open in Maps</p>
                </div>

                <a
                  href={v.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                             bg-gold/10 border border-gold/20 text-gold text-sm font-medium
                             hover:bg-gold/20 transition-colors duration-300"
                >
                  <ExternalLink size={14} />
                  Open in Google Maps
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

/* ── Sub-component ───────────────────────────────────── */
function ContactCard({
  badge, name, phone, email,
}: {
  badge: string
  name: string
  phone?: string
  email?: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-lavender-100 p-6
                    hover:shadow-lg hover:shadow-lavender-100 hover:-translate-y-0.5
                    transition-all duration-300">
      <span className="inline-block text-[11px] text-purple-600 bg-purple-50 border border-purple-100
                       uppercase tracking-widest px-3 py-1 rounded-full mb-4 font-medium">
        {badge}
      </span>
      <h3 className="font-serif text-xl text-purple-900 mb-5">{name}</h3>
      <div className="space-y-3">
        {phone && (
          <a
            href={`tel:${phone}`}
            className="flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center
                            group-hover:bg-purple-100 transition-colors">
              <Phone size={15} className="text-purple-600" />
            </div>
            <span className="text-earth-700 text-sm group-hover:text-purple-700 transition-colors">
              {phone}
            </span>
          </a>
        )}
        {email && (
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center
                            group-hover:bg-purple-100 transition-colors">
              <Mail size={15} className="text-purple-600" />
            </div>
            <span className="text-earth-700 text-sm group-hover:text-purple-700 transition-colors">
              {email}
            </span>
          </a>
        )}
      </div>
    </div>
  )
}
