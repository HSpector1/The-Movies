import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import {
  exportSave,
  importSave,
  makeSave,
  migrateToV19,
  migrateToV20,
  migrateToV21,
  migrateToV22,
  migrateToV29,
  validateSave,
  validateSaveV21,
} from '../src/core/save.js'
import type { SaveFileV20, SaveFileV21, SaveFileV22 } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import type { GameState, GameStateV21, GameStateV22 } from '../src/core/types.js'

// P13B-S2 plan test 8 (task expansion, 2026-09-16): the V21→V22 migration (×8
// numerator rebase, derived per-Laboratory `labs` rows, `cooperationFromWeek`
// stamped at the migration week) over the three genuine V21 fixtures minted at
// the last V21 writer (e68de38, before it moved to V22 — see
// tests/fixtures/p13b/PROVENANCE.md), plus the three frozen V20 fixtures chained
// V20→V21→V22. Every fixture's sha256 is checked against PROVENANCE before it is
// migrated, exactly as tests/p13b-s1-save-v21.test.ts does for its own V20 set.
const load = (relative: string) => gunzipSync(readFileSync(new URL(relative, import.meta.url))).toString('utf8')

function assertSha256(json: string, expected: string) {
  expect(createHash('sha256').update(json).digest('hex')).toBe(expected)
}

/** Every root byte except `technology` is untouched by the V21→V22 lift. */
function assertRootUnchangedExceptTechnology(before: GameStateV21, after: GameStateV22) {
  const strip = (state: GameStateV21 | GameStateV22) => JSON.stringify({ ...state, technology: undefined })
  expect(strip(after)).toBe(strip(before))
}

/** P13B-S6: the LIVE writer is V26, so a V22 envelope is lifted once, through the
 * real migration, before the live round trip. The V21→V22 lift assertions above
 * stay exactly where they were — this file proves the V22 migration, not V26. */
function live(save: SaveFileV22): GameState {
  return migrateToV29(save).state
}

function roundTripsByteIdentical(state: GameState): string {
  const direct = exportSave(makeSave(state))
  const restored = migrateToV29(importSave(direct)).state
  expect(exportSave(makeSave(restored))).toBe(direct)
  return direct
}

const V21_FIXTURES = [
  {
    file: './fixtures/p13b/legacy-v21-staffed-4-seats-263.json.gz',
    sha256: 'dc47066bd010a669cbd08dedff50bd48246045e636cedb757786b25ca9667624',
    week: 263,
    projects: [{
      technologyId: 'synchronized-sound', verifiedWork: 18, expenditure: 120_000,
      receipts: [
        { week: 260, seatTalentIds: ['t-sci-00', 't-sci-01', 't-sci-02', 't-sci-03'], spend: 40_000, oldUnits: 120_000, laboratoryFacilityId: 'facility-research-laboratory' },
        { week: 261, seatTalentIds: ['t-sci-00', 't-sci-01', 't-sci-02', 't-sci-03'], spend: 40_000, oldUnits: 120_000, laboratoryFacilityId: 'facility-research-laboratory' },
        { week: 262, seatTalentIds: ['t-sci-00', 't-sci-01', 't-sci-02', 't-sci-03'], spend: 40_000, oldUnits: 120_000, laboratoryFacilityId: 'facility-research-laboratory' },
      ],
    }],
  },
  {
    file: './fixtures/p13b/legacy-v21-released-paused-266.json.gz',
    sha256: '0c5fa9d8082256286c3c7a9dad588c4722c8370a0cfc70d2029046de872722da',
    week: 266,
    projects: [{
      technologyId: 'synchronized-sound', verifiedWork: 27, expenditure: 180_000,
      receipts: [
        { week: 260, seatTalentIds: ['t-sci-00', 't-sci-01', 't-sci-02', 't-sci-03'], spend: 40_000, oldUnits: 120_000, laboratoryFacilityId: 'facility-research-laboratory' },
        { week: 261, seatTalentIds: ['t-sci-00', 't-sci-01', 't-sci-02', 't-sci-03'], spend: 40_000, oldUnits: 120_000, laboratoryFacilityId: 'facility-research-laboratory' },
        { week: 262, seatTalentIds: ['t-sci-00', 't-sci-01', 't-sci-02', 't-sci-03'], spend: 40_000, oldUnits: 120_000, laboratoryFacilityId: 'facility-research-laboratory' },
        { week: 263, seatTalentIds: ['t-sci-01', 't-sci-02', 't-sci-03'], spend: 30_000, oldUnits: 90_000, laboratoryFacilityId: 'facility-research-laboratory' },
        { week: 264, seatTalentIds: ['t-sci-01', 't-sci-02', 't-sci-03'], spend: 30_000, oldUnits: 90_000, laboratoryFacilityId: 'facility-research-laboratory' },
      ],
    }],
  },
  {
    file: './fixtures/p13b/legacy-v21-two-labs-two-briefs-783.json.gz',
    sha256: '24fffa82738214b2ca5e01858d95d6851bf89faba0588603d0ce02e495f9a6f9',
    week: 783,
    projects: [
      {
        technologyId: 'synchronized-sound', verifiedWork: 27, expenditure: 180_000,
        receipts: [ // seats span two Laboratories every week -> labs: null (unrecoverable split)
          { week: 780, seatTalentIds: ['t-sci-00', 't-sci-01', 't-sci-02', 't-sci-03', 't-sci-04', 't-sci-05'], spend: 60_000, oldUnits: 180_000, laboratoryFacilityId: null },
          { week: 781, seatTalentIds: ['t-sci-00', 't-sci-01', 't-sci-02', 't-sci-03', 't-sci-04', 't-sci-05'], spend: 60_000, oldUnits: 180_000, laboratoryFacilityId: null },
          { week: 782, seatTalentIds: ['t-sci-00', 't-sci-01', 't-sci-02', 't-sci-03', 't-sci-04', 't-sci-05'], spend: 60_000, oldUnits: 180_000, laboratoryFacilityId: null },
        ],
      },
      {
        technologyId: 'lighting-control-01', verifiedWork: 9, expenditure: 60_000,
        receipts: [ // seats sit on one Laboratory every week -> one derived row
          { week: 780, seatTalentIds: ['t-sci-06', 't-sci-07'], spend: 20_000, oldUnits: 60_000, laboratoryFacilityId: 'facility-research-laboratory-2' },
          { week: 781, seatTalentIds: ['t-sci-06', 't-sci-07'], spend: 20_000, oldUnits: 60_000, laboratoryFacilityId: 'facility-research-laboratory-2' },
          { week: 782, seatTalentIds: ['t-sci-06', 't-sci-07'], spend: 20_000, oldUnits: 60_000, laboratoryFacilityId: 'facility-research-laboratory-2' },
        ],
      },
    ],
  },
] as const

const V20_FIXTURES = [
  { file: './fixtures/p13b/legacy-v20-research-active-280.json.gz', sha256: '18e8a61e84e48111eaf2862034951d1d69d733b8ab0729566190038e975272c7', week: 280, verifiedWork: 30, expenditure: 200_000 },
  { file: './fixtures/p13b/legacy-v20-research-paused-expired-468.json.gz', sha256: '846f1ce03891436c8f025048dd7f4707564d8f13a0c5329c2c5b8353c29d8ea0', week: 468, verifiedWork: 10, expenditure: 0 },
  { file: './fixtures/p13b/legacy-v20-research-complete-operational-315.json.gz', sha256: '0633617cba65554d5b230a2d087a91ef6d70f3ffba70b1cdc2ee6ed538e8c1f0', week: 315, verifiedWork: 64, expenditure: 430_000 },
] as const
const SCIENTIST_ID = 't-sci-00'
const LAB_ID = 'facility-research-laboratory'

describe('P13B-S2 V21 to V22 migration (test 8)', () => {
  for (const fixture of V21_FIXTURES) {
    it(`lifts ${fixture.file}: every receipt ×8, per-Laboratory rows derived honestly, cooperationFromWeek stamped at the fixture's own week`, () => {
      const json = load(fixture.file)
      assertSha256(json, fixture.sha256)
      const before = importSave(json) as SaveFileV21
      expect(before.saveVersion).toBe(21)
      expect(() => validateSaveV21(before)).not.toThrow() // frozen V21 law still accepts the genuine original

      const migrated = migrateToV22(importSave(json))
      expect(migrated.saveVersion).toBe(22)
      expect(migrated.state.technology.version).toBe(3)
      expect(migrated.state.technology.cooperationFromWeek).toBe(fixture.week)
      expect(migrated.state.market.tick).toBe(fixture.week)

      for (const expectedProject of fixture.projects) {
        const project = migrated.state.technology.projects.find(p => p.technologyId === expectedProject.technologyId && p.studioId === migrated.state.hollywood!.playerStudioId)!
        expect(project.verifiedWork).toBe(expectedProject.verifiedWork)
        expect(project.expenditure).toBe(expectedProject.expenditure)
        expect(project.status).toBe(before.state.technology.projects.find(p => p.technologyId === expectedProject.technologyId && p.studioId === before.state.hollywood!.playerStudioId)!.status)
        expect(project.seats).toEqual(before.state.technology.projects.find(p => p.technologyId === expectedProject.technologyId && p.studioId === before.state.hollywood!.playerStudioId)!.seats)
        expect(project.weeks).toHaveLength(expectedProject.receipts.length)
        expectedProject.receipts.forEach((expectedReceipt, i) => {
          const receipt = project.weeks[i]!
          expect(receipt.week).toBe(expectedReceipt.week)
          expect(receipt.seatTalentIds).toEqual(expectedReceipt.seatTalentIds)
          expect(receipt.spend).toBe(expectedReceipt.spend)
          expect(receipt.units).toBe(expectedReceipt.oldUnits * 8)
          if (expectedReceipt.laboratoryFacilityId === null) {
            expect(receipt.labs).toBeNull()
          } else {
            expect(receipt.labs).toEqual([{
              laboratoryFacilityId: expectedReceipt.laboratoryFacilityId, seatTalentIds: expectedReceipt.seatTalentIds,
              spend: expectedReceipt.spend, rawUnits: expectedReceipt.oldUnits,
            }])
          }
        })
      }
      assertRootUnchangedExceptTechnology(before.state, migrated.state)
      expect(migrated.state.technology.access).toEqual(before.state.technology.access)
      expect(migrated.state.technology.adoptions).toEqual(before.state.technology.adoptions)
      expect(migrated.state.technology.productions).toEqual(before.state.technology.productions)
      expect(migrated.state.technology.recordingStartedWeek).toBe(before.state.technology.recordingStartedWeek)
      roundTripsByteIdentical(live(migrated))
    })
  }

  it('continues the migrated active staffed-4-seats-263 project for one more funded week (now carrying its own labs row) and re-saves byte-identically', () => {
    const migrated = migrateToV22(importSave(load('./fixtures/p13b/legacy-v21-staffed-4-seats-263.json.gz')))
    const next = tick(live(migrated))
    const project = next.technology.projects.find(p => p.technologyId === 'synchronized-sound' && p.studioId === next.hollywood!.playerStudioId)!
    expect(project.expenditure).toBe(160_000) // 120,000 + one more $40,000 week
    expect(project.verifiedWork).toBe(24) // 18 + one more 6-unit week (4 seats, $40,000, single Laboratory)
    const receipt = project.weeks.at(-1)!
    expect(receipt).toEqual({
      week: 263, seatTalentIds: ['t-sci-00', 't-sci-01', 't-sci-02', 't-sci-03'], spend: 40_000, units: 8 * 120_000,
      labs: [{ laboratoryFacilityId: LAB_ID, seatTalentIds: ['t-sci-00', 't-sci-01', 't-sci-02', 't-sci-03'], spend: 40_000, rawUnits: 120_000 }],
    })
    roundTripsByteIdentical(next)
  })

  it('refuses to downgrade a V22 save to V21, V20 or V19', () => {
    const migrated = migrateToV22(importSave(load('./fixtures/p13b/legacy-v21-staffed-4-seats-263.json.gz')))
    expect(() => migrateToV21(migrated)).toThrow(/cannot downgrade SaveFileV22/)
    expect(() => migrateToV20(migrated)).toThrow(/cannot downgrade SaveFileV22/)
    expect(() => migrateToV19(migrated)).toThrow(/cannot downgrade SaveFileV22/)
  })

  for (const fixture of V20_FIXTURES) {
    it(`chains V20→V21→V22 for ${fixture.file}: the S1 legacy prefix survives intact, weeks stays empty`, () => {
      const json = load(fixture.file)
      assertSha256(json, fixture.sha256)
      const before = importSave(json) as SaveFileV20
      expect(before.saveVersion).toBe(20)
      const migrated = migrateToV22(importSave(json))
      expect(migrated.saveVersion).toBe(22)
      expect(migrated.state.technology.version).toBe(3)
      expect(migrated.state.technology.cooperationFromWeek).toBe(fixture.week)
      const project = migrated.state.technology.projects[0]!
      expect(project.weeks).toEqual([])
      expect(project.seats).toEqual([{ talentId: SCIENTIST_ID, laboratoryFacilityId: LAB_ID, assignedWeek: fixture.week, releasedWeek: null }])
      expect(project.legacy).toEqual({ scientistId: SCIENTIST_ID, throughWeek: fixture.week, verifiedWork: fixture.verifiedWork, expenditure: fixture.expenditure })
      roundTripsByteIdentical(live(migrated))
    })
  }
})

describe('P13B-S2 envelope law at the live writer (test 8)', () => {
  it('makeSave always writes the live saveVersion 26', () => {
    const migrated = migrateToV22(importSave(load('./fixtures/p13b/legacy-v21-staffed-4-seats-263.json.gz')))
    expect(makeSave(live(migrated)).saveVersion).toBe(29)
  })

  it('refuses an unknown saveVersion 31 with the updated range', () => {
    const migrated = migrateToV22(importSave(load('./fixtures/p13b/legacy-v21-staffed-4-seats-263.json.gz')))
    const save = makeSave(live(migrated))
    expect(() => validateSave({ ...save, saveVersion: 31 })).toThrow(/versions 1 through 30 only/)
  })

  it('round-trips a migrated two-Laboratory save through exportSave/importSave/migrateToV29 byte-identically', () => {
    const migrated = migrateToV22(importSave(load('./fixtures/p13b/legacy-v21-two-labs-two-briefs-783.json.gz')))
    const direct = exportSave(makeSave(live(migrated)))
    const restored = migrateToV29(importSave(direct)).state
    expect(exportSave(makeSave(restored))).toBe(direct)
  })
})

describe('P13B-S2 campaign isolation across the migrated copies (mirrors the S1 case)', () => {
  it('produces independent migrated copies from the same V21 fixture; advancing one never touches the other', () => {
    const json = load('./fixtures/p13b/legacy-v21-staffed-4-seats-263.json.gz')
    const a = live(migrateToV22(importSave(json)))
    const b = live(migrateToV22(importSave(json)))
    expect(a).not.toBe(b)
    expect(a.technology).not.toBe(b.technology)
    expect(a.technology.projects).not.toBe(b.technology.projects)
    const before = exportSave(makeSave(b))
    const advanced = tick(a)
    expect(exportSave(makeSave(b))).toBe(before)
    expect(advanced.market.tick).toBe(a.market.tick + 1)
  })
})
