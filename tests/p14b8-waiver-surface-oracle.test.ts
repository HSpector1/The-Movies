// P14B.8 T1 — independent test engineer RED suite for THE WAIVER'S PLAYER SURFACE, ENGINE HALF
// (evidence 750-T). Authority: record 744 as amended by its §11 log, record 745-C, and brief 749-T.
// Source read and measured at HEAD 25794023.
//
// THIS FILE IS THE ORACLE, NOT THE RED. B.8 moves no engine law (744 §1: "Nothing about the waiver
// LAW moves in this slice"), so every case below PASSES against current source, deliberately, and
// each one says so in its own name. They exist for three reasons a bridge-only file cannot serve:
//
//   (a) THE FIXTURE CONTRACT. The two worlds this slice rests on are pinned by sha256 re-read from
//       disk, so a re-mint or an edit of either artifact fails here rather than silently moving what
//       the bridge half asserts. `genuine-v32-owes-two-p1` is not consumed by any other test file in
//       the repository today (its minter was archived out of tests/ at 6d93e62c), so without this
//       file nothing guards its bytes.
//   (b) THE VERBATIM SENTENCES. Completion condition 2 requires the bridge to publish the engine's
//       refusal sentence VERBATIM. Pinning the sentence on the law here means a bridge failure is
//       attributable on sight: this file red = the law moved; only the bridge file red = the surface
//       published the wrong copy.
//   (c) THE OWNERSHIP EXPOSURE (744 §11 A1). `waiverAccepted` and `waivePromise` apply no ownership
//       test at all. group4 MEASURES that hole on a genuine rival-issued bound open promise so the
//       bridge gate is pinned against a demonstrated exposure rather than a suspected one.
//
// THIS FILE IS ENGINE-ONLY BY THE B.7 SPLIT (730-T finding 3): it imports nothing from bridge/,
// because bridge/*.ts's own internal `.ts`-extension imports are illegal under the ROOT tsconfig
// and one reachable bridge import pulls the whole bridge module graph into `npx tsc --noEmit`.
// Every bridge-facing case of B.8 lives in tests/bridge-p14b8-waiver-surface.test.ts.
//
// NO RED MECHANISM IS NEEDED HERE. Unlike B.7, `waivePromise` and `waiverAccepted` both EXIST at
// this HEAD; nothing in this file imports a member that does not. The `assertWaiverFns()` guard is
// kept anyway, at one line, because the memory rule (vite/esbuild binds a missing named export to
// `undefined` without throwing) applies to any future rename of either verb.
//
// MEASURED LIVE on the owes-two fixture at week 104 before this file was written (disposable
// vite-node probe; full transcript in 750-T-b8-red.md). The whole verdict table, not just the two
// rows the brief names:
//   count 1, window [105,165)      -> "only 1 of the 2 pictures still owed would be covered"   (rule 7)
//   count 2, window [105,165)      -> null (ACCEPTED)
//   count 3, window [105,165)      -> rule 9, "needs a picture not yet commissioned"
//   count 2, window [104,194)      -> "an identical substitute changes nothing this studio owes"
//   count 2, window [104,165)      -> "a substitute is a forward obligation, ..."
//   count 2, window [105,504)      -> rule 9, "the due week falls outside the proposed contract"
//   DIRECTING_COUNT count 2        -> rule 9, "... — a directing promise is not offered in this slice"
//   P2 lead count 2                -> rule 9, "needs a picture not yet commissioned"   <- NOT rule 6
//   P2 lead count 1                -> rule 7, "only 1 of the 2 pictures still owed would be covered"
//
// 744 §11 A13 IS WRONG AS STATED, and group3 records the measurement. A13 says "a P2 substitute
// against a P1 original fires rule 6 (the seat-mask strength test) first and masks rule 7 entirely".
// It does not. Rule 6 refuses a substitute whose seat mask is NOT a subset of the promised mask; a
// P1 original's mask is every slot, so a lead-only substitute is a SUBSET and rule 6 PASSES. The
// direction A13 names is inverted. Its practical advice (hold family and seat class equal, vary only
// the count) is still what this suite does, because the P2 route reaches rule 7 only at count 1 and
// diverts to rule 9 at count 2 — so it cannot express the ACCEPT half of the Owner's case.
//
// LOAD-BEARING, NOT DISTURBED (744 §11 A11): the owes-two world still holds an ACTIVE throwaway
// production seating t-act-09, which supplies `seatedPreFirstTake = 1` and is the only reason a
// count-2 substitute is REASONABLY_ACHIEVABLE rather than FRAGILE. No case in either B.8 file
// cancels or films it. The count-3 refusal above is that ceiling being hit.
//
// Not exercised here: the bridge, the wire, native/Unity, the full core suite, the evidence runner.
// No native, UI or Owner acceptance claim.

import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import {
  PROMISE_RULES_VERSION, waivePromise, waiverAccepted,
  type PromiseAttachment,
} from '../src/core/promises.js'
import { LIVE_SAVE_VERSION, convertV31ToV32, convertV32ToV33, validateSaveV31, validateSaveV32 } from '../src/core/save.js'
import type { GameState, ProfessionalPromise } from '../src/core/types.js'

const sha = (value: Buffer | string): string => createHash('sha256').update(value).digest('hex')

function assertWaiverFns(): void {
  expect(typeof waiverAccepted, 'B.8 premise: waiverAccepted must still be a named export of src/core/promises.ts').toBe('function')
  expect(typeof waivePromise, 'B.8 premise: waivePromise must still be a named export of src/core/promises.ts').toBe('function')
}

// ── The two worlds, pinned by sha256 RE-READ FROM DISK (never copied out of the MANIFEST text) ───
// owes-two: tests/fixtures/p14/genuine-v32-pre-b8/MANIFEST.json, minted at c7b5fd79, NOT
// byte-reproducible (744 §11 A7) — a re-mint orphans every hash recorded here and in that manifest.
const OWES_TWO = {
  gz: '56f629994f48ea5949a5dad5da44af5bba8ee2943451a05badd3bc4d98793daa',
  raw: 'ccd30fdf7bd2f379bf44d150e03529b1c83f02086d79812800f4a255c766ea6d',
  week: 104,
  promiseId: 'promise-0',
  talentId: 't-act-09',
  issuer: 'studio-aca408ec-player',
  contractId: 'studio-aca408ec-player:contract:t-act-09:104:player-30',
} as const
// with-edges: the ONLY published fixture holding a RIVAL-ISSUED bound OPEN promise. Verified by
// decompressing all nine genuine-v31-pre-b7 artifacts and reading every promise row: nine such rows
// here, none anywhere else (rival-current-p1-and-p2's 48 promises are all settled or unbound).
const WITH_EDGES = {
  gz: '2dce6bfe05f68a20d40f5887171138769848e27c9b147196a59ca6072eb48e6c',
  raw: 'eb516760bd9a633906cee2cb9a82c855944cb5448b074d40e77ec72fc20a7054',
  week: 213,
  promiseId: 'promise-1',
  rivalIssuer: 'studio-aca408ec-r02',
  beneficiary: 'person-studio-aca408ec-r01-0',
  player: 'studio-aca408ec-player',
  promiseCount: 48,
} as const

function artifact(relative: string): Buffer {
  const file = `tests/fixtures/p14/${relative}`
  expect(existsSync(file), 'T0 NOT COMPLETE: genuine artifact missing: ' + file).toBe(true)
  return readFileSync(file)
}

/** The V32 world that OWES TWO. Validated by the LIVE frozen validator first, never softened. */
function owesTwo(): GameState {
  const compressed = artifact('genuine-v32-pre-b8/genuine-v32-owes-two-p1.json.gz')
  const raw = gunzipSync(compressed).toString('utf8')
  expect(sha(compressed), 'owes-two compressed bytes moved: the fixture was re-minted or edited').toBe(OWES_TWO.gz)
  expect(sha(raw), 'owes-two uncompressed bytes moved: the fixture was re-minted or edited').toBe(OWES_TWO.raw)
  // `validateSaveV32` STAYS: this is a genuine V32 artifact, admitted by the validator
  // of its own version. Only the LIFT to the live GameState moves (P14C.1).
  const save = validateSaveV32(JSON.parse(raw))
  expect(save.state.market.tick).toBe(OWES_TWO.week)
  return convertV32ToV33(save).state as unknown as GameState
}

/** The V31 world holding RIVAL-ISSUED bound open promises, lifted through the lawful conversion. */
function withEdges(): GameState {
  const compressed = artifact('genuine-v31-pre-b7/genuine-v31-with-edges.json.gz')
  const raw = gunzipSync(compressed).toString('utf8')
  expect(sha(compressed), 'with-edges compressed bytes moved: the fixture was re-minted or edited').toBe(WITH_EDGES.gz)
  expect(sha(raw), 'with-edges uncompressed bytes moved: the fixture was re-minted or edited').toBe(WITH_EDGES.raw)
  const save = validateSaveV31(JSON.parse(raw))
  expect(save.state.market.tick).toBe(WITH_EDGES.week)
  return convertV32ToV33(convertV31ToV32(save)).state as unknown as GameState
}

function promiseOf(state: GameState, promiseId: string): ProfessionalPromise {
  const promise = state.promises.find((p) => p.promiseId === promiseId)
  expect(promise, `fixture premise: ${promiseId} must exist`).toBeDefined()
  return promise!
}

/** Every substitute in this file holds family and seat class EQUAL to a P1 original and varies
 *  only count and window, per 744 §11 A13's practical half (its stated mechanism is refuted in
 *  group3). A P1 original's predicate carries no `kind`, so neither does its substitute. */
function p1Substitute(count: number, windowStartWeek: number, dueWeekExclusive: number): PromiseAttachment {
  return { family: 'APPEARANCE_COUNT', predicate: { count }, windowStartWeek, dueWeekExclusive }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// group1 — the fixture contract. PASSES TODAY BY DESIGN: this is the premise the whole slice rests
// on, and nothing else in the repository pins these bytes.
describe('P14B.8 group1 — the owes-two world is exactly what 744 §11 A5 says it is (PASSES TODAY: fixture contract, not a RED)', () => {
  it('holds ONE bound open player-issued APPEARANCE_COUNT promise at count 2, progress 0, remaining 2, with no link and no evidence', () => {
    const state = owesTwo()
    expect(state.promises).toHaveLength(1)
    const promise = promiseOf(state, OWES_TWO.promiseId)
    expect(promise).toMatchObject({
      family: 'APPEARANCE_COUNT',
      predicate: { count: 2 },
      progress: 0,
      issuerStudioId: OWES_TWO.issuer,
      beneficiaryPersonId: OWES_TWO.talentId,
      contractId: OWES_TWO.contractId,
      outcome: null,
      outcomeWeek: null,
      outcomeEventId: null,
      supersededByPromiseId: null,
      version: PROMISE_RULES_VERSION,
    })
    expect(promise.evidenceRefs).toEqual([])
    // The remaining obligation is TWO. That is the property no other published fixture has, and the
    // only reason a POSITIVE-but-insufficient substitute count is expressible at all (744 Trap 4).
    expect(promise.predicate.count - promise.progress).toBe(2)
    expect(state.hollywood?.playerStudioId).toBe(OWES_TWO.issuer)
  })

  it('744 §6: B.8 is a wire change, so LIVE_SAVE_VERSION stays 33 (stale title corrected post-C.1) and PROMISE_RULES_VERSION stays 4', () => {
    expect(LIVE_SAVE_VERSION, 'B.8 moves no save law; a bump here is a plan amendment, not an implementation detail').toBe(33)
    expect(PROMISE_RULES_VERSION, 'B.8 moves no promise rule; the stamped law version does not move').toBe(4)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// group2 — THE VERBATIM ORACLE. Every sentence the bridge half asserts is pinned here on the law
// first. PASSES TODAY BY DESIGN.
describe('P14B.8 group2 — waiverAccepted\'s verdict table on the owes-two world at week 104 (PASSES TODAY: the oracle the bridge must publish verbatim)', () => {
  it('THE OWNER\'S CASE: a count-1 substitute is refused with "only 1 of the 2 pictures still owed would be covered", and a count-2 substitute is ACCEPTED', () => {
    assertWaiverFns()
    const state = owesTwo()
    const promise = promiseOf(state, OWES_TWO.promiseId)
    const week = state.market.tick
    expect(waiverAccepted(state, promise, p1Substitute(1, week + 1, week + 61), week))
      .toBe('only 1 of the 2 pictures still owed would be covered')
    expect(waiverAccepted(state, promise, p1Substitute(2, week + 1, week + 61), week), 'the ACCEPT half of the Owner\'s case; 744 §11 A11 records it measured at this exact week').toBeNull()
  })

  it('asking is a READ: waiverAccepted mutates nothing, on the refusal and on the acceptance alike', () => {
    assertWaiverFns()
    const state = owesTwo()
    const before = structuredClone(state)
    const promise = promiseOf(state, OWES_TWO.promiseId)
    const week = state.market.tick
    waiverAccepted(state, promise, p1Substitute(1, week + 1, week + 61), week)
    waiverAccepted(state, promise, p1Substitute(2, week + 1, week + 61), week)
    expect(state).toEqual(before)
  })

  it('count 2 is the ONLY accepted count on this world: count 3 hits the seat ceiling the throwaway production sets, not rule 7', () => {
    assertWaiverFns()
    const state = owesTwo()
    const promise = promiseOf(state, OWES_TWO.promiseId)
    const week = state.market.tick
    // 744 §11 A5 / record 747: `existingPath` is the binding constraint and M16 exclusivity caps it
    // at 1 for one beneficiary. This is the same wall that blocked the Owner's literal 3/1/2 world.
    expect(waiverAccepted(state, promise, p1Substitute(3, week + 1, week + 61), week))
      .toBe('what remains of the contract cannot reasonably carry the substitute — needs a picture not yet commissioned')
  })

  it('the three refusals that surround the accepted draft: identical, backward window, window past the contract', () => {
    assertWaiverFns()
    const state = owesTwo()
    const promise = promiseOf(state, OWES_TWO.promiseId)
    const week = state.market.tick
    expect(waiverAccepted(state, promise, p1Substitute(2, promise.windowStartWeek, promise.dueWeekExclusive), week))
      .toBe('an identical substitute changes nothing this studio owes')
    expect(waiverAccepted(state, promise, p1Substitute(2, week, week + 61), week))
      .toBe('a substitute is a forward obligation, and this window opens no later than the week of the waiver')
    // The Owner's own B.7 amendment: an otherwise-achievable substitute ending beyond the employment
    // contract is cleanly REFUSED, never accepted and rejected later during saving.
    expect(waiverAccepted(state, promise, p1Substitute(2, week + 1, week + 400), week))
      .toBe('what remains of the contract cannot reasonably carry the substitute — the due week falls outside the proposed contract')
  })

  it('745-C §7(a) CONFIRMED BY MEASUREMENT: a DIRECTING_COUNT substitute publishes build vocabulary, which is why the B.8 wire must not be able to express it (744 §11 A8)', () => {
    assertWaiverFns()
    const state = owesTwo()
    const promise = promiseOf(state, OWES_TWO.promiseId)
    const week = state.market.tick
    const refusal = waiverAccepted(state, promise, { family: 'DIRECTING_COUNT', predicate: { count: 2 }, windowStartWeek: week + 1, dueWeekExclusive: week + 61 }, week)
    expect(refusal).toBe('what remains of the contract cannot reasonably carry the substitute — a directing promise is not offered in this slice')
    // A8's decision rests on this string being REACHABLE through rule 9, not on it being hypothetical.
    expect(refusal).toContain('not offered in this slice')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// group3 — the A13 correction, recorded as a measurement rather than as prose.
describe('P14B.8 group3 — 744 §11 A13 IS WRONG: a P2 substitute against a P1 original does NOT fire rule 6 (PASSES TODAY: it records what the source does)', () => {
  it('a lead-only substitute is a SUBSET of a P1 mask, so rule 6 passes; at count 2 the draft reaches rule 9 and at count 1 it reaches rule 7', () => {
    assertWaiverFns()
    const state = owesTwo()
    const promise = promiseOf(state, OWES_TWO.promiseId)
    const week = state.market.tick
    const p2 = (count: number): PromiseAttachment => ({
      family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT',
      predicate: { kind: 'castRoleCount', count, seatClass: 'lead' },
      windowStartWeek: week + 1,
      dueWeekExclusive: week + 61,
    })
    // If A13 were right, BOTH of these would read "the part offered is weaker than the part promised".
    expect(waiverAccepted(state, promise, p2(2), week), 'A13 predicted rule 6 here; the source reaches rule 9')
      .toBe('what remains of the contract cannot reasonably carry the substitute — needs a picture not yet commissioned')
    expect(waiverAccepted(state, promise, p2(1), week), 'A13 predicted rule 6 masks rule 7 entirely; the source reaches rule 7')
      .toBe('only 1 of the 2 pictures still owed would be covered')
    // A13's ADVICE still binds this suite for a different reason: the P2 route cannot express the
    // ACCEPT half, because rule 9 refuses the only count rule 7 would admit.
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// group4 — THE OWNERSHIP EXPOSURE (744 §11 A1). PASSES TODAY BY DESIGN, AND THAT IS THE FINDING.
//
// READ THIS BEFORE "FIXING" A FAILURE HERE. The parent decided the ownership gate belongs to the
// BRIDGE (744 §11 A1: "the bridge refuses a `promiseId` whose issuer is not the player's studio, at
// the quote AND again at the commit"). These cases therefore assert what the ENGINE does TODAY, so
// that tests/bridge-p14b8-waiver-surface.test.ts group9 is pinned against a DEMONSTRATED hole. If a
// writer closes the gate inside `waiverAccepted`/`waivePromise` instead, this group turns red. That
// is a SCOPE CHANGE to escalate to the parent, not a regression to silence, and not a licence to
// delete this group.
describe('P14B.8 group4 — the engine applies NO ownership test to a waiver (PASSES TODAY: the exposure the bridge gate must close)', () => {
  it('with-edges holds a genuine RIVAL-ISSUED bound OPEN promise, and the player\'s studio is not its issuer', () => {
    const state = withEdges()
    expect(state.promises).toHaveLength(WITH_EDGES.promiseCount)
    expect(state.hollywood?.playerStudioId).toBe(WITH_EDGES.player)
    const rival = promiseOf(state, WITH_EDGES.promiseId)
    expect(rival).toMatchObject({
      issuerStudioId: WITH_EDGES.rivalIssuer,
      beneficiaryPersonId: WITH_EDGES.beneficiary,
      family: 'APPEARANCE_COUNT',
      predicate: { count: 1 },
      outcome: null,
    })
    expect(rival.issuerStudioId).not.toBe(state.hollywood?.playerStudioId)
    expect(rival.contractId, 'the gate must be pinned against a BOUND rival promise: an unbound one is refused by rule 2 for an unrelated reason').not.toBeNull()
    // Nine of them, so the exposure is not one unlucky row.
    expect(state.promises.filter((p) => p.issuerStudioId !== state.hollywood?.playerStudioId && p.contractId !== null && p.outcome === null).length).toBeGreaterThanOrEqual(9)
  })

  it('waiverAccepted ACCEPTS a substitute against the rival\'s promise: it returns null, so there is no engine sentence for the bridge to publish as an ok:false verdict', () => {
    assertWaiverFns()
    const state = withEdges()
    const rival = promiseOf(state, WITH_EDGES.promiseId)
    const week = state.market.tick
    expect(waiverAccepted(state, rival, p1Substitute(1, week + 1, week + 61), week), 'if this ever returns a sentence, 744 §11 A1\'s premise moved and the bridge gate\'s shape must be re-decided').toBeNull()
    expect(waiverAccepted(state, rival, p1Substitute(2, week + 1, week + 61), week)).toBeNull()
  })

  it('waivePromise CARRIES IT OUT: the rival\'s promise settles WAIVED and a substitute binds to the RIVAL\'s own employment contract, with the player never named', () => {
    assertWaiverFns()
    const state = withEdges()
    const rival = promiseOf(state, WITH_EDGES.promiseId)
    const week = state.market.tick
    const after = waivePromise(state, { promiseId: WITH_EDGES.promiseId, substitute: p1Substitute(1, week + 1, week + 61) })
    expect(after.promises).toHaveLength(WITH_EDGES.promiseCount + 1)
    const waived = after.promises.find((p) => p.promiseId === WITH_EDGES.promiseId)!
    expect(waived.outcome).toBe('WAIVED')
    expect(waived.supersededByPromiseId).toBe(`promise-${String(WITH_EDGES.promiseCount)}`)
    const substitute = after.promises.find((p) => p.promiseId === `promise-${String(WITH_EDGES.promiseCount)}`)!
    expect(substitute.issuerStudioId, 'the substitute is minted for the RIVAL, from the rival\'s own row — no ownership fact enters anywhere').toBe(WITH_EDGES.rivalIssuer)
    expect(substitute.contractId).toBe(rival.contractId)
    // The player's studio appears nowhere in the transaction, which is exactly why no viewer-scoped
    // read model would show the player what they did.
    expect(substitute.issuerStudioId).not.toBe(WITH_EDGES.player)
  })

  it('744 §11 A2: a waived promise carries a NON-NULL outcomeEventId, so the Industry exclusion rests on the outcome enum test ALONE', () => {
    assertWaiverFns()
    const state = owesTwo()
    const week = state.market.tick
    const after = waivePromise(state, { promiseId: OWES_TWO.promiseId, substitute: p1Substitute(2, week + 1, week + 61) })
    const waived = after.promises.find((p) => p.promiseId === OWES_TWO.promiseId)!
    expect(waived.outcome).toBe('WAIVED')
    // `settle` coerces it (src/core/promises.ts :706, `next.outcomeEventId ?? eventId`), so the
    // "excluded twice over" claim 744 §6 made is withdrawn and must never be re-asserted as a pin.
    expect(waived.outcomeEventId, 'if this is ever null, the vacuous `outcomeEventId !== null` clause at bridge/industry.ts :148 becomes load-bearing and the exclusion must be re-argued').not.toBeNull()
    expect(after.talentMarket.receipts.find((r) => r.eventId === waived.outcomeEventId)).toMatchObject({ kind: 'promiseOutcome' })
  })
})
