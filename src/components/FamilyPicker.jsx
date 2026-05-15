import { FAMILIES, FAMILY_COLORS } from '../lib/tripConfig'

export default function FamilyPicker({ onPick }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-[#2A1F14] border-2 border-[#78350F] rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="text-4xl mb-3">👋</div>
        <h2 className="font-display text-2xl font-bold text-[#FEF3C7] mb-2">
          Which family are you?
        </h2>
        <p className="text-[#D97706] text-sm mb-6">
          This just labels your edits — you can switch anytime.
        </p>
        <div className="space-y-3">
          {FAMILIES.map((name) => (
            <button
              key={name}
              onClick={() => onPick(name)}
              className="w-full py-3 px-4 rounded-lg font-bold text-lg transition-transform hover:scale-105"
              style={{
                backgroundColor: FAMILY_COLORS[name].bg,
                color: FAMILY_COLORS[name].text,
              }}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
