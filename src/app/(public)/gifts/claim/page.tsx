'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Gift, Check, AlertCircle, Loader2 } from 'lucide-react'

interface CouponInfo {
  code: string
  value?: number | null
  note?: string | null
  claimed: boolean
  claimedBy?: string | null
  gift: { name: string; description?: string | null }
}

function ClaimForm() {
  const params     = useSearchParams()
  const codeParam  = params.get('code') ?? ''

  const [code,    setCode]    = useState(codeParam.toUpperCase())
  const [name,    setName]    = useState('')
  const [info,    setInfo]    = useState<CouponInfo | null>(null)
  const [status,  setStatus]  = useState<'idle' | 'checking' | 'ready' | 'claiming' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (codeParam) checkCode(codeParam.toUpperCase())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeParam])

  async function checkCode(c: string) {
    if (!c.trim()) return
    setStatus('checking')
    const res = await fetch(`/api/gifts/coupons/claim?code=${encodeURIComponent(c.trim())}`)
    if (res.ok) {
      const data: CouponInfo = await res.json()
      setInfo(data)
      setStatus(data.claimed ? 'done' : 'ready')
      if (data.claimed) setMessage(`This gift was already claimed by ${data.claimedBy}.`)
    } else {
      setStatus('error')
      setMessage('Invalid or expired gift code. Please check and try again.')
    }
  }

  async function claim() {
    if (!name.trim()) return
    setStatus('claiming')
    const res = await fetch('/api/gifts/coupons/claim', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ code: code.trim(), name: name.trim() }),
    })
    if (res.ok) {
      const data = await res.json()
      setInfo(prev => prev ? { ...prev, claimed: true, claimedBy: data.claimedBy } : prev)
      setStatus('done')
      setMessage(`Your gift has been claimed successfully! 🎉`)
    } else {
      const err = await res.json().catch(() => ({}))
      setStatus('error')
      setMessage(err.error ?? 'Something went wrong. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gold/20 flex items-center justify-center mx-auto mb-4">
            <Gift size={32} className="text-gold" />
          </div>
          <h1 className="font-script text-5xl text-gold mb-2">Gift Claim</h1>
          <p className="text-lavender-300 text-sm">Ekow &amp; Ekua · December 2026</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Code entry */}
          {status === 'idle' && (
            <div className="p-8">
              <h2 className="font-serif text-xl text-purple-900 mb-1">Enter Your Gift Code</h2>
              <p className="text-gray-400 text-sm mb-6">You'll find this in the email sent to you.</p>
              <div className="space-y-4">
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="GIFT-EKE-XXXXXX"
                  className="input-field text-center font-mono text-lg tracking-widest"
                />
                <button onClick={() => checkCode(code)} className="btn-primary w-full">
                  Check Code
                </button>
              </div>
            </div>
          )}

          {/* Checking */}
          {status === 'checking' && (
            <div className="p-8 text-center">
              <Loader2 size={36} className="text-purple-400 mx-auto mb-3 animate-spin" />
              <p className="text-gray-500">Checking your code…</p>
            </div>
          )}

          {/* Ready to claim */}
          {status === 'ready' && info && (
            <div className="p-8">
              {/* Gift card */}
              <div className="bg-gradient-to-br from-purple-900 to-purple-700 rounded-xl p-5 mb-6 text-center">
                <p className="text-lavender-300 text-xs uppercase tracking-widest mb-2">Your Gift</p>
                <p className="text-white font-serif text-xl mb-1">{info.gift.name}</p>
                {info.value && (
                  <p className="text-gold font-bold text-3xl mt-2">GH₵ {info.value.toLocaleString()}</p>
                )}
                {info.note && <p className="text-lavender-200 text-sm mt-2 italic">"{info.note}"</p>}
                <div className="mt-4 bg-white/10 rounded-lg px-4 py-2">
                  <p className="text-lavender-200 text-xs font-mono tracking-widest">{info.code}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">Your Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Kofi Mensah"
                    className="input-field"
                  />
                </div>
                <button
                  onClick={claim}
                  disabled={!name.trim()}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  Claim Gift 🎁
                </button>
                <button
                  onClick={() => { setCode(''); setInfo(null); setStatus('idle') }}
                  className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Use a different code
                </button>
              </div>
            </div>
          )}

          {/* Claiming */}
          {status === 'claiming' && (
            <div className="p-8 text-center">
              <Loader2 size={36} className="text-purple-400 mx-auto mb-3 animate-spin" />
              <p className="text-gray-500">Claiming your gift…</p>
            </div>
          )}

          {/* Done */}
          {status === 'done' && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check size={28} className="text-green-600" />
              </div>
              <h2 className="font-serif text-2xl text-purple-900 mb-2">
                {info?.value ? `GH₵ ${info.value.toLocaleString()}` : 'Gift'} Claimed!
              </h2>
              <p className="text-gray-500 text-sm mb-2">{message}</p>
              {info && <p className="text-gray-400 text-sm">Gift: <strong>{info.gift.name}</strong></p>}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-gold font-script text-2xl">Ekow &amp; Ekua</p>
                <p className="text-gray-400 text-xs mt-1">Thank you for celebrating with us 💕</p>
              </div>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="p-8">
              <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-6">
                <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
                <p className="text-red-600 text-sm">{message}</p>
              </div>
              <button
                onClick={() => setStatus('idle')}
                className="btn-primary w-full"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ClaimPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <div className="text-gold font-script text-4xl">E &amp; E</div>
      </div>
    }>
      <ClaimForm />
    </Suspense>
  )
}
