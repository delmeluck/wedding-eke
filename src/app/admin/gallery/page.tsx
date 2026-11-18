'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Trash2, Upload, Star, X, GripVertical, CheckCircle2, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useToast } from '@/app/toaster'
import { LayoutPicker, GalleryLayout } from './LayoutPicker'

interface MediaItem {
  id:        string
  type:      string
  url:       string
  caption?:  string
  category?: string
  featured:  boolean
  sortOrder: number
}

interface PendingFile {
  file:    File
  preview: string
  status:  'queued' | 'uploading' | 'done' | 'error'
  errorMsg?: string
}

const CATEGORIES = ['engagement', 'pre-wedding', 'wedding', 'reception', 'other']

export default function GalleryPage() {
  const [items,       setItems]       = useState<MediaItem[]>([])
  const [photos,      setPhotos]      = useState<MediaItem[]>([])
  const [videos,      setVideos]      = useState<MediaItem[]>([])
  const [layout,      setLayout]      = useState<GalleryLayout>('masonry')
  const [drawerOpen,  setDrawerOpen]  = useState(false)
  const [drawerWidth, setDrawerWidth] = useState(440)

  // Upload queue
  const [pending,       setPending]      = useState<PendingFile[]>([])
  const [caption,       setCaption]      = useState('')
  const [category,      setCategory]     = useState('engagement')
  const [uploading,     setUploading]    = useState(false)
  const [uploadStatus,  setUploadStatus] = useState('')   // current progress label
  const [uploadError,   setUploadError]  = useState('')   // last fatal error

  // Drag-to-reorder
  const [dragIdx,     setDragIdx]    = useState<number | null>(null)
  const [overIdx,     setOverIdx]    = useState<number | null>(null)

  const [isDragOver, setIsDragOver] = useState(false)
  const resizeRef = useRef<HTMLDivElement>(null)
  const isResizing = useRef(false)
  const resizeStartX = useRef(0)
  const resizeStartW = useRef(0)
  const { toast } = useToast()

  /* ── Load items ─────────────────────────────────── */
  const load = useCallback(async () => {
    const [galleryRes, contentRes] = await Promise.all([
      fetch('/api/gallery'),
      fetch('/api/content'),
    ])
    if (galleryRes.ok) {
      const data: MediaItem[] = await galleryRes.json()
      setItems(data)
      setPhotos(data.filter(i => i.type === 'photo'))
      setVideos(data.filter(i => i.type === 'video'))
    }
    if (contentRes.ok) {
      const content = await contentRes.json()
      if (content.gallery_layout) setLayout(content.gallery_layout as GalleryLayout)
    }
  }, [])

  useEffect(() => { load() }, [load])

  /* ── Drawer resize ──────────────────────────────── */
  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!isResizing.current) return
      const delta = resizeStartX.current - e.clientX
      setDrawerWidth(Math.min(700, Math.max(320, resizeStartW.current + delta)))
    }
    function onUp() { isResizing.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  function startResize(e: React.MouseEvent) {
    isResizing.current = true
    resizeStartX.current = e.clientX
    resizeStartW.current = drawerWidth
    e.preventDefault()
  }

  /* ── File picker → pending queue ───────────────── */
  function addFiles(files: FileList | null) {
    if (!files) return
    const newEntries: PendingFile[] = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      status: 'queued',
    }))
    setPending(prev => [...prev, ...newEntries])
  }

  function removePending(idx: number) {
    setPending(prev => {
      URL.revokeObjectURL(prev[idx].preview)
      return prev.filter((_, i) => i !== idx)
    })
  }

  /* ── Upload all queued files ────────────────────── */
  async function uploadAll() {
    if (!pending.length || uploading) return
    setUploading(true)
    setUploadError('')

    const queued = pending.filter(p => p.status !== 'done')
    let done = 0

    for (let i = 0; i < pending.length; i++) {
      if (pending[i].status === 'done') continue

      const name = pending[i].file.name
      setUploadStatus(`Uploading ${done + 1} of ${queued.length} — ${name}`)
      setPending(prev => prev.map((p, j) => j === i ? { ...p, status: 'uploading', errorMsg: undefined } : p))

      try {
        // Step 1: upload file to storage
        const fd = new FormData()
        fd.append('file', pending[i].file)
        const upRes = await fetch('/api/upload', { method: 'POST', body: fd })
        const upJson = await upRes.json().catch(() => ({}))
        if (!upRes.ok) {
          throw new Error(upJson.error ?? `HTTP ${upRes.status} from /api/upload`)
        }
        const { url } = upJson

        // Step 2: save gallery record
        const addRes = await fetch('/api/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url,
            type:      pending[i].file.type.startsWith('video') ? 'video' : 'photo',
            caption:   caption || undefined,
            category,
            featured:  false,
            sortOrder: items.length + i,
          }),
        })
        if (!addRes.ok) {
          const addJson = await addRes.json().catch(() => ({}))
          throw new Error(addJson.error ?? `HTTP ${addRes.status} saving to gallery`)
        }

        setPending(prev => prev.map((p, j) => j === i ? { ...p, status: 'done' } : p))
        done++
        setUploadStatus(`Done ${done} of ${queued.length}`)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        setPending(prev => prev.map((p, j) => j === i ? { ...p, status: 'error', errorMsg: msg } : p))
        setUploadError(`"${name}" failed: ${msg}`)
      }
    }

    setUploading(false)
    if (done > 0) {
      setUploadStatus(`✓ ${done} photo${done !== 1 ? 's' : ''} uploaded`)
      toast({ title: `${done} photo${done !== 1 ? 's' : ''} added to gallery`, type: 'success' })
      await load()
      setPending(prev => prev.filter(p => p.status !== 'done'))
    } else {
      setUploadStatus('')
    }
  }

  /* ── Delete / feature ───────────────────────────── */
  async function del(id: string) {
    if (!confirm('Remove from gallery?')) return
    await fetch(`/api/gallery/${id}`, { method: 'DELETE' })
    load()
  }

  async function toggleFeatured(item: MediaItem) {
    await fetch(`/api/gallery/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: !item.featured }),
    })
    load()
  }

  /* ── Drag-to-reorder ────────────────────────────── */
  function handleDragStart(idx: number) { setDragIdx(idx) }
  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault()
    setOverIdx(idx)
  }

  async function handleDrop(dropTarget: number) {
    if (dragIdx === null || dragIdx === dropTarget) {
      setDragIdx(null); setOverIdx(null); return
    }
    const reordered = [...photos]
    const [moved] = reordered.splice(dragIdx, 1)
    reordered.splice(dropTarget, 0, moved)

    const withOrder = reordered.map((p, i) => ({ ...p, sortOrder: i }))
    setPhotos(withOrder)
    setDragIdx(null); setOverIdx(null)

    await fetch('/api/gallery', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(withOrder.map(p => ({ id: p.id, sortOrder: p.sortOrder }))),
    })
  }

  function closeDrawer() {
    setDrawerOpen(false)
    pending.forEach(p => URL.revokeObjectURL(p.preview))
    setPending([])
    setCaption(''); setCategory('engagement')
  }

  const doneCount    = pending.filter(p => p.status === 'done').length
  const queuedCount  = pending.filter(p => p.status === 'queued' || p.status === 'error').length

  return (
    <div className="relative">
      {/* ── Header ──────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-gray-800">Gallery</h1>
          <p className="text-gray-500 text-sm mt-1">{photos.length} photos · {videos.length} videos</p>
        </div>
        <button onClick={() => setDrawerOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Photos
        </button>
      </div>

      {/* ── Layout picker ───────────────────────────── */}
      <LayoutPicker current={layout} />

      {/* ── Photos grid (drag-to-reorder) ───────────── */}
      {photos.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-semibold text-gray-700">Photos</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">drag to reorder</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
            {photos.map((item, idx) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={e => handleDragOver(e, idx)}
                onDrop={() => handleDrop(idx)}
                onDragEnd={() => { setDragIdx(null); setOverIdx(null) }}
                className={`relative group rounded-xl overflow-hidden bg-gray-100 aspect-square cursor-grab active:cursor-grabbing
                           transition-all duration-150
                           ${dragIdx === idx ? 'opacity-40 scale-95' : ''}
                           ${overIdx === idx && dragIdx !== idx ? 'ring-2 ring-purple-500 ring-offset-1 scale-105' : ''}`}
              >
                <Image src={item.url} alt={item.caption ?? ''} fill className="object-cover" unoptimized />

                {/* Drag handle hint */}
                <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-60 transition-opacity">
                  <GripVertical size={14} className="text-white drop-shadow" />
                </div>

                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity
                               flex items-center justify-center gap-2">
                  <button onClick={() => toggleFeatured(item)}
                    className={`p-2 rounded-full ${item.featured ? 'bg-gold text-purple-950' : 'bg-white/20 text-white'}`}>
                    <Star size={14} />
                  </button>
                  <button onClick={() => del(item.id)} className="p-2 rounded-full bg-red-500/80 text-white">
                    <Trash2 size={14} />
                  </button>
                </div>

                {item.featured && (
                  <div className="absolute top-1 right-1 bg-gold text-purple-950 text-[10px] px-1.5 py-0.5 rounded-full font-bold">★</div>
                )}
                {item.sortOrder > 0 && (
                  <div className="absolute bottom-1 left-1 bg-black/40 text-white text-[9px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    #{item.sortOrder + 1}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Videos ──────────────────────────────────── */}
      {videos.length > 0 && (
        <section className="mb-8">
          <h2 className="font-semibold text-gray-700 mb-3">Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map(item => (
              <div key={item.id} className="admin-card">
                <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden mb-3">
                  <video src={item.url} controls className="w-full h-full" />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">{item.caption ?? 'No caption'}</p>
                  <button onClick={() => del(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {items.length === 0 && (
        <div className="text-center py-16 text-gray-400">No media yet — click &quot;Add Photos&quot; to get started</div>
      )}

      {/* ── Upload drawer ────────────────────────────── */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/30 z-40" onClick={closeDrawer} />

          {/* Resizable panel */}
          <div
            className="fixed top-0 right-0 h-full bg-white shadow-2xl z-50 flex flex-col"
            style={{ width: drawerWidth }}
          >
            {/* Resize handle */}
            <div
              ref={resizeRef}
              onMouseDown={startResize}
              className="absolute left-0 top-0 h-full w-3 cursor-col-resize flex items-center justify-center group z-10 hover:bg-purple-50/60 transition-colors"
              title="Drag to resize"
            >
              <div className="w-0.5 h-12 bg-gray-200 group-hover:bg-purple-400 rounded-full transition-colors" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="font-serif text-xl text-gray-800">Upload Photos</h2>
                {pending.length > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {pending.length} file{pending.length !== 1 ? 's' : ''} queued
                    {doneCount > 0 && ` · ${doneCount} done`}
                  </p>
                )}
              </div>
              <button onClick={closeDrawer} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* Drop zone — always visible at top */}
              <div
                onDragOver={e => { e.preventDefault(); if (!uploading) setIsDragOver(true) }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={e => {
                  e.preventDefault()
                  setIsDragOver(false)
                  if (!uploading) addFiles(e.dataTransfer.files)
                }}
                className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl py-7 transition-colors
                           ${uploading
                             ? 'opacity-50 pointer-events-none border-lavender-200'
                             : isDragOver
                               ? 'border-purple-500 bg-purple-50'
                               : 'border-lavender-200 hover:bg-lavender-50 hover:border-purple-300'}`}
              >
                <label className="flex flex-col items-center cursor-pointer w-full">
                  <Upload size={28} className={`mb-2 ${isDragOver ? 'text-purple-600' : 'text-purple-400'}`} />
                  <span className="text-sm font-medium text-gray-600">
                    {isDragOver ? 'Drop photos here' : 'Click or drag photos here'}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">JPG · PNG · WebP · MP4 · Max 50 MB each</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="sr-only"
                    disabled={uploading}
                    onChange={e => addFiles(e.target.files)}
                  />
                </label>
              </div>

              {/* Pending thumbnails */}
              {pending.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Queue</p>
                  <div className="grid grid-cols-3 gap-2">
                    {pending.map((pf, i) => (
                      <div key={i} className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100">
                        <Image
                          src={pf.preview}
                          alt={pf.file.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        {/* Status overlay */}
                        {pf.status === 'uploading' && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 size={20} className="text-white animate-spin" />
                          </div>
                        )}
                        {pf.status === 'done' && (
                          <div className="absolute inset-0 bg-green-500/40 flex items-center justify-center">
                            <CheckCircle2 size={20} className="text-white" />
                          </div>
                        )}
                        {pf.status === 'error' && (
                          <div className="absolute inset-0 bg-red-500/40 flex items-center justify-center">
                            <X size={20} className="text-white" />
                          </div>
                        )}
                        {/* Remove button */}
                        {pf.status !== 'uploading' && (
                          <button
                            onClick={() => removePending(i)}
                            className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full
                                       flex items-center justify-center opacity-0 group-hover:opacity-100
                                       transition-opacity hover:bg-red-500"
                          >
                            <X size={10} />
                          </button>
                        )}
                        {/* Filename tooltip */}
                        <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[9px] px-1 py-0.5
                                       truncate opacity-0 group-hover:opacity-100 transition-opacity">
                          {pf.file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Caption + category */}
              <div className="space-y-3">
                <div>
                  <label className="label">Caption <span className="text-gray-400 font-normal">(optional, applied to all)</span></label>
                  <input
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                    className="input-field"
                    placeholder="Engagement shoot in Accra…"
                    disabled={uploading}
                  />
                </div>
                <div>
                  <label className="label">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="input-field" disabled={uploading}>
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1).replace('-', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Footer — upload button always docked at bottom */}
            <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-white space-y-3">
              {/* Status / error banner */}
              {uploadError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-sm text-red-700">
                  <X size={14} className="shrink-0 mt-0.5" />
                  <span className="leading-snug">{uploadError}</span>
                </div>
              )}
              {uploadStatus && !uploadError && (
                <div className="flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-xl px-3 py-2.5 text-sm text-purple-700">
                  {uploading && <Loader2 size={14} className="animate-spin shrink-0" />}
                  {!uploading && uploadStatus.startsWith('✓') && <CheckCircle2 size={14} className="text-green-600 shrink-0" />}
                  <span>{uploadStatus}</span>
                </div>
              )}
              <button
                onClick={uploadAll}
                disabled={queuedCount === 0 || uploading}
                className="w-full py-3 rounded-2xl bg-purple-800 text-white font-semibold
                           hover:bg-purple-900 transition-colors disabled:opacity-40
                           disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading
                  ? <><Loader2 size={16} className="animate-spin" /> Uploading…</>
                  : queuedCount > 0
                    ? <><Upload size={16} /> Upload {queuedCount} photo{queuedCount !== 1 ? 's' : ''}</>
                    : 'Pick photos above to upload'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
