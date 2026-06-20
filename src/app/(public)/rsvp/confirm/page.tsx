'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Heart, AlertCircle, MapPin, Calendar } from 'lucide-react'

function ConfirmContent() {
  const params   = useSearchParams()
  const status   = params.get('status') ?? 'invalid'
  const rawName  = params.get('name') ?? 'Guest'
  const name     = decodeURIComponent(rawName)

  if (status === 'yes') {
    return (
      <div className="min-h-screen bg-soft-gradient flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full text-center">
          {/* Success icon */}
          <div className="w-28 h-28 rounded-full bg-green-50 border-4 border-green-200
                          flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle size={52} className="text-green-500" />
          </div>

          <p className="font-script text-5xl text-purple-700 mb-2">See You There!</p>
          <div className="ornament-line max-w-32 mx-auto text-lavender-300 text-xs mb-6">✦</div>

          <h2 className="font-serif text-2xl text-purple-900 mb-3">
            You&apos;re Confirmed, {name}!
          </h2>
          <p className="text-earth-600 font-sans text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            We&apos;re so excited to celebrate with you! A confirmation email has been sent to
            your inbox. We can&apos;t wait to see you.
          </p>

          {/* Details card */}
          <div className="bg-white rounded-2xl border border-purple-100 p-5 mb-8 text-left shadow-sm">
            <p className="text-xs font-sans font-semibold text-purple-600 uppercase tracking-widest mb-3">
              What to Remember
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-lg">💍</span>
                <div>
                  <p className="font-sans font-medium text-gray-800 text-sm">Engagement Celebration</p>
                  <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                    <Calendar size={11} /> Wed, 17 December 2026 · Kasoa, Central Region
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">💒</span>
                <div>
                  <p className="font-sans font-medium text-gray-800 text-sm">Wedding Ceremony</p>
                  <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                    <Calendar size={11} /> Fri, 19 December 2026
                  </p>
                  <p className="text-gray-500 text-xs flex items-center gap-1">
                    <MapPin size={11} /> Bethany Methodist Church, Dzorwulu, Accra
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/program" className="btn-primary !text-sm !py-3 !px-6">
              View Full Program
            </Link>
            <Link href="/" className="btn-secondary !text-sm !py-3 !px-6">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'no') {
    return (
      <div className="min-h-screen bg-soft-gradient flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full text-center">
          <div className="w-28 h-28 rounded-full bg-purple-50 border-4 border-purple-100
                          flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Heart size={48} className="text-purple-400" />
          </div>

          <p className="font-script text-5xl text-purple-700 mb-2">We&apos;ll Miss You</p>
          <div className="ornament-line max-w-32 mx-auto text-lavender-300 text-xs mb-6">✦</div>

          <h2 className="font-serif text-2xl text-purple-900 mb-3">
            Thank you, {name}
          </h2>
          <p className="text-earth-600 font-sans text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            We&apos;re sorry you won&apos;t be able to make it, but we&apos;re grateful you
            let us know. You&apos;re in our hearts and will be with us in spirit.
          </p>

          <p className="font-script text-2xl text-gold mb-8">
            With all our love, Ekow &amp; Ekua 💜
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="btn-primary !text-sm !py-3 !px-6">
              Back to Home
            </Link>
            <Link href="/contact" className="btn-secondary !text-sm !py-3 !px-6">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Error / invalid state
  return (
    <div className="min-h-screen bg-soft-gradient flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full text-center">
        <div className="w-28 h-28 rounded-full bg-amber-50 border-4 border-amber-100
                        flex items-center justify-center mx-auto mb-6 shadow-lg">
          <AlertCircle size={48} className="text-amber-500" />
        </div>

        <h2 className="font-serif text-2xl text-purple-900 mb-3">Link Not Valid</h2>
        <p className="text-earth-600 font-sans text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          This RSVP link may have already been used or has expired.
          You can still RSVP directly on our website.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/rsvp" className="btn-primary !text-sm !py-3 !px-6">
            RSVP Online
          </Link>
          <Link href="/contact" className="btn-secondary !text-sm !py-3 !px-6">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function RSVPConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-soft-gradient flex items-center justify-center">
          <div className="animate-pulse text-purple-400 font-serif text-xl">Loading…</div>
        </div>
      }
    >
      <ConfirmContent />
    </Suspense>
  )
}
