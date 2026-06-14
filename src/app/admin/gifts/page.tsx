'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react'
import { useToast } from '@/app/toaster'

interface Gift {
  id: string
  name: string
  description?: string
  price?: number
  imageUrl?: string
  donationLink?: string
  category?: string
  priority: number
  claimed: boolean
  claimedBy?: string
}

const empty = (): Partial<Gift> => ({
  name: '', description: '', price: undefined, imageUrl: '',
  donationLink: '', category: '', priority: 0, claimed: false,
})

export default function GiftsPage() {
  const [gifts, setGifts]       = useState<Gift[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState<Partial<Gift>>(empty())
  const [editing, setEditing]   = useState<string | null>(null)
  const { toast } = useToast()

  const load = useCallback(async () => {
    const res = await fetch('/api/gifts')
    if (res.ok) setGifts(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  function openAdd() { setForm(empty()); setEditing(null); setShowForm(true) }

  function openEdit(g: Gift) {
    setForm({ ...g })
    setEditing(g.id)
    setShowForm(true)
  }

  async function save() {
    const url    = editing ? `/api/gifts/${editing}` : '/api/gifts'
    const method = editing ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, price: form.price ? Number(form.price) : undefined }),
    })
    if (res.ok) {
      toast({ title: editing ? 'Gift updated' : 'Gift added', type: 'success' })
      setShowForm(false)
      load()
    } else {
      toast({ title: 'Failed to save', type: 'error' })
    }
  }

  async function del(id: string) {
    if (!confirm('Delete this gift?')) return
    const res = await fetch(`/api/gifts/${id}`, { method: 'DELETE' })
    if (res.ok) { load(); toast({ title: 'Deleted', type: 'success' }) }
  }

  async function toggleClaimed(g: Gift) {
    await fetch(`/api/gifts/${g.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claimed: !g.claimed }),
    })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-gray-800">Gifts</h1>
          <p className="text-gray-500 text-sm mt-1">
            {gifts.filter(g => g.claimed).length}/{gifts.length} claimed
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Gift
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {gifts.map(g => (
          <div key={g.id} className={`admin-card ${g.claimed ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                {g.category && <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{g.category}</p>}
                <h3 className="font-medium text-gray-800">{g.name}</h3>
              </div>
              <div className="flex gap-1">
                <button onClick={() => toggleClaimed(g)} title={g.claimed ? 'Mark unclaimed' : 'Mark claimed'}
                  className={`p-1.5 rounded-lg ${g.claimed ? 'bg-green-50 text-green-600' : 'hover:bg-gray-50 text-gray-400'}`}>
                  <Check size={14} />
                </button>
                <button onClick={() => openEdit(g)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => del(g.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            {g.description && <p className="text-gray-500 text-sm mb-2">{g.description}</p>}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gold font-medium">{g.price ? `GH₵ ${g.price.toLocaleString()}` : ''}</span>
              {g.claimed
                ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Claimed</span>
                : g.donationLink
                  ? <a href={g.donationLink} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-600 hover:underline">Donation link ↗</a>
                  : null
              }
            </div>
          </div>
        ))}
        {gifts.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-400">No gifts yet</div>
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-serif text-xl">{editing ? 'Edit Gift' : 'Add Gift'}</h2>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">Name *</label>
                <input value={form.name ?? ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input-field" placeholder="Kitchen mixer" />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea value={form.description ?? ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} className="input-field resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Price (GH₵)</label>
                  <input type="number" value={form.price ?? ''} onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))} className="input-field" />
                </div>
                <div>
                  <label className="label">Category</label>
                  <input value={form.category ?? ''} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="input-field" placeholder="Kitchen, Bedroom…" />
                </div>
              </div>
              <div>
                <label className="label">Donation / Purchase Link</label>
                <input value={form.donationLink ?? ''} onChange={e => setForm(p => ({ ...p, donationLink: e.target.value }))} className="input-field" placeholder="https://…" />
              </div>
              <div>
                <label className="label">Image URL</label>
                <input value={form.imageUrl ?? ''} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} className="input-field" placeholder="https://… or /uploads/…" />
              </div>
              <div>
                <label className="label">Priority (higher = shown first)</label>
                <input type="number" value={form.priority ?? 0} onChange={e => setForm(p => ({ ...p, priority: Number(e.target.value) }))} className="input-field" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={save} className="btn-primary flex-1">
                  {editing ? 'Update' : 'Add Gift'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
