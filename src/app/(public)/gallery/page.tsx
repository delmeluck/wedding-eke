export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import { Camera, Video, Star } from 'lucide-react'

async function getMedia() {
  try {
    return await prisma.mediaItem.findMany({ orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }] })
  } catch {
    return []
  }
}

export default async function GalleryPage() {
  const media = await getMedia()

  const photos = media.filter(m => m.type === 'photo')
  const videos = media.filter(m => m.type === 'video')

  return (
    <>
      {/* ── Page Hero ──────────────────────────────────── */}
      <section className="relative bg-hero-gradient pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-purple-700/25 blur-[80px]" />
          <div className="absolute bottom-0 right-[-10%] w-[30vw] h-[30vw] rounded-full bg-earth-800/20 blur-[60px]" />
        </div>
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <p className="text-lavender-400/60 text-xs uppercase tracking-[0.4em] font-sans mb-4">
            Ekow &amp; Ekua · 2026
          </p>
          <h1 className="font-script text-6xl md:text-7xl text-gold mb-3 drop-shadow-lg">Gallery</h1>
          <div className="ornament-line max-w-40 mx-auto text-gold/40 text-xs mb-5">✦</div>
          <p className="text-lavender-200/70 font-sans text-sm">
            Precious moments from our journey together
          </p>
        </div>
      </section>

      {media.length === 0 ? (
        /* ── Empty State ──────────────────────────────── */
        <section className="bg-soft-gradient py-32 px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="w-28 h-28 rounded-full bg-lavender-100 flex items-center
                            justify-center mx-auto mb-7">
              <Camera size={48} className="text-lavender-300" />
            </div>
            <h2 className="font-serif text-2xl text-purple-900 mb-3">Photos Coming Soon</h2>
            <p className="text-earth-400 font-sans text-sm leading-relaxed max-w-xs mx-auto">
              Our gallery is being lovingly prepared. Check back after the engagement celebration
              on 17 December 2026.
            </p>
            <div className="ornament-line max-w-32 mx-auto text-lavender-300 text-xs mt-8">✦</div>
          </div>
        </section>
      ) : (
        <>
          {/* ── Photos ──────────────────────────────────── */}
          {photos.length > 0 && (
            <section className="bg-soft-gradient py-20 px-4">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Camera size={18} className="text-purple-700" />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl text-purple-900">Photos</h2>
                    <p className="text-earth-400 text-xs font-sans mt-0.5">{photos.length} moments captured</p>
                  </div>
                </div>

                <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
                  {photos.map(item => (
                    <div key={item.id} className="break-inside-avoid group relative cursor-zoom-in">
                      <div className="relative rounded-2xl overflow-hidden bg-lavender-100 shadow-sm">
                        <Image
                          src={item.url}
                          alt={item.caption ?? 'Wedding photo'}
                          width={500}
                          height={400}
                          className="w-full object-cover transition-transform duration-500
                                     group-hover:scale-105"
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-950/70
                                        via-transparent to-transparent opacity-0
                                        group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Featured badge */}
                        {item.featured && (
                          <div className="absolute top-2.5 right-2.5 bg-gold text-purple-950 text-[10px]
                                          font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                            <Star size={9} fill="currentColor" />
                            Featured
                          </div>
                        )}

                        {/* Caption */}
                        {item.caption && (
                          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2
                                          opacity-0 group-hover:opacity-100 group-hover:translate-y-0
                                          transition-all duration-300">
                            <p className="text-white text-xs font-sans leading-snug">{item.caption}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── Videos ──────────────────────────────────── */}
          {videos.length > 0 && (
            <section className="bg-purple-950 py-20 px-4">
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Video size={18} className="text-gold" />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl text-white">Videos</h2>
                    <p className="text-lavender-400/60 text-xs font-sans mt-0.5">
                      {videos.length} video{videos.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {videos.map(item => (
                    <div key={item.id}
                      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden
                                 hover:bg-white/8 transition-colors duration-300">
                      <div className="aspect-video bg-black/30">
                        {item.url.includes('youtube') || item.url.includes('youtu.be') ? (
                          <iframe
                            src={item.url.replace('watch?v=', 'embed/')}
                            className="w-full h-full"
                            allowFullScreen
                            title={item.caption ?? 'Video'}
                          />
                        ) : (
                          <video
                            src={item.url}
                            controls
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      {item.caption && (
                        <div className="px-5 py-4">
                          <p className="text-lavender-300/80 text-sm font-sans">{item.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </>
  )
}
