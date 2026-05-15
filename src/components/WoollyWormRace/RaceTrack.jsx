import Worm from './Worm'

// String height in px — "~3 feet" in visual proportion on screen
const STRING_HEIGHT = 320

export default function RaceTrack({ racers, positions, phase, winner }) {
  return (
    <div className="relative w-full overflow-x-auto">
      {/* Cardboard backing */}
      <div
        className="relative mx-auto rounded-xl border-4 border-[#78350F] overflow-hidden"
        style={{
          background: 'linear-gradient(to bottom, #3D2415, #2A1F14)',
          maxWidth: 640,
          boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.6)',
        }}
      >
        {/* Top banner */}
        <div className="bg-[#78350F] text-center py-2 px-4 border-b-2 border-[#C2410C]">
          <p className="font-display text-[#FEF3C7] font-bold text-sm tracking-wider uppercase">
            🐛 2026 Family Trip Woolly Worm Championship 🐛
          </p>
        </div>

        {/* Race lanes */}
        <div
          className="flex justify-around items-end px-2 py-4"
          style={{ height: STRING_HEIGHT + 80 }}
        >
          {racers.map((racer, idx) => {
            const progress = positions[idx] ?? 0
            const isLeader = !winner && positions.indexOf(Math.max(...positions)) === idx
            const isWin = winner?.id === racer.id

            // Worm starts at bottom (progress=0) and climbs to top (progress=1)
            // translateY moves UP: at progress=0 → translateY(0), at progress=1 → translateY(-STRING_HEIGHT)
            const wormBottom = Math.round(progress * STRING_HEIGHT)

            return (
              <div key={racer.id} className="flex flex-col items-center gap-1 relative" style={{ width: 64 }}>
                {/* Lane label */}
                <div className="absolute top-0 left-0 right-0 text-center">
                  {(isLeader || isWin) && (
                    <span className="text-[#D97706] text-xs font-bold">
                      {isWin ? '🏆' : '👑'}
                    </span>
                  )}
                </div>

                {/* String + worm container */}
                <div
                  className="relative flex justify-center"
                  style={{ height: STRING_HEIGHT, width: 50 }}
                >
                  {/* The string */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-[#D4A373] opacity-60"
                    style={{ left: '50%', transform: 'translateX(-50%)' }}
                  />

                  {/* Worm — positioned from the bottom */}
                  <div
                    className="absolute"
                    style={{
                      bottom: wormBottom,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      transition: 'bottom 0.25s ease-out',
                    }}
                  >
                    <div
                      style={{
                        animation: progress > 0 && progress < 1 ? 'wiggle 0.35s ease-in-out infinite' : 'none',
                      }}
                    >
                      <Worm
                        bodyColor={racer.wormBody}
                        bandColor={racer.wormBand}
                        progress={progress}
                        isWinner={isWin}
                        segments={4}
                        size={32}
                      />
                    </div>
                  </div>
                </div>

                {/* Kid avatar + name */}
                <div className="flex flex-col items-center gap-0.5 mt-1">
                  {racer.avatarUrl ? (
                    <img
                      src={racer.avatarUrl}
                      alt={racer.kid}
                      className="w-8 h-8 rounded-full border-2 object-cover"
                      style={{ borderColor: racer.color }}
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold font-display"
                      style={{ backgroundColor: racer.color, borderColor: racer.color, color: racer.textColor }}
                    >
                      {racer.kid[0]}
                    </div>
                  )}
                  <span
                    className="text-center font-display font-semibold leading-tight"
                    style={{
                      fontSize: 9,
                      color: isWin ? '#D97706' : '#FEF3C7',
                      maxWidth: 56,
                      wordBreak: 'break-word',
                    }}
                  >
                    {racer.wormName}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Finish line */}
        <div
          className="absolute left-0 right-0 h-0.5 border-t-2 border-dashed border-[#D97706] opacity-50"
          style={{ top: 36 + 12 }}
        />
      </div>
    </div>
  )
}
