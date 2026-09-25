// Installed after T0 KEEP and exact remote preservation a76242f2f4bdfda98e38ec706e3110ad6a9bb957.
// Original inert-draft commentary below is retained as provenance; actual RED recorded separately.
// INERT DRAFT ONLY — intended tests/p14b4-save-v30-compatibility.test.ts.
// Gate: qualified B-F2 + actually minted, independently pinned and published
// final outgoing-V29 corpus. No expected artifact hash may come from tested files.
// The three V30 API imports are EXPECTED NEW interfaces. Missing-export RED is
// interface RED only, never reached assertion coverage or a substitute for T0.
// Scope: frozen read/migration/downgrade boundaries; no gameplay policy/capacity.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { beforeAll, describe, expect, it } from 'vitest'
import { fnv1a64 } from '../src/core/math.js'
import { attachedPromiseDigest, promiseDigest, proposalDigest } from '../src/core/promises.js'
import {
  LIVE_SAVE_VERSION, convertV29ToV28, exportSave, importSave, loadSave, makeSave,
  validateSaveV29, validateSaveV30, migrateToV30, migrateToLive, convertV30ToV29,
} from '../src/core/save.js'
import { buildTalentProvenance } from '../src/core/aging.js'
import { initialCareerLifecycle } from '../src/core/careerLifecycle.js'

const NAMES = [
  'empty', 'current-p1', 'replaced-p1', 'withdrawn-p1', 'bound-open-p1',
  'kept-and-broken-p1', 'rival-current-p1', 'rival-shared-take-terminal-p1',
  'refused-p2-count-only-current-draft',
] as const
type CorpusName = typeof NAMES[number]
type OldSave = ReturnType<typeof validateSaveV29>
type OldPromise = OldSave['state']['promises'][number]
const FAMILIES = [
  'APPEARANCE_COUNT', 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', 'DIRECTING_COUNT',
  'PREFERRED_GENRE_OPPORTUNITY', 'SPECIFIC_PROJECT',
] as const
const VERSION_PAIRS = [[1, 1], [2, 3], [3, 2], [4, 4], [7, 11],
  [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]] as const
const PINS: Record<CorpusName, { compressed: string; raw: string }> = {
  empty: { compressed: '93c925eb5bf5027b963bb8d5222497d7b1325979be0830ea1d4ee41fecf6ab8d', raw: '2ca7733a9e7d60f13c0fc46d3646e6bb4711962d394523684717a5503afaea6a' },
  'current-p1': { compressed: '4947c31baa8cf9b948edd3a75b246df56c6d924e6d624ef1e18591d977f4cca7', raw: '03017370f16d9d2cf211f5653650a6d41452f73f0e8b96bb4aa154a6a946f4ca' },
  'replaced-p1': { compressed: 'bfd215039345d8ce223283f1f21e8d16f61113bb0a583bae194c6fa7067263ad', raw: '7d5dba1e1dcf78c361c42ccfe5637578a33e64e943662a6e201d699656eb9950' },
  'withdrawn-p1': { compressed: '4b0d27c32d231b2815853343fe56e8282f9f0b766e9dc41d871f3652c60206ca', raw: '95a01ac1e86772fc7e0e338fdc167261a244fb09e2b15d8c73e8ba4cd7a0bae7' },
  'bound-open-p1': { compressed: '48ec1b4474c2d808cae8d689dde74b8695fa5a95f2b51499a384a189e7fb880e', raw: '9d1a1ea177f021477fbd73d401e76bbb4a0448a680253082a100c1e5246862d9' },
  'kept-and-broken-p1': { compressed: '5ad270aafe913186d0570c3e876f7d76d0108ec73a600c1e9e6c8036c5851654', raw: 'd4ddc01941f4a814cf992ad101a3a03b0b64aaa0043953d2108fa234a0475c4c' },
  'rival-current-p1': { compressed: '560f645e0575a031d8a8e4b4320b968fdc2c25c264c05511f0d7cfe9494570d9', raw: '4902a1b2151529336091ffa30c488f2b6f2ecd818add1596eb8f37fbc81cb555' },
  'rival-shared-take-terminal-p1': { compressed: 'c4065d9c150c7741adb0901625fae787fc6fdd2804daad4803e777df9ed0fa46', raw: '51cb83b5a9cbbc8aa08fdd1e66a269d2e57ff77a98e88d08e134f5d6a16d7918' },
  'refused-p2-count-only-current-draft': { compressed: 'dedd68ed7a975d362838dbbbc5b32016181052a62d3b82a33dea3d95a63d5497', raw: '7f7529cb05ab29d2b27bb2855448d2b72e69b5b222b6b351698da0ec7632a253' },
}
const PRODUCER = {
  tested: '89b5ad2cfc6947ea07fb043ef5b23eba38d7dbde',
  published: 'c06db6eae2a1350317c018c6f108d115dcba7b19',
}
const corpusPath = (file: string) => new URL('./fixtures/p14/genuine-v29-pre-p2/' + file, import.meta.url)
const hash = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
const fixtureCache = new Map<CorpusName, { raw: string; save: OldSave; focusIds: string[] }>()

beforeAll(() => {
  for (const sha of Object.values(PRODUCER)) assert.match(sha, /^[a-f0-9]{40}$/,
    'T0 NOT COMPLETE: independent accepted producer/publication pins are unset; not behavioral RED')
  for (const name of NAMES) {
    assert.match(PINS[name].compressed, /^[a-f0-9]{64}$/, 'T0 NOT COMPLETE: independent gzip pin unset')
    assert.match(PINS[name].raw, /^[a-f0-9]{64}$/, 'T0 NOT COMPLETE: independent raw pin unset')
    for (const suffix of ['.json.gz', '.provenance.json']) {
      assert.ok(existsSync(corpusPath('genuine-v29-' + name + suffix)),
        'T0 NOT COMPLETE: actual qualified final-V29 artifact missing: ' + name + suffix)
    }
  }
  assert.ok(existsSync(corpusPath('MANIFEST.json')), 'T0 NOT COMPLETE: published corpus manifest missing')
})

function fixture(name: CorpusName) {
  if (!fixtureCache.has(name)) {
    const filename = 'genuine-v29-' + name + '.json.gz'
    const compressed = readFileSync(corpusPath(filename))
    const raw = gunzipSync(compressed).toString('utf8')
    expect(hash(compressed)).toBe(PINS[name].compressed)
    expect(hash(raw)).toBe(PINS[name].raw)
    const provenance = JSON.parse(readFileSync(corpusPath('genuine-v29-' + name + '.provenance.json'), 'utf8'))
    const manifest = JSON.parse(readFileSync(corpusPath('MANIFEST.json'), 'utf8'))
    expect(provenance.filename).toBe(filename)
    expect(provenance.compressedSha256).toBe(PINS[name].compressed)
    expect(provenance.uncompressedSha256).toBe(PINS[name].raw)
    expect(provenance.authority).toMatchObject({
      phase: 'qualified B-F2 / exact last-V29 upstream before P2',
      testedSourceSha: PRODUCER.tested, publishedRecoverySha: PRODUCER.published,
      saveVersion: 29, promiseRulesVersion: 3, protocolVersion: 4, projectionVersion: 46,
      schemaId: 'sha256:584bdd8565030f049d548b1af4fcbf8c517ca7c9150016736f632f1ef8fcb98c',
    })
    expect(provenance.observedHeadSha).toBe(PRODUCER.published)
    expect(manifest.authority).toEqual(provenance.authority)
    expect(manifest.fixtures).toHaveLength(9)
    expect(manifest.fixtures.map((row: { filename: string }) => row.filename).sort())
      .toEqual(NAMES.map((entry) => 'genuine-v29-' + entry + '.json.gz').sort())
    expect(manifest.fixtures).toContainEqual(expect.objectContaining({
      filename, compressedSha256: PINS[name].compressed, uncompressedSha256: PINS[name].raw,
    }))
    const save = validateSaveV29(JSON.parse(raw)) // genuine old validator FIRST
    expect(save.saveVersion).toBe(29)
    expect(exportSave(save)).toBe(raw)
    assert.ok(Array.isArray(provenance.focus))
    const focusIds: string[] = []
    for (const focus of provenance.focus) {
      assert.equal(typeof focus.promiseId, 'string')
      const roots = save.state.promises.filter((p) => p.promiseId === focus.promiseId)
      expect(roots).toHaveLength(1)
      expect(roots[0]!.feasibilityReceipt).toEqual(focus.originalFeasibilityReceipt)
      focusIds.push(focus.promiseId)
    }
    expect(new Set(focusIds).size).toBe(focusIds.length)
    if (name === 'empty') expect(focusIds).toEqual([])
    else expect(focusIds.length).toBeGreaterThan(0)
    fixtureCache.set(name, { raw, save, focusIds })
  }
  return structuredClone(fixtureCache.get(name)!)
}

function focused(save: OldSave, focusIds: readonly string[], accepts: (p: OldPromise) => boolean = () => true): OldPromise {
  const root = save.state.promises.find((p) => focusIds.includes(p.promiseId) && accepts(p))
  assert.ok(root, 'required genuine focused root missing; fixture prerequisite, never fabricate it')
  return root
}

function legacyMaterial(root: OldPromise): string {
  // Independent expected FORMULA, not the live promiseDigest as its own oracle.
  return fnv1a64(JSON.stringify([root.family, root.predicate.count, root.windowStartWeek, root.dueWeekExclusive]))
}

function preservesExactly(admitted: OldSave) {
  const before = JSON.stringify(admitted)
  const raw = exportSave(admitted)
  const migrated = migrateToV30(admitted)
  expect(migrated.saveVersion).toBe(30)
  expect(migrated).toEqual({ ...admitted, saveVersion: 30 }) // no invented fields/history
  expect(validateSaveV30(migrated)).toEqual(migrated)
  expect(JSON.stringify(migrated.state.promises)).toBe(JSON.stringify(admitted.state.promises))
  expect(JSON.stringify(migrated.state.firstTakes)).toBe(JSON.stringify(admitted.state.firstTakes))
  expect(JSON.stringify(migrated.state.talentMarket)).toBe(JSON.stringify(admitted.state.talentMarket))
  for (const root of admitted.state.promises) {
    expect(Object.keys(root.predicate)).toEqual(['count'])
    const loaded = migrated.state.promises.find((p) => p.promiseId === root.promiseId)
    assert.ok(loaded)
    expect(loaded).toEqual(root)
    expect(promiseDigest(loaded)).toBe(legacyMaterial(root))
  }
  for (const proposal of migrated.state.talentMarket.proposals) {
    const materials = proposal.promises.map((id) => {
      const root = admitted.state.promises.find((p) => p.promiseId === id)
      assert.ok(root)
      return legacyMaterial(root)
    })
    const part = materials.length === 0 ? '' : fnv1a64(JSON.stringify(materials))
    expect(attachedPromiseDigest(migrated.state, proposal.promises)).toBe(part)
    const terms = [proposal.talentId, proposal.issuerStudioId, proposal.termWeeks, proposal.startWeek, proposal.premiumTier]
    expect(proposalDigest(proposal.talentId, proposal.issuerStudioId, proposal.termWeeks,
      proposal.startWeek, proposal.premiumTier, part)).toBe(fnv1a64(JSON.stringify(part === '' ? terms : [...terms, part])))
  }
  expect(loadSave(migrated)).toEqual(migrated)
  expect(importSave(exportSave(migrated))).toEqual(migrated)
  // 662-T2 (P14B.5, R-VERSION): the live writer stamps Save31, so "makeSave
  // reproduces the V30 envelope" is a moved premise. The invariant kept: the live
  // writer fed the V30 state plus the EMPTY relationship root reproduces the
  // governed V30->V31 lift of this envelope (version tag and empty root alone).
  // 735-T (P14B.7, R-VERSION): the live writer now stamps Save32, so the
  // invariant extends one more governed step: the live writer fed the V30 state
  // plus the EMPTY relationship root AND `supersededByPromiseId: null` on every
  // existing promise reproduces the governed V30->V32 lift of this envelope.
  // 763-R8 (P14C.1, R-VERSION): the live writer now stamps Save33, so the invariant
  // extends one more governed step — C.1's provenance root, and every stored age
  // FLOORED against it. That is the first step in this chain that changes a VALUE
  // rather than only adding a field, so both are named explicitly below.
  // 776-S9 (P14C.2a, R-VERSION): the live writer now stamps Save34, so the
  // invariant extends one more governed step — the empty career-lifecycle root,
  // opened at this envelope's own tick (the same lift the real V33->V34
  // migration writes).
  const lifted = migrateToLive(migrated)
  const addedFields = (promise: typeof migrated.state.promises[number]) => ({ ...promise, supersededByPromiseId: null })
  const floored = migrated.state.talent.map((person) => ({ ...person, age: Math.floor(person.age) }))
  const provenance = buildTalentProvenance(migrated.state.talent, migrated.state.market.tick, 'legacy_age_anchor')
  const lifecycle = initialCareerLifecycle(migrated.state.market.tick)
  expect(lifted).toEqual({ ...migrated, saveVersion: LIVE_SAVE_VERSION, state: { ...migrated.state, relationships: [],
    promises: migrated.state.promises.map(addedFields), talent: floored, talentProvenance: provenance, careerLifecycle: lifecycle } })
  expect(makeSave({ ...migrated.state, relationships: [], promises: migrated.state.promises.map(addedFields),
    talent: floored, talentProvenance: provenance, careerLifecycle: lifecycle })).toEqual(lifted)
  const downgraded = convertV30ToV29(migrated)
  expect(validateSaveV29(downgraded)).toEqual(admitted)
  expect(exportSave(downgraded)).toBe(raw)
  expect(JSON.stringify(admitted)).toBe(before)
  return migrated
}

function assertActualBacking(save: OldSave, root: OldPromise): void {
  assert.notEqual(root.contractId, null)
  const employment = save.state.hollywood!.employment.filter((e) => e.contractId === root.contractId)
  expect(employment).toHaveLength(1)
  expect(employment[0]!.studioId).toBe(root.issuerStudioId)
  expect(employment[0]!.terms.talentId).toBe(root.beneficiaryPersonId)
  if (root.outcome === null) return
  const own = save.state.talentMarket.receipts.filter((r) => r.eventId === root.outcomeEventId)
  expect(own).toHaveLength(1)
  expect(own[0]).toMatchObject({ kind: 'promiseOutcome', talentId: root.beneficiaryPersonId,
    studioId: root.issuerStudioId, week: root.outcomeWeek })
  for (const id of root.evidenceRefs) {
    const take = save.state.firstTakes.find((t) => t.eventId === id)
    assert.ok(take)
    expect(take.studioId).toBe(root.issuerStudioId)
    expect(Object.values(take.cast)).toContain(root.beneficiaryPersonId)
  }
}

describe('P14B4 Save30: genuine final V29 corpus, exact old-state preservation', () => {
  it('pins LIVE_SAVE_VERSION to literal34 (stale number corrected post-C.2a) independently of the value under test (P14B.7, 735-T)', () => {
    expect(LIVE_SAVE_VERSION).toBe(34)
  })

  it.each(NAMES)('migrates genuine %s without rewriting roots, receipts, digests or history and downgrades losslessly', (name) => {
    const { raw, save } = fixture(name)
    expect(exportSave(loadSave(JSON.parse(raw)))).toBe(raw) // version-dispatched frozen old reader
    expect(exportSave(importSave(raw))).toBe(raw)
    preservesExactly(save)
    // Older downgrade law remains strict. Returning to29 is not authority to
    // flatten genuine takes/promises into28.
    if (name !== 'empty') expect(() => convertV29ToV28(save)).toThrow(/cannot downgrade SaveFileV29/)
  })
})

describe('P14B4 reader-admitted SYNTHETIC legacy variants — never producer fixtures', () => {
  it.each(FAMILIES)('keeps count-only CURRENT %s with arbitrary positive root/receipt versions', (family) => {
    for (const [rootVersion, receiptVersion] of VERSION_PAIRS) {
      const { save, focusIds } = fixture('refused-p2-count-only-current-draft')
      const root = focused(save, focusIds)
      const priorMarket = JSON.stringify(save.state.talentMarket)
      const priorReceipt = structuredClone(root.feasibilityReceipt)
      // Explicit reader-admitted variant: family/versions ONLY. The unchanged
      // stored digest need not describe this hypothetical authored history.
      // Old readers admit it; migration must not recompute or "repair" it.
      root.family = family
      root.version = rootVersion
      root.feasibilityReceipt.rulesVersion = receiptVersion
      expect(root.contractId).toBeNull()
      expect(root.outcome).toBeNull()
      expect(root.predicate).toEqual({ count: 1 })
      const admitted = validateSaveV29(save) // actual frozen29 admission BEFORE migration
      const migrated = preservesExactly(admitted)
      expect(JSON.stringify(migrated.state.talentMarket)).toBe(priorMarket)
      expect(migrated.state.promises.find((p) => p.promiseId === root.promiseId)!.feasibilityReceipt)
        .toEqual({ ...priorReceipt, rulesVersion: receiptVersion })
    }
  })

  it.each(FAMILIES)('keeps genuinely backed OPEN/SATISFIED/BROKEN count-only %s variants', (family) => {
    const cases = [
      { name: 'bound-open-p1' as const, outcome: null },
      { name: 'kept-and-broken-p1' as const, outcome: 'SATISFIED' },
      { name: 'kept-and-broken-p1' as const, outcome: 'BROKEN' },
    ]
    for (const item of cases) {
      const { save, focusIds } = fixture(item.name)
      const root = focused(save, focusIds, (p) => p.outcome === item.outcome)
      assertActualBacking(save, root)
      const evidenceBefore = JSON.stringify([save.state.hollywood!.employment, save.state.firstTakes,
        save.state.talentMarket, root.contractId, root.outcome, root.outcomeEventId, root.evidenceRefs])
      root.family = family
      root.version = 7
      root.feasibilityReceipt.rulesVersion = 11
      const admitted = validateSaveV29(save) // NOT a claim the old producer offered this family
      preservesExactly(admitted)
      expect(JSON.stringify([save.state.hollywood!.employment, save.state.firstTakes,
        save.state.talentMarket, root.contractId, root.outcome, root.outcomeEventId, root.evidenceRefs])).toBe(evidenceBefore)
    }
  })

  it('keeps classless P2 terminal variants with an actual shared take and DISTINCT original outcome receipts', () => {
    const { save, focusIds } = fixture('rival-shared-take-terminal-p1')
    const roots = save.state.promises.filter((p) => focusIds.includes(p.promiseId))
    expect(new Set(roots.map((p) => p.beneficiaryPersonId)).size).toBeGreaterThanOrEqual(2)
    expect(new Set(roots.map((p) => p.outcomeEventId)).size).toBe(roots.length)
    const take = save.state.firstTakes.find((t) => roots.every((p) => p.evidenceRefs.includes(t.eventId)))
    assert.ok(take)
    const actualEvidence = JSON.stringify([save.state.firstTakes, save.state.hollywood!.employment, save.state.talentMarket])
    for (const root of roots) {
      expect(root.outcome).toBe('SATISFIED')
      assertActualBacking(save, root)
      root.family = 'LEAD_OR_SIGNIFICANT_ROLE_COUNT'
      root.version = 4 // numeric4 MUST NOT be mistaken for a new tagged predicate
      root.feasibilityReceipt.rulesVersion = 4
    }
    const admitted = validateSaveV29(save)
    preservesExactly(admitted)
    expect(JSON.stringify([save.state.firstTakes, save.state.hollywood!.employment, save.state.talentMarket])).toBe(actualEvidence)
  })

  it('keeps a classless P2 SATISFIED by an ACTUAL support seat, without inventing a role class or take', () => {
    const { save } = fixture('rival-shared-take-terminal-p1')
    const root = save.state.promises.find((p) => p.outcome === 'SATISFIED' && p.evidenceRefs.some((id) =>
      save.state.firstTakes.some((take) => take.eventId === id && take.cast.support === p.beneficiaryPersonId
        && take.cast.lead !== p.beneficiaryPersonId && take.cast.antagonist !== p.beneficiaryPersonId)))
    assert.ok(root, 'T0 COVERAGE PREMISE: genuine corpus has no actual SATISFIED support beneficiary; never forge cast/evidence')
    assertActualBacking(save, root)
    const originalTakeBytes = JSON.stringify(save.state.firstTakes)
    const originalRefs = structuredClone(root.evidenceRefs)
    root.family = 'LEAD_OR_SIGNIFICANT_ROLE_COUNT'
    root.version = 2
    root.feasibilityReceipt.rulesVersion = 3
    const admitted = validateSaveV29(save) // old generic-cast law explicitly admits SUPPORT
    const migrated = preservesExactly(admitted)
    const loaded = migrated.state.promises.find((p) => p.promiseId === root.promiseId)!
    expect(loaded.predicate).toEqual({ count: root.predicate.count })
    expect(loaded.evidenceRefs).toEqual(originalRefs)
    expect(loaded.outcome).toBe('SATISFIED')
    expect(JSON.stringify(migrated.state.firstTakes)).toBe(originalTakeBytes)
  })
})

describe('P14B4 freezes strict V29 admission BEFORE migration', () => {
  it.each(['class-only', 'tag-and-class', 'zero-root-version', 'zero-receipt-version'] as const)
  ('refuses %s in old29 rather than stripping or retrofitting it', (fault) => {
    const { save, focusIds } = fixture('refused-p2-count-only-current-draft')
    const root = focused(save, focusIds)
    const expected = fault === 'zero-root-version' ? /validateSaveV29:.*\.version must be positive/
      : fault === 'zero-receipt-version' ? /validateSaveV29:.*rulesVersion must be positive/
      : /validateSaveV29:.*predicate\.(?:kind|seatClass) is not a field/
    if (fault === 'zero-root-version') root.version = 0
    else if (fault === 'zero-receipt-version') root.feasibilityReceipt.rulesVersion = 0
    else {
      if (fault === 'tag-and-class') Reflect.set(root.predicate, 'kind', 'castRoleCount')
      Reflect.set(root.predicate, 'seatClass', 'lead')
    }
    const before = JSON.stringify(save)
    expect(() => validateSaveV29(save)).toThrow(expected)
    expect(() => migrateToV30(save)).toThrow(expected)
    expect(JSON.stringify(save)).toBe(before)
  })
})

function taggedBoundaryProbe(seatClass: 'lead' | 'leadOrAntagonist') {
  const { save, focusIds } = fixture('bound-open-p1')
  const old = focused(save, focusIds, (p) => p.outcome === null)
  assertActualBacking(save, old)
  const admitted = validateSaveV29(save) // genuine old binding/evidence exists FIRST
  const migrated = migrateToV30(admitted)
  // Explicit SYNTHETIC V30 schema-boundary probe, NOT a producer-emitted offer.
  // No employment, outcome or first-take evidence is invented. This selected
  // OPEN root receives proposed new shape/revision4 solely to test the reader.
  const root = { ...old, family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT' as const, version: 4,
    predicate: { kind: 'castRoleCount' as const, count: old.predicate.count, seatClass },
    feasibilityReceipt: { ...old.feasibilityReceipt, rulesVersion: 4 } }
  const raw = { ...migrated, state: { ...migrated.state,
    promises: migrated.state.promises.map((p) => p.promiseId === old.promiseId ? root : p) } }
  return { raw, promiseId: old.promiseId, original: save }
}

describe('P14B4 tagged P2 V30 shape is not lossy-downgradable', () => {
  it.each(['lead', 'leadOrAntagonist'] as const)('accepts explicit %s P2 shape at30, never at29, and refuses downgrade without stripping', (seatClass) => {
    const { raw, promiseId, original } = taggedBoundaryProbe(seatClass)
    const accepted = validateSaveV30(raw)
    const root = accepted.state.promises.find((p) => p.promiseId === promiseId)!
    expect(root.family).toBe('LEAD_OR_SIGNIFICANT_ROLE_COUNT')
    expect(root.predicate).toEqual({ kind: 'castRoleCount', count: 1, seatClass })
    expect(accepted.state.hollywood!.employment).toEqual(original.state.hollywood!.employment)
    expect(accepted.state.firstTakes).toEqual(original.state.firstTakes)
    const before = JSON.stringify(accepted)
    expect(() => validateSaveV29({ ...accepted, saveVersion: 29 })).toThrow(/validateSaveV29:.*predicate\.(?:kind|seatClass) is not a field/)
    expect(() => convertV30ToV29(accepted)).toThrow(/cannot downgrade.*(?:V30|class|predicate)/i)
    expect(JSON.stringify(accepted)).toBe(before)
    expect(validateSaveV30(importSave(exportSave(accepted)))).toEqual(accepted)
  })

  it.each(FAMILIES.filter((family) => family !== 'LEAD_OR_SIGNIFICANT_ROLE_COUNT'))
  ('rejects tagged castRoleCount under inapplicable family %s', (family) => {
    const { raw, promiseId } = taggedBoundaryProbe('lead')
    const root = raw.state.promises.find((p) => p.promiseId === promiseId)!
    Reflect.set(root, 'family', family) // deliberately malformed V30 boundary input
    expect(() => validateSaveV30(raw)).toThrow(/predicate|family|castRoleCount|seat.class/i)
  })

  it.each(['missing-kind', 'missing-class', 'support-class', 'extra-key'] as const)
  ('rejects malformed tagged P2 %s rather than defaulting class', (fault) => {
    const { raw, promiseId } = taggedBoundaryProbe('lead')
    const root = raw.state.promises.find((p) => p.promiseId === promiseId)!
    if (fault === 'missing-kind') Reflect.deleteProperty(root.predicate, 'kind')
    else if (fault === 'missing-class') Reflect.deleteProperty(root.predicate, 'seatClass')
    else if (fault === 'support-class') Reflect.set(root.predicate, 'seatClass', 'support')
    else Reflect.set(root.predicate, 'unrecognizedClassAuthority', true)
    expect(() => validateSaveV30(raw)).toThrow(/predicate|kind|class|field/i)
  })
})
