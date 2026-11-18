'use client'

import { useState } from 'react'
import { Landmark, Copy, CheckCircle2, ChevronRight, Smartphone } from 'lucide-react'
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

const NET_META = {
  mtn: {
    icon: '🔶', label: 'MTN MoMo', ussd: '*170#',
    gradient: 'from-amber-400/20 to-yellow-600/10',
    border: 'border-amber-400/30',
    iconRing: 'bg-amber-400/15 ring-amber-400/30',
    labelColor: 'text-amber-300',
    numberColor: 'text-amber-100',
    glow: 'hover:shadow-amber-500/20',
    copyActive: 'bg-amber-400/20 text-amber-200',
  },
  telecel: {
    icon: '🔴', label: 'Telecel Cash', ussd: '*110#',
    gradient: 'from-red-500/20 to-rose-600/10',
    border: 'border-red-400/30',
    iconRing: 'bg-red-400/15 ring-red-400/30',
    labelColor: 'text-red-300',
    numberColor: 'text-red-100',
    glow: 'hover:shadow-red-500/20',
    copyActive: 'bg-red-400/20 text-red-200',
  },
  airtel: {
    icon: '🔵', label: 'AirtelTigo', ussd: '*500#',
    gradient: 'from-blue-500/20 to-indigo-600/10',
    border: 'border-blue-400/30',
    iconRing: 'bg-blue-400/15 ring-blue-400/30',
    labelColor: 'text-blue-300',
    numberColor: 'text-blue-100',
    glow: 'hover:shadow-blue-500/20',
    copyActive: 'bg-blue-400/20 text-blue-200',
  },
} as const

/* ── Animated contact card ───────────────────────────────── */
function NetworkCard({
  netKey, number, accountName, delay = 0,
}: {
  netKey:      keyof typeof NET_META
  number:      string
  accountName?: string
  delay?:      number
}) {
  const [copied, setCopied] = useState(false)
  const m = NET_META[netKey]

  function copy() {
    navigator.clipboard.writeText(number).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={`relative flex flex-col items-center text-center p-5 rounded-3xl
                  bg-gradient-to-b ${m.gradient} border ${m.border}
                  hover:scale-[1.04] hover:shadow-xl ${m.glow}
                  transition-all duration-300 cursor-default
                  animate-fade-in-up`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      {/* Subtle shimmer line at top */}
      <div className="absolute top-0 inset-x-6 h-px bg-white/10 rounded-full" />

      {/* Network icon */}
      <div className={`w-14 h-14 rounded-2xl ring-1 ${m.iconRing} flex items-center justify-center mb-3 text-3xl`}>
        {m.icon}
      </div>

      {/* Network name */}
      <p className={`text-xs font-semibold uppercase tracking-widest font-sans mb-1 ${m.labelColor}`}>
        {m.label}
      </p>

      {/* Account holder name */}
      {accountName && (
        <p className="text-white/80 text-sm font-serif mb-2 leading-tight">{accountName}</p>
      )}

      {/* Phone number */}
      <p className={`font-mono text-base tracking-widest font-bold mb-4 ${m.numberColor}`}>
        {number}
      </p>

      {/* Copy button */}
      <button
        onClick={copy}
        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold font-sans
                    transition-all duration-200 ring-1
                    ${copied
                      ? `${m.copyActive} ring-current`
                      : 'bg-white/10 text-white/60 ring-white/20 hover:bg-white/20 hover:text-white'}`}
      >
        {copied
          ? <><CheckCircle2 size={12} /> Copied!</>
          : <><Copy size={12} /> Copy number</>}
      </button>
    </div>
  )
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
  const [bankOpen,       setBankOpen]       = useState(false)
  const [activeBankGift, setActiveBankGift] = useState<BankGiftInfo | null>(null)

  function openBank(gift: BankGiftInfo) { setActiveBankGift(gift); setBankOpen(true) }

  /* ── Inline registry card numbers ──────────── */
  if (inlineGift) {
    const nets    = buildNetworks(inlineGift)
    const entries = (Object.entries(nets) as [keyof typeof NET_META, string][]).filter(([, v]) => v)
    if (!entries.length) return null
    return (
      <div className="mt-3 w-full grid grid-cols-1 gap-2">
        {entries.map(([k, v], i) => (
          <NetworkCard key={k} netKey={k} number={v} accountName={inlineGift.momoName} delay={i * 80} />
        ))}
      </div>
    )
  }

  /* ── Full section cards (MoMo + Bank) ──────────── */
  if (!momoGifts) return null

  const mergedNets: { mtn?: string; telecel?: string; airtel?: string } = {}
  let sharedName: string | undefined

  momoGifts.forEach(g => {
    Object.assign(mergedNets, buildNetworks(g))
    if (g.momoName) sharedName ??= g.momoName
  })

  const netEntries = (Object.entries(mergedNets) as [keyof typeof NET_META, string][]).filter(([, v]) => v)
  const hasNumbers = netEntries.length > 0

  return (
    <>
      {/* ── MoMo section ────────────────────────────── */}
      <div className="relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden mb-4 p-7 md:p-9">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-400/5 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Smartphone size={16} className="text-white/70" />
            </div>
            <h3 className="font-serif text-2xl text-white">Mobile Money</h3>
          </div>

          {sharedName && (
            <p className="text-lavender-300/60 text-sm font-sans mb-6">
              Dial or copy the number for your network below
            </p>
          )}
          {!sharedName && <div className="mb-6" />}

          {hasNumbers ? (
            <div className={`grid gap-3 ${netEntries.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' : netEntries.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
              {netEntries.map(([k, v], i) => (
                <NetworkCard key={k} netKey={k} number={v} accountName={sharedName} delay={i * 100} />
              ))}
            </div>
          ) : (
            <p className="text-lavender-300/40 text-sm font-sans text-center py-4">
              MoMo details coming soon — check back shortly.
            </p>
          )}
        </div>
      </div>

      {/* ── Bank Transfer card(s) ────────────────────── */}
      {bankGifts && bankGifts.map(bank => (
        <div key={bank.id} className="relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden mb-4">
          <div className="absolute top-0 right-0 w-56 h-56 bg-green-400/5 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-green-800/5 blur-3xl rounded-full pointer-events-none" />
          <div className="relative z-10 p-7 md:p-9 flex flex-col items-center text-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15
                           flex flex-col items-center justify-center gap-1">
              <Landmark size={24} className="text-green-300" />
              <span className="text-white/50 text-[9px] font-sans font-semibold tracking-wide">Bank</span>
            </div>
            <div>
              <h3 className="font-serif text-2xl text-white mb-2">Bank Transfer</h3>
              <p className="text-lavender-300/70 text-sm font-sans mb-1 leading-relaxed max-w-sm mx-auto">
                {bank.bankName
                  ? `Transfer directly to ${bank.accountName ?? 'Ekow & Ekua'} via ${bank.bankName}.`
                  : `Transfer directly to ${bank.accountName ?? 'Ekow & Ekua'} via bank transfer.`}
                {' '}Use your mobile banking app or visit any branch.
              </p>
              <div className="mb-4" />
              <button onClick={() => openBank(bank)}
                className="inline-flex items-center gap-2 bg-gold text-purple-950 font-sans font-semibold
                           px-7 py-3 rounded-full hover:bg-yellow-300 transition-all duration-200
                           hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gold/30">
                <Landmark size={16} />
                See Bank Details
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* ── Bank drawer ──────────────────────────────── */}
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
