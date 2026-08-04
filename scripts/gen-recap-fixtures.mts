// ── D-15 Studio Run Recap — Playwright fixture generator (real engine, seeded) ─
// Produces a SaveFileV5 session fixture: an engaged studio that released several films
// with ONE recurring lead and ONE genre (a concentrated slate, like the Week 86 run),
// across a spread of budgets so the recap shows a profit/loss mix, concentration, talent
// development, and a constrained current position.
// Run: node_modules/.bin/vite-node scripts/gen-recap-fixtures.mts

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { applyActions, beginFounding, generateWorld, makeSave, exportSave, tick, TUNING } from '../src/core/index.ts'
import type { CastSlot, CreativeRole, GameState } from '../src/core/index.ts'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = join(here, '..', 'ui', 'e2e', 'fixtures')
mkdirSync(outDir, { recursive: true })

function foundEngaged(seed: string): GameState {
  let s = beginFounding(generateWorld(seed))
  const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
  const need: Record<CreativeRole, number> = { writer: 1, director: 1, actor: 3, craft: 1 }
  for (const role of ['actor', 'director', 'writer', 'craft'] as CreativeRole[]) {
    for (const t of pool.filter((x) => x.role === role).slice(0, need[role])) {
      s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: 208 }])
    }
  }
  return applyActions(s, [{ kind: 'foundStudio' }])
}

function release(s0: GameState, negative: number, marketing: number): GameState {
  const c = s0.contracts.map((k) => s0.talent.find((t) => t.id === k.talentId)!)
  const actors = c.filter((t) => t.role === 'actor').sort((a, b) => a.fame - b.fame)
  const writer = c.find((t) => t.role === 'writer')!
  const director = c.find((t) => t.role === 'director')!
  const craft = c.find((t) => t.role === 'craft')!
  const concept = s0.concepts[0]! // one genre across the slate
  let s = applyActions(s0, [
    {
      kind: 'greenlight',
      production: {
        conceptId: concept.id,
        shape: { opening: 'slowSetup', midpoint: 'escalation', ending: 'triumph' },
        promise: {
          genre: concept.genre,
          intendedSegments: ['adult'],
          ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] },
        },
        writerId: writer.id,
        directorId: director.id,
        // one recurring lead (actors[0]) across the whole slate
        cast: { lead: actors[0]!.id, antagonist: actors[1]!.id, support: actors[2]!.id } as Record<CastSlot, string>,
        craftIds: [craft.id],
        budget: { negative, marketing },
      },
    },
  ])
  const pid = s.studio.activeProductions[s.studio.activeProductions.length - 1]!.id
  for (let k = 0; k < TUNING.PRODUCTION_TICKS + TUNING.THEATRICAL_WEEKS + 8; k++) {
    s = tick(s, { develop: true })
    const run = s.theatricalRuns.find((r) => r.productionId === pid)
    if (run && run.status !== 'active') break
  }
  return s
}

let s = foundEngaged('d15-recap-fixture')
// a spread of AFFORDABLE commitments (kept payable through the D-12 solvency gate); the
// higher-budget films tend to lose to the reach ceiling, the cheaper ones tend to win.
for (const [neg, mkt] of [
  [4_000_000, 400_000],
  [6_000_000, 1_000_000],
  [5_000_000, 500_000],
  [6_000_000, 1_000_000],
  [3_000_000, 100_000],
] as const) {
  try {
    s = release(s, neg, mkt)
  } catch (e) {
    console.warn(`skipped a film (${neg}+${mkt}): ${(e as Error).message.split('—')[0].trim()}`)
  }
}
// draw cash down toward a constrained position so the recap's current-position advice is exercised
const constrained: GameState = { ...s, studio: { ...s.studio, cash: 2_500_000 } }

writeFileSync(join(outDir, 'recap-run.json'), exportSave(makeSave(constrained)))
console.log(
  `wrote recap-run.json (${s.studio.releasedFilms.length} films, ${s.careerEvents.length} career events, week ${constrained.market.tick}, cash ${constrained.studio.cash})`,
)
