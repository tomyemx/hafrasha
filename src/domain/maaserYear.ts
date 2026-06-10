import { HDate, formatHebrewDate, tuBishvat, hebrewYearString } from './hebrewDate'
import type { ProduceCategory, MaaserKind, MaaserYearResult } from './types'

// ===== חישוב שנת המעשר ומחזור השמיטה =====

/**
 * שנת עוגן לשמיטה. תשפ"ב (5782) הייתה שנת שמיטה.
 * מכאן נגזר מיקום כל שנה במחזור בן 7 השנים.
 */
export const SHMITA_ANCHOR = 5782

/** מיקום במחזור השמיטה: 1..7 כאשר 7 = שנת שמיטה */
export function cyclePosition(maaserYear: number): number {
  const mod = (((maaserYear - SHMITA_ANCHOR) % 7) + 7) % 7
  return mod === 0 ? 7 : mod
}

/**
 * סוג המעשר לפי מיקום במחזור:
 *  שנים 1,2,4,5 → מעשר שני
 *  שנים 3,6     → מעשר עני
 *  שנה 7        → שמיטה
 */
export function kindForYear(maaserYear: number): MaaserKind {
  const p = cyclePosition(maaserYear)
  if (p === 7) return 'shmita'
  if (p === 3 || p === 6) return 'ani'
  return 'sheni'
}

/** הגבול הקובע את שנת המעשר לפי קטגוריית הגידול */
export function boundaryFor(cat: ProduceCategory): 'rosh-hashana' | 'tu-bishvat' {
  return cat === 'tree' || cat === 'etrog' ? 'tu-bishvat' : 'rosh-hashana'
}

const KIND_LABEL: Record<MaaserKind, string> = {
  sheni: 'מעשר שני',
  ani: 'מעשר עני',
  shmita: 'שנת שמיטה',
}

const POS_HE = ['', 'ראשונה', 'שנייה', 'שלישית', 'רביעית', 'חמישית', 'שישית', 'שביעית']

function buildResult(maaserYear: number, pickHebrewYear: number, boundary: MaaserYearResult['boundary'], note: string): MaaserYearResult {
  const p = cyclePosition(maaserYear)
  const kind = kindForYear(maaserYear)
  const explanation =
    `שנת המעשר היא ${hebrewYearString(maaserYear)} — שנה ${POS_HE[p]} למחזור השמיטה, ` +
    `ולכן ${KIND_LABEL[kind]}. ${note}`
  return {
    maaserYear,
    pickHebrewYear,
    cyclePosition: p,
    kind,
    boundary,
    isShmita: p === 7,
    explanation,
  }
}

/**
 * חישוב שנת המעשר מתאריך לקיטה/קצירה (לועזי) לפי קטגוריית הגידול.
 *
 * לפירות אילן הגבול הוא ט"ו בשבט: פרי שנקטף לפני ט"ו בשבט שייך לשנת המעשר
 * הקודמת. (הערה הלכתית: לאמיתו של דבר הקובע הוא זמן החנטה, ראו הבהרה באפליקציה.)
 * לירקות/תבואה/קטניות הגבול הוא ראש השנה (לפי לקיטה).
 */
export function maaserYearFromDate(greg: Date, cat: ProduceCategory): MaaserYearResult {
  const hd = new HDate(greg)
  const H = hd.getFullYear()
  const boundary = boundaryFor(cat)
  let maaserYear = H
  let note = `החישוב לפי תאריך הלקיטה ${formatHebrewDate(hd)}, גבול השנה לפי ראש השנה.`

  if (boundary === 'tu-bishvat') {
    const tu = tuBishvat(H)
    if (hd.abs() < tu.abs()) {
      maaserYear = H - 1
      note = `הפרי נקטף לפני ט״ו בשבט (${formatHebrewDate(hd)}), ולכן שייך לשנת המעשר הקודמת. (לפירות אילן הקובע ההלכתי הוא זמן החנטה.)`
    } else {
      note = `הפרי נקטף לאחר ט״ו בשבט (${formatHebrewDate(hd)}). (לפירות אילן הקובע ההלכתי הוא זמן החנטה.)`
    }
  }

  return buildResult(maaserYear, H, boundary, note)
}

/** בניית תוצאה משנת מעשר שנבחרה ידנית (עקיפה) */
export function maaserYearFromHebrewYear(maaserYear: number): MaaserYearResult {
  return buildResult(maaserYear, maaserYear, 'rosh-hashana', 'שנת המעשר נבחרה ידנית.')
}
