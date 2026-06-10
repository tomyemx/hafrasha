import type { DirectionStyle, MaaserKind } from '../domain/types'

// איור הממחיש את הכיוונים בנוסח ההפרשה (צפון/דרום או ימין/שמאל)
export function DirectionDiagram({ kind, style }: { kind: MaaserKind; style: DirectionStyle }) {
  const rl = style === 'right-left'
  const topName = rl ? 'ימין' : 'צפון'
  const botName = rl ? 'שמאל' : 'דרום'
  const southLabel = kind === 'ani' ? 'מעשר עני' : 'מעשר שני'

  return (
    <figure className="diagram">
      <svg viewBox="0 0 300 184" preserveAspectRatio="xMidYMid meet" role="img" aria-label="איור כיווני ההפרשה">
        {/* מסגרת */}
        <rect x="5" y="5" width="290" height="174" rx="16" fill="#fffdf8" stroke="#e0d8c4" strokeWidth="2" />

        {/* אזור עליון — תרומה גדולה + מעשר ראשון */}
        <rect x="13" y="13" width="274" height="50" rx="9" fill="#e8f3ec" />
        {[60, 95, 130, 165, 200, 235].map((cx) => (
          <circle key={cx} cx={cx} cy="31" r="6.5" fill="#1f7a4d" />
        ))}
        <text x="150" y="52" textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#155c39">
          {topName} — תרומה גדולה ומעשר ראשון
        </text>

        {/* אמצע — שאר הפירות */}
        {[
          [70, 86], [105, 92], [140, 86], [175, 92], [210, 86], [245, 92],
          [88, 108], [123, 112], [158, 106], [193, 112], [228, 108],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="7.5" fill="#f3ead2" stroke="#e3d6b4" />
        ))}
        <text x="150" y="102" textAnchor="middle" fontSize="11.5" fill="#9a8f72">שאר הפירות</text>

        {/* אזור תחתון — מעשר שני / עני */}
        <rect x="13" y="121" width="274" height="50" rx="9" fill="#f6edd6" />
        {[60, 95, 130, 165, 200, 235].map((cx) => (
          <path key={cx} d={`M${cx} 134 l7 12 h-14 z`} fill="#b8860b" />
        ))}
        <text x="150" y="162" textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#8a6508">
          {botName} — {southLabel}
        </text>
      </svg>
      <figcaption>
        ה{topName}/ה{botName} אינם כיוון גאוגרפי — זו רק דרך לסמן <b>חלקים מוגדרים</b> בערימה, כדי שכל מתנה תחול
        על מקום קבוע. החתיכה שבידכם היא התרומה ותרומת המעשר.
      </figcaption>
    </figure>
  )
}
