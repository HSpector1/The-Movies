// ── Mint the M5 Owner playtest save ─────────────────────────────────────────
//
//   npx vite-node tests/_m5PlaytestSave.ts
//
// Writes `m5-playtest.json` to the repo root: the exact studio §12-M5's
// hands-off gate is proven on, so the Owner watches the same weeks the tests
// watch. Load it from the Saves screen (Import → choose file).
//
// It is a SCRIPT, not a fixture and not a test. It lives beside the fixture it
// mints so the two can never drift, and it prints what the studio owes so the
// playtest sheet's numbers can be checked against the engine rather than
// remembered. Nothing here is authored: `livingStudioUnderPressure` calibrates
// itself and refuses to hand back a studio that does not keep its promise.

import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { exportSave, makeSave } from '../src/core/index.js'
import { livingStudioUnderPressure, studioTheWeekBeforeWrap } from './_m5Fixtures.js'

/** The seed the browser proof uses, so the Owner and the gate see one studio. */
const SEED = 'c2a-m5-hands-off-gate'
const QUIET_WEEKS = 16

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const write = (name: string, state: Parameters<typeof makeSave>[0]): string => {
  const path = resolve(root, name)
  writeFileSync(path, exportSave(makeSave(state)), 'utf8')
  return path
}

const fixture = livingStudioUnderPressure(SEED, QUIET_WEEKS)
const pressurePath = write('m5-playtest-pressure.json', fixture.state)
const wrap = studioTheWeekBeforeWrap('c2a-m5-playtest-wrap')
const wrapPath = write('m5-playtest-wrap.json', wrap)

const week = fixture.state.market.tick
process.stdout.write(
  [
    `Wrote ${pressurePath}`,
    '  THE HANDS-OFF STUDIO — the one §12-M5 is proven on.',
    `  studio week            ${String(week)}`,
    `  pictures in flight     ${String(fixture.state.studio.activeProductions.length)}`,
    `  waiting at the door    ${String(fixture.state.productionQueue.length)}`,
    `  quiet weeks it owes    ${String(fixture.quietWeeks)}  (to week ${String(week + fixture.quietWeeks)})`,
    `  queue drains after     ${String(fixture.queueDrainsAfter)}  (week ${String(week + fixture.queueDrainsAfter)})`,
    `  the shop opens after   ${String(fixture.buildCompletesAfter)}  (week ${String(week + fixture.buildCompletesAfter)})`,
    `  it stops itself on     week ${String(week + fixture.quietWeeks + 1)}  (the money)`,
    '',
    `Wrote ${wrapPath}`,
    '  THE WRAP STUDIO — one week short of principal photography wrapping.',
    `  studio week            ${String(wrap.market.tick)}`,
    `  pictures shooting      ${String(wrap.operations.workflows.filter((w) => w.phase === 'shooting').length)}`,
    `  wrap lands on          week ${String(wrap.market.tick + 1)}  (NOTIFY — the loop keeps working)`,
    '',
  ].join('\n'),
)
