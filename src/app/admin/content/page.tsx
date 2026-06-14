'use client'

import { useState, useEffect, useCallback } from 'react'
import { Save } from 'lucide-react'
import { useToast } from '@/app/toaster'

const FIELDS = [
  { key: 'contact_person_name',    label: 'Contact Person 1 — Name',    type: 'text',     placeholder: 'Ama Mensah' },
  { key: 'contact_person_phone',   label: 'Contact Person 1 — Phone',   type: 'text',     placeholder: '+233 24 000 0000' },
  { key: 'contact_person_email',   label: 'Contact Person 1 — Email',   type: 'email',    placeholder: 'ama@email.com' },
  { key: 'contact_person2_name',   label: 'Contact Person 2 — Name',    type: 'text',     placeholder: 'Kweku Asante' },
  { key: 'contact_person2_phone',  label: 'Contact Person 2 — Phone',   type: 'text',     placeholder: '+233 24 000 0001' },
  { key: 'hero_tagline',           label: 'Hero Tagline',               type: 'text',     placeholder: 'Two hearts, one journey' },
  { key: 'rsvp_deadline',          label: 'RSVP Deadline',              type: 'text',     placeholder: '1 November 2026' },
  { key: 'dress_code_note',        label: 'Dress Code Note',            type: 'textarea', placeholder: 'Smart formal / African formal' },
  { key: 'gifts_donation_link',    label: 'Monetary Gift / Donation Link', type: 'url',  placeholder: 'https://…' },
  { key: 'gifts_account_name',     label: 'Mobile Money / Account Name', type: 'text',   placeholder: 'Ekow Mensah' },
  { key: 'gifts_account_number',   label: 'Mobile Money / Account Number', type: 'text', placeholder: '024 000 0000' },
  { key: 'story_text',             label: 'Our Story Text',             type: 'textarea', placeholder: 'Ekow and Ekua met…' },
]

export default function ContentPage() {
  const [values, setValues]   = useState<Record<string, string>>({})
  const [saving, setSaving]   = useState(false)
  const [dirty, setDirty]     = useState(false)
  const { toast } = useToast()

  const load = useCallback(async () => {
    const res = await fetch('/api/content')
    if (res.ok) setValues(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  function onChange(key: string, value: string) {
    setValues(p => ({ ...p, [key]: value }))
    setDirty(true)
  }

  async function save() {
    setSaving(true)
    const res = await fetch('/api/content', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(values),
    })
    setSaving(false)
    if (res.ok) {
      toast({ title: 'Content saved', type: 'success' })
      setDirty(false)
    } else {
      toast({ title: 'Failed to save', type: 'error' })
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-gray-800">Site Content</h1>
          <p className="text-gray-500 text-sm mt-1">Edit text and contact details shown on the website</p>
        </div>
        <button onClick={save} disabled={saving || !dirty} className="btn-primary flex items-center gap-2 disabled:opacity-50">
          <Save size={16} />
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FIELDS.map(field => (
          <div key={field.key} className={`admin-card ${field.type === 'textarea' ? 'md:col-span-2' : ''}`}>
            <label className="label text-gray-600">{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea
                value={values[field.key] ?? ''}
                onChange={e => onChange(field.key, e.target.value)}
                rows={3}
                className="input-field resize-none"
                placeholder={field.placeholder}
              />
            ) : (
              <input
                type={field.type}
                value={values[field.key] ?? ''}
                onChange={e => onChange(field.key, e.target.value)}
                className="input-field"
                placeholder={field.placeholder}
              />
            )}
          </div>
        ))}
      </div>

      {dirty && (
        <div className="fixed bottom-6 right-6">
          <button onClick={save} disabled={saving} className="btn-primary shadow-lg flex items-center gap-2">
            <Save size={16} />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  )
}
