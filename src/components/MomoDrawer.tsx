'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Smartphone, Loader2, CheckCircle2, AlertCircle, Copy, ChevronRight, Phone } from 'lucide-react'

/* ── Types ────────────────────────────────────────────────── */
type Network = 'mtn' | 'telecel' | 'airtel'
type Stage   = 'form' | 'submitting' | 'otp' | 'pending' | 'success' | 'failed'

interface NetworkConfig {
  id:       Network
  label:    string
  icon:     string
  ussd:     string
  color:    string
  bg:       string
  border:   string
  textBold: string
}

export const NETWORKS: NetworkConfig[] = [
  {
    id: 'mtn', label: 'MTN MoMo', icon: '🔶',
    ussd: '*170#',
    color: 'text-yellow-800', bg: 'bg-yellow-50', border: 'border-yellow-300', textBold: 'font-bold text-yellow-900',
  },
  {
    id: 'telecel', label: 'Telecel Cash', icon: '🔴',
    ussd: '*110#',
    color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', textBold: 'font-bold text-red-800',
  },
  {
    id: 'airtel', label: 'AirtelTigo Money', icon: '🔵',
    ussd: '*500#',
    color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', textBold: 'font-bold text-blue-800',
  },
]

// Network-specific USSD steps for manual transfers
const MANUAL_STEPS: Record<string, (recipient?: string, amount?: string) => string[]> = {
  mtn: (recipient, amount) => [
    'Dial *170# on your MTN phone',
    'Select 1 → Send Money',
    'Select 1 → MoMo User',
    ...(recipient ? [`Enter number: ${recipient}`] : ['Enter the recipient\'s number']),
    `Enter amount: GH₵ ${amount ?? '—'}`,
    'Enter your 4-digit PIN to confirm',
  ],
  telecel: (recipient, amount) => [
    'Dial *110# on your Telecel phone',
    'Select 2 → Send Money',
    ...(recipient ? [`Enter number: ${recipient}`] : ['Enter the recipient\'s number']),
    `Enter amount: GH₵ ${amount ?? '—'}`,
    'Enter your PIN to confirm',
  ],
  airtel: (recipient, amount) => [
    'Dial *500# on your AirtelTigo phone',
    'Select 1 → My Wallet',
    'Select 3 → Send Money',
    'Select 1 → To Mobile Number',
    ...(recipient ? [`Enter number: ${recipient}`] : ['Enter the recipient\'s number']),
    `Enter amount: GH₵ ${amount ?? '—'}`,
    'Enter your PIN to confirm',
  ],
}

export interface MomoDrawerProps {
  open:             boolean
  onClose:          () => void
  giftId?:          string
  giftName?:        string
  suggestedAmount?: number
  recipientName?:   string
  /** Numbers keyed by network. If undefined/empty all networks are shown. */
  availableNetworks?: {
    mtn?:     string
    telecel?: string
    airtel?:  string
  }
}

/* ── Helpers ──────────────────────────────────────────────── */
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('233') && digits.length === 12) return '0' + digits.slice(3)
  if (digits.startsWith('0')   && digits.length === 10) return digits
  return digits
}

/* ── Component ────────────────────────────────────────────── */
export function MomoDrawer({
  open, onClose,
  giftId, giftName, suggestedAmount,
  recipientName, availableNetworks,
}: MomoDrawerProps) {
  // Always show all three networks side by side
  const enabledNetworks: Network[] = ['mtn', 'telecel', 'airtel']

  const [stage,      setStage]      = useState<Stage>('form')
  const [network,    setNetwork]    = useState<Network>(enabledNetworks[0] ?? 'mtn')
  const [phone,      setPhone]      = useState('')
  const [amount,     setAmount]     = useState(suggestedAmount ? String(suggestedAmount) : '')
  const [name,       setName]       = useState('')
  const [note,       setNote]       = useState('')
  const [error,      setError]      = useState('')
  const [reference,  setReference]  = useState('')
  const [displayTxt, setDisplayTxt] = useState('')
  const [mode,       setMode]       = useState<'paystack' | 'manual'>('paystack')
  const [otp,        setOtp]        = useState('')
  const [otpPrompt,  setOtpPrompt]  = useState('')
  const [otpError,   setOtpError]   = useState('')
  const [copied,     setCopied]     = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const recipientNumber = availableNetworks?.[network]

  // Reset when opened
  useEffect(() => {
    if (open) {
      setStage('form')
      setNetwork(enabledNetworks[0] ?? 'mtn')
      setAmount(suggestedAmount ? String(suggestedAmount) : '')
      setPhone(''); setName(''); setNote(''); setError('')
      setReference(''); setDisplayTxt(''); setOtp(''); setOtpPrompt(''); setOtpError('')
    }
    return () => { if (pollRef.current) clearTimeout(pollRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, suggestedAmount])

  // Poll for payment confirmation
  useEffect(() => {
    if (stage !== 'pending' || !reference) return
    let attempts = 0
    const MAX = 40

    const poll = async () => {
      try {
        const res  = await fetch(`/api/gifts/momo/verify?ref=${reference}`)
        const data = await res.json()
        if (data.status === 'success') { setStage('success'); return }
        if (data.status === 'failed')  {
          // Auto-prompt didn't complete — switch to manual USSD mode
          setMode('manual')
          return
        }
        if (data.displayText) setDisplayTxt(data.displayText)
      } catch { /* ignore */ }
      attempts++
      if (attempts < MAX) pollRef.current = setTimeout(poll, 3000)
      else { setStage('failed'); setError('Payment timed out. If you sent the money, please contact us.') }
    }

    pollRef.current = setTimeout(poll, 3000)
    return () => { if (pollRef.current) clearTimeout(pollRef.current) }
  }, [stage, reference])

  async function submit() {
    const ph = formatPhone(phone)
    const am = Number(amount)
    if (!ph || ph.length < 9) { setError('Enter a valid 10-digit Ghana phone number'); return }
    if (!am || am < 1)        { setError('Enter an amount of at least GH₵ 1'); return }
    setError(''); setStage('submitting')

    try {
      const res  = await fetch('/api/gifts/momo/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giftId, donorName: name || undefined, donorPhone: ph, network, amount: am, note: note || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { setStage('failed'); setError(data.error ?? 'Something went wrong'); return }
      setReference(data.reference)
      setDisplayTxt(data.displayText ?? '')
      setMode(data.mode ?? 'paystack')
      if (data.status === 'send_otp') {
        setOtpPrompt(data.displayText ?? 'Enter the code sent to your phone.')
        setStage('otp')
      } else {
        setStage(data.status === 'success' ? 'success' : 'pending')
      }
    } catch {
      setStage('failed')
      setError('Network error. Please check your connection and try again.')
    }
  }

  async function submitOtp() {
    if (!otp.trim()) { setOtpError('Please enter the code from your SMS'); return }
    setOtpError(''); setStage('submitting')
    try {
      const res  = await fetch('/api/gifts/momo/submit-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: otp.trim(), reference }),
      })
      const data = await res.json()
      if (!res.ok) { setStage('otp'); setOtpError(data.error ?? 'Invalid code, please try again'); return }
      if (data.status === 'success') { setStage('success') }
      else { setStage('pending') }
    } catch {
      setStage('otp'); setOtpError('Network error. Please try again.')
    }
  }

  async function manualConfirm() {
    try {
      await fetch('/api/gifts/momo/verify', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref: reference }),
      })
    } catch { /* best-effort */ }
    setStage('success')
  }

  function handleCopy(text: string, key: string) {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const netCfg    = NETWORKS.find(n => n.id === network) ?? NETWORKS[0]
  const amountNum = Number(amount)

  // Transition state: keep mounted during exit animation
  const [mounted,  setMounted]  = useState(false)
  const [visible,  setVisible]  = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    } else {
      setVisible(false)
      const t = setTimeout(() => setMounted(false), 350)
      return () => clearTimeout(t)
    }
  }, [open])

  if (!mounted) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-50">
        <div className={`relative bg-white rounded-t-3xl md:rounded-3xl shadow-2xl w-full md:max-w-md
                        max-h-[92vh] overflow-y-auto
                        transition-all duration-350 ease-out
                        ${visible
                          ? 'translate-y-0 opacity-100 md:scale-100'
                          : 'translate-y-full opacity-0 md:translate-y-0 md:scale-95'}`}>

          {/* Header */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm px-6 pt-5 pb-4
                          flex items-center justify-between border-b border-gray-100 rounded-t-3xl md:rounded-t-3xl z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-700 to-purple-900 flex items-center justify-center">
                <Smartphone size={18} className="text-white" />
              </div>
              <div>
                <h2 className="font-serif text-lg text-purple-900 leading-tight">Send via Mobile Money</h2>
                {giftName && <p className="text-xs text-gray-400 font-sans">{giftName}</p>}
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="px-6 py-5">

            {/* ── FORM ──────────────────────────────────── */}
            {(stage === 'form' || stage === 'submitting') && (
              <div className="space-y-5">

                {/* Network selector */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block font-sans">
                    Your Network
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {NETWORKS.filter(n => enabledNetworks.includes(n.id)).map(n => (
                      <button key={n.id} type="button"
                        onClick={() => setNetwork(n.id)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2
                                    text-xs font-semibold transition-all duration-200 font-sans
                                    ${network === n.id
                                      ? `${n.bg} ${n.border} ${n.color} shadow-sm scale-[1.03]`
                                      : 'border-gray-100 text-gray-400 hover:border-gray-200 hover:bg-gray-50'}`}
                      >
                        <span className="text-xl">{n.icon}</span>
                        {n.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recipient details (shown when a number is configured) */}
                {recipientNumber && (
                  <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
                    <p className="text-[11px] text-purple-500 uppercase tracking-widest font-sans mb-2">Sending to</p>
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        {recipientName && <p className="font-serif text-purple-900 font-semibold leading-tight">{recipientName}</p>}
                        <p className="font-mono text-purple-700 text-sm mt-0.5">{recipientNumber}</p>
                      </div>
                      <button onClick={() => handleCopy(recipientNumber, 'recipient')}
                        className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-700 transition-colors">
                        {copied === 'recipient' ? <CheckCircle2 size={13} className="text-green-500" /> : <Copy size={13} />}
                        {copied === 'recipient' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Amount */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block font-sans">
                    Amount (GH₵)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-serif text-lg">₵</span>
                    <input
                      type="number" inputMode="decimal" min={1}
                      value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
                      className="w-full pl-9 pr-4 py-3.5 rounded-2xl border border-gray-200
                                 text-xl font-serif text-purple-900 text-right
                                 focus:outline-none focus:border-purple-400 transition-colors"
                    />
                  </div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {[50, 100, 200, 500].map(v => (
                      <button key={v} type="button" onClick={() => setAmount(String(v))}
                        className={`text-xs px-3 py-1.5 rounded-full border font-sans transition-colors
                                    ${Number(amount) === v
                                      ? 'bg-gold border-gold text-purple-900 font-semibold'
                                      : 'border-gray-200 text-gray-500 hover:border-purple-300 hover:text-purple-700'}`}>
                        ₵{v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sender phone */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block font-sans">
                    Your {netCfg.label} Number
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel" inputMode="tel"
                      value={phone} onChange={e => setPhone(e.target.value)} placeholder="024 000 0000"
                      className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-gray-200
                                 font-mono text-base text-purple-900
                                 focus:outline-none focus:border-purple-400 transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 font-sans mt-1.5">
                    A payment prompt will be sent to this number
                  </p>
                </div>

                {/* Optional name + note */}
                <div className="space-y-3">
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Your name (optional)"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-sans
                               text-gray-700 focus:outline-none focus:border-purple-400 transition-colors" />
                  <input type="text" value={note} onChange={e => setNote(e.target.value)}
                    placeholder="A short message for Ekow & Ekua (optional)"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-sans
                               text-gray-700 focus:outline-none focus:border-purple-400 transition-colors" />
                </div>

                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                    <AlertCircle size={15} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-red-600 text-sm font-sans">{error}</p>
                  </div>
                )}

                <button onClick={submit}
                  disabled={stage === 'submitting' || !phone || !amount}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-700 to-purple-900
                             text-white font-sans font-semibold text-base
                             hover:from-purple-800 hover:to-purple-950 transition-all
                             disabled:opacity-40 disabled:cursor-not-allowed
                             flex items-center justify-center gap-2.5 shadow-lg shadow-purple-200"
                >
                  {stage === 'submitting'
                    ? <><Loader2 size={18} className="animate-spin" /> Initiating…</>
                    : <>
                        <Smartphone size={18} />
                        Send GH₵{amountNum > 0 ? amountNum.toLocaleString() : '—'} via {netCfg.label}
                        <ChevronRight size={16} />
                      </>}
                </button>

                <p className="text-center text-[11px] text-gray-400 font-sans">
                  Your payment is processed securely. We never store your PIN.
                </p>
              </div>
            )}

            {/* ── OTP ──────────────────────────────────── */}
            {stage === 'otp' && (
              <div className="text-center py-6">
                <div className={`w-20 h-20 rounded-full ${netCfg.bg} border-2 ${netCfg.border} flex items-center justify-center mx-auto mb-5`}>
                  <span className="text-3xl">💬</span>
                </div>
                <h3 className="font-serif text-xl text-purple-900 mb-2">Enter Your Code</h3>
                <p className="text-gray-500 font-sans text-sm mb-5 max-w-xs mx-auto leading-relaxed">
                  {otpPrompt || 'A code has been sent to your phone. Enter it below to confirm your payment.'}
                </p>

                <div className="max-w-xs mx-auto mb-4">
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={8}
                    value={otp}
                    onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setOtpError('') }}
                    placeholder="Enter code"
                    className="w-full px-4 py-4 rounded-2xl border-2 border-purple-200
                               text-center text-2xl font-mono font-bold text-purple-900
                               tracking-[0.4em] focus:outline-none focus:border-purple-500
                               transition-colors"
                    autoFocus
                  />
                  {otpError && (
                    <p className="text-red-500 text-sm font-sans mt-2">{otpError}</p>
                  )}
                </div>

                <div className="flex flex-col gap-3 max-w-xs mx-auto">
                  <button onClick={submitOtp}
                    disabled={!otp}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-700 to-purple-900
                               text-white font-sans font-semibold text-base
                               hover:from-purple-800 hover:to-purple-950 transition-all
                               disabled:opacity-40 disabled:cursor-not-allowed
                               flex items-center justify-center gap-2.5">
                    <CheckCircle2 size={18} /> Confirm Payment
                  </button>
                  <button onClick={() => { setStage('form'); setOtp(''); setOtpError('') }}
                    className="text-sm text-gray-400 hover:text-gray-600 font-sans transition-colors py-1">
                    ← Go back
                  </button>
                </div>
              </div>
            )}

            {/* ── PENDING ──────────────────────────────── */}
            {stage === 'pending' && (
              <div className="text-center py-6">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center">
                    <Smartphone size={40} className="text-purple-700" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-purple-400/40 animate-ping" />
                  <div className="absolute inset-[-8px] rounded-full border border-purple-300/20 animate-ping [animation-delay:.3s]" />
                </div>

                <h3 className="font-serif text-xl text-purple-900 mb-2">Check Your Phone</h3>
                <p className="text-gray-500 font-sans text-sm mb-1">
                  {displayTxt || 'A payment prompt has been sent to your mobile money account.'}
                </p>
                <p className="font-mono text-purple-700 text-base font-semibold mb-3">{formatPhone(phone)}</p>
                {network === 'airtel' && mode !== 'manual' && (
                  <p className="text-blue-600 text-xs font-sans bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 mb-4 text-center">
                    If no prompt appears, dial <strong>*500#</strong> → My Wallet → Approve Transactions to find the pending request.
                  </p>
                )}

                {mode === 'manual' && (
                  <div className={`${netCfg.bg} ${netCfg.border} border rounded-2xl p-4 mb-5 text-left`}>
                    <p className={`text-xs font-semibold uppercase tracking-widest ${netCfg.color} mb-3`}>
                      How to send via {netCfg.label}
                    </p>
                    <ol className={`text-sm ${netCfg.color} space-y-2.5 font-sans`}>
                      {(MANUAL_STEPS[network] ?? MANUAL_STEPS.mtn)(recipientNumber, amount).map((step, i) => {
                        // Bold the USSD code or number in the step
                        const isFirst = i === 0
                        const hasRecipient = recipientNumber && step.includes(recipientNumber)
                        return (
                          <li key={i} className="flex items-start gap-2">
                            <span className={`flex-shrink-0 w-5 h-5 rounded-full ${netCfg.border} border flex items-center justify-center text-[11px] font-bold mt-0.5`}>
                              {i + 1}
                            </span>
                            <span>
                              {isFirst
                                ? <><strong className={netCfg.textBold}>{netCfg.ussd}</strong>{' '}{step.split(netCfg.ussd)[1]}</>
                                : hasRecipient
                                  ? <>{step.split(recipientNumber!)[0]}<strong className={netCfg.textBold}>{recipientNumber}</strong>
                                      <button onClick={() => handleCopy(recipientNumber!, 'num2')}
                                        className={`ml-1.5 inline-flex items-center gap-0.5 text-xs ${netCfg.color} opacity-60 hover:opacity-100`}>
                                        {copied === 'num2' ? '✓' : <Copy size={10} />}
                                      </button>
                                    </>
                                  : step}
                            </span>
                          </li>
                        )
                      })}
                    </ol>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  {mode === 'manual' ? (
                    <button onClick={manualConfirm}
                      className="w-full py-3.5 rounded-2xl bg-green-600 text-white font-sans font-semibold
                                 hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                      <CheckCircle2 size={18} /> I&apos;ve Sent the Gift ✓
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 justify-center text-gray-400 font-sans text-sm">
                      <Loader2 size={15} className="animate-spin" /> Waiting for confirmation…
                    </div>
                  )}
                  <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600 font-sans transition-colors py-1">
                    Done for now — close
                  </button>
                </div>
              </div>
            )}

            {/* ── SUCCESS ──────────────────────────────── */}
            {stage === 'success' && (
              <div className="text-center py-8">
                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 size={48} className="text-green-500" />
                </div>
                <h3 className="font-serif text-2xl text-purple-900 mb-2">Gift Sent! 🎉</h3>
                <p className="text-gray-500 font-sans text-sm mb-2 leading-relaxed max-w-xs mx-auto">
                  {name ? `Thank you, ${name}!` : 'Thank you!'}{' '}
                  Your gift of <strong className="text-purple-900">GH₵ {Number(amount).toLocaleString()}</strong> has been received.
                </p>
                <p className="font-script text-3xl text-gold mt-4 mb-6">Ekow &amp; Ekua</p>
                <button onClick={onClose}
                  className="px-8 py-3 rounded-full bg-gold text-purple-950 font-sans font-semibold hover:bg-yellow-300 transition-colors">
                  Close
                </button>
              </div>
            )}

            {/* ── FAILED ───────────────────────────────── */}
            {stage === 'failed' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
                  <AlertCircle size={40} className="text-red-400" />
                </div>
                <h3 className="font-serif text-xl text-purple-900 mb-2">Payment Not Completed</h3>
                <p className="text-gray-500 font-sans text-sm mb-6 max-w-xs mx-auto">
                  {error || 'The payment was not confirmed. You can try again below.'}
                </p>
                <div className="flex flex-col gap-3">
                  <button onClick={() => { setStage('form'); setError('') }}
                    className="w-full py-3.5 rounded-2xl bg-purple-700 text-white font-sans font-semibold hover:bg-purple-800 transition-colors">
                    Try Again
                  </button>
                  <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600 font-sans transition-colors py-1">
                    Cancel
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
