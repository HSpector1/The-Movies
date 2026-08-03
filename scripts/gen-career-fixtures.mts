// ── D-14 Phase 2 — Playwright fixture generator (real engine, seeded) ─────────
// Produces SaveFileV5 JSON fixtures for the career-UI journeys:
//   career-v5.json       — an engaged studio with TWO released films → real career events
//   career-migrated.json — the same, but the FIRST film's career events are removed to
//                          simulate a pre-V5 credit (honest "not recorded" + profile notice)
// Run: node_modules/.bin/vite-node scripts/gen-career-fixtures.mts

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  applyActions,
  beginFounding,
  generateWorld,
  makeSave,
  exportSave,
  tick,
  TUNING,
} from '../src/core/index.ts'
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

function release(s0: GameState, leadIdx: number): GameState {
  const c = s0.contracts.map((k) => s0.talent.find((t) => t.id === k.talentId)!)
  const actors = c.filter((t) => t.role === 'actor')
  const writer = c.find((t) => t.role === 'writer')!
  const director = c.find((t) => t.role === 'director')!
  const craft = c.find((t) => t.role === 'craft')!
  const concept = s0.concepts[leadIdx % s0.concepts.length]!
  let s = applyActions(s0, [
    {
      kind: 'greenlight',
      production: {
        conceptId: concept.id,
        shape: { opening: 'slowSetup', midpoint: 'escalation', ending: 'triumph' },
        promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] } },
        writerId: writer.id,
        directorId: director.id,
        cast: { lead: actors[leadIdx % 3]!.id, antagonist: actors[(leadIdx + 1) % 3]!.id, support: actors[(leadIdx + 2) % 3]!.id } as Record<CastSlot, string>,
        craftIds: [craft.id],
        budget: { negative: 5_000_000, marketing: 1_000_000 },
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

let s = foundEngaged('d14-career-fixture')
s = release(s, 0)
s = release(s, 1)

writeFileSync(join(outDir, 'career-v5.json'), exportSave(makeSave(s)))

// Migrated variant: drop the FIRST released film's career events (pre-V5 credit).
const firstFilmId = s.studio.releasedFilms[0]!.productionId
const migrated: GameState = { ...s, careerEvents: s.careerEvents.filter((e) => e.filmId !== firstFilmId) }
writeFileSync(join(outDir, 'career-migrated.json'), exportSave(makeSave(migrated)))

// Edge-case fixture (CLEARLY SYNTHETIC — for the loss + no-change presentation edges only,
// per owner §11). Two events on the first film are rewritten: an established-star visible
// FAILURE (Star Power −2.0) and a NO-CHANGE (delta 0). This exercises the UI's accessible
// negative/zero delta wording; it is NOT a claim about engine calibration (that is proven by
// the Phase-1 harness: E scenario −2.01). All other events remain the real engine output.
const evs = s.careerEvents.map((e) => ({ ...e }))
const onFirst = evs.filter((e) => e.filmId === firstFilmId)
if (onFirst[0]) {
  onFirst[0].starPowerBefore = 75.0
  onFirst[0].starPowerAfter = 73.0
  onFirst[0].starPowerDelta = -2.0
  onFirst[0].reasonCodes = ['substantialLeadExposure', 'weakAudienceResponse', 'establishedStarSaturation']
}
if (onFirst[1]) {
  onFirst[1].starPowerBefore = 20.0
  onFirst[1].starPowerAfter = 20.0
  onFirst[1].starPowerDelta = 0.0
  onFirst[1].reasonCodes = ['supportingRoleVisibility', 'limitedAudienceReach', 'noMeaningfulCareerChange']
}
const lossState: GameState = { ...s, careerEvents: evs }
writeFileSync(join(outDir, 'career-loss.json'), exportSave(makeSave(lossState)))

console.log(
  `wrote career-v5.json (${s.careerEvents.length} events, ${s.studio.releasedFilms.length} films) + career-migrated.json (dropped events for ${firstFilmId}) + career-loss.json (synthetic loss + no-change edge)`,
)
