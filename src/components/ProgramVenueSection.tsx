'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { MapPin, Lock, Loader2, CheckCircle, ChevronRight, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface VenueInfo {
  name: string
  address: string
  mapQuery: string
  directionsUrl: string
  mapsEmbed: string
  appleMapsUrl: string
  note?: string
}

function ProgramVenueInner() {
  const searchParams = useSearchParams()
  const [code, setCode]           = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [guestName, setGuestName] = useState('')
  const [venues, setVenues]       = useState<VenueInfo[]>([])
  const [unlocked, setUnlocked]   = useState(false)

  // Auto-validate if ?code= is in the URL
  useEffect(() => {
    const urlCode = searchParams.get('code')
    if (urlCode) {
      setCode(urlCode.toUpperCase())
      validate(urlCode.toUpperCase())
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function validate(override?: string) {
    const c = (override ?? code).toUpperCase().trim()
    if (!c) { setError('Please enter your access code'); return }
    setLoading(true); setError('')
    try {
      const res  = await fetch(`/api/venue?code=${c}`)
      const data = await res.json()
      if (data.valid) {
        setGuestName(data.name)
        setVenues(data.venues ?? [])
        setUnlocked(true)
      } else {
        setError('Invalid code — check your RSVP confirmation email.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (unlocked && venues.length > 0) {
    return (
      <div className="space-y-10">
        {/* Welcome banner */}
        <div className="flex items-center gap-2 text-sm font-sans justify-center">
          <CheckCircle size={16} className="text-green-400" />
          <span className="text-green-400">Venue details unlocked for <strong>{guestName}</strong></span>
        </div>

        {venues.map((venue) => (
          <div key={venue.name}
            className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
            {/* Venue header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20
                                flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin size={18} className="text-gold" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-white">{venue.name}</h3>
                  <p className="text-lavender-300/70 text-sm font-sans mt-0.5">{venue.address}</p>
                  {venue.note && (
                    <p className="text-gold/70 text-xs font-sans mt-1 italic">{venue.note}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Embedded map */}
            <div className="aspect-video bg-black/30">
              <iframe
                src={venue.mapsEmbed}
                className="w-full h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Map for ${venue.name}`}
              />
            </div>

            {/* Map action buttons */}
            <div className="p-5 flex flex-wrap gap-3">
              <a href={venue.directionsUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 py-2.5 px-5 rounded-full
                           bg-gold text-purple-950 text-sm font-semibold
                           hover:bg-yellow-300 transition-colors">
                <ExternalLink size={14} />
                Google Maps
              </a>
              <a href={venue.appleMapsUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 py-2.5 px-5 rounded-full
                           bg-white/5 border border-white/15 text-lavender-300/80 text-sm
                           hover:bg-white/10 transition-colors">
                <MapPin size={14} />
                Apple Maps
              </a>
            </div>
          </div>
        ))}

        <p className="text-center text-lavender-400/40 font-sans text-xs">
          For full directions and additional details, visit the{' '}
          <Link href={`/venue?code=${code}`} className="text-gold/60 hover:text-gold underline">
            Venue page
          </Link>
          .
        </p>
      </div>
    )
  }

  // Locked state — code entry form
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20
                      flex items-center justify-center mx-auto mb-5 text-3xl">
        🔐
      </div>
      <h3 className="font-serif text-xl text-white mb-3">Exclusive to Confirmed Guests</h3>
      <p className="text-lavender-300/70 font-sans text-sm leading-relaxed mb-6 max-w-md mx-auto">
        Venue locations and maps are shared privately with RSVPed guests only.
        Enter your <strong className="text-white">8-character access code</strong> from your
        RSVP confirmation email to unlock the details right here.
      </p>

      <div className="max-w-xs mx-auto space-y-3">
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
          onKeyDown={e => e.key === 'Enter' && validate()}
          placeholder="e.g. A1B2C3D4"
          maxLength={8}
          className="w-full bg-white/5 border border-white/15 text-white placeholder-white/30
                     rounded-2xl px-5 py-3.5 font-mono text-xl text-center tracking-[0.3em]
                     focus:outline-none focus:border-gold/60 transition-all uppercase"
        />
        {error && <p className="text-red-400 text-sm font-sans">{error}</p>}
        <button
          onClick={() => validate()}
          disabled={loading || code.length < 6}
          className="w-full py-3.5 rounded-2xl bg-gold text-purple-950 font-sans font-semibold
                     hover:bg-yellow-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
        >
          {loading
            ? <><Loader2 size={16} className="animate-spin" /> Verifying…</>
            : <><Lock size={14} /> Unlock Venue Details</>}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
        <Link href="/venue"
          className="inline-flex items-center justify-center gap-2 py-2.5 px-6 rounded-full
                     bg-white/5 border border-white/15 text-lavender-300/80 text-sm
                     hover:bg-white/10 transition-colors">
          Open Venue Page →
        </Link>
        <Link href="/contact"
          className="inline-flex items-center justify-center gap-2 py-2.5 px-6 rounded-full
                     bg-white/5 border border-white/15 text-lavender-300/80 text-sm
                     hover:bg-white/10 transition-colors">
          <ChevronRight size={14} />
          Contact the Team
        </Link>
      </div>
    </div>
  )
}

export function ProgramVenueSection() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-12">
        <Loader2 size={28} className="text-gold animate-spin" />
      </div>
    }>
      <ProgramVenueInner />
    </Suspense>
  )
}
