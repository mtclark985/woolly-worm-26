import { useRef, useState } from 'react'

// Sound strategy:
//   Crowd loop   → HTML Audio (/sounds/crowd.mp3, real recording)
//   Countdown    → Web Audio API oscillators (synthesized beeps + GO horn)
//   Winner horn  → Web Audio API oscillators (synthesized air horn)
//
// iOS Safari requires audio to be initiated inside a user-gesture handler.
// Solution for the crowd audio (which starts ~3 sec after the button click,
// inside a setInterval callback — NOT a user gesture):
//   primeCrowd() is called synchronously inside the Start Race click handler.
//   It calls audio.play() at volume 0, which "unlocks" the element on iOS.
//   startCrowd() (called from the timer) then just fades the volume up.
//
// If /sounds/crowd.mp3 fails to load, play() rejects silently — graceful degrade.

export function useSounds() {
  const acRef = useRef(null)          // Web Audio context for synth sounds
  const crowdAudioRef = useRef(null)  // HTML Audio element for crowd.mp3
  const crowdFadeRef = useRef(null)   // interval id for volume fade
  const [muted, setMuted] = useState(false)
  const mutedRef = useRef(false)

  // ── Web Audio helpers ──────────────────────────────────────────────────────

  function getAC() {
    try {
      if (!acRef.current) {
        acRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }
      if (acRef.current.state === 'suspended') acRef.current.resume()
      return acRef.current
    } catch {
      return null
    }
  }

  function beep(ac, freq, startOffset, duration) {
    if (!ac || mutedRef.current) return
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.connect(gain)
    gain.connect(ac.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, ac.currentTime + startOffset)
    gain.gain.setValueAtTime(0, ac.currentTime + startOffset)
    gain.gain.linearRampToValueAtTime(0.3, ac.currentTime + startOffset + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + startOffset + duration)
    osc.start(ac.currentTime + startOffset)
    osc.stop(ac.currentTime + startOffset + duration + 0.05)
  }

  function goHorn(ac, startOffset) {
    if (!ac || mutedRef.current) return
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.connect(gain)
    gain.connect(ac.destination)
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(800, ac.currentTime + startOffset)
    osc.frequency.exponentialRampToValueAtTime(400, ac.currentTime + startOffset + 0.4)
    gain.gain.setValueAtTime(0, ac.currentTime + startOffset)
    gain.gain.linearRampToValueAtTime(0.4, ac.currentTime + startOffset + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + startOffset + 0.5)
    osc.start(ac.currentTime + startOffset)
    osc.stop(ac.currentTime + startOffset + 0.6)
  }

  function airHorn(ac, startOffset) {
    if (!ac || mutedRef.current) return
    const osc1 = ac.createOscillator()
    const osc2 = ac.createOscillator()
    const gain = ac.createGain()
    const dist = ac.createWaveShaper()
    const curve = new Float32Array(256)
    for (let i = 0; i < 256; i++) {
      const x = (i * 2) / 256 - 1
      curve[i] = (Math.PI + 200) * x / (Math.PI + 200 * Math.abs(x))
    }
    dist.curve = curve
    osc1.connect(gain); osc2.connect(gain)
    gain.connect(dist); dist.connect(ac.destination)
    osc1.type = 'sawtooth'; osc2.type = 'square'
    osc1.frequency.setValueAtTime(260, ac.currentTime + startOffset)
    osc1.frequency.exponentialRampToValueAtTime(140, ac.currentTime + startOffset + 1.0)
    osc2.frequency.setValueAtTime(520, ac.currentTime + startOffset)
    osc2.frequency.exponentialRampToValueAtTime(280, ac.currentTime + startOffset + 1.0)
    gain.gain.setValueAtTime(0, ac.currentTime + startOffset)
    gain.gain.linearRampToValueAtTime(0.35, ac.currentTime + startOffset + 0.05)
    gain.gain.setValueAtTime(0.35, ac.currentTime + startOffset + 0.8)
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + startOffset + 1.2)
    osc1.start(ac.currentTime + startOffset); osc2.start(ac.currentTime + startOffset)
    osc1.stop(ac.currentTime + startOffset + 1.3); osc2.stop(ac.currentTime + startOffset + 1.3)
  }

  // ── HTML Audio crowd helpers ───────────────────────────────────────────────

  function getCrowdAudio() {
    if (!crowdAudioRef.current) {
      try {
        const audio = new Audio('/sounds/crowd.mp3')
        audio.loop = true
        audio.volume = 0
        crowdAudioRef.current = audio
      } catch {
        return null
      }
    }
    return crowdAudioRef.current
  }

  function clearCrowdFade() {
    if (crowdFadeRef.current !== null) {
      clearInterval(crowdFadeRef.current)
      crowdFadeRef.current = null
    }
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  // 3 ascending beeps + GO horn, timed to match countdown text
  function playCountdown() {
    const ac = getAC()
    if (!ac) return
    beep(ac, 660, 0, 0.12)
    beep(ac, 660, 0.9, 0.12)
    beep(ac, 880, 1.8, 0.15)
    goHorn(ac, 2.7)
  }

  // MUST be called synchronously inside the Start Race click handler.
  // Starts the audio element at volume 0, which unlocks it on iOS Safari so
  // that startCrowd() (called later from a timer) can raise the volume freely.
  function primeCrowd() {
    if (mutedRef.current) return
    const audio = getCrowdAudio()
    if (!audio) return
    audio.currentTime = 0
    audio.volume = 0
    audio.play().catch(() => {}) // silent fail if file missing — graceful degrade
  }

  // Called from the race timer after the countdown finishes.
  // Audio is already playing (from primeCrowd) — just fade volume up to 0.4.
  function startCrowd() {
    if (mutedRef.current) return
    const audio = getCrowdAudio()
    if (!audio) return
    clearCrowdFade()
    // Re-call play() in case primeCrowd failed silently (desktop, no gesture needed)
    audio.play().catch(() => {})
    let vol = audio.volume
    crowdFadeRef.current = setInterval(() => {
      vol = Math.min(0.4, vol + 0.04)
      if (crowdAudioRef.current) crowdAudioRef.current.volume = vol
      if (vol >= 0.4) clearCrowdFade()
    }, 100) // 10 steps × 100ms = 1 second fade-in
  }

  // Fade out and pause. Safe to call even if audio never started.
  function stopCrowd() {
    clearCrowdFade()
    const audio = crowdAudioRef.current
    if (!audio || audio.paused) return
    let vol = audio.volume
    crowdFadeRef.current = setInterval(() => {
      vol = Math.max(0, vol - 0.05)
      if (crowdAudioRef.current) crowdAudioRef.current.volume = vol
      if (vol <= 0) {
        clearCrowdFade()
        if (crowdAudioRef.current) {
          crowdAudioRef.current.pause()
          crowdAudioRef.current.currentTime = 0
        }
      }
    }, 50) // ~0.5 second fade-out
  }

  // Air horn + stop crowd
  function playWinner() {
    stopCrowd()
    const ac = getAC()
    if (!ac) return
    airHorn(ac, 0)
  }

  function toggleMute() {
    mutedRef.current = !mutedRef.current
    setMuted(mutedRef.current)
    if (mutedRef.current) stopCrowd()
  }

  return { playCountdown, primeCrowd, startCrowd, stopCrowd, playWinner, toggleMute, muted }
}
