'use client'

import { useState, useEffect, useCallback, useRef, useId } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plus, Trash2, QrCode, Edit2, X, Download, ChevronDown, Check,
  Send, Bell, Upload, FileSpreadsheet, AlertCircle, CheckCircle2,
  Loader2, KeyRound,
} from 'lucide-react'
import { useToast } from '@/app/toaster'

/* ── CSV Template ─────────────────────────────────────────────── */
const CSV_HEADERS  = ['Name', 'Email', 'Phone', 'Group', 'Table', 'PlusOne', 'Notes']
const CSV_EXAMPLE  = [
  ['Kofi Mensah',  'kofi@email.com',  '+233240000001', "Groom's Family", '1', 'yes', 'Uncle of groom'],
  ['Ama Asante',   'ama@email.com',   '+233200000002', "Bride's Family",  '2', 'no',  ''],
  ['Kweku Darko',  '',                '+233270000003', 'Friends',          '3', 'no',  'University friend'],
]

function downloadTemplate() {
  const rows = [CSV_HEADERS, ...CSV_EXAMPLE].map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
  a.download = 'invitees-template.csv'; a.click()
}

interface ParsedRow {
  name: string; email: string; phone: string; group: string
  tableNumber: string; plusOne: boolean; notes: string
  _error?: string
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []

  // Detect header row
  const first = lines[0].toLowerCase()
  const hasHeader = first.includes('name') || first.includes('email')
  const dataLines = hasHeader ? lines.slice(1) : lines

  return dataLines.map(line => {
    // Simple CSV parse (handles quoted fields)
    const cols: string[] = []
    let cur = ''; let inQ = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') { inQ = !inQ }
      else if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = '' }
      else { cur += ch }
    }
    cols.push(cur.trim())

    const [name = '', email = '', phone = '', group = '', table = '', plusOneStr = '', notes = ''] = cols
    const nameTrimmed = name.replace(/^"|"$/g, '').trim()
    return {
      name:        nameTrimmed,
      email:       email.replace(/^"|"$/g, '').trim(),
      phone:       phone.replace(/^"|"$/g, '').trim(),
      group:       group.replace(/^"|"$/g, '').trim(),
      tableNumber: table.replace(/^"|"$/g, '').trim(),
      plusOne:     /^(yes|true|1|y)$/i.test(plusOneStr.trim()),
      notes:       notes.replace(/^"|"$/g, '').trim(),
      _error:      !nameTrimmed ? 'Missing name' : undefined,
    }
  }).filter(r => r.name || r.email) // skip totally blank lines
}

/* ── Bulk Import Modal ────────────────────────────────────────── */
function BulkImportModal({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const [step,       setStep]       = useState<'upload' | 'preview' | 'done'>('upload')
  const [rows,       setRows]       = useState<ParsedRow[]>([])
  const [dragging,   setDragging]   = useState(false)
  const [importing,  setImporting]  = useState(false)
  const [result,     setResult]     = useState<{ created: number; skipped: number; errors: string[] } | null>(null)
  const [fileErr,    setFileErr]    = useState('')
  const fileId = useId()
  const { toast } = useToast()

  function handleFile(file: File) {
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setFileErr('Please upload a .csv file'); return
    }
    setFileErr('')
    const reader = new FileReader()
    reader.onload = e => {
      const text = e.target?.result as string
      const parsed = parseCSV(text)
      if (!parsed.length) { setFileErr('No rows found — check your file format'); return }
      setRows(parsed)
      setStep('preview')
    }
    reader.readAsText(file)
  }

  async function doImport() {
    const valid = rows.filter(r => !r._error && r.name)
    if (!valid.length) { toast({ title: 'No valid rows to import', type: 'error' }); return }
    setImporting(true)
    const res = await fetch('/api/invitees/bulk', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ rows: valid }),
    })
    setImporting(false)
    if (res.ok) {
      const data = await res.json()
      setResult(data)
      setStep('done')
      onImported()
    } else {
      toast({ title: 'Import failed', type: 'error' })
    }
  }

  const valid   = rows.filter(r => !r._error)
  const invalid = rows.filter(r =>  r._error)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
              <FileSpreadsheet size={16} className="text-purple-600" />
            </div>
            <div>
              <h2 className="font-serif text-lg text-gray-800">Bulk Import Invitees</h2>
              <p className="text-xs text-gray-400 mt-0.5">Upload a CSV file to add multiple guests at once</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 border-b text-xs font-medium">
          {[
            { key: 'upload',  label: '① Upload CSV' },
            { key: 'preview', label: '② Preview & Confirm' },
            { key: 'done',    label: '③ Done' },
          ].map((s, i) => (
            <span key={s.key} className="flex items-center gap-2">
              {i > 0 && <span className="text-gray-300">›</span>}
              <span className={step === s.key ? 'text-purple-700' : 'text-gray-400'}>{s.label}</span>
            </span>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ── Step 1: Upload ── */}
          {step === 'upload' && (
            <div className="space-y-5">
              {/* Template download */}
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex items-start gap-3">
                <FileSpreadsheet size={18} className="text-purple-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-purple-800">Start with our template</p>
                  <p className="text-xs text-purple-500 mt-0.5">
                    Columns: <code className="bg-purple-100 px-1 rounded">Name, Email, Phone, Group, Table, PlusOne, Notes</code>
                  </p>
                </div>
                <button onClick={downloadTemplate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-purple-200 text-purple-700 text-xs font-medium rounded-lg hover:bg-purple-50 transition-colors flex-shrink-0">
                  <Download size={13} /> Download Template
                </button>
              </div>

              {/* Dropzone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
                className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer
                  ${dragging ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'}`}
              >
                <Upload size={28} className={`mx-auto mb-3 ${dragging ? 'text-purple-500' : 'text-gray-300'}`} />
                <p className="text-sm font-medium text-gray-600">Drag & drop your CSV file here</p>
                <p className="text-xs text-gray-400 mt-1">or</p>
                <label htmlFor={fileId}
                  className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-purple-700 text-white text-sm font-medium rounded-xl cursor-pointer hover:bg-purple-800 transition-colors">
                  <Upload size={14} /> Browse File
                </label>
                <input
                  id={fileId}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                />
                {fileErr && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-red-500 text-sm">
                    <AlertCircle size={14} /> {fileErr}
                  </div>
                )}
              </div>

              {/* Format guide */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Expected CSV format</p>
                <div className="rounded-xl border border-gray-100 overflow-x-auto">
                  <table className="text-xs w-full">
                    <thead className="bg-gray-50">
                      <tr>{CSV_HEADERS.map(h => <th key={h} className="px-3 py-2 text-left text-gray-500 font-semibold">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {CSV_EXAMPLE.map((row, i) => (
                        <tr key={i} className="border-t border-gray-50">
                          {row.map((c, j) => <td key={j} className="px-3 py-1.5 text-gray-600">{c || <span className="text-gray-300">—</span>}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  ✦ Only <strong>Name</strong> is required. PlusOne: <code>yes</code>/<code>no</code>. Max 500 rows per import.
                </p>
              </div>
            </div>
          )}

          {/* ── Step 2: Preview ── */}
          {step === 'preview' && (
            <div className="space-y-4">
              {/* Summary pills */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-100 rounded-xl text-sm">
                  <CheckCircle2 size={14} className="text-green-600" />
                  <span className="text-green-700 font-medium">{valid.length} valid rows</span>
                </div>
                {invalid.length > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-100 rounded-xl text-sm">
                    <AlertCircle size={14} className="text-red-500" />
                    <span className="text-red-600 font-medium">{invalid.length} rows with errors (will be skipped)</span>
                  </div>
                )}
                <button onClick={() => { setStep('upload'); setRows([]) }}
                  className="text-xs text-gray-400 hover:text-gray-600 underline ml-auto">
                  ← Use different file
                </button>
              </div>

              {/* Preview table */}
              <div className="rounded-xl border border-gray-100 overflow-x-auto max-h-80 overflow-y-auto">
                <table className="text-xs w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-gray-500 font-semibold w-6">#</th>
                      {CSV_HEADERS.map(h => <th key={h} className="px-3 py-2 text-left text-gray-500 font-semibold">{h}</th>)}
                      <th className="px-3 py-2 text-left text-gray-500 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i} className={`border-t border-gray-50 ${row._error ? 'bg-red-50/40' : ''}`}>
                        <td className="px-3 py-1.5 text-gray-400">{i + 1}</td>
                        <td className="px-3 py-1.5 text-gray-800 font-medium">{row.name || <span className="text-red-400 italic">missing</span>}</td>
                        <td className="px-3 py-1.5 text-gray-500">{row.email || '—'}</td>
                        <td className="px-3 py-1.5 text-gray-500">{row.phone || '—'}</td>
                        <td className="px-3 py-1.5 text-gray-500">{row.group || '—'}</td>
                        <td className="px-3 py-1.5 text-gray-500">{row.tableNumber || '—'}</td>
                        <td className="px-3 py-1.5 text-gray-500">{row.plusOne ? 'Yes' : 'No'}</td>
                        <td className="px-3 py-1.5 text-gray-400 max-w-[120px] truncate">{row.notes || '—'}</td>
                        <td className="px-3 py-1.5">
                          {row._error
                            ? <span className="text-red-500 flex items-center gap-1"><AlertCircle size={11} /> {row._error}</span>
                            : <span className="text-green-500 flex items-center gap-1"><CheckCircle2 size={11} /> OK</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Step 3: Done ── */}
          {step === 'done' && result && (
            <div className="text-center py-6">
              <div className="w-20 h-20 rounded-full bg-green-50 border-4 border-green-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={36} className="text-green-500" />
              </div>
              <h3 className="font-serif text-2xl text-gray-800 mb-2">Import Complete!</h3>
              <div className="flex justify-center gap-4 mt-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{result.created}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Guests added</p>
                </div>
                {result.skipped > 0 && (
                  <div className="text-center">
                    <p className="text-3xl font-bold text-amber-500">{result.skipped}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Skipped</p>
                  </div>
                )}
              </div>
              {result.errors.length > 0 && (
                <div className="mt-4 text-left bg-red-50 rounded-xl p-3 max-h-32 overflow-y-auto">
                  {result.errors.map((e, i) => <p key={i} className="text-xs text-red-500">{e}</p>)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t bg-gray-50">
          {step === 'upload' && (
            <button onClick={onClose} className="btn-secondary !text-sm !py-2">Cancel</button>
          )}
          {step === 'preview' && (
            <>
              <button onClick={() => { setStep('upload'); setRows([]) }} className="btn-secondary !text-sm !py-2">
                Back
              </button>
              <button onClick={doImport} disabled={importing || valid.length === 0}
                className="btn-primary !text-sm !py-2 flex items-center gap-2 disabled:opacity-50">
                {importing ? <><Loader2 size={14} className="animate-spin" /> Importing…</> : `Import ${valid.length} Guest${valid.length !== 1 ? 's' : ''}`}
              </button>
            </>
          )}
          {step === 'done' && (
            <button onClick={onClose} className="btn-primary !text-sm !py-2 w-full">
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

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

function GroupSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open,        setOpen]        = useState(false)
  const [query,       setQuery]       = useState('')
  const [customMode,  setCustomMode]  = useState(false)
  const [customValue, setCustomValue] = useState('')
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!value) { setQuery(''); setCustomMode(false); setCustomValue(''); return }
    if (PRESET_GROUPS.includes(value) && value !== 'Other') {
      setQuery(value); setCustomMode(false)
    } else {
      setCustomMode(true); setCustomValue(value); setQuery('Other')
    }
  }, [value])

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const filtered = PRESET_GROUPS.filter(g => g.toLowerCase().includes(query.toLowerCase()))

  function select(option: string) {
    setOpen(false)
    if (option === 'Other') {
      setCustomMode(true); setQuery('Other'); setCustomValue(''); onChange('')
    } else {
      setCustomMode(false); setQuery(option); setCustomValue(''); onChange(option)
    }
  }

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value); setOpen(true)
    const match = PRESET_GROUPS.find(g => g.toLowerCase() === e.target.value.toLowerCase())
    if (match && match !== 'Other') {
      setCustomMode(false); onChange(match)
    } else if (e.target.value && !PRESET_GROUPS.some(g => g.toLowerCase().startsWith(e.target.value.toLowerCase()))) {
      setCustomMode(false); onChange(e.target.value)
    }
  }

  return (
    <div ref={wrapRef} className="space-y-2">
      <div className="relative">
        <input type="text" value={query} onChange={handleQueryChange} onFocus={() => setOpen(true)}
          placeholder="Search or choose group…" className="input-field pr-8" autoComplete="off" />
        <button type="button" onClick={() => setOpen(o => !o)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          <ChevronDown size={15} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-xs text-gray-400">No matches — select "Other" to type freely</li>
            )}
            {filtered.map(opt => (
              <li key={opt} onMouseDown={() => select(opt)}
                className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-purple-50 hover:text-purple-800 rounded-lg mx-1
                  ${opt === 'Other' ? 'border-t border-gray-100 mt-1 pt-2 text-purple-600 font-medium' : ''}
                  ${(value === opt || (opt === 'Other' && customMode)) ? 'bg-purple-50 text-purple-800 font-medium' : 'text-gray-700'}`}>
                <Check size={13} className={`flex-shrink-0 ${(value === opt || (opt === 'Other' && customMode)) ? 'opacity-100 text-purple-600' : 'opacity-0'}`} />
                {opt}
              </li>
            ))}
          </ul>
        )}
      </div>
      {customMode && (
        <input type="text" value={customValue} onChange={e => { setCustomValue(e.target.value); onChange(e.target.value) }}
          placeholder="Type your custom group…" className="input-field" autoFocus />
      )}
    </div>
  )
}

/* ── Form schema ──────────────────────────────────────────────────── */
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
  id: string; name: string; email?: string; phone?: string
  plusOne: boolean; tableNumber?: string; group?: string; qrCode: string
  inviteSentAt?: string | null; reminderSentAt?: string | null
  confirmationSentAt?: string | null
  rsvp?: { attending: boolean; plusOne: boolean } | null
}

export default function InviteesPage() {
  const [invitees,    setInvitees]    = useState<Invitee[]>([])
  const [showForm,    setShowForm]    = useState(false)
  const [showImport,  setShowImport]  = useState(false)
  const [editing,     setEditing]     = useState<Invitee | null>(null)
  const [qrModal,     setQrModal]     = useState<{ name: string; dataUrl: string; url: string } | null>(null)
  const [search,      setSearch]      = useState('')
  const [sending,     setSending]     = useState<string | null>(null)
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

  function openAdd()  { reset({}); setEditing(null); setShowForm(true) }
  function openEdit(inv: Invitee) {
    setEditing(inv)
    setValue('name', inv.name); setValue('email', inv.email ?? '')
    setValue('phone', inv.phone ?? ''); setValue('plusOne', inv.plusOne)
    setValue('tableNumber', inv.tableNumber ?? ''); setValue('group', inv.group ?? '')
    setShowForm(true)
  }

  const onSubmit = async (data: FormData) => {
    const url    = editing ? `/api/invitees/${editing.id}` : '/api/invitees'
    const method = editing ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, email: data.email || undefined }),
    })
    if (res.ok) {
      toast({ title: editing ? 'Invitee updated' : 'Invitee added', type: 'success' })
      setShowForm(false); load()
    } else { toast({ title: 'Failed to save', type: 'error' }) }
  }

  async function deleteInvitee(id: string) {
    if (!confirm('Delete this invitee?')) return
    const res = await fetch(`/api/invitees/${id}`, { method: 'DELETE' })
    if (res.ok) { load(); toast({ title: 'Deleted', type: 'success' }) }
  }

  async function sendAccessCode(inv: Invitee) {
    if (!inv.email) { toast({ title: 'No email for this invitee', type: 'error' }); return }
    setSending(inv.id)
    const res = await fetch(`/api/invitees/${inv.id}/send-code`, { method: 'POST' })
    setSending(null)
    if (res.ok) {
      const d = await res.json()
      toast({ title: `Access code ${d.code} sent to ${inv.name}`, type: 'success' })
    } else {
      const d = await res.json().catch(() => ({}))
      toast({ title: (d as { error?: string }).error ?? 'Failed to send code', type: 'error' })
    }
  }

  async function sendInvite(inv: Invitee) {
    if (!inv.email) { toast({ title: 'No email for this invitee', type: 'error' }); return }
    setSending(inv.id)
    const res = await fetch('/api/invitees/send-invites', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteeIds: [inv.id] }),
    })
    setSending(null)
    if (res.ok) {
      const d = await res.json()
      toast({ title: d.sent > 0 ? `Invitation sent to ${inv.name}` : 'Send failed', type: d.sent > 0 ? 'success' : 'error' })
      load()
    } else { toast({ title: 'Failed to send', type: 'error' }) }
  }

  async function revokeConfirmation(inv: Invitee) {
    if (!confirm(`Revoke the confirmation email for ${inv.name}? They can receive it again next time they RSVP.`)) return
    setSending(inv.id)
    await fetch(`/api/invitees/${inv.id}/revoke-confirmation`, { method: 'DELETE' })
    setSending(null)
    toast({ title: `Confirmation revoked for ${inv.name}`, type: 'success' })
    load()
  }

  async function resendConfirmation(inv: Invitee) {
    if (!inv.email) { toast({ title: 'No email for this invitee', type: 'error' }); return }
    setSending(inv.id)
    const res = await fetch(`/api/invitees/${inv.id}/revoke-confirmation`, { method: 'POST' })
    setSending(null)
    if (res.ok) {
      toast({ title: `Confirmation resent to ${inv.name}`, type: 'success' })
      load()
    } else {
      const d = await res.json().catch(() => ({}))
      toast({ title: (d as { error?: string }).error ?? 'Failed to resend', type: 'error' })
    }
  }

  async function showQR(inv: Invitee) {
    const res = await fetch(`/api/invitees/${inv.id}/qr`)
    if (res.ok) { const { qrCode, url } = await res.json(); setQrModal({ name: inv.name, dataUrl: qrCode, url }) }
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
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-3xl text-gray-800">Invitees</h1>
          <p className="text-gray-500 text-sm mt-1">
            {invitees.length} total · {invitees.filter(i => i.inviteSentAt).length} invited · {invitees.filter(i => i.rsvp).length} responded
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Bulk Import */}
          <button onClick={() => setShowImport(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 text-sm font-medium rounded-xl transition-colors">
            <Upload size={14} /> Import CSV
          </button>
          {/* Send All Invites */}
          <button
            onClick={async () => {
              const pending = invitees.filter(i => i.email && !i.inviteSentAt)
              if (!pending.length) { toast({ title: 'All guests with email have already been invited', type: 'error' }); return }
              if (!confirm(`Send invitation emails to ${pending.length} uninvited guests?`)) return
              const res = await fetch('/api/invitees/send-invites', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inviteeIds: pending.map(i => i.id) }),
              })
              if (res.ok) { const d = await res.json(); toast({ title: `Sent ${d.sent} invitations`, type: 'success' }); load() }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 text-sm font-medium rounded-xl transition-colors">
            <Send size={14} /> Send All Invites
          </button>
          {/* Add Single */}
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Invitee
          </button>
        </div>
      </div>

      {/* ── Search ──────────────────────────────────────────── */}
      <div className="admin-card mb-6">
        <input type="text" placeholder="Search by name, email or group…"
          value={search} onChange={e => setSearch(e.target.value)} className="input-field" />
      </div>

      {/* ── Table ───────────────────────────────────────────── */}
      <div className="admin-card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Name', 'Email', 'Group / Table', 'RSVP', 'Invite', 'Confirmation', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium text-sm">{h}</th>
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
                <td className="px-4 py-3">{rsvpBadge(inv)}</td>
                <td className="px-4 py-3">
                  {!inv.email ? (
                    <span className="text-xs text-gray-300">No email</span>
                  ) : inv.inviteSentAt ? (
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Sent</span>
                      {!inv.rsvp && (
                        <button onClick={() => sendInvite(inv)} disabled={sending === inv.id}
                          className="p-1 rounded hover:bg-amber-50 text-amber-500" title="Resend reminder">
                          <Bell size={11} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <button onClick={() => sendInvite(inv)} disabled={sending === inv.id}
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50">
                      {sending === inv.id ? <Loader2 size={10} className="animate-spin" /> : <><Send size={10} /> Send</>}
                    </button>
                  )}
                </td>
                <td className="px-4 py-3">
                  {!inv.email ? (
                    <span className="text-xs text-gray-300">No email</span>
                  ) : inv.confirmationSentAt ? (
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">Sent</span>
                      <button onClick={() => resendConfirmation(inv)} disabled={sending === inv.id}
                        className="p-1 rounded hover:bg-blue-50 text-blue-500" title="Resend confirmation">
                        {sending === inv.id ? <Loader2 size={10} className="animate-spin" /> : <Send size={10} />}
                      </button>
                      <button onClick={() => revokeConfirmation(inv)} disabled={sending === inv.id}
                        className="p-1 rounded hover:bg-red-50 text-red-400" title="Revoke confirmation">
                        <X size={10} />
                      </button>
                    </div>
                  ) : inv.rsvp?.attending ? (
                    <button onClick={() => resendConfirmation(inv)} disabled={sending === inv.id}
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50">
                      {sending === inv.id ? <Loader2 size={10} className="animate-spin" /> : <><Send size={10} /> Send</>}
                    </button>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => showQR(inv)} className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-600" title="View QR Code">
                      <QrCode size={15} />
                    </button>
                    {inv.rsvp?.attending && inv.email && (
                      <button
                        onClick={() => sendAccessCode(inv)}
                        disabled={sending === inv.id}
                        className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 disabled:opacity-40"
                        title="Send venue access code to guest"
                      >
                        {sending === inv.id ? <Loader2 size={15} className="animate-spin" /> : <KeyRound size={15} />}
                      </button>
                    )}
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
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center">
                  <FileSpreadsheet size={32} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No invitees yet</p>
                  <div className="flex items-center justify-center gap-3 mt-4">
                    <button onClick={() => setShowImport(true)}
                      className="inline-flex items-center gap-1.5 text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-xl hover:bg-green-100 transition-colors">
                      <Upload size={14} /> Import CSV
                    </button>
                    <button onClick={openAdd}
                      className="inline-flex items-center gap-1.5 text-sm text-purple-700 bg-purple-50 border border-purple-200 px-4 py-2 rounded-xl hover:bg-purple-100 transition-colors">
                      <Plus size={14} /> Add Manually
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Bulk Import Modal ─────────────────────────────── */}
      {showImport && (
        <BulkImportModal
          onClose={() => setShowImport(false)}
          onImported={load}
        />
      )}

      {/* ── Add/Edit Form Modal ───────────────────────────── */}
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
                  <GroupSelect value={groupValue} onChange={v => setValue('group', v, { shouldValidate: true })} />
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

      {/* ── QR Modal ─────────────────────────────────────── */}
      {qrModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-xs w-full text-center">
            <h3 className="font-serif text-xl text-purple-900 mb-1">{qrModal.name}</h3>
            <p className="text-xs text-gray-400 mb-4">Personal RSVP QR Code</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrModal.dataUrl} alt="QR Code" className="w-48 h-48 mx-auto rounded-xl border-2 border-purple-100 mb-4" />
            <p className="text-xs text-gray-400 mb-4 break-all">{qrModal.url}</p>
            <div className="flex gap-2">
              <a href={qrModal.dataUrl} download={`${qrModal.name.replace(/\s+/g, '-')}-qr.png`}
                className="btn-primary flex-1 flex items-center justify-center gap-2 !text-sm">
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
