import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { p13aGeneratedStudio } from '/Users/zacheryspector/The-Movies-headless-program/src/harness/p13a/fixtures.ts'
import { tick } from '/Users/zacheryspector/The-Movies-headless-program/src/core/tick.ts'
import { exportSave, makeSave } from '/Users/zacheryspector/The-Movies-headless-program/src/core/save.ts'
let s = p13aGeneratedStudio('p13a-core-causal-01')
while (s.market.tick < 93) s = tick(s)
const negZero: string[] = []
const walk = (v: unknown, path: string) => {
  if (typeof v === 'number') { if (Object.is(v, -0)) negZero.push(path); return }
  if (Array.isArray(v)) { v.forEach((x, i) => walk(x, `${path}[${i}]`)); return }
  if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, `${path}.${k}`)
}
walk(s, 'state')
const raw = gunzipSync(readFileSync('/Users/zacheryspector/The-Movies-headless-program/tests/fixtures/p14/genuine-v42-pre-shelving-week93/genuine-v42-rival-stall-week-93.json.gz')).toString('utf8')
console.log(JSON.stringify({ week: s.market.tick, negZeroCount: negZero.length, sample: negZero.slice(0, 8), exportEqualsFixture: exportSave(makeSave(s)) === raw }))
