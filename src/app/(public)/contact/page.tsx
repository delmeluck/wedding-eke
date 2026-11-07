export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react'

const FALLBACK_CONTACT = {
  name:  'Wedding Coordinator',
  phone: '0555382942',
  email: '',
}

async function getContent() {
  try {
    const keys = ['contact_person_name', 'contact_person_phone', 'contact_person_email',
                  'contact_person2_name', 'contact_person2_phone']
    const rows = await prisma.siteContent.findMany({ where: { key: { in: keys } } })
    return Object.fromEntries(rows.map(r => [r.key, r.value]))
  } catch {
    return {}
  }
}

function toWhatsApp(phone: string) {
  const digits = phone.replace(/\D/g, '')
  // Convert 0XXXXXXXXX (Ghana) → 233XXXXXXXXX
  if (digits.startsWith('0') && digits.length === 10) return `233${digits.slice(1)}`
  return digits
}

export default async function ContactPage() {
  const content = await getContent()
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {hasContacts ? (
              <>
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
              </>
            ) : (
              <ContactCard
                badge="Contact Us"
                name={FALLBACK_CONTACT.name}
                phone={FALLBACK_CONTACT.phone}
                email={FALLBACK_CONTACT.email}
              />
            )}
          </div>
        </div>
      </section>

      {/* ── Directions — gated ─────────────────────────── */}
      <section className="bg-purple-950 py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-lavender-500/60 text-xs uppercase tracking-[0.4em] font-sans mb-3">
              Getting here
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-white">Venue &amp; Directions</h2>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="font-serif text-xl text-white mb-3">Confirmed Guests Only</h3>
            <p className="text-lavender-300/70 font-sans text-sm leading-relaxed mb-6 max-w-md mx-auto">
              Venue maps and turn-by-turn directions are available exclusively to guests who have confirmed their attendance.
              Your <strong className="text-white">RSVP confirmation email</strong> contains your personal access code.
            </p>
            <a href="/venue"
              className="inline-flex items-center gap-2 py-3 px-8 rounded-full
                         bg-gold text-purple-950 text-sm font-semibold
                         hover:bg-yellow-300 transition-colors">
              <MapPin size={14} />
              Unlock Venue Details
            </a>
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
          <>
            {/* Call */}
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
            {/* WhatsApp */}
            <a
              href={`https://wa.me/${toWhatsApp(phone)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                   style={{ background: 'rgba(37,211,102,0.1)' }}>
                {/* WhatsApp icon */}
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="#25D366"/>
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.09-1.34A9.945 9.945 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.68 0-3.25-.49-4.57-1.34l-.32-.2-3.02.8.81-2.95-.21-.33A7.95 7.95 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z" fill="#25D366"/>
                </svg>
              </div>
              <span className="text-sm transition-colors" style={{ color: '#128C7E' }}>
                WhatsApp
              </span>
            </a>
          </>
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
