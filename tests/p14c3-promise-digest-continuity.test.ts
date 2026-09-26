// 955: independent pre-C.3 regression for identical-input promise receipts.
// Requirements: same logical inputs give the same receipt; canonical storage
// does not alter continuation; historical receipts are retained as recorded.
// 945/948/950 and genuine951/953 expose the defect, not expected new digest values.
// Scope is promises.ts receipt(), not the detached capacity kernel or C.3 law.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { activeContract } from '../src/core/employment.js'
import { promiseFeasibility, type PromiseDraft } from '../src/core/promises.js'
import { exportSave, importSave, makeSave, migrateToLive, stableStringify, validateSaveV37 } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import type { CreativeRole, GameState } from '../src/core/types.js'
import { p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'

const CORPUS = 'tests/fixtures/p14/genuine-v37-c3-corpus'
const PRE207 = 'genuine-v37-c3-preretirement-week207.json.gz'
const CONTINUOUS208 = 'genuine-v37-c3-retired-week208.json.gz'
const RUNTIME208 = 'genuine-v37-c3-runtime-current208.json.gz'
const sha = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
const bytes = (state: GameState) => exportSave(makeSave(state))
type Manifest = {
  sourceSha: string; producerSha256: string; projectionVersion: number; saveVersion: number;
  knownParityDefect: { status: string; parsed208: { count: number; first: { path: string }[] } };
  artifacts: { filename: string; compressedSha256: string; uncompressedSha256: string }[];
}
function manifest(): Manifest {
  const value = JSON.parse(readFileSync(`${CORPUS}/MANIFEST.json`, 'utf8')) as Manifest
  expect(value).toMatchObject({ sourceSha: '1f44aa505c0d677430451ab5fcacaf5e0ce205d6',
    producerSha256: 'aba3b5c101a1982e2994ce69de0e78633a16d499ebe6cb26bdcc31875235bb4c',
    projectionVersion: 52, saveVersion: 37, knownParityDefect: { status: 'FAIL', parsed208: { count: 12 } } })
  return value
}
function artifact(filename: string): string {
  const record = manifest().artifacts.find(row => row.filename === filename)
  assert.ok(record, `genuine953 artifact is listed: ${filename}`)
  const compressed = readFileSync(`${CORPUS}/${filename}`), raw = gunzipSync(compressed).toString('utf8')
  expect(sha(compressed)).toBe(record.compressedSha256)
  expect(sha(raw)).toBe(record.uncompressedSha256)
  return raw
}
function pre207(): GameState {
  const state = migrateToLive(importSave(artifact(PRE207))).state
  expect(state.market.tick).toBe(207)
  return state
}
// Deliberately permute only object insertion order. No array order, scalar,
// property membership, clock, receipt or gameplay fact is changed.
function reverseObjectKeys<T>(value: T): T {
  if (Array.isArray(value)) return value.map(reverseObjectKeys) as T
  if (value !== null && typeof value === 'object') {
    assert.equal(Object.getPrototypeOf(value), Object.prototype)
    return Object.fromEntries(Object.keys(value).reverse().map(key => [key,
      reverseObjectKeys((value as Record<string, unknown>)[key])])) as T
  }
  return value
}
function reordered(state: GameState): GameState {
  const next = reverseObjectKeys(state)
  expect(next, 'permutation changes no actual value').toEqual(state)
  expect(stableStringify(next)).toBe(stableStringify(state))
  expect(JSON.stringify(next), 'permutation must really change object insertion order').not.toBe(JSON.stringify(state))
  expect(bytes(next), 'whole live-save validation admits the same world').toBe(bytes(state))
  return next
}
function recordedAffectedIds(): string[] {
  // Only actual historical subject identities are taken from the preserved
  // defect record. None of its old/new hash values becomes an expected digest.
  const historical = validateSaveV37(JSON.parse(artifact(RUNTIME208))).state
  const ids = manifest().knownParityDefect.parsed208.first.map(({ path }) => {
    const match = /^\$\["state"\]\["promises"\]\[(\d+)\]\["feasibilityReceipt"\]\["inputsDigest"\]$/.exec(path)
    assert.ok(match)
    const root = historical.promises[Number(match[1])]
    assert.ok(root)
    expect(root.feasibilityReceipt.week).toBe(208)
    return root.promiseId
  })
  expect(ids).toHaveLength(12)
  expect(new Set(ids).size).toBe(12)
  return ids
}

type Fresh = { before: GameState; active: GameState; actorId: string; productionId: string }
let freshCache: Fresh | undefined
function freshPlayerWorkflow(): Fresh {
  if (freshCache !== undefined) return structuredClone(freshCache)
  let state = p13aGeneratedStudio('955-independent-promise-receipt-order')
  const delta = 30_000_000 - state.studio.cash
  state = { ...state, studio: { ...state.studio, cash: 30_000_000 }, ledger: [...state.ledger,
    { week: state.market.tick, kind: delta > 0 ? 'studioRevenue' : 'overhead', amount: delta,
      note: '955 disclosed test funding bootstrap; no simulated earnings or work history' }] }
  const roles: CreativeRole[] = ['actor', 'actor', 'actor', 'director', 'writer', 'craft']
  const ids: string[] = []
  for (const [index, role] of roles.entries()) {
    const oldCount = state.talent.length
    state = applyActions(state, [{ kind: 'createTalent', talent: { name: `955 ${role} ${index}`, role, age: 30,
      actual: { warmth: 0, gravity: 0, physicality: 0.2 }, potentialTier: 'Steady', workEthic: 55 } }])
    expect(state.talent).toHaveLength(oldCount + 1)
    const person = state.talent.at(-1)!
    expect(Object.values(person.workHistory).every(count => count === 0)).toBe(true)
    ids.push(person.id)
    state = applyActions(state, [{ kind: 'signContract', talentId: person.id, termWeeks: 208 }])
    expect(activeContract(state, person.id)?.endWeekExclusive).toBe(208)
  }
  const [actorId, antagonistId, supportId, directorId, writerId, craftId] = ids as [string, string, string, string, string, string]
  const stage = 'facility-soundstage-07'
  const mounted = state.sets.find(set => set.mountedOn === stage && set.status !== 'retired')
  if (mounted !== undefined) state = applyActions(state, [{ kind: 'strikeSet', setId: mounted.id }])
  state = applyActions(state, [{ kind: 'commissionSet', commission: { blueprintId: 'set-grand-ballroom', stageFacilityId: stage } }])
  expect(TUNING.SET_BUILD_WEEKS_BAND_HIGH).toBeLessThanOrEqual(12)
  for (let i = 0; i < TUNING.SET_BUILD_WEEKS_BAND_HIGH; i++) state = tick(state, { develop: true })
  expect(state.sets.some(set => set.mountedOn === stage && set.status === 'standing')).toBe(true)
  expect(state.studio.activeProductions).toEqual([])
  const before = structuredClone(state), concept = state.concepts[0]
  assert.ok(concept)
  state = applyActions(state, [{ kind: 'greenlight', production: {
    conceptId: concept.id, shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
    promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: {
      intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] } },
    writerId, directorId, cast: { lead: actorId, antagonist: antagonistId, support: supportId }, craftIds: [craftId],
    budget: { negative: concept.baseNegativeCost, marketing: 0 },
  } }])
  expect(state.studio.activeProductions).toHaveLength(1)
  const productionId = state.studio.activeProductions[0]!.id
  expect(state.operations.workflows.filter(row => row.productionId === productionId)).toHaveLength(1)
  expect(state.studio.activeProductions[0]!.cast.lead).toBe(actorId)
  expect(state.market.tick).toBe(before.market.tick)
  bytes(before); bytes(state)
  freshCache = { before, active: state, actorId, productionId }
  return structuredClone(freshCache)
}
function draftFor(state: GameState, actorId: string, tagged = false): PromiseDraft {
  const contract = activeContract(state, actorId)
  assert.ok(contract)
  return { family: tagged ? 'LEAD_OR_SIGNIFICANT_ROLE_COUNT' : 'APPEARANCE_COUNT',
    issuerStudioId: state.hollywood!.playerStudioId, beneficiaryPersonId: actorId,
    predicate: tagged ? { kind: 'castRoleCount', count: 1, seatClass: 'lead' } : { count: 1 },
    windowStartWeek: state.market.tick, dueWeekExclusive: state.market.tick + 52,
    startWeek: contract.startWeek, termWeeks: contract.endWeekExclusive - contract.startWeek }
}

describe('955 same logical inputs give the same promise feasibility receipt', () => {
  it.each([false, true])('ignores nested object insertion order with a real active player workflow (tagged P2=%s)', tagged => {
    const { active, actorId } = freshPlayerWorkflow(), alternate = reordered(active)
    const draft = draftFor(active, actorId, tagged), before = bytes(active), otherBefore = bytes(alternate)
    const original = promiseFeasibility(active, draft, active.market.tick)
    const permuted = promiseFeasibility(alternate, reverseObjectKeys(draft), alternate.market.tick)
    expect(original.rulesVersion).toBe(4)
    expect(original.classification).toBe('REASONABLY_ACHIEVABLE')
    expect(original.bottleneck).toBeNull()
    expect(original.inputsDigest).toMatch(/^[0-9a-f]{16}$/)
    expect({ ...permuted, inputsDigest: original.inputsDigest }).toEqual(original)
    expect(permuted.inputsDigest, 'same values include the complete nested workflow and cast').toBe(original.inputsDigest)
    expect(bytes(active)).toBe(before)
    expect(bytes(alternate)).toBe(otherBefore)
  })

  it('keeps an exact refusal, its rules version and its digest invariant under the same key permutation', () => {
    const { active, actorId } = freshPlayerWorkflow(), alternate = reordered(active)
    const draft = { ...draftFor(active, actorId), dueWeekExclusive: 209 }
    const original = promiseFeasibility(active, draft, active.market.tick)
    const permuted = promiseFeasibility(alternate, reverseObjectKeys(draft), alternate.market.tick)
    expect(original).toMatchObject({ classification: 'IMPOSSIBLE', rulesVersion: 4,
      bottleneck: 'the due week falls outside the proposed contract' })
    expect(permuted).toEqual(original)
  })

  it('changes its digest for a real new player production and for different requested work', () => {
    const { before, active, actorId } = freshPlayerWorkflow(), draft = draftFor(active, actorId)
    const absent = promiseFeasibility(before, draft, before.market.tick)
    const committed = promiseFeasibility(active, draft, active.market.tick)
    const moreWork = promiseFeasibility(active, { ...draft, predicate: { count: 2 } }, active.market.tick)
    expect(active.market.tick).toBe(before.market.tick)
    expect(absent.inputsDigest).not.toBe(committed.inputsDigest)
    expect(moreWork.inputsDigest).not.toBe(committed.inputsDigest)
    expect([absent.rulesVersion, committed.rulesVersion, moreWork.rulesVersion]).toEqual([4, 4, 4])
  })
})

describe('955 genuine207 normal-development continuation', () => {
  it('produces identical208 saves and all twelve actual affected receipts from value-identical key orders', () => {
    const original = pre207(), alternate = reordered(original), ids = recordedAffectedIds()
    const initial = bytes(original), otherInitial = bytes(alternate)
    const direct = tick(original, { develop: true }), resumed = tick(alternate, { develop: true })
    expect(direct.market.tick).toBe(208)
    expect(resumed.market.tick).toBe(208)
    const selected = (state: GameState) => ids.map(id => {
      const root = state.promises.find(row => row.promiseId === id)
      assert.ok(root)
      expect(root.feasibilityReceipt).toMatchObject({ week: 208, rulesVersion: 4 })
      return { promiseId: id, ...root.feasibilityReceipt }
    })
    const directReceipts = selected(direct), resumedReceipts = selected(resumed)
    expect(resumedReceipts.map(({ inputsDigest: _digest, ...rest }) => rest))
      .toEqual(directReceipts.map(({ inputsDigest: _digest, ...rest }) => rest))
    expect(resumedReceipts, 'the same twelve genuine promise subjects must retain identical receipts').toEqual(directReceipts)
    expect(bytes(resumed), 'the entire future world must match, not only the selected digests').toBe(bytes(direct))
    expect(bytes(original)).toBe(initial)
    expect(bytes(alternate)).toBe(otherInitial)
  })
})

describe('955 historical preservation and interim projection52 journal authority', () => {
  it.each([PRE207, CONTINUOUS208, RUNTIME208])('loads %s without rewriting its stored promises or other historical bytes', filename => {
    const raw = artifact(filename), original = validateSaveV37(JSON.parse(raw))
    const imported = importSave(raw), live = migrateToLive(imported).state
    expect(exportSave(imported)).toBe(raw)
    expect(live.market.tick).toBe(original.state.market.tick)
    expect(live.promises).toEqual(original.state.promises)
    expect(live.talentMarket.receipts).toEqual(original.state.talentMarket.receipts)
    expect(live.firstTakes).toEqual(original.state.firstTakes)
    expect(live.hollywood!.careerEvents).toEqual(original.state.hollywood!.careerEvents)
    expect(bytes(live)).toBe(raw)
    expect(artifact(filename)).toBe(raw)
  })
})
