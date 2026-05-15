import { useEffect, useRef } from 'react'
import AdamBinder from './AdamBinder'

// Speech bubble tail colours — must match the feed's bg/border
const BUBBLE_BG = '#1C1410'
const BUBBLE_BORDER = '#78350F'

export default function CommentaryWithAdam({ lines }) {
  const containerRef = useRef(null)

  // Scroll inside the feed — not the page
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [lines])

  return (
    /*
      Layout:
        Mobile  (< sm):  Adam above, speech bubble below with tail pointing UP
        Desktop (≥ sm):  Adam on left, speech bubble on right with tail pointing LEFT
    */
    <div className="flex flex-col sm:flex-row items-start gap-0 sm:gap-2">

      {/* Adam cartoon */}
      <div className="flex justify-center w-full sm:w-auto sm:flex-shrink-0 sm:pt-2">
        <AdamBinder className="w-20 sm:w-28" />
      </div>

      {/* Speech bubble wrapper — provides the tail via SVG overlay */}
      <div className="relative flex-1 w-full">

        {/* Mobile tail: triangle pointing UP (toward Adam above) */}
        <div
          className="block sm:hidden absolute left-1/2 -top-3"
          style={{ transform: 'translateX(-50%)', width: 0, height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderBottom: `14px solid ${BUBBLE_BORDER}`,
          }}
        />
        <div
          className="block sm:hidden absolute left-1/2"
          style={{
            top: -1, transform: 'translateX(-50%)', width: 0, height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderBottom: `12px solid ${BUBBLE_BG}`,
            zIndex: 1,
          }}
        />

        {/* Desktop tail: triangle pointing LEFT (toward Adam beside it) */}
        <div
          className="hidden sm:block absolute -left-4 top-6"
          style={{ width: 0, height: 0,
            borderTop: '10px solid transparent',
            borderBottom: '10px solid transparent',
            borderRight: `14px solid ${BUBBLE_BORDER}`,
          }}
        />
        <div
          className="hidden sm:block absolute top-6"
          style={{
            left: -8, width: 0, height: 0,
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderRight: `12px solid ${BUBBLE_BG}`,
            zIndex: 1,
          }}
        />

        {/* The feed box */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: BUBBLE_BG,
            border: `2px solid ${BUBBLE_BORDER}`,
          }}
        >
          {/* Header bar */}
          <div className="bg-[#78350F] px-3 py-1.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />
            <span className="text-[#FEF3C7] text-xs font-bold uppercase tracking-widest">
              Live Commentary · Adam Binder
            </span>
          </div>

          {/* Scrollable feed — fixed height, scrolls internally */}
          <div
            ref={containerRef}
            className="h-44 overflow-y-auto p-3 space-y-1.5 text-sm"
          >
            {lines.length === 0 && (
              <p className="text-[#78350F] italic text-xs">Waiting for the race to start…</p>
            )}
            {lines.map((line, i) => (
              <p key={i} className="text-[#FEF3C7] leading-snug">
                <span className="text-[#D97706] mr-1">›</span>
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
