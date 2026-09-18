// ── P13B-S7-T3 test 5: bridge projection 40 (forecast/replacement/announcement) ──
//
// Requirement-derived from "S7 — Forecast/replacement disclosure" in
// docs/engineering/playability-launch-review/plans/P13B-HEADLESS-PLAN.md, its
// "Refinement (coordinator, 2026-09-17 ≈21:45 ... supersedes the provisional
// bullets where they differ)" block's "Bridge (projection next..." paragraph,
// the "Audit (contract-auditor...)" paragraph and "### S7 tasks" (Bridge
// bullet, test 5), plus the parent's exact wire-pin dispatch message (this
// file's own numbered items 1–7 below, quoted verbatim in each `describe`).
// Engine landed (S7-T2, `8720202`/`18ab734`): `src/core/technologyDisclosure.ts`
// (`technologyForecast`, `technologyAnnouncements`, `replacementDescriptor`),
// `publicWindow`/`replacementLabel` on `src/core/technologyCatalogue.ts`. Bridge
// is still projection 39 (measured, this file's own item-1 case): no
// `forecast` member on the Laboratory page, no lighting `wait-*`/`purchase-*`
// rows (only sound's own two P13A-era rows exist,
// `bridge/laboratory.ts` ≈322–325), no `replacementLabel` anywhere on the
// wire, no derived technology-announcement row on the Industry page, and
// `StudioIndustryActivity.studioId` is not yet nullable
// (`bridge/schema/industry-schema.ts`). RED-by-design: every assertion below
// proven failing, never by a missing-module import (`technologyDisclosure.ts`
// itself already exists and typechecks — S7-T2 landed it), matching the
// pattern `tests/bridge-p13b-s6-cancellation.test.ts`'s own header states for
// its own already-landed engine increment.
//
// Harness idioms: `tests/bridge-p13b-s6-cancellation.test.ts`
// (`labResponse`/`labPage`/`dispatchRow`/`anyLabBuildingId`/`required`/stale-
// revision pattern, copied near-verbatim); `tests/bridge-p12-industry.test.ts`
// (`session.industry(query(...))`, `parseWireValue` round-trip); the Save As
// idiom is `tests/bridge-p13b-s3-save-as.test.ts`'s own
// `Store`/`options`/`request`/`library` helpers (duplicated here, not
// shared — this repo's own documented "duplicated-not-shared by design"
// convention, `tests/p13b-s5-quotes.test.ts`).
//
// MEASURED FACTS this file's premises rest on (probed 2026-09-17/18 against
// the already-landed engine, never invented):
//   * `waitForTechnology` carries NO `commercialAccessRefusal` gate at all
//     (`src/core/technology.ts` ~347–357: only `purchaseTechnology` calls
//     `commercialAccessRefusal`). A `wait-lighting-control-01` row's dry run
//     therefore succeeds (`enabled: true`) at ANY week, including long before
//     936 — confirmed by direct `applyActions` probe at week 793. Only
//     `purchase-lighting-control-01` is refused before 936, with the engine's
//     own sentence (probed at week 793: `"Commercial purchase opens 1938 ·
//     Week 1."`, i.e. `campaignDate(936).label` embedded verbatim) and
//     succeeds at 936, charging exactly `entry.accessCost` (probed: paid
//     100000, matching the lighting catalogue entry's `accessCost: 100_000`).
//   * A generated studio carries two founding soundstages
//     (`facility-soundstage-07`/`-12`, `src/core/tuning.ts` ~1145–1148) and a
//     founding Post building (`capability: 'post'`), so an uncommitted
//     `adopt-<technologyId>-<stage>...` row is reachable without any new
//     placement.
//
// CONFLICT NAMED AND RESOLVED BY RULING (coordinator, plan authority,
// 2026-09-18, recorded in the plan under S7-T3): item 2 below pins
// "`campaignDate(936).label` appears NOWHERE in the Laboratory page JSON at
// week 793" (a public-milestone-only disclosure invariant, the whole point
// of S7). Item 4's dispatch text pins "`purchase-lighting-control-01` ...
// commercialAccessRefusal before 936 → enabled: false with THE ENGINE'S
// SENTENCE as disabledReason" — and the engine's own `commercialAccessRefusal`
// sentence, measured above, embeds `campaignDate(936).label` verbatim,
// UNCONDITIONALLY (P13A/S5-era code, unchanged by S7, with no announce-week
// awareness). A naive generalisation of sound's own "published from week 0"
// row would leak 936 at week 793, before it is public — this file surfaced
// that as an open conflict pre-ruling. THE RULING: `wait-<technologyId>` /
// `purchase-<technologyId>` rows exist on the Laboratory page ONLY while
// `technologyForecast(entry, week).kind === 'exact'`. Sound's window is
// degenerate (`kind` is `'exact'` at every week), so its two rows are
// unchanged at every week (the regression pin below stands unmodified).
// Lighting's rows are ABSENT before 884 (nothing public to wait for or buy —
// satisfying item 2's leak-check BY ABSENCE, not by a genericised sentence),
// PRESENT from 884 on: `wait-lighting-control-01` enabled (the engine's
// `waitForTechnology` has no refusal gate — the MEASURED fact above still
// holds), `purchase-lighting-control-01` disabled with the engine's own
// `commercialAccessRefusal` sentence (which MAY name 936 from 884 on — the
// date is public then, so no leak) until 936, enabled at/after 936 with
// `accessCost`. RULING CHANGE (coordinator, 2026-09-18, "the plan mandates no
// hiding"; committed `c08d368`): the "absent once access is held" clause was
// the brief's own gloss, not the plan's, and is WITHDRAWN — once lighting
// access is held both rows are PUBLISHED and DISABLED with the engine's own
// sentence, exactly as sound has always read: `waitForTechnology` throws
// `'This studio already has lighting-control-01 access.'` (`technology.ts`
// ~350) and `commercialAccessRefusal` returns the same text (`technology.ts`
// ~135) for the purchase; both reach the row's `disabledReason` through the
// same `add()` dry run every other refused row already uses, with
// `intent: null` (a disabled row is never dispatchable). This file's item 4
// tests that exact law: absence at 793, presence (wait enabled / purchase
// disabled-with-sentence) at 884, the same at 900, the full commit flow at
// 936, and both rows published-but-disabled with the access-held sentence
// once access is held.
//
// INTERPRETATIONS NAMED:
//   1. `replacementLabel` is modelled as a new OPTIONAL member on the shared
//      `StudioLaboratoryAction` row shape (present on `purchase-*` and
//      `adopt-*` rows, absent elsewhere) and as a new member on
//      `StudioAdoptionRow` (`adoptions[]`) — the plan's own three-surface
//      list ("purchase row and ... `adopt-*` rows ... and ... `adoptions[]`
//      rows"), read as a plain top-level string field, not nested in `quote`
//      (no existing quote container is named for it, unlike S6's
//      `StudioCancellationQuote`).
//   2. The `StudioTechnologyForecast[]` wire row field names are pinned
//      exactly as the dispatch text gives them:
//      `{technologyId,name,kind,windowFromLabel,windowToLabel,exactLabel,
//      announcedWeek,basis}`, with `windowFromLabel`/`windowToLabel` null
//      once `kind` is `'exact'` (the dispatch text's own "window labels
//      null" for the 884/900 exact cases) — symmetric with `exactLabel`/
//      `announcedWeek` being null while `kind` is `'window'`.
//   3. WITHDRAWN (coordinator ruling, 2026-09-18): "absent once the studio
//      holds lighting access" was this file's own prior interpretation, not
//      the plan's — the plan mandates no hiding. Once access is held, both
//      `wait-lighting-control-01` and `purchase-lighting-control-01` are
//      PUBLISHED and DISABLED with the engine's own access-held sentence
//      (`'This studio already has lighting-control-01 access.'`,
//      `technology.ts` ~135/~350), `intent: null`, exactly as sound's own
//      two rows have always read once sound access is held. The week-936
//      commit-flow case below asserts this directly.
//
// RUN NOTE: this file's `describe` blocks advance real campaigns to weeks up
// to 936 (via `advanceTo`/`tick`), matching the cost profile the already-
// landed `tests/p13b-s7-independence.test.ts` accepts (30s timeouts on its
// own week-900 cases); per-`describe` state is built once via module-level
// `beforeAll`-free plain construction (shared across `it`s in the same block
// through closured `const`s) to avoid re-advancing the same weeks twice.

import { createHash, randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { commitPlacement } from '../src/core/placement.js'
import { commercialAccessRefusal } from '../src/core/technology.js'
import { newFinancePeriod } from '../src/core/hollywood.js'
import { exportCurrentState } from '../src/core/save.js'
import { considerRivalSoundPurchase } from '../src/core/technologyRival.js'
import { technologyEntry, TECHNOLOGY_CATALOGUE } from '../src/core/technologyCatalogue.js'
import { campaignDate } from '../src/core/calendar.js'
import { advanceTo, p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import { s6LightingReady, s6SoundReady } from '../src/harness/p13b/s6-fixtures.js'
import type { GameState } from '../src/core/types.js'
import { BridgeSession } from '../bridge/session.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { BRIDGE_SCHEMA, PROJECTION_VERSION } from '../bridge/schema/bridge-schema.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'
import { createBridgeRuntimeCoordinator, type BridgeRuntimeCoordinator, type BridgeRuntimeReadView } from '../bridge/runtime/runtime-coordinator.ts'
import type { BridgeCheckpointStore } from '../bridge/runtime/checkpoint-store.ts'
import { decodeCampaignStorage } from '../bridge/runtime/campaign-storage-codec.ts'
import type { CampaignRequest } from '../bridge/schema/bridge-schema.ts'
import type { CampaignLibrary } from '../bridge/runtime/campaign-library.ts'
import { DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS } from '../bridge/runtime-checkpoint.ts'

const SOUND_SENTENCE = 'Synchronized dialogue replaces the silent production method on the fitted stage and Post chain.'
const LIGHTING_SENTENCE = 'Controlled lighting replaces conventional setup on the fitted stage: two setup units instead of four.'
const BASIS = 'Public milestone facts from the catalogue; not a rival schedule.'
const SEED = 'p13b-s7-bridge-01'
const RIVAL_SEED = 'p13b-s7-independence-01' // proven reliable: tests/p13b-s7-independence.test.ts's own seed

let requestCounter = 0
function nextRequestId(prefix: string): string { return `${prefix}-req-${String(requestCounter++)}` }
function required<T>(value: T | null | undefined, message: string): T {
  if (value === null || value === undefined) throw new Error(message)
  return value
}
const money = (value: number) => '$' + value.toLocaleString('en-US', { maximumFractionDigits: 0 })

// ── Wire shapes (NONE of `forecast`/`replacementLabel` exist at projection 39) ──

type WireForecastRow = {
  technologyId: string; name: string; kind: 'window' | 'exact'
  windowFromLabel: string | null; windowToLabel: string | null
  exactLabel: string | null; announcedWeek: number | null; basis: string
}
type WireAction = {
  id: string; label: string; detail: string; enabled: boolean; disabledReason: string | null
  intent: { intentId: string; kind: string } | null
  quote?: Record<string, unknown> | null
  replacementLabel?: string
}
type WireAdoptionRow = {
  technologyId: string; route: string; committedWeek: number; operationalWeek: number | null
  components: unknown[]; equipmentAssetId: string | null; postFacilityId: string | null
  cancelledWeek?: number | null; replacementLabel?: string
}
type WireLaboratoryPage = {
  buildingId: string; actions: WireAction[]; adoptions?: WireAdoptionRow[]
  forecast?: WireForecastRow[]
}
type WireActivity = {
  eventId: string; week: number; dateLabel: string; group: string
  headline: string; detail: string; studioId: string | null; filmId: string | null; talentId: string | null
}

// ── Harness helpers (mirrors tests/bridge-p13b-s6-cancellation.test.ts) ─────

function labWorld(seed: string, week: number): GameState {
  const withLab = commitPlacement(p13aGeneratedStudio(seed), { blueprintId: 'research-laboratory', origin: { gx: 0, gy: 9 } })
  return advanceTo(withLab, week)
}
function anyLabBuildingId(state: GameState): string {
  const lab = required(state.placement.facilities.find(p => p.blueprintId === 'research-laboratory' && p.installation === undefined),
    'no installed Research Laboratory placement on this state')
  return `placed-${String(lab.id)}`
}
function labResponse(session: BridgeSession, buildingId: string, requestId: string, page = 0, pageSize = 50): { laboratory: WireLaboratoryPage; pageCount: number } {
  const response = session.industry({
    protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'industryQuery', view: 'laboratory',
    targetId: buildingId, page, pageSize, lane: 'audienceAwareness', period: 'all',
    requestId, sessionId: session.sessionId, expectedStateRevision: session.stateRevision,
  } as never) as unknown as Record<string, unknown>
  if (!('laboratory' in response) || response.laboratory === null) throw new Error(`laboratory view rejected for building "${buildingId}" (request ${requestId}): ${JSON.stringify(response).slice(0, 500)}`)
  return response as unknown as { laboratory: WireLaboratoryPage; pageCount: number }
}
function labPage(session: BridgeSession, buildingId: string, requestId: string): WireLaboratoryPage {
  const first = labResponse(session, buildingId, `${requestId}-p0`, 0)
  const actions = new Map(first.laboratory.actions.map(a => [a.id, a]))
  for (let page = 1; page < first.pageCount; page++) {
    for (const a of labResponse(session, buildingId, `${requestId}-p${String(page)}`, page).laboratory.actions) actions.set(a.id, a)
  }
  return { ...first.laboratory, actions: [...actions.values()] }
}
function dispatchRow(session: BridgeSession, actions: readonly WireAction[], rowId: string): void {
  const row = required(actions.find(a => a.id === rowId), `Row "${rowId}" is absent from ${JSON.stringify(actions.map(a => a.id))}.`)
  if (!row.enabled || !row.intent) throw new Error(`Row "${rowId}" is not enabled/available: ${row.disabledReason ?? 'no reason given'}`)
  const response = session.command({
    protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'submitIntent',
    commandId: `dispatch-${randomUUID()}`, sessionId: session.sessionId,
    expectedStateRevision: session.stateRevision, payload: { intentId: row.intent.intentId },
  })
  if (!response.accepted) throw new Error(`Row "${rowId}" was refused: ${JSON.stringify(response)}`)
}
function industryQuery(session: Pick<BridgeSession, 'sessionId' | 'stateRevision' | 'industry'> | BridgeRuntimeReadView, view: string, extra: Record<string, unknown> = {}): Record<string, unknown> {
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

/** Real rival commercial sound purchase, looped exactly as tests/p13a-rival-adoption.test.ts
 * and tests/p13b-s7-independence.test.ts's own `withRivalPurchase` do. Duplicated per this
 * repo's documented "duplicated-not-shared by design" convention. */
function withRivalPurchase(state: GameState): GameState {
  const hollywood = structuredClone(state.hollywood)!
  let result = state.technology
  for (const business of hollywood.businesses) {
    result = considerRivalSoundPurchase(state, hollywood, business)
    if (result !== state.technology) break
  }
  if (result === state.technology) throw new Error('bridge-p13b-s7-disclosure fixture: no rival business purchased sound technology at week 416')
  return { ...state, hollywood, technology: result }
}

// ── Genuine V26 fixture (tests/fixtures/p13b/PROVENANCE.md) ─────────────────

const load = (relative: string) => gunzipSync(readFileSync(new URL(relative, import.meta.url))).toString('utf8')
function assertSha256(json: string, expected: string) { expect(createHash('sha256').update(json).digest('hex')).toBe(expected) }

// ── Shared worlds (built once, reused across `it`s within each describe) ────
// One chained advance per seed (793 -> 884 -> 900 -> 936), matching
// tests/p13b-s7-independence.test.ts's own "advanceTo never rewinds" idiom.

const S793 = labWorld(SEED, 793) // lighting: windowed, unannounced (< 884)
const S884 = advanceTo(S793, 884) // lighting: exact, just announced
const S900 = advanceTo(S884, 900) // lighting: exact, announced, still pre-commercial (< 936)
const S936 = advanceTo(S900, 936) // lighting: exact, commercial access open

describe('P13B-S7-T3 item 1: projection version bump 39 -> 40; 42 after the P14A.1-T3 bump', () => {
  it('bumps PROJECTION_VERSION to 41 and its schema $id / x-project-studio.projectionVersion move with it', () => {
    expect(PROJECTION_VERSION).toBe(42)
    expect(BRIDGE_SCHEMA.$id).toContain('projection-42')
    expect(BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(42)
  })
})

describe('P13B-S7-T3 item 2: Laboratory forecast rows — windowed before 884 (no leak), exact at/after 884, sound exact throughout', () => {
  it('week 793 (windowed, unannounced): lighting forecast row is a window 884..988; campaignDate(936).label appears NOWHERE in the Laboratory page JSON', () => {
    const session = new BridgeSession(S793, 'p13b-s7-forecast-793')
    const buildingId = anyLabBuildingId(S793)
    const page = labPage(session, buildingId, nextRequestId('forecast-793'))
    expect(Object.hasOwn(page, 'forecast')).toBe(true) // RED: `forecast` is absent from the Laboratory page at projection 39
    const forecast = required(page.forecast, 'no forecast[] on the Laboratory page')
    expect(forecast).toHaveLength(TECHNOLOGY_CATALOGUE.length)
    const lighting = required(forecast.find(f => f.technologyId === 'lighting-control-01'), 'no lighting-control-01 forecast row')
    expect(lighting).toEqual({
      technologyId: 'lighting-control-01', name: 'Lighting control', kind: 'window',
      windowFromLabel: campaignDate(884).label, windowToLabel: campaignDate(988).label,
      exactLabel: null, announcedWeek: null, basis: BASIS,
    })
    // The whole-page leak-check (item 2's own literal text) — see header CONFLICT.
    const json = JSON.stringify(page)
    expect(json).not.toContain(campaignDate(936).label)
  })

  it('week 884 and week 900 (exact, announced): lighting forecast row publishes the exact 936 date, window labels null', () => {
    for (const state of [S884, S900]) {
      const session = new BridgeSession(state, `p13b-s7-forecast-${String(state.market.tick)}`)
      const buildingId = anyLabBuildingId(state)
      const page = labPage(session, buildingId, nextRequestId(`forecast-${String(state.market.tick)}`))
      const forecast = required(page.forecast, 'no forecast[] on the Laboratory page')
      const lighting = required(forecast.find(f => f.technologyId === 'lighting-control-01'), 'no lighting-control-01 forecast row')
      expect(lighting).toEqual({
        technologyId: 'lighting-control-01', name: 'Lighting control', kind: 'exact',
        windowFromLabel: null, windowToLabel: null,
        exactLabel: campaignDate(936).label, announcedWeek: 884, basis: BASIS,
      })
    }
  })

  it('sound forecast row is exact at every week (793, 884, 900) — never a window', () => {
    for (const state of [S793, S884, S900]) {
      const session = new BridgeSession(state, `p13b-s7-forecast-sound-${String(state.market.tick)}`)
      const buildingId = anyLabBuildingId(state)
      const page = labPage(session, buildingId, nextRequestId(`forecast-sound-${String(state.market.tick)}`))
      const forecast = required(page.forecast, 'no forecast[] on the Laboratory page')
      const sound = required(forecast.find(f => f.technologyId === 'synchronized-sound'), 'no synchronized-sound forecast row')
      expect(sound).toEqual({
        technologyId: 'synchronized-sound', name: 'Synchronized sound', kind: 'exact',
        windowFromLabel: null, windowToLabel: null,
        exactLabel: campaignDate(416).label, announcedWeek: 416, basis: BASIS,
      })
    }
  })
})

describe('P13B-S7-T3 item 3: replacementLabel on the purchase row, adopt-* rows and adoptions[] rows, for both technologies', () => {
  it('purchase-synchronized-sound and purchase-lighting-control-01 (week 900, pre-commercial) carry replacementLabel verbatim from the catalogue', () => {
    const soundSession = new BridgeSession(S793, 'p13b-s7-replacement-purchase-sound')
    const soundPage = labPage(soundSession, anyLabBuildingId(S793), nextRequestId('purchase-sound'))
    const purchaseSound = required(soundPage.actions.find(a => a.id === 'purchase-synchronized-sound'), 'no purchase-synchronized-sound row')
    expect(purchaseSound.replacementLabel).toBe(SOUND_SENTENCE)
    expect(purchaseSound.replacementLabel).toBe(technologyEntry('synchronized-sound').replacementLabel as unknown as string)

    const lightingSession = new BridgeSession(S900, 'p13b-s7-replacement-purchase-lighting')
    const lightingPage = labPage(lightingSession, anyLabBuildingId(S900), nextRequestId('purchase-lighting'))
    const purchaseLighting = required(lightingPage.actions.find(a => a.id === 'purchase-lighting-control-01'), 'no purchase-lighting-control-01 row')
    expect(purchaseLighting.replacementLabel).toBe(LIGHTING_SENTENCE)
    expect(purchaseLighting.replacementLabel).toBe(technologyEntry('lighting-control-01').replacementLabel as unknown as string)
  })

  it('an uncommitted adopt-synchronized-sound-* row and an uncommitted adopt-lighting-control-01-* row both carry replacementLabel verbatim', () => {
    const soundSession = new BridgeSession(S793, 'p13b-s7-replacement-adopt-sound')
    const soundPage = labPage(soundSession, anyLabBuildingId(S793), nextRequestId('adopt-sound'))
    const adoptSound = required(soundPage.actions.find(a => a.id.startsWith('adopt-synchronized-sound-')), 'no adopt-synchronized-sound-* row')
    expect(adoptSound.replacementLabel).toBe(SOUND_SENTENCE)

    // Lighting's adopt-* row only appears once access is held (bridge/laboratory.ts's own
    // `postInstallationId === null && !playerTechnologyAccess` gate, unchanged by S7) — commit
    // access first (core-level, not through the bridge; this is fixture setup, not the assertion).
    const withAccess = applyActions(S936, [{ kind: 'purchaseTechnology', technologyId: 'lighting-control-01' } as never])
    const lightingSession = new BridgeSession(withAccess, 'p13b-s7-replacement-adopt-lighting')
    const lightingPage = labPage(lightingSession, anyLabBuildingId(withAccess), nextRequestId('adopt-lighting'))
    const adoptLighting = required(lightingPage.actions.find(a => a.id.startsWith('adopt-lighting-control-01-')), 'no adopt-lighting-control-01-* row')
    expect(adoptLighting.replacementLabel).toBe(LIGHTING_SENTENCE)
  })

  it('committed adoptions[] rows for both technologies carry replacementLabel verbatim (s6SoundReady/s6LightingReady)', () => {
    const { state: soundState } = s6SoundReady()
    const soundSession = new BridgeSession(soundState, 'p13b-s7-replacement-adoptions-sound')
    const soundPage = labPage(soundSession, anyLabBuildingId(soundState), nextRequestId('adoptions-sound'))
    const soundRow = required(soundPage.adoptions?.find(a => a.technologyId === 'synchronized-sound'), 'no adoptions[] row for synchronized-sound')
    expect(soundRow.replacementLabel).toBe(SOUND_SENTENCE)

    const { state: lightingState } = s6LightingReady()
    const lightingSession = new BridgeSession(lightingState, 'p13b-s7-replacement-adoptions-lighting')
    const lightingPage = labPage(lightingSession, anyLabBuildingId(lightingState), nextRequestId('adoptions-lighting'))
    const lightingRow = required(lightingPage.adoptions?.find(a => a.technologyId === 'lighting-control-01'), 'no adoptions[] row for lighting-control-01')
    expect(lightingRow.replacementLabel).toBe(LIGHTING_SENTENCE)
  })
})

describe('P13B-S7-T3 item 4: generalised wait-<id>/purchase-<id> rows — sound unchanged, lighting per the MEASURED engine law (see header)', () => {
  it('wait-synchronized-sound / purchase-synchronized-sound: ids, labels, detail text and enabled law are byte-identical to today (regression pin)', () => {
    const session = new BridgeSession(S793, 'p13b-s7-wait-sound-unchanged')
    const page = labPage(session, anyLabBuildingId(S793), nextRequestId('wait-sound'))
    const sound = technologyEntry('synchronized-sound')
    const wait = required(page.actions.find(a => a.id === 'wait-synchronized-sound'), 'no wait-synchronized-sound row')
    expect(wait.label).toBe('Wait for commercial sound')
    // MEASURED (this run): `add()`'s own dry run appends a " $X charged now.
    // Cash after this decision: $Y." suffix to every enabled row's detail
    // (`bridge/laboratory.ts`'s `add()`) — a dynamic, cash-dependent tail this
    // file correctly does not pin verbatim; `toContain` pins the static
    // template unchanged, which is what "unchanged... today's values" means.
    expect(wait.detail).toContain(`Record deliberate waiting for ${campaignDate(sound.commercialWeek).label}. No access payment or capability is granted. Existing research and employment continue unless you pause or cancel them separately.`)
    expect(wait.enabled).toBe(true) // week 793 > commercialWeek 416, no prior access/wait chosen: unrefused, unchanged from today
    const purchase = required(page.actions.find(a => a.id === 'purchase-synchronized-sound'), 'no purchase-synchronized-sound row')
    expect(purchase.label).toBe('Purchase synchronized-sound access')
    expect(purchase.detail).toContain(`Commercial access costs ${money(sound.accessCost)} from ${campaignDate(sound.commercialWeek).label}. This buys knowledge access; select and fund an exact stage, capture and Post installation separately before filming with sound.`)
    expect(purchase.enabled).toBe(true) // week 793 > commercialWeek 416: unrefused, unchanged from today
  })

  it('both wait-lighting-control-01 and purchase-lighting-control-01 are ABSENT at week 793 (before the 884 public announcement — RULING: rows exist only while technologyForecast(entry,week).kind === \'exact\')', () => {
    const session = new BridgeSession(S793, 'p13b-s7-lighting-rows-absent-793')
    const page = labPage(session, anyLabBuildingId(S793), nextRequestId('lighting-rows-793'))
    expect(page.actions.some(a => a.id === 'wait-lighting-control-01')).toBe(false)
    expect(page.actions.some(a => a.id === 'purchase-lighting-control-01')).toBe(false)
  })

  it('at week 884 (just announced): wait-lighting-control-01 present and enabled; purchase-lighting-control-01 present and disabled with the engine\'s own commercialAccessRefusal sentence (RULING: the date may be named from 884 on — it is public then)', () => {
    const own = required(S884.hollywood?.playerStudioId, 'no player studio')
    const expectedRefusal = required(commercialAccessRefusal(S884, own, 'lighting-control-01'), 'commercialAccessRefusal returned null at week 884 (< 936) — fixture premise violated')
    const session = new BridgeSession(S884, 'p13b-s7-lighting-rows-884')
    const page = labPage(session, anyLabBuildingId(S884), nextRequestId('lighting-rows-884'))
    const wait = required(page.actions.find(a => a.id === 'wait-lighting-control-01'), 'no wait-lighting-control-01 row at week 884')
    expect(wait.enabled).toBe(true)
    expect(wait.disabledReason).toBeNull()
    const purchase = required(page.actions.find(a => a.id === 'purchase-lighting-control-01'), 'no purchase-lighting-control-01 row at week 884')
    expect(purchase.enabled).toBe(false)
    expect(purchase.disabledReason).toBe(expectedRefusal)
  })

  it('purchase-lighting-control-01 at week 900 (announced, pre-commercial, "before 936"): disabled with the engine\'s own commercialAccessRefusal sentence', () => {
    const own = required(S900.hollywood?.playerStudioId, 'no player studio')
    const expectedRefusal = required(commercialAccessRefusal(S900, own, 'lighting-control-01'), 'commercialAccessRefusal returned null at week 900 (< 936) — fixture premise violated')
    const session = new BridgeSession(S900, 'p13b-s7-purchase-lighting-900')
    const page = labPage(session, anyLabBuildingId(S900), nextRequestId('purchase-lighting-900'))
    const purchase = required(page.actions.find(a => a.id === 'purchase-lighting-control-01'), 'no purchase-lighting-control-01 row')
    expect(purchase.enabled).toBe(false)
    expect(purchase.disabledReason).toBe(expectedRefusal)
  })

  it('purchase-lighting-control-01 at week 936 (commercial open): enabled, accessCost in its own text; commit charges accessCost once, advances stateRevision, refuses the same intent at the old revision, and both rows publish disabled with the engine\'s access-held sentence once access is held', () => {
    const entry = technologyEntry('lighting-control-01')
    const buildingId = anyLabBuildingId(S936)
    const session = new BridgeSession(S936, 'p13b-s7-purchase-lighting-936')
    const before = labPage(session, buildingId, nextRequestId('purchase-936-before'))
    const purchase = required(before.actions.find(a => a.id === 'purchase-lighting-control-01'), 'no purchase-lighting-control-01 row')
    expect(purchase.enabled).toBe(true)
    expect(purchase.disabledReason).toBeNull()
    expect(purchase.detail).toContain(money(entry.accessCost))
    expect(purchase.replacementLabel).toBe(LIGHTING_SENTENCE)

    const staleRevision = session.stateRevision
    const staleIntentId = required(purchase.intent, 'purchase-lighting-control-01 has no intent').intentId
    dispatchRow(session, before.actions, 'purchase-lighting-control-01')
    expect(session.stateRevision).not.toBe(staleRevision)

    const accessRows = session.gameState.ledger.filter(e => e.kind === 'technologyAdoption' &&
      (e as unknown as { note: string }).note === `technology-access:${required(session.gameState.hollywood?.playerStudioId, 'no player studio')}:lighting-control-01`)
    expect(accessRows).toHaveLength(1) // charged exactly once
    expect(accessRows[0]!.amount).toBe(-entry.accessCost)
    expect(-accessRows[0]!.amount).toBe(100_000) // the engine's own measured figure (see header)

    const staleResponse = session.command({
      protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'submitIntent',
      commandId: `stale-purchase-lighting-${randomUUID()}`, sessionId: session.sessionId,
      expectedStateRevision: staleRevision, payload: { intentId: staleIntentId },
    })
    expect(staleResponse).toMatchObject({ accepted: false, reasonCode: 'STALE_REVISION' })

    // WITHDRAWN INTERPRETATION 3 (see header, coordinator ruling 2026-09-18,
    // `c08d368`): both rows stay PUBLISHED once access is held, disabled with
    // the engine's own access-held sentence — `waitForTechnology` throws it
    // (`technology.ts` ~350) and `commercialAccessRefusal` returns it
    // (`technology.ts` ~135), exactly as sound's own two rows have always read.
    const after = labPage(session, buildingId, nextRequestId('purchase-936-after'))
    const ACCESS_HELD_SENTENCE = 'This studio already has lighting-control-01 access.'
    const purchaseAfter = required(after.actions.find(a => a.id === 'purchase-lighting-control-01'), 'no purchase-lighting-control-01 row once access is held')
    expect(purchaseAfter.enabled).toBe(false)
    expect(purchaseAfter.intent).toBeNull()
    expect(purchaseAfter.disabledReason).toBe(ACCESS_HELD_SENTENCE)
    const waitAfter = required(after.actions.find(a => a.id === 'wait-lighting-control-01'), 'no wait-lighting-control-01 row once access is held')
    expect(waitAfter.enabled).toBe(false)
    expect(waitAfter.intent).toBeNull()
    expect(waitAfter.disabledReason).toBe(ACCESS_HELD_SENTENCE)
  })
})

describe('P13B-S7-T3 item 5: Industry announcement row — derived, nullable studioId, excluded from per-studio History, absent for sound, Save As identical', () => {
  it('at week 884: exactly one announcements-group activity, eventId technology-announcement-lighting-control-01, studioId null, headline/detail as specified', () => {
    const session = new BridgeSession(S884, 'p13b-s7-announcement-884')
    const response = industryQuery(session, 'pulse')
    const rows = activitiesOf(response).filter(a => a.group === 'announcements' && a.eventId.startsWith('technology-announcement-'))
    expect(rows).toHaveLength(1)
    const row = rows[0]!
    expect(row.eventId).toBe('technology-announcement-lighting-control-01')
    expect(row.week).toBe(884)
    expect(row.dateLabel).toBe(campaignDate(884).label)
    expect(row.studioId).toBeNull()
    expect(row.headline).toContain('Lighting control')
    expect(row.detail).toContain(campaignDate(936).label)
  })

  it('absent at week 793 (before the public announcement)', () => {
    const session = new BridgeSession(S793, 'p13b-s7-announcement-793')
    const rows = activitiesOf(industryQuery(session, 'pulse')).filter(a => a.eventId.startsWith('technology-announcement-'))
    expect(rows).toHaveLength(0)
  })

  it('never a sound announcement, spot-checked at weeks 793/884/900 (degenerate publicWindow, per the landed engine law)', () => {
    for (const state of [S793, S884, S900]) {
      const session = new BridgeSession(state, `p13b-s7-no-sound-announcement-${String(state.market.tick)}`)
      const rows = activitiesOf(industryQuery(session, 'pulse'))
      expect(rows.some(a => a.eventId === 'technology-announcement-synchronized-sound')).toBe(false)
    }
  })

  it('excluded from a non-player studio\'s own History view by construction (studioId: null never matches a real studioId)', () => {
    const session = new BridgeSession(S900, 'p13b-s7-announcement-history-exclusion')
    const rival = required(S900.hollywood?.identities.find(s => s.role !== 'player' && s.enteredWeek !== null), 'no non-player studio identity on this state')
    const response = industryQuery(session, 'history', { targetId: rival.studioId, period: 'all' })
    const rows = activitiesOf(response)
    expect(rows.some(a => a.eventId.startsWith('technology-announcement-'))).toBe(false)
    // Sanity: this studio's own History view is non-empty (it has at least its studioEntered row),
    // so the absence above is a genuine filter outcome, not an empty page.
    expect(rows.length).toBeGreaterThan(0)
  })

  it('StudioIndustryActivity.studioId is nullable on the wire schema, while an existing receipt-based row keeps its real studioId', () => {
    const session = new BridgeSession(S900, 'p13b-s7-activity-schema')
    const rival = required(S900.hollywood?.identities.find(s => s.role !== 'player' && s.enteredWeek !== null), 'no non-player studio identity on this state')
    const response = industryQuery(session, 'history', { targetId: rival.studioId, period: 'all' })
    const real = required(activitiesOf(response)[0], 'no activity row to use as a schema base')
    expect(typeof real.studioId).toBe('string') // existing receipt rows keep their real studioId
    expect(() => parseWireValue(BRIDGE_SCHEMA.$defs.StudioIndustryActivity, { ...real, studioId: null })).not.toThrow() // RED: studioId is not yet nullable
  })

  it('identical in a Save As world: two independently-saved-as campaign slots of the same week-884 state publish byte-identical announcement rows', async () => {
    class Store implements BridgeCheckpointStore {
      checkpointPath = '/synthetic/p13b-s7-disclosure.json'
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
    const runtime = await createBridgeRuntimeCoordinator(options(store, S884))
    try {
      const savedOriginal = await runtime.campaign(await request(runtime, 'saveAs', { label: 'Original' }))
      expect(savedOriginal.accepted).toBe(true)
      const originalId = library(store).activeCampaignId!

      const savedCopy = await runtime.campaign(await request(runtime, 'saveAs', { label: 'Active copy' }))
      expect(savedCopy.accepted).toBe(true)
      const copyRows = activitiesOf(await runtime.read(s => industryQuery(s, 'pulse'))).filter(a => a.eventId.startsWith('technology-announcement-'))

      const loaded = await runtime.campaign(await request(runtime, 'load', { campaignId: originalId }))
      expect(loaded.accepted).toBe(true)
      const originalRows = activitiesOf(await runtime.read(s => industryQuery(s, 'pulse'))).filter(a => a.eventId.startsWith('technology-announcement-'))

      expect(originalRows).toEqual(copyRows)
      expect(originalRows).toHaveLength(1)
      expect(originalRows[0]!.eventId).toBe('technology-announcement-lighting-control-01')
    } finally {
      await runtime.close()
    }
  }, 30_000)
})

describe('P13B-S7-T3 item 6: rival-independence on the wire — identical forecast/announcement rows across states differing only in rival facts (PARTIAL until S8, per the engine\'s own test 2 scope)', () => {
  const rbase = advanceTo(labWorld(RIVAL_SEED, 12), 416)
  const rvariant = withRivalPurchase(rbase)

  it('precondition: the rival-purchase variant genuinely differs from the base world in rival facts only, at the identical week', () => {
    expect(rvariant.market.tick).toBe(rbase.market.tick)
    expect(rvariant).not.toEqual(rbase)
    expect(rvariant.operations).toEqual(rbase.operations)
    expect(rvariant.placement).toEqual(rbase.placement)
  })

  it('Laboratory forecast rows (both technologies) are byte-identical across the two rival-divergent states at week 416', () => {
    const baseSession = new BridgeSession(rbase, 'p13b-s7-rival-base-416')
    const variantSession = new BridgeSession(rvariant, 'p13b-s7-rival-variant-416')
    const buildingId = anyLabBuildingId(rbase)
    const baseForecast = required(labPage(baseSession, buildingId, nextRequestId('rival-base-416')).forecast, 'no forecast[] (base)')
    const variantForecast = required(labPage(variantSession, buildingId, nextRequestId('rival-variant-416')).forecast, 'no forecast[] (variant)')
    expect(variantForecast).toEqual(baseForecast)
    expect(JSON.stringify(variantForecast)).toBe(JSON.stringify(baseForecast))
  })

  it('industry announcement rows are byte-identical across the two rival-divergent states, both at week 416 (empty) and advanced independently to week 900 (one lighting row)', () => {
    const baseSession416 = new BridgeSession(rbase, 'p13b-s7-rival-base-ann-416')
    const variantSession416 = new BridgeSession(rvariant, 'p13b-s7-rival-variant-ann-416')
    const baseRows416 = activitiesOf(industryQuery(baseSession416, 'pulse')).filter(a => a.eventId.startsWith('technology-announcement-'))
    const variantRows416 = activitiesOf(industryQuery(variantSession416, 'pulse')).filter(a => a.eventId.startsWith('technology-announcement-'))
    expect(variantRows416).toEqual(baseRows416)
    expect(baseRows416).toEqual([])

    // MEASURED (matches tests/p13b-s7-independence.test.ts's own "CORRECTION",
    // confirmed by directly running that file): `considerRivalSoundPurchase`
    // admits at most one rival adoption per campaign and `advanceHollywoodWeek`
    // runs it on every tick, so the unmodified base/rivalVariant pair
    // RE-CONVERGES to a JSON-identical state from week 417 on — a plain
    // `not.toEqual` at week 900 on the unforged pair is vacuous. Apply the
    // SAME validator-proven fix the engine test uses: one additional
    // rival-only fact (a leading no-op `RivalFinancePeriod` at the rival
    // business's own entry week, `newFinancePeriod`) that survives every
    // tick unreconciled, keeping the pair genuinely divergent through 900.
    const target = rvariant.hollywood!.businesses[0]!
    const leadingWeek = target.account.periods[0]!.fromWeek
    const hollywood = {
      ...rvariant.hollywood!,
      businesses: rvariant.hollywood!.businesses.map(b => b.studioId === target.studioId
        ? { ...b, account: { ...b.account, periods: [newFinancePeriod(leadingWeek, b.account.openingBalance), ...b.account.periods] } }
        : b),
    }
    const rvariantForged: GameState = { ...rvariant, hollywood }
    expect(() => exportCurrentState(rvariantForged)).not.toThrow() // validator-accepted, not merely unchecked

    const rbase900 = advanceTo(rbase, 900)
    const rvariant900 = advanceTo(rvariantForged, 900)
    expect(rvariant900).not.toEqual(rbase900) // still genuinely divergent — not vacuous
    expect(rvariant900.operations).toEqual(rbase900.operations)
    expect(rvariant900.placement).toEqual(rbase900.placement)
    const baseSession900 = new BridgeSession(rbase900, 'p13b-s7-rival-base-ann-900')
    const variantSession900 = new BridgeSession(rvariant900, 'p13b-s7-rival-variant-ann-900')
    const baseRows900 = activitiesOf(industryQuery(baseSession900, 'pulse')).filter(a => a.eventId.startsWith('technology-announcement-'))
    const variantRows900 = activitiesOf(industryQuery(variantSession900, 'pulse')).filter(a => a.eventId.startsWith('technology-announcement-'))
    expect(variantRows900).toEqual(baseRows900)
    expect(baseRows900).toHaveLength(1)
    expect(baseRows900[0]!.eventId).toBe('technology-announcement-lighting-control-01')
  }, 30_000)
})

describe('P13B-S7-T3 item 7: genuine V26 fixture loads through the bridge and publishes the windowed lighting forecast at week 795', () => {
  const FIXTURE = {
    file: './fixtures/p13b/legacy-v26-lighting-restored-795.json.gz',
    sha256: 'f48da034f2bd64c35b23361ab12726b2ba0a8f02a7d8dc59caa84055f92f5314',
    week: 795,
  }
  it('sha256 matches provenance; BridgeSession.fromSaveJson loads it; the Laboratory page publishes a windowed lighting forecast (884..988), never 936', () => {
    const json = load(FIXTURE.file)
    assertSha256(json, FIXTURE.sha256)
    const parsed = JSON.parse(json) as { saveVersion: number; state: { market: { tick: number } } }
    expect(parsed.saveVersion).toBe(26)
    expect(parsed.state.market.tick).toBe(FIXTURE.week)

    const session = BridgeSession.fromSaveJson(json, 'p13b-s7-legacy-v26-795')
    expect(session.gameState.market.tick).toBe(795)
    const buildingId = anyLabBuildingId(session.gameState)
    const page = labPage(session, buildingId, nextRequestId('legacy-795'))
    const forecast = required(page.forecast, 'no forecast[] on the Laboratory page (RED: absent at projection 39)')
    const lighting = required(forecast.find(f => f.technologyId === 'lighting-control-01'), 'no lighting-control-01 forecast row')
    expect(lighting.kind).toBe('window')
    expect(lighting.windowFromLabel).toBe(campaignDate(884).label)
    expect(lighting.windowToLabel).toBe(campaignDate(988).label)
    expect(lighting.exactLabel).toBeNull()
    expect(JSON.stringify(page)).not.toContain(campaignDate(936).label)
  })
})
