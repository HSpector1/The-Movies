import { beforeAll, describe, expect, it } from 'vitest'
import { exportSave, makeSave, validateSaveV29 } from '../src/core/save.js'
import { initialPhysicalPlans } from '../src/core/physicalPlans.js'
import { TUNING } from '../src/core/tuning.js'
import type { GameState } from '../src/core/types.js'
import { p13aResearchEntry } from '../src/harness/p13a/fixtures.js'
import { nextLaboratoryOrigin } from '../src/harness/p13b/fixtures.js'
import { s3ForgeAndReimport } from '../src/harness/p13b/s3-fixtures.js'

// P13B-S3 plan test 8 (task expansion, 2026-09-16). Requirement-derived from the
// "Validator" bullet and test 8's list in "S3 — Persistent physical plans,
// dependencies and admission" (docs/engineering/playability-launch-review/plans/
// P13B-HEADLESS-PLAN.md). Written against the contract as if `validateSaveV23`,
// `initialPhysicalPlans` and `state.physicalPlans` already existed — RED by
// design: the very first import fails ("Cannot find module .../physicalPlans.js")
// exactly like the other three P13B-S3 files, since `src/core/physicalPlans.ts`
// does not exist yet.
//
// MEASURED FINDING (2026-09-16, worth recording precisely): before this file
// imported anything from `physicalPlans.ts`, it imported only `validateSaveV23`
// from the REAL, EXISTING `save.ts` module. That import did NOT throw — this
// vitest/vite transform binds a missing named export from an EXISTING module to
// `undefined` at import time rather than raising Node ESM's strict
// "does not provide an export named" error (which the OTHER three P13B-S3 files
// only ever see because their missing imports come from a module that does not
// exist AT ALL, a harder failure vite's resolver catches during module
// resolution, before any binding check). With `validateSaveV23 === undefined`
// and never directly invoked, every `it()` fell through to `s3ForgeAndReimport`'s
// `exportSave(makeSave(state))` call, which hit an UNRELATED, already-live
// refusal — `validateSaveV12: state has unknown field "physicalPlans"` — for
// every single case. One of those cases (the "unknown dependency" case, whose
// expected regex was `/unknown/i`) then PASSED for the wrong reason: the
// unrelated generic error text happens to contain the word "unknown". That is a
// real, reproducible spurious-pass defect this file would have shipped with if
// left uncaught. Fixed by importing `initialPhysicalPlans` from the (currently
// nonexistent) `physicalPlans.ts` module too, restoring the same clean,
// uniform, whole-file "module not found" RED every other P13B-S3 file gets, with
// zero risk of a coincidental string match once nothing runs at all.
//
// FORGE-AND-REFUSE, not organic gameplay (this is the S2 idiom
// `tests/p13b-s2-validation.test.ts` already established, applied here because
// NOTHING in this engine can yet produce a genuine PhysicalPlan at all — there
// is no `queuePhysicalPlan` action to grow one honestly). Every baseline plan
// below is hand-authored, shaped exactly like the contract's `PhysicalPlan`,
// anchored to ONE real fact this engine already produces (a genuine, operational
// `acoustic-instruments` placement from `p13aResearchEntry()`) so the "started
// plan without/with the wrong placement" cases corrupt a REAL placement
// reference rather than inventing one from nothing. Each `it()` below forges
// exactly ONE named fact on the hand-authored baseline and expects a refusal
// naming that fact — never two facts at once, so a green run could not be
// hiding a second, undetected defect.
//
// The route named by the contract is "forged save JSON → importSave →
// validateSaveV23" — `s3ForgeAndReimport` (src/harness/p13b/s3-fixtures.ts)
// performs exactly that round trip (exportSave -> parse -> mutate -> importSave),
// shared with tests/p13b-s3-dependencies.test.ts's test 4. `validateSaveV23` is
// imported directly too, both to pin its exact name per the contract and
// because `importSave`'s dispatcher is expected to route a V23 envelope to it.

type Plan = Record<string, unknown>

function buildBaseline(): { state: GameState; planA: Plan; planB: Plan; planC: Plan } {
  const entry = p13aResearchEntry() // week 260, Lab operational, acoustic-instruments operational
  const laboratoryFacilityId = entry.operations.facilities.find(f => f.capability === 'laboratory')!.id
  const acousticPlacement = entry.placement.facilities.find(f => f.blueprintId === 'acoustic-instruments')!
  const playerStudioId = entry.hollywood!.playerStudioId
  const origin = nextLaboratoryOrigin(entry)

  const acousticQuote = {
    fingerprint: 'fp-plan-a', cost: TUNING.ACOUSTIC_INSTRUMENTS_CAPEX, buildWeeks: TUNING.ACOUSTIC_INSTRUMENTS_BUILD_WEEKS,
    weeklyOperatingCost: TUNING.SOUND_MODULE_WEEKLY_OPERATING_COST,
    components: [{ label: 'Acoustic instruments', cost: TUNING.ACOUSTIC_INSTRUMENTS_CAPEX, weeks: TUNING.ACOUSTIC_INSTRUMENTS_BUILD_WEEKS }],
  }
  const electricalQuote = {
    fingerprint: 'fp-plan-b', cost: TUNING.ELECTRICAL_CONTROL_INSTRUMENTS_CAPEX, buildWeeks: TUNING.ELECTRICAL_CONTROL_INSTRUMENTS_BUILD_WEEKS,
    weeklyOperatingCost: TUNING.ELECTRICAL_CONTROL_INSTRUMENTS_WEEKLY_OPERATING_COST,
    components: [{ label: 'Electrical control instruments', cost: TUNING.ELECTRICAL_CONTROL_INSTRUMENTS_CAPEX, weeks: TUNING.ELECTRICAL_CONTROL_INSTRUMENTS_BUILD_WEEKS }],
  }
  const labQuote = {
    fingerprint: 'fp-plan-c', cost: TUNING.RESEARCH_LABORATORY_CAPEX, buildWeeks: TUNING.RESEARCH_LABORATORY_BUILD_WEEKS,
    weeklyOperatingCost: TUNING.RESEARCH_LABORATORY_WEEKLY_OPERATING_COST, components: [{ label: 'Research Laboratory', cost: TUNING.RESEARCH_LABORATORY_CAPEX, weeks: TUNING.RESEARCH_LABORATORY_BUILD_WEEKS }],
  }

  const planA: Plan = { // a genuinely-anchored STARTED plan
    id: `${playerStudioId}:plan:1`, studioId: playerStudioId, ordinal: 1, queuedWeek: 255,
    work: { kind: 'installation', blueprintId: 'acoustic-instruments', target: { facilityId: laboratoryFacilityId } },
    dependsOn: [], approvedMaximumDebit: TUNING.ACOUSTIC_INSTRUMENTS_CAPEX, earliestStartWeek: 255,
    admission: 'reviewChangedQuote', approvedQuote: acousticQuote, pendingQuote: null,
    status: 'started', statusWeek: 255, reason: null,
    startedPlacementId: acousticPlacement.id, commitReceipt: { week: 255, fingerprint: acousticQuote.fingerprint, cost: acousticQuote.cost },
  }
  const planB: Plan = { // queued
    id: `${playerStudioId}:plan:2`, studioId: playerStudioId, ordinal: 2, queuedWeek: 260,
    work: { kind: 'installation', blueprintId: 'electrical-control-instruments', target: { facilityId: laboratoryFacilityId } },
    dependsOn: [], approvedMaximumDebit: TUNING.ELECTRICAL_CONTROL_INSTRUMENTS_CAPEX, earliestStartWeek: 260,
    admission: 'reviewChangedQuote', approvedQuote: electricalQuote, pendingQuote: null,
    status: 'queued', statusWeek: 260, reason: null, startedPlacementId: null, commitReceipt: null,
  }
  // statusWeek 260 (not 261): the validator requires statusWeek <= market.tick
  // (a lawful row is never ahead of the save boundary it's read at) and
  // >= queuedWeek — src/core/physicalPlans.ts, amended 2026-09-16 after this
  // baseline was first authored against a week-260 world.
  const planC: Plan = { // held, with a real pendingQuote
    id: `${playerStudioId}:plan:3`, studioId: playerStudioId, ordinal: 3, queuedWeek: 260,
    work: { kind: 'placement', blueprintId: 'research-laboratory', origin },
    dependsOn: [], approvedMaximumDebit: TUNING.RESEARCH_LABORATORY_CAPEX, earliestStartWeek: 260,
    admission: 'reviewChangedQuote', approvedQuote: labQuote, pendingQuote: { ...labQuote, fingerprint: 'fp-plan-c-changed' },
    status: 'held', statusWeek: 260, reason: 'quote changed', startedPlacementId: null, commitReceipt: null,
  }

  const withPlans: GameState = {
    ...entry,
    // P13B-S8 sweep: the plan root is shared. This studio's three hand-authored
    // rows stand BESIDE whatever plans the rivals of this world lawfully admitted
    // (their Laboratories), whose capital their own accounts already reconcile
    // against these very rows.
    physicalPlans: { ...initialPhysicalPlans(), nextPlanId: 4, plans: [...entry.physicalPlans.plans, planA, planB, planC] } as unknown as GameState['physicalPlans'],
  }
  return { state: withPlans, planA, planB, planC }
}

/**
 * P13B-S8 sweep: the plan root is shared, and this world's rivals have admitted
 * their own Laboratory plans onto it. Every positional read in this file means
 * THIS STUDIO's three hand-authored rows (planA, planB, planC), in their order;
 * `allPlansOf` is the raw list, for the cases that append to it.
 */
function allPlansOf(parsed: Record<string, unknown>): Plan[] {
  return ((parsed.state as Record<string, unknown>).physicalPlans as Record<string, unknown>).plans as Plan[]
}
function plansOf(parsed: Record<string, unknown>): Plan[] {
  const own = hollywoodOf(parsed).playerStudioId
  return allPlansOf(parsed).filter(plan => plan.studioId === own)
}
function physicalPlansOf(parsed: Record<string, unknown>): Record<string, unknown> {
  return (parsed.state as Record<string, unknown>).physicalPlans as Record<string, unknown>
}
function hollywoodOf(parsed: Record<string, unknown>): { playerStudioId: string; identities: { studioId: string }[] } {
  return (parsed.state as Record<string, unknown>).hollywood as { playerStudioId: string; identities: { studioId: string }[] }
}

function rejected(state: GameState, mutate: (parsed: Record<string, unknown>) => void, message: RegExp) {
  expect(() => s3ForgeAndReimport(state, mutate)).toThrow(message)
}

describe('P13B-S3 validator refusals for physicalPlans (test 8)', () => {
  let base: GameState

  beforeAll(() => {
    base = buildBaseline().state
  }, 60_000)

  // AMENDED (P13B-S6 live-version sweep, 2026-09-17): `makeSave` writes the
  // live envelope, now V26 — this case tracks whichever validator is live
  // rather than pinning a stale version number.
  it('accepts the unmutated hand-authored baseline directly through validateSaveV29', () => {
    const json = exportSave(makeSave(base))
    expect(() => validateSaveV29(JSON.parse(json))).not.toThrow()
  })

  it('(a) rejects a dependency cycle', () => {
    rejected(base, parsed => {
      const list = plansOf(parsed)
      const { playerStudioId } = hollywoodOf(parsed)
      const planD: Plan = { ...list[1]!, id: `${playerStudioId}:plan:4`, ordinal: 4, status: 'queued', dependsOn: [`${playerStudioId}:plan:5`], startedPlacementId: null, commitReceipt: null, pendingQuote: null }
      const planE: Plan = { ...list[1]!, id: `${playerStudioId}:plan:5`, ordinal: 5, status: 'queued', dependsOn: [`${playerStudioId}:plan:4`], startedPlacementId: null, commitReceipt: null, pendingQuote: null }
      allPlansOf(parsed).push(planD, planE)
      physicalPlansOf(parsed).nextPlanId = 6
    }, /cycle/i)
  })

  it('(b) rejects a dependency naming an unknown plan id', () => {
    rejected(base, parsed => {
      plansOf(parsed)[1]!.dependsOn = ['bogus:plan:999']
    }, /unknown/i)
  })

  it('(c) rejects two plans sharing one ordinal', () => {
    rejected(base, parsed => {
      plansOf(parsed)[1]!.ordinal = plansOf(parsed)[0]!.ordinal
    }, /ordinal/i)
  })

  it('(d) rejects a started plan whose placement does not exist', () => {
    rejected(base, parsed => {
      plansOf(parsed)[0]!.startedPlacementId = 999_999
    }, /placement/i)
  })

  it('(e) rejects a started plan whose placement carries a different blueprint', () => {
    rejected(base, parsed => {
      (plansOf(parsed)[0]!.work as Record<string, unknown>).blueprintId = 'electrical-control-instruments'
    }, /blueprint/i)
  })

  it('(f) rejects two started plans naming the SAME placement (duplicate commitReceipt)', () => {
    rejected(base, parsed => {
      const list = plansOf(parsed)
      const { playerStudioId } = hollywoodOf(parsed)
      const duplicate: Plan = { ...list[0]!, id: `${playerStudioId}:plan:4`, ordinal: 4 }
      allPlansOf(parsed).push(duplicate)
      physicalPlansOf(parsed).nextPlanId = 5
    }, /placement|receipt|duplicate/i)
  })

  it('(g) rejects a plan naming another studio\'s target (campaign isolation — the same FINDING/limitation tests/p13b-s2-validation.test.ts records: no public action path grows a genuine rival plan, so the rival side of this law is proven by structural injection)', () => {
    rejected(base, parsed => {
      const list = plansOf(parsed)
      const { playerStudioId, identities } = hollywoodOf(parsed)
      const rivalStudioId = identities.find(i => i.studioId !== playerStudioId)!.studioId
      list[1]!.studioId = rivalStudioId // planB's target facility still belongs to the PLAYER
    }, /studio/i)
  })

  it('(h) rejects a non-integer approvedMaximumDebit', () => {
    rejected(base, parsed => {
      plansOf(parsed)[1]!.approvedMaximumDebit = 350_000.5
    }, /integer/i)
  })

  it('(i) rejects nextPlanId that is not above every existing plan id', () => {
    rejected(base, parsed => {
      physicalPlansOf(parsed).nextPlanId = 1
    }, /nextPlanId/i)
  })

  it('(j) rejects a queued plan carrying a pendingQuote', () => {
    rejected(base, parsed => {
      const list = plansOf(parsed)
      list[1]!.pendingQuote = list[2]!.pendingQuote // borrow planC's real-shaped pendingQuote
    }, /queued|pending/i)
  })

  it('(k) rejects a held plan with no pendingQuote', () => {
    rejected(base, parsed => {
      plansOf(parsed)[2]!.pendingQuote = null
    }, /held|pending/i)
  })
})
