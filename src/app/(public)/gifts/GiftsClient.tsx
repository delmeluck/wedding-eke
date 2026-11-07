'use client'

import { useState } from 'react'
import { Smartphone, ChevronRight } from 'lucide-react'
import { MomoDrawer } from '@/components/MomoDrawer'

export interface GiftMomoInfo {
  id:               string
  name:             string
  price?:           number
  momoName?:        string
  momoMtnNumber?:   string
  momoTelecelNumber?: string
  momoAirtelNumber?: string
  /** Legacy single-network number (pre-multi-network) */
  momoNumber?:      string
  /** Legacy single-network type, e.g. momo_mtn */
  giftType?:        string
}

/** Build an availableNetworks map from a gift record, handling both old and new schema */
function buildNetworks(gift: GiftMomoInfo) {
  const nets: { mtn?: string; telecel?: string; airtel?: string } = {}

  // New multi-network fields take priority
  if (gift.momoMtnNumber)     nets.mtn     = gift.momoMtnNumber
  if (gift.momoTelecelNumber) nets.telecel = gift.momoTelecelNumber
  if (gift.momoAirtelNumber)  nets.airtel  = gift.momoAirtelNumber

  // Legacy single-network fallback
  if (!Object.keys(nets).length && gift.momoNumber && gift.giftType) {
    if (gift.giftType === 'momo_mtn')      nets.mtn     = gift.momoNumber
    if (gift.giftType === 'momo_vodafone') nets.telecel = gift.momoNumber
    if (gift.giftType === 'momo_airtel')   nets.airtel  = gift.momoNumber
    // Generic 'momo' type — number shows on all networks
    if (gift.giftType === 'momo')          { nets.mtn = gift.momoNumber; nets.telecel = gift.momoNumber; nets.airtel = gift.momoNumber }
  }

  return nets
}

/** Label for available networks on a gift card */
function networkBadges(nets: ReturnType<typeof buildNetworks>) {
  const labels: string[] = []
  if (nets.mtn)     labels.push('🔶 MTN')
  if (nets.telecel) labels.push('🔴 Telecel')
  if (nets.airtel)  labels.push('🔵 AirtelTigo')
  return labels
}

/* ── Main component ───────────────────────────────────────── */
export function GiftsClient({
  momoGifts,
  inlineGift,
}: {
  /** Passed to the top-of-page "Send Cash Gift" section */
  momoGifts?: GiftMomoInfo[]
  /** Passed to a single registry card for its inline CTA */
  inlineGift?: GiftMomoInfo
}) {
  const [drawerOpen,   setDrawerOpen]   = useState(false)
  const [activeGift,   setActiveGift]   = useState<GiftMomoInfo | null>(null)

  function openDrawer(gift: GiftMomoInfo) { setActiveGift(gift); setDrawerOpen(true) }

  const activeNets = activeGift ? buildNetworks(activeGift) : {}

  /* ── Inline card button ─────────────────────────── */
  if (inlineGift) {
    const nets   = buildNetworks(inlineGift)
    const badges = networkBadges(nets)
    return (
      <>
        <button onClick={() => openDrawer(inlineGift)}
          className="inline-flex items-center gap-1.5 text-purple-700 text-sm font-medium
                     hover:text-purple-900 transition-colors ml-auto">
          <Smartphone size={14} />
          Send via MoMo →
        </button>
        {badges.length > 0 && (
          <p className="text-[10px] text-gray-400 font-sans w-full mt-1">
            {badges.join(' · ')}
          </p>
        )}

        <MomoDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          giftId={activeGift?.id}
          giftName={activeGift?.name}
          suggestedAmount={activeGift?.price}
          recipientName={activeGift?.momoName}
          availableNetworks={activeNets}
        />
      </>
    )
  }

  /* ── Top-of-page cash gift section ─────────────── */
  if (!momoGifts) return null

  // Build a unified network map across all momo gifts
  // (if there are multiple gift entries — one per network — merge them)
  const mergedNets: { mtn?: string; telecel?: string; airtel?: string } = {}
  let sharedName: string | undefined
  let sharedPrice: number | undefined

  momoGifts.forEach(g => {
    const nets = buildNetworks(g)
    Object.assign(mergedNets, nets)
    if (g.momoName)  sharedName  ??= g.momoName
    if (g.price)     sharedPrice ??= g.price
  })

  // No MoMo gifts configured → show generic (all networks, no recipient numbers)
  const hasAnyNumber = Object.values(mergedNets).some(Boolean)

  // Build the "merged" gift object we pass to the drawer
  const mergedGift: GiftMomoInfo = {
    id:               momoGifts[0]?.id ?? 'general',
    name:             'Cash Gift',
    price:            sharedPrice,
    momoName:         sharedName,
    momoMtnNumber:    mergedNets.mtn,
    momoTelecelNumber: mergedNets.telecel,
    momoAirtelNumber: mergedNets.airtel,
  }

  const badges = networkBadges(mergedNets)

  return (
    <>
      {/* Single large "Send Gift" card */}
      <div className="relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden mb-6">
        {/* Subtle gold glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          {/* Left: network icons */}
          <div className="flex gap-2 flex-shrink-0">
            {[
              { show: !hasAnyNumber || !!mergedNets.mtn,     icon: '🔶', label: 'MTN'     },
              { show: !hasAnyNumber || !!mergedNets.telecel,  icon: '🔴', label: 'Telecel' },
              { show: !hasAnyNumber || !!mergedNets.airtel,   icon: '🔵', label: 'AirtelTigo' },
            ].filter(n => n.show).map(n => (
              <div key={n.label}
                className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15
                           flex flex-col items-center justify-center gap-0.5">
                <span className="text-2xl">{n.icon}</span>
                <span className="text-white/50 text-[9px] font-sans font-semibold tracking-wide">{n.label}</span>
              </div>
            ))}
          </div>

          {/* Right: copy + CTA */}
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-serif text-xl text-white mb-1">Mobile Money Gift</h3>
            <p className="text-lavender-300/70 text-sm font-sans mb-4 leading-relaxed">
              {hasAnyNumber
                ? `Send directly to ${sharedName ?? 'Ekow & Ekua'} via ${badges.join(', ')}.`
                : 'Send instantly via MTN MoMo, Telecel Cash, or AirtelTigo Money.'}
              {' '}A prompt goes to your phone — just enter your PIN.
            </p>
            {sharedPrice && (
              <p className="text-gold text-sm font-serif mb-3">
                Suggested: GH₵{sharedPrice.toLocaleString()}
              </p>
            )}
            <button onClick={() => openDrawer(mergedGift)}
              className="inline-flex items-center gap-2 bg-gold text-purple-950 font-sans font-semibold
                         px-6 py-3 rounded-full hover:bg-yellow-300 transition-all duration-200
                         hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gold/30">
              <Smartphone size={16} />
              Send a Gift
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <p className="text-lavender-300/60 text-xs uppercase tracking-[0.3em] font-sans mb-4">How it works</p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Choose network',   desc: 'Pick MTN, Telecel, or AirtelTigo' },
            { step: '2', title: 'Enter your number', desc: 'The number your MoMo is on'       },
            { step: '3', title: 'Confirm on phone',  desc: 'Approve the prompt with your PIN' },
          ].map(s => (
            <div key={s.step} className="text-center">
              <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center mx-auto mb-2">
                <span className="text-gold font-serif font-bold text-sm">{s.step}</span>
              </div>
              <p className="text-white text-xs font-semibold mb-0.5">{s.title}</p>
              <p className="text-lavender-300/50 text-[11px] font-sans leading-tight">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Shared drawer */}
      <MomoDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        giftId={activeGift?.id?.startsWith('general') ? undefined : activeGift?.id}
        giftName={activeGift?.name}
        suggestedAmount={activeGift?.price}
        recipientName={activeGift?.momoName}
        availableNetworks={activeNets}
      />
    </>
  )
}
