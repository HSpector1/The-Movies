// Constructed route-L debit transaction; not natural gameplay. Exact route already measured at6240.
// New reader-order RED, separate from the unchanged original14. No clock/history/timeout edits.
import { expect, it } from 'vitest'
import * as save from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { routeL } from './helpers/p15c2-route-l.js'
import { closureOf, drainPlayer, canon } from './helpers/p15b-live.js'
import { budgeted, ROUTE_MS } from './helpers/p15c2-legacy.js'
import { validateLiveSave } from './helpers/live-era.js'

it('actual6240-official-reader-refuses-closure-after-finale-sequence', budgeted(ROUTE_MS, () => {
  let input = structuredClone(routeL().foundedAtFounding)
  expect(input.market.tick).toBe(6188)
  expect(() => save.makeSave(input)).not.toThrow()
  while (input.market.tick < 6207) input = tick(input)
  expect(() => save.makeSave(input)).not.toThrow()
  input = drainPlayer(input, Math.floor(input.studio.cash) + 1)
  expect(input.studio.cash).toBeLessThan(0)
  expect(() => save.makeSave(input)).not.toThrow()
  while (input.market.tick < 6240 && !closureOf(input, input.hollywood!.playerStudioId)) input = tick(input)
  const player = closureOf(input, input.hollywood!.playerStudioId)!
  expect(player?.closureWeek, 'actual measured route premise, never reset clock').toBe(6240)
  const admitted = save.makeSave(input)
  expect(() => validateLiveSave(admitted)).not.toThrow() // the live reader; its predecessor proof runs the Legacy order law
  const official = input.campaignLegacy.official!
  const ended = input.campaignLegacy.endOfRun!
  expect(official.definition).toBe('campaign-legacy/v3')
  expect(official.p15DomainSequence).toBeGreaterThan(player.p15DomainSequence)
  // This bounded player-only route must have no intervening same-boundary rival allocations.
  expect(official.p15DomainSequence).toBe(player.p15DomainSequence + 1)
  expect(ended.p15DomainSequence).toBeGreaterThan(official.p15DomainSequence)
  const hostile = structuredClone(admitted)
  const c = hostile.state.studioClosure.closures.find(c => c.closureId === player.closureId)!
  const o = hostile.state.campaignLegacy.official!
  const e = hostile.state.campaignLegacy.endOfRun!
  const sequence = c.p15DomainSequence
  c.p15DomainSequence = o.p15DomainSequence
  o.p15DomainSequence = sequence; o.legacySnapshotId = `campaign-legacy-${sequence}`
  // Keep independently checked source watermarks coherent with hostile append order.
  for (const manifest of [o, e]) {
    const source = manifest.sources.find(s => s.domainId === 'studioClosures')!
    source.highWatermark = Math.max(0, ...hostile.state.studioClosure.closures.filter(c => c.p15DomainSequence < manifest.p15DomainSequence).map(c => c.p15DomainSequence))
  }
  const bytes = canon(hostile)
  expect(() => validateLiveSave(hostile)).toThrow(/campaignLegacy\.official\.p15DomainSequence.*closure/)
  expect(canon(hostile)).toBe(bytes)
}), ROUTE_MS)
