// ── P14B.1 tests 2-5: the promise record and its widened digest (2); the
// feasibility service (3); settlement freeze re-classification (4); outcomes
// (5) ────────────────────────────────────────────────────────────────────
//
// Requirement source: P14-HEADLESS-PLAN.md, "## P14B.1 — First Kept Promise
// Core — task expansion", Tests items 2-5 (quoted in full at each describe
// block below) and Scope — engine items (2)-(6). Law, by reference to
// docs/engineering/p14-preparation-8ef5246a/P14-PREPARATION-COMPANION.md
// §4.1 (what a promise is), §4.2 (the P1 family and its qualifying event),
// §4.3 (the feasibility service, its inputs and classification rule, and the
// worked Examples A/B/C/D), §4.4 (outcomes) and §2.1.8 (settlement freeze).
//
// RED-FIRST: `src/core/promises.ts` does not exist yet. `attachPromise`,
// `promiseFeasibility`, `promiseOutcomes` and `firstTakeReceipts` are all
// imported from it and CALLED below, so this file fails at module
// resolution before any test body runs (one TS2307, nothing else).
//
// INTERPRETATIONS NAMED (shared across all four describe blocks; each
// block's own header adds what is specific to it):
//   1. TWO DISTINCT draft shapes. `attachPromise(state, talentId,
//      issuerStudioId, draft)` widens the studio's CURRENT market proposal
//      for `talentId` (companion §4.1: a promise "is attached to a
//      proposal"), so its `draft` needs only the promise's own fields —
//      `{family, predicate, windowStartWeek, dueWeekExclusive}` — the
//      contract interval and the parties are read off the target proposal.
//      `promiseFeasibility(state, draft, week)` is a STANDALONE, pure probe
//      (companion §4.3: "answers one question at offer time and again at
//      settlement freeze") that is not tied to any submitted proposal, so
//      ITS `draft` additionally carries `issuerStudioId`, `beneficiaryPersonId`,
//      `startWeek` and `termWeeks` (naming the proposed contract interval
//      the window must lie inside), mirroring `proposalDraft`'s own
//      positional fields.
//   2. `attachPromise` mints a `promiseId`, appends the record to the root's
//      `promises` table, sets `promises: [promiseId]` on the target
//      proposal and widens its `digest`. "At most ONE promise per proposal
//      in B.1 (bounded hypothesis)" is read as ENFORCED BY REFUSAL — a
//      second `attachPromise` call on a proposal that already carries one
//      THROWS — not as a silent revise-in-place; the plan's own word
//      "enforced" reads as a refusal, not a normalization, and no
//      `detachPromise` name is given to make revision an explicit two-step
//      operation. A genuine "revise the attached promise" is therefore
//      exercised the SAME way an ordinary material-term revision already is
//      in this suite (tests/p14a1-settlement.test.ts, tests/p14a1-
//      disclosure.test.ts): re-`submitProposal` for the same (talentId,
//      issuerStudioId) — which this codebase's OWN convention already
//      treats as "revised in place", producing a fresh promise-less
//      proposal object — and then `attachPromise` a new draft onto it.
//   3. `promiseFeasibility`'s return (the persisted `feasibilityReceipt`,
//      companion §4.1) carries at least `classification` (`'REASONABLY_
//      ACHIEVABLE' | 'FRAGILE' | 'IMPOSSIBLE'`) and, when refused, a
//      `bottleneck` string naming the reason (companion §4.3.2: "shown as
//      'not offerable: reason' with the exact bottleneck"). Only these two
//      fields are asserted; the receipt's `inputsDigest`/`rulesVersion`
//      shape is not pinned.
//   4. `promiseOutcomes(state)` returns the promises that have reached a
//      terminal outcome — i.e. `state.promises` filtered to `outcome !==
//      null` — each carrying `outcome`, `outcomeWeek`, `outcomeCause` and
//      `evidenceRefs` (plan item 2's own field list on the persisted
//      record). Outcome evaluation (companion §4.4, "recorded immediately")
//      is read as happening inside `advanceTalentMarketWeek` (one of T2's
//      OWN named files, `talentMarket.ts`) rather than inside the
//      `releaseTalent`/`cancel` action handlers themselves (`actions.ts` is
//      NOT in T2's named file list) — "immediately" is read as "without
//      further delay beyond the engine's own weekly cadence", so this
//      file's termination/cancel outcome cases call ONE `tick()` after the
//      causing action before reading `promiseOutcomes`. This is a NAMED
//      DISAGREEMENT CANDIDATE if T2 instead writes the outcome synchronously
//      inside the action handler — recorded in this suite's cover report.
//   5. Wherever a promise record is constructed directly on `state.promises`
//      rather than through `attachPromise` (tests 4's drift case and every
//      sub-case of test 5), this mirrors the SAME "hand-forge the state,
//      call the accessor" technique tests/p14a1-save-v28.test.ts (R4) and
//      tests/p14a1-settlement.test.ts (induced price drift) already use for
//      facts no committed action can yet produce — declared as a premise,
//      not pinned as an observed fact.
//
// PREMISES NOT SATISFIED:
//   - Example A/D's own N_max/buffer ARITHMETIC is not reproduced (the
//     assigning brief: mirror the SHAPE, not the numbers — those numbers are
//     themselves a NUMERICAL/CONTENT HYPOTHESIS the service has not been
//     built to yet). Test 3 instead pins the parts of §4.3.2 that hold
//     regardless of the exact enumeration algorithm: the window-outside-
//     contract IMPOSSIBLE-by-construction rule, an X so large no plausible
//     pipeline reaches it, Example B's "an active promise consumes the
//     seat" shape, and purity/no-RNG.
//   - The exact wording of a FreezeDrop sentence for the new
//     `promiseNotFeasible` member is CANDIDATE, matched by
//     `/promise/i` against the settlement receipt's `dropped` array,
//     mirroring how `DROP_SENTENCE` itself is documented in
//     talentMarket.ts as "CANDIDATE WORDING... the coordinator pinned the
//     CONTRACT... not the prose."
//   - T2c (this pass): test 5's SATISFIED case and its due-week BROKEN case
//     are RE-EXPRESSED per the T2 ruling's "TEST-SIDE premises" note — see
//     each test's own header comment immediately above it for the specific
//     premise that failed and how it is corrected. The due-week BROKEN
//     case's new companion (a promise attached to a LOSING/withdrawn
//     proposal) is a deliberate RED case pinning RULING (i) — "a promise
//     BINDS only when its proposal is committed" — which `advancePromisesWeek`
//     does not yet enforce (T2b closes it); its RED output is recorded in
//     this task's own evidence file, not silently accepted as green.

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { hiringMarketIds } from '../src/core/employment.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import * as save from '../src/core/save.js'
import { p13aGeneratedStudio, advanceTo } from '../src/harness/p13a/fixtures.js'
import type { GameState, CastSlot, SegmentId } from '../src/core/types.js'
import { submitProposal, withdrawProposal } from '../src/core/talentMarket.js'
// RED-by-design: src/core/promises.ts does not exist. All four names below
// are CALLED, not merely imported.
import { attachPromise, promiseFeasibility, promiseOutcomes, firstTakeReceipts, trustDescriptor } from '../src/core/promises.js'

// ── shared local helpers (this file is self-contained; nothing is imported
// from any other tests/*.test.ts file, per this suite's convention) ────────

function signActor(state: GameState, termWeeks: number): { state: GameState; talentId: string } {
  const candidates = hiringMarketIds(state, 0)
  const actorId = candidates.map((id) => state.talent.find((t) => t.id === id)).find((t) => t?.role === 'actor')?.id
  if (actorId === undefined) throw new Error('fixture premise failed: no actor in the week-0 hiring market')
  const signed = applyActions(state, [{ kind: 'signContract', talentId: actorId, termWeeks }])
  return { state: signed, talentId: actorId }
}

/** Open a case for a fresh signing and submit the incumbent's (player's) own
 * retention at week 45 (window opens 40, decision week 52), mirroring
 * tests/p14a1-settlement.test.ts's own construction verbatim. */
function openPlayerCase(termWeeks = 52): { state: GameState; talentId: string; playerStudioId: string } {
  const { state: signed, talentId } = signActor(p13aGeneratedStudio(), termWeeks)
  const atWindow = advanceTo(signed, 45)
  const playerStudioId = atWindow.hollywood!.playerStudioId
  const submitted = submitProposal(atWindow, { talentId, issuerStudioId: playerStudioId, termWeeks, premiumTier: 1.1 })
  return { state: submitted, talentId, playerStudioId }
}

type ProposalWithPromises = { talentId: string; issuerStudioId: string; startWeek: number; digest: string; promises: readonly string[] }
function proposalOf(state: GameState, talentId: string, issuerStudioId: string): ProposalWithPromises {
  const found = state.talentMarket.proposals.find((p) => p.talentId === talentId && p.issuerStudioId === issuerStudioId)
  if (found === undefined) throw new Error(`test premise failed: no proposal for (${talentId}, ${issuerStudioId})`)
  return found as unknown as ProposalWithPromises
}

type PersistedPromise = {
  promiseId: string
  family: string
  issuerStudioId: string
  beneficiaryPersonId: string
  predicate: { count: number }
  windowStartWeek: number
  dueWeekExclusive: number
  feasibilityReceipt: { classification: string; bottleneck: string | null }
  progress: number
  evidenceRefs: readonly string[]
  outcome: string | null
  outcomeWeek: number | null
  outcomeCause: string | null
  contractId: string | null
}
function promisesOf(state: GameState): readonly PersistedPromise[] {
  return (state as unknown as { promises: readonly PersistedPromise[] }).promises
}
function withPromises(state: GameState, promises: readonly PersistedPromise[]): GameState {
  return { ...(state as unknown as Record<string, unknown>), promises } as unknown as GameState
}

/** RULING (i) (T2b): a promise BINDS only when its contractId names a REAL
 * employment row — the forward industry table `industryEmployment.ts` mints
 * (`${owner}:contract:${talentId}:${startWeek}:player-${ordinal}`), never
 * guessed by pattern here. Looked up by (talentId, studioId, still active);
 * throws a named premise error if no such row exists. */
function activeEmploymentContractId(state: GameState, talentId: string, studioId: string): string {
  const row = state.hollywood!.employment.find((e) => e.terms.talentId === talentId && e.studioId === studioId && e.endedWeek === null)
  if (row === undefined) {
    throw new Error(`test premise failed: no active employment row for "${talentId}" at studio "${studioId}"`)
  }
  return row.contractId
}

/** The plain `{kind:'greenlight'}` door — a full production payload built
 * from an UNUSED concept and already-CONTRACTED cast, mirroring
 * tests/contracts/_contractFixtures.ts's `productionPayload` shape (not
 * imported: this file stays self-contained per this suite's convention). */
function greenlightPayload(
  state: GameState,
  conceptIndex: number,
  directorId: string,
  writerId: string,
  craftId: string,
  cast: Record<CastSlot, string>,
) {
  const concept = state.concepts[conceptIndex]!
  return {
    conceptId: concept.id,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' } as const,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'] as SegmentId[],
      ranges: { intimacy: [-0.5, 0.5] as [number, number], tonalWeight: [-0.5, 0.5] as [number, number], kineticEnergy: [-0.5, 0.5] as [number, number] },
    },
    writerId,
    directorId,
    cast,
    craftIds: [craftId],
    budget: { negative: concept.baseNegativeCost, marketing: 0 },
  }
}

/** Signs one free-agent person of `role`, found by walking the hiring
 * market forward one week at a time (D-11.14: a candidate `state.talent`
 * merely CONTAINS is not necessarily one `signContract` currently accepts —
 * `hiringMarketIds` is the one lawful gate, exactly as `signActor` above
 * already reads it; a role not in THIS week's rotation is searched again
 * next week rather than assumed absent). */
function signOne(state: GameState, role: 'actor' | 'director' | 'writer' | 'craft', termWeeks = 208): { state: GameState; id: string } {
  let next = state
  for (let i = 0; i < 60; i++) {
    const week = next.market.tick
    const candidates = hiringMarketIds(next, week)
    const person = candidates.map((id) => next.talent.find((t) => t.id === id)).find((t) => t?.role === role)
    if (person !== undefined) return { state: applyActions(next, [{ kind: 'signContract', talentId: person.id, termWeeks }]), id: person.id }
    next = tick(next)
  }
  throw new Error(`test premise failed: no free-agent ${role} found within 60 weeks`)
}

const STAGE_7 = 'facility-soundstage-07'

function contractedByRole(state: GameState, role: string): readonly { id: string }[] {
  return state.contracts
    .filter((c) => state.talent.find((t) => t.id === c.talentId)?.role === role)
    .map((c) => state.talent.find((t) => t.id === c.talentId)!)
}

/** A cash bootstrap before any production choice is made — the SAME
 * 30,000,000 headroom the P14B.1-T0 fixture's own minter used (`src/harness/
 * p14/legacy-v28-fixtures.ts` block (d)), not a fact about the picture. */
function fundTo(state: GameState, target: number): GameState {
  const delta = target - state.studio.cash
  if (delta === 0) return state
  return {
    ...state,
    studio: { ...state.studio, cash: target },
    ledger: [...state.ledger, { week: state.market.tick, kind: (delta > 0 ? 'studioRevenue' : 'overhead') as 'studioRevenue' | 'overhead', amount: delta, note: 'test fixture cash bootstrap' }],
  }
}

/**
 * Builds a PLAYER production on an INDUSTRY world to `remainingTicks === 5`
 * with its shooting task SCHEDULED — the T0 minter's own recipe (sign the
 * roster, fund, commission and build a grand-ballroom Set on
 * `facility-soundstage-07`, greenlight, walk to Rehearsal, select
 * `ballroom-reveal-lighting-01`, tick to `remainingTicks === 5`) plus the
 * `assignShootingDirector` + `scheduleShootingTake` actions the T0 fixture
 * deliberately stopped short of, so the 5 -> 4 branch (operations.ts ~1653)
 * fires on the very next tick. Duplicated from tests/p14b1-first-take.test.ts
 * per this suite's own self-contained-file convention (see that file's
 * header note 5).
 */
function buildScheduledPlayerProduction(): { state: GameState; productionId: string; directorId: string; cast: Record<CastSlot, string> } {
  let state = p13aGeneratedStudio()
  state = signOne(state, 'writer').state
  state = signOne(state, 'director').state
  state = signOne(state, 'actor').state
  state = signOne(state, 'actor').state
  state = signOne(state, 'actor').state
  state = signOne(state, 'craft').state
  state = fundTo(state, 30_000_000)
  const mounted = state.sets.find((s) => s.mountedOn === STAGE_7 && s.status !== 'retired')
  if (mounted !== undefined) state = applyActions(state, [{ kind: 'strikeSet', setId: mounted.id }])
  state = applyActions(state, [{ kind: 'commissionSet', commission: { blueprintId: 'set-grand-ballroom', stageFacilityId: STAGE_7 } }])
  for (let week = 0; week < TUNING.SET_BUILD_WEEKS_BAND_HIGH; week++) state = tick(state)

  const concept = state.concepts[0]!
  const actors = contractedByRole(state, 'actor')
  const cast: Record<CastSlot, string> = { lead: actors[0]!.id, antagonist: actors[1]!.id, support: actors[2]!.id }
  const directorId = contractedByRole(state, 'director')[0]!.id
  const payload = {
    conceptId: concept.id,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' } as const,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'] as SegmentId[],
      ranges: { intimacy: [-0.5, 0.5] as [number, number], tonalWeight: [-0.5, 0.5] as [number, number], kineticEnergy: [-0.5, 0.5] as [number, number] },
    },
    writerId: contractedByRole(state, 'writer')[0]!.id,
    directorId,
    cast,
    craftIds: [contractedByRole(state, 'craft')[0]!.id],
    budget: { negative: concept.baseNegativeCost, marketing: 0 },
  }
  state = applyActions(state, [{ kind: 'greenlight', production: payload }])
  const productionId = state.studio.activeProductions[state.studio.activeProductions.length - 1]!.id
  state = tick(state) // greenlight tick: skip
  state = tick(state) // Development -> Pre-production
  state = tick(state) // Pre-production -> Rehearsal
  const rehearsalWorkflow = state.operations.workflows.find((w) => w.productionId === productionId)
  if (rehearsalWorkflow === undefined) throw new Error('fixture premise failed: no workflow for the greenlit production at rehearsal')
  if (rehearsalWorkflow.phase !== 'rehearsal') {
    throw new Error(`fixture premise failed: phase "${rehearsalWorkflow.phase}" at week ${String(state.market.tick)}, expected rehearsal`)
  }
  state = applyActions(state, [
    { kind: 'setProductionSetupRecipe', productionId, recipeId: 'ballroom-reveal-lighting-01', expectedPlanRevision: rehearsalWorkflow.planRevision },
  ])

  let production = state.studio.activeProductions.find((p) => p.id === productionId)!
  let guard = 0
  while (production.remainingTicks !== 5) {
    state = tick(state)
    production = state.studio.activeProductions.find((p) => p.id === productionId)!
    guard += 1
    if (guard > 40) throw new Error(`fixture premise failed: remainingTicks never reached 5 within ${String(guard)} weeks`)
  }
  const shootingWorkflow = state.operations.workflows.find((w) => w.productionId === productionId)!
  if (shootingWorkflow.phase !== 'shooting' || shootingWorkflow.shootingTask === null) {
    throw new Error('fixture premise failed: not in Shooting with a shooting task at remainingTicks 5')
  }

  state = applyActions(state, [{ kind: 'assignShootingDirector', productionId, directorId }])
  state = applyActions(state, [{ kind: 'scheduleShootingTake', productionId }])
  const scheduledWorkflow = state.operations.workflows.find((w) => w.productionId === productionId)!
  if (scheduledWorkflow.shootingTask?.status !== 'scheduled' || scheduledWorkflow.blocker !== null) {
    throw new Error(
      `fixture premise failed: shooting task status "${String(scheduledWorkflow.shootingTask?.status)}" / blocker ${JSON.stringify(scheduledWorkflow.blocker)}, expected scheduled with no blocker`,
    )
  }

  return { state, productionId, directorId, cast }
}

describe('P14B.1 test 2: the promise record and the widened digest', () => {
  // Tests item 2: "the promise record and the widened digest: attaching,
  // revising or removing a promise changes the digest; a drifted promise
  // drops materialTermsChanged; one promise per proposal enforced; a window
  // outside the contract is IMPOSSIBLE by construction."

  it('attaching a promise changes the digest; a second attach on an already-promised proposal is refused (enforced at most one); revising (re-submit, then attach a different promise) and removing (re-submit with no attach) both change the digest again — removing restores the exact original', () => {
    const { state: opened, talentId, playerStudioId } = openPlayerCase()
    const week = opened.market.tick
    const digestA = proposalOf(opened, talentId, playerStudioId).digest

    const attached = attachPromise(opened, talentId, playerStudioId, {
      family: 'APPEARANCE_COUNT',
      predicate: { count: 1 },
      windowStartWeek: proposalOf(opened, talentId, playerStudioId).startWeek,
      dueWeekExclusive: week + 52,
    })
    const promisedProposal = proposalOf(attached, talentId, playerStudioId)
    expect(promisedProposal.digest).not.toBe(digestA)
    expect(promisedProposal.promises.length).toBe(1)
    const digestB = promisedProposal.digest

    expect(() =>
      attachPromise(attached, talentId, playerStudioId, {
        family: 'APPEARANCE_COUNT',
        predicate: { count: 2 },
        windowStartWeek: proposalOf(attached, talentId, playerStudioId).startWeek,
        dueWeekExclusive: week + 52,
      }),
    ).toThrow()

    // Revising: re-submit (this suite's own "revise in place" convention)
    // restores the material terms and clears the promise, then attach a
    // DIFFERENT promise.
    const revised = submitProposal(attached, { talentId, issuerStudioId: playerStudioId, termWeeks: 52, premiumTier: 1.1 })
    expect(proposalOf(revised, talentId, playerStudioId).promises).toEqual([])
    const reattached = attachPromise(revised, talentId, playerStudioId, {
      family: 'APPEARANCE_COUNT',
      predicate: { count: 2 },
      windowStartWeek: proposalOf(revised, talentId, playerStudioId).startWeek,
      dueWeekExclusive: week + 52,
    })
    const digestE = proposalOf(reattached, talentId, playerStudioId).digest
    expect(digestE).not.toBe(digestB) // a DIFFERENT promise digests differently
    expect(digestE).not.toBe(digestA)

    // Removing: re-submit with the SAME material terms and no attach — the
    // digest returns to EXACTLY what it was before any promise existed.
    const removed = submitProposal(reattached, { talentId, issuerStudioId: playerStudioId, termWeeks: 52, premiumTier: 1.1 })
    const removedProposal = proposalOf(removed, talentId, playerStudioId)
    expect(removedProposal.promises).toEqual([])
    expect(removedProposal.digest).toBe(digestA)
  })

  it('a window outside the proposed contract is IMPOSSIBLE by construction', () => {
    const { state: opened, talentId, playerStudioId } = openPlayerCase()
    proposalOf(opened, talentId, playerStudioId) // sanity: the proposal genuinely exists before attaching
    // termWeeks=52 from week 52 (the case's effective/start week) -> contract
    // ends 104. A due week of 200 is unambiguously outside it.
    const attached = attachPromise(opened, talentId, playerStudioId, {
      family: 'APPEARANCE_COUNT',
      predicate: { count: 1 },
      windowStartWeek: proposalOf(opened, talentId, playerStudioId).startWeek,
      dueWeekExclusive: 200,
    })
    const [minted] = promisesOf(attached).filter((p) => p.beneficiaryPersonId === talentId)
    if (minted === undefined) throw new Error('test premise failed: attachPromise minted no promise record')
    expect(minted.feasibilityReceipt.classification).toBe('IMPOSSIBLE')
  })

  it('a promise DRIFTED after attachment (its own definition changed through some other channel) drops materialTermsChanged at freeze', () => {
    const { state: opened, talentId, playerStudioId } = openPlayerCase()
    const week = opened.market.tick
    const attached = attachPromise(opened, talentId, playerStudioId, {
      family: 'APPEARANCE_COUNT',
      predicate: { count: 1 },
      windowStartWeek: proposalOf(opened, talentId, playerStudioId).startWeek,
      dueWeekExclusive: week + 30, // comfortably inside the 52-week contract; feasible at submission
    })
    const before = promisesOf(attached)
    const drifted = before.map((p) => (p.beneficiaryPersonId === talentId ? { ...p, predicate: { count: p.predicate.count + 4 } } : p))
    const state = withPromises(attached, drifted)

    let next = state
    while (next.market.tick < 52) next = tick(next)
    const settlement = next.talentMarket.receipts.find((r) => r.talentId === talentId && (r.kind === 'settled' || r.kind === 'declined'))
    if (settlement === undefined) throw new Error('test premise failed: no settlement receipt was written by week 52')
    expect(settlement.dropped.some((sentence) => /terms changed since submission/i.test(sentence))).toBe(true)
  })
})

describe('P14B.1 test 3: the feasibility service', () => {
  // Tests item 3: "feasibility on constructed pipelines reproducing §4.3.3
  // Example A's shape (X <= 2 REASONABLY ACHIEVABLE, 3-9 FRAGILE with the
  // 'needs a picture not yet commissioned' bottleneck, >= 10 IMPOSSIBLE) and
  // Example B (an active promise consuming the seat -> FRAGILE); the
  // classification is pure (same inputs -> byte-equal receipt) and consumes
  // no RNG (rngState unchanged)."

  it('a window outside the proposed contract classifies IMPOSSIBLE (construction-exact, independent of any N_max hypothesis)', () => {
    const state = p13aGeneratedStudio()
    const beneficiaryPersonId = state.talent.find((t) => t.role === 'actor')!.id
    const receipt = promiseFeasibility(
      state,
      { family: 'APPEARANCE_COUNT', issuerStudioId: state.hollywood!.playerStudioId, beneficiaryPersonId, predicate: { count: 1 }, windowStartWeek: 0, dueWeekExclusive: 200, startWeek: 0, termWeeks: 52 },
      0,
    )
    expect(receipt.classification).toBe('IMPOSSIBLE')
  })

  it('an absurdly large X (999) inside an ordinary contract classifies IMPOSSIBLE regardless of the exact N_max algorithm', () => {
    const state = p13aGeneratedStudio()
    const beneficiaryPersonId = state.talent.find((t) => t.role === 'actor')!.id
    const receipt = promiseFeasibility(
      state,
      { family: 'APPEARANCE_COUNT', issuerStudioId: state.hollywood!.playerStudioId, beneficiaryPersonId, predicate: { count: 999 }, windowStartWeek: 0, dueWeekExclusive: 104, startWeek: 0, termWeeks: 104 },
      0,
    )
    expect(receipt.classification).toBe('IMPOSSIBLE')
  })

  it('classification is PURE (identical inputs -> byte-equal receipt) and consumes no RNG (state.rngState unchanged)', () => {
    const state = p13aGeneratedStudio()
    const beneficiaryPersonId = state.talent.find((t) => t.role === 'actor')!.id
    const draft = { family: 'APPEARANCE_COUNT' as const, issuerStudioId: state.hollywood!.playerStudioId, beneficiaryPersonId, predicate: { count: 1 }, windowStartWeek: 0, dueWeekExclusive: 104, startWeek: 0, termWeeks: 104 }
    const rngBefore = state.rngState
    const first = promiseFeasibility(state, draft, 0)
    const second = promiseFeasibility(state, draft, 0)
    expect(JSON.stringify(second)).toBe(JSON.stringify(first))
    expect(state.rngState).toBe(rngBefore)
  })

  it('Example A shape: X=1 with an existing, unused concept and ample slack is REASONABLY_ACHIEVABLE — nothing needs to be commissioned', () => {
    const state = p13aGeneratedStudio()
    const beneficiaryPersonId = state.talent.find((t) => t.role === 'actor')!.id
    expect(state.concepts.length).toBeGreaterThan(0) // sanity: an unused concept genuinely exists
    const receipt = promiseFeasibility(
      state,
      { family: 'APPEARANCE_COUNT', issuerStudioId: state.hollywood!.playerStudioId, beneficiaryPersonId, predicate: { count: 1 }, windowStartWeek: 0, dueWeekExclusive: 104, startWeek: 0, termWeeks: 104 },
      0,
    )
    expect(receipt.classification).toBe('REASONABLY_ACHIEVABLE')
  })

  it("Example B shape: an active promise consuming the person's only existing-path seat makes a SECOND, overlapping promise FRAGILE with the 'needs a picture not yet commissioned' bottleneck", () => {
    // B3/T2b: the old hand-made OPEN root had no bound contract and no CURRENT
    // proposal reference. outcome:null alone does not make it a reservation;
    // treating it as active pinned the same bug as abandoned/withdrawn drafts.
    // Preserve Example B's capacity claim with a real current attachment. The
    // reducer owns its root/receipt/material digest; no guessed binding is added.
    const { state, talentId: beneficiaryPersonId, playerStudioId: issuerStudioId } = openPlayerCase()
    const proposal = state.talentMarket.proposals.find((p) => p.talentId === beneficiaryPersonId && p.issuerStudioId === issuerStudioId)
    if (proposal === undefined) throw new Error('Example B premise: no real current retention proposal')
    expect(proposal.promises).toEqual([])
    const draft = { family: 'APPEARANCE_COUNT' as const, issuerStudioId, beneficiaryPersonId, predicate: { count: 1 },
      windowStartWeek: proposal.startWeek, dueWeekExclusive: proposal.startWeek + proposal.termWeeks,
      startWeek: proposal.startWeek, termWeeks: proposal.termWeeks }
    const first = promiseFeasibility(state, draft, state.market.tick)
    expect(first.classification).toBe('REASONABLY_ACHIEVABLE') // sanity: achievable before any seat is consumed

    const withActivePromise = attachPromise(state, beneficiaryPersonId, issuerStudioId, {
      family: draft.family, predicate: draft.predicate,
      windowStartWeek: draft.windowStartWeek, dueWeekExclusive: draft.dueWeekExclusive,
    })
    const attachedProposal = proposalOf(withActivePromise, beneficiaryPersonId, issuerStudioId)
    expect(attachedProposal.promises).toHaveLength(1)
    expect(withActivePromise.promises).toHaveLength(state.promises.length + 1)
    const active = withActivePromise.promises.find((p) => p.promiseId === attachedProposal.promises[0])
    expect(active).toMatchObject({ issuerStudioId, beneficiaryPersonId, contractId: null,
      outcome: null, predicate: { count: 1 }, feasibilityReceipt: first })
    save.validateSaveV33(save.makeSave(withActivePromise))
    const second = promiseFeasibility(withActivePromise, draft, state.market.tick)
    expect(second.classification).toBe('FRAGILE')
    expect(second.bottleneck ?? '').toMatch(/not.*commission/i)
  })
})

describe('P14B.1 test 4: settlement freeze re-classification', () => {
  // Tests item 4: "settlement freeze: a promise REASONABLY ACHIEVABLE at
  // submission and FRAGILE at W (the pipeline changed) drops
  // promiseNotFeasible with its sentence; the case falls to the next valid
  // proposal or declines."

  it('a feasible promise becomes FRAGILE after two lawful greenlights consume the existing stages; freeze drops it with a promise-naming sentence', () => {
    // T4: the old [45,59) window began before the contract [52,104).
    // A lawful future window cannot lose seven weeks merely by reaching its
    // start. Preserve the actual requirement (changed pipeline -> freeze drop)
    // with real greenlights using other people, not a fabricated capacity row.
    let state = fundTo(p13aGeneratedStudio(), 30_000_000)
    const crews: { directorId: string; writerId: string; craftId: string; cast: Record<CastSlot, string> }[] = []
    for (let picture = 0; picture < 2; picture++) {
      const director = signOne(state, 'director'); state = director.state
      const writer = signOne(state, 'writer'); state = writer.state
      const craft = signOne(state, 'craft'); state = craft.state
      const lead = signOne(state, 'actor'); state = lead.state
      const antagonist = signOne(state, 'actor'); state = antagonist.state
      const support = signOne(state, 'actor'); state = support.state
      crews.push({ directorId: director.id, writerId: writer.id, craftId: craft.id,
        cast: { lead: lead.id, antagonist: antagonist.id, support: support.id } })
    }
    const subject = signOne(state, 'actor', 52); state = subject.state
    const talentId = subject.id
    const contract = state.contracts.find((c) => c.talentId === talentId)!
    state = advanceTo(state, contract.endWeekExclusive - 7)
    const playerStudioId = state.hollywood!.playerStudioId
    state = submitProposal(state, { talentId, issuerStudioId: playerStudioId, termWeeks: 52, premiumTier: 1.1 })
    const startWeek = proposalOf(state, talentId, playerStudioId).startWeek
    const attached = attachPromise(state, talentId, playerStudioId, {
      family: 'APPEARANCE_COUNT',
      predicate: { count: 1 },
      windowStartWeek: startWeek,
      dueWeekExclusive: startWeek + 40,
    })
    const [minted] = attached.promises.filter((p) => p.beneficiaryPersonId === talentId)
    if (minted === undefined) throw new Error('test premise failed: attachPromise minted no promise record')
    expect(minted.feasibilityReceipt.classification).toBe('REASONABLY_ACHIEVABLE') // sanity: achievable at submission

    let occupied = attached
    crews.forEach((crew, index) => {
      occupied = applyActions(occupied, [{ kind: 'greenlight', production:
        greenlightPayload(occupied, index, crew.directorId, crew.writerId, crew.craftId, crew.cast) }])
    })
    expect(occupied.studio.activeProductions).toHaveLength(2)
    expect(occupied.operations.facilities.filter((f) => f.capability === 'soundstage')).toHaveLength(2)
    const crowded = promiseFeasibility(occupied, {
      family: 'APPEARANCE_COUNT', issuerStudioId: playerStudioId, beneficiaryPersonId: talentId,
      predicate: { count: 1 }, windowStartWeek: startWeek, dueWeekExclusive: startWeek + 40,
      startWeek, termWeeks: 52, promiseId: minted.promiseId,
    }, occupied.market.tick)
    expect(crowded.classification).toBe('FRAGILE')
    expect(crowded.inputsDigest).not.toBe(minted.feasibilityReceipt.inputsDigest)
    const next = advanceTo(occupied, startWeek)
    const settlement = next.talentMarket.receipts.find((r: { talentId: string; kind: string }) => r.talentId === talentId && (r.kind === 'settled' || r.kind === 'declined'))
    if (settlement === undefined) throw new Error('test premise failed: no settlement receipt at the actual decision week')
    expect(settlement.kind).toBe('declined') // the only proposal on this case was dropped
    expect(settlement.dropped.some((sentence: string) => /promise/i.test(sentence))).toBe(true)
  })
})

describe('P14B.1 test 5: outcomes', () => {
  // Tests item 5: "outcomes: SATISFIED at the X-th qualifying first take
  // with evidence refs; BROKEN at dueWeekExclusive when unsatisfied; BROKEN
  // immediately on early termination of the beneficiary; each once and
  // idempotent; WAIVED/VOIDED unreachable (pinned as never emitted on the
  // B.1 seeds)." Plus the assigning brief: BROKEN-on-capacity-collapse via
  // the landed `cancel` action. As landed (records 630/637) the cancel seam
  // breaks iff the separate target-specific proof `targetSpecificImpossibility`
  // (remaining count > nMax = ceil((due - t0) / 5), t0 = max(windowStart,
  // week + 5 or the running picture's take week)) fails on the post-cancel
  // state; the offer re-feasibility is no longer the trigger.

  // T2c PREMISE CORRECTION (T2 ruling, "TEST-SIDE premises"): the SATISFIED
  // case below previously loaded `legacy-v28-shooting-5.json.gz` and read
  // `state.hollywood!.playerStudioId` — that fixture was minted on the
  // operations studio (`hollywood: null`), so the read threw
  // "Cannot read properties of null (reading 'playerStudioId')" before any
  // assertion ran. It is re-expressed on a LIVE industry world, built to the
  // same `remainingTicks === 5`, SCHEDULED shooting task through
  // `buildScheduledPlayerProduction()` above (the T0 minter's own recipe,
  // plus the `assignShootingDirector` + `scheduleShootingTake` actions that
  // fixture deliberately stopped short of).

  it('SATISFIED once the X-th qualifying first take occurs, with evidence refs naming the causing eventId; idempotent on a later tick', () => {
    const { state, productionId, cast } = buildScheduledPlayerProduction()
    const week = state.market.tick
    const record: PersistedPromise = {
      promiseId: 'promise-satisfied-0',
      family: 'APPEARANCE_COUNT',
      issuerStudioId: state.hollywood!.playerStudioId,
      beneficiaryPersonId: cast.lead,
      predicate: { count: 1 },
      windowStartWeek: week,
      dueWeekExclusive: week + 52,
      feasibilityReceipt: { classification: 'REASONABLY_ACHIEVABLE', bottleneck: null },
      progress: 0,
      evidenceRefs: [],
      outcome: null,
      outcomeWeek: null,
      outcomeCause: null,
      contractId: activeEmploymentContractId(state, cast.lead, state.hollywood!.playerStudioId),
    }
    const employment = state.hollywood!.employment.find((row) => row.contractId === record.contractId)!
    expect(employment.terms.talentId).toBe(record.beneficiaryPersonId)
    expect(employment.studioId).toBe(record.issuerStudioId)
    let next = withPromises(state, [record])
    // Bounded search (<= 3 ticks): the first-take fires on the first tick;
    // outcome evaluation may land in that same tick or the market's own next
    // weekly pass (interpretation 4 above) — never assumed exact.
    let satisfied: PersistedPromise | undefined
    for (let i = 0; i < 3 && satisfied === undefined; i++) {
      next = tick(next)
      satisfied = promiseOutcomes(next).find((p: PersistedPromise) => p.promiseId === record.promiseId)
    }
    if (satisfied === undefined) throw new Error('test premise failed: the promise never reached an outcome within 3 ticks of the scheduled remainingTicks===5 state')
    expect(satisfied.outcome).toBe('SATISFIED')
    const takes = (firstTakeReceipts(next) as readonly { eventId: string; productionId: string }[]).filter((r) => r.productionId === productionId)
    expect(takes.length).toBe(1)
    expect(satisfied.evidenceRefs).toContain(takes[0]!.eventId)

    const again = tick(next)
    const stillOne = promiseOutcomes(again).filter((p: PersistedPromise) => p.promiseId === record.promiseId)
    expect(stillOne.length).toBe(1) // idempotent: not duplicated
    expect(stillOne[0]!.outcome).toBe('SATISFIED')
  })

  // T2c ADDITIONS (T2 ruling (i), "a promise BINDS only when its proposal is
  // committed (`contractId` set)" — companion §4.1's "the `contractId` it
  // rode in on"): the due-week BROKEN case previously ran on a CONTRACT-LESS
  // free agent (`contractId: null` throughout, no proposal, no case) — a
  // shape §4.1 does not recognise (free agents are instant-sign, no
  // proposal, no promise) and one the landed law only evaluates today
  // because the binding rule itself is not yet implemented (T2b). It is
  // re-expressed below through a promise that genuinely BINDS — attached to
  // the player's own winning proposal on the genuine
  // legacy-v28-open-case-45 fixture, committed at settlement (`contractId`
  // set by `commitWinningPromise`, `talentMarket.ts` ~1075) — so the
  // due-week evaluation this test pins survives T2b's binding-rule landing
  // instead of being invalidated by it. A second, new case immediately below
  // pins the CONVERSE — a promise attached to a proposal that then LOSES
  // stays unbound and is never evaluated — RED TODAY (the landed due-week
  // evaluation is unconditional on `contractId`); T2b makes it green.

  const OPEN_CASE_45 = {
    file: './fixtures/p14/legacy-v28-open-case-45.json.gz',
    sha256: 'c9ff26fe70b7216784bf5718ed26d2bef10df8ca836b05050f5e1d7bcaac8afd',
    week: 45,
  }
  type Envelope = { saveVersion: number; seed: string; state: GameState; broadcastCache: unknown[] }
  type SaveModuleWithV29 = typeof save & { migrateToV33: (envelope: unknown) => Envelope }
  const withV29 = save as SaveModuleWithV29
  function loadOpenCase45(): GameState {
    const json = gunzipSync(readFileSync(new URL(OPEN_CASE_45.file, import.meta.url))).toString('utf8')
    return withV29.migrateToV33(JSON.parse(json)).state
  }

  it("BROKEN at dueWeekExclusive when the window passes unsatisfied, through a BOUND promise: on genuine legacy-v28-open-case-45, attach a P1 promise to the player's own proposal, settle at 52 (retained -> bound, contractId set), then walk to dueWeekExclusive with no qualifying first take", () => {
    const state = loadOpenCase45()
    const talentId = state.talentMarket.cases[0]!.talentId
    const playerStudioId = state.hollywood!.playerStudioId
    const week = state.market.tick // 45
    const attached = attachPromise(state, talentId, playerStudioId, {
      family: 'APPEARANCE_COUNT',
      predicate: { count: 1 },
      windowStartWeek: proposalOf(state, talentId, playerStudioId).startWeek,
      dueWeekExclusive: week + 30,
    })
    const [minted] = promisesOf(attached).filter((p) => p.beneficiaryPersonId === talentId)
    if (minted === undefined) throw new Error('test premise failed: attachPromise minted no promise record')
    expect(minted.feasibilityReceipt.classification).toBe('REASONABLY_ACHIEVABLE') // sanity: feasible at submission

    let next = attached
    while (next.market.tick < 52) next = tick(next)
    const settlement = next.talentMarket.receipts.find((r) => r.talentId === talentId && (r.kind === 'settled' || r.kind === 'declined'))
    if (settlement === undefined) throw new Error('test premise failed: no settlement receipt was written by week 52')
    expect(settlement.kind).toBe('settled') // genuinely retained by the player (the fixture's own known outcome)
    expect(settlement.studioId).toBe(playerStudioId)
    const bound = promisesOf(next).find((p) => p.promiseId === minted.promiseId)
    if (bound === undefined) throw new Error('test premise failed: the promise vanished at settlement')
    expect(bound.contractId).not.toBeNull() // committed: the promise now rides on the winning employment row

    while (next.market.tick < week + 30) next = tick(next) // past dueWeekExclusive
    const broken = promiseOutcomes(next).find((p: PersistedPromise) => p.promiseId === minted.promiseId)
    if (broken === undefined) throw new Error('test premise failed: the bound promise never reached an outcome by dueWeekExclusive')
    expect(broken.outcome).toBe('BROKEN')
    expect(broken.evidenceRefs).toEqual([])
    expect(broken.outcomeEventId).not.toBeNull()
    const namedReceipt = next.talentMarket.receipts.find((r) => r.eventId === broken.outcomeEventId)
    if (namedReceipt === undefined) throw new Error('test premise failed: outcomeEventId does not name a receipt in this state')
    expect(namedReceipt.kind).toBe('promiseOutcome') // outcomeEventId names the due-week evaluation itself

    const again = tick(next)
    expect(promiseOutcomes(again).filter((p: PersistedPromise) => p.promiseId === minted.promiseId).length).toBe(1) // idempotent
  })

  it("RED (T2b closes this): a promise attached to a proposal that then LOSES stays UNBOUND (contractId null) and is never evaluated — on genuine legacy-v28-open-case-45, withdrawing the player's own proposal leaves the promise attached to a proposal that vanishes at settlement (declined, \"all proposals dropped\"); past its own dueWeekExclusive the record must keep outcome: null and contractId: null, mint no promiseOutcome receipt, and leave the issuer's trust descriptor without a promiseBroken driver", () => {
    const state = loadOpenCase45()
    const talentId = state.talentMarket.cases[0]!.talentId
    const playerStudioId = state.hollywood!.playerStudioId
    const week = state.market.tick // 45
    const attached = attachPromise(state, talentId, playerStudioId, {
      family: 'APPEARANCE_COUNT',
      predicate: { count: 1 },
      windowStartWeek: proposalOf(state, talentId, playerStudioId).startWeek,
      dueWeekExclusive: week + 30,
    })
    const [minted] = promisesOf(attached).filter((p) => p.beneficiaryPersonId === talentId)
    if (minted === undefined) throw new Error('test premise failed: attachPromise minted no promise record')

    // WITHDRAW the player's own proposal — the promise rode in on it, but the
    // proposal that carried it never survives to settlement.
    const withdrawn = withdrawProposal(attached, talentId, playerStudioId)
    expect(withdrawn.talentMarket.proposals.some((p) => p.talentId === talentId && p.issuerStudioId === playerStudioId)).toBe(false)

    let next = withdrawn
    while (next.market.tick < 52) next = tick(next)
    const settlement = next.talentMarket.receipts.find((r) => r.talentId === talentId && (r.kind === 'settled' || r.kind === 'declined'))
    if (settlement === undefined) throw new Error('test premise failed: no settlement receipt was written by week 52')
    expect(settlement.kind).toBe('declined') // the seat law drops the rival's now-uncontested bid too (noSeatForRole) — nobody wins

    while (next.market.tick < week + 30) next = tick(next) // past dueWeekExclusive

    const stillUnbound = promisesOf(next).find((p) => p.promiseId === minted.promiseId)
    if (stillUnbound === undefined) throw new Error('test premise failed: the promise record vanished from state.promises')
    expect(stillUnbound.outcome).toBeNull() // RULING (i): an unbound promise is never evaluated
    expect(stillUnbound.contractId).toBeNull()

    const outcomeReceipt = next.talentMarket.receipts.find((r) => r.kind === 'promiseOutcome' && r.talentId === talentId)
    expect(outcomeReceipt).toBeUndefined() // no promiseOutcome receipt exists for an unbound promise

    const descriptor = trustDescriptor(next, talentId, playerStudioId, next.market.tick)
    expect(descriptor.drivers.some((d) => d.kind === 'promiseBroken')).toBe(false) // the issuer's trust record carries no driver from this
  })

  it('BROKEN immediately (within one tick) when the issuing studio terminates the beneficiary early', () => {
    let state = p13aGeneratedStudio()
    const { state: signed, id: actorId } = signOne(state, 'actor', 208)
    state = signed
    const week = state.market.tick
    const playerStudioId = state.hollywood!.playerStudioId
    // RULING (i): the promise BINDS only when contractId names a real
    // employment row — bind it to the row signOne's own signContract action
    // already wrote into state.hollywood.employment (looked up, never
    // assumed by pattern).
    const contractId = activeEmploymentContractId(state, actorId, playerStudioId)
    const record: PersistedPromise = {
      promiseId: 'promise-broken-termination-0',
      family: 'APPEARANCE_COUNT',
      issuerStudioId: playerStudioId,
      beneficiaryPersonId: actorId,
      predicate: { count: 1 },
      windowStartWeek: week,
      dueWeekExclusive: week + 100,
      feasibilityReceipt: { classification: 'REASONABLY_ACHIEVABLE', bottleneck: null },
      progress: 0,
      evidenceRefs: [],
      outcome: null,
      outcomeWeek: null,
      outcomeCause: null,
      contractId,
    }
    state = withPromises(state, [record])
    // the landed early-termination action (companion §4.4's "the A.1
    // termination path"; brief: "use the landed player termination action").
    state = applyActions(state, [{ kind: 'releaseTalent', talentId: actorId }])
    const afterTick = tick(state) // interpretation 4: outcome lands on the market's next weekly pass
    const broken = promiseOutcomes(afterTick).find((p: PersistedPromise) => p.promiseId === record.promiseId)
    if (broken === undefined) throw new Error('test premise failed: the promise never reached an outcome within one tick of releaseTalent')
    expect(broken.outcome).toBe('BROKEN')
    expect(broken.outcomeCause ?? '').toMatch(/terminat/i)
  })

  it('BROKEN on capacity collapse: cancelling the promised person\'s ONLY production before its first take, with a due week too close for any other path, fails the target-specific proof (remaining 1 > nMax 0) and the promise is BROKEN at the cancel', () => {
    let state = p13aGeneratedStudio()
    const director = signOne(state, 'director'); state = director.state
    const writer = signOne(state, 'writer'); state = writer.state
    const craft = signOne(state, 'craft'); state = craft.state
    const lead = signOne(state, 'actor'); state = lead.state
    const antagonist = signOne(state, 'actor'); state = antagonist.state
    const support = signOne(state, 'actor'); state = support.state
    const cast: Record<CastSlot, string> = { lead: lead.id, antagonist: antagonist.id, support: support.id }
    state = applyActions(state, [{ kind: 'greenlight', production: greenlightPayload(state, 0, director.id, writer.id, craft.id, cast) }])
    const production = state.studio.activeProductions.find((p) => p.directorId === director.id)
    if (production === undefined) throw new Error('test premise failed: greenlight did not create the production')

    const week = state.market.tick
    const playerStudioId = state.hollywood!.playerStudioId
    // RULING (i): bind to the lead's REAL employment row (looked up, never
    // assumed by pattern) so the promise is evaluable at all.
    const contractId = activeEmploymentContractId(state, lead.id, playerStudioId)
    // Far too close for ANY path (even an already-greenlit production's OWN
    // remaining pipeline) to reach a first take: the fixed schedule needs at
    // least 5 weeks from greenlight, and this production is about to be
    // cancelled before ever filming.
    const record: PersistedPromise = {
      promiseId: 'promise-broken-capacity-0',
      family: 'APPEARANCE_COUNT',
      issuerStudioId: playerStudioId,
      beneficiaryPersonId: lead.id,
      predicate: { count: 1 },
      windowStartWeek: week,
      dueWeekExclusive: week + 2,
      feasibilityReceipt: { classification: 'FRAGILE', bottleneck: null },
      progress: 0,
      evidenceRefs: [],
      outcome: null,
      outcomeWeek: null,
      outcomeCause: null,
      contractId,
    }
    state = withPromises(state, [record])
    // PREMISE (not the trigger): the offer service already says IMPOSSIBLE
    // BEFORE the cancel (the window is too tight regardless). The landed seam
    // (records 630/637) does not consult this quote; it breaks iff the separate
    // target-specific proof fails on the post-cancel state — here remaining 1 >
    // nMax 0 (t0 = week + 5 >= due = week + 2). The claim this test pins is the
    // STUDIO-CAUSED cancel producing the BROKEN outcome at the cancel.
    const beforeCancel = promiseFeasibility(
      state,
      { family: 'APPEARANCE_COUNT', issuerStudioId: state.hollywood!.playerStudioId, beneficiaryPersonId: lead.id, predicate: { count: 1 }, windowStartWeek: week, dueWeekExclusive: week + 2, startWeek: week, termWeeks: 208 },
      week,
    )
    expect(beforeCancel.classification).toBe('IMPOSSIBLE')

    state = applyActions(state, [{ kind: 'cancel', productionId: production.id }]) // the landed cancel action
    expect(state.studio.activeProductions.some((p) => p.id === production.id)).toBe(false) // sanity: genuinely removed

    const afterTick = tick(state)
    const broken = promiseOutcomes(afterTick).find((p: PersistedPromise) => p.promiseId === record.promiseId)
    if (broken === undefined) throw new Error('test premise failed: the promise never reached an outcome within one tick of cancel')
    expect(broken.outcome).toBe('BROKEN')
  })

  it('WAIVED and VOIDED are never emitted on the B.1 seeds (pinned, not exercised)', () => {
    const state = p13aGeneratedStudio()
    const outcomes = promiseOutcomes(state).map((p: PersistedPromise) => p.outcome)
    expect(outcomes).not.toContain('WAIVED')
    expect(outcomes).not.toContain('VOIDED')
  })
})
