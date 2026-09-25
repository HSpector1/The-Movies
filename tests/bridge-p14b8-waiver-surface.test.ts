// P14B.8 T1 — independent test engineer RED suite for THE WAIVER'S PLAYER SURFACE, BRIDGE HALF
// (evidence 750-T). Authority: record 744 as amended by its §11 log, record 745-C, and brief 749-T.
// Authored against HEAD 25794023; every engine fact below was MEASURED on that source, not read off
// it. The engine-only oracle and the fixture contract live in tests/p14b8-waiver-surface-oracle
// .test.ts; this file is matched by the existing `tests/bridge*.test.ts` tsconfig exclude and
// therefore carries NO `tsc --noEmit` coverage, by the same convention every bridge test file uses.
//
// THE BEHAVIOUR: select an open promise -> propose a substitute -> receive an accurate quote or the
// specific refusal -> confirm -> see the original marked WAIVED and the replacement recorded.
// The law is B.7's and is verified. B.8 adds the route.
//
// ───────────────────────────────────────────────────────────────────────────────────────────────
// WHY EVERY CASE IS RED NOW (measured, not predicted). `session.quote` has an explicit final guard
// since P14A.1, so an unknown family is a clean refusal rather than a misrouted casting draft:
//     session.quote({type:'quoteWaivePromise', ...}) -> INVALID_COMMAND
//                                                       'Unknown quote type "quoteWaivePromise".'
//     validateQuote(sameRequest)                     -> INVALID_COMMAND, 'Command envelope is
//                                                       invalid: $: matched no allowed type (...)'
// Cases that do NOT route through the quote family fail on their own distinct assertion instead:
// group5a (the projected history row lacks `supersededByPromiseId`/`progress`), group12 (the
// projection is still 49 and the outgoing identity is not registered as a prior).
//
// ───────────────────────────────────────────────────────────────────────────────────────────────
// INTERPRETATIONS NAMED (744 pins the requirement, not every literal identifier; none is a refusal
// — a writer may rename any of these with the ruling recorded, the convention 654-T and 725-T used).
//   I1. REQUEST: `type: 'quoteWaivePromise'` on the existing `BridgeSession.quote` overload set,
//       with the standard envelope and a `draft` member — the shape every other family already has.
//   I2. DRAFT (744 §11 A8's OWN payload): `{ promiseId, substitute }`. `promiseId` is
//       `nonEmptyText()`. `substitute` is a closed family-discriminated union reusing the existing
//       `promiseDraftTerms` (`count`, `windowStartWeek`, `dueWeekExclusive`) with the family domain
//       NARROWED to the two this surface offers: `APPEARANCE_COUNT` (count-only) and
//       `LEAD_OR_SIGNIFICANT_ROLE_COUNT` (which REQUIRES its explicit `seatClass`, mirroring the
//       P14B.4 market draft). `DIRECTING_COUNT`, `PREFERRED_GENRE_OPPORTUNITY` and
//       `SPECIFIC_PROJECT` are unexpressible BY CONSTRUCTION. The draft names NO studio: the issuer
//       arrives through the promise id and is forced to the player (group9).
//   I3. ANSWER `StudioPromiseWaiverQuoteSnapshot`, shaped on `StudioMarketProposalQuoteSnapshot`
//       (bridge-schema.ts :2062): `intentId`, `kind`, `commitLabel`, `ok`, `refusalReason`
//       (`string | null`, null exactly when `ok`, otherwise `waiverAccepted`'s BARE sentence), the
//       echoed subject and substitute terms (`promiseId`, `talentId`, `family`, `count`,
//       `seatClass`, `windowStartWeek`, `dueWeekExclusive`) and `consequence`. Every member name is
//       read through ONE accessor below, so a rename is a one-line recorded patch, never a silent
//       weakening.
//   I4. INTENT KIND `'waivePromise'`, appended to `AVAILABLE_INTENT_KINDS` (744 §11 A4). The verb
//       naming matches `placeFacility`/`commissionSet`/`renewContract`: ONE verb, not a family
//       router like `marketProposalAction`.
//   I5. THE OWNERSHIP REFUSAL IS A PROTOCOL REJECTION (`ENGINE_REJECTED`), not an accepted
//       `ok:false` quote, and it is INDISTINGUISHABLE from an unknown id. This is not a style
//       choice: it is forced by measurement. `waiverAccepted` returns NULL for a rival's promise
//       (oracle group4), so there is no engine sentence to publish, and 744 §11 A1 reserves an
//       accepted `ok:false` for a real engine verdict. Answering "not found" for both also declines
//       to confirm that a promise the player may not see exists.
//   I6. `StudioMarketPromiseHistoryRow` gains `supersededByPromiseId: string | null` (744 §4 item 3)
//       and `progress: number` (744 §11 A12), on all three carriers, from the one write site.
//   I7. The waiver quote response rides the existing `StudioBridgeQuoteResponse` union, so
//       `parseWireValue` round-trips it whole.
//   I8. `PROJECTION_VERSION` 50, with `sha256:60af24c5…` registered as `projection-v49` in
//       `SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS` IN THE SAME COMMIT (744 §11 A3).
//
// ───────────────────────────────────────────────────────────────────────────────────────────────
// WHAT THIS FILE DELIBERATELY DOES NOT DO (749-T §5: no waiver-specific duplicate of a generic
// protection). group7 proves the FOUR EXISTING guards fire for this family — it adds no new one.
// Two observations belong with it, both measured:
//   * `pendingQuotes.clear()` (session.ts :1613, :2054) and the digest guard (session.ts :1628) are
//     OBSERVATIONALLY IDENTICAL at the surface: both make `quotedIntentFor` return undefined and
//     both publish `INTENT_NOT_AVAILABLE`. Every board movement reachable from the public surface
//     goes through an accepted command or a load, so the clear always fires first. group7c asserts
//     the OUTCOME and names both mechanisms rather than claiming to separate them.
//   * `authoritativeDigest` is SHA-256 over the canonical save JSON, so a digest-equal state is a
//     byte-equal state and a deterministic verdict cannot change under it. The "accepted at quote,
//     refused at commit" construction 744 §11 A6 describes is therefore UNREACHABLE through the
//     session for this family, exactly as it is for the four existing ones (the P10-R1 suite tests
//     that arm at the conversion entry point for the same reason). group10 pins the reachable half
//     of A6 — the published copy — and 750-T records the unreachable half as a disclosed limit.
//
// FIXTURES (sha256 re-verified from disk here, never copied from the MANIFEST text):
//   genuine-v32-pre-b8/genuine-v32-owes-two-p1        V32, week 104, ONE bound open P1, count 2,
//                                                     progress 0, remaining 2, player-issued.
//   genuine-v31-pre-b7/genuine-v31-with-edges         V31, week 213, NINE rival-issued bound open
//                                                     promises. VERIFIED by decompressing all nine
//                                                     pre-b7 artifacts: the only one that has any.
//   genuine-v31-pre-b7/genuine-v31-kept-and-broken    V31, week 61, the PUBLIC control: its Pulse
//                                                     fold really does publish promiseKept and
//                                                     promiseBroken, so group6's emptiness is an
//                                                     exclusion and not a broken fold.
//   genuine-projection49-runtime                      the outgoing durable checkpoint (744 §11 A7:
//                                                     minted, published, NOT re-mintable).
//
// LOAD-BEARING, NOT DISTURBED (744 §11 A11): the owes-two world holds an ACTIVE throwaway
// production seating t-act-09, supplying `seatedPreFirstTake = 1`. No case here cancels or films it.
// group7c's board-mover is `startConstruction`, chosen because it moves the digest and touches no
// promise, no production and no week (measured).
//
// Not exercised here: native/Unity, the `ui/` React surface (744 §9, owner FU-1), the full core
// suite, the evidence runner. No native, UI or Owner acceptance claim.

import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { BridgeSession, authoritativeDigest } from '../bridge/session.ts'
import { PROTOCOL_VERSION, SCHEMA_ID, validateQuote } from '../bridge/protocol.ts'
import { AVAILABLE_INTENT_KINDS, BRIDGE_SCHEMA, PROJECTION_VERSION } from '../bridge/schema/bridge-schema.ts'
import { schemaIdentity } from '../bridge/schema/canonical.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'
import { loadBridgeRuntimeCheckpoint, SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS } from '../bridge/runtime-checkpoint.ts'
import { marketCaseProjection, peopleProjection } from '../bridge/people.ts'
import { marketPage } from '../bridge/market.ts'
import { industryPage } from '../bridge/industry.ts'
import { promiseRowsForPerson } from '../bridge/trust.ts'
import { waivePromise } from '../src/core/promises.js'
import { convertV31ToV32, convertV32ToV33, convertV33ToV34, validateSaveV31, validateSaveV32 } from '../src/core/save.js'
import type { IndustryPage, IndustryQuery } from '../bridge/schema/industry-schema.ts'
import type { GameState } from '../src/core/types.js'

const sha = (value: Buffer | string): string => createHash('sha256').update(value).digest('hex')

// ── The outgoing identity this slice retires. Read from the checked-in contract manifest at
// 25794023, independently of bridge/protocol.ts. ────────────────────────────────────────────────
const OUTGOING_49 = 'sha256:60af24c58bc4bea8f04e7fc818f8401daeadd87da91252e60cfcf3ee028d8e1b'
const OUTGOING_PROJECTION = 49

const OWES_TWO = {
  gz: '56f629994f48ea5949a5dad5da44af5bba8ee2943451a05badd3bc4d98793daa',
  raw: 'ccd30fdf7bd2f379bf44d150e03529b1c83f02086d79812800f4a255c766ea6d',
  week: 104, promiseId: 'promise-0', talentId: 't-act-09',
  player: 'studio-aca408ec-player',
  contractId: 'studio-aca408ec-player:contract:t-act-09:104:player-30',
  /** `waivePromise` mints `promise-${state.promises.length}`; this world holds exactly one. */
  substituteId: 'promise-1',
} as const
const WITH_EDGES = {
  gz: '2dce6bfe05f68a20d40f5887171138769848e27c9b147196a59ca6072eb48e6c',
  raw: 'eb516760bd9a633906cee2cb9a82c855944cb5448b074d40e77ec72fc20a7054',
  week: 213, promiseId: 'promise-1', rivalIssuer: 'studio-aca408ec-r02',
  beneficiary: 'person-studio-aca408ec-r01-0', player: 'studio-aca408ec-player', promiseCount: 48,
} as const
const KEPT_AND_BROKEN = {
  gz: '57362b7e282d8ba85f377b558fea50397ac134531e02de8159541775f0172841',
  raw: '734f671b4617ffb2899ef2326ac8dff00358878be8adbc77f2a2b28d99f010d1',
  week: 61,
} as const
const PROJECTION49_CHECKPOINT = {
  gz: '55f2a2fd75e5063f9fedee08a6d103d8696c3b4a8923d695fcab1b6c39afd972',
  raw: 'c92774f524a28876d63b00b5226f36e360ad4022e643c7e029a19a7b5f075c45',
  sessionId: 'p14b8-genuine-outgoing49', stateRevision: 1, week: 45,
} as const

/** The engine's own sentence for the Owner's case, measured live on the owes-two world at 104. */
const RULE7_SENTENCE = 'only 1 of the 2 pictures still owed would be covered'
/** `waivePromise`'s throw wrapper (src/core/promises.ts :992). It must reach NO player. */
const ENGINE_THROW_PREFIX = 'promises: this person did not accept the substitute'

function artifact(relative: string): Buffer {
  const file = `tests/fixtures/p14/${relative}`
  expect(existsSync(file), 'T0 NOT COMPLETE: genuine artifact missing: ' + file).toBe(true)
  return readFileSync(file)
}
function pinned(relative: string, hashes: { gz: string; raw: string }): string {
  const compressed = artifact(relative)
  const raw = gunzipSync(compressed).toString('utf8')
  expect(sha(compressed), `${relative} compressed bytes moved: the fixture was re-minted or edited`).toBe(hashes.gz)
  expect(sha(raw), `${relative} uncompressed bytes moved: the fixture was re-minted or edited`).toBe(hashes.raw)
  return raw
}

let owesTwoCache: GameState | undefined
function owesTwoState(): GameState {
  if (owesTwoCache === undefined) {
    // `validateSaveV32` STAYS: this is a genuine V32 artifact and is admitted by the
    // validator of its own version. Only the LIFT to the live GameState moves (P14C.1,
    // then P14C.2a: the lift now runs one step further, through convertV33ToV34).
    const save = validateSaveV32(JSON.parse(pinned('genuine-v32-pre-b8/genuine-v32-owes-two-p1.json.gz', OWES_TWO)))
    expect(save.state.market.tick).toBe(OWES_TWO.week)
    owesTwoCache = convertV33ToV34(convertV32ToV33(save)).state as unknown as GameState
  }
  return structuredClone(owesTwoCache)
}
let withEdgesCache: GameState | undefined
function withEdgesState(): GameState {
  if (withEdgesCache === undefined) {
    const save = validateSaveV31(JSON.parse(pinned('genuine-v31-pre-b7/genuine-v31-with-edges.json.gz', WITH_EDGES)))
    expect(save.state.market.tick).toBe(WITH_EDGES.week)
    // P14C.2a: the lift now runs one step further, through convertV33ToV34.
    withEdgesCache = convertV33ToV34(convertV32ToV33(convertV31ToV32(save))).state as unknown as GameState
  }
  return structuredClone(withEdgesCache)
}
function keptAndBrokenState(): GameState {
  const save = validateSaveV31(JSON.parse(pinned('genuine-v31-pre-b7/genuine-v31-kept-and-broken.json.gz', KEPT_AND_BROKEN)))
  expect(save.state.market.tick).toBe(KEPT_AND_BROKEN.week)
  // P14C.2a: the lift now runs one step further, through convertV33ToV34.
  return convertV33ToV34(convertV32ToV33(convertV31ToV32(save))).state as unknown as GameState
}

// ── The wire draft (I2) and the envelope helpers, in the exact idiom of the four landed families ──
type WaiverSubstituteWire =
  | { family: 'APPEARANCE_COUNT'; count: number; windowStartWeek: number; dueWeekExclusive: number }
  | { family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT'; count: number; windowStartWeek: number; dueWeekExclusive: number; seatClass: 'lead' | 'leadOrAntagonist' }
type WaiverDraftWire = { promiseId: string; substitute: WaiverSubstituteWire }

function control(session: BridgeSession, commandId: string, expectedStateRevision = session.stateRevision) {
  return { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId, commandId, expectedStateRevision }
}
function waiverRequest(session: BridgeSession, draft: unknown, commandId: string) {
  return { ...control(session, commandId), type: 'quoteWaivePromise' as const, draft }
}
/** The substitute every accept case uses: family and seat class EQUAL to the P1 original, count
 *  varied alone, window strictly forward of the waiver week (B.7's structural rule). */
function p1Wire(count: number, week: number): WaiverSubstituteWire {
  return { family: 'APPEARANCE_COUNT', count, windowStartWeek: week + 1, dueWeekExclusive: week + 61 }
}
function draftFor(promiseId: string, substitute: WaiverSubstituteWire): WaiverDraftWire {
  return { promiseId, substitute }
}
/** The raw answer, with NO assertion: cases that expect a refusal read it directly. */
function askWaiver(session: BridgeSession, draft: unknown, commandId: string) {
  // The request union does not admit this family yet, by design. Bridge test files carry no
  // typecheck coverage (tsconfig `tests/bridge*.test.ts` exclude), and this cast is the ONLY
  // place the widening is assumed; every assertion below is on runtime values.
  return session.quote(waiverRequest(session, draft, commandId) as unknown as Parameters<BridgeSession['quote']>[0])
}
type WaiverQuote = {
  intentId: string; kind: string; commitLabel: string; ok: boolean; refusalReason: string | null
  promiseId: string; talentId: string; family: string; count: number; seatClass: string | null
  windowStartWeek: number; dueWeekExclusive: number; consequence: string
}
/** Asserts the answer was ACCEPTED and carries the waiver family, quoting the real refusal text in
 *  the failure message so a red run names what the surface actually said. */
function acceptedWaiverQuote(session: BridgeSession, draft: unknown, commandId: string): { response: { accepted: true; stateRevision: number; stateDigest: string }; quote: WaiverQuote } {
  const response = askWaiver(session, draft, commandId)
  expect(response.accepted, `the waiver quote family must ANSWER, not refuse the envelope. The surface said: ${JSON.stringify((response as { message?: string }).message ?? null)} (${JSON.stringify((response as { reasonCode?: string }).reasonCode ?? null)})`).toBe(true)
  if (!response.accepted) throw new Error(String((response as unknown as { message: string }).message))
  expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeQuoteResponse, response), 'I7: the waiver answer must ride the existing quote-response union').toEqual(response)
  const quote = (response as unknown as { quote: WaiverQuote }).quote
  expect(quote.kind, 'I4: the commit is its own intent kind, never a mislabelled marketProposalAction').toBe('waivePromise')
  return { response: response as unknown as { accepted: true; stateRevision: number; stateDigest: string }, quote }
}
function submit(session: BridgeSession, intentId: string, commandId: string, revision = session.stateRevision) {
  return session.command({ ...control(session, commandId, revision), type: 'submitIntent' as const, payload: { intentId } })
}
/** The whole authority in one comparable value: state bytes, digest, revision and the saved slot.
 *  Journaled rejection/replay receipts are not campaign mutations and are deliberately excluded. */
function truth(session: BridgeSession) {
  return {
    state: JSON.stringify(session.gameState),
    digest: authoritativeDigest(session.gameState),
    revision: session.stateRevision,
    saved: session.exportRuntimeCheckpoint().savedSaveJson,
  }
}
function sessionOn(state: GameState, label: string): BridgeSession {
  return new BridgeSession(state, `p14b8-${label}`)
}
/** The whole journey, as a player walks it: propose the accepted substitute, then confirm. */
function waiveThroughTheBridge(session: BridgeSession, label: string) {
  const week = session.gameState.market.tick
  const { quote } = acceptedWaiverQuote(session, draftFor(OWES_TWO.promiseId, p1Wire(2, week)), `${label}-quote`)
  expect(quote.ok, `the count-2 substitute is ACCEPTED by the engine at week ${String(week)} (measured); the surface refused it with ${JSON.stringify(quote.refusalReason)}`).toBe(true)
  const accepted = submit(session, quote.intentId, `${label}-commit`)
  expect(accepted.accepted, `the confirmation must be accepted; the surface said ${JSON.stringify((accepted as { message?: string }).message ?? null)}`).toBe(true)
  return { quote, accepted }
}

// ── Industry Pulse helper (identical shape to the B.7 bridge file's own precedent) ──────────────
function pulseQuery(sessionId: string, page = 0): IndustryQuery {
  return { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId, requestId: `b8-pulse-${String(page)}`,
    expectedStateRevision: 0, type: 'industryQuery', view: 'pulse', targetId: null, page, pageSize: 50, lane: 'recent', period: 'all' }
}
function allActivities(state: GameState, sessionId = 'p14b8-pulse'): IndustryPage['activities'] {
  const first = industryPage(state, sessionId, 0, pulseQuery(sessionId))
  const rows = [...first.activities]
  expect(first.pageCount).toBeLessThan(1000)
  for (let page = 1; page < first.pageCount; page++) rows.push(...industryPage(state, sessionId, 0, pulseQuery(sessionId, page)).activities)
  expect(rows).toHaveLength(first.totalRows)
  return rows
}

type HistoryRow = {
  promiseId: string; outcome: string | null; outcomeCause: string | null; contractId: string
  count: number; windowStartWeek: number; dueWeekExclusive: number
  supersededByPromiseId: string | null; progress: number
}
/** The THREE carriers 744 §4 item 3 names, read the way a client reaches each one. */
function carriers(state: GameState, talentId = OWES_TWO.talentId, viewer = OWES_TWO.player): Record<string, HistoryRow[]> {
  const block = marketCaseProjection(state, talentId, viewer, state.market.tick)
  expect(block, 'carrier premise: the market case block for this person must exist on this world').not.toBeNull()
  const selected = marketPage(state, { view: 'market', targetId: talentId }).selected
  expect(selected, 'carrier premise: the market workspace must select this person').not.toBeNull()
  const profile = peopleProjection(state).profiles.find((p) => p.talentId === talentId)
  expect(profile, 'carrier premise: this person must have a published profile').toBeDefined()
  return {
    'StudioMarketCaseSnapshot.promiseHistory': block!.promiseHistory as unknown as HistoryRow[],
    'StudioMarketHistory.promises': selected!.history.promises as unknown as HistoryRow[],
    'StudioPersonProfileSnapshot.promises': profile!.promises as unknown as HistoryRow[],
  }
}
const schemaDef = (name: string): Record<string, unknown> =>
  (BRIDGE_SCHEMA as unknown as { $defs: Record<string, Record<string, unknown>> }).$defs[name] as Record<string, unknown>

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// group1 — COMPLETION CONDITION 1: a player can propose a substitute for a named open promise of
// their own studio, through the bridge, with no client-authored engine state.
describe('P14B.8 group1 — CC1: the propose leg exists on the wire and on the session', () => {
  it('the closed quote-request validator ADMITS a waiver draft and coerces nothing, and the session answers with the waiver family', () => {
    const session = sessionOn(owesTwoState(), 'cc1-propose')
    const before = truth(session)
    const wire = waiverRequest(session, draftFor(OWES_TWO.promiseId, p1Wire(2, OWES_TWO.week)), 'cc1')
    const parsed = validateQuote(wire)
    expect(parsed.ok, `the wire must admit this family; validateQuote said ${JSON.stringify((parsed as { message?: string }).message ?? null)}`).toBe(true)
    if (!parsed.ok) throw new Error(parsed.message)
    expect(parsed.quote, 'a validated request is the request, byte for byte').toEqual(wire)
    const { quote } = acceptedWaiverQuote(session, wire.draft, 'cc1-session')
    expect(quote.promiseId).toBe(OWES_TWO.promiseId)
    expect(quote.talentId, 'the person is RESOLVED from the promise, never supplied by the client').toBe(OWES_TWO.talentId)
    expect(truth(session), 'a quote mutates nothing').toEqual(before)
  })

  it('the draft carries NO engine state: no studio id, no contract id, no feasibility receipt, no outcome', () => {
    const draft = draftFor(OWES_TWO.promiseId, p1Wire(2, OWES_TWO.week))
    const json = JSON.stringify(draft)
    for (const forbidden of [OWES_TWO.player, OWES_TWO.contractId, 'issuerStudioId', 'feasibilityReceipt', 'outcome', 'progress', 'evidenceRefs']) {
      expect(json, `CC1 requires the interaction to work without any client constructing engine state; ${forbidden} is engine state`).not.toContain(forbidden)
    }
    // And the surface accepts exactly this shape — otherwise the negative above is vacuous.
    const session = sessionOn(owesTwoState(), 'cc1-no-engine-state')
    expect(validateQuote(waiverRequest(session, draft, 'cc1-shape')).ok,
      'non-vacuous premise: the negatives above mean nothing unless the wire actually accepts this exact state-free draft').toBe(true)
  })

  it('the schema publishes the waiver quote family and its own draft payload as named definitions', () => {
    expect(Object.keys(schemaDef('StudioPromiseWaiverQuoteSnapshot') ?? {}), 'I3: the answer type must exist in $defs').not.toHaveLength(0)
    expect(Object.keys(schemaDef('StudioPromiseWaiverDraftPayload') ?? {}), 'I2/A8: the waiver draft is its OWN payload, not the market one reused').not.toHaveLength(0)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// group2 — COMPLETION CONDITION 2: a refusal is an ACCEPTED answer, verbatim, and changes nothing.
describe('P14B.8 group2 — CC2: the Owner\'s case, refused as an accepted answer', () => {
  it('a count-1 substitute answers accepted:true / ok:false with the engine\'s sentence VERBATIM, and the whole authority is unchanged', () => {
    const session = sessionOn(owesTwoState(), 'cc2-refusal')
    const before = truth(session)
    const digestBefore = authoritativeDigest(session.gameState)
    const { response, quote } = acceptedWaiverQuote(session, draftFor(OWES_TWO.promiseId, p1Wire(1, OWES_TWO.week)), 'cc2')
    expect(quote.ok).toBe(false)
    expect(quote.refusalReason, 'CC2 says VERBATIM: the bare sentence waiverAccepted returns, with nothing added and nothing rephrased').toBe(RULE7_SENTENCE)
    expect(response.stateRevision).toBe(before.revision)
    expect(authoritativeDigest(session.gameState), 'authoritativeDigest before must equal after').toBe(digestBefore)
    expect(truth(session)).toEqual(before)
    const promise = session.gameState.promises.find((p) => p.promiseId === OWES_TWO.promiseId)!
    expect(promise.outcome, 'a refused waiver settles nothing').toBeNull()
    expect(promise.supersededByPromiseId).toBeNull()
    expect(session.gameState.promises).toHaveLength(1)
  })

  it('a refused quote registers NO commit intent: submitting the id it carried is refused and settles nothing', () => {
    const session = sessionOn(owesTwoState(), 'cc2-no-intent')
    const { quote } = acceptedWaiverQuote(session, draftFor(OWES_TWO.promiseId, p1Wire(1, OWES_TWO.week)), 'cc2-quote')
    const before = truth(session)
    const refused = submit(session, quote.intentId, 'cc2-attempt')
    expect(refused.accepted).toBe(false)
    if (!refused.accepted) expect(refused.reasonCode).toBe('INTENT_NOT_AVAILABLE')
    expect(truth(session)).toEqual(before)
    expect(session.gameState.promises).toHaveLength(1)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// group3 — COMPLETION CONDITION 3: the acceptable substitute produces ok:true and ONE commit intent.
describe('P14B.8 group3 — CC3: the acceptance, and Trap 3', () => {
  it('a count-2 substitute answers ok:true with null refusal, echoed terms and one digest-bound intent, mutating nothing', () => {
    const session = sessionOn(owesTwoState(), 'cc3-accept')
    const before = truth(session)
    const { response, quote } = acceptedWaiverQuote(session, draftFor(OWES_TWO.promiseId, p1Wire(2, OWES_TWO.week)), 'cc3')
    expect(quote.ok).toBe(true)
    expect(quote.refusalReason, 'null exactly when ok').toBeNull()
    expect(quote).toMatchObject({
      promiseId: OWES_TWO.promiseId, talentId: OWES_TWO.talentId,
      family: 'APPEARANCE_COUNT', count: 2, seatClass: null,
      windowStartWeek: OWES_TWO.week + 1, dueWeekExclusive: OWES_TWO.week + 61,
    })
    expect(quote.commitLabel.trim().length, 'a commit label a player can read').toBeGreaterThan(0)
    expect(quote.consequence.trim().length, 'the consequence sheet is never empty').toBeGreaterThan(0)
    // Minted by the shared `opaqueIntentId` (digest || descriptor), not hand-rolled.
    expect(quote.intentId).toMatch(new RegExp(`^intent-v${String(PROTOCOL_VERSION)}-[0-9a-f]{64}$`))
    expect(response.stateDigest).toBe(before.digest)
    expect(truth(session), 'quoting an ACCEPTED substitute still mutates nothing').toEqual(before)
  })

  it('744 Trap 3: the quote describes the substitute\'s TERMS and never names its future id, and asking twice on the same state is deterministic', () => {
    const session = sessionOn(owesTwoState(), 'cc3-trap3')
    const first = acceptedWaiverQuote(session, draftFor(OWES_TWO.promiseId, p1Wire(2, OWES_TWO.week)), 'cc3-a')
    expect(JSON.stringify(first.quote), `the substitute's id is minted at COMMIT as ${OWES_TWO.substituteId}; naming it in a quote is wrong the moment another promise lands first`).not.toContain(OWES_TWO.substituteId)
    const second = acceptedWaiverQuote(session, draftFor(OWES_TWO.promiseId, p1Wire(2, OWES_TWO.week)), 'cc3-b')
    expect(second.quote.intentId, 'the same draft on the same state is the same intent: asking again is deterministic').toBe(first.quote.intentId)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// group4 — COMPLETION CONDITION 4: the confirmation, in one accepted command against one revision.
describe('P14B.8 group4 — CC4: confirm', () => {
  it('one accepted command settles the original WAIVED and binds the substitute to the SAME contract, advancing the revision by exactly 1', () => {
    const session = sessionOn(owesTwoState(), 'cc4-confirm')
    const revisionBefore = session.stateRevision
    const { accepted } = waiveThroughTheBridge(session, 'cc4')
    expect(session.stateRevision).toBe(revisionBefore + 1)
    expect((accepted as { message: string }).message.trim().length).toBeGreaterThan(0)
    const after = session.gameState
    expect(after.promises).toHaveLength(2)
    const original = after.promises.find((p) => p.promiseId === OWES_TWO.promiseId)!
    expect(original).toMatchObject({ outcome: 'WAIVED', outcomeWeek: OWES_TWO.week, supersededByPromiseId: OWES_TWO.substituteId, progress: 0 })
    expect(original.evidenceRefs, 'a waiver erases no completed work').toEqual([])
    const substitute = after.promises.find((p) => p.promiseId === OWES_TWO.substituteId)!
    expect(substitute).toMatchObject({
      family: 'APPEARANCE_COUNT', predicate: { count: 2 },
      windowStartWeek: OWES_TWO.week + 1, dueWeekExclusive: OWES_TWO.week + 61,
      contractId: OWES_TWO.contractId, outcome: null, progress: 0, supersededByPromiseId: null,
    })
    expect(substitute.evidenceRefs, 'the original\'s takes are not swept in and do not count again').toEqual([])
    expect(substitute.contractId, 'the substitute binds to the SAME employment contract').toBe(original.contractId)
  })

  it('744 §11 A4: the commit rides a NEW AVAILABLE_INTENT_KINDS member, not a reused marketProposalAction', () => {
    expect(AVAILABLE_INTENT_KINDS as readonly string[]).toContain('waivePromise')
    expect(new Set(AVAILABLE_INTENT_KINDS as readonly string[]).size, 'the vocabulary stays a set').toBe((AVAILABLE_INTENT_KINDS as readonly string[]).length)
    const session = sessionOn(owesTwoState(), 'cc4-kind')
    const { quote } = acceptedWaiverQuote(session, draftFor(OWES_TWO.promiseId, p1Wire(2, OWES_TWO.week)), 'cc4-kind')
    expect(quote.kind).not.toBe('marketProposalAction')
    expect(AVAILABLE_INTENT_KINDS as readonly string[]).toContain(quote.kind)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// group5 — COMPLETION CONDITION 5 and 745-C §8 condition 2: the history shows WHICH REPLACED WHICH,
// on ALL THREE carriers. Case (a) waives through the ENGINE so its RED is the projection alone;
// case (b) walks the player's own route so the surface is proved end to end.
describe('P14B.8 group5 — CC5: the link, the progress and the co-presence on all three carriers', () => {
  it('(a) PROJECTION ONLY: after an engine waiver, every carrier holds BOTH rows, newest first, with the typed link and the projected progress', () => {
    const state = owesTwoState()
    const week = state.market.tick
    const after = waivePromise(state, { promiseId: OWES_TWO.promiseId, substitute: { family: 'APPEARANCE_COUNT', predicate: { count: 2 }, windowStartWeek: week + 1, dueWeekExclusive: week + 61 } })
    for (const [name, rows] of Object.entries(carriers(after))) {
      expect(rows, `${name}: 745-C §8 condition 2 is CO-PRESENCE — leaving the inverse link off the wire is only licensed while both rows travel together`).toHaveLength(2)
      // `promiseHistoryFor` ends with `.reverse()`, so the SUBSTITUTE is first.
      expect(rows[0]!.promiseId, `${name}: newest mint first, so a top-down reader meets the replacement before the thing it replaced`).toBe(OWES_TWO.substituteId)
      expect(rows[1]!.promiseId).toBe(OWES_TWO.promiseId)
      const waived = rows[1]!
      expect(waived.outcome).toBe('WAIVED')
      expect(waived.supersededByPromiseId, `${name}: 744 §4 item 3 — the TYPED link, so no consumer parses outcomeCause`).toBe(OWES_TWO.substituteId)
      expect(rows[0]!.supersededByPromiseId, `${name}: the link points backwards only`).toBeNull()
      // 744 §11 A12: a player drafting a substitute must SEE the remaining obligation.
      expect(waived.progress, `${name}: progress is projected`).toBe(0)
      expect(rows[0]!.progress).toBe(0)
      // A9: the free-text cause stays exactly as B.7 landed it and is NOT rewritten.
      expect(waived.outcomeCause).toBe(`this person accepted the substitute promise "${OWES_TWO.substituteId}" in place of it`)
    }
  })

  it('(b) THROUGH THE PLAYER\'S OWN ROUTE: after the bridge journey the same three carriers agree, and the profile carries it over the real wire', () => {
    const session = sessionOn(owesTwoState(), 'cc5-route')
    waiveThroughTheBridge(session, 'cc5')
    const rows = carriers(session.gameState)
    for (const [name, carrier] of Object.entries(rows)) {
      expect(carrier.map((r) => r.promiseId), name).toEqual([OWES_TWO.substituteId, OWES_TWO.promiseId])
      expect(carrier[1]!.supersededByPromiseId, name).toBe(OWES_TWO.substituteId)
    }
    // The profile carrier, over the actual snapshot envelope rather than the module function.
    const snapshot = session.snapshot()
    const profile = snapshot.snapshot.talent.talent.profiles.find((p) => p.talentId === OWES_TWO.talentId)
    expect(profile, 'snapshot premise: the person must have a profile on the wire').toBeDefined()
    expect((profile as unknown as { promises: HistoryRow[] }).promises).toEqual(rows['StudioPersonProfileSnapshot.promises'])
  }, 60_000)

  it('(c) the wire ADMITS both new members: the row definition names them and a real projected row round-trips through parseWireValue', () => {
    const properties = (schemaDef('StudioMarketPromiseHistoryRow')['properties'] ?? {}) as Record<string, unknown>
    expect(Object.keys(properties), 'I6: supersededByPromiseId is a first-class row member').toContain('supersededByPromiseId')
    expect(Object.keys(properties), 'I6 / 744 §11 A12: progress is a first-class row member').toContain('progress')
    const state = owesTwoState()
    const week = state.market.tick
    const after = waivePromise(state, { promiseId: OWES_TWO.promiseId, substitute: { family: 'APPEARANCE_COUNT', predicate: { count: 2 }, windowStartWeek: week + 1, dueWeekExclusive: week + 61 } })
    const rows = promiseRowsForPerson(after, OWES_TWO.talentId, OWES_TWO.player) as unknown as HistoryRow[]
    expect(rows).toHaveLength(2)
    // Non-vacuous by construction: the rows carry the new members before they are parsed.
    expect(rows[1]!.supersededByPromiseId).toBe(OWES_TWO.substituteId)
    expect(rows[1]!.progress).toBe(0)
    for (const row of rows) expect(parseWireValue(schemaDef('StudioMarketPromiseHistoryRow') as never, row)).toEqual(row)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// group6 — COMPLETION CONDITION 6: no waiver reaches any public Industry surface.
describe('P14B.8 group6 — CC6: the player\'s route publishes nothing public', () => {
  it('the Pulse fold DOES publish kept and broken (control), and a waiver taken through the bridge leaves it row-for-row identical', () => {
    // Control first: a world with settled promises really does announce them, so the emptiness
    // below is an EXCLUSION and not a fold that has stopped working.
    const control = allActivities(keptAndBrokenState(), 'p14b8-control').filter((row) => 'outcomeKind' in row)
    expect(control.map((row) => (row as unknown as { outcomeKind: string }).outcomeKind).sort()).toEqual(['promiseBroken', 'promiseKept'])

    const session = sessionOn(owesTwoState(), 'cc6-public')
    const before = allActivities(session.gameState, 'p14b8-before')
    expect(before.length, 'the owes-two fold is NON-EMPTY, so an unchanged fold is a real comparison').toBeGreaterThan(0)
    waiveThroughTheBridge(session, 'cc6')
    const after = allActivities(session.gameState, 'p14b8-after')
    expect(after, 'a waiver adds no public row and removes none').toEqual(before)
    expect(after.filter((row) => 'outcomeKind' in row)).toEqual([])
    // Positively: the receipt EXISTS and no activity carries its eventId (744 §11 A2 — the
    // exclusion rests on the outcome enum test at bridge/industry.ts :148, alone).
    const waived = session.gameState.promises.find((p) => p.promiseId === OWES_TWO.promiseId)!
    expect(waived.outcomeEventId).not.toBeNull()
    expect(after.some((row) => row.eventId === waived.outcomeEventId)).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// group7 — COMPLETION CONDITION 7: four EXISTING generic protections, proved for this family. No
// waiver-specific guard is asked for or asserted anywhere below.
describe('P14B.8 group7 — CC7: cannot waive twice, cannot accept a stale offer', () => {
  it('(a) a replayed intentId after an accepted command is refused — pendingQuotes was cleared (session.ts :1613) — and nothing settles twice', () => {
    const session = sessionOn(owesTwoState(), 'cc7-replay-intent')
    const { quote } = waiveThroughTheBridge(session, 'cc7a')
    const after = truth(session)
    const replay = submit(session, quote.intentId, 'cc7a-replay')
    expect(replay.accepted).toBe(false)
    if (!replay.accepted) expect(replay.reasonCode).toBe('INTENT_NOT_AVAILABLE')
    expect(truth(session), 'the second waiver settles nothing').toEqual(after)
    expect(session.gameState.promises, 'exactly one substitute, ever').toHaveLength(2)
  })

  it('(b) a stale expectedStateRevision is refused (session.ts :1562) before the intent is even resolved, and settles nothing', () => {
    const session = sessionOn(owesTwoState(), 'cc7-stale-revision')
    const { quote } = acceptedWaiverQuote(session, draftFor(OWES_TWO.promiseId, p1Wire(2, OWES_TWO.week)), 'cc7b-quote')
    const before = truth(session)
    const stale = submit(session, quote.intentId, 'cc7b-stale', session.stateRevision + 7)
    expect(stale.accepted).toBe(false)
    if (!stale.accepted) expect(stale.reasonCode).toBe('STALE_REVISION')
    expect(truth(session)).toEqual(before)
    expect(session.gameState.promises).toHaveLength(1)
  })

  it('(c) a quote whose BOARD MOVED before commit fails closed and settles nothing (session.ts :1628 digest guard and :1613 clear are observationally identical here)', () => {
    const session = sessionOn(owesTwoState(), 'cc7-moved-board')
    const { quote } = acceptedWaiverQuote(session, draftFor(OWES_TWO.promiseId, p1Wire(2, OWES_TWO.week)), 'cc7c-quote')
    const mover = session.snapshot().availableIntents.find((option) => option.kind === 'startConstruction')
    expect(mover, 'premise: this world offers an unrelated commit that moves the digest without touching a promise').toBeDefined()
    const moved = submit(session, mover!.intentId, 'cc7c-move')
    expect(moved.accepted, 'premise: the board really moved').toBe(true)
    expect(session.gameState.promises, 'premise: the board-mover touched no promise').toHaveLength(1)
    const after = truth(session)
    const refused = submit(session, quote.intentId, 'cc7c-commit')
    expect(refused.accepted).toBe(false)
    if (!refused.accepted) expect(refused.reasonCode).toBe('INTENT_NOT_AVAILABLE')
    expect(truth(session)).toEqual(after)
    const promise = session.gameState.promises.find((p) => p.promiseId === OWES_TWO.promiseId)!
    expect(promise.outcome, 'an offer made against an older board settles nothing').toBeNull()
  }, 60_000)

  it('(d) a replayed commandId returns the FIRST response (session.ts :1560) and does not waive a second time', () => {
    const session = sessionOn(owesTwoState(), 'cc7-replay-command')
    const week = session.gameState.market.tick
    const { quote } = acceptedWaiverQuote(session, draftFor(OWES_TWO.promiseId, p1Wire(2, week)), 'cc7d-quote')
    const first = submit(session, quote.intentId, 'cc7d-commit')
    expect(first.accepted).toBe(true)
    const after = truth(session)
    const replay = session.command({ ...control(session, 'cc7d-commit', after.revision - 1), type: 'submitIntent' as const, payload: { intentId: quote.intentId } })
    expect(replay, 'the journal answers, byte for byte; it does not re-run the verb').toEqual(first)
    expect(truth(session)).toEqual(after)
    expect(session.gameState.promises).toHaveLength(2)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// group8 — COMPLETION CONDITION 8: save and reload.
describe('P14B.8 group8 — CC8: the waiver survives a save and a reload', () => {
  it('a save taken after the waiver reloads with the original still WAIVED, the substitute still bound, and the link intact on the wire', () => {
    const session = sessionOn(owesTwoState(), 'cc8-roundtrip')
    waiveThroughTheBridge(session, 'cc8')
    const saved = session.save(control(session, 'cc8-save'))
    expect(saved.accepted, 'premise: the post-waiver world must save').toBe(true)
    const loaded = session.load(control(session, 'cc8-load'))
    expect(loaded.accepted, `premise: the saved slot must load; the surface said ${JSON.stringify((loaded as { message?: string }).message ?? null)}`).toBe(true)
    const after = session.gameState
    expect(after.promises).toHaveLength(2)
    const original = after.promises.find((p) => p.promiseId === OWES_TWO.promiseId)!
    expect(original).toMatchObject({ outcome: 'WAIVED', supersededByPromiseId: OWES_TWO.substituteId })
    const substitute = after.promises.find((p) => p.promiseId === OWES_TWO.substituteId)!
    expect(substitute).toMatchObject({ contractId: OWES_TWO.contractId, outcome: null, progress: 0 })
    for (const [name, rows] of Object.entries(carriers(after))) {
      expect(rows.map((r) => r.promiseId), `${name} after reload`).toEqual([OWES_TWO.substituteId, OWES_TWO.promiseId])
      expect(rows[1]!.supersededByPromiseId, `${name} after reload`).toBe(OWES_TWO.substituteId)
    }
  })

  it('a quote minted BEFORE a save cannot be committed after the reload, even though the reloaded state is DIGEST-IDENTICAL (session.ts :2054, isolated from the digest guard)', () => {
    const session = sessionOn(owesTwoState(), 'cc8-quote-across-load')
    const saved = session.save(control(session, 'cc8b-save'))
    expect(saved.accepted).toBe(true)
    const digestBefore = authoritativeDigest(session.gameState)
    const { quote } = acceptedWaiverQuote(session, draftFor(OWES_TWO.promiseId, p1Wire(2, OWES_TWO.week)), 'cc8b-quote')
    const loaded = session.load(control(session, 'cc8b-load'))
    expect(loaded.accepted).toBe(true)
    expect(authoritativeDigest(session.gameState), 'the reload restores the SAME bytes, so only the clear can refuse this commit').toBe(digestBefore)
    const refused = submit(session, quote.intentId, 'cc8b-commit')
    expect(refused.accepted).toBe(false)
    if (!refused.accepted) expect(refused.reasonCode).toBe('INTENT_NOT_AVAILABLE')
    expect(session.gameState.promises, 'nothing was waived across the reload').toHaveLength(1)
    expect(session.gameState.promises[0]!.outcome).toBeNull()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// group9 — 744 §11 A1: THE OWNERSHIP GATE. The most important group in this suite.
//
// MEASURED at 25794023 on genuine-v31-with-edges (oracle group4): `waiverAccepted` returns NULL for
// a substitute against rival `studio-aca408ec-r02`'s bound open `promise-1`, and `waivePromise`
// carries it out — the rival's promise settles WAIVED and `promise-48` binds to the RIVAL's own
// employment contract. Promise ids are `promise-${state.promises.length}`, dense and enumerable.
// Today no client can reach the verb at all. B.8 builds the route, so the gate is B.8's.
describe('P14B.8 group9 — A1: a waiver against a promise the player does not own is refused, and the rival is untouched', () => {
  /** WITHOUT THIS PREMISE, (b) and (e) pass today for the wrong reason: the family does not exist,
   *  so nothing can commit and no message can name a rival. It asserts the surface EXISTS, so every
   *  case in this group is testing the OWNERSHIP refusal and not the family's absence. */
  function surfaceExists(session: BridgeSession, draft: WaiverDraftWire, commandId: string): void {
    expect(validateQuote(waiverRequest(session, draft, commandId)).ok,
      'premise: the waiver family must EXIST before "refused because the player does not own this promise" means anything').toBe(true)
  }

  it('(a) QUOTE: naming a rival-issued promise is REFUSED, not answered, and the whole authority is unchanged', () => {
    const session = sessionOn(withEdgesState(), 'a1-quote')
    const draft = draftFor(WITH_EDGES.promiseId, p1Wire(1, WITH_EDGES.week))
    surfaceExists(session, draft, 'a1-premise')
    const before = truth(session)
    const response = askWaiver(session, draft, 'a1-quote')
    expect(response.accepted, 'I5: there is no engine sentence to publish here (waiverAccepted returns null), so this is a rejection, never an accepted ok:false quote').toBe(false)
    if (!response.accepted) expect(response.reasonCode, 'matching the four existing families\' treatment of a draft that does not convert').toBe('ENGINE_REJECTED')
    expect(truth(session)).toEqual(before)
  })

  it('(b) COMMIT: no sequence of public calls settles the rival\'s promise — it stays open, no substitute is minted, promises.length is unchanged', () => {
    const session = sessionOn(withEdgesState(), 'a1-commit')
    const draft = draftFor(WITH_EDGES.promiseId, p1Wire(1, WITH_EDGES.week))
    surfaceExists(session, draft, 'a1-c-premise')
    const before = truth(session)
    const response = askWaiver(session, draft, 'a1-c-quote')
    const candidates: string[] = ['intent-v4-' + '0'.repeat(64)]
    if (response.accepted) candidates.push((response as unknown as { quote: WaiverQuote }).quote.intentId)
    for (const [index, intentId] of candidates.entries()) {
      const refused = submit(session, intentId, `a1-c-submit-${String(index)}`)
      expect(refused.accepted, 'a waiver intent against a rival promise must never commit').toBe(false)
    }
    expect(truth(session)).toEqual(before)
    const rival = session.gameState.promises.find((p) => p.promiseId === WITH_EDGES.promiseId)!
    expect(rival.outcome, 'the rival\'s promise is still open').toBeNull()
    expect(rival.supersededByPromiseId).toBeNull()
    expect(rival.issuerStudioId).toBe(WITH_EDGES.rivalIssuer)
    expect(session.gameState.promises).toHaveLength(WITH_EDGES.promiseCount)
  })

  it('(c) an UNKNOWN promiseId is rejected at conversion with ENGINE_REJECTED, not returned as an accepted ok:false quote', () => {
    const session = sessionOn(owesTwoState(), 'a1-unknown')
    surfaceExists(session, draftFor(OWES_TWO.promiseId, p1Wire(2, OWES_TWO.week)), 'a1-unknown-premise')
    const before = truth(session)
    for (const promiseId of ['promise-9999', 'promise-', 'not-a-promise-id']) {
      const response = askWaiver(session, draftFor(promiseId, p1Wire(2, OWES_TWO.week)), `a1-unknown-${promiseId}`)
      expect(response.accepted, `an id the authority holds no promise for is a rejection, not a verdict (${promiseId})`).toBe(false)
      if (!response.accepted) expect(response.reasonCode).toBe('ENGINE_REJECTED')
    }
    expect(truth(session)).toEqual(before)
  })

  it('(d) a MALFORMED promiseId never reaches the session: the wire refuses it, because promiseId is nonEmptyText', () => {
    const session = sessionOn(owesTwoState(), 'a1-malformed')
    const good = waiverRequest(session, draftFor(OWES_TWO.promiseId, p1Wire(2, OWES_TWO.week)), 'a1-good')
    expect(validateQuote(good).ok, 'non-vacuous premise: the wire admits a WELL-formed waiver draft').toBe(true)
    for (const promiseId of ['', null, 7, { id: 'promise-0' }]) {
      const wire = waiverRequest(session, { promiseId, substitute: p1Wire(2, OWES_TWO.week) }, 'a1-bad')
      expect(validateQuote(wire), `malformed promiseId ${JSON.stringify(promiseId)} must fail at the wire boundary`).toMatchObject({ ok: false, reasonCode: 'INVALID_COMMAND' })
      expect(() => parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeQuoteRequest, wire)).toThrow()
    }
  })

  it('(e) the ownership refusal discloses nothing about the rival: not the studio, not the person, not the terms', () => {
    const session = sessionOn(withEdgesState(), 'a1-disclosure')
    const draft = draftFor(WITH_EDGES.promiseId, p1Wire(1, WITH_EDGES.week))
    surfaceExists(session, draft, 'a1-disclosure-premise')
    const response = askWaiver(session, draft, 'a1-disclosure')
    const message = String((response as { message?: string }).message ?? '')
    expect(message.trim().length, 'a refusal still has to say something').toBeGreaterThan(0)
    for (const secret of [WITH_EDGES.rivalIssuer, WITH_EDGES.beneficiary]) {
      expect(message, 'a rival\'s promise is not the player\'s to read about').not.toContain(secret)
    }
    expect(message, 'and it never ships the engine namespace').not.toContain(ENGINE_THROW_PREFIX)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// group10 — 744 §11 A6 and Trap 1: the published copy is the engine's BARE sentence, never its
// namespaced throw. The reachable half; 750-T records why the "accepted at quote, refused at
// commit" construction cannot be built through this surface.
describe('P14B.8 group10 — A6: the copy a player reads', () => {
  it('the refusal is the BARE sentence: no "promises:" namespace, no throw wrapper, nothing appended', () => {
    const session = sessionOn(owesTwoState(), 'a6-bare')
    const { quote } = acceptedWaiverQuote(session, draftFor(OWES_TWO.promiseId, p1Wire(1, OWES_TWO.week)), 'a6-bare')
    expect(quote.refusalReason).toBe(RULE7_SENTENCE)
    expect(quote.refusalReason, 'Trap 1: a quote that catches waivePromise ships the engine namespace to a player').not.toContain('promises:')
    expect(quote.refusalReason).not.toContain(ENGINE_THROW_PREFIX)
  })

  it('NO message on any leg of this family\'s journey carries the engine namespace prefix', () => {
    const published: string[] = []
    const collect = (value: { message?: string } | { message: string }): void => {
      const message = (value as { message?: string }).message
      if (typeof message === 'string') published.push(message)
    }
    const session = sessionOn(owesTwoState(), 'a6-sweep')
    const week = session.gameState.market.tick
    collect(askWaiver(session, draftFor(OWES_TWO.promiseId, p1Wire(1, week)), 'a6-refusal') as { message?: string })
    collect(askWaiver(session, draftFor('promise-9999', p1Wire(2, week)), 'a6-unknown') as { message?: string })
    const { quote } = acceptedWaiverQuote(session, draftFor(OWES_TWO.promiseId, p1Wire(2, week)), 'a6-accept')
    published.push(quote.commitLabel, quote.consequence)
    collect(submit(session, quote.intentId, 'a6-stale', session.stateRevision + 5) as { message?: string })
    const accepted = submit(session, quote.intentId, 'a6-commit')
    expect(accepted.accepted, 'premise: the sweep must include the ACCEPTED message too').toBe(true)
    collect(accepted as { message?: string })
    collect(submit(session, quote.intentId, 'a6-replay') as { message?: string })
    expect(published.length, 'premise: the sweep must actually have collected the journey').toBeGreaterThanOrEqual(6)
    for (const message of published) {
      expect(message, `published copy carried the engine namespace: ${JSON.stringify(message)}`).not.toContain('promises:')
      expect(message).not.toContain(ENGINE_THROW_PREFIX)
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// group11 — 744 §11 A8: the unoffered families are UNEXPRESSIBLE, so "not offered in this slice"
// can never reach a player through this surface. Measured on the law (oracle group2): a
// DIRECTING_COUNT substitute really does publish that phrase through rule 9.
describe('P14B.8 group11 — A8: the waiver draft offers only what this surface has', () => {
  it('the two OFFERED families validate and the three unoffered ones are refused at the wire', () => {
    const session = sessionOn(owesTwoState(), 'a8-domain')
    const week = OWES_TWO.week
    const offered: WaiverSubstituteWire[] = [
      { family: 'APPEARANCE_COUNT', count: 2, windowStartWeek: week + 1, dueWeekExclusive: week + 61 },
      { family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', count: 2, windowStartWeek: week + 1, dueWeekExclusive: week + 61, seatClass: 'lead' },
    ]
    for (const substitute of offered) {
      expect(validateQuote(waiverRequest(session, draftFor(OWES_TWO.promiseId, substitute), `a8-ok-${substitute.family}`)).ok,
        `${substitute.family} is offered by the engine and must be expressible on this surface`).toBe(true)
    }
    for (const family of ['DIRECTING_COUNT', 'PREFERRED_GENRE_OPPORTUNITY', 'SPECIFIC_PROJECT']) {
      const wire = waiverRequest(session, { promiseId: OWES_TWO.promiseId, substitute: { family, count: 2, windowStartWeek: week + 1, dueWeekExclusive: week + 61 } }, `a8-no-${family}`)
      expect(validateQuote(wire), `${family} must be unreachable BY CONSTRUCTION; its engine refusal publishes "not offered in this slice" to a player`)
        .toMatchObject({ ok: false, reasonCode: 'INVALID_COMMAND' })
    }
  })

  it('a seat-class substitute REQUIRES its explicit class, so the engine\'s "needs its seat class selected" sentence is unreachable too', () => {
    const session = sessionOn(owesTwoState(), 'a8-seatclass')
    const week = OWES_TWO.week
    const withClass = { family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', count: 2, windowStartWeek: week + 1, dueWeekExclusive: week + 61, seatClass: 'leadOrAntagonist' }
    expect(validateQuote(waiverRequest(session, { promiseId: OWES_TWO.promiseId, substitute: withClass }, 'a8-class-ok')).ok,
      'non-vacuous premise: an explicitly classed P2 substitute IS expressible').toBe(true)
    for (const seatClass of [undefined, null, 'support', 'leadOrSupport']) {
      const substitute: Record<string, unknown> = { family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', count: 2, windowStartWeek: week + 1, dueWeekExclusive: week + 61 }
      if (seatClass !== undefined) substitute['seatClass'] = seatClass
      expect(validateQuote(waiverRequest(session, { promiseId: OWES_TWO.promiseId, substitute }, 'a8-class-bad')),
        `seatClass ${JSON.stringify(seatClass)} must fail at the wire, exactly as the P14B.4 market draft already makes it`)
        .toMatchObject({ ok: false, reasonCode: 'INVALID_COMMAND' })
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// group12 — 744 §11 A3: the projection bump, complete and consistent, in ONE commit.
describe('P14B.8 group12 — the projection moves 49 -> 50 and the outgoing identity is registered as a prior', () => {
  it('PROJECTION_VERSION is 50 and the schema document agrees', () => {
    expect(PROJECTION_VERSION).toBe(50)
    expect(BRIDGE_SCHEMA.$id).toBe(`urn:project-studio:bridge:protocol-${String(PROTOCOL_VERSION)}:projection-50`)
    expect(BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(50)
    expect(PROJECTION_VERSION).toBeGreaterThan(OUTGOING_PROJECTION)
  })

  it('the running identity moves OFF sha256:60af24c5… and that identity is registered as projection-v49 in the SAME commit', () => {
    expect(SCHEMA_ID, 'the new quote family and the two new row members alone mint a new content hash').not.toBe(OUTGOING_49)
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.get(OUTGOING_49), 'validateVersionedRecord strands every checkpoint written under an unregistered identity').toBe('projection-v49')
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.has(SCHEMA_ID), 'the RUNNING identity is never its own prior').toBe(false)
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.size, 'exactly one entry is added: 37 -> 38').toBe(38)
  })

  it('the checked-in JSON schema, the contract manifest and the C# header all equal the running identity', () => {
    const schemaJson = JSON.parse(readFileSync(new URL('../bridge/schema/project-studio-bridge.schema.json', import.meta.url), 'utf8')) as { $id: string; 'x-project-studio': { projectionVersion: number } }
    const manifest = JSON.parse(readFileSync(new URL('../generated/unity/project-studio-bridge.contract-manifest.json', import.meta.url), 'utf8')) as { schemaId: string; projectionVersion: number }
    const csharp = readFileSync(new URL('../generated/unity/StudioBridgeDtos.Generated.cs', import.meta.url), 'utf8')
    expect(schemaIdentity(BRIDGE_SCHEMA)).toBe(SCHEMA_ID)
    expect(schemaJson.$id).toBe(`urn:project-studio:bridge:protocol-4:projection-${String(PROJECTION_VERSION)}`)
    expect(schemaJson['x-project-studio'].projectionVersion).toBe(PROJECTION_VERSION)
    expect(manifest).toMatchObject({ schemaId: SCHEMA_ID, projectionVersion: PROJECTION_VERSION })
    // Asserted as booleans: a `toContain` on a 2 MB generated file prints the whole file on failure.
    expect(csharp.includes(`// Schema identity: ${SCHEMA_ID}`), 'the generated C# header must carry the running identity').toBe(true)
    // 744 §11 A3 / 745-C §11: the bump regenerates the DTOs even though native CONTROLS stay
    // deferred, so the new row members must be visible to a C# reader.
    expect(csharp.includes('supersededByPromiseId'), 'the regenerated DTOs must carry the new history-row member').toBe(true)
    expect(csharp.includes('StudioPromiseWaiverQuoteSnapshot'), 'the regenerated DTOs must carry the new quote type').toBe(true)
  })

  it('the genuine projection-49 checkpoint is no longer the CURRENT identity: it takes the governed prior path exactly once, with both slots on the live Save V34 (stale title corrected post-C.2a)', () => {
    const raw = gunzipSync(artifact('genuine-projection49-runtime/genuine-projection49-runtime.checkpoint.json.gz')).toString('utf8')
    expect(sha(raw)).toBe(PROJECTION49_CHECKPOINT.raw)
    const parsed = JSON.parse(raw) as { schemaId: string; sessionId: string; stateRevision: number }
    expect(parsed).toMatchObject({ schemaId: OUTGOING_49, sessionId: PROJECTION49_CHECKPOINT.sessionId, stateRevision: PROJECTION49_CHECKPOINT.stateRevision })
    let minted = 0
    const loaded = loadBridgeRuntimeCheckpoint(raw, undefined, () => { minted += 1; return 'p14b8-prior-path' })
    expect(loaded.migratedFromProtocolVersion, 'handled exactly as its projection-47 and -48 siblings are').toBe(4)
    expect(minted, 'the governed prior path mints one fresh session id').toBe(1)
    const hydrated = loaded.hydrated as unknown as { currentSave: { saveVersion: number; state: { market: { tick: number } } }; savedSave: { saveVersion: number } }
    expect(hydrated.currentSave.saveVersion, '744 §6: B.8 is a wire change, so both slots migrate as identity').toBe(34)
    expect(hydrated.savedSave.saveVersion).toBe(34)
    expect(hydrated.currentSave.state.market.tick).toBe(PROJECTION49_CHECKPOINT.week)
  })
})
