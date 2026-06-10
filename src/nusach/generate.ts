import type { Scenario } from '../domain/types'
import { NUSACHIM } from './nusachim'

// ===== מנוע בניית ההנחיות והנוסח =====

export type StepKind = 'action' | 'bracha' | 'declaration' | 'info' | 'warning' | 'done'

export interface Step {
  n: number
  title: string
  kind: StepKind
  body?: string
  /** טקסט לאמירה (ברכה/נוסח) — יוצג מודגש וניתן להעתקה */
  say?: string
}

export interface GeneratedPlan {
  steps: Step[]
  /** הנוסח המלא המורכב (ההצהרה), לשמירה/העתקה */
  fullNusach: string
  /** סיכום קצר של התרחיש לכותרת התוצאה */
  summary: string[]
  /** האם זהו מצב חריג (שמיטה/ערלה) שאין בו הפרשה רגילה */
  blocked?: boolean
}

const COIN_INSTRUCTIONS =
  'ייחדו מטבע (למשל חצי שקל או שקל) שתשמש לחילול מעשר שני ורבעי, והניחו אותה במקום שמור וקבוע. ' +
  'בכל הפרשה מעבירים את הקדושה אל חלק קטן מערך המטבע (שווה פרוטה). אפשר להמשיך להשתמש באותה מטבע פעמים רבות, ' +
  'עד שכמעט "מתמלאת"; אז מחללים את כל ערכה על פרי/חתיכת סוכר ששווה פרוטה, מאבדים אותה בכבוד, וממשיכים מחדש.'

const PAT_INSTRUCTIONS =
  'הכינו חתיכת פת (או מאכל אחר) ששווה לפחות פרוטה — היא תשמש לחילול. ' +
  'שימו לב: לאחר אמירת הנוסח הפת עצמה הופכת למעשר שני — אין לאכול אותה, אלא לעטוף ולהשליך בכבוד (כמו התרומה). ' +
  'חילול על פת מתאים בעיקר לכמות ביתית קטנה (כששווי מעשר שני אינו עולה על פרוטה); לכתחילה עדיף לחלל על מטבע כסף.'

const DISPOSAL_INSTRUCTIONS =
  'החלק שהופרש לתרומה גדולה ולתרומת מעשר (מעט יותר ממאית) קדוש ואסור באכילה ובהנאה. ' +
  'עטפו אותו (למשל בשקית) והשליכו לאשפה בכבוד. שאר הפירות מותרים כעת באכילה.'

function sheniChilulText(scn: Scenario): string {
  const t = NUSACHIM[scn.nusachId]
  return scn.chilulMethod === 'pat' ? t.maaserSheniChilulPat : t.maaserSheniChilul
}
function revaiChilulText(scn: Scenario): string {
  const t = NUSACHIM[scn.nusachId]
  return scn.chilulMethod === 'pat' ? t.revaiChilulPat : t.revaiChilul
}

function buildDeclaration(scn: Scenario): string {
  const t = NUSACHIM[scn.nusachId]
  const parts: string[] = [t.terumaGedola, t.maaserRishon, t.terumatMaaser]

  if (scn.maaser.kind === 'sheni') {
    parts.push(t.maaserSheniLocation, sheniChilulText(scn))
    if (scn.certainty === 'demai') {
      // בדמאי מוסיפים את אפשרות מעשר עני מספק
      parts.push(t.safekAniLine)
    }
  } else if (scn.maaser.kind === 'ani') {
    parts.push(t.maaserAni)
  }

  if (scn.revai === 'vadai' || scn.revai === 'safek') {
    parts.push(revaiChilulText(scn))
  }

  return parts.join('\n')
}

/** שלב הכנת אמצעי החילול (מטבע או פת) */
function chilulPrepStep(scn: Scenario): Omit<Step, 'n'> {
  return scn.chilulMethod === 'pat'
    ? { kind: 'action', title: 'הכנת פת לחילול', body: PAT_INSTRUCTIONS }
    : { kind: 'action', title: 'ייחוד מטבע לחילול', body: COIN_INSTRUCTIONS }
}

export function generatePlan(scn: Scenario): GeneratedPlan {
  const t = NUSACHIM[scn.nusachId]
  const steps: Step[] = []
  let n = 1
  const push = (s: Omit<Step, 'n'>) => steps.push({ n: n++, ...s })

  // --- מצב שמיטה ---
  if (scn.maaser.kind === 'shmita') {
    return {
      steps: [
        {
          n: 1,
          kind: 'warning',
          title: 'שנת שמיטה',
          body:
            'הפרי שייך לשנת השמיטה. בדרך כלל אין מפרישים ממנו תרומות ומעשרות, ויש בו קדושת שביעית ' +
            '(איסור הפסד, חובת ביעור, וכו\'). הדינים תלויים במקור הפרי (אוצר בית דין, ספיחין, פרי שחנט בשישית ועוד). ' +
            'יש להתייעץ עם רב לגבי הטיפול הנכון בפרי זה.',
        },
      ],
      fullNusach: '',
      summary: ['שנת שמיטה', 'קדושת שביעית'],
      blocked: true,
    }
  }

  // --- מצב ערלה ---
  if (scn.revai === 'orlah') {
    return {
      steps: [
        {
          n: 1,
          kind: 'warning',
          title: 'חשש ערלה',
          body:
            'לפי הנתונים, הפרי בתוך שלוש שנות הערלה — אסור באכילה ובהנאה מן התורה, ואין מפרישים ממנו. ' +
            'אין להשתמש בפרי. החישוב הוא הערכה בלבד; ודאו את שנת הנטיעה והתייעצו עם רב.',
        },
      ],
      fullNusach: '',
      summary: ['חשש ערלה', 'אסור בהנאה'],
      blocked: true,
    }
  }

  // --- מצב רבעי ודאי: כל הפרי קודש, נפדה (ללא תרו"מ) ---
  if (scn.revai === 'vadai') {
    push({
      kind: 'info',
      title: 'הכנה — נטע רבעי',
      body:
        'הפרי הוא נטע רבעי (שנה רביעית לעץ): כל הפרי קודש ואין מפרישים ממנו תרומות ומעשרות, אלא פודים את כולו על מטבע.',
    })
    push(chilulPrepStep(scn))
    push({
      kind: 'declaration',
      title: 'אמירת נוסח הפדיון',
      body: 'אִמרו את נוסח חילול הרבעי:',
      say: revaiChilulText(scn),
    })
    push({
      kind: 'done',
      title: 'סיום',
      body:
        'לאחר הפדיון הפרי מותר באכילה. הקדושה עברה אל ' +
        (scn.chilulMethod === 'pat' ? 'הפת (שתושמד בכבוד). ' : 'המטבע. ') +
        '(יש הנוהגים לברך "על פדיון נטע רבעי" — היוועצו ברב לגבי מנהגכם.)',
    })
    return {
      steps,
      fullNusach: revaiChilulText(scn),
      summary: ['נטע רבעי ודאי', scn.chilulMethod === 'pat' ? 'פדיון על פת' : 'פדיון מלא על מטבע'],
    }
  }

  // ===== מסלול רגיל (וגם ספק רבעי, שמצרף סעיף רבעי לנוסח) =====
  const decl = buildDeclaration(scn)
  const needBrachaPidyon = scn.certainty === 'vadai' && scn.maaser.kind === 'sheni'

  // 1) הכנה
  push({
    kind: 'info',
    title: 'הכנה',
    body:
      'הניחו את כל הפירות לפניכם. קחו ביד חתיכה אחת בגודל מעט יותר ממאית מכמות הפירות (קצת יותר מאחוז אחד) — ' +
      'חתיכה זו תשמש לתרומה גדולה ולתרומת מעשר.' +
      (t.usesDirections ? ' רצוי שתהיה בצד צפון/עליון של הפירות.' : ' ניתן להחזיקהּ ביד בזמן אמירת הנוסח.') +
      (scn.certainty === 'demai'
        ? ' מכיוון שאינכם בטוחים שלא עושרו (דמאי/ספק) — מפרישים אך אין מברכים.'
        : ''),
  })

  // 2) הכנת אמצעי החילול (מטבע או פת)
  if (scn.needsCoin) {
    push(chilulPrepStep(scn))
  }

  // 3) ברכת ההפרשה (רק בוודאי)
  if (scn.certainty === 'vadai') {
    push({ kind: 'bracha', title: 'ברכת ההפרשה', body: 'לפני ההפרשה ברכו:', say: t.brachaHafrasha })
  }

  // 4) אמירת הנוסח (ההצהרה)
  push({
    kind: 'declaration',
    title: 'אמירת הנוסח',
    body: 'אִמרו את נוסח ההפרשה במלואו:',
    say: decl,
  })

  // 5) ברכת פדיון מעשר שני (רק בוודאי + שנת מעשר שני)
  if (needBrachaPidyon) {
    push({
      kind: 'bracha',
      title: 'ברכת פדיון מעשר שני',
      body:
        'בשנת מעשר שני, לפני אמירת החילול (אם לא נכלל לעיל), ברכו:' +
        (scn.chilulMethod === 'pat'
          ? ' (כשמחללים על פת/מאכל — יש המשנים או משמיטים ברכה זו, ובפרט בעדות המזרח; היוועצו ברב.)'
          : ''),
      say: t.brachaPidyon,
    })
  }

  // 6) סיום וטיפול בתרומה
  push({ kind: 'done', title: 'סיום וטיפול בתרומה', body: DISPOSAL_INSTRUCTIONS })

  // סיכום
  const summary: string[] = []
  summary.push(scn.maaser.kind === 'sheni' ? 'מעשר שני' : 'מעשר עני')
  summary.push(scn.certainty === 'vadai' ? 'ודאי טבל — עם ברכה' : 'דמאי/ספק — בלי ברכה')
  if (scn.revai === 'safek') summary.push('ספק רבעי')
  if (scn.needsCoin) summary.push(scn.chilulMethod === 'pat' ? 'חילול על פת' : 'חילול על מטבע')

  return { steps, fullNusach: decl, summary }
}
