// DRAFT ONLY: intended tests/p14b3-rule-revision.test.ts. Not installed or run.
// B3 T0 must first mint the genuine accepted-B2 evaluator1 corpus. Missing files
// are a prerequisite failure, NEVER the behavioral RED for evaluator revision2.
// No fixture bytes, old versions, receipts or hashes are synthesized here.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import * as promiseModule from '../src/core/promises.js'
import { attachPromise, PROMISE_RULES_VERSION } from '../src/core/promises.js'
import { currentProposals, submitProposal } from '../src/core/talentMarket.js'
import { exportSave, importSave, loadSave, makeSave, migrateToV29, migrateToV30, validateSaveV29, validateSaveV30 } from '../src/core/save.js'
import type { GameState, PromiseFeasibilityReceipt } from '../src/core/types.js'
import { advanceTo } from '../src/harness/p13a/fixtures.js'

const CORPUS = './fixtures/p14/genuine-v29-pre-b3-evaluator1/'
const CASES = ['evaluator1-current-p1', 'evaluator1-withdrawn-p1', 'evaluator1-role-label-refused-p1'] as const
type CorpusCase = typeof CASES[number]
// Independently hashed actual T0 gzip bytes and decompressed streams, 2026-09-19.
// Producer publication is pinned separately from the later fixture checkpoint.
const PRODUCER = {
  testedSourceSha: '7f89f75bad5a450b50340e3ab074a913c3ef2744',
  publishedRecoverySha: '034065b4f6e4ef0f9f53750a343568e32f54d9ab',
} as const
const ARTIFACT_HASHES: Record<CorpusCase, { compressed: string; raw: string }> = {
  'evaluator1-current-p1': {
    compressed: 'cadbbd41271b820a466d5d9114e198f7e44b4ff0c801df68fa0cbe69f677c1d2',
    raw: '78decd6e96938facc2b9e20e433c44fcae4e998402d78be4122996d3887cdc0b',
  },
  'evaluator1-withdrawn-p1': {
    compressed: 'a34114171c81c37e46ebbc8ccc5bd72995bfad42e6bb8f828eb437a67ef6c5a1',
    raw: '8ecb96f736ef81795af599e9827fba46fd98415c96a47df4d465e554ffa67586',
  },
  'evaluator1-role-label-refused-p1': {
    compressed: 'febd33112d57128c67a025237add374aeb7925d94a7d941bd4b303b3fedc0367',
    raw: '0272162ec2746cefb1a7910487d6d30642c8743f9853d61a73ebef469a3df2b3',
  },
}
const hash = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
const path = (filename: string) => new URL(`${CORPUS}${filename}`, import.meta.url)

beforeAll(() => {
  for (const filename of ['MANIFEST.json', ...CASES.flatMap((name) => [
    `genuine-v29-${name}.json.gz`, `genuine-v29-${name}.provenance.json`,
  ])]) {
    assert.ok(existsSync(path(filename)), `T0 NOT COMPLETE: missing actual accepted-B2 artifact ${filename}; not behavioral RED`)
  }
})

function readFixture(name: CorpusCase) {
  const filename = `genuine-v29-${name}.json.gz`
  const compressed = readFileSync(path(filename))
  const raw = gunzipSync(compressed).toString('utf8')
  expect(hash(compressed)).toBe(ARTIFACT_HASHES[name].compressed)
  expect(hash(raw)).toBe(ARTIFACT_HASHES[name].raw)
  const provenance = JSON.parse(readFileSync(path(`genuine-v29-${name}.provenance.json`), 'utf8'))
  const manifest = JSON.parse(readFileSync(path('MANIFEST.json'), 'utf8'))
  expect(provenance.filename).toBe(filename)
  expect(provenance.authority).toMatchObject({ phase: 'qualified B2 evaluator1 before B3 or B-F2',
    saveVersion: 29, promiseRulesVersion: 1, projectionVersion: 46, protocolVersion: 4,
    schemaId: 'sha256:584bdd8565030f049d548b1af4fcbf8c517ca7c9150016736f632f1ef8fcb98c' })
  expect(provenance.authority.testedSourceSha).toBe(PRODUCER.testedSourceSha)
  expect(provenance.authority.publishedRecoverySha).toBe(PRODUCER.publishedRecoverySha)
  expect(provenance.observedHeadSha).toBe(provenance.authority.publishedRecoverySha)
  expect(provenance.minterSha256).toMatch(/^[a-f0-9]{64}$/)
  expect(provenance.supportSha256).toMatch(/^[a-f0-9]{64}$/)
  expect(hash(compressed)).toBe(provenance.compressedSha256)
  expect(hash(raw)).toBe(provenance.uncompressedSha256)
  expect(manifest.authority).toEqual(provenance.authority)
  expect(manifest.fixtures).toHaveLength(3)
  expect(manifest.fixtures).toContainEqual(expect.objectContaining({ filename,
    compressedSha256: hash(compressed), uncompressedSha256: hash(raw) }))
  const save = validateSaveV29(JSON.parse(raw))
  expect(save.saveVersion).toBe(29)
  expect(save.state.promises.length).toBeGreaterThan(0)
  expect(save.state.promises.every((p) => p.version === 1 && p.feasibilityReceipt.rulesVersion === 1)).toBe(true)
  expect(provenance.focus).toHaveLength(1)
  const focusedId: unknown = provenance.focus[0]?.promiseId
  assert.equal(typeof focusedId, 'string')
  const focused = save.state.promises.find((p) => p.promiseId === focusedId)
  assert.ok(focused, 'provenance must identify an actual producer-emitted promise')
  expect(focused.feasibilityReceipt).toEqual(provenance.focus[0].originalFeasibilityReceipt)
  return { raw, save, focused }
}

// B-F2 2026-09-19: live evaluation moves2→3 for the acting-discipline fix.
// B3's revision2 RED/GREEN remains at f4e1230/425170e; do not rewrite that evidence.
// Only fresh roots/receipts use3. Genuine evaluator1 fixtures and old root.version1 stay1.
// Record 600 (2026-09-21, Owner ruling on 578, D1 (a)): live evaluation moves3→4 for the
// class-aware scalar (class-restricted fixed-seat paths + shared residual capacity) inside
// the coordinated core/save/runtime/wire cutover. B3's revision2 and B-F2's evaluator3
// evidence stay where they were recorded. Only fresh roots/receipts below use4; genuine
// evaluator1 fixtures and old root.version1 stay1. Classifications, digests, fixtures and
// weeks are untouched; residual-buffer movements are reconciled from evidence (600 §3 2(d)).
describe('P14B.3 continuity under the live evaluator (4 after record 600) with genuine old evaluator1 history', () => {
  it('pins the new evaluator generation independently of unchanged Save29/projection46', () => {
    expect(PROMISE_RULES_VERSION).toBe(4)
  })

  it.each(CASES)('preserves genuine %s root/receipt/digest bytes through valid load, not a restamped current fixture', (name) => {
    const { raw, save, focused } = readFixture(name)
    const promiseBytes = JSON.stringify(save.state.promises)
    const marketBytes = JSON.stringify(save.state.talentMarket)
    expect(exportSave(loadSave(JSON.parse(raw)))).toBe(raw)
    expect(exportSave(importSave(raw))).toBe(raw)
    const reloaded = migrateToV29(importSave(raw))
    expect(exportSave(reloaded)).toBe(raw)
    // 600-T2 (record 600, C9/C10): the live writer stamps Save30, so "makeSave
    // reproduces the raw V29 bytes" is a moved premise. The invariant kept: the
    // live writer's output IS the governed V29->V30 migration of the raw fixture,
    // which differs from raw by the version tag alone (no restamped root, receipt
    // or digest); the V29 half above stays byte-identical.
    const governed = migrateToV30(importSave(raw))
    expect(governed.saveVersion).toBe(30)
    expect(JSON.parse(exportSave(governed))).toEqual({ ...JSON.parse(raw), saveVersion: 30 })
    expect(exportSave(makeSave(reloaded.state))).toBe(exportSave(governed))
    expect(JSON.stringify(reloaded.state.promises)).toBe(promiseBytes)
    expect(JSON.stringify(reloaded.state.talentMarket)).toBe(marketBytes)
    expect(focused.version).toBe(1)
    expect(focused.feasibilityReceipt.rulesVersion).toBe(1)
    expect(focused.contractId).toBeNull()
    expect(focused.outcome).toBeNull()
    const referrers = reloaded.state.talentMarket.proposals.filter((p) => p.promises.includes(focused.promiseId))
    expect(referrers).toHaveLength(name === 'evaluator1-withdrawn-p1' ? 0 : 1)
    if (name === 'evaluator1-role-label-refused-p1') {
      const person = reloaded.state.talent.find((p) => p.id === focused.beneficiaryPersonId)
      expect(person?.role).toBe('writer')
      expect(person?.skills.acting).toBeDefined()
      expect(focused.feasibilityReceipt).toMatchObject({ classification: 'IMPOSSIBLE',
        bottleneck: 'this person takes no cast seat under the greenlight law' })
      // Historical refusal preservation only. B-F2 discipline eligibility is
      // intentionally outside this B3 test; do not require new writer offers yet.
    }
  })

  it('new actual attachment uses root.version4 and receipt.rulesVersion4 without rewriting old roots', () => {
    const { save, focused: old } = readFixture('evaluator1-current-p1')
    const state = migrateToV30(save).state
    const priorRoots = JSON.stringify(state.promises)
    const proposal = currentProposals(state, old.beneficiaryPersonId).find((p) => p.issuerStudioId === old.issuerStudioId)
    assert.ok(proposal)
    expect(proposal.promises).toEqual([old.promiseId])
    const resubmitted = submitProposal(state, { talentId: proposal.talentId, issuerStudioId: proposal.issuerStudioId,
      termWeeks: proposal.termWeeks, premiumTier: proposal.premiumTier })
    const attached = attachPromise(resubmitted, proposal.talentId, proposal.issuerStudioId, {
      family: 'APPEARANCE_COUNT', predicate: { count: old.predicate.count },
      windowStartWeek: old.windowStartWeek, dueWeekExclusive: old.dueWeekExclusive,
    })
    expect(attached.promises).toHaveLength(state.promises.length + 1)
    const fresh = attached.promises[state.promises.length]!
    expect(fresh).toMatchObject({ promiseId: `promise-${state.promises.length}`, version: 4,
      beneficiaryPersonId: old.beneficiaryPersonId, issuerStudioId: old.issuerStudioId,
      contractId: null, outcome: null,
      feasibilityReceipt: { rulesVersion: 4, week: state.market.tick, classification: 'REASONABLY_ACHIEVABLE' } })
    expect(JSON.stringify(attached.promises.slice(0, state.promises.length))).toBe(priorRoots)
    expect(currentProposals(attached, proposal.talentId).find((p) => p.issuerStudioId === proposal.issuerStudioId)!.promises)
      .toEqual([fresh.promiseId])
    const reloaded = validateSaveV30(importSave(exportSave(makeSave(attached)))).state
    expect(reloaded.promises).toEqual(attached.promises)
  })

  it('actual later winning freeze keeps old root.version1 but stores genuine new rulesVersion4 receipt and binding', () => {
    const { save, focused: old } = readFixture('evaluator1-current-p1')
    const state = migrateToV30(save).state
    const priorRoots = JSON.stringify(state.promises)
    const proposal = currentProposals(state, old.beneficiaryPersonId).find((p) => p.issuerStudioId === old.issuerStudioId)
    assert.ok(proposal)
    expect(proposal.promises).toEqual([old.promiseId])
    expect(state.market.tick).toBeLessThan(proposal.startWeek)
    expect(old.feasibilityReceipt.week).toBe(state.market.tick)
    const evaluate = promiseModule.promiseFeasibility
    const freezes: PromiseFeasibilityReceipt[] = []
    // Transparent pass-through observes actual PRE-COMMIT freeze, never a fake
    // receipt or a post-commit recomputation with different employment inputs.
    const spy = vi.spyOn(promiseModule, 'promiseFeasibility').mockImplementation((world, draft, week) => {
      const result = evaluate(world, draft, week)
      const committed = world.hollywood!.employment.some((row) => row.studioId === old.issuerStudioId
        && row.terms.talentId === old.beneficiaryPersonId && row.terms.startWeek === proposal.startWeek)
      if (!committed && week === proposal.startWeek && draft.promiseId === old.promiseId) freezes.push(result)
      return result
    })
    let settled: GameState
    try { settled = advanceTo(state, proposal.startWeek) } finally { spy.mockRestore() }
    const bound = settled.promises.find((p) => p.promiseId === old.promiseId)
    assert.ok(bound)
    expect(bound.version).toBe(1)
    expect(bound.feasibilityReceipt).toMatchObject({ rulesVersion: 4, week: proposal.startWeek,
      classification: 'REASONABLY_ACHIEVABLE' })
    expect(bound.feasibilityReceipt.inputsDigest).not.toBe(old.feasibilityReceipt.inputsDigest)
    expect(freezes.length).toBeGreaterThan(0)
    expect(freezes).toContainEqual(bound.feasibilityReceipt)
    expect(bound.contractId).not.toBeNull()
    expect(bound.outcome).toBeNull()
    expect(settled.hollywood!.employment.find((row) => row.contractId === bound.contractId)).toMatchObject({
      studioId: old.issuerStudioId, terms: { talentId: old.beneficiaryPersonId, startWeek: proposal.startWeek } })
    expect(settled.talentMarket.receipts).toContainEqual(expect.objectContaining({ kind: 'settled',
      talentId: old.beneficiaryPersonId, studioId: old.issuerStudioId, week: proposal.startWeek }))
    expect(currentProposals(settled, old.beneficiaryPersonId)).toEqual([])
    expect(JSON.stringify(state.promises)).toBe(priorRoots)
    const reloaded = validateSaveV30(importSave(exportSave(makeSave(settled)))).state
    expect(reloaded.promises.find((p) => p.promiseId === old.promiseId)).toEqual(bound)
    expect(old.version).toBe(1)
    expect(old.feasibilityReceipt.rulesVersion).toBe(1)
  })
})
