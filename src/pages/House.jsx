import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { formatDate } from '../lib/tripConfig'

export default function House() {
  const [house, setHouse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)

  async function loadHouse() {
    if (!supabase) { setLoading(false); return }
    const { data } = await supabase.from('house').select('*').limit(1).maybeSingle()
    setHouse(data)
    setLoading(false)
  }

  useEffect(() => {
    loadHouse()
    if (!supabase) return
    const channel = supabase.channel('house')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'house' }, () => loadHouse())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function handleSave() {
    if (!editing) return
    const row = {
      name: editing.name || null,
      listing_url: editing.listing_url || null,
      address: editing.address || null,
      check_in: editing.check_in || null,
      check_out: editing.check_out || null,
      notes: editing.notes || null,
      updated_at: new Date().toISOString(),
    }
    if (house) {
      await supabase.from('house').update(row).eq('id', house.id)
    } else {
      await supabase.from('house').insert(row)
    }
    setEditing(null)
    loadHouse()
  }

  function openEdit() {
    setEditing({
      name: house?.name || '',
      listing_url: house?.listing_url || '',
      address: house?.address || '',
      check_in: house?.check_in || '',
      check_out: house?.check_out || '',
      notes: house?.notes || '',
    })
  }

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-8 text-[#78350F]">Loading...</div>

  const isEmpty = !house || !house.name

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-[#2A2118] mb-6">🏔️ The House</h1>

      {!supabase && (
        <p className="text-[#B91C1C] bg-red-50 p-3 rounded-lg mb-4 text-sm">Supabase not connected.</p>
      )}

      {isEmpty ? (
        <div className="bg-white/50 rounded-xl p-8 border border-[#78350F]/10 text-center">
          <div className="text-5xl mb-4">🏔️</div>
          <h2 className="font-display text-xl font-bold text-[#2A2118] mb-2">
            We haven&apos;t booked a house yet!
          </h2>
          <p className="text-[#78350F] text-sm mb-6">
            Once we find the perfect mountain cabin, add the details here.
          </p>
          <button
            onClick={openEdit}
            className="px-6 py-3 bg-[#C2410C] text-white rounded-lg font-bold hover:bg-[#B91C1C] transition-colors"
          >
            Add house details
          </button>
        </div>
      ) : (
        <div className="bg-white/50 rounded-xl p-6 border border-[#78350F]/10 relative">
          <button
            onClick={openEdit}
            className="absolute top-4 right-4 text-xs text-[#D97706] hover:underline"
          >
            Edit
          </button>

          <h2 className="font-display text-2xl font-bold text-[#2A2118] mb-3">{house.name}</h2>

          {house.address && (
            <div className="mb-3">
              <p className="text-[#2A2118] text-sm">{house.address}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(house.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#0EA5E9] hover:underline"
              >
                Open in Maps
              </a>
            </div>
          )}

          {(house.check_in || house.check_out) && (
            <div className="flex gap-4 mb-3 text-sm">
              {house.check_in && (
                <div>
                  <span className="text-[#78350F]">Check-in:</span>{' '}
                  <span className="font-medium text-[#2A2118]">{formatDate(house.check_in)}</span>
                </div>
              )}
              {house.check_out && (
                <div>
                  <span className="text-[#78350F]">Check-out:</span>{' '}
                  <span className="font-medium text-[#2A2118]">{formatDate(house.check_out)}</span>
                </div>
              )}
            </div>
          )}

          {house.listing_url && (
            <a
              href={house.listing_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-5 py-2 bg-[#C2410C] text-white rounded-lg font-bold text-sm hover:bg-[#B91C1C] transition-colors mb-3"
            >
              View listing →
            </a>
          )}

          {house.notes && (
            <div className="mt-3 pt-3 border-t border-[#78350F]/10">
              <h3 className="text-sm font-bold text-[#78350F] mb-1">Notes</h3>
              <p className="text-[#2A2118] text-sm whitespace-pre-wrap">{house.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-lg font-bold text-[#2A2118] mb-4">House Details</h3>

            <label className="block text-sm font-medium text-[#78350F] mb-1">Name</label>
            <input
              type="text"
              placeholder="e.g. The Mountain View Cabin"
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              className="w-full border border-[#78350F]/30 rounded-lg px-3 py-2 mb-3 text-sm"
              autoFocus
            />

            <label className="block text-sm font-medium text-[#78350F] mb-1">Listing URL</label>
            <input
              type="url"
              placeholder="Airbnb / VRBO link"
              value={editing.listing_url}
              onChange={(e) => setEditing({ ...editing, listing_url: e.target.value })}
              className="w-full border border-[#78350F]/30 rounded-lg px-3 py-2 mb-3 text-sm"
            />

            <label className="block text-sm font-medium text-[#78350F] mb-1">Address</label>
            <input
              type="text"
              placeholder="Full address"
              value={editing.address}
              onChange={(e) => setEditing({ ...editing, address: e.target.value })}
              className="w-full border border-[#78350F]/30 rounded-lg px-3 py-2 mb-3 text-sm"
            />

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium text-[#78350F] mb-1">Check-in</label>
                <input
                  type="date"
                  value={editing.check_in}
                  onChange={(e) => setEditing({ ...editing, check_in: e.target.value })}
                  className="w-full border border-[#78350F]/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#78350F] mb-1">Check-out</label>
                <input
                  type="date"
                  value={editing.check_out}
                  onChange={(e) => setEditing({ ...editing, check_out: e.target.value })}
                  className="w-full border border-[#78350F]/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <label className="block text-sm font-medium text-[#78350F] mb-1">Notes</label>
            <textarea
              placeholder="WiFi password, door codes, parking, etc."
              value={editing.notes}
              onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
              className="w-full border border-[#78350F]/30 rounded-lg px-3 py-2 mb-4 text-sm"
              rows={3}
            />

            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-[#78350F]">
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#C2410C] text-white rounded-lg text-sm font-bold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
