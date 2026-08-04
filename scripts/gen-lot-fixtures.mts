// Generate deterministic SaveFileV4 fixtures for the Gate D1 lot Playwright journeys.
// Run: npx vite-node scripts/gen-lot-fixtures.mts
// Writes save JSON the app restores from localStorage (ACTIVE_SESSION_KEY), for lot
// states that are awkward to reach by clicking through the UI (esp. two concurrent
// productions, which need disjoint talent). Engine-built — no invented data.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  applyActions,
  beginFounding,
  FOUNDING_MINIMUMS,
  generateWorld,
  tick,
  TUNING,
} from '../src/core/index.ts'
import type { CastSlot, CreativeRole, GameState } from '../src/core/index.ts'
import { exportSaveJson, studioLotSnapshot } from '../ui/src/engine/adapter.ts'

function sign(s: GameState, counts: Record<CreativeRole, number>): GameState {
  const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
  let out = s
  for (const role of Object.keys(counts) as CreativeRole[]) {
    for (const t of pool.filter((p) => p.role === role).slice(0, counts[role])) {
      out = applyActions(out, [{ kind: 'signContract', talentId: t.id, termWeeks: 156 }])
    }
  }
  return out
}
function found(seed: string, counts: Record<CreativeRole, number>): GameState {
  const s = sign(beginFounding(generateWorld(seed)), counts)
  return applyActions(s, [{ kind: 'foundStudio' }])
}
function rosterIds(s: GameState, role: CreativeRole): string[] {
  return s.contracts.map((c) => s.talent.find((t) => t.id === c.talentId)!).filter((t) => t.role === role).map((t) => t.id)
}
function greenlight(s: GameState, conceptIndex: number, slot: number): GameState {
  const concept = s.concepts[conceptIndex]!
  const actors = rosterIds(s, 'actor')
  const a = slot * 3
  const cast = { lead: actors[a]!, antagonist: actors[a + 1]!, support: actors[a + 2]! } as Record<CastSlot, string>
  return applyActions(s, [
    {
      kind: 'greenlight',
      production: {
        conceptId: concept.id,
        shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
        promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] } },
        writerId: rosterIds(s, 'writer')[slot]!,
        directorId: rosterIds(s, 'director')[slot]!,
        cast,
        craftIds: [rosterIds(s, 'craft')[slot]!],
        budget: { negative: concept.baseNegativeCost, marketing: 100_000 },
      },
    },
  ])
}
function advance(s: GameState, n: number): GameState {
  let out = s
  for (let i = 0; i < n; i++) out = tick(out)
  return out
}

const min: Record<CreativeRole, number> = { actor: FOUNDING_MINIMUMS.actor, director: FOUNDING_MINIMUMS.director, writer: FOUNDING_MINIMUMS.writer, craft: FOUNDING_MINIMUMS.craft }
const rich: Record<CreativeRole, number> = { actor: 6, director: 2, writer: 2, craft: 2 }

const empty = found('lot-fx-empty', min)
const one = advance(greenlight(found('lot-fx-one', min), 0, 0), 2)
let two = found('lot-fx-two', rich)
two = advance(greenlight(greenlight(two, 0, 0), 1, 1), 2)
const released = advance(greenlight(found('lot-fx-rel', min), 0, 0), TUNING.PRODUCTION_TICKS + 2)

// D1-A addition — warn: a large roster with no production burns payroll until the runway
// falls to the short-runway threshold, which is the one authoritative financial-pressure
// 'warning' the D1 selector emits (Administration). Advance deterministically until it fires.
// (Note: D1 fills Stage A first, so an isolated "Stage B active" is not an authentic snapshot;
// Stage B's active identity treatment is evidenced within the two-stage state instead.)
const adminWarns = (s: GameState): boolean =>
  studioLotSnapshot(s).buildings.find((b) => b.id === 'admin')?.attention === 'warning'
let warn = found('lot-fx-warn', { actor: 10, director: 4, writer: 4, craft: 4 })
for (let i = 0; i < 300 && !adminWarns(warn); i++) warn = tick(warn)

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'ui', 'e2e', 'fixtures')
mkdirSync(outDir, { recursive: true })
const fixtures = { empty, one, two, released, warn }
for (const [name, state] of Object.entries(fixtures)) {
  writeFileSync(join(outDir, `${name}.json`), exportSaveJson(state))
  const snap = studioLotSnapshot(state)
  const prods = state.studio.activeProductions.length
  const rel = state.studio.releasedFilms.length
  const activeStages = snap.activeProductions.filter((p) => p.active).map((p) => p.stageId).join('+') || 'none'
  const adminAtt = snap.buildings.find((b) => b.id === 'admin')?.attention ?? 'normal'
  // eslint-disable-next-line no-console
  console.log(
    `${name}: week=${state.market.tick} productions=${prods} releases=${rel} ` +
      `cashBand=${snap.cashBand} activeStages=${activeStages} adminAttention=${adminAtt} presence=${snap.releasePresence}`,
  )
}
