import type { Scenario } from '../domain/types'
import { generatePlan, type Step } from '../nusach/generate'
import { NUSACHIM } from '../nusach/nusachim'
import { hebrewYearString } from '../domain/hebrewDate'
import { CopyButton } from './CopyButton'

const KIND_BADGE: Record<Step['kind'], string> = {
  info: 'i',
  action: '⚙',
  bracha: '✦',
  declaration: '“',
  warning: '!',
  done: '✓',
}

function StepCard({ step }: { step: Step }) {
  const isBrachaText = step.kind === 'bracha'
  return (
    <div className={`step ${step.kind}`}>
      <div className="head">
        <span className="badge">{step.kind === 'info' || step.kind === 'action' ? step.n : KIND_BADGE[step.kind]}</span>
        <span className="title">{step.title}</span>
      </div>
      {step.body && <div className="body">{step.body}</div>}
      {step.say && (
        <>
          <div className={`say ${isBrachaText ? 'bracha-text' : ''}`}>{step.say}</div>
          <CopyButton text={step.say} />
        </>
      )}
    </div>
  )
}

export function Result({ scenario }: { scenario: Scenario }) {
  const plan = generatePlan(scenario)
  const nusach = NUSACHIM[scenario.nusachId]

  return (
    <div className="card" id="result">
      <h2>
        <span className="num">★</span> ההנחיות שלכם
      </h2>

      <div className="summary">
        <span className="tag green">{scenario.produceLabel}</span>
        <span className="tag">{nusach.title}</span>
        <span className="tag gold">{hebrewYearString(scenario.maaser.maaserYear)}</span>
        {plan.summary.map((s, i) => (
          <span className="tag" key={i}>
            {s}
          </span>
        ))}
      </div>

      <div className="yearbox" style={{ marginTop: 14 }}>
        {scenario.maaser.explanation}
      </div>

      {plan.steps.map((s) => (
        <StepCard key={s.n} step={s} />
      ))}

      {!plan.blocked && plan.fullNusach && (
        <div className="step" style={{ borderColor: '#cfe6d8' }}>
          <div className="head">
            <span className="badge" style={{ background: 'var(--green-d)' }}>
              ↧
            </span>
            <span className="title">הנוסח המלא (להעתקה)</span>
          </div>
          <div className="say">{plan.fullNusach}</div>
          <CopyButton text={plan.fullNusach} label="העתקת כל הנוסח" />
        </div>
      )}
    </div>
  )
}
