'use client'

import { useState } from 'react'
import { Smartphone, ChevronRight, Landmark } from 'lucide-react'
import { MomoDrawer } from '@/components/MomoDrawer'
import { BankDrawer } from '@/components/BankDrawer'

export interface GiftMomoInfo {
  id:               string
  name:             string
  price?:           number
  momoName?:        string
  momoMtnNumber?:   string
  momoTelecelNumber?: string
  momoAirtelNumber?: string
  momoNumber?:      string
  giftType?:        string
}

export interface BankGiftInfo {
  id:          string
  name:        string
  price?:      number
  bankName?:   string
  bankAccount?: string
  bankBranch?: string
  accountName?: string
}

function buildNetworks(gift: GiftMomoInfo) {
  const nets: { mtn?: string; telecel?: string; airtel?: string } = {}
  if (gift.momoMtnNumber)     nets.mtn     = gift.momoMtnNumber
  if (gift.momoTelecelNumber) nets.telecel = gift.momoTelecelNumber
  if (gift.momoAirtelNumber)  nets.airtel  = gift.momoAirtelNumber
  if (!Object.keys(nets).length && gift.momoNumber && gift.giftType) {
    if (gift.giftType === 'momo_mtn')      nets.mtn     = gift.momoNumber
    if (gift.giftType === 'momo_vodafone') nets.telecel = gift.momoNumber
    if (gift.giftType === 'momo_airtel')   nets.airtel  = gift.momoNumber
    if (gift.giftType === 'momo')          { nets.mtn = gift.momoNumber; nets.telecel = gift.momoNumber; nets.airtel = gift.momoNumber }
  }
  return nets
}

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
  bankGifts,
  inlineGift,
}: {
  momoGifts?:  GiftMomoInfo[]
  bankGifts?:  BankGiftInfo[]
  inlineGift?: GiftMomoInfo
}) {
  const [momoOpen,      setMomoOpen]      = useState(false)
  const [activeGift,    setActiveGift]    = useState<GiftMomoInfo | null>(null)
  const [bankOpen,      setBankOpen]      = useState(false)
  const [activeBankGift, setActiveBankGift] = useState<BankGiftInfo | null>(null)

  function openMomo(gift: GiftMomoInfo) { setActiveGift(gift); setMomoOpen(true) }
  function openBank(gift: BankGiftInfo) { setActiveBankGift(gift); setBankOpen(true) }

  const activeNets = activeGift ? buildNetworks(activeGift) : {}

  /* ── Inline registry card button ───────────────── */
  if (inlineGift) {
    const nets   = buildNetworks(inlineGift)
    const badges = networkBadges(nets)
    return (
      <>
        <button onClick={() => openMomo(inlineGift)}
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
          open={momoOpen}
          onClose={() => setMomoOpen(false)}
          giftId={activeGift?.id}
          giftName={activeGift?.name}
          suggestedAmount={activeGift?.price}
          recipientName={activeGift?.momoName}
          availableNetworks={activeNets}
        />
      </>
    )
  }

  /* ── Full section cards (MoMo + Bank) ──────────── */
  if (!momoGifts) return null

  // Merge all momo gifts into one unified network map
  const mergedNets: { mtn?: string; telecel?: string; airtel?: string } = {}
  let sharedName:  string | undefined
  let sharedPrice: number | undefined

  momoGifts.forEach(g => {
    Object.assign(mergedNets, buildNetworks(g))
    if (g.momoName) sharedName  ??= g.momoName
    if (g.price)    sharedPrice ??= g.price
  })

  const hasAnyNumber = Object.values(mergedNets).some(Boolean)
  const badges       = networkBadges(mergedNets)

  const mergedGift: GiftMomoInfo = {
    id:               momoGifts[0]?.id ?? 'general',
    name:             'Cash Gift',
    price:            sharedPrice,
    momoName:         sharedName,
    momoMtnNumber:    mergedNets.mtn,
    momoTelecelNumber: mergedNets.telecel,
    momoAirtelNumber: mergedNets.airtel,
  }

  return (
    <>
      {/* ── MoMo card ───────────────────────────────── */}
      <div className="relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden mb-4">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 blur-3xl rounded-full pointer-events-none" />
        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          {/* Network icons */}
          <div className="flex gap-2 flex-shrink-0">
            {[
              { show: !hasAnyNumber || !!mergedNets.mtn,    icon: '🔶', label: 'MTN'       },
              { show: !hasAnyNumber || !!mergedNets.telecel, icon: '🔴', label: 'Telecel'   },
              { show: !hasAnyNumber || !!mergedNets.airtel,  icon: '🔵', label: 'AirtelTigo'},
            ].filter(n => n.show).map(n => (
              <div key={n.label}
                className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15
                           flex flex-col items-center justify-center gap-0.5">
                <span className="text-2xl">{n.icon}</span>
                <span className="text-white/50 text-[9px] font-sans font-semibold tracking-wide">{n.label}</span>
              </div>
            ))}
          </div>
          {/* Copy + CTA */}
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
            <button onClick={() => openMomo(mergedGift)}
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

      {/* ── Bank Transfer card(s) ────────────────────── */}
      {bankGifts && bankGifts.map(bank => (
        <div key={bank.id} className="relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden mb-4">
          <div className="absolute top-0 right-0 w-48 h-48 bg-green-400/5 blur-3xl rounded-full pointer-events-none" />
          <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
            {/* Bank icon */}
            <div className="flex gap-2 flex-shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15
                             flex flex-col items-center justify-center gap-0.5">
                <Landmark size={22} className="text-green-300" />
                <span className="text-white/50 text-[9px] font-sans font-semibold tracking-wide">Bank</span>
              </div>
            </div>
            {/* Copy + CTA */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-serif text-xl text-white mb-1">Bank Transfer</h3>
              <p className="text-lavender-300/70 text-sm font-sans mb-4 leading-relaxed">
                {bank.bankName
                  ? `Transfer directly to ${bank.accountName ?? 'Ekow & Ekua'} via ${bank.bankName}.`
                  : `Transfer directly to ${bank.accountName ?? 'Ekow & Ekua'} via bank transfer.`}
                {' '}Use your mobile banking app or visit any branch.
              </p>
              {bank.price && (
                <p className="text-gold text-sm font-serif mb-3">
                  Suggested: GH₵{bank.price.toLocaleString()}
                </p>
              )}
              <button onClick={() => openBank(bank)}
                className="inline-flex items-center gap-2 bg-gold text-purple-950 font-sans font-semibold
                           px-6 py-3 rounded-full hover:bg-yellow-300 transition-all duration-200
                           hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gold/30">
                <Landmark size={16} />
                Transfer via Bank
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* ── How it works ─────────────────────────────── */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <p className="text-lavender-300/60 text-xs uppercase tracking-[0.3em] font-sans mb-4">How it works</p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Choose method',    desc: 'Mobile Money or Bank Transfer'    },
            { step: '2', title: 'Enter your details', desc: 'Number or account to send from' },
            { step: '3', title: 'Confirm & send',   desc: 'Approve the transaction'           },
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

      {/* ── Shared drawers ───────────────────────────── */}
      <MomoDrawer
        open={momoOpen}
        onClose={() => setMomoOpen(false)}
        giftId={activeGift?.id?.startsWith('general') ? undefined : activeGift?.id}
        giftName={activeGift?.name}
        suggestedAmount={activeGift?.price}
        recipientName={activeGift?.momoName}
        availableNetworks={activeNets}
      />
      <BankDrawer
        open={bankOpen}
        onClose={() => setBankOpen(false)}
        giftName={activeBankGift?.name}
        bankName={activeBankGift?.bankName}
        bankAccount={activeBankGift?.bankAccount}
        bankBranch={activeBankGift?.bankBranch}
        accountName={activeBankGift?.accountName}
      />
    </>
  )
}
