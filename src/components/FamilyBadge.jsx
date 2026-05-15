import { FAMILY_COLORS } from '../lib/tripConfig'

export default function FamilyBadge({ family, small }) {
  if (!family) return null
  const colors = FAMILY_COLORS[family] || { bg: '#78350F', text: '#fff' }
  return (
    <span
      className={`inline-block rounded-full font-bold ${small ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'}`}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {family}
    </span>
  )
}
