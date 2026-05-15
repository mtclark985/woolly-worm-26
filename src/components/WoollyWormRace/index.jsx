import { useState, useEffect, useRef, useCallback } from 'react'
import { RACERS } from './racers'
import {
  START_LINES, EARLY_LEAD_LINES, MID_RACE_LINES,
  LEAD_CHANGE_LINES, FINAL_STRETCH_LINES, WINNER_LINES, pickLine,
} from './commentary'
import { useSounds } from './useSounds'
import { WIN_PROGRESS, STRING_HEIGHT } from './raceConfig'
import RaceTrack from './RaceTrack'
import CommentaryWithAdam from './CommentaryWithAdam'
import WinnerScreen from './WinnerScreen'

const PHASE = {
  INTRO: 'intro',
  COUNTDOWN: 'countdown',
  RACING: 'racing',
  FINISHED: 'finished',
}

// Generate a random speed profile for one worm.
// Steps are pre-computed so win detection just reads an array — frame-rate independent.
// Progress is capped at WIN_PROGRESS (head at finish line) rather than 1.0.
function generateRaceProfile() {
  const steps = 80  // plenty of steps; race ends when head hits the line, not at step 80
  let pos = 0
  return Array.from({ length: steps }, () => {
    const inc = Math.random() * 0.028 + 0.004  // 0.4%–3.2% per tick (jittery)
    pos = Math.min(WIN_PROGRESS, pos + inc)     // cap at finish line, not 1.0
    return pos
  })
}

export default function WoollyWormRace() {
  const [phase, setPhase] = useState(PHASE.INTRO)
  const [positions, setPositions] = useState(RACERS.map(() => 0))
  const [commentary, setCommentary] = useState([])
  const [winner, setWinner] = useState(null)
  const [countdownText, setCountdownText] = useState('')

  const profilesRef = useRef(null)
  const tickRef = useRef(0)
  const positionsRef = useRef(RACERS.map(() => 0))
  const raceFinishedRef = useRef(false)   // freeze flag — set true the moment a winner is found
  const raceIntervalRef = useRef(null)
  const commentaryIntervalRef = useRef(null)
  const prevLeaderRef = useRef(null)

  const { playCountdown, startCrowd, stopCrowd, playWinner, toggleMute, muted } = useSounds()

  const addComment = useCallback((line) => {
    setCommentary((prev) => [...prev.slice(-40), line])
  }, [])

  function startRace() {
    const zeros = RACERS.map(() => 0)
    setPositions(zeros)
    positionsRef.current = zeros
    raceFinishedRef.current = false
    setCommentary([])
    setWinner(null)
    tickRef.current = 0
    prevLeaderRef.current = null

    profilesRef.current = RACERS.map(() => generateRaceProfile())
    setPhase(PHASE.COUNTDOWN)
    playCountdown()  // inside user-gesture handler — satisfies iOS AudioContext requirement

    const steps = ['On your mark...', 'Get set...', '🐛 GO! 🐛']
    let i = 0
    setCountdownText(steps[0])
    addComment(pickLine(START_LINES))

    const cdInterval = setInterval(() => {
      i++
      if (i < steps.length) {
        setCountdownText(steps[i])
      } else {
        clearInterval(cdInterval)
        setCountdownText('')
        setPhase(PHASE.RACING)
        startCrowd()
        runRace()
      }
    }, 900)
  }

  function runRace() {
    addComment(pickLine(EARLY_LEAD_LINES, { leader: RACERS[0].wormName }))

    raceIntervalRef.current = setInterval(() => {
      // If already finished (e.g. this tick fired before clearInterval took effect), do nothing
      if (raceFinishedRef.current) return

      const tick = tickRef.current
      tickRef.current = tick + 1

      setPositions(() => {
        if (raceFinishedRef.current) return positionsRef.current  // frozen

        const profiles = profilesRef.current
        if (!profiles) return positionsRef.current

        const newPos = profiles.map(
          (profile) => profile[Math.min(tick, profile.length - 1)] ?? WIN_PROGRESS
        )
        positionsRef.current = newPos

        // Win condition: any worm's head has reached or crossed the finish line
        const done = newPos.some((p) => p >= WIN_PROGRESS)
        if (done) {
          raceFinishedRef.current = true  // freeze immediately — no more updates
          clearInterval(raceIntervalRef.current)
          clearInterval(commentaryIntervalRef.current)

          const winIdx = newPos.indexOf(Math.max(...newPos))
          const w = RACERS[winIdx]
          setWinner(w)
          addComment(pickLine(WINNER_LINES, { winner: w.wormName, kid: w.kid }))

          setTimeout(() => {
            playWinner()
            setPhase(PHASE.FINISHED)
          }, 500)
        }

        return newPos
      })
    }, 200)

    commentaryIntervalRef.current = setInterval(() => {
      if (raceFinishedRef.current) return
      const currentPos = positionsRef.current
      const leaderIdx = currentPos.indexOf(Math.max(...currentPos))
      const leader = RACERS[leaderIdx]
      const others = RACERS.filter((_, i) => i !== leaderIdx)
      const challenger = others[Math.floor(Math.random() * others.length)]

      if (prevLeaderRef.current && prevLeaderRef.current !== leader.id) {
        addComment(pickLine(LEAD_CHANGE_LINES, {
          worm: leader.wormName,
          leader: prevLeaderRef.current,
        }))
      } else {
        const max = Math.max(...currentPos)
        if (max > WIN_PROGRESS * 0.85) {
          addComment(pickLine(FINAL_STRETCH_LINES))
        } else {
          const randomWorm = RACERS[Math.floor(Math.random() * RACERS.length)]
          addComment(pickLine(MID_RACE_LINES, {
            worm: randomWorm.wormName,
            leader: leader.wormName,
            worm1: leader.wormName,
            worm2: challenger.wormName,
            lane: leaderIdx + 1,
          }))
        }
      }
      prevLeaderRef.current = leader.id
    }, 1800 + Math.random() * 700)
  }

  function reset() {
    clearInterval(raceIntervalRef.current)
    clearInterval(commentaryIntervalRef.current)
    stopCrowd()
    raceFinishedRef.current = false
    const zeros = RACERS.map(() => 0)
    positionsRef.current = zeros
    setPositions(zeros)
    setPhase(PHASE.INTRO)
    setCommentary([])
    setWinner(null)
    tickRef.current = 0
  }

  useEffect(() => {
    return () => {
      clearInterval(raceIntervalRef.current)
      clearInterval(commentaryIntervalRef.current)
      stopCrowd()
    }
  }, [])

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Header + mute toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-[#C2410C]">
            🐛 The Woolly Worm Race
          </h2>
          <p className="text-[#78350F] text-sm mt-0.5">
            Six worms. One string. One champion.
          </p>
        </div>
        <button
          onClick={toggleMute}
          className="text-xl p-2 rounded-lg hover:bg-[#78350F]/20 transition-colors"
          title={muted ? 'Unmute sounds' : 'Mute sounds'}
          aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* INTRO */}
      {phase === PHASE.INTRO && (
        <div className="space-y-4">
          <div className="bg-[#2A1F14] border-2 border-[#78350F] rounded-xl p-4 text-center">
            <p className="text-[#FEF3C7] italic text-sm leading-relaxed">
              &ldquo;Folks, this is the moment we&apos;ve all been waiting for.
              Six worms. One string. One champion. Take it away, Adam!&rdquo;
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {RACERS.map((racer) => (
              <div
                key={racer.id}
                className="flex flex-col items-center gap-1 p-2 bg-[#2A1F14] border border-[#78350F] rounded-lg"
              >
                {racer.avatarUrl ? (
                  <img
                    src={racer.avatarUrl}
                    alt={racer.kid}
                    className="w-10 h-10 rounded-full border-2 object-cover"
                    style={{ borderColor: racer.color }}
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold font-display"
                    style={{ backgroundColor: racer.color, borderColor: racer.color, color: racer.textColor }}
                  >
                    {racer.kid[0]}
                  </div>
                )}
                <span className="text-[#FEF3C7] text-xs font-bold font-display text-center leading-tight">
                  {racer.wormName}
                </span>
                <span className="text-[#78350F] text-xs">({racer.kid})</span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={startRace}
              className="w-full sm:w-auto bg-[#C2410C] hover:bg-[#B91C1C] text-white font-bold py-4 px-10 rounded-xl text-xl font-display transition-all hover:scale-105 active:scale-95 animate-pulse-glow shadow-lg"
            >
              🐛 START RACE
            </button>
          </div>
        </div>
      )}

      {/* COUNTDOWN / RACING */}
      {(phase === PHASE.COUNTDOWN || phase === PHASE.RACING) && (
        <div className="space-y-4">
          {countdownText && (
            <div className="text-center py-2">
              <span className="font-display text-3xl font-bold text-[#C2410C] animate-bounce-in">
                {countdownText}
              </span>
            </div>
          )}
          <RaceTrack racers={RACERS} positions={positions} winner={winner} />
          <CommentaryWithAdam lines={commentary} />
        </div>
      )}

      {/* FINISHED */}
      {phase === PHASE.FINISHED && winner && (
        <div className="space-y-4">
          <RaceTrack racers={RACERS} positions={positions} winner={winner} />
          <WinnerScreen winner={winner} onReset={reset} />
        </div>
      )}
    </div>
  )
}
