import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getFamily } from '../lib/family'
import { FAMILIES } from '../lib/tripConfig'
import FamilyBadge from '../components/FamilyBadge'

const DEFAULT_ITEMS = [
  { category: 'Clothing', items: ['Fleece jacket', 'Rain jacket', 'Beanie / warm hat', 'Hiking shoes', 'Warm socks (3+ pairs)', 'Long pants', 'Layers for cool mornings'] },
  { category: 'Toiletries', items: ['Toothbrush & toothpaste', 'Sunscreen', 'Lip balm', 'Medications', 'First aid basics'] },
  { category: 'Gear', items: ['Phone charger', 'Water bottle', 'Daypack / backpack', 'Sunglasses', 'Camera'] },
  { category: 'Misc', items: ['Snacks for the drive', 'Cash for festival', 'Board games / cards', 'Blanket for chilly evenings'] },
]

export default function Packing() {
  const [items, setItems] = useState([])
  const [selectedFamily, setSelectedFamily] = useState(getFamily() || FAMILIES[0])
  const [newItem, setNewItem] = useState('')
  const [newCategory, setNewCategory] = useState('Misc')
  const myFamily = getFamily()
  const isOwner = selectedFamily === myFamily

  async function loadItems() {
    if (!supabase) return
    const { data } = await supabase.from('packing_lists').select('*').eq('family_name', selectedFamily).order('category').order('item')
    if (data) setItems(data)
  }

  useEffect(() => {
    loadItems()
    if (!supabase) return
    const channel = supabase.channel(`packing-${selectedFamily}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'packing_lists', filter: `family_name=eq.${selectedFamily}` }, () => loadItems())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [selectedFamily])

  async function seedDefaults() {
    if (!supabase) return
    const rows = DEFAULT_ITEMS.flatMap((cat) =>
      cat.items.map((item) => ({
        family_name: selectedFamily,
        item,
        category: cat.category,
        checked: false,
        updated_at: new Date().toISOString(),
      }))
    )
    await supabase.from('packing_lists').insert(rows)
    loadItems()
  }

  async function toggleItem(id, checked) {
    if (!isOwner) return
    await supabase.from('packing_lists').update({ checked: !checked, updated_at: new Date().toISOString() }).eq('id', id)
    setItems(items.map((i) => i.id === id ? { ...i, checked: !checked } : i))
  }

  async function addItem() {
    if (!newItem.trim() || !supabase) return
    await supabase.from('packing_lists').insert({
      family_name: selectedFamily,
      item: newItem.trim(),
      category: newCategory,
      checked: false,
      updated_at: new Date().toISOString(),
    })
    setNewItem('')
    loadItems()
  }

  async function deleteItem(id) {
    if (!isOwner) return
    await supabase.from('packing_lists').delete().eq('id', id)
    setItems(items.filter((i) => i.id !== id))
  }

  // Group by category
  const categories = [...new Set(items.map((i) => i.category || 'Misc'))]
  const grouped = categories.map((cat) => ({
    category: cat,
    items: items.filter((i) => (i.category || 'Misc') === cat),
  }))

  const checkedCount = items.filter((i) => i.checked).length
  const totalCount = items.length

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-[#2A2118] mb-2">🎒 Packing Lists</h1>
      <p className="text-[#78350F] text-sm mb-4">Each family manages their own list. View others for inspiration!</p>

      {/* Family tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {FAMILIES.map((f) => (
          <button
            key={f}
            onClick={() => setSelectedFamily(f)}
            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
              selectedFamily === f ? 'bg-[#C2410C] text-white' : 'bg-white/50 text-[#78350F] hover:bg-white/70'
            }`}
          >
            {f} {f === myFamily && '(you)'}
          </button>
        ))}
      </div>

      {!supabase && (
        <p className="text-[#B91C1C] bg-red-50 p-3 rounded-lg mb-4 text-sm">Supabase not connected.</p>
      )}

      {items.length === 0 ? (
        <div className="bg-white/50 rounded-xl p-8 border border-[#78350F]/10 text-center">
          <p className="text-[#78350F] mb-4">No packing list yet for the <strong>{selectedFamily}</strong>.</p>
          {isOwner && (
            <button
              onClick={seedDefaults}
              className="px-6 py-3 bg-[#C2410C] text-white rounded-lg font-bold hover:bg-[#B91C1C] transition-colors"
            >
              Start with suggested items
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-[#78350F] mb-1">
              <span>{checkedCount} of {totalCount} packed</span>
              <span>{totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0}%</span>
            </div>
            <div className="h-2 bg-[#78350F]/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#15803D] rounded-full transition-all"
                style={{ width: `${totalCount > 0 ? (checkedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>

          {grouped.map(({ category, items: catItems }) => (
            <div key={category} className="mb-6">
              <h3 className="text-sm font-bold text-[#78350F] uppercase tracking-wide mb-2">{category}</h3>
              <div className="space-y-1">
                {catItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 bg-white/50 rounded-lg px-3 py-2 border border-[#78350F]/10">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleItem(item.id, item.checked)}
                      disabled={!isOwner}
                      className="w-4 h-4 accent-[#15803D]"
                    />
                    <span className={`flex-1 text-sm ${item.checked ? 'line-through text-[#78350F]/40' : 'text-[#2A2118]'}`}>
                      {item.item}
                    </span>
                    {isOwner && (
                      <button onClick={() => deleteItem(item.id)} className="text-xs text-[#B91C1C]/60 hover:text-[#B91C1C]">
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Add item */}
          {isOwner && (
            <div className="flex gap-2 mt-4">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="border border-[#78350F]/30 rounded-lg px-2 py-2 text-sm bg-white"
              >
                {['Clothing', 'Toiletries', 'Gear', 'Misc'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Add item..."
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addItem()}
                className="flex-1 border border-[#78350F]/30 rounded-lg px-3 py-2 text-sm"
              />
              <button
                onClick={addItem}
                className="px-4 py-2 bg-[#C2410C] text-white rounded-lg text-sm font-bold"
              >
                Add
              </button>
            </div>
          )}
        </>
      )}

      {!isOwner && items.length > 0 && (
        <p className="text-center text-[#78350F]/50 text-xs mt-4 italic">
          This is the {selectedFamily}&apos; list — read-only for you.
        </p>
      )}
    </div>
  )
}
