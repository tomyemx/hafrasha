import type { Scenario, Certainty, NusachId, ProduceCategory, RevaiStatus, MaaserYearResult } from './types'

// ===== הרכבת תרחיש מלא מן הקלט =====

export interface ScenarioInput {
  nusachId: NusachId
  produce: ProduceCategory
  produceLabel: string
  certainty: Certainty
  maaser: MaaserYearResult
  revai: RevaiStatus
}

export function buildScenario(input: ScenarioInput): Scenario {
  const { maaser, revai } = input
  // נדרש חילול על מטבע אם יש מעשר שני, או נטע רבעי (ודאי/ספק)
  const needsCoin = maaser.kind === 'sheni' || revai === 'vadai' || revai === 'safek'
  return {
    nusachId: input.nusachId,
    produce: input.produce,
    produceLabel: input.produceLabel,
    certainty: input.certainty,
    maaser,
    revai,
    needsCoin,
  }
}
