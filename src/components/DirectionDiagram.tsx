import type { DirectionStyle, MaaserKind } from '../domain/types'

// צבעים לפי תפקיד
const C_RISHON = '#3f9960'
const C_SHENI = '#caa028'
const C_REST = '#e7d9ad'
const C_HELD = '#c0533b'

// צורת פרי פשוטה (גוף + עוקץ + עלה)
function Fruit({ x, y, c, r = 6.5 }: { x: number; y: number; c: string; r?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill={c} />
      <rect x={-0.6} y={-r - 3} width={1.3} height={3.4} rx={0.6} fill="#7a5230" />
      <ellipse cx={r * 0.55} cy={-r * 0.85} rx={3.2} ry={1.9} fill="#5a8f3c" transform={`rotate(-32 ${r * 0.55} ${-r * 0.85})`} />
    </g>
  )
}

export function DirectionDiagram({
  kind,
  style,
  phase,
}: {
  kind: MaaserKind
  style: DirectionStyle
  phase: 'prep' | 'declaration'
}) {
  const rl = style === 'right-left'
  const topName = rl ? 'ימין' : 'צפון'
  const botName = rl ? 'שמאל' : 'דרום'
  const giftLabel = kind === 'ani' ? 'מעשר עני' : 'מעשר שני'
  const rishonLabel = phase === 'declaration' ? 'תשעה חלקי מעשר ראשון' : 'כאן: תרומות ומעשר ראשון'

  const nineNS = [44, 71, 98, 125, 152, 179, 206, 233, 260].map((x) => ({ x, y: 62 }))
  const nineRL = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => ({ x: 214 + (i % 3) * 27, y: 108 + Math.floor(i / 3) * 28 }))

  return (
    <figure className="diagram">
      <div className="diag-legend">
        <span><i style={{ background: C_HELD }} />החתיכה שביד — תרומה ותרומת מעשר</span>
        <span><i style={{ background: C_RISHON }} />מעשר ראשון</span>
        <span><i style={{ background: C_SHENI }} />{giftLabel}</span>
      </div>

      {!rl ? (
        // ===== צפון (מעלה) / דרום (מטה) =====
        <svg viewBox="0 0 300 228" preserveAspectRatio="xMidYMid meet" role="img" aria-label="איור כיווני ההפרשה (צפון/דרום)">
          <rect x="8" y="8" width="284" height="212" rx="16" fill="#fffdf8" stroke="#e0d8c4" strokeWidth="2" />

          <rect x="16" y="16" width="268" height="66" rx="9" fill="#e8f3ec" />
          <text x="150" y="34" textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#155c39">{topName} — {rishonLabel}</text>
          {nineNS.map((p, i) => <Fruit key={i} x={p.x} y={p.y} c={C_RISHON} r={6} />)}

          <text x="150" y="104" textAnchor="middle" fontSize="11" fill="#9a8f72">שאר הפירות (חולין)</text>
          {[70, 105, 140, 175, 210, 245].map((x) => <Fruit key={x} x={x} y={124} c={C_REST} r={7} />)}

          <rect x="16" y="150" width="268" height="62" rx="9" fill="#f6edd6" />
          <text x="150" y="168" textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#8a6508">{botName} — {giftLabel}</text>
          {[80, 120, 160, 200, 240].map((x) => <Fruit key={x} x={x} y={194} c={C_SHENI} r={6.5} />)}
        </svg>
      ) : (
        // ===== ימין / שמאל =====
        <svg viewBox="0 0 300 200" preserveAspectRatio="xMidYMid meet" role="img" aria-label="איור כיווני ההפרשה (ימין/שמאל)">
          <rect x="8" y="8" width="284" height="184" rx="16" fill="#fffdf8" stroke="#e0d8c4" strokeWidth="2" />

          {/* צד ימין — מעשר ראשון */}
          <rect x="200" y="16" width="84" height="168" rx="9" fill="#e8f3ec" />
          <text x="242" y="34" textAnchor="middle" fontSize="12" fontWeight="700" fill="#155c39">{topName}</text>
          <text x="242" y="49" textAnchor="middle" fontSize="9.5" fill="#155c39">מעשר ראשון</text>
          {nineRL.map((p, i) => <Fruit key={i} x={p.x} y={p.y} c={C_RISHON} r={5.5} />)}

          {/* אמצע — שאר הפירות */}
          <text x="150" y="34" textAnchor="middle" fontSize="10" fill="#9a8f72">שאר</text>
          <text x="150" y="46" textAnchor="middle" fontSize="10" fill="#9a8f72">הפירות</text>
          {[[126, 96], [150, 96], [174, 96], [126, 140], [150, 140], [174, 140]].map(([x, y], i) => (
            <Fruit key={i} x={x} y={y} c={C_REST} r={6.5} />
          ))}

          {/* צד שמאל — מעשר שני/עני */}
          <rect x="16" y="16" width="84" height="168" rx="9" fill="#f6edd6" />
          <text x="58" y="34" textAnchor="middle" fontSize="12" fontWeight="700" fill="#8a6508">{botName}</text>
          <text x="58" y="49" textAnchor="middle" fontSize="9.5" fill="#8a6508">{giftLabel}</text>
          {[[36, 100], [58, 100], [80, 100], [47, 138], [69, 138]].map(([x, y], i) => (
            <Fruit key={i} x={x} y={y} c={C_SHENI} r={5.5} />
          ))}
        </svg>
      )}

      <figcaption>
        סימון לפי {rl ? 'צד ימין וצד שמאל' : 'צפון (החלק העליון) ודרום (החלק התחתון)'} של הערימה — כך כל מתנה מקבלת
        מקום מוגדר וקבוע.{' '}
        {phase === 'prep'
          ? `הצד של ${giftLabel} מופיע כבר עכשיו משום ששם תקדישו אותו בעת אמירת הנוסח.`
          : `תשעת החלקים שב${topName} יחד עם החתיכה שבידכם = מעשר ראשון.`}
      </figcaption>
    </figure>
  )
}
