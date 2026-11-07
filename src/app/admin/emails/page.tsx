'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Send, CheckSquare, Square, Users, Mail, Clock, ChevronDown,
  Eye, EyeOff, Search, Sparkles, RefreshCw, Bell, MessageSquare,
  CheckCircle, XCircle, Loader2,
} from 'lucide-react'
import { useToast } from '@/app/toaster'

interface Invitee {
  id: string
  name: string
  email?: string
  group?: string
  inviteSentAt?: string | null
  reminderSentAt?: string | null
  rsvp?: { attending: boolean } | null
}
interface EmailLog  { id: string; subject: string; recipients: string; status: string; sentAt: string }

const TEMPLATES = [
  {
    id: 'invitation',
    label: '💌 Wedding Invitation',
    subject: "You're Invited — Ekow & Ekua's Wedding",
    message: `We joyfully invite you to share in the celebration of our wedding.

Details enclosed in your personalised QR card — please present it at the venue for check-in.

We can't wait to celebrate with you!`,
  },
  {
    id: 'rsvp-reminder',
    label: '⏰ RSVP Reminder',
    subject: 'Friendly RSVP Reminder — Ekow & Ekua',
    message: `We hope this message finds you well!

We are excited to celebrate with you and just wanted to send a gentle reminder to RSVP before 20 November 2026.

Your QR code is attached — scan it to confirm your attendance or visit our website.

Thank you and we look forward to celebrating with you!`,
  },
  {
    id: 'thank-you',
    label: '🙏 Thank You',
    subject: 'Thank You — From Ekow & Ekua',
    message: `Thank you so much for celebrating our special day with us.

Your presence, love and support meant the world to us. We are truly grateful and blessed to have you in our lives.

With all our love,
Ekow & Ekua`,
  },
  {
    id: 'details',
    label: '📍 Event Details Update',
    subject: 'Important: Wedding Details — Ekow & Ekua',
    message: `Please find updated details for our upcoming celebration below.

📅 Engagement: 17 December 2026 — Kasoa, Central Region
💒 Wedding: 19 December 2026 — Bethany Methodist Church, Dzorwulu, Accra
🎨 Dress Code: Smart Formal / African Formal

Your personal QR code is attached for check-in at the venue.

We look forward to seeing you!`,
  },
  {
    id: 'custom',
    label: '✏️ Custom Message',
    subject: '',
    message: '',
  },
]

const STATUS_COLOR: Record<string, string> = {
  sent:    'bg-green-100 text-green-700',
  failed:  'bg-red-100 text-red-600',
  partial: 'bg-amber-100 text-amber-700',
}

type ActiveTab = 'compose' | 'bulk-invite' | 'history'

export default function EmailsPage() {
  const [invitees,    setInvitees]    = useState<Invitee[]>([])
  const [logs,        setLogs]        = useState<EmailLog[]>([])
  const [selected,    setSelected]    = useState<Set<string>>(new Set())
  const [subject,     setSubject]     = useState('')
  const [message,     setMessage]     = useState('')
  const [includeQR,   setIncludeQR]   = useState(true)
  const [sending,     setSending]     = useState(false)
  const [preview,     setPreview]     = useState(false)
  const [groupFilter, setGroupFilter] = useState('all')
  const [search,      setSearch]      = useState('')
  const [activeTab,   setActiveTab]   = useState<ActiveTab>('compose')
  const [sendResult,  setSendResult]  = useState<{ sent: number; failed: number } | null>(null)
  const [inviteMsg,   setInviteMsg]   = useState('')
  const [bulkResult,  setBulkResult]  = useState<{ sent: number; failed: number } | null>(null)
  const [bulkSending, setBulkSending] = useState(false)
  const [remindLoading, setRemindLoading] = useState(false)
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    const [invRes, logRes] = await Promise.all([fetch('/api/invitees'), fetch('/api/emails')])
    if (invRes.ok) { const d: Invitee[] = await invRes.json(); setInvitees(d.filter(i => i.email)) }
    if (logRes.ok) setLogs(await logRes.json())
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const groups  = ['all', ...Array.from(new Set(invitees.map(i => i.group).filter(Boolean) as string[]))]
  const visible = invitees.filter(i => {
    const matchGroup  = groupFilter === 'all' || i.group === groupFilter
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.email?.toLowerCase().includes(search.toLowerCase())
    return matchGroup && matchSearch
  })

  function applyTemplate(t: typeof TEMPLATES[0]) { setSubject(t.subject); setMessage(t.message) }
  function toggleAll()  { if (selected.size >= visible.length) setSelected(new Set()); else setSelected(new Set(visible.map(i => i.id))) }
  function toggle(id: string) { const n = new Set(selected); n.has(id) ? n.delete(id) : n.add(id); setSelected(n) }

  async function send() {
    if (!subject.trim() || !message.trim() || selected.size === 0) {
      toast({ title: 'Fill in subject, message and select recipients', type: 'error' }); return
    }
    setSending(true); setSendResult(null)
    const res = await fetch('/api/emails', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ subject, message, inviteeIds: Array.from(selected), includeQR }),
    })
    setSending(false)
    if (res.ok) {
      const data = await res.json(); setSendResult(data)
      toast({ title: `✓ Sent ${data.sent}, Failed ${data.failed}`, type: data.sent > 0 ? 'success' : 'error' })
      setSelected(new Set()); loadData()
    } else { toast({ title: 'Failed to send', type: 'error' }) }
  }

  async function sendBulkInvites() {
    const ids = selected.size > 0 ? Array.from(selected) : undefined
    const count = ids?.length ?? invitees.length
    if (!confirm(`Send invitation emails (with RSVP link) to ${count} guest${count !== 1 ? 's' : ''}?`)) return
    setBulkSending(true); setBulkResult(null)
    const res = await fetch('/api/invitees/send-invites', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ inviteeIds: ids, customMessage: inviteMsg || undefined }),
    })
    setBulkSending(false)
    if (res.ok) {
      const data = await res.json(); setBulkResult(data)
      toast({ title: `Sent ${data.sent} invitations${data.failed ? `, ${data.failed} failed` : ''}`, type: data.sent > 0 ? 'success' : 'error' })
      setSelected(new Set()); loadData()
    } else { toast({ title: 'Failed to send invitations', type: 'error' }) }
  }

  async function sendReminders() {
    const pending = invitees.filter(i => i.inviteSentAt && !i.rsvp)
    if (pending.length === 0) { toast({ title: 'No pending guests to remind', type: 'error' }); return }
    if (!confirm(`Send reminder emails to ${pending.length} guests who haven't responded yet?`)) return
    setRemindLoading(true)
    const res = await fetch('/api/invitees/send-reminders', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({}),
    })
    setRemindLoading(false)
    if (res.ok) {
      const data = await res.json()
      toast({ title: `Reminders sent to ${data.sent} guests`, type: 'success' })
      loadData()
    } else { toast({ title: 'Failed to send reminders', type: 'error' }) }
  }

  const selectedRecipients = invitees.filter(i => selected.has(i.id))
  const pendingCount = invitees.filter(i => i.inviteSentAt && !i.rsvp).length
  const invitedCount = invitees.filter(i => i.inviteSentAt).length
  const respondedCount = invitees.filter(i => i.rsvp).length

  const TABS: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'compose',     label: 'Compose',        icon: <Mail size={14} /> },
    { id: 'bulk-invite', label: 'Send Invitations', icon: <MessageSquare size={14} /> },
    { id: 'history',     label: 'History',         icon: <Clock size={14} /> },
  ]

  return (
    <div>
      {/* ── Header ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-3xl text-gray-800">Emails</h1>
          <p className="text-gray-400 text-sm mt-1">
            {invitees.length} guests with email · {invitedCount} invited · {respondedCount} responded · {pendingCount} pending
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === t.id ? 'bg-purple-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Bulk Invite Tab ───────────────────────────── */}
      {activeTab === 'bulk-invite' && (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <div className="xl:col-span-3 space-y-4">

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total with Email', value: invitees.length, color: 'bg-blue-50 text-blue-700 border-blue-100' },
                { label: 'Invites Sent',     value: invitedCount,    color: 'bg-purple-50 text-purple-700 border-purple-100' },
                { label: 'Awaiting Reply',   value: pendingCount,    color: 'bg-amber-50 text-amber-700 border-amber-100' },
              ].map(s => (
                <div key={s.label} className={`rounded-xl border p-4 text-center ${s.color}`}>
                  <p className="text-2xl font-bold font-sans">{s.value}</p>
                  <p className="text-xs mt-0.5 opacity-70">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Send Invites card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
              <div>
                <h2 className="font-semibold text-gray-800">💌 Send Invitation with RSVP Link</h2>
                <p className="text-xs text-gray-400 mt-1">
                  Each guest receives a personalised email with their QR code and two-click RSVP buttons
                  (Accepts / Declines). Their response is recorded automatically.
                </p>
              </div>

              <div>
                <label className="label">Personal Message (optional)</label>
                <textarea
                  value={inviteMsg}
                  onChange={e => setInviteMsg(e.target.value)}
                  rows={3}
                  placeholder="Together with their families, Ekow and Ekua joyfully request the honour of your presence…"
                  className="input-field resize-none text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">Leave blank to use the default message</p>
              </div>

              <div className="flex items-center justify-between gap-4 pt-1">
                <div>
                  {selected.size > 0 ? (
                    <p className="text-sm text-purple-700 font-medium">{selected.size} selected from the list →</p>
                  ) : (
                    <p className="text-sm text-gray-500">No selection = send to <strong>all {invitees.length}</strong> guests with email</p>
                  )}
                  {bulkResult && (
                    <p className={`text-xs mt-0.5 ${bulkResult.failed > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                      Last send: ✓ {bulkResult.sent} sent {bulkResult.failed > 0 ? `· ✗ ${bulkResult.failed} failed` : ''}
                    </p>
                  )}
                </div>
                <button onClick={sendBulkInvites} disabled={bulkSending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-40 text-white text-sm font-medium rounded-xl shadow-sm transition-all hover:-translate-y-0.5">
                  {bulkSending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  {bulkSending ? 'Sending…' : 'Send Invitations'}
                </button>
              </div>
            </div>

            {/* Send Reminders card */}
            <div className={`bg-white rounded-2xl border p-5 ${pendingCount > 0 ? 'border-amber-100' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Bell size={16} className={pendingCount > 0 ? 'text-amber-500' : 'text-gray-300'} />
                    <h2 className="font-semibold text-gray-800">Send Reminder Emails</h2>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {pendingCount > 0
                      ? `${pendingCount} guests received an invite but haven't responded yet.`
                      : 'No pending guests — everyone who was invited has responded!'}
                  </p>
                </div>
                <button onClick={sendReminders} disabled={remindLoading || pendingCount === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-all hover:-translate-y-0.5">
                  {remindLoading ? <Loader2 size={14} className="animate-spin" /> : <Bell size={14} />}
                  {remindLoading ? 'Sending…' : `Remind ${pendingCount}`}
                </button>
              </div>
            </div>

            {/* RSVP Response summary */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-700 mb-3">Response Summary</h2>
              <div className="space-y-2">
                {[
                  { label: 'Attending',    icon: <CheckCircle size={14} className="text-green-500" />, count: invitees.filter(i => i.rsvp?.attending).length,      color: 'text-green-700' },
                  { label: 'Not attending',icon: <XCircle size={14} className="text-red-400" />,     count: invitees.filter(i => i.rsvp && !i.rsvp.attending).length, color: 'text-red-600' },
                  { label: 'No response', icon: <Clock size={14} className="text-amber-400" />,      count: invitees.filter(i => !i.rsvp).length,                   color: 'text-amber-600' },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {row.icon} {row.label}
                    </div>
                    <span className={`text-sm font-semibold ${row.color}`}>{row.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: recipient list */}
          <div className="xl:col-span-2">
            <RecipientList
              invitees={visible}
              selected={selected}
              search={search}
              groupFilter={groupFilter}
              groups={groups}
              onSearch={setSearch}
              onGroupFilter={setGroupFilter}
              onToggle={toggle}
              onToggleAll={toggleAll}
              showStatus
            />
          </div>
        </div>
      )}

      {/* ── Compose Tab ───────────────────────────────── */}
      {activeTab === 'compose' && (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <div className="xl:col-span-3 space-y-4">

            {/* Template picker */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Start with a template</p>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => applyTemplate(t)}
                    className="text-left text-xs px-3 py-2.5 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 text-gray-600 hover:text-purple-700 transition-all">
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Compose card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-700">Compose</h2>
                <button onClick={() => setPreview(v => !v)}
                  className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-800 px-3 py-1.5 rounded-lg border border-purple-100 hover:border-purple-300 transition-colors">
                  {preview ? <EyeOff size={13} /> : <Eye size={13} />}
                  {preview ? 'Edit' : 'Preview Email'}
                </button>
              </div>

              {!preview ? (
                <>
                  <div>
                    <label className="label">Subject Line</label>
                    <input value={subject} onChange={e => setSubject(e.target.value)} className="input-field" placeholder="You're invited to our wedding!" />
                  </div>
                  <div>
                    <label className="label">Message Body</label>
                    <textarea value={message} onChange={e => setMessage(e.target.value)} rows={8} className="input-field resize-none font-sans text-sm leading-relaxed"
                      placeholder="Write your message here… Use [Name] as a placeholder and it will be replaced with each guest's name." />
                    <p className="text-xs text-gray-400 mt-1">{message.length} characters · Tip: use [Name] for personalisation</p>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-lavender-100 bg-gray-50 p-4">
                  <p className="text-xs text-gray-400 mb-3 font-medium">Email preview (first recipient)</p>
                  <div className="bg-white rounded-xl border p-4 text-sm font-sans space-y-2">
                    <p className="font-semibold text-gray-800 border-b pb-2">{subject || '(No subject)'}</p>
                    <p className="text-purple-900 font-serif">Dear <em>{selectedRecipients[0]?.name ?? 'Guest'},</em></p>
                    <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                      {message.replace(/\[Name\]/g, selectedRecipients[0]?.name ?? 'Guest') || '(No message)'}
                    </p>
                    {includeQR && (
                      <div className="bg-purple-50 rounded-lg p-3 text-center text-xs text-purple-500 border border-purple-100">
                        📲 Personalised QR code + wedding template will be included
                      </div>
                    )}
                    <p className="text-gray-400 text-xs pt-2 border-t">— Ekow &amp; Ekua · 19 December 2026 · Accra, Ghana</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-1">
                <input type="checkbox" id="qr" checked={includeQR} onChange={e => setIncludeQR(e.target.checked)} className="w-4 h-4 accent-purple-700" />
                <label htmlFor="qr" className="text-sm text-gray-600 cursor-pointer flex items-center gap-1.5">
                  <Sparkles size={13} className="text-purple-400" />
                  Include personalised QR code &amp; wedding template
                </label>
              </div>
            </div>

            {/* Send button */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">{selected.size} recipient{selected.size !== 1 ? 's' : ''} selected</p>
                {sendResult && (
                  <p className={`text-xs mt-0.5 ${sendResult.failed > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                    Last send: ✓ {sendResult.sent} sent {sendResult.failed > 0 ? `· ✗ ${sendResult.failed} failed` : ''}
                  </p>
                )}
              </div>
              <button onClick={send} disabled={sending || selected.size === 0}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl shadow-sm transition-all hover:-translate-y-0.5 disabled:hover:translate-y-0">
                {sending ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
                {sending ? 'Sending…' : 'Send Email'}
              </button>
            </div>
          </div>

          <div className="xl:col-span-2">
            <RecipientList
              invitees={visible}
              selected={selected}
              search={search}
              groupFilter={groupFilter}
              groups={groups}
              onSearch={setSearch}
              onGroupFilter={setGroupFilter}
              onToggle={toggle}
              onToggleAll={toggleAll}
            />
          </div>
        </div>
      )}

      {/* ── History Tab ───────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-700">Email History</h2>
            <span className="text-xs text-gray-400">{logs.length} campaigns</span>
          </div>
          {logs.length === 0 ? (
            <div className="py-16 text-center">
              <Mail size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400">No emails sent yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {logs.map(log => {
                const recipients = (() => { try { return JSON.parse(log.recipients) as string[] } catch { return [] } })()
                const isPartial  = log.status.includes('/')
                const statusKey  = isPartial ? 'partial' : log.status
                return (
                  <div key={log.id} className="px-5 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Mail size={15} className="text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{log.subject}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{recipients.length} recipient{recipients.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[statusKey] ?? 'bg-gray-100 text-gray-500'}`}>
                        {log.status}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(log.sentAt).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Recipient list sub-component ─────────────────────── */
function RecipientList({
  invitees, selected, search, groupFilter, groups,
  onSearch, onGroupFilter, onToggle, onToggleAll, showStatus,
}: {
  invitees: Invitee[]
  selected: Set<string>
  search: string
  groupFilter: string
  groups: string[]
  onSearch: (v: string) => void
  onGroupFilter: (v: string) => void
  onToggle: (id: string) => void
  onToggleAll: () => void
  showStatus?: boolean
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 sticky top-6">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <Users size={15} className="text-purple-400" />
          <h2 className="font-semibold text-gray-700 text-sm">{invitees.length} guests</h2>
        </div>
        <button onClick={onToggleAll} className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium">
          {selected.size >= invitees.length ? <><Square size={12} /> None</> : <><CheckSquare size={12} /> All visible</>}
        </button>
      </div>

      <div className="px-4 py-3 border-b border-gray-50 space-y-2">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => onSearch(e.target.value)} placeholder="Search…" className="input-field pl-8 py-1.5 text-sm" />
        </div>
        {groups.length > 1 && (
          <div className="relative">
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select value={groupFilter} onChange={e => onGroupFilter(e.target.value)} className="input-field py-1.5 text-sm appearance-none pr-8">
              {groups.map(g => <option key={g} value={g}>{g === 'all' ? 'All groups' : g}</option>)}
            </select>
          </div>
        )}
        {selected.size > 0 && <p className="text-xs text-purple-600 font-medium">{selected.size} selected</p>}
      </div>

      <div className="max-h-[520px] overflow-y-auto divide-y divide-gray-50">
        {invitees.map(inv => (
          <label key={inv.id} className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${selected.has(inv.id) ? 'bg-purple-50' : 'hover:bg-gray-50'}`}>
            <input type="checkbox" checked={selected.has(inv.id)} onChange={() => onToggle(inv.id)} className="w-4 h-4 accent-purple-700 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{inv.name}</p>
              <p className="text-xs text-gray-400 truncate">{inv.email}</p>
            </div>
            {showStatus ? (
              <div className="flex-shrink-0">
                {inv.rsvp ? (
                  inv.rsvp.attending
                    ? <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">✓ Going</span>
                    : <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">✗ No</span>
                ) : inv.inviteSentAt ? (
                  <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Pending</span>
                ) : (
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">Not sent</span>
                )}
              </div>
            ) : inv.group ? (
              <span className="text-[10px] text-purple-500 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded-full flex-shrink-0">{inv.group}</span>
            ) : null}
          </label>
        ))}
        {invitees.length === 0 && (
          <div className="px-4 py-10 text-center">
            <Mail size={24} className="text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No guests match</p>
          </div>
        )}
      </div>
    </div>
  )
}
