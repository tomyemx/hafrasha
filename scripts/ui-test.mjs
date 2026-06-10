// בדיקות דפדפן מקיפות — מבנה דו-מסכי (Playwright + Chromium)
import { chromium } from 'playwright'

const BASE = process.env.BASE || 'http://localhost:5173/'
const results = []
const ok = (name, cond, detail = '') => results.push({ name, ok: !!cond, detail })
const strip = (s) => s.replace(/[֑-ׇ]/g, '').replace(/\s+/g, ' ').trim()

const browser = await chromium.launch()
const ctx = await browser.newContext({
  locale: 'he-IL',
  permissions: ['clipboard-read', 'clipboard-write'],
  viewport: { width: 390, height: 844 },
})
const page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

const seg = (t) => page.locator('.seg-btn', { hasText: t }).first().click()
const toResult = () => page.locator('.cta').click()
const toPrefs = () => page.locator('.back').click()

// אוסף את טקסט כל השלבים על-ידי דפדוף קדימה
async function allStepsText() {
  await page.waitForSelector('.stepcard')
  let txt = ''
  for (let guard = 0; guard < 20; guard++) {
    txt += ' ' + (await page.locator('.stepcard').innerText())
    const next = page.locator('.pgbtn.primary')
    if (await next.isDisabled()) break
    await next.click()
    await page.waitForTimeout(50)
  }
  return strip(txt)
}
async function stepCount() {
  return parseInt((await page.locator('.count').innerText()).match(/מתוך (\d+)/)?.[1] || '0', 10)
}

try {
  await page.goto(BASE, { waitUntil: 'networkidle' })

  // 1) טעינה + RTL + ללא שגיאות
  ok('כותרת העמוד', (await page.title()).includes('הפרשת תרומות'))
  ok('כיוון RTL', (await page.locator('html').getAttribute('dir')) === 'rtl')
  ok('מסך הגדרות מוצג (כפתור CTA)', await page.locator('.cta').isVisible())
  ok('בורר נוסח קיים', await page.locator('#nusach').isVisible())
  ok('אין שגיאות JS בטעינה', errors.length === 0, errors.join(' | '))

  // 2) ניווט בין מסכים
  await page.locator('#produce').selectOption('apple')
  await toResult()
  ok('מעבר למסך תוצאה', await page.locator('.pager').isVisible())
  ok('כפתור חזרה קיים', await page.locator('.back').isVisible())
  await toPrefs()
  ok('חזרה למסך הגדרות', await page.locator('.cta').isVisible())

  // 3) כל ששת הנוסחים — טקסט ייחודי
  const SIGS = [
    ['mekubal', 'העודף ממאית'],
    ['mizrach', 'אחד ממאה שבידי'],
    ['chazon-ish', 'יותר מאחד ממאה'],
    ['temani', 'מן הפירות האלו'],
    ['short', 'העודף על אחד ממאה'],
    ['no-directions', 'בחתיכה שבידי'],
  ]
  for (const [id, sig] of SIGS) {
    await page.locator('#nusach').selectOption(id)
    await toResult()
    const txt = await allStepsText()
    ok(`נוסח ${id} — טקסט ייחודי`, txt.includes(sig), `חסר "${sig}"`)
    if (id === 'mekubal') ok('נוסח עם כיוונים → איור הכיוונים מוצע', txt.includes('מה הכוונה'))
    if (id === 'no-directions') {
      ok('נוסח ללא כיוונים → אין "צפון"', !txt.includes('צפון'))
      ok('נוסח ללא כיוונים → אין הצעת איור', !txt.includes('מה הכוונה'))
    }
    await toPrefs()
  }
  await page.locator('#nusach').selectOption('mekubal')

  // 4) מעשר שני מול עני (פרי עץ) דרך תאריך
  await seg('תאריך לקיטה')
  await page.locator('input[type=date]').fill('2026-02-20')
  await toResult()
  let txt = await allStepsText()
  ok('20.2.26 תפוח → מעשר שני', txt.includes('מעשר שני'))
  ok('מעשר שני → ייחוד מטבע', txt.includes('ייחוד מטבע'))
  ok('מעשר שני ודאי → ברכת פדיון', txt.includes('ברכת פדיון מעשר שני'))
  await toPrefs()

  await page.locator('input[type=date]').fill('2026-01-10')
  await toResult()
  txt = await allStepsText()
  ok('10.1.26 תפוח → מעשר עני', txt.includes('מעשר עני'))
  ok('מעשר עני → אין ייחוד מטבע', !txt.includes('ייחוד מטבע'))
  await toPrefs()

  // 5) דמאי → אין ברכה
  await page.locator('input[type=date]').fill('2026-02-20')
  await seg('דמאי')
  await toResult()
  txt = await allStepsText()
  ok('דמאי → אין ברכת ההפרשה', !txt.includes('ברכת ההפרשה'))
  ok('דמאי → עדיין מפרישים', txt.includes('אמירת הנוסח'))
  await toPrefs()
  await seg('ודאי טבל')

  // 6) שמיטה (תשפ"ט) → חסום, שלב יחיד
  await seg('בחירה ידנית')
  await page.locator('#myear').selectOption('5789')
  await toResult()
  txt = await allStepsText()
  ok('תשפ"ט → אזהרת שמיטה', txt.includes('שמיטה'))
  ok('שמיטה → שלב יחיד', (await stepCount()) === 1)
  await toPrefs()
  await seg('תאריך לקיטה')
  await page.locator('input[type=date]').fill('2026-02-20')

  // 7) חילול על פת (חלונית מתקדם)
  await page.locator('.advanced-btn').click()
  ok('חלונית מתקדם נפתחת', await page.locator('.sheet').isVisible())
  await page.locator('.seg-btn', { hasText: 'על פת' }).click()
  await page.locator('.sheet-close').click()
  await toResult()
  txt = await allStepsText()
  ok('חילול על פת → שלב "הכנת פת"', txt.includes('הכנת פת'))
  ok('חילול על פת → נוסח מזכיר פת', txt.includes('פת'))
  ok('חילול על פת → אין ייחוד מטבע', !txt.includes('ייחוד מטבע'))
  await toPrefs()
  // חזרה למטבע
  await page.locator('.advanced-btn').click()
  await page.locator('.seg-btn', { hasText: 'על מטבע' }).click()
  await page.locator('.sheet-close').click()

  // 8) נטע רבעי אוטומטי (ניטע תשפ"ג → שנה רביעית)
  await page.locator('.advanced-btn').click()
  await page.locator('.seg-btn', { hasText: 'לפי נטיעה' }).click()
  await page.locator('#pyear').selectOption('5783')
  await page.locator('.seg-btn', { hasText: 'עד ט' }).click()
  await page.locator('.sheet-close').click()
  await toResult()
  txt = await allStepsText()
  ok('ניטע תשפ"ג → נטע רבעי', txt.includes('רבעי'))
  await toPrefs()
  await page.locator('.advanced-btn').click()
  await page.locator('.seg-btn', { hasText: 'עץ ותיק' }).click()
  await page.locator('.sheet-close').click()

  // 9) העתקה ללוח
  await toResult()
  // דפדוף עד שלב עם כפתור העתקה
  for (let g = 0; g < 10; g++) {
    if ((await page.locator('.copybtn').count()) > 0) break
    await page.locator('.pgbtn.primary').click()
    await page.waitForTimeout(50)
  }
  await page.locator('.copybtn').first().click()
  const clip = await page.evaluate(() => navigator.clipboard.readText())
  ok('כפתור העתקה מעתיק טקסט', strip(clip).length > 5, `הועתק: ${strip(clip).slice(0, 30)}`)
  await toPrefs()

  // 10) כפתור הסבר לשדה
  await page.locator('.help-btn').first().click()
  ok('כפתור הסבר פותח תיבת הסבר', await page.locator('.help-box').first().isVisible())
  await page.locator('.help-btn').first().click()

  // 11) תאריך לועזי לצד ט"ו בשבט (פרי עץ)
  await seg('תאריך לקיטה')
  await page.locator('input[type=date]').fill('2026-02-20')
  ok('הסבר השנה כולל ט"ו בשבט ותאריך לועזי', /ט.{0,2}ו בשבט/.test(await page.locator('.mini').innerText()) && /202\d/.test(await page.locator('.mini').innerText()))

  // 12) בחירת שנה עברית (לא מספרי)
  await seg('בחירה ידנית')
  ok('בחירת שנה היא רשימה נפתחת', (await page.locator('#myear').evaluate((el) => el.tagName)) === 'SELECT')
  ok('אפשרויות השנה בעברית', (await page.locator('#myear option').first().innerText()).includes('ה׳'))
  await seg('תאריך לקיטה')
  await page.locator('input[type=date]').fill('2026-02-20')

  // 13) ניסוח ימין/שמאל
  await page.locator('.advanced-btn').click()
  await page.locator('.seg-btn', { hasText: 'ימין / שמאל' }).click()
  await page.locator('.sheet-close').click()
  await toResult()
  txt = await allStepsText()
  ok('ימין/שמאל → הנוסח מזכיר ימין', txt.includes('ימין'))
  ok('ימין/שמאל → אין "צפון" בנוסח', !txt.includes('צפון'))
  await toPrefs()
  await page.locator('.advanced-btn').click()
  await page.locator('.seg-btn', { hasText: 'צפון / דרום' }).click()
  await page.locator('.sheet-close').click()

  // 14) המחשה ויזואלית גם בשלב ההכנה
  await toResult()
  ok('שלב ההכנה מציע איור כיוונים', (await page.locator('.stepcard').innerText()).includes('מה הכוונה'))
  ok('שלב ההכנה אומר "חתיכת פרי"', (await page.locator('.stepcard').innerText()).includes('חתיכת פרי'))
  await toPrefs()

  // 15) חלונית הבהרה ומקורות
  await page.locator('.linkbtn', { hasText: 'הבהרה' }).click()
  ok('הבהרה מוצגת', (await page.locator('.disclaimer').innerText()).includes('אינו פוסק הלכה'))
  ok('6 קישורי מקור', (await page.locator('.sources li').count()) === 6)
} catch (e) {
  ok('ריצה ללא חריגה', false, String(e))
} finally {
  ok('אין שגיאות JS לאורך הריצה', errors.length === 0, errors.slice(0, 3).join(' | '))
  await browser.close()
}

const pass = results.filter((r) => r.ok).length
console.log('\n===== תוצאות בדיקות הממשק =====')
for (const r of results) console.log(`${r.ok ? '✓' : '✗'} ${r.name}${r.ok ? '' : '  →  ' + r.detail}`)
console.log(`\n${pass}/${results.length} עברו`)
process.exit(pass === results.length ? 0 : 1)
