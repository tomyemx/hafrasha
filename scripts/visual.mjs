// לכידת מצבים ויזואליים לביקורת עיצוב
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
const BASE = process.env.BASE || 'http://localhost:5173/'
const DIR = 'scripts/visual'
mkdirSync(DIR, { recursive: true })

const browser = await chromium.launch()

async function shot(name, { width, height, actions }) {
  const ctx = await browser.newContext({ locale: 'he-IL', viewport: { width, height }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  await page.goto(BASE, { waitUntil: 'networkidle' })
  if (actions) await actions(page)
  await page.waitForTimeout(150)
  await page.screenshot({ path: `${DIR}/${name}.png`, fullPage: true })
  await ctx.close()
}
const chip = (page, t) => page.locator('button.chip', { hasText: t }).first().click()

// מובייל — מצב מעשר שני מלא
await shot('mobile-sheni', {
  width: 390, height: 844, actions: async (p) => {
    await chip(p, 'חישוב אוטומטי מתאריך'); await p.locator('#hdate').fill('2026-02-20')
  },
})
// מובייל — רבעי ודאי (מסלול מקוצר)
await shot('mobile-revai', {
  width: 390, height: 844, actions: async (p) => {
    await chip(p, 'חישוב אוטומטי מתאריך'); await p.locator('#hdate').fill('2026-02-20')
    await chip(p, 'חשב לפי שנת נטיעה'); await p.locator('#pyear').fill('5783'); await chip(p, 'עד ט')
  },
})
// דסקטופ רחב — בדיקת מרכוז ורקע
await shot('desktop', { width: 1280, height: 1000 })
// מובייל קטן מאוד — בדיקת התאמה
await shot('small', { width: 320, height: 720 })

await browser.close()
console.log('visual shots ready')
