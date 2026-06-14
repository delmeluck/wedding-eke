export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { Gift as GiftIcon, ExternalLink, Heart, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

async function getGifts() {
  return prisma.gift.findMany({ orderBy: [{ priority: 'desc' }, { name: 'asc' }] })
}

export default async function GiftsPage() {
  const gifts = await getGifts()

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

      {/* ── Monetary Gift Banner ────────────────────────── */}
      <section className="bg-purple-950 py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="relative bg-gradient-to-br from-purple-800/60 to-earth-800/40
                          border border-gold/20 rounded-3xl p-8 md:p-10 text-center overflow-hidden">
            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32
                            bg-gold/10 blur-2xl rounded-full pointer-events-none" />

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20
                              flex items-center justify-center mx-auto mb-5">
                <Heart size={28} className="text-gold" />
              </div>
              <h2 className="font-serif text-2xl md:text-3xl text-white mb-3">
                Cash &amp; Monetary Gifts
              </h2>
              <p className="text-lavender-300/80 text-sm mb-7 max-w-sm mx-auto leading-relaxed">
                If you prefer to give a monetary gift, you are welcome to use the link below
                or present it personally on the day.
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-2 bg-gold text-purple-950 font-semibold
                           font-sans px-8 py-3.5 rounded-full hover:bg-yellow-300
                           transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg
                           hover:shadow-gold/30"
              >
                <Sparkles size={16} />
                Give a Monetary Gift
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Gift Registry ───────────────────────────────── */}
      <section className="bg-soft-gradient py-20 px-4">
        <div className="max-w-5xl mx-auto">
          {gifts.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-24 h-24 rounded-full bg-lavender-100 flex items-center justify-center mx-auto mb-6">
                <GiftIcon size={40} className="text-lavender-300" />
              </div>
              <p className="font-serif text-2xl text-purple-900 mb-2">Registry Coming Soon</p>
              <p className="text-earth-400 text-sm">
                Our gift registry is being prepared. Check back soon!
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-12">
                <p className="text-purple-400 text-xs uppercase tracking-[0.4em] font-sans mb-3">
                  Wish list
                </p>
                <h2 className="font-serif text-3xl md:text-4xl text-purple-900">Wedding Registry</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {gifts.map(gift => (
                  <div
                    key={gift.id}
                    className={`group bg-white rounded-2xl border border-lavender-100 overflow-hidden
                                flex flex-col hover:shadow-xl hover:shadow-purple-100
                                hover:-translate-y-1 transition-all duration-300
                                ${gift.claimed ? 'opacity-60' : ''}`}
                  >
                    {/* Image */}
                    {gift.imageUrl ? (
                      <div className="relative h-48 overflow-hidden bg-lavender-50">
                        <Image
                          src={gift.imageUrl}
                          alt={gift.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {gift.claimed && (
                          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                            <span className="bg-green-500 text-white text-sm font-medium
                                             px-4 py-1.5 rounded-full">
                              ✓ Claimed
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-36 bg-gradient-to-br from-lavender-50 to-purple-50
                                      flex items-center justify-center">
                        <GiftIcon size={36} className="text-lavender-300" />
                      </div>
                    )}

                    <div className="p-5 flex flex-col flex-1">
                      {gift.category && (
                        <span className="text-[11px] text-earth-400 uppercase tracking-widest mb-1.5">
                          {gift.category}
                        </span>
                      )}
                      <h3 className="font-serif text-lg text-purple-900 mb-1 leading-snug">{gift.name}</h3>
                      {gift.description && (
                        <p className="text-earth-500 text-sm leading-relaxed mb-3 flex-1">
                          {gift.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-lavender-50">
                        {gift.price && (
                          <span className="text-gold font-serif font-semibold text-lg">
                            GH₵{gift.price.toLocaleString()}
                          </span>
                        )}
                        {!gift.claimed && gift.donationLink && (
                          <a
                            href={gift.donationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-purple-700 text-sm font-medium
                                       hover:text-purple-900 transition-colors ml-auto"
                          >
                            Give this gift
                            <ExternalLink size={13} />
                          </a>
                        )}
                        {gift.claimed && !gift.imageUrl && (
                          <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium ml-auto">
                            ✓ Claimed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Closing note ───────────────────────────────── */}
      <section className="bg-purple-950 py-14 px-4 text-center">
        <div className="max-w-md mx-auto">
          <p className="font-script text-4xl text-gold mb-3">Thank You</p>
          <p className="text-lavender-300/80 font-sans text-sm leading-relaxed mb-6">
            Your love, prayers, and presence mean everything to us. Thank you for being part of our story.
          </p>
          <Link href="/rsvp" className="btn-primary !py-2.5 !px-6 !text-sm">
            RSVP Now
          </Link>
        </div>
      </section>
    </>
  )
}
