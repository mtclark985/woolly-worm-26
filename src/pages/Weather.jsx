import WeatherWidget from '../components/WeatherWidget'

export default function Weather() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-[#2A2118] mb-2">🌤️ Weather</h1>
      <p className="text-[#78350F] text-sm mb-6">
        Banner Elk, NC sits at 3,700 ft elevation — October weather can range from 65°F sunny to 35°F frosty.
        Pack layers!
      </p>
      <WeatherWidget />
    </div>
  )
}
