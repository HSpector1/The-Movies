// ── P13B-S8-T3 test 8: bridge projection 41 (symmetric rival research/finance) ──
//
// Requirement-derived from "S8 — Symmetric rival research and finance" in
// docs/engineering/playability-launch-review/plans/P13B-HEADLESS-PLAN.md — its
// scope record's "Bridge (projection next, text only)" bullet, the Refinement
// block's own "Bridge (projection 41, text only)" paragraph, the Audit's LAW
// item 13 ("T3 verifies every receipt-kind switch/narrowing in bridge/ and
// ui/ accepts the five new kinds"), "### S8 tasks" (S8-T3 line), plus the
// parent's exact wire-pin dispatch message (this file's own numbered items
// 1-6 below, quoted verbatim in each `describe`). Engine landed (S8-T2,
// `c609e0a`/`d2ce838`, closed `742fb1e`): `src/core/rivalResearch.ts`
// (`RIVAL_RESEARCH_POLICY`, `admitRivalPlans`, `advanceRivalResearchWeek`),
// Save V27 (`LIVE_SAVE_VERSION = 27`), the five rival receipt kinds
// `laboratoryCommitted | laboratoryOperational | instrumentOperational |
// researchSeatAssigned | researchCompleted` (`RIVAL_RESEARCH_RECEIPT_KINDS`,
// `src/core/hollywoodTypes.ts`), the four rival money kinds `researchSpend |
// researchCapacity | technologyRestoration | technologyRefund`
// (`RIVAL_RESEARCH_MONEY_KINDS`, `src/core/hollywood.ts`). Bridge is
// projection 40 with the live-version path already aligned to V27 (`742fb1e`,
// "bridge/ui live-version sweep 26->27").
//
// MEASURED FACTS this file's premises rest on (probed 2026-09-18 via
// `npx vite-node` against the already-landed engine, never invented):
//   * `bridge/schema/bridge-schema.ts:129`: `PROJECTION_VERSION = 40 as const`
//     — item 1's version pin is RED against today's bridge, not a harness gap.
//   * A natural `p13aGeneratedStudio` campaign (seed
//     `p13b-s8-bridge-probe-01`, `commitPlacement`'d with one player Research
//     Laboratory at week 0): rivals `r01`-`r04` each admit a Laboratory at
//     week 0 (`laboratoryCommitted`) and complete it at week 12
//     (`laboratoryOperational`) — 12 weeks after commit, matching
//     `TUNING.RESEARCH_LABORATORY_BUILD_WEEKS`; NOT "week 1 / week 13" as an
//     earlier approximate description had it. Rival `r01` genuinely competes
//     for and wins synchronized-sound research (the "one inventor" CANDIDATE
//     policy — `interests()`, `rivalResearch.ts`): instrument operational
//     week 265, four Scientists seated week 265, project verifiedWork 60/64
//     at week 275, `researchCompleted` at week 276, a second Laboratory
//     `laboratoryCommitted` week 266 / `laboratoryOperational` week 278,
//     `technologyAdopted` (commercial capability) week 288. By week 400 no
//     other rival ever reaches instrument/seat/completion facts on this
//     lineage (rival `r01`'s own cash goes deeply negative — `-13.9M` observed
//     at week 400 on an unrelated seed — well before any second admission
//     round could recur; not pursued further, engine-side tuning is not this
//     file's scope). This file therefore exercises all five S8 receipt kinds
//     and two of the four S8 money kinds (`researchCapacity`, `researchSpend`)
//     through 100% NATURALLY SIMULATED states — no receipt or project was
//     hand-forged onto any state in this file. Forging was attempted first
//     (`researchSeatAssigned`/`researchCompleted`/`instrumentOperational`
//     added directly to `h.receipts` with a matching `ResearchProject`) and
//     abandoned: EVERY bridge read (`session.industry()`, `session.snapshot()`)
//     unconditionally computes `stateDigest()` -> `exportSaveJson` ->
//     `exportCurrentState` -> the FULL save validator chain
//     (`validateSaveV29` down through `validateTechnologyRoot`), so any
//     receipt whose backing state fact is not itself fully validator-consistent
//     throws a HARNESS error before any bridge assertion can run (confirmed:
//     an unreconciled `researchCapacity` movement throws "research capacity
//     movements do not reconcile with admitted plans"; a `researchSeatAssigned`
//     receipt without a real occupied seat throws "seat receipt has no
//     assigned seat"). The natural campaign above reaches every needed fact
//     validly, so it is used throughout instead.
//   * `RivalResearchMoneyKind.researchSpend` COLLIDES, as a string, with the
//     PLAYER's own pre-existing, unrelated ledger `MoneyKind`
//     `'researchSpend'` (`src/core/types.ts:414/441`, label "Research
//     materials and experiments", `src/core/financeReport.ts:7`) — a fact
//     confirmed by direct probe: `session.snapshot()`'s finance section
//     legitimately contains a `{"kind":"researchSpend",...}` channel row for
//     the PLAYER at week 13 even though no rival money-kind leak exists. A
//     blanket "the wire JSON must never contain the substring researchSpend"
//     check would therefore be FALSE on its face for a reason unrelated to
//     S8; item 3/4's researchSpend sub-claim is instead tested precisely
//     (the player's own `researchSpend` finance channel reads $0 in every
//     window even while a REAL rival researchSpend movement is nonzero
//     elsewhere in the same state) instead of by blanket string absence. The
//     other three money kinds (`researchCapacity`, `technologyRestoration`,
//     `technologyRefund`) have no such collision (probed absent from every
//     page today) and are checked by blanket string absence.
//   * `BridgeSession.fromSaveJson` — the only public entry point that accepts
//     a save at a version other than the live one — computes `converted`
//     internally (`importSaveJsonCurrent`) but never returns or exposes it;
//     the constructed `BridgeSession` carries only the migrated `GameState`.
//     `session.load()` DOES expose `converted` (via its `message` field,
//     `bridge/session.ts` ~1957-1959) but unconditionally validates its input
//     through `validateCanonicalCurrentSave`, which throws unless the saved
//     JSON is EXACTLY the canonical current (live-version) save — so `session.load()`
//     can never legitimately observe a genuine cross-version migration. This
//     is the SAME architecture gap `tests/bridge-p13b-r07-setup.test.ts`'s own
//     "extra pin" describe block already names and leaves OMITTED for exactly
//     this reason ("a genuine V24 fixture loaded through the bridge reports
//     converted: true" control case "produced a HARNESS ERROR, not a product
//     RED"). Item 1's "converted: true for a genuine V26 fixture load" is
//     therefore tested the same way `tests/bridge-p13b-s2-labs.test.ts`'s own
//     case 6 already does for a V21 fixture: asserted TRUE BY CONSTRUCTION
//     (`saveVersion 26 !== LIVE_SAVE_VERSION`) via a code comment beside a
//     `fromSaveJson` load, never as a directly observed wire boolean — an
//     UNSATISFIABLE premise against the current session API, named rather
//     than worked around with an illegitimate construction (matching the
//     r07-setup file's own precedent for the identical gap).
//
// Harness idioms: `tests/bridge-p13b-s7-disclosure.test.ts`
// (`labResponse`/`labPage`/`anyLabBuildingId`/`required`/`industryQuery`/
// `activitiesOf`/the Save As `Store`/`options`/`request`/`library` helpers,
// copied near-verbatim per this repo's documented "duplicated-not-shared by
// design" convention, `tests/p13b-s5-quotes.test.ts`); `tests/bridge-p12-
// industry.test.ts` (the `json.not.toContain('"'+secret+'"')` leak-check
// style); `tests/bridge-p13b-r07-setup.test.ts` (`control`/`nextCommandId`,
// the save/load "converted" idiom and its own documented unsatisfiable-
// premise precedent for legacy loads through `session.load()`);
// `tests/bridge-p13b-s3-save-as.test.ts` (Save As `Store`/`options`/
// `request`/`library` helpers).
//
// INTERPRETATIONS NAMED:
//   1. Item 2's "existing groups" is read as the literal four groups already
//      dispatched by `bridge/industry.ts`'s own `groupOrder` object:
//      `releases | people | studios | announcements`. No fifth group is
//      asserted or invented for the new row.
//   2. Item 2's "detail WITHOUT seat, Lab or instrument counts" is tested as
//      "the detail string contains no digit character" — the plan does not
//      dictate exact wording, and pinning invented prose would violate the
//      "do not invent behaviour" instruction; absence of any digit is the
//      precise, defensible reading of "without counts".
//   3. Item 2's headline is pinned VERBATIM from the parent's own dispatch
//      text: `` `${studio} expands its research capacity` `` — an
//      authoritative example, not an invention.
//   4. A positive-case row's `eventId` is asserted to equal its source
//      receipt's `eventId` — inferred from the uniform `base =
//      {eventId:r.eventId,...}` object every existing branch in
//      `bridge/industry.ts` already spreads into its own row, not an
//      independent invention.

import { randomUUID, createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { commitPlacement } from '../src/core/placement.js'
import { advanceTo, p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import { RIVAL_RESEARCH_RECEIPT_KINDS } from '../src/core/hollywoodTypes.js'
import { RIVAL_RESEARCH_MONEY_KINDS } from '../src/core/hollywood.js'
import type { GameState } from '../src/core/types.js'
import { BridgeSession } from '../bridge/session.ts'
import { PROTOCOL_VERSION, SCHEMA_ID, type ControlEnvelope } from '../bridge/protocol.ts'
import { BRIDGE_SCHEMA, PROJECTION_VERSION } from '../bridge/schema/bridge-schema.ts'
import { createBridgeRuntimeCoordinator, type BridgeRuntimeCoordinator } from '../bridge/runtime/runtime-coordinator.ts'
import type { BridgeCheckpointStore } from '../bridge/runtime/checkpoint-store.ts'
import { decodeCampaignStorage } from '../bridge/runtime/campaign-storage-codec.ts'
import type { CampaignRequest } from '../bridge/schema/bridge-schema.ts'
import type { CampaignLibrary } from '../bridge/runtime/campaign-library.ts'
import { DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS } from '../bridge/runtime-checkpoint.ts'

// ── Wire shapes (loosely typed, matching tests/bridge-p13b-s7-disclosure.test.ts) ──
type WireActivity = {
  eventId: string; week: number; dateLabel: string; group: string
  headline: string; detail: string; studioId: string | null; filmId: string | null; talentId: string | null
}
type WireLaboratoryPage = { buildingId: string; actions: unknown[]; adoptions?: unknown[]; projects?: unknown[]; forecast?: unknown[]; seatLabel: string }

function required<T>(value: T | null | undefined, message: string): T {
  if (value === null || value === undefined) throw new Error(message)
  return value
}
let requestCounter = 0
function nextRequestId(prefix: string): string { return `${prefix}-req-${String(requestCounter++)}` }
let commandCounter = 0
function nextCommandId(prefix: string): string { return `${prefix}-cmd-${String(commandCounter++)}` }
function control(session: BridgeSession, commandId: string, revision = session.stateRevision): ControlEnvelope {
  return { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId, commandId, expectedStateRevision: revision }
}
function anyLabBuildingId(state: GameState): string {
  const lab = required(state.placement.facilities.find(p => p.blueprintId === 'research-laboratory' && p.installation === undefined),
    'no installed Research Laboratory placement on this state')
  return `placed-${String(lab.id)}`
}
function labPage(session: BridgeSession, buildingId: string, requestId: string): WireLaboratoryPage {
  const response = session.industry({
    protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'industryQuery', view: 'laboratory',
    targetId: buildingId, page: 0, pageSize: 50, lane: 'audienceAwareness', period: 'all',
    requestId, sessionId: session.sessionId, expectedStateRevision: session.stateRevision,
  } as never) as unknown as Record<string, unknown>
  if (!('laboratory' in response) || response.laboratory === null) throw new Error(`laboratory view rejected for building "${buildingId}" (request ${requestId}): ${JSON.stringify(response).slice(0, 500)}`)
  return response.laboratory as WireLaboratoryPage
}
function industryQuery(session: BridgeSession, view: string, extra: Record<string, unknown> = {}): Record<string, unknown> {
  return session.industry({
    protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'industryQuery', view,
    targetId: null, page: 0, pageSize: 50, lane: 'recent', period: 'all',
    requestId: nextRequestId('industry'), sessionId: session.sessionId, expectedStateRevision: session.stateRevision,
    ...extra,
  } as never) as unknown as Record<string, unknown>
}
function activitiesOf(response: Record<string, unknown>): WireActivity[] {
  return (response.activities as WireActivity[] | undefined) ?? []
}
const load = (relative: string) => gunzipSync(readFileSync(new URL(relative, import.meta.url))).toString('utf8')
function assertSha256(json: string, expected: string) { expect(createHash('sha256').update(json).digest('hex')).toBe(expected) }
const EXISTING_GROUPS = ['releases', 'people', 'studios', 'announcements']

// ── Natural fixtures (100% simulated, no forging — see header MEASURED FACTS) ──
const NATURAL_SEED = 'p13b-s8-bridge-probe-01'
const withPlayerLab = commitPlacement(p13aGeneratedStudio(NATURAL_SEED), { blueprintId: 'research-laboratory', origin: { gx: 0, gy: 9 } })
const WEEK13 = advanceTo(withPlayerLab, 13) // 4 rivals: laboratoryCommitted(0)/laboratoryOperational(12) each
const WEEK277 = advanceTo(WEEK13, 277) // + r01: instrumentOperational/researchSeatAssigned(265), laboratoryCommitted(266, 2nd lab), researchCompleted(276)
// RE-EXPRESSED AGAIN (test-author, P14A.1 T2, against the landed rival seat
// budget `daaf95f`): the prior re-expression (`1f3fcd6`) moved this
// fixture's natural week from 288 to 293 for as long as `commitRivalWinner`
// had no seat cap — at r01's own week-208 synchronized expiry it won up to
// 12 people instead of its own 6 (evidence 14-settlement-decline-diagnosis,
// 18), and the extra signing-bonus cash movement from those uncapped wins
// delayed r01's second-Laboratory research chain by five weeks. The seat
// budget caps every rival back to RIVAL_TEAM_ROLES at week 208 (r01 back to
// exactly its own six — evidence 20-seat-budget-measurements.txt), so this
// fixture's natural chain is back at its ORIGINAL week 288 — measured fresh
// (`npx vite-node`, not assumed): seed 'p13b-s8-bridge-probe-01'
// technologyAdopted receipts through week 340: [{"week":288,"studioId":
// "studio-efb645e3-r01"}] (evidence 20-seat-budget-measurements.txt, final
// line). The kept identifier is still `WEEK288`; every other case in this
// file references it unchanged.
const WEEK288 = advanceTo(WEEK277, 288) // + r01: laboratoryOperational(278, 2nd lab), technologyAdopted(288)
const RIVAL_1 = required(WEEK13.hollywood!.businesses[0], 'no rival business on the natural fixture')

const DIVERGENT_WEEK13 = advanceTo(commitPlacement(p13aGeneratedStudio('p13b-s8-bridge-rivals-divergent-01'),
  { blueprintId: 'research-laboratory', origin: { gx: 0, gy: 9 } }), 13)

describe('P13B-S8-T3 item 1: projection version bump 40 -> 41; converted flag', () => {
  it('bumps PROJECTION_VERSION to 41 and its schema $id / x-project-studio.projectionVersion move with it', () => {
    expect(PROJECTION_VERSION).toBe(51) // RED: today PROJECTION_VERSION is 40
    expect(BRIDGE_SCHEMA.$id).toContain('projection-50')
    expect(BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(51)
  })

  it('converted: false for a genuine current live-version save, round-tripped through save()/load() on the SAME session (regression guard — matches tests/bridge-p13b-r07-setup.test.ts\'s own now-fixed case)', () => {
    const session = new BridgeSession(WEEK13, 'p13b-s8-converted-false')
    const saved = session.save(control(session, nextCommandId('save')))
    expect(saved.accepted).toBe(true)
    if (!saved.accepted) throw new Error(`save refused: ${JSON.stringify(saved)}`)
    expect((JSON.parse(saved.saveJson) as { saveVersion: number }).saveVersion).toBe(37)
    const loaded = session.load(control(session, nextCommandId('load')))
    expect(loaded.accepted).toBe(true)
    if (!loaded.accepted) throw new Error(`load refused: ${JSON.stringify(loaded)}`)
    expect(loaded.message).toBe('Authoritative TypeScript save loaded.')
  })

  it('converted: true BY CONSTRUCTION for a genuine V26 fixture load (legacy-v26-lighting-restored-795, saveVersion 26 !== LIVE_SAVE_VERSION) — see header for why this cannot be a directly observed wire boolean through the current session API', () => {
    const json = load('./fixtures/p13b/legacy-v26-lighting-restored-795.json.gz')
    assertSha256(json, 'f48da034f2bd64c35b23361ab12726b2ba0a8f02a7d8dc59caa84055f92f5314')
    const parsed = JSON.parse(json) as { saveVersion: number; state: { market: { tick: number } } }
    expect(parsed.saveVersion).toBe(26)
    expect(parsed.state.market.tick).toBe(795)
    const session = BridgeSession.fromSaveJson(json, 'p13b-s8-converted-true-v26')
    // Migrated by the bridge's own load path (importSaveJsonCurrent); "converted"
    // is true by construction here since saveVersion 26 !== 27 (bridge/session.ts),
    // exactly as tests/bridge-p13b-s2-labs.test.ts's own case 6 documents for V21.
    expect(session.gameState.market.tick).toBe(795)
    expect(session.gameState.hollywood!.receipts.some(r => (RIVAL_RESEARCH_RECEIPT_KINDS as readonly string[]).includes(r.kind))).toBe(false)
  })
})

describe('P13B-S8-T3 item 2: Industry page rival technology facts — laboratoryOperational publishes; the other four kinds do not; existing kinds unchanged', () => {
  it('a rival laboratoryOperational receipt yields exactly one activity per rival, in an existing group, headline verbatim, detail without counts (natural week 13: 4 rivals, 4 receipts)', () => {
    const session = new BridgeSession(WEEK13, 'p13b-s8-lab-operational-13')
    const h = WEEK13.hollywood!
    const receipts = h.receipts.filter(r => r.kind === 'laboratoryOperational')
    expect(receipts).toHaveLength(4) // precondition: genuinely 4 natural rival Laboratories, not invented
    const rows = activitiesOf(industryQuery(session, 'pulse')).filter(a => a.headline.endsWith('expands its research capacity'))
    expect(rows).toHaveLength(receipts.length) // RED: today this is 0 — no branch handles laboratoryOperational
    expect(new Set(rows.map(r => r.studioId)).size).toBe(4) // one distinct rival per row, no dedup collapse and no duplicate
    for (const receipt of receipts) {
      const studio = required(h.identities.find(s => s.studioId === receipt.studioId), 'no identity for this rival receipt')
      const row = required(rows.find(r => r.studioId === receipt.studioId), `no activity row for rival ${receipt.studioId}`)
      expect(row.headline).toBe(`${studio.name} expands its research capacity`) // verbatim from the parent's own dispatch text
      expect(EXISTING_GROUPS).toContain(row.group)
      expect(row.detail).not.toMatch(/\d/) // "without seat, Lab or instrument counts"
      expect(row.eventId).toBe(receipt.eventId) // the uniform base={eventId:r.eventId,...} pattern every existing branch already uses
      expect(row.week).toBe(receipt.week)
    }
  })

  it('laboratoryCommitted, instrumentOperational, researchSeatAssigned and researchCompleted receipts yield NO activity row (regression guard — already true today; natural week 277, all four kinds genuinely present and within the 13-week pulse window)', () => {
    const session = new BridgeSession(WEEK277, 'p13b-s8-no-row-277')
    const h = WEEK277.hollywood!
    const week = WEEK277.market.tick
    const windowFrom = Math.max(0, week - 12)
    const noRowKinds: readonly string[] = ['laboratoryCommitted', 'instrumentOperational', 'researchSeatAssigned', 'researchCompleted']
    const targetReceipts = h.receipts.filter(r => noRowKinds.includes(r.kind) && r.week >= windowFrom)
    expect(targetReceipts.length).toBeGreaterThan(0) // precondition: genuinely present, within window, not vacuous
    expect(new Set(targetReceipts.map(r => r.kind))).toEqual(new Set(noRowKinds)) // all four kinds genuinely represented
    const rows = activitiesOf(industryQuery(session, 'pulse'))
    for (const receipt of targetReceipts) expect(rows.some(a => a.eventId === receipt.eventId)).toBe(false)
  })

  it('technologyAdopted rows are unchanged (regression guard; natural week 288, rival r01\'s real synchronized-sound adoption)', () => {
    const session = new BridgeSession(WEEK288, 'p13b-s8-technology-adopted-unchanged')
    const h = WEEK288.hollywood!
    const receipt = required(h.receipts.find(r => r.kind === 'technologyAdopted'), 'no natural technologyAdopted receipt on the week-288 fixture')
    const studio = required(h.identities.find(s => s.studioId === receipt.studioId), 'no identity for the adopting rival')
    const rows = activitiesOf(industryQuery(session, 'pulse'))
    const row = required(rows.find(a => a.eventId === receipt.eventId), 'no activity row for the natural technologyAdopted receipt')
    expect(row.headline).toBe(`${studio.name} now has operational synchronized sound`)
  })

  it('the S7 campaign-clock announcement row is unchanged (regression guard; heavy natural rival research present, week 288, both technologies pre-announcement)', () => {
    const session = new BridgeSession(WEEK288, 'p13b-s8-announcement-unchanged')
    const rows = activitiesOf(industryQuery(session, 'pulse')).filter(a => a.eventId.startsWith('technology-announcement-'))
    expect(rows).toHaveLength(0) // lighting's own researchableWeek (780) has not arrived; sound's window is degenerate/already-open
  })
})

describe('P13B-S8-T3 item 3: rival finance exposed only through existing public standings', () => {
  it('researchCapacity, technologyRestoration and technologyRefund never appear on the industry pulse page, the Laboratory page, or session.snapshot() (week 13: researchCapacity is genuinely nonzero from real rival Lab admission)', () => {
    const session = new BridgeSession(WEEK13, 'p13b-s8-money-leak-13')
    const rival = required(WEEK13.hollywood!.businesses[0], 'no rival business')
    const totalCapacity = rival.account.periods.reduce((sum, p) => sum + p.movements.researchCapacity, 0)
    expect(totalCapacity).not.toBe(0) // precondition: the fact under test is genuinely nonzero, not vacuous
    const pulseJson = JSON.stringify(industryQuery(session, 'pulse'))
    const labJson = JSON.stringify(labPage(session, anyLabBuildingId(WEEK13), nextRequestId('money-leak-lab')))
    const snapshotJson = JSON.stringify(session.snapshot())
    for (const kind of RIVAL_RESEARCH_MONEY_KINDS.filter(k => k !== 'researchSpend')) { // researchSpend collides with a pre-existing player kind — see header
      for (const json of [pulseJson, labJson, snapshotJson]) expect(json).not.toContain('"' + kind + '"')
    }
  })

  it('the player\'s own finance researchSpend channel reads $0 in every window even while the rival\'s real researchSpend is nonzero elsewhere in the same state (week 288)', () => {
    const rival = required(WEEK288.hollywood!.businesses.find(b => b.studioId === RIVAL_1.studioId), 'no rival business')
    const totalRivalSpend = rival.account.periods.reduce((sum, p) => sum + p.movements.researchSpend, 0)
    expect(totalRivalSpend).not.toBe(0) // precondition: the rival genuinely spent on research, not vacuous
    const session = new BridgeSession(WEEK288, 'p13b-s8-researchspend-attribution')
    const snap = session.snapshot() as unknown as { snapshot: { finance: { finance: { history: { windows: { costSeries: { kind: string; periodAmount: number; points: { amount: number }[] }[] }[] } } } } }
    const rows = snap.snapshot.finance.finance.history.windows.flatMap(w => w.costSeries).filter(r => r.kind === 'researchSpend')
    expect(rows.length).toBeGreaterThan(0) // the player's own (pre-existing, unrelated) researchSpend channel does exist
    for (const row of rows) {
      expect(row.periodAmount).toBe(0)
      for (const point of row.points) expect(point.amount).toBe(0)
    }
  })
})

describe('P13B-S8-T3 item 4: the player\'s Laboratory page is unchanged by rival research', () => {
  it('forecast[] is byte-identical across two independently-seeded natural campaigns at the same week (genuinely different rival identities and rival research facts)', () => {
    const sessionA = new BridgeSession(WEEK13, 'p13b-s8-forecast-a')
    const sessionB = new BridgeSession(DIVERGENT_WEEK13, 'p13b-s8-forecast-b')
    expect(WEEK13.hollywood!.businesses.map(b => b.studioId)).not.toEqual(DIVERGENT_WEEK13.hollywood!.businesses.map(b => b.studioId)) // precondition: genuinely different rivals
    const pageA = labPage(sessionA, anyLabBuildingId(WEEK13), nextRequestId('forecast-a'))
    const pageB = labPage(sessionB, anyLabBuildingId(DIVERGENT_WEEK13), nextRequestId('forecast-b'))
    expect(pageA.forecast).toEqual(pageB.forecast)
    expect(JSON.stringify(pageA.forecast)).toBe(JSON.stringify(pageB.forecast))
  })

  it('no row for a rival project, no rival seat, no rival studioId anywhere in the JSON (week 288: heavy real rival research including a completed technology adoption)', () => {
    const session = new BridgeSession(WEEK288, 'p13b-s8-lab-page-isolation')
    const page = labPage(session, anyLabBuildingId(WEEK288), nextRequestId('lab-isolation'))
    expect(JSON.stringify(page)).not.toContain(RIVAL_1.studioId)
    expect(page.projects).toEqual([]) // the player never started research on this fixture
    expect(page.adoptions).toEqual([])
    expect(page.seatLabel).toContain('Seats assigned: 0 of 4')
  })
})

describe('P13B-S8-T3 item 5: the bridge accepts a real S8 state on snapshot(); history projections ignore the five kinds', () => {
  it('session.snapshot() does not throw on a naturally-reached state carrying all five S8 receipt kinds and genuinely nonzero researchCapacity/researchSpend (week 288)', () => {
    const h = WEEK288.hollywood!
    for (const kind of RIVAL_RESEARCH_RECEIPT_KINDS) expect(h.receipts.some(r => r.kind === kind)).toBe(true) // precondition: all five genuinely present
    // technologyRestoration/technologyRefund remain naturally $0 in every natural campaign: the S8
    // refinement records "no rival cancellation POLICY is authored (OPEN)" — a rival never cancels,
    // so no natural fixture can exercise these two nonzero without inventing an unauthored behaviour.
    // Named, not silently skipped.
    const session = new BridgeSession(WEEK288, 'p13b-s8-snapshot-accepts')
    expect(() => session.snapshot()).not.toThrow()
  })

  it('a non-player studio\'s own History view ignores the four no-row kinds (no row, no crash; week 288)', () => {
    const session = new BridgeSession(WEEK288, 'p13b-s8-history-ignores')
    const h = WEEK288.hollywood!
    const noRowKinds: readonly string[] = ['laboratoryCommitted', 'instrumentOperational', 'researchSeatAssigned', 'researchCompleted']
    const targetReceipts = h.receipts.filter(r => noRowKinds.includes(r.kind) && r.studioId === RIVAL_1.studioId)
    expect(targetReceipts.length).toBeGreaterThan(0)
    let response: Record<string, unknown> = {}
    expect(() => { response = industryQuery(session, 'history', { targetId: RIVAL_1.studioId, period: 'all' }) }).not.toThrow()
    const rows = activitiesOf(response)
    expect(rows.length).toBeGreaterThan(0) // sanity: this rival's History is non-empty (real releases/employment exist)
    for (const receipt of targetReceipts) expect(rows.some(a => a.eventId === receipt.eventId)).toBe(false)
  })

  it('the player\'s own History (historyProjection, a disjoint root from IndustryReceipt) is untouched: session.snapshot() does not throw and its history section mentions none of the five kinds (week 288)', () => {
    const session = new BridgeSession(WEEK288, 'p13b-s8-player-history-untouched')
    let snap: unknown
    expect(() => { snap = session.snapshot() }).not.toThrow()
    const historyJson = JSON.stringify((snap as { snapshot: { history: unknown } }).snapshot.history)
    for (const kind of RIVAL_RESEARCH_RECEIPT_KINDS) expect(historyJson).not.toContain('"' + kind + '"')
  })
})

describe('P13B-S8-T3 item 6: live-version save round-trip, Save As, genuine V26 fixture loads', () => {
  it('a live-version save round-trips through the bridge byte-identically (week 288, real S8 facts: all five receipt kinds, nonzero researchCapacity/researchSpend)', () => {
    // MEASURED (this run): comparing the raw in-memory GameState before/after
    // via `toEqual` is a FALSE negative unrelated to S8 — some floating-point
    // fields on this natural campaign hold `-0` (e.g. `genreExpBefore`,
    // `perceived` skill deltas), and JSON has no negative-zero literal, so
    // `JSON.stringify(-0) === "0"`; `Object.is`-sensitive deep equality then
    // reads that as a genuine difference after any JSON round trip, on ANY
    // save/load, not just this one. "Byte-identically" is tested the literal
    // way instead: two canonical save JSON STRINGS (where -0 already
    // normalizes identically on both sides) must match exactly.
    const session = new BridgeSession(WEEK288, 'p13b-s8-roundtrip')
    const savedBefore = session.save(control(session, nextCommandId('save-before')))
    expect(savedBefore.accepted).toBe(true)
    if (!savedBefore.accepted) throw new Error(`save refused: ${JSON.stringify(savedBefore)}`)
    expect((JSON.parse(savedBefore.saveJson) as { saveVersion: number }).saveVersion).toBe(37)
    const loaded = session.load(control(session, nextCommandId('load')))
    expect(loaded.accepted).toBe(true)
    if (!loaded.accepted) throw new Error(`load refused: ${JSON.stringify(loaded)}`)
    const savedAfter = session.save(control(session, nextCommandId('save-after')))
    expect(savedAfter.accepted).toBe(true)
    if (!savedAfter.accepted) throw new Error(`re-save refused: ${JSON.stringify(savedAfter)}`)
    expect(savedAfter.saveJson).toBe(savedBefore.saveJson)
  })

  it('a Save As world keeps the same rival receipts and publishes identical industry rows (week 13, natural rival Lab facts)', async () => {
    class Store implements BridgeCheckpointStore {
      checkpointPath = '/synthetic/p13b-s8-bridge-rivals.json'
      closed = false
      constructor(public contents: string | null = null) {}
      async read() { return this.contents }
      async writeAtomic(text: string) { this.contents = text }
      async close() { this.closed = true }
    }
    function options(store: Store, source: GameState) {
      return {
        store, fatal: (e: unknown) => { throw e }, campaigns: { durable: true, regime: 'endowed' as const },
        createFreshSession: () => new BridgeSession(source),
      }
    }
    async function request(runtime: BridgeRuntimeCoordinator, operation: CampaignRequest['operation'], extra: Partial<CampaignRequest> = {}): Promise<CampaignRequest> {
      const library = (await runtime.campaignLibrary())!
      return {
        protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'campaign', commandId: randomUUID(), sessionId: library.sessionId,
        expectedStateRevision: library.stateRevision, expectedCatalogueRevision: library.catalogueRevision, expectedActiveCampaignId: library.activeCampaignId,
        operation, campaignId: null, label: null, overwriteCampaignId: null, confirmDestructive: false, unsavedDisposition: 'requireClean', ...extra,
      }
    }
    function library(store: Store): CampaignLibrary {
      return decodeCampaignStorage(JSON.parse(store.contents!), DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS.maxCheckpointBytes, 32) as CampaignLibrary
    }
    const store = new Store()
    const runtime = await createBridgeRuntimeCoordinator(options(store, WEEK13))
    try {
      const savedOriginal = await runtime.campaign(await request(runtime, 'saveAs', { label: 'Original' }))
      expect(savedOriginal.accepted).toBe(true)
      expect(library(store).records).toHaveLength(1) // the library listing: exactly one slot after the first Save As
      const originalId = library(store).activeCampaignId!
      expect(originalId).toBe(library(store).records[0]!.id)
      const originalRows = activitiesOf(await runtime.read(s => industryQuery(s as unknown as BridgeSession, 'pulse')))

      const savedCopy = await runtime.campaign(await request(runtime, 'saveAs', { label: 'Active copy' }))
      expect(savedCopy.accepted).toBe(true)
      // The library listing now carries BOTH slots, each keeping its own copy of the
      // same rival-research-bearing world; the new slot becomes active.
      expect(library(store).records).toHaveLength(2)
      expect(library(store).records.map(r => r.label).sort()).toEqual(['Active copy', 'Original'])
      expect(library(store).activeCampaignId).not.toBe(originalId)
      const copyRows = activitiesOf(await runtime.read(s => industryQuery(s as unknown as BridgeSession, 'pulse')))

      expect(copyRows).toEqual(originalRows)
      expect(originalRows.length).toBeGreaterThan(0)
    } finally {
      await runtime.close()
    }
  }, 30_000)

  it('the three genuine V26 fixtures load through the bridge (sha256 verified) and their industry pulse page carries no S8-kind text anywhere (V26 predates S8; converted true by construction as item 1 documents)', () => {
    const fixtures = [
      { file: './fixtures/p13b/legacy-v26-sound-mid-deployment-309.json.gz', sha256: '11ef05be4131d3d3c4a19484f31e79cb50fa1936868f96ace7d0d18ea86e2d72', week: 309 },
      { file: './fixtures/p13b/legacy-v26-lighting-cancelled-793.json.gz', sha256: '0b74f4d89d41bd2c596c51e43758b0915bd8daec8cde05476e9aabe954592ce3', week: 793 },
      { file: './fixtures/p13b/legacy-v26-lighting-restored-795.json.gz', sha256: 'f48da034f2bd64c35b23361ab12726b2ba0a8f02a7d8dc59caa84055f92f5314', week: 795 },
    ]
    for (const fixture of fixtures) {
      const json = load(fixture.file)
      assertSha256(json, fixture.sha256)
      const parsed = JSON.parse(json) as { saveVersion: number; state: { market: { tick: number } } }
      expect(parsed.saveVersion).toBe(26)
      expect(parsed.state.market.tick).toBe(fixture.week)
      const session = BridgeSession.fromSaveJson(json, `p13b-s8-legacy-v26-${String(fixture.week)}`)
      expect(session.gameState.market.tick).toBe(fixture.week)
      expect(session.gameState.hollywood!.receipts.some(r => (RIVAL_RESEARCH_RECEIPT_KINDS as readonly string[]).includes(r.kind))).toBe(false)
      let pulseJson = ''
      expect(() => { pulseJson = JSON.stringify(industryQuery(session, 'pulse')) }).not.toThrow()
      for (const kind of RIVAL_RESEARCH_RECEIPT_KINDS) expect(pulseJson).not.toContain('"' + kind + '"')
      for (const kind of RIVAL_RESEARCH_MONEY_KINDS.filter(k => k !== 'researchSpend')) expect(pulseJson).not.toContain('"' + kind + '"')
    }
  })
})
