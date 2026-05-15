import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getTripDates, formatDate } from '../lib/tripConfig'
import { getFamily } from '../lib/family'

const TRIP_DATES = getTripDates()

export default function Itinerary() {
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null) // { date, time, description, id? }
  const family = getFamily()

  useEffect(() => {
    if (!supabase) return
    supabase.from('itinerary').select('*').order('date').order('time').then(({ data }) => {
      if (data) setItems(data)
    })

    const channel = supabase.channel('itinerary')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'itinerary' }, () => {
        supabase.from('itinerary').select('*').order('date').order('time').then(({ data }) => {
          if (data) setItems(data)
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function handleSave() {
    if (!editing || !editing.description.trim()) return
    const row = {
      date: editing.date,
      time: editing.time || null,
      description: editing.description.trim(),
      created_by: family,
      updated_at: new Date().toISOString(),
    }
    if (editing.id) {
      await supabase.from('itinerary').update(row).eq('id', editing.id)
    } else {
      await supabase.from('itinerary').insert(row)
    }
    setEditing(null)
    const { data } = await supabase.from('itinerary').select('*').order('date').order('time')
    if (data) setItems(data)
  }

  async function handleDelete(id) {
    await supabase.from('itinerary').delete().eq('id', id)
    setItems(items.filter((i) => i.id !== id))
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-[#2A2118] mb-6">📅 Itinerary</h1>

      {!supabase && (
        <p className="text-[#B91C1C] bg-red-50 p-3 rounded-lg mb-4 text-sm">
          Supabase not connected — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
        </p>
      )}

      {TRIP_DATES.map((date) => {
        const dayItems = items.filter((i) => i.date === date)
        return (
          <div key={date} className="mb-8">
            <h2 className="font-display text-xl font-bold text-[#78350F] mb-3 border-b border-[#78350F]/20 pb-1">
              {formatDate(date)}
            </h2>
            {dayItems.length === 0 && (
              <p className="text-[#78350F]/50 text-sm italic mb-2">No items yet</p>
            )}
            <div className="space-y-2 mb-3">
              {dayItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3 bg-white/50 rounded-lg p-3 border border-[#78350F]/10">
                  {item.time && (
                    <span className="text-sm font-mono font-bold text-[#C2410C] whitespace-nowrap mt-0.5">
                      {item.time}
                    </span>
                  )}
                  <span className="flex-1 text-[#2A2118]">{item.description}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditing({ id: item.id, date: item.date, time: item.time || '', description: item.description })}
                      className="text-xs text-[#D97706] hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-xs text-[#B91C1C] hover:underline"
                    >
                      Del
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setEditing({ date, time: '', description: '' })}
              className="text-sm text-[#C2410C] font-medium hover:underline"
            >
              + Add item
            </button>
          </div>
        )
      })}

      {/* Edit/Add Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-display text-lg font-bold text-[#2A2118] mb-4">
              {editing.id ? 'Edit Item' : 'Add Item'} — {formatDate(editing.date)}
            </h3>
            <label className="block text-sm font-medium text-[#78350F] mb-1">Time (optional)</label>
            <input
              type="text"
              placeholder="e.g. 9:00 AM"
              value={editing.time}
              onChange={(e) => setEditing({ ...editing, time: e.target.value })}
              className="w-full border border-[#78350F]/30 rounded-lg px-3 py-2 mb-3 text-sm"
            />
            <label className="block text-sm font-medium text-[#78350F] mb-1">Description</label>
            <textarea
              placeholder="What's happening?"
              value={editing.description}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              className="w-full border border-[#78350F]/30 rounded-lg px-3 py-2 mb-4 text-sm"
              rows={3}
              autoFocus
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
