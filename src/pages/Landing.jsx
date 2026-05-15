import Countdown from '../components/Countdown'
import WoollyWormRace from '../components/WoollyWormRace'

export default function Landing() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(to bottom, #C8D8E8 0%, #EFE3CF 45%, #FEF3C7 100%)',
      }}
    >
      {/* Hero */}
      <header className="relative text-center px-4 pt-12 pb-8 overflow-hidden">
        {/* Leaf decorations */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
          <span className="absolute text-5xl opacity-20 top-4 left-4 rotate-12">🍂</span>
          <span className="absolute text-4xl opacity-15 top-8 right-8 -rotate-12">🍁</span>
          <span className="absolute text-3xl opacity-15 bottom-4 left-12 rotate-6">🍃</span>
          <span className="absolute text-3xl opacity-15 bottom-8 right-16 -rotate-6">🍂</span>
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="text-5xl mb-3">🐛</div>

          <h1 className="font-display font-bold text-[#2A2118] leading-tight mb-2" style={{ fontSize: 'clamp(1.75rem, 6vw, 3rem)' }}>
            {/* TODO: Replace with your actual group name */}
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

      {/* Divider */}
      <div className="flex items-center gap-3 px-6 max-w-2xl mx-auto mb-8">
        <div className="flex-1 h-px bg-[#78350F] opacity-30" />
        <span className="text-[#78350F] text-xs uppercase tracking-widest font-medium">The Main Event</span>
        <div className="flex-1 h-px bg-[#78350F] opacity-30" />
      </div>

      {/* Race */}
      <main className="px-4 pb-12">
        <WoollyWormRace />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#78350F]/20 py-4 text-center">
        <p className="text-[#78350F] text-xs">
          🐛 Woolly Worm Fest 2026 · Family Trip App · Luca · Isla · Kameron · Kinze · Carter · Jack
        </p>
      </footer>
    </div>
  )
}
