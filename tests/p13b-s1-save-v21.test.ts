import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import {
  exportSave,
  importSave,
  makeSave,
  migrateToV19,
  migrateToV20,
  migrateToV21,
  migrateToV33,
} from '../src/core/save.js'
import type { SaveFileV19, SaveFileV20 } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { eligibleSeatIds } from '../src/core/technology.js'
import type { GameState, GameStateV20, GameStateV21 } from '../src/core/types.js'

// P13B-S1 plan tests 8 (V20->V21 migration) and 10 (campaign isolation). The
// three legacy V20 fixtures were minted at e2e409e80eccb6a7fd49fa16aa0f750faeb51253
// (docs/.../tests/fixtures/p13b/PROVENANCE.md) — original inputs, not regenerated here.
const load = (relative: string) => gunzipSync(readFileSync(new URL(relative, import.meta.url))).toString('utf8')

/** Every root byte except `technology` is untouched by the lift; `technology`'s
 * non-project facts (access/adoptions/productions/recordingStartedWeek) are
 * compared explicitly since `weeks`/`legacy`/`seats` are the only new shape. */
function assertRootUnchanged(before: GameStateV20, after: GameStateV21) {
  const strip = (state: GameStateV20 | GameStateV21) => JSON.stringify({ ...state, technology: undefined })
  expect(strip(after)).toBe(strip(before))
  expect(after.technology.access).toEqual(before.technology.access)
  expect(after.technology.adoptions).toEqual(before.technology.adoptions)
  expect(after.technology.productions).toEqual(before.technology.productions)
  expect(after.technology.recordingStartedWeek).toBe(before.technology.recordingStartedWeek)
}

function roundTripsByteIdentical(state: GameState): string {
  const direct = exportSave(makeSave(state))
  const restored = migrateToV33(importSave(direct)).state
  expect(exportSave(makeSave(restored))).toBe(direct)
  return direct
}

const FIXTURES = [
  { file: './fixtures/p13b/legacy-v20-research-active-280.json.gz', week: 280, verifiedWork: 30, expenditure: 200_000 },
  { file: './fixtures/p13b/legacy-v20-research-paused-expired-468.json.gz', week: 468, verifiedWork: 10, expenditure: 0 },
  { file: './fixtures/p13b/legacy-v20-research-complete-operational-315.json.gz', week: 315, verifiedWork: 64, expenditure: 430_000 },
] as const
const SCIENTIST_ID = 't-sci-00'
const LAB_ID = 'facility-research-laboratory'

describe('P13B-S1 V20 to V21 migration (test 8)', () => {
  for (const fixture of FIXTURES) {
    it(`lifts ${fixture.file} into one retained seat and a frozen legacy prefix`, () => {
      const json = load(fixture.file)
      const before = importSave(json) as SaveFileV20
      expect(before.saveVersion).toBe(20)
      const migrated = migrateToV21(importSave(json))
      expect(migrated.saveVersion).toBe(21)
      expect(migrated.state.technology.version).toBe(2)
      const project = migrated.state.technology.projects[0]!
      expect(project.seats).toEqual([{ talentId: SCIENTIST_ID, laboratoryFacilityId: LAB_ID, assignedWeek: fixture.week, releasedWeek: null }])
      expect(project.weeks).toEqual([])
      expect(project.legacy).toEqual({ scientistId: SCIENTIST_ID, throughWeek: fixture.week, verifiedWork: fixture.verifiedWork, expenditure: fixture.expenditure })
      assertRootUnchanged(before.state, migrated.state)
    })
  }

  it('refuses to downgrade a V21 save to V20 or V19', () => {
    const migrated = migrateToV21(importSave(load(FIXTURES[0].file)))
    expect(() => migrateToV20(migrated)).toThrow(/cannot downgrade/)
    expect(() => migrateToV19(migrated)).toThrow(/cannot downgrade/)
  })

  it('migrates the accepted V19 product fixture through V20 into an empty V21 technology root', () => {
    const bytes = load('./fixtures/p13a/accepted-v19.json.gz')
    expect(createHash('sha256').update(bytes).digest('hex')).toBe('dc76a253e706090bb177d1d54c0d1c7742cf1d3c37ff4d13cb5ec559a1e1ad81')
    const v19 = importSave(bytes) as SaveFileV19
    const migrated = migrateToV21(importSave(bytes))
    expect(migrated.saveVersion).toBe(21)
    expect(migrated.state.technology).toEqual({
      version: 2, recordingStartedWeek: v19.state.market.tick, projects: [], access: [], adoptions: [], productions: [],
    })
  })

  it('continues the migrated active-280 project lawfully for one more funded week and re-saves byte-identically', () => {
    // Lifted all the way to the live boundary (V32, P14B.7 sweep — was V26 at
    // authoring): this result flows into `roundTripsByteIdentical`, which calls
    // `makeSave` directly and requires the live-shaped leaves `migrateToV21`
    // alone never adds.
    const migrated = migrateToV33(importSave(load('./fixtures/p13b/legacy-v20-research-active-280.json.gz')))
    const next = tick(migrated.state)
    const project = next.technology.projects[0]!
    expect(project.expenditure).toBe(210_000)
    expect(project.verifiedWork).toBe(31.5)
    expect(project.weeks).toEqual([{ week: 280, seatTalentIds: [SCIENTIST_ID], spend: 10_000, units: 240_000,
      labs: [{ laboratoryFacilityId: LAB_ID, seatTalentIds: [SCIENTIST_ID], spend: 10_000, rawUnits: 30_000 }] }])
    roundTripsByteIdentical(next)
  })

  it('keeps the migrated paused-expired seat retained but ineligible, refuses resumeResearch, then accepts it after rehiring the same id', () => {
    const migrated = migrateToV33(importSave(load('./fixtures/p13b/legacy-v20-research-paused-expired-468.json.gz'))).state
    const project = migrated.technology.projects[0]!
    expect(project.seats).toEqual([{ talentId: SCIENTIST_ID, laboratoryFacilityId: LAB_ID, assignedWeek: 468, releasedWeek: null }])
    expect(eligibleSeatIds(migrated, project)).toEqual([])
    expect(() => applyActions(migrated, [{ kind: 'resumeResearch', projectId: project.id }])).toThrow(/Employ and assign/)
    const rehired = applyActions(migrated, [{ kind: 'recruitScientist', laboratoryFacilityId: project.laboratoryFacilityId, scientistId: SCIENTIST_ID }])
    expect(eligibleSeatIds(rehired, rehired.technology.projects[0]!)).toEqual([SCIENTIST_ID])
    const resumed = applyActions(rehired, [{ kind: 'resumeResearch', projectId: project.id }])
    expect(resumed.technology.projects[0]!.status).toBe('active')
  })
})

describe('P13B-S1 campaign isolation (test 10)', () => {
  it('produces independent migrated copies from the same fixture; advancing one never touches the other', () => {
    const json = load('./fixtures/p13b/legacy-v20-research-active-280.json.gz')
    // Lifted to the live boundary (V32, P14B.7 sweep — was V26 at authoring) —
    // `b.state` round-trips through `makeSave` below, which requires the
    // live-shaped leaves.
    const a = migrateToV33(importSave(json))
    const b = migrateToV33(importSave(json))
    expect(a.state).not.toBe(b.state)
    expect(a.state.technology).not.toBe(b.state.technology)
    expect(a.state.technology.projects).not.toBe(b.state.technology.projects)
    expect(a.state.technology.projects[0]!.seats).not.toBe(b.state.technology.projects[0]!.seats)
    const before = exportSave(makeSave(b.state))
    const advanced = tick(a.state)
    expect(exportSave(makeSave(b.state))).toBe(before)
    expect(advanced.market.tick).toBe(a.state.market.tick + 1)
  })
})
