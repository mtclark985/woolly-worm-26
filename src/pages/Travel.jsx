import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getFamily } from '../lib/family'
import { FAMILIES, FAMILY_COLORS, CABIN_LOCATION } from '../lib/tripConfig'
import FamilyBadge from '../components/FamilyBadge'
import confetti from 'canvas-confetti'

const STATUS_CONFIG = {
  not_yet: { emoji: '🏠', label: 'Not yet', color: '#78350F' },
  on_the_way: { emoji: '🚗', label: 'On the way', color: '#D97706' },
  arrived: { emoji: '🏔️', label: 'Arrived', color: '#15803D' },
}

const STATUS_ORDER = { arrived: 0, on_the_way: 1, not_yet: 2 }

export default function Travel() {
  const [statuses, setStatuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [houseAddress, setHouseAddress] = useState(null)
  const myFamily = getFamily()

  async function loadStatuses() {
    if (!supabase) { setLoading(false); return }
    const { data } = await supabase.from('travel_status').select('*')
    if (data) {
      // Ensure all families have a row
      const existing = data.map((d) => d.family_name)
      const missing = FAMILIES.filter((f) => !existing.includes(f))
      if (missing.length > 0) {
        const rows = missing.map((f) => ({ family_name: f, status: 'not_yet', updated_at: new Date().toISOString() }))
        await supabase.from('travel_status').insert(rows)
        const { data: refreshed } = await supabase.from('travel_status').select('*')
        setStatuses(refreshed || [])
      } else {
        setStatuses(data)
      }
    }
    setLoading(false)
  }

  async function loadHouse() {
    if (!supabase) return
    const { data } = await supabase.from('house').select('address').limit(1).maybeSingle()
    if (data?.address) setHouseAddress(data.address)
  }

  useEffect(() => {
    loadStatuses()
    loadHouse()
    if (!supabase) return
    const channel = supabase.channel('travel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'travel_status' }, () => loadStatuses())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  // Check if all arrived for confetti
  useEffect(() => {
    if (statuses.length === FAMILIES.length && statuses.every((s) => s.status === 'arrived')) {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } })
    }
  }, [statuses])

  async function updateMyStatus(newStatus) {
    const mine = statuses.find((s) => s.family_name === myFamily)
    if (!mine) return
    await supabase.from('travel_status').update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    }).eq('id', mine.id)
    loadStatuses()
  }

  async function updateHometown(hometown) {
    const mine = statuses.find((s) => s.family_name === myFamily)
    if (!mine) return
    await supabase.from('travel_status').update({
      hometown,
      updated_at: new Date().toISOString(),
    }).eq('id', mine.id)
  }

  async function updateEta(etaText) {
    const mine = statuses.find((s) => s.family_name === myFamily)
    if (!mine) return
    await supabase.from('travel_status').update({
      eta_text: etaText,
      updated_at: new Date().toISOString(),
    }).eq('id', mine.id)
  }

  async function dropPin() {
    if (!navigator.geolocation) { alert('Geolocation not supported'); return }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const mine = statuses.find((s) => s.family_name === myFamily)
        if (!mine) return
        await supabase.from('travel_status').update({
          current_lat: pos.coords.latitude,
          current_lon: pos.coords.longitude,
          updated_at: new Date().toISOString(),
        }).eq('id', mine.id)
        loadStatuses()
      },
      (err) => alert('Could not get location: ' + err.message)
    )
  }

  const destination = houseAddress || CABIN_LOCATION

  function getDirectionsUrl() {
    const mine = statuses.find((s) => s.family_name === myFamily)
    let url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
    if (mine?.current_lat && mine?.current_lon) {
      url += `&origin=${mine.current_lat},${mine.current_lon}`
    }
    return url
  }

  const sorted = [...statuses].sort((a, b) => (STATUS_ORDER[a.status] ?? 2) - (STATUS_ORDER[b.status] ?? 2))
  const allArrived = statuses.length === FAMILIES.length && statuses.every((s) => s.status === 'arrived')

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-8 text-[#78350F]">Loading...</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-[#2A2118] mb-2">🚗 Travel Status</h1>
      <p className="text-[#78350F] text-sm mb-6">Update your status as you head to the mountains!</p>

      {allArrived && (
        <div className="bg-[#15803D]/10 border-2 border-[#15803D] rounded-xl p-6 text-center mb-6">
          <div className="text-4xl mb-2">🏔️🎉</div>
          <h2 className="font-display text-2xl font-bold text-[#15803D]">Squad Assembled!</h2>
          <p className="text-[#15803D] text-sm">Everyone made it. Let the woolly worm festivities begin!</p>
        </div>
      )}

      <div className="space-y-4">
        {sorted.map((s) => {
          const isMe = s.family_name === myFamily
          const cfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.not_yet

          return (
            <div key={s.id} className="bg-white/50 rounded-xl p-4 border border-[#78350F]/10">
              <div className="flex items-center gap-3 mb-3">
                <FamilyBadge family={s.family_name} />
                <span
                  className="text-sm font-bold px-2 py-1 rounded-full"
                  style={{ backgroundColor: cfg.color + '20', color: cfg.color }}
                >
                  {cfg.emoji} {cfg.label}
                </span>
              </div>

              {s.hometown && (
                <p className="text-sm text-[#78350F] mb-2">From {s.hometown}</p>
              )}

              {s.eta_text && (
                <p className="text-sm text-[#2A2118] mb-2 italic">{s.eta_text}</p>
              )}

              {s.updated_at && (
                <p className="text-xs text-[#78350F]/50 mb-3">
                  Updated {new Date(s.updated_at).toLocaleString()}
                </p>
              )}

              {isMe && (
                <div className="space-y-3 pt-2 border-t border-[#78350F]/10">
                  {/* Hometown if not set */}
                  {!s.hometown && (
                    <div>
                      <label className="text-xs font-medium text-[#78350F] mb-1 block">Your hometown</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Charlotte, NC"
                          className="flex-1 border border-[#78350F]/30 rounded-lg px-3 py-1.5 text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.target.value.trim()) {
                              updateHometown(e.target.value.trim())
                              loadStatuses()
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Status buttons */}
                  <div className="flex flex-wrap gap-2">
                    {s.status !== 'on_the_way' && (
                      <button
                        onClick={() => updateMyStatus('on_the_way')}
                        className="px-4 py-2 bg-[#D97706] text-white rounded-lg text-sm font-bold"
                      >
                        🚗 On the way!
                      </button>
                    )}
                    {s.status !== 'arrived' && (
                      <button
                        onClick={() => updateMyStatus('arrived')}
                        className="px-4 py-2 bg-[#15803D] text-white rounded-lg text-sm font-bold"
                      >
                        🏔️ We arrived!
                      </button>
                    )}
                    <button
                      onClick={dropPin}
                      className="px-4 py-2 bg-[#78350F] text-white rounded-lg text-sm font-bold"
                    >
                      📍 Drop pin
                    </button>
                    <a
                      href={getDirectionsUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[#0EA5E9] text-white rounded-lg text-sm font-bold inline-block"
                    >
                      🗺️ Get directions
                    </a>
                  </div>

                  {/* ETA note */}
                  {s.status === 'on_the_way' && (
                    <div>
                      <label className="text-xs font-medium text-[#78350F] mb-1 block">ETA / travel note</label>
                      <input
                        type="text"
                        placeholder="e.g. ETA 4:30pm — stopping for lunch"
                        defaultValue={s.eta_text || ''}
                        onBlur={(e) => updateEta(e.target.value.trim())}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') updateEta(e.target.value.trim())
                        }}
                        className="w-full border border-[#78350F]/30 rounded-lg px-3 py-1.5 text-sm"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
