import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import {
  convertV22ToV23,
  exportSave,
  importSave,
  makeSave,
  migrateToV20,
  migrateToV21,
  migrateToV22,
  migrateToV23,
  validateSave,
  validateSaveV22,
} from '../src/core/save.js'
import { initialPhysicalPlans } from '../src/core/physicalPlans.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { p13aLaboratorySlice } from '../src/harness/p13a/fixtures.js'

// P13B-S3 plan test 7 (task expansion, 2026-09-16), core-only half. Requirement-
// derived from "Save V23 + Save As" in docs/engineering/playability-launch-review/
// plans/P13B-HEADLESS-PLAN.md. Written against the contract as if `SaveFileV23`,
// `validateSaveV23`, `convertV22ToV23`, `migrateToV23` and `physicalPlans.ts`
// already existed — RED by design. Genuine fixtures only for the migration
// chain (sha256-checked against tests/fixtures/p13b/PROVENANCE.md, the same
// technique tests/p13b-s2-save-v22.test.ts uses for its own V21 chain); every
// hash below was computed directly against the checked-in gzip bytes with
// `shasum -a 256` on 2026-09-16, not hand-copied from the markdown table.
//
// The Save-As / campaign-library half of test 7 (A11: a copy keeps the same
// plan ids and advances independently) needs the bridge session to drive
// `saveAs`, and lives in its own file per the task assignment:
// tests/bridge-p13b-s3-save-as.test.ts.

const load = (relative: string) => gunzipSync(readFileSync(new URL(relative, import.meta.url))).toString('utf8')
function assertSha256(json: string, expected: string) {
  expect(createHash('sha256').update(json).digest('hex')).toBe(expected)
}

const V22_FIXTURES = [
  { file: './fixtures/p13b/legacy-v22-staffed-4-seats-263.json.gz', sha256: '6ccbf3ce5802906c4f600160aaf2ef1bc246f96809e6a34000d267b161607a31', week: 263 },
  { file: './fixtures/p13b/legacy-v22-two-labs-cooperating-782.json.gz', sha256: '4d86372f4e98c23a9f8ef85f8fc8c29008c7ad8c9eb496345968145d88229809', week: 782 },
]
const V21_FIXTURES = [
  { file: './fixtures/p13b/legacy-v21-staffed-4-seats-263.json.gz', sha256: 'dc47066bd010a669cbd08dedff50bd48246045e636cedb757786b25ca9667624' },
  { file: './fixtures/p13b/legacy-v21-released-paused-266.json.gz', sha256: '0c5fa9d8082256286c3c7a9dad588c4722c8370a0cfc70d2029046de872722da' },
  { file: './fixtures/p13b/legacy-v21-two-labs-two-briefs-783.json.gz', sha256: '24fffa82738214b2ca5e01858d95d6851bf89faba0588603d0ce02e495f9a6f9' },
]
const V20_FIXTURES = [
  { file: './fixtures/p13b/legacy-v20-research-active-280.json.gz', sha256: '18e8a61e84e48111eaf2862034951d1d69d733b8ab0729566190038e975272c7' },
  { file: './fixtures/p13b/legacy-v20-research-paused-expired-468.json.gz', sha256: '846f1ce03891436c8f025048dd7f4707564d8f13a0c5329c2c5b8353c29d8ea0' },
  { file: './fixtures/p13b/legacy-v20-research-complete-operational-315.json.gz', sha256: '0633617cba65554d5b230a2d087a91ef6d70f3ffba70b1cdc2ee6ed538e8c1f0' },
]

describe('P13B-S3 Save V23 (test 7)', () => {
  it.each(V22_FIXTURES)('migrates the genuine V22 fixture $file to V23 with an empty physicalPlans root, byte-identical otherwise', ({ file, sha256, week }) => {
    const json = load(file)
    assertSha256(json, sha256)
    const parsed = JSON.parse(json) as { saveVersion: number }
    expect(parsed.saveVersion).toBe(22)
    const validated = validateSaveV22(parsed) // validateSaveV22 stays frozen and accepts the genuine V22 fixture
    expect(validated.state.market.tick).toBe(week)

    const migrated = migrateToV23(parsed)
    expect(migrated.saveVersion).toBe(23)
    expect((migrated.state as unknown as { physicalPlans: unknown }).physicalPlans).toEqual(initialPhysicalPlans())
    const strip = (s: unknown) => JSON.stringify({ ...(s as Record<string, unknown>), physicalPlans: undefined })
    expect(strip(migrated.state)).toBe(strip(validated.state))
  })

  it('convertV22ToV23 adds the empty root directly from a validated V22 envelope (the named export the contract pins)', () => {
    const json = load(V22_FIXTURES[0]!.file)
    const validated = validateSaveV22(JSON.parse(json))
    const converted = convertV22ToV23(validated)
    expect(converted.saveVersion).toBe(23)
    expect((converted.state as unknown as { physicalPlans: unknown }).physicalPlans).toEqual(initialPhysicalPlans())
  })

  it.each(V21_FIXTURES)('chains the genuine V21 fixture $file through V22 to V23', ({ file, sha256 }) => {
    const json = load(file)
    assertSha256(json, sha256)
    const migrated = migrateToV23(JSON.parse(json))
    expect(migrated.saveVersion).toBe(23)
    expect((migrated.state as unknown as { physicalPlans: unknown }).physicalPlans).toEqual(initialPhysicalPlans())
  })

  it.each(V20_FIXTURES)('chains the genuine V20 fixture $file through V21, V22 to V23', ({ file, sha256 }) => {
    const json = load(file)
    assertSha256(json, sha256)
    const migrated = migrateToV23(JSON.parse(json))
    expect(migrated.saveVersion).toBe(23)
    expect((migrated.state as unknown as { physicalPlans: unknown }).physicalPlans).toEqual(initialPhysicalPlans())
  })

  it('migrateToV22 / migrateToV21 / migrateToV20 refuse a live save', () => {
    // P14B.1: the live writer moved on to V29, so the save these downgrade
    // guards see is a V29 envelope now; each still refuses at ITS OWN nearest
    // guard, which reports the true incoming version, not V23.
    const live = makeSave(p13aLaboratorySlice())
    expect(() => migrateToV22(live)).toThrow(/cannot downgrade SaveFileV30/)
    expect(() => migrateToV21(live)).toThrow(/cannot downgrade SaveFileV30/)
    expect(() => migrateToV20(live)).toThrow(/cannot downgrade SaveFileV30/)
  })

  it('makeSave writes saveVersion 29', () => {
    expect(makeSave(p13aLaboratorySlice()).saveVersion).toBe(30)
  })

  it('an unknown saveVersion 31 is refused, naming the handled range', () => {
    const forged = { ...makeSave(p13aLaboratorySlice()), saveVersion: 31 }
    expect(() => validateSave(forged)).toThrow(/versions 1 through 30 only/)
  })

  it('save/reload mid-queue continues identically (byte for byte)', () => {
    const base = p13aLaboratorySlice()
    const laboratoryFacilityId = base.operations.facilities.find(f => f.capability === 'laboratory')!.id
    const queued = applyActions(base, [{
      kind: 'queuePhysicalPlan',
      work: { kind: 'installation', blueprintId: 'acoustic-instruments', target: { facilityId: laboratoryFacilityId } },
      approvedMaximumDebit: 350_000,
    } as never])
    const json = exportSave(makeSave(queued))
    expect(exportSave(importSave(json))).toBe(json) // round-trip is itself byte-identical

    const uninterrupted = tick(tick(queued))
    const reloadedState = (importSave(json) as unknown as { state: GameState }).state
    const resumed = tick(tick(reloadedState))
    expect(exportSave(makeSave(resumed))).toBe(exportSave(makeSave(uninterrupted)))
  })
})
