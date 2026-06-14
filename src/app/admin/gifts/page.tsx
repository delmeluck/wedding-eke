'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Trash2, Edit2, X, Check, Gift, Banknote, Smartphone,
  Building2, Ticket, Copy, Send, ChevronDown, ChevronUp, Eye, EyeOff,
} from 'lucide-react'
import { useToast } from '@/app/toaster'

/* ─── types ─────────────────────────────────────────────────── */
type GiftType = 'physical' | 'momo_mtn' | 'momo_vodafone' | 'momo_airtel' | 'bank' | 'token'

interface Gift {
  id: string
  name: string
  description?: string
  price?: number
  imageUrl?: string
  category?: string
  giftType: GiftType
  momoNumber?: string
  momoName?: string
  bankName?: string
  bankAccount?: string
  bankBranch?: string
  priority: number
  claimed: boolean
  claimedBy?: string
  coupons?: Coupon[]
}

interface Coupon {
  id: string
  code: string
  value?: number
  note?: string
  sentTo?: string
  sentAt?: string
  claimedBy?: string
  claimedAt?: string
}

/* ─── config ─────────────────────────────────────────────────── */
const GIFT_TYPES: { value: GiftType; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'physical',      label: 'Physical Gift',    icon: <Gift size={16} />,        color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { value: 'momo_mtn',     label: 'MTN MoMo',         icon: <Smartphone size={16} />,  color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  { value: 'momo_vodafone',label: 'Vodafone Cash',     icon: <Smartphone size={16} />,  color: 'text-red-600 bg-red-50 border-red-200' },
  { value: 'momo_airtel',  label: 'AirtelTigo Money',  icon: <Smartphone size={16} />,  color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { value: 'bank',         label: 'Bank Transfer',     icon: <Building2 size={16} />,   color: 'text-green-700 bg-green-50 border-green-200' },
  { value: 'token',        label: 'Gift Token/Coupon', icon: <Ticket size={16} />,      color: 'text-gold bg-yellow-50 border-yellow-300' },
]

const GHANA_BANKS = ['GCB Bank', 'Ecobank Ghana', 'Fidelity Bank', 'Stanbic Bank', 'Zenith Bank', 'Access Bank', 'Absa Ghana', 'First National Bank', 'CAL Bank', 'UBA Ghana']

const empty = (): Partial<Gift> => ({
  name: '', description: '', price: undefined, imageUrl: '',
  category: '', giftType: 'physical', momoNumber: '', momoName: '',
  bankName: '', bankAccount: '', bankBranch: '', priority: 0, claimed: false,
})

/* ─── component ─────────────────────────────────────────────── */
export default function GiftsPage() {
  const [gifts,        setGifts]        = useState<Gift[]>([])
  const [showForm,     setShowForm]     = useState(false)
  const [form,         setForm]         = useState<Partial<Gift>>(empty())
  const [editing,      setEditing]      = useState<string | null>(null)
  const [expanded,     setExpanded]     = useState<Set<string>>(new Set())
  const [couponsMap,   setCouponsMap]   = useState<Record<string, Coupon[]>>({})
  const [genModal,     setGenModal]     = useState<Gift | null>(null)
  const [sendModal,    setSendModal]    = useState<{ gift: Gift; coupon: Coupon } | null>(null)
  const [genCount,     setGenCount]     = useState(1)
  const [genValue,     setGenValue]     = useState('')
  const [genNote,      setGenNote]      = useState('')
  const [sendEmail,    setSendEmail]    = useState('')
  const [sendName,     setSendName]     = useState('')
  const [showDetails,  setShowDetails]  = useState<Set<string>>(new Set())
  const [activeTab,    setActiveTab]    = useState<'all' | GiftType>('all')
  const { toast } = useToast()

  const load = useCallback(async () => {
    const res = await fetch('/api/gifts')
    if (res.ok) setGifts(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  async function loadCoupons(giftId: string) {
    const res = await fetch(`/api/gifts/coupons`)
    if (res.ok) {
      const all: (Coupon & { giftId: string })[] = await res.json()
      const map: Record<string, Coupon[]> = {}
      all.forEach(c => { (map[c.giftId] ??= []).push(c) })
      setCouponsMap(map)
    }
  }

  function toggleExpand(id: string) {
    const next = new Set(expanded)
    if (next.has(id)) { next.delete(id) } else { next.add(id); loadCoupons(id) }
    setExpanded(next)
  }

  function toggleDetails(id: string) {
    const next = new Set(showDetails)
    next.has(id) ? next.delete(id) : next.add(id)
    setShowDetails(next)
  }

  function openAdd() { setForm(empty()); setEditing(null); setShowForm(true) }
  function openEdit(g: Gift) { setForm({ ...g }); setEditing(g.id); setShowForm(true) }

  async function save() {
    if (!form.name?.trim()) { toast({ title: 'Name is required', type: 'error' }); return }
    const url    = editing ? `/api/gifts/${editing}` : '/api/gifts'
    const method = editing ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, price: form.price ? Number(form.price) : undefined }),
    })
    if (res.ok) { toast({ title: editing ? 'Updated' : 'Added', type: 'success' }); setShowForm(false); load() }
    else toast({ title: 'Failed to save', type: 'error' })
  }

  async function del(id: string) {
    if (!confirm('Delete this gift?')) return
    await fetch(`/api/gifts/${id}`, { method: 'DELETE' })
    load(); toast({ title: 'Deleted', type: 'success' })
  }

  async function toggleClaimed(g: Gift) {
    await fetch(`/api/gifts/${g.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claimed: !g.claimed }),
    })
    load()
  }

  async function generateCoupons() {
    if (!genModal) return
    const res = await fetch('/api/gifts/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ giftId: genModal.id, count: genCount, value: genValue || undefined, note: genNote || undefined }),
    })
    if (res.ok) {
      toast({ title: `${genCount} token${genCount > 1 ? 's' : ''} generated`, type: 'success' })
      setGenModal(null); setGenCount(1); setGenValue(''); setGenNote('')
      loadCoupons(genModal.id)
    }
  }

  async function sendCoupon() {
    if (!sendModal) return
    const res = await fetch('/api/gifts/coupons/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ couponId: sendModal.coupon.id, email: sendEmail, recipientName: sendName }),
    })
    if (res.ok) {
      toast({ title: `Sent to ${sendEmail}`, type: 'success' })
      setSendModal(null); setSendEmail(''); setSendName('')
      loadCoupons(sendModal.gift.id)
    } else toast({ title: 'Failed to send', type: 'error' })
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text)
    toast({ title: 'Copied!', type: 'success' })
  }

  const giftTypeInfo = (t: GiftType) => GIFT_TYPES.find(x => x.value === t) ?? GIFT_TYPES[0]

  const filtered = activeTab === 'all' ? gifts : gifts.filter(g => g.giftType === activeTab)
  const claimed  = gifts.filter(g => g.claimed).length
  const total    = gifts.length

  return (
    <div>
      {/* ── Header ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl text-gray-800">Gifts</h1>
          <p className="text-gray-400 text-sm mt-1">
            {claimed}/{total} claimed · Gift registry &amp; payment tokens for Ghana
          </p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-sm font-medium rounded-xl shadow-sm transition-all hover:-translate-y-0.5">
          <Plus size={16} /> Add Gift
        </button>
      </div>

      {/* ── Stats row ──────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Gifts',   value: total,              color: 'bg-purple-50 text-purple-700' },
          { label: 'Claimed',       value: claimed,            color: 'bg-green-50 text-green-700' },
          { label: 'Available',     value: total - claimed,    color: 'bg-blue-50 text-blue-700' },
          { label: 'Gift Tokens',   value: gifts.filter(g => g.giftType === 'token').length, color: 'bg-yellow-50 text-yellow-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl px-4 py-3 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs opacity-70 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filter tabs ───────────────────────────────── */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === 'all' ? 'bg-purple-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          All ({total})
        </button>
        {GIFT_TYPES.map(t => {
          const count = gifts.filter(g => g.giftType === t.value).length
          if (count === 0) return null
          return (
            <button key={t.value} onClick={() => setActiveTab(t.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                activeTab === t.value ? 'bg-purple-700 text-white border-purple-700' : `${t.color} hover:opacity-80`
              }`}>
              {t.label} ({count})
            </button>
          )
        })}
      </div>

      {/* ── Gift cards ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(g => {
          const tInfo = giftTypeInfo(g.giftType)
          const isToken = g.giftType === 'token'
          const isMomo  = g.giftType.startsWith('momo_')
          const isBank  = g.giftType === 'bank'
          const open    = expanded.has(g.id)
          const showDet = showDetails.has(g.id)
          const coupons = couponsMap[g.id] ?? []

          return (
            <div key={g.id} className={`bg-white rounded-xl border transition-all duration-200 ${g.claimed ? 'opacity-60' : 'hover:shadow-md'}`}>

              {/* Card top */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${tInfo.color}`}>
                      {tInfo.icon} {tInfo.label}
                    </span>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {isToken && (
                      <button onClick={() => setGenModal(g)} title="Generate tokens"
                        className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-600" >
                        <Ticket size={13} />
                      </button>
                    )}
                    <button onClick={() => toggleClaimed(g)} title={g.claimed ? 'Mark unclaimed' : 'Mark claimed'}
                      className={`p-1.5 rounded-lg ${g.claimed ? 'bg-green-50 text-green-600' : 'hover:bg-gray-50 text-gray-300 hover:text-gray-500'}`}>
                      <Check size={13} />
                    </button>
                    <button onClick={() => openEdit(g)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-400 hover:text-blue-600">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => del(g.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-300 hover:text-red-500">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {g.category && <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{g.category}</p>}
                <h3 className="font-semibold text-gray-800 text-sm mb-1">{g.name}</h3>
                {g.description && <p className="text-gray-400 text-xs line-clamp-2 mb-2">{g.description}</p>}

                <div className="flex items-center justify-between">
                  {g.price && <span className="text-sm font-bold text-gold">GH₵ {g.price.toLocaleString()}</span>}
                  {g.claimed
                    ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-auto">✓ Claimed{g.claimedBy ? ` by ${g.claimedBy}` : ''}</span>
                    : <span className="text-xs bg-purple-50 text-purple-500 px-2 py-0.5 rounded-full ml-auto">Available</span>
                  }
                </div>
              </div>

              {/* Payment details (MoMo / Bank) */}
              {(isMomo || isBank) && (
                <div className="px-4 pb-3">
                  <button onClick={() => toggleDetails(g.id)}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                    {showDet ? <EyeOff size={12} /> : <Eye size={12} />}
                    {showDet ? 'Hide' : 'Show'} payment details
                  </button>
                  {showDet && (
                    <div className="mt-2 bg-gray-50 rounded-lg p-3 space-y-1.5 text-xs">
                      {isMomo && (
                        <>
                          {g.momoName    && <Detail label="Name"   value={g.momoName}    onCopy={() => copy(g.momoName!)} />}
                          {g.momoNumber  && <Detail label="Number" value={g.momoNumber}  onCopy={() => copy(g.momoNumber!)} />}
                          <p className="text-gray-400 pt-1">
                            Send via {g.giftType === 'momo_mtn' ? 'MTN MoMo' : g.giftType === 'momo_vodafone' ? 'Vodafone Cash' : 'AirtelTigo Money'}
                          </p>
                        </>
                      )}
                      {isBank && (
                        <>
                          {g.bankName    && <Detail label="Bank"    value={g.bankName}    onCopy={() => copy(g.bankName!)} />}
                          {g.momoName    && <Detail label="Acct Name" value={g.momoName}  onCopy={() => copy(g.momoName!)} />}
                          {g.bankAccount && <Detail label="Acct No."  value={g.bankAccount} onCopy={() => copy(g.bankAccount!)} />}
                          {g.bankBranch  && <Detail label="Branch"   value={g.bankBranch}  onCopy={() => copy(g.bankBranch!)} />}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Token coupons section */}
              {isToken && (
                <div className="border-t border-gray-50">
                  <button onClick={() => toggleExpand(g.id)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors">
                    <span className="flex items-center gap-1.5">
                      <Ticket size={12} /> {coupons.length} token{coupons.length !== 1 ? 's' : ''} generated
                    </span>
                    {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>

                  {open && (
                    <div className="px-4 pb-4 space-y-2">
                      {coupons.length === 0
                        ? <p className="text-xs text-gray-400 text-center py-2">No tokens yet — click 🎫 to generate</p>
                        : coupons.map(c => (
                          <div key={c.id} className={`rounded-lg border p-2.5 text-xs ${c.claimedAt ? 'bg-green-50 border-green-100' : 'bg-white border-gray-100'}`}>
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono font-bold text-purple-800 tracking-wider text-[11px]">{c.code}</span>
                              <div className="flex gap-1">
                                <button onClick={() => copy(c.code)} className="p-1 rounded hover:bg-gray-100 text-gray-400"><Copy size={11} /></button>
                                {!c.sentAt && !c.claimedAt && (
                                  <button onClick={() => setSendModal({ gift: g, coupon: c })} className="p-1 rounded hover:bg-blue-50 text-blue-400"><Send size={11} /></button>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-gray-400 flex-wrap">
                              {c.value && <span className="text-gold font-medium">GH₵ {c.value}</span>}
                              {c.claimedAt
                                ? <span className="text-green-600 font-medium">✓ Claimed by {c.claimedBy}</span>
                                : c.sentAt
                                  ? <span className="text-blue-500">Sent to {c.sentTo}</span>
                                  : <span>Not sent</span>
                              }
                            </div>
                            {c.note && <p className="text-gray-400 italic mt-0.5">"{c.note}"</p>}
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-16 text-gray-300">
            <Gift size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-gray-400">No gifts yet — add your first</p>
          </div>
        )}
      </div>

      {/* ── Add/Edit modal ────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b">
              <h2 className="font-serif text-xl text-gray-800">{editing ? 'Edit Gift' : 'Add Gift'}</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-5">

              {/* Gift type selector */}
              <div>
                <label className="label mb-2">Gift Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {GIFT_TYPES.map(t => (
                    <button key={t.value} type="button"
                      onClick={() => setForm(p => ({ ...p, giftType: t.value }))}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                        form.giftType === t.value ? `${t.color} border-current` : 'border-gray-100 text-gray-400 hover:border-gray-200'
                      }`}>
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Gift Name *</label>
                <input value={form.name ?? ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input-field" placeholder="e.g. Kitchen Blender" />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea value={form.description ?? ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} className="input-field resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Price / Value (GH₵)</label>
                  <input type="number" value={form.price ?? ''} onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) || undefined }))} className="input-field" placeholder="0.00" />
                </div>
                <div>
                  <label className="label">Category</label>
                  <input value={form.category ?? ''} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="input-field" placeholder="Kitchen, Bedroom…" />
                </div>
              </div>

              {/* MoMo fields */}
              {(form.giftType === 'momo_mtn' || form.giftType === 'momo_vodafone' || form.giftType === 'momo_airtel') && (
                <div className={`rounded-xl border-2 p-4 space-y-3 ${giftTypeInfo(form.giftType!).color}`}>
                  <p className="text-xs font-semibold uppercase tracking-widest">
                    {form.giftType === 'momo_mtn' ? 'MTN Mobile Money' : form.giftType === 'momo_vodafone' ? 'Vodafone Cash' : 'AirtelTigo Money'} Details
                  </p>
                  <div>
                    <label className="label">Account Name</label>
                    <input value={form.momoName ?? ''} onChange={e => setForm(p => ({ ...p, momoName: e.target.value }))} className="input-field" placeholder="Ekow Mensah" />
                  </div>
                  <div>
                    <label className="label">MoMo Number</label>
                    <input value={form.momoNumber ?? ''} onChange={e => setForm(p => ({ ...p, momoNumber: e.target.value }))} className="input-field" placeholder="024 000 0000" />
                  </div>
                </div>
              )}

              {/* Bank fields */}
              {form.giftType === 'bank' && (
                <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4 space-y-3">
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-widest">Bank Transfer Details</p>
                  <div>
                    <label className="label">Bank Name</label>
                    <select value={form.bankName ?? ''} onChange={e => setForm(p => ({ ...p, bankName: e.target.value }))} className="input-field">
                      <option value="">Select bank…</option>
                      {GHANA_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Account Name</label>
                    <input value={form.momoName ?? ''} onChange={e => setForm(p => ({ ...p, momoName: e.target.value }))} className="input-field" placeholder="Ekow Mensah" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Account Number</label>
                      <input value={form.bankAccount ?? ''} onChange={e => setForm(p => ({ ...p, bankAccount: e.target.value }))} className="input-field" />
                    </div>
                    <div>
                      <label className="label">Branch (optional)</label>
                      <input value={form.bankBranch ?? ''} onChange={e => setForm(p => ({ ...p, bankBranch: e.target.value }))} className="input-field" />
                    </div>
                  </div>
                </div>
              )}

              {/* Token info */}
              {form.giftType === 'token' && (
                <div className="rounded-xl border-2 border-yellow-200 bg-yellow-50 p-4">
                  <p className="text-xs font-semibold text-yellow-700 uppercase tracking-widest mb-1">Gift Token / Coupon</p>
                  <p className="text-xs text-yellow-600">After saving, use the 🎫 button on the card to generate unique claim codes. You can email them to specific guests.</p>
                </div>
              )}

              <div>
                <label className="label">Image URL (optional)</label>
                <input value={form.imageUrl ?? ''} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} className="input-field" placeholder="https://…" />
              </div>
              <div>
                <label className="label">Priority (higher = shown first)</label>
                <input type="number" value={form.priority ?? 0} onChange={e => setForm(p => ({ ...p, priority: Number(e.target.value) }))} className="input-field" />
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={save} className="btn-primary flex-1">{editing ? 'Update' : 'Add Gift'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Generate tokens modal ──────────────────────── */}
      {genModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Ticket size={16} className="text-yellow-600" /> Generate Gift Tokens</h2>
              <button onClick={() => setGenModal(null)} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500">For: <strong>{genModal.name}</strong></p>
              <div>
                <label className="label">Number of tokens</label>
                <input type="number" min={1} max={50} value={genCount} onChange={e => setGenCount(Number(e.target.value))} className="input-field" />
              </div>
              <div>
                <label className="label">Value per token (GH₵)</label>
                <input type="number" value={genValue} onChange={e => setGenValue(e.target.value)} className="input-field" placeholder="e.g. 100" />
              </div>
              <div>
                <label className="label">Note (optional)</label>
                <input value={genNote} onChange={e => setGenNote(e.target.value)} className="input-field" placeholder="With love from us 💕" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setGenModal(null)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={generateCoupons} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Ticket size={14} /> Generate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Send coupon modal ─────────────────────────── */}
      {sendModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Send size={16} className="text-blue-500" /> Send Gift Token</h2>
              <button onClick={() => setSendModal(null)} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-purple-50 rounded-xl p-3 text-center">
                <p className="font-mono font-bold text-purple-800 tracking-widest">{sendModal.coupon.code}</p>
                {sendModal.coupon.value && <p className="text-gold font-semibold mt-1">GH₵ {sendModal.coupon.value}</p>}
              </div>
              <div>
                <label className="label">Recipient Name</label>
                <input value={sendName} onChange={e => setSendName(e.target.value)} className="input-field" placeholder="Kofi Mensah" />
              </div>
              <div>
                <label className="label">Recipient Email</label>
                <input type="email" value={sendEmail} onChange={e => setSendEmail(e.target.value)} className="input-field" placeholder="kofi@email.com" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setSendModal(null)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={sendCoupon} disabled={!sendEmail || !sendName} className="btn-primary flex-1 disabled:opacity-50 flex items-center justify-center gap-2">
                  <Send size={14} /> Send via Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Helper component ─────────────────────────────────────── */
function Detail({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-gray-400 w-20 flex-shrink-0">{label}:</span>
      <span className="font-medium text-gray-700 flex-1 truncate">{value}</span>
      <button onClick={onCopy} className="p-1 rounded hover:bg-white text-gray-400 flex-shrink-0"><Copy size={11} /></button>
    </div>
  )
}
