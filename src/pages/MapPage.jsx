import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { FAMILY_COLORS } from '../lib/tripConfig'

// Points of interest
const PINS = [
  { name: 'Beech Mountain (Lodging Area)', lat: 36.1868, lon: -81.8762, emoji: '🏠' },
  { name: 'Woolly Worm Festival', lat: 36.1632, lon: -81.8712, desc: '185 Azalea Cir SE, Banner Elk, NC', emoji: '🐛' },
  { name: 'Grandfather Mountain', lat: 36.0996, lon: -81.8328, emoji: '⛰️' },
  { name: 'Sugar Mountain', lat: 36.1207, lon: -81.8698, emoji: '🎿' },
  { name: 'Downtown Banner Elk', lat: 36.1632, lon: -81.8715, emoji: '🏘️' },
]

export default function MapPage() {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [familyPins, setFamilyPins] = useState([])

  async function loadFamilyPins() {
    if (!supabase) return
    const { data } = await supabase.from('travel_status').select('family_name, current_lat, current_lon, status')
    if (data) setFamilyPins(data.filter((d) => d.current_lat && d.current_lon))
  }

  useEffect(() => {
    loadFamilyPins()
  }, [])

  useEffect(() => {
    if (mapInstanceRef.current) return // already initialized

    // Dynamically load Leaflet CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    import('leaflet').then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return

      const map = L.map(mapRef.current).setView([36.1632, -81.8712], 13)
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map)

      // POI markers
      PINS.forEach((pin) => {
        L.marker([pin.lat, pin.lon])
          .addTo(map)
          .bindPopup(`<b>${pin.emoji} ${pin.name}</b>${pin.desc ? `<br>${pin.desc}` : ''}`)
      })

      // Family pins
      familyPins.forEach((fp) => {
        const colors = FAMILY_COLORS[fp.family_name] || { bg: '#78350F' }
        const icon = L.divIcon({
          html: `<div style="background:${colors.bg};color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,0.3)">${fp.family_name[0]}</div>`,
          className: '',
          iconSize: [28, 28],
        })
        L.marker([fp.current_lat, fp.current_lon], { icon })
          .addTo(map)
          .bindPopup(`<b>${fp.family_name}</b>`)
      })
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [familyPins])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-[#2A2118] mb-2">🗺️ Area Map</h1>
      <p className="text-[#78350F] text-sm mb-4">Beech Mountain, Banner Elk, and nearby points of interest.</p>

      <div
        ref={mapRef}
        className="w-full rounded-xl overflow-hidden border border-[#78350F]/20 shadow-lg"
        style={{ height: '60vh', minHeight: 350 }}
      />

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {PINS.map((pin) => (
          <div key={pin.name} className="bg-white/50 rounded-lg p-3 border border-[#78350F]/10 text-sm">
            <span className="font-bold text-[#2A2118]">{pin.emoji} {pin.name}</span>
            {pin.desc && <p className="text-[#78350F] text-xs mt-0.5">{pin.desc}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
