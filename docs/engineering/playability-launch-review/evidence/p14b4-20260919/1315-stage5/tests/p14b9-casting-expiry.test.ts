// Task 1315-C5, mode STAGE RED (test source only). Repo HEAD 10ebc69a, branch
// wip/headless-program-20260916-ts.
//
// STAGED FILE. Import paths are written for this file's INTENDED destination,
// `tests/p14b9-casting-expiry.test.ts` (see `tests/p14r3-save-v41.test.ts`'s header for the same
// staging convention this file follows). Physically staged at
// docs/engineering/playability-launch-review/evidence/p14b4-20260919/1315-stage5/tests/.
//
// REVISION 1315-C5 (1315-D-casting-drivers-red-review.md, verdict REFINE):
//   - Required change 2, ADAPTED per the coordinator (the reviewer's own literal suggestion —
//     add `not.toContain(supportName)` to the naming leaf — is CONFOUNDED: support's own
//     committed term (52) already ends before the lead's expiry (60), so the committed-term
//     condition excludes it regardless of tier, and a broken tier gate would still pass). Added a
//     NEW leaf instead, using the antagonist (a real, un-elevated, below-Inseparable edge; a
//     committed term reaching past the expiry week) so tier is the only possible reason for
//     exclusion — see the leaf's own comment below.
//   - The INTERPRETATION leaf (Check 4 caveat: it passed VACUOUSLY on the unchanged engine,
//     since no name appears in `detail` for any reason yet) is now DIFFERENTIAL: it also elevates
//     the director and asserts their presence, so it is now an actual RED on the unchanged
//     engine, not merely a trivially-true absence check. The independent review's Check 4 ruled
//     the committed-term reading itself lawful and in fact necessary, not an invented rule — the
//     INTERPRETATION label is kept (the reviewer's ruling is about whether the reading is
//     DEFENSIBLE, not whether it is the only possible one; see 1315-D Check 4's own final
//     sentence: "implementation compliance remains open").
//
// REVISION 1315-C4 (over `1315-stage3`, per `1315-X3-red-r3-dry-run.md`): the shoot-assignment
// loop in `world()` assigned/scheduled on the loop's first pass (`if (n === 0)`), but the picture
// is still in Development at that point, not Shooting — `assignShootingDirector` refused
// ("productionId ... is not in Shooting"). Fixed by replacing that condition with the measured
// 1314-P condition (the same one `p14b9-casting-competition.test.ts`'s `greenlightCycle`/
// `1314-P`/the producer already use): assign and schedule once
// `remainingTicks <= 5 && flow?.phase !== undefined && flow.shootingTask?.status !== 'scheduled'`.
// The loop's bound (20 ticks) and its own body are otherwise unchanged. Parent-trial-verified
// (`1315-X3`): Save42 draft, all 3 expiry leaves pass; unchanged engine, the naming leaf fails
// for its stated reason and the other two pass, as 1315-C2 already disclosed. No other change in
// this file or any of the other four.
//
// REVISION 1315-C3 (over `1315-stage2`, per `1315-X2-red-r2-dry-run.md` defect 1 and
// `1315-P2-expiry-signing-probe.txt`): `1315-stage2`'s `deriveCast` paired the week-0 actors as
// `[antagonist, support, lead, bystander]` (lead = t-act-20, bystander = t-act-12); signing
// t-act-12 sixth (as `bystander`, 208 weeks) refused as "not currently available to sign"
// because `hiringMarketIds(state)` is recomputed after every signing and the sampled pool
// shrinks as each earlier person is signed. 1315-P2 measured ONE order on this exact seed where
// every signing in this role mix succeeds, with LEAD and BYSTANDER swapped from the 1315-C2
// draft: bystander = t-act-20 (6th, 208 weeks), lead = t-act-12 (7th, 60 weeks). Fixed below by
// pairing `[antagonist, support, bystander, lead] = actors` instead, and by asserting the whole
// derived mapping equals 1315-P2's measured mapping exactly (`MEASURED_MAPPING`, in
// `deriveCast`) — ids are still DERIVED from the week-0 market, never hardcoded as the signing
// targets, but a drift on this seed now fails loudly as a named route premise instead of as a
// confusing mid-signing D-11.14 refusal. The signing ORDER (director, antagonist, support,
// bystander, lead) and both non-default terms (support 52, lead 60) are unchanged from 1315-C2.
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
import { currentTier } from '../src/core/relationships.js'
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

// 1315-C3 fix (defect 1, `1315-P2-expiry-signing-probe.txt`): `hiringMarketIds(state)` is
// recomputed after every signing (the sampled pool shrinks as each earlier person is signed), so
// the week-0 snapshot alone does not guarantee every later signContract call in a sequence still
// finds its target listed. 1315-P2 measured ONE order on this exact seed where every signing in
// this file's role mix succeeds: writer t-wri-05 (208), craft t-cra-09 (208), director t-dir-04
// (208), antagonist t-act-24 (208), support t-act-08 (52), bystander t-act-20 (208), lead
// t-act-12 (60) — note LEAD and BYSTANDER are the third and fourth week-0 actors in that exact
// order (bystander = t-act-20, lead = t-act-12), the opposite pairing from the 1315-C2 draft,
// which is exactly why that draft's t-act-12 signing (as bystander, 6th) refused.
const MEASURED_MAPPING = { writer: 't-wri-05', craft: 't-cra-09', director: 't-dir-04', antagonist: 't-act-24', support: 't-act-08', bystander: 't-act-20', lead: 't-act-12' } as const

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
  // Ids are still DERIVED from the week-0 market (never hardcoded as the signing targets below),
  // but asserted equal to 1315-P2's measured mapping so a market drift on this seed fails loudly
  // here, as a named route premise, rather than as a confusing mid-signing D-11.14 refusal.
  const [antagonist, support, bystander, lead] = actors as [string, string, string, string]
  const cast: Cast = { writer, director, craft, antagonist, support, lead, bystander }
  const mismatch = (Object.keys(MEASURED_MAPPING) as (keyof typeof MEASURED_MAPPING)[])
    .find((role) => cast[role] !== MEASURED_MAPPING[role])
  if (mismatch !== undefined) {
    throw new Error(`route premise failed: seed "${SEED}" week-0 market mapping drifted from 1315-P2's measured mapping at "${mismatch}" — expected ${JSON.stringify(MEASURED_MAPPING)}, got ${JSON.stringify(cast)}`)
  }
  return cast
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
    // 1315-C4 fix (1315-X3-red-r3-dry-run.md): assign/schedule only once the picture has reached
    // Shooting, the measured 1314-P condition — not on the loop's first pass, which is still in
    // Development and refused ("productionId ... is not in Shooting").
    const flow = s.operations.workflows.find((w) => w.productionId === productionId)
    if (s.studio.activeProductions.find((p) => p.id === productionId)!.remainingTicks <= 5 && flow?.phase !== undefined
      && flow.shootingTask?.status !== 'scheduled') {
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

  // 1315-D required change 2 (Check 2 gap 2): "says nothing for a lower tier" was previously only
  // checked for `bystander`, who has NO edge at all with the lead — never for a roster counterpart
  // with a REAL, un-elevated edge below Inseparable, the one case that would catch a tier gate
  // that names ANY counterpart with ANY edge. `support` cannot serve this role: its own committed
  // term (52) ends before the lead's expiry (60), so the committed-term condition alone excludes
  // it regardless of tier — a broken tier gate would still pass. `antagonist` is used instead:
  // its edge with the lead is REAL (a natural sharedProduction take, never varied here) and its
  // own committed term (208 weeks) reaches well past the expiry week, so tier is the ONLY reason
  // it could be excluded.
  it('says nothing for a roster counterpart whose real edge is below Inseparable', () => {
    const w = world()
    const s = withInseparableVariant(w.state, w.cast.director, w.cast.lead)
    const antagonistEdge = s.relationships.find((e) => (e.a === w.cast.antagonist && e.b === w.cast.lead) || (e.a === w.cast.lead && e.b === w.cast.antagonist))
    expect(antagonistEdge, 'route premise: a real sharedProduction edge exists between the antagonist and the lead').toBeDefined()
    expect(currentTier(antagonistEdge!, EXPIRY_WEEK)).not.toBe('Inseparable') // route premise
    const antagonistContract = s.contracts.find((c) => c.talentId === w.cast.antagonist)!
    expect(antagonistContract.endWeekExclusive).toBeGreaterThan(EXPIRY_WEEK) // route premise: term reaches past the lead's expiry

    const report = financeUpcoming(s)
    const window52 = report.windows.find((win) => win.windowWeeks === 52)!
    const row = window52.rows.find((r) => r.kind === 'contractExpiry' && r.id === `expiry:${w.cast.lead}:${String(EXPIRY_WEEK)}`)!
    const directorName = s.talent.find((t) => t.id === w.cast.director)!.name
    const antagonistName = s.talent.find((t) => t.id === w.cast.antagonist)!.name
    expect(row.detail).toContain(directorName)
    expect(row.detail).not.toContain(antagonistName)
  }, 30_000)

  it('INTERPRETATION (1313-F Amendment 4 + the committed-term condition — ruled lawful and in fact necessary by the independent review, 1315-D Check 4; not settled beyond that ruling): a counterpart whose own committed term ends BEFORE the lead\'s expiry week is excluded despite an Inseparable edge, because the bare rosterAt interval predicate cannot read a future week without also checking the counterpart\'s own endWeekExclusive', () => {
    const w = world()
    // 1315-D Check 4 caveat / 1315-C5: made DIFFERENTIAL. Checking only support's absence passed
    // VACUOUSLY on the unchanged engine (no name appears in `detail` for any reason yet). Also
    // elevating the director and asserting their presence makes this leaf an actual RED there.
    let s = withInseparableVariant(w.state, w.cast.director, w.cast.lead)
    s = withInseparableVariant(s, w.cast.support, w.cast.lead)
    const supportContract = s.contracts.find((c) => c.talentId === w.cast.support)!
    expect(supportContract.endWeekExclusive).toBeLessThan(EXPIRY_WEEK) // route premise: support's own term ends before the lead's expiry

    const report = financeUpcoming(s)
    const window52 = report.windows.find((win) => win.windowWeeks === 52)!
    const row = window52.rows.find((r) => r.kind === 'contractExpiry' && r.id === `expiry:${w.cast.lead}:${String(EXPIRY_WEEK)}`)!
    const directorName = s.talent.find((t) => t.id === w.cast.director)!.name
    const supportName = s.talent.find((t) => t.id === w.cast.support)!.name
    expect(row.detail).toContain(directorName)
    expect(row.detail).not.toContain(supportName)
  }, 30_000)
})
