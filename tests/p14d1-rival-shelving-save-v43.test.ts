// Record 1344-C: RED tests for test 9 "save-v43-shelving" (1344-A §4, §6.9), staged
// against BASE c214094478f47c3e861d757ef568a124cbf3bd71, branch wip/headless-program-20260916-ts.
// Authority: 1344-A §4 "Persistence (Save43)", §6 item 9; 1344-F "Next" (genuine
// Save42 inputs minted at the last Save42 writer).
//
// RED MECHANISM: `saveModule.validateSaveV43` / `convertV42ToV43` / `convertV43ToV42`
// do not exist at BASE (see tests/p14d1-rival-shelving.test.ts's "API decisions"
// block for the shared existence guard, not repeated here — this file adds its own
// focused existence check). PITFALL: a bare `.toThrow()` against a call to an
// undefined function is a VACUOUS pass (any TypeError satisfies it) — every
// "validator rejects X" leaf below therefore asserts `.toThrow(/shelv/i)` (a
// content-specific pattern that the real domain error is expected to satisfy,
// following this codebase's convention of naming the concept in every validator
// message — "active screenplay index differs from lifecycle",
// "cannot downgrade or discard a rival termination movement", etc.) so that a
// generic "is not a function" TypeError, which does NOT match, genuinely fails.

import { describe, expect, it } from 'vitest'
import { migrateToLive } from '../src/core/save.js'
import * as saveModule from '../src/core/save.js'
import { tick, TUNING } from '../src/core/index.js'
import type { GameState } from '../src/core/types.js'
import {
  liveWeek130, genuineV42Week100, genuineV42Week130, week130Raw, RIVAL_R01,
} from './p14d1-rival-shelving-fixtures.js'

type ScreenplayShelving = {
  version: 1
  rejections: readonly { ordinal: number; count: number }[]
  shelved: readonly { ordinal: number; week: number; retryWeek: number }[]
  commissionHoldUntilWeek: number
}
const EMPTY_SHELVING: ScreenplayShelving = { version: 1, rejections: [], shelved: [], commissionHoldUntilWeek: 0 }
type V43ModuleShape = {
  validateSaveV43: (s: unknown) => { saveVersion: 43; seed: string; state: GameState; broadcastCache: unknown[] }
  convertV42ToV43: (s: unknown) => { saveVersion: 43; seed: string; state: GameState; broadcastCache: unknown[] }
  convertV43ToV42: (s: unknown) => unknown
}
const mods = () => saveModule as unknown as V43ModuleShape
/** Bare `TUNING.HOLLYWOOD_SHELVE_AFTER_REJECTIONS` access is a real, expected tsc
 * TS2339 until tuning.ts adds it (see the handback's type-gate section). */
const TUNING_FUTURE = TUNING as unknown as { HOLLYWOOD_SHELVE_AFTER_REJECTIONS: number; HOLLYWOOD_SHELVED_RETRY_WEEKS: number; HOLLYWOOD_SHELVE_COMMISSION_HOLD_WEEKS: number }

describe('API decisions this file exercises (existence asserted first)', () => {
  it('validateSaveV43 / convertV42ToV43 / convertV43ToV42 exist as functions; LIVE_SAVE_VERSION is 44', () => {
    expect(saveModule.LIVE_SAVE_VERSION).toBe(44)
    expect(typeof mods().validateSaveV43).toBe('function')
    expect(typeof mods().convertV42ToV43).toBe('function')
    expect(typeof mods().convertV43ToV42).toBe('function')
  })
})

describe('save-v43-shelving (1344-A §4, §6.9): V42 -> V43 migration', () => {
  it('genuine V42 week-100 input migrates to V43 with the empty screenplayShelving state on every business, and validates', () => {
    const v42 = genuineV42Week100()
    const v43 = mods().convertV42ToV43(v42)
    expect(v43.saveVersion).toBe(43)
    const validated = mods().validateSaveV43(v43)
    for (const b of validated.state.hollywood!.businesses) {
      expect((b as unknown as { screenplayShelving: ScreenplayShelving }).screenplayShelving).toEqual(EMPTY_SHELVING)
    }
    // Nothing outside the new per-business field moves (Save41-pattern lossless-add).
    const stripBusinesses = (state: GameState) => state.hollywood === null ? null : state.hollywood.businesses.map(b => {
      const { screenplayShelving: _drop, ...rest } = b as unknown as Record<string, unknown>
      return rest
    })
    expect(stripBusinesses(validated.state)).toEqual(stripBusinesses(v42.state))
    const { hollywood: _h1, ...v42RestOfState } = v42.state as unknown as Record<string, unknown>
    const { hollywood: _h2, ...v43RestOfState } = validated.state as unknown as Record<string, unknown>
    expect(v43RestOfState).toEqual(v42RestOfState)
  })

  it('genuine V42 week-130 input migrates to V43 with the empty screenplayShelving state on every business, and validates', () => {
    const v42 = genuineV42Week130()
    const v43 = mods().convertV42ToV43(v42)
    const validated = mods().validateSaveV43(v43)
    for (const b of validated.state.hollywood!.businesses) {
      expect((b as unknown as { screenplayShelving: ScreenplayShelving }).screenplayShelving).toEqual(EMPTY_SHELVING)
    }
  })

  it('migrateToLive carries a genuine V42 save to V44 (LIVE_SAVE_VERSION)', () => {
    const v42 = saveModule.importSave(week130Raw())
    const live = migrateToLive(v42)
    expect((live as unknown as { saveVersion: number }).saveVersion).toBe(44)
  })
})

describe('save-v43-shelving: save/load in the middle of a count continues byte-identically', () => {
  it('ticking 7 weeks, then round-tripping through export/import at count 7, then ticking 5 more weeks, matches an uninterrupted 12-week tick byte-for-byte', () => {
    // Path A: uninterrupted.
    let stateA = liveWeek130()
    for (let i = 0; i < 12; i++) stateA = tick(stateA)
    // Path B: interrupted by a save/load at week +7 (count 7 for r01's ordinal 6,
    // route premise shared with tests/p14d1-rival-shelving.test.ts test 1/6).
    let stateB = liveWeek130()
    for (let i = 0; i < 7; i++) stateB = tick(stateB)
    const b7 = stateB.hollywood!.businesses.find(b => b.studioId === RIVAL_R01)!
    expect((b7 as unknown as { screenplayShelving: ScreenplayShelving }).screenplayShelving.rejections.find(r => r.ordinal === 6)?.count,
      'route/RED premise: count 7 after 7 weeks').toBe(7)
    const saved = saveModule.makeSave(stateB)
    const exported = saveModule.exportSave(saved)
    const reloaded = migrateToLive(saveModule.importSave(exported))
    stateB = reloaded.state as unknown as GameState
    for (let i = 0; i < 5; i++) stateB = tick(stateB)
    expect(saveModule.exportSave(saveModule.makeSave(stateB))).toBe(saveModule.exportSave(saveModule.makeSave(stateA)))
  }, 20_000)
})

describe('save-v43-shelving: the validator rejects each inconsistent state', () => {
  // Base: the raw genuine week-130 V42 text, hand-projected to a V43-shaped envelope
  // (JSON.parse, house pattern per tests/p14b9-save-v42.test.ts) with the empty
  // shelving state added to every business, then mutated per case. Not run through
  // the typed convertV42ToV43 path (which does not exist yet) — this file tests the
  // VALIDATOR in isolation, on a hand-built envelope, the same way
  // tests/p14b9-save-v42.test.ts's "frozen five-kind catalogue" block does.
  type RawBusiness = { studioId: string; activeScriptOrdinals: number[]
    development: { projects: { id: string; status: string }[] }
    screenplayShelving?: unknown }
  type RawEnvelope = { saveVersion: number; state: { hollywood: { businesses: RawBusiness[]; receipts: unknown[]; nextReceipt: number } } }

  function baseV43Envelope(): RawEnvelope {
    const parsed = JSON.parse(week130Raw()) as RawEnvelope
    parsed.saveVersion = 43
    for (const b of parsed.state.hollywood.businesses) b.screenplayShelving = { ...EMPTY_SHELVING }
    return parsed
  }
  function r01(env: RawEnvelope): RawBusiness {
    const b = env.state.hollywood.businesses.find(row => row.studioId === RIVAL_R01)
    expect(b, 'route premise').toBeDefined()
    return b!
  }

  it('rejects a shelved entry naming an ordinal that is ALSO active', () => {
    const env = baseV43Envelope()
    const b = r01(env)
    expect(b.activeScriptOrdinals).toContain(6) // route premise: ordinal 6 is active in this fixture
    b.screenplayShelving = { version: 1, rejections: [], shelved: [{ ordinal: 6, week: 130, retryWeek: 200 }], commissionHoldUntilWeek: 0 }
    expect(() => mods().validateSaveV43(env)).toThrow(/shelv/i)
  })

  it('rejects a shelved entry naming an ordinal that is ALSO produced', () => {
    const env = baseV43Envelope()
    const b = r01(env)
    expect(b.development.projects[0]!.status).toBe('produced') // route premise
    b.screenplayShelving = { version: 1, rejections: [], shelved: [{ ordinal: 0, week: 130, retryWeek: 200 }], commissionHoldUntilWeek: 0 }
    expect(() => mods().validateSaveV43(env)).toThrow(/shelv/i)
  })

  it('rejects a rejection count over the documented threshold (14 > 13)', () => {
    const env = baseV43Envelope()
    const b = r01(env)
    // 14 is deliberately one past the charter's named threshold (1344-A §5); this is
    // a validator boundary fixture, not a derived route fact.
    b.screenplayShelving = { version: 1, rejections: [{ ordinal: 6, count: 14 }], shelved: [], commissionHoldUntilWeek: 0 }
    expect(() => mods().validateSaveV43(env)).toThrow(/shelv|reject|threshold/i)
  })

  it('rejects a shelved entry with no matching screenplayShelved receipt', () => {
    const env = baseV43Envelope()
    const b = r01(env)
    b.activeScriptOrdinals = b.activeScriptOrdinals.filter(i => i !== 6) // make room: not active
    b.screenplayShelving = { version: 1, rejections: [], shelved: [{ ordinal: 6, week: 130, retryWeek: 200 }], commissionHoldUntilWeek: 0 }
    // No screenplayShelved receipt appended to state.hollywood.receipts.
    expect(() => mods().validateSaveV43(env)).toThrow(/shelv|receipt/i)
  })

  it('rejects two screenplayShelved receipts naming the same screenplay', () => {
    const env = baseV43Envelope()
    const b = r01(env)
    b.activeScriptOrdinals = b.activeScriptOrdinals.filter(i => i !== 6)
    b.screenplayShelving = { version: 1, rejections: [], shelved: [{ ordinal: 6, week: 130, retryWeek: 200 }], commissionHoldUntilWeek: 0 }
    const scriptProjectId = b.development.projects[6]!.id
    const receiptBase = { week: 130, studioId: RIVAL_R01, kind: 'screenplayShelved', scriptProjectId, conceptId: 'x', rejections: 13 }
    env.state.hollywood.receipts.push(
      { eventId: `industry-event-${env.state.hollywood.nextReceipt}`, ...receiptBase },
      { eventId: `industry-event-${env.state.hollywood.nextReceipt + 1}`, ...receiptBase },
    )
    env.state.hollywood.nextReceipt += 2
    expect(() => mods().validateSaveV43(env)).toThrow(/shelv|receipt|duplicate|second/i)
  })

  // 1344-F2 non-blocking note 2 (revision 1344-C2, additive): a rejection count of 0,
  // a rejection entry naming a non-active/non-ready ordinal, and a shelved entry with
  // retryWeek <= week.
  it('rejects a rejection entry with count 0 (below the documented [1, threshold] bound)', () => {
    const env = baseV43Envelope()
    const b = r01(env)
    expect(b.activeScriptOrdinals).toContain(6) // route premise: ordinal 6 is active and ready
    b.screenplayShelving = { version: 1, rejections: [{ ordinal: 6, count: 0 }], shelved: [], commissionHoldUntilWeek: 0 }
    expect(() => mods().validateSaveV43(env)).toThrow(/shelv|reject/i)
  })

  it('rejects a rejection entry naming an ordinal that is not active/ready (produced)', () => {
    const env = baseV43Envelope()
    const b = r01(env)
    expect(b.development.projects[0]!.status, 'route premise: ordinal 0 is produced, not active/ready').toBe('produced')
    b.screenplayShelving = { version: 1, rejections: [{ ordinal: 0, count: 3 }], shelved: [], commissionHoldUntilWeek: 0 }
    expect(() => mods().validateSaveV43(env)).toThrow(/shelv|reject|active|ready/i)
  })

  it('rejects a shelved entry with retryWeek <= week', () => {
    const env = baseV43Envelope()
    const b = r01(env)
    b.activeScriptOrdinals = b.activeScriptOrdinals.filter(i => i !== 6)
    b.screenplayShelving = { version: 1, rejections: [], shelved: [{ ordinal: 6, week: 130, retryWeek: 130 }], commissionHoldUntilWeek: 0 }
    const scriptProjectId = b.development.projects[6]!.id
    env.state.hollywood.receipts.push({ eventId: `industry-event-${env.state.hollywood.nextReceipt}`, week: 130,
      studioId: RIVAL_R01, kind: 'screenplayShelved', scriptProjectId, conceptId: 'x', rejections: TUNING_FUTURE.HOLLYWOOD_SHELVE_AFTER_REJECTIONS })
    env.state.hollywood.nextReceipt += 1
    expect(() => mods().validateSaveV43(env)).toThrow(/shelv|retry/i)
  })

  it('accepts the well-formed empty state on every business (control: does not throw)', () => {
    const env = baseV43Envelope()
    expect(() => mods().validateSaveV43(env)).not.toThrow()
  })
})

describe('save-v43-shelving: down-conversion (convertV43ToV42)', () => {
  it('accepts the empty screenplayShelving state (round-trips losslessly, Save41 pattern)', () => {
    const v43 = mods().convertV42ToV43(genuineV42Week130())
    expect(() => mods().convertV43ToV42(v43)).not.toThrow()
  })

  it('refuses a real rejection count by name', () => {
    const env = JSON.parse(week130Raw()) as { saveVersion: number
      state: { hollywood: { businesses: { studioId: string; screenplayShelving?: unknown }[] } } }
    env.saveVersion = 43
    for (const b of env.state.hollywood.businesses) {
      b.screenplayShelving = b.studioId === RIVAL_R01
        ? { version: 1, rejections: [{ ordinal: 6, count: 3 }], shelved: [], commissionHoldUntilWeek: 0 }
        : { ...EMPTY_SHELVING }
    }
    expect(() => mods().convertV43ToV42(env)).toThrow(/shelv/i)
  })

  it('refuses a real shelved entry (with its receipt) by name', () => {
    const env = JSON.parse(week130Raw()) as { saveVersion: number
      state: { hollywood: { businesses: { studioId: string; activeScriptOrdinals: number[]
        development: { projects: { id: string }[] }; projects: { conceptId: string }[]; screenplayShelving?: unknown }[]
        receipts: unknown[]; nextReceipt: number } } }
    env.saveVersion = 43
    for (const b of env.state.hollywood.businesses) b.screenplayShelving = { ...EMPTY_SHELVING }
    const b = env.state.hollywood.businesses.find(row => row.studioId === RIVAL_R01)!
    b.activeScriptOrdinals = b.activeScriptOrdinals.filter(i => i !== 6)
    // 1358-D9 R4: the shelved entry and the commission hold take the engine's own writes at week 130
    // (src/core/hollywoodTick.ts:279-280), as an own-era cover must.
    b.screenplayShelving = { version: 1, rejections: [], shelved: [{ ordinal: 6, week: 130, retryWeek: 130 + TUNING_FUTURE.HOLLYWOOD_SHELVED_RETRY_WEEKS }],
      commissionHoldUntilWeek: 130 + TUNING_FUTURE.HOLLYWOOD_SHELVE_COMMISSION_HOLD_WEEKS }
    env.state.hollywood.receipts.push({ eventId: `industry-event-${env.state.hollywood.nextReceipt}`, week: 130,
      studioId: RIVAL_R01, kind: 'screenplayShelved', scriptProjectId: b.development.projects[6]!.id, conceptId: b.projects[6]!.conceptId, rejections: TUNING_FUTURE.HOLLYWOOD_SHELVE_AFTER_REJECTIONS })
    env.state.hollywood.nextReceipt += 1
    // 1358-F11: the receipt names the business's own costed concept. The old conceptId 'x' was
    // refused inside validateSaveV43 (src/core/hollywoodValidation.ts:539) before the guard ran, and
    // the loose /shelv/i hid it (1358-X7t probe F2-RECEIPT43). The pin is convertV43ToV42's receipt
    // guard (src/core/save.ts:10739-10740). This leaf is now that guard's own-era cover, which the
    // J7, X5 and O3 chains of the p14c3 cohort, dual and off-menu files reached first under Save43.
    expect(() => mods().convertV43ToV42(env)).toThrow(/^migrateToV42: cannot downgrade or discard a screenplayShelved receipt$/)
  })

  it('refuses a nonzero commissionHoldUntilWeek by name', () => {
    const env = JSON.parse(week130Raw()) as { saveVersion: number
      state: { hollywood: { businesses: { studioId: string; screenplayShelving?: unknown }[] } } }
    env.saveVersion = 43
    for (const b of env.state.hollywood.businesses) {
      b.screenplayShelving = b.studioId === RIVAL_R01
        ? { version: 1, rejections: [], shelved: [], commissionHoldUntilWeek: 200 }
        : { ...EMPTY_SHELVING }
    }
    expect(() => mods().convertV43ToV42(env)).toThrow(/shelv|hold/i)
  })
})

// Both "shelved+active" and "shelved+produced" leaves above name an ordinal that ALSO
// satisfies HEAD's frozen line-341 rule on its own terms (ordinal 6: active===true,
// status!=='produced'===true, so the OLD "active===(status!=='produced')" check
// already passes regardless of the injected screenplayShelving; ordinal 0: both sides
// false, same). Neither leaf's expected throw can come from the frozen line-341 form
// unmodified — only a NEW, V43-era-specific check that reads screenplayShelving.shelved
// against activeScriptOrdinals/status gives either leaf a reason to reject. This is the
// discriminator that makes both leaves genuine tests of 1344-A §4's new invariant
// ("not produced ⇔ active XOR shelved"), not accidental passes off the old rule.
