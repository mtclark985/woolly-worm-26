// Trip date constants — change these if dates shift
export const TRIP_START = '2026-10-16' // Friday arrival
export const TRIP_END = '2026-10-19'   // Monday departure
export const FESTIVAL_DATE = '2026-10-17' // Saturday festival day 1
export const CABIN_LOCATION = 'Beech Mountain, NC'

// Banner Elk festival site coords
export const FESTIVAL_LAT = 36.1632
export const FESTIVAL_LON = -81.8712

// Families
export const FAMILIES = ['Clarks', 'Boones', 'McLaughlins']

// Family colors for badges
export const FAMILY_COLORS = {
  Clarks: { bg: '#C2410C', text: '#fff' },
  Boones: { bg: '#15803D', text: '#fff' },
  McLaughlins: { bg: '#0EA5E9', text: '#fff' },
}

// Generate array of trip dates
export function getTripDates() {
  const dates = []
  const start = new Date(TRIP_START + 'T00:00:00')
  const end = new Date(TRIP_END + 'T00:00:00')
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d).toISOString().split('T')[0])
  }
  return dates
}

// Format a date string for display
export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}
