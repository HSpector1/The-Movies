// P14C.2a T1 — INDEPENDENT RED, family 1: the retirement INTENT and SETTLEMENT law
// (773 §6 rows A1-A7), derived from requirements 773/777 and the genuine T0 V33
// corpus's PAPER PREDICTIONS (775), never from implementation output. Controlling
// order: OPUS-C2-TO-CODEX-LAUNCH. Scaffold at HEAD 9f523db8: every export below
// throws "not implemented" until the sole production writer lands it — that throw
// IS the expected RED (777's own scaffold note), not a test bug.
//
// C.2b (one-year extension) and C.2c (retirement x promise VOIDED/WAIVED) are OUT
// OF SCOPE: no case here asserts VOIDED, WAIVED, or an extension offer.
//
// Natural vs synthetic: every A-series case here loads a genuine V33 world (775) and
// drives the REAL exported `birthdaysDueAt`/`advanceCareerLifecycleWeek` against its
// PAPER-PREDICTED outcome (a falsifier, not an oracle copied from output). Two cases
// are labeled SYNTHETIC where 773/774 record the natural axis as NOT REACHED within
// budget; both build a LAWFUL V34 state from an existing genuine person, never a
// hand-authored fixture file.
import { describe, expect, it } from 'vitest'
import { tick } from '../src/core/index.js'
import {
  LIFECYCLE_INTENT_RULES_VERSION, advanceCareerLifecycleWeek, retirementRecordFor, retirementWindow,
} from '../src/core/careerLifecycle.js'
import { ageAt, birthdaysDueAt } from '../src/core/aging.js'
import { TUNING } from '../src/core/tuning.js'
import type { GameStateV34, RetirementRecord } from '../src/core/types.js'
import {
  c2Fixture, initialSyntheticRoot, nullHollywoodFixture, prependSyntheticCandidate, stepWeekWithLifecycle, syntheticRecord,
  withSyntheticCareerLifecycle,
} from './helpers/p14c2a-fixtures.js'

/** Drives the real lifecycle step forward from `state.market.tick` to `targetWeek`,
 * one real week at a time, returning the state at `targetWeek`. Fails loud (via the
 * scaffold's own throw) the first week a birthday is due — that IS today's RED. */
function advanceLifecycleTo(state: GameStateV34, targetWeek: number): GameStateV34 {
  let s = state
  while (s.market.tick < targetWeek) s = stepWeekWithLifecycle(s)
  return s
}

describe('P14C.2a A1-A7: the retirement intent/settlement law', () => {
  // ── A1: hard boundary forces the announcement at the birthday due week, never w-1 ──
  it('A1: authored-0000 (actor, hard-boundary world) announces exactly at week 832, never at 831', () => {
    const base = c2Fixture('genuine-v33-c2-hard-boundary-and-idle-window') // week 780
    let state = withSyntheticCareerLifecycle(base, initialSyntheticRoot(780))
    state = advanceLifecycleTo(state, 831)
    expect(retirementRecordFor(state, 'authored-0000'), 'no record at w-1 (831)').toBeUndefined()
    state = stepWeekWithLifecycle(state) // -> week 832
    expect(state.market.tick).toBe(832)
    const record = retirementRecordFor(state, 'authored-0000')
    expect(record, 'record must exist at the due week (832)').toBeDefined()
    expect(record).toMatchObject({
      personId: 'authored-0000', profession: 'actor', intentRulesVersion: LIFECYCLE_INTENT_RULES_VERSION,
      cause: 'hardBoundary', announcedWeek: 832, ageAtAnnouncement: 86, effectiveWeek: 884, status: 'announced',
    } satisfies Partial<RetirementRecord>)
    expect(record!.ageAtAnnouncement).toBe(ageAt(state.talentProvenance.rows.find((r) => r.personId === 'authored-0000')!, 832))
  })

  // ── A2: idle in-window announces; employed does not; record span < 104 does not ──
  it('A2a: t-act-07 (idle in-window, natural genesis actor) announces at its predicted week 798', () => {
    const base = c2Fixture('genuine-v33-c2-hard-boundary-and-idle-window') // week 780
    let state = withSyntheticCareerLifecycle(base, initialSyntheticRoot(780))
    state = advanceLifecycleTo(state, 797)
    expect(retirementRecordFor(state, 't-act-07')).toBeUndefined()
    state = stepWeekWithLifecycle(state)
    expect(state.market.tick).toBe(798)
    expect(retirementRecordFor(state, 't-act-07')).toMatchObject({
      cause: 'idleInWindow', announcedWeek: 798, ageAtAnnouncement: 61, effectiveWeek: 850, status: 'announced',
    })
  })

  it('A2b: authored-0000 (actor, contract-and-case world) stays silent at every in-window birthday while CONTRACTED (52,104,156,208), then announces hardBoundary once free (week 260)', () => {
    const base = c2Fixture('genuine-v33-c2-contract-and-case') // week 48
    let state = withSyntheticCareerLifecycle(base, initialSyntheticRoot(48))
    for (const w of [52, 104, 156, 208]) {
      state = advanceLifecycleTo(state, w)
      expect(retirementRecordFor(state, 'authored-0000'), `must NOT announce while contracted, week ${w}`).toBeUndefined()
    }
    state = advanceLifecycleTo(state, 260)
    expect(retirementRecordFor(state, 'authored-0000')).toMatchObject({
      cause: 'hardBoundary', announcedWeek: 260, ageAtAnnouncement: 70, effectiveWeek: 312, status: 'announced',
    })
  })

  it('A2c SYNTHETIC (isolated boundary): a candidate whose provenance anchor is exactly w-104 is eligible; one week later (anchor at w-103) is not', () => {
    // 774/775 report this exact edge as NOT REACHED naturally within budget. Isolated
    // here on TWO freshly-constructed provenance rows (never a hand-edited fixture)
    // whose anchor age is chosen so BOTH read the same in-window age at week W —
    // only the anchor WEEK (and therefore the recency horizon) differs between them,
    // which is the one variable 777 §4 pins ("anchorOf(row).week <= w - 104").
    const base = c2Fixture('genuine-v33-c2-hard-boundary-and-idle-window')
    const W = 1000
    const horizon = TUNING.RETIREMENT_RECENT_WORK_WEEKS // 104
    const targetAge = 61 // inside the actor window [60,70)
    const rowAt = (anchorWeek: number, personId: string) => ({
      personId, kind: 'authored_exact_week' as const, ageAtEntry: targetAge - (W - anchorWeek) / 52, entryWeek: anchorWeek,
    })
    const eligibleRow = rowAt(W - horizon, 'synthetic-a2c-eligible') // w - 104 <= anchorWeek (inclusive) -> old enough
    const tooRecentRow = rowAt(W - horizon + 1, 'synthetic-a2c-too-recent') // anchorWeek is one week too young
    expect(Math.floor(ageAt(eligibleRow, W))).toBe(targetAge)
    expect(Math.floor(ageAt(tooRecentRow, W))).toBe(targetAge)
    const template = base.talent.find((t) => t.role === 'actor')!
    const talent = [
      { ...template, id: 'synthetic-a2c-eligible', role: 'actor' as const, age: targetAge, authored: false },
      { ...template, id: 'synthetic-a2c-too-recent', role: 'actor' as const, age: targetAge, authored: false },
      ...base.talent,
    ]
    const state = withSyntheticCareerLifecycle(
      { ...base, talent, talentProvenance: { ...base.talentProvenance, rows: [eligibleRow, tooRecentRow, ...base.talentProvenance.rows] },
        market: { ...base.market, tick: W } },
      initialSyntheticRoot(W),
    )
    const result = advanceCareerLifecycleWeek(state, ['synthetic-a2c-eligible', 'synthetic-a2c-too-recent'])
    expect(retirementRecordFor(result, 'synthetic-a2c-eligible'), 'anchor exactly at w-104 (inclusive): must be eligible').toBeDefined()
    expect(retirementRecordFor(result, 'synthetic-a2c-too-recent'), 'anchor one week short of w-104: must NOT be eligible').toBeUndefined()
  })

  // ── A3: E = max(A + 52, end in force) ──
  it('A3a SYNTHETIC (isolated boundary, rival interval): a hard-boundary director under an ACTIVE RIVAL employment interval ending AFTER A+52 announces with E = the interval\'s own end', () => {
    // 777 amendment A2 (parent): the T0 predictor for genuine-v33-c2-rival-in-window
    // assumed no rival re-hire changes the contract in force between the save week and
    // a subject's own future birthday — a known-risky assumption for THIS fixture, not
    // relied on here. This case is fully synthetic instead: a fresh candidate, a
    // rival employment interval built directly (never derived from any T0 prediction),
    // isolating D5's "end in force" branch for a RIVAL (not player) interval.
    const base = c2Fixture('genuine-v33-c2-rival-in-window') // used only for its real hollywood/rival shape
    const week = base.market.tick
    const rivalStudioId = base.hollywood!.identities.find((i) => i.role === 'rival')!.studioId
    const candidateId = 'synthetic-a3a-rival-director'
    let state = prependSyntheticCandidate(base, candidateId, 'director', 76) // 76 >= hard (75)
    const ordinal = state.hollywood!.employment.length
    const terms = { talentId: candidateId, annualSalary: 0, signingBonus: 0, startWeek: week - 50, endWeekExclusive: week + 150, termWeeks: 200 }
    state = {
      ...state,
      hollywood: {
        ...state.hollywood!,
        employment: [...state.hollywood!.employment, { contractId: `${rivalStudioId}:synthetic:${candidateId}`, studioId: rivalStudioId, terms, endedWeek: null, reason: 'entry' as const }],
        activeEmploymentOrdinals: [...state.hollywood!.activeEmploymentOrdinals, ordinal],
      },
    }
    const lifecycle = withSyntheticCareerLifecycle(state, initialSyntheticRoot(week))
    const result = advanceCareerLifecycleWeek(lifecycle, [candidateId])
    expect(retirementRecordFor(result, candidateId)).toMatchObject({
      cause: 'hardBoundary', announcedWeek: week, effectiveWeek: week + 150, // the rival interval's own end (150 > 52) dominates
    })
  })

  it('A3b SYNTHETIC (isolated boundary): a hard-boundary actor under an active player contract ending BEFORE A+52 announces with E = A + 52 (the contract does not shorten it)', () => {
    // 774/775 report no naturally-reached case where a contract is STILL active at the
    // hard-boundary birthday AND ends inside the 52-week horizon (every reached case
    // had already expired or extended past it). Built from a genuine natural person
    // (t-act-21, independently atOrPastHard per 775's own survey) under a SYNTHETIC
    // short contract, isolating this one branch.
    const base = c2Fixture('genuine-v33-c2-hard-boundary-and-idle-window')
    const person = base.talent.find((t) => t.id === 't-act-21')!
    expect(person.age).toBe(70) // independently at-or-past-hard at week 780 (775 survey)
    const week = 780
    const shortContract = { talentId: person.id, annualSalary: 0, signingBonus: 0, startWeek: week - 10, endWeekExclusive: week + 10, termWeeks: 20 }
    const withContract = { ...base, contracts: [...base.contracts, shortContract] }
    const state = withSyntheticCareerLifecycle(withContract, initialSyntheticRoot(week))
    const birthdays = birthdaysDueAt(state.talentProvenance, week) // t-act-21 is not naturally due at 780; drive it directly
    const result = advanceCareerLifecycleWeek(state, [...birthdays, 't-act-21'])
    expect(retirementRecordFor(result, 't-act-21')).toMatchObject({
      cause: 'hardBoundary', announcedWeek: week, effectiveWeek: week + 52, // A+52 (832) dominates the contract end (790)
    })
  })

  // ── A4: Scientists never announce ──
  it('A4: retirementWindow(\'scientist\') is null, and t-sci-00 (aged 61, scientist) never announces however far it ticks', () => {
    expect(retirementWindow('scientist')).toBeNull()
    const base = c2Fixture('genuine-v33-c2-scientist') // week 520, t-sci-00 age 61
    let state = withSyntheticCareerLifecycle(base, initialSyntheticRoot(520))
    state = advanceLifecycleTo(state, 572) // one full year further; scientist has no window to cross
    expect(retirementRecordFor(state, 't-sci-00')).toBeUndefined()
    expect(state.careerLifecycle.records.some((r) => r.profession === 'scientist')).toBe(false)
  })

  // ── A5: one record per person; later birthdays change nothing ──
  it('A5: authored-0000 gets exactly one record; re-evaluating a LATER birthday never mints a second one or alters the announcement facts (only settlement, a separate step, may advance status)', () => {
    const base = c2Fixture('genuine-v33-c2-hard-boundary-and-idle-window')
    let state = withSyntheticCareerLifecycle(base, initialSyntheticRoot(780))
    state = advanceLifecycleTo(state, 832)
    const first = retirementRecordFor(state, 'authored-0000')
    expect(first).toBeDefined()
    // one more birthday, still short of E (884) — re-evaluating intent at a later
    // birthday must not touch the identity/cause/announcedWeek/effectiveWeek facts.
    state = advanceLifecycleTo(state, 883)
    expect(retirementRecordFor(state, 'authored-0000')).toMatchObject({
      personId: first!.personId, profession: first!.profession, cause: first!.cause,
      announcedWeek: first!.announcedWeek, ageAtAnnouncement: first!.ageAtAnnouncement, effectiveWeek: first!.effectiveWeek,
    })
    expect(state.careerLifecycle.records.filter((r) => r.personId === 'authored-0000')).toHaveLength(1)
    // at E itself (884) settlement (D10/E1, a DIFFERENT step) is allowed to advance
    // status — that is not a second record, and is pinned in its own right by E1.
    state = advanceLifecycleTo(state, 884)
    expect(state.careerLifecycle.records.filter((r) => r.personId === 'authored-0000')).toHaveLength(1)
    const atE = retirementRecordFor(state, 'authored-0000')!
    expect(atE).toMatchObject({ announcedWeek: first!.announcedWeek, cause: first!.cause, effectiveWeek: first!.effectiveWeek })
  })

  // ── A6: deterministic, no RNG, idempotent ──
  it('A6a: advanceCareerLifecycleWeek does not move rngState', () => {
    const base = c2Fixture('genuine-v33-c2-hard-boundary-and-idle-window')
    const state = withSyntheticCareerLifecycle(base, initialSyntheticRoot(780))
    const birthdays = birthdaysDueAt(state.talentProvenance, 780)
    const before = state.rngState
    const after = advanceCareerLifecycleWeek(state, birthdays).rngState
    expect(after).toEqual(before)
  })

  it('A6b: calling advanceCareerLifecycleWeek twice with the same birthdays produces byte-equal output (idempotent, deterministic)', () => {
    const base = c2Fixture('genuine-v33-c2-hard-boundary-and-idle-window')
    const state = withSyntheticCareerLifecycle(base, initialSyntheticRoot(832))
    const birthdays = birthdaysDueAt(state.talentProvenance, 832)
    const once = advanceCareerLifecycleWeek(state, birthdays)
    const twice = advanceCareerLifecycleWeek(once, [])
    expect(twice).toEqual(once) // re-ticking with no NEW birthdays changes nothing
    const runA = JSON.stringify(advanceCareerLifecycleWeek(state, birthdays))
    const runB = JSON.stringify(advanceCareerLifecycleWeek(state, birthdays))
    expect(runB).toBe(runA) // same input twice, byte-equal output
  })

  // ── A7: null hollywood -> no record ever ──
  it('A7: a null-hollywood world (bare-world) returns state UNCHANGED from advanceCareerLifecycleWeek, even with real due birthdays supplied', () => {
    const base = nullHollywoodFixture('bare-world')
    expect(base.hollywood).toBeNull()
    const state = withSyntheticCareerLifecycle(base, initialSyntheticRoot(0))
    const birthdays = state.talent.map((t) => t.id) // every id, whether or not really due — D6 short-circuits before that matters
    const result = advanceCareerLifecycleWeek(state, birthdays)
    expect(result).toEqual(state)
    expect(result.careerLifecycle.records).toEqual([])
  })

  it('A7b: the SAME rule holds after real ticks (bare-ticked, week 1, still null hollywood)', () => {
    const base = nullHollywoodFixture('bare-ticked')
    expect(base.hollywood).toBeNull()
    let state = withSyntheticCareerLifecycle(base, initialSyntheticRoot(1))
    for (let i = 0; i < 5; i++) {
      const birthdays = birthdaysDueAt(state.talentProvenance, state.market.tick + 1)
      state = tick(state as unknown as import('../src/core/types.js').GameState) as unknown as GameStateV34
      expect(state.hollywood, 'a null-hollywood world never gains one from ticking alone').toBeNull()
      state = advanceCareerLifecycleWeek(state, birthdays) as GameStateV34
      expect(state.careerLifecycle.records, `still no record at week ${state.market.tick}`).toEqual([])
    }
  })
})
