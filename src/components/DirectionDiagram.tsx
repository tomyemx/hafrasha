import type { DirectionStyle, MaaserKind } from '../domain/types'

// צבעים לפי תפקיד
const C_RISHON = '#3f9960'
const C_SHENI = '#caa028'
const C_REST = '#e7d9ad'
const C_HELD = '#c0533b'

// רשת 10×10 — כל פרי = אחוז אחד מהכמות
const COLS_NS = [30, 57, 83, 110, 137, 163, 190, 217, 243, 270]
const ROWS_NS = [40, 66, 92, 118, 144, 170, 196, 222, 248, 274]
const COLS_RL = [28, 55, 82, 109, 136, 163, 190, 217, 244, 271]
const ROWS_RL = [36, 61, 86, 111, 136, 161, 186, 211, 236, 261]

function Fruit({ x, y, c, r = 5.5, hl = false }: { x: number; y: number; c: string; r?: number; hl?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {hl && <circle r={r + 3.5} fill="none" stroke={C_HELD} strokeWidth="1.5" strokeDasharray="3 2" />}
      <circle r={r} fill={c} />
      <rect x={-0.5} y={-r - 2.6} width={1.1} height={3} rx={0.5} fill="#7a5230" />
      <ellipse cx={r * 0.55} cy={-r * 0.85} rx={2.6} ry={1.6} fill="#5a8f3c" transform={`rotate(-32 ${r * 0.55} ${-r * 0.85})`} />
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
  const topHeading = `${topName} — תרומה גדולה, מעשר ראשון ותרומת מעשר`
  const botHeading = `${botName} — ${giftLabel}`

  return (
    <figure className="diagram">
      <div className="diag-legend">
        <span><i style={{ background: C_HELD }} />החתיכה שביד (כ-1%)</span>
        <span><i style={{ background: C_RISHON }} />מעשר ראשון (10%)</span>
        <span><i style={{ background: C_SHENI }} />{giftLabel} (10%)</span>
        <span><i style={{ background: C_REST }} />חולין (כ-80%)</span>
      </div>

      {!rl ? (
        // ===== צפון (מעלה) / דרום (מטה) =====
        <svg viewBox="0 0 300 314" preserveAspectRatio="xMidYMid meet" role="img" aria-label="איור כיווני ההפרשה (צפון/דרום)">
          <text x="150" y="16" textAnchor="middle" fontSize="11" fontWeight="700" fill="#155c39">{topHeading}</text>
          <rect x="14" y="27" width="272" height="26" rx="8" fill="#e8f3ec" />
          <rect x="14" y="261" width="272" height="26" rx="8" fill="#f6edd6" />
          {ROWS_NS.map((y, r) =>
            COLS_NS.map((x, c) => {
              const held = r === 0 && c === 9
              const col = r === 0 ? (held ? C_HELD : C_RISHON) : r === 9 ? C_SHENI : C_REST
              return <Fruit key={`${r}-${c}`} x={x} y={y} c={col} r={5.5} hl={held} />
            })
          )}
          <text x="150" y="304" textAnchor="middle" fontSize="11" fontWeight="700" fill="#8a6508">{botHeading}</text>
        </svg>
      ) : (
        // ===== ימין / שמאל =====
        <svg viewBox="0 0 300 300" preserveAspectRatio="xMidYMid meet" role="img" aria-label="איור כיווני ההפרשה (ימין/שמאל)">
          <text x="150" y="15" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#155c39">{topHeading}</text>
          <rect x="256" y="26" width="30" height="248" rx="8" fill="#e8f3ec" />
          <rect x="14" y="26" width="30" height="248" rx="8" fill="#f6edd6" />
          {ROWS_RL.map((y, r) =>
            COLS_RL.map((x, c) => {
              const held = c === 9 && r === 0
              const col = c === 9 ? (held ? C_HELD : C_RISHON) : c === 0 ? C_SHENI : C_REST
              return <Fruit key={`${r}-${c}`} x={x} y={y} c={col} r={5} hl={held} />
            })
          )}
          <text x="150" y="292" textAnchor="middle" fontSize="11" fontWeight="700" fill="#8a6508">{botHeading}</text>
        </svg>
      )}

      <figcaption>
        כל פרי באיור = אחוז אחד מהכמות.{' '}
        {phase === 'prep'
          ? `הצד של ${giftLabel} (10%) מסומן כבר עכשיו משום ששם תקדישו אותו בעת אמירת הנוסח.`
          : `מעשר ראשון = 10%: החתיכה שבידכם (תרומה גדולה ותרומת מעשר) ועוד תשעה אחוזים. ${giftLabel} = 10%, והשאר חולין.`}
      </figcaption>
    </figure>
  )
}
