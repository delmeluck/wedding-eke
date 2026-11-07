'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { MapPin, ExternalLink, Lock, CheckCircle, Loader2 } from 'lucide-react'

interface Venue {
  label: string
  date: string
  time: string
  place: string
  address: string
  emoji: string
  mapQuery: string
  directions: string
  appleMaps: string
}

function VenuePage() {
  const searchParams = useSearchParams()
  const [code, setCode]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [guestName, setGuestName] = useState('')
  const [venues, setVenues]     = useState<Venue[]>([])
  const [unlocked, setUnlocked] = useState(false)

  // Auto-validate if ?code= is in the URL (from confirmation email link)
  useEffect(() => {
    const urlCode = searchParams.get('code')
    if (urlCode) {
      setCode(urlCode.toUpperCase())
      validate(urlCode.toUpperCase())
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function validate(overrideCode?: string) {
    const c = (overrideCode ?? code).toUpperCase().trim()
    if (!c) { setError('Please enter your access code'); return }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/venue?code=${c}`)
      const data = await res.json()

      if (data.valid) {
        setGuestName(data.name)
        setVenues(data.venues)
        setUnlocked(true)
      } else {
        setError('Invalid code — check your RSVP confirmation email and try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (unlocked) {
    return (
      <div className="min-h-screen bg-hero-gradient">
        {/* Hero */}
        <section className="relative pt-32 pb-16 px-4 text-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[35vw] h-[35vw] rounded-full bg-purple-700/20 blur-[70px]" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 text-green-300 text-xs font-sans px-4 py-2 rounded-full mb-6">
              <CheckCircle size={14} />
              Access Granted
            </div>
            <p className="text-lavender-400/60 text-xs uppercase tracking-[0.4em] font-sans mb-3">
              Welcome, {guestName}
            </p>
            <h1 className="font-script text-6xl md:text-7xl text-gold mb-3 drop-shadow-lg">
              Venue Details
            </h1>
            <div className="ornament-line max-w-40 mx-auto text-gold/40 text-xs mb-4">✦</div>
            <p className="text-lavender-200/70 font-sans text-sm">
              Exclusive to confirmed guests — please keep this private
            </p>
          </div>
        </section>

        {/* Venues */}
        <section className="px-4 pb-24 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {venues.map(v => (
              <div key={v.label}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-7">

                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">
                    {v.emoji}
                  </div>
                  <div>
                    <p className="text-lavender-400/60 text-[11px] uppercase tracking-widest font-sans">{v.date}</p>
                    <h3 className="font-serif text-lg text-white leading-snug">{v.label}</h3>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-2 mb-5">
                  <MapPin size={14} className="text-gold mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white/90 font-medium text-sm">{v.place}</p>
                    <p className="text-lavender-400/60 text-xs mt-0.5">{v.address}</p>
                  </div>
                </div>

                {/* Embedded Map */}
                <div className="rounded-xl overflow-hidden mb-4 border border-white/10">
                  <iframe
                    src={`https://maps.google.com/maps?q=${v.mapQuery}&output=embed&z=15`}
                    width="100%"
                    height="220"
                    style={{ border: 0, filter: 'brightness(0.85) saturate(0.7)' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Map of ${v.place}`}
                  />
                </div>

                {/* Direction Buttons */}
                <div className="flex gap-2">
                  <a href={v.directions} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                               bg-gold text-purple-950 text-sm font-semibold
                               hover:bg-yellow-300 transition-colors">
                    <ExternalLink size={14} />
                    Google Maps
                  </a>
                  <a href={v.appleMaps} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                               bg-white/10 text-white/80 text-sm font-medium
                               hover:bg-white/15 transition-colors border border-white/10">
                    🍎 Apple Maps
                  </a>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-lavender-400/40 font-sans text-xs mt-10">
            This page is exclusive to confirmed guests. Please do not share your access code publicly.
          </p>
        </section>
      </div>
    )
  }

  // Locked state — code entry form
  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-purple-700/20 blur-[80px]" />
        <div className="absolute bottom-0 left-[-5%] w-[30vw] h-[30vw] rounded-full bg-earth-800/15 blur-[60px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5">
            <Lock size={32} className="text-gold" />
          </div>
          <h1 className="font-script text-5xl text-gold mb-2">Venue Details</h1>
          <p className="text-lavender-300/60 font-sans text-sm">
            Exclusive to confirmed guests
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8">
          <p className="text-lavender-200/80 font-sans text-sm text-center mb-6 leading-relaxed">
            Enter the <strong className="text-white">8-character code</strong> from your
            RSVP confirmation email to unlock venue locations and directions.
          </p>

          <div className="space-y-4">
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
              onKeyDown={e => e.key === 'Enter' && validate()}
              placeholder="e.g. A1B2C3D4"
              maxLength={8}
              className="w-full bg-white/5 border border-white/15 text-white placeholder-white/30
                         rounded-2xl px-5 py-4 font-mono text-2xl text-center tracking-[0.3em]
                         focus:outline-none focus:border-gold/60 focus:bg-white/8 transition-all
                         uppercase"
            />

            {error && (
              <p className="text-red-400 text-sm font-sans text-center">{error}</p>
            )}

            <button
              onClick={() => validate()}
              disabled={loading || code.length < 6}
              className="w-full py-4 rounded-2xl bg-gold text-purple-950 font-sans font-semibold
                         text-base hover:bg-yellow-300 transition-colors disabled:opacity-40
                         disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Verifying…</> : 'Unlock Venue Details'}
            </button>
          </div>

          <p className="text-lavender-400/40 font-sans text-xs text-center mt-6">
            Your code was included in your RSVP confirmation email.<br />
            Please check for an email from Ekow &amp; Ekua&apos;s Wedding.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function VenuePageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <Loader2 size={32} className="text-gold animate-spin" />
      </div>
    }>
      <VenuePage />
    </Suspense>
  )
}
