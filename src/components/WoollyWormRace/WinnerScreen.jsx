import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import Worm from './Worm'

// 13 weeks of winter — alternating brown/black, lighter = milder, darker = colder
const WEEK_LABELS = [
  'Late Oct', 'Early Nov', 'Mid Nov', 'Late Nov',
  'Early Dec', 'Mid Dec', 'Late Dec', 'Early Jan',
  'Mid Jan', 'Late Jan', 'Early Feb', 'Mid Feb', 'Late Feb',
]

function generateForecast() {
  // Brown/tan shades = mild, dark/black = cold
  const mild = ['#D4A373', '#C9A96E', '#B5835A', '#C8A882']
  const cold = ['#2D1B0E', '#1A0F07', '#3D2415', '#261609']
  return Array.from({ length: 13 }, () =>
    Math.random() > 0.5 ? mild[Math.floor(Math.random() * mild.length)] : cold[Math.floor(Math.random() * cold.length)]
  )
}

export default function WinnerScreen({ winner, onReset }) {
  const forecast = useRef(generateForecast()).current
  const hasLaunched = useRef(false)

  useEffect(() => {
    if (hasLaunched.current) return
    hasLaunched.current = true

    // Confetti burst
    const end = Date.now() + 3000
    const colors = ['#C2410C', '#D97706', '#B91C1C', '#15803D', '#F5E6D3', '#DB2777']

    function burst() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      })
      if (Date.now() < end) requestAnimationFrame(burst)
    }
    burst()

    // Final big burst
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.6 },
      colors,
    })
  }, [])

  return (
    <div className="flex flex-col items-center gap-6 py-6 animate-bounce-in">
      {/* Trophy header */}
      <div className="text-center">
        <div className="text-5xl mb-2">🏆</div>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-[#D97706] leading-tight">
          {winner.wormName}
        </h2>
        <p className="text-[#FEF3C7] mt-1 text-lg">
          Wins the 2026 Family Trip Race!
        </p>
        <p className="text-[#78350F] text-sm mt-1">
          Worm raced by: <span className="text-[#D97706] font-semibold">{winner.kid}</span>
        </p>
      </div>

      {/* Worm avatar */}
      <div className="flex flex-col items-center">
        {winner.photo ? (
          <img
            src={winner.photo}
            alt={winner.kid}
            className="w-20 h-20 rounded-full border-4 object-cover"
            style={{ borderColor: winner.color }}
          />
        ) : (
          <div
            className="w-20 h-20 rounded-full border-4 flex items-center justify-center text-2xl font-bold font-display"
            style={{ backgroundColor: winner.color, borderColor: winner.color, color: winner.textColor }}
          >
            {winner.kid[0]}
          </div>
        )}
        <div className="mt-2">
          <Worm color={winner.color} progress={1} isWinner size={36} />
        </div>
      </div>

      {/* Winter forecast */}
      <div className="w-full max-w-md bg-[#2A1F14] border-2 border-[#78350F] rounded-xl p-4">
        <p className="text-[#D97706] text-sm font-bold mb-1 text-center">
          🌡️ {winner.wormName}&apos;s 13-segment winter forecast for the 2026–27 season:
        </p>
        <div className="flex gap-1 mt-3 mb-2">
          {forecast.map((color, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-sm border border-black/20"
                style={{ backgroundColor: color, height: 28 }}
                title={WEEK_LABELS[i]}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[8px] text-[#78350F] mt-1">
          <span>← Late Oct</span>
          <span>Late Feb →</span>
        </div>
        <div className="flex gap-3 mt-2 justify-center text-xs text-[#78350F]">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm inline-block bg-[#D4A373]" /> Mild
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm inline-block bg-[#1A0F07]" /> Cold
          </span>
        </div>
      </div>

      <button
        onClick={onReset}
        className="bg-[#2A1F14] border-2 border-[#D97706] hover:bg-[#D97706] hover:text-[#1C1410] text-[#D97706] font-bold py-3 px-8 rounded-xl transition-all text-lg font-display"
      >
        🐛 Race Again
      </button>
    </div>
  )
}
