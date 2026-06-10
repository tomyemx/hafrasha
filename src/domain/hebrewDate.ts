import { HDate, gematriya } from '@hebcal/core'

// ===== עזרי תאריך עברי =====

/** שמות החודשים בעברית לפי מספר החודש של hebcal (1=ניסן … 7=תשרי … 11=שבט) */
function hebrewMonthName(hd: HDate): string {
  const m = hd.getMonth()
  const leap = HDate.isLeapYear(hd.getFullYear())
  const names = [
    '', 'ניסן', 'אייר', 'סיון', 'תמוז', 'אב', 'אלול',
    'תשרי', 'חשוון', 'כסלו', 'טבת', 'שבט',
    leap ? 'אדר א׳' : 'אדר', 'אדר ב׳'
  ]
  return names[m] ?? ''
}

/** שנה עברית כמחרוזת, למשל "ה׳תשפ״ו" */
export function hebrewYearString(year: number): string {
  return 'ה׳' + gematriya(year)
}

/** תאריך עברי מלא, למשל "ט״ו בשבט ה׳תשפ״ו" */
export function formatHebrewDate(hd: HDate): string {
  const day = gematriya(hd.getDate())
  const month = hebrewMonthName(hd)
  // רוב החודשים מקבלים "ב" ("בשבט", "בניסן"); לחודשים שמתחילים באות שאינה מצריכה — עדיין תקין
  return `${day} ב${month} ${hebrewYearString(hd.getFullYear())}`
}

/** המרת תאריך לועזי (Date) ל-HDate */
export function toHDate(greg: Date): HDate {
  return new HDate(greg)
}

/** ט"ו בשבט של שנה עברית נתונה (חודש 11 = שבט) */
export function tuBishvat(hebrewYear: number): HDate {
  return new HDate(15, 11, hebrewYear)
}

/** ט"ו באב של שנה עברית נתונה (חודש 5 = אב) — לחישוב ערלה */
export function tuBeAv(hebrewYear: number): HDate {
  return new HDate(15, 5, hebrewYear)
}

export { HDate }
