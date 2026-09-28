// Task 1315-C2, mode STAGE RED (test source only). Repo HEAD d8e90042, branch
// wip/headless-program-20260916-ts.
//
// STAGED FILE. Import paths are written for this file's INTENDED destination,
// `tests/p14b9-casting-expiry.test.ts` (see `tests/p14r3-save-v41.test.ts`'s header for the same
// staging convention this file follows). Physically staged at
// docs/engineering/playability-launch-review/evidence/p14b4-20260919/1315-stage2/tests/.
//
// REVISION 1315-C2 (over the frozen `1315-stage` draft, per `1315-X-red-dry-run.md` defect 3 and
// the LIVE_SAVE_VERSION "also" note):
//   1. The frozen draft signed six people in ONE `applyActions` call from an unmeasured seed's
//      week-0 list; `signContract` refused the sixth as "not currently available to sign
//      (D-11.14)" (`actions.ts:2576` re-reads `hiringMarketIds(state)` on the EVOLVING state, and
//      the pool it samples from shrinks as each earlier person in the same batch is signed). Fix:
//      the measured seed `r1314-casting-01` (1314-P: writer t-wri-05, director t-dir-04, craft
//      t-cra-09, actors t-act-24/t-act-08/t-act-20/t-act-12), one `signContract` per `applyActions`
//      call (1314-P/the producer's own pattern), matching this task's other four files.
//   2. NEW CASE (required by the coordinator): a counterpart whose OWN committed term ends BEFORE
//      the lead's expiry week. `bridge/relationships.ts`'s `rosterAt` predicate
//      (`row.terms.startWeek < week && (row.endedWeek === null || week < row.endedWeek)`) never
//      reads `terms.endWeekExclusive` at all — it only reads `endedWeek`, the EARLY-release
//      marker, which nothing sets on a contract's ordinary natural expiry. Naively reused at a
//      FUTURE week (the expiry row's own week, not the current tick), this predicate alone cannot
//      tell "still employed at that future week" from "was employed once, term already lapsed,
//      but nothing ever marked it ended." INTERPRETATION NAMED (1313-F Amendment 4 does not
//      state this; the coordinator's own dry-run note names it "the committed-term condition,"
//      not settled law — the reviewer rules on it): a correct implementation ALSO requires the
//      counterpart's own `terms.endWeekExclusive` to reach PAST the expiring person's own expiry
//      week, in addition to the bare `rosterAt` interval check. This file signs one counterpart
//      (`support`) for exactly the minimum term (52 weeks, `Contract.termWeeks: 52..208`) against
//      a longer lead term (60 weeks, the smallest choice still `> 52`), and asserts they are
//      EXCLUDED from the sentence despite an Inseparable edge, under this named interpretation.
//   3. LIVE_SAVE_VERSION note (coordinator "also"): the frozen draft's synthetic-edge-acceptance
//      leaf asserted `LIVE_SAVE_VERSION === 41` and called `validateSaveV41` directly — a hard
//      pin that would break the moment Save42 lands (a sibling, unrelated change to THIS leaf's
//      own law). Fixed: the acceptance check now reads `makeSave(s).saveVersion === LIVE_SAVE_VERSION`
//      and calls the DISPATCHING `validateSave`, so the leaf survives the writer move regardless
//      of which version is live when it runs.
//
// LAW UNDER TEST: 1313-A §2 as CORRECTED by 1313-F Amendment 4, PLUS the committed-term condition
// named above (`tiersOnRoster` cannot name a counterpart; the sentence is built from
// `state.relationships` directly, joined to `state.hollywood.employment` via
// `bridge/relationships.ts`'s `rosterAt` predicate, restated per that file's own documented rule
// since it is not exported). This file covers 1315-C required leaf 3.
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
// under test, nothing invented), the director-lead and antagonist-lead edges have ONLY
// `closeness`/`peakTier`/`peakTierWeek` varied to reach Inseparable — `edgeId`, `a`, `b`,
// `firstSharedWeek`, `lastEventWeek`, every counter and `recent` are left exactly as the engine
// wrote them. LEAD_TERM_WEEKS is kept small (60) specifically so the gap between the real take's
// week (~10-20, unmeasured for this route) and the expiry week (60) never exceeds
// `RELATIONSHIP_DRIFT_GRACE_WEEKS` (52) — the synthetic Inseparable value would otherwise drift
// back toward the baseline by the time `currentTier` is read at the row's own (future) week,
// which is a real, separate hazard from the committed-term condition above and is avoided by
// this term choice rather than by inventing a `lastEventWeek`. Each variant is validated whole
// via `makeSave` + the live `validateSave` (the same "the live writer must accept the WHOLE
// variant" discipline `withPromiseVariant` names for promises).
//
// INTERPRETATION NAMED (1313-F does not fix this further): "roster order" is read as the
// iteration order of `state.hollywood.employment` — this file signs contracts in a deliberate
// order (director, then antagonist, then support, then the never-seated bystander, then the
// expiring lead) so this order is a real, checkable fact rather than an assumption about a
// specific sort.

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { hiringMarketIds } from '../src/core/employment.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import { advanceTo, p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import { LIVE_SAVE_VERSION, makeSave, validateSave } from '../src/core/save.js'
import type { GameState, RelationshipEdge } from '../src/core/types.js'
import { financeUpcoming } from '../bridge/finance-upcoming.ts'

const SEED = 'r1314-casting-01'
const STAGE = 'facility-soundstage-07'
const SHAPE = { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' } as const
const RANGES = { intimacy: [-0.5, 0.5] as [number, number], tonalWeight: [-0.5, 0.5] as [number, number], kineticEnergy: [-0.5, 0.5] as [number, number] }
const LEAD_TERM_WEEKS = 60
const SHORT_TERM_WEEKS = 52 // Contract.termWeeks minimum; ends BEFORE the lead's expiry (60)
const EXPIRY_WEEK = LEAD_TERM_WEEKS // signed at week 0

type Cast = { writer: string; director: string; craft: string; antagonist: string; support: string; lead: string; bystander: string }

function deriveCast(s: GameState): Cast {
  const market = hiringMarketIds(s, 0)
  const byRole = (role: string) => market.filter((id) => s.talent.find((t) => t.id === id)?.role === role)
  const writer = byRole('writer')[0]
  const director = byRole('director')[0]
  const craft = byRole('craft')[0]
  const actors = byRole('actor')
  if (writer === undefined || director === undefined || craft === undefined || actors.length < 4) {
    throw new Error(`route premise failed: seed "${SEED}" week-0 hiring market does not hold a writer, director, craft and 4 actors (1314-P measured exactly this) — got ${JSON.stringify({ writer, director, craft, actors })}`)
  }
  const [antagonist, support, lead, bystander] = actors as [string, string, string, string]
  return { writer, director, craft, antagonist, support, lead, bystander }
}

/** Clearly labelled SYNTHETIC variant of a REAL edge (withPromiseVariant precedent): only
 * closeness/peakTier move, to Inseparable, reusing the edge's own real `lastEventWeek`/
 * `peakTierWeek` anchor (an already-recorded, valid week) rather than inventing one — safe from
 * drift here because LEAD_TERM_WEEKS is kept within RELATIONSHIP_DRIFT_GRACE_WEEKS of the real
 * take's week (see header). */
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
  // Deliberate signing order (see header "INTERPRETATION NAMED"): director, antagonist, support,
  // bystander, then the expiring lead — this fixes `state.hollywood.employment`'s append order.
  // One signContract per applyActions call (1315-C2 defect 3 — the measured 1314-P/producer
  // pattern; a batched array re-reads hiringMarketIds on an evolving, shrinking pool and can
  // refuse a later entry in the SAME batch).
  s = applyActions(s, [{ kind: 'signContract', talentId: cast.writer, termWeeks: 208 }])
  s = applyActions(s, [{ kind: 'signContract', talentId: cast.craft, termWeeks: 208 }])
  s = applyActions(s, [{ kind: 'signContract', talentId: cast.director, termWeeks: 208 }])
  s = applyActions(s, [{ kind: 'signContract', talentId: cast.antagonist, termWeeks: 208 }])
  s = applyActions(s, [{ kind: 'signContract', talentId: cast.support, termWeeks: SHORT_TERM_WEEKS }])
  s = applyActions(s, [{ kind: 'signContract', talentId: cast.bystander, termWeeks: 208 }])
  s = applyActions(s, [{ kind: 'signContract', talentId: cast.lead, termWeeks: LEAD_TERM_WEEKS }])
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
  // Route premise for the drift-safety argument in the header: the take must land early enough
  // that EXPIRY_WEEK (60) is within RELATIONSHIP_DRIFT_GRACE_WEEKS (52) of it.
  const take = s.firstTakes.find((t) => t.productionId === productionId)!
  if (EXPIRY_WEEK - take.week > 52) {
    throw new Error(`route premise failed: the first take landed at week ${String(take.week)}, more than 52 weeks before EXPIRY_WEEK ${String(EXPIRY_WEEK)} — the synthetic Inseparable variant would drift before the expiry week`)
  }
  const world: World = { state: s, cast }
  cachedWorld = world
  return structuredClone(world)
}

describe('1313-A §2 / 1313-F Amendment 4 — the Inseparable expiry note in financeUpcoming', () => {
  it('the SYNTHETIC Inseparable variants are a whole state the live writer accepts (makeSave + the live validateSave do not throw, whichever save version is live)', () => {
    const w = world()
    let s = withInseparableVariant(w.state, w.cast.director, w.cast.lead)
    s = withInseparableVariant(s, w.cast.antagonist, w.cast.lead)
    s = withInseparableVariant(s, w.cast.support, w.cast.lead)
    const saved = makeSave(s)
    expect(saved.saveVersion).toBe(LIVE_SAVE_VERSION)
    expect(() => validateSave(saved)).not.toThrow()
  }, 30_000)

  it('the contractExpiry row for the expiring lead names every Inseparable roster counterpart whose own committed term reaches past the expiry week, in employment order; says nothing for a stranger with no edge at all', () => {
    const w = world()
    let s = withInseparableVariant(w.state, w.cast.director, w.cast.lead)
    s = withInseparableVariant(s, w.cast.antagonist, w.cast.lead)

    const report = financeUpcoming(s)
    const window52 = report.windows.find((win) => win.windowWeeks === 52)
    expect(window52).toBeDefined()
    const row = window52!.rows.find((r) => r.kind === 'contractExpiry' && r.id === `expiry:${w.cast.lead}:${String(EXPIRY_WEEK)}`)
    expect(row).toBeDefined()

    const directorName = s.talent.find((t) => t.id === w.cast.director)!.name
    const antagonistName = s.talent.find((t) => t.id === w.cast.antagonist)!.name
    const bystanderName = s.talent.find((t) => t.id === w.cast.bystander)!.name

    expect(row!.detail).toContain('Inseparable')
    expect(row!.detail).toContain(directorName)
    expect(row!.detail).toContain(antagonistName)
    expect(row!.detail).not.toContain(bystanderName) // no edge at all with the lead
    expect(row!.detail.indexOf(directorName)).toBeGreaterThanOrEqual(0)
    expect(row!.detail.indexOf(antagonistName)).toBeGreaterThanOrEqual(0)
    expect(row!.detail.indexOf(directorName)).toBeLessThan(row!.detail.indexOf(antagonistName))
  }, 30_000)

  it('INTERPRETATION (1313-F Amendment 4 + the committed-term condition, not settled law — reviewer rules): a counterpart whose own committed term ends BEFORE the lead\'s expiry week is excluded despite an Inseparable edge, because the bare rosterAt interval predicate cannot read a future week without also checking the counterpart\'s own endWeekExclusive', () => {
    const w = world()
    const s = withInseparableVariant(w.state, w.cast.support, w.cast.lead)
    const supportContract = s.contracts.find((c) => c.talentId === w.cast.support)!
    expect(supportContract.endWeekExclusive).toBeLessThan(EXPIRY_WEEK) // route premise: support's own term ends before the lead's expiry

    const report = financeUpcoming(s)
    const window52 = report.windows.find((win) => win.windowWeeks === 52)!
    const row = window52.rows.find((r) => r.kind === 'contractExpiry' && r.id === `expiry:${w.cast.lead}:${String(EXPIRY_WEEK)}`)!
    const supportName = s.talent.find((t) => t.id === w.cast.support)!.name
    expect(row.detail).not.toContain(supportName)
  }, 30_000)
})
