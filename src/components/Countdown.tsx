'use client'

import { useEffect, useState } from 'react'

const WEDDING_DATE = new Date('2026-12-19T10:00:00')

function pad(n: number) {
  return String(n).padStart(2, '0')
}

interface TimeLeft {
  days:    number
  hours:   number
  minutes: number
  seconds: number
}

/* ══════════════════════════════════════════════════════
   FlipUnit — the 4-layer mechanical page-flip card
   ══════════════════════════════════════════════════════
   Layer stack (bottom → top):
   1. staticTop    — always shows NEW number (top half)
   2. staticBottom — shows OLD during flip, NEW after
   3. topFlap      — shows OLD, rotates 0→-90° (folds away)
   4. bottomFlap   — shows NEW, starts 90°→0 (folds in, delayed)
*/
function FlipUnit({ value, label }: { value: number; label: string }) {
  const display = pad(value)

  return (
    <div className="flex flex-col items-center gap-2">
      <span
        key={display}
        className="font-serif font-bold tabular-nums leading-none select-none text-[2.6rem] md:text-[3.4rem]"
        style={{ color: '#7e5a98', animation: 'fadeUp 0.35s ease-out both' }}
      >
        {display}
      </span>
      <p className="text-[10px] md:text-xs font-sans uppercase tracking-[0.22em]" style={{ color: '#432b5099' }}>
        {label}
      </p>
    </div>
  )
}

/* ── Dot separator between units ────────────────────── */
function Separator() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 pb-8 self-end mb-3">
      <span className="w-1.5 h-1.5 rounded-full block" style={{ background: '#7e5a9870' }} />
      <span className="w-1.5 h-1.5 rounded-full block" style={{ background: '#7e5a9870' }} />
    </div>
  )
}

/* ── Main Countdown component ────────────────────────── */
export function Countdown() {
  const [time, setTime] = useState<TimeLeft | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    function tick() {
      const diff = WEDDING_DATE.getTime() - Date.now()
      if (diff <= 0) { setDone(true); return }
      setTime({
        days:    Math.floor(diff / 86_400_000),
        hours:   Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000)  / 60_000),
        seconds: Math.floor((diff % 60_000)     / 1_000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  if (done) {
    return (
      <div className="text-center animate-fade-up">
        <p className="font-script text-4xl text-gold">The celebration has begun! 🎉</p>
      </div>
    )
  }

  if (!time) return null

  return (
    <div className="flex items-end justify-center gap-2 md:gap-4">
      <FlipUnit value={time.days}    label="Days"    />
      <Separator />
      <FlipUnit value={time.hours}   label="Hours"   />
      <Separator />
      <FlipUnit value={time.minutes} label="Minutes" />
      <Separator />
      <FlipUnit value={time.seconds} label="Seconds" />
    </div>
  )
}
