import { useState } from 'react'

// The correct password is set via VITE_SITE_PASSWORD env var.
// It's stored in sessionStorage so you only type it once per browser session.
const STORAGE_KEY = 'woolly_worm_auth'
const CORRECT_PASSWORD = import.meta.env.VITE_SITE_PASSWORD

export default function PasswordGate({ children }) {
  const [authed, setAuthed] = useState(() => {
    // If no password is configured (local dev), skip the gate entirely
    if (!CORRECT_PASSWORD) return true
    return sessionStorage.getItem(STORAGE_KEY) === 'true'
  })
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  if (authed) return children

  function handleSubmit(e) {
    e.preventDefault()
    if (input === CORRECT_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, 'true')
      setAuthed(true)
    } else {
      setError(true)
      setShake(true)
      setInput('')
      setTimeout(() => setShake(false), 600)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1C1410] px-4">
      <div
        className={`w-full max-w-sm bg-[#2A1F14] border-2 border-[#78350F] rounded-2xl p-8 shadow-2xl text-center transition-all ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
        style={shake ? { animation: 'shake 0.5s ease-in-out' } : {}}
      >
        <div className="text-6xl mb-4">🐛</div>
        <h1 className="font-display text-3xl font-bold text-[#FEF3C7] mb-2">
          Woolly Worm Fest 2026
        </h1>
        <p className="text-[#D97706] text-sm mb-6">Family trip access only</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Enter the secret password"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(false) }}
            className="w-full bg-[#1C1410] border-2 border-[#78350F] rounded-lg px-4 py-3 text-[#FEF3C7] placeholder-[#78350F] focus:outline-none focus:border-[#D97706] transition-colors text-center"
            autoFocus
          />
          {error && (
            <p className="text-red-400 text-sm">Wrong password — try again!</p>
          )}
          <button
            type="submit"
            className="w-full bg-[#C2410C] hover:bg-[#B91C1C] text-white font-bold py-3 px-6 rounded-lg transition-colors font-display text-lg"
          >
            Let me in 🍂
          </button>
        </form>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  )
}
