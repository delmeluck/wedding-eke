'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Edit2, X, MapPin } from 'lucide-react'
import { useToast } from '@/app/toaster'

interface Venue {
  id: string
  name: string
  type: string
  address: string
  city?: string
  mapLink?: string
  description?: string
  eventDate?: string
  eventTime?: string
}

const empty = (): Partial<Venue> => ({ name: '', type: 'ceremony', address: '', city: '', mapLink: '', description: '', eventDate: '', eventTime: '' })

export default function VenuesPage() {
  const [venues, setVenues]     = useState<Venue[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState<Partial<Venue>>(empty())
  const [editing, setEditing]   = useState<string | null>(null)
  const { toast } = useToast()

  const load = useCallback(async () => {
    const res = await fetch('/api/venues')
    if (res.ok) setVenues(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  function openEdit(v: Venue) { setForm({ ...v }); setEditing(v.id); setShowForm(true) }
  function openAdd() { setForm(empty()); setEditing(null); setShowForm(true) }

  async function save() {
    const url    = editing ? `/api/venues/${editing}` : '/api/venues'
    const method = editing ? 'PATCH' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { toast({ title: 'Saved', type: 'success' }); setShowForm(false); load() }
    else toast({ title: 'Failed', type: 'error' })
  }

  async function del(id: string) {
    if (!confirm('Delete venue?')) return
    await fetch(`/api/venues/${id}`, { method: 'DELETE' })
    load()
  }

  const f = (k: keyof Venue) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl text-gray-800">Venues</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Venue</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {venues.map(v => (
          <div key={v.id} className="admin-card">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-xs text-purple-600 uppercase tracking-wider">{v.type}</span>
                <h3 className="font-semibold text-gray-800 mt-0.5">{v.name}</h3>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(v)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Edit2 size={14} /></button>
                <button onClick={() => del(v.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="text-sm text-gray-500 space-y-1">
              <div className="flex items-center gap-1"><MapPin size={13} /> {v.address}{v.city ? `, ${v.city}` : ''}</div>
              {v.eventDate && <div>📅 {v.eventDate}{v.eventTime ? ` · ${v.eventTime}` : ''}</div>}
              {v.description && <p className="text-gray-500 mt-2">{v.description}</p>}
              {v.mapLink && <a href={v.mapLink} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline text-xs">View on map ↗</a>}
            </div>
          </div>
        ))}
        {venues.length === 0 && <div className="col-span-2 text-center py-12 text-gray-400">No venues yet</div>}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-serif text-xl">{editing ? 'Edit Venue' : 'Add Venue'}</h2>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">Venue Name *</label>
                <input value={form.name ?? ''} onChange={f('name')} className="input-field" placeholder="Bethany Methodist Church" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Type</label>
                  <select value={form.type ?? 'ceremony'} onChange={f('type')} className="input-field">
                    <option value="engagement">Engagement</option>
                    <option value="ceremony">Ceremony</option>
                    <option value="reception">Reception</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="label">City</label>
                  <input value={form.city ?? ''} onChange={f('city')} className="input-field" placeholder="Accra" />
                </div>
              </div>
              <div>
                <label className="label">Address *</label>
                <input value={form.address ?? ''} onChange={f('address')} className="input-field" placeholder="Dzorwulu, Accra" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Date (DD/MM/YY)</label>
                  <input value={form.eventDate ?? ''} onChange={f('eventDate')} className="input-field" placeholder="19/12/26" />
                </div>
                <div>
                  <label className="label">Time</label>
                  <input value={form.eventTime ?? ''} onChange={f('eventTime')} className="input-field" placeholder="10:00 AM" />
                </div>
              </div>
              <div>
                <label className="label">Google Maps Link</label>
                <input value={form.mapLink ?? ''} onChange={f('mapLink')} className="input-field" placeholder="https://maps.google.com/…" />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea value={form.description ?? ''} onChange={f('description')} rows={2} className="input-field resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={save} className="btn-primary flex-1">{editing ? 'Update' : 'Add Venue'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
