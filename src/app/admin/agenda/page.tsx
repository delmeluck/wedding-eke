'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Edit2, X } from 'lucide-react'
import { useToast } from '@/app/toaster'

interface AgendaItem {
  id: string
  title: string
  description?: string
  time: string
  eventDate: string
  sortOrder: number
  icon?: string
}

const empty = (): Partial<AgendaItem> => ({
  title: '', description: '', time: '', eventDate: '19/12/26', sortOrder: 0, icon: '',
})

export default function AgendaPage() {
  const [items, setItems]       = useState<AgendaItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState<Partial<AgendaItem>>(empty())
  const [editing, setEditing]   = useState<string | null>(null)
  const { toast } = useToast()

  const load = useCallback(async () => {
    const res = await fetch('/api/agenda')
    if (res.ok) setItems(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  function openEdit(item: AgendaItem) { setForm({ ...item }); setEditing(item.id); setShowForm(true) }
  function openAdd() { setForm(empty()); setEditing(null); setShowForm(true) }

  async function save() {
    const url    = editing ? `/api/agenda/${editing}` : '/api/agenda'
    const method = editing ? 'PATCH' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, sortOrder: Number(form.sortOrder) }) })
    if (res.ok) { toast({ title: 'Saved', type: 'success' }); setShowForm(false); load() }
    else toast({ title: 'Failed', type: 'error' })
  }

  async function del(id: string) {
    if (!confirm('Delete this agenda item?')) return
    await fetch(`/api/agenda/${id}`, { method: 'DELETE' })
    load()
  }

  const f = (k: keyof AgendaItem) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }))

  const engItems  = items.filter(i => i.eventDate === '17/12/26')
  const weddItems = items.filter(i => i.eventDate === '19/12/26')
  const other     = items.filter(i => i.eventDate !== '17/12/26' && i.eventDate !== '19/12/26')

  const Section = ({ label, list }: { label: string; list: AgendaItem[] }) => (
    <section className="mb-6">
      <h2 className="font-semibold text-gray-700 mb-3">{label}</h2>
      <div className="space-y-2">
        {list.map(item => (
          <div key={item.id} className="admin-card flex items-center gap-4">
            <div className="text-2xl w-8 text-center">{item.icon || '📌'}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-gold text-sm font-medium">{item.time}</span>
                <span className="font-medium text-gray-800">{item.title}</span>
              </div>
              {item.description && <p className="text-gray-500 text-sm">{item.description}</p>}
            </div>
            <div className="flex gap-1">
              <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Edit2 size={14} /></button>
              <button onClick={() => del(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="text-gray-400 text-sm py-2 pl-2">No items yet</p>}
      </div>
    </section>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl text-gray-800">Agenda</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Item</button>
      </div>

      <Section label="💍 Engagement — 17 December 2026" list={engItems} />
      <Section label="💒 Wedding — 19 December 2026" list={weddItems} />
      {other.length > 0 && <Section label="Other" list={other} />}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-serif text-xl">{editing ? 'Edit Item' : 'Add Agenda Item'}</h2>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">Title *</label>
                <input value={form.title ?? ''} onChange={f('title')} className="input-field" placeholder="Wedding ceremony begins" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Date</label>
                  <select value={form.eventDate ?? '19/12/26'} onChange={f('eventDate')} className="input-field">
                    <option value="17/12/26">17 Dec (Engagement)</option>
                    <option value="19/12/26">19 Dec (Wedding)</option>
                  </select>
                </div>
                <div>
                  <label className="label">Time *</label>
                  <input value={form.time ?? ''} onChange={f('time')} className="input-field" placeholder="10:00 AM" />
                </div>
                <div>
                  <label className="label">Order</label>
                  <input type="number" value={form.sortOrder ?? 0} onChange={f('sortOrder')} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Icon (emoji)</label>
                  <input value={form.icon ?? ''} onChange={f('icon')} className="input-field" placeholder="💍 🎉 🎶" />
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea value={form.description ?? ''} onChange={f('description')} rows={2} className="input-field resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={save} className="btn-primary flex-1">{editing ? 'Update' : 'Add Item'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
