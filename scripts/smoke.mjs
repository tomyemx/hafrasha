// בדיקת עשן של המנוע מקצה לקצה (מתעלם מה-UI) — מהדר TS עם esbuild ומריץ תרחישים
import { build } from 'esbuild'
import { writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const entry = `
import { maaserYearFromDate, maaserYearFromHebrewYear } from '../src/domain/maaserYear.ts'
import { classifyOrlah } from '../src/domain/orlah.ts'
import { buildScenario } from '../src/domain/engine.ts'
import { generatePlan } from '../src/nusach/generate.ts'

export function run(dateStr, cat, nusachId, certainty, revaiOpt) {
  const maaser = maaserYearFromDate(new Date(dateStr + 'T12:00:00'), cat)
  let revai = 'none'
  if (revaiOpt) revai = revaiOpt
  const scn = buildScenario({ nusachId, produce: cat, produceLabel: 'בדיקה', certainty, maaser, revai, chilulMethod: 'coin', directionStyle: 'north-south' })
  const plan = generatePlan(scn)
  return { kind: maaser.kind, year: maaser.maaserYear, needsCoin: scn.needsCoin,
    steps: plan.steps.map(s => s.title), blocked: !!plan.blocked, nusachLen: plan.fullNusach.length }
}
export { classifyOrlah, maaserYearFromHebrewYear }
`
writeFileSync('scripts/_entry.ts', entry)

const res = await build({
  entryPoints: ['scripts/_entry.ts'],
  bundle: true, format: 'esm', platform: 'node',
  outfile: 'scripts/_bundle.mjs', logLevel: 'silent',
})
if (res.errors.length) { console.error(res.errors); process.exit(1) }

const mod = await import(pathToFileURL(process.cwd() + '/scripts/_bundle.mjs').href)

function show(label, r) {
  console.log(`\n• ${label}`)
  console.log(`  שנה ${r.year} | ${r.kind} | מטבע:${r.needsCoin} | חסום:${r.blocked} | אורך נוסח:${r.nusachLen}`)
  console.log('  שלבים: ' + r.steps.join(' → '))
}

show('תפוח (עץ) 20.2.26 מקובל ודאי', mod.run('2026-02-20', 'tree', 'mekubal', 'vadai'))
show('תפוח (עץ) 10.1.26 מקובל ודאי (שנת עני)', mod.run('2026-01-10', 'tree', 'mekubal', 'vadai'))
show('עגבנייה (ירק) 20.2.26 מזרח דמאי', mod.run('2026-02-20', 'vegetable', 'mizrach', 'demai'))
show('תפוח ודאי רבעי', mod.run('2026-02-20', 'tree', 'mekubal', 'vadai', 'vadai'))
show('תפוח ספק רבעי תימני', mod.run('2026-02-20', 'tree', 'temani', 'vadai', 'safek'))
show('ערלה', mod.run('2026-02-20', 'tree', 'mekubal', 'vadai', 'orlah'))

// שמיטה (תשפ"ט)
const shmita = mod.maaserYearFromHebrewYear(5789)
console.log('\n• שמיטה תשפ"ט: kind=' + shmita.kind)

// ערלה אוטומטי: עץ שניטע תשפ"ב, פרי תשפ"ו -> שנה רביעית? (treeYear = 5786-5782+1 = 5)
console.log('• ערלה אוטו (ניטע תשפ"ב עד ט"ו באב, פרי תשפ"ו): ' + JSON.stringify(mod.classifyOrlah(5782, true, 5786)))
console.log('• ערלה אוטו (ניטע תשפ"ג, פרי תשפ"ו): ' + JSON.stringify(mod.classifyOrlah(5783, true, 5786)))
