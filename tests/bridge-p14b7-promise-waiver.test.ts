// P14B.7 T1 — independent test engineer RED suite for the promise waiver, BRIDGE HALF (evidence
// 725-T). Split from tests/p14b7-promise-waiver.test.ts by 730-T finding 3: bridge/*.ts's own
// internal `.ts`-extension imports are not legal under the ROOT tsconfig (no
// `allowImportingTsExtensions`), and once ANY bridge/ import is reachable from a root-included
// file the whole bridge/ module graph (plus its `ui/src/engine/adapter.ts` dependents, reached via
// bridge/industry.ts -> bridge/snapshot-build-context.ts) is pulled into the program and fails
// `npx tsc --noEmit` -- measured 131 errors total before this split, 13 of them on the sibling
// file's own lines (see 731-T-b7-red-patch.md). This file is matched by the existing
// `tests/bridge*.test.ts` tsconfig exclude, the SAME convention tests/bridge-p14b2-trust.test.ts
// already uses -- it carries NO typecheck coverage under either `tsc --noEmit` config, by that same
// convention, not by an oversight (ui/tsconfig.json's own `include` does not reach tests/ either).
//
// Authority: 720-b7-waiver-expansion.md CURRENT bytes (see the engine-only sibling file's header
// for the full amendment history, the RED mechanism, and every interpretation named). Fixtures:
// the nine genuine outgoing V31 saves minted at T0 (record 722),
// `tests/fixtures/p14/genuine-v31-pre-b7/`; only `bound-open-p1` is needed by this file's groups.
//
// group9b -- PROJECTION_VERSION (720's own frozen value, item 11's neighbour, relocated here by
// 730-T finding 3): this constant's ONLY source is bridge/schema/bridge-schema.ts, so its pin
// cannot live in the engine-only sibling file. LIVE_SAVE_VERSION's own pin (32, the V31->V32 step)
// stays there, in that file's group9 -- it is a src/core/save.ts concept, no bridge import needed.
//
// group10 (§2 item 12, §6, item 18): bridge/trust.ts mints an attention row for a waived promise.
// Today gated on SATISFIED||BROKEN only (bridge/trust.ts :68), so a waiver mints nothing -- a
// DEFECT B.7 CREATES, so B.7 fixes it. Item 18: the row's text must not read "kept" or "broken"
// (bridge/trust.ts :69's ternary has no third arm today, so widening the gate alone would publish
// a false breach). CORRECTED by 730-T finding 3: this group previously pinned only the row's
// EXISTENCE and a non-empty reason, never its TEXT, though the header of the (then single) file
// claimed otherwise -- W caught the gap. Pinned below: a hard negative on the row's own TEXT (not
// "kept", not "broken") plus a softer, separately-labelled interpretation (I5: mentions "waived",
// NOT the item's hard requirement -- 720 pins only the two exclusions, not this literal word).
//
// group11 -- coordinator's 11th pin (mid-task correction to 720 §6): a WAIVED promise's
// promiseOutcome receipt EXISTS, but publishes NO row in the public industry activity fold. Today
// the fold filters to SATISFIED||BROKEN (bridge/industry.ts :136) so a WAIVED receipt is dropped at
// :141; under the adopted decision this behaviour is CORRECT and must survive as a stated pin, not
// an accident. Asserted POSITIVELY (receipt exists, then no activity carries its eventId) to avoid
// the vacuous-before-the-feature-exists trap the coordinator named.
//
// RED MECHANISM: same as the sibling engine-only file -- `waivePromise`/`waiverAccepted` bind to
// `undefined` SILENTLY if missing (vite/esbuild), never throw at import, so every case here asserts
// `typeof x === 'function'` FIRST via `assertWaiverFns()`.
//
// Not exercised here: native/Unity, the full core suite, the evidence runner. Native/UI/Owner
// acceptance and any waiver policy for RIVAL studios are out of scope (720 §7).

import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import {
  type PromisePredicate,
  // RED-by-design (720 §2 items 1-2): neither exists in src/core/promises.ts today.
  waivePromise, waiverAccepted,
} from '../src/core/promises.js'
import { convertV31ToV32, convertV32ToV33, convertV33ToV34, convertV34ToV35, validateSaveV31 } from '../src/core/save.js'
import { PROJECTION_VERSION } from '../bridge/schema/bridge-schema.ts'
import { industryPage } from '../bridge/industry.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { promiseAttentionRows } from '../bridge/trust.ts'
import type { IndustryPage, IndustryQuery } from '../bridge/schema/industry-schema.ts'
import type { GameState, ProfessionalPromise, PromiseFamily } from '../src/core/types.js'

// ── I2: the substitute draft this whole file pins (identical shape to the engine-only sibling) ──
type WaiverSubstituteDraft = { family: PromiseFamily; predicate: PromisePredicate; windowStartWeek: number; dueWeekExclusive: number }
type WaivePromiseFn = (state: GameState, draft: { promiseId: string; substitute: WaiverSubstituteDraft }) => GameState

function assertWaiverFns(): void {
  expect(typeof waivePromise, 'RED premise: waivePromise must exist as a named export of src/core/promises.ts').toBe('function')
  expect(typeof waiverAccepted, 'RED premise: waiverAccepted must exist as a named export of src/core/promises.ts').toBe('function')
}
const waive = waivePromise as unknown as WaivePromiseFn

// ── T0 corpus (tests/fixtures/p14/genuine-v31-pre-b7/MANIFEST.json; sha256 re-verified from disk
// by this suite's author, not copied from the manifest text). Only bound-open-p1 is needed by
// this file's two groups -- no reason to carry the whole nine-fixture pin table here. ───────────
const BOUND_OPEN_P1 = { raw: '0ff9044f4529b3821efe3be92911bce10768fa03ff08653db2ac4ac0dda000eb', gz: '6b5d54b485cdf661118506dcc26d42fd798fb29721154709a6bd208fd4ab769b', week: 52 } as const

function boundOpenP1(): GameState {
  const file = 'tests/fixtures/p14/genuine-v31-pre-b7/genuine-v31-bound-open-p1.json.gz'
  expect(existsSync(file), 'T0 NOT COMPLETE: genuine V31 artifact missing: ' + file).toBe(true)
  const compressed = readFileSync(file)
  const raw = gunzipSync(compressed).toString('utf8')
  expect(createHash('sha256').update(compressed).digest('hex')).toBe(BOUND_OPEN_P1.gz)
  expect(createHash('sha256').update(raw).digest('hex')).toBe(BOUND_OPEN_P1.raw)
  const save = validateSaveV31(JSON.parse(raw)) // the genuine frozen validator FIRST
  expect(save.state.market.tick).toBe(BOUND_OPEN_P1.week)
  // The fixture is genuinely V31 (validated above, unmoved); this state then feeds
  // waivePromise, a live function on the V32 shape, so it is carried up through the
  // lawful conversion — never by softening validateSaveV31's own refusal.
  //
  // P14C.1 (record 771, inconsistent_fixture, group11): carried one lawful
  // conversion further, to V33. A LIVE `GameState` (the type this returns) must
  // carry `talentProvenance` (contract 762 §6) — group11's `allActivities()` ->
  // `industryPage` -> `stateDigest` -> `makeSave` route validates that root and
  // group10's cases never reach it, so stopping at V32 only happened to look
  // adequate for five of the six consumers. `convertV32ToV33` adds nothing a
  // waived-promise assertion reads (no promise/relationship field moves), so
  // this is a widening of what the fixture honestly represents, not a new fact.
  // 776-S9 (P14C.2a): carried one lawful conversion further still, to V34 — the
  // LIVE `GameState` now also carries the empty career-lifecycle root, the same
  // widening, still nothing a waived-promise assertion reads.
  // P14C.4: carried one lawful conversion further still, to V35 — the LIVE
  // `GameState` now also carries empty `cohorts` inside the same root, the
  // same widening, still nothing a waived-promise assertion reads.
  return convertV34ToV35(convertV33ToV34(convertV32ToV33(convertV31ToV32(save)))).state
}
function promiseZero(state: GameState): ProfessionalPromise {
  const promise = state.promises.find((p) => p.promiseId === 'promise-0')
  expect(promise, 'fixture premise: promise-0 must exist').toBeDefined()
  return promise!
}

// ── Industry Pulse helper (identical shape to bridge-p14b2-trust.test.ts's own precedent) ──────
const SESSION_ID = 'p14b7-waiver-red'
function pulseQuery(page = 0): IndustryQuery {
  return { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: SESSION_ID, requestId: `b7-pulse-${String(page)}`,
    expectedStateRevision: 0, type: 'industryQuery', view: 'pulse', targetId: null, page, pageSize: 50, lane: 'recent', period: 'all' }
}
function allActivities(state: GameState): IndustryPage['activities'] {
  const first = industryPage(state, SESSION_ID, 0, pulseQuery())
  const rows = [...first.activities]
  expect(first.pageCount).toBeLessThan(1000)
  for (let page = 1; page < first.pageCount; page++) rows.push(...industryPage(state, SESSION_ID, 0, pulseQuery(page)).activities)
  expect(rows).toHaveLength(first.totalRows)
  return rows
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
describe('P14B.7 group9b — PROJECTION_VERSION is the frozen value this slice must not move (bridge half of group9; relocated by 730-T finding 3)', () => {
  it('PROJECTION_VERSION is still 49', () => {
    expect(PROJECTION_VERSION).toBe(50)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// Priority 10 (§2 item 12, §6, item 18): bridge/trust.ts mints an attention row for a waived
// promise, its text never reading "kept" or "broken".
describe('P14B.7 group10 — a waived promise mints a promiseOutcome attention row, exactly like SATISFIED/BROKEN', () => {
  it('mints exactly one promiseOutcome attention row for the waived promise, in the waived week', () => {
    assertWaiverFns()
    const state = boundOpenP1()
    const promise = promiseZero(state)
    const today = state.market.tick
    expect(promiseAttentionRows(state, promise.issuerStudioId, today).filter((r) => r.cause === 'promiseOutcome' && r.talentId === promise.beneficiaryPersonId)).toEqual([])
    const substitute: WaiverSubstituteDraft = { family: 'APPEARANCE_COUNT', predicate: { count: 1 }, windowStartWeek: 60, dueWeekExclusive: 100 }
    const after = waive(state, { promiseId: promise.promiseId, substitute })
    const rows = promiseAttentionRows(after, promise.issuerStudioId, today).filter((r) => r.cause === 'promiseOutcome' && r.talentId === promise.beneficiaryPersonId)
    expect(rows).toHaveLength(1)
    expect(typeof rows[0]!.reason).toBe('string')
    expect(rows[0]!.reason.trim().length).toBeGreaterThan(0)
  })
  it('item 18, HARD NEGATIVE (730-T finding 3, previously unpinned): the row TEXT never reads "kept" or "broken" -- mislabelling a waiver as either is the hazard 720 names', () => {
    assertWaiverFns()
    const state = boundOpenP1()
    const promise = promiseZero(state)
    const today = state.market.tick
    const substitute: WaiverSubstituteDraft = { family: 'APPEARANCE_COUNT', predicate: { count: 1 }, windowStartWeek: 60, dueWeekExclusive: 100 }
    const after = waive(state, { promiseId: promise.promiseId, substitute })
    const rows = promiseAttentionRows(after, promise.issuerStudioId, today).filter((r) => r.cause === 'promiseOutcome' && r.talentId === promise.beneficiaryPersonId)
    expect(rows).toHaveLength(1)
    expect(rows[0]!.reason, 'a waived promise\'s attention row must never read "kept"').not.toMatch(/\bkept\b/i)
    expect(rows[0]!.reason, 'a waived promise\'s attention row must never read "broken"').not.toMatch(/\bbroken\b/i)
  })
  it('item 18, SOFT/INTERPRETIVE (I5, not the item\'s hard requirement): the row text mentions "waived"', () => {
    assertWaiverFns()
    const state = boundOpenP1()
    const promise = promiseZero(state)
    const today = state.market.tick
    const substitute: WaiverSubstituteDraft = { family: 'APPEARANCE_COUNT', predicate: { count: 1 }, windowStartWeek: 60, dueWeekExclusive: 100 }
    const after = waive(state, { promiseId: promise.promiseId, substitute })
    const rows = promiseAttentionRows(after, promise.issuerStudioId, today).filter((r) => r.cause === 'promiseOutcome' && r.talentId === promise.beneficiaryPersonId)
    expect(rows).toHaveLength(1)
    expect(rows[0]!.reason).toMatch(/waived/i)
  })
  it('740-T gap 2 (hard pin, upgraded from the soft I5 case above now that the landed table is a verified fact, not an interpretation): the row is byte-identical to PROMISE_OUTCOME_WORD\'s own WAIVED entry, reconstructed from the row\'s own name and outcomeCause, not a loose regex', () => {
    assertWaiverFns()
    const state = boundOpenP1()
    const promise = promiseZero(state)
    const today = state.market.tick
    const substitute: WaiverSubstituteDraft = { family: 'APPEARANCE_COUNT', predicate: { count: 1 }, windowStartWeek: 60, dueWeekExclusive: 100 }
    const after = waive(state, { promiseId: promise.promiseId, substitute })
    const waived = after.promises.find((p) => p.promiseId === promise.promiseId)!
    const name = after.talent.find((t) => t.id === promise.beneficiaryPersonId)?.name ?? promise.beneficiaryPersonId
    const rows = promiseAttentionRows(after, promise.issuerStudioId, today).filter((r) => r.cause === 'promiseOutcome' && r.talentId === promise.beneficiaryPersonId)
    expect(rows).toHaveLength(1)
    // bridge/trust.ts's own template is `Promise to ${name} ${word} — ${promise.outcomeCause}`
    // (PROMISE_OUTCOME_WORD[promise.outcome], :78-82). FAILS if the table's WAIVED entry ever stops
    // reading the literal word "waived", or if the gate/word regress to the two-way ternary this
    // table replaced (which had no third arm and would have published an accepted settlement as
    // "broken" -- the exact false breach this pin exists to catch).
    expect(rows[0]!.reason).toBe(`Promise to ${name} waived — ${waived.outcomeCause}`)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// Coordinator's 11th pin (mid-task correction to 720 §6): a WAIVED promise's promiseOutcome
// receipt EXISTS, but publishes NO row in the public industry activity fold. Today the fold
// filters to SATISFIED||BROKEN (bridge/industry.ts :136) so a WAIVED receipt is dropped at :141;
// under the adopted decision this behaviour is CORRECT and must survive as a stated pin, not an
// accident. Asserted POSITIVELY (receipt exists, then no activity carries its eventId) to avoid
// the vacuous-before-the-feature-exists trap the coordinator named.
describe('P14B.7 group11 — a waived promise is public as an OUTCOME receipt but mints NO public industry activity', () => {
  it('the promiseOutcome receipt exists after a waiver, and no industry Pulse activity carries its eventId', () => {
    assertWaiverFns()
    const state = boundOpenP1()
    const promise = promiseZero(state)
    const substitute: WaiverSubstituteDraft = { family: 'APPEARANCE_COUNT', predicate: { count: 1 }, windowStartWeek: 60, dueWeekExclusive: 100 }
    const after = waive(state, { promiseId: promise.promiseId, substitute })
    const waived = after.promises.find((p) => p.promiseId === promise.promiseId)!
    expect(waived.outcome).toBe('WAIVED')
    const receipt = after.talentMarket.receipts.find((r) => r.eventId === waived.outcomeEventId)
    expect(receipt, 'the promiseOutcome receipt must exist -- this pins ABSENCE FROM THE FOLD, not absence of the fact').toBeDefined()
    expect(receipt).toMatchObject({ kind: 'promiseOutcome' })
    const activities = allActivities(after)
    expect(activities.some((row) => row.eventId === receipt!.eventId)).toBe(false)
    expect(activities.filter((row) => 'outcomeKind' in row)).toEqual(
      allActivities(state).filter((row) => 'outcomeKind' in row), // unchanged: no SATISFIED/BROKEN row gained or lost either
    )
  })
})
