import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getTripDates, formatDate } from '../lib/tripConfig'
import { getFamily } from '../lib/family'
import FamilyBadge from '../components/FamilyBadge'

const TRIP_DATES = getTripDates()
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner']
const MEAL_LABELS = { breakfast: '🌅 Breakfast', lunch: '☀️ Lunch', dinner: '🌙 Dinner' }

export default function Meals() {
  const [meals, setMeals] = useState([])
  const [editing, setEditing] = useState(null)
  const family = getFamily()

  async function loadMeals() {
    if (!supabase) return
    const { data } = await supabase.from('meals').select('*')
    if (data) setMeals(data)
  }

  useEffect(() => {
    loadMeals()
    if (!supabase) return

    const channel = supabase.channel('meals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meals' }, () => loadMeals())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  function getMeal(date, mealType) {
    return meals.find((m) => m.date === date && m.meal_type === mealType)
  }

  async function handleSave() {
    if (!editing) return
    const existing = getMeal(editing.date, editing.meal_type)
    const row = {
      date: editing.date,
      meal_type: editing.meal_type,
      claimed_by: editing.claimed_by || family,
      description: editing.description || null,
      notes: editing.notes || null,
      updated_at: new Date().toISOString(),
    }
    if (existing) {
      await supabase.from('meals').update(row).eq('id', existing.id)
    } else {
      await supabase.from('meals').insert(row)
    }
    setEditing(null)
    loadMeals()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-[#2A2118] mb-2">🍳 Meal Sign-Up</h1>
      <p className="text-[#78350F] text-sm mb-6">Claim a meal slot so we don't end up with 4 breakfasts and no dinner.</p>

      {!supabase && (
        <p className="text-[#B91C1C] bg-red-50 p-3 rounded-lg mb-4 text-sm">
          Supabase not connected.
        </p>
      )}

      {TRIP_DATES.map((date) => (
        <div key={date} className="mb-8">
          <h2 className="font-display text-xl font-bold text-[#78350F] mb-3 border-b border-[#78350F]/20 pb-1">
            {formatDate(date)}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {MEAL_TYPES.map((type) => {
              const meal = getMeal(date, type)
              return (
                <div
                  key={type}
                  className="bg-white/50 rounded-xl p-4 border border-[#78350F]/10"
                >
                  <h3 className="text-sm font-bold text-[#78350F] mb-2">{MEAL_LABELS[type]}</h3>
                  {meal && meal.claimed_by ? (
                    <div>
                      <FamilyBadge family={meal.claimed_by} small />
                      {meal.description && (
                        <p className="text-[#2A2118] text-sm mt-2">{meal.description}</p>
                      )}
                      {meal.notes && (
                        <p className="text-[#78350F]/60 text-xs mt-1 italic">{meal.notes}</p>
                      )}
                      <button
                        onClick={() => setEditing({
                          date, meal_type: type,
                          claimed_by: meal.claimed_by,
                          description: meal.description || '',
                          notes: meal.notes || '',
                        })}
                        className="text-xs text-[#D97706] hover:underline mt-2"
                      >
                        Edit
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditing({
                        date, meal_type: type,
                        claimed_by: family,
                        description: '',
                        notes: '',
                      })}
                      className="w-full py-2 px-3 border-2 border-dashed border-[#78350F]/30 rounded-lg text-sm text-[#78350F] hover:border-[#C2410C] hover:text-[#C2410C] transition-colors"
                    >
                      Sign up to cook
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-display text-lg font-bold text-[#2A2118] mb-1">
              {MEAL_LABELS[editing.meal_type]}
            </h3>
            <p className="text-sm text-[#78350F] mb-4">{formatDate(editing.date)}</p>

            <label className="block text-sm font-medium text-[#78350F] mb-1">Family</label>
            <div className="mb-3">
              <FamilyBadge family={editing.claimed_by} />
            </div>

            <label className="block text-sm font-medium text-[#78350F] mb-1">What are you making?</label>
            <textarea
              placeholder="e.g. Pancakes, bacon, fresh fruit"
              value={editing.description}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              className="w-full border border-[#78350F]/30 rounded-lg px-3 py-2 mb-3 text-sm"
              rows={2}
              autoFocus
            />

            <label className="block text-sm font-medium text-[#78350F] mb-1">Notes (optional)</label>
            <textarea
              placeholder="e.g. Bringing the griddle, need someone to grab eggs"
              value={editing.notes}
              onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
              className="w-full border border-[#78350F]/30 rounded-lg px-3 py-2 mb-4 text-sm"
              rows={2}
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
