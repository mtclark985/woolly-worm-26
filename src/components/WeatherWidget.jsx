import { useState, useEffect } from 'react'
import { TRIP_START, TRIP_END, FESTIVAL_LAT, FESTIVAL_LON, getTripDates, formatDate } from '../lib/tripConfig'

// WMO weather code → emoji
function wmoEmoji(code) {
  if (code === 0) return '☀️'
  if (code <= 2) return '🌤️'
  if (code === 3) return '☁️'
  if (code === 45 || code === 48) return '🌫️'
  if (code >= 51 && code <= 67) return '🌧️'
  if (code >= 71 && code <= 77) return '🌨️'
  if (code >= 80 && code <= 82) return '🌧️'
  if (code >= 95) return '⛈️'
  return '🌤️'
}

export default function WeatherWidget() {
  const [forecast, setForecast] = useState(null)
  const [tooFarOut, setTooFarOut] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    const now = new Date()
    const tripStart = new Date(TRIP_START + 'T00:00:00')
    const daysUntil = Math.ceil((tripStart - now) / (1000 * 60 * 60 * 24))

    if (daysUntil > 16) {
      setTooFarOut(true)
      return
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${FESTIVAL_LAT}&longitude=${FESTIVAL_LON}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&temperature_unit=fahrenheit&timezone=America/New_York&start_date=${TRIP_START}&end_date=${TRIP_END}`

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (!data.daily) { setTooFarOut(true); return }
        const days = data.daily.time.map((date, i) => ({
          date,
          high: Math.round(data.daily.temperature_2m_max[i]),
          low: Math.round(data.daily.temperature_2m_min[i]),
          precip: data.daily.precipitation_probability_max[i],
          code: data.daily.weather_code[i],
        }))
        setForecast(days)
      })
      .catch(() => setError(true))
  }, [])

  if (error) return null

  if (tooFarOut) {
    return (
      <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 text-center border border-[#78350F]/20">
        <p className="text-[#78350F] font-medium">
          🌤️ Forecast available 16 days before the trip.
        </p>
        <p className="text-[#78350F]/60 text-sm mt-1">
          Banner Elk sits at 3,700 ft — expect anything from 65°F sunny to 35°F frosty in October!
        </p>
      </div>
    )
  }

  if (!forecast) return null

  return (
    <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-[#78350F]/20">
      <h3 className="font-display font-bold text-[#2A2118] text-lg mb-3 text-center">
        🌤️ Banner Elk Forecast
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {forecast.map((day) => (
          <div key={day.date} className="bg-white/60 rounded-lg p-3 text-center">
            <p className="text-xs font-medium text-[#78350F]">{formatDate(day.date)}</p>
            <p className="text-2xl my-1">{wmoEmoji(day.code)}</p>
            <p className="text-sm font-bold text-[#2A2118]">
              {day.high}° / {day.low}°
            </p>
            <p className="text-xs text-[#78350F]">{day.precip}% rain</p>
          </div>
        ))}
      </div>
    </div>
  )
}
