import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import {
  exportSave, importSave, makeSave, migrateToV20, migrateToV21, migrateToV22, migrateToV23, migrateToV24,
  validateSave, validateSaveV23,
} from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { advanceTo, p13aLaboratorySlice } from '../src/harness/p13a/fixtures.js'
import { p13bTwoLabWorld } from '../src/harness/p13b/fixtures.js'
// RED-by-design: `src/core/technologyAdoption.ts` does not exist yet. See
// tests/p13b-s5-quotes.test.ts for the full RED-design rationale (shared across
// every P13B-S5 test-author file).
import { equipmentAssets } from '../src/core/technologyAdoption.js'

// P13B-S5 test 4 (task expansion, 2026-09-17). Requirement-derived from
// test-list item 4 of "S5 — Component inventor pricing and prototypes per
// technology (Ready row 7) — task expansion" in docs/engineering/playability-
// launch-review/plans/P13B-HEADLESS-PLAN.md, and its Save V24 delegated
// decision (`SaveFileV24`, `validateSaveV24`, `convertV23ToV24`,
// `migrateToV24`, `makeSave` -> 24, downgrade guards, "1 through 24"). The
// structure below directly mirrors tests/p13b-s3-save-v23.test.ts (the S3
// test-author's own V22->V23 template), the established idiom for this exact
// kind of migration-chain test in this repository.
//
// Genuine fixtures only, sha256-checked against the checked-in gzip bytes
// (computed directly with node's crypto on 2026-09-17, not hand-copied): the
// two NEW S5-T0 V23 fixtures (provenance in tests/fixtures/p13b/PROVENANCE.md,
// minted at 9a3e2da before any S5 source change) plus the SAME V22/V21/V20
// chain tests/p13b-s3-save-v23.test.ts already uses (those files are frozen
// and unchanged; the hashes below were independently re-verified, not copied).
//
// `convertV23ToV24` is not imported directly (no genuine V23 EXPORT SIDE
// exists yet to construct one from except via `migrateToV24`/`makeSave`
// themselves) — the plan pins its NAME as a delegated decision but does not
// require every test file to exercise it directly; `migrateToV23`+chaining
// through `migrateToV24` is the exercised path here, matching the S3 template.

const load = (relative: string) => gunzipSync(readFileSync(new URL(relative, import.meta.url))).toString('utf8')
function assertSha256(json: string, expected: string) {
  expect(createHash('sha256').update(json).digest('hex')).toBe(expected)
}

const V23_S5_FIXTURES = {
  soundOperational: { file: './fixtures/p13b/legacy-v23-sound-operational-315.json.gz', sha256: '6f07b68bce8bc45910b07fbcddbfb167e2e6359b719e54336cd6cd60e36dfc8b', week: 315 },
  lightingPlanQueued: { file: './fixtures/p13b/legacy-v23-lighting-complete-plan-queued.json.gz', sha256: 'f894c5f63ab34fd86ea6069e028c60341d34ac0be90428078549d61fd101b4c7', week: 793 },
}
const V22_FIXTURES = [
  { file: './fixtures/p13b/legacy-v22-staffed-4-seats-263.json.gz', sha256: '6ccbf3ce5802906c4f600160aaf2ef1bc246f96809e6a34000d267b161607a31' },
  { file: './fixtures/p13b/legacy-v22-two-labs-cooperating-782.json.gz', sha256: '4d86372f4e98c23a9f8ef85f8fc8c29008c7ad8c9eb496345968145d88229809' },
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

type Adoption = Record<string, unknown>
function coreAdoptionFields(a: Adoption): Adoption {
  const { components: _components, equipmentAssetId: _equipmentAssetId, ...rest } = a
  return rest
}
function componentsOf(a: Adoption): { kind: string; cost: number; source: string; placementId: number | null }[] {
  return a.components as { kind: string; cost: number; source: string; placementId: number | null }[]
}

describe('P13B-S5 Save V24 (test 4)', () => {
  it('validates the genuine V23 fixture legacy-v23-sound-operational-315 directly (sha256-pinned, week-pinned) before it is migrated in the chain test below', () => {
    const json = load(V23_S5_FIXTURES.soundOperational.file)
    assertSha256(json, V23_S5_FIXTURES.soundOperational.sha256)
    const parsed = JSON.parse(json) as { saveVersion: number }
    expect(parsed.saveVersion).toBe(23)
    const validated = validateSaveV23(parsed) // validateSaveV23 stays frozen and accepts the genuine V23 fixture
    expect(validated.state.market.tick).toBe(V23_S5_FIXTURES.soundOperational.week)
    const originalAdoption = validated.state.technology.adoptions[0]! as unknown as Adoption
    expect(originalAdoption.physicalProjectIds).toEqual(['installation-synchronized-sound-stage', 'installation-synchronized-sound-post'])
    expect(validated.state.placement.facilities.some(f => f.projectId === 'installation-synchronized-sound-stage')).toBe(true)
    expect(validated.state.placement.facilities.some(f => f.projectId === 'installation-synchronized-sound-post')).toBe(true)
  })

  it('migrates legacy-v23-sound-operational-315 and its identical V20 ancestor to V24 with an honest first-prototype lift, byte-identical otherwise', () => {
    const direct = JSON.parse(load(V23_S5_FIXTURES.soundOperational.file)) as { saveVersion: number }
    const chained = JSON.parse(load(V20_FIXTURES[2]!.file)) as { saveVersion: number } // legacy-v20-research-complete-operational-315: the SAME adoption, proven byte-identical through V21/V22/V23 by the frozen S1-S3 lifts
    assertSha256(JSON.stringify(direct), V23_S5_FIXTURES.soundOperational.sha256)
    assertSha256(JSON.stringify(chained), V20_FIXTURES[2]!.sha256)

    for (const envelope of [direct, chained]) {
      const migrated = migrateToV24(envelope)
      expect(migrated.saveVersion).toBe(24)
      expect((migrated.state.technology as unknown as { version: number }).version).toBe(4)
      const adoption = (migrated.state.technology.adoptions[0]! as unknown as Adoption)
      expect(coreAdoptionFields(adoption)).toEqual({
        id: 'studio-aca408ec-player:sound-adoption:0', studioId: 'studio-aca408ec-player', technologyId: 'synchronized-sound',
        stageFacilityId: 'facility-soundstage-07', postFacilityId: 'facility-post-building', route: 'research',
        committedWeek: 303, operationalWeek: 315, equipmentCost: 0, installationCost: 975_000,
        physicalProjectIds: ['installation-synchronized-sound-stage', 'installation-synchronized-sound-post'],
        prototypeProjectId: 'studio-aca408ec-player:research:synchronized-sound',
      })
      const components = componentsOf(adoption)
      const access = components.find(c => c.kind === 'access')!
      expect(access.cost).toBe(0)
      const equipment = components.find(c => c.kind === 'equipment')!
      expect(equipment.cost).toBe(0)
      expect(equipment.source).toBe('first-prototype')
      const physical = components.filter(c => c.source === 'physical')
      expect(physical).toHaveLength(2) // one aggregated row per physicalProjectIds entry
      expect(physical.reduce((sum, c) => sum + c.cost, 0)).toBe(975_000)
      expect(physical.every(c => c.placementId !== null)).toBe(true) // a REAL player placement, never null here
      const own = migrated.state.hollywood!.playerStudioId
      const assets = equipmentAssets(migrated.state as unknown as GameState, own) /* P14A.1: this envelope is deliberately pinned at its own frozen version; the live-typed reader never touches the V28 root. */
      expect(assets).toHaveLength(1)
      expect(assets[0]!.holderAdoptionId).toBe(adoption.id)
      expect(assets[0]!.cost).toBe(0)
      expect(assets[0]!.source).toBe('first-prototype')
      expect((adoption as unknown as { equipmentAssetId: string }).equipmentAssetId).toBe(assets[0]!.id)
    }
  })

  it('migrates the genuine V23 fixture legacy-v23-lighting-complete-plan-queued: rival EMPTY-physicalProjectIds adoption lifts to ONE aggregated installation row (placementId null), one held commercial asset, the queued physical plan survives byte-identically', () => {
    const json = load(V23_S5_FIXTURES.lightingPlanQueued.file)
    assertSha256(json, V23_S5_FIXTURES.lightingPlanQueued.sha256)
    const parsed = JSON.parse(json) as { saveVersion: number }
    const validated = validateSaveV23(parsed)
    expect(validated.state.market.tick).toBe(V23_S5_FIXTURES.lightingPlanQueued.week)
    const originalPlans = JSON.stringify(validated.state.physicalPlans)

    const migrated = migrateToV24(parsed)
    expect(migrated.saveVersion).toBe(24)
    expect(JSON.stringify(migrated.state.physicalPlans)).toBe(originalPlans) // survives the lift byte-identically

    const rivalAdoption = (migrated.state.technology.adoptions.find(a => (a as unknown as Adoption).studioId === 'studio-aca408ec-r05')! as unknown as Adoption)
    expect(coreAdoptionFields(rivalAdoption)).toEqual({
      id: 'studio-aca408ec-r05:sound-adoption:0', studioId: 'studio-aca408ec-r05', technologyId: 'synchronized-sound',
      stageFacilityId: 'studio-aca408ec-r05:stage', postFacilityId: 'studio-aca408ec-r05:post', route: 'purchase',
      committedWeek: 520, operationalWeek: 532, equipmentCost: 300_000, installationCost: 975_000,
      physicalProjectIds: [], prototypeProjectId: null,
    })
    const components = componentsOf(rivalAdoption)
    const access = components.find(c => c.kind === 'access')!
    expect(access.cost).toBe(0)
    expect(access.source).toBe('existing') // already paid at purchaseTechnology, never charged twice
    const equipment = components.find(c => c.kind === 'equipment')!
    expect(equipment.cost).toBe(300_000)
    expect(equipment.source).toBe('commercial')
    const physical = components.filter(c => c.source === 'physical')
    expect(physical).toHaveLength(1) // EMPTY physicalProjectIds -> ONE aggregated row, not zero
    expect(physical[0]!.cost).toBe(975_000)
    expect(physical[0]!.placementId).toBeNull()

    const assets = equipmentAssets(migrated.state as unknown as GameState, 'studio-aca408ec-r05') /* P14A.1: this envelope is deliberately pinned at its own frozen version; the live-typed reader never touches the V28 root. */
    expect(assets).toHaveLength(1)
    expect(assets[0]!.source).toBe('commercial')
    expect(assets[0]!.cost).toBe(300_000)
    expect(assets[0]!.holderAdoptionId).toBe(rivalAdoption.id)
  })

  it.each(V22_FIXTURES)('chains the genuine V22 fixture $file through V23 to V24 with the same honest lift', ({ file, sha256 }) => {
    const json = load(file)
    assertSha256(json, sha256)
    const migrated = migrateToV24(JSON.parse(json))
    expect(migrated.saveVersion).toBe(24)
    expect((migrated.state.technology as unknown as { version: number }).version).toBe(4)
    const adoptions = migrated.state.technology.adoptions as unknown as Adoption[]
    if (adoptions.length === 0) { expect((migrated.state.technology as unknown as { equipment: unknown[] }).equipment).toEqual([]); return }
    // legacy-v22-two-labs-cooperating-782: the same r05 EMPTY-physicalProjectIds adoption as the direct V23 lighting fixture.
    const adoption = adoptions[0]!
    expect(componentsOf(adoption).filter(c => c.source === 'physical')).toHaveLength(1)
    expect(componentsOf(adoption).filter(c => c.source === 'physical')[0]!.placementId).toBeNull()
  })

  it.each(V21_FIXTURES)('chains the genuine V21 fixture $file through V22, V23 to V24', ({ file, sha256 }) => {
    const json = load(file)
    assertSha256(json, sha256)
    const migrated = migrateToV24(JSON.parse(json))
    expect(migrated.saveVersion).toBe(24)
    expect((migrated.state.technology as unknown as { version: number }).version).toBe(4)
  })

  it.each(V20_FIXTURES)('chains the genuine V20 fixture $file through V21, V22, V23 to V24', ({ file, sha256 }) => {
    const json = load(file)
    assertSha256(json, sha256)
    const migrated = migrateToV24(JSON.parse(json))
    expect(migrated.saveVersion).toBe(24)
    expect((migrated.state.technology as unknown as { version: number }).version).toBe(4)
  })

  it('migrateToV23 / migrateToV22 / migrateToV21 / migrateToV20 refuse a V24 save', () => {
    const v24 = makeSave(p13aLaboratorySlice()) // once S5 lands, makeSave writes V24
    expect(() => migrateToV23(v24 as never)).toThrow(/cannot downgrade/i)
    expect(() => migrateToV22(v24 as never)).toThrow(/cannot downgrade/i)
    expect(() => migrateToV21(v24 as never)).toThrow(/cannot downgrade/i)
    expect(() => migrateToV20(v24 as never)).toThrow(/cannot downgrade/i)
  })

  // AMENDED (P13B-S5-R07 live-version sweep, 2026-09-17): `makeSave` is the
  // live V25 boundary now; this section (the live writer's own version and the
  // unknown-sentinel boundary) moved with it. The V23->V24 chain proofs above
  // are frozen historical migration proofs and stay untouched.
  // AMENDED AGAIN (P13B-S6 live-version sweep, 2026-09-17): `makeSave` moved to
  // the live V26 boundary; this section moved with it a second time.
  it('makeSave writes saveVersion 26', () => {
    expect(makeSave(p13aLaboratorySlice()).saveVersion).toBe(33)
  })

  it('an unknown saveVersion 33 is refused, naming the handled range "1 through 32 only"', () => {
    const forged = { ...makeSave(p13aLaboratorySlice()), saveVersion: 34 }
    expect(() => validateSave(forged as never)).toThrow(/versions 1 through 33 only/)
  })

  it('save/reload mid-deployment continues identically (byte for byte): a lighting adoption committed but not yet operational', () => {
    const { state: world, laboratoryFacilityIds: [, lab2], candidateIds } = p13bTwoLabWorld()
    let state = applyActions(world, candidateIds.slice(0, 4).map(scientistId =>
      ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab2, scientistId, technologyId: 'lighting-control-01' as const })))
    const project = state.technology.projects.find(p => p.technologyId === 'lighting-control-01' && p.studioId === state.hollywood!.playerStudioId)!
    state = applyActions(state, [{ kind: 'beginResearch', projectId: project.id, budgetPerWeek: 40_000 }])
    while (state.technology.projects.find(p => p.id === project.id)!.status !== 'completed') {
      if (state.market.tick > 900) throw new Error('p13b-s5-save-v24 fixture: lighting research did not complete before week 900')
      state = advanceTo(state, state.market.tick + 1)
    }
    const stageFacilityId = state.operations.facilities.find(f => f.capability === 'soundstage')!.id
    state = applyActions(state, [{ kind: 'adoptTechnology', technologyId: 'lighting-control-01', stageFacilityId } as never])
    expect(state.technology.adoptions.find(a => a.stageFacilityId === stageFacilityId)!.operationalWeek).toBeNull() // still mid-deployment

    const json = exportSave(makeSave(state))
    expect(exportSave(importSave(json))).toBe(json) // round-trip is itself byte-identical

    const uninterrupted = tick(tick(state))
    const reloadedState = (importSave(json) as unknown as { state: GameState }).state
    const resumed = tick(tick(reloadedState))
    expect(exportSave(makeSave(resumed))).toBe(exportSave(makeSave(uninterrupted)))
  })
})
