// P14B.7 T1 — independent test engineer RED suite for the promise waiver (evidence 725-T).
// Authority: 720-b7-waiver-expansion.md CURRENT bytes -- amended after 723-C audit; §6 amended a
// second time by a mid-task parent correction; then Owner decisions landed adding §2 items 16-18
// and closing the trust-consequence question -- read in full each time before continuing, plus the
// parent's two mid-task corrections (the 11th pin: public industry activity fold; the 12th+13th+
// closed-item batch below). Fixtures: the nine genuine outgoing V31 saves minted at T0 (record
// 722), `tests/fixtures/p14/genuine-v31-pre-b7/`.
//
// PATCHED by 730-T (report: 731-T-b7-red-patch.md) on three findings from the writer's first pass:
// (1) a live exploit item 17's substitute half never pinned -- see group6's new case and THE LAW
// below; (2) LIVE_SAVE_VERSION was pinned at the OUTGOING value 31 by a bad reading of T1's own
// brief -- now pinned at 32, the slice's own save step; (3) this file's bridge/*.ts imports broke
// `npx tsc --noEmit` (bridge/*.ts's own internal `.ts`-extension imports are not legal under the
// ROOT tsconfig, which has no `allowImportingTsExtensions`) -- bridge-touching cases (group10,
// group11, and the PROJECTION_VERSION pin) now live in the sibling `tests/bridge-p14b7-promise-
// waiver.test.ts`, matched by the existing `tests/bridge*.test.ts` exclude. THIS file is engine-only.
//
// OWNER-DECIDED ADDITIONS (720 §2 items 16-18, §5(c)/(d) final, §7's trust question CLOSED):
//   item 16 -- a REFUSED waiver leaves the original promise AND THE WHOLE GAME STATE unchanged,
//     the refusal published, not "accepted and rejected later during saving" (Owner's own words,
//     naming the contract-window-overrun case specifically). Pinned in group1 with a full
//     before/after state comparison, not merely a `toThrow()`, and added to every other refusal
//     case cheaply available.
//   item 17 -- the substitute mints at `progress: 0`, `evidenceRefs: []`; the original's qualifying
//     takes are NOT swept into it and do NOT become retroactively eligible (Owner: "without erasing
//     completed work or counting it again"). Pinned in group6 on `genuine-v31-part-served-p1`
//     (count 2, progress 1, remaining 1) -- the SAME general rule the Owner's "three-picture served
//     once, two-picture substitute, two further" illustration states, at smaller numbers (no V31
//     fixture in this corpus carries a count-3 promise; T1 does not mint new fixtures). THE OTHER
//     HALF of item 17 (730-T finding 1, previously pinned NOWHERE): a substitute whose window opens
//     ON or before the waiver week is immediately credited with a take that already served the
//     ORIGINAL, by construction (`qualifyingTakes`, promises.ts:637-641, excludes only `take.week <
//     windowStartWeek`, so a take landing AT the window's first week qualifies) -- promise two,
//     deliver one, waive for a one-picture substitute opening the week the take landed, owe nothing
//     further, collect a `promiseKept`-shaped SATISFIED for free. THE LAW (the parent's, chosen over
//     W's narrower take-scan): a legal substitute's `windowStartWeek` must be STRICTLY GREATER than
//     the waiver week -- structural, refused with a stated reason, because a take landing LATER in
//     the SAME week would still be wrongly credited under a scan that only excludes the instance
//     measured, not the class. Pinned in group6 alongside item 17's mint-time half. Every OTHER
//     draft in this file opening at `today` or earlier moved past it too (730-T; see 731-T report).
//   item 18 -- the waiver's attention row text must not read "kept" or "broken" -- `bridge/trust.ts
//     :69`'s ternary has no third arm today, so widening the gate alone would publish a false
//     breach. Pinned in group10 (now `tests/bridge-p14b7-promise-waiver.test.ts`, split by 730-T
//     finding 3 for typecheck) as a hard negative on the row's own TEXT (not "kept", not "broken")
//     plus a softer, separately-labelled interpretation (mentions "waived") -- corrected by 730-T:
//     group10 previously pinned only the row's existence and a non-empty reason, never its text.
//   CLOSED, no longer deferred -- a waiver moves NO trust label and mints NO driver
//     (P14-PREPARATION-COMPANION.md :379, ruling S11 :568; `trustDrivers` enumerates five kinds and
//     none is a waiver, so this already holds by construction and only needs a regression pin).
//     NOT YET PINNED ANYWHERE IN THIS SUITE (730-T finding 3 correction): this header previously
//     claimed a "New group12" that was never written into the file body; W caught the false claim
//     and the parent's ruling for 730-T was to correct the prose, not to author the missing group
//     now. The requirement is not in dispute -- the regression pin is an open gap, not a decision.
//
// RED MECHANISM (memory: vite/esbuild binds a MISSING NAMED EXPORT to `undefined` WITHOUT
// throwing). Unlike a brand-new module (where the whole file fails at resolution), both
// `src/core/promises.ts` and `src/core/save.ts` ALREADY EXIST, so `waivePromise`, `waiverAccepted`,
// `convertV31ToV32` and `convertV32ToV31` bind to `undefined` SILENTLY on import. Every case below
// that calls one of these asserts `typeof x === 'function'` FIRST, so `expect(() =>
// waivePromise(...)).toThrow()` can never pass on "waivePromise is not a function" instead of the
// real refusal. See 725-T-b7-red.md for the per-case confirmation that each failure is the stated
// reason, not import resolution.
//
// INTERPRETATIONS NAMED (720 pins the requirement, not every literal shape; none is a refusal --
// a writer may rename with the ruling recorded, the same convention 654-T used for B.5 relationships):
//   I1. `waiverAccepted` returns `string | null` (null = accepted, a reason string = refused) --
//       "a SEPARATE pure predicate returning A REASON, not a boolean" (720 §2 item 2), the same
//       shape this module's own `targetSpecificImpossibility` already uses (promises.ts :667-673).
//   I2. The substitute draft mirrors the existing `PromiseAttachment` shape exactly: { family,
//       predicate, windowStartWeek, dueWeekExclusive } -- item 10 says the substitute carries the
//       identical predicate/window shape a proposal-side promise carries, just bound directly.
//   I3. The V31->V32 migration follows the IDENTICAL naming convention used one version ago
//       (`convertV30ToV31`/`convertV31ToV30`/`projectRelationshipsPreV31`, save.ts :8792-8823) and
//       two versions ago (`convertV28ToV29`/`projectPromisesPreV29`): `convertV31ToV32`,
//       `convertV32ToV31`, `projectPromisesPreV32`.
//   I4. `waivePromise` reads "today" as `state.market.tick`, exactly as `attachPromise` does
//       (promises.ts :509) -- item 1's signature takes no week parameter.
//   I5. Item 18's third ternary arm reads a word containing "waived" (matching the grammar of the
//       existing "kept"/"broken" pair and the outcome enum's own vocabulary). 720 does NOT pin this
//       literal word -- only that it is NOT "kept" and NOT "broken" -- so this is a soft,
//       separately-labelled assertion in group10, never the item's hard requirement.
//
// ENGINE FACTS MEASURED LIVE against the T0 corpus before this suite was written (disposable
// probe, run then deleted; full transcript in 725-T-b7-red.md) -- not read off the source, not
// assumed:
//   - genuine-v31-bound-open-p1 promise-0 (t-act-09): real contract [52,104), promise window
//     [52,92). A substitute window [60,110) judged against the REAL interval is
//     promiseFeasibility() IMPOSSIBLE "the due week falls outside the proposed contract"; the
//     IDENTICAL draft judged the reclassifyPromise-buggy way (its own window as the interval) is
//     REASONABLY_ACHIEVABLE. The trap 720 §3 names is real and silent.
//   - The same fixture's window [60,100) (inside the real contract) is REASONABLY_ACHIEVABLE, and
//     so is an EXACT COPY of promise-0's own family/count/window (the identical-substitute draft)
//     -- feasibility is not what must refuse the identical case; only item 6's own check can.
//   - genuine-v31-bound-open-p2-lead promise-0 (mask ['lead']): a P1 substitute (mask = all three
//     slots, a superset) and a leadOrAntagonist substitute (mask ['lead','antagonist'], also a
//     superset of ['lead']) are BOTH REASONABLY_ACHIEVABLE -- feasibility cannot be why either is
//     refused; only the subset test can be. A same-class ('lead') substitute at a different window
//     is also REASONABLY_ACHIEVABLE (the equality case, legal).
//   - genuine-v31-bound-open-p1 promise-0 (P1, mask = all three): a LEAD_OR_SIGNIFICANT_ROLE_COUNT
//     ('lead') substitute (a proper subset of the original mask, the upgrade direction) is
//     REASONABLY_ACHIEVABLE.
//   - genuine-v31-part-served-p1 promise-0 (count 2, progress 1): a count-1 substitute (exactly
//     the REMAINING obligation, 720 §5(c)'s recommendation) is REASONABLY_ACHIEVABLE.
//   - genuine-v31-distrusted-issuer promise-0 reads Distrusted via `trustDescriptor` (confirmed:
//     two negative cancelledAfterFirstTake drivers, one positive ranToEnd -- 720's own "tolerates a
//     positive driver" fact holds), and a legal, non-identical substitute for it is STILL
//     REASONABLY_ACHIEVABLE by promiseFeasibility -- isolating the third acceptance condition as
//     the only thing that can refuse it.
//   - genuine-v31-bound-open-p1 and genuine-v31-part-served-p1 both read Reliable (not Distrusted)
//     at their own week, so both are safe "happy path" acceptance worlds.
//
// Not exercised here: native/Unity, the full core suite, the evidence runner. Native/UI/Owner
// acceptance and any waiver policy for RIVAL studios are out of scope (720 §7).

import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import {
  advancePromisesWeek, promiseCastSlots, promiseFeasibility, qualifyingTakes, trustDescriptor,
  type PromiseDraft, type PromisePredicate,
  // RED-by-design (720 §2 items 1-2): neither exists in src/core/promises.ts today.
  waivePromise, waiverAccepted,
} from '../src/core/promises.js'
import {
  LIVE_SAVE_VERSION, validateSaveV31,
  // RED-by-design (720 §2 item 11): the V31->V32 step does not exist today.
  convertV31ToV32, convertV32ToV31,
} from '../src/core/save.js'
// 730-T finding 3: PromiseFamily/PromiseFeasibilityReceipt are DEFINED in types.ts and only
// IMPORTED (not re-exported) by promises.ts -- importing them from promises.js does not typecheck
// (TS2459/TS2724), measured directly against this file by `npx tsc --noEmit`.
import type { GameState, ProfessionalPromise, PromiseFamily, PromiseFeasibilityReceipt } from '../src/core/types.js'
import { historyFixture } from './helpers/p14b2-fixtures.js'
// bridge/*.ts imports (PROJECTION_VERSION, industryPage, promiseAttentionRows, the Industry Pulse
// helpers) moved OUT of this file by 730-T finding 3: bridge/*.ts's own internal `.ts`-extension
// imports are not legal under the ROOT tsconfig (no `allowImportingTsExtensions`), and once ANY
// bridge/ import is reachable from a root-included file the WHOLE bridge/ module graph (plus its
// `ui/src/engine/adapter.ts` dependents, reached via bridge/industry.ts ->
// bridge/snapshot-build-context.ts) is pulled into the program and fails `npx tsc --noEmit` --
// measured: 131 errors with this file's bridge imports included, 13 of them on this file's own
// lines (see 731-T-b7-red-patch.md). Bridge-touching cases now live in the sibling
// `tests/bridge-p14b7-promise-waiver.test.ts`, matched by the tests/bridge*.test.ts exclude.

// ── I2: the substitute draft this whole file pins ───────────────────────────────────────────────
type WaiverSubstituteDraft = { family: PromiseFamily; predicate: PromisePredicate; windowStartWeek: number; dueWeekExclusive: number }
type WaivePromiseFn = (state: GameState, draft: { promiseId: string; substitute: WaiverSubstituteDraft }) => GameState
type WaiverAcceptedFn = (state: GameState, promise: ProfessionalPromise, substitute: WaiverSubstituteDraft, week: number) => string | null

function assertWaiverFns(): void {
  expect(typeof waivePromise, 'RED premise: waivePromise must exist as a named export of src/core/promises.ts').toBe('function')
  expect(typeof waiverAccepted, 'RED premise: waiverAccepted must exist as a named export of src/core/promises.ts').toBe('function')
}
function assertMigrationFns(): void {
  expect(typeof convertV31ToV32, 'RED premise: convertV31ToV32 must exist as a named export of src/core/save.ts').toBe('function')
  expect(typeof convertV32ToV31, 'RED premise: convertV32ToV31 must exist as a named export of src/core/save.ts').toBe('function')
}
const waive = waivePromise as unknown as WaivePromiseFn
const accepted = waiverAccepted as unknown as WaiverAcceptedFn

// ── T0 corpus (tests/fixtures/p14/genuine-v31-pre-b7/MANIFEST.json; sha256 re-verified from disk
// by this suite's author, not copied from the manifest text) ──────────────────────────────────
const V31_PINS = {
  'empty': { raw: 'd5a5a9ad1d3819436fa47a91b519692506341d36172e9c60b4ea57c9eb57d98d', gz: '449b8a8a34fd73f07d6e1275ffdfdaa7e15c1baef2424dd8a91475cea0fc67ec', week: 0 },
  'bound-open-p1': { raw: '0ff9044f4529b3821efe3be92911bce10768fa03ff08653db2ac4ac0dda000eb', gz: '6b5d54b485cdf661118506dcc26d42fd798fb29721154709a6bd208fd4ab769b', week: 52 },
  'bound-open-p2-lead': { raw: '9b01ca9a91aea1a8022827e9cf748c04b64f25666f407b955d2f59fddbb6b495', gz: 'fcf9beaec5cf8e266d8018a979c1a9aa555976b54075e436fc9b9feafbd65018', week: 52 },
  'bound-open-p2-lead-or-antagonist': { raw: '197c87da5a178a7fab21e1381a7009eaa403d78108ba586ff1dc4267d47b133c', gz: '9489c93cadccd7045fc2e1563e8c0c2d667e0603eff407738b9f06bb9e86ceda', week: 52 },
  'part-served-p1': { raw: '2a7a34e57b653cba8ad553d7dfc5894a2595b9f44f50eabae823fea34f3681fd', gz: '12d5e642c9d5efc7129530a451e3426f30b4cb68a13b1bdaee17a6cd428e9f08', week: 113 },
  'kept-and-broken': { raw: '734f671b4617ffb2899ef2326ac8dff00358878be8adbc77f2a2b28d99f010d1', gz: '57362b7e282d8ba85f377b558fea50397ac134531e02de8159541775f0172841', week: 61 },
  'rival-current-p1-and-p2': { raw: 'cf74ef396cdaad0c383c6840cd954f1f7d1ab518b2282fb95911736d1c25467a', gz: 'f7086ec899dbb312ca9c23fc2cd98e929415d1a6e0f8e96eaa875c7a4cc97e99', week: 196 },
  'with-edges': { raw: 'eb516760bd9a633906cee2cb9a82c855944cb5448b074d40e77ec72fc20a7054', gz: '2dce6bfe05f68a20d40f5887171138769848e27c9b147196a59ca6072eb48e6c', week: 213 },
  'distrusted-issuer': { raw: '92dee5918c52c164ca7f4750b861b3c395c70c40cd08ab37045040898d31a958', gz: '1e800333647b8b270a8eba7f563aeafa40330b4d15e5b598cc83c8a517ddadf4', week: 70 },
} as const
type CorpusName = keyof typeof V31_PINS
const corpusPath = (name: CorpusName) => `tests/fixtures/p14/genuine-v31-pre-b7/genuine-v31-${name}.json.gz`
const sha = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')

function fixture(name: CorpusName): GameState {
  const file = corpusPath(name)
  expect(existsSync(file), 'T0 NOT COMPLETE: genuine V31 artifact missing: ' + file).toBe(true)
  const compressed = readFileSync(file)
  const raw = gunzipSync(compressed).toString('utf8')
  expect(sha(compressed)).toBe(V31_PINS[name].gz)
  expect(sha(raw)).toBe(V31_PINS[name].raw)
  const save = validateSaveV31(JSON.parse(raw)) // the genuine frozen validator FIRST
  expect(save.state.market.tick).toBe(V31_PINS[name].week)
  return save.state as unknown as GameState
}
function promiseZero(state: GameState): ProfessionalPromise {
  const promise = state.promises.find((p) => p.promiseId === 'promise-0')
  expect(promise, 'fixture premise: promise-0 must exist').toBeDefined()
  return promise!
}
function contractIntervalOf(state: GameState, promise: ProfessionalPromise): { startWeek: number; termWeeks: number } {
  const emp = state.hollywood!.employment.find((e) => e.contractId === promise.contractId)
  expect(emp, 'fixture premise: promise.contractId must name a real employment record').toBeDefined()
  return { startWeek: emp!.terms.startWeek, termWeeks: emp!.terms.endWeekExclusive - emp!.terms.startWeek }
}
/** The independent oracle for items 4 and 5: the SAME `promiseFeasibility` the engine already
 * has, fed the substitute's draft against the REAL contract interval, excluding the original from
 * its own reservation exactly as `reclassifyPromise` excludes itself (promises.ts :206-208's
 * documented purpose for `PromiseDraft.promiseId`). */
function realFeasibility(state: GameState, promise: ProfessionalPromise, substitute: WaiverSubstituteDraft, week: number): PromiseFeasibilityReceipt {
  const { startWeek, termWeeks } = contractIntervalOf(state, promise)
  const draft: PromiseDraft = {
    family: substitute.family, issuerStudioId: promise.issuerStudioId, beneficiaryPersonId: promise.beneficiaryPersonId,
    predicate: substitute.predicate, windowStartWeek: substitute.windowStartWeek, dueWeekExclusive: substitute.dueWeekExclusive,
    startWeek, termWeeks, promiseId: promise.promiseId,
  }
  return promiseFeasibility(state, draft, week)
}
function substituteOf(before: GameState, after: GameState): ProfessionalPromise {
  const beforeIds = new Set(before.promises.map((p) => p.promiseId))
  const added = after.promises.filter((p) => !beforeIds.has(p.promiseId))
  expect(added, 'exactly one new promise record must be minted by an accepted waiver').toHaveLength(1)
  return added[0]!
}
/** A trivial, structurally-irrelevant draft for refusal cases where the substitute's own content
 * does not matter (the refusal must come from the ORIGINAL's own state, not the substitute). */
function irrelevantDraft(today: number): WaiverSubstituteDraft {
  // 730-T finding 1: THE LAW refuses windowStartWeek <= the waiver week, so an "irrelevant" draft
  // must open STRICTLY AFTER today or it would itself trigger the window refusal, confounding
  // these cases' isolation claim (the refusal must come from the ORIGINAL's state, not the draft).
  return { family: 'APPEARANCE_COUNT', predicate: { count: 1 }, windowStartWeek: today + 1, dueWeekExclusive: today + 41 }
}

// (Industry Pulse helpers and the bridge/trust.ts, bridge/industry.ts, bridge/schema/bridge-
// schema.ts imports they needed moved to tests/bridge-p14b7-promise-waiver.test.ts -- 730-T.)

// ═══════════════════════════════════════════════════════════════════════════════════════════════
describe('P14B.7 group0 — the two verbs exist, are pure, and dispatch (720 §2 items 1-2)', () => {
  it('waivePromise and waiverAccepted are functions (the RED-mechanism guard every later case relies on)', () => {
    assertWaiverFns()
  })
  it('opens with requirePromiseRoots exactly like every other state-mutating export in this file', () => {
    assertWaiverFns()
    const state = fixture('bound-open-p1')
    const { promises: _p, firstTakes: _f, ...stripped } = state as unknown as Record<string, unknown>
    const substitute: WaiverSubstituteDraft = { family: 'APPEARANCE_COUNT', predicate: { count: 1 }, windowStartWeek: 60, dueWeekExclusive: 100 }
    expect(() => waive(stripped as unknown as GameState, { promiseId: 'promise-0', substitute })).toThrow(/Save V29 roots are missing/)
  })
  it('is reachable from applyActions and agrees exactly with the direct call (I2 substitute shape)', () => {
    assertWaiverFns()
    const state = fixture('bound-open-p1')
    const promise = promiseZero(state)
    const substitute: WaiverSubstituteDraft = { family: 'APPEARANCE_COUNT', predicate: { count: 1 }, windowStartWeek: 60, dueWeekExclusive: 100 }
    const direct = waive(state, { promiseId: promise.promiseId, substitute })
    const dispatched = applyActions(state, [{ kind: 'waivePromise', promiseId: promise.promiseId, substitute } as never])
    expect(dispatched).toEqual(direct)
  })
  it('consumes no RNG: rngState is byte-identical before and after an accepted waiver', () => {
    assertWaiverFns()
    const state = fixture('bound-open-p1')
    const promise = promiseZero(state)
    const substitute: WaiverSubstituteDraft = { family: 'APPEARANCE_COUNT', predicate: { count: 1 }, windowStartWeek: 60, dueWeekExclusive: 100 }
    const after = waive(state, { promiseId: promise.promiseId, substitute })
    expect(after.rngState).toBe(state.rngState)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// Priority 1 (§2 item 4, §3's named trap): the substitute's window judged against the REAL
// contract, not against itself. This is the case that catches a writer who copies
// `reclassifyPromise`.
describe('P14B.7 group1 — the substitute window is judged against the REAL employment contract', () => {
  it('PUBLISHES A REFUSAL for a substitute whose window overruns the real contract, not a later save-validator crash', () => {
    assertWaiverFns()
    const state = fixture('bound-open-p1')
    const promise = promiseZero(state) // contract [52,104), promise window [52,92)
    const today = state.market.tick
    const overrun: WaiverSubstituteDraft = { family: 'APPEARANCE_COUNT', predicate: { count: 1 }, windowStartWeek: 60, dueWeekExclusive: 110 }
    // Independent oracle: the REAL contract interval makes this IMPOSSIBLE on a window refusal.
    expect(realFeasibility(state, promise, overrun, today)).toMatchObject({ classification: 'IMPOSSIBLE', bottleneck: 'the due week falls outside the proposed contract' })
    const reason = accepted(state, promise, overrun, today)
    expect(reason, 'a substitute overrunning the real contract must be refused, not silently accepted').not.toBeNull()
    expect(typeof reason).toBe('string')
    expect(reason!.length).toBeGreaterThan(0)
    expect(() => waive(state, { promiseId: promise.promiseId, substitute: overrun })).toThrow()
  })
  it('§2 item 16 (Owner-named scenario): the refusal is CLEAN — the original promise and the whole game state are unchanged, not corrected later during saving', () => {
    assertWaiverFns()
    const state = fixture('bound-open-p1')
    const promise = promiseZero(state)
    const overrun: WaiverSubstituteDraft = { family: 'APPEARANCE_COUNT', predicate: { count: 1 }, windowStartWeek: 60, dueWeekExclusive: 110 }
    const promisesBefore = JSON.stringify(state.promises)
    const receiptsBefore = JSON.stringify(state.talentMarket.receipts)
    const wholeStateBefore = JSON.stringify(state)
    expect(() => waive(state, { promiseId: promise.promiseId, substitute: overrun })).toThrow()
    // A `waivePromise` that builds its successor by mutating shared arrays/objects in place before
    // deciding to throw would corrupt THIS input object even though it "returns nothing" -- the
    // Owner's own failure mode ("not accepted and rejected later during saving"). Re-serializing the
    // SAME reference proves no in-place mutation occurred, not merely that nothing was returned.
    expect(JSON.stringify(state.promises)).toBe(promisesBefore)
    expect(JSON.stringify(state.talentMarket.receipts)).toBe(receiptsBefore)
    expect(state.promises.find((p) => p.promiseId === promise.promiseId)).toEqual(promise) // the original's every field, untouched
    expect(JSON.stringify(state)).toBe(wholeStateBefore)
  })
  it('the SAME window judged the reclassifyPromise-buggy way (its own window as the interval) would wrongly accept it — the trap is real', () => {
    // Not a RED assertion on the engine (this only calls the EXISTING promiseFeasibility);
    // it is the premise proving group1's refusal case actually exercises the named trap.
    const state = fixture('bound-open-p1')
    const promise = promiseZero(state)
    const today = state.market.tick
    const buggyInterval: PromiseDraft = {
      family: 'APPEARANCE_COUNT', issuerStudioId: promise.issuerStudioId, beneficiaryPersonId: promise.beneficiaryPersonId,
      predicate: { count: 1 }, windowStartWeek: 60, dueWeekExclusive: 110,
      startWeek: 60, termWeeks: 50, // the substitute's OWN window as the "interval" -- reclassifyPromise's pattern
      promiseId: promise.promiseId,
    }
    expect(promiseFeasibility(state, buggyInterval, today).classification).toBe('REASONABLY_ACHIEVABLE')
  })
  it('ACCEPTS a substitute whose window fits inside the real contract (isolating the window check from blanket infeasibility)', () => {
    assertWaiverFns()
    const state = fixture('bound-open-p1')
    const promise = promiseZero(state)
    const today = state.market.tick
    const fits: WaiverSubstituteDraft = { family: 'APPEARANCE_COUNT', predicate: { count: 1 }, windowStartWeek: 60, dueWeekExclusive: 100 }
    expect(realFeasibility(state, promise, fits, today).classification).toBe('REASONABLY_ACHIEVABLE')
    expect(trustDescriptor(state, promise.beneficiaryPersonId, promise.issuerStudioId, today).label).not.toBe('Distrusted')
    expect(accepted(state, promise, fits, today)).toBeNull()
    expect(() => waive(state, { promiseId: promise.promiseId, substitute: fits })).not.toThrow()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// Priority 2 (§4): strength is a SUBSET test, substituteMask ⊆ originalMask. Pins a legal upgrade,
// an illegal downgrade AND the equality case, in both directions.
describe('P14B.7 group2 — strength is a SUBSET test (substituteMask ⊆ originalMask), never a superset test', () => {
  it('REFUSES a P1 (all-cast) substitute for a P2-lead original — an illegal downgrade, though independently feasible', () => {
    assertWaiverFns()
    const state = fixture('bound-open-p2-lead')
    const promise = promiseZero(state) // mask ['lead']
    expect(promiseCastSlots(promise)).toEqual(['lead'])
    const today = state.market.tick
    const downgrade: WaiverSubstituteDraft = { family: 'APPEARANCE_COUNT', predicate: { count: 1 }, windowStartWeek: 60, dueWeekExclusive: 100 }
    expect(realFeasibility(state, promise, downgrade, today).classification).toBe('REASONABLY_ACHIEVABLE')
    expect(accepted(state, promise, downgrade, today), 'a superset mask must be refused as a downgrade even when feasible').not.toBeNull()
    expect(() => waive(state, { promiseId: promise.promiseId, substitute: downgrade })).toThrow()
  })
  it('REFUSES a leadOrAntagonist substitute for a P2-lead original — the middle rung is still a downgrade', () => {
    assertWaiverFns()
    const state = fixture('bound-open-p2-lead')
    const promise = promiseZero(state)
    const today = state.market.tick
    const middle: WaiverSubstituteDraft = { family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', predicate: { kind: 'castRoleCount', count: 1, seatClass: 'leadOrAntagonist' }, windowStartWeek: 60, dueWeekExclusive: 100 }
    expect(realFeasibility(state, promise, middle, today).classification).toBe('REASONABLY_ACHIEVABLE')
    expect(accepted(state, promise, middle, today)).not.toBeNull()
  })
  it('ACCEPTS a same-class (lead) substitute for a P2-lead original — the equality case', () => {
    assertWaiverFns()
    const state = fixture('bound-open-p2-lead')
    const promise = promiseZero(state)
    const today = state.market.tick
    const equalLead: WaiverSubstituteDraft = { family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', predicate: { kind: 'castRoleCount', count: 1, seatClass: 'lead' }, windowStartWeek: 60, dueWeekExclusive: 100 }
    expect(realFeasibility(state, promise, equalLead, today).classification).toBe('REASONABLY_ACHIEVABLE')
    expect(trustDescriptor(state, promise.beneficiaryPersonId, promise.issuerStudioId, today).label).not.toBe('Distrusted')
    expect(accepted(state, promise, equalLead, today)).toBeNull()
  })
  it('ACCEPTS a P2-lead substitute for a P1 (all-cast) original — the legal upgrade direction', () => {
    assertWaiverFns()
    const state = fixture('bound-open-p1')
    const promise = promiseZero(state) // mask = CAST_SLOTS (weakest)
    expect(promiseCastSlots(promise)).toEqual(['lead', 'antagonist', 'support'])
    const today = state.market.tick
    const upgrade: WaiverSubstituteDraft = { family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', predicate: { kind: 'castRoleCount', count: 1, seatClass: 'lead' }, windowStartWeek: 60, dueWeekExclusive: 100 }
    expect(realFeasibility(state, promise, upgrade, today).classification).toBe('REASONABLY_ACHIEVABLE')
    expect(accepted(state, promise, upgrade, today)).toBeNull()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// Priority 3 (§2 item 3): refuses when the original is not evaluable(), both halves, separately.
describe('P14B.7 group3 — refuses waiving a promise that is not evaluable() (both halves)', () => {
  it('REFUSES waiving an ALREADY-SATISFIED promise (settle() must not overwrite a terminal outcome)', () => {
    assertWaiverFns()
    const state = fixture('kept-and-broken')
    const promise = state.promises.find((p) => p.promiseId === 'promise-0')! // SATISFIED at week 61
    expect(promise.outcome).toBe('SATISFIED')
    const today = state.market.tick
    const reason = accepted(state, promise, irrelevantDraft(today), today)
    expect(reason, 'a terminal SATISFIED promise must not be waivable').not.toBeNull()
    const before = JSON.stringify(state)
    expect(() => waive(state, { promiseId: promise.promiseId, substitute: irrelevantDraft(today) })).toThrow()
    expect(JSON.stringify(state)).toBe(before) // the input state itself must never be mutated
  })
  it('REFUSES waiving an ALREADY-BROKEN promise (the same terminal law, the other outcome)', () => {
    assertWaiverFns()
    const state = fixture('kept-and-broken')
    const promise = state.promises.find((p) => p.promiseId === 'promise-1')! // BROKEN at week 61
    expect(promise.outcome).toBe('BROKEN')
    const today = state.market.tick
    expect(accepted(state, promise, irrelevantDraft(today), today)).not.toBeNull()
    expect(() => waive(state, { promiseId: promise.promiseId, substitute: irrelevantDraft(today) })).toThrow()
  })
  it('REFUSES waiving an UNBOUND promise (B.1: "mints no outcome for an offer nobody took")', () => {
    assertWaiverFns()
    const f = historyFixture()
    const promise = f.withdrawn.promises.find((p) => p.promiseId === f.withdrawnId)!
    expect(promise.contractId).toBeNull()
    expect(promise.outcome).toBeNull()
    const today = f.withdrawn.market.tick
    const reason = accepted(f.withdrawn, promise, irrelevantDraft(today), today)
    expect(reason, 'an unbound (never-committed) promise must not be waivable').not.toBeNull()
    expect(() => waive(f.withdrawn, { promiseId: promise.promiseId, substitute: irrelevantDraft(today) })).toThrow()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// Priority 4 (§2 item 5): the substitute carries its OWN feasibilityReceipt, exact-key, computed
// at today's week.
describe('P14B.7 group4 — the substitute carries its own feasibilityReceipt (exact-key, today\'s week)', () => {
  it('mints a feasibilityReceipt on the substitute matching the independent oracle exactly', () => {
    assertWaiverFns()
    const state = fixture('bound-open-p1')
    const promise = promiseZero(state)
    const today = state.market.tick
    const substitute: WaiverSubstituteDraft = { family: 'APPEARANCE_COUNT', predicate: { count: 1 }, windowStartWeek: 60, dueWeekExclusive: 100 }
    const expectedReceipt = realFeasibility(state, promise, substitute, today)
    const after = waive(state, { promiseId: promise.promiseId, substitute })
    const minted = substituteOf(state, after)
    expect(minted.feasibilityReceipt).toEqual(expectedReceipt)
    expect(minted.feasibilityReceipt.week).toBe(today)
    expect(Object.keys(minted.feasibilityReceipt).sort()).toEqual(['bottleneck', 'classification', 'inputsDigest', 'rulesVersion', 'week'])
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// Priority 5 (§1, §2 item 2): Distrusted refuses the waiver — a LABEL test, never a driver-purity
// test (the engine tolerates a positive driver alongside the negatives).
describe('P14B.7 group5 — a Distrusted issuer cannot waive, even a fully feasible, legal, non-identical substitute', () => {
  it('REFUSES for a genuinely Distrusted issuer (measured: 2 negative + 1 positive driver, still Distrusted)', () => {
    assertWaiverFns()
    const state = fixture('distrusted-issuer')
    const promise = promiseZero(state)
    const today = state.market.tick
    const descriptor = trustDescriptor(state, promise.beneficiaryPersonId, promise.issuerStudioId, today)
    expect(descriptor.label).toBe('Distrusted')
    expect(descriptor.drivers.filter((d) => !d.positive)).toHaveLength(2)
    expect(descriptor.drivers.some((d) => d.positive)).toBe(true) // the tolerated positive driver -- assert the LABEL, not driver purity
    // 730-T finding 1: THE LAW refuses windowStartWeek <= the waiver week (today=70). The window
    // moves from [60,100) to [71,101) -- still inside the real contract [52,104) (measured) -- or
    // this isolation premise would refuse for the WINDOW, not for trust, and be false.
    const substitute: WaiverSubstituteDraft = { family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', predicate: { kind: 'castRoleCount', count: 1, seatClass: 'lead' }, windowStartWeek: 71, dueWeekExclusive: 101 }
    // Isolation: independently prove this exact substitute is feasible AND legal-strength AND
    // non-identical, so the ONLY thing left that can refuse it is the trust condition.
    expect(realFeasibility(state, promise, substitute, today).classification).toBe('REASONABLY_ACHIEVABLE')
    expect(promiseCastSlots({ predicate: substitute.predicate })).toEqual(promiseCastSlots(promise))
    expect(substitute.windowStartWeek).not.toBe(promise.windowStartWeek)
    const reason = accepted(state, promise, substitute, today)
    expect(reason, 'a Distrusted issuer must refuse even a feasible, legal, non-identical substitute').not.toBeNull()
    expect(() => waive(state, { promiseId: promise.promiseId, substitute })).toThrow()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// Priority 6 (§2 items 6, 8, 9): identical-substitute refusal; progress/evidenceRefs preserved;
// outcomeCause non-empty.
describe('P14B.7 group6 — identical-substitute refusal, progress/evidenceRefs preserved, a stated outcomeCause', () => {
  it('REFUSES a substitute identical to the original in family, class, count and window — though independently feasible', () => {
    assertWaiverFns()
    const state = fixture('bound-open-p1')
    const promise = promiseZero(state)
    const today = state.market.tick
    const identical: WaiverSubstituteDraft = { family: promise.family, predicate: 'kind' in promise.predicate
      ? { kind: promise.predicate.kind, count: promise.predicate.count, seatClass: promise.predicate.seatClass } : { count: promise.predicate.count },
      windowStartWeek: promise.windowStartWeek, dueWeekExclusive: promise.dueWeekExclusive }
    expect(realFeasibility(state, promise, identical, today).classification).toBe('REASONABLY_ACHIEVABLE')
    const reason = accepted(state, promise, identical, today)
    expect(reason, 'an identical substitute must be refused even though it is independently feasible').not.toBeNull()
    expect(() => waive(state, { promiseId: promise.promiseId, substitute: identical })).toThrow()
  })
  it('PRESERVES progress and evidenceRefs on the waived original (does not recompute them like the BROKEN branch)', () => {
    assertWaiverFns()
    const state = fixture('part-served-p1')
    const promise = promiseZero(state) // count 2, progress 1, evidenceRefs []
    expect(promise.progress).toBe(1)
    expect(trustDescriptor(state, promise.beneficiaryPersonId, promise.issuerStudioId, state.market.tick).label).not.toBe('Distrusted')
    const today = state.market.tick
    // §5(c): substitute.predicate.count >= original.count - original.progress = 2 - 1 = 1
    // 730-T finding 1: THE LAW refuses windowStartWeek <= the waiver week, so this legal-acceptance
    // draft moves to today+1 (was today, which is the exact exploit shape pinned separately below).
    const remainderOnly: WaiverSubstituteDraft = { family: 'APPEARANCE_COUNT', predicate: { count: 1 }, windowStartWeek: today + 1, dueWeekExclusive: today + 61 }
    expect(realFeasibility(state, promise, remainderOnly, today).classification).toBe('REASONABLY_ACHIEVABLE')
    const after = waive(state, { promiseId: promise.promiseId, substitute: remainderOnly })
    const waived = after.promises.find((p) => p.promiseId === promise.promiseId)!
    expect(waived.outcome).toBe('WAIVED')
    expect(waived.progress).toBe(promise.progress)
    expect(waived.evidenceRefs).toEqual(promise.evidenceRefs)
  })
  it('stamps a non-empty outcomeCause on the waived original, as every other terminal branch does', () => {
    assertWaiverFns()
    const state = fixture('bound-open-p1')
    const promise = promiseZero(state)
    const today = state.market.tick
    const substitute: WaiverSubstituteDraft = { family: 'APPEARANCE_COUNT', predicate: { count: 1 }, windowStartWeek: 60, dueWeekExclusive: 100 }
    const after = waive(state, { promiseId: promise.promiseId, substitute })
    const waived = after.promises.find((p) => p.promiseId === promise.promiseId)!
    expect(typeof waived.outcomeCause).toBe('string')
    expect(waived.outcomeCause!.trim().length).toBeGreaterThan(0)
    expect(waived.outcomeWeek).toBe(today)
  })
  it('730-T FINDING 1 — item 17\'s substitute half (previously pinned NOWHERE): a substitute whose window opens ON the waiver week is refused, closing the live exploit measured on this exact fixture and draft', () => {
    assertWaiverFns()
    const state = fixture('part-served-p1')
    const promise = promiseZero(state) // count 2, progress 1
    const today = state.market.tick // 113
    // THE EXACT exploit draft measured by W: windowStartWeek === today. A qualifying take for the
    // ORIGINAL already landed at week 113 (first-take-event-42); this window's own first week is
    // the SAME week, so a naive take-scan would still credit it to the substitute.
    const exploit: WaiverSubstituteDraft = { family: 'APPEARANCE_COUNT', predicate: { count: 1 }, windowStartWeek: today, dueWeekExclusive: today + 60 }
    // Isolation: this exact window is independently feasible (it is group6's own former
    // acceptance draft, unmoved) -- the ONLY thing left that can refuse it is THE LAW.
    expect(realFeasibility(state, promise, exploit, today).classification).toBe('REASONABLY_ACHIEVABLE')
    // Independent confirmation of the CAUSE (promises.ts:637-641's own `qualifyingTakes`, not a
    // re-implementation of it): a take landing AT windowStartWeek is not excluded by
    // `take.week < windowStartWeek`, so today's real firstTakes already qualify for this exact
    // draft, using the SAME production primitive that later choice of law must defeat one level up.
    const probe = { predicate: exploit.predicate, issuerStudioId: promise.issuerStudioId, beneficiaryPersonId: promise.beneficiaryPersonId,
      windowStartWeek: exploit.windowStartWeek, dueWeekExclusive: exploit.dueWeekExclusive } as unknown as ProfessionalPromise
    expect(qualifyingTakes(state, probe).length, 'independent confirmation of the cause: a take AT windowStartWeek qualifies today, unfixed').toBeGreaterThan(0)
    // THE LAW: substitute.windowStartWeek must be strictly greater than the waiver week.
    const reason = accepted(state, promise, exploit, today)
    expect(reason, 'THE LAW: a substitute window opening ON (or before) the waiver week must be refused').not.toBeNull()
    expect(typeof reason).toBe('string')
    expect(reason!.length).toBeGreaterThan(0)
    let after: GameState | undefined
    try {
      after = waive(state, { promiseId: promise.promiseId, substitute: exploit })
    } catch {
      after = undefined // refused at mint -- the exploit is structurally impossible, which this pins
    }
    if (after === undefined) return
    // Defense in depth, regardless of WHICH function ends up refusing this: even if some other fix
    // strategy allowed the mint, the substitute must never be credited with a take that predates --
    // or lands ON -- its own window's first week.
    const minted = substituteOf(state, after)
    expect(minted.progress, 'a substitute must never be credited at mint with a pre-existing take').toBe(0)
    const advanced = advancePromisesWeek(after)
    const stillThere = advanced.promises.find((p) => p.promiseId === minted.promiseId)!
    expect(stillThere.progress, 'FAILS if a substitute is ever credited with a take that predates its own window (the live exploit: promise two, deliver one, waive for a one-picture substitute opening on the week the take landed, collect a satisfied substitute with nothing further owed)').toBe(0)
    expect(stillThere.outcome).toBeNull()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// Priority 7 (§2 item 7): the original settles through the EXISTING settle(), exactly ONE
// promiseOutcome market receipt, no second kind invented.
describe('P14B.7 group7 — exactly ONE promiseOutcome receipt through the existing settle(), no new receipt kind', () => {
  it('appends exactly one new talentMarket receipt, kind promiseOutcome, named by the original\'s outcomeEventId', () => {
    assertWaiverFns()
    const state = fixture('bound-open-p1')
    const promise = promiseZero(state)
    const today = state.market.tick
    const substitute: WaiverSubstituteDraft = { family: 'APPEARANCE_COUNT', predicate: { count: 1 }, windowStartWeek: 60, dueWeekExclusive: 100 }
    const receiptsBefore = state.talentMarket.receipts.length
    const after = waive(state, { promiseId: promise.promiseId, substitute })
    expect(after.talentMarket.receipts).toHaveLength(receiptsBefore + 1)
    const waived = after.promises.find((p) => p.promiseId === promise.promiseId)!
    expect(waived.outcome).toBe('WAIVED')
    const receipt = after.talentMarket.receipts.find((r) => r.eventId === waived.outcomeEventId)
    expect(receipt).toBeDefined()
    expect(receipt).toMatchObject({ kind: 'promiseOutcome', talentId: promise.beneficiaryPersonId, studioId: promise.issuerStudioId, week: today })
    // No second receipt kind invented: every OTHER receipt kind present is unchanged in count.
    const kindCounts = (s: GameState, kind: string) => s.talentMarket.receipts.filter((r) => r.kind === kind).length
    for (const kind of new Set(state.talentMarket.receipts.map((r) => r.kind))) {
      if (kind === 'promiseOutcome') continue
      expect(kindCounts(after, kind)).toBe(kindCounts(state, kind))
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// Priority 8 (§2 item 10): the substitute is BOUND, not proposed — contractId matches the
// original's, outcome null, evaluable() admits it, no proposal or case created.
describe('P14B.7 group8 — the substitute is minted BOUND directly, never through attachPromise', () => {
  it('binds contractId to the original\'s own contract, outcome null, and creates NO proposal or case', () => {
    assertWaiverFns()
    const state = fixture('bound-open-p1')
    const promise = promiseZero(state)
    const substitute: WaiverSubstituteDraft = { family: 'APPEARANCE_COUNT', predicate: { count: 1 }, windowStartWeek: 60, dueWeekExclusive: 100 }
    const after = waive(state, { promiseId: promise.promiseId, substitute })
    const minted = substituteOf(state, after)
    expect(minted.contractId).toBe(promise.contractId)
    expect(minted.outcome).toBeNull()
    expect(minted.outcome === null && minted.contractId !== null).toBe(true) // evaluable() admits it immediately
    expect(after.talentMarket.proposals).toEqual(state.talentMarket.proposals)
    expect(after.talentMarket.cases).toEqual(state.talentMarket.cases)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// Priority 9 (§2 item 11): Save V31 -> V32. The field opens null on every existing record,
// recomputes nothing; the DOWNGRADE refuses a non-null value rather than dropping it.
describe('P14B.7 group9 — Save V31 -> V32: supersededByPromiseId opens null, downgrade refuses non-null', () => {
  // 730-T finding 2: this pin was wrong, not the implementation. Record 720 item 11 has always
  // said V31 -> V32, and T0 minted nine "genuine OUTGOING V31" fixtures precisely BECAUSE V32 was
  // coming; pinning the OUTGOING value here blocked the slice's own save step (a promise row could
  // never carry supersededByPromiseId -- the exact-key validator refuses a 17th key). The T1 brief
  // said to verify the constant was unmoved BY the T1 author; that self-check became this
  // requirement, a bad reading of a badly-worded instruction, not the writer's fault.
  //
  // PROJECTION_VERSION's own pin (still 49, still a real B.7 constraint this slice must not move)
  // relocated to tests/bridge-p14b7-promise-waiver.test.ts group9b: its ONLY source is
  // bridge/schema/bridge-schema.ts, and that import alone fails `npx tsc --noEmit` under the root
  // tsconfig regardless of anything downstream (730-T finding 3).
  it('LIVE_SAVE_VERSION is the value this slice\'s own V31->V32 step must produce (720 item 11)', () => {
    expect(LIVE_SAVE_VERSION).toBe(32)
  })
  it('convertV31ToV32 and convertV32ToV31 exist (the RED-mechanism guard for this group)', () => {
    assertMigrationFns()
  })
  it('opens supersededByPromiseId: null on EVERY existing promise record, recomputing nothing else', () => {
    assertMigrationFns()
    const v31 = validateSaveV31(JSON.parse(gunzipSync(readFileSync(corpusPath('kept-and-broken'))).toString('utf8')))
    expect(v31.state.promises.length).toBeGreaterThan(0)
    const v32 = (convertV31ToV32 as unknown as (s: typeof v31) => { saveVersion: number; state: GameState & { promises: readonly (ProfessionalPromise & { supersededByPromiseId: string | null })[] } })(v31)
    expect(v32.saveVersion).toBe(32)
    expect(v32.state.promises).toHaveLength(v31.state.promises.length)
    for (let i = 0; i < v32.state.promises.length; i++) {
      const { supersededByPromiseId, ...rest } = v32.state.promises[i]!
      expect(supersededByPromiseId).toBeNull()
      expect(rest).toEqual(v31.state.promises[i])
    }
    // Every other root byte-identical (spread-preserving, V30->V31's own convention).
    const { promises: _p1, ...v31Rest } = v31.state as unknown as Record<string, unknown>
    const { promises: _p2, ...v32Rest } = v32.state as unknown as Record<string, unknown>
    expect(JSON.stringify(v32Rest)).toBe(JSON.stringify(v31Rest))
  })
  it('the DOWNGRADE REFUSES a non-null supersededByPromiseId rather than silently dropping it', () => {
    assertMigrationFns()
    const v31 = validateSaveV31(JSON.parse(gunzipSync(readFileSync(corpusPath('kept-and-broken'))).toString('utf8')))
    const staged = {
      saveVersion: 32, seed: v31.seed, broadcastCache: v31.broadcastCache,
      state: { ...v31.state, promises: v31.state.promises.map((p, i) => ({ ...p, supersededByPromiseId: i === 0 ? 'promise-1' : null })) },
    }
    expect(() => (convertV32ToV31 as unknown as (s: typeof staged) => unknown)(staged)).toThrow()
  })
  it('a lossless downgrade (every record null) round-trips to the ORIGINAL V31 bytes', () => {
    assertMigrationFns()
    const v31 = validateSaveV31(JSON.parse(gunzipSync(readFileSync(corpusPath('kept-and-broken'))).toString('utf8')))
    const v32 = (convertV31ToV32 as unknown as (s: typeof v31) => { saveVersion: number; state: GameState; seed: string; broadcastCache: unknown })(v31)
    const roundTripped = (convertV32ToV31 as unknown as (s: typeof v32) => { saveVersion: number; state: GameState })(v32)
    expect(roundTripped.saveVersion).toBe(31)
    expect(JSON.stringify(roundTripped.state)).toBe(JSON.stringify(v31.state))
  })
})

// group10 (bridge/trust.ts attention row) and group11 (bridge/industry.ts fold exclusion) moved to
// tests/bridge-p14b7-promise-waiver.test.ts by 730-T finding 3 -- see that file's header for the
// full original commentary, preserved there verbatim alongside the item-18 row-TEXT correction.
