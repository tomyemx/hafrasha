import { useMemo, useState } from 'react'
import type { Certainty, ChilulMethod, NusachId, ProduceCategory, RevaiStatus } from './domain/types'
import { PRODUCE, CATEGORY_LABEL, findProduce } from './domain/produce'
import { maaserYearFromDate, maaserYearFromHebrewYear } from './domain/maaserYear'
import { classifyOrlah } from './domain/orlah'
import { buildScenario } from './domain/engine'
import { NUSACHIM, NUSACH_ORDER } from './nusach/nusachim'
import { hebrewYearString, HDate } from './domain/hebrewDate'
import { Segmented, Sheet } from './components/ui'
import { ResultScreen } from './components/ResultScreen'

const PRODUCE_GROUPS: { cat: ProduceCategory; label: string }[] = [
  { cat: 'tree', label: 'פירות אילן' },
  { cat: 'vegetable', label: 'ירקות' },
  { cat: 'legume', label: 'קטניות' },
  { cat: 'grain', label: 'תבואה' },
  { cat: 'etrog', label: 'מיוחד' },
]

const REVAI_LABELS: Record<RevaiStatus, string> = {
  none: 'פרי רגיל',
  safek: 'ספק רבעי',
  vadai: 'ודאי רבעי',
  orlah: 'חשש ערלה',
}

function todayISO(): string {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

export function App() {
  const [screen, setScreen] = useState<'prefs' | 'result'>('prefs')
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)

  const [nusachId, setNusachId] = useState<NusachId>('mekubal')
  const [produceId, setProduceId] = useState<string>('apple')
  const [customCat, setCustomCat] = useState<ProduceCategory>('tree')
  const [certainty, setCertainty] = useState<Certainty>('vadai')
  const [chilulMethod, setChilulMethod] = useState<ChilulMethod>('coin')

  const [dateMode, setDateMode] = useState<'auto' | 'manual'>('auto')
  const [harvestDate, setHarvestDate] = useState<string>(todayISO())
  const currentHebYear = new HDate(new Date()).getFullYear()
  const [manualYear, setManualYear] = useState<number>(currentHebYear)

  const [revaiMode, setRevaiMode] = useState<'off' | 'auto' | 'manual'>('off')
  const [plantingYear, setPlantingYear] = useState<number>(currentHebYear - 5)
  const [plantedByTuBeAv, setPlantedByTuBeAv] = useState<boolean>(true)
  const [revaiManual, setRevaiManual] = useState<RevaiStatus>('safek')

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

  const maaser = useMemo(() => {
    if (dateMode === 'manual') return maaserYearFromHebrewYear(manualYear)
    return maaserYearFromDate(new Date(harvestDate + 'T12:00:00'), category)
  }, [dateMode, manualYear, harvestDate, category])

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
    () => buildScenario({ nusachId, produce: category, produceLabel, certainty, maaser, revai, chilulMethod }),
    [nusachId, category, produceLabel, certainty, maaser, revai, chilulMethod]
  )

  const blocked = scenario.maaser.kind === 'shmita' || scenario.revai === 'orlah'
  const nx = NUSACHIM[nusachId]

  if (screen === 'result') {
    return <ResultScreen scenario={scenario} onBack={() => setScreen('prefs')} />
  }

  const advSummary = [
    isTree ? `רבעי: ${REVAI_LABELS[revai]}` : null,
    `חילול: ${chilulMethod === 'pat' ? 'פת' : 'מטבע'}`,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="screen">
      <header className="hdr">
        <div className="logo">🌾</div>
        <div>
          <h1>הפרשת תרומות ומעשרות</h1>
          <p>בחרו העדפות ← קבלו את הנוסח וההנחיות</p>
        </div>
      </header>

      <main className="content">
        {/* נוסח */}
        <div className="ctl">
          <label htmlFor="nusach">נוסח</label>
          <select id="nusach" value={nusachId} onChange={(e) => setNusachId(e.target.value as NusachId)}>
            {NUSACH_ORDER.map((id) => (
              <option key={id} value={id}>
                {NUSACHIM[id].title} — {NUSACHIM[id].subtitle}
              </option>
            ))}
          </select>
          {nx.note && <div className="note-line">ℹ️ {nx.note}</div>}
        </div>

        {/* גידול */}
        <div className="ctl">
          <label htmlFor="produce">סוג הגידול</label>
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
            <div className="chips">
              {(['tree', 'vegetable', 'legume', 'grain', 'etrog'] as ProduceCategory[]).map((c) => (
                <button key={c} type="button" className={`chip ${customCat === c ? 'sel' : ''}`} onClick={() => setCustomCat(c)}>
                  {CATEGORY_LABEL[c]}
                </button>
              ))}
            </div>
          )}
          {produceNote && <div className="note-line">ℹ️ {produceNote}</div>}
        </div>

        {/* מקור */}
        <div className="ctl">
          <label>מקור הפירות</label>
          <Segmented
            value={certainty}
            onChange={setCertainty}
            options={[
              { v: 'vadai', label: 'ודאי טבל (גינה / ידוע)' },
              { v: 'demai', label: 'דמאי / ספק (נקנה)' },
            ]}
          />
        </div>

        {/* שנה */}
        <div className="ctl">
          <label>שנת המעשר</label>
          <Segmented
            value={dateMode}
            onChange={setDateMode}
            options={[
              { v: 'auto', label: 'מתאריך' },
              { v: 'manual', label: 'בחירה ידנית' },
            ]}
          />
          {dateMode === 'auto' ? (
            <input
              type="date"
              aria-label="תאריך הלקיטה"
              value={harvestDate}
              onChange={(e) => setHarvestDate(e.target.value)}
            />
          ) : (
            <input
              type="number"
              aria-label="שנת המעשר העברית"
              value={manualYear}
              min={5700}
              max={5900}
              onChange={(e) => setManualYear(parseInt(e.target.value || '0', 10))}
            />
          )}
          <div className="mini">{maaser.explanation}</div>
        </div>

        {/* מתקדם */}
        <button type="button" className="advanced-btn" onClick={() => setAdvancedOpen(true)}>
          <span className="lab">⚙ מתקדם</span>
          <span className="adv-sum">{advSummary}</span>
          <span className="chev">‹</span>
        </button>

        <button type="button" className="linkbtn" style={{ alignSelf: 'center' }} onClick={() => setInfoOpen(true)}>
          הבהרה הלכתית ומקורות
        </button>
      </main>

      <footer className="bar">
        <button type="button" className="cta" onClick={() => setScreen('result')}>
          הצגת הנוסח וההנחיות ←
        </button>
      </footer>

      {/* חלונית הגדרות מתקדמות */}
      <Sheet open={advancedOpen} onClose={() => setAdvancedOpen(false)} title="הגדרות מתקדמות">
        {isTree && (
          <div className="sheet-section">
            <span className="lab">נטע רבעי / ערלה</span>
            <Segmented
              value={revaiMode}
              onChange={setRevaiMode}
              options={[
                { v: 'off', label: 'עץ ותיק' },
                { v: 'auto', label: 'לפי נטיעה' },
                { v: 'manual', label: 'ידני' },
              ]}
            />
            {revaiMode === 'auto' && (
              <>
                <div className="row" style={{ marginTop: 12 }}>
                  <div className="ctl">
                    <label htmlFor="pyear">שנת נטיעה</label>
                    <input
                      id="pyear"
                      type="number"
                      value={plantingYear}
                      min={5700}
                      max={5900}
                      onChange={(e) => setPlantingYear(parseInt(e.target.value || '0', 10))}
                    />
                    <div className="note-line">{hebrewYearString(plantingYear)}</div>
                  </div>
                  <div className="ctl">
                    <label>זמן הנטיעה</label>
                    <Segmented
                      value={plantedByTuBeAv ? 'before' : 'after'}
                      onChange={(v) => setPlantedByTuBeAv(v === 'before')}
                      options={[
                        { v: 'before', label: 'עד ט״ו באב' },
                        { v: 'after', label: 'אחרי' },
                      ]}
                    />
                  </div>
                </div>
                <div
                  className="mini"
                  style={
                    orlahAuto.status === 'orlah'
                      ? { background: 'var(--warn-bg)', color: 'var(--warn-ink)', marginTop: 10 }
                      : { marginTop: 10 }
                  }
                >
                  {orlahAuto.explanation}
                </div>
              </>
            )}
            {revaiMode === 'manual' && (
              <div className="chips" style={{ marginTop: 12 }}>
                {(Object.keys(REVAI_LABELS) as RevaiStatus[]).map((r) => (
                  <button key={r} type="button" className={`chip ${revaiManual === r ? 'sel' : ''}`} onClick={() => setRevaiManual(r)}>
                    {REVAI_LABELS[r]}
                  </button>
                ))}
              </div>
            )}
            <div className="note-line" style={{ marginTop: 8 }}>
              ⚠️ ערלה היא איסור תורה. החישוב הוא הערכה בלבד — בררו מול רב.
            </div>
          </div>
        )}

        <div className="sheet-section">
          <span className="lab">אופן חילול מעשר שני</span>
          {blocked ? (
            <div className="note-line">בתרחיש זה (שמיטה/ערלה) אין חילול — אפשרות זו אינה רלוונטית.</div>
          ) : !scenario.needsCoin ? (
            <div className="note-line">בשנה זו אין מעשר שני לחלל (מעשר עני) — אפשרות זו אינה רלוונטית.</div>
          ) : (
            <>
              <Segmented
                value={chilulMethod}
                onChange={setChilulMethod}
                options={[
                  { v: 'coin', label: 'על מטבע (לכתחילה)' },
                  { v: 'pat', label: 'על פת / מאכל' },
                ]}
              />
              <div className="note-line" style={{ marginTop: 8 }}>
                {chilulMethod === 'pat'
                  ? 'הפת הופכת למעשר שני — אין לאוכלה, יש להשמידה בכבוד. מתאים לכמות ביתית קטנה; יש המשנים את הברכה.'
                  : 'לכתחילה מחללים על מטבע כסף ייעודית, וניתן להשתמש בה פעמים רבות.'}
              </div>
            </>
          )}
        </div>

        <button type="button" className="cta secondary" onClick={() => setAdvancedOpen(false)}>
          סיום
        </button>
      </Sheet>

      {/* חלונית הבהרה ומקורות */}
      <Sheet open={infoOpen} onClose={() => setInfoOpen(false)} title="הבהרה ומקורות">
        <div className="disclaimer" style={{ marginBottom: 16 }}>
          <b>הבהרה חשובה:</b> כלי עזר זה נועד ללימוד וסיוע בלבד ואינו פוסק הלכה. דיני תרומות ומעשרות, ערלה ושמיטה
          מורכבים ותלויים במנהג העדה והפוסק. יש לוודא את הנוסח ואת אופן ההפרשה מול רב מוסמך.
        </div>
        <div className="sources">
          <ul style={{ margin: 0, paddingInlineStart: 18 }}>
            {NUSACH_ORDER.map((id) => {
              const t = NUSACHIM[id]
              return (
                <li key={id}>
                  <b>{t.title}:</b>{' '}
                  <a href={t.sourceUrl} target="_blank" rel="noreferrer">
                    {t.source}
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      </Sheet>
    </div>
  )
}
