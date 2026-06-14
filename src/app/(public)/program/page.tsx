import { prisma } from '@/lib/prisma'
import { Clock, MapPin, ChevronRight } from 'lucide-react'
import Link from 'next/link'

async function getAgenda() {
  return prisma.agendaItem.findMany({ orderBy: [{ eventDate: 'asc' }, { sortOrder: 'asc' }] })
}

async function getVenues() {
  return prisma.venue.findMany({ orderBy: { eventDate: 'asc' } })
}

export default async function ProgramPage() {
  const [agenda, venues] = await Promise.all([getAgenda(), getVenues()])

  const engagementItems = agenda.filter(a => a.eventDate === '17/12/26')
  const weddingItems    = agenda.filter(a => a.eventDate === '19/12/26')

  return (
    <>
      {/* ── Page Hero ──────────────────────────────────── */}
      <section className="relative bg-hero-gradient pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-purple-700/25 blur-[80px]" />
          <div className="absolute bottom-0 right-[-5%] w-[30vw] h-[30vw] rounded-full bg-earth-800/20 blur-[60px]" />
        </div>
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <p className="text-lavender-400/60 text-xs uppercase tracking-[0.4em] font-sans mb-4">
            Ekow &amp; Ekua · 2026
          </p>
          <h1 className="font-script text-6xl md:text-7xl text-gold mb-3 drop-shadow-lg">Program</h1>
          <div className="ornament-line max-w-40 mx-auto text-gold/40 text-xs mb-5">✦</div>
          <p className="text-lavender-200/70 font-sans text-sm">
            A guide to our special celebration days
          </p>
        </div>
      </section>

      {/* ── Event Days ─────────────────────────────────── */}
      <section className="bg-soft-gradient py-20 px-4">
        <div className="max-w-3xl mx-auto space-y-20">

          {/* Engagement */}
          <EventDay
            label="Engagement Celebration"
            date="Wednesday, 17 December 2026"
            location="Kasoa, Central Region, Ghana"
            emoji="💍"
            accent="from-purple-900 to-purple-800"
            items={engagementItems}
          />

          {/* Divider */}
          <div className="ornament-line text-lavender-300 text-sm">✦ ✦ ✦</div>

          {/* Wedding */}
          <EventDay
            label="Wedding Ceremony"
            date="Friday, 19 December 2026"
            location="Bethany Methodist Church, Dzorwulu, Accra"
            emoji="💒"
            accent="from-gold to-earth-600"
            items={weddingItems}
          />
        </div>
      </section>

      {/* ── Venues ─────────────────────────────────────── */}
      {venues.length > 0 && (
        <section className="bg-purple-950 py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-lavender-500/60 text-xs uppercase tracking-[0.4em] font-sans mb-3">Where to go</p>
              <h2 className="font-serif text-3xl md:text-4xl text-white">Venues</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {venues.map(v => (
                <div key={v.id}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6
                             hover:bg-white/8 transition-colors duration-300">
                  <p className="text-lavender-500/60 text-xs uppercase tracking-widest mb-2">{v.type}</p>
                  <h3 className="font-serif text-xl text-white mb-3">{v.name}</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-lavender-300 text-sm">
                      <MapPin size={14} className="mt-0.5 flex-shrink-0 text-gold" />
                      <span>{v.address}{v.city ? `, ${v.city}` : ''}</span>
                    </div>
                    {v.eventDate && (
                      <div className="flex items-center gap-2 text-lavender-300 text-sm">
                        <Clock size={14} className="text-gold flex-shrink-0" />
                        <span>{v.eventDate}{v.eventTime ? ` · ${v.eventTime}` : ''}</span>
                      </div>
                    )}
                  </div>
                  {v.description && (
                    <p className="text-lavender-400/70 text-sm mt-3 leading-relaxed">{v.description}</p>
                  )}
                  {v.mapLink && (
                    <a
                      href={v.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-4 text-gold text-sm font-medium
                                 hover:text-yellow-300 transition-colors"
                    >
                      <MapPin size={13} /> Get Directions
                      <ChevronRight size={13} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── RSVP Prompt ────────────────────────────────── */}
      <section className="bg-cream py-16 px-4 text-center">
        <p className="font-script text-4xl text-purple-700 mb-3">Join Us</p>
        <p className="text-earth-600 font-sans text-sm mb-6 max-w-sm mx-auto">
          We can&apos;t wait to celebrate with you. Kindly respond before 1 November 2026.
        </p>
        <Link href="/rsvp" className="btn-primary">
          RSVP Now
        </Link>
      </section>
    </>
  )
}

/* ── EventDay sub-component ──────────────────────────── */
function EventDay({
  label, date, location, emoji, accent, items,
}: {
  label: string
  date: string
  location: string
  emoji: string
  accent: string
  items: { id: string; time: string; title: string; description?: string | null; icon?: string | null }[]
}) {
  return (
    <div>
      {/* Day header card */}
      <div className={`bg-gradient-to-r ${accent} rounded-2xl p-6 mb-8 flex items-center gap-4
                       shadow-xl shadow-purple-950/20`}>
        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0 text-3xl">
          {emoji}
        </div>
        <div>
          <h2 className="font-serif text-xl md:text-2xl text-white">{label}</h2>
          <p className="text-white/70 text-sm font-sans mt-0.5">{date}</p>
          <div className="flex items-center gap-1 text-white/60 text-xs mt-1">
            <MapPin size={11} />
            <span>{location}</span>
          </div>
        </div>
      </div>

      {/* Timeline items */}
      {items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-lavender-100">
          <p className="font-serif text-xl text-earth-400 italic">Program to be announced</p>
          <p className="text-earth-300 text-sm mt-2">Check back soon</p>
        </div>
      ) : (
        <div className="relative pl-8">
          {/* Vertical line */}
          <div className="absolute left-3 top-2 bottom-2 w-px bg-gradient-to-b from-lavender-300 via-lavender-200 to-transparent" />

          {items.map((item, i) => (
            <div key={item.id} className="relative mb-5 last:mb-0">
              {/* Dot */}
              <div className="absolute -left-5 top-4 w-4 h-4 rounded-full bg-white border-2 border-purple-600
                              shadow-sm shadow-purple-200 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
              </div>

              {/* Card */}
              <div className="bg-white rounded-2xl border border-lavender-100 p-5 ml-2
                              hover:shadow-md hover:border-lavender-200 transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-purple-50 text-purple-700 text-xs font-sans font-semibold
                                   px-3 py-1 rounded-full border border-purple-100">
                    {item.time}
                  </span>
                  {item.icon && <span className="text-base">{item.icon}</span>}
                </div>
                <h3 className="font-serif text-lg text-purple-900">{item.title}</h3>
                {item.description && (
                  <p className="text-earth-500 text-sm mt-1 leading-relaxed">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
