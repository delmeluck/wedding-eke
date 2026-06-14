'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Upload, Star, X, Link as LinkIcon } from 'lucide-react'
import Image from 'next/image'
import { useToast } from '@/app/toaster'

interface MediaItem {
  id: string
  type: string
  url: string
  caption?: string
  category?: string
  featured: boolean
  sortOrder: number
}

export default function GalleryPage() {
  const [items, setItems]         = useState<MediaItem[]>([])
  const [showAdd, setShowAdd]     = useState(false)
  const [tab, setTab]             = useState<'upload' | 'url'>('upload')
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput]   = useState('')
  const [caption, setCaption]     = useState('')
  const [category, setCategory]   = useState('engagement')
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo')
  const { toast } = useToast()

  const load = useCallback(async () => {
    const res = await fetch('/api/gallery')
    if (res.ok) setItems(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  async function uploadFile(file: File) {
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    if (!res.ok) { setUploading(false); toast({ title: 'Upload failed', type: 'error' }); return }
    const { url } = await res.json()
    await addItem(url, file.type.startsWith('video') ? 'video' : 'photo')
    setUploading(false)
  }

  async function addItem(url: string, type: string) {
    const res = await fetch('/api/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, type, caption, category, featured: false, sortOrder: items.length }),
    })
    if (res.ok) {
      toast({ title: 'Added to gallery', type: 'success' })
      setShowAdd(false)
      setUrlInput(''); setCaption(''); setCategory('engagement')
      load()
    }
  }

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

  const photos = items.filter(i => i.type === 'photo')
  const videos = items.filter(i => i.type === 'video')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-gray-800">Gallery</h1>
          <p className="text-gray-500 text-sm mt-1">{photos.length} photos · {videos.length} videos</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Media
        </button>
      </div>

      {/* Photos */}
      {photos.length > 0 && (
        <section className="mb-8">
          <h2 className="font-semibold text-gray-700 mb-3">Photos</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
            {photos.map(item => (
              <div key={item.id} className="relative group rounded-xl overflow-hidden bg-gray-100 aspect-square">
                <Image src={item.url} alt={item.caption ?? ''} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => toggleFeatured(item)} className={`p-2 rounded-full ${item.featured ? 'bg-gold text-purple-950' : 'bg-white/20 text-white'}`}>
                    <Star size={14} />
                  </button>
                  <button onClick={() => del(item.id)} className="p-2 rounded-full bg-red-500/80 text-white">
                    <Trash2 size={14} />
                  </button>
                </div>
                {item.featured && (
                  <div className="absolute top-1 right-1 bg-gold text-purple-950 text-[10px] px-1.5 py-0.5 rounded-full">★</div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Videos */}
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
                  <button onClick={() => del(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {items.length === 0 && (
        <div className="text-center py-16 text-gray-400">No media yet — add photos or videos above</div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-serif text-xl">Add Media</h2>
              <button onClick={() => setShowAdd(false)}><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              {/* Tab */}
              <div className="flex rounded-xl overflow-hidden border border-gray-200">
                <button onClick={() => setTab('upload')} className={`flex-1 py-2 text-sm font-medium ${tab === 'upload' ? 'bg-purple-800 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <Upload size={14} className="inline mr-1" /> Upload File
                </button>
                <button onClick={() => setTab('url')} className={`flex-1 py-2 text-sm font-medium ${tab === 'url' ? 'bg-purple-800 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <LinkIcon size={14} className="inline mr-1" /> Use URL
                </button>
              </div>

              {tab === 'upload' ? (
                <div>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-lavender-200 rounded-xl py-8 cursor-pointer hover:bg-lavender-50 transition-colors">
                    <Upload size={24} className="text-lavender-400 mb-2" />
                    <span className="text-sm text-gray-500">{uploading ? 'Uploading…' : 'Click or drag to upload'}</span>
                    <span className="text-xs text-gray-400 mt-1">JPG, PNG, WebP, MP4 · Max 50 MB</span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="sr-only"
                      disabled={uploading}
                      onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0])}
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="label">URL</label>
                    <input value={urlInput} onChange={e => setUrlInput(e.target.value)} className="input-field" placeholder="https://… or YouTube embed URL" />
                  </div>
                  <div>
                    <label className="label">Type</label>
                    <select value={mediaType} onChange={e => setMediaType(e.target.value as 'photo' | 'video')} className="input-field">
                      <option value="photo">Photo</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="label">Caption</label>
                <input value={caption} onChange={e => setCaption(e.target.value)} className="input-field" placeholder="Our engagement shoot…" />
              </div>
              <div>
                <label className="label">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="input-field">
                  <option value="engagement">Engagement</option>
                  <option value="pre-wedding">Pre-wedding</option>
                  <option value="wedding">Wedding</option>
                  <option value="reception">Reception</option>
                </select>
              </div>

              {tab === 'url' && (
                <button onClick={() => urlInput && addItem(urlInput, mediaType)} className="btn-primary w-full">
                  Add to Gallery
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
