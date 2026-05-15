// A single woolly worm — 13 segments (honoring the festival's 13-weeks-of-winter tradition)
// The worm is drawn vertically (head at top) as SVG.

const SEGMENT_COUNT = 13

export default function Worm({ color, progress, isWinner = false, size = 40 }) {
  const segH = size * 0.85 // segment height
  const segW = size
  const totalH = SEGMENT_COUNT * segH * 0.72 + size * 0.6 // head
  const cx = segW / 2

  // Wobble offsets — each segment shifts left/right slightly for the inchworm look
  const wobble = (i) => {
    const wave = Math.sin((i / SEGMENT_COUNT) * Math.PI * 2 + (progress || 0) * 12)
    return wave * segW * 0.18
  }

  const segments = Array.from({ length: SEGMENT_COUNT }, (_, i) => {
    const y = size * 0.55 + i * segH * 0.72
    const rx = segW * 0.42
    const ry = segH * 0.38
    // Darker at bottom segments, lighter at top
    const shade = i < 2 ? 1.15 : i > 10 ? 0.85 : 1.0
    return { i, y, rx, ry, shade }
  })

  return (
    <svg
      width={segW + 10}
      height={totalH + 10}
      viewBox={`-5 -5 ${segW + 10} ${totalH + 10}`}
      style={{
        filter: isWinner ? `drop-shadow(0 0 8px ${color})` : undefined,
        transition: 'filter 0.3s',
      }}
      aria-hidden="true"
    >
      {/* Segments from bottom to top so head renders on top */}
      {[...segments].reverse().map(({ i, y, rx, ry, shade }) => (
        <ellipse
          key={i}
          cx={cx + wobble(i)}
          cy={y}
          rx={rx}
          ry={ry}
          fill={shadeColor(color, shade)}
          stroke="rgba(0,0,0,0.25)"
          strokeWidth="0.8"
        />
      ))}

      {/* Fuzzy body hairs — small dashes on each segment */}
      {segments.map(({ i, y }) =>
        i % 2 === 0 ? (
          <g key={`hair-${i}`}>
            <line
              x1={cx + wobble(i) - segW * 0.42}
              y1={y - segH * 0.1}
              x2={cx + wobble(i) - segW * 0.58}
              y2={y - segH * 0.28}
              stroke={shadeColor(color, 0.7)}
              strokeWidth="1"
              strokeLinecap="round"
            />
            <line
              x1={cx + wobble(i) + segW * 0.42}
              y1={y - segH * 0.1}
              x2={cx + wobble(i) + segW * 0.58}
              y2={y - segH * 0.28}
              stroke={shadeColor(color, 0.7)}
              strokeWidth="1"
              strokeLinecap="round"
            />
          </g>
        ) : null
      )}

      {/* Head */}
      <circle
        cx={cx}
        cy={size * 0.35}
        r={size * 0.32}
        fill={shadeColor(color, 1.1)}
        stroke="rgba(0,0,0,0.3)"
        strokeWidth="1"
      />
      {/* Eyes */}
      <circle cx={cx - size * 0.1} cy={size * 0.28} r={size * 0.07} fill="white" />
      <circle cx={cx + size * 0.1} cy={size * 0.28} r={size * 0.07} fill="white" />
      <circle cx={cx - size * 0.08} cy={size * 0.29} r={size * 0.04} fill="#1C1410" />
      <circle cx={cx + size * 0.08} cy={size * 0.29} r={size * 0.04} fill="#1C1410" />
      {/* Smile */}
      <path
        d={`M ${cx - size * 0.1} ${size * 0.38} Q ${cx} ${size * 0.44} ${cx + size * 0.1} ${size * 0.38}`}
        stroke="#1C1410"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
      {/* Antennae */}
      <line
        x1={cx - size * 0.08}
        y1={size * 0.06}
        x2={cx - size * 0.22}
        y2={-size * 0.08}
        stroke={shadeColor(color, 0.8)}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <line
        x1={cx + size * 0.08}
        y1={size * 0.06}
        x2={cx + size * 0.22}
        y2={-size * 0.08}
        stroke={shadeColor(color, 0.8)}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx={cx - size * 0.22} cy={-size * 0.08} r={size * 0.05} fill={shadeColor(color, 1.2)} />
      <circle cx={cx + size * 0.22} cy={-size * 0.08} r={size * 0.05} fill={shadeColor(color, 1.2)} />
    </svg>
  )
}

// Lighten or darken a hex color by multiplying RGB channels
function shadeColor(hex, factor) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const clamp = (v) => Math.min(255, Math.max(0, Math.round(v * factor)))
  return `rgb(${clamp(r)}, ${clamp(g)}, ${clamp(b)})`
}
