import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { commitPlacement } from '../src/core/placement.js'
import { researchCandidates } from '../src/core/technology.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { advanceTo, p13aGeneratedStudio, p13aResearchEntry } from '../src/harness/p13a/fixtures.js'
import { p13bStaffedProject } from '../src/harness/p13b/fixtures.js'
import { BridgeSession } from '../bridge/session.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { BRIDGE_SCHEMA, PROJECTION_VERSION } from '../bridge/schema/bridge-schema.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'
import type { IndustryQuery } from '../bridge/schema/industry-schema.ts'

// P13B-S1b (plan §S1b, projection 33): StudioLaboratoryPage.seats/receipts/weekly do
// not exist on the wire yet (bridge/schema/industry-schema.ts StudioLaboratoryPage has
// no such members; PROJECTION_VERSION is still 32). This file asserts the requirement
// directly against the current tree and MUST fail (RED) until S1b-T1/T2 implement it.
// It imports bridge/*.ts, so it is bridge-class (tsconfig.bridge.json), matching the
// existing tests/bridge-p13-laboratory.test.ts and tests/bridge-p13b-s1-identity.test.ts.
// P13B-S2-T6 moved the per-bump values to projection 34 and added the members the S2 wire
// contract gives these same rows: `laboratoryFacilityId` on every seat, `labs` on every
// stored receipt and `units`/`labs` on the quoted week. The S1b requirements are unchanged.

const SESSION_ID = 'p13b-s1b-seats-test'
const IDENTITY_SEED = 'p13b-identity-0049'
const IDENTITY_A = 't-sci-01'
const IDENTITY_B = 't-sci-06'

function query(targetId: string): IndustryQuery {
  return {
    protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'industryQuery', view: 'laboratory',
    targetId, page: 0, pageSize: 50, lane: 'audienceAwareness', period: 'all',
    requestId: 'p13b-s1b-seats', sessionId: SESSION_ID, expectedStateRevision: 0,
  }
}

/** Reads exactly one Laboratory page through the same public route Unity will use. */
function readLaboratory(state: GameState, laboratoryFacilityId: string) {
  const lab = state.placement.facilities.find(p =>
    p.blueprintId === 'research-laboratory' && p.installation === undefined && p.facilityId === laboratoryFacilityId)
  if (!lab) throw new Error('Fixture built without an installed Research Laboratory placement.')
  const session = new BridgeSession(state, SESSION_ID)
  const page = session.industry(query(`placed-${lab.id}`))
  if (!('laboratory' in page) || !page.laboratory) throw new Error('Laboratory page absent from the P13B-S1b response.')
  expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioIndustryResponse, page)).toEqual(page)
  return page
}

function nameOf(state: GameState, talentId: string): string {
  return state.talent.find(t => t.id === talentId)!.name
}

/** Mirrors the identity fixture in tests/bridge-p13b-s1-identity.test.ts: two named
 * Scientists sharing the same generated name, seated and funded on one Laboratory. */
function identityFixture(seed: string, idA: string, idB: string) {
  let state = advanceTo(commitPlacement(p13aGeneratedStudio(seed), { blueprintId: 'research-laboratory', origin: { gx: 0, gy: 9 } }), 12)
  const laboratoryFacilityId = state.operations.facilities.find(f => f.capability === 'laboratory')!.id
  state = applyActions(state, [{ kind: 'installAcousticInstruments', laboratoryFacilityId }])
  state = advanceTo(state, 260)
  const assignedWeek = state.market.tick
  state = applyActions(state, [
    { kind: 'recruitScientist', laboratoryFacilityId, scientistId: idA },
    { kind: 'recruitScientist', laboratoryFacilityId, scientistId: idB },
    { kind: 'assignResearchScientist', laboratoryFacilityId, scientistId: idA },
    { kind: 'assignResearchScientist', laboratoryFacilityId, scientistId: idB },
  ])
  const projectId = state.technology.projects[0]!.id
  state = applyActions(state, [{ kind: 'beginResearch', projectId, budgetPerWeek: 20_000 }])
  state = tick(state)
  return { state, laboratoryFacilityId, assignedWeek }
}

describe('P13B-S1b Laboratory seats read model (projection 45 after P14B.1-T3)', () => {
  it('bumps PROJECTION_VERSION to the S1b wire contract (33; 45 after the P14B.1-T3 bump)', () => {
    expect(PROJECTION_VERSION).toBe(45)
  })

  let entry: GameState
  let entryLabFacilityId: string
  let entryTick: number
  let staffedBase: ReturnType<typeof p13bStaffedProject>
  let staffedTen: ReturnType<typeof p13bStaffedProject>
  let baseSeats: Array<{ talentId: string; name: string; laboratoryFacilityId: string; assignedWeek: number; releasedWeek: number | null; employed: boolean }>
  let identity: { state: GameState; laboratoryFacilityId: string; assignedWeek: number }

  beforeAll(() => {
    entry = p13aResearchEntry()
    entryLabFacilityId = entry.operations.facilities.find(f => f.capability === 'laboratory')!.id
    entryTick = entry.market.tick
    staffedBase = p13bStaffedProject(entry, 3, 40_000, 4)
    staffedTen = p13bStaffedProject(entry, 10, 40_000, 4)
    baseSeats = staffedBase.scientistIds.map(id => ({
      talentId: id, name: nameOf(staffedBase.state, id), laboratoryFacilityId: staffedBase.laboratoryFacilityId,
      assignedWeek: entryTick, releasedWeek: null, employed: true,
    }))
    identity = identityFixture(IDENTITY_SEED, IDENTITY_A, IDENTITY_B)
  }, 120_000)

  it('a. fresh Laboratory with no project publishes empty seats/receipts, zero weekly and snapshotVersion 38', () => {
    const page = readLaboratory(entry, entryLabFacilityId)
    expect(page.snapshotVersion).toBe(45)
    expect(page.laboratory!.seats).toEqual([])
    expect(page.laboratory!.receipts).toEqual([])
    expect(page.laboratory!.weekly).toEqual({ ceiling: 0, usable: 0, seats: 0, output: 0, units: 0, labs: [] })
  })

  it('b. four staffed seats publish assignment-order rows, three ascending receipts and the current week quote', () => {
    const page = readLaboratory(staffedBase.state, staffedBase.laboratoryFacilityId)
    const lab = page.laboratory!
    expect(lab.seats).toEqual(baseSeats)
    expect(lab.receipts).toHaveLength(3)
    for (let i = 0; i < 3; i++) {
      expect(lab.receipts[i]).toEqual({ week: entryTick + i, seatTalentIds: staffedBase.scientistIds, spend: 40_000, units: 960_000,
        labs: [{ laboratoryFacilityId: staffedBase.laboratoryFacilityId, seatTalentIds: staffedBase.scientistIds, spend: 40_000, rawUnits: 120_000 }] })
    }
    expect(lab.weekly).toEqual({ ceiling: 40_000, usable: 40_000, seats: 4, output: 6, units: 960_000,
      labs: [{ laboratoryFacilityId: staffedBase.laboratoryFacilityId, seats: 4, spend: 40_000, rawUnits: 120_000 }] })
  })

  it('c. only the last eight worked-week receipts are published, ascending and contiguous', () => {
    const full = staffedTen.state.technology!.projects.find(p => p.id === staffedTen.projectId)!.weeks
    expect(full.length).toBe(10) // sanity: ten funded, worked weeks were actually advanced
    const page = readLaboratory(staffedTen.state, staffedTen.laboratoryFacilityId)
    const receipts = page.laboratory!.receipts
    expect(receipts).toHaveLength(8)
    expect(receipts[0]!.week).toBe(full[2]!.week) // the third worked week
    for (let i = 1; i < receipts.length; i++) expect(receipts[i]!.week).toBe(receipts[i - 1]!.week + 1)
    expect(receipts).toEqual(full.slice(-8).map(r => ({ week: r.week, seatTalentIds: r.seatTalentIds, spend: r.spend, units: r.units, labs: r.labs })))
  })

  it('d. a released seat keeps its history row; the quote drops to three seats; the next receipt names three ids', () => {
    const releaseWeek = staffedBase.state.market.tick
    const released = applyActions(staffedBase.state, [
      { kind: 'releaseResearchSeat', projectId: staffedBase.projectId, scientistId: staffedBase.scientistIds[0]! },
    ])
    const page = readLaboratory(released, staffedBase.laboratoryFacilityId)
    const lab = page.laboratory!
    expect(lab.seats[0]).toEqual({
      talentId: staffedBase.scientistIds[0], name: nameOf(released, staffedBase.scientistIds[0]!),
      laboratoryFacilityId: staffedBase.laboratoryFacilityId, assignedWeek: entryTick, releasedWeek: releaseWeek, employed: true,
    })
    expect(lab.seats.slice(1)).toEqual(baseSeats.slice(1))
    expect(lab.weekly).toEqual({ ceiling: 40_000, usable: 30_000, seats: 3, output: 4.5, units: 720_000,
      labs: [{ laboratoryFacilityId: staffedBase.laboratoryFacilityId, seats: 3, spend: 30_000, rawUnits: 90_000 }] })

    const ticked = tick(released)
    const nextPage = readLaboratory(ticked, staffedBase.laboratoryFacilityId)
    const latestReceipt = nextPage.laboratory!.receipts.at(-1)!
    expect(latestReceipt.seatTalentIds).toEqual(staffedBase.scientistIds.slice(1))
  })

  it("e. a same-name pair is seated and charged distinctly by id", () => {
    const candidates = researchCandidates(identity.state)
    const nameA = candidates.find(c => c.id === IDENTITY_A)!.name
    const nameB = candidates.find(c => c.id === IDENTITY_B)!.name
    expect(nameA).toBe(nameB) // the plan's chosen same-name seed/id pair
    const page = readLaboratory(identity.state, identity.laboratoryFacilityId)
    const lab = page.laboratory!
    expect(lab.seats).toEqual([
      { talentId: IDENTITY_A, name: nameA, laboratoryFacilityId: identity.laboratoryFacilityId, assignedWeek: identity.assignedWeek, releasedWeek: null, employed: true },
      { talentId: IDENTITY_B, name: nameB, laboratoryFacilityId: identity.laboratoryFacilityId, assignedWeek: identity.assignedWeek, releasedWeek: null, employed: true },
    ])
    expect(lab.receipts).toHaveLength(1)
    expect(lab.receipts[0]).toEqual({ week: identity.assignedWeek, seatTalentIds: [IDENTITY_A, IDENTITY_B], spend: 20_000, units: 480_000,
      labs: [{ laboratoryFacilityId: identity.laboratoryFacilityId, seatTalentIds: [IDENTITY_A, IDENTITY_B], spend: 20_000, rawUnits: 60_000 }] })
  })

  it('f. a paused project zeroes the current week quote but keeps its ceiling and seated rows', () => {
    const paused = applyActions(staffedBase.state, [{ kind: 'pauseResearch', projectId: staffedBase.projectId }])
    const page = readLaboratory(paused, staffedBase.laboratoryFacilityId)
    const lab = page.laboratory!
    expect(lab.weekly).toEqual({ ceiling: 40_000, usable: 0, seats: 0, output: 0, units: 0, labs: [] })
    expect(lab.seats).toEqual(baseSeats)
  })

  it("player-safe: the Laboratory page names only the player's people and project", () => {
    const page = readLaboratory(staffedBase.state, staffedBase.laboratoryFacilityId)
    const lab = page.laboratory!
    const own = staffedBase.state.hollywood!.playerStudioId
    expect(staffedBase.projectId.startsWith(own)).toBe(true)
    const rivalStudioIds = staffedBase.state.hollywood!.identities.filter(i => i.studioId !== own).map(i => i.studioId)
    const namedIds = [...lab.seats.map(s => s.talentId), ...lab.receipts.flatMap(r => r.seatTalentIds)]
    for (const id of namedIds) expect(rivalStudioIds).not.toContain(id)
  })
})
