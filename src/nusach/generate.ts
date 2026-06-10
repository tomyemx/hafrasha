import type { DirectionStyle, Scenario } from '../domain/types'
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
  /** האם להציג בשלב זה את איור הכיוונים */
  showDiagram?: boolean
}

export interface GeneratedPlan {
  steps: Step[]
  fullNusach: string
  summary: string[]
  blocked?: boolean
}

const COIN_INSTRUCTIONS =
  'ייחדו מטבע (למשל חצי שקל או שקל) שישמש לחילול מעשר שני ורבעי, והניחו אותו במקום שמור וקבוע. ' +
  'בכל הפרשה מעבירים את הקדושה אל חלק קטן מערכּו של המטבע (שווה פרוטה), והוא ממשיך לשמש פעמים רבות. ' +
  'כשהמטבע כמעט "מתמלא", מחללים את כל ערכּו על חתיכת סוכר או פרי ששווה פרוטה: עוטפים אותה היטב (בשקית או בנייר) ' +
  'ומניחים בפח בכבוד — אין לאוכלה — וממשיכים מחדש באותו מטבע.'

const PAT_INSTRUCTIONS =
  'הכינו חתיכת פת (או מאכל אחר) ששווה לפחות פרוטה — היא תשמש לחילול. ' +
  'לאחר אמירת הנוסח החתיכה הופכת למעשר שני: אין לאוכלה. עוטפים אותה היטב (בשקית או בנייר) ' +
  'ומניחים בפח בכבוד, כדרך שנוהגים בתרומה. ' +
  'חילול על פת מתאים בעיקר לכמות ביתית קטנה; לכתחילה עדיף לחלל על מטבע כסף.'

const DISPOSAL_INSTRUCTIONS =
  'החלק שהופרש לתרומה גדולה ולתרומת מעשר (מעט יותר ממאית) קדוש ואסור באכילה ובהנאה. ' +
  'עטפו אותו היטב (בשקית או בנייר) והניחו בפח בכבוד. שאר הפירות מותרים כעת באכילה.'

// ---- החלפת ניסוח הכיוונים: צפון/דרום ← ימין/שמאל ----
const DIRECTION_MAP: [string, string][] = [
  ['בְּצַד צְפוֹנוֹ', 'בְּצַד יְמִינוֹ'],
  ['שֶׁבְּצַד צָפוֹן', 'שֶׁבְּצַד יָמִין'],
  ['בַּצַּד הַצְּפוֹנִי', 'בַּצַּד הַיְּמָנִי'],
  ['שֶׁבַּצָּפוֹן', 'שֶׁבַּיָּמִין'],
  ['בִּצְפוֹנוֹ', 'בִּימִינוֹ'],
  ['בִּצְפוֹנָם', 'בִּימִינָם'],
  ['בִּדְרוֹם הַפֵּירוֹת', 'בִּשְׂמֹאל הַפֵּירוֹת'],
  ['בַּצַּד הַדְּרוֹמִי', 'בַּצַּד הַשְּׂמָאלִי'],
  ['בְּצַד דְּרוֹמוֹ', 'בְּצַד שְׂמֹאלוֹ'],
  ['בִּדְרוֹמוֹ', 'בִּשְׂמֹאלוֹ'],
  ['בִּדְרוֹמָם', 'בִּשְׂמֹאלָם'],
]

function applyDirectionStyle(text: string, style: DirectionStyle): string {
  if (style !== 'right-left') return text
  let out = text
  for (const [from, to] of DIRECTION_MAP) out = out.split(from).join(to)
  return out
}

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
    if (scn.certainty === 'demai') parts.push(t.safekAniLine)
  } else if (scn.maaser.kind === 'ani') {
    parts.push(t.maaserAni)
  }

  if (scn.revai === 'vadai' || scn.revai === 'safek') {
    parts.push(revaiChilulText(scn))
  }

  return applyDirectionStyle(parts.join('\n'), scn.directionStyle)
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

  // --- שמיטה ---
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

  // --- ערלה ---
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

  // --- נטע רבעי ודאי: כל הפרי קודש, נפדה (ללא תרו"מ) ---
  if (scn.revai === 'vadai') {
    push({
      kind: 'info',
      title: 'הכנה — נטע רבעי',
      body:
        'הפרי הוא נטע רבעי (שנה רביעית לעץ): כל הפרי קודש ואין מפרישים ממנו תרומות ומעשרות, ' +
        'אלא פודים את כולו (על מטבע או על פת ששווה פרוטה).',
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

  // ===== מסלול רגיל (וגם ספק רבעי) =====
  const decl = buildDeclaration(scn)
  const needBrachaPidyon = scn.certainty === 'vadai' && scn.maaser.kind === 'sheni'

  // 1) הכנה — חיתוך חתיכת פרי והנחתה
  const giftName = scn.maaser.kind === 'ani' ? 'מעשר עני' : 'מעשר שני'
  const sideTop = scn.directionStyle === 'right-left' ? 'ימין' : 'הצפוני (העליון)'
  const sideBot = scn.directionStyle === 'right-left' ? 'שמאל' : 'הדרומי (התחתון)'
  const placeText = t.usesDirections
    ? ` הניחו אותה בצד ${sideTop} של הערימה. בצד ${sideBot} יופיע ${giftName} — שם תקדישו אותו בעת אמירת הנוסח, ולכן הוא מסומן כבר עכשיו באיור.`
    : ' ניתן להחזיקהּ ביד בזמן אמירת הנוסח.'
  push({
    kind: 'info',
    title: 'הכנה',
    body:
      'הניחו את כל הפירות לפניכם. הפרישו חתיכת פרי בגודל מעט יותר ממאית מכמות הפירות (קצת יותר מאחוז אחד) — ' +
      'אם צריך, חתכו חתיכה כזו מאחד הפירות. חתיכה זו תשמש לתרומה גדולה ולתרומת מעשר.' +
      placeText +
      (scn.certainty === 'demai' ? ' מכיוון שאינכם בטוחים שלא עושרו (דמאי/ספק) — מפרישים אך אין מברכים.' : ''),
    showDiagram: t.usesDirections,
  })

  // 2) הכנת אמצעי החילול
  if (scn.needsCoin) push(chilulPrepStep(scn))

  // 3) ברכת ההפרשה (רק בוודאי)
  if (scn.certainty === 'vadai') {
    push({ kind: 'bracha', title: 'ברכת ההפרשה', body: 'לפני ההפרשה ברכו:', say: t.brachaHafrasha })
  }

  // 4) אמירת הנוסח
  push({
    kind: 'declaration',
    title: 'אמירת הנוסח',
    body: 'אִמרו את נוסח ההפרשה במלואו:',
    say: decl,
    showDiagram: t.usesDirections,
  })

  // 5) ברכת פדיון מעשר שני — נוסף רק כשזו שנת מעשר שני ודאי
  if (needBrachaPidyon) {
    push({
      kind: 'bracha',
      title: 'ברכת פדיון מעשר שני',
      body:
        'זוהי שנת מעשר שני — לפני חילול המעשר על המטבע/הפת, ברכו:' +
        (scn.chilulMethod === 'pat'
          ? ' (כשמחללים על פת/מאכל — יש המשנים או משמיטים ברכה זו, ובפרט בעדות המזרח; היוועצו ברב.)'
          : ''),
      say: t.brachaPidyon,
    })
  }

  // 6) סיום
  push({ kind: 'done', title: 'סיום וטיפול בתרומה', body: DISPOSAL_INSTRUCTIONS })

  const summary: string[] = []
  summary.push(scn.maaser.kind === 'sheni' ? 'מעשר שני' : 'מעשר עני')
  summary.push(scn.certainty === 'vadai' ? 'ודאי טבל — עם ברכה' : 'דמאי/ספק — בלי ברכה')
  if (scn.revai === 'safek') summary.push('ספק רבעי')
  if (scn.needsCoin) summary.push(scn.chilulMethod === 'pat' ? 'חילול על פת' : 'חילול על מטבע')

  return { steps, fullNusach: decl, summary }
}
