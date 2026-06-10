import { useEffect, useMemo, useState } from 'react'
import type { Scenario } from '../domain/types'
import { generatePlan, type Step } from '../nusach/generate'
import { NUSACHIM } from '../nusach/nusachim'
import { hebrewYearString } from '../domain/hebrewDate'
import { CopyButton } from './CopyButton'
import { DirectionDiagram } from './DirectionDiagram'

function badgeFor(step: Step): string | number {
  if (step.kind === 'warning') return '!'
  if (step.kind === 'done') return '✓'
  return step.n
}

export function ResultScreen({ scenario, onBack }: { scenario: Scenario; onBack: () => void }) {
  const plan = useMemo(() => generatePlan(scenario), [scenario])
  const nusach = NUSACHIM[scenario.nusachId]
  const [i, setI] = useState(0)
  const [diagramOpen, setDiagramOpen] = useState(false)

  // איפוס המיקום והאיור כשמשתנה התרחיש/התוכנית
  useEffect(() => {
    setI(0)
    setDiagramOpen(false)
  }, [plan])

  const n = plan.steps.length
  const idx = Math.min(i, n - 1)
  const step = plan.steps[idx]
  const isDeclaration = step.kind === 'declaration' && nusach.usesDirections

  return (
    <div className="screen">
      <header className="hdr result-hdr">
        <button type="button" className="back" onClick={onBack}>
          ← הגדרות
        </button>
        <div className="summary">
          <span className="tag green">{scenario.produceLabel}</span>
          <span className="tag">{nusach.title}</span>
          <span className="tag gold">{hebrewYearString(scenario.maaser.maaserYear)}</span>
          {plan.summary.map((s, k) => (
            <span className="tag" key={k}>
              {s}
            </span>
          ))}
        </div>
      </header>

      <main className="content step-area">
        <div className={`stepcard ${step.kind}`}>
          <div className="step-head">
            <span className="step-badge">{badgeFor(step)}</span>
            <span className="step-title">{step.title}</span>
          </div>
          {step.body && <div className="step-body">{step.body}</div>}
          {step.say && (
            <>
              <div className={`say-big ${step.kind === 'bracha' ? 'bracha-text' : ''}`}>{step.say}</div>
              <CopyButton text={step.say} />
            </>
          )}
          {isDeclaration && (
            <button type="button" className="linkbtn" onClick={() => setDiagramOpen((o) => !o)}>
              {diagramOpen ? 'הסתר איור הכיוונים' : 'מה הכוונה ב״צפון/דרום״? הצגת איור'}
            </button>
          )}
          {isDeclaration && diagramOpen && <DirectionDiagram kind={scenario.maaser.kind} />}
        </div>
      </main>

      <footer className="bar pager">
        <button type="button" className="pgbtn" disabled={idx === 0} onClick={() => setI(idx - 1)}>
          ‹ הקודם
        </button>
        <span className="count">
          שלב {idx + 1} מתוך {n}
        </span>
        <button type="button" className="pgbtn primary" disabled={idx >= n - 1} onClick={() => setI(idx + 1)}>
          הבא ›
        </button>
      </footer>
    </div>
  )
}
