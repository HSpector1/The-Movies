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

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { hiringMarketIds } from '../src/core/employment.js'
import { tick } from '../src/core/tick.js'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import * as save from '../src/core/save.js'
import { p13aGeneratedStudio, advanceTo } from '../src/harness/p13a/fixtures.js'
import type { GameState, CastSlot, SegmentId } from '../src/core/types.js'
import { submitProposal } from '../src/core/talentMarket.js'
// RED-by-design: src/core/promises.ts does not exist. All four names below
// are CALLED, not merely imported.
import { attachPromise, promiseFeasibility, promiseOutcomes, firstTakeReceipts } from '../src/core/promises.js'

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

type ProposalWithPromises = { talentId: string; issuerStudioId: string; digest: string; promises: readonly string[] }
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

/** Signs one free-agent person of `role` and returns their id. */
function signOne(state: GameState, role: 'actor' | 'director' | 'writer' | 'craft', termWeeks = 208): { state: GameState; id: string } {
  const person = state.talent.find((t) => t.role === role && !state.contracts.some((c) => c.talentId === t.id))
  if (person === undefined) throw new Error(`test premise failed: no free-agent ${role} on this seed`)
  const signed = applyActions(state, [{ kind: 'signContract', talentId: person.id, termWeeks }])
  return { state: signed, id: person.id }
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
      windowStartWeek: week,
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
        windowStartWeek: week,
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
      windowStartWeek: week,
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
    const week = opened.market.tick
    proposalOf(opened, talentId, playerStudioId) // sanity: the proposal genuinely exists before attaching
    // termWeeks=52 from week 52 (the case's effective/start week) -> contract
    // ends 104. A due week of 200 is unambiguously outside it.
    const attached = attachPromise(opened, talentId, playerStudioId, {
      family: 'APPEARANCE_COUNT',
      predicate: { count: 1 },
      windowStartWeek: week,
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
      windowStartWeek: week,
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
    const state = p13aGeneratedStudio()
    const beneficiaryPersonId = state.talent.find((t) => t.role === 'actor')!.id
    const issuerStudioId = state.hollywood!.playerStudioId
    const draft = { family: 'APPEARANCE_COUNT' as const, issuerStudioId, beneficiaryPersonId, predicate: { count: 1 }, windowStartWeek: 0, dueWeekExclusive: 104, startWeek: 0, termWeeks: 104 }
    const first = promiseFeasibility(state, draft, 0)
    expect(first.classification).toBe('REASONABLY_ACHIEVABLE') // sanity: achievable before any seat is consumed

    const active: PersistedPromise = {
      promiseId: 'promise-active-0',
      family: 'APPEARANCE_COUNT',
      issuerStudioId,
      beneficiaryPersonId,
      predicate: { count: 1 },
      windowStartWeek: 0,
      dueWeekExclusive: 104,
      feasibilityReceipt: first,
      progress: 0,
      evidenceRefs: [],
      outcome: null,
      outcomeWeek: null,
      outcomeCause: null,
      contractId: null,
    }
    const withActivePromise = withPromises(state, [active])
    const second = promiseFeasibility(withActivePromise, draft, 0)
    expect(second.classification).toBe('FRAGILE')
    expect(second.bottleneck ?? '').toMatch(/not.*commission/i)
  })
})

describe('P14B.1 test 4: settlement freeze re-classification', () => {
  // Tests item 4: "settlement freeze: a promise REASONABLY ACHIEVABLE at
  // submission and FRAGILE at W (the pipeline changed) drops
  // promiseNotFeasible with its sentence; the case falls to the next valid
  // proposal or declines."

  it('a promise REASONABLY_ACHIEVABLE at submission erodes to FRAGILE by the decision week purely through slack (the 7-week submission-to-decision gap), and the case drops it with a promise-naming sentence', () => {
    const { state: opened, talentId, playerStudioId } = openPlayerCase()
    const week = opened.market.tick // 45
    // On schedule the first take completes 5 weeks after greenlight. At week
    // 45 a due week of 45+14=59 leaves 9 weeks of slack if greenlit NOW
    // (>= the slack hypothesis of 8) — achievable. At the decision week (52,
    // 7 weeks later) the SAME fixed due week 59 leaves only 59-(52+5)=2
    // weeks if greenlit then — below 8 — FRAGILE, with no pipeline action
    // taken at all: the erosion is pure slack, not a resource being used up.
    const attached = attachPromise(opened, talentId, playerStudioId, {
      family: 'APPEARANCE_COUNT',
      predicate: { count: 1 },
      windowStartWeek: week,
      dueWeekExclusive: week + 14,
    })
    const [minted] = promisesOf(attached).filter((p) => p.beneficiaryPersonId === talentId)
    if (minted === undefined) throw new Error('test premise failed: attachPromise minted no promise record')
    expect(minted.feasibilityReceipt.classification).toBe('REASONABLY_ACHIEVABLE') // sanity: achievable at submission

    let next = attached
    while (next.market.tick < 52) next = tick(next)
    const settlement = next.talentMarket.receipts.find((r: { talentId: string; kind: string }) => r.talentId === talentId && (r.kind === 'settled' || r.kind === 'declined'))
    if (settlement === undefined) throw new Error('test premise failed: no settlement receipt was written by week 52')
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
  // the landed `cancel` action, asserted iff re-feasibility is IMPOSSIBLE.

  const FIXTURE = {
    file: './fixtures/p14/legacy-v28-shooting-5.json.gz',
    productionId: 'prod-0008',
    week: 16,
    lead: 't-act-07',
  }
  type Envelope = { saveVersion: number; seed: string; state: GameState; broadcastCache: unknown[] }
  type SaveModuleWithV29 = typeof save & { migrateToV29: (envelope: unknown) => Envelope }
  const withV29 = save as SaveModuleWithV29
  function loadShooting5(): GameState {
    const json = gunzipSync(readFileSync(new URL(FIXTURE.file, import.meta.url))).toString('utf8')
    return withV29.migrateToV29(JSON.parse(json)).state
  }

  it('SATISFIED once the X-th qualifying first take occurs, with evidence refs naming the causing eventId; idempotent on a later tick', () => {
    const state = loadShooting5()
    const contract = state.contracts.find((c) => c.talentId === FIXTURE.lead)
    if (contract === undefined) throw new Error('fixture premise failed: no player contract found for the fixture\'s lead actor')
    const record: PersistedPromise = {
      promiseId: 'promise-satisfied-0',
      family: 'APPEARANCE_COUNT',
      issuerStudioId: state.hollywood!.playerStudioId,
      beneficiaryPersonId: FIXTURE.lead,
      predicate: { count: 1 },
      windowStartWeek: FIXTURE.week,
      dueWeekExclusive: FIXTURE.week + 52,
      feasibilityReceipt: { classification: 'REASONABLY_ACHIEVABLE', bottleneck: null },
      progress: 0,
      evidenceRefs: [],
      outcome: null,
      outcomeWeek: null,
      outcomeCause: null,
      contractId: `player:contract:${FIXTURE.lead}`,
    }
    let next = withPromises(state, [record])
    // Bounded search (<= 3 ticks): the first-take fires on the first tick;
    // outcome evaluation may land in that same tick or the market's own next
    // weekly pass (interpretation 4 above) — never assumed exact.
    let satisfied: PersistedPromise | undefined
    for (let i = 0; i < 3 && satisfied === undefined; i++) {
      next = tick(next)
      satisfied = promiseOutcomes(next).find((p: PersistedPromise) => p.promiseId === record.promiseId)
    }
    if (satisfied === undefined) throw new Error('test premise failed: the promise never reached an outcome within 3 ticks of the fixture\'s remainingTicks===5 state')
    expect(satisfied.outcome).toBe('SATISFIED')
    const takes = (firstTakeReceipts(next) as readonly { eventId: string; productionId: string }[]).filter((r) => r.productionId === FIXTURE.productionId)
    expect(takes.length).toBe(1)
    expect(satisfied.evidenceRefs).toContain(takes[0]!.eventId)

    const again = tick(next)
    const stillOne = promiseOutcomes(again).filter((p: PersistedPromise) => p.promiseId === record.promiseId)
    expect(stillOne.length).toBe(1) // idempotent: not duplicated
    expect(stillOne[0]!.outcome).toBe('SATISFIED')
  })

  it('BROKEN at dueWeekExclusive when the window passes unsatisfied (nobody was ever cast)', () => {
    const state = p13aGeneratedStudio()
    const week = state.market.tick
    const beneficiaryPersonId = state.talent.find((t) => t.role === 'actor' && !state.contracts.some((c) => c.talentId === t.id))!.id
    const record: PersistedPromise = {
      promiseId: 'promise-broken-due-0',
      family: 'APPEARANCE_COUNT',
      issuerStudioId: state.hollywood!.playerStudioId,
      beneficiaryPersonId,
      predicate: { count: 1 },
      windowStartWeek: week,
      dueWeekExclusive: week + 3,
      feasibilityReceipt: { classification: 'FRAGILE', bottleneck: 'needs a picture not yet commissioned' },
      progress: 0,
      evidenceRefs: [],
      outcome: null,
      outcomeWeek: null,
      outcomeCause: null,
      contractId: null,
    }
    let next = withPromises(state, [record])
    while (next.market.tick < week + 5) next = tick(next) // past dueWeekExclusive
    const broken = promiseOutcomes(next).find((p: PersistedPromise) => p.promiseId === record.promiseId)
    if (broken === undefined) throw new Error('test premise failed: the promise never reached an outcome by dueWeekExclusive + 2')
    expect(broken.outcome).toBe('BROKEN')
    expect(broken.evidenceRefs).toEqual([])

    const again = tick(next)
    expect(promiseOutcomes(again).filter((p: PersistedPromise) => p.promiseId === record.promiseId).length).toBe(1) // idempotent
  })

  it('BROKEN immediately (within one tick) when the issuing studio terminates the beneficiary early', () => {
    let state = p13aGeneratedStudio()
    const { state: signed, id: actorId } = signOne(state, 'actor', 208)
    state = signed
    const week = state.market.tick
    const record: PersistedPromise = {
      promiseId: 'promise-broken-termination-0',
      family: 'APPEARANCE_COUNT',
      issuerStudioId: state.hollywood!.playerStudioId,
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
      contractId: null,
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

  it('BROKEN on capacity collapse: cancelling the promised person\'s ONLY production before its first take, with a due week too close for any other path, makes re-feasibility IMPOSSIBLE and the promise BROKEN', () => {
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
    // Far too close for ANY path (even an already-greenlit production's OWN
    // remaining pipeline) to reach a first take: the fixed schedule needs at
    // least 5 weeks from greenlight, and this production is about to be
    // cancelled before ever filming.
    const record: PersistedPromise = {
      promiseId: 'promise-broken-capacity-0',
      family: 'APPEARANCE_COUNT',
      issuerStudioId: state.hollywood!.playerStudioId,
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
      contractId: null,
    }
    state = withPromises(state, [record])
    // sanity: re-feasibility is already IMPOSSIBLE BEFORE the cancel too
    // (the window is too tight regardless) — the meaningful claim this test
    // pins is the STUDIO-CAUSED cancel producing the BROKEN outcome, not
    // that cancelling is what tips it into IMPOSSIBLE by itself.
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
