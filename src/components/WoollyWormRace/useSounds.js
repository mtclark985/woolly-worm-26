import { useRef, useState } from 'react'

// All sounds are synthesized via Web Audio API — no audio files needed.
// iOS Safari requires AudioContext to be created/resumed inside a user gesture
// (e.g. button click). The Start Race button satisfies this requirement.
//
// If Web Audio is unavailable or blocked, sounds silently degrade — the race
// still works visually.

export function useSounds() {
  const acRef = useRef(null)
  const crowdRef = useRef(null)
  const crowdGainRef = useRef(null)
  const [muted, setMuted] = useState(false)
  const mutedRef = useRef(false)

  function getAC() {
    try {
      if (!acRef.current) {
        acRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }
      if (acRef.current.state === 'suspended') {
        acRef.current.resume()
      }
      return acRef.current
    } catch {
      return null
    }
  }

  // Play a single beep: frequency, duration, start offset from now
  function beep(ac, freq, startOffset, duration, type = 'sine') {
    if (!ac || mutedRef.current) return
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.connect(gain)
    gain.connect(ac.destination)
    osc.type = type
    osc.frequency.setValueAtTime(freq, ac.currentTime + startOffset)
    gain.gain.setValueAtTime(0, ac.currentTime + startOffset)
    gain.gain.linearRampToValueAtTime(0.3, ac.currentTime + startOffset + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + startOffset + duration)
    osc.start(ac.currentTime + startOffset)
    osc.stop(ac.currentTime + startOffset + duration + 0.05)
  }

  // GO! horn: frequency sweep down with sawtooth for a brassy sound
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

  // Crowd noise: white noise through bandpass filters, amplitude-modulated
  // Creates that "murmuring crowd" character
  function makeCrowdNoise(ac) {
    const bufferSize = ac.sampleRate * 3 // 3-second loopable buffer
    const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate)
    const data = buffer.getChannelData(0)

    // Pink-ish noise (each sample influenced by previous)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.96900 * b2 + white * 0.1538520
      b3 = 0.86650 * b3 + white * 0.3104856
      b4 = 0.55000 * b4 + white * 0.5329522
      b5 = -0.7616 * b5 - white * 0.0168980
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
      b6 = white * 0.115926
    }

    const source = ac.createBufferSource()
    source.buffer = buffer
    source.loop = true

    // Bandpass filter centered around human-voice frequencies
    const filter = ac.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 800
    filter.Q.value = 0.8

    // Second filter for warmth
    const filter2 = ac.createBiquadFilter()
    filter2.type = 'peaking'
    filter2.frequency.value = 400
    filter2.gain.value = 6

    // Slow amplitude modulation for "crowd wave" effect
    const lfo = ac.createOscillator()
    const lfoGain = ac.createGain()
    lfo.frequency.value = 0.3
    lfoGain.gain.value = 0.15
    lfo.connect(lfoGain)

    const masterGain = ac.createGain()
    masterGain.gain.value = 0.08

    lfoGain.connect(masterGain.gain)
    source.connect(filter)
    filter.connect(filter2)
    filter2.connect(masterGain)
    masterGain.connect(ac.destination)

    lfo.start()
    return { source, masterGain, lfo }
  }

  // Air horn: classic descending frequency sweep
  function airHorn(ac, startOffset) {
    if (!ac || mutedRef.current) return
    // Primary horn frequency
    const osc1 = ac.createOscillator()
    const osc2 = ac.createOscillator()
    const gain = ac.createGain()
    const dist = ac.createWaveShaper()

    // Mild distortion for brass character
    const curve = new Float32Array(256)
    for (let i = 0; i < 256; i++) {
      const x = (i * 2) / 256 - 1
      curve[i] = (Math.PI + 200) * x / (Math.PI + 200 * Math.abs(x))
    }
    dist.curve = curve

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(dist)
    dist.connect(ac.destination)

    osc1.type = 'sawtooth'
    osc2.type = 'square'
    osc1.frequency.setValueAtTime(260, ac.currentTime + startOffset)
    osc1.frequency.exponentialRampToValueAtTime(140, ac.currentTime + startOffset + 1.0)
    osc2.frequency.setValueAtTime(520, ac.currentTime + startOffset)
    osc2.frequency.exponentialRampToValueAtTime(280, ac.currentTime + startOffset + 1.0)

    gain.gain.setValueAtTime(0, ac.currentTime + startOffset)
    gain.gain.linearRampToValueAtTime(0.35, ac.currentTime + startOffset + 0.05)
    gain.gain.setValueAtTime(0.35, ac.currentTime + startOffset + 0.8)
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + startOffset + 1.2)

    osc1.start(ac.currentTime + startOffset)
    osc2.start(ac.currentTime + startOffset)
    osc1.stop(ac.currentTime + startOffset + 1.3)
    osc2.stop(ac.currentTime + startOffset + 1.3)
  }

  // Called on "Start Race" button click (user gesture = iOS AudioContext unlock)
  // Plays: beep at 0s, beep at 0.9s, beep at 1.8s, GO horn at 2.7s
  function playCountdown() {
    const ac = getAC()
    if (!ac) return
    beep(ac, 660, 0, 0.12)
    beep(ac, 660, 0.9, 0.12)
    beep(ac, 880, 1.8, 0.15)
    goHorn(ac, 2.7)
  }

  function startCrowd() {
    const ac = getAC()
    if (!ac || mutedRef.current) return
    stopCrowd() // clear any existing
    try {
      const { source, masterGain, lfo } = makeCrowdNoise(ac)
      crowdRef.current = { source, lfo }
      crowdGainRef.current = masterGain
      // Fade in over 1 second
      masterGain.gain.setValueAtTime(0, ac.currentTime)
      masterGain.gain.linearRampToValueAtTime(0.08, ac.currentTime + 1.0)
      source.start()
      lfo.start()
    } catch {
      // Silently degrade
    }
  }

  function stopCrowd() {
    if (crowdRef.current) {
      try {
        const ac = acRef.current
        if (ac && crowdGainRef.current) {
          // Fade out before stopping
          crowdGainRef.current.gain.linearRampToValueAtTime(0, ac.currentTime + 0.5)
        }
        setTimeout(() => {
          try { crowdRef.current?.source.stop() } catch {}
          try { crowdRef.current?.lfo.stop() } catch {}
        }, 600)
      } catch {}
      crowdRef.current = null
      crowdGainRef.current = null
    }
  }

  function playWinner() {
    const ac = getAC()
    if (!ac) return
    stopCrowd()
    airHorn(ac, 0)
    // Quick crowd surge after horn
    try {
      const { source, masterGain, lfo } = makeCrowdNoise(ac)
      masterGain.gain.setValueAtTime(0, ac.currentTime)
      masterGain.gain.linearRampToValueAtTime(0.18, ac.currentTime + 0.3)
      masterGain.gain.linearRampToValueAtTime(0.04, ac.currentTime + 3.0)
      masterGain.gain.linearRampToValueAtTime(0, ac.currentTime + 4.0)
      source.start()
      lfo.start()
      setTimeout(() => {
        try { source.stop() } catch {}
        try { lfo.stop() } catch {}
      }, 4500)
    } catch {}
  }

  function toggleMute() {
    mutedRef.current = !mutedRef.current
    setMuted(mutedRef.current)
    if (mutedRef.current) {
      stopCrowd()
    }
  }

  return { playCountdown, startCrowd, stopCrowd, playWinner, toggleMute, muted }
}
