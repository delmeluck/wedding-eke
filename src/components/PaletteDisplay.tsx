'use client'

import { useState, useCallback } from 'react'

type Swatch = { name: string; hex: string; border?: boolean }

const PALETTE_ROW1: Swatch[] = [
  { name: 'Lavender',    hex: '#B79AD8' },
  { name: 'Lilac',       hex: '#C8A2C8' },
  { name: 'Fuchsia',     hex: '#D94F9D' },
  { name: 'Baby Pink',   hex: '#F4C2C2' },
  { name: 'Cream',       hex: '#FFF4E1', border: true },
  { name: 'Champagne',   hex: '#E6D2A2' },
]

const PALETTE_ROW2: Swatch[] = [
  { name: 'Amethyst',    hex: '#8F5DAF' },
  { name: 'Orchid',      hex: '#C875C4' },
  { name: 'Soft Blush',  hex: '#F6D5D8' },
  { name: 'Lemon Green', hex: '#B7D84B' },
  { name: 'Ivory',       hex: '#FFFFF0', border: true },
  { name: 'White',       hex: '#FFFFFF', border: true },
  { name: 'Gold',        hex: '#C9A227' },
]

const FAMILIES = [
  { label: 'Lavender',    dots: ['#8F5DAF', '#B79AD8', '#C8A2C8', '#DDD0EE', '#F0EAF8'] },
  { label: 'Orchid',      dots: ['#C875C4', '#D494D0', '#E0B3DC', '#ECD2E8', '#F7F0F7'] },
  { label: 'Fuchsia',     dots: ['#D94F9D', '#E47BB8', '#F4C2C2', '#F6D5D8', '#FCF0F4'] },
  { label: 'Gold',        dots: ['#C9A227', '#D8B84A', '#E6D2A2', '#F0E5C4', '#F8F3E8'] },
  { label: 'Neutral',     dots: ['#FFF4E1', '#FFFFF0', '#FFFFFF', '#F8F8F0', '#F5F3EE'] },
  { label: 'Lemon Green', dots: ['#B7D84B', '#C6E067', '#D5E890', '#E4F0B8', '#F3F9DC'] },
]

function SwatchCard({ c, onCopy }: { c: Swatch; onCopy: (hex: string) => void }) {
  const [copied, setCopied] = useState(false)

  function handleClick() {
    navigator.clipboard.writeText(c.hex).catch(() => {})
    setCopied(true)
    onCopy(c.hex)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div
      className="group cursor-pointer flex flex-col items-center gap-2 select-none"
      onClick={handleClick}
      title={`Click to copy ${c.hex}`}
    >
      <div className="relative w-full">
        <div
          className="w-full aspect-square rounded-2xl shadow-lg transition-all duration-300
                     group-hover:-translate-y-1.5 group-hover:shadow-xl group-hover:scale-[1.03]"
          style={{
            backgroundColor: c.hex,
            border: c.border ? '1px solid #E0D0F0' : '1px solid transparent',
            outline: copied ? '3px solid #C9A227' : '3px solid transparent',
            outlineOffset: 2,
          }}
        />
        {/* Copied badge */}
        {copied && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-2xl"
            style={{ background: 'rgba(0,0,0,0.28)' }}
          >
            <span className="text-white text-[11px] font-bold tracking-wide drop-shadow">Copied!</span>
          </div>
        )}
        {/* Hover copy hint */}
        {!copied && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ background: 'rgba(0,0,0,0.18)' }}
          >
            <span className="text-white text-[10px] font-semibold tracking-wide drop-shadow">Copy</span>
          </div>
        )}
      </div>
      <p className="text-[10px] font-semibold text-center uppercase tracking-wide leading-tight transition-colors duration-200"
         style={{ color: copied ? '#C9A227' : '#432b50' }}>{c.name}</p>
      <p className="text-[9px] text-center font-mono mt-[-5px]" style={{ color: '#8F5DAF' }}>{c.hex}</p>
    </div>
  )
}

export function PaletteDisplay() {
  const [preview, setPreview] = useState<string | null>(null)
  const [toastHex, setToastHex] = useState<string | null>(null)

  const handleCopy = useCallback((hex: string) => {
    setPreview(hex)
    setToastHex(hex)
    setTimeout(() => setToastHex(null), 2000)
  }, [])

  return (
    <div>
      {/* Floating toast */}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 pointer-events-none"
        style={{ opacity: toastHex ? 1 : 0, transform: `translateX(-50%) translateY(${toastHex ? 0 : 12}px)` }}
      >
        <div className="flex items-center gap-3 bg-white rounded-xl shadow-2xl px-4 py-2.5 border border-lavender-100">
          {toastHex && (
            <div className="w-5 h-5 rounded-md flex-shrink-0 shadow-sm border border-black/5"
                 style={{ background: toastHex }} />
          )}
          <span className="font-mono text-sm font-semibold" style={{ color: '#432b50' }}>
            {toastHex} copied!
          </span>
        </div>
      </div>

      {/* Live preview bar */}
      {preview && (
        <div className="mb-6 rounded-2xl overflow-hidden shadow-md flex items-center gap-4 p-4"
             style={{ background: preview, border: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-[0.4em] font-semibold"
               style={{ color: 'rgba(0,0,0,0.4)' }}>Selected</p>
            <p className="font-mono text-lg font-bold" style={{ color: 'rgba(0,0,0,0.55)' }}>{preview}</p>
          </div>
          <button onClick={() => setPreview(null)}
                  className="text-[10px] uppercase tracking-wide opacity-50 hover:opacity-80 transition-opacity"
                  style={{ color: 'rgba(0,0,0,0.5)' }}>✕ Clear</button>
        </div>
      )}

      {/* Primary Row — 6 colours */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mb-4">
        {PALETTE_ROW1.map(c => <SwatchCard key={c.name} c={c} onCopy={handleCopy} />)}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px" style={{ background: 'rgba(201,162,39,0.25)' }} />
        <span className="text-[8px] uppercase tracking-[0.5em] font-semibold" style={{ color: '#C9A227' }}>
          Accent &amp; Supporting
        </span>
        <div className="flex-1 h-px" style={{ background: 'rgba(201,162,39,0.25)' }} />
      </div>

      {/* Secondary Row — 7 colours */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-4 mb-8">
        {PALETTE_ROW2.map(c => <SwatchCard key={c.name} c={c} onCopy={handleCopy} />)}
      </div>

      {/* Gradient bar */}
      <div
        className="h-12 rounded-2xl mb-8 shadow-md"
        style={{
          background: 'linear-gradient(90deg, #8F5DAF 0%, #B79AD8 10%, #C8A2C8 20%, #C875C4 30%, #D94F9D 38%, #F4C2C2 48%, #F6D5D8 56%, #B7D84B 63%, #FFFFF0 70%, #FFF4E1 77%, #FFFFFF 83%, #C9A227 90%, #E6D2A2 100%)',
        }}
      />

      {/* Colour family dots */}
      <p className="text-[8px] uppercase tracking-[0.5em] text-center font-semibold mb-5"
         style={{ color: '#8F5DAF', opacity: 0.7 }}>Colour Families</p>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
        {FAMILIES.map(f => (
          <div key={f.label} className="flex flex-col items-center gap-2">
            <div className="flex gap-1 justify-center">
              {f.dots.map((d, i) => (
                <div
                  key={i}
                  className="rounded-full shadow-sm flex-shrink-0 cursor-pointer hover:scale-110 transition-transform duration-150"
                  style={{ width: 18, height: 18, background: d, border: '1px solid rgba(0,0,0,0.06)' }}
                  title={d}
                  onClick={() => { navigator.clipboard.writeText(d).catch(() => {}); handleCopy(d) }}
                />
              ))}
            </div>
            <p className="text-[9.5px] font-semibold uppercase tracking-wide text-center"
               style={{ color: '#432b50' }}>{f.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
