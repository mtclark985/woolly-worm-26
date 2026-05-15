import { useEffect, useRef } from 'react'

export default function CommentaryFeed({ lines }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  return (
    <div className="bg-[#1C1410] border-2 border-[#78350F] rounded-xl overflow-hidden">
      <div className="bg-[#78350F] px-3 py-1.5 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />
        <span className="text-[#FEF3C7] text-xs font-bold uppercase tracking-widest">
          Live Commentary · Adam Binder
        </span>
      </div>
      <div className="h-32 overflow-y-auto p-3 space-y-1.5 text-sm">
        {lines.map((line, i) => (
          <p
            key={i}
            className="text-[#FEF3C7] leading-snug animate-fade-in-up"
            style={{ animationDelay: '0ms' }}
          >
            <span className="text-[#D97706] mr-1">›</span>
            {line}
          </p>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
