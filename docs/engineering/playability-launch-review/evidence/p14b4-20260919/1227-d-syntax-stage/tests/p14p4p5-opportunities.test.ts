// 1225-A/B/C, 1226-A: initial Ready-path and persistence slice only.
// This staged postimage is installed at tests/ before parent-owned execution.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import * as core from '../src/core/index.js'
import * as saves from '../src/core/save.js'
import * as tickOwner from '../src/core/tick.js'
import { occupiedResourceSlots, resourceClaimsOf } from '../src/core/occupancy.js'
import { activeContract } from '../src/core/employment.js'
import type { GameState, PromiseFeasibilityReceipt, ProfessionalPromise } from '../src/core/types.js'
import type { PromiseDraft, PromiseAttachment } from '../src/core/promises.js'
import type { SaveFileV39 } from '../src/core/save.js'

const LEAF_TIMEOUT_MS = 60_000 // Whole-save negative families; no global timeout change.
const E = new URL('../docs/engineering/playability-launch-review/evidence/p14b4-20260919/', import.meta.url)
const FOCUS = 'authored-0006'
const CLASSES = ['allCast', 'lead', 'leadOrAntagonist'] as const
type SeatClass = typeof CLASSES[number]
type OpportunityPredicate =
  | { kind: 'genreOpportunity'; count: 1; seatClass: SeatClass; genre: 'drama' | 'crime' }
  | { kind: 'projectOpportunity'; count: 1; seatClass: SeatClass; scriptProjectId: string }
type OpportunityDraft = Omit<PromiseDraft, 'family' | 'predicate'> & {
  family: 'PREFERRED_GENRE_OPPORTUNITY' | 'SPECIFIC_PROJECT'; predicate: OpportunityPredicate
}
type Sidecar = { version: 1; cutoverOrdinal: number; facts: unknown[] }
type CurrentView = { saveVersion: number; state: Record<string, unknown> & {
  firstTakeSubjects: Sidecar; promises: Record<string, unknown>[]
} }
type FutureAPI = {
  validateSaveV40(input: unknown): unknown
  convertV40ToV39(input: unknown): SaveFileV39
}
const clone = <T>(value: T): T => structuredClone(value)
const sha = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')
const stable = saves.stableStringify
const issuer = (state: GameState): string => { assert.ok(state.hollywood); return state.hollywood.playerStudioId }
const bytes = (state: GameState): string => saves.exportSave(saves.makeSave(state))
function admitted(state: GameState): void {
  const before = stable(state), raw = bytes(state)
  expect(saves.exportSave(saves.importSave(raw))).toBe(raw)
  expect(stable(state)).toBe(before)
}
function futureAPI(): FutureAPI {
  const api = core as unknown as Partial<FutureAPI>
  assert.equal(typeof api.validateSaveV40, 'function', 'new public strict40 reader after actual version assertion')
  assert.equal(typeof api.convertV40ToV39, 'function', 'new public guarded40→39 conversion')
  return api as FutureAPI
}
function pinned39(filename: string, gzipHash: string, rawHash: string): { raw: string; save: SaveFileV39 } {
  const zipped = readFileSync(new URL(filename, E)), raw = gunzipSync(zipped).toString('utf8')
  expect(sha(zipped)).toBe(gzipHash); expect(sha(raw)).toBe(rawHash)
  const parsed: unknown = JSON.parse(raw), save = saves.validateSaveV39(parsed)
  expect(save).toBe(parsed); expect(saves.exportSave(save)).toBe(raw)
  return { raw, save }
}
let tickAttempts = 0
let restoreTick: (() => void) | undefined
beforeAll(() => {
  const guard = vi.spyOn(tickOwner, 'tick').mockImplementation(() => {
    tickAttempts++; throw new Error('1227: zero advancing calls authorized in the initial slice')
  })
  restoreTick = () => guard.mockRestore()
})
afterAll(() => {
  restoreTick?.()
  console.info('1227-P4P5-COUNTERS ' + JSON.stringify({ tickAttempts, hardTickCap: 0,
    cachedPhases: [...cache].map(([name, row]) => ({ name, completed: row.ok })) }))
  expect(tickAttempts).toBe(0)
})
type Cached = { ok: true; value: GameState } | { ok: false; error: unknown }
const cache = new Map<string, Cached>()
function memo(name: string, build: () => GameState): GameState {
  const old = cache.get(name)
  if (old) { if (!old.ok) throw old.error; return clone(old.value) }
  try { const value = build(); cache.set(name, { ok: true, value }); return clone(value) }
  catch (error) { cache.set(name, { ok: false, error }); throw error }
}
function quote(state: GameState, draft: PromiseDraft | OpportunityDraft): PromiseFeasibilityReceipt {
  const before = bytes(state), request = stable(draft), rng = clone(state.rngState)
  const actual = core.promiseFeasibility(state, draft as PromiseDraft, state.market.tick)
  expect(bytes(state)).toBe(before); expect(stable(draft)).toBe(request); expect(state.rngState).toEqual(rng)
  return actual
}
function draft(state: GameState, family: OpportunityDraft['family'], seatClass: SeatClass = 'allCast', due = 112): OpportunityDraft {
  return { family, issuerStudioId: issuer(state), beneficiaryPersonId: FOCUS,
    startWeek: 52, termWeeks: 104, windowStartWeek: 52, dueWeekExclusive: due,
    predicate: family === 'PREFERRED_GENRE_OPPORTUNITY'
      ? { kind: 'genreOpportunity', count: 1, seatClass, genre: 'drama' }
      : { kind: 'projectOpportunity', count: 1, seatClass, scriptProjectId: 'script-0000' } }
}
function input45(): GameState {
  return memo('genuine45', () => {
    const manifest = readFileSync(new URL('1171-p3-current45-capture/MANIFEST.json', E))
    expect(sha(manifest)).toBe('a261fc3177527d05d5a8daf624de7af015df8c9a8fedd3e11b37fe1597a2f4b6')
    const old = pinned39('1171-p3-current45-capture/genuine-v39-p3-market-week45.json.gz',
      '12799a849b0b4aff49cd9707ea8c1b87c64b4e787ff261b2e9cf4b109a953117',
      'e7401f2578a7ad151383ca905df4253c2bbd82d6823c406c28b7e76aa809c5af')
    const state = saves.migrateToLive(old.save).state
    expect(state.market.tick).toBe(45); expect(state.studio.cash).toBe(24_701_506)
    expect(state.promises).toEqual([]); expect(state.firstTakes).toHaveLength(19)
    expect(state.studio.activeProductions).toEqual([])
    expect(core.caseForTalent(state, FOCUS)).toMatchObject({ openedWeek: 40, decisionWeek: 52 })
    expect(activeContract(state, FOCUS)).toMatchObject({ startWeek: 0, endWeekExclusive: 52 })
    expect(core.retirementRecordFor(state, FOCUS)).toBeUndefined()
    expect(state.talent.find(row => row.id === FOCUS)).toMatchObject({ role: 'actor' })
    for (const [id, conceptId, genre] of [['script-0000', 'c-00', 'drama'], ['script-0001', 'c-01', 'crime']] as const) {
      const project = state.scriptDevelopment.projects.find(row => row.id === id); assert.ok(project)
      expect(project).toMatchObject({ conceptId, status: 'ready', productionId: null, reservation: null })
      expect(project.assessment).not.toBeNull()
      expect(state.concepts.find(row => row.id === conceptId)?.genre).toBe(genre)
    }
    expect(state.castingSessions.sessions).toEqual([])
    const claims = resourceClaimsOf(occupiedResourceSlots({ operations: state.operations,
      placement: state.placement, technology: state.technology, construction: state.construction,
      scriptDevelopment: state.scriptDevelopment, castingSessions: state.castingSessions, sets: state.sets }))
    for (const capability of ['development-casting', 'soundstage', 'set-scenery', 'post'] as const) {
      const facilities = state.operations.facilities.filter(row => row.capability === capability)
      assert.ok(facilities.some(f => Array.from({ length: f.capacity }, (_, slot) => slot)
        .some(slot => !claims.some(c => c.kind === 'facility' && c.facilityId === f.id && c.slot === slot))),
      `actual available ${capability} slot in immutable Ready-path fixture`)
    }
    admitted(state)
    const common = draft(state, 'PREFERRED_GENRE_OPPORTUNITY')
    const oldDrafts: PromiseDraft[] = [
      { ...common, family: 'APPEARANCE_COUNT', predicate: { count: 1 } },
      { ...common, family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', predicate: { kind: 'castRoleCount', count: 1, seatClass: 'lead' } },
      { ...common, family: 'DIRECTING_COUNT', predicate: { kind: 'directorCount', count: 1 } },
    ]
    const controls = oldDrafts.map(request => ({ request, receipt: quote(state, request) }))
    expect(controls.map(row => row.receipt.rulesVersion)).toEqual([4, 4, 6])
    // Complete actual values emitted before any new-policy assertion, on RED and GREEN.
    console.info('1227-P4P5-LEGACY46 ' + JSON.stringify({ controls, rngState: state.rngState }))
    return state
  })
}
function proposed45(): GameState {
  return memo('publicProposal45', () => {
    const state = input45(), offer = core.proposalDraft(state, issuer(state), FOCUS, 104, 1.25, 45)
    expect(state.studio.cash).toBeGreaterThanOrEqual(offer.signingBonus)
    const next = core.submitProposal(state, { talentId: FOCUS, issuerStudioId: issuer(state), termWeeks: 104, premiumTier: 1.25 })
    expect(next.talentMarket.proposals.find(row => row.talentId === FOCUS && row.issuerStudioId === issuer(next)))
      .toMatchObject({ startWeek: 52, termWeeks: 104, premiumTier: 1.25, promises: [] })
    admitted(next); return next
  })
}
function attach(state: GameState, request: unknown): GameState {
  return core.attachPromise(state, FOCUS, issuer(state), request as PromiseAttachment)
}
function expectRA(receipt: PromiseFeasibilityReceipt): void {
  expect(receipt).toMatchObject({ classification: 'REASONABLY_ACHIEVABLE', bottleneck: null, rulesVersion: 7, week: 45 })
}

describe('P4/P5 initial Ready paths and genuine39 boundary', () => {
  it('Q01 quotes one Ready genre opportunity with explicit cast class and no spare-event buffer', () => {
    const state = input45(), receipts: PromiseFeasibilityReceipt[] = []
    for (const seatClass of CLASSES) {
      // Ready45/contract52 -> earliest57, due65 leaves exactly8 weeks.
      // A one-event singular quote has no count-family spare-event requirement.
      const request = draft(state, 'PREFERRED_GENRE_OPPORTUNITY', seatClass, 65)
      const receipt = quote(state, request); receipts.push(receipt)
      console.info('1227-P4P5-GENRE ' + JSON.stringify({ request, receipt, actualWeek: state.market.tick,
        expectedEarliestTake: 57, expectedSlack: 8 }))
      expectRA(receipt)
      expect(quote(state, { ...request, dueWeekExclusive: 64 }))
        .toMatchObject({ classification: 'FRAGILE', rulesVersion: 7, bottleneck: expect.stringMatching(/slack|room|due/i) })
    }
    expect(new Set(receipts.map(row => row.inputsDigest)).size).toBe(3)
    const drama = draft(state, 'PREFERRED_GENRE_OPPORTUNITY')
    const crime = { ...drama, predicate: { kind: 'genreOpportunity', count: 1, seatClass: 'allCast', genre: 'crime' } } as OpportunityDraft
    const a = quote(state, drama), b = quote(state, crime)
    expectRA(a); expectRA(b); expect(a.inputsDigest).not.toBe(b.inputsDigest)
  }, LEAF_TIMEOUT_MS)

  it('Q02 quotes only the exact existing Ready project and retains singular physical versus slack causes', () => {
    const state = input45(), receipts: PromiseFeasibilityReceipt[] = []
    for (const seatClass of CLASSES) {
      const request = draft(state, 'SPECIFIC_PROJECT', seatClass, 65), receipt = quote(state, request)
      receipts.push(receipt)
      console.info('1227-P4P5-PROJECT ' + JSON.stringify({ request, receipt, actualWeek: state.market.tick,
        expectedEarliestTake: 57, expectedSlack: 8 }))
      expectRA(receipt)
    }
    expect(new Set(receipts.map(row => row.inputsDigest)).size).toBe(3)
    const request = draft(state, 'SPECIFIC_PROJECT')
    const other = { ...request, predicate: { kind: 'projectOpportunity', count: 1, seatClass: 'allCast', scriptProjectId: 'script-0001' } } as OpportunityDraft
    const a = quote(state, request), b = quote(state, other)
    expectRA(a); expectRA(b); expect(a.inputsDigest).not.toBe(b.inputsDigest)
    // The screenplay's real permanent Writer credit cannot double as a cast
    // seat on that same picture. It is not an active-writing occupancy claim.
    const target = state.scriptDevelopment.projects.find(row => row.id === 'script-0000'); assert.ok(target)
    expect(target.writerId).toBe('authored-0003')
    expect(state.talent.find(row => row.id === target.writerId)?.skills.acting).toBeDefined()
    expect(quote(state, { ...request, beneficiaryPersonId: target.writerId }))
      .toMatchObject({ classification: 'IMPOSSIBLE', rulesVersion: 7,
        bottleneck: expect.stringMatching(/writer|credited|same.*picture/i) })
    for (const scriptProjectId of ['c-00', '1227-absent-project']) {
      expect(quote(state, { ...request, predicate: { kind: 'projectOpportunity', count: 1, seatClass: 'allCast', scriptProjectId } }))
        .toMatchObject({ classification: 'IMPOSSIBLE', rulesVersion: 7, bottleneck: expect.stringMatching(/project|screenplay/i) })
    }
  }, LEAF_TIMEOUT_MS)

  it('Q03 attaches exact selected material terms and refuses classless or cross-family fresh authority', () => {
    const state = proposed45(), before = bytes(state), attachedDigests: string[] = []
    let admittedGenre: GameState | undefined
    for (const family of ['PREFERRED_GENRE_OPPORTUNITY', 'SPECIFIC_PROJECT'] as const) {
      for (const seatClass of CLASSES) {
        const request = draft(state, family, seatClass), receipt = quote(state, request)
        expectRA(receipt)
        const next = attach(clone(state), request), row = next.promises.at(-1); assert.ok(row)
        expect(row).toMatchObject({ family, predicate: request.predicate, version: 7,
          contractId: null, progress: 0, evidenceRefs: [], outcome: null, feasibilityReceipt: receipt })
        expect(Object.keys(row.predicate).sort()).toEqual(Object.keys(request.predicate).sort())
        const proposal = next.talentMarket.proposals.find(p => p.talentId === FOCUS && p.issuerStudioId === issuer(next)); assert.ok(proposal)
        expect(proposal.promises).toEqual([row.promiseId]); attachedDigests.push(proposal.digest)
        admitted(next)
        if (family === 'PREFERRED_GENRE_OPPORTUNITY' && seatClass === 'allCast') admittedGenre = next
      }
    }
    expect(new Set(attachedDigests).size).toBe(6)
    expect(bytes(state)).toBe(before)
    assert.ok(admittedGenre)
    const real = admittedGenre.promises.at(-1)!
    // Labelled pure material arguments, never saved or continued as campaign rows.
    const changed = (change: Record<string, unknown>): ProfessionalPromise => ({ ...clone(real), ...change }) as ProfessionalPromise
    const material = [real,
      changed({ predicate: { kind: 'genreOpportunity', count: 1, seatClass: 'allCast', genre: 'crime' } }),
      changed({ predicate: { kind: 'genreOpportunity', count: 1, seatClass: 'lead', genre: 'drama' } }),
      changed({ windowStartWeek: 53 }), changed({ dueWeekExclusive: 111 }),
      changed({ family: 'SPECIFIC_PROJECT', predicate: { kind: 'projectOpportunity', count: 1, seatClass: 'allCast', scriptProjectId: 'script-0000' } }),
      changed({ family: 'SPECIFIC_PROJECT', predicate: { kind: 'projectOpportunity', count: 1, seatClass: 'allCast', scriptProjectId: 'script-0001' } }),
    ]
    expect(new Set(material.map(row => core.promiseDigest(row))).size).toBe(material.length)
    const genre = draft(state, 'PREFERRED_GENRE_OPPORTUNITY'), project = draft(state, 'SPECIFIC_PROJECT')
    const badRequests: unknown[] = [
      { ...genre, predicate: { count: 1 } }, { ...project, predicate: { count: 1 } },
      { ...genre, family: 'SPECIFIC_PROJECT' }, { ...project, family: 'PREFERRED_GENRE_OPPORTUNITY' },
      { ...genre, family: 'APPEARANCE_COUNT' }, { ...project, family: 'DIRECTING_COUNT' },
      { ...genre, predicate: { ...genre.predicate, count: 2 } },
      { ...project, predicate: { ...project.predicate, count: 0 } },
      { ...genre, predicate: { ...genre.predicate, seatClass: 'support' } },
      { ...genre, predicate: { ...genre.predicate, genre: '1227-not-a-genre' } },
      { ...genre, predicate: { kind: 'genreOpportunity', count: 1, genre: 'drama' } },
      { ...project, predicate: { kind: 'projectOpportunity', count: 1, seatClass: 'allCast' } },
      { ...project, predicate: { ...project.predicate, surprise: true } },
    ]
    for (const request of badRequests) {
      const input = clone(state), preimage = bytes(input)
      expect(() => attach(input, request)).toThrow(/predicate|family|genre|project|class|count|opportunit/i)
      expect(bytes(input)).toBe(preimage)
    }
    // The positive is public-created and fully admitted, including all C3 authority.
    // A generic entrant-loss failure cannot stand in for this new semantic guard.
    const valid: unknown = JSON.parse(bytes(admittedGenre))
    expect((valid as { saveVersion: number }).saveVersion).toBe(40)
    const api = futureAPI(); expect(api.validateSaveV40(valid)).toBe(valid)
    expect(() => api.convertV40ToV39(valid)).toThrow(/opportunit|genre|project|predicate/i)
    for (const mutate of [
      (p: Record<string, unknown>) => { p.predicate = { kind: 'genreOpportunity', count: 2, seatClass: 'allCast', genre: 'drama' } },
      (p: Record<string, unknown>) => { p.family = 'SPECIFIC_PROJECT' },
      (p: Record<string, unknown>) => { p.predicate = { kind: 'genreOpportunity', count: 1, seatClass: 'support', genre: 'drama' } },
    ]) {
      const bad = clone(valid) as CurrentView, row = bad.state.promises.find(p => p.promiseId === real.promiseId); assert.ok(row)
      mutate(row)
      expect(() => api.validateSaveV40(bad)).toThrow(/predicate|family|genre|project|class|count|opportunit/i)
    }
  }, LEAF_TIMEOUT_MS)

  it('Q04 migrates genuine39 to an exact empty subject suffix and preserves outgoing Director authority', () => {
    input45() // Independent old4/6 marker is reached before the version assertion.
    expect(saves.LIVE_SAVE_VERSION).toBe(40)
    const api = futureAPI()
    const captureManifest = readFileSync(new URL('1221-p4p5-outgoing-capture/MANIFEST.json', E))
    expect(sha(captureManifest)).toBe('02115df5d6e7d4c33284b9a439a7c79601e1b2e807f4fa96c20149f5c84186f3')
    const pins = [
      ['1171-p3-current45-capture/genuine-v39-p3-market-week45.json.gz',
        '12799a849b0b4aff49cd9707ea8c1b87c64b4e787ff261b2e9cf4b109a953117', 'e7401f2578a7ad151383ca905df4253c2bbd82d6823c406c28b7e76aa809c5af'],
      ['1221-p4p5-outgoing-capture/director-bound-week52.json.gz',
        'b894a85ffad37378f93dc8a8e83bad926ab7a1bb857dd76e9b9926b520fec6e1', 'eae34cd10d457ad551028f3d0a160a55a74d5153b73653b257dc89a4338b040b'],
      ['1221-p4p5-outgoing-capture/director-earned-week61.json.gz',
        '97a1a96c32f0abe290a798734b322611e0be1f5a1c29461753c1d0b50feeceeb', '94558001e85aef5f46d709c07397dedda296416fe86e4f7482caeee88470cace'],
      ['1221-p4p5-outgoing-capture/director-satisfied-week78.json.gz',
        '788fdd550d240751c0ca4d89991b7dfd925495341f19b6e09c30d6efd8520e29', 'd0ce6b5427f2ca880214024019798e3372123e8148f542a6e22578b11c18ee80'],
      ['1221-p4p5-outgoing-capture/director-canceled-work-week61.json.gz',
        'c6492f5660b2e8fb20d48c6f054566b25f47500512d2b9ff87a8a6ebb46788b6', '8ebb7ca8758c79c8ada73889d24ecc4038e1e3b0edf5bd77c56c723cffee290d'],
      ['1221-p4p5-outgoing-capture/director-waived-week61.json.gz',
        '95ca93ba0a0f16b1c11ad34960a9617217685a681e8ad27ebf896e75f1debb0e', 'ad25e44bde2ec18bef17a37a252de4ee9323dd0d7b50dbdaf424be50a5d9abce'],
    ] as const
    for (const [filename, gzipHash, rawHash] of pins) {
      const { raw, save: old } = pinned39(filename, gzipHash, rawHash), before = stable(old)
      const current = saves.migrateToLive(old), valid = current as unknown as CurrentView
      expect(current.saveVersion).toBe(40); expect(api.validateSaveV40(current)).toBe(current)
      expect(valid.state.firstTakeSubjects).toEqual({ version: 1, cutoverOrdinal: old.state.firstTakes.length, facts: [] })
      expect(Object.keys(valid.state.firstTakeSubjects).sort()).toEqual(['cutoverOrdinal', 'facts', 'version'])
      // Comparison-only exclusion of the sole additive root, never an admission path.
      const { firstTakeSubjects: added, ...unchanged } = valid.state
      expect(added.facts).toEqual([]); expect(stable(unchanged)).toBe(stable(old.state))
      expect(stable(current.state.firstTakes)).toBe(stable(old.state.firstTakes))
      expect(stable(current.state.promises)).toBe(stable(old.state.promises))
      expect(stable(old)).toBe(before)
      expect(saves.exportSave(api.convertV40ToV39(current))).toBe(raw)
      expect(() => saves.validateSaveV39(current)).toThrow()
      admitted(current.state)
    }
    const positive = JSON.parse(bytes(input45())) as CurrentView
    expect(api.validateSaveV40(positive)).toBe(positive)
    expect(positive.state.firstTakeSubjects.cutoverOrdinal).toBe(19)
    const mutations: ((s: CurrentView) => void)[] = [
      s => { delete (s.state as Partial<CurrentView['state']>).firstTakeSubjects },
      s => { (s.state.firstTakeSubjects as unknown as { version: number }).version = 2 },
      s => { s.state.firstTakeSubjects.cutoverOrdinal = -1 },
      s => { s.state.firstTakeSubjects.cutoverOrdinal = 19.5 },
      s => { s.state.firstTakeSubjects.cutoverOrdinal = 20 },
      s => { s.state.firstTakeSubjects.cutoverOrdinal = 18 },
      s => { (s.state.firstTakeSubjects as unknown as Record<string, unknown>).extra = true },
      s => { s.state.firstTakeSubjects.facts.push({ eventId: 'first-take-event-0', conceptId: 'c-00', genre: 'drama', scriptProjectId: null }) },
    ]
    for (const mutate of mutations) {
      const bad = clone(positive); mutate(bad)
      expect(() => api.validateSaveV40(bad)).toThrow(/first.?take|subject|suffix|cutover/i)
      expect(() => api.convertV40ToV39(bad)).toThrow(/first.?take|subject|suffix|cutover/i)
    }
  }, LEAF_TIMEOUT_MS)
})
