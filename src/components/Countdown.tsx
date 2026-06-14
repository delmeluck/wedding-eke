'use client'

import { useEffect, useRef, useState } from 'react'

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
  const display  = pad(value)
  const prevRef  = useRef(display)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const [prev,     setPrev]     = useState(display)
  const [flipping, setFlipping] = useState(false)
  const [showNew,  setShowNew]  = useState(true)  // controls which value static bottom shows

  useEffect(() => {
    if (display === prevRef.current) return

    const oldVal = prevRef.current
    prevRef.current = display

    clearTimeout(timerRef.current)

    // 1. Store old value, mark bottom static as "old"
    setPrev(oldVal)
    setShowNew(false)  // static bottom: show OLD while top flap folds away
    setFlipping(true)

    // 2. After top flap folds (~320ms), static bottom switches to NEW
    //    (bottom flap, also showing NEW, is folding in on top of it)
    timerRef.current = setTimeout(() => setShowNew(true), 320)

    // 3. After full animation (~700ms), remove flap elements
    timerRef.current = setTimeout(() => setFlipping(false), 700)

    return () => clearTimeout(timerRef.current)
  }, [display])

  /* Shared helpers */
  const half =
    'absolute left-0 right-0 h-1/2 overflow-hidden bg-white'
  const numWrap = (pos: 'top' | 'bottom') =>
    `absolute left-0 right-0 h-[200%] flex items-center justify-center ${
      pos === 'top' ? 'top-0' : 'bottom-0'
    }`
  const numCls =
    'font-serif font-bold text-purple-950 tabular-nums leading-none select-none ' +
    'text-[2.4rem] md:text-[3.2rem]'

  return (
    <div className="flex flex-col items-center gap-3">

      {/* ─── Card ─────────────────────────────────── */}
      <div
        className="relative w-[72px] h-[84px] md:w-[96px] md:h-[110px] drop-shadow-md"
        style={{ perspective: '400px' }}
      >
        {/* ── 1. Static top half — NEW number ──────── */}
        <div
          className={`${half} top-0 rounded-t-2xl z-[1]
                      border border-b-0 border-gray-100`}
        >
          <div className={numWrap('top')}>
            <span className={numCls}>{display}</span>
          </div>
          {/* Subtle inner shadow at fold edge */}
          <div className="absolute bottom-0 left-0 right-0 h-3
                          bg-gradient-to-t from-black/[0.06] to-transparent pointer-events-none" />
        </div>

        {/* ── 2. Static bottom half — OLD → NEW ────── */}
        <div
          className={`${half} bottom-0 rounded-b-2xl z-[1]
                      border border-t-0 border-gray-100`}
        >
          <div className={numWrap('bottom')}>
            <span className={numCls}>{showNew ? display : prev}</span>
          </div>
          {/* Subtle inner shadow at fold edge */}
          <div className="absolute top-0 left-0 right-0 h-3
                          bg-gradient-to-b from-black/[0.04] to-transparent pointer-events-none" />
        </div>

        {/* ── 3. Top flap — OLD number, folds down ─── */}
        {flipping && (
          <div
            className={`${half} top-0 rounded-t-2xl z-[3]
                        border border-b-0 border-gray-100
                        flip-top-flap
                        shadow-[0_6px_16px_rgba(0,0,0,0.18)]`}
          >
            <div className={numWrap('top')}>
              <span className={numCls}>{prev}</span>
            </div>
            {/* Shading that intensifies as the flap rotates */}
            <div className="absolute inset-0 rounded-t-2xl
                            bg-gradient-to-b from-transparent to-black/[0.08] pointer-events-none" />
          </div>
        )}

        {/* ── 4. Bottom flap — NEW number, folds up ── */}
        {flipping && (
          <div
            className={`${half} bottom-0 rounded-b-2xl z-[3]
                        border border-t-0 border-gray-100
                        flip-bottom-flap
                        shadow-[0_-4px_12px_rgba(0,0,0,0.12)]`}
          >
            <div className={numWrap('bottom')}>
              <span className={numCls}>{display}</span>
            </div>
          </div>
        )}

        {/* ── Centre crease / fold line ─────────────── */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-px
                        h-[2px] bg-gray-200 z-[4] pointer-events-none" />
        {/* Drop shadow below the crease */}
        <div className="absolute top-1/2 left-0 right-0
                        h-[4px] bg-gradient-to-b from-black/10 to-transparent
                        z-[4] pointer-events-none" />
      </div>

      {/* ─── Label ───────────────────────────────── */}
      <p className="text-lavender-300/80 text-[10px] md:text-xs
                    font-sans uppercase tracking-[0.22em]">
        {label}
      </p>
    </div>
  )
}

/* ── Dot separator between units ────────────────────── */
function Separator() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 pb-8 self-end mb-3">
      <span className="w-1.5 h-1.5 rounded-full bg-gold/70 block" />
      <span className="w-1.5 h-1.5 rounded-full bg-gold/70 block" />
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
