// Record 1348-C — independent-test-engineer RED for P14B relationship rulings SLICE A, item 3
// (Mentor label, HIS-014 with 1347-F Amendment 1 and the "qualifying pictures" note). Authored
// on a scratch tree (1327-C method) at BASE f5b2ab92651d10e33c58f3f628b5d6eca3e96ca8, branch
// wip/headless-program-20260916-ts.
//
// REVISION 1348-C2 (review 1348-D blocking defect 1; parent response 1348-F item 1): the static
// `import * as relationshipLabels from '../src/core/relationshipLabels.js'` collapsed all 9 leaves
// into one suite-level collection failure (`0 test`), losing per-leaf attribution. Converted to
// PER-LEAF DYNAMIC IMPORT (`await import(...)` inside each test body via `loadLabels()`),
// matching the established in-repo technique from `1346-C-p15a1-wave1-red-handback.md` (the
// `loadMarket()`/`requireFn()` pattern for `tests/p15a1-shared-market.test.ts`, chosen there for
// the identical reason: "so every leaf gets its own attributed failure ... instead of one
// collection-level cascade that would make the classification JSON's rows redundant"). Every
// expectation below is UNCHANGED from 1348-C; only the import mechanism and each `it()`'s
// signature (now `async`) changed.
//
// REVISION 1348-C5 (parent rulings 1348-F4 item 3, production finding against 1348-E): the positive
// leaf's declared 30_000 ms budget was a false statement (measured 50.7-73.6 s against a purely
// synchronous fixture build). Raised to an honest, measured 180_000 ms. No expectation changed. See
// the note immediately above that leaf for the full measurement and the rejected `beforeAll`
// alternative.
//
// AUTHORITY (read in full before use):
//   docs/.../1340-O-owner-rulings-20260929.md HIS-014 (:80-90): "Mentor: the same director
//     directed an actor's first three qualifying pictures, where authoritative history
//     establishes those first three. Do not infer missing early-career history from an
//     incomplete record."
//   docs/.../1347-A-p14b-relationship-rulings-charter.md §2.4 (:62-66)
//   docs/.../1347-F-parent-relationship-charter-adoption.md Amendment 1 (:8-25), the "qualifying
//     pictures" non-blocking note (:46-48): "A person's career in the film world starts at the
//     earliest point the authoritative record fixes. For a cohort entrant, that point is the
//     CohortReceipt week ... Genesis people and authored-start people are excluded for a
//     different reason ... their first pictures lie before any record the game holds." /
//     "A qualifying picture is a distinct production whose recorded first take seats the actor
//     in any cast slot. Ordering and de-duplication follow `retainedTransitionEvidence`
//     (professionTransitions.ts:54-66)."
//
// PARENT API DECISION UNDER TEST (brief-1348-rel-sliceA-red.md): new module
// src/core/relationshipLabels.ts: `export const MENTOR_FIRST_PICTURES = 3`; `export function
// mentorEvidence(state: GameState, actorId: string): { directorId: string; productionIds:
// readonly [string, string, string]; entryWeek: number } | null`.
//
// RED MECHANISM: `src/core/relationshipLabels.ts` does not exist at BASE f5b2ab92. A DYNAMIC
// `await import('../src/core/relationshipLabels.js')` INSIDE each test body rejects with "Failed
// to load url ... Does the file exist?" scoped to that ONE test — sibling tests in this file that
// also import it are independently attributable (each is its own rejected promise), unlike a
// static top-level import which fails the whole file's collection at once. `requireFn`/
// `requireConst` below additionally guard against Vite binding a merely-MISSING named export of
// an eventually-existing module to `undefined` (the "vite binds a missing named export to
// undefined" pitfall) — once the module exists even partially during implementation, a missing
// individual export still fails loudly and per-leaf, never silently.
//
// FIXTURE STRATEGY (documented per leaf; see also the 1348-C handback "how each Mentor fixture
// establishes cohort entry and first takes"):
//   POSITIVE case — reuses tests/helpers/p14c3-cohort-transition-fixtures.ts's `cohortThreeFilms()`
//     UNCHANGED (an existing, accepted fixture already used by tests/p14c3-cohort-transition.test.ts):
//     a GENUINE `CohortReceipt` at week 832 for `COHORT_SUBJECT` (`careerLifecycle.cohorts`,
//     re-derived and validator-checked by that fixture's own `validateSaveV35` calls) and three
//     GENUINE `FirstTakeReceipt` rows (real `commissionScript`→`greenlightScriptProject`→shoot→
//     release cycles, one director for all three) — no staging at all for this leaf. MEASURED on
//     this scratch tree (dry run, not archived in the real repo): directorId 'authored-0000',
//     productionIds ['prod-2608','prod-2617','prod-2626'] in week order (2613/2622/2631),
//     CohortReceipt week 832.
//   NEGATIVE variants (two-of-three, duplicate, fewer-than-three) — take that SAME genuine base
//     state and vary EXACTLY the one field under test in memory (the p14b5 I3 "IN-MEMORY VARIANT"
//     convention, tests/p14b5-relationships.test.ts:44-48), keeping the real, validator-checked
//     `careerLifecycle.cohorts` root untouched. `state.firstTakes`'s OWN validator
//     (`validatePromiseRootsForVersion`, src/core/promises.ts:1553) re-derives no cross-root
//     content for these rows beyond personId/studioId/week bounds, so this is a legitimate,
//     validator-admissible shape even where re-validated; these particular derived states are NOT
//     re-run through `makeSave` (unlike tests/p14b10-conflict-evidence.test.ts's D5 states),
//     because `careerLifecycle.cohorts`'s OWN validator (`validateCohortReceipts`,
//     src/core/save.ts:9938) RE-DERIVES every receipt from `talent.slice(0, talentCountBefore)`
//     and would reject any world whose talent array does not exactly match the receipt's own
//     genuine construction — irrelevant to and untouched by this file's firstTakes-only edits, but
//     stated here rather than silently skipped.
//   GENESIS / AUTHORED-START absence — a genesis person needs no real production route at all:
//     the exclusion is structural (not named in ANY `CohortReceipt`), so a genesis person from a
//     plain `p13aGeneratedStudio()` world, given STAGED (in-memory) qualifying-picture-shaped
//     firstTakes under one director, must still read absent — proving the exclusion is enforced by
//     the cohort-receipt test specifically, not accidentally by some absent picture data. The
//     authored-start person is REAL (`createCustomTalent`, a genuine, cheap action; the same
//     helper pattern `addYoung` in tests/helpers/p14c3-cohort-transition-fixtures.ts:96-114 uses),
//     given the SAME staged firstTakes treatment, for the identical reason.
//
// SLICE A EXCLUSIONS: no romance, no Professional Rivals, no `competitions` log, no Save44, no
// projection change (1347-F Addendum).

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { trustDescriptor } from '../src/core/promises.js'
import { currentTier, pairChemistry } from '../src/core/relationships.js'
import { p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import { clone, fund } from './helpers/p14b2-fixtures.js'
import { cohortThreeFilms, COHORT_SUBJECT } from './helpers/p14c3-cohort-transition-fixtures.js'
import type { FirstTakeReceipt, GameState } from '../src/core/types.js'

// 1346-C technique (see header): dynamic per-test import + a loud guard against a merely-missing
// named export, so a partially-implemented module still fails per-leaf, never silently.
async function loadLabels(): Promise<Record<string, unknown>> {
  return (await import('../src/core/relationshipLabels.js')) as unknown as Record<string, unknown>
}
type MentorEvidenceFn = (state: GameState, actorId: string) => { directorId: string; productionIds: readonly string[]; entryWeek: number } | null
function requireFn<T extends (...a: never[]) => unknown>(mod: Record<string, unknown>, name: string): T {
  const fn = mod[name]
  if (typeof fn !== 'function') {
    throw new Error(
      `RED: src/core/relationshipLabels.ts does not export a function named '${name}' (got ${typeof fn}). ` +
        'This guard exists so a partially-implemented module fails loudly per-leaf instead of a vacuous pass.',
    )
  }
  return fn as T
}
function requireConst<T>(mod: Record<string, unknown>, name: string): T {
  if (!Object.hasOwn(mod, name)) {
    throw new Error(`RED: src/core/relationshipLabels.ts does not export '${name}'.`)
  }
  return mod[name] as T
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────────
describe('P14B10 T1 — the new module and its exports exist (RED per leaf: dynamic import)', () => {
  it('MENTOR_FIRST_PICTURES is the Owner\'s named 3 and mentorEvidence is a function', async () => {
    // HIS-014 (1340-O:81-82): "the same director directed an actor's first THREE qualifying pictures."
    const labels = await loadLabels()
    expect(requireConst<number>(labels, 'MENTOR_FIRST_PICTURES')).toBe(3)
    expect(typeof requireFn<MentorEvidenceFn>(labels, 'mentorEvidence')).toBe('function')
  })
})

// REVISION 1348-C5 (parent rulings 1348-F4 item 3, production finding against 1348-E): this leaf's
// declared 30_000 ms budget was a FALSE STATEMENT. `cohortThreeFilms()` (tests/helpers/
// p14c3-cohort-transition-fixtures.ts:214-...) drives three genuine commissionScript ->
// greenlightScriptProject -> shoot -> release cycles and is expensive — measured on the production
// candidate (1348-stage/1348-rel-sliceA-production-step3.patch, sha256 80540869...) in a SEPARATE
// throwaway copy per this revision's authorization: 50,804 ms isolated (matching 1348-E's own
// 50.7 s) and 73,573 ms run alongside the other two RED files (machine load contention). A Vitest
// per-test timeout can only be checked once control returns to the event loop; a purely synchronous
// test body never yields until it returns, so the declared number can never actually fire early —
// it can only be TRUE or FALSE against the eventual measured time, never enforced. 30_000 was false.
// `cohortThreeFilms()` is itself memoized per test-file process (`memo('three-films', ...)`, same
// file, :27-34), so only the FIRST caller in file declaration order pays this cost; the module
// import order here makes THIS leaf that first caller. Measured, the other five leaves in this file
// that also read `cohortThreeFilms()` (the three "negative and boundary" leaves via `baseAndTakes()`
// below, and the two "reading is inert" leaves) complete in 342-1381 ms on the same candidate run —
// well inside their own unchanged 30_000 ms budgets, which stay honest and are not touched. A shared
// `beforeAll` was considered and rejected: the memo already provides the sharing this file needs, so
// a `beforeAll` would only relabel which declared number carries the real cost, not remove the
// underlying "cannot fire mid-sync" property, at the cost of losing this file's established per-leaf
// independent-fixture-build isolation (the 1346-C technique this file already uses for import
// attribution). Fix: state the honest number, with generous headroom over both measured samples for
// slower CI hardware — 180_000 ms, a little under 2.5x the worse of the two measured samples.
// ─────────────────────────────────────────────────────────────────────────────────────────────────────
describe('Mentor — the positive case (a genuine cohort entrant, three genuine same-director pictures)', () => {
  it('mentorEvidence names the real director, the three real productionIds in week order, and the real cohort receipt week', async () => {
    const labels = await loadLabels()
    const mentorEvidence = requireFn<MentorEvidenceFn>(labels, 'mentorEvidence')
    const { state, team, pictureIds } = cohortThreeFilms()
    expect(pictureIds).toHaveLength(3) // fixture premise (already asserted by cohortThreeFilms itself)
    const receipt = state.careerLifecycle.cohorts.find((c) => c.personIds.includes(COHORT_SUBJECT))
    expect(receipt).toBeDefined() // fixture premise: COHORT_SUBJECT is genuinely named in a CohortReceipt
    const evidence = mentorEvidence(state, COHORT_SUBJECT)
    expect(evidence).toEqual({ directorId: team.directorId, productionIds: pictureIds, entryWeek: receipt!.week })
  }, 180_000) // 1348-C5/1348-F4 item 3: honest budget, measured 50,804 ms / 73,573 ms; see the header note above
})

// ── shared base for the in-memory firstTakes variants (I3 pattern) ──────────────────────────────────
function baseAndTakes() {
  const { state } = cohortThreeFilms()
  const takes = state.firstTakes.filter((t) => Object.values(t.cast).includes(COHORT_SUBJECT))
    .sort((a, b) => a.week - b.week)
  return { state, takes }
}

describe('Mentor — negative and boundary cases (1347-F Amendment 1 and the qualifying-pictures note)', () => {
  it('two of three sharing the director gives no label [RED: relationshipLabels.ts does not exist at BASE]', async () => {
    const labels = await loadLabels()
    const mentorEvidence = requireFn<MentorEvidenceFn>(labels, 'mentorEvidence')
    const { state, takes } = baseAndTakes()
    expect(takes).toHaveLength(3)
    const otherRealDirectorId = state.talent.find((t) => t.id !== takes[0]!.directorId && t.id !== COHORT_SUBJECT)!.id
    const varied: FirstTakeReceipt = { ...takes[1]!, directorId: otherRealDirectorId }
    const variantTakes = state.firstTakes.map((t) => (t.eventId === varied.eventId ? varied : t))
    const variant: GameState = { ...state, firstTakes: variantTakes }
    expect(mentorEvidence(variant, COHORT_SUBJECT)).toBeNull()
  }, 30_000)

  it('a duplicate first take of one production counts once — the label still names the same three original productions [RED]', async () => {
    const labels = await loadLabels()
    const mentorEvidence = requireFn<MentorEvidenceFn>(labels, 'mentorEvidence')
    const { state, takes } = baseAndTakes()
    const duplicate: FirstTakeReceipt = { ...takes[0]!, eventId: `first-take-event-${String(state.firstTakes.length)}` }
    const variant: GameState = { ...state, firstTakes: [...state.firstTakes, duplicate] }
    const evidence = mentorEvidence(variant, COHORT_SUBJECT)
    expect(evidence).not.toBeNull()
    expect(evidence!.productionIds).toEqual(takes.map((t) => t.productionId)) // unchanged: the 4th row is the SAME production, not a 4th picture
  }, 30_000)

  it('fewer than three qualifying pictures gives no label [RED]', async () => {
    const labels = await loadLabels()
    const mentorEvidence = requireFn<MentorEvidenceFn>(labels, 'mentorEvidence')
    const { state, takes } = baseAndTakes()
    const firstTwoIds = new Set(takes.slice(0, 2).map((t) => t.eventId))
    const variant: GameState = { ...state, firstTakes: state.firstTakes.filter((t) => firstTwoIds.has(t.eventId) || !Object.values(t.cast).includes(COHORT_SUBJECT)) }
    expect(mentorEvidence(variant, COHORT_SUBJECT)).toBeNull()
  }, 30_000)
})

// ── a plain generated world for the structural-exclusion cases (no cohort route needed) ────────────
function genesisWorld() {
  return fund(p13aGeneratedStudio())
}
/** Three STAGED (in-memory, reader-admitted — the p14b5 `stagedEdge` discipline applied to
 * firstTakes) qualifying-picture-shaped takes under ONE director, for `actorId` — the structural
 * shape that WOULD satisfy Mentor if the subject were named in a CohortReceipt. */
function stagedQualifyingTakes(state: GameState, actorId: string, directorId: string): readonly FirstTakeReceipt[] {
  const studioId = state.hollywood!.playerStudioId
  const support = state.talent.find((t) => t.id !== actorId && t.id !== directorId)!.id
  return [0, 1, 2].map((n) => ({
    eventId: `first-take-event-staged-${String(n)}`, week: state.market.tick, productionId: `staged-production-${String(n)}`,
    studioId, directorId, cast: { lead: actorId, antagonist: support, support },
  }))
}

describe('Mentor — genesis and authored-start people are structurally excluded (not named in ANY CohortReceipt)', () => {
  it('a genesis person with three staged same-director pictures still gets no label [RED]', async () => {
    const labels = await loadLabels()
    const mentorEvidence = requireFn<MentorEvidenceFn>(labels, 'mentorEvidence')
    const state = genesisWorld()
    const genesis = state.talent.find((t) => t.role === 'actor')!
    expect(state.careerLifecycle.cohorts.every((c) => !c.personIds.includes(genesis.id))).toBe(true) // fixture premise
    const director = state.talent.find((t) => t.id !== genesis.id)!.id
    const variant: GameState = { ...state, firstTakes: [...state.firstTakes, ...stagedQualifyingTakes(state, genesis.id, director)] }
    expect(mentorEvidence(variant, genesis.id)).toBeNull()
  })

  it('an authored-start person (createCustomTalent) with three staged same-director pictures still gets no label [RED]', async () => {
    const labels = await loadLabels()
    const mentorEvidence = requireFn<MentorEvidenceFn>(labels, 'mentorEvidence')
    let state = genesisWorld()
    state = applyActions(state, [{ kind: 'createCustomTalent', talent: { name: '1348 authored-start actor', role: 'actor', age: 30,
      workEthic: 55, fame: 25, actual: { warmth: 0, gravity: 0, physicality: 0.2 },
      skills: { acting: [20, 20, 20, 20, 20, 20], directing: [20, 20, 20, 20, 20, 20], writing: [20, 20, 20, 20, 20, 20], craft: [20, 20, 20, 20, 20, 20], research: [1, 1, 1, 1, 1, 1] } } }])
    const authored = state.talent.at(-1)!
    expect(authored.name).toBe('1348 authored-start actor') // fixture premise
    expect(state.careerLifecycle.cohorts.every((c) => !c.personIds.includes(authored.id))).toBe(true) // fixture premise
    const director = state.talent.find((t) => t.id !== authored.id)!.id
    const variant: GameState = { ...state, firstTakes: [...state.firstTakes, ...stagedQualifyingTakes(state, authored.id, director)] }
    expect(mentorEvidence(variant, authored.id)).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────────────────────────────────────────────
describe('Mentor — reading the label is inert (HIS-014: "labels create no additional ... effect by themselves")', () => {
  it('reading mentorEvidence leaves state deep-equal before/after [RED]', async () => {
    const labels = await loadLabels()
    const mentorEvidence = requireFn<MentorEvidenceFn>(labels, 'mentorEvidence')
    const { state } = cohortThreeFilms()
    const before = clone(state)
    mentorEvidence(state, COHORT_SUBJECT)
    expect(state).toEqual(before)
  }, 30_000)

  it('reading mentorEvidence changes no chemistry/tier/trust reading for the Mentor pair [RED]', async () => {
    const labels = await loadLabels()
    const mentorEvidence = requireFn<MentorEvidenceFn>(labels, 'mentorEvidence')
    const { state, team } = cohortThreeFilms()
    const week = state.market.tick
    const playerId = state.hollywood!.playerStudioId
    const before = {
      chemistry: pairChemistry(state, team.directorId, COHORT_SUBJECT, week),
      trust: trustDescriptor(state, COHORT_SUBJECT, playerId, week),
    }
    const edge = state.relationships.find((e) => [e.a, e.b].includes(team.directorId) && [e.a, e.b].includes(COHORT_SUBJECT))
    expect(edge).toBeDefined() // fixture premise: three shared productions genuinely form an edge
    const tierBefore = currentTier(edge!, week)
    mentorEvidence(state, COHORT_SUBJECT)
    const after = {
      chemistry: pairChemistry(state, team.directorId, COHORT_SUBJECT, week),
      trust: trustDescriptor(state, COHORT_SUBJECT, playerId, week),
    }
    expect(after).toEqual(before)
    expect(currentTier(edge!, week)).toBe(tierBefore)
  }, 30_000)
})
