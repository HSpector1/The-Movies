// Proposed tests/p15b-legacy-terminal-regression.test.ts; scratch only, NOT run/admitted.
// All debit/film-cost inputs below are labelled constructed transactions, not natural gameplay.
// Measured route-L terminal6239/6240/6241, late6273 and two-closure163 controls; failed original3 expectation preserved elsewhere.
import { expect, it, vi } from 'vitest'
import * as legacy from '../src/core/campaignLegacy.js'
import * as save from '../src/core/save.js'
import * as technology from '../src/core/technology.js'
import { tick } from '../src/core/tick.js'
import { applyActions } from '../src/core/actions.js'
import type { GameState } from '../src/core/types.js'
import { routeL } from './helpers/p15c2-route-l.js'
import { captureAt, budgeted, ROUTE_MS, FIXTURE_MS } from './helpers/p15c2-legacy.js'
import { base, drainPlayer, drainRival, closureOf, playerClosure, PLAYER, R03, R04, canon } from './helpers/p15b-live.js'
import { p15Rows } from './helpers/p15-roots.js'

type Case = { before: GameState; final: GameState }
const cache = new Map<number, Case>()
function terminalCase(c: 6239 | 6240 | 6241): Case {
  const cached = cache.get(c); if (cached) return cached
  const source = routeL().foundedAtFounding; const sourceBytes = canon(source)
  expect(source.market.tick).toBe(6188); expect(() => save.makeSave(source)).not.toThrow()
  let state = structuredClone(source)
  while (state.market.tick < c - 33) state = tick(state)
  expect(() => save.makeSave(state)).not.toThrow()
  state = drainPlayer(state, Math.floor(state.studio.cash) + 1)
  expect(state.studio.cash).toBeLessThan(0); expect(() => save.makeSave(state)).not.toThrow()
  let before = state
  while (state.market.tick < c && !closureOf(state, state.hollywood!.playerStudioId)) { before = state; state = tick(state) }
  expect(closureOf(state, state.hollywood!.playerStudioId)?.closureWeek, 'measured chronology, never shift').toBe(c)
  expect(before.market.tick).toBe(c - 1)
  expect(() => save.makeSave(before)).not.toThrow(); expect(() => save.makeSave(state)).not.toThrow()
  expect(canon(source)).toBe(sourceBytes)
  const result = { before, final: state }; cache.set(c, result); return result
}
function closureRefs(manifest: legacy.OfficialLegacy, studioId: string) {
  const s = manifest.studios.find(s => s.studioId === studioId)!
  return { archetype: s.archetypes.find(a => a.archetypeId === 'resilient-survivor')!, lens: s.lenses.find(l => l.lensId === 'resilience')! }
}

it('terminal6239-6240-6241-cutoffs-ranking-and-modern-official-history', budgeted(ROUTE_MS, () => {
  for (const c of [6239, 6240, 6241] as const) {
    const { before, final } = terminalCase(c); const player = closureOf(final, final.hollywood!.playerStudioId)!
    const ended = final.campaignLegacy.endOfRun!
    expect(ended).toMatchObject({ definition: 'campaign-legacy/v3', kind: 'endOfRun', boundaryWeek: c + 1, postFinaleMode: null, closureId: player.closureId })
    expect(final.market.tick).toBe(c); expect(player.endOfRun).toBe(ended.legacySnapshotId)
    const refs = closureRefs(ended, player.studioId)
    expect(refs.archetype.contrary).toContainEqual({ domainId: 'studioClosures', id: player.closureId })
    expect(refs.lens.refs).toContainEqual({ domainId: 'studioClosures', id: player.closureId })
    expect(refs.lens.counts.closures).toBe(1)
    if (c === 6239) expect(final.campaignLegacy.official).toBeNull()
    if (c === 6240) {
      const official = final.campaignLegacy.official!
      expect(official.boundaryWeek).toBe(6240); expect(official.p15DomainSequence).toBeGreaterThan(player.p15DomainSequence)
      expect(ended.p15DomainSequence).toBeGreaterThan(official.p15DomainSequence)
      const at = closureRefs(official, player.studioId)
      expect(at.lens.counts.closures).toBe(0)
      expect(at.archetype.contrary).not.toContainEqual({ domainId: 'studioClosures', id: player.closureId })
      const quarter = final.powerRanking.snapshots.find(s => s.week === 6240)!
      expect(quarter).toBeDefined(); expect(quarter.rows.some(r => r.studioId === player.studioId), 'actual player remains in Ranking at W=C before closure').toBe(true)
      expect(official.sources.find(s => s.domainId === 'powerRanking')!.highWatermark).toBe(Math.max(0, ...final.powerRanking.snapshots.filter(s => s.p15DomainSequence < official.p15DomainSequence).map(s => s.p15DomainSequence)))
    }
    if (c === 6241) expect(canon(final.campaignLegacy.official)).toBe(canon(before.campaignLegacy.official))
    expect(canon(save.importSave(save.exportSave(save.makeSave(final))).state)).toBe(canon(final))
  }
}), ROUTE_MS)

it('terminal6241-preserves-frozen-v1-v2-official-through-actual-player-closure', budgeted(ROUTE_MS, () => {
  const input = terminalCase(6241).before; const sourceBytes = canon(input)
  for (const version of ['campaign-legacy/v1', 'campaign-legacy/v2'] as const) {
    const entry = legacy.LEGACY_DEFINITIONS[version]
    const facts = legacy.legacyFactsFromState(input, 6240, version)
    const official = { ...input.campaignLegacy.official!, ...entry.evaluate(facts, 'official2040') }
    const state = { ...input, campaignLegacy: { ...input.campaignLegacy, official } }
    expect(() => save.makeSave(state), 'own historical payload admits before terminal tick').not.toThrow()
    const bytes = canon(official); const final = tick(state)
    expect(closureOf(final, final.hollywood!.playerStudioId)?.closureWeek).toBe(6241)
    expect(canon(final.campaignLegacy.official)).toBe(bytes)
    expect(final.campaignLegacy.endOfRun!.definition).toBe('campaign-legacy/v3')
    expect(() => save.makeSave(final)).not.toThrow(); expect(canon(input)).toBe(sourceBytes)
  }
}), ROUTE_MS)

// Parent measured late route actual6273 with all admission/purity checks; stored6240, no altered history.
it('late-recording-actual6273-closure-keeps-null-official', budgeted(ROUTE_MS, () => {
  const capture = captureAt(s => s.market.tick === 6240, 'stored routeL6240')
  const source = save.migrateToLive(capture as never).state as GameState; const sourceBytes = canon(source)
  expect(source.campaignLegacy.recordedFromWeek).toBe(6240); expect(source.campaignLegacy.official).toBeNull()
  expect(source.corporateCondition.studios).toHaveLength(0); expect(() => save.makeSave(source)).not.toThrow()
  let state = drainPlayer(structuredClone(source), Math.floor(source.studio.cash) + 1)
  expect(() => save.makeSave(state)).not.toThrow()
  while (state.market.tick < 6273 && !closureOf(state, state.hollywood!.playerStudioId)) state = tick(state)
  const c = closureOf(state, state.hollywood!.playerStudioId)!
  expect(c?.closureWeek, 'measured constructed chronology, not a gameplay timing law').toBe(6273)
  expect(state.campaignLegacy.official).toBeNull(); expect(state.campaignLegacy.endOfRun!.boundaryWeek).toBe(c.closureWeek + 1)
  expect(c.endOfRun).toBe(state.campaignLegacy.endOfRun!.legacySnapshotId)
  expect(() => save.makeSave(state)).not.toThrow(); expect(canon(source)).toBe(sourceBytes)
}), ROUTE_MS)

// Independently reviewed measured2 witness from FAILED original3 diagnostic: player17,r04 18,ended19,next20.
// Those observations are not a new three-GREEN result or gameplay timing/sequence law.
let multi: Case | undefined
function multiCase(): Case {
  if (multi) return multi
  const source = base(); const bytes = canon(source); expect(() => save.makeSave(source)).not.toThrow()
  const talentId = source.freeAgents[0]!; expect(talentId).toBeDefined()
  let state = applyActions(structuredClone(source), [{ kind: 'signContract', talentId, termWeeks: 52 }])
  const h = state.hollywood!
  const candidates = h.businesses.filter(b => b.projects.some(p => p.productionId !== null && h.films.some(f => f.filmId === p.productionId && f.provenance === 'simulation/v1' && f.settledWeek !== null))).map(b => b.studioId).sort()
  expect(candidates).toContain(R04); const other = candidates.find(id => id !== R04 && h.businesses.find(b => b.studioId === id)!.account.cash < 10_000_000)!
  expect(other, 'second genuinely settled rival below unchanged10M debit; measured r03').toBeDefined()
  state = drainRival(drainRival(drainPlayer(state, Math.floor(state.studio.cash) + 1), R04, 10_000_000), other, 10_000_000)
  expect(() => save.makeSave(state)).not.toThrow(); let before = state
  while (state.market.tick < 163 && !closureOf(state, h.playerStudioId)) { before = state; state = tick(state) }
  expect(other, 'exact measured r2 selector, no seed chase').toBe(R03)
  const targets = [h.playerStudioId, R04].sort()
  const rows = state.studioClosure.closures
  expect(rows).toHaveLength(2)
  expect(rows.map(c => c.studioId), 'measured2 actual closures, not erased failed3 assertion').toEqual(targets)
  expect(rows.every(c => c.closureWeek === 163)).toBe(true)
  expect(closureOf(state, other)).toBeUndefined()
  const pending = state.corporateCondition.studios.find(r => r.studioId === other)!
  expect(pending.condition.stage).toBe('distress')
  expect(pending.condition.negativeRun).toBe(11); expect(pending.condition.lowRun).toBe(15)
  expect(state.corporateCondition.events.some(e => e.studioId === other && e.to === 'closed')).toBe(false)
  expect(() => save.makeSave(before)).not.toThrow(); expect(() => save.makeSave(state)).not.toThrow(); expect(canon(source)).toBe(bytes)
  multi = { before, final: state }; return multi
}
it('two-actual-closures-and-not-yet-due-r03-before-one-ended-use-returned-allocator', budgeted(FIXTURE_MS, () => {
  const { before, final } = multiCase(); const c = final.studioClosure.closures.filter(c => c.closureWeek === final.market.tick)
  expect(c.map(c => c.studioId)).toEqual(c.map(c => c.studioId).sort())
  const ended = final.campaignLegacy.endOfRun!
  expect(ended.p15DomainSequence).toBeGreaterThan(Math.max(...c.map(c => c.p15DomainSequence)))
  const player = c.find(c => c.studioId === final.hollywood!.playerStudioId)!
  expect(c.filter(c => c.endOfRun !== null)).toEqual([player])
  expect(ended.p15DomainSequence, 'rival allocations after player must not be overwritten').toBeGreaterThan(player.p15DomainSequence + 1)
  const sequences = p15Rows(final).map(r => r.p15DomainSequence)
  expect(new Set(sequences).size).toBe(sequences.length); expect(final.p15Sequence.next).toBe(Math.max(...sequences) + 1)
  expect(final.campaignLegacy.official).toBeNull()
  const inputBytes = canon(before); expect(canon(tick(before))).toBe(canon(final)); expect(canon(before)).toBe(inputBytes)
}), FIXTURE_MS)

it('closure-preparation-fault-rolls-back-whole-admitted-caller', budgeted(FIXTURE_MS, () => {
  const route = playerClosure(); const final = [...route.values()].find(s => closureOf(s, PLAYER))!
  const c = closureOf(final, PLAYER)!.closureWeek; const input = route.get(c - 1)!
  expect(() => save.makeSave(input)).not.toThrow(); const bytes = canon(input)
  const real = technology.researchAfterEmploymentRelease
  const spy = vi.spyOn(technology, 'researchAfterEmploymentRelease').mockImplementation((s, talent, studio) => {
    if (studio === PLAYER && s.market.tick === c) throw new Error('fault: real closure employment preparation')
    return real(s, talent, studio)
  })
  try {
    expect(() => tick(input)).toThrow('fault: real closure employment preparation')
    expect(spy.mock.calls.some(([s, , studio]) => studio === PLAYER && s.market.tick === c)).toBe(true)
    expect(canon(input)).toBe(bytes)
  } finally { spy.mockRestore() }
}), FIXTURE_MS)

it('eligible6240-official-builder-and-adapter-faults-preserve-pre-boundary-input', budgeted(ROUTE_MS, () => {
  const input = terminalCase(6240).before; const bytes = canon(input)
  const realBuilder = legacy.buildLegacyManifest
  const buildSpy = vi.spyOn(legacy, 'buildLegacyManifest').mockImplementation((facts, kind, definition) => {
    if (kind === 'official2040') throw new Error('fault: eligible official builder')
    return realBuilder(facts, kind, definition)
  })
  try {
    expect(() => tick(input)).toThrow('fault: eligible official builder')
    expect(buildSpy.mock.calls.some(([, kind]) => kind === 'official2040')).toBe(true)
    expect(canon(input)).toBe(bytes)
  } finally { buildSpy.mockRestore() }
  const adapterSpy = vi.spyOn(legacy, 'legacyFactsFromState').mockImplementation(() => { throw new Error('fault: real publication adapter') })
  try {
    expect(() => tick(input)).toThrow('fault: real publication adapter')
    expect(adapterSpy).toHaveBeenCalled(); expect(canon(input)).toBe(bytes)
  } finally { adapterSpy.mockRestore() }
}), ROUTE_MS)

it('two-closure-real-final-reader-allocator-failure-preserves-caller', budgeted(FIXTURE_MS, () => {
  const input = multiCase().before; const bytes = canon(input)
  const realReader = save.validateSaveP15B
  // Always run REAL admission first; only a detached completed candidate is damaged for actual allocator refusal.
  // This never returns a successful validation stub and cannot publish the detached hostile state.
  const spy = vi.spyOn(save, 'validateSaveP15B').mockImplementation(envelope => {
    const admitted = realReader(envelope)
    expect(admitted.state.studioClosure.closures.filter(c => c.closureWeek === 163)).toHaveLength(2)
    expect(admitted.state.campaignLegacy.endOfRun).not.toBeNull()
    const bad = structuredClone(admitted); bad.state.p15Sequence.next += 1
    return realReader(bad)
  })
  try {
    expect(() => tick(input)).toThrow(/p15Sequence.next/)
    expect(spy).toHaveBeenCalled(); expect(canon(input)).toBe(bytes)
  } finally { spy.mockRestore() }
}), FIXTURE_MS)

it('ended-links-cutoffs-refs-phase-and-allocator-mutants-refuse-with-input-purity', budgeted(ROUTE_MS, () => {
  const final = terminalCase(6240).final; const baseline = save.makeSave(final)
  expect(() => save.validateSaveP15B(baseline)).not.toThrow()
  const mutants: [string, (s: GameState) => void, RegExp][] = [
    ['orphan ended link', s => { s.campaignLegacy.endOfRun!.closureId = 'absent-closure' }, /endOfRun.closureId/],
    ['reverse closure link', s => { closureOf(s, s.hollywood!.playerStudioId)!.endOfRun = 'absent-manifest' }, /endOfRun.closureId/],
    ['wrong exclusive cutoff', s => { s.campaignLegacy.endOfRun!.boundaryWeek -= 1 }, /endOfRun.boundaryWeek/],
    ['wrong ended kind', s => { Object.assign(s.campaignLegacy.endOfRun!, { kind: 'official2040' }) }, /endOfRun.kind/],
    ['non-null ended mode', s => { Object.assign(s.campaignLegacy.endOfRun!, { postFinaleMode: 'ordinary-simulation\/v1' }) }, /endOfRun.postFinaleMode/],
    ['historical ended definition', s => { Object.assign(s.campaignLegacy.endOfRun!, { definition: 'campaign-legacy\/v2' }) }, /endOfRun.definition/],
    ['wrong snapshot ID', s => { s.campaignLegacy.endOfRun!.legacySnapshotId = 'not-the-sequence-id'; closureOf(s, s.hollywood!.playerStudioId)!.endOfRun = 'not-the-sequence-id' }, /endOfRun.legacySnapshotId/],
    ['wrong phase', s => { s.campaignLegacy.endOfRun!.phaseOrdinal = 4 }, /endOfRun.phaseOrdinal/],
    ['wrong era phase table', s => { s.campaignLegacy.endOfRun!.phaseOrderVersion = 1 }, /endOfRun.phaseOrderVersion/],
    ['missing actual closure reference', s => { closureRefs(s.campaignLegacy.endOfRun!, s.hollywood!.playerStudioId).archetype.contrary.find(r => r.domainId === 'studioClosures')!.id = 'absent-closure' }, /endOfRun.*studioClosures/],
    ['false closure watermark', s => { s.campaignLegacy.endOfRun!.sources.find(d => d.domainId === 'studioClosures')!.highWatermark = 0 }, /endOfRun.sources.*highWatermark/],
    ['recording backfill', s => { s.campaignLegacy.endOfRun!.sources.find(d => d.domainId === 'studioClosures')!.recordedFromWeek = null }, /endOfRun.sources.*recordedFromWeek/],
    ['global allocator gap', s => { s.p15Sequence.next += 1 }, /p15Sequence.next/],
  ]
  for (const [name, edit, refusal] of mutants) {
    const bad = structuredClone(baseline); edit(bad.state)
    const bytes = canon(bad); expect(() => save.validateSaveP15B(bad), name).toThrow(refusal); expect(canon(bad), name).toBe(bytes)
  }
}), ROUTE_MS)

it('terminal6240-composed-downward-refusal-preserves-all-authority', budgeted(ROUTE_MS, () => {
  const final = terminalCase(6240).final; const baseline = save.makeSave(final); const bytes = canon(baseline)
  for (const convert of [save.convertFromP15BSave, save.migrateToV47, save.migrateToV46, save.migrateToV45]) {
    let message = ''
    try { convert(baseline) } catch (e) { message = e instanceof Error ? e.message : String(e) }
    expect(message).toMatch(/corporateCondition/); expect(message).toMatch(/cannot downgrade or discard an actual studio closure/)
    expect(message).toMatch(/modern Legacy v3 official authority/); expect(message).toMatch(/ended Legacy manifest/)
    expect(message).toMatch(/frozen 2040 Legacy/)
    // This leaf asserts modern+P15 composition only. It is NOT nonempty fund/recovery composition proof.
    // Precise gap: no admitted nonempty fund/recovery PLUS modern terminal composition witness supplied here.
    // Prior founding/recovery owner suites retain their own witnesses; schedule them separately before fullqualification.
    expect(canon(baseline)).toBe(bytes)
  }
}), ROUTE_MS)

// Isolated real allocator-owner proof; full-reader earlier closure-order refusals cannot substitute.
it('real-global-allocator-rejects-duplicate-stamps-on-admitted-two-closure-input', budgeted(FIXTURE_MS, () => {
  const baseline = save.makeSave(multiCase().final)
  expect(() => save.validateSaveP15B(baseline)).not.toThrow()
  const roots = ['sharedMarket', 'powerRanking', 'campaignLegacy', 'corporateCondition', 'studioClosure']
  expect(() => save.validateP15Allocator(baseline.state as unknown as Record<string, unknown>, 'allocator-owner-control', roots)).not.toThrow()
  const bad = structuredClone(baseline); const rows = bad.state.studioClosure.closures.filter(c => c.closureWeek === 163)
  expect(rows).toHaveLength(2); expect(rows[0]!.p15DomainSequence).not.toBe(rows[1]!.p15DomainSequence)
  rows[1]!.p15DomainSequence = rows[0]!.p15DomainSequence
  const bytes = canon(bad)
  expect(() => save.validateP15Allocator(bad.state as unknown as Record<string, unknown>, 'allocator-owner-control', roots)).toThrow(/duplicate/)
  expect(canon(bad)).toBe(bytes)
  // This directly measures the exported owner rule. It does NOT claim a full hostile envelope reaches it first.
}), FIXTURE_MS)

it('v3-technology-span-uses-actual-closure-and-recording-coverage', () => {
  const definition = legacy.LEGACY_DEFINITIONS['campaign-legacy/v3']
  const build = (actual: boolean, recording: number | null) => {
    const facts: legacy.LegacyFacts = {
      boundaryWeek: 6240, baseMarketValue: 1_000_000,
      studios: [{ studioId: 'S', row: 0, enteredWeek: 0, closedWeek: actual ? 45 : null,
        standing: { audienceAwareness: 50, industryPrestige: 50, commercialConfidence: 50 } }],
      films: [], careerEvents: [], adoptions: [], technologies: [{ technologyId: 'span-tech', commercialWeek: 50 }],
      domains: definition.domainIds.filter(d => d !== 'awards').map(domainId => ({ domainId,
        highWatermark: domainId === 'studioClosures' && actual ? 9 : domainId === 'technologyCatalogue' ? 1 : 0,
        recordedFromWeek: domainId === 'studioClosures' ? recording : 0 })),
      conditionEvents: [{ eventId: 'due40', studioId: 'S', week: 40, from: 'distress', to: 'closed' }],
      ...(recording === null ? {} : { studioClosures: actual ? [{ closureId: 'actual45', studioId: 'S', closureWeek: 45, p15DomainSequence: 9 }] : [] }),
    }
    const result = definition.evaluate(facts, 'official2040').studios[0]!.archetypes.find(a => a.archetypeId === 'technology-pioneer')!
    return result
  }
  expect(build(false, 0).contrary).toContainEqual({ domainId: 'technologyCatalogue', id: 'span-tech' })
  expect(build(true, 0).contrary).not.toContainEqual({ domainId: 'technologyCatalogue', id: 'span-tech' })
  const absent = build(false, null); expect(absent.outcome).toBe('notRecorded'); expect(absent.limitedBy).toContain('studioClosures')
  expect(build(false, 25).limitedBy).toContain('studioClosures')
})
