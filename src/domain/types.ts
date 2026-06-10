// ===== טיפוסי הליבה של מנוע ההפרשה =====

/** מזהי הנוסחים הנתמכים */
export type NusachId = 'mekubal' | 'mizrach' | 'chazon-ish' | 'temani' | 'short' | 'no-directions'

/**
 * קטגוריית הגידול — קובעת את גבול שנת המעשר:
 *  - tree / etrog → ט"ו בשבט (ראש השנה לאילן)
 *  - vegetable / grain / legume → ראש השנה (א' בתשרי)
 */
export type ProduceCategory = 'tree' | 'vegetable' | 'grain' | 'legume' | 'etrog'

/** ודאי טבל (חייב ברכה) או ספק/דמאי (ללא ברכה) */
export type Certainty = 'vadai' | 'demai'

/**
 * אופן חילול מעשר שני / רבעי:
 *  - coin = על מטבע (לכתחילה)
 *  - pat  = על פת או מאכל ששווה פרוטה, שמושמד בכבוד
 */
export type ChilulMethod = 'coin' | 'pat'

/** סוג המעשר השני בשנה זו */
export type MaaserKind = 'sheni' | 'ani' | 'shmita'

/**
 * מצב נטע רבעי / ערלה עבור פרי אילן:
 *  - none  = פרי רגיל (חייב בתרו"מ)
 *  - safek = ספק רבעי (מחללים ללא ברכה ומפרישים תרו"מ מספק)
 *  - vadai = ודאי רבעי (כל הפרי קודש, נפדה על מטבע)
 *  - orlah = חשש/ודאי ערלה (אסור בהנאה — אין הפרשה)
 */
export type RevaiStatus = 'none' | 'safek' | 'vadai' | 'orlah'

export interface MaaserYearResult {
  /** השנה העברית הקובעת את המעשר */
  maaserYear: number
  /** מיקום במחזור השמיטה 1..7 (7 = שמיטה) */
  cyclePosition: number
  /** סוג המעשר */
  kind: MaaserKind
  /** הגבול שלפיו חושבה השנה */
  boundary: 'rosh-hashana' | 'tu-bishvat'
  isShmita: boolean
  /** השנה העברית של תאריך הלקיטה (לפני התאמת ט"ו בשבט) */
  pickHebrewYear: number
  /** הסבר מילולי קצר על אופן החישוב */
  explanation: string
}

export interface Scenario {
  nusachId: NusachId
  produce: ProduceCategory
  produceLabel: string
  certainty: Certainty
  maaser: MaaserYearResult
  revai: RevaiStatus
  /** אופן החילול שנבחר (מטבע/פת) */
  chilulMethod: ChilulMethod
  /** האם נדרש חילול בכלל (מעשר שני או רבעי) */
  needsCoin: boolean
}
