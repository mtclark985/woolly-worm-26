// Woolly worm SVG component.
// `segments` prop controls body length:
//   - 4 (default for racing) — head-focused, visible on the track
//   - 13 — full festival length, used on the winner screen winter forecast display

export default function Worm({
  bodyColor = '#5C3317',
  bandColor = '#1A0A04',
  progress = 0,
  isWinner = false,
  size = 40,
  segments = 4,
}) {
  const segH = size * 0.9
  const segW = size
  const totalH = segments * segH * 0.68 + size * 0.65 // segments + head
  const cx = segW / 2

  // Subtle lateral wave as worm climbs — amplitude scales with segment count
  const wobble = (i) => {
    const wave = Math.sin((i / Math.max(segments, 1)) * Math.PI * 1.5 + (progress || 0) * 10)
    return wave * segW * 0.14
  }

  const segList = Array.from({ length: segments }, (_, i) => {
    const y = size * 0.58 + i * segH * 0.68
    const rx = segW * 0.40
    const ry = segH * 0.36
    // Alternate body / band colors
    const isBand = i % 2 === 1
    return { i, y, rx, ry, isBand }
  })

  const winnerGlow = isWinner
    ? `drop-shadow(0 0 6px ${bodyColor}) drop-shadow(0 0 12px rgba(217,119,6,0.6))`
    : undefined

  return (
    <svg
      width={segW + 10}
      height={totalH + 10}
      viewBox={`-5 -5 ${segW + 10} ${totalH + 10}`}
      style={{ filter: winnerGlow, transition: 'filter 0.3s' }}
      aria-hidden="true"
    >
      {/* Segments — rendered bottom-up so head draws on top */}
      {[...segList].reverse().map(({ i, y, rx, ry, isBand }) => (
        <ellipse
          key={i}
          cx={cx + wobble(i)}
          cy={y}
          rx={rx}
          ry={ry}
          fill={isBand ? bandColor : bodyColor}
          stroke="rgba(0,0,0,0.3)"
          strokeWidth="0.7"
        />
      ))}

      {/* Fuzzy hairs on each segment */}
      {segList.map(({ i, y }) => (
        <g key={`h${i}`}>
          <line
            x1={cx + wobble(i) - segW * 0.40}
            y1={y - segH * 0.08}
            x2={cx + wobble(i) - segW * 0.56}
            y2={y - segH * 0.26}
            stroke={bandColor}
            strokeWidth="0.9"
            strokeLinecap="round"
            opacity="0.8"
          />
          <line
            x1={cx + wobble(i) + segW * 0.40}
            y1={y - segH * 0.08}
            x2={cx + wobble(i) + segW * 0.56}
            y2={y - segH * 0.26}
            stroke={bandColor}
            strokeWidth="0.9"
            strokeLinecap="round"
            opacity="0.8"
          />
        </g>
      ))}

      {/* Head */}
      <circle
        cx={cx}
        cy={size * 0.33}
        r={size * 0.30}
        fill={bodyColor}
        stroke="rgba(0,0,0,0.35)"
        strokeWidth="0.9"
      />
      {/* Eyes */}
      <circle cx={cx - size * 0.10} cy={size * 0.26} r={size * 0.07} fill="white" />
      <circle cx={cx + size * 0.10} cy={size * 0.26} r={size * 0.07} fill="white" />
      <circle cx={cx - size * 0.08} cy={size * 0.27} r={size * 0.04} fill="#1C1410" />
      <circle cx={cx + size * 0.08} cy={size * 0.27} r={size * 0.04} fill="#1C1410" />
      {/* Eye shine */}
      <circle cx={cx - size * 0.06} cy={size * 0.25} r={size * 0.015} fill="white" opacity="0.8" />
      <circle cx={cx + size * 0.10} cy={size * 0.25} r={size * 0.015} fill="white" opacity="0.8" />
      {/* Smile */}
      <path
        d={`M ${cx - size * 0.09} ${size * 0.37} Q ${cx} ${size * 0.43} ${cx + size * 0.09} ${size * 0.37}`}
        stroke="#1C1410"
        strokeWidth="1.1"
        fill="none"
        strokeLinecap="round"
      />
      {/* Antennae */}
      <line x1={cx - size * 0.07} y1={size * 0.05} x2={cx - size * 0.20} y2={-size * 0.10}
        stroke={bandColor} strokeWidth="1.1" strokeLinecap="round" />
      <line x1={cx + size * 0.07} y1={size * 0.05} x2={cx + size * 0.20} y2={-size * 0.10}
        stroke={bandColor} strokeWidth="1.1" strokeLinecap="round" />
      <circle cx={cx - size * 0.20} cy={-size * 0.10} r={size * 0.045} fill={bodyColor} stroke={bandColor} strokeWidth="0.5" />
      <circle cx={cx + size * 0.20} cy={-size * 0.10} r={size * 0.045} fill={bodyColor} stroke={bandColor} strokeWidth="0.5" />
    </svg>
  )
}
