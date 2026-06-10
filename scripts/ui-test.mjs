// בדיקות דפדפן מקיפות לממשק (Playwright + Chromium)
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE || 'http://localhost:5173/'
const SHOTS = 'scripts/shots'
mkdirSync(SHOTS, { recursive: true })

const results = []
const ok = (name, cond, detail = '') => results.push({ name, ok: !!cond, detail })
const strip = (s) => s.replace(/[֑-ׇ]/g, '').replace(/\s+/g, ' ').trim()

const browser = await chromium.launch()
const ctx = await browser.newContext({
  locale: 'he-IL',
  permissions: ['clipboard-read', 'clipboard-write'],
  viewport: { width: 414, height: 900 },
})
const page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

async function resultText() {
  return strip(await page.locator('#result').innerText())
}
async function clickNusach(title) {
  await page.locator('button.opt', { hasText: title }).click()
}
async function clickChip(text) {
  await page.locator('button.chip', { hasText: text }).first().click()
}

try {
  await page.goto(BASE, { waitUntil: 'networkidle' })

  // 1) טעינה בסיסית + RTL
  ok('כותרת העמוד', (await page.title()).includes('הפרשת תרומות'))
  ok('כיוון RTL', (await page.locator('html').getAttribute('dir')) === 'rtl')
  ok('כותרת ראשית מוצגת', await page.locator('h1', { hasText: 'הפרשת תרומות ומעשרות' }).isVisible())
  ok('אין שגיאות JS בטעינה', errors.length === 0, errors.join(' | '))

  // 2) מצב ברירת מחדל — תפוח, מקובל, ודאי, תאריך היום
  await page.locator('#produce').selectOption('apple')
  await page.screenshot({ path: `${SHOTS}/01-default.png`, fullPage: true })
  let r = await resultText()
  ok('תוצאה מציגה "אמירת הנוסח"', r.includes('אמירת הנוסח'))
  ok('ברירת מחדל ודאי → ברכת ההפרשה מופיעה', r.includes('ברכת ההפרשה'))

  // 3) מעבר בין כל הנוסחים — בדיקת טקסט ייחודי בכל אחד
  const NUSACH_SIG = [
    ['נוסח מקובל', 'העודף ממאית'],
    ['עדות המזרח', 'אחד ממאה שבידי'],
    ['חזון איש', 'יותר מאחד ממאה'],
    ['תימני', 'מן הפירות האלו'],
    ['נוסח מקוצר', 'העודף על אחד ממאה'],
  ]
  for (const [title, sig] of NUSACH_SIG) {
    await clickNusach(title)
    const txt = await resultText()
    ok(`נוסח "${title}" מציג טקסט ייחודי`, txt.includes(sig), `חסר: "${sig}"`)
  }
  await clickNusach('נוסח מקובל')

  // 4) שנת מעשר עני מול מעשר שני (פרי עץ) דרך בורר תאריך
  await clickChip('חישוב אוטומטי מתאריך')
  await page.locator('#hdate').fill('2026-02-20') // אחרי ט"ו בשבט → תשפ"ו → מעשר שני
  r = await resultText()
  ok('20.2.26 תפוח → מעשר שני', r.includes('מעשר שני'))
  ok('מעשר שני → ייחוד מטבע', r.includes('ייחוד מטבע'))
  ok('מעשר שני ודאי → ברכת פדיון', r.includes('ברכת פדיון מעשר שני'))
  await page.screenshot({ path: `${SHOTS}/02-maaser-sheni.png`, fullPage: true })

  await page.locator('#hdate').fill('2026-01-10') // לפני ט"ו בשבט → תשפ"ה → מעשר עני
  r = await resultText()
  ok('10.1.26 תפוח → מעשר עני', r.includes('מעשר עני'))
  ok('מעשר עני → אין ייחוד מטבע', !r.includes('ייחוד מטבע'))
  ok('מעשר עני → אין ברכת פדיון', !r.includes('ברכת פדיון'))

  // 5) ודאי מול דמאי — היעדר ברכה בדמאי
  await page.locator('#hdate').fill('2026-02-20')
  await clickChip('דמאי')
  r = await resultText()
  ok('דמאי → אין ברכת ההפרשה', !r.includes('ברכת ההפרשה'))
  ok('דמאי → עדיין מפרישים (אמירת הנוסח)', r.includes('אמירת הנוסח'))
  await clickChip('ודאי טבל')

  // 6) שמיטה — בחירה ידנית של תשפ"ט
  await clickChip('בחירה ידנית של השנה')
  await page.locator('#myear').fill('5789')
  r = await resultText()
  ok('תשפ"ט → אזהרת שמיטה', r.includes('שמיטה'))
  ok('שמיטה → אין נוסח הפרשה רגיל', !r.includes('אמירת הנוסח'))
  await page.screenshot({ path: `${SHOTS}/03-shmita.png`, fullPage: true })
  // חזרה לשנה רגילה
  await page.locator('#myear').fill('5786')
  await clickChip('חישוב אוטומטי מתאריך')
  await page.locator('#hdate').fill('2026-02-20')

  // 7) מקטע נטע רבעי מופיע רק לעצים
  ok('מקטע רבעי מופיע לעץ', await page.locator('h2', { hasText: 'נטע רבעי' }).isVisible())
  await page.locator('#produce').selectOption('tomato') // ירק
  ok('מקטע רבעי נעלם לירק', !(await page.locator('h2', { hasText: 'נטע רבעי' }).isVisible().catch(() => false)))
  await page.locator('#produce').selectOption('apple')

  // 8) חישוב רבעי אוטומטי — עץ שניטע תשפ"ג → פרי תשפ"ו = שנה רביעית → ודאי רבעי
  await clickChip('חשב לפי שנת נטיעה')
  await page.locator('#pyear').fill('5783')
  await clickChip('עד ט')
  r = await resultText()
  ok('ניטע תשפ"ג → נטע רבעי', r.includes('רבעי'))
  await page.screenshot({ path: `${SHOTS}/04-revai-auto.png`, fullPage: true })

  // עץ שניטע תשפ"א → פרי תשפ"ו = שנה 6 → רגיל
  await page.locator('#pyear').fill('5781')
  r = await resultText()
  ok('ניטע תשפ"א → פרי רגיל (יש תרו"מ)', r.includes('אמירת הנוסח'))

  // 9) קביעה ידנית: ערלה → חסום
  await clickChip('קביעה ידנית')
  await clickChip('חשש ערלה')
  r = await resultText()
  ok('ערלה ידנית → אזהרה', r.includes('ערלה'))
  ok('ערלה → חסום (אין אמירת הנוסח)', !r.includes('אמירת הנוסח'))
  await clickChip('לא רלוונטי')

  // 10) גידול "אחר" → צ'יפים של קטגוריה
  await page.locator('#produce').selectOption('custom')
  ok('"אחר" מציג בורר קטגוריה', await page.locator('button.chip', { hasText: 'פירות אילן' }).isVisible())
  await page.locator('#produce').selectOption('apple')

  // 11) כפתור העתקה → לוח
  await clickChip('בחירה ידנית של השנה')
  await page.locator('#myear').fill('5786') // מעשר שני, נוסח מלא
  await clickChip('חישוב אוטומטי מתאריך')
  await page.locator('#hdate').fill('2026-02-20')
  await page.locator('button.copybtn', { hasText: 'העתקת כל הנוסח' }).first().click()
  const clip = await page.evaluate(() => navigator.clipboard.readText())
  ok('כפתור "העתקת כל הנוסח" מעתיק נוסח', strip(clip).includes('תרומה גדולה'), `הועתק: ${strip(clip).slice(0, 40)}`)

  // 12) מקורות + הצהרה
  ok('הצהרה משפטית מוצגת', (await page.locator('.disclaimer').innerText()).includes('אינו פוסק הלכה'))
  ok('5 קישורי מקור', (await page.locator('.sources li').count()) === 5)
} catch (e) {
  ok('ריצת הבדיקות ללא חריגה', false, String(e))
} finally {
  ok('אין שגיאות JS לאורך כל הריצה', errors.length === 0, errors.slice(0, 3).join(' | '))
  await page.screenshot({ path: `${SHOTS}/05-final.png`, fullPage: true })
  await browser.close()
}

const pass = results.filter((r) => r.ok).length
console.log('\n===== תוצאות בדיקות הממשק =====')
for (const r of results) console.log(`${r.ok ? '✓' : '✗'} ${r.name}${r.ok ? '' : '  →  ' + r.detail}`)
console.log(`\n${pass}/${results.length} עברו`)
process.exit(pass === results.length ? 0 : 1)
