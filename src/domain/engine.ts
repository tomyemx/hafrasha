import type {
  Scenario,
  Certainty,
  ChilulMethod,
  DirectionStyle,
  NusachId,
  ProduceCategory,
  RevaiStatus,
  MaaserYearResult,
} from './types'

// ===== הרכבת תרחיש מלא מן הקלט =====

export interface ScenarioInput {
  nusachId: NusachId
  produce: ProduceCategory
  produceLabel: string
  certainty: Certainty
  maaser: MaaserYearResult
  revai: RevaiStatus
  chilulMethod: ChilulMethod
  directionStyle: DirectionStyle
}

export function buildScenario(input: ScenarioInput): Scenario {
  const { maaser, revai } = input
  // נדרש חילול אם יש מעשר שני, או נטע רבעי (ודאי/ספק)
  const needsCoin = maaser.kind === 'sheni' || revai === 'vadai' || revai === 'safek'
  return {
    nusachId: input.nusachId,
    produce: input.produce,
    produceLabel: input.produceLabel,
    certainty: input.certainty,
    maaser,
    revai,
    chilulMethod: input.chilulMethod,
    directionStyle: input.directionStyle,
    needsCoin,
  }
}
