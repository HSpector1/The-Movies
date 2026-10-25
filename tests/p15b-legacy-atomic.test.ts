// Proposed tests/p15b-legacy-atomic.test.ts. Scratch-only, unexecuted.
// Early drained transaction controls + genuine stored route-L official-only captures.
// No fresh public-route acceptance; no full terminal C6239/6240/6241 input supplied.
import { describe, expect, it, vi } from 'vitest'
import * as closure from '../src/core/studioClosure.js'
import * as legacy from '../src/core/campaignLegacy.js'
import * as save from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { PLAYER, playerClosure, closureOf, eventsOf, canon } from './helpers/p15b-live.js'
import { captureAt, budgeted, ROUTE_MS } from './helpers/p15c2-legacy.js'
import { p15Rows } from './helpers/p15-roots.js'

// Capture the real produced state AFTER condition, BEFORE closure; do not rewrite its clock/history.
function earlyInput(): GameState {
  const route = playerClosure(); const closed = [...route.values()].find(s => closureOf(s, PLAYER))
  if (!closed) throw new Error('PREREQUISITE: existing drained player control never closes')
  const c = closureOf(closed, PLAYER)!.closureWeek
  const before = route.get(c - 1)
  if (!before) throw new Error('PREREQUISITE: missing real pre-boundary route state')
  let captured: GameState | undefined
  const spy = vi.spyOn(closure, 'advanceStudioClosureWeek').mockImplementation(s => { captured = s; return s })
  try { tick(before) } finally { spy.mockRestore() }
  if (!captured) throw new Error('PREREQUISITE: tick no longer crosses existing closure phase; update capture seam explicitly')
  expect(captured.market.tick).toBe(c)
  expect(closureOf(captured, PLAYER)).toBeUndefined()
  expect(eventsOf(captured, PLAYER).some(e => e.to === 'closed' && e.week === c)).toBe(true)
  // Real due-state admission is prerequisite, never stubbed successful.
  expect(() => save.makeSave(captured!)).not.toThrow()
  return captured
}
type Ended = { closureId: string; legacySnapshotId: string; boundaryWeek: number; definition: string; p15DomainSequence: number }
const terminal = (s: GameState) => (s as unknown as { campaignLegacy: { endOfRun: Ended | null } }).campaignLegacy.endOfRun

// Proposed exact source seam: advanceStudioClosureWeek retains its public signature but returns
// the COMPLETE aggregate closure+finale transaction. Builders/full validator are real imported calls.
describe('p15b early complete aggregate transaction controls', () => {
  it('early-aggregate-links-publishes-once-and-keeps-input', () => {
    const input = earlyInput(); const bytes = canon(input)
    const result = closure.advanceStudioClosureWeek(input)
    expect(terminal(result), 'SEMANTIC RED: complete aggregate must publish player ended').not.toBeNull()
    const e = terminal(result)!; const c = closureOf(result, PLAYER)!
    expect(e).toMatchObject({ closureId: c.closureId, boundaryWeek: c.closureWeek + 1, definition: 'campaign-legacy/v4' })
    expect(c.endOfRun).toBe(e.legacySnapshotId); expect(result.market.tick).toBe(input.market.tick)
    expect(result.campaignLegacy.official).toBeNull()
    expect(e.p15DomainSequence).toBeGreaterThan(c.p15DomainSequence)
    const sequences = p15Rows(result).map(r => r.p15DomainSequence)
    expect(new Set(sequences).size).toBe(sequences.length)
    expect(result.p15Sequence.next).toBe(Math.max(0, ...sequences) + 1)
    expect(() => save.makeSave(result)).not.toThrow()
    const replay = save.importSave(save.exportSave(save.makeSave(result)))
    expect(canon(replay.state)).toBe(canon(result))
    const again = closure.advanceStudioClosureWeek(replay.state as GameState)
    expect(canon(again)).toBe(canon(result)); expect(canon(input)).toBe(bytes)
  })
  it('early-aggregate-ended-builder-failure-preserves-whole-input', () => {
    const input = earlyInput(); const bytes = canon(input)
    // Proposed inter-module seam: finalizer calls the existing common builder for ended.
    // Throw-only spy: no validator or producer is ever stubbed successful.
    const spy = vi.spyOn(legacy, 'buildLegacyManifest').mockImplementation(() => { throw new Error('fault: ended builder') })
    try {
      expect(() => closure.advanceStudioClosureWeek(input)).toThrow('fault: ended builder')
      expect(spy).toHaveBeenCalled(); expect(canon(input)).toBe(bytes)
    } finally { spy.mockRestore() }
  })
  it('early-aggregate-final-full-reader-failure-preserves-whole-input', () => {
    const input = earlyInput(); const bytes = canon(input)
    // Proposed inter-module seam: aggregate finishes through the real exported full reader.
    const spy = vi.spyOn(save, 'validateSaveP15B').mockImplementation(() => { throw new Error('fault: final joined reader') })
    try {
      expect(() => closure.advanceStudioClosureWeek(input)).toThrow('fault: final joined reader')
      expect(spy).toHaveBeenCalled(); expect(canon(input)).toBe(bytes)
    } finally { spy.mockRestore() }
  })
})

function routeCapture(week: number): GameState {
  const capture = captureAt(s => s.market.tick === week, `stored route L week${week}`)
  const live = save.migrateToLive(capture as never).state as GameState
  expect(live.market.tick).toBe(week); expect(() => save.makeSave(live)).not.toThrow()
  expect(live.studioClosure.closures.some(c => c.studioId === live.hollywood!.playerStudioId)).toBe(false)
  expect(terminal(live)).toBeNull()
  return live
}
describe('p15b stored route L official-only eligibility controls', () => {
  it('recording-at6239-freezes-v3-on-one-ordinary-tick', budgeted(ROUTE_MS, () => {
    const input = routeCapture(6239); const bytes = canon(input)
    expect(input.campaignLegacy.recordedFromWeek).toBe(6239); expect(input.campaignLegacy.official).toBeNull()
    const result = tick(input)
    expect(result.market.tick).toBe(6240)
    expect(result.campaignLegacy.official).toMatchObject({ definition: 'campaign-legacy/v3', kind: 'official2040', boundaryWeek: 6240 })
    expect(terminal(result)).toBeNull(); expect(() => save.makeSave(result)).not.toThrow()
    expect(canon(input)).toBe(bytes)
  }), ROUTE_MS)
  it('recording-at6240-never-backfills-official', budgeted(ROUTE_MS, () => {
    const input = routeCapture(6240); const bytes = canon(input)
    expect(input.campaignLegacy.recordedFromWeek).toBe(6240)
    const at = legacy.freezeCampaignLegacyWeek(input); const later = tick(at)
    expect(at.campaignLegacy.official).toBeNull(); expect(later.campaignLegacy.official).toBeNull()
    expect(later.market.tick).toBe(6241); expect(terminal(later)).toBeNull()
    expect(() => save.makeSave(later)).not.toThrow(); expect(canon(input)).toBe(bytes)
  }), ROUTE_MS)
  it('later6241-tick-retains-validated-frozen-v1-v2-official-bytes', budgeted(ROUTE_MS, () => {
    const at = tick(routeCapture(6239)); const original = at.campaignLegacy.official
    if (!original) throw new Error('PREREQUISITE: eligible official writer missing')
    for (const version of ['campaign-legacy/v1', 'campaign-legacy/v2'] as const) {
      const entry = legacy.LEGACY_DEFINITIONS[version]
      const adapter = legacy.legacyFactsFromState(at, 6240)
      const facts = { ...adapter, domains: adapter.domains.filter(d => entry.domainIds.includes(d.domainId)) }
      delete (facts as unknown as { studioClosures?: unknown }).studioClosures
      // Named historical-payload unit construction, same real state/stamps; no claimed old capture.
      const official = { ...original, ...entry.evaluate(facts, 'official2040') }
      const input = { ...at, campaignLegacy: { ...at.campaignLegacy, official } } as GameState
      expect(() => save.makeSave(input), `${version} own-definition replay prerequisite`).not.toThrow()
      const bytes = canon(official); const result = tick(input)
      expect(result.market.tick).toBe(6241); expect(canon(result.campaignLegacy.official)).toBe(bytes)
      expect(terminal(result)).toBeNull(); expect(() => save.makeSave(result)).not.toThrow()
    }
  }), ROUTE_MS)
})
