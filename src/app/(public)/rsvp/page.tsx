'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, Search, Heart, Calendar, MapPin, Loader2, ChevronRight, X } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/app/toaster'

const schema = z.object({
  name:       z.string().min(2, 'Please enter your name'),
  attending:  z.enum(['yes', 'no']),
  plusOne:    z.boolean().optional(),
  dietaryReq: z.string().optional(),
  message:    z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Invitee {
  id: string
  name: string
  email?: string
  plusOne: boolean
  rsvp?: { attending: boolean; plusOne: boolean; dietaryReq?: string; message?: string }
}

/* ── Inner component (needs useSearchParams) ──────── */
function RSVPForm() {
  const params  = useSearchParams()
  const qrCode  = params.get('code')
  const { toast } = useToast()

  const [searchEmail, setSearchEmail] = useState('')
  const [invitee,     setInvitee]     = useState<Invitee | null>(null)
  const [notFound,    setNotFound]    = useState(false)
  const [submitted,   setSubmitted]   = useState(false)
  const [searching,   setSearching]   = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { attending: 'yes' },
  })

  const attending = watch('attending')

  useEffect(() => {
    if (qrCode) loadByQR(qrCode)
  }, [qrCode])

  async function loadByQR(code: string) {
    setSearching(true)
    const res = await fetch(`/api/invitees/by-qr?code=${code}`)
    setSearching(false)
    if (res.ok) {
      const data: Invitee = await res.json()
      setInvitee(data)
      setValue('name', data.name)
      if (data.rsvp) {
        setValue('attending', data.rsvp.attending ? 'yes' : 'no')
        setValue('plusOne', data.rsvp.plusOne)
        setValue('dietaryReq', data.rsvp.dietaryReq ?? '')
        setValue('message', data.rsvp.message ?? '')
      }
    } else {
      setNotFound(true)
    }
  }

  async function searchByEmail() {
    if (!searchEmail.trim()) return
    setSearching(true)
    setNotFound(false)
    const res = await fetch(`/api/invitees/by-email?email=${encodeURIComponent(searchEmail)}`)
    setSearching(false)
    if (res.ok) {
      const data: Invitee = await res.json()
      setInvitee(data)
      setValue('name', data.name)
    } else {
      setNotFound(true)
    }
  }

  const onSubmit = async (data: FormData) => {
    if (!invitee) return
    const res = await fetch('/api/rsvp', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ inviteeId: invitee.id, ...data }),
    })
    if (res.ok) {
      setSubmitted(true)
    } else {
      toast({ title: 'Something went wrong', type: 'error' })
    }
  }

  /* ── Success State ──────────────────────────────── */
  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          {attending === 'yes' ? (
            <>
              <div className="w-24 h-24 rounded-full bg-green-50 border-2 border-green-200
                              flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={44} className="text-green-500" />
              </div>
              <p className="font-script text-5xl text-purple-700 mb-3">See You There!</p>
              <div className="ornament-line max-w-32 mx-auto text-lavender-300 text-xs mb-6">✦</div>
              <h2 className="font-serif text-2xl text-purple-900 mb-3">You&apos;re on the list!</h2>
              <p className="text-earth-600 font-sans text-sm leading-relaxed mb-8">
                We&apos;re so excited to celebrate with you. We&apos;ll see you on
                <strong className="text-earth-800"> 19 December 2026</strong> at
                Bethany Methodist Church, Dzorwulu.
              </p>
            </>
          ) : (
            <>
              <div className="w-24 h-24 rounded-full bg-lavender-50 border-2 border-lavender-200
                              flex items-center justify-center mx-auto mb-6">
                <Heart size={40} className="text-lavender-400" />
              </div>
              <p className="font-script text-5xl text-purple-700 mb-3">Thank You</p>
              <div className="ornament-line max-w-32 mx-auto text-lavender-300 text-xs mb-6">✦</div>
              <h2 className="font-serif text-2xl text-purple-900 mb-3">We&apos;ll miss you!</h2>
              <p className="text-earth-600 font-sans text-sm leading-relaxed mb-8">
                We&apos;re sorry you can&apos;t make it, but thank you for letting us know.
                You&apos;re in our hearts.
              </p>
            </>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/" className="btn-primary !text-sm !py-2.5 !px-6">
              Back to Home
            </Link>
            <Link href="/contact" className="btn-secondary !text-sm !py-2.5 !px-6">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16">

      {/* ── Find Invitation ───────────────────────── */}
      {!invitee && (
        <div className="bg-white rounded-3xl border border-lavender-100 shadow-lg p-7 mb-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
              <Search size={15} className="text-purple-600" />
            </div>
            <h3 className="font-serif text-lg text-purple-900">Find Your Invitation</h3>
          </div>
          <p className="text-earth-400 text-xs font-sans mb-5 ml-10">
            Enter the email address your invitation was sent to
          </p>

          <div className="flex gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              value={searchEmail}
              onChange={e => setSearchEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchByEmail()}
              className="input-field"
            />
            <button
              onClick={searchByEmail}
              disabled={searching}
              className="btn-primary !px-4 flex-shrink-0 !py-3"
            >
              {searching
                ? <Loader2 size={18} className="animate-spin" />
                : <ChevronRight size={18} />
              }
            </button>
          </div>

          {notFound && (
            <div className="flex items-start gap-2 mt-3 bg-red-50 border border-red-100
                            rounded-xl px-4 py-3">
              <X size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-red-600 text-sm">
                Invitation not found. Please check your email or{' '}
                <Link href="/contact" className="underline font-medium">contact us</Link>.
              </p>
            </div>
          )}

          {searching && !invitee && (
            <p className="text-purple-500 text-sm mt-3 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              Looking for your invitation…
            </p>
          )}

          <p className="text-earth-400 text-xs font-sans mt-4 text-center">
            Don&apos;t have an email on file?{' '}
            <Link href="/contact" className="text-purple-600 hover:underline font-medium">
              Contact us
            </Link>
          </p>
        </div>
      )}

      {/* ── RSVP Form ────────────────────────────── */}
      {invitee && (
        <div className="bg-white rounded-3xl border border-lavender-100 shadow-lg overflow-hidden">
          {/* Invitation header */}
          <div className="bg-hero-gradient px-7 py-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-[-30%] left-[-10%] w-48 h-48 rounded-full
                              bg-purple-600/20 blur-2xl" />
              <div className="absolute bottom-[-20%] right-[-10%] w-40 h-40 rounded-full
                              bg-earth-700/20 blur-2xl" />
            </div>
            <div className="relative z-10">
              <p className="text-lavender-400/70 text-xs uppercase tracking-[0.35em] font-sans mb-2">
                You are invited
              </p>
              <p className="font-script text-4xl text-gold mb-1">{invitee.name}</p>
              <div className="ornament-line max-w-24 mx-auto text-gold/30 text-[10px] mt-2">✦</div>
            </div>
          </div>

          {/* Form body */}
          <div className="p-7">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* Attending toggle */}
              <div>
                <label className="label mb-3">Will you be attending?</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'yes', label: 'Joyfully Accepts', emoji: '🎉' },
                    { value: 'no',  label: 'Regretfully Declines', emoji: '💌' },
                  ].map(opt => (
                    <label key={opt.value} className="cursor-pointer">
                      <input
                        type="radio"
                        {...register('attending')}
                        value={opt.value}
                        className="sr-only"
                      />
                      <div className={`rounded-2xl border-2 p-4 text-center transition-all duration-200
                        ${attending === opt.value
                          ? 'border-purple-600 bg-purple-50 shadow-md shadow-purple-100'
                          : 'border-lavender-200 hover:border-lavender-300 bg-white'
                        }`}
                      >
                        <p className="text-xl mb-1.5">{opt.emoji}</p>
                        <p className={`text-sm font-medium font-sans leading-tight ${
                          attending === opt.value ? 'text-purple-800' : 'text-earth-600'
                        }`}>
                          {opt.label}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.attending && (
                  <p className="text-red-500 text-xs mt-2">{errors.attending.message}</p>
                )}
              </div>

              {/* Plus one */}
              {attending === 'yes' && invitee.plusOne && (
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center
                                   transition-colors duration-200 flex-shrink-0
                                   ${watch('plusOne')
                                     ? 'bg-purple-600 border-purple-600'
                                     : 'border-lavender-300 group-hover:border-lavender-400'}`}>
                    <input
                      type="checkbox"
                      {...register('plusOne')}
                      className="sr-only"
                    />
                    {watch('plusOne') && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-earth-700 text-sm font-sans">
                    I will be bringing a plus one
                  </span>
                </label>
              )}

              {/* Dietary */}
              {attending === 'yes' && (
                <div>
                  <label className="label">
                    Dietary Requirements
                    <span className="text-earth-400 font-normal ml-1">(optional)</span>
                  </label>
                  <input
                    {...register('dietaryReq')}
                    placeholder="e.g. Vegetarian, nut allergy…"
                    className="input-field mt-1"
                  />
                </div>
              )}

              {/* Message */}
              <div>
                <label className="label">
                  Message to the Couple
                  <span className="text-earth-400 font-normal ml-1">(optional)</span>
                </label>
                <textarea
                  {...register('message')}
                  rows={3}
                  placeholder="Share your warm wishes…"
                  className="input-field resize-none mt-1"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full group !py-4"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={17} className="animate-spin mr-2" />
                    Submitting…
                  </>
                ) : (
                  <>
                    Submit RSVP
                    <ChevronRight size={17} className="ml-1.5 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Page wrapper with Suspense ─────────────────────── */
export default function RSVPPage() {
  return (
    <>
      {/* ── Page Hero ──────────────────────────────── */}
      <section className="relative bg-hero-gradient pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[40vw] h-[40vw] rounded-full
                          bg-purple-700/25 blur-[80px]" />
          <div className="absolute bottom-0 right-[-5%] w-[30vw] h-[30vw] rounded-full
                          bg-earth-800/20 blur-[60px]" />
        </div>
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <p className="text-lavender-400/60 text-xs uppercase tracking-[0.4em] font-sans mb-4">
            Ekow &amp; Ekua · 2026
          </p>
          <h1 className="font-script text-6xl md:text-7xl text-gold mb-3 drop-shadow-lg">RSVP</h1>
          <div className="ornament-line max-w-40 mx-auto text-gold/40 text-xs mb-5">✦</div>
          <p className="text-lavender-200/70 font-sans text-sm">
            Please respond by <span className="text-gold font-medium">1 November 2026</span>
          </p>

          {/* Date reminder pills */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-7">
            <div className="flex items-center gap-2 bg-white/8 backdrop-blur-sm border border-white/10
                            rounded-full px-4 py-2 text-lavender-200 text-xs font-sans">
              <Calendar size={11} className="text-gold flex-shrink-0" />
              <span>19 December 2026</span>
            </div>
            <div className="flex items-center gap-2 bg-white/8 backdrop-blur-sm border border-white/10
                            rounded-full px-4 py-2 text-lavender-200 text-xs font-sans">
              <MapPin size={11} className="text-gold flex-shrink-0" />
              <span>Bethany Methodist Church, Dzorwulu</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Form Section ──────────────────────────────── */}
      <section className="bg-soft-gradient pb-20">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-24">
              <Loader2 size={32} className="animate-spin text-purple-400" />
            </div>
          }
        >
          <RSVPForm />
        </Suspense>
      </section>
    </>
  )
}
