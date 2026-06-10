import type { RevaiStatus } from './types'

// ===== הערכת ערלה / נטע רבעי =====
// אזהרה: ערלה היא איסור תורה. החישוב כאן הוא הערכה בלבד ואינו תחליף
// לבירור מול רב. הקובע ההלכתי המדויק הוא זמן החנטה ביחס לט"ו בשבט.

export interface OrlahResult {
  status: RevaiStatus
  treeYear: number // שנת העץ (1-based) שבה נקטף הפרי
  explanation: string
}

/**
 * חישוב מצב הפרי לפי שנת נטיעה.
 *
 * כללי הספירה:
 *  - אם נטעו עד ט"ו באב — אותה שנה נחשבת שנה ראשונה (קליטה + 30 יום ועוד ימי השנה).
 *  - אם נטעו לאחר ט"ו באב — שנה ראשונה מתחילה רק מראש השנה הבא.
 *  - שנים 1–3 = ערלה (אסור), שנה 4 = נטע רבעי, שנה 5 ואילך = חולין (חייב תרו"מ).
 *
 * @param plantingHebrewYear השנה העברית של הנטיעה
 * @param plantedByTuBeAv    האם נטעו עד ט"ו באב (כולל) של אותה שנה
 * @param treeMaaserYear     שנת המעשר של הפרי (מבוססת ט"ו בשבט)
 */
export function classifyOrlah(
  plantingHebrewYear: number,
  plantedByTuBeAv: boolean,
  treeMaaserYear: number
): OrlahResult {
  const firstYear = plantedByTuBeAv ? plantingHebrewYear : plantingHebrewYear + 1
  const treeYear = treeMaaserYear - firstYear + 1 // 1-based

  if (treeYear < 1) {
    return {
      status: 'orlah',
      treeYear,
      explanation: 'הפרי מוקדם לשנת הנטיעה — ככל הנראה אין כאן פרי חייב, בדקו את הנתונים.',
    }
  }
  if (treeYear <= 3) {
    return {
      status: 'orlah',
      treeYear,
      explanation: `הפרי בשנה ה-${treeYear} של העץ — בתוך שלוש שנות הערלה. הפרי אסור בהנאה ואין מפרישים ממנו.`,
    }
  }
  if (treeYear === 4) {
    return {
      status: 'vadai',
      treeYear,
      explanation: 'הפרי בשנה הרביעית של העץ — נטע רבעי. כל הפרי קודש ונפדה על מטבע.',
    }
  }
  return {
    status: 'none',
    treeYear,
    explanation: `הפרי בשנה ה-${treeYear} של העץ — פרי חולין רגיל, חייב בתרומות ומעשרות.`,
  }
}
