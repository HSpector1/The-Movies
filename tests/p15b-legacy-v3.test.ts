// Proposed destination: tests/p15b-legacy-v3.test.ts. NOT executed or admitted.
// Constructed pure facts and existing drained transaction controls, NOT lawful gameplay evidence.
import { describe, expect, it } from 'vitest'
import * as legacy from '../src/core/campaignLegacy.js'
import * as saves from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { PLAYER, PLAYER_CLOSURE_DEFERRED, playerClosure, closureOf, canon } from './helpers/p15b-live.js'
import { genuineFrozen, budgeted, FIXTURE_MS } from './helpers/p15c2-legacy.js'

type Ref = { domainId: string; id: string }
type Manifest = { definition: string; sources: { domainId: string; highWatermark: number; status: string }[]; studios: { studioId: string; archetypes: { archetypeId: string; outcome: string; limitedBy: string[]; contrary: Ref[] }[]; lenses: { lensId: string; status: string; counts: Record<string, number>; refs: Ref[] }[] }[] }
type ClosureFact = { closureId: string; studioId: string; closureWeek: number; p15DomainSequence: number }
// Representation proposal: add studioClosures to modern facts only; reuse existing definition.evaluate API.
function evaluate(facts: unknown, definition = 'campaign-legacy/v3'): Manifest {
  const table = legacy.LEGACY_DEFINITIONS as unknown as Record<string, { evaluate: (f: unknown, k: string) => Manifest }>
  const entry = table[definition]
  if (!entry) throw new Error(`PREREQUISITE RED: missing frozen definition ${definition}`)
  return entry.evaluate(facts, 'official2040')
}
function facts(closures: ClosureFact[] | undefined = [], recordedFromWeek: number | null = 0, definition = 'campaign-legacy/v3') {
  const old = definition !== 'campaign-legacy/v3'
  const frozen = legacy.LEGACY_DEFINITIONS as unknown as Record<string, { domainIds: readonly string[] }>
  const domains = frozen[old ? definition : 'campaign-legacy/v2'].domainIds.filter(id => id !== 'awards' && id !== 'studioClosures')
  return { boundaryWeek: 6240, baseMarketValue: 1_000_000,
    studios: [{ studioId: 'S', row: 0, enteredWeek: 0, closedWeek: null, standing: { audienceAwareness: 50, industryPrestige: 50, commercialConfidence: 50 } }],
    films: [], careerEvents: [], adoptions: [], technologies: [],
    domains: [...domains.map(domainId => ({ domainId, highWatermark: 0, recordedFromWeek: 0 })),
      ...(old ? [] : [{ domainId: 'studioClosures', highWatermark: closures?.length ? 9 : 0, recordedFromWeek }])],
    conditionEvents: [
      { eventId: 'distress', studioId: 'S', week: 10, from: 'warning', to: 'distress' },
      { eventId: 'stable', studioId: 'S', week: 20, from: 'recovery', to: 'stable' },
      { eventId: 'due', studioId: 'S', week: 30, from: 'distress', to: 'closed' },
    ], ...(old || recordedFromWeek === null ? {} : { studioClosures: closures }) }
}
const actual = (week: number): ClosureFact => ({ closureId: 'actual-S', studioId: 'S', closureWeek: week, p15DomainSequence: 9 })
function resilience(m: Manifest) {
  const s = m.studios.find(s => s.studioId === 'S')!
  return { a: s.archetypes.find(a => a.archetypeId === 'resilient-survivor')!, l: s.lenses.find(l => l.lensId === 'resilience')! }
}

describe('p15b modern Legacy pure definition controls', () => {
  it('v3-due-is-not-actual-in-archetype-and-lens', () => {
    const { a, l } = resilience(evaluate(facts()))
    expect(a.outcome).toBe('held'); expect(l.counts.closures).toBe(0)
    expect(a.contrary).not.toContainEqual({ domainId: 'corporateCondition', id: 'due' })
    expect(l.refs).not.toContainEqual({ domainId: 'studioClosures', id: 'due' })
    expect(l.counts.distressEntries).toBe(1); expect(l.counts.returnsToStable).toBe(1)
  })
  it('v3-actual-ref-and-exclusive-cutoff', () => {
    for (const [week, count] of [[6239, 1], [6240, 0]] as const) {
      const m = evaluate(facts([actual(week)])); const { a, l } = resilience(m)
      expect(l.counts.closures).toBe(count); expect(a.outcome).toBe(count ? 'notHeld' : 'held')
      const ref = { domainId: 'studioClosures', id: 'actual-S' }
      if (count) { expect(a.contrary).toContainEqual(ref); expect(l.refs).toContainEqual(ref) }
      else { expect(a.contrary).not.toContainEqual(ref); expect(l.refs).not.toContainEqual(ref) }
      expect(m.sources.find(s => s.domainId === 'studioClosures')!.highWatermark).toBe(9)
    }
  })
  it('v3-closure-recording-is-not-proof-of-open-when-absent-or-late', () => {
    const absent = resilience(evaluate(facts(undefined, null)))
    expect(absent.a.outcome).toBe('notRecorded'); expect(absent.a.limitedBy).toContain('studioClosures')
    expect(absent.l.status).toBe('notRecorded')
    const late = resilience(evaluate(facts([], 25)))
    expect(late.a.limitedBy).toContain('studioClosures'); expect(late.l.status).toBe('limited')
  })
  it('frozen-v1-v2-retain-condition-owned-closure-semantics', () => {
    for (const version of ['campaign-legacy/v1', 'campaign-legacy/v2']) {
      const { a, l } = resilience(evaluate(facts([], 0, version), version))
      expect(a.outcome).toBe('notHeld'); expect(l.counts.closures).toBe(1)
      expect(a.contrary).toContainEqual({ domainId: 'corporateCondition', id: 'due' })
    }
  })
})

type Terminal = { legacySnapshotId: string; closureId: string; definition: string; kind: string; boundaryWeek: number; postFinaleMode: null; p15DomainSequence: number }
function ended(state: unknown): Terminal {
  const e = (state as { campaignLegacy: { endOfRun: Terminal | null } }).campaignLegacy.endOfRun
  expect(e, 'SEMANTIC RED: actual player closure must publish linked ended atomically').not.toBeNull()
  return e!
}
const closedControl = () => {
  const route = playerClosure(); const s = [...route.values()].find(s => closureOf(s, PLAYER))
  if (!s) throw new Error('fixture prerequisite: drained player control never closed')
  return s
}

describe('p15b modern Legacy constructed transaction controls', () => {
  it('early-closure-publishes-linked-ended-without-extra-week', () => {
    const state = closedControl(); const c = closureOf(state, PLAYER)!; const e = ended(state)
    expect(c.closureWeek).toBeLessThan(6240)
    expect(e).toMatchObject({ closureId: c.closureId, definition: 'campaign-legacy/v3', kind: 'endOfRun', boundaryWeek: c.closureWeek + 1, postFinaleMode: null })
    expect(c.endOfRun).toBe(e.legacySnapshotId); expect(state.market.tick).toBe(c.closureWeek)
    expect(state.campaignLegacy.official).toBeNull(); expect(e.p15DomainSequence).toBeGreaterThan(c.p15DomainSequence)
  })
  it('ended-save-reload-links-and-downward-refusal', () => {
    const state = closedControl(); const e = ended(state); const save = saves.makeSave(state)
    expect(() => saves.validateSaveP15B(save), 'complete transaction admits before mutation').not.toThrow()
    expect(state.campaignLegacy.official).toBeNull()
    expect(canon(saves.importSave(saves.exportSave(save)))).toBe(canon(save))
    const copy = JSON.parse(JSON.stringify(save))
    copy.state.campaignLegacy.endOfRun.closureId = 'not-a-closure'
    expect(() => saves.validateSaveP15B(copy)).toThrow(/closure/i)
    for (const convert of [saves.migrateToV45, saves.migrateToV46, saves.migrateToV47]) {
      expect(() => convert(save)).toThrow(/Legacy|end.of.run/i)
    }
    expect(ended(saves.importSave(saves.exportSave(save)).state).legacySnapshotId).toBe(e.legacySnapshotId)
  })
  it('official-v3-with-null-ended-is-not-admitted-by-frozen-readers', budgeted(FIXTURE_MS, () => {
    // G6240F is the existing named recordedFromWeek forgery; NOT genuine world-start coverage.
    const state = genuineFrozen(); const save = saves.makeSave(state)
    expect(state.campaignLegacy.official!.definition, 'SEMANTIC RED: future official writer selects v3').toBe('campaign-legacy/v3')
    expect(state.campaignLegacy.endOfRun).toBeNull()
    expect(() => saves.validateSaveP15B(save)).not.toThrow()
    // Direct frozen Legacy gate prevents unrelated outer-era refusals from masking the requirement.
    expect(() => legacy.validateCampaignLegacy(save.state as unknown as Record<string, unknown>, 'frozen-v45-v47')).toThrow(/definition/i)
    // Build an admitted historical official from its own frozen evaluator, retaining stamps.
    // Conversion uses real public builders: no retagging Save48 or foreign-root masking.
    const oldLive = JSON.parse(JSON.stringify(save))
    const oldTable = legacy.LEGACY_DEFINITIONS['campaign-legacy/v2']
    const adapter = legacy.legacyFactsFromState(state, 6240)
    const historicalFacts = { ...adapter, domains: adapter.domains.filter(d => oldTable.domainIds.includes(d.domainId)) }
    delete (historicalFacts as unknown as { studioClosures?: unknown }).studioClosures
    oldLive.state.campaignLegacy.official = { ...oldLive.state.campaignLegacy.official, ...oldTable.evaluate(historicalFacts, 'official2040') }
    expect(() => saves.validateSaveP15B(oldLive), 'historical payload replay admits before conversion').not.toThrow()
    for (const [convert, read] of [[saves.migrateToV45, saves.validateSaveV45], [saves.migrateToV46, saves.validateSaveV46], [saves.migrateToV47, saves.validateSaveV47]] as const) {
      const baseline = convert(oldLive)
      expect(() => read(baseline), 'own-era baseline admission').not.toThrow()
      const hostile = JSON.parse(JSON.stringify(baseline))
      const before = canon(baseline)
      // Only this definition changes; all stamps, roots and null-ended history remain baseline.
      hostile.state.campaignLegacy.official.definition = 'campaign-legacy/v3'
      expect(() => read(hostile)).toThrow(/campaignLegacy\.official\.definition/)
      expect(canon(baseline)).toBe(before)
    }
  }), FIXTURE_MS)
  it('deferred-due-input-retains-complete-bytes-if-publication-refuses', async () => {
    const c = closureOf(closedControl(), PLAYER)!.closureWeek
    const before = playerClosure().get(c - 1)!
    const due = tick(before, PLAYER_CLOSURE_DEFERRED); const bytes = canon(due)
    const cause = due.corporateCondition.events.find(e => e.studioId === PLAYER && e.to === 'closed')!.eventId
    const mod = await import('../src/core/studioClosure.js')
    expect(() => mod.closeStudio(due, PLAYER, cause, { endOfRunHook: () => { throw new Error('injected modern finale failure') } })).toThrow('injected modern finale failure')
    expect(canon(due)).toBe(bytes)
  })
})
