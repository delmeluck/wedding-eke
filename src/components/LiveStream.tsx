'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Tv2, Lock, Loader2, CheckCircle } from 'lucide-react'

function toEmbedUrl(url: string): string {
  // https://www.youtube.com/watch?v=XXXX  →  https://www.youtube.com/embed/XXXX
  // https://youtu.be/XXXX                 →  https://www.youtube.com/embed/XXXX
  // https://www.youtube.com/live/XXXX     →  https://www.youtube.com/embed/XXXX
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) {
      return `https://www.youtube.com/embed${u.pathname}?autoplay=0&rel=0`
    }
    if (u.pathname.startsWith('/live/')) {
      return `https://www.youtube.com/embed${u.pathname}?autoplay=0&rel=0`
    }
    const v = u.searchParams.get('v')
    if (v) return `https://www.youtube.com/embed/${v}?autoplay=0&rel=0`
  } catch { /* fall through */ }
  return url
}

function LiveStreamInner({ streamUrl, streamTitle }: { streamUrl: string; streamTitle: string }) {
  const searchParams    = useSearchParams()
  const [code, setCode]           = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [guestName, setGuestName] = useState('')
  const [unlocked, setUnlocked]   = useState(false)

  // Auto-validate if ?code= present in URL (shared from venue page)
  useEffect(() => {
    const urlCode = searchParams.get('code')
    if (urlCode) { setCode(urlCode.toUpperCase()); validate(urlCode.toUpperCase()) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function validate(override?: string) {
    const c = (override ?? code).toUpperCase().trim()
    if (!c) { setError('Please enter your access code'); return }
    setLoading(true); setError('')
    try {
      const res  = await fetch(`/api/venue?code=${c}`)
      const data = await res.json()
      if (data.valid) { setGuestName(data.name); setUnlocked(true) }
      else setError('Invalid code — check your RSVP confirmation email.')
    } catch { setError('Something went wrong. Please try again.') }
    finally   { setLoading(false) }
  }

  if (unlocked) {
    return (
      <div className="bg-purple-950 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Tv2 size={18} className="text-gold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-2xl text-white">{streamTitle}</h2>
                <span className="inline-flex items-center gap-1 bg-red-500/20 border border-red-400/30
                                 text-red-300 text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full
                                 uppercase tracking-widest animate-pulse">
                  ● Live
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <CheckCircle size={11} className="text-green-400" />
                <p className="text-green-400/80 text-xs font-sans">Unlocked for {guestName}</p>
              </div>
            </div>
          </div>

          {/* Player */}
          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-purple-950/50">
            <div className="aspect-video bg-black">
              <iframe
                src={toEmbedUrl(streamUrl)}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                title={streamTitle}
              />
            </div>
          </div>

          <p className="text-center text-lavender-400/40 font-sans text-xs mt-5">
            This live stream is exclusive to confirmed guests. Please do not share this link publicly.
          </p>
        </div>
      </div>
    )
  }

  // Locked — code entry
  return (
    <div className="bg-purple-950 py-16 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
          {/* Icon + badge */}
          <div className="relative inline-flex mb-5">
            <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center">
              <Tv2 size={28} className="text-gold" />
            </div>
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold
                            px-1.5 py-0.5 rounded-full uppercase tracking-wide">Live</div>
          </div>

          <h2 className="font-serif text-2xl text-white mb-1">{streamTitle}</h2>
          <p className="text-lavender-300/60 font-sans text-sm mb-6 leading-relaxed">
            Enter your <strong className="text-white">8-character RSVP code</strong> from your
            confirmation email to watch the live stream.
          </p>

          <div className="space-y-3">
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
                : <><Lock size={14} /> Watch Live Stream</>}
            </button>
          </div>

          <p className="text-lavender-400/40 font-sans text-xs mt-5">
            Your code was in your RSVP confirmation email.
          </p>
        </div>
      </div>
    </div>
  )
}

export function LiveStreamSection({ streamUrl, streamTitle }: { streamUrl: string; streamTitle?: string | null }) {
  const title = streamTitle?.trim() || 'Watch Live'
  return (
    <Suspense fallback={
      <div className="bg-purple-950 py-16 px-4 flex justify-center">
        <Loader2 size={28} className="text-gold animate-spin" />
      </div>
    }>
      <LiveStreamInner streamUrl={streamUrl} streamTitle={title} />
    </Suspense>
  )
}
