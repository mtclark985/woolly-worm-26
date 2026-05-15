import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import FamilyBadge from './FamilyBadge'
import { getFamily, clearFamily } from '../lib/family'

const NAV_LINKS = [
  { to: '/', label: '🏠 Home' },
  { to: '/itinerary', label: '📅 Itinerary' },
  { to: '/meals', label: '🍳 Meals' },
  { to: '/house', label: '🏔️ House' },
  { to: '/packing', label: '🎒 Packing' },
  { to: '/weather', label: '🌤️ Weather' },
  { to: '/travel', label: '🚗 Travel' },
  { to: '/map', label: '🗺️ Map' },
  { to: '/board', label: '💬 Messages' },
  { to: '/gallery', label: '📸 Gallery' },
]

export default function Layout({ children, family, onSwitchFamily }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(to bottom, #C8D8E8 0%, #EFE3CF 45%, #FEF3C7 100%)',
    }}>
      {/* Header bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-4 py-2 bg-[#2A1F14]/90 backdrop-blur-sm">
        <Link to="/" className="flex items-center gap-2 text-[#FEF3C7] font-display font-bold text-lg">
          🐛 WW26
        </Link>
        <div className="flex items-center gap-3">
          <FamilyBadge family={family} small />
          <button
            onClick={() => setOpen(true)}
            className="text-[#FEF3C7] text-2xl leading-none p-1"
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Slide-out menu */}
      {open && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)} />
          <div className="fixed top-0 right-0 z-50 h-full w-72 bg-[#2A1F14] shadow-2xl p-6 overflow-y-auto">
            <button
              onClick={() => setOpen(false)}
              className="text-[#FEF3C7] text-2xl absolute top-4 right-4"
              aria-label="Close menu"
            >
              ✕
            </button>
            <div className="mt-8 space-y-1">
              {NAV_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-lg transition-colors ${
                    location.pathname === to
                      ? 'bg-[#78350F] text-[#FEF3C7] font-bold'
                      : 'text-[#D97706] hover:bg-[#78350F]/30'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
            <div className="mt-8 pt-4 border-t border-[#78350F]/40">
              <p className="text-[#78350F] text-xs mb-2">Logged in as</p>
              <FamilyBadge family={family} />
              <button
                onClick={() => {
                  clearFamily()
                  onSwitchFamily()
                  setOpen(false)
                }}
                className="block mt-3 text-[#D97706] text-sm underline"
              >
                Switch family
              </button>
            </div>
          </div>
        </>
      )}

      {/* Page content */}
      {children}
    </div>
  )
}
