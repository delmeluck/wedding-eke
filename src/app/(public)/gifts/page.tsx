export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { Gift as GiftIcon, Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { GiftsClient, GiftMomoInfo } from './GiftsClient'

async function getGifts() {
  try {
    return await prisma.gift.findMany({ orderBy: [{ priority: 'desc' }, { name: 'asc' }] })
  } catch {
    return []
  }
}

function isMomo(giftType: string) {
  return giftType === 'momo' || giftType.startsWith('momo_')
}

function hasMomoNumbers(g: Awaited<ReturnType<typeof getGifts>>[0]) {
  return !!(g.momoMtnNumber || g.momoTelecelNumber || g.momoAirtelNumber || g.momoNumber)
}

function toMomoInfo(g: Awaited<ReturnType<typeof getGifts>>[0]): GiftMomoInfo {
  return {
    id:                g.id,
    name:              g.name,
    price:             g.price    ?? undefined,
    momoName:          g.momoName ?? undefined,
    momoMtnNumber:     g.momoMtnNumber     ?? undefined,
    momoTelecelNumber: g.momoTelecelNumber ?? undefined,
    momoAirtelNumber:  g.momoAirtelNumber  ?? undefined,
    momoNumber:        g.momoNumber ?? undefined,
    giftType:          g.giftType,
  }
}

export default async function GiftsPage() {
  const gifts = await getGifts()

  // Gifts that have any MoMo number → feed into the cash-gift section drawer
  const momoGifts    = gifts.filter(g => isMomo(g.giftType) || hasMomoNumbers(g))
  // Physical / bank / momo gifts → shown in the registry grid (bank always; momo only when no separate momo-type gift)
  const registryGifts = gifts.filter(g => !isMomo(g.giftType) && g.giftType !== 'token')

  const hasMomo = momoGifts.length > 0

  return (
    <>
      {/* ── Page Hero ──────────────────────────────────── */}
      <section className="relative bg-hero-gradient pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-purple-700/25 blur-[80px]" />
          <div className="absolute bottom-0 right-[-5%] w-[30vw] h-[30vw] rounded-full bg-earth-800/20 blur-[60px]" />
        </div>
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <p className="text-lavender-400/60 text-xs uppercase tracking-[0.4em] font-sans mb-4">
            Ekow &amp; Ekua · 2026
          </p>
          <h1 className="font-script text-6xl md:text-7xl text-gold mb-3 drop-shadow-lg">Gifts</h1>
          <div className="ornament-line max-w-40 mx-auto text-gold/40 text-xs mb-5">✦</div>
          <p className="text-lavender-200/70 font-sans text-sm max-w-sm mx-auto">
            Your presence is our greatest gift. If you wish to bless us further,
            here are a few ideas we&apos;d treasure.
          </p>
        </div>
      </section>

      {/* ── Mobile Money Section ────────────────────────── */}
      <section className="bg-purple-950 py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-lavender-500/60 text-xs uppercase tracking-[0.4em] font-sans mb-3">
              Instant · Secure · Ghanaian
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-3">Send a Cash Gift</h2>
            <p className="text-lavender-300/70 font-sans text-sm leading-relaxed max-w-md mx-auto">
              Send via MTN MoMo, Telecel Cash, or AirtelTigo Money.
              Choose your network, enter your number, and confirm on your phone.
            </p>
          </div>

          <GiftsClient momoGifts={momoGifts.map(toMomoInfo)} />
        </div>
      </section>

      {/* ── Gift Registry (physical / bank only) ────────── */}
      {registryGifts.length > 0 && (
        <section className="bg-soft-gradient py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-purple-400 text-xs uppercase tracking-[0.4em] font-sans mb-3">Wish list</p>
              <h2 className="font-serif text-3xl md:text-4xl text-purple-900">Wedding Registry</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {registryGifts.map(gift => (
                <div key={gift.id}
                  className={`group bg-white rounded-2xl border border-lavender-100 overflow-hidden
                              flex flex-col hover:shadow-xl hover:shadow-purple-100
                              hover:-translate-y-1 transition-all duration-300
                              ${gift.claimed ? 'opacity-60' : ''}`}
                >
                  {gift.imageUrl ? (
                    <div className="relative h-48 overflow-hidden bg-lavender-50">
                      <Image src={gift.imageUrl} alt={gift.name} fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      {gift.claimed && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                          <span className="bg-green-500 text-white text-sm font-medium px-4 py-1.5 rounded-full">✓ Claimed</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-36 bg-gradient-to-br from-lavender-50 to-purple-50 flex items-center justify-center">
                      <GiftIcon size={36} className="text-lavender-300" />
                    </div>
                  )}

                  <div className="p-5 flex flex-col flex-1">
                    {gift.category && (
                      <span className="text-[11px] text-earth-400 uppercase tracking-widest mb-1.5">{gift.category}</span>
                    )}
                    <h3 className="font-serif text-lg text-purple-900 mb-1 leading-snug">{gift.name}</h3>
                    {gift.description && (
                      <p className="text-earth-500 text-sm leading-relaxed mb-3 flex-1">{gift.description}</p>
                    )}

                    {/* Price + action row */}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-lavender-50 gap-2 flex-wrap">
                      {gift.price && (
                        <span className="text-gold font-serif font-semibold text-lg">
                          GH₵{gift.price.toLocaleString()}
                        </span>
                      )}
                      {!gift.claimed && gift.donationLink && (
                        <a href={gift.donationLink} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-purple-700 text-sm font-medium hover:text-purple-900 transition-colors ml-auto">
                          Give this gift →
                        </a>
                      )}
                      {gift.claimed && !gift.imageUrl && (
                        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium ml-auto">✓ Claimed</span>
                      )}
                    </div>

                    {/* Bank transfer details */}
                    {gift.giftType === 'bank' && gift.bankName && (
                      <div className="mt-4 bg-green-50 border border-green-100 rounded-xl p-4 space-y-2">
                        <p className="text-[11px] text-green-700 uppercase tracking-widest font-sans font-semibold mb-3">
                          Bank Transfer Details
                        </p>
                        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm font-sans">
                          <span className="text-earth-400">Bank</span>
                          <span className="text-earth-800 font-medium">{gift.bankName}</span>
                          {gift.momoName && (
                            <>
                              <span className="text-earth-400">Name</span>
                              <span className="text-earth-800 font-medium">{gift.momoName}</span>
                            </>
                          )}
                          {gift.bankAccount && (
                            <>
                              <span className="text-earth-400">Account</span>
                              <span className="font-mono text-earth-800 text-xs tracking-wider">{gift.bankAccount}</span>
                            </>
                          )}
                          {gift.bankBranch && (
                            <>
                              <span className="text-earth-400">Branch</span>
                              <span className="text-earth-800">{gift.bankBranch}</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Inline MoMo button for gifts with momoNumbers */}
                    {!gift.claimed && hasMomoNumbers(gift) && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <GiftsClient inlineGift={toMomoInfo(gift)} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Empty state (no non-momo gifts at all) ──────── */}
      {!hasMomo && registryGifts.length === 0 && (
        <section className="bg-soft-gradient py-32 px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 rounded-full bg-lavender-100 flex items-center justify-center mx-auto mb-6">
              <GiftIcon size={40} className="text-lavender-300" />
            </div>
            <p className="font-serif text-2xl text-purple-900 mb-2">Registry Coming Soon</p>
            <p className="text-earth-400 text-sm">Our gift registry is being prepared. Check back soon!</p>
          </div>
        </section>
      )}

      {/* ── Closing note ───────────────────────────────── */}
      <section className="bg-purple-950 py-14 px-4 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-4">
            <Heart size={22} className="text-gold" />
          </div>
          <p className="font-script text-4xl text-gold mb-3">Thank You</p>
          <p className="text-lavender-300/80 font-sans text-sm leading-relaxed mb-6">
            Your love, prayers, and presence mean everything to us. Thank you for being part of our story.
          </p>
          <Link href="/rsvp" className="btn-primary !py-2.5 !px-6 !text-sm">RSVP Now</Link>
        </div>
      </section>
    </>
  )
}
