'use client'

import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, XCircle, Clock, Users } from 'lucide-react'

interface Invitee {
  id: string
  name: string
  email?: string
  group?: string
  tableNumber?: string
  rsvp?: {
    attending: boolean
    plusOne: boolean
    dietaryReq?: string
    message?: string
    updatedAt: string
  }
}

export default function ReservationsPage() {
  const [invitees, setInvitees] = useState<Invitee[]>([])
  const [filter, setFilter]     = useState<'all' | 'yes' | 'no' | 'pending'>('all')

  const load = useCallback(async () => {
    const res = await fetch('/api/invitees')
    if (res.ok) setInvitees(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = invitees.filter(i => {
    if (filter === 'yes')     return i.rsvp?.attending === true
    if (filter === 'no')      return i.rsvp?.attending === false
    if (filter === 'pending') return !i.rsvp
    return true
  })

  const counts = {
    all:     invitees.length,
    yes:     invitees.filter(i => i.rsvp?.attending === true).length,
    no:      invitees.filter(i => i.rsvp?.attending === false).length,
    pending: invitees.filter(i => !i.rsvp).length,
  }

  const plusOnes = invitees.filter(i => i.rsvp?.attending && i.rsvp.plusOne).length
  const totalAttending = counts.yes + plusOnes

  const tabs = [
    { key: 'all',     label: `All (${counts.all})` },
    { key: 'yes',     label: `Attending (${counts.yes})` },
    { key: 'no',      label: `Declining (${counts.no})` },
    { key: 'pending', label: `Pending (${counts.pending})` },
  ] as const

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-gray-800">Reservations</h1>
        <p className="text-gray-500 text-sm mt-1">
          Total attending (incl. plus-ones): <strong>{totalAttending}</strong>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Attending',    value: counts.yes,     icon: CheckCircle, color: 'text-green-600 bg-green-50' },
          { label: 'Declining',    value: counts.no,      icon: XCircle,     color: 'text-red-500   bg-red-50' },
          { label: 'Pending',      value: counts.pending, icon: Clock,       color: 'text-amber-600 bg-amber-50' },
          { label: 'Plus-Ones',    value: plusOnes,       icon: Users,       color: 'text-blue-600  bg-blue-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`admin-card flex items-center gap-3 ${color}`}>
            <Icon size={24} />
            <div>
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-xs opacity-80">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key as typeof filter)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === t.key
                ? 'bg-purple-800 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="admin-card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Name', 'Email', 'Group / Table', 'Status', 'Plus One', 'Dietary', 'Message', 'Responded'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(inv => (
              <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3 font-medium text-gray-800">{inv.name}</td>
                <td className="px-4 py-3 text-gray-500 max-w-[140px] truncate">{inv.email ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500">
                  {[inv.group, inv.tableNumber].filter(Boolean).join(' · ') || '—'}
                </td>
                <td className="px-4 py-3">
                  {!inv.rsvp
                    ? <span className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-700">Pending</span>
                    : inv.rsvp.attending
                      ? <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">Attending</span>
                      : <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-600">Declining</span>}
                </td>
                <td className="px-4 py-3 text-gray-500">{inv.rsvp?.plusOne ? 'Yes' : '—'}</td>
                <td className="px-4 py-3 text-gray-500 max-w-[120px] truncate">{inv.rsvp?.dietaryReq ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">{inv.rsvp?.message ?? '—'}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {inv.rsvp ? new Date(inv.rsvp.updatedAt).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">No records</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
