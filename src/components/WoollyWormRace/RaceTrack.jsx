import Worm from './Worm'
import { STRING_HEIGHT, WORM_SIZE, WORM_RACE_SEGMENTS } from './raceConfig'

export default function RaceTrack({ racers, positions, winner }) {
  return (
    <div className="relative w-full">
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
        <div className="bg-[#78350F] text-center py-2 px-2 border-b-2 border-[#C2410C]">
          <p className="font-display text-[#FEF3C7] font-bold text-xs sm:text-sm tracking-wider uppercase">
            🐛 2026 Family Trip Woolly Worm Championship 🐛
          </p>
        </div>

        {/* Race lanes — flex-1 on each lane so they share width proportionally */}
        <div
          className="flex items-end px-1 sm:px-2 py-4"
          style={{ height: STRING_HEIGHT + 80 }}
        >
          {racers.map((racer, idx) => {
            const progress = positions[idx] ?? 0
            const isLeader = !winner && positions.indexOf(Math.max(...positions)) === idx
            const isWin = winner?.id === racer.id
            const wormBottom = Math.round(progress * STRING_HEIGHT)

            return (
              <div
                key={racer.id}
                className="flex flex-col items-center gap-1 relative flex-1 min-w-0"
              >
                {/* Crown / trophy badge */}
                <div className="absolute top-0 left-0 right-0 text-center" style={{ zIndex: 2 }}>
                  {(isLeader || isWin) && (
                    <span className="text-xs">{isWin ? '🏆' : '👑'}</span>
                  )}
                </div>

                {/* String + worm */}
                <div
                  className="relative flex justify-center w-full"
                  style={{ height: STRING_HEIGHT }}
                >
                  {/* String */}
                  <div
                    className="absolute top-0 bottom-0 bg-[#D4A373] opacity-60"
                    style={{ width: 2, left: '50%', transform: 'translateX(-50%)' }}
                  />

                  {/* Finish line — at the very top of the string.
                      This is exactly where WIN_PROGRESS positions the worm head. */}
                  <div
                    className="absolute left-[-9999px] right-[-9999px] border-t-2 border-dashed border-[#D97706]"
                    style={{ top: 0, opacity: 0.75, zIndex: 1 }}
                  />

                  {/* Worm — bottom: wormBottom places it counting from the string bottom */}
                  <div
                    className="absolute"
                    style={{
                      bottom: wormBottom,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      // Instant position update — no CSS transition so freeze is truly instant
                      zIndex: 2,
                    }}
                  >
                    <div
                      style={{
                        animation:
                          progress > 0 && progress < 0.99
                            ? 'wiggle 0.35s ease-in-out infinite'
                            : 'none',
                      }}
                    >
                      <Worm
                        bodyColor={racer.wormBody}
                        bandColor={racer.wormBand}
                        progress={progress}
                        isWinner={isWin}
                        segments={WORM_RACE_SEGMENTS}
                        size={WORM_SIZE}
                      />
                    </div>
                  </div>
                </div>

                {/* Kid avatar + worm name */}
                <div className="flex flex-col items-center gap-0.5 mt-1 w-full px-0.5">
                  {racer.avatarUrl ? (
                    <img
                      src={racer.avatarUrl}
                      alt={racer.kid}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 object-cover"
                      style={{ borderColor: racer.color }}
                    />
                  ) : (
                    <div
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold font-display flex-shrink-0"
                      style={{
                        backgroundColor: racer.color,
                        borderColor: racer.color,
                        color: racer.textColor,
                      }}
                    >
                      {racer.kid[0]}
                    </div>
                  )}
                  <span
                    className="text-center font-display font-semibold leading-tight w-full"
                    style={{
                      fontSize: 8,
                      color: isWin ? '#D97706' : '#FEF3C7',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                    }}
                  >
                    {racer.wormName}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
