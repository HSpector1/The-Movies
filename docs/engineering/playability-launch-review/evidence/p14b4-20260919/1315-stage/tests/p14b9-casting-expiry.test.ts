// Task 1315-C, mode STAGE RED (test source only). Repo HEAD 75233cc2, branch
// wip/headless-program-20260916-ts.
//
// STAGED FILE. Import paths are written for this file's INTENDED destination,
// `tests/p14b9-casting-expiry.test.ts` (see `tests/p14r3-save-v41.test.ts`'s header for the same
// staging convention this file follows). Physically staged at
// docs/engineering/playability-launch-review/evidence/p14b4-20260919/1315-stage/tests/.
//
// LAW UNDER TEST: 1313-A §2 as CORRECTED by 1313-F Amendment 4
// (`tiersOnRoster` cannot name a counterpart; the sentence is built from `state.relationships`
// directly, joined to `state.hollywood.employment` via `bridge/relationships.ts`'s `rosterAt`
// predicate, restated per that file's own documented rule since it is not exported). This file
// covers 1315-C required leaf 3.
//
// RED MECHANISM: `bridge/finance-upcoming.ts`'s `contractExpiry` row construction
// (`bridge/finance-upcoming.ts:43-46`) does not read `state.relationships` or
// `state.hollywood.employment` at all today — the `detail` string is built ONLY from
// `weeklySalary`/`endWeekExclusive`. Every assertion below reads the REAL, unchanged `detail`
// string and finds the required sentence ABSENT — a plain `toContain` failure, not a missing-
// import RED (this leaf adds no new named export; it is a behavior change to an existing,
// already-exported function).
//
// SYNTHETIC EDGE (per task 1315-C: "If Inseparable is not reachable naturally within a bounded
// route, use a clearly labelled SYNTHETIC edge that the live writer accepts whole"). A single
// managed shared take lifts a pair at most `RELATIONSHIP_PROXIMITY_HIGH` (6) points from the
// baseline (56, Colleagues) — reaching Inseparable (>=81) naturally needs many repeated
// collaborations/successes, an unbounded route I could not measure without execution. Instead:
// ONE real production, one real first take (public actions only: `greenlight`,
// `assignShootingDirector`, `scheduleShootingTake`, `tick`), giving REAL `sharedProduction` edges
// among the four seats — then, on the `withPromiseVariant` precedent
// (`tests/helpers/p14c2c-fixtures.ts:109-117`: start from a REAL record, vary ONLY the field(s)
// under test, nothing invented), two of those edges have ONLY `closeness`/`peakTier`/
// `peakTierWeek` varied to reach Inseparable — `edgeId`, `a`, `b`, `firstSharedWeek`,
// `lastEventWeek`, every counter and `recent` are left exactly as the engine wrote them. Each
// variant is validated whole via `makeSave` + the live `validateSaveV41` (the same "the live
// writer must accept the WHOLE variant" discipline `withPromiseVariant` names for promises).
//
// INTERPRETATION NAMED (1313-F does not fix this further): "roster order" is read as the
// iteration order of `state.hollywood.employment` — this file signs contracts in a deliberate
// order (director, then antagonist, then support, then the expiring lead) so this order is a
// real, checkable fact rather than an assumption about a specific sort.

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { hiringMarketIds } from '../src/core/employment.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import { advanceTo, p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import { LIVE_SAVE_VERSION, makeSave, validateSaveV41 } from '../src/core/save.js'
import type { GameState, RelationshipEdge } from '../src/core/types.js'
import { financeUpcoming } from '../bridge/finance-upcoming.ts'

const SEED = 'r1315-expiry-01'
const STAGE = 'facility-soundstage-07'
const SHAPE = { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' } as const
const RANGES = { intimacy: [-0.5, 0.5] as [number, number], tonalWeight: [-0.5, 0.5] as [number, number], kineticEnergy: [-0.5, 0.5] as [number, number] }
const LEAD_TERM_WEEKS = 52
const EXPIRY_WEEK = LEAD_TERM_WEEKS // signed at week 0

type Cast = { writer: string; director: string; craft: string; antagonist: string; support: string; lead: string }

function deriveCast(s: GameState): Cast {
  const market = hiringMarketIds(s, 0)
  const byRole = (role: string) => market.filter((id) => s.talent.find((t) => t.id === id)?.role === role)
  const writer = byRole('writer')[0]
  const director = byRole('director')[0]
  const craft = byRole('craft')[0]
  const actors = byRole('actor')
  if (writer === undefined || director === undefined || craft === undefined || actors.length < 3) {
    throw new Error(`route premise failed: seed "${SEED}" week-0 hiring market does not hold a writer, director, craft and 3 actors — got ${JSON.stringify({ writer, director, craft, actors })}`)
  }
  const [antagonist, support, lead] = actors as [string, string, string]
  return { writer, director, craft, antagonist, support, lead }
}

function edgeOf(s: GameState, x: string, y: string): RelationshipEdge {
  const edge = s.relationships.find((e) => (e.a === x && e.b === y) || (e.a === y && e.b === x))
  if (edge === undefined) throw new Error(`route premise failed: no real edge exists yet between "${x}" and "${y}"`)
  return edge
}

/** Clearly labelled SYNTHETIC variant of a REAL edge (withPromiseVariant precedent): only
 * closeness/peakTier/peakTierWeek move, to Inseparable, reusing the edge's own real
 * `lastEventWeek` (an already-recorded, valid week) rather than inventing one. */
function withInseparableVariant(s: GameState, x: string, y: string): GameState {
  const idx = s.relationships.findIndex((e) => (e.a === x && e.b === y) || (e.a === y && e.b === x))
  if (idx === -1) throw new Error(`route premise failed: no real edge exists yet between "${x}" and "${y}" to vary`)
  const edge = s.relationships[idx]!
  const varied: RelationshipEdge = { ...edge, closeness: 81, peakTier: 'Inseparable', peakTierWeek: edge.lastEventWeek }
  const relationships = [...s.relationships]
  relationships[idx] = varied
  return { ...s, relationships }
}

type World = { state: GameState; cast: Cast }
let cachedWorld: World | null = null

function world(): World {
  if (cachedWorld !== null) return structuredClone(cachedWorld)
  let s = p13aGeneratedStudio(SEED)
  const cast = deriveCast(s)
  // Deliberate signing order (see header "INTERPRETATION NAMED"): director, antagonist,
  // support, then the expiring lead — this fixes `state.hollywood.employment`'s append order.
  s = applyActions(s, [
    { kind: 'signContract', talentId: cast.writer, termWeeks: 208 },
    { kind: 'signContract', talentId: cast.craft, termWeeks: 208 },
    { kind: 'signContract', talentId: cast.director, termWeeks: 208 },
    { kind: 'signContract', talentId: cast.antagonist, termWeeks: 208 },
    { kind: 'signContract', talentId: cast.support, termWeeks: 208 },
    { kind: 'signContract', talentId: cast.lead, termWeeks: LEAD_TERM_WEEKS },
  ])
  const mounted = s.sets.find((x) => x.mountedOn === STAGE && x.status !== 'retired')
  if (mounted !== undefined) s = applyActions(s, [{ kind: 'strikeSet', setId: mounted.id }])
  s = applyActions(s, [{ kind: 'commissionSet', commission: { blueprintId: 'set-grand-ballroom', stageFacilityId: STAGE } }])
  s = advanceTo(s, TUNING.SET_BUILD_WEEKS_BAND_HIGH)
  const concept = s.concepts[0]!
  s = applyActions(s, [{
    kind: 'greenlight',
    production: {
      conceptId: concept.id, shape: SHAPE, promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: RANGES },
      writerId: cast.writer, directorId: cast.director,
      cast: { lead: cast.lead, antagonist: cast.antagonist, support: cast.support }, craftIds: [cast.craft],
      budget: { negative: concept.baseNegativeCost, marketing: 0 },
    },
  }])
  const productionId = s.studio.activeProductions.at(-1)!.id
  for (let n = 0; !s.firstTakes.some((t) => t.productionId === productionId); n++) {
    if (n >= 20) throw new Error('route premise failed: no first take recorded within 20 ticks of greenlight + shoot assignment')
    if (n === 0) {
      s = applyActions(s, [
        { kind: 'assignShootingDirector', productionId, directorId: cast.director },
        { kind: 'scheduleShootingTake', productionId },
      ])
    }
    s = tick(s)
  }
  const world: World = { state: s, cast }
  cachedWorld = world
  return structuredClone(world)
}

describe('1313-A §2 / 1313-F Amendment 4 — the Inseparable expiry note in financeUpcoming', () => {
  it('the SYNTHETIC Inseparable variant is a whole state the live writer accepts (makeSave + validateSaveV41 do not throw)', () => {
    const w = world()
    expect(LIVE_SAVE_VERSION).toBe(41) // this leaf's synthetic-edge technique is written against the live Save41 writer
    let s = withInseparableVariant(w.state, w.cast.director, w.cast.lead)
    s = withInseparableVariant(s, w.cast.lead, w.cast.support)
    expect(() => validateSaveV41(makeSave(s))).not.toThrow()
  }, 30_000)

  it('the contractExpiry row for the expiring lead names each Inseparable roster counterpart, in employment order, and says nothing for the Colleagues-tier antagonist', () => {
    const w = world()
    let s = withInseparableVariant(w.state, w.cast.director, w.cast.lead)
    s = withInseparableVariant(s, w.cast.lead, w.cast.support)
    // Sanity on the route premise: the untouched lead-antagonist edge is a real sharedProduction
    // edge at natural proximity (HIGH = 6 above the RELATIONSHIP_BASELINE 50 = 56, Colleagues),
    // never varied — the "nothing for a lower tier" half of this leaf's law.
    const naturalAntagonistEdge = edgeOf(s, w.cast.lead, w.cast.antagonist)
    expect(naturalAntagonistEdge.closeness).toBeLessThan(81)

    const report = financeUpcoming(s)
    const window52 = report.windows.find((win) => win.windowWeeks === 52)
    expect(window52).toBeDefined()
    const row = window52!.rows.find((r) => r.kind === 'contractExpiry' && r.id === `expiry:${w.cast.lead}:${String(EXPIRY_WEEK)}`)
    expect(row).toBeDefined()

    const directorName = s.talent.find((t) => t.id === w.cast.director)!.name
    const supportName = s.talent.find((t) => t.id === w.cast.support)!.name
    const antagonistName = s.talent.find((t) => t.id === w.cast.antagonist)!.name

    expect(row!.detail).toContain('Inseparable')
    expect(row!.detail).toContain(directorName)
    expect(row!.detail).toContain(supportName)
    expect(row!.detail).not.toContain(antagonistName)
    expect(row!.detail.indexOf(directorName)).toBeGreaterThanOrEqual(0)
    expect(row!.detail.indexOf(supportName)).toBeGreaterThanOrEqual(0)
    expect(row!.detail.indexOf(directorName)).toBeLessThan(row!.detail.indexOf(supportName))
  }, 30_000)
})
