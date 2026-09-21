import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { commitPlacement } from '../src/core/placement.js'
import { occupiedSeats, PROJECT_UNIT, researchCandidates, researchWeekQuote } from '../src/core/technology.js'
import { technologyEntry } from '../src/core/technologyCatalogue.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { advanceTo, p13aLaboratorySlice, p13aResearchEntry } from '../src/harness/p13a/fixtures.js'
import { nextLaboratoryOrigin, p13bTwoLabWorld } from '../src/harness/p13b/fixtures.js'
import { laboratoryActionSpecs } from '../bridge/laboratory.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { BRIDGE_SCHEMA, PROJECTION_VERSION } from '../bridge/schema/bridge-schema.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'
import { BridgeSession } from '../bridge/session.ts'

// P13B-S2 test-author task (2026-09-16): the T6 bridge Laboratory page for two
// technologies and two Laboratories (projection 33 -> 34). Requirement-derived
// from the coordinator's fixed wire contract for this task and cross-checked
// directly against the delivered bridge/laboratory.ts and
// bridge/schema/industry-schema.ts at authoring time (T6 landed concurrently
// while this file was being written; PROJECTION_VERSION was already 34).
// Every case dispatches through a real BridgeSession/session.command(), never
// a mock. Style and helper conventions follow tests/bridge-p13b-s1b-seats.test.ts
// (session/query construction, buildingId resolution, schema-conformance check)
// and tests/bridge-p13-laboratory.test.ts (submitIntent dispatch pattern).
//
// IMPORTANT identity note (verified by reading bridge/laboratory.ts directly,
// not assumed): every row id (`assign-<id>-...`, `release-<id>-...`,
// `instruments-<id>`) and every `buildingId` (`placed-<id>`) is built from the
// research-laboratory PLACEMENT's own short id (`state.placement.facilities`
// entry's `.id`, e.g. "1"/"2" — see `targetId: 'placed-1'` in
// tests/bridge-p13-laboratory.test.ts), which is a DIFFERENT string from the
// `laboratoryFacilityId` used everywhere in core/technology.ts and returned by
// `p13bTwoLabWorld()` (e.g. "facility-research-laboratory"). `rowLabId` below
// resolves the correct short id for row-id construction; `laboratoryFacilityId`
// itself is still what every `ResearchSeat`/`TechnologyAction` field carries.

function placementLabOf(state: GameState, laboratoryFacilityId: string) {
  const lab = state.placement.facilities.find(p =>
    p.blueprintId === 'research-laboratory' && p.installation === undefined && p.facilityId === laboratoryFacilityId)
  if (!lab) throw new Error(`No installed Research Laboratory placement carries facility "${laboratoryFacilityId}".`)
  return lab
}
/** The short id every row id and buildingId is actually built from (see the header note). */
function rowLabId(state: GameState, laboratoryFacilityId: string): string {
  return String(placementLabOf(state, laboratoryFacilityId).id)
}
function buildingIdOf(state: GameState, laboratoryFacilityId: string): string {
  return `placed-${rowLabId(state, laboratoryFacilityId)}`
}

let requestCounter = 0
let commandCounter = 0
function nextRequestId(prefix: string): string { return `${prefix}-req-${String(requestCounter++)}` }

/** Reads a value out of a possibly-null/undefined slot, or throws a diagnostic
 * error naming what was expected — never a bare `!`, so a genuine absence is a
 * loud, informative test failure instead of a silent runtime crash. */
function required<T>(value: T | null | undefined, message: string): T {
  if (value === null || value === undefined) throw new Error(message)
  return value
}

/** One raw page of the Laboratory Industry response, schema-checked, with the
 * `laboratory` member narrowed to non-null by construction: the returned object
 * literal carries a freshly-narrowed local, so TypeScript's inferred return type
 * (not just this function's own control flow) tracks the non-null shape for every
 * caller — `response.laboratory` alone does not survive across a function boundary. */
function labResponse(session: BridgeSession, buildingId: string, requestId: string, page = 0, pageSize = 50) {
  const response = session.industry({
    protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'industryQuery', view: 'laboratory',
    targetId: buildingId, page, pageSize, lane: 'audienceAwareness', period: 'all',
    requestId, sessionId: session.sessionId, expectedStateRevision: session.stateRevision,
  })
  if (!('laboratory' in response)) throw new Error(`Laboratory query rejected for building "${buildingId}" (request ${requestId}): ${JSON.stringify(response)}`)
  const laboratory = required(response.laboratory, `Laboratory page absent for building "${buildingId}" (request ${requestId}): ${JSON.stringify(response)}`)
  expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioIndustryResponse, response)).toEqual(response)
  return { ...response, laboratory }
}
/** Every field of the Laboratory page, with `actions` merged across every page
 * (only `actions` is paginated; `seats`/`receipts`/`weekly`/`projects` are whole). */
function labPage(session: BridgeSession, buildingId: string, requestId: string) {
  const first = labResponse(session, buildingId, `${requestId}-p0`, 0)
  const actions = [...first.laboratory.actions]
  for (let page = 1; page < first.pageCount; page++) {
    const next = labResponse(session, buildingId, `${requestId}-p${String(page)}`, page)
    actions.push(...next.laboratory.actions)
  }
  return { ...first.laboratory, actions }
}
/** Dispatches exactly one row id through a real submitIntent command, re-reading
 * the page immediately beforehand (intents are digest-bound to the exact state
 * that published them). Throws loudly — never silently skips — if the row is
 * absent or refused, so a genuine gap surfaces as a real test failure. */
function dispatch(session: BridgeSession, buildingId: string, rowId: string): void {
  const lab = labPage(session, buildingId, nextRequestId('dispatch-lookup'))
  const row = lab.actions.find(a => a.id === rowId)
  if (!row) throw new Error(`Row "${rowId}" is absent from the Laboratory page for building "${buildingId}".`)
  if (!row.enabled || !row.intent) throw new Error(`Row "${rowId}" is not enabled/available: ${row.disabledReason ?? 'no reason given'}`)
  const response = session.command({
    protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'submitIntent',
    commandId: `dispatch-${String(commandCounter++)}`, sessionId: session.sessionId,
    expectedStateRevision: session.stateRevision, payload: { intentId: row.intent.intentId },
  })
  if (!response.accepted) throw new Error(`Row "${rowId}" was refused: ${JSON.stringify(response)}`)
}

// ---------------------------------------------------------------------------

describe('P13B-S2 T6 Laboratory bridge page: projection bump', () => {
  it('bumps PROJECTION_VERSION to the S2 wire contract (34; 38 after the S5-R07-T3 bump)', () => {
    expect(PROJECTION_VERSION).toBe(47)
  })
})

describe('case 1: a fresh Laboratory publishes snapshotVersion 38 and an empty projects array', () => {
  it('a Laboratory with no research project at all reports laboratory.projects === []', () => {
    const state = p13aLaboratorySlice() // week 12, one operational Laboratory, no research
    const laboratoryFacilityId = state.operations.facilities.find(f => f.capability === 'laboratory')!.id
    const buildingId = buildingIdOf(state, laboratoryFacilityId)
    const session = new BridgeSession(state, 'p13b-s2-labs-1-fresh')
    const response = labResponse(session, buildingId, nextRequestId('fresh'))
    expect(response.snapshotVersion).toBe(47)
    expect(response.laboratory.projects).toEqual([])
  })
})

// Re-derived from the ENGINE law after the coordinator's correction (2026-09-16):
// the engine has no researchable-week gate on SEATING (src/core/technology.ts's
// `researchPrerequisiteRefusal` gates begin/weekly work only), and retained P13A
// law seats a Scientist before research opens (tests/bridge-p13-laboratory.test.ts
// seats at week 12 for sound, which opens 260). bridge/laboratory.ts publishes an
// assign row for every catalogue brief the studio has not completed/acquired,
// enabled exactly as the engine's own dry run decides, and dates the wait on the
// row's `detail` ("Research opens <date>; the seat waits until then.") instead of
// hiding the brief. This describe block asserts exactly that shape, not a bridge
// gate that never matched the engine.
describe('case 2: seating is lawful before a brief\'s research opens; the wire dates the wait instead of hiding the brief', () => {
  it('before week 780 (week 263, S1-style state): both the sound and lighting assign rows exist for a free employed person; the lighting row\'s detail names the wait, the sound row\'s does not (sound opened 260); dispatching the lighting assign through the bridge is accepted, publishing a paused lighting project whose bottleneckLabel also names the wait; its begin row is disabled with the same engine text', () => {
    let state = p13aResearchEntry() // week 260: acoustic instruments operational, sound researchable; lighting opens 780
    state = advanceTo(state, 263)
    const laboratoryFacilityId = state.operations.facilities.find(f => f.capability === 'laboratory')!.id
    const candidateId = researchCandidates(state)[0]!.id
    state = applyActions(state, [{ kind: 'recruitScientist', laboratoryFacilityId, scientistId: candidateId }])
    const rl = rowLabId(state, laboratoryFacilityId)
    const buildingId = buildingIdOf(state, laboratoryFacilityId)
    const session = new BridgeSession(state, 'p13b-s2-labs-2-pre780')
    const lab = labPage(session, buildingId, nextRequestId('pre780'))

    const soundRow = required(lab.actions.find(a => a.id === `assign-${rl}-${candidateId}-synchronized-sound`), 'sound assign row absent at week 263')
    const lightingRow = required(lab.actions.find(a => a.id === `assign-${rl}-${candidateId}-lighting-control-01`), 'lighting assign row absent at week 263')
    expect(soundRow.detail).not.toMatch(/Research opens/)
    expect(lightingRow.detail).toMatch(/Research opens/)
    expect(soundRow.enabled).toBe(true)
    expect(lightingRow.enabled).toBe(true) // seating is lawful even before research opens (retained P13A law)

    dispatch(session, buildingId, `assign-${rl}-${candidateId}-lighting-control-01`)
    const after = labPage(session, buildingId, nextRequestId('pre780-after'))
    const lightingProject = required(after.projects.find(p => p.technologyId === 'lighting-control-01'), 'lighting project absent after the assign dispatched')
    expect(lightingProject.status).toBe('paused')
    expect(lightingProject.bottleneckLabel).toMatch(/Research opens/)
    const beginRow = required(after.actions.find(a => a.id === `run-${lightingProject.projectId}`), 'lighting begin row absent')
    expect(beginRow.enabled).toBe(false)
    expect(beginRow.disabledReason).toMatch(/Research opens/)
  })

  describe('at week 780 (two-Laboratory world): both briefs are open, so no assign row still names the wait', () => {
    let world: ReturnType<typeof p13bTwoLabWorld>
    beforeAll(() => { world = p13bTwoLabWorld() }, 240_000)

    it('every free employed person has BOTH technologies\' assign rows on EACH Laboratory, neither detail mentions the wait, and the underlying spec carries technologyId', () => {
      const [lab1, lab2] = world.laboratoryFacilityIds
      const session = new BridgeSession(world.state, 'p13b-s2-labs-2-both-tech')
      for (const laboratoryFacilityId of [lab1, lab2]) {
        const rl = rowLabId(world.state, laboratoryFacilityId)
        const buildingId = buildingIdOf(world.state, laboratoryFacilityId)
        const lab = labPage(session, buildingId, nextRequestId(`both-tech-${rl}`))
        for (const candidateId of world.candidateIds) {
          const soundRow = required(lab.actions.find(a => a.id === `assign-${rl}-${candidateId}-synchronized-sound`), `sound assign row absent for ${candidateId}`)
          const lightingRow = required(lab.actions.find(a => a.id === `assign-${rl}-${candidateId}-lighting-control-01`), `lighting assign row absent for ${candidateId}`)
          expect(soundRow.detail).not.toMatch(/Research opens/)
          expect(lightingRow.detail).not.toMatch(/Research opens/)
        }
      }
      const specs = laboratoryActionSpecs(world.state)
      let sawSound = false, sawLighting = false
      for (const s of specs) {
        if (s.action.kind !== 'assignResearchScientist') continue
        if (s.action.technologyId === 'synchronized-sound') sawSound = true
        if (s.action.technologyId === 'lighting-control-01') sawLighting = true
        expect(typeof s.action.laboratoryFacilityId).toBe('string')
        expect(typeof s.action.scientistId).toBe('string')
        expect(['synchronized-sound', 'lighting-control-01']).toContain(s.action.technologyId)
      }
      expect(sawSound).toBe(true)
      expect(sawLighting).toBe(true)
    }, 60_000)
  })
})

describe('case 3: two full Laboratories — the shared project reads identically from both pages', () => {
  let world: ReturnType<typeof p13bTwoLabWorld>
  beforeAll(() => { world = p13bTwoLabWorld() }, 240_000)

  it('dispatches 4+4 sound assign rows through the bridge on both Laboratories, funds the full $80,000 ceiling through the bridge\'s own budget row (the S2-T6 gap that used to cap this menu at $40,000 was closed 2026-09-16 — the menu now reaches 60,000/80,000) and begins through the bridge; before the first tick both pages already report companion test 4 case (i) (7 funded weeks remain, 0 of 64 verified units); one bridge-advanced week reproduces case (i) exactly (output 9.75, units 1,560,000) on both pages', () => {
    const [lab1, lab2] = world.laboratoryFacilityIds
    const ids = world.candidateIds
    const rl1 = rowLabId(world.state, lab1), rl2 = rowLabId(world.state, lab2)
    const building1 = buildingIdOf(world.state, lab1), building2 = buildingIdOf(world.state, lab2)
    const session = new BridgeSession(world.state, 'p13b-s2-labs-3-dispatch')
    for (const scientistId of ids.slice(0, 4)) dispatch(session, building1, `assign-${rl1}-${scientistId}-synchronized-sound`)
    for (const scientistId of ids.slice(4, 8)) dispatch(session, building2, `assign-${rl2}-${scientistId}-synchronized-sound`)
    const projectId = required(session.gameState.technology.projects.find(p => p.technologyId === 'synchronized-sound' && p.studioId === session.gameState.hollywood!.playerStudioId), 'sound project absent after 8 assign dispatches').id

    const scan = labPage(session, building1, nextRequestId('budget-scan'))
    const budgetPrefix = `budget-${projectId}-`
    const amounts = scan.actions.filter(a => a.id.startsWith(budgetPrefix)).map(a => Number(a.id.slice(budgetPrefix.length)))
    // HISTORY: with 8 occupied seats this project can usefully absorb up to
    // $80,000/week (10,000 x 8, companion S2 §4 / p13b-s2-cooperation.test.ts
    // case (i)). At first authoring (2026-09-16, before this correction) the
    // published preset menu was unchanged from the single-Laboratory S1 menu and
    // topped out at $40,000 — no published Laboratory decision could reach the
    // fully-funded 8-seat ceiling; that gap was recorded here as a real finding.
    // Sim-core closed it the same day (bridge/laboratory.ts's budget-<id>-<amount>
    // preset list is now [0, 2_500, 10_000, 40_000, 60_000, 80_000]); the full
    // ceiling is now reachable through a real bridge decision, asserted below.
    expect(Math.max(...amounts)).toBe(80_000)

    dispatch(session, building1, `${budgetPrefix}80000`)
    dispatch(session, building1, `run-${projectId}`)
    const staged = required(session.gameState.technology.projects.find(p => p.id === projectId), 'sound project absent after begin')
    const stagedQuote = researchWeekQuote(session.gameState, staged)
    expect(stagedQuote.spend).toBe(80_000) // companion test 4 case (i): the full 8-seat ceiling, now reached through the bridge itself
    expect(stagedQuote.output).toBe(9.75)
    expect(stagedQuote.remainingWeeks).toBe(7)

    // Before the first tick, both pages already report the pre-work shape (case 9's requirement).
    for (const [laboratoryFacilityId, buildingId] of [[lab1, building1], [lab2, building2]] as const) {
      const before = labPage(session, buildingId, nextRequestId(`before-tick-${laboratoryFacilityId}`))
      const beforeProject = required(before.projects.find(p => p.projectId === projectId), `sound project absent on ${laboratoryFacilityId} before the first tick`)
      expect(beforeProject.work).toBe(64)
      expect(beforeProject.verifiedWork).toBe(0)
      expect(beforeProject.progressLabel).toMatch(/^0 of 64/)
      expect(beforeProject.estimateLabel).toMatch(/7 funded weeks remain/)
    }

    const ticked = tick(session.gameState)
    const tickedProject = required(ticked.technology.projects.find(p => p.id === projectId), 'sound project absent after the first tick')
    const receipt = required(tickedProject.weeks.at(-1), 'no receipt recorded after the first tick')
    expect(receipt.spend).toBe(80_000)
    expect(receipt.units).toBe(1_560_000) // 8*120,000 + 5*120,000, test 4 case (i)
    expect(receipt.labs).toEqual(expect.arrayContaining([
      { laboratoryFacilityId: lab1, seatTalentIds: ids.slice(0, 4), spend: 40_000, rawUnits: 120_000 },
      { laboratoryFacilityId: lab2, seatTalentIds: ids.slice(4, 8), spend: 40_000, rawUnits: 120_000 },
    ]))
    expect(receipt.labs).toHaveLength(2)

    const nextSession = new BridgeSession(ticked, 'p13b-s2-labs-3-ticked')
    for (const [laboratoryFacilityId, buildingId] of [[lab1, building1], [lab2, building2]] as const) {
      const lab = labPage(nextSession, buildingId, nextRequestId(`after-${laboratoryFacilityId}`))
      const project = required(lab.projects.find(p => p.projectId === projectId), `sound project absent on ${laboratoryFacilityId} after the first tick`)
      expect(project.laboratoryFacilityIds).toEqual([lab1, lab2].slice().sort())
      expect(project.weekly).toEqual({
        ceiling: 80_000, usable: 80_000, seats: 8, output: 9.75, units: 1_560_000,
        labs: expect.arrayContaining([
          { laboratoryFacilityId: lab1, seats: 4, spend: 40_000, rawUnits: 120_000 },
          { laboratoryFacilityId: lab2, seats: 4, spend: 40_000, rawUnits: 120_000 },
        ]),
      })
      expect(project.weekly.labs).toHaveLength(2)
      expect(project.cooperationLabel).toMatch(/Two Laboratories/)
      expect(project.cooperationLabel).toMatch(/0\.625/)
      expect(project.cooperationLabel).toMatch(/\$40,000/)
      expect(project.cooperationLabel).toMatch(/120000 raw/) // raw units are printed unformatted (no thousands separator), unlike dollar spend
      const lastReceipt = required(project.receipts.at(-1), `no receipt published on ${laboratoryFacilityId} after the first tick`)
      expect(lastReceipt.units).toBe(1_560_000)
      expect(lastReceipt.labs).toHaveLength(2)
    }
    // The retained top-level S1b members describe the sound project from its
    // HOME Laboratory (lab1, per bridge/laboratory.ts's own project lookup);
    // every seat row on that page carries its own laboratoryFacilityId.
    const lab1Page = labPage(nextSession, building1, nextRequestId('after-top'))
    expect(lab1Page.weekly.output).toBe(9.75)
    for (const seat of lab1Page.seats) expect(seat.laboratoryFacilityId).toBe(lab1)
    expect(new Set(lab1Page.seats.map(s => s.talentId))).toEqual(new Set(ids.slice(0, 4)))
  }, 60_000)
})

describe('case 4: two technologies staffed on one Laboratory', () => {
  let world: ReturnType<typeof p13bTwoLabWorld>
  beforeAll(() => { world = p13bTwoLabWorld() }, 240_000)

  it('lists two projects rows in stable id order; every project\'s progressLabel names its own verifiedWork/work; each fully-funded 2-seat project\'s cooperationLabel reads "One Laboratory: 2 seats" with the real $20,000/60,000 figures; the fifth assign for EITHER technology on this Laboratory is refused with "four seats"', () => {
    const [, lab2] = world.laboratoryFacilityIds
    const ids = world.candidateIds
    const rl2 = rowLabId(world.state, lab2)
    const building2 = buildingIdOf(world.state, lab2)
    const session = new BridgeSession(world.state, 'p13b-s2-labs-4-two-tech')
    for (const scientistId of ids.slice(0, 2)) dispatch(session, building2, `assign-${rl2}-${scientistId}-synchronized-sound`)
    for (const scientistId of ids.slice(2, 4)) dispatch(session, building2, `assign-${rl2}-${scientistId}-lighting-control-01`)
    const soundId = session.gameState.technology.projects.find(p => p.technologyId === 'synchronized-sound' && p.studioId === session.gameState.hollywood!.playerStudioId)!.id
    const lightingId = session.gameState.technology.projects.find(p => p.technologyId === 'lighting-control-01' && p.studioId === session.gameState.hollywood!.playerStudioId)!.id
    dispatch(session, building2, `budget-${soundId}-40000`)
    dispatch(session, building2, `run-${soundId}`)
    dispatch(session, building2, `budget-${lightingId}-40000`)
    dispatch(session, building2, `run-${lightingId}`)

    const lab = labPage(session, building2, nextRequestId('two-tech-after'))
    expect(lab.projects.map(p => p.projectId)).toEqual([soundId, lightingId].slice().sort())
    expect(lab.projects.map(p => p.technologyId).sort()).toEqual(['lighting-control-01', 'synchronized-sound'])
    for (const project of lab.projects) {
      const entry = technologyEntry(project.technologyId)
      expect(project.work).toBe(64)
      expect(project.progressLabel).toMatch(new RegExp(`^${String(project.verifiedWork)} of ${String(entry.work)}`))
      expect(project.cooperationLabel).toMatch(/One Laboratory: 2 seats/)
      expect(project.cooperationLabel).toMatch(/\$20,000 usable/)
      expect(project.cooperationLabel).toMatch(/60000 raw units\/week/) // raw units are printed unformatted (no thousands separator), unlike dollar spend
    }

    const fifthCandidate = ids[4]!
    for (const technologyId of ['synchronized-sound', 'lighting-control-01'] as const) {
      const row = lab.actions.find(a => a.id === `assign-${rl2}-${fifthCandidate}-${technologyId}`)
      expect(row).toBeDefined()
      expect(row!.enabled).toBe(false)
      expect(row!.disabledReason).toMatch(/four seats/)
    }
  }, 60_000)
})

describe('case 5: a third Laboratory is refused on the wire', () => {
  it('a real, completed third Laboratory (placed and its build time elapsed — the same construction tests/p13b-s2-labs.test.ts\'s own base3Setup uses for the identical core-level "test 3" case) publishes its assign row disabled with the engine\'s own "third Laboratory" refusal', () => {
    const world = p13bTwoLabWorld()
    const [lab1, lab2] = world.laboratoryFacilityIds
    const ids = world.candidateIds
    const origin = nextLaboratoryOrigin(world.state)
    let withLab3 = commitPlacement(world.state, { blueprintId: 'research-laboratory', origin })
    withLab3 = advanceTo(withLab3, withLab3.market.tick + 12)
    const lab3 = withLab3.operations.facilities.find(f => f.capability === 'laboratory' && f.id !== lab1 && f.id !== lab2)?.id
    if (lab3 === undefined) throw new Error('The third Research Laboratory never completed construction within 12 weeks.')

    const rl1 = rowLabId(withLab3, lab1), rl2 = rowLabId(withLab3, lab2), rl3 = rowLabId(withLab3, lab3)
    const building1 = buildingIdOf(withLab3, lab1), building2 = buildingIdOf(withLab3, lab2), building3 = buildingIdOf(withLab3, lab3)
    const session = new BridgeSession(withLab3, 'p13b-s2-labs-5-third')
    dispatch(session, building1, `assign-${rl1}-${ids[0]}-synchronized-sound`)
    dispatch(session, building2, `assign-${rl2}-${ids[1]}-synchronized-sound`)

    const lab3Page = labPage(session, building3, nextRequestId('third-lab'))
    const row = lab3Page.actions.find(a => a.id === `assign-${rl3}-${ids[2]}-synchronized-sound`)
    expect(row).toBeDefined()
    expect(row!.enabled).toBe(false)
    expect(row!.disabledReason).toMatch(/third Laboratory|two Laboratories/)
  }, 60_000)
})

describe('case 6: a migrated V21 fixture keeps its honest single-pool receipts on the wire', () => {
  const FIXTURE = './fixtures/p13b/legacy-v21-two-labs-two-briefs-783.json.gz'
  const FIXTURE_SHA256 = '24fffa82738214b2ca5e01858d95d6851bf89faba0588603d0ce02e495f9a6f9'

  it('loads through BridgeSession.fromSaveJson (a genuine V21 fixture, migrated on import): the sound project\'s three stored receipts read labs:null; the lighting project\'s three receipts each read one derived row; the next quoted week splits 4+2 seats at $60,000 into $40,000/$20,000, output 7.875', () => {
    const json = gunzipSync(readFileSync(new URL(FIXTURE, import.meta.url))).toString('utf8')
    expect(createHash('sha256').update(json).digest('hex')).toBe(FIXTURE_SHA256)
    expect((JSON.parse(json) as { saveVersion: number }).saveVersion).toBe(21) // genuinely pre-migration

    const session = BridgeSession.fromSaveJson(json, 'p13b-s2-labs-6-fixture')
    const state = session.gameState
    // Migrated by the bridge's own load path (importSaveJsonCurrent); "converted"
    // is true by construction here since saveVersion 21 !== 22 (bridge/session.ts).
    expect(state.technology.version).toBe(4)
    expect(state.market.tick).toBe(783)

    const soundProject = state.technology.projects.find(p => p.technologyId === 'synchronized-sound' && p.studioId === state.hollywood!.playerStudioId)!
    const lightingProject = state.technology.projects.find(p => p.technologyId === 'lighting-control-01' && p.studioId === state.hollywood!.playerStudioId)!
    expect(soundProject.weeks).toHaveLength(3)
    for (const receipt of soundProject.weeks) expect(receipt.labs).toBeNull()
    expect(lightingProject.weeks).toHaveLength(3)
    for (const receipt of lightingProject.weeks) expect(receipt.labs).toHaveLength(1)

    const soundBuilding = buildingIdOf(state, soundProject.laboratoryFacilityId)
    const soundPage = labPage(session, soundBuilding, nextRequestId('fixture-sound'))
    const wireSound = soundPage.projects.find(p => p.projectId === soundProject.id)!
    expect(wireSound.receipts).toHaveLength(3)
    for (const receipt of wireSound.receipts) expect(receipt.labs).toBeNull()

    const lightingBuilding = buildingIdOf(state, lightingProject.laboratoryFacilityId)
    const lightingPage = labPage(session, lightingBuilding, nextRequestId('fixture-lighting'))
    const wireLighting = lightingPage.projects.find(p => p.projectId === lightingProject.id)!
    expect(wireLighting.receipts).toHaveLength(3)
    for (const receipt of wireLighting.receipts) expect(receipt.labs).toHaveLength(1)

    // The NEXT (unworked) week's quote is computed fresh under cooperation, never
    // null, from the project's own current seat split across whichever Laboratories.
    const seatCounts = new Map<string, number>()
    for (const seat of occupiedSeats(soundProject)) seatCounts.set(seat.laboratoryFacilityId, (seatCounts.get(seat.laboratoryFacilityId) ?? 0) + 1)
    expect([...seatCounts.values()].sort((a, b) => a - b)).toEqual([2, 4])
    expect(wireSound.laboratoryFacilityIds).toEqual([...seatCounts.keys()].sort())

    const quote = researchWeekQuote(state, soundProject)
    expect(quote.spend).toBe(60_000)
    expect(quote.output).toBe(7.875)
    expect(quote.labs).toHaveLength(2)
    expect(wireSound.weekly).toEqual({
      ceiling: soundProject.budgetPerWeek, usable: quote.spend, seats: quote.seats, output: quote.output,
      units: Math.round(quote.output * PROJECT_UNIT),
      labs: quote.labs.map(({ laboratoryFacilityId, seats, spend, rawUnits }) => ({ laboratoryFacilityId, seats, spend, rawUnits })),
    })
  }, 30_000)
})

describe('case 7: releasing a seat through the bridge recomputes the funding split', () => {
  it('releasing one of Lab 2\'s two sound seats (4+2 -> 4+1) through the bridge recomputes next week\'s split to $40,000/$10,000, output 6.9375', () => {
    const world = p13bTwoLabWorld()
    const [lab1, lab2] = world.laboratoryFacilityIds
    const ids = world.candidateIds
    // Staging is done directly with the engine's own public actions (the same
    // pattern tests/p13b-s2-cooperation.test.ts's own `stage()` helper uses) —
    // "release through the bridge" is this case's own heading and the one step
    // actually dispatched as a bridge command below.
    let staged = applyActions(world.state, ids.slice(0, 4).map(scientistId =>
      ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab1, scientistId, technologyId: 'synchronized-sound' as const })))
    staged = applyActions(staged, ids.slice(4, 6).map(scientistId =>
      ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab2, scientistId, technologyId: 'synchronized-sound' as const })))
    const projectId = staged.technology.projects.find(p => p.technologyId === 'synchronized-sound' && p.studioId === staged.hollywood!.playerStudioId)!.id
    staged = applyActions(staged, [{ kind: 'beginResearch', projectId, budgetPerWeek: 60_000 }])
    // Sanity: this is p13b-s2-cooperation.test.ts's own case (iii) before any release.
    expect(researchWeekQuote(staged, staged.technology.projects.find(p => p.id === projectId)!).output).toBe(7.875)

    const rl2 = rowLabId(staged, lab2)
    const building2 = buildingIdOf(staged, lab2)
    const session = new BridgeSession(staged, 'p13b-s2-labs-7-release')
    dispatch(session, building2, `release-${rl2}-${ids[4]}`)
    const released = session.gameState.technology.projects.find(p => p.id === projectId)!
    expect(occupiedSeats(released, lab2)).toHaveLength(1)

    const ticked = tick(session.gameState)
    const tickedProject = ticked.technology.projects.find(p => p.id === projectId)!
    const receipt = tickedProject.weeks.at(-1)!
    expect(receipt.spend).toBe(50_000)
    expect(receipt.labs).toEqual(expect.arrayContaining([
      { laboratoryFacilityId: lab1, seatTalentIds: ids.slice(0, 4), spend: 40_000, rawUnits: 120_000 },
      { laboratoryFacilityId: lab2, seatTalentIds: [ids[5]], spend: 10_000, rawUnits: 30_000 },
    ]))
    expect(receipt.units / 160_000).toBe(6.9375)

    const nextSession = new BridgeSession(ticked, 'p13b-s2-labs-7-ticked')
    const lab = labPage(nextSession, building2, nextRequestId('release-after'))
    const project = lab.projects.find(p => p.projectId === projectId)!
    const lab2Row = project.weekly.labs.find(l => l.laboratoryFacilityId === lab2)!
    expect(lab2Row).toEqual({ laboratoryFacilityId: lab2, seats: 1, spend: 10_000, rawUnits: 30_000 })
    const lastReceipt = project.receipts.at(-1)!
    const lab2ReceiptRow = lastReceipt.labs!.find(l => l.laboratoryFacilityId === lab2)!
    expect(lab2ReceiptRow).toEqual({ laboratoryFacilityId: lab2, seatTalentIds: [ids[5]], spend: 10_000, rawUnits: 30_000 })
  }, 60_000)
})

describe('case 8: player-safe — no rival project, seat or talent id ever appears', () => {
  it('the Laboratory page names only the player studio\'s own project and talent ids', () => {
    const world = p13bTwoLabWorld()
    const [lab1] = world.laboratoryFacilityIds
    const ids = world.candidateIds
    const rl1 = rowLabId(world.state, lab1)
    const building1 = buildingIdOf(world.state, lab1)
    const session = new BridgeSession(world.state, 'p13b-s2-labs-8-player-safe')
    dispatch(session, building1, `assign-${rl1}-${ids[0]}-synchronized-sound`)
    const own = session.gameState.hollywood!.playerStudioId
    const rivalStudioIds = session.gameState.hollywood!.identities.filter(i => i.studioId !== own).map(i => i.studioId)
    expect(rivalStudioIds.length).toBeGreaterThan(0) // sanity: this generated world actually has rivals to leak

    const lab = labPage(session, building1, nextRequestId('player-safe'))
    for (const project of lab.projects) {
      expect(project.projectId.startsWith(own)).toBe(true)
      for (const seat of project.seats) expect(rivalStudioIds).not.toContain(seat.talentId)
      for (const receipt of project.receipts) for (const talentId of receipt.seatTalentIds) expect(rivalStudioIds).not.toContain(talentId)
    }
    const json = JSON.stringify(lab)
    for (const rivalId of rivalStudioIds) expect(json).not.toContain(rivalId)
  }, 30_000)
})
