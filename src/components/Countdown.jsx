import { useState, useEffect } from 'react'

const FESTIVAL_DATE = new Date('2026-10-17T09:00:00-04:00') // 9am Eastern

function getTimeLeft() {
  const now = new Date()
  const diff = FESTIVAL_DATE - now

  if (diff <= 0) return null // Festival has started!

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return { days, hours, minutes, seconds }
}

function Unit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-[#2A1F14] border-2 border-[#78350F] rounded-xl px-4 py-3 min-w-[72px] text-center shadow-lg">
        <span className="font-display text-4xl font-bold text-[#D97706] tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-[#78350F] text-xs mt-1 uppercase tracking-wider font-medium">
        {label}
      </span>
    </div>
  )
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft)

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!timeLeft) {
    return (
      <div className="text-center py-4">
        <p className="font-display text-2xl text-[#D97706] font-bold animate-bounce">
          🐛 The festival is HERE! 🐛
        </p>
      </div>
    )
  }

  return (
    <div className="text-center">
      <p className="text-[#D97706] text-sm uppercase tracking-widest font-medium mb-3">
        Countdown to Woolly Worm Fest
      </p>
      <div className="flex items-end justify-center gap-3">
        <Unit value={timeLeft.days} label="days" />
        <span className="font-display text-3xl text-[#D97706] mb-4 font-bold">:</span>
        <Unit value={timeLeft.hours} label="hrs" />
        <span className="font-display text-3xl text-[#D97706] mb-4 font-bold">:</span>
        <Unit value={timeLeft.minutes} label="min" />
        <span className="font-display text-3xl text-[#D97706] mb-4 font-bold">:</span>
        <Unit value={timeLeft.seconds} label="sec" />
      </div>
      <p className="text-[#78350F] text-xs mt-2">Oct 17–18, 2026 · Banner Elk, NC</p>
    </div>
  )
}
