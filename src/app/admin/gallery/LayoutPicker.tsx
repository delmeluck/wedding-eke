'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

export type GalleryLayout = 'masonry' | 'grid' | 'magazine' | 'rows' | 'spotlight'

export const LAYOUT_META: {
  id:          GalleryLayout
  label:       string
  description: string
  preview:     React.ReactNode
}[] = [
  {
    id: 'masonry',
    label: 'Masonry',
    description: 'Varying heights, Pinterest-style',
    preview: (
      <svg viewBox="0 0 60 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1"  y="1"  width="27" height="28" rx="3" fill="currentColor" opacity=".8" />
        <rect x="1"  y="32" width="27" height="15" rx="3" fill="currentColor" opacity=".5" />
        <rect x="32" y="1"  width="27" height="15" rx="3" fill="currentColor" opacity=".5" />
        <rect x="32" y="19" width="27" height="28" rx="3" fill="currentColor" opacity=".8" />
      </svg>
    ),
  },
  {
    id: 'grid',
    label: 'Grid',
    description: 'Equal square tiles',
    preview: (
      <svg viewBox="0 0 60 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {[0,1,2].map(col => [0,1].map(row => (
          <rect key={`${col}-${row}`}
            x={1  + col * 20} y={1  + row * 24}
            width="18" height="22" rx="3" fill="currentColor" opacity=".7" />
        )))}
      </svg>
    ),
  },
  {
    id: 'magazine',
    label: 'Magazine',
    description: 'Hero image with supporting grid',
    preview: (
      <svg viewBox="0 0 60 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1"  y="1"  width="38" height="46" rx="3" fill="currentColor" opacity=".85" />
        <rect x="42" y="1"  width="17" height="22" rx="3" fill="currentColor" opacity=".5" />
        <rect x="42" y="26" width="17" height="21" rx="3" fill="currentColor" opacity=".5" />
      </svg>
    ),
  },
  {
    id: 'rows',
    label: 'Cinematic',
    description: 'Wide horizontal strips',
    preview: (
      <svg viewBox="0 0 60 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1"  width="58" height="13" rx="3" fill="currentColor" opacity=".85" />
        <rect x="1" y="18" width="58" height="13" rx="3" fill="currentColor" opacity=".6" />
        <rect x="1" y="35" width="58" height="12" rx="3" fill="currentColor" opacity=".85" />
      </svg>
    ),
  },
  {
    id: 'spotlight',
    label: 'Spotlight',
    description: 'Featured hero + small grid',
    preview: (
      <svg viewBox="0 0 60 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1"  width="58" height="26" rx="3" fill="currentColor" opacity=".85" />
        {[0,1,2,3].map(i => (
          <rect key={i} x={1 + i * 15} y="30" width="13" height="17" rx="3" fill="currentColor" opacity=".55" />
        ))}
      </svg>
    ),
  },
]

interface Props {
  current: GalleryLayout
}

export function LayoutPicker({ current }: Props) {
  const [active,  setActive]  = useState<GalleryLayout>(current)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)

  async function pick(id: GalleryLayout) {
    if (id === active) return
    setActive(id)
    setSaving(true)
    setSaved(false)
    await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gallery_layout: id }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="admin-card mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-gray-800">Gallery Layout</h2>
          <p className="text-xs text-gray-400 mt-0.5">Choose how photos appear on the public gallery page</p>
        </div>
        {saving && <span className="text-xs text-gray-400">Saving…</span>}
        {saved  && (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <CheckCircle2 size={13} /> Saved
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {LAYOUT_META.map(layout => (
          <button
            key={layout.id}
            onClick={() => pick(layout.id)}
            className={`group flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2
                        transition-all duration-200 text-left
                        ${active === layout.id
                          ? 'border-purple-600 bg-purple-50 shadow-md shadow-purple-100'
                          : 'border-gray-100 hover:border-purple-200 hover:bg-purple-50/50'}`}
          >
            {/* SVG preview */}
            <div className={`w-full aspect-[5/4] flex items-center justify-center rounded-xl p-2
                            ${active === layout.id ? 'text-purple-600' : 'text-gray-300 group-hover:text-purple-300'}`}
            >
              {layout.preview}
            </div>

            {/* Label */}
            <div className="w-full">
              <p className={`text-xs font-semibold leading-tight
                            ${active === layout.id ? 'text-purple-800' : 'text-gray-600'}`}>
                {layout.label}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{layout.description}</p>
            </div>

            {active === layout.id && (
              <div className="absolute top-2 right-2">
                <CheckCircle2 size={14} className="text-purple-600" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
