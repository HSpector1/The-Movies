// ── P17 legality matrix and release law on the REAL P16 rights read ───────────────────────────────────
//
// Authority: canonical rev02 f2eff635 §5.2/§5.3/§8/§10; charter r2 (1370-ae) RED items (1)–(3); Owner choices in
// P17-RECOVERED-SPECIFICATION-STATE.md (healthy reboot legal; dormant return is a DirectSequel, never a sixth type).
// World: `mintRoute` (one real player film A, its P16 property P held by the player); later installments are hand-built
// public results (tests/helpers/p17-law-fixtures.ts). Every rights answer is P16's own `permissionFor`/`branchAuthority`
// over the route state — there is no rights stand-in. The route-level laws (link versus mint, parent-bound spin-off
// authority, licence terms) run end to end in tests/p17-p16-rights.test.ts.

import { beforeAll, describe, expect, it } from 'vitest'
import {
  applyContinuationRelease,
  commitContinuationGreenlight,
  continuationInputsAtRelease,
  continuationQuote,
  emptyFranchiseRoot,
  type ContinuationRequest,
  type ProposedPrincipals,
} from '../src/core/continuation.js'
import { fatigueAt, momentumAt } from '../src/core/continuationSignals.js'
import { storyPropertyId } from '../src/core/rights.js'
import { TUNING } from '../src/core/tuning.js'
import type { FilmResult, FranchiseRoot, GameState } from '../src/core/types.js'
import { mintRoute } from './helpers/p16-fixtures.js'
import { film, lawWorld, type LawSpec } from './helpers/p17-law-fixtures.js'
import { sellTitle } from './helpers/p17-route.js'

let state: GameState
let A: string
let P: string
let player: string
beforeAll(() => {
  const route = mintRoute('p17-law-01')
  state = route.released
  A = route.productionId
  P = storyPropertyId(route.conceptId)
  player = state.hollywood!.playerStudioId
})

const PROPOSED: ProposedPrincipals = { writerId: 'w-1', directorId: 'd-1', cast: { lead: 'l-1', antagonist: 'a-1', support: 's-1' } }

function quote(spec: LawSpec, productionId: string, request: ContinuationRequest, on: GameState = state) {
  return continuationQuote(lawWorld(on, spec), { studioId: player, productionId, request, proposed: PROPOSED })
}

/** Quote, commit and (optionally) release one installment through the public law; a refused quote is a premise failure. */
function step(root: FranchiseRoot, spec: LawSpec, productionId: string, request: ContinuationRequest, released?: FilmResult): FranchiseRoot {
  const world = lawWorld(state, { ...spec, root })
  const q = continuationQuote(world, { studioId: player, productionId, request, proposed: PROPOSED })
  if (!q.ok) throw new Error(`premise: ${q.reason}`)
  const next = commitContinuationGreenlight(world, q, { studioId: player, productionId })
  return released === undefined ? next : applyContinuationRelease(next, { productionId, week: released.releaseTick, result: released, audience01: released.segmentScores.adult / 100 })
}

describe('P17 legality — the live P16 read, predecessor state and branches; never R/M/F', () => {
  it('a DirectSequel on the player-held property is lawful: P16 names the property, the main continuity takes it at 0.90', () => {
    const q = quote({}, 'q-1', { type: 'directSequel', predecessorProductionId: A })
    if (!q.ok) throw new Error(q.reason)
    expect(q.storyPropertyId).toBe(P)
    expect(q.branchKind).toBe('main')
    expect(q.similarity).toBe(0.9)
    expect(q.use).toBe('sequel')
  })

  it('the same request on a title the player sold refuses with P16\'s own answer, naming the holder', () => {
    const r01 = state.hollywood!.identities[1]!.studioId
    const sold = sellTitle(state, P, r01)
    const q = quote({}, 'q-1', { type: 'directSequel', predecessorProductionId: A }, sold)
    expect(q).toEqual({ ok: false, reason: expect.stringMatching(new RegExp(`holds no lawful sequel right in ${P} .*noAuthority:${r01}`)) })
  })

  it('otherwise-identical DirectSequel and Prequel quotes have equal legality, 0.90 similarity and identical numbers', () => {
    const seq = quote({}, 'q-1', { type: 'directSequel', predecessorProductionId: A })
    const pre = quote({}, 'q-1', { type: 'prequel', predecessorProductionId: A })
    expect(seq.ok && pre.ok).toBe(true)
    expect({ ...seq, type: 'same' }).toEqual({ ...pre, type: 'same' })
  })

  it('a missing, stale or cross-branch prequel reference refuses, and a refused quote can never be committed', () => {
    expect(quote({}, 'q-1', { type: 'prequel', predecessorProductionId: 'prod-nobody' })).toEqual({ ok: false, reason: 'no P16 StoryProperty links prod-nobody' })
    const withReboot = step(emptyFranchiseRoot(), {}, 'f-reboot', { type: 'reboot', predecessorProductionId: A })
    const rebootBranch = withReboot.properties[0]!.branches[1]!.branchId
    expect(quote({ root: withReboot }, 'q-1', { type: 'prequel', predecessorProductionId: A, branchId: rebootBranch }))
      .toEqual({ ok: false, reason: expect.stringMatching(/cross-branch reference/) })
    // 'f-reboot' is neither released nor a live locked production (no Production carries it)
    const stale = quote({ root: withReboot }, 'q-1', { type: 'prequel', predecessorProductionId: 'f-reboot' })
    expect(stale).toEqual({ ok: false, reason: 'predecessor f-reboot is neither released nor a locked-committed production' })
    expect(() => commitContinuationGreenlight(lawWorld(state, { root: withReboot }), stale, { studioId: player, productionId: 'q-1' })).toThrow(/cannot commit a refused quote/)
  })

  it('a Remake cites exactly one RELEASED film and files in its continuity; a locked film cannot be remade', () => {
    const locked = step(emptyFranchiseRoot(), { locked: ['f-lock'] }, 'f-lock', { type: 'directSequel', predecessorProductionId: A })
    expect(quote({ root: locked, locked: ['f-lock'] }, 'q-1', { type: 'remake', predecessorProductionId: 'f-lock' }))
      .toEqual({ ok: false, reason: 'a remake cites exactly one RELEASED film; f-lock is not released' })
    const remake = quote({ root: locked, locked: ['f-lock'] }, 'q-1', { type: 'remake', predecessorProductionId: A })
    if (!remake.ok) throw new Error(remake.reason)
    expect(remake.branchId).toBe(locked.properties[0]!.branches[0]!.branchId)
    expect(remake.similarity).toBe(0.7)
    expect(remake.use).toBe('remake')
    expect(remake.comparison01).toBeGreaterThan(0)
  })

  it('a Reboot of a HEALTHY property is lawful (Owner choice); a fourth open continuity refuses, and opens again once one is no longer live', () => {
    const healthy = quote({}, 'q-1', { type: 'reboot', predecessorProductionId: A })
    if (!healthy.ok) throw new Error(healthy.reason)
    expect(healthy.branchKind).toBe('reboot')
    expect(healthy.branchId).toBeNull()
    const L = { locked: ['r-1', 'r-2'] }
    const two = step(step(emptyFranchiseRoot(), L, 'r-1', { type: 'reboot', predecessorProductionId: A }), L, 'r-2', { type: 'reboot', predecessorProductionId: A })
    expect(quote({ ...L, root: two }, 'r-3', { type: 'reboot', predecessorProductionId: A }))
      .toEqual({ ok: false, reason: `3 continuities are open (cap ${TUNING.P17_MAX_OPEN_CONTINUITIES}); a continuity must go quiet for ${TUNING.P17_DORMANT_WEEKS} weeks before a new one opens` })
    // the two reboots stop being live productions (cancelled): the cap is derived, never a stored switch
    expect(quote({ root: two }, 'r-3', { type: 'reboot', predecessorProductionId: A }).ok).toBe(true)
  })

  it('a dormant return is a DirectSequel on the same continuity, never a sixth type; its release mints ONE activeAgain milestone', () => {
    const week = 8 + TUNING.P17_DORMANT_WEEKS + 250
    const back = film('f-back', week + 8, 80, 80, 1.5)
    const root = step(emptyFranchiseRoot(), { week, released: [back] }, 'f-back', { type: 'directSequel', predecessorProductionId: A }, back)
    const property = root.properties[0]!
    expect(property.installments.map((e) => e.type)).toEqual(['origin', 'directSequel'])
    expect(property.milestones).toEqual([{ milestoneId: 'activeAgain', productionId: 'f-back', week: week + 8 }])
    const ordinary = film('f-next', week + 30, 80, 80, 1.5)
    const after = applyContinuationRelease(step(root, { week: week + 20, released: [back, ordinary] }, 'f-next', { type: 'directSequel', predecessorProductionId: 'f-back' }),
      { productionId: 'f-next', week: week + 30, result: ordinary, audience01: 0.8 })
    expect(after.properties[0]!.milestones).toHaveLength(1)
  })
})

describe('P17 R/M/F at the seam — one composed read, property-wide Fatigue, per-continuity Momentum', () => {
  it('with nothing intervening the release read equals the locked greenlight read', () => {
    const world = lawWorld(state, {})
    const q = continuationQuote(world, { studioId: player, productionId: 'f-x', request: { type: 'directSequel', predecessorProductionId: A }, proposed: PROPOSED })
    if (!q.ok) throw new Error(q.reason)
    const root = commitContinuationGreenlight(world, q, { studioId: player, productionId: 'f-x' })
    expect(continuationInputsAtRelease(lawWorld(state, { root }), 'f-x', PROPOSED)).toBe(q.inheritedAwareness01)
  })

  it('a mediocre sequel builds property Fatigue; a reboot reads that same scalar in full and starts its own Momentum at zero', () => {
    const meh = film('f-meh', 30, 45, 45, 0.8)
    const root = step(emptyFranchiseRoot(), { week: 22, released: [meh] }, 'f-meh', { type: 'directSequel', predecessorProductionId: A }, meh)
    const property = root.properties[0]!
    expect(property.meter.fatigue).toBeGreaterThan(0)
    const q = quote({ root, week: 40, released: [meh] }, 'f-re', { type: 'reboot', predecessorProductionId: A })
    if (!q.ok) throw new Error(q.reason)
    expect(q.fatigue).toBe(fatigueAt(property.meter, 40))
    expect(q.momentum).toBe(0)
    const reboot = film('f-re', 48, 70, 70, 1.2)
    const rebooted = step(root, { week: 40, released: [meh, reboot] }, 'f-re', { type: 'reboot', predecessorProductionId: A }, reboot)
    const next = rebooted.properties[0]!
    expect(next.branches).toHaveLength(2)
    expect(momentumAt(next.branches[0]!, 48)).toBe(momentumAt(property.branches[0]!, 48)) // the main continuity's Momentum is untouched
    expect(next.branches[1]!.lastReleaseWeek).toBe(48)
    expect(next.meter.releaseCount).toBe(property.meter.releaseCount + 1) // one meter for the whole property
  })

  it('a second release of the same installment is refused: no double credit', () => {
    const f = film('f-once', 20, 70, 70, 1)
    const root = step(emptyFranchiseRoot(), { week: 12, released: [f] }, 'f-once', { type: 'directSequel', predecessorProductionId: A }, f)
    expect(() => applyContinuationRelease(root, { productionId: 'f-once', week: 20, result: f, audience01: 0.7 })).toThrow(/already released at week 20 \(no double credit\)/)
  })
})
