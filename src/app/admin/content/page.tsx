'use client'

import { useState, useEffect, useCallback } from 'react'
import { Save, LayoutDashboard, Users, Phone, CreditCard, Palette, Eye, EyeOff, ChevronRight, ShieldCheck, ShieldOff } from 'lucide-react'
import { useToast } from '@/app/toaster'

/* ─── Tab definitions ───────────────────────────────────────── */
const TABS = [
  { id: 'hero',      label: 'Hero & Story',    icon: <LayoutDashboard size={15} /> },
  { id: 'contact',   label: 'Contact',          icon: <Phone size={15} /> },
  { id: 'payments',  label: 'Payment Details',  icon: <CreditCard size={15} /> },
  { id: 'stream',    label: 'Live Stream',       icon: <Eye size={15} /> },
  { id: 'rsvp',      label: 'RSVP Settings',    icon: <ShieldCheck size={15} /> },
  { id: 'layout',    label: 'Layout & Sections', icon: <Palette size={15} /> },
]

/* ─── Field groups per tab ──────────────────────────────────── */
const FIELDS: Record<string, { key: string; label: string; type: string; placeholder: string; hint?: string; wide?: boolean }[]> = {
  hero: [
    { key: 'hero_tagline',     label: 'Hero Tagline',          type: 'text',     placeholder: 'Two hearts, one journey', wide: true },
    { key: 'hero_subtitle',    label: 'Hero Sub-tagline',      type: 'text',     placeholder: 'Join us as we begin forever' },
    { key: 'groom_name',       label: "Groom's Full Name",     type: 'text',     placeholder: 'Ekow Mensah' },
    { key: 'bride_name',       label: "Bride's Full Name",     type: 'text',     placeholder: 'Ekua Asante' },
    { key: 'wedding_date',     label: 'Wedding Date (display)', type: 'text',    placeholder: 'Saturday, 19 December 2026' },
    { key: 'engagement_date',  label: 'Engagement Date',       type: 'text',     placeholder: 'Thursday, 17 December 2026' },
    { key: 'rsvp_deadline',    label: 'RSVP Deadline',         type: 'text',     placeholder: '20 November 2026' },
    { key: 'dress_code_note',  label: 'Dress Code',            type: 'textarea', placeholder: 'Smart Formal / African Formal', wide: true },
    { key: 'story_text',       label: 'Our Story',             type: 'textarea', placeholder: 'Ekow and Ekua met in…', wide: true },
  ],
  contact: [
    { key: 'contact_person_name',   label: 'Contact 1 — Name',  type: 'text',  placeholder: 'Ama Mensah' },
    { key: 'contact_person_phone',  label: 'Contact 1 — Phone', type: 'text',  placeholder: '+233 24 000 0000' },
    { key: 'contact_person_email',  label: 'Contact 1 — Email', type: 'email', placeholder: 'ama@email.com' },
    { key: 'contact_person2_name',  label: 'Contact 2 — Name',  type: 'text',  placeholder: 'Kweku Asante' },
    { key: 'contact_person2_phone', label: 'Contact 2 — Phone', type: 'text',  placeholder: '+233 24 000 0001' },
    { key: 'venue_engagement',      label: 'Engagement Venue',  type: 'text',  placeholder: 'Kasoa, Central Region, Ghana', wide: true },
    { key: 'venue_wedding',         label: 'Wedding Venue',     type: 'text',  placeholder: 'Bethany Methodist Church, Dzorwulu, Accra', wide: true },
  ],
  payments: [
    { key: 'momo_mtn_name',        label: 'MTN MoMo — Account Name',    type: 'text', placeholder: 'Ekow Mensah' },
    { key: 'momo_mtn_number',      label: 'MTN MoMo — Number',          type: 'text', placeholder: '024 000 0000',
      hint: 'MTN numbers: 024, 054, 055, 059' },
    { key: 'momo_vodafone_name',   label: 'Vodafone Cash — Name',       type: 'text', placeholder: 'Ekua Asante' },
    { key: 'momo_vodafone_number', label: 'Vodafone Cash — Number',     type: 'text', placeholder: '020 000 0000',
      hint: 'Vodafone numbers: 020, 050' },
    { key: 'momo_airtel_name',     label: 'AirtelTigo — Name',          type: 'text', placeholder: 'Ekow Mensah' },
    { key: 'momo_airtel_number',   label: 'AirtelTigo — Number',        type: 'text', placeholder: '027 000 0000',
      hint: 'AirtelTigo numbers: 027, 057, 026, 056' },
    { key: 'bank_name',            label: 'Bank Name',                   type: 'text', placeholder: 'GCB Bank' },
    { key: 'bank_account_name',    label: 'Bank Account Name',           type: 'text', placeholder: 'Ekow & Ekua Mensah' },
    { key: 'bank_account_number',  label: 'Bank Account Number',        type: 'text', placeholder: '1234567890' },
    { key: 'bank_branch',          label: 'Bank Branch',                 type: 'text', placeholder: 'Accra Main Branch' },
    { key: 'gifts_donation_link',  label: 'External Donation Link',      type: 'url',  placeholder: 'https://…', wide: true,
      hint: 'Optional: link to a Paystack, Flutterwave, or other payment page' },
  ],
  stream: [
    { key: 'stream_url',   label: 'YouTube Live Stream URL', type: 'url',  placeholder: 'https://www.youtube.com/watch?v=...', wide: true,
      hint: 'Paste the YouTube watch URL or live stream link. Leave blank to hide the stream section.' },
    { key: 'stream_title', label: 'Stream Title (optional)', type: 'text', placeholder: 'Watch Our Wedding Live 💒',
      hint: 'Shown above the stream player. Defaults to "Watch Live" if left blank.' },
  ],
  layout: [],  // handled separately below
}

/* ─── Homepage section toggles ──────────────────────────────── */
const SECTIONS = [
  { key: 'section_show_hero',       label: 'Hero Banner',         desc: 'Full-screen opening with couple names and date' },
  { key: 'section_show_marquee',    label: 'Gold Marquee Band',   desc: 'Scrolling decorative text strip' },
  { key: 'section_show_mosaic',     label: 'Photo Mosaic',        desc: 'Asymmetric photo grid section' },
  { key: 'section_show_savedate',   label: 'Save the Date',       desc: 'Wedding date countdown card' },
  { key: 'section_show_couple',     label: 'Meet the Couple',     desc: "Groom & bride's profiles" },
  { key: 'section_show_gallery',    label: 'Gallery Strip',       desc: 'Horizontal scroll photo gallery' },
  { key: 'section_show_bento',      label: 'Info Bento Grid',     desc: 'Venue / dress code / gifts overview' },
  { key: 'section_show_rsvp_cta',   label: 'RSVP Call-to-Action', desc: 'RSVP banner at the bottom of the page' },
]

export default function ContentPage() {
  const [values,  setValues]  = useState<Record<string, string>>({})
  const [saving,  setSaving]  = useState(false)
  const [dirty,   setDirty]   = useState(false)
  const [activeTab, setTab]   = useState('hero')
  const { toast } = useToast()

  const load = useCallback(async () => {
    const res = await fetch('/api/content')
    if (res.ok) {
      const data: Record<string, string> = await res.json()
      // Fill defaults for any fields not yet saved to DB
      const defaults: Record<string, string> = {
        // Section toggles
        ...Object.fromEntries(SECTIONS.map(s => [s.key, 'true'])),
        // Content defaults matching site hardcoded values
        groom_name:        'Ekow',
        bride_name:        'Ekua',
        wedding_date:      'Friday, 19 December 2026',
        engagement_date:   'Wednesday, 17 December 2026',
        rsvp_deadline:     '20 November 2026',
        venue_wedding:     'Bethany Methodist Church, Dzorwulu, Accra',
        venue_engagement:  'Ghana',
        dress_code_note:   'Smart Formal · African Formal · Embrace the palette',
        hero_tagline:      'Two hearts, one journey',
        hero_subtitle:     'Join us as we begin forever',
        brand_couple_initials: 'E & E',
        brand_year:        '2026',
      }
      // DB values override defaults
      const merged = { ...defaults, ...data }
      setValues(merged)
      // Mark dirty if any defaults were applied (not yet persisted)
      const hasUnpersisted = Object.keys(defaults).some(k => !(k in data))
      if (hasUnpersisted) setDirty(true)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function onChange(key: string, value: string) {
    setValues(p => ({ ...p, [key]: value }))
    setDirty(true)
  }

  function toggleSection(key: string) {
    const current = values[key] !== 'false'  // default on
    onChange(key, current ? 'false' : 'true')
  }

  async function save() {
    setSaving(true)
    const res = await fetch('/api/content', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(values),
    })
    setSaving(false)
    if (res.ok) { toast({ title: 'Content saved — changes reflect live', type: 'success' }); setDirty(false) }
    else toast({ title: 'Failed to save', type: 'error' })
  }

  const currentFields = FIELDS[activeTab] ?? []

  return (
    <div>
      {/* ── Header ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-3xl text-gray-800">Site Content</h1>
          <p className="text-gray-400 text-sm mt-1">Edit website text, contacts, payment info and layout</p>
        </div>
        <button onClick={save} disabled={saving || !dirty}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl shadow-sm transition-all hover:-translate-y-0.5 disabled:hover:translate-y-0">
          <Save size={15} />
          {saving ? 'Saving…' : dirty ? 'Save Changes' : 'Saved'}
        </button>
      </div>

      {/* ── Tabs ────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap mb-6">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === t.id ? 'bg-purple-700 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-purple-200 hover:text-purple-700'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── RSVP Settings ───────────────────────────── */}
      {activeTab === 'rsvp' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-700">RSVP Access Mode</h2>
              <p className="text-xs text-gray-400 mt-1">
                Control whether guests must be on the pre-imported invitee list to RSVP.
              </p>
            </div>
            {(() => {
              const isOpen = values['rsvp_open_mode'] !== 'false'
              return (
                <div className="p-5 space-y-5">
                  {/* Toggle */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isOpen ? 'bg-green-100' : 'bg-amber-50'}`}>
                        {isOpen
                          ? <ShieldOff size={16} className="text-green-600" />
                          : <ShieldCheck size={16} className="text-amber-600" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">
                          {isOpen ? 'Open Mode — Anyone can RSVP' : 'Strict Mode — Invitation required'}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed max-w-sm">
                          {isOpen
                            ? 'Guests not on your list can still RSVP using their email. Their responses are tagged as "self-registered" so you can distinguish them from pre-imported invitees.'
                            : 'Only guests whose email was added to the invitee list via the admin can RSVP. Anyone else will see an "invitation not found" message.'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onChange('rsvp_open_mode', isOpen ? 'false' : 'true')}
                      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${isOpen ? 'bg-green-500' : 'bg-gray-200'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isOpen ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>

                  {/* Info box */}
                  <div className={`rounded-xl px-4 py-3 text-xs leading-relaxed space-y-1 ${isOpen ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'}`}>
                    {isOpen ? (
                      <>
                        <p className="font-semibold">✓ Open Mode is active</p>
                        <p>Guests who can&apos;t find their email can still RSVP. The admin invitee list will show them tagged as <em>self-registered</em>.</p>
                        <p>Switch to Strict Mode when you&apos;re confident your invitee list is complete — usually 1–2 weeks before the event.</p>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold">🔒 Strict Mode is active</p>
                        <p>Only pre-imported invitees can RSVP. Guests not on the list will see an &quot;invitation not found&quot; message and a link to contact you.</p>
                      </>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* ── Layout section toggles ───────────────────── */}
      {activeTab === 'layout' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-700">Homepage Sections</h2>
              <p className="text-xs text-gray-400 mt-1">Toggle which sections appear on your public homepage. Changes save immediately on pressing Save.</p>
            </div>
            <div className="divide-y divide-gray-50">
              {SECTIONS.map(s => {
                const on = values[s.key] !== 'false'
                return (
                  <div key={s.key} className={`flex items-center justify-between gap-4 px-5 py-4 transition-colors ${on ? '' : 'opacity-50'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${on ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {on ? <Eye size={14} className="text-green-600" /> : <EyeOff size={14} className="text-gray-400" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">{s.label}</p>
                        <p className="text-xs text-gray-400">{s.desc}</p>
                      </div>
                    </div>
                    <button onClick={() => toggleSection(s.key)}
                      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${on ? 'bg-purple-600' : 'bg-gray-200'}`}>
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Colour / branding placeholders */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-700 mb-1">Branding</h2>
            <p className="text-xs text-gray-400 mb-4">Accent colour used throughout the site</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'brand_couple_initials', label: 'Couple Initials (monogram)', placeholder: 'E & E' },
                { key: 'brand_year',            label: 'Wedding Year',               placeholder: '2026' },
              ].map(f => (
                <div key={f.key}>
                  <label className="label">{f.label}</label>
                  <input value={values[f.key] ?? ''} onChange={e => onChange(f.key, e.target.value)} className="input-field" placeholder={f.placeholder} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Field tabs (hero, contact, payments) ─────── */}
      {activeTab !== 'layout' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2 text-gray-500">
            {TABS.find(t => t.id === activeTab)?.icon}
            <span className="font-semibold text-gray-700 text-sm">{TABS.find(t => t.id === activeTab)?.label}</span>
            <ChevronRight size={14} className="text-gray-300" />
            <span className="text-xs text-gray-400">{currentFields.length} fields</span>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentFields.map(field => (
                <div key={field.key} className={field.wide ? 'md:col-span-2' : ''}>
                  <label className="label">{field.label}</label>
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
                  {field.hint && <p className="text-xs text-gray-400 mt-1">{field.hint}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating save */}
      {dirty && (
        <div className="fixed bottom-6 right-6 z-40">
          <button onClick={save} disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-3 bg-purple-700 hover:bg-purple-800 text-white font-medium rounded-2xl shadow-xl shadow-purple-200 transition-all hover:-translate-y-0.5 text-sm">
            <Save size={15} />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  )
}
