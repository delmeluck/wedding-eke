'use client'

import { useState } from 'react'
import { Landmark, Copy, CheckCircle2, ChevronRight } from 'lucide-react'
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
  mtn:     { icon: '🔶', label: 'MTN MoMo',       ussd: '*170#', textColor: 'text-yellow-300', borderColor: 'border-yellow-500/30', bg: 'bg-yellow-500/10' },
  telecel: { icon: '🔴', label: 'Telecel Cash',    ussd: '*110#', textColor: 'text-red-300',    borderColor: 'border-red-500/30',    bg: 'bg-red-500/10'    },
  airtel:  { icon: '🔵', label: 'AirtelTigo Money',ussd: '*500#', textColor: 'text-blue-300',   borderColor: 'border-blue-500/30',   bg: 'bg-blue-500/10'   },
} as const

/* ── Inline network row ──────────────────────────────────── */
function NetworkRow({ netKey, number }: { netKey: keyof typeof NET_META; number: string }) {
  const [copied, setCopied] = useState(false)
  const meta = NET_META[netKey]

  function copy() {
    navigator.clipboard.writeText(number).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border ${meta.bg} ${meta.borderColor}`}>
      <div className="flex items-center gap-2.5">
        <span className="text-xl">{meta.icon}</span>
        <div>
          <p className={`text-xs font-semibold font-sans ${meta.textColor}`}>{meta.label}</p>
          <p className="text-white font-mono text-sm tracking-wider">{number}</p>
        </div>
      </div>
      <button onClick={copy}
        className="flex items-center gap-1 text-xs text-white/40 hover:text-white/80 transition-colors shrink-0">
        {copied
          ? <><CheckCircle2 size={13} className="text-green-400" /> <span className="text-green-400">Copied</span></>
          : <><Copy size={13} /> Copy</>}
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
    const nets = buildNetworks(inlineGift)
    const entries = (Object.entries(nets) as [keyof typeof NET_META, string][]).filter(([, v]) => v)
    if (!entries.length) return null
    return (
      <div className="mt-2 w-full space-y-2">
        {inlineGift.momoName && (
          <p className="text-xs text-gray-500 font-sans">{inlineGift.momoName}</p>
        )}
        {entries.map(([k, v]) => <NetworkRow key={k} netKey={k} number={v} />)}
      </div>
    )
  }

  /* ── Full section cards (MoMo + Bank) ──────────── */
  if (!momoGifts) return null

  // Merge all momo gifts into one unified network map
  const mergedNets: { mtn?: string; telecel?: string; airtel?: string } = {}
  let sharedName:  string | undefined

  momoGifts.forEach(g => {
    Object.assign(mergedNets, buildNetworks(g))
    if (g.momoName) sharedName ??= g.momoName
  })

  const netEntries = (Object.entries(mergedNets) as [keyof typeof NET_META, string][]).filter(([, v]) => v)
  const hasNumbers = netEntries.length > 0

  return (
    <>
      {/* ── MoMo card ───────────────────────────────── */}
      <div className="relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden mb-4">
        <div className="absolute top-0 right-0 w-56 h-56 bg-gold/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/5 blur-3xl rounded-full pointer-events-none" />
        <div className="relative z-10 p-7 md:p-9">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex gap-1.5">
              {['🔶', '🔴', '🔵'].map(icon => (
                <span key={icon} className="text-xl">{icon}</span>
              ))}
            </div>
            <h3 className="font-serif text-xl text-white">Mobile Money</h3>
          </div>

          {sharedName && (
            <p className="text-lavender-300/70 text-sm font-sans mb-4">
              Send directly to <span className="text-white font-semibold">{sharedName}</span>
            </p>
          )}

          {hasNumbers ? (
            <div className="space-y-2.5">
              {netEntries.map(([k, v]) => <NetworkRow key={k} netKey={k} number={v} />)}
            </div>
          ) : (
            <p className="text-lavender-300/50 text-sm font-sans">
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
              {!bank.price && <div className="mb-4" />}
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
