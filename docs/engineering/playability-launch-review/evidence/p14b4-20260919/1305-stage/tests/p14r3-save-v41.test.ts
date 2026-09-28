// ── P14 task 1305-C: R3 Save41 persistence (companion file to p14r3-rival-release.test.ts) ──
//
// STAGED FILE — not under tests/. Independent-test-engineer authored RED, mode IMPLEMENT.
// Requirement source: 1305-A Persistence section (verbatim below), amended by 1305-F's
// order note ("R2 and R3 land in one production increment: save 41, one projection bump",
// citing 1304-F) and unaffected by 1305-F's amendments 1-3 (those are law/strategy/mechanism,
// not persistence). Companion §3.4 "Old saves (the versioned rule)" is the PRECEDENT idiom
// this reuses (an immutable per-era discriminator; frozen validators keep the exact old
// keyset and rule, versioned by era).
//
// LAW UNDER TEST (1305-A Persistence, quoted):
//   "`termination` joins RivalMoneyKind and RIVAL_MONEY_KINDS; `newFinancePeriod` seeds it at
//   0. The live V41 validator requires the new key and reconciles, per period (the `periodOf`
//   idiom used for research), `movements.termination` against minus the sum of
//   `terminationCost(terms, endedWeek)` over this rival's rows ended by a `termination`
//   receipt in that period, and admits a rival `termination` end receipt only when
//   `week < endWeekExclusive`. Frozen V40-and-earlier validators keep the exact old keyset
//   and the player-only rule, versioned by era... 40->41 migration adds `termination: 0` to
//   every period of every rival; nothing else changes. 41->40 downgrade is lossless only when
//   every `termination` movement is 0 and no rival termination receipt exists; otherwise it
//   refuses with a named reason."
//
// GENUINE V40 INPUT — DEVIATION NAMED (not a new fixture file, no TODO/parent-prerequisite
// needed): rather than mint a NEW frozen "genuine outgoing Save40" fixture file (which the
// task's own instruction treats as the fallback when a genuine outgoing input is otherwise
// unobtainable), this file reconstructs a genuine, rich, multi-period V40 envelope AT TEST
// RUN TIME from the ALREADY-COMMITTED genuine V38 corpus
// (tests/fixtures/p14/genuine-v38-pre-p3/genuine-v38-p3-natural-week208.json.gz — 4 rival
// businesses, 5 finance periods each at week 208, confirmed by direct inspection: `python3 -c
// "import gzip,json; ..."` against the committed file, 2026-09-28) via the ALREADY-LANDED,
// VERSION-PINNED `migrateToV40` chain (save.ts:10414-10417). This is robust whether or not
// the eventual R3 commit also bumps LIVE_SAVE_VERSION to 41 in the same commit, because
// `migrateToV40` targets version 40 SPECIFICALLY, not "whatever is live" — every prior
// version's migration chain function in this codebase keeps working this way after later
// versions land (confirmed pattern: migrateToV37/V38/V39 all still exist and are called by
// this file's own precedent, tests/p14c4-save-v35.test.ts). If this reasoning is judged
// insufficient by 1305-D, the fallback is: mint tests/fixtures/p14/genuine-v40-pre-r3/ at the
// last Save40 writer, per the task's own instruction; noted as a fallback in the 1305-C
// handback.
//
// INTERPRETATIONS NAMED:
//   1. `validateSaveV41`, `convertV40ToV41`, `convertV41ToV40`, `migrateToV41` are assumed to
//      be the exact new export names, by direct analogy to every prior version's naming
//      (validateSaveV{N}, convertV{N-1}ToV{N}, convertV{N}ToV{N-1}, migrateToV{N} — confirmed
//      pattern for V37 through V40 by direct source read of save.ts:10248-10420). All four
//      are MISSING from save.ts today — this file fails to import from an EXISTING module
//      (save.ts exists; these four names do not), which under vite/vitest either throws a
//      module-resolution SyntaxError at load or binds `undefined` per named-export semantics;
//      every one of the four is actually CALLED below (not merely imported unused), so either
//      outcome is a real, non-spurious RED per the project's own "RED-first tests import from
//      a missing module" caution.
//   2. The reconciliation formula is read literally: `movements.termination` (a period's
//      running total, negative) equals `-sum(terminationCost(row.terms, row.endedWeek))` over
//      this rival's rows ended by a `termination` receipt whose week falls in that period
//      (periodOf idiom, hollywoodValidation.ts:238-242, the same one already used for
//      research reconciliation at :272-274).
//   3. Downgrade losslessness condition is read literally: EVERY `termination` movement is 0
//      AND no rival termination receipt exists (both, not either) — matching the existing
//      idiom at convertV40ToV39 (hollywood.ts pattern: check loss BEFORE historical
//      validation, throw a named reason, never silently strip a fact).
//
// TAMPER-TEST IDIOM: the two "forged ... refused" leaves construct an invalid SAVE ENVELOPE
// directly (not a live simulated GameState) and pass it straight to `validateSaveV41`. This
// is the established, expected technique for this class of test in this codebase (see
// tests/p14c4-save-v35.test.ts's own "D3/D4 tamperings", G3/G4/G5) and is DISTINCT from the
// "no fabricated state beyond the one labeled role rewrite" stop rule, which is scoped
// specifically to p14r3-rival-release.test.ts's live-simulation strategy leaves, not to
// save-validator tamper tests generally.

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
// RED: validateSaveV41 / convertV40ToV41 / convertV41ToV40 / migrateToV41 do not exist in
// src/core/save.ts at HEAD 993e6b01 (see header, INTERPRETATION 1). Each is called below.
import {
  LIVE_SAVE_VERSION, makeSave, migrateToV40, validateSaveV40,
  validateSaveV41, convertV40ToV41, convertV41ToV40, migrateToV41,
} from '../../../../../../../src/core/save.js'
import { p13aGeneratedStudio } from '../../../../../../../src/harness/p13a/fixtures.js'

const load = (relative: string) => gunzipSync(readFileSync(new URL(relative, import.meta.url))).toString('utf8')

function genuineV38Natural208(): Record<string, unknown> {
  return JSON.parse(load('../../../../../../../tests/fixtures/p14/genuine-v38-pre-p3/genuine-v38-p3-natural-week208.json.gz'))
}

function genuineV40(): { saveVersion: 40; seed: string; state: Record<string, unknown>; broadcastCache: unknown[] } {
  return migrateToV40(genuineV38Natural208() as never) as unknown as { saveVersion: 40; seed: string; state: Record<string, unknown>; broadcastCache: unknown[] }
}

function rivalBusinesses(state: Record<string, unknown>): Array<{ studioId: string; account: { periods: Array<{ fromWeek: number; throughWeek: number; movements: Record<string, number> }> } }> {
  const hollywood = state.hollywood as { businesses: unknown[] } | null
  return (hollywood?.businesses ?? []) as never
}

describe('P14 1305-C Save41: live boundary', () => {
  it('LIVE_SAVE_VERSION === 41', () => {
    expect(LIVE_SAVE_VERSION).toBe(41)
  })

  it('makeSave stamps 41 on a freshly generated current campaign', () => {
    const state = p13aGeneratedStudio()
    const saved = makeSave(state)
    expect((saved as { saveVersion: number }).saveVersion).toBe(41)
  })
})

describe('P14 1305-C Save41: fresh V41 validates (freshly generated, no fixture needed)', () => {
  it('a freshly generated current campaign round-trips through validateSaveV41', () => {
    const state = p13aGeneratedStudio()
    const saved = makeSave(state)
    const revalidated = validateSaveV41(JSON.parse(JSON.stringify(saved)))
    expect(revalidated.saveVersion).toBe(41)
    for (const business of rivalBusinesses(revalidated.state as never)) {
      for (const period of business.account.periods) expect(period.movements.termination).toBe(0)
    }
  })
})

describe('P14 1305-C Save41: migrateToV41 dispatch matches the direct converter (chain-entry parity, mirrors every prior version\'s migrateToV{N} idiom)', () => {
  it('migrateToV41 on a genuine V40 envelope equals convertV40ToV41 on the same input', () => {
    const v40 = genuineV40()
    expect(migrateToV41(JSON.parse(JSON.stringify(v40)) as never)).toEqual(convertV40ToV41(v40 as never))
  })

  it('migrateToV41 chains all the way from a genuine V38 envelope (no V40/V41-specific fixture needed for this leaf)', () => {
    const v38 = genuineV38Natural208()
    const viaChain = migrateToV41(v38 as never)
    const viaExplicitSteps = convertV40ToV41(migrateToV40(v38 as never) as never)
    expect(viaChain).toEqual(viaExplicitSteps)
    expect((viaChain as { saveVersion: number }).saveVersion).toBe(41)
  })
})

describe('P14 1305-C Save41: 40->41 migration adds ONLY termination:0 to every period of every rival', () => {
  it('genuine V40 (reconstructed from the committed genuine-v38-pre-p3 week-208 corpus) migrates losslessly except for the new key', () => {
    const v40 = genuineV40()
    const before = rivalBusinesses(v40.state)
    expect(before.length).toBe(4) // precondition, matches the direct gzip inspection above
    expect(before[0]!.account.periods.length).toBe(5) // precondition (week 208 / 52 = 4 boundaries -> 5 periods)
    for (const business of before) for (const period of business.account.periods) expect('termination' in period.movements).toBe(false) // precondition: V40 genuinely lacks the key

    const migrated = convertV40ToV41(v40 as never)
    expect(migrated.saveVersion).toBe(41)
    const after = rivalBusinesses(migrated.state as never)
    expect(after.length).toBe(before.length)
    for (const [i, business] of after.entries()) {
      const priorBusiness = before[i]!
      expect(business.account.periods.length).toBe(priorBusiness.account.periods.length)
      for (const [j, period] of business.account.periods.entries()) {
        const priorPeriod = priorBusiness.account.periods[j]!
        expect(period.movements.termination).toBe(0) // the ONLY addition
        // Everything else in this period's movements is byte-identical to before.
        const { termination: _t, ...rest } = period.movements
        expect(rest).toEqual(priorPeriod.movements)
        expect(period.fromWeek).toBe(priorPeriod.fromWeek)
        expect(period.throughWeek).toBe(priorPeriod.throughWeek)
      }
    }
    // Nothing outside rival account periods changes: full-state diff modulo saveVersion and
    // the one new key added to every rival period's movements map.
    const strippedAfter = JSON.parse(JSON.stringify(migrated)) as Record<string, unknown>
    for (const business of rivalBusinesses((strippedAfter.state as Record<string, unknown>) as never)) {
      for (const period of business.account.periods) delete (period.movements as Record<string, number>).termination
    }
    ;(strippedAfter as { saveVersion: number }).saveVersion = 40
    expect(strippedAfter).toEqual(JSON.parse(JSON.stringify(v40)))

    const revalidated = validateSaveV41(JSON.parse(JSON.stringify(migrated)))
    expect(revalidated.saveVersion).toBe(41)
  })
})

describe('P14 1305-C Save41: frozen readers unchanged (regression pin — already true before V41 exists)', () => {
  it('validateSaveV40 still admits a genuine V40 envelope after V41 lands', () => {
    const v40 = genuineV40()
    expect(() => validateSaveV40(JSON.parse(JSON.stringify(v40)))).not.toThrow()
  })
})

describe('P14 1305-C Save41: 41->40 downgrade', () => {
  it('lossless (byte-identical to the original V40 envelope) when every termination movement is 0 and no rival termination receipt exists', () => {
    const v40 = genuineV40()
    const migrated = convertV40ToV41(v40 as never)
    const downgraded = convertV41ToV40(migrated as never)
    expect(downgraded.saveVersion).toBe(40)
    expect(JSON.stringify(downgraded)).toBe(JSON.stringify(v40))
  })

  it('refused, with a named reason, when a rival termination movement is nonzero (forged tamper — no matching receipt either, see the next describe block for that half)', () => {
    const v40 = genuineV40()
    const migrated = convertV40ToV41(v40 as never) as unknown as { saveVersion: 41; seed: string; state: Record<string, unknown>; broadcastCache: unknown[] }
    const tampered = JSON.parse(JSON.stringify(migrated)) as typeof migrated
    const business = rivalBusinesses(tampered.state)[0]!
    business.account.periods[0]!.movements.termination = -12345
    expect(() => convertV41ToV40(tampered as never)).toThrow(/termination/i)
  })

  it('refused when a rival termination end receipt exists (forged tamper, movement left at 0 to isolate the receipt-presence check from the movement check above)', () => {
    const v40 = genuineV40()
    const migrated = convertV40ToV41(v40 as never) as unknown as { saveVersion: 41; seed: string; state: Record<string, unknown>; broadcastCache: unknown[] }
    const tampered = JSON.parse(JSON.stringify(migrated)) as typeof migrated
    const hollywood = tampered.state.hollywood as { businesses: Array<{ studioId: string }>; employment: Array<{ contractId: string; studioId: string; endedWeek: number | null; terms: { talentId: string; endWeekExclusive: number } }>; receipts: unknown[]; nextReceipt: number }
    const rivalId = hollywood.businesses[0]!.studioId
    const currentWeek = (tampered.state.market as { tick: number }).tick
    // week <= currentWeek (receipts cannot be dated after the save's own week, an existing
    // chronology requirement — hollywoodValidation.ts:436) AND week < endWeekExclusive (a
    // genuinely early end, per the stated V41 admission rule). The matching `termination`
    // movement is deliberately NOT written (left at 0) — the defect this leaf targets is the
    // receipt existing without its reconciled charge.
    const row = hollywood.employment.find((e) => e.studioId === rivalId && e.endedWeek === null && e.terms.endWeekExclusive > currentWeek)!
    if (!row) throw new Error('p14r3-save-v41 tamper premise: no active rival employment row with endWeekExclusive beyond the fixture\'s own current week was found')
    const week = currentWeek
    row.endedWeek = week
    hollywood.receipts.push({
      eventId: `industry-event-${hollywood.nextReceipt}`, week, studioId: rivalId, kind: 'employment',
      talentId: row.terms.talentId, fromStudioId: rivalId, toStudioId: null, contractId: row.contractId, reason: 'termination',
    })
    hollywood.nextReceipt += 1
    expect(() => validateSaveV41(tampered as never)).toThrow()
    // The exact refusal wording is not pinned (INTERPRETATION 2/3 above name the formula but
    // not the implementation's literal message); if this comes back GREEN because some other
    // structural check (e.g. an ordinal/activeEmploymentOrdinals consistency requirement not
    // touched by this minimal tamper) fires first for an unrelated reason, or does not fire
    // at all, that is a reportable finding, not a silently accepted pass — see 1305-C handback.
  })
})
