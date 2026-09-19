// ── P14B.1-T3a bridge test 10 — the thin Core promise surface (projection 45) ──
//
// Authority: docs/engineering/playability-launch-review/plans/P14-HEADLESS-PLAN.md
// ("P14B.1 — First Kept Promise Core — task expansion": the "Scope — bridge
// (projection 45), THIN CORE SURFACE" paragraph and the "Tests (RED-first)"
// paragraph's item 10), the T2 LANDED shape (`8bb5738`/`6948e31`, records
// `records(p14b1): T2 LANDED ...` at HEAD `84dab5a`): two GameState roots
// `firstTakes`/`promises`, `TalentMarketProposal.promises: string[]`, the ONE
// receipt kind `promiseOutcome`, `caseDisclosure`'s `DisclosedProposal.promise:
// Disclosed<DisclosedPromise | null>` ('UNKNOWN' to every non-issuer, `null` for
// the issuer's own no-promise row), the six-descriptor `priorityOrder` and the
// ruling that a promise BINDS only when its proposal is committed (`contractId`
// set) — every scenario below attaches a promise to the WINNING side of a case
// so it is exercised bound, never through the still-open T2c/T2b unbound-
// evaluation premise (see PREMISES below). Landed engine consumed directly as
// an oracle: `src/core/promises.ts` (`attachPromise`, `promiseFeasibility`,
// `trustDescriptor`) and `src/core/talentMarket.ts` (`caseDisclosure`,
// `submitProposal`, `currentProposals`).
//
// The brief this file was written against: /private/tmp/claude-501/
// -Users-zacheryspector-The-Movies-headless-program/
// 154fda95-524f-4734-9a1a-376fe09a0946/scratchpad/p14b1-t3-red-brief.md, plus
// two coordinator ADJUSTMENTS: (1) the bridge is ALREADY red at HEAD until T3
// lands (see RED-BY-DESIGN below — the actual baseline, re-run and recorded
// verbatim, differs slightly in exact line numbers from the brief's paraphrase;
// the evidence file carries the literal `npm run -s typecheck:bridge` output);
// (2) the leak scenario's rival promise is built through the engine's own
// `attachPromise`/`submitProposal` for a rival issuer directly — rival
// AUTHORING (the P12 policy that would decide to do this on its own) lands at
// T2b under S25 symmetry and is not exercised here.
//
// RED-BY-DESIGN, projection 44: `bridge/promises.ts` DOES NOT EXIST AS A FILE in
// this tree (verified: `test -f bridge/promises.ts` reports absent — the
// stronger, unambiguous RED precedent of tests/bridge-p14a2-market.test.ts's
// `bridge/market.ts` import, not the missing-named-export hazard of
// tests/bridge-p14a1-market.test.ts). Importing `promiseQuoteSnapshot` and
// `promiseRowsFor` therefore fails Vite/esbuild MODULE RESOLUTION for this
// entire file, before any describe/it body runs. Both bindings are additionally
// CALLED in every group that needs them, per this repo's RED-first convention,
// so the RED cause is never a coincidental regex. `npm run -s typecheck:bridge`
// at HEAD (re-run 2026-09-18, recorded verbatim in the evidence file) shows
// FIVE pre-existing errors, none TS2307, across four files — `bridge/people.ts`
// (971), `bridge/runtime-checkpoint.ts` (847), `bridge/runtime/campaign-
// library.ts` (41, 66) and `bridge/session.ts` (136) — every one a V28→V29 /
// `priorityOrder`-widening type mismatch already accepted RED until T3 lands.
// This file must add EXACTLY ONE further error, TS2307, for `../bridge/
// promises.ts`, and change none of the five above.
//
// ASSUMED SIGNATURES (interpretations — no such module exists anywhere in this
// tree to copy from; only the fields this file actually reads are asserted):
//   - `promiseRowsFor(state, talentId, viewerStudioId, week?)` — the per-
//     proposal promise disclosure row the Profile case block and (because
//     `bridge/market.ts`'s own `comparison: block.proposals` already reuses the
//     SAME array by reference) the Market page comparison row both need:
//     `Array<{ issuerStudioId; promise: Disclosed<DisclosedPromise | null> }>`,
//     a thin pass-through of the engine's own `caseDisclosure(...).proposals`.
//   - `promiseQuoteSnapshot(state, issuerStudioId, talentId, draft, week?)` —
//     the quote-time wrapper over `promiseFeasibility`: `{ ok; classification;
//     message }`, `message` null when `ok`, else `"not offerable: <bottleneck>"`
//     verbatim (the engine's own bottleneck text, including the five NOT-
//     OFFERED-IN-B1 family messages).
//   - The Profile case block (`marketCaseProjection`) gains a `trustLabel`
//     field (the viewer-scoped `trustDescriptor(...).label`, no driver text —
//     companion "no driver text" instruction) and the person's promise history
//     as a NEW `promiseHistory` field, filtered to promises this VIEWING studio
//     itself issued (never a rival's). This is THIS FILE'S OWN INTERPRETATION
//     of where "the Profile gains the public trust descriptor label... and the
//     person's promise rows" (plan, Scope — bridge paragraph) lives on the wire
//     — attached to the SAME viewer-scoped case-block function that already
//     carries every other viewer-narrowed promise fact, rather than a signature
//     change to the un-viewered `peopleProjection`. The implementer is free to
//     place these fields differently; only the FACTS below (the label value,
//     the history rows' content) are pinned, derived through the engine's own
//     `trustDescriptor` and `state.promises` — never invented.
//   - `marketProposalAction`'s promise draft rides the EXISTING `quoteMarket
//     Proposal` intent's `draft` (no new intent kind — `AVAILABLE_INTENT_KINDS`
//     is asserted unchanged), widened with an optional `promise: { family;
//     count; windowStartWeek; dueWeekExclusive }`; the response's `quote` gains
//     a `promise: { ok; classification; message }` sub-object mirroring
//     `promiseQuoteSnapshot`'s own shape. Neither the widened draft payload nor
//     the widened quote snapshot exist on today's `StudioMarketProposalDraft
//     Payload` / `StudioMarketProposalQuoteSnapshot` schema types, so the
//     session-level request/response are built and read through `as unknown as`
//     casts (the same idiom tests/bridge-p14a1-market.test.ts's `unknownType
//     Request` and tests/bridge-p14a2-market.test.ts's `marketQuery` already use
//     for a field the wire type does not carry yet) — this keeps the file's
//     ONLY unresolvable import scoped to `../bridge/promises.ts` and adds no
//     further typecheck error against the EXISTING, already-typed functions.
//
// SCENARIOS reuse A.1/A.2's proven `signActor`/`openCaseWithBothProposals`
// construction (a fresh player 52-week contract, window opens week 40,
// decision week 52; the player proposes tier 1.25, one entered rival tier
// 1.00/1.1, same 52-week term — the player DOMINATES and wins). Every promise
// attached to the WINNING proposal uses a window wide enough to reclassify
// REASONABLY_ACHIEVABLE at the decision week (`windowStartWeek` = the decision
// week, `dueWeekExclusive` = decision week + 40) — EMPIRICALLY VERIFIED against
// the real, landed engine via a disposable `vite-node` probe (2026-09-18,
// `p14b1-bridge-promise-history` seed): an 8-week window is FRAGILE at offer
// ("the schedule leaves no spare picture inside the window"), which drops the
// whole proposal at freeze (`promiseNotFeasible`) and leaves the promise
// UNBOUND (`contractId: null`) for its entire life — exactly the still-open
// T2c/T2b binding-rule premise this file must not lean on. A 40-week window
// reclassifies REASONABLY_ACHIEVABLE, the case settles, `commitWinningPromise`
// binds the `contractId`, and — because nothing ever seats the actor on a
// production — the promise still goes BROKEN at `dueWeekExclusive` (outcome-
// week/cause probed and asserted verbatim below), now through the BOUND, fully
// literal-reading path. No test in this file constructs an unbound promise's
// outcome.
//
// NOT IN SCOPE (B.2, plan's own MOVED TO P14B.2 line): the top-three trust
// driver reasons TEXT, the Pulse `promiseKept`/`promiseBroken` activities, the
// attention causes `promiseDue`/`promiseOutcome`, the workspace promise
// history bucket. Nothing below asserts any of these.
//
// PREMISES NOT SATISFIED (named, not invented):
//   - Whether the trust label / promise history live on `marketCaseProjection`
//     (this file's choice) or a separate, un-viewered Profile field is NOT
//     settled by anything this author has read — flagged above, not guessed
//     silently.
//   - The promise's bare `count` is NOT independently leak-checked as a raw
//     JSON number in group 5: small integers collide constantly with unrelated
//     legitimate fields (page sizes, array lengths, other counts) — probed
//     empirically and confirmed collision-prone at the scale this fixture
//     produces. The family string (a whole, distinctive literal that does not
//     collide) and the window-week numbers (widened past the 0–100 stat range
//     specifically to avoid the SAME collision class other people's discipline
//     `potentialLow` fields hit at small values — probed) carry the leak
//     evidence instead, alongside the primary structural UNKNOWN check.
//   - A SATISFIED (as opposed to BROKEN) terminal promise is not constructed
//     anywhere in this file: it needs a real qualifying first take (greenlight,
//     cast, advance through production ticks), materially larger fixture setup
//     than a RED-first bridge test needs to pin the wiring; the engine's own
//     test 5 covers SATISFIED end-to-end already.

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { AVAILABLE_INTENT_KINDS, BRIDGE_SCHEMA, PROJECTION_VERSION } from '../bridge/schema/bridge-schema.ts'
import type { BridgeQuoteRequest } from '../bridge/schema/bridge-schema.ts'
import { marketCaseProjection, peopleProjection } from '../bridge/people.ts'
import { marketPage } from '../bridge/market.ts'
import { industryPage } from '../bridge/industry.ts'
import { BridgeSession } from '../bridge/session.ts'
// NOT YET EXISTING: bridge/promises.ts does not exist in this tree at all (test
// -f reports absent). This import is this file's RED cause — Vite/esbuild fails
// MODULE RESOLUTION here, before any describe/it body runs.
import { promiseQuoteSnapshot, promiseRowsFor } from '../bridge/promises.ts'
import { applyActions, hiringMarketIds, tick } from '../src/core/index.js'
import type { GameState } from '../src/core/types.js'
import {
  caseDisclosure, caseForTalent, currentProposals, submitProposal, UNKNOWN, type DisclosedPromise,
} from '../src/core/talentMarket.js'
import { attachPromise, promiseFeasibility, trustDescriptor } from '../src/core/promises.js'
import { LIVE_SAVE_VERSION } from '../src/core/save.js'
import { advanceTo, p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'

// ── fixture helpers (reused verbatim from tests/bridge-p14a1-market.test.ts /
// tests/bridge-p14a2-market.test.ts) ─────────────────────────────────────────

function signActor(state: GameState, termWeeks: number): { state: GameState; talentId: string } {
  const candidates = hiringMarketIds(state, 0)
  const actorId = candidates.map((id) => state.talent.find((t) => t.id === id)).find((t) => t?.role === 'actor')?.id
  if (actorId === undefined) throw new Error('fixture assumption failed: no actor in the week-0 hiring market')
  const signed = applyActions(state, [{ kind: 'signContract', talentId: actorId, termWeeks }])
  return { state: signed, talentId: actorId }
}

/** The proven dominance-settled scenario of tests/p14a1-settlement.test.ts,
 * reused so this file needs no new fact about the still-open tie-break law. */
function openCaseWithBothProposals(seed: string, rivalPremiumTier = 1.0) {
  const { state: signed, talentId } = signActor(p13aGeneratedStudio(seed), 52)
  const atSubmission = advanceTo(signed, 45)
  const playerStudioId = atSubmission.hollywood!.playerStudioId
  const rivalStudioId = atSubmission.hollywood!.identities.find((s) => s.role === 'rival' && s.enteredWeek !== null)!.studioId
  let state = submitProposal(atSubmission, { talentId, issuerStudioId: playerStudioId, termWeeks: 52, premiumTier: 1.25 })
  state = submitProposal(state, { talentId, issuerStudioId: rivalStudioId, termWeeks: 52, premiumTier: rivalPremiumTier })
  return { state, talentId, playerStudioId, rivalStudioId }
}

const load = (relative: string) => gunzipSync(readFileSync(new URL(relative, import.meta.url))).toString('utf8')
function assertSha256(json: string, expected: string) {
  expect(createHash('sha256').update(json).digest('hex')).toBe(expected)
}
// tests/fixtures/p13b/PROVENANCE.md — the P14A.1/P14A.2 open-case-45 V28 row,
// reused verbatim (same file, same sha256 as tests/bridge-p14a2-market.test.ts).
const V28_OPEN_CASE_45 = { file: './fixtures/p14/legacy-v28-open-case-45.json.gz', sha256: 'c9ff26fe70b7216784bf5718ed26d2bef10df8ca836b05050f5e1d7bcaac8afd', week: 45 }

type ProposalRowWithPromise = { issuerStudioId: string; promise: unknown }

/** Recursive EXACT-numeric-value search (never a substring scan): a raw
 * `String(n)` containment check false-positives on any larger number that
 * happens to contain `n`'s digits (probed and confirmed against this exact
 * scenario — see PREMISES above), so this walks the real JSON tree instead. */
function containsNumber(value: unknown, target: number): boolean {
  if (typeof value === 'number') return value === target
  if (Array.isArray(value)) return value.some((v) => containsNumber(v, target))
  if (value !== null && typeof value === 'object') return Object.values(value as Record<string, unknown>).some((v) => containsNumber(v, target))
  return false
}

// ── group 1: PROJECTION_VERSION / LIVE_SAVE_VERSION ─────────────────────────

describe('group 1: PROJECTION_VERSION / LIVE_SAVE_VERSION', () => {
  it('LIVE_SAVE_VERSION stays 29; the live promise surface carries projection 46 after P14B.2', () => {
    expect(LIVE_SAVE_VERSION).toBe(29)
    expect(PROJECTION_VERSION).toBe(46)
    expect(BRIDGE_SCHEMA.$id).toBe(`urn:project-studio:bridge:protocol-${String(PROTOCOL_VERSION)}:projection-46`)
    expect(BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(46)
  })
})

// ── group 2: Profile case block + Market page — own row real, competing UNKNOWN ──

describe('group 2: case block and market page promise rows', () => {
  it("the Profile case block's proposal rows carry promise — own row real (family, count, window, classification), competing row the UNKNOWN marker, never the rival's family/count/window", () => {
    const { state: submitted, talentId, playerStudioId, rivalStudioId } = openCaseWithBothProposals('p14b1-bridge-case-block')
    const proposal = currentProposals(submitted, talentId).find((p) => p.issuerStudioId === playerStudioId)!
    const state = attachPromise(submitted, talentId, playerStudioId, {
      family: 'APPEARANCE_COUNT', predicate: { count: 1 }, windowStartWeek: proposal.startWeek, dueWeekExclusive: proposal.startWeek + 40,
    })
    const mine = state.promises.find((p) => p.issuerStudioId === playerStudioId && p.beneficiaryPersonId === talentId)!

    // NOT YET EXISTING: promiseRowsFor — this test's RED cause.
    const rows: ProposalRowWithPromise[] = promiseRowsFor(state, talentId, playerStudioId)
    const mineRow = rows.find((r) => r.issuerStudioId === playerStudioId)!
    expect(mineRow.promise).not.toBe(UNKNOWN)
    const mineDisclosed = mineRow.promise as DisclosedPromise
    expect(mineDisclosed.family).toBe('APPEARANCE_COUNT')
    expect(mineDisclosed.count).toBe(1)
    expect(mineDisclosed.windowStartWeek).toBe(proposal.startWeek)
    expect(mineDisclosed.dueWeekExclusive).toBe(proposal.startWeek + 40)
    expect(mineDisclosed.classification).toBe(mine.feasibilityReceipt.classification)
    const theirRow = rows.find((r) => r.issuerStudioId === rivalStudioId)!
    expect(theirRow.promise).toBe(UNKNOWN)
    // Cross-checked against the engine's own landed oracle for this exact fact.
    const disclosure = caseDisclosure(state, talentId, playerStudioId, state.market.tick)
    expect(rows).toEqual(disclosure.proposals.map((p) => ({ issuerStudioId: p.issuerStudioId, promise: p.promise })))

    // NOT YET EXISTING: the case block's own `proposals` must carry the same
    // row (marketCaseProjection is EXISTING and typechecks clean today WITHOUT
    // a `promise` field — cast to the widened shape this file expects T3 to add).
    const block = marketCaseProjection(state, talentId, playerStudioId) as unknown as { proposals: ProposalRowWithPromise[] } | null
    expect(block).not.toBeNull()
    const blockMine = block!.proposals.find((r) => r.issuerStudioId === playerStudioId)!
    expect(blockMine.promise).toEqual(mineDisclosed)
    const blockTheirs = block!.proposals.find((r) => r.issuerStudioId === rivalStudioId)!
    expect(blockTheirs.promise).toBe(UNKNOWN)
  })

  it('the Market page comparison row carries the SAME own/UNKNOWN promise facts (bridge/market.ts reuses the case block\'s own `proposals` array by reference)', () => {
    const { state: submitted, talentId, playerStudioId, rivalStudioId } = openCaseWithBothProposals('p14b1-bridge-market-page-comparison')
    const proposal = currentProposals(submitted, talentId).find((p) => p.issuerStudioId === playerStudioId)!
    const state = attachPromise(submitted, talentId, playerStudioId, {
      family: 'APPEARANCE_COUNT', predicate: { count: 1 }, windowStartWeek: proposal.startWeek, dueWeekExclusive: proposal.startWeek + 40,
    })
    const block = marketCaseProjection(state, talentId, playerStudioId) as unknown as { proposals: ProposalRowWithPromise[] } | null
    const page = marketPage(state, { view: 'market', targetId: talentId }) as unknown as { selected: { comparison: ProposalRowWithPromise[] } | null }
    expect(page.selected).not.toBeNull()
    const comparisonMine = page.selected!.comparison.find((r) => r.issuerStudioId === playerStudioId)!
    const comparisonTheirs = page.selected!.comparison.find((r) => r.issuerStudioId === rivalStudioId)!
    expect(comparisonMine.promise).toEqual(block!.proposals.find((r) => r.issuerStudioId === playerStudioId)!.promise)
    expect(comparisonTheirs.promise).toBe(UNKNOWN)
  })
})

// ── group 3: the Profile's public trust label + the person's promise rows ──

describe('group 3: trust descriptor label and promise history, open then settled with an outcome', () => {
  it('open right after settlement, then BROKEN once the window passes unsatisfied — both read through the engine\'s own trustDescriptor / state.promises as the oracle', () => {
    const { state: submitted, talentId, playerStudioId } = openCaseWithBothProposals('p14b1-bridge-promise-history')
    const proposal = currentProposals(submitted, talentId).find((p) => p.issuerStudioId === playerStudioId)!
    const decisionWeek = proposal.startWeek
    const dueWeekExclusive = decisionWeek + 40
    const attached = attachPromise(submitted, talentId, playerStudioId, {
      family: 'APPEARANCE_COUNT', predicate: { count: 1 }, windowStartWeek: decisionWeek, dueWeekExclusive,
    })
    const attachedPromiseId = attached.promises.find((p) => p.issuerStudioId === playerStudioId && p.beneficiaryPersonId === talentId)!.promiseId

    let state = advanceTo(attached, decisionWeek - 1)
    state = tick(state) // settles at decisionWeek — the proven dominance scenario; commitWinningPromise binds contractId
    const kase = caseForTalent(state, talentId, state.market.tick)!
    expect(kase.status).toBe('settled') // sanity: the promise's window (40 weeks) reclassified REASONABLY_ACHIEVABLE at freeze
    const openPromise = state.promises.find((p) => p.promiseId === attachedPromiseId)!
    expect(openPromise.outcome).toBeNull() // sanity: still open right after settlement
    expect(openPromise.contractId).not.toBeNull() // sanity: BOUND — the literal "binds only when committed" reading

    // NOT YET EXISTING: promiseRowsFor is this file's RED cause; personPromiseHistory
    // is asserted structurally below through a cast on the widened case block,
    // deriving the expected shape directly from state.promises (the oracle).
    const openLabel = trustDescriptor(state, talentId, playerStudioId, state.market.tick).label
    const openBlock = marketCaseProjection(state, talentId, playerStudioId) as unknown as {
      trustLabel: string
      promiseHistory: Array<{ promiseId: string; family: string; count: number; windowStartWeek: number; dueWeekExclusive: number; contractId: string; outcome: string | null; outcomeWeek: number | null; outcomeCause: string | null }>
    } | null
    expect(openBlock).not.toBeNull()
    expect(openBlock!.trustLabel).toBe(openLabel)
    expect(openBlock!.promiseHistory).toEqual([{
      promiseId: openPromise.promiseId, family: openPromise.family, count: openPromise.predicate.count,
      windowStartWeek: openPromise.windowStartWeek, dueWeekExclusive: openPromise.dueWeekExclusive,
      contractId: openPromise.contractId, outcome: null, outcomeWeek: null, outcomeCause: null,
    }])

    const settled = advanceTo(state, dueWeekExclusive) // past due, no first take ever occurred -> BROKEN
    const brokenPromise = settled.promises.find((p) => p.promiseId === attachedPromiseId)!
    expect(brokenPromise.outcome).toBe('BROKEN') // sanity: this construction genuinely reaches a terminal outcome
    expect(brokenPromise.outcomeWeek).toBe(dueWeekExclusive)
    expect(brokenPromise.outcomeCause).toBe('the window closed before the promised pictures began filming')

    const settledLabel = trustDescriptor(settled, talentId, playerStudioId, settled.market.tick).label
    const settledBlock = marketCaseProjection(settled, talentId, playerStudioId) as unknown as {
      trustLabel: string
      promiseHistory: Array<{ promiseId: string; family: string; count: number; windowStartWeek: number; dueWeekExclusive: number; contractId: string; outcome: string | null; outcomeWeek: number | null; outcomeCause: string | null }>
    } | null
    expect(settledBlock!.trustLabel).toBe(settledLabel)
    expect(settledBlock!.promiseHistory).toEqual([{
      promiseId: brokenPromise.promiseId, family: brokenPromise.family, count: brokenPromise.predicate.count,
      windowStartWeek: brokenPromise.windowStartWeek, dueWeekExclusive: brokenPromise.dueWeekExclusive,
      contractId: brokenPromise.contractId, outcome: 'BROKEN', outcomeWeek: dueWeekExclusive,
      outcomeCause: brokenPromise.outcomeCause,
    }])
  })
})

// ── group 4: marketProposalAction accepts a promise draft, quote returns the classification ──

describe('group 4: the promise draft on marketProposalAction\'s quote family', () => {
  it('refuses a promise window beginning before the proposed contract, although its due week is inside the contract (T4 lower-edge regression)', () => {
    const { state, talentId, playerStudioId } = openCaseWithBothProposals('p14b1-bridge-lower-window')
    const proposal = currentProposals(state, talentId).find((p) => p.issuerStudioId === playerStudioId)!
    const draft = { family: 'APPEARANCE_COUNT' as const, count: 1, windowStartWeek: proposal.startWeek,
      dueWeekExclusive: proposal.startWeek + 40, startWeek: proposal.startWeek, termWeeks: proposal.termWeeks }
    expect(promiseQuoteSnapshot(state, playerStudioId, talentId, draft).ok).toBe(true)
    const early = promiseQuoteSnapshot(state, playerStudioId, talentId, { ...draft, windowStartWeek: proposal.startWeek - 1 })
    expect(early.ok).toBe(false)
    expect(early.classification).toBe('IMPOSSIBLE')
    expect(early.message).toMatch(/^not offerable: /)
    expect(early.message).toMatch(/contract|start|window/i)
  })

  it('promiseQuoteSnapshot returns the engine\'s own promiseFeasibility classification, ok true only when REASONABLY_ACHIEVABLE, and the same fact rides the EXISTING quoteMarketProposal session intent (no new intent kind)', () => {
    const { state, talentId, playerStudioId } = openCaseWithBothProposals('p14b1-bridge-quote-classification')
    const proposal = currentProposals(state, talentId).find((p) => p.issuerStudioId === playerStudioId)!
    const draft = { family: 'APPEARANCE_COUNT' as const, count: 1, windowStartWeek: proposal.startWeek, dueWeekExclusive: proposal.startWeek + 40, startWeek: proposal.startWeek, termWeeks: proposal.termWeeks }
    const expected = promiseFeasibility(state, {
      family: draft.family, issuerStudioId: playerStudioId, beneficiaryPersonId: talentId, predicate: { count: draft.count },
      windowStartWeek: draft.windowStartWeek, dueWeekExclusive: draft.dueWeekExclusive, startWeek: draft.startWeek, termWeeks: draft.termWeeks,
    }, state.market.tick)

    // NOT YET EXISTING: promiseQuoteSnapshot — this test's RED cause.
    const quote = promiseQuoteSnapshot(state, playerStudioId, talentId, draft, state.market.tick)
    expect(quote.classification).toBe(expected.classification)
    expect(quote.ok).toBe(expected.classification === 'REASONABLY_ACHIEVABLE')
    expect(quote.message).toBe(expected.classification === 'REASONABLY_ACHIEVABLE' ? null : `not offerable: ${String(expected.bottleneck)}`)

    expect(AVAILABLE_INTENT_KINDS).toContain('marketProposalAction') // the promise draft adds no new intent kind
    const session = new BridgeSession(state, 'p14b1-bridge-quote-classification')
    const proposeWithPromiseRequest = {
      protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId,
      commandId: 'q-propose-promise', expectedStateRevision: session.stateRevision,
      type: 'quoteMarketProposal' as const,
      draft: {
        verb: 'propose' as const, talentId, termWeeks: proposal.termWeeks, premiumTier: proposal.premiumTier,
        promise: { family: draft.family, count: draft.count, windowStartWeek: draft.windowStartWeek, dueWeekExclusive: draft.dueWeekExclusive },
      },
    } as unknown as BridgeQuoteRequest
    const response = session.quote(proposeWithPromiseRequest)
    if (!response.accepted) throw new Error(response.message)
    const promiseOnQuote = (response.quote as unknown as { promise: { ok: boolean; classification: string; message: string | null } }).promise
    expect(promiseOnQuote.classification).toBe(expected.classification)
    expect(promiseOnQuote.ok).toBe(expected.classification === 'REASONABLY_ACHIEVABLE')
  })

  it('a window outside the proposed contract is IMPOSSIBLE, refused "not offerable: <bottleneck>"', () => {
    const { state, talentId, playerStudioId } = openCaseWithBothProposals('p14b1-bridge-quote-impossible-window')
    const proposal = currentProposals(state, talentId).find((p) => p.issuerStudioId === playerStudioId)!
    const draft = {
      family: 'APPEARANCE_COUNT' as const, count: 1, windowStartWeek: proposal.startWeek,
      dueWeekExclusive: proposal.startWeek + proposal.termWeeks + 10, startWeek: proposal.startWeek, termWeeks: proposal.termWeeks,
    }
    // NOT YET EXISTING: promiseQuoteSnapshot — this test's RED cause.
    const quote = promiseQuoteSnapshot(state, playerStudioId, talentId, draft, state.market.tick)
    expect(quote.ok).toBe(false)
    expect(quote.classification).toBe('IMPOSSIBLE')
    expect(quote.message).toBe('not offerable: the due week falls outside the proposed contract')
  })

  it('a non-P1 family is refused with its own typed reason, deterministically, before any pipeline check runs', () => {
    const { state, talentId, playerStudioId } = openCaseWithBothProposals('p14b1-bridge-quote-non-p1-family')
    const proposal = currentProposals(state, talentId).find((p) => p.issuerStudioId === playerStudioId)!
    const draft = { family: 'DIRECTING_COUNT' as const, count: 1, windowStartWeek: proposal.startWeek, dueWeekExclusive: proposal.startWeek + 40, startWeek: proposal.startWeek, termWeeks: proposal.termWeeks }
    // NOT YET EXISTING: promiseQuoteSnapshot — this test's RED cause.
    const quote = promiseQuoteSnapshot(state, playerStudioId, talentId, draft, state.market.tick)
    expect(quote.ok).toBe(false)
    expect(quote.classification).toBe('IMPOSSIBLE')
    expect(quote.message).toBe('not offerable: a directing promise is not offered in this slice')
  })
})

// ── group 5: leak — the rival's real promise never appears on any DTO ───────

describe('group 5: disclosure narrowing — the rival\'s promise leaks nowhere', () => {
  it('a world where the RIVAL proposal carries a real promise: the profile, the market page, a player-requested quote and pulse all serialize with no trace of the rival\'s family/window', () => {
    // A wider term (208 weeks, a published CONTRACT_TERM_OPTIONS value) so the
    // rival's window-week numbers can sit well past the 0-100 discipline-stat
    // range and still lie inside the proposed contract — EMPIRICALLY PROBED
    // (2026-09-18, disposable vite-node script) against every DTO below on this
    // exact construction: zero coincidental numeric collisions found.
    const wide = (() => {
      const { state: signed, talentId: t } = signActor(p13aGeneratedStudio('p14b1-bridge-leak-wide'), 52)
      const atSubmission = advanceTo(signed, 45)
      const playerId = atSubmission.hollywood!.playerStudioId
      const rivalId = atSubmission.hollywood!.identities.find((s) => s.role === 'rival' && s.enteredWeek !== null)!.studioId
      let s = submitProposal(atSubmission, { talentId: t, issuerStudioId: playerId, termWeeks: 208, premiumTier: 1.25 })
      s = submitProposal(s, { talentId: t, issuerStudioId: rivalId, termWeeks: 208, premiumTier: 1.0 })
      return { state: s, talentId: t, playerStudioId: playerId, rivalStudioId: rivalId }
    })()

    const rivalProposal = currentProposals(wide.state, wide.talentId).find((p) => p.issuerStudioId === wide.rivalStudioId)!
    const rivalDraft = {
      family: 'APPEARANCE_COUNT' as const, predicate: { count: 4 },
      windowStartWeek: rivalProposal.startWeek + 111, dueWeekExclusive: rivalProposal.startWeek + 141,
    }
    // Adjustment 2: the rival's promise-bearing proposal is built through the
    // engine's own attachPromise/submitProposal for a RIVAL issuer directly —
    // rival AUTHORING (the P12 policy) lands at T2b under S25; not exercised here.
    const state = attachPromise(wide.state, wide.talentId, wide.rivalStudioId, rivalDraft)
    const rivalPromise = state.promises.find((p) => p.issuerStudioId === wide.rivalStudioId && p.beneficiaryPersonId === wide.talentId)!
    expect(rivalPromise.predicate.count).toBe(4) // sanity: the rival genuinely holds a real promise to leak
    expect(rivalPromise.family).toBe('APPEARANCE_COUNT')

    // Structural check (primary): the rival's row is the UNKNOWN marker under
    // the player's own view. NOT YET EXISTING: promiseRowsFor — RED cause.
    const rows: ProposalRowWithPromise[] = promiseRowsFor(state, wide.talentId, wide.playerStudioId)
    expect(rows.find((r) => r.issuerStudioId === wide.rivalStudioId)!.promise).toBe(UNKNOWN)

    const block = marketCaseProjection(state, wide.talentId, wide.playerStudioId)
    const page = marketPage(state, { view: 'market', targetId: wide.talentId })
    const onePersonProfile = peopleProjection(state).profiles.find((p) => p.talentId === wide.talentId) ?? null
    const pulse = industryPage(state, 'p14b1-bridge-leak-pulse', 0, {
      protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: 'p14b1-bridge-leak-pulse', requestId: 'r-pulse',
      expectedStateRevision: 0, type: 'industryQuery', view: 'pulse', targetId: null, page: 0, pageSize: 50, lane: 'recent', period: 'all',
    })
    // NOT YET EXISTING: promiseQuoteSnapshot — RED cause (a quote the PLAYER
    // itself requests, on the same case, never mentioning the rival's promise).
    const ownQuote = promiseQuoteSnapshot(state, wide.playerStudioId, wide.talentId, {
      family: 'APPEARANCE_COUNT', count: 1, windowStartWeek: rivalProposal.startWeek, dueWeekExclusive: rivalProposal.startWeek + 40,
      startWeek: rivalProposal.startWeek, termWeeks: rivalProposal.termWeeks,
    }, state.market.tick)

    // Every DTO the case, the market page, a player-side quote and Pulse touch:
    // never the family string (the player carries no promise in this scenario,
    // so its mere presence would already be a leak) and never the rival's real
    // window-week numbers, checked by EXACT numeric value, not substring.
    const surfaces: Record<string, unknown> = { rows, block, page, onePersonProfile, pulse, ownQuote }
    for (const surface of Object.values(surfaces)) {
      expect(JSON.stringify(surface)).not.toContain('APPEARANCE_COUNT')
      expect(containsNumber(surface, rivalPromise.windowStartWeek)).toBe(false)
      expect(containsNumber(surface, rivalPromise.dueWeekExclusive)).toBe(false)
    }
  })
})

// ── group 6: save/load — the V28 fixture converts to V29 with empty promise tables; a live V29 promise round-trips byte-stable ──

describe('group 6: save/load', () => {
  it('a genuine V28 fixture (open-case-45) converts to V29 with empty firstTakes/promises, and the bridge reads it with no promise fact anywhere', () => {
    const json = load(V28_OPEN_CASE_45.file)
    assertSha256(json, V28_OPEN_CASE_45.sha256)
    const session = BridgeSession.fromSaveJson(json, 'p14b1-bridge-v28-open-load')
    const state = session.gameState
    expect(state.market.tick).toBe(V28_OPEN_CASE_45.week)
    expect((state as unknown as { firstTakes: unknown[] }).firstTakes).toEqual([])
    expect((state as unknown as { promises: unknown[] }).promises).toEqual([])
    const kase = state.talentMarket.cases[0]
    expect(kase).toBeDefined() // sanity: the fixture genuinely carries its one open case
    const talentId = kase!.talentId
    const playerStudioId = state.hollywood!.playerStudioId

    // NOT YET EXISTING: promiseRowsFor — this test's RED cause.
    const rows: ProposalRowWithPromise[] = promiseRowsFor(state, talentId, playerStudioId)
    expect(rows).toHaveLength(2) // the fixture's own two proposals (provenance: player 1.25 / rival 1.00, both 52wk)
    for (const row of rows) expect(row.promise).toBe(row.issuerStudioId === playerStudioId ? null : UNKNOWN)

    const reSaved = session.save({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId, commandId: 'save-1', expectedStateRevision: session.stateRevision })
    expect(reSaved.accepted).toBe(true)
    // T3 CORRECTION to this file's own T3a premise: an unmodified round trip does NOT
    // stay V28. Save V29 is the live writer and `fromSaveJson` migrates on load (the two
    // empty roots asserted above ARE that conversion), so the re-save is V29 bytes by
    // law. The fixture's V28 sha stays the provenance pin on the FILE (line above); the
    // re-save proves only that the bridge wrote the live envelope.
    if (reSaved.accepted) expect((JSON.parse(reSaved.saveJson) as { saveVersion: number }).saveVersion).toBe(29)
  })

  it('a live V29 state carrying a real promise round-trips through the bridge save/load path byte-stable, and the promise-row read is identical on both sides', () => {
    const { state: submitted, talentId, playerStudioId } = openCaseWithBothProposals('p14b1-bridge-roundtrip')
    const proposal = currentProposals(submitted, talentId).find((p) => p.issuerStudioId === playerStudioId)!
    const state = attachPromise(submitted, talentId, playerStudioId, {
      family: 'APPEARANCE_COUNT', predicate: { count: 1 }, windowStartWeek: proposal.startWeek, dueWeekExclusive: proposal.startWeek + 40,
    })
    expect(state.promises).toHaveLength(1) // sanity: a real promise exists to round-trip

    const session = new BridgeSession(state, 'p14b1-bridge-roundtrip')
    const saved = session.save({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId, commandId: 'save-1', expectedStateRevision: session.stateRevision })
    expect(saved.accepted).toBe(true)
    if (!saved.accepted) throw new Error(`save refused: ${JSON.stringify(saved)}`)
    const parsed = JSON.parse(saved.saveJson) as { saveVersion: number; state: { promises: unknown[] } }
    expect(parsed.saveVersion).toBe(29)
    expect(parsed.state.promises).toHaveLength(1)

    const reloaded = BridgeSession.fromSaveJson(saved.saveJson, 'p14b1-bridge-roundtrip-reload')
    // Both sides normalized through one JSON pass first (the accepted -0-vs-0
    // idiom this file's siblings already use) before comparing.
    expect(reloaded.gameState).toEqual(JSON.parse(JSON.stringify(session.gameState)))

    // NOT YET EXISTING: promiseRowsFor — this test's RED cause.
    const before: ProposalRowWithPromise[] = promiseRowsFor(session.gameState, talentId, playerStudioId)
    const after: ProposalRowWithPromise[] = promiseRowsFor(reloaded.gameState, talentId, playerStudioId)
    expect(after).toEqual(JSON.parse(JSON.stringify(before)))
  })
})
