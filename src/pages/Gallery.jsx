import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getFamily } from '../lib/family'
import FamilyBadge from '../components/FamilyBadge'

export default function Gallery() {
  const [photos, setPhotos] = useState([])
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const [lightbox, setLightbox] = useState(null)
  const family = getFamily()

  async function loadPhotos() {
    if (!supabase) return
    const { data } = await supabase.from('photos').select('*').order('created_at', { ascending: false })
    if (data) setPhotos(data)
  }

  useEffect(() => {
    loadPhotos()
    if (!supabase) return
    const channel = supabase.channel('photos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'photos' }, () => loadPhotos())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  function getPublicUrl(path) {
    if (!supabase) return ''
    return supabase.storage.from('photos').getPublicUrl(path).data.publicUrl
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file || !supabase) return
    setUploading(true)

    const ext = file.name.split('.').pop()
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadError } = await supabase.storage.from('photos').upload(path, file)
    if (uploadError) {
      alert('Upload failed: ' + uploadError.message)
      setUploading(false)
      return
    }

    await supabase.from('photos').insert({
      family_name: family,
      storage_path: path,
      caption: caption.trim() || null,
      created_at: new Date().toISOString(),
    })

    setCaption('')
    setUploading(false)
    loadPhotos()
    // Reset file input
    e.target.value = ''
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-[#2A2118] mb-2">📸 Photo Gallery</h1>
      <p className="text-[#78350F] text-sm mb-4">Share photos from the trip!</p>

      {!supabase && (
        <p className="text-[#B91C1C] bg-red-50 p-3 rounded-lg mb-4 text-sm">Supabase not connected.</p>
      )}

      {/* Upload */}
      <div className="bg-white/50 rounded-xl p-4 border border-[#78350F]/10 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Caption (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="flex-1 border border-[#78350F]/30 rounded-lg px-3 py-2 text-sm"
          />
          <label className={`px-5 py-2 bg-[#C2410C] text-white rounded-lg font-bold text-sm text-center cursor-pointer hover:bg-[#B91C1C] transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
            {uploading ? 'Uploading...' : '📷 Upload Photo'}
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Grid */}
      {photos.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📷</div>
          <p className="text-[#78350F]">No photos yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative group cursor-pointer rounded-xl overflow-hidden border border-[#78350F]/10 aspect-square bg-[#78350F]/5"
              onClick={() => setLightbox(photo)}
            >
              <img
                src={getPublicUrl(photo.storage_path)}
                alt={photo.caption || 'Trip photo'}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {photo.caption && <p className="text-white text-xs truncate">{photo.caption}</p>}
                <p className="text-white/60 text-xs">{photo.family_name}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center px-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl z-10"
            onClick={() => setLightbox(null)}
          >
            ✕
          </button>
          <div className="max-w-3xl max-h-[85vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={getPublicUrl(lightbox.storage_path)}
              alt={lightbox.caption || 'Trip photo'}
              className="max-w-full max-h-[75vh] object-contain rounded-lg"
            />
            <div className="mt-3 text-center">
              {lightbox.caption && <p className="text-white text-sm mb-1">{lightbox.caption}</p>}
              <FamilyBadge family={lightbox.family_name} small />
              <p className="text-white/40 text-xs mt-1">
                {new Date(lightbox.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
