// ── P17 save step: Save50 over P16's Save49, the lazy `franchises` root ──────────────────────────────
//
// Rev02 §10 save law and charter r2 §save: the next governed version after the accepted predecessor, forward-only and
// root-additive; migration infers no franchise, edge or meter from old films; a downgrade refuses recorded authority
// once, by name. The root is absent until its first property exists and never empties again, so migration from
// Save49 is the version alone and a downgrade is lossless exactly while the root is absent (src/core/continuationSave.ts).
// Era-neutral step names (validateSaveP17, convertPredecessorToP17, convertP17ToPredecessor, migrateToP17) carry the
// conventional V50 aliases the version-composing tests read (P15B convention, save.ts).
// P18 (Save51, tests/p18-save-step.test.ts) is live one step above: a live envelope enters this step through
// `convertV51ToV50`, which is the version alone while no television season exists.
// Every franchise here is written by the real greenlight on real P16 rights (tests/helpers/p17-route.ts).

import { beforeAll, describe, expect, it } from 'vitest'
import * as saves from '../src/core/save.js'
import type { GameState } from '../src/core/types.js'
import { detached, genuineV45Raw, mintRoute } from './helpers/p16-fixtures.js'
import { freshConcept, greenlightAs } from './helpers/p17-route.js'

type Forged = { state: GameState & { franchises: { properties: { installments: { childProductionId: string; studioId: string | null }[] }[] } & Record<string, unknown> } }
const DOWNGRADE = /^migrateToV49: cannot downgrade or discard 1 recorded franchise root\(s\)$/

let route: ReturnType<typeof mintRoute>
let franchised: GameState
let sequelId: string
beforeAll(() => {
  route = mintRoute('p17-save-step-01')
  const b = greenlightAs(route.released, freshConcept(route.released), { type: 'directSequel', predecessorProductionId: route.productionId })
  franchised = b.state
  sequelId = b.productionId
})

describe('P17 save step — version, aliases, dispatcher', () => {
  it('Save50 is one step above P16\'s Save49 and one below P18\'s live Save51; the V50 names are the P17 step', () => {
    expect(saves.P17_SAVE_VERSION).toBe(50)
    expect(saves.LIVE_SAVE_VERSION).toBe(saves.P17_SAVE_VERSION + 1)
    expect(saves.P17_PREDECESSOR_SAVE_VERSION).toBe(saves.P16_SAVE_VERSION)
    const save = saves.convertV51ToV50(saves.makeSave(route.released))
    expect(saves.stableStringify(saves.validateSaveV50(save))).toBe(saves.stableStringify(saves.validateSaveP17(save)))
    expect(() => saves.validateSave({ ...save, saveVersion: 52 } as never)).toThrow(/unknown saveVersion 52.*versions 1 through 51 only/)
  })
})

describe('P17 save step — no franchise: absence, version-only migration, lossless downgrade', () => {
  it('a fresh world and a released P16 world write no franchises key', () => {
    for (const state of [route.start, route.released]) {
      expect(Object.hasOwn(state, 'franchises')).toBe(false)
      const save = saves.makeSave(state)
      expect(save.saveVersion).toBe(51)
      expect(Object.hasOwn(save.state, 'franchises')).toBe(false)
    }
  })

  it('down to Save49 and back is the version alone, byte for byte', () => {
    const save = saves.convertV51ToV50(saves.makeSave(route.released)), before = saves.stableStringify(save)
    const down = saves.convertV50ToV49(save)
    expect(down.saveVersion).toBe(49)
    expect(saves.stableStringify({ ...down, saveVersion: 50 })).toBe(before)
    expect(saves.stableStringify(saves.convertV49ToV50(down))).toBe(before)
    expect(saves.stableStringify(save)).toBe(before)
  })

  it('a genuine week-53 Save45 migrates to Save50 with exactly the state migrateToV49 gives it; no franchise is inferred', () => {
    const raw = genuineV45Raw('week53')
    const era = saves.migrateToV49(saves.importSave(raw))
    const live = saves.migrateToLive(saves.importSave(raw))
    expect(live.saveVersion).toBe(51)
    expect(saves.stableStringify(live.state)).toBe(saves.stableStringify(era.state))
    expect(saves.stableStringify(saves.migrateToV50(era))).toBe(saves.stableStringify(saves.convertV51ToV50(live)))
  })
})

describe('P17 save step — a recorded franchise', () => {
  it('round-trips through export and import byte for byte', () => {
    const save = saves.makeSave(franchised)
    expect(Object.hasOwn(save.state, 'franchises')).toBe(true)
    const bytes = saves.exportSave(save)
    expect(saves.exportSave(saves.migrateToLive(saves.importSave(bytes)))).toBe(bytes)
  })

  it('refuses every downgrade and every frozen builder by name, and leaves the input unchanged', () => {
    const save = saves.makeSave(franchised), before = saves.stableStringify(save)
    expect(() => saves.convertV50ToV49(saves.convertV51ToV50(save))).toThrow(DOWNGRADE)
    expect(() => saves.migrateToV49(save)).toThrow(DOWNGRADE)
    expect(() => saves.migrateToV45(save)).toThrow(DOWNGRADE)
    expect(() => saves.makeSaveV1(franchised)).toThrow(/^makeSaveV1: cannot downgrade or discard 1 recorded franchise root\(s\)$/)
    expect(saves.stableStringify(save)).toBe(before)
  })

  it('the validator refuses an empty root, an unknown root key, a forged exercising studio and a forged P16 work link', () => {
    const save = saves.makeSave(franchised)
    const refuse = (edit: (f: Forged) => void, pattern: RegExp) => {
      const forged = detached(save) as unknown as Forged
      edit(forged)
      expect(() => saves.validateSaveP18(forged)).toThrow(pattern) // P18: the live reader runs the P17 root law inside
      expect(() => saves.makeSave(forged.state)).toThrow(pattern)
    }
    refuse((f) => { f.state.franchises.properties = [] }, /an empty franchise root is written as absence/)
    refuse((f) => { f.state.franchises.extra = 1 }, /expected exactly keys/)
    const r01 = franchised.hollywood!.identities[1]!.studioId
    refuse((f) => { f.state.franchises.properties[0]!.installments[1]!.studioId = r01 }, new RegExp(`records the player studio that greenlit it; found ${r01}`))
    // a plain greenlight founds its own property: re-pointing the sequel edge at it breaks the join to P16's work links
    const plain = greenlightAs(franchised, freshConcept(franchised))
    const withPlain = saves.makeSave(plain.state)
    const forged = detached(withPlain) as unknown as Forged
    const edge = forged.state.franchises.properties[0]!.installments.find((e) => e.childProductionId === sequelId)!
    edge.childProductionId = plain.productionId
    expect(() => saves.validateSaveP18(forged)).toThrow(new RegExp(`${plain.productionId} is not a P16 work of story-property:`))
  })
})
