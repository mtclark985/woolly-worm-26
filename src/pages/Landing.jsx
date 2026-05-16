import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Countdown from '../components/Countdown'
import WoollyWormRace from '../components/WoollyWormRace'
import WeatherWidget from '../components/WeatherWidget'
import { supabase } from '../lib/supabase'
import { getTripDates } from '../lib/tripConfig'

function useQuickLinks() {
  const [data, setData] = useState({ meals: null, house: null, messages: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    let cancelled = false
    const timeout = setTimeout(() => { if (!cancelled) setLoading(false) }, 1000)

    Promise.allSettled([
      supabase.from('meals').select('id, claimed_by'),
      supabase.from('house').select('name, check_in, check_out').limit(1).maybeSingle(),
      supabase.from('house_candidates').select('id', { count: 'exact', head: true }),
      supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ]).then(([mealsRes, houseRes, candidatesRes, msgRes]) => {
      if (cancelled) return
      clearTimeout(timeout)
      const meals = mealsRes.status === 'fulfilled' ? mealsRes.value.data : null
      const house = houseRes.status === 'fulfilled' ? houseRes.value.data : null
      const candidateCount = candidatesRes.status === 'fulfilled' ? candidatesRes.value.count : 0
      const latestMsg = msgRes.status === 'fulfilled' ? msgRes.value.data : null
      setData({ meals, house, candidateCount, latestMsg })
      setLoading(false)
    })

    return () => { cancelled = true; clearTimeout(timeout) }
  }, [])

  return { data, loading }
}

function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function QuickLinks() {
  const { data, loading } = useQuickLinks()

  const tiles = [
    {
      emoji: '🍽️',
      title: 'Meal Planning',
      to: '/meals',
      preview: () => {
        const totalSlots = getTripDates().length * 3
        if (!data.meals) return null
        const claimed = data.meals.filter((m) => m.claimed_by).length
        if (claimed === 0) return 'Sign up to cook'
        return `${claimed} of ${totalSlots} slots claimed`
      },
    },
    {
      emoji: '🏔️',
      title: 'Our House',
      to: '/house',
      preview: () => {
        if (data.house && data.house.name) {
          let txt = data.house.name
          if (data.house.check_in) txt += ` · ${data.house.check_in}`
          return txt
        }
        if (data.candidateCount > 0) return `Not booked yet · ${data.candidateCount} candidate${data.candidateCount > 1 ? 's' : ''}`
        return 'Add your first candidate'
      },
    },
    {
      emoji: '💬',
      title: 'Messages',
      to: '/board',
      preview: () => {
        if (!data.latestMsg) return 'No messages yet'
        const body = data.latestMsg.body || ''
        const snippet = body.length > 40 ? body.slice(0, 40) + '...' : body
        return `'${snippet}' — ${data.latestMsg.family_name}, ${relativeTime(data.latestMsg.created_at)}`
      },
    },
  ]

  return (
    <section className="px-4 max-w-2xl mx-auto mb-10">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {tiles.map((tile) => (
          <Link
            key={tile.to}
            to={tile.to}
            className="block bg-white/50 border border-[#78350F]/10 rounded-xl p-4 hover:border-[#C2410C]/40 hover:shadow-md transition-all min-h-[80px]"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{tile.emoji}</span>
              <span className="font-display font-bold text-[#2A2118] text-sm">{tile.title}</span>
            </div>
            {loading ? (
              <div className="h-3 w-2/3 bg-[#78350F]/10 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-[#78350F] text-xs leading-snug">{tile.preview()}</p>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}

export default function Landing() {
  return (
    <>
      {/* Hero */}
      <header className="relative text-center px-4 pt-8 sm:pt-12 pb-6 sm:pb-8 overflow-hidden">
        {/* Leaf decorations */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
          <span className="absolute text-5xl opacity-20 top-4 left-4 rotate-12">🍂</span>
          <span className="absolute text-4xl opacity-15 top-8 right-8 -rotate-12">🍁</span>
          <span className="absolute text-3xl opacity-15 bottom-4 left-12 rotate-6">🍃</span>
          <span className="absolute text-3xl opacity-15 bottom-8 right-16 -rotate-6">🍂</span>
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="text-4xl sm:text-5xl mb-3">🐛</div>

          <h1 className="font-display font-bold text-[#2A2118] leading-tight mb-2" style={{ fontSize: 'clamp(1.75rem, 6vw, 3rem)' }}>
            Ms Eddie&apos;s Fan Club Goes to<br />
            <span className="text-[#C2410C]">Woolly Worm Fest 2026</span>
          </h1>

          <p className="text-[#C2410C] font-medium text-base md:text-lg mb-1">
            49th Annual · Banner Elk, NC · October 17–18, 2026
          </p>
          <p className="text-[#78350F] text-sm mb-8">
            Beech Mountain basecamp · 3 families · 6 kids · 1 champion worm 🏆
          </p>

          <Countdown />
        </div>
      </header>

      {/* Weather */}
      <div className="px-4 max-w-2xl mx-auto mb-6">
        <WeatherWidget />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 px-6 max-w-2xl mx-auto mb-8">
        <div className="flex-1 h-px bg-[#78350F] opacity-30" />
        <span className="text-[#78350F] text-xs uppercase tracking-widest font-medium">The Main Event</span>
        <div className="flex-1 h-px bg-[#78350F] opacity-30" />
      </div>

      {/* Race */}
      <main className="px-4 pb-8">
        <WoollyWormRace />
      </main>

      {/* Quick Links */}
      <div className="flex items-center gap-3 px-6 max-w-2xl mx-auto mb-6">
        <div className="flex-1 h-px bg-[#78350F] opacity-30" />
        <span className="text-[#78350F] text-xs uppercase tracking-widest font-medium">Quick Links</span>
        <div className="flex-1 h-px bg-[#78350F] opacity-30" />
      </div>
      <QuickLinks />

      {/* Footer */}
      <footer className="border-t border-[#78350F]/20 py-4 text-center">
        <p className="text-[#78350F] text-xs">
          🐛 Woolly Worm Fest 2026 · Family Trip App · Luca · Isla · Kameron · Kinze · Carter · Jack
        </p>
      </footer>
    </>
  )
}
