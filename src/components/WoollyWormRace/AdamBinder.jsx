// Adam Binder — the real Woolly Worm Festival MC.
// Distinctive features: full beard, ballcap with stuffed worms on it, microphone.
// Flat sticker style: bold outlines, solid fills, friendly cartoon.
// Size: ~130px wide × ~200px tall natural ratio.

export default function AdamBinder({ className = '' }) {
  return (
    <svg
      viewBox="0 0 130 210"
      className={className}
      aria-label="Adam Binder, Woolly Worm Festival MC"
      role="img"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── BODY / SHIRT ── */}
      <rect x="35" y="118" width="60" height="65" rx="10" fill="#C2410C" stroke="#78350F" strokeWidth="3" />
      {/* Collar area */}
      <path d="M55 118 L65 135 L75 118" fill="#EFE3CF" stroke="#78350F" strokeWidth="2" />

      {/* ── LEFT ARM (holding mic side) ── */}
      <rect x="14" y="122" width="22" height="12" rx="6" fill="#C2410C" stroke="#78350F" strokeWidth="2.5"
        transform="rotate(30 14 122)" />
      {/* LEFT HAND */}
      <circle cx="10" cy="148" r="8" fill="#F5C89A" stroke="#78350F" strokeWidth="2" />

      {/* ── MICROPHONE ── */}
      {/* Stick */}
      <rect x="7" y="155" width="5" height="28" rx="2.5" fill="#9CA3AF" stroke="#6B7280" strokeWidth="1.5" />
      {/* Mic head (ball) */}
      <circle cx="9.5" cy="153" r="8" fill="#4B5563" stroke="#374151" strokeWidth="2" />
      {/* Mesh lines on mic */}
      <line x1="3" y1="152" x2="16" y2="152" stroke="#9CA3AF" strokeWidth="1" opacity="0.6" />
      <line x1="3" y1="155" x2="16" y2="155" stroke="#9CA3AF" strokeWidth="1" opacity="0.6" />
      <line x1="9.5" y1="145" x2="9.5" y2="161" stroke="#9CA3AF" strokeWidth="1" opacity="0.6" />

      {/* ── RIGHT ARM ── */}
      <rect x="94" y="122" width="22" height="12" rx="6" fill="#C2410C" stroke="#78350F" strokeWidth="2.5"
        transform="rotate(-20 94 122)" />

      {/* ── NECK ── */}
      <rect x="56" y="106" width="18" height="16" rx="4" fill="#F5C89A" stroke="#78350F" strokeWidth="2" />

      {/* ── HEAD ── */}
      <ellipse cx="65" cy="85" rx="33" ry="34" fill="#F5C89A" stroke="#78350F" strokeWidth="3" />

      {/* ── BEARD ── thick, full, rounded bottom ── */}
      <path
        d="M34 92 Q30 115 65 122 Q100 115 96 92 Q88 105 65 108 Q42 105 34 92 Z"
        fill="#5C4033"
        stroke="#3D2415"
        strokeWidth="2"
      />
      {/* Beard texture lines */}
      <path d="M45 97 Q52 106 60 107" stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <path d="M85 97 Q78 106 70 107" stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <path d="M55 99 Q65 112 75 99" stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      {/* Moustache */}
      <path
        d="M50 93 Q58 99 65 96 Q72 99 80 93"
        fill="#5C4033"
        stroke="#3D2415"
        strokeWidth="1.5"
      />

      {/* ── EYES ── */}
      <ellipse cx="52" cy="80" rx="6" ry="6.5" fill="white" stroke="#78350F" strokeWidth="1.5" />
      <ellipse cx="78" cy="80" rx="6" ry="6.5" fill="white" stroke="#78350F" strokeWidth="1.5" />
      <circle cx="53" cy="81" r="3.5" fill="#2D1B0E" />
      <circle cx="79" cy="81" r="3.5" fill="#2D1B0E" />
      {/* Eye shine */}
      <circle cx="54.5" cy="79.5" r="1.2" fill="white" />
      <circle cx="80.5" cy="79.5" r="1.2" fill="white" />
      {/* Eyebrows */}
      <path d="M46 74 Q52 71 58 73" stroke="#5C4033" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M72 73 Q78 71 84 74" stroke="#5C4033" strokeWidth="2.5" strokeLinecap="round" />

      {/* ── NOSE ── */}
      <ellipse cx="65" cy="88" rx="4" ry="3" fill="#E8A87C" stroke="#C8855A" strokeWidth="1" />

      {/* ── BASEBALL CAP ── */}
      {/* Cap body */}
      <path
        d="M30 76 Q32 50 65 48 Q98 50 100 76 Q85 70 65 69 Q45 70 30 76 Z"
        fill="#92400E"
        stroke="#78350F"
        strokeWidth="2.5"
      />
      {/* Cap band */}
      <path d="M30 76 Q65 82 100 76" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
      {/* Cap button on top */}
      <circle cx="65" cy="49" r="4" fill="#78350F" stroke="#5C2E0A" strokeWidth="1.5" />

      {/* ── BRIM ── */}
      <path
        d="M28 78 Q20 80 18 84 Q30 88 65 85 Q45 84 28 78 Z"
        fill="#78350F"
        stroke="#5C2E0A"
        strokeWidth="2"
      />

      {/* ── WOOLLY WORMS ON CAP ── 3 little caterpillars */}
      {/* Worm 1 — left side of cap */}
      <circle cx="42" cy="57" r="4" fill="#5C2E0A" stroke="#3D1A08" strokeWidth="1" />
      <circle cx="48" cy="55" r="4" fill="#3D1A08" stroke="#3D1A08" strokeWidth="1" />
      <circle cx="54" cy="54" r="4" fill="#5C2E0A" stroke="#3D1A08" strokeWidth="1" />
      {/* Worm 1 head */}
      <circle cx="58" cy="53" r="4.5" fill="#5C2E0A" stroke="#3D1A08" strokeWidth="1" />
      <circle cx="59.5" cy="51.5" r="1.2" fill="white" />
      {/* Worm 1 antennae */}
      <line x1="57" y1="49" x2="54" y2="45" stroke="#3D1A08" strokeWidth="1" strokeLinecap="round" />
      <line x1="60" y1="49" x2="62" y2="45" stroke="#3D1A08" strokeWidth="1" strokeLinecap="round" />

      {/* Worm 2 — center of cap */}
      <circle cx="63" cy="60" r="3.5" fill="#8B3A0F" stroke="#3D1A08" strokeWidth="1" />
      <circle cx="69" cy="58" r="3.5" fill="#3D1A08" stroke="#3D1A08" strokeWidth="1" />
      <circle cx="74" cy="57" r="3.5" fill="#8B3A0F" stroke="#3D1A08" strokeWidth="1" />
      {/* Worm 2 head */}
      <circle cx="78" cy="56" r="4" fill="#8B3A0F" stroke="#3D1A08" strokeWidth="1" />
      <circle cx="79.5" cy="54.5" r="1.1" fill="white" />
      <line x1="77" y1="52.5" x2="75" y2="48.5" stroke="#3D1A08" strokeWidth="1" strokeLinecap="round" />
      <line x1="80" y1="52" x2="82" y2="48" stroke="#3D1A08" strokeWidth="1" strokeLinecap="round" />

      {/* Worm 3 — right side, mostly hidden, tail peeking */}
      <circle cx="84" cy="62" r="3" fill="#5C2E0A" stroke="#3D1A08" strokeWidth="1" />
      <circle cx="89" cy="61" r="3" fill="#3D1A08" stroke="#3D1A08" strokeWidth="1" />
      <circle cx="94" cy="61" r="3.5" fill="#5C2E0A" stroke="#3D1A08" strokeWidth="1" />
      {/* Head peeking */}
      <circle cx="98" cy="60" r="4" fill="#5C2E0A" stroke="#3D1A08" strokeWidth="1" />
      <circle cx="99" cy="58.5" r="1.1" fill="white" />

      {/* ── NAME TAG / LABEL ── small festival badge */}
      <rect x="42" y="130" width="46" height="18" rx="4" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
      <text x="65" y="143" textAnchor="middle" fill="#78350F" fontSize="8" fontWeight="bold" fontFamily="serif">
        ADAM BINDER
      </text>
    </svg>
  )
}
