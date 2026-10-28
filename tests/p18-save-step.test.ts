// ── P18 Sprint 12 save step: Save51 over P17's Save50, the lazy `television` root ──────────────────────────
//
// The Save50 guard pattern one step up: the root is absent until the first commission and never empties; migration from
// Save50 is the version alone (no series, grant, contract, advance or work is inferred); a downgrade refuses once, by
// name, while a season, a television money row or the commissioner's licence exists. The predecessor chain proves the
// state with its television rows in the ledger and the cash as recorded (review P18-01: no projection, no cash rewrite).
// Era-neutral step names (validateSaveP18, convertPredecessorToP18, convertP18ToPredecessor, migrateToP18) carry the
// conventional V51 aliases. RED at ecbc42c9 by assertion (the namespace lacks every P18 name).

import { beforeAll, describe, expect, it } from 'vitest'
import * as saves from '../src/core/save.js'
import { validateRightsRoot } from '../src/core/rights.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { detached, genuineV45Raw } from './helpers/p16-fixtures.js'
import { attempt, request, season, seasonRoute, television, type SeasonRoute, type TelevisionLocal } from './helpers/p18-route.js'

type Api = Record<string, unknown> & {
  P18_SAVE_VERSION?: number; P18_PREDECESSOR_SAVE_VERSION?: number
  validateSaveP18?: (save: unknown) => { saveVersion: number; state: GameState }
  validateSaveV51?: (save: unknown) => { saveVersion: number; state: GameState }
  convertV51ToV50?: (save: unknown) => { saveVersion: number; state: GameState }
  convertV50ToV51?: (save: unknown) => { saveVersion: number; state: GameState }
  migrateToV51?: (save: unknown) => { saveVersion: number; state: GameState }
}
const api = saves as unknown as Api
const DOWNGRADE = /^migrateToV50: cannot downgrade or discard 1 recorded television season\(s\)$/
type Forged = { saveVersion: number; state: GameState & { television: TelevisionLocal } & Record<string, unknown> }

let route: SeasonRoute
let live: GameState | undefined
let worked: GameState | undefined
beforeAll(() => {
  route = seasonRoute()
  const result = attempt(route.state, request(route))
  if (result.error !== undefined) return
  live = result.state
  let state = live
  for (let i = 0; i < 6; i++) state = tick(state)
  worked = state
}, 300_000)

function names(): void {
  for (const name of ['validateSaveP18', 'validateSaveV51', 'convertV51ToV50', 'convertV50ToV51', 'migrateToV51', 'convertP18ToPredecessor', 'convertPredecessorToP18', 'migrateToP18']) {
    expect(typeof api[name], name).toBe('function')
  }
}

describe('P18 save step — version, aliases, dispatcher', () => {
  it('Save51 is live one step above P17\'s Save50; the V51 names are the P18 step', () => {
    expect(saves.LIVE_SAVE_VERSION).toBe(51)
    expect(api.P18_SAVE_VERSION).toBe(saves.LIVE_SAVE_VERSION)
    expect(api.P18_PREDECESSOR_SAVE_VERSION).toBe(saves.P17_SAVE_VERSION)
    names()
    const save = saves.makeSave(route.state)
    expect(save.saveVersion).toBe(51)
    expect(saves.stableStringify(api.validateSaveV51!(save))).toBe(saves.stableStringify(api.validateSaveP18!(save)))
    expect(() => saves.validateSave({ ...save, saveVersion: 52 } as never)).toThrow(/unknown saveVersion 52.*versions 1 through 51 only/)
  })
})

describe('P18 save step — no season: absence, version-only migration, lossless downgrade', () => {
  it('a world that never commissioned a season writes no television key', () => {
    const save = saves.makeSave(route.state)
    expect(Object.hasOwn(save.state, 'television')).toBe(false)
  })

  it('down to Save50 and back is the version alone, byte for byte', () => {
    names()
    const save = saves.makeSave(route.state), before = saves.stableStringify(save)
    const down = api.convertV51ToV50!(save)
    expect(down.saveVersion).toBe(50)
    expect(saves.stableStringify({ ...down, saveVersion: 51 })).toBe(before)
    expect(saves.stableStringify(api.convertV50ToV51!(down))).toBe(before)
    expect(saves.stableStringify(save)).toBe(before)
  })

  it('a genuine week-53 Save45 migrates to Save51 with exactly the state migrateToV50 gives it; no season is inferred', () => {
    names()
    const raw = genuineV45Raw('week53')
    const era = saves.migrateToV50(saves.importSave(raw))
    const lifted = saves.migrateToLive(saves.importSave(raw))
    expect(lifted.saveVersion).toBe(51)
    expect(saves.stableStringify(lifted.state)).toBe(saves.stableStringify(era.state))
    expect(saves.stableStringify(api.migrateToV51!(era))).toBe(saves.stableStringify(lifted))
  })
})

describe('P18 save step — a commissioned season', () => {
  it('the live save carries the root and round-trips byte for byte, at commitment and after paid work', () => {
    expect(live, 'the lawful commission must be accepted').toBeDefined()
    for (const state of [live!, worked!]) {
      const save = saves.makeSave(state)
      expect(Object.hasOwn(save.state, 'television')).toBe(true)
      const bytes = saves.exportSave(save)
      expect(saves.exportSave(saves.migrateToLive(saves.importSave(bytes)))).toBe(bytes)
      expect(television(saves.importSave(bytes).state as GameState)).toEqual(television(state))
    }
    // Paid work happened inside the saved span: the round trip carries units, rows and cash exactly.
    expect(season(worked!).work.creditedUnits).toBeGreaterThan(0)
  })

  it('the cash reconciles with the television rows as recorded (P18-01): no row is stripped and no cash is projected', () => {
    expect(live).toBeDefined()
    const save = saves.makeSave(worked!)
    const rows = save.state.ledger.filter((row) => String(row.kind).startsWith('tv'))
    expect(rows.length).toBeGreaterThan(1)
    expect(save.state.studio.cash).toBe(worked!.studio.cash)
    expect(worked!.studio.cash - route.state.studio.cash).toBe(worked!.ledger.slice(route.state.ledger.length).reduce((sum, row) => sum + row.amount, 0))
  })

  it('refuses every downgrade and every frozen builder by name, and leaves the input unchanged', () => {
    expect(live).toBeDefined()
    names()
    const save = saves.makeSave(live!), before = saves.stableStringify(save)
    expect(() => api.convertV51ToV50!(save)).toThrow(DOWNGRADE)
    expect(() => saves.migrateToV50(save)).toThrow(DOWNGRADE)
    expect(() => saves.migrateToV49(save)).toThrow(DOWNGRADE)
    expect(() => saves.migrateToV45(save)).toThrow(DOWNGRADE)
    expect(() => saves.makeSaveV1(live!)).toThrow(/^makeSaveV1: cannot downgrade or discard 1 recorded television season\(s\)$/)
    expect(saves.stableStringify(save)).toBe(before)
  })

  it('the frozen Save49 rights law still refuses the commissioner\'s R4 licence; only the Save51 counterparty law admits it', () => {
    expect(live).toBeDefined()
    expect(() => validateRightsRoot(live! as unknown as Record<string, unknown>, 'frozen49')).toThrow(/^frozen49/)
    expect(() => validateRightsRoot(live! as unknown as Record<string, unknown>, 'live51', { r4ConsumerLive: false, televisionCounterparty: true, counterpartyConsideration: 0 } as never)).not.toThrow()
  })

  it('the validator refuses forged television authority, each by name, through the live reader and makeSave', () => {
    expect(live).toBeDefined()
    names()
    const save = saves.makeSave(worked!)
    const refuse = (edit: (f: Forged) => void, pattern: RegExp) => {
      const forged = detached(save) as unknown as Forged
      edit(forged)
      expect(() => api.validateSaveP18!(forged)).toThrow(pattern)
      expect(() => saves.makeSave(forged.state)).toThrow(pattern)
    }
    refuse((f) => { delete (f.state as Record<string, unknown>).television }, /television money rows exist but the root is absent/)
    refuse((f) => { f.state.television.series = [] }, /root is present but records nothing/)
    refuse((f) => { (f.state.television as unknown as Record<string, unknown>).extra = 1 }, /television root must carry exactly/)
    refuse((f) => { f.state.television.seasons[0]!.commissionerId = f.state.hollywood!.identities[1]!.studioId }, /parties, ruleset or episode metadata are not the contract's/)
    refuse((f) => { f.state.television.seasons[0]!.credits[1]!.contractId = 'contract-forged' }, /credits must name each roster person's player contract/)
    refuse((f) => { f.state.television.seasons[0]!.distributionLicenceId = 'rights-licence-999999' }, /distribution licence rights-licence-999999 is not the commissioner's exclusive term/)
    refuse((f) => { f.state.television.agreements[0]!.received += 1 }, /E\/P .* do not replay/)
    refuse((f) => { const row = f.state.ledger.find((r) => r.kind === 'tvAdvance')!; row.note = 'tv-receipt-999999' }, /does not carry exactly one television receipt's effect/)
    refuse((f) => { f.state.television.seasons[0]!.work.creditedUnits += 1 }, /credited units disagree with the block table/)
  })
})
