import { useMemo, useState } from 'react'
import type { Certainty, NusachId, ProduceCategory, RevaiStatus } from './domain/types'
import { PRODUCE, CATEGORY_LABEL, findProduce } from './domain/produce'
import { maaserYearFromDate, maaserYearFromHebrewYear } from './domain/maaserYear'
import { classifyOrlah } from './domain/orlah'
import { buildScenario } from './domain/engine'
import { NUSACHIM, NUSACH_ORDER } from './nusach/nusachim'
import { hebrewYearString, HDate } from './domain/hebrewDate'
import { Result } from './components/Result'

const PRODUCE_GROUPS: { cat: ProduceCategory; label: string }[] = [
  { cat: 'tree', label: 'פירות אילן' },
  { cat: 'vegetable', label: 'ירקות' },
  { cat: 'legume', label: 'קטניות' },
  { cat: 'grain', label: 'תבואה' },
  { cat: 'etrog', label: 'מיוחד' },
]

const REVAI_LABELS: { id: RevaiStatus | 'unknown'; t: string }[] = [
  { id: 'none', t: 'פרי רגיל' },
  { id: 'safek', t: 'ספק רבעי' },
  { id: 'vadai', t: 'ודאי רבעי' },
  { id: 'orlah', t: 'חשש ערלה' },
]

function todayISO(): string {
  const d = new Date()
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10)
}

export function App() {
  const [nusachId, setNusachId] = useState<NusachId>('mekubal')
  const [produceId, setProduceId] = useState<string>('apple')
  const [customCat, setCustomCat] = useState<ProduceCategory>('tree')
  const [certainty, setCertainty] = useState<Certainty>('vadai')

  const [dateMode, setDateMode] = useState<'auto' | 'manual'>('auto')
  const [harvestDate, setHarvestDate] = useState<string>(todayISO())
  const currentHebYear = new HDate(new Date()).getFullYear()
  const [manualYear, setManualYear] = useState<number>(currentHebYear)

  // נטע רבעי (רק לעצים)
  const [revaiMode, setRevaiMode] = useState<'off' | 'auto' | 'manual'>('off')
  const [plantingYear, setPlantingYear] = useState<number>(currentHebYear - 5)
  const [plantedByTuBeAv, setPlantedByTuBeAv] = useState<boolean>(true)
  const [revaiManual, setRevaiManual] = useState<RevaiStatus>('safek')

  // --- גזירת קטגוריה/תווית/עץ ---
  const { category, produceLabel, isTree, produceNote } = useMemo(() => {
    if (produceId === 'custom') {
      return {
        category: customCat,
        produceLabel: CATEGORY_LABEL[customCat],
        isTree: customCat === 'tree' || customCat === 'etrog',
        produceNote: undefined as string | undefined,
      }
    }
    const item = findProduce(produceId)!
    return { category: item.category, produceLabel: item.name, isTree: item.tree, produceNote: item.note }
  }, [produceId, customCat])

  // --- שנת המעשר ---
  const maaser = useMemo(() => {
    if (dateMode === 'manual') return maaserYearFromHebrewYear(manualYear)
    const d = new Date(harvestDate + 'T12:00:00')
    return maaserYearFromDate(d, category)
  }, [dateMode, manualYear, harvestDate, category])

  // --- מצב רבעי/ערלה ---
  const orlahAuto = useMemo(
    () => classifyOrlah(plantingYear, plantedByTuBeAv, maaser.maaserYear),
    [plantingYear, plantedByTuBeAv, maaser.maaserYear]
  )
  const revai: RevaiStatus = useMemo(() => {
    if (!isTree || revaiMode === 'off') return 'none'
    if (revaiMode === 'manual') return revaiManual
    return orlahAuto.status
  }, [isTree, revaiMode, revaiManual, orlahAuto.status])

  const scenario = useMemo(
    () => buildScenario({ nusachId, produce: category, produceLabel, certainty, maaser, revai }),
    [nusachId, category, produceLabel, certainty, maaser, revai]
  )

  return (
    <div className="app">
      <header className="appbar">
        <div className="logo">🌾</div>
        <div>
          <h1>הפרשת תרומות ומעשרות</h1>
          <p>בונה את הנוסח המדויק והנחיות שלב-אחר-שלב</p>
        </div>
      </header>

      {/* 1. נוסח */}
      <section className="card">
        <h2>
          <span className="num">1</span> בחירת נוסח
        </h2>
        <div className="options">
          {NUSACH_ORDER.map((id) => {
            const nx = NUSACHIM[id]
            return (
              <button
                key={id}
                type="button"
                className={`opt ${nusachId === id ? 'sel' : ''}`}
                onClick={() => setNusachId(id)}
              >
                <span className="t">{nx.title}</span>
                <span className="s">{nx.subtitle}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* 2. גידול */}
      <section className="card">
        <h2>
          <span className="num">2</span> סוג הגידול
        </h2>
        <p className="hint">הסוג קובע את גבול שנת המעשר (פירות אילן — ט״ו בשבט; ירקות/תבואה/קטניות — ראש השנה).</p>
        <label className="field" htmlFor="produce">
          בחרו פרי / ירק
        </label>
        <select id="produce" value={produceId} onChange={(e) => setProduceId(e.target.value)}>
          {PRODUCE_GROUPS.map((g) => (
            <optgroup key={g.cat} label={g.label}>
              {PRODUCE.filter((p) => p.category === g.cat).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </optgroup>
          ))}
          <option value="custom">אחר / לא ברשימה…</option>
        </select>

        {produceId === 'custom' && (
          <>
            <label className="field" style={{ marginTop: 12 }}>
              קטגוריה הלכתית
            </label>
            <div className="chips">
              {(['tree', 'vegetable', 'legume', 'grain', 'etrog'] as ProduceCategory[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`chip ${customCat === c ? 'sel' : ''}`}
                  onClick={() => setCustomCat(c)}
                >
                  {CATEGORY_LABEL[c]}
                </button>
              ))}
            </div>
          </>
        )}
        {produceNote && <p className="hint" style={{ marginTop: 10 }}>ℹ️ {produceNote}</p>}
      </section>

      {/* 3. ודאי / דמאי */}
      <section className="card">
        <h2>
          <span className="num">3</span> מקור הפירות
        </h2>
        <div className="chips">
          <button
            type="button"
            className={`chip ${certainty === 'vadai' ? 'sel' : ''}`}
            onClick={() => setCertainty('vadai')}
          >
            ודאי טבל (גינה פרטית / ידוע שלא עושר)
          </button>
          <button
            type="button"
            className={`chip ${certainty === 'demai' ? 'sel' : ''}`}
            onClick={() => setCertainty('demai')}
          >
            דמאי / ספק (נקנה ללא השגחה)
          </button>
        </div>
        <p className="hint" style={{ marginTop: 10 }}>
          {certainty === 'vadai'
            ? 'מפרישים ומברכים את ברכת ההפרשה.'
            : 'מפרישים אך אין מברכים. (מעשר ראשון ומעשר עני נשארים אצלכם; מעשר שני נפדה.)'}
        </p>
      </section>

      {/* 4. תאריך / שנת מעשר */}
      <section className="card">
        <h2>
          <span className="num">4</span> שנת המעשר
        </h2>
        <div className="chips" style={{ marginBottom: 12 }}>
          <button
            type="button"
            className={`chip ${dateMode === 'auto' ? 'sel' : ''}`}
            onClick={() => setDateMode('auto')}
          >
            חישוב אוטומטי מתאריך
          </button>
          <button
            type="button"
            className={`chip ${dateMode === 'manual' ? 'sel' : ''}`}
            onClick={() => setDateMode('manual')}
          >
            בחירה ידנית של השנה
          </button>
        </div>

        {dateMode === 'auto' ? (
          <>
            <label className="field" htmlFor="hdate">
              תאריך הלקיטה / הקנייה
            </label>
            <input id="hdate" type="date" value={harvestDate} onChange={(e) => setHarvestDate(e.target.value)} />
          </>
        ) : (
          <>
            <label className="field" htmlFor="myear">
              שנת המעשר (עברית, מספרי)
            </label>
            <input
              id="myear"
              type="number"
              value={manualYear}
              min={5700}
              max={5900}
              onChange={(e) => setManualYear(parseInt(e.target.value || '0', 10))}
            />
            <p className="hint" style={{ marginTop: 6 }}>
              {hebrewYearString(manualYear)}
            </p>
          </>
        )}

        <div className="yearbox">{maaser.explanation}</div>
      </section>

      {/* 5. נטע רבעי / ערלה — רק לעצים */}
      {isTree && (
        <section className="card">
          <h2>
            <span className="num">5</span> נטע רבעי / ערלה
          </h2>
          <p className="hint">רלוונטי לפירות עץ. אם זה עץ ותיק (5+ שנים) — השאירו "לא רלוונטי".</p>
          <div className="chips" style={{ marginBottom: 12 }}>
            <button
              type="button"
              className={`chip ${revaiMode === 'off' ? 'sel' : ''}`}
              onClick={() => setRevaiMode('off')}
            >
              לא רלוונטי (עץ ותיק)
            </button>
            <button
              type="button"
              className={`chip ${revaiMode === 'auto' ? 'sel' : ''}`}
              onClick={() => setRevaiMode('auto')}
            >
              חשב לפי שנת נטיעה
            </button>
            <button
              type="button"
              className={`chip ${revaiMode === 'manual' ? 'sel' : ''}`}
              onClick={() => setRevaiMode('manual')}
            >
              קביעה ידנית
            </button>
          </div>

          {revaiMode === 'auto' && (
            <>
              <div className="row">
                <div>
                  <label className="field" htmlFor="pyear">
                    שנת נטיעה (עברית)
                  </label>
                  <input
                    id="pyear"
                    type="number"
                    value={plantingYear}
                    min={5700}
                    max={5900}
                    onChange={(e) => setPlantingYear(parseInt(e.target.value || '0', 10))}
                  />
                  <p className="hint" style={{ marginTop: 6 }}>
                    {hebrewYearString(plantingYear)}
                  </p>
                </div>
                <div>
                  <label className="field">זמן הנטיעה</label>
                  <div className="chips">
                    <button
                      type="button"
                      className={`chip ${plantedByTuBeAv ? 'sel' : ''}`}
                      onClick={() => setPlantedByTuBeAv(true)}
                    >
                      עד ט״ו באב
                    </button>
                    <button
                      type="button"
                      className={`chip ${!plantedByTuBeAv ? 'sel' : ''}`}
                      onClick={() => setPlantedByTuBeAv(false)}
                    >
                      אחרי ט״ו באב
                    </button>
                  </div>
                </div>
              </div>
              <div
                className="yearbox"
                style={
                  orlahAuto.status === 'orlah'
                    ? { background: 'var(--warn-bg)', borderColor: 'var(--warn-line)', color: 'var(--warn-ink)' }
                    : undefined
                }
              >
                {orlahAuto.explanation}
              </div>
            </>
          )}

          {revaiMode === 'manual' && (
            <div className="chips">
              {REVAI_LABELS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`chip ${revaiManual === r.id ? 'sel' : ''}`}
                  onClick={() => setRevaiManual(r.id as RevaiStatus)}
                >
                  {r.t}
                </button>
              ))}
            </div>
          )}
          <p className="hint" style={{ marginTop: 10 }}>
            ⚠️ ערלה היא איסור תורה. החישוב הוא הערכה בלבד — אין להסתמך עליו בלי בירור מול רב.
          </p>
        </section>
      )}

      {/* תוצאה */}
      <Result scenario={scenario} />

      {/* הצהרה */}
      <section className="card">
        <div className="disclaimer">
          <b>הבהרה חשובה:</b> כלי עזר זה נועד ללימוד וסיוע בלבד ואינו פוסק הלכה. דיני תרומות ומעשרות, ערלה ושמיטה
          מורכבים ותלויים בפרטים רבים ובמנהג העדה והפוסק. יש לוודא את הנוסח ואת אופן ההפרשה מול רב מוסמך.
        </div>
      </section>

      {/* מקורות */}
      <section className="card sources">
        <h2 style={{ marginBottom: 10 }}>מקורות הנוסחים</h2>
        <ul style={{ margin: 0, paddingInlineStart: 18 }}>
          {NUSACH_ORDER.map((id) => {
            const nx = NUSACHIM[id]
            return (
              <li key={id}>
                <b>{nx.title}:</b>{' '}
                <a href={nx.sourceUrl} target="_blank" rel="noreferrer">
                  {nx.source}
                </a>
                {nx.note ? ` — ${nx.note}` : ''}
              </li>
            )
          })}
        </ul>
      </section>

      <footer>
        נבנה בעזרת מקורות גלויים • לבירור הלכה למעשה — פנו לרב
        <br />
        תשפ״ו
      </footer>
    </div>
  )
}
