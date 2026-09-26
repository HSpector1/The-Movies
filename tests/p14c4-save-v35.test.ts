// P14C.4 T1 — INDEPENDENT RED/repair, family D: Save V35 (793 §5, and §9's amended
// entrant-age bound). Derived from 782 §7.3-§7.4/§9 and 793 §5/§9, never from
// `src/core/save.ts`'s own implementation (read only to align each tamper's
// cause-specific regex with the real refusal wording, per the repair brief's
// authorization to run these files against the implementation to find mechanical
// defects — never to retune an expected VALUE toward what it produces).
//
// REPAIR (this revision, against implementation HEAD 476046da; 795 §8 has the full
// finding->change ledger):
//  - F1: `GameState` is now V35 live; `c4Fixture` alone returns a raw V34 state with no
//    `cohorts` root, and ticking it throws loudly. Every case that ticks a corpus world
//    now migrates it live first (`c4LiveFixture`).
//  - F2 (D2 makeSave): was handed the raw V34 fixture state; migrated first now.
//  - F5 (D4): rebased on a GENUINE ticked V35 state holding real, non-empty receipts
//    (`deep-deficit` at week 2652 — the same guaranteed-32-entrant world C1-C4 use),
//    replacing the scaffold-era `mintLawfulCohortReceipt` synthetic construction, which
//    was only ever a lawful SUBSTITUTE for a state the (then-unwired) engine could not
//    yet produce — now that it can, the genuine state is used directly.
//  - 782/793 §9 (addendum, after demonstration 799 failed 2/3 seeds): the entrant-age
//    validator bound narrows to [20, 29] (was [20, 32]). Landed at `ccb8ab17` (795 §8
//    has the pre-landing history; the age-tamper case below now PASSES).
//
// COVERAGE ADDITIONS (record 801, against `ccb8ab17`+, source review 798's gaps):
//  - G3: four new D4 tamperings (extra root key, missing cohorts key, extra receipt
//    key, receipt dated after market.tick).
//  - G4: the two provenance tamperings (missing row / wrong week) now discriminate
//    from each other — see the comment directly above them for why (the SUT's own
//    thrown text is byte-identical in prose for both; discrimination is by entrant id).
//  - G5: D3's refusal now asserts the message names the FIRST receipt's week, not
//    merely that it says "downgrade".
import { describe, expect, it } from 'vitest'
import {
  LIVE_SAVE_VERSION, convertV34ToV35, convertV35ToV34, makeSave, migrateToV35, validateSaveV35, validateSaveV37,
} from '../src/core/save.js'
import type { CohortReceipt, GameState } from '../src/core/types.js'
import { recomputeDue } from '../src/core/aging.js'
import { advanceTo, c4Fixture, c4LiveFixture, envelopeV34, liveEnvelope } from './helpers/p14c4-fixtures.js'

const CORPUS_NAMES = [
  'genuine-v34-c4-mid-year', 'genuine-v34-c4-cohort-week', 'genuine-v34-c4-all-statuses',
  'genuine-v34-c4-null-hollywood', 'genuine-v34-c4-migrated-chain', 'genuine-v34-c4-deep-deficit',
] as const

describe('P14C.4 D1: every corpus world migrates V34 -> V35 with cohorts: [] and validates', () => {
  it.each(CORPUS_NAMES)('%s', (name) => {
    const state = c4Fixture(name)
    const migrated = convertV34ToV35(envelopeV34(state))
    expect(migrated.saveVersion).toBe(35)
    expect(migrated.state.careerLifecycle.cohorts).toEqual([])
    const revalidated = validateSaveV35(JSON.parse(JSON.stringify(migrated)))
    expect(revalidated.state.careerLifecycle).toEqual(migrated.state.careerLifecycle)
  })
})

describe('P14C.4 D2: the live boundary moved through 35 (stale numbers corrected post-C.2b; both bodies always assert the live constant)', () => {
  it('LIVE_SAVE_VERSION === 37', () => {
    expect(LIVE_SAVE_VERSION).toBe(37)
  })

  it('makeSave stamps 37', () => {
    const state = c4LiveFixture('genuine-v34-c4-mid-year') // F2: migrate first — makeSave now expects the live (V36) shape
    const saved = makeSave(state)
    expect((saved as { saveVersion: number }).saveVersion).toBe(37)
  })
})

describe('P14C.4 D3: V35 -> V34 downgrade', () => {
  it('lossless iff cohorts is empty', () => {
    const state = c4Fixture('genuine-v34-c4-mid-year')
    const migratedEmpty = convertV34ToV35(envelopeV34(state))
    const downgraded = convertV35ToV34(migratedEmpty)
    expect(downgraded.saveVersion).toBe(34)
    expect(JSON.stringify(downgraded)).toBe(JSON.stringify(envelopeV34(state)))
  })

  it('refused as a downgrade, naming the first receipt\'s week, when any receipt exists', () => {
    // The real engine now produces a genuine receipt on its own — no synthetic
    // construction needed (unlike the scaffold-era version of this case).
    const state = advanceTo(c4LiveFixture('genuine-v34-c4-cohort-week'), 156) // B6's own world/week: a real (near-empty) receipt
    expect(state.careerLifecycle.cohorts.length).toBeGreaterThan(0)
    const firstWeek = state.careerLifecycle.cohorts[0]!.week
    expect(firstWeek).toBe(156)
    // G5 (801, 793 §5): "naming the first receipt's week" is its own, separate claim
    // from merely refusing — a bare /downgrade/i would also match a refusal that named
    // the WRONG week (or none at all). Anchor the regex on the specific week this
    // world's own receipt actually carries, checked against the real thrown text.
    expect(() => convertV35ToV34(liveEnvelope(state))).toThrow(new RegExp(`downgrade.*week ${firstWeek}`, 'is'))
  })

  it('with two receipts, the downgrade refusal names the FIRST one\'s week, not the second\'s', () => {
    // MEASURED (819, against C.2b HEAD; 817 §3.3): `genuine-v34-c4-cohort-week` ticked
    // to 208 now ALSO holds a settled retirementExtension case for
    // person-studio-67adeee5-r01-2 (opened 196, closed 208 — the SAME week as this
    // world's own second cohort receipt), so `liveEnvelope`'s V36 -> V35 step
    // (`convertV36ToV35`, save.ts) refuses FIRST on that extension (it refuses on ANY
    // retirementExtension case, open or settled — the two events coincide at week 208,
    // so no week is ever "after the second receipt but before the extension settles" on
    // this world). That masks this case's own C.4 premise (a lawful two-receipt V35
    // state), so this rebuilds it on a DIFFERENT genuine C.4 corpus world instead:
    // `genuine-v34-c4-all-statuses`, measured to carry NO retirementExtension case at
    // all (open or settled) through its own second cohort receipt. Its own two cohort
    // weeks (measured, natural ticks from its week-227 save) are 260 and 312 — proving
    // "first" is not vacuously true with only one receipt ever tried, on a lawful
    // (non-extension) world.
    const state = advanceTo(c4LiveFixture('genuine-v34-c4-all-statuses'), 312)
    expect(state.careerLifecycle.cohorts.map((r) => r.week)).toEqual([260, 312])
    expect(state.talentMarket.cases.some((c) => c.variant === 'retirementExtension'), 'this world\'s own C.4 premise requires no extension by week 312').toBe(false)
    expect(() => convertV35ToV34(liveEnvelope(state))).toThrow(/week 260/)
    expect(() => convertV35ToV34(liveEnvelope(state))).not.toThrow(/week 312/)
  })
})

/** Replaces the WHOLE `cohorts` array of a genuine live state — the ONLY hand-built
 * mutation in this suite (labeled, per the task's own D4 exception), starting from a
 * state the real engine actually produced. `lawfulBaseline` always carries exactly one
 * receipt, so replacing the array outright (rather than matching by week, which breaks
 * the moment the tamper itself changes the week) is both simpler and correct. */
function withReceipts(state: GameState, cohorts: readonly CohortReceipt[]): GameState {
  return { ...state, careerLifecycle: { ...state.careerLifecycle, cohorts } }
}

describe('P14C.4 D4: the validator refuses each tampering, one per case, from a GENUINE ticked V35 state', () => {
  function lawfulBaseline(): { state: GameState; receipt: CohortReceipt } {
    // deep-deficit at week 2652: the SAME guaranteed-non-empty world C1-C4 use (782
    // §7.1's own 32-entrant clip, pinned by B5) — a real receipt, real entrants, real
    // provenance, produced entirely by the live engine (F5: no more synthetic mint).
    const state = advanceTo(c4LiveFixture('genuine-v34-c4-deep-deficit'), 2652)
    const receipt = state.careerLifecycle.cohorts.find((r) => r.week === 2652)
    expect(receipt, 'a genuine receipt must exist at week 2652 (B5)').toBeDefined()
    return { state, receipt: receipt! }
  }

  it('the unmutated baseline must validate', () => {
    const { state } = lawfulBaseline()
    expect(() => validateSaveV35(liveEnvelope(state))).not.toThrow()
  })

  it('requested: an inflated count not matching personIds.length (the deep-deficit cohort is entirely actor, so a same-role/other-role redistribution would instead trip the per-entrant role check first — probed directly; this tamper isolates the count check cleanly)', () => {
    const { state, receipt } = lawfulBaseline()
    const tampered: CohortReceipt = { ...receipt, requested: { ...receipt.requested, actor: receipt.requested.actor + 1 } }
    expect(() => validateSaveV35(liveEnvelope(withReceipts(state, [tampered])))).toThrow(/requests \d+ people|but names/i)
  })

  it('talentCountBefore: off by one from the real talent-length-at-request-time', () => {
    const { state, receipt } = lawfulBaseline()
    const tampered: CohortReceipt = { ...receipt, talentCountBefore: receipt.talentCountBefore + 1 }
    expect(() => validateSaveV35(liveEnvelope(withReceipts(state, [tampered])))).toThrow(/talent index|past the/i)
  })

  it('personIds: swapped for an id outside the real talent slice at talentCountBefore', () => {
    const { state, receipt } = lawfulBaseline()
    const tampered: CohortReceipt = { ...receipt, personIds: [...receipt.personIds.slice(1), 'not-a-real-entrant-id'] }
    expect(() => validateSaveV35(liveEnvelope(withReceipts(state, [tampered])))).toThrow(/which holds/i)
  })

  // G4 (801, source review 798): both provenance tamperings previously matched only
  // the generic `/provenance/i`. Read directly (not a diff): the real check
  // (`save.ts` around `validateCohortReceipts`) is `if (row?.kind !== 'authored_exact_week'
  // || row.entryWeek !== receipt.week) error(...)` — a SINGLE branch whose thrown text
  // is BYTE-IDENTICAL for "no row at all" and "row present but wrong week" (both read
  // "entrant {id} has no authored_exact_week provenance row at week {week}"; confirmed
  // by running both and diffing the actual thrown strings). The two causes are
  // therefore tampered on TWO DIFFERENT entrants here, and each regex anchors on its
  // OWN entrant's id — which the OTHER case's thrown text does not contain — so each
  // assertion discriminates its own case from the other (and would fail if applied to
  // the other's construction), even though the SUT's prose itself does not distinguish
  // "missing" from "wrong week" in words. Disclosed, not papered over.
  it('missing provenance row: one entrant loses its authored_exact_week row entirely', () => {
    const { state, receipt } = lawfulBaseline()
    const droppedId = receipt.personIds[0]! // entrant 0 — reserved for "missing"
    const tamperedState: GameState = {
      ...state,
      talentProvenance: { ...state.talentProvenance, rows: state.talentProvenance.rows.filter((r) => r.personId !== droppedId) },
    }
    expect(() => validateSaveV35(liveEnvelope(tamperedState))).toThrow(new RegExp(`${droppedId} has no authored_exact_week`))
  })

  it('wrong provenance row: one entrant\'s row is anchored at the wrong week (w+1, not w)', () => {
    const { state, receipt } = lawfulBaseline()
    const targetId = receipt.personIds[1]! // entrant 1 — a DIFFERENT id from "missing", so the regexes discriminate
    const rows = state.talentProvenance.rows.map((r) => (r.personId === targetId && r.kind === 'authored_exact_week' ? { ...r, entryWeek: r.entryWeek + 1 } : r))
    const tamperedState: GameState = { ...state, talentProvenance: { ...state.talentProvenance, rows } }
    expect(() => validateSaveV35(liveEnvelope(tamperedState))).toThrow(new RegExp(`${targetId} has no authored_exact_week`))
  })

  it('age out of bounds per 782/793 §9: one entrant\'s provenance age is pushed to 30 (inside the OLD [20,32] bound, outside the NEW [20,29] one, landed at ccb8ab17).', () => {
    const { state, receipt } = lawfulBaseline()
    const targetId = receipt.personIds[0]!
    const rows = state.talentProvenance.rows.map((r) => (r.personId === targetId && r.kind === 'authored_exact_week' ? { ...r, ageAtEntry: 30 } : r))
    // The stored Talent.age cache AND the talentProvenance.due cache must both stay
    // CONSISTENT with the tampered provenance row (762 §1/§2: age is a cache of
    // provenance, due is a cache of stored ages, and the frozen V33 chain refuses
    // either disagreement) — probed directly: an earlier draft that skipped this left
    // BOTH caches stale and threw on "stored age disagrees" / "due is stale" instead of
    // the age-bound check this case exists to isolate (one of those messages even
    // contains the substring "age", inside "stored ages" — a false-positive regex
    // match caught only by inspecting the actual thrown text).
    const talent = state.talent.map((t) => (t.id === targetId ? { ...t, age: 30 } : t))
    const due = recomputeDue(rows, (id) => talent.find((t) => t.id === id)?.age)
    const tamperedState: GameState = { ...state, talent, talentProvenance: { ...state.talentProvenance, rows, due } }
    expect(() => validateSaveV35(liveEnvelope(tamperedState))).toThrow(/outside|age/i)
  })

  it('non-increasing weeks: a second receipt claims the SAME week as the first', () => {
    const { state, receipt } = lawfulBaseline()
    const duplicateAtSameWeek: CohortReceipt = {
      week: receipt.week, // the ONE deliberate defect: must be strictly greater than the prior receipt's week
      talentCountBefore: state.talent.length, requested: { actor: 0, director: 0, writer: 0, craft: 0 }, clipped: 0, personIds: [],
    }
    const tamperedState: GameState = { ...state, careerLifecycle: { ...state.careerLifecycle, cohorts: [...state.careerLifecycle.cohorts, duplicateAtSameWeek] } }
    expect(() => validateSaveV35(liveEnvelope(tamperedState))).toThrow(/strictly increase/i)
  })

  it('a non-52k week: a receipt whose week is not a multiple of 52', () => {
    const { state, receipt } = lawfulBaseline()
    const tampered: CohortReceipt = { ...receipt, week: receipt.week + 1 }
    expect(() => validateSaveV35(liveEnvelope(withReceipts(state, [tampered])))).toThrow(/52/)
  })

  it('wrong clipped: the receipt claims a clip its own requested totals do not support', () => {
    const { state, receipt } = lawfulBaseline()
    const tampered: CohortReceipt = { ...receipt, clipped: receipt.clipped + 5 }
    expect(() => validateSaveV35(liveEnvelope(withReceipts(state, [tampered])))).toThrow(/clipped/i)
  })

  // G3 (801, source review 798): four tamperings the writer's own source review found
  // probed but not covered. These operate on the RAW JSON shape (`JSON.parse(JSON.
  // stringify(...))`), since an extra/missing object key cannot be expressed on the
  // strictly-typed `CohortReceipt`/`CareerLifecycleRootV35` types themselves —
  // `validateSaveV35` itself takes `unknown`, exactly for this reason.
  it('an extra root key on careerLifecycle', () => {
    const { state, receipt } = lawfulBaseline()
    const goodEnvelope = liveEnvelope(withReceipts(state, [receipt]))
    const raw = JSON.parse(JSON.stringify(goodEnvelope)) as { state: { careerLifecycle: Record<string, unknown> } }
    raw.state.careerLifecycle.bogusExtraKey = 'nope'
    expect(() => validateSaveV35(raw)).toThrow(/must carry exactly boundaryWeek, cohorts and records/i)
  })

  it('a missing cohorts key', () => {
    const { state, receipt } = lawfulBaseline()
    const goodEnvelope = liveEnvelope(withReceipts(state, [receipt]))
    const raw = JSON.parse(JSON.stringify(goodEnvelope)) as { state: { careerLifecycle: Record<string, unknown> } }
    delete raw.state.careerLifecycle.cohorts
    expect(() => validateSaveV35(raw)).toThrow(/must carry exactly boundaryWeek, cohorts and records/i)
  })

  it('an extra receipt key', () => {
    const { state, receipt } = lawfulBaseline()
    const goodEnvelope = liveEnvelope(withReceipts(state, [receipt]))
    const raw = JSON.parse(JSON.stringify(goodEnvelope)) as { state: { careerLifecycle: { cohorts: Record<string, unknown>[] } } }
    raw.state.careerLifecycle.cohorts[0]!.bogusExtra = 1
    expect(() => validateSaveV35(raw)).toThrow(/must carry exactly clipped,personIds,requested,talentCountBefore,week/i)
  })

  it('a receipt dated after market.tick', () => {
    const { state, receipt } = lawfulBaseline()
    const tampered: CohortReceipt = { ...receipt, week: receipt.week + 52 } // still a valid cohort week (multiple of 52), just after the campaign week
    expect(() => validateSaveV35(liveEnvelope(withReceipts(state, [tampered])))).toThrow(/after the campaign week/i)
  })
})

describe('P14C.4 D5: replay determinism, and save/load mid-year then continuing equals the uninterrupted run', () => {
  it('two independent V34 -> V35 migrations of the SAME state are byte-identical', () => {
    const state = c4Fixture('genuine-v34-c4-mid-year') // week 105
    const env = envelopeV34(state)
    const a = convertV34ToV35(env)
    const b = convertV34ToV35(env)
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })

  it('save/load at mid-year (week 105, not a cohort week) then continuing to week 156 equals the uninterrupted tick run, byte-for-byte', () => {
    const state = c4LiveFixture('genuine-v34-c4-mid-year') // F1: migrate first, then both branches tick the SAME live state
    const continuous = advanceTo(state, 156)
    // P14C.2b: reload at the LIVE (V36) boundary, not the frozen V35 one `liveEnvelope`
    // now targets (helpers/p14c4-fixtures.ts) — continuing to tick needs every V36 key
    // `readExtensionUsed` requires, which the V35-stripped shape no longer carries.
    const savedLive = validateSaveV37({ saveVersion: LIVE_SAVE_VERSION, seed: state.seed, state, broadcastCache: state.broadcastItems })
    const reloaded = validateSaveV37(JSON.parse(JSON.stringify(savedLive)))
    const viaSaveLoad = advanceTo(reloaded.state, 156)
    expect(JSON.stringify(viaSaveLoad)).toBe(JSON.stringify(continuous))
  })

  it('migrateToV35 lifts a genuine V34 envelope the same way convertV34ToV35 does', () => {
    const state = c4Fixture('genuine-v34-c4-mid-year')
    const viaMigrate = migrateToV35(envelopeV34(state))
    const viaConvert = convertV34ToV35(envelopeV34(state))
    expect(JSON.stringify(viaMigrate)).toBe(JSON.stringify(viaConvert))
  })
})
