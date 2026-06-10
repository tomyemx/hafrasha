import type { MaaserKind } from '../domain/types'

// איור הממחיש את הכיוונים בנוסח ההפרשה (צפון/דרום של הפירות)
export function DirectionDiagram({ kind }: { kind: MaaserKind }) {
  const southLabel = kind === 'ani' ? 'מעשר עני' : 'מעשר שני'
  return (
    <figure className="diagram">
      <svg viewBox="0 0 320 196" role="img" aria-label="איור כיווני ההפרשה בערימת הפירות">
        {/* מסגרת הערימה */}
        <rect x="14" y="14" width="292" height="168" rx="18" fill="#fffdf8" stroke="#e0d8c4" strokeWidth="2" />

        {/* אזור צפון — תרומה גדולה + מעשר ראשון */}
        <rect x="14" y="14" width="292" height="54" rx="18" fill="#e8f3ec" />
        <rect x="14" y="50" width="292" height="18" fill="#e8f3ec" />
        {[40, 70, 100, 130].map((cx) => (
          <circle key={cx} cx={cx} cy="40" r="7" fill="#1f7a4d" />
        ))}
        <text x="296" y="34" textAnchor="end" fontSize="13" fontWeight="700" fill="#155c39">צפון</text>
        <text x="296" y="52" textAnchor="end" fontSize="11" fill="#155c39">תרומה גדולה + מעשר ראשון</text>

        {/* אמצע — שאר הפירות */}
        {[
          [60, 100], [95, 108], [135, 100], [175, 110], [215, 100], [250, 108], [285, 100],
          [80, 128], [120, 132], [160, 126], [200, 132], [240, 128], [275, 126],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="8" fill="#f3ead2" stroke="#e3d6b4" />
        ))}
        <text x="160" y="120" textAnchor="middle" fontSize="12" fill="#9a8f72">שאר הפירות</text>

        {/* אזור דרום — מעשר שני / עני */}
        <rect x="14" y="150" width="292" height="32" rx="0" fill="#f6edd6" />
        <rect x="14" y="164" width="292" height="18" rx="18" fill="#f6edd6" />
        {[40, 70, 100, 130].map((cx) => (
          <path key={cx} d={`M${cx} 160 l8 13 h-16 z`} fill="#b8860b" />
        ))}
        <text x="296" y="170" textAnchor="end" fontSize="13" fontWeight="700" fill="#8a6508">דרום</text>
        <text x="296" y="178" textAnchor="end" fontSize="11" fill="#8a6508">{southLabel}</text>
      </svg>
      <figcaption>
        הכיוונים (צפון/דרום) אינם צפון גאוגרפי — הם רק דרך לסמן <b>חלקים מוגדרים</b> בערימה, כדי שכל מתנה תחול
        על מקום קבוע. אפשר לבחור כל שני צדדים (מעלה/מטה, ימין/שמאל). החתיכה שבידכם היא התרומה ותרומת המעשר.
      </figcaption>
    </figure>
  )
}
