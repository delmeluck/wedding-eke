'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, QrCode, Edit2, X, Download, ChevronDown, Check } from 'lucide-react'
import { useToast } from '@/app/toaster'

/* ── Group combobox ───────────────────────────────────────────────── */
const PRESET_GROUPS = [
  "Bride's Family",
  "Groom's Family",
  'Family',
  'Close Friends',
  'Friends',
  'Colleagues',
  'Church',
  'VIP',
  'Other',
]

function GroupSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [open,        setOpen]        = useState(false)
  const [query,       setQuery]       = useState('')
  const [customMode,  setCustomMode]  = useState(false)
  const [customValue, setCustomValue] = useState('')
  const wrapRef = useRef<HTMLDivElement>(null)

  // When the form is reset / edit is opened, sync state
  useEffect(() => {
    if (!value) { setQuery(''); setCustomMode(false); setCustomValue(''); return }
    if (PRESET_GROUPS.includes(value) && value !== 'Other') {
      setQuery(value)
      setCustomMode(false)
    } else {
      setCustomMode(true)
      setCustomValue(value)
      setQuery('Other')
    }
  }, [value])

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const filtered = PRESET_GROUPS.filter(g =>
    g.toLowerCase().includes(query.toLowerCase())
  )

  function select(option: string) {
    setOpen(false)
    if (option === 'Other') {
      setCustomMode(true)
      setQuery('Other')
      setCustomValue('')
      onChange('')
    } else {
      setCustomMode(false)
      setQuery(option)
      setCustomValue('')
      onChange(option)
    }
  }

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value)
    setOpen(true)
    // If the user types something that doesn't match presets, treat as custom
    const match = PRESET_GROUPS.find(g => g.toLowerCase() === e.target.value.toLowerCase())
    if (match && match !== 'Other') {
      setCustomMode(false)
      onChange(match)
    } else if (e.target.value && !PRESET_GROUPS.some(g => g.toLowerCase().startsWith(e.target.value.toLowerCase()))) {
      setCustomMode(false)
      onChange(e.target.value)
    }
  }

  return (
    <div ref={wrapRef} className="space-y-2">
      {/* Combobox trigger */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          onFocus={() => setOpen(true)}
          placeholder="Search or choose group…"
          className="input-field pr-8"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <ChevronDown size={15} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {open && (
          <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-xs text-gray-400">No matches — select "Other" to type freely</li>
            )}
            {filtered.map(opt => (
              <li
                key={opt}
                onMouseDown={() => select(opt)}
                className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-purple-50 hover:text-purple-800 rounded-lg mx-1
                  ${opt === 'Other' ? 'border-t border-gray-100 mt-1 pt-2 text-purple-600 font-medium' : ''}
                  ${(value === opt || (opt === 'Other' && customMode)) ? 'bg-purple-50 text-purple-800 font-medium' : 'text-gray-700'}
                `}
              >
                <Check
                  size={13}
                  className={`flex-shrink-0 ${(value === opt || (opt === 'Other' && customMode)) ? 'opacity-100 text-purple-600' : 'opacity-0'}`}
                />
                {opt}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Free-text field shown when "Other" is selected */}
      {customMode && (
        <input
          type="text"
          value={customValue}
          onChange={e => { setCustomValue(e.target.value); onChange(e.target.value) }}
          placeholder="Type your custom group…"
          className="input-field"
          autoFocus
        />
      )}
    </div>
  )
}

const schema = z.object({
  name:        z.string().min(1, 'Name is required'),
  email:       z.string().email().optional().or(z.literal('')),
  phone:       z.string().optional(),
  plusOne:     z.boolean().optional(),
  plusOneName: z.string().optional(),
  tableNumber: z.string().optional(),
  group:       z.string().optional(),
  notes:       z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Invitee {
  id: string
  name: string
  email?: string
  phone?: string
  plusOne: boolean
  tableNumber?: string
  group?: string
  qrCode: string
  rsvp?: { attending: boolean; plusOne: boolean }
}

export default function InviteesPage() {
  const [invitees, setInvitees]   = useState<Invitee[]>([])
  const [showForm, setShowForm]   = useState(false)
  const [editing, setEditing]     = useState<Invitee | null>(null)
  const [qrModal, setQrModal]     = useState<{ name: string; dataUrl: string; url: string } | null>(null)
  const [search, setSearch]       = useState('')
  const { toast } = useToast()

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })
  const groupValue = watch('group') ?? ''

  const load = useCallback(async () => {
    const res = await fetch('/api/invitees')
    if (res.ok) setInvitees(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  function openAdd() { reset({}); setEditing(null); setShowForm(true) }

  function openEdit(inv: Invitee) {
    setEditing(inv)
    setValue('name', inv.name)
    setValue('email', inv.email ?? '')
    setValue('phone', inv.phone ?? '')
    setValue('plusOne', inv.plusOne)
    setValue('tableNumber', inv.tableNumber ?? '')
    setValue('group', inv.group ?? '')
    setShowForm(true)
  }

  const onSubmit = async (data: FormData) => {
    const url    = editing ? `/api/invitees/${editing.id}` : '/api/invitees'
    const method = editing ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, email: data.email || undefined }),
    })
    if (res.ok) {
      toast({ title: editing ? 'Invitee updated' : 'Invitee added', type: 'success' })
      setShowForm(false)
      load()
    } else {
      toast({ title: 'Failed to save', type: 'error' })
    }
  }

  async function deleteInvitee(id: string) {
    if (!confirm('Delete this invitee?')) return
    const res = await fetch(`/api/invitees/${id}`, { method: 'DELETE' })
    if (res.ok) { load(); toast({ title: 'Deleted', type: 'success' }) }
  }

  async function showQR(inv: Invitee) {
    const res = await fetch(`/api/invitees/${inv.id}/qr`)
    if (res.ok) {
      const { qrCode, url } = await res.json()
      setQrModal({ name: inv.name, dataUrl: qrCode, url })
    }
  }

  const filtered = invitees.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.email?.toLowerCase().includes(search.toLowerCase()) ||
    i.group?.toLowerCase().includes(search.toLowerCase())
  )

  const rsvpBadge = (inv: Invitee) => {
    if (!inv.rsvp) return <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700">Pending</span>
    return inv.rsvp.attending
      ? <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">Attending</span>
      : <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-600">Declining</span>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-gray-800">Invitees</h1>
          <p className="text-gray-500 text-sm mt-1">{invitees.length} total invitees</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Invitee
        </button>
      </div>

      {/* Search */}
      <div className="admin-card mb-6">
        <input
          type="text"
          placeholder="Search by name, email or group…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field"
        />
      </div>

      {/* Table */}
      <div className="admin-card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Name', 'Email', 'Group / Table', 'Plus One', 'RSVP', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(inv => (
              <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3 font-medium text-gray-800">{inv.name}</td>
                <td className="px-4 py-3 text-gray-500">{inv.email ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500">
                  {[inv.group, inv.tableNumber].filter(Boolean).join(' · ') || '—'}
                </td>
                <td className="px-4 py-3 text-gray-500">{inv.plusOne ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3">{rsvpBadge(inv)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => showQR(inv)} className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-600" title="Show QR">
                      <QrCode size={15} />
                    </button>
                    <button onClick={() => openEdit(inv)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600" title="Edit">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => deleteInvitee(inv.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No invitees found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-serif text-xl text-gray-800">{editing ? 'Edit Invitee' : 'Add Invitee'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="label">Full Name *</label>
                <input {...register('name')} className="input-field" placeholder="Kofi Mensah" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Email</label>
                  <input {...register('email')} type="email" className="input-field" placeholder="kofi@email.com" />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input {...register('phone')} className="input-field" placeholder="+233 …" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Group</label>
                  <GroupSelect
                    value={groupValue}
                    onChange={v => setValue('group', v, { shouldValidate: true })}
                  />
                </div>
                <div>
                  <label className="label">Table Number</label>
                  <input {...register('tableNumber')} className="input-field" placeholder="1" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" {...register('plusOne')} id="plusOne" className="w-4 h-4 accent-purple-700" />
                <label htmlFor="plusOne" className="text-sm text-gray-700 cursor-pointer">Allow plus one</label>
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea {...register('notes')} rows={2} className="input-field resize-none" placeholder="VIP, dietary needs…" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
                  {isSubmitting ? 'Saving…' : editing ? 'Update' : 'Add Invitee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR modal */}
      {qrModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-xs w-full text-center">
            <h3 className="font-serif text-xl text-purple-900 mb-1">{qrModal.name}</h3>
            <p className="text-xs text-gray-400 mb-4">Personal RSVP QR Code</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrModal.dataUrl} alt="QR Code" className="w-48 h-48 mx-auto rounded-xl border-2 border-lavender-200 mb-4" />
            <p className="text-xs text-gray-400 mb-4 break-all">{qrModal.url}</p>
            <div className="flex gap-2">
              <a
                href={qrModal.dataUrl}
                download={`${qrModal.name.replace(/\s+/g, '-')}-qr.png`}
                className="btn-primary flex-1 flex items-center justify-center gap-2 !text-sm"
              >
                <Download size={14} /> Download
              </a>
              <button onClick={() => setQrModal(null)} className="btn-secondary flex-1 !text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
