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
import { convertV38ToV37, convertV39ToV38, convertV40ToV39, convertV41ToV40, convertV42ToV41, exportSave, importSave, LIVE_SAVE_VERSION, makeSave, migrateToLive, stableStringify, validateSaveV37 } from '../src/core/save.js'
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
    // 1332-A rule 4 / 1332-F Amendment 1 (repair R3): each of the twelve
    // subjects' OWN receipt in THIS pre-tick state -- the baseline a subject
    // NOT bound at week 208 keeps unchanged (every field equal), derived from
    // the pre-tick state itself, never from a literal week.
    const preReceipts = new Map(ids.map(id => {
      const root = original.promises.find(row => row.promiseId === id)
      assert.ok(root)
      return [id, root.feasibilityReceipt] as const
    }))
    const direct = tick(original, { develop: true }), resumed = tick(alternate, { develop: true })
    expect(direct.market.tick).toBe(208)
    expect(resumed.market.tick).toBe(208)
    const selected = (state: GameState) => ids.map(id => {
      const root = state.promises.find(row => row.promiseId === id)
      assert.ok(root)
      // `commitWinningPromise` (src/core/talentMarket.ts:1237-1248) writes
      // `contractId` and the re-derived feasibility receipt TOGETHER,
      // atomically, only for the winning proposal's own promise -- so a
      // non-null `contractId` on this post-tick root is the independent
      // signal that THIS tick's week-208 settlement bound the subject. It is
      // never read off `feasibilityReceipt.week` itself, the field this
      // very assertion checks; a subject not bound keeps the receipt it held
      // in the pre-tick state above, unchanged.
      // 1332-F2 amendment: 1332-A rule 4 asks for `rulesVersion` 4 on BOTH
      // paths, asserted explicitly here rather than only inherited through
      // equality with a snapshot. 1332-F amendment 1 requires the unbound
      // path's receipt "unchanged (every field equal)" -- `toMatchObject`
      // left `classification`/`bottleneck`/`inputsDigest` unchecked, so the
      // unbound path now `toEqual`s the whole pre-tick receipt object;
      // the bound path keeps its shape check (its other fields are freshly
      // re-derived at 208, not independently predictable here).
      expect(root.feasibilityReceipt.rulesVersion).toBe(4)
      if (root.contractId !== null) {
        expect(root.feasibilityReceipt).toMatchObject({ week: 208, rulesVersion: 4 })
      } else {
        expect(root.feasibilityReceipt).toEqual(preReceipts.get(id)!)
      }
      return { promiseId: id, ...root.feasibilityReceipt }
    })
    const directReceipts = selected(direct), resumedReceipts = selected(resumed)
    // 1332-A Attribution 3 / 1332-F pre-declared attribution (rule 4): the
    // derived unbound set must equal EXACTLY promise-3 and promise-26, each
    // with the week-208 case-decision facts measured there -- event id, kind,
    // winning studio, the reason sentences verbatim, `contractId` null and a
    // week-196 pre-tick receipt. Any other subject, fact or sentence stops
    // this leaf; it never silently passes.
    const unboundIds = ids.filter(id => direct.promises.find(row => row.promiseId === id)!.contractId === null)
    expect(unboundIds).toEqual(['promise-3', 'promise-26'])
    for (const id of unboundIds) {
      const root = direct.promises.find(row => row.promiseId === id)!
      expect(root.contractId).toBeNull()
      expect(preReceipts.get(id)!.week).toBe(196)
      const decision = direct.talentMarket.receipts.find(r => r.talentId === root.beneficiaryPersonId && r.week === 208
        && (r.kind === 'settled' || r.kind === 'declined'))
      assert.ok(decision, `1332-A Attribution 3 premise: no week-208 case decision for ${id}`)
      if (id === 'promise-3') {
        expect(decision).toMatchObject({ eventId: 'talent-market-event-143', kind: 'declined', studioId: null,
          reasons: ['this person could not separate 2 equally ranked proposals.'] })
      } else {
        expect(decision).toMatchObject({ eventId: 'talent-market-event-155', kind: 'settled', studioId: 'studio-de11f27b-r03',
          reasons: ['their studio standing ranked higher', 'they are the current employer'] })
      }
    }
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
    const current = makeSave(live)
    expect(current.saveVersion).toBe(LIVE_SAVE_VERSION)
    expect(current.state.careerLifecycle.transitionBoundaryWeek).toBe(original.state.market.tick)
    expect(current.state.careerLifecycle.professionAnchors).toEqual(original.state.talent.map(person => ({
      personId: person.id, profession: person.role, recordedWeek: original.state.market.tick, kind: 'existing',
    })))
    expect(current.state.careerLifecycle.transitionEvaluations).toEqual([])
    expect(current.state.careerLifecycle.professionChanges).toEqual([])
    expect(current.state.careerLifecycle.industryRetirements).toEqual([])
    expect(exportSave(convertV38ToV37(convertV39ToV38(convertV40ToV39(convertV41ToV40(convertV42ToV41(current))))))).toBe(raw)
    expect(artifact(filename)).toBe(raw)
  })
})
