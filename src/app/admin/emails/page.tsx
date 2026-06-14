'use client'

import { useState, useEffect, useCallback } from 'react'
import { Send, Mail, CheckSquare, Square } from 'lucide-react'
import { useToast } from '@/app/toaster'

interface Invitee {
  id: string
  name: string
  email?: string
  group?: string
}

interface EmailLog {
  id: string
  subject: string
  recipients: string
  status: string
  sentAt: string
}

export default function EmailsPage() {
  const [invitees, setInvitees]   = useState<Invitee[]>([])
  const [logs, setLogs]           = useState<EmailLog[]>([])
  const [selected, setSelected]   = useState<Set<string>>(new Set())
  const [subject, setSubject]     = useState('')
  const [message, setMessage]     = useState('')
  const [includeQR, setIncludeQR] = useState(true)
  const [sending, setSending]     = useState(false)
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    const [invRes, logRes] = await Promise.all([
      fetch('/api/invitees'),
      fetch('/api/emails'),
    ])
    if (invRes.ok) {
      const data: Invitee[] = await invRes.json()
      setInvitees(data.filter(i => i.email))
    }
    if (logRes.ok) setLogs(await logRes.json())
  }, [])

  useEffect(() => { loadData() }, [loadData])

  function toggleAll() {
    if (selected.size === invitees.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(invitees.map(i => i.id)))
    }
  }

  function toggle(id: string) {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  async function send() {
    if (!subject.trim() || !message.trim() || selected.size === 0) {
      toast({ title: 'Fill in subject, message and select at least one invitee', type: 'error' })
      return
    }
    setSending(true)
    const res = await fetch('/api/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, message, inviteeIds: Array.from(selected), includeQR }),
    })
    setSending(false)
    if (res.ok) {
      const { sent, failed } = await res.json()
      toast({ title: `Sent: ${sent}, Failed: ${failed}`, type: sent > 0 ? 'success' : 'error' })
      setSubject('')
      setMessage('')
      setSelected(new Set())
      loadData()
    } else {
      toast({ title: 'Failed to send emails', type: 'error' })
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-gray-800">Emails</h1>
        <p className="text-gray-500 text-sm mt-1">Send messages and invitations to your guests</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Compose */}
        <div className="admin-card">
          <h2 className="font-semibold text-gray-700 mb-4">Compose Email</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Subject</label>
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="input-field"
                placeholder="You're invited to our wedding!"
              />
            </div>
            <div>
              <label className="label">Message</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={6}
                className="input-field resize-none"
                placeholder="Dear [Name], we would love to have you join us…"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="includeQR"
                checked={includeQR}
                onChange={e => setIncludeQR(e.target.checked)}
                className="w-4 h-4 accent-purple-700"
              />
              <label htmlFor="includeQR" className="text-sm text-gray-700 cursor-pointer">
                Include personalised QR code &amp; wedding template
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{selected.size} recipient{selected.size !== 1 ? 's' : ''} selected</span>
              <button onClick={send} disabled={sending || selected.size === 0} className="btn-primary flex items-center gap-2">
                <Send size={15} />
                {sending ? 'Sending…' : 'Send Email'}
              </button>
            </div>
          </div>
        </div>

        {/* Recipient selector */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">Recipients ({invitees.length} with email)</h2>
            <button onClick={toggleAll} className="text-sm text-purple-700 hover:underline flex items-center gap-1">
              {selected.size === invitees.length
                ? <><Square size={14} /> Deselect all</>
                : <><CheckSquare size={14} /> Select all</>}
            </button>
          </div>
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {invitees.map(inv => (
              <label key={inv.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.has(inv.id)}
                  onChange={() => toggle(inv.id)}
                  className="w-4 h-4 accent-purple-700"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{inv.name}</p>
                  <p className="text-xs text-gray-400 truncate">{inv.email}</p>
                </div>
                {inv.group && <span className="text-xs text-gray-400">{inv.group}</span>}
              </label>
            ))}
            {invitees.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">No invitees with email addresses</p>
            )}
          </div>
        </div>
      </div>

      {/* Email log */}
      <div className="admin-card">
        <h2 className="font-semibold text-gray-700 mb-4">Email History</h2>
        {logs.length === 0 ? (
          <p className="text-gray-400 text-sm">No emails sent yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Subject', 'Recipients', 'Status', 'Sent At'].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-gray-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map(log => {
                  const recipients = JSON.parse(log.recipients) as string[]
                  return (
                    <tr key={log.id} className="border-b border-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{log.subject}</td>
                      <td className="px-4 py-3 text-gray-500">{recipients.length} recipients</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${log.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{new Date(log.sentAt).toLocaleString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
