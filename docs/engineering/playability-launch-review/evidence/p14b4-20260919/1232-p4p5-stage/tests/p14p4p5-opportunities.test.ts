// 1225-A/B/C, 1226-A initial four leaves; 1232-A/B adds two named cast-work routes.
// This staged postimage is installed at tests/ before parent-owned execution.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import * as core from '../src/core/index.js'
import * as saves from '../src/core/save.js'
import * as tickOwner from '../src/core/tick.js'
import * as promiseOwner from '../src/core/promises.js'
import { occupiedResourceSlots, resourceClaimsOf } from '../src/core/occupancy.js'
import { activeContract } from '../src/core/employment.js'
import type { Action, FirstTakeReceipt, GameState, Genre, Production, PromiseFeasibilityReceipt, ProfessionalPromise } from '../src/core/types.js'
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
type RouteName = 'Q05' | 'Q06'
type Phase = 'binding' | 'workflow'
type PhaseCount = { attempted: number; reserved: number; invoked: number; completed: number }
const emptyCount = (): PhaseCount => ({ attempted: 0, reserved: 0, invoked: 0, completed: 0 })
const routeCounts: Record<RouteName, Record<Phase, PhaseCount>> = {
  Q05: { binding: emptyCount(), workflow: emptyCount() },
  Q06: { binding: emptyCount(), workflow: emptyCount() },
}
let tickAttempts = 0, outsideRouteAttempts = 0
let permit: { route: RouteName; phase: Phase; used: boolean } | undefined
let restoreTick: (() => void) | undefined
const totalInvoked = () => Object.values(routeCounts).reduce((sum, route) => sum + route.binding.invoked + route.workflow.invoked, 0)
beforeAll(() => {
  const actualTick = tickOwner.tick
  const guard = vi.spyOn(tickOwner, 'tick').mockImplementation((state, options) => {
    tickAttempts++
    if (permit === undefined) { outsideRouteAttempts++; throw new Error('1232: no tick outside named Q05/Q06 route owners') }
    assert.equal(permit.used, false, 'no nested or second tick may reuse one authorization')
    permit.used = true
    const row = routeCounts[permit.route][permit.phase], both = routeCounts[permit.route]
    row.attempted++
    assert.ok(row.reserved < (permit.phase === 'binding' ? 7 : 40), 'named phase hard cap before invocation')
    assert.ok(both.binding.reserved + both.workflow.reserved < 47, 'named route hard cap47')
    assert.ok(totalInvoked() < 94, 'aggregate hard cap94 before invocation')
    row.reserved++; row.invoked++
    const beforeWeek = state.market.tick, next = actualTick(state, options)
    expect(next.market.tick).toBe(beforeWeek + 1); row.completed++
    return next
  })
  restoreTick = () => guard.mockRestore()
})
afterAll(() => {
  restoreTick?.()
  console.info('1227-P4P5-COUNTERS ' + JSON.stringify({ tickAttempts, outsideRouteAttempts,
    outsideNamedRoutesHardCap: 0, hardTickCap: 94, routeCounts,
    cachedPhases: [...cache].map(([name, row]) => ({ name, completed: row.ok })),
    routeCachedPhases: [...routeCache].map(([name, row]) => ({ name, completed: row.ok })),
    publicOperations }))
  expect(outsideRouteAttempts).toBe(0); expect(totalInvoked()).toBeLessThanOrEqual(94)
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

// 1232-A/B: two named public routes only; no imported simulation helper.
type RouteResult<T> = { ok: true; value: T } | { ok: false; error: unknown }
const routeCache = new Map<string, RouteResult<unknown>>()
const publicOperations: { route: RouteName; week: number; kind: string; productionId?: string }[] = []
function routeMemo<T>(key: string, build: () => T): T {
  const old = routeCache.get(key) as RouteResult<T> | undefined
  if (old) { if (!old.ok) throw old.error; return clone(old.value) }
  try { const value = build(); routeCache.set(key, { ok: true, value }); return clone(value) }
  catch (error) { routeCache.set(key, { ok: false, error }); throw error }
}
type SubjectFact = { eventId: string; conceptId: string; genre: Genre; scriptProjectId: string | null }
type OwnerFact = { studioId: string; productionId: string; conceptId: string; genre: Genre | null;
  scriptMode: string; scriptProjectIds: string[]; directorId: string; cast: Production['cast'] }
type TickTrace = { from: number; to: number; added: { receipt: FirstTakeReceipt; expectedSubject: SubjectFact }[] }
function ownerFacts(state: GameState): OwnerFact[] {
  const own = { studioId: issuer(state), productions: state.studio.activeProductions,
    development: state.scriptDevelopment, concepts: state.concepts }
  const owners = [own, ...(state.hollywood?.businesses ?? []).map(b => ({ studioId: b.studioId,
    productions: b.productions, development: b.development, concepts: state.hollywood!.concepts }))]
  return owners.flatMap(owner => owner.productions.map(p => ({ studioId: owner.studioId,
    productionId: p.id, conceptId: p.conceptId,
    genre: owner.concepts.find(c => c.id === p.conceptId)?.genre ?? null,
    scriptMode: owner.development.mode,
    scriptProjectIds: owner.development.projects.filter(s => s.productionId === p.id).map(s => s.id),
    directorId: p.directorId, cast: clone(p.cast) })))
}
function routeStep(route: RouteName, phase: Phase, state: GameState, trace: TickTrace[]): GameState {
  assert.equal(permit, undefined, 'one named route invocation at a time')
  const prior = clone(state.firstTakes), owners = ownerFacts(state), from = state.market.tick
  permit = { route, phase, used: false }
  let next: GameState
  try { next = tickOwner.tick(state, { develop: true }) } finally { permit = undefined }
  expect(next.firstTakes.slice(0, prior.length)).toEqual(prior)
  const afterOwners = ownerFacts(next)
  const added = next.firstTakes.slice(prior.length).map(receipt => {
    const owner = owners.find(o => o.studioId === receipt.studioId && o.productionId === receipt.productionId)
      ?? afterOwners.find(o => o.studioId === receipt.studioId && o.productionId === receipt.productionId)
    assert.ok(owner, 'actual newly recorded take has a direct issuing production owner')
    assert.ok(owner.genre, 'actual retained concept supplies its genre')
    expect(owner.directorId).toBe(receipt.directorId); expect(owner.cast).toEqual(receipt.cast)
    expect(owner.scriptProjectIds.length).toBeLessThanOrEqual(1)
    if (owner.scriptMode === 'managed') expect(owner.scriptProjectIds).toHaveLength(1)
    return { receipt: clone(receipt), expectedSubject: { eventId: receipt.eventId,
      conceptId: owner.conceptId, genre: owner.genre, scriptProjectId: owner.scriptProjectIds[0] ?? null } }
  })
  trace.push({ from, to: next.market.tick, added })
  // Missing new authority after an actual tick is a persistence semantic failure,
  // even if this whole-current boundary is the first owner that exposes it.
  admitted(next); return next
}
function routeAction(route: RouteName, state: GameState, action: Action): GameState {
  const beforeWeek = state.market.tick
  publicOperations.push({ route, week: state.market.tick, kind: action.kind,
    ...('productionId' in action && typeof action.productionId === 'string' ? { productionId: action.productionId } : {}) })
  const next = core.applyActions(state, [action]); expect(next.market.tick).toBe(beforeWeek)
  admitted(next); return next
}
const familyFor = (route: RouteName): OpportunityDraft['family'] =>
  route === 'Q05' ? 'PREFERRED_GENRE_OPPORTUNITY' : 'SPECIFIC_PROJECT'
type AttachedRoute = { state: GameState; request: OpportunityDraft; promiseId: string }
function routeAttached(route: RouteName): AttachedRoute {
  return routeMemo(`${route}:attached45`, () => {
    const base = input45(), request = draft(base, familyFor(route))
    const price = core.proposalDraft(base, issuer(base), FOCUS, 104, 1.25, 45)
    expect(base.studio.cash).toBeGreaterThanOrEqual(price.signingBonus)
    publicOperations.push({ route, week: 45, kind: 'submitProposal' })
    const proposed = core.submitProposal(base, { talentId: FOCUS, issuerStudioId: issuer(base), termWeeks: 104, premiumTier: 1.25 })
    admitted(proposed); expectRA(quote(proposed, request))
    publicOperations.push({ route, week: 45, kind: 'attachPromise' })
    const state = attach(proposed, request), row = state.promises.at(-1); assert.ok(row)
    expect(row).toMatchObject({ family: request.family, predicate: request.predicate, contractId: null })
    admitted(state); return { state, request, promiseId: row.promiseId }
  })
}
type FreezeFact = { week: number; promiseId: string; rootVersion: number; receipt: PromiseFeasibilityReceipt;
  price: ReturnType<typeof core.proposalDraft> }
type BoundRoute = AttachedRoute & { trace: TickTrace[]; freeze: FreezeFact[]; contractId: string }
function routeBound(route: RouteName): BoundRoute {
  return routeMemo(`${route}:bound52`, () => {
    const input = routeAttached(route), trace: TickTrace[] = [], freeze: FreezeFact[] = []
    const actual = promiseOwner.promiseFeasibility
    const spy = vi.spyOn(promiseOwner, 'promiseFeasibility').mockImplementation((state, request, week) => {
      const receipt = actual(state, request, week)
      if (week === 52 && request.promiseId === input.promiseId) {
        const root = state.promises.find(p => p.promiseId === input.promiseId); assert.ok(root)
        freeze.push({ week, promiseId: root.promiseId, rootVersion: root.version, receipt: clone(receipt),
          price: clone(core.proposalDraft(state, issuer(state), FOCUS, 104, 1.25, week)) })
      }
      return receipt
    })
    let state = input.state
    try { while (state.market.tick < 52) state = routeStep(route, 'binding', state, trace) }
    finally { spy.mockRestore() }
    expect(state.market.tick).toBe(52)
    const settlement = state.talentMarket.receipts.filter(r => r.kind === 'settled' && r.week === 52 && r.talentId === FOCUS)
    assert.ok(settlement.some(r => r.studioId === issuer(state)),
      `actual player victory prerequisite: ${JSON.stringify(settlement)}`)
    const contract = activeContract(state, FOCUS); assert.ok(contract)
    expect(contract).toMatchObject({ startWeek: 52, endWeekExclusive: 156, termWeeks: 104 })
    const employment = state.hollywood!.employment.find(e => e.studioId === issuer(state)
      && e.terms.talentId === FOCUS && e.terms.startWeek === 52 && e.terms.endWeekExclusive === 156 && e.endedWeek === null)
    assert.ok(employment, 'actual winning employment exists independently of promise binding')
    expect(state.ledger.filter(r => r.kind === 'signingBonus' && r.week === 52 && r.talentId === FOCUS))
      .toEqual([expect.objectContaining({ amount: -contract.signingBonus })])
    return { ...input, state, trace, freeze, contractId: employment.contractId }
  })
}
const ROUTE_CAST = { lead: FOCUS, antagonist: 'authored-0001', support: 'authored-0005' }
function routeGreenlight(route: RouteName, state: GameState, cast = ROUTE_CAST): { state: GameState; productionId: string } {
  const project = state.scriptDevelopment.projects.find(p => p.id === 'script-0000'); assert.ok(project)
  expect(project).toMatchObject({ status: 'ready', productionId: null, writerId: 'authored-0003' })
  const concept = state.concepts.find(c => c.id === project.conceptId); assert.ok(concept)
  expect(concept.genre).toBe('drama')
  const old = new Set(state.studio.activeProductions.map(p => p.id))
  const next = routeAction(route, state, { kind: 'greenlightScriptProject', production: {
    projectId: project.id, directorId: 'authored-0002', craftIds: ['authored-0004'], cast,
    budget: { negative: concept.baseNegativeCost, marketing: 0 } } })
  const created = next.studio.activeProductions.filter(p => !old.has(p.id)); expect(created).toHaveLength(1)
  const production = created[0]!
  expect(production).toMatchObject({ writerId: 'authored-0003', directorId: 'authored-0002', cast,
    conceptId: project.conceptId, remainingTicks: 8 })
  expect(next.scriptDevelopment.projects.find(p => p.id === project.id))
    .toMatchObject({ status: 'inProduction', productionId: production.id })
  assert.ok(next.operations.workflows.some(w => w.productionId === production.id), 'actual workflow, not a queued request')
  return { state: next, productionId: production.id }
}
type FilmRoute = BoundRoute & { greenlit: GameState; held: GameState; scheduled: GameState;
  afterTake: GameState; released: GameState; productionId: string; take: FirstTakeReceipt }
function routeFilm(route: RouteName): FilmRoute {
  return routeMemo(`${route}:released`, () => {
    const input = routeBound(route), made = routeGreenlight(route, input.state), greenlit = clone(made.state)
    const trace = clone(input.trace)
    let state = made.state, held: GameState | undefined, scheduled: GameState | undefined,
      afterTake: GameState | undefined, ownTake: FirstTakeReceipt | undefined, recipeSet = false, assigned = false, committed = false
    for (let i = 0; i < 40; i++) {
      let workflow = state.operations.workflows.find(w => w.productionId === made.productionId); assert.ok(workflow)
      if (workflow.phase === 'rehearsal' && !recipeSet) {
        state = routeAction(route, state, { kind: 'setProductionSetupRecipe', productionId: made.productionId,
          recipeId: 'ballroom-reveal-lighting-01', expectedPlanRevision: workflow.planRevision })
        recipeSet = true
      }
      const production = state.studio.activeProductions.find(p => p.id === made.productionId); assert.ok(production)
      if (production.remainingTicks === 5 && held === undefined) { held = clone(state); admitted(held) }
      workflow = state.operations.workflows.find(w => w.productionId === made.productionId); assert.ok(workflow)
      if (workflow.shootingTask?.status === 'unassigned') {
        assert.equal(assigned, false, 'no repeated Director assignment to rescue a reopened task')
        state = routeAction(route, state, { kind: 'assignShootingDirector', productionId: made.productionId, directorId: 'authored-0002' })
        assigned = true
      }
      if (state.operations.workflows.find(w => w.productionId === made.productionId)?.shootingTask?.status === 'ready') {
        assert.equal(scheduled, undefined, 'one actual schedule action; no retry')
        state = routeAction(route, state, { kind: 'scheduleShootingTake', productionId: made.productionId })
        expect(state.operations.workflows.find(w => w.productionId === made.productionId)?.shootingTask?.status).toBe('scheduled')
        if (scheduled === undefined) { scheduled = clone(state); admitted(scheduled) }
      }
      if (production.remainingTicks === 1 && !committed) {
        state = routeAction(route, state, { kind: 'commitPictureToRelease', productionId: made.productionId })
        committed = true
      }
      const before = state; state = routeStep(route, 'workflow', state, trace)
      const takes = state.firstTakes.filter(t => t.productionId === made.productionId && t.studioId === issuer(state))
      if (takes.length > 0 && afterTake === undefined) {
        expect(before.studio.activeProductions.find(p => p.id === made.productionId)?.remainingTicks).toBe(5)
        expect(state.studio.activeProductions.find(p => p.id === made.productionId)?.remainingTicks).toBe(4)
        expect(takes).toHaveLength(1); ownTake = clone(takes[0]!)
        expect(ownTake).toMatchObject({ directorId: 'authored-0002', cast: ROUTE_CAST, week: state.market.tick })
        afterTake = clone(state)
      }
      if (state.studio.releasedFilms.some(f => f.productionId === made.productionId)) {
        assert.ok(recipeSet && assigned && committed && held && scheduled && afterTake && ownTake, 'actual workflow and take precede real release')
        return { ...input, trace, state, greenlit, held, scheduled, afterTake, released: state,
          productionId: made.productionId, take: ownTake }
      }
    }
    throw new Error(`${route}: real cast film did not release within40 calls; no rescue`)
  })
}
function retained(state: GameState, promiseId: string): ProfessionalPromise {
  const row = state.promises.find(p => p.promiseId === promiseId); assert.ok(row)
  return row
}
function subjects(state: GameState): { version: number; cutoverOrdinal: number; facts: SubjectFact[] } {
  return (state as unknown as { firstTakeSubjects: { version: number; cutoverOrdinal: number; facts: SubjectFact[] } }).firstTakeSubjects
}
function checkBinding(route: RouteName, input: BoundRoute): void {
  const row = retained(input.state, input.promiseId), contract = activeContract(input.state, FOCUS); assert.ok(contract)
  console.info('1232-P4P5-BOUND ' + JSON.stringify({ route, week: input.state.market.tick,
    actualContractId: input.contractId, promise: row, freeze: input.freeze, counters: routeCounts[route] }))
  expect(row).toMatchObject({ family: input.request.family, predicate: input.request.predicate,
    contractId: input.contractId, progress: 0, evidenceRefs: [], outcome: null, version: 7 })
  expect(input.freeze.length).toBeGreaterThan(0)
  for (const frozen of input.freeze) {
    expect(frozen).toMatchObject({ week: 52, promiseId: input.promiseId, rootVersion: 7,
      receipt: { classification: 'REASONABLY_ACHIEVABLE', rulesVersion: 7, bottleneck: null } })
    expect(frozen.price.signingBonus).toBe(contract.signingBonus)
    expect(frozen.price.annualSalary).toBe(contract.annualSalary)
  }
  expect(row.feasibilityReceipt).toEqual(input.freeze.at(-1)!.receipt)
  expect(routeCounts[route].binding.completed).toBe(7)
}
function checkActualSuffix(input: FilmRoute): void {
  expect(input.trace).toHaveLength(input.released.market.tick - 45)
  expect(input.trace.map(t => [t.from, t.to])).toEqual(Array.from({ length: input.trace.length }, (_, i) => [45 + i, 46 + i]))
  const expected = input.trace.flatMap(t => t.added), old = input45().firstTakes
  expect(input.released.firstTakes.slice(0, old.length)).toEqual(old)
  expect(input.released.firstTakes.slice(old.length)).toEqual(expected.map(e => e.receipt))
  expect(subjects(input.released)).toEqual({ version: 1, cutoverOrdinal: old.length,
    facts: expected.map(e => e.expectedSubject) })
  const own = expected.find(e => e.receipt.eventId === input.take.eventId); assert.ok(own)
  expect(own.expectedSubject).toEqual({ eventId: input.take.eventId, conceptId: 'c-00', genre: 'drama', scriptProjectId: 'script-0000' })
  expect(subjects(input.afterTake).facts.find(f => f.eventId === input.take.eventId)).toEqual(own.expectedSubject)
  expect(input.released.scriptDevelopment.projects.find(p => p.id === 'script-0000'))
    .toMatchObject({ status: 'produced', productionId: input.productionId })
  expect(input.released.studio.releasedFilms.find(f => f.productionId === input.productionId))
    .toMatchObject({ conceptId: 'c-00' })
}
function checkTakeAndRelease(route: RouteName, input: FilmRoute): void {
  const atTake = retained(input.afterTake, input.promiseId)
  console.info('1232-P4P5-WORK ' + JSON.stringify({ route, productionId: input.productionId,
    actualHeldWeek: input.held.market.tick, actualScheduledWeek: input.scheduled.market.tick,
    take: input.take, releaseWeek: input.released.market.tick, promise: atTake,
    actualNewSubjects: subjects(input.released), expectedFromOwners: input.trace.flatMap(t => t.added),
    counters: routeCounts[route] }))
  expect(input.take.week).toBeGreaterThanOrEqual(52); expect(input.take.week).toBeLessThan(112)
  for (const state of [input.greenlit, input.held, input.scheduled]) {
    expect(state.firstTakes.filter(t => t.productionId === input.productionId)).toEqual([])
    expect(retained(state, input.promiseId)).toMatchObject({ progress: 0, evidenceRefs: [], outcome: null })
  }
  expect(input.held.studio.activeProductions.find(p => p.id === input.productionId)?.remainingTicks).toBe(5)
  expect(input.scheduled.operations.workflows.find(w => w.productionId === input.productionId)?.shootingTask?.status).toBe('scheduled')
  expect(atTake).toMatchObject({ contractId: input.contractId, progress: 1, evidenceRefs: [input.take.eventId],
    outcome: 'SATISFIED', outcomeWeek: input.take.week })
  assert.ok(atTake.outcomeEventId)
  expect(input.afterTake.talentMarket.receipts.filter(r => r.eventId === atTake.outcomeEventId))
    .toEqual([expect.objectContaining({ kind: 'promiseOutcome', talentId: FOCUS, studioId: issuer(input.afterTake), week: input.take.week })])
  expect(retained(input.released, input.promiseId)).toEqual(atTake)
  checkActualSuffix(input)
  const replayInput = clone(input.afterTake), preimage = bytes(replayInput), rng = clone(replayInput.rngState)
  const production = replayInput.studio.activeProductions.find(p => p.id === input.productionId); assert.ok(production)
  publicOperations.push({ route, week: replayInput.market.tick, kind: 'appendFirstTakes:existing-production', productionId: production.id })
  const replay = promiseOwner.appendFirstTakes(replayInput, [{ studioId: issuer(replayInput), production: clone(production) }], input.take.week)
  expect(bytes(replay)).toBe(preimage); expect(bytes(replayInput)).toBe(preimage); expect(replay.rngState).toEqual(rng)
}
function checkZeroTickCancellations(route: RouteName, input: FilmRoute): void {
  const beforeCount = totalInvoked(), held = clone(input.held), heldPromise = clone(retained(held, input.promiseId))
  expect(heldPromise).toMatchObject({ progress: 0, outcome: null })
  expect(held.firstTakes.some(t => t.productionId === input.productionId)).toBe(false)
  const pre = routeAction(route, held, { kind: 'cancel', productionId: input.productionId })
  expect(pre.studio.activeProductions.some(p => p.id === input.productionId)).toBe(false)
  expect(pre.operations.workflows.some(w => w.productionId === input.productionId)).toBe(false)
  expect(pre.scriptDevelopment.projects.find(p => p.id === 'script-0000'))
    .toMatchObject({ status: 'ready', productionId: null })
  expect(core.assignmentRefusal(pre, FOCUS, pre.market.tick, 'actor')).toBeNull()
  const earliestFreshTake = Math.max(52, pre.market.tick) + 5
  expect(earliestFreshTake).toBeLessThan(heldPromise.dueWeekExclusive)
  console.info('1232-P4P5-PRE-CANCEL ' + JSON.stringify({ route, actualWeek: pre.market.tick,
    expectedEarliestFreshTake: earliestFreshTake, due: heldPromise.dueWeekExclusive,
    actualPromise: retained(pre, input.promiseId) }))
  // Ready target + lawful fresh role + real remaining time: no physical loss.
  expect(retained(pre, input.promiseId)).toEqual(heldPromise)
  expect(pre.firstTakes).toEqual(input.held.firstTakes)
  expect(subjects(pre)).toEqual(subjects(input.held))
  const afterTake = clone(input.afterTake), earned = clone(retained(afterTake, input.promiseId))
  const post = routeAction(route, afterTake, { kind: 'cancel', productionId: input.productionId })
  expect(post.scriptDevelopment.projects.find(p => p.id === 'script-0000'))
    .toMatchObject({ status: 'ready', productionId: null })
  expect(retained(post, input.promiseId)).toEqual(earned)
  expect(post.firstTakes).toEqual(input.afterTake.firstTakes); expect(subjects(post)).toEqual(subjects(input.afterTake))
  const conduct = post.relationships.flatMap(edge => edge.recent)
    .filter(row => row.kind === 'cancelledAfterFirstTake' && row.ref === input.productionId)
  expect(conduct.length).toBeGreaterThan(0)
  expect(conduct.every(row => row.week === input.take.week && row.delta < 0)).toBe(true)
  for (const personId of [FOCUS, null]) {
    const before = promiseOwner.trustDrivers(input.afterTake, personId, issuer(input.afterTake), input.take.week)
      .filter(row => row.kind === 'cancelledAfterFirstTake')
    const after = promiseOwner.trustDrivers(post, personId, issuer(post), input.take.week)
      .filter(row => row.kind === 'cancelledAfterFirstTake')
    expect(after).toHaveLength(before.length + 1)
    for (const old of before) expect(after).toContainEqual(old)
  }
  expect(totalInvoked()).toBe(beforeCount)
}

describe('P4/P5 actual public binding and cast work', () => {
  it('Q05 binds the selected genre and records one actual cast take through release and cancellation', () => {
    const bound = routeBound('Q05'); checkBinding('Q05', bound)
    const work = routeFilm('Q05'); checkTakeAndRelease('Q05', work)
    checkZeroTickCancellations('Q05', work)
    expect(routeCounts.Q05.workflow.completed).toBeLessThanOrEqual(40)
    expect(routeCounts.Q05.binding.completed + routeCounts.Q05.workflow.completed).toBeLessThanOrEqual(47)
  }, LEAF_TIMEOUT_MS)

  it('Q06 binds the exact screenplay and distinguishes its cast take from a real wrong-seat greenlight', () => {
    const bound = routeBound('Q06'); checkBinding('Q06', bound)
    const work = routeFilm('Q06'); checkTakeAndRelease('Q06', work)
    checkZeroTickCancellations('Q06', work)
    const beforeCount = totalInvoked(), original = retained(bound.state, bound.promiseId)
    expect(original).toMatchObject({ progress: 0, evidenceRefs: [], outcome: null })
    const wrong = routeGreenlight('Q06', clone(bound.state), {
      lead: 'authored-0000', antagonist: 'authored-0001', support: 'authored-0005' })
    const root = retained(wrong.state, bound.promiseId)
    expect(wrong.state.firstTakes.some(t => t.productionId === wrong.productionId)).toBe(false)
    const actualProduction = wrong.state.studio.activeProductions.find(p => p.id === wrong.productionId); assert.ok(actualProduction)
    console.info('1232-P4P5-WRONG-SEAT ' + JSON.stringify({ actualWeek: wrong.state.market.tick,
      production: { id: actualProduction.id, conceptId: actualProduction.conceptId, writerId: actualProduction.writerId,
        directorId: actualProduction.directorId, cast: actualProduction.cast, remainingTicks: actualProduction.remainingTicks }, promise: root }))
    expect(root).toMatchObject({ progress: 0, evidenceRefs: [], outcome: 'BROKEN', outcomeWeek: 52 })
    expect(root.outcomeCause).toMatch(/project|screenplay|seat|cast/i); assert.ok(root.outcomeEventId)
    expect(wrong.state.talentMarket.receipts.filter(r => r.eventId === root.outcomeEventId))
      .toEqual([expect.objectContaining({ kind: 'promiseOutcome', week: 52, talentId: FOCUS, studioId: issuer(wrong.state) })])
    expect(subjects(wrong.state)).toEqual(subjects(bound.state))
    expect(totalInvoked()).toBe(beforeCount)
    expect(routeCounts.Q06.workflow.completed).toBeLessThanOrEqual(40)
    expect(routeCounts.Q06.binding.completed + routeCounts.Q06.workflow.completed).toBeLessThanOrEqual(47)
  }, LEAF_TIMEOUT_MS)
})
