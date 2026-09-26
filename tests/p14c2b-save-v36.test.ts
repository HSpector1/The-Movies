// P14C.2b T1 — INDEPENDENT RED/repair, family S: Save V36 (780 X10, as amended by 780
// §5.4 and §6.1, and API contract 806 §2/§8.2). Derived from 806 §2's own documented
// mapping and (for S3's tamper regexes) the ACTUAL thrown text once mechanical defects
// were traced (778's rule: never to retune an expected VALUE).
//
// REPAIR (this revision, against implementation HEAD 8cf6bed2+; 810 §8 has the full
// finding->change ledger):
//  - F3 (S3): the baseline is now a GENUINE V36 state produced by the natural route —
//    migrate axis a live, have the player submit the lawful extension at E-12 through
//    the real `submitProposal`, and tick to the decision week. The `synthesizeV36`
//    graft-based baseline is RETIRED (795 §8 F5): a genuine route exists.
//  - S1's independent oracle (`expectedV36Records`/`expectedV36Cases`) is now a plain,
//    cleanly-typed function — no more `as unknown as` cast, since `GameStateV35`'s
//    records/cases map onto `RetirementRecordV36`/`TalentMarketCaseV36` by simple
//    object-spread (added fields only).
//  - S2's three cases are now built from genuine states too (a genuinely-migrated
//    never-extended world; a genuinely-extended one; a genuinely OPEN-but-unused one) —
//    no synthetic construction anywhere in this file any more.
//  - S3's four tamper regexes are re-aligned with the validator's ACTUAL thrown text
//    (read directly from `save.ts`'s `validateRetirementExtensions`, never guessed):
//    `/at most one|second retirementExtension/i`, `/settled retirementExtension case/i`,
//    `/weeks before its effective week/i`, `/exactly one must/i` — the last two replace
//    810's original reasoned guesses (`/extendedFromWeek|effectiveWeek/i` and
//    `/terms|contract|effectiveWeek/i`), which did not discriminate from each other
//    (both messages contain the words "effective week").
//  - S4's `makeSave` case now migrates first (F1) — `makeSave` takes the live V36
//    `GameState`, and a raw V35 fixture is a type error against it.
import { describe, expect, it } from 'vitest'
import { LIVE_SAVE_VERSION, convertV35ToV36, convertV36ToV35, makeSave, validateSaveV36 } from '../src/core/save.js'
import type { GameState, GameStateV35, RetirementRecordV36, TalentMarketCaseV36 } from '../src/core/types.js'
import { C2B_CORPUS, advanceTo, c2bFixture, c2bLiveFixture, liveEnvelope, liveEnvelopeV36 } from './helpers/p14c2b-fixtures.js'
import { submitProposal } from '../src/core/talentMarket.js'
import { retirementRecordFor } from '../src/core/careerLifecycle.js'

const CORPUS_NAMES = Object.keys(C2B_CORPUS) as (keyof typeof C2B_CORPUS)[]

/** 806 §2's OWN documented V35->V36 mapping, applied here directly from the CONTRACT
 * TEXT (never from `save.ts`'s own `convertV35ToV36`, which is the function under test):
 * "every record gains extensionUsed: false, extendedFromWeek: null; every case gains
 * variant: 'expiry'". An INDEPENDENT oracle, so this suite cannot agree with a wrong
 * implementation merely by construction. */
function expectedV36Records(state: GameStateV35): RetirementRecordV36[] {
  return state.careerLifecycle.records.map((r) => ({ ...r, extensionUsed: false, extendedFromWeek: null }))
}
function expectedV36Cases(state: GameStateV35): TalentMarketCaseV36[] {
  return state.talentMarket.cases.map((c) => ({ ...c, variant: 'expiry' as const }))
}

describe('P14C.2b S1: every corpus world migrates V35 -> V36 per 806 §2', () => {
  it.each(CORPUS_NAMES)('%s', (name) => {
    const state = c2bFixture(name)
    const migrated = convertV35ToV36(liveEnvelope(state))
    expect(migrated.saveVersion).toBe(36)
    expect(migrated.state.careerLifecycle.records, 'every record must gain extensionUsed:false, extendedFromWeek:null').toEqual(expectedV36Records(state))
    expect(migrated.state.talentMarket.cases, 'every case must gain variant:\'expiry\'').toEqual(expectedV36Cases(state))
    expect(migrated.state.careerLifecycle.cohorts, 'cohort receipts must be byte-identical').toEqual(state.careerLifecycle.cohorts)
  })
})

describe('P14C.2b S2: V36 -> V35 downgrade', () => {
  it('lossless when no record has extensionUsed and no case is a retirementExtension (a genuinely migrated, never-ticked world)', () => {
    const raw = c2bFixture('genuine-v35-c2b-contract-gap-freeagent-expiry')
    const live = c2bLiveFixture('genuine-v35-c2b-contract-gap-freeagent-expiry')
    const downgraded = convertV36ToV35(liveEnvelopeV36(live))
    expect(downgraded.saveVersion).toBe(35)
    expect(JSON.stringify(downgraded)).toBe(JSON.stringify(liveEnvelope(raw)))
  })

  it('refused as a downgrade when a record carries extensionUsed: true (a genuinely accepted extension, axis a, natural route)', () => {
    const atWindow = advanceTo(c2bLiveFixture('genuine-v35-c2b-contract-gap-freeagent-expiry'), 92)
    const withOffer = submitProposal(atWindow, { talentId: 'authored-0000', issuerStudioId: 'studio-d7df6c8e-player', termWeeks: 58, premiumTier: 1.1 })
    const settled = advanceTo(withOffer, 98)
    expect(retirementRecordFor(settled, 'authored-0000')?.extensionUsed).toBe(true)
    expect(() => convertV36ToV35(liveEnvelopeV36(settled))).toThrow(/downgrade/i)
  })

  it('refused as a downgrade when a case carries variant: retirementExtension (open, not yet used — the case alone is enough)', () => {
    const atWindow = advanceTo(c2bLiveFixture('genuine-v35-c2b-contract-gap-freeagent-expiry'), 92)
    const kase = atWindow.talentMarket.cases.find((c) => c.contractId === 'studio-d7df6c8e-player:contract:authored-0000:0:player-24')
    expect(kase?.variant).toBe('retirementExtension')
    expect(retirementRecordFor(atWindow, 'authored-0000')?.extensionUsed, 'this state must NOT yet have used its extension — the CASE alone must be enough to refuse').toBe(false)
    expect(() => convertV36ToV35(liveEnvelopeV36(atWindow))).toThrow(/downgrade/i)
  })
})

// ── S3: the V36 validator, per 806 §8.2, F3: rebased on a GENUINE settled state ───────

/** A genuine, naturally-produced V36 state: axis a's subject, migrated live, a lawful
 * extension submitted by the incumbent at E-12 and settled at the decision week (98,
 * new E 156) — every field produced by the REAL engine, nothing hand-built. */
function genuineSettledBaseline(): { state: GameState; personId: string; oldE: number; newE: number; decisionWeek: number; contractId: string } {
  const personId = 'authored-0000'
  const contractId = 'studio-d7df6c8e-player:contract:authored-0000:0:player-24'
  const atWindow = advanceTo(c2bLiveFixture('genuine-v35-c2b-contract-gap-freeagent-expiry'), 92)
  const withOffer = submitProposal(atWindow, { talentId: personId, issuerStudioId: 'studio-d7df6c8e-player', termWeeks: 58, premiumTier: 1.1 })
  const state = advanceTo(withOffer, 98)
  return { state, personId, oldE: 104, newE: 156, decisionWeek: 98, contractId }
}

describe('P14C.2b S3: the validator refuses each tampering, one per case, from a GENUINE settled V36 state (806 §8.2)', () => {
  it('the unmutated, genuinely-produced baseline must validate', () => {
    const { state } = genuineSettledBaseline()
    expect(() => validateSaveV36(liveEnvelopeV36(state))).not.toThrow()
  })

  it('a second extension case for the SAME person is refused (at most one per person, ever)', () => {
    const { state, contractId } = genuineSettledBaseline()
    const original = state.talentMarket.cases.find((c) => c.contractId === contractId && c.variant === 'retirementExtension')!
    const second: TalentMarketCaseV36 = { ...original, contractId: `${contractId}-second` }
    const tampered: GameState = { ...state, talentMarket: { ...state.talentMarket, cases: [...state.talentMarket.cases, second] } }
    expect(() => validateSaveV36(liveEnvelopeV36(tampered))).toThrow(/at most one|second retirementExtension/i)
  })

  it('extensionUsed: true with no SETTLED extension case for that person is refused', () => {
    const { state, personId } = genuineSettledBaseline()
    const tampered: GameState = {
      ...state,
      talentMarket: { ...state.talentMarket, cases: state.talentMarket.cases.filter((c) => !(c.talentId === personId && c.variant === 'retirementExtension')) },
    }
    expect(() => validateSaveV36(liveEnvelopeV36(tampered))).toThrow(/settled retirementExtension case/i)
  })

  it('extendedFromWeek mismatched with effectiveWeek - 52 is refused', () => {
    const { state, personId, oldE } = genuineSettledBaseline()
    const tampered: GameState = {
      ...state,
      careerLifecycle: {
        ...state.careerLifecycle,
        records: state.careerLifecycle.records.map((r) => (r.personId === personId ? { ...r, extendedFromWeek: oldE - 1 } : r)),
      },
    }
    expect(() => validateSaveV36(liveEnvelopeV36(tampered))).toThrow(/weeks before its effective week/i)
  })

  it('no contract ending at the new E is found by TERMS (the new contract\'s endWeekExclusive is altered) — refused', () => {
    const { state, newE } = genuineSettledBaseline()
    const tampered: GameState = {
      ...state,
      hollywood: {
        ...state.hollywood!,
        employment: state.hollywood!.employment.map((e) =>
          (e.terms.endWeekExclusive === newE ? { ...e, terms: { ...e.terms, endWeekExclusive: newE + 1 } } : e)),
      },
    }
    expect(() => validateSaveV36(liveEnvelopeV36(tampered))).toThrow(/exactly one must/i)
  })
})

describe('P14C.2b S4: LIVE_SAVE_VERSION, makeSave, replay determinism', () => {
  it('LIVE_SAVE_VERSION === 37', () => {
    expect(LIVE_SAVE_VERSION).toBe(37)
  })

  it('makeSave stamps 37', () => {
    const live = c2bLiveFixture('genuine-v35-c2b-contract-gap-freeagent-expiry') // F1: migrate first — makeSave now expects the live (V36) shape
    const saved = makeSave(live)
    expect((saved as { saveVersion: number }).saveVersion).toBe(37)
  })

  it('two independent V35 -> V36 migrations of the SAME state are byte-identical', () => {
    const state = c2bFixture('genuine-v35-c2b-contract-gap-freeagent-expiry')
    const env = liveEnvelope(state)
    const a = convertV35ToV36(env)
    const b = convertV35ToV36(env)
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })
})
