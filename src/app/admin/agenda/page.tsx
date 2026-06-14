'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Edit2, X, Clock, CalendarDays, Sparkles, GripVertical } from 'lucide-react'
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

const EMOJI_PRESETS = ['💍','💒','🎶','🎉','🥂','💐','📸','🙏','✝️','💃','🕺','🍽️','🎂','🚗','👑','🌹','🕊️','🎊']

const empty = (): Partial<AgendaItem> => ({
  title: '', description: '', time: '', eventDate: '19/12/26', sortOrder: 0, icon: '📌',
})

const EVENT_CONFIG = {
  '17/12/26': {
    label:    'Engagement Ceremony',
    date:     '17 December 2026',
    emoji:    '💍',
    gradient: 'from-rose-50 to-pink-50',
    border:   'border-rose-200',
    badge:    'bg-rose-100 text-rose-700 border-rose-200',
    timeline: 'bg-rose-300',
    dot:      'bg-rose-500 ring-rose-200',
    btnAdd:   'bg-rose-600 hover:bg-rose-700',
    tag:      'bg-rose-50 text-rose-600 border-rose-100',
    timeColor:'text-rose-600',
  },
  '19/12/26': {
    label:    'Wedding Ceremony',
    date:     '19 December 2026',
    emoji:    '💒',
    gradient: 'from-purple-50 to-lavender-50',
    border:   'border-purple-200',
    badge:    'bg-purple-100 text-purple-700 border-purple-200',
    timeline: 'bg-purple-400',
    dot:      'bg-purple-600 ring-purple-200',
    btnAdd:   'bg-purple-700 hover:bg-purple-800',
    tag:      'bg-purple-50 text-purple-700 border-purple-100',
    timeColor:'text-purple-700',
  },
} as const

type EventKey = keyof typeof EVENT_CONFIG

export default function AgendaPage() {
  const [items,    setItems]    = useState<AgendaItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form,     setForm]     = useState<Partial<AgendaItem>>(empty())
  const [editing,  setEditing]  = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const { toast } = useToast()

  const load = useCallback(async () => {
    const res = await fetch('/api/agenda')
    if (res.ok) setItems(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  function openEdit(item: AgendaItem) {
    setForm({ ...item })
    setEditing(item.id)
    setShowForm(true)
  }
  function openAdd(date?: string) {
    setForm({ ...empty(), eventDate: date ?? '19/12/26' })
    setEditing(null)
    setShowForm(true)
  }

  async function save() {
    if (!form.title?.trim() || !form.time?.trim()) {
      toast({ title: 'Title and time are required', type: 'error' }); return
    }
    const url    = editing ? `/api/agenda/${editing}` : '/api/agenda'
    const method = editing ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, sortOrder: Number(form.sortOrder ?? 0) }),
    })
    if (res.ok) { toast({ title: editing ? 'Item updated' : 'Item added', type: 'success' }); setShowForm(false); load() }
    else toast({ title: 'Failed to save', type: 'error' })
  }

  async function del(id: string) {
    setDeleting(id)
    await fetch(`/api/agenda/${id}`, { method: 'DELETE' })
    setDeleting(null)
    toast({ title: 'Deleted', type: 'success' })
    load()
  }

  const f = (k: keyof AgendaItem) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }))

  const byDate = (date: string) =>
    items.filter(i => i.eventDate === date).sort((a, b) => a.sortOrder - b.sortOrder)

  const total = items.length
  const engCount  = byDate('17/12/26').length
  const weddCount = byDate('19/12/26').length

  return (
    <div className="min-h-screen">

      {/* ── Page header ──────────────────────────── */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-gray-800">Agenda</h1>
          <p className="text-gray-400 text-sm mt-1">Plan and manage the wedding day programme</p>
        </div>
        <button
          onClick={() => openAdd()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-sm font-medium rounded-xl shadow-sm shadow-purple-200 transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          <Plus size={16} /> Add Item
        </button>
      </div>

      {/* ── Stat pills ───────────────────────────── */}
      <div className="flex gap-3 mb-8 flex-wrap">
        {[
          { label: 'Total Items',       value: total,     color: 'bg-gray-100 text-gray-700' },
          { label: 'Engagement Items',  value: engCount,  color: 'bg-rose-100 text-rose-700' },
          { label: 'Wedding Items',     value: weddCount, color: 'bg-purple-100 text-purple-700' },
        ].map(s => (
          <div key={s.label} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${s.color}`}>
            <span className="text-lg font-bold">{s.value}</span>
            <span className="opacity-70">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Two-column event layout ──────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {(['17/12/26', '19/12/26'] as EventKey[]).map(date => {
          const cfg  = EVENT_CONFIG[date]
          const list = byDate(date)
          return (
            <div key={date} className={`rounded-2xl border ${cfg.border} bg-gradient-to-br ${cfg.gradient} overflow-hidden`}>

              {/* Event header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/60">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${cfg.badge} border`}>
                    {cfg.emoji}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{cfg.label}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <CalendarDays size={11} /> {cfg.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${cfg.tag}`}>
                    {list.length} item{list.length !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => openAdd(date)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${cfg.btnAdd} transition-colors shadow-sm`}
                    title="Add item"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>

              {/* Timeline items */}
              <div className="p-4 space-y-0">
                {list.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-white/70 flex items-center justify-center text-2xl mb-3 shadow-sm">
                      {cfg.emoji}
                    </div>
                    <p className="text-sm font-medium text-gray-500">No programme items yet</p>
                    <p className="text-xs text-gray-400 mt-1">Click + to add the first item</p>
                  </div>
                ) : (
                  list.map((item, idx) => (
                    <div key={item.id} className="relative flex gap-3 group">

                      {/* Timeline spine */}
                      <div className="flex flex-col items-center pt-1">
                        <div className={`w-3 h-3 rounded-full ring-4 ${cfg.dot} ring-white z-10 flex-shrink-0 mt-1`} />
                        {idx < list.length - 1 && (
                          <div className={`w-0.5 flex-1 min-h-[2rem] mt-1 ${cfg.timeline} opacity-30`} />
                        )}
                      </div>

                      {/* Card */}
                      <div className="flex-1 mb-3">
                        <div className="bg-white rounded-xl border border-white shadow-sm hover:shadow-md transition-all duration-200 group-hover:-translate-y-0.5 overflow-hidden">
                          <div className="flex items-start gap-3 p-3.5">

                            {/* Drag handle hint */}
                            <div className="text-gray-200 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                              <GripVertical size={14} />
                            </div>

                            {/* Icon */}
                            <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-lg flex-shrink-0">
                              {item.icon || '📌'}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.tag}`}>
                                  <Clock size={10} /> {item.time}
                                </span>
                              </div>
                              <p className="font-semibold text-gray-800 text-sm mt-1 leading-snug">{item.title}</p>
                              {item.description && (
                                <p className="text-gray-400 text-xs mt-0.5 leading-relaxed line-clamp-2">{item.description}</p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                              <button
                                onClick={() => openEdit(item)}
                                className="w-7 h-7 rounded-lg hover:bg-blue-50 text-blue-400 hover:text-blue-600 flex items-center justify-center transition-colors"
                                title="Edit"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => del(item.id)}
                                disabled={deleting === item.id}
                                className="w-7 h-7 rounded-lg hover:bg-red-50 text-red-300 hover:text-red-500 flex items-center justify-center transition-colors disabled:opacity-50"
                                title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>

                          </div>

                          {/* Order badge */}
                          <div className="px-3.5 pb-2.5 flex items-center justify-between">
                            <span className="text-[10px] text-gray-300">#{item.sortOrder} · {cfg.label}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Add / Edit Modal ──────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Sparkles size={16} className="text-purple-600" />
                </div>
                <div>
                  <h2 className="font-serif text-lg text-gray-800">
                    {editing ? 'Edit Programme Item' : 'Add Programme Item'}
                  </h2>
                  <p className="text-xs text-gray-400">{editing ? 'Update the details below' : 'Fill in the details for this moment'}</p>
                </div>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">

              {/* Event date — card toggle */}
              <div>
                <label className="label mb-2">Event Day</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['17/12/26', '19/12/26'] as EventKey[]).map(date => {
                    const cfg = EVENT_CONFIG[date]
                    const active = form.eventDate === date
                    return (
                      <button
                        key={date}
                        type="button"
                        onClick={() => setForm(p => ({ ...p, eventDate: date }))}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                          active
                            ? `${cfg.badge} border-current`
                            : 'border-gray-100 hover:border-gray-200 text-gray-500 bg-gray-50'
                        }`}
                      >
                        <span className="text-xl">{cfg.emoji}</span>
                        <div>
                          <p className="text-xs font-semibold leading-tight">{cfg.label}</p>
                          <p className="text-[10px] opacity-70 mt-0.5">{cfg.date}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="label">Title <span className="text-red-400">*</span></label>
                <input
                  value={form.title ?? ''}
                  onChange={f('title')}
                  className="input-field"
                  placeholder="e.g. Exchange of Vows"
                  autoFocus
                />
              </div>

              {/* Time + Order */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Time <span className="text-red-400">*</span></label>
                  <input
                    value={form.time ?? ''}
                    onChange={f('time')}
                    className="input-field"
                    placeholder="10:30 AM"
                  />
                </div>
                <div>
                  <label className="label">Display Order</label>
                  <input
                    type="number"
                    min={0}
                    value={form.sortOrder ?? 0}
                    onChange={f('sortOrder')}
                    className="input-field"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Icon picker */}
              <div>
                <label className="label">Icon</label>
                <div className="grid grid-cols-9 gap-1.5 p-3 bg-gray-50 rounded-xl border border-gray-100 mb-2">
                  {EMOJI_PRESETS.map(e => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, icon: e }))}
                      className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all hover:scale-110 ${
                        form.icon === e
                          ? 'bg-purple-100 ring-2 ring-purple-400 scale-110'
                          : 'hover:bg-white'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
                <input
                  value={form.icon ?? ''}
                  onChange={f('icon')}
                  className="input-field"
                  placeholder="Or paste any emoji…"
                />
              </div>

              {/* Description */}
              <div>
                <label className="label">Description <span className="text-gray-300 font-normal">(optional)</span></label>
                <textarea
                  value={form.description ?? ''}
                  onChange={f('description')}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Brief note about this moment…"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={save} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Sparkles size={14} />
                  {editing ? 'Update Item' : 'Add to Programme'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
