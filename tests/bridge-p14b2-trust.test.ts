// P14B.2 T1: requirement-first read-model contract, projection45 -> 46, Save29 unchanged.
// Authority: P14-HEADLESS-PLAN.md B2 expansion + 2026-09-19 producer reconciliation;
// companion §§4.4/4.5/R5; evidence/p14b1-20260919-t4/13-b2-test-preparation.md.
// RED must resolve this ABSENT module before any test body executes. Both imported
// helpers are CALLED by readModels() in every group; no fake missing named export.
// Their (state, person, viewer, week?) signature is an implementation proposal.
// Copy/tuning hypotheses pinned here: U+00B7/year line, no-record caption, eight-week
// reminder window, and the specified kept/broken headlines. No new gameplay law.
// Native/UI/Owner acceptance, waiver/void producers and the separate D3 test are not here.

import { describe, expect, it } from 'vitest'
import { trustBlockFor, promiseRowsForPerson } from '../bridge/trust.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { AVAILABLE_INTENT_KINDS, BRIDGE_SCHEMA, PROJECTION_VERSION } from '../bridge/schema/bridge-schema.ts'
import { parseWireValue, schemaDefinition } from '../bridge/schema/runtime.ts'
import type { IndustryPage, IndustryQuery } from '../bridge/schema/industry-schema.ts'
import { peopleProjection, marketCaseProjection } from '../bridge/people.ts'
import { marketPage } from '../bridge/market.ts'
import { industryPage } from '../bridge/industry.ts'
import { BridgeSession } from '../bridge/session.ts'
import { campaignDate } from '../src/core/calendar.js'
import { trustDescriptor, trustDrivers, type TrustDriver, type TrustLabel } from '../src/core/promises.js'
import { caseForTalent, currentProposals, UNKNOWN } from '../src/core/talentMarket.js'
import { LIVE_SAVE_VERSION, makeSave, validateSaveV32 } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import type { GameState, ProfessionalPromise, PromiseFamily, PromiseOutcome } from '../src/core/types.js'
import { advanceTo, clone, historyFixture, p13aGeneratedStudio, player, poachingFixture, promiseFor,
  retentionFixture, rivalFixture } from './helpers/p14b2-fixtures.js'

type TrustRow = TrustDriver & { dateLabel: string }
type TrustBlock = { label: TrustLabel; scope: 'person' | 'studio'; drivers: TrustRow[]; line: string }
type PromiseRow = { promiseId: string; family: PromiseFamily; count: number; seatClass: string | null; windowStartWeek: number;
  dueWeekExclusive: number; contractId: string; outcome: PromiseOutcome | null; outcomeWeek: number | null; outcomeCause: string | null }
type Profile = ReturnType<typeof peopleProjection>['profiles'][number] & { trust: TrustBlock; promises: PromiseRow[] }
type AttentionRow = { cause: string; talentId: string; reason: string }
type Activity = IndustryPage['activities'][number] & { outcomeKind?: 'promiseKept' | 'promiseBroken' }
type StudioRow = IndustryPage['studios'][number] & { trustLabel: TrustLabel }
const SESSION_ID = 'p14b2-trust-read-contract'

function profileFor(state: GameState, talentId: string): Profile {
  const profile = peopleProjection(state).profiles.find((p) => p.talentId === talentId)
  expect(profile, 'fixture person must have a real profile').toBeDefined()
  return profile as Profile
}
function readModels(state: GameState, talentId: string, viewer = player(state)) {
  const trust: TrustBlock = trustBlockFor(state, talentId, viewer, state.market.tick)
  const promises: PromiseRow[] = promiseRowsForPerson(state, talentId, viewer, state.market.tick)
  return { trust, promises }
}
function expectedHistory(state: GameState, talentId: string, viewer = player(state)): PromiseRow[] {
  return state.promises.filter((p) => p.issuerStudioId === viewer && p.beneficiaryPersonId === talentId && p.contractId !== null)
    .slice().reverse().map((p) => ({ promiseId: p.promiseId, family: p.family, count: p.predicate.count,
      // P14B.4 (projection 47): the nullable class rides every history row; the
      // stored predicate shape alone selects it (a count-only root reads null).
      seatClass: 'kind' in p.predicate ? p.predicate.seatClass : null,
      windowStartWeek: p.windowStartWeek, dueWeekExclusive: p.dueWeekExclusive, contractId: p.contractId!,
      outcome: p.outcome, outcomeWeek: p.outcomeWeek, outcomeCause: p.outcomeCause }))
}
const attention = (state: GameState): AttentionRow[] => marketPage(state, { view: 'market', targetId: null }).attention
function query(view: 'studios' | 'pulse' | 'market', page = 0, targetId: string | null = null): IndustryQuery {
  return { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: SESSION_ID,
    requestId: `b2-${view}-${page}`, expectedStateRevision: 0, type: 'industryQuery', view,
    targetId, page, pageSize: 50, lane: 'recent', period: 'all' }
}
function pageFor(state: GameState, view: 'studios' | 'pulse' | 'market', page = 0, targetId: string | null = null): IndustryPage {
  return industryPage(state, SESSION_ID, 0, query(view, page, targetId))
}
function allActivities(state: GameState): Activity[] {
  const first = pageFor(state, 'pulse')
  const rows: Activity[] = [...first.activities]
  // Exhaust the producer's bounded pages, not only the first50 rows.
  expect(first.pageCount).toBeLessThan(1000)
  for (let page = 1; page < first.pageCount; page++) rows.push(...pageFor(state, 'pulse', page).activities)
  expect(rows).toHaveLength(first.totalRows)
  return rows
}
function allStudios(state: GameState): StudioRow[] {
  const first = pageFor(state, 'studios')
  const rows = [...first.studios] as StudioRow[]
  expect(first.pageCount).toBeLessThan(1000)
  for (let page = 1; page < first.pageCount; page++) rows.push(...pageFor(state, 'studios', page).studios as StudioRow[])
  expect(rows).toHaveLength(first.totalRows)
  return rows
}
function expectedTrustRows(drivers: readonly TrustDriver[]): TrustRow[] {
  return drivers.map((d) => ({ ...d, dateLabel: campaignDate(d.week).label }))
}
function expectTrustLine(block: TrustBlock): void {
  expect(block.line).toBe(block.drivers.length === 0 ? 'No record yet'
    : block.drivers.map((d) => `${d.reason} · ${campaignDate(d.week).year}`).join(' · '))
}
function assertNoPrivatePromiseTerms(value: unknown): void {
  if (Array.isArray(value)) { value.forEach(assertNoPrivatePromiseTerms); return }
  if (value === null || typeof value !== 'object') return
  const row = value as Record<string, unknown>
  // Count1 can lawfully occur in ranks/pages/credits. Refuse the structural term
  // fields, not every matching numeral anywhere in an unrelated DTO.
  for (const key of ['family', 'predicate', 'windowStartWeek', 'dueWeekExclusive', 'classification', 'feasibilityReceipt']) {
    expect(row).not.toHaveProperty(key)
  }
  Object.values(row).forEach(assertNoPrivatePromiseTerms)
}
function outcomeRows(state: GameState, promise: ProfessionalPromise): Activity[] {
  return allActivities(state).filter((row) => row.eventId === promise.outcomeEventId)
}
function assertOutcomeRow(state: GameState, promise: ProfessionalPromise): void {
  const receipt = state.talentMarket.receipts.find((r) => r.eventId === promise.outcomeEventId)!
  expect(receipt).toMatchObject({ kind: 'promiseOutcome', studioId: promise.issuerStudioId,
    talentId: promise.beneficiaryPersonId, week: promise.outcomeWeek })
  const rows = outcomeRows(state, promise)
  expect(rows).toHaveLength(1)
  const studioName = state.hollywood!.identities.find((s) => s.studioId === promise.issuerStudioId)!.name
  const personName = state.talent.find((p) => p.id === promise.beneficiaryPersonId)!.name
  expect(rows[0]).toMatchObject({ eventId: receipt.eventId, week: receipt.week, dateLabel: campaignDate(receipt.week).label,
    group: 'people', studioId: promise.issuerStudioId, talentId: promise.beneficiaryPersonId,
    outcomeKind: promise.outcome === 'SATISFIED' ? 'promiseKept' : 'promiseBroken',
    headline: `${studioName} ${promise.outcome === 'SATISFIED' ? 'kept' : 'broke'} its promise to ${personName}`,
    detail: receipt.reasons.join(' ') })
  assertNoPrivatePromiseTerms(rows[0])
  expect(rows[0]).not.toHaveProperty('count')
  expect(JSON.stringify(rows[0])).not.toContain('APPEARANCE_COUNT')
}
function publicSurfaces(state: GameState, talentId: string) {
  // State digests intentionally change when private authoritative facts change;
  // compare the public DTO payloads, never falsify that envelope identity.
  return { profile: profileFor(state, talentId), market: marketPage(state, { view: 'market', targetId: talentId }),
    attention: attention(state), pulse: allActivities(state), studios: allStudios(state) }
}

describe('P14B.2 group1 — projection46, unchanged Save29/intents, closed wire shapes', () => {
  it('pins the exact version, old-five-plus-two attention enum and unchanged intent vocabulary', () => {
    const state = p13aGeneratedStudio()
    readModels(state, state.talent[0]!.id)
    expect(PROJECTION_VERSION).toBe(49)
    expect(LIVE_SAVE_VERSION).toBe(32)
    expect(BRIDGE_SCHEMA.$id).toBe(`urn:project-studio:bridge:protocol-${PROTOCOL_VERSION}:projection-49`)
    expect(BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(49)
    const attentionSchema = schemaDefinition('StudioMarketAttentionRowSnapshot') as unknown as { properties: { cause: { enum: string[] } } }
    expect(attentionSchema.properties.cause.enum).toEqual(['decisionWeekNear', 'newCompetingProposal', 'termsRevised',
      'settlementCompleted', 'proposalWouldFail', 'promiseDue', 'promiseOutcome'])
    expect(AVAILABLE_INTENT_KINDS).toEqual(['signFoundingContract', 'foundStudio', 'commissionScreenplay', 'advanceWeek',
      'acceptScreenplay', 'requestRewrite', 'startAuditions', 'acknowledgeAuditions', 'greenlightPicture', 'resolveProductionBlocker',
      'startConstruction', 'commissionOriginalScreenplay', 'signContract', 'commitPictureToRelease', 'placeFacility', 'commissionSet',
      'renewContract', 'releaseTalent', 'researchAction', 'physicalPlanAction', 'installationAction', 'adoptTechnology',
      'productionSetupAction', 'cancellationAction', 'marketProposalAction'])
  })
  it('validates actual session profile, Market, Pulse and studio DTOs without stripping the new members', () => {
    const f = retentionFixture()
    const models = readModels(f.outcomes, f.keptId)
    const session = new BridgeSession(f.outcomes, SESSION_ID)
    const snapshot = session.snapshot()
    expect(() => parseWireValue(schemaDefinition('StudioBridgeSnapshotResponse'), snapshot)).not.toThrow()
    const profile = snapshot.snapshot.talent.talent.profiles.find((p) => p.talentId === f.keptId) as Profile
    expect(profile.trust).toEqual(models.trust)
    expect(profile.promises).toEqual(models.promises)
    for (const view of ['market', 'pulse', 'studios'] as const) {
      const response = session.industry(query(view, 0, view === 'market' ? f.keptId : null))
      expect(() => parseWireValue(schemaDefinition('StudioIndustryResponse'), response)).not.toThrow()
    }
  }, 60_000)
})

describe('P14B.2 group2 — evidence-backed Profile trust and top-three text', () => {
  it('reads a real kept promise as Reliable, retaining the real ran-to-end driver', () => {
    const f = retentionFixture()
    const { trust, promises } = readModels(f.kept, f.keptId)
    const promise = promiseFor(f.kept, f.keptId)
    expect(trust.label).toBe('Reliable')
    expect(trust.scope).toBe('person')
    expect(trust.drivers.filter((d) => d.kind === 'promiseKept')).toEqual([{ kind: 'promiseKept', week: promise.outcomeWeek!,
      dateLabel: campaignDate(promise.outcomeWeek!).label, positive: true, reason: 'kept a promise' }])
    expect(trust.drivers.some((d) => d.kind === 'ranToEnd')).toBe(true)
    expect(trust.drivers.every((d) => d.positive)).toBe(true)
    expect(profileFor(f.kept, f.keptId)).toMatchObject({ trust, promises })
    expectTrustLine(trust)
  })
  it('reads the real broken outcome and early termination without replacing their causes', () => {
    const f = retentionFixture()
    const { trust, promises } = readModels(f.outcomes, f.brokenId)
    const promise = promiseFor(f.outcomes, f.brokenId)
    expect(trust.drivers).toContainEqual({ kind: 'promiseBroken', week: promise.outcomeWeek!,
      dateLabel: campaignDate(promise.outcomeWeek!).label, positive: false, reason: 'broke a promise' })
    expect(trust.drivers.some((d) => d.kind === 'terminatedEarly' && !d.positive)).toBe(true)
    expect(trust.label).not.toBe('Reliable')
    expect(profileFor(f.outcomes, f.brokenId)).toMatchObject({ trust, promises })
    expectTrustLine(trust)
  })
  it('uses studio fallback with exactly the latest three of five real drivers, and is pure', () => {
    const f = retentionFixture()
    const state = f.outcomes
    expect(trustDrivers(state, f.directorId, player(state), state.market.tick)).toEqual([])
    const all = trustDrivers(state, null, player(state), state.market.tick)
    expect(all).toHaveLength(5)
    const before = JSON.stringify(state)
    const { trust, promises } = readModels(state, f.directorId)
    expect(trust.scope).toBe('studio')
    expect(trust.drivers).toEqual(expectedTrustRows(all.slice(0, 3)))
    expect(trust.drivers).toHaveLength(3)
    expect(trust.drivers.map((d) => d.week)).toEqual([...trust.drivers.map((d) => d.week)].sort((a, b) => b - a))
    expect(trust.label).toBe('Mixed record')
    expect(profileFor(state, f.directorId)).toMatchObject({ trust, promises })
    expectTrustLine(trust)
    expect(readModels(state, f.directorId)).toEqual({ trust, promises })
    expect(JSON.stringify(state)).toBe(before)
  })
  it('shows a fresh no-record caption without inventing history or a fourth trust label', () => {
    const state = p13aGeneratedStudio('p14b2-no-record')
    const talentId = state.talent[0]!.id
    const result = readModels(state, talentId)
    expect(result).toEqual({ trust: { label: 'Mixed record', scope: 'studio', drivers: [], line: 'No record yet' }, promises: [] })
    expect(profileFor(state, talentId)).toMatchObject(result)
  })
})

describe('P14B.2 group3 — one bound-only newest-first history DTO on both carriers', () => {
  it('shows two real contracts newest-first, with contract identity, open/outcome fields and exact causes', () => {
    const f = historyFixture()
    const { promises } = readModels(f.second, f.talentId)
    expect(promises).toEqual(expectedHistory(f.second, f.talentId))
    expect(promises).toHaveLength(2)
    expect(promises[0]!.windowStartWeek).toBeGreaterThan(promises[1]!.windowStartWeek)
    expect(promises[0]!.outcome).toBeNull()
    expect(promises[1]!.outcome).toBe('SATISFIED')
    expect(new Set(promises.map((p) => p.contractId)).size).toBe(2)
    expect(promises[1]!.outcomeCause).toBe(promiseFor(retentionFixture().outcomes, f.talentId).outcomeCause)
    expect(profileFor(f.second, f.talentId).promises).toEqual(promises)
    expect(marketCaseProjection(f.second, f.talentId, player(f.second))!.promiseHistory).toEqual(promises)
    // Reserved wire values stay accepted; this is a DTO shape check, not an
    // engine producer or claimed historical waiver/void outcome.
    for (const outcome of ['WAIVED', 'VOIDED']) {
      expect(() => parseWireValue(schemaDefinition('StudioMarketPromiseHistoryRow'), { ...promises[1], outcome })).not.toThrow()
    }
  }, 60_000)
  it('never promotes an attached/withdrawn unbound draft into history', () => {
    const f = historyFixture()
    const { promises } = readModels(f.withdrawn, f.talentId)
    expect(f.withdrawn.promises.find((p) => p.promiseId === f.withdrawnId)!.contractId).toBeNull()
    expect(currentProposals(f.withdrawn, f.talentId).some((p) => p.issuerStudioId === player(f.withdrawn))).toBe(false)
    expect(promises).toEqual(expectedHistory(f.withdrawn, f.talentId))
    expect(promises).toHaveLength(1)
    expect(promises.some((p) => p.promiseId === f.withdrawnId)).toBe(false)
  })
  it('does not publish another studio’s real bound history as the player’s own terms', () => {
    const f = rivalFixture()
    const result = readModels(f.terminal, f.promise.beneficiaryPersonId)
    expect(f.promise.contractId).not.toBeNull()
    expect(result.promises).toEqual([])
    expect(profileFor(f.terminal, f.promise.beneficiaryPersonId).promises).toEqual([])
    const theirs = readModels(f.terminal, f.promise.beneficiaryPersonId, f.promise.issuerStudioId)
    expect(theirs.promises).toContainEqual(expectedHistory(f.terminal, f.promise.beneficiaryPersonId, f.promise.issuerStudioId)
      .find((p) => p.promiseId === f.promise.promiseId))
  }, 60_000)
})

describe('P14B.2 group4 — Pulse joins exact outcome receipts once', () => {
  it('publishes both real same-week kept/broken receipts with exact identity and verbatim engine reason', () => {
    const f = retentionFixture()
    readModels(f.outcomes, f.keptId)
    const kept = promiseFor(f.outcomes, f.keptId), broken = promiseFor(f.outcomes, f.brokenId)
    expect(kept.outcomeWeek).toBe(broken.outcomeWeek)
    expect(kept.outcomeEventId).not.toBe(broken.outcomeEventId)
    assertOutcomeRow(f.outcomes, kept)
    assertOutcomeRow(f.outcomes, broken)
    const receipts = f.outcomes.talentMarket.receipts.filter((r) => r.kind === 'promiseOutcome')
    const activities = allActivities(f.outcomes).filter((r) => r.outcomeKind !== undefined)
    expect(activities.map((a) => a.eventId).sort()).toEqual(receipts.map((r) => r.eventId).sort())
    // Read-only array permutation: identities/outcomes/receipts are unchanged.
    // A positional zip cannot accidentally satisfy the exact receipt join.
    const permuted = { ...f.outcomes, promises: [...f.outcomes.promises].reverse() }
    expect(allActivities(permuted)).toEqual(allActivities(f.outcomes))
  })
  it('keeps one row for each receipt after the actual next tick, never re-emitting the event', () => {
    const f = retentionFixture()
    const next = tick(f.outcomes)
    readModels(next, f.keptId)
    expect(next.market.tick).toBe(f.outcomes.market.tick + 1)
    // This deliberately crosses the F1 real wrap boundary; no save bypass.
    expect(() => validateSaveV32(JSON.parse(JSON.stringify(makeSave(next))))).not.toThrow()
    for (const talentId of [f.keptId, f.brokenId]) {
      const promise = promiseFor(f.outcomes, talentId)
      expect(next.talentMarket.receipts.filter((r) => r.eventId === promise.outcomeEventId)).toHaveLength(1)
      expect(outcomeRows(next, promise)).toEqual(outcomeRows(f.outcomes, promise))
    }
  })
})

describe('P14B.2 group5 — independent promise attention after cases close', () => {
  it('raises due at minus8 but not minus9 for an actual player poaching winner with no proposals', () => {
    const f = poachingFixture()
    readModels(f.due, f.talentId)
    expect(caseForTalent(f.bound, f.talentId)!.subjectStudioId).toBe(f.incumbentId)
    expect(f.incumbentId).not.toBe(player(f.bound))
    expect(caseForTalent(f.bound, f.talentId)!.status).toBe('settled')
    expect(currentProposals(f.due, f.talentId)).toEqual([])
    const promise = promiseFor(f.due, f.talentId)
    expect(promise.contractId).not.toBeNull()
    expect(promise.outcome).toBeNull()
    expect(promise.progress).toBe(0)
    expect(promise.dueWeekExclusive - f.beforeDue.market.tick).toBe(9)
    expect(attention(f.beforeDue).filter((r) => r.talentId === f.talentId && r.cause === 'promiseDue')).toEqual([])
    const rows = attention(f.due).filter((r) => r.talentId === f.talentId && r.cause === 'promiseDue')
    expect(rows).toHaveLength(1)
    const name = f.due.talent.find((p) => p.id === f.talentId)!.name
    expect(rows[0]!.reason).toBe(`Promise to ${name} due Week ${promise.dueWeekExclusive} — filming has not begun`)
    expect(marketCaseProjection(f.due, f.talentId, player(f.due))!.attentionRows).toContainEqual(rows[0])
  }, 60_000)
  it('raises the poaching winner’s actual outcome only in its recorded week, once per cause/person', () => {
    const f = poachingFixture()
    readModels(f.outcome, f.talentId)
    const promise = promiseFor(f.outcome, f.talentId)
    const name = f.outcome.talent.find((p) => p.id === f.talentId)!.name
    const rows = attention(f.outcome).filter((r) => r.talentId === f.talentId && r.cause === 'promiseOutcome')
    expect(rows).toEqual([{ cause: 'promiseOutcome', talentId: f.talentId, reason: `Promise to ${name} broken — ${promise.outcomeCause}` }])
    expect(attention(f.outcome).filter((r) => r.talentId === f.talentId && r.cause === 'promiseDue')).toEqual([])
    expect(attention(tick(f.outcome)).filter((r) => r.talentId === f.talentId && r.cause === 'promiseOutcome')).toEqual([])
    const all = attention(f.outcome)
    expect(new Set(all.map((r) => `${r.cause}:${r.talentId}`)).size).toBe(all.length)
  })
  it('shows kept and broken attention with own causes, removes due after a real take, then clears both outcomes', () => {
    const f = retentionFixture()
    readModels(f.outcomes, f.keptId)
    const rows = attention(f.outcomes).filter((r) => r.cause === 'promiseOutcome')
    expect(rows).toHaveLength(2)
    for (const id of [f.keptId, f.brokenId]) {
      const promise = promiseFor(f.outcomes, id)
      const name = f.outcomes.talent.find((p) => p.id === id)!.name
      expect(rows).toContainEqual({ cause: 'promiseOutcome', talentId: id,
        reason: `Promise to ${name} ${promise.outcome === 'SATISFIED' ? 'kept' : 'broken'} — ${promise.outcomeCause}` })
    }
    const next = tick(f.outcomes)
    expect(attention(next).filter((r) => [f.keptId, f.brokenId].includes(r.talentId) && ['promiseDue', 'promiseOutcome'].includes(r.cause))).toEqual([])
    const inOriginalReminderWindow = advanceTo(next, promiseFor(f.outcomes, f.keptId).dueWeekExclusive - 8)
    expect(attention(inOriginalReminderWindow).filter((r) => r.talentId === f.keptId && r.cause === 'promiseDue')).toEqual([])
  })
  it('does not require any case entry to retain a real promise reminder (explicit read-only case-carrier probe)', () => {
    const f = poachingFixture()
    // Deliberate read-only carrier perturbation, NOT a saved campaign/history claim.
    // Keep the actual winning employment/promise/take history and all receipts.
    const noCases = { ...f.due, talentMarket: { ...f.due.talentMarket, cases: [], proposals: [] } }
    const result = readModels(noCases, f.talentId)
    expect(profileFor(noCases, f.talentId).marketCase).toBeNull()
    expect(result.promises).toEqual(expectedHistory(f.due, f.talentId))
    expect(attention(noCases).filter((r) => r.cause === 'promiseDue' && r.talentId === f.talentId))
      .toEqual(attention(f.due).filter((r) => r.cause === 'promiseDue' && r.talentId === f.talentId))
    expect(attention(noCases).some((r) => r.cause === 'promiseDue' && r.talentId === f.talentId)).toBe(true)
  })
  it('ignores real withdrawn unbound drafts near due and never interrupts for rival-issued promises', () => {
    const h = historyFixture()
    const draft = h.withdrawn.promises.find((p) => p.promiseId === h.withdrawnId)!
    const near = advanceTo(h.withdrawn, draft.dueWeekExclusive - 8)
    readModels(near, h.talentId)
    expect(near.promises.find((p) => p.promiseId === draft.promiseId)!.contractId).toBeNull()
    expect(attention(near).filter((r) => r.talentId === h.talentId && r.cause === 'promiseDue')).toEqual([])
    const rival = rivalFixture()
    readModels(rival.terminal, rival.promise.beneficiaryPersonId)
    expect(attention(rival.terminal).filter((r) => ['promiseDue', 'promiseOutcome'].includes(r.cause))).toEqual([])
  }, 60_000)
})

describe('P14B.2 group6 — the workspace has nonempty prior promise history', () => {
  it('matches the Profile’s complete rows during the next real open case', () => {
    const f = historyFixture()
    const { promises } = readModels(f.open, f.talentId)
    expect(caseForTalent(f.open, f.talentId)!.status).toBe('proposals_open')
    expect(promises).toHaveLength(1)
    expect(promises[0]!.outcome).toBe('SATISFIED')
    const page = marketPage(f.open, { view: 'market', targetId: f.talentId })
    expect(page.selected).not.toBeNull()
    expect((page.selected!.history as unknown as { promises: PromiseRow[] }).promises).toEqual(promises)
    expect(profileFor(f.open, f.talentId).promises).toEqual(promises)
    expect(page.selected!.marketCase.promiseHistory).toEqual(promises)
  })
})

describe('P14B.2 group7 — rival terms stay private and rival outcomes stay public', () => {
  it('keeps open rival proposal terms literal UNKNOWN across Profile and Market', () => {
    const f = rivalFixture()
    const proposal = f.open.talentMarket.proposals.find((p) => p.issuerStudioId !== player(f.open) && p.promises.length > 0)!
    readModels(f.open, proposal.talentId)
    const profile = profileFor(f.open, proposal.talentId)
    const rows = profile.marketCase!.proposals.filter((p) => p.issuerStudioId !== player(f.open))
    expect(rows.length).toBeGreaterThan(0)
    for (const row of rows) { expect(row.promise).toBe(UNKNOWN); expect(row).not.toHaveProperty('count') }
    const surfaces = publicSurfaces(f.open, proposal.talentId)
    assertNoPrivatePromiseTerms(surfaces)
    expect(JSON.stringify(surfaces)).not.toContain('APPEARANCE_COUNT')
  })
  it('publishes the real rival kept outcome and aggregate label while withholding bound history terms', () => {
    const f = rivalFixture()
    const result = readModels(f.terminal, f.promise.beneficiaryPersonId)
    expect(result.promises).toEqual([])
    const surfaces = publicSurfaces(f.terminal, f.promise.beneficiaryPersonId)
    assertNoPrivatePromiseTerms(surfaces)
    assertOutcomeRow(f.terminal, f.promise)
    const ownView = readModels(f.terminal, f.promise.beneficiaryPersonId, f.promise.issuerStudioId)
    expect(ownView.trust.drivers.some((d) => d.kind === 'promiseKept')).toBe(true)
    const rivalStudio = surfaces.studios.find((s) => s.studioId === f.promise.issuerStudioId)!
    expect(rivalStudio).toHaveProperty('trustLabel')
    expect(['Reliable', 'Mixed record', 'Distrusted']).toContain(rivalStudio.trustLabel)
    expect(rivalStudio.trustLabel).toBe(labelForAllDrivers(trustDrivers(f.terminal, null, f.promise.issuerStudioId, f.terminal.market.tick)))
  })
  it('is semantically unchanged when only hidden terminal terms vary, retaining real outcome/event identities', () => {
    const f = rivalFixture()
    readModels(f.terminal, f.promise.beneficiaryPersonId)
    // Explicit disclosure probe, NOT generated gameplay or migration evidence.
    // SATISFIED count/evidence must remain mutually consistent: count privacy is
    // pinned structurally above, not by forging new qualifying take receipts.
    const variant = clone(f.terminal)
    variant.promises = variant.promises.map<ProfessionalPromise>((p) => p.promiseId !== f.promise.promiseId ? p : { ...p,
      family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', windowStartWeek: p.windowStartWeek - 1,
      dueWeekExclusive: p.dueWeekExclusive - 1,
      feasibilityReceipt: { ...p.feasibilityReceipt, classification: 'FRAGILE', bottleneck: 'private disclosure probe' } })
    expect(variant.promises.find((p) => p.promiseId === f.promise.promiseId)!.outcomeEventId).toBe(f.promise.outcomeEventId)
    expect(variant.talentMarket.receipts).toEqual(f.terminal.talentMarket.receipts)
    expect(() => validateSaveV32(JSON.parse(JSON.stringify(makeSave(variant))))).not.toThrow()
    expect(publicSurfaces(variant, f.promise.beneficiaryPersonId)).toEqual(publicSurfaces(f.terminal, f.promise.beneficiaryPersonId))
  })
})

// Independent expression of the already-landed §4.5 aggregate threshold. This
// is not imported from the new bridge helper; the five-real-driver fixture below
// distinguishes all-driver labelling from labelling the truncated display list.
function labelForAllDrivers(drivers: readonly TrustDriver[]): TrustLabel {
  const positives = drivers.filter((d) => d.positive).length
  const negatives = drivers.length - positives
  return negatives === 0 ? positives === 0 ? 'Mixed record' : 'Reliable'
    : negatives >= 2 && negatives > positives ? 'Distrusted' : 'Mixed record'
}
describe('P14B.2 group8 — Industry labels every entered studio from ALL drivers', () => {
  it('publishes player and rivals’ aggregate labels without per-person driver lists', () => {
    const f = retentionFixture()
    readModels(f.outcomes, f.directorId)
    const studios = allStudios(f.outcomes)
    expect(studios.map((s) => s.studioId).sort()).toEqual(f.outcomes.hollywood!.identities.filter((s) => s.enteredWeek !== null).map((s) => s.studioId).sort())
    for (const studio of studios) {
      expect(studio.trustLabel).toBe(labelForAllDrivers(trustDrivers(f.outcomes, null, studio.studioId, f.outcomes.market.tick)))
      expect(studio).not.toHaveProperty('drivers')
      expect(studio).not.toHaveProperty('trust')
      expect(studio).not.toHaveProperty('line')
    }
    const all = trustDrivers(f.outcomes, null, player(f.outcomes), f.outcomes.market.tick)
    expect(all.filter((d) => d.positive)).toHaveLength(3)
    expect(all.filter((d) => !d.positive)).toHaveLength(2)
    expect(labelForAllDrivers(all.slice(0, 3))).toBe('Distrusted')
    expect(studios.find((s) => s.studioId === player(f.outcomes))!.trustLabel).toBe('Mixed record')
    expect(trustDescriptor(f.outcomes, f.directorId, player(f.outcomes), f.outcomes.market.tick).label).toBe('Mixed record')
  })
})

describe('P14B.2 group9 — validated kept+broken V29 BridgeSession roundtrip', () => {
  it('preserves Profile, Market, attention, Pulse and Industry DTO bytes after real save/load', () => {
    const f = retentionFixture()
    readModels(f.outcomes, f.keptId)
    const before = new BridgeSession(f.outcomes, SESSION_ID)
    const saved = before.save({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: SESSION_ID,
      commandId: 'b2-save-kept-and-broken', expectedStateRevision: 0 })
    expect(saved.accepted).toBe(true)
    if (!saved.accepted) throw new Error(saved.message)
    const validated = validateSaveV32(JSON.parse(saved.saveJson))
    expect(validated.saveVersion).toBe(32)
    expect(validated.state.promises.filter((p) => p.issuerStudioId === player(validated.state)).map((p) => p.outcome).sort()).toEqual(['BROKEN', 'SATISFIED'])
    const after = BridgeSession.fromSaveJson(saved.saveJson, SESSION_ID)
    expect(after.stateRevision).toBe(before.stateRevision)
    expect(readModels(after.gameState, f.keptId)).toEqual(readModels(before.gameState, f.keptId))
    for (const talentId of [f.keptId, f.brokenId]) {
      expect(JSON.stringify(publicSurfaces(after.gameState, talentId))).toBe(JSON.stringify(publicSurfaces(before.gameState, talentId)))
    }
    for (const session of [before, after]) {
      expect(() => parseWireValue(schemaDefinition('StudioBridgeSnapshotResponse'), session.snapshot())).not.toThrow()
    }
    // Payloads, not timing metrics or different request/session/revision IDs.
    expect(JSON.stringify(after.snapshot().snapshot)).toBe(JSON.stringify(before.snapshot().snapshot))
    for (const view of ['market', 'pulse', 'studios'] as const) {
      const request = query(view, 0, view === 'market' ? f.keptId : null)
      const a = before.industry(request), b = after.industry(request)
      expect(() => parseWireValue(schemaDefinition('StudioIndustryResponse'), a)).not.toThrow()
      expect(() => parseWireValue(schemaDefinition('StudioIndustryResponse'), b)).not.toThrow()
      expect(JSON.stringify(b)).toBe(JSON.stringify(a))
    }
  }, 60_000)
})
