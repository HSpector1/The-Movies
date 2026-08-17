// ── D-17A INDEPENDENT ADVERSARIAL TESTS — D. SAVE MIGRATION (R2 safeguard) ────
// Contract §3 / §6: the V5→V6 converter reconstructs the persisted engagement fact from
//   founding !== null
//   ∨ contracts.length > 0
//   ∨ ledger has any ENGAGED-ONLY kind {payroll, overhead, signingBonus, termination,
//     freelancerFee, studioRevenue}
//   ∨ any theatricalRun with economyModelVersion ≥ 1
// with `boxOffice` and `production` DELIBERATELY EXCLUDED (the headless/M0A path writes
// both). Quality requirement E: "deterministic, idempotent, `rngState` carried unchanged,
// `validateSave` loudly rejects unknown versions."
//
// These saves are hand-written LITERALS — minimal envelopes built straight from the
// SaveFileV3/V4/V5 shapes, not produced by playing the game. That is the point: a real
// player's file is data, and the converter must read the evidence in the data alone.

import { describe, expect, it } from 'vitest'
import {
  makeSaveV2,
  makeSaveV3,
  makeSaveV4,
  makeSaveV5,
  migrateToV6,
  stableStringify,
  TUNING,
  validateSave,
  validateSaveV6,
} from '../src/core/index.js'
import type {
  GameStateV2,
  GameStateV3,
  GameStateV4,
  GameStateV5,
  LedgerEntryV10,
  TheatricalRun,
} from '../src/core/index.js'

const RNG_STATE = 'RNG:adv-d:0123456789abcdef'

/** The minimal V3-shaped state literal every case below starts from. Plain data only. */
function minimalV3(seed: string): Record<string, unknown> {
  return {
    seed,
    rngState: RNG_STATE,
    market: { tick: 40, forces: {}, segments: [], baseMarketValue: 1, competingSlate: [] },
    era: { soundRequired: true, televisionCompetition: false, censorship: 'none', costScale: 1 },
    studio: {
      cash: 1_234_567,
      standing: { audienceAwareness: 11, industryPrestige: 22, commercialConfidence: 33 },
      activeProductions: [],
      releasedFilms: [],
    },
    talent: [],
    concepts: [],
    broadcastItems: [],
    coverageContexts: [],
    founding: null,
    contracts: [],
    ledger: [],
    freeAgents: [],
  }
}

/** A released film literal, minimal but sufficient for the V3→V4 legacy-run conversion. */
const RELEASED_FILM = {
  productionId: 'p1',
  releaseTick: 12,
  conceptId: 'c1',
  directorId: 'd1',
  delivered: { intimacy: 0, tonalWeight: 0, kineticEnergy: 0 },
  cohesion: 50,
  craft: 50,
  criticMean: 50,
  criticSigma: 5,
  criticScore: 50,
  reviewVariance: 5,
  segmentScores: { youngAdult: 50, family: 50, adult: 50, prestige: 50 },
  boxOffice: { opening: 1_000_000, total: 4_000_000 },
}

const entry = (kind: LedgerEntryV10['kind'], week: number, amount: number): LedgerEntryV10 => ({
  week,
  kind,
  amount,
  note: `${kind} (hand-written fixture)`,
})

const legacyRun: TheatricalRun = {
  productionId: 'p1',
  conceptId: 'c1',
  releaseTick: 12,
  totalWeeks: 1,
  weekIndex: 1,
  weeklyGross: [4_000_000],
  studioShare: 1,
  cumulativeGrossPaid: 4_000_000,
  cumulativeStudioRevenuePaid: 4_000_000,
  economyModelVersion: 0, // a MIGRATED V3 release: proves nothing about engagement
  status: 'legacyCompleted',
}

const v3 = (over: Record<string, unknown>, seed: string) =>
  makeSaveV3({ ...minimalV3(seed), ...over } as unknown as GameStateV3)
const v4 = (over: Record<string, unknown>, seed: string) =>
  makeSaveV4({ ...minimalV3(seed), theatricalRuns: [], ...over } as unknown as GameStateV4)
const v5 = (over: Record<string, unknown>, seed: string) =>
  makeSaveV5({
    ...minimalV3(seed),
    theatricalRuns: [],
    careerEvents: [],
    ...over,
  } as unknown as GameStateV5)

// ═════════════════════════════════════════════════════════════════════════════
describe('D-17A/D — the reconstructed engagement fact, one save class at a time', () => {
  it('V3 with released films but an EMPTY employment surface → false (a legacy open-pool save)', () => {
    const save = v3(
      {
        studio: { ...(minimalV3('d-v3').studio as object), releasedFilms: [RELEASED_FILM] },
        ledger: [entry('production', 4, -2_000_000), entry('boxOffice', 12, 4_000_000)],
      },
      'd-v3',
    )
    const out = migrateToV6(save)
    expect(out.saveVersion).toBe(6)
    expect(out.state.economyEngagedEver).toBe(false)
    // its release became a legacyCompleted, model-0 run — deliberately NOT evidence
    expect(out.state.theatricalRuns.length).toBe(1)
    expect(out.state.theatricalRuns[0]!.economyModelVersion).toBe(0)
  })

  it('V4 from the engaged era whose ledger holds exactly ONE payroll entry → true', () => {
    const save = v4({ ledger: [entry('payroll', 5, -1_000)] }, 'd-v4')
    expect(migrateToV6(save).state.economyEngagedEver).toBe(true)
  })

  it('V5 POST-CLIFF — zero contracts, no founding, a `termination` in the ledger → true', () => {
    const save = v5({ founding: null, contracts: [], ledger: [entry('termination', 9, -20_000)] }, 'd-v5a')
    const out = migrateToV6(save)
    expect(out.state.contracts.length).toBe(0) // the exact D-16 failure state…
    expect(out.state.economyEngagedEver).toBe(true) // …is still a player studio
  })

  it('V5 MID-FOUNDING — an open draft with no contracts yet → true', () => {
    const save = v5({ founding: { applicantIds: ['t1', 't2'], budget: 6_000_000, spentBonus: 0 } }, 'd-v5b')
    expect(migrateToV6(save).state.economyEngagedEver).toBe(true)
  })

  it('V5 M0A-shaped — ledger only production+boxOffice, runs only model 0 → false', () => {
    const save = v5(
      {
        ledger: [entry('production', 1, -500_000), entry('boxOffice', 12, 4_000_000)],
        theatricalRuns: [legacyRun],
      },
      'd-v5c',
    )
    expect(migrateToV6(save).state.economyEngagedEver).toBe(false)
  })

  it('each engaged-only ledger kind ALONE is sufficient evidence; the two shared kinds are not', () => {
    const engagedOnly: LedgerEntryV10['kind'][] = [
      'payroll',
      'overhead',
      'signingBonus',
      'termination',
      'freelancerFee',
      'studioRevenue',
    ]
    for (const kind of engagedOnly) {
      const save = v5({ ledger: [entry(kind, 3, -1)] }, `d-kind-${kind}`)
      expect(migrateToV6(save).state.economyEngagedEver).toBe(true)
    }
    for (const kind of ['production', 'boxOffice'] as LedgerEntryV10['kind'][]) {
      const save = v5({ ledger: [entry(kind, 3, -1)] }, `d-shared-${kind}`)
      expect(migrateToV6(save).state.economyEngagedEver).toBe(false)
    }
  })

  it('a theatrical run at the D-12 economy model (version ≥ 1) is evidence; model 0 is not', () => {
    const modern: TheatricalRun = { ...legacyRun, economyModelVersion: TUNING.ECONOMY_MODEL_VERSION, status: 'completed' }
    expect(TUNING.ECONOMY_MODEL_VERSION).toBeGreaterThanOrEqual(1) // the invariant the predicate rests on
    expect(migrateToV6(v5({ theatricalRuns: [modern] }, 'd-run-1')).state.economyEngagedEver).toBe(true)
    expect(migrateToV6(v5({ theatricalRuns: [legacyRun] }, 'd-run-0')).state.economyEngagedEver).toBe(false)
  })

  it('a LEGACY V2 save (no employment surface exists in that shape at all) → false', () => {
    // The pre-employment frozen shape: V2 → V3 fills an EMPTY employment surface, so the whole
    // legacy-upgrade chain must land on `false` and keep behaving exactly as it always did.
    const state = { ...minimalV3('d-v2') } as Record<string, unknown>
    delete state.founding
    delete state.contracts
    delete state.ledger
    delete state.freeAgents
    const out = migrateToV6(makeSaveV2(state as unknown as GameStateV2))
    expect(out.saveVersion).toBe(6)
    expect(out.state.economyEngagedEver).toBe(false)
    expect(out.state.contracts).toEqual([])
    expect(out.state.ledger).toEqual([])
    expect(out.state.rngState).toBe(RNG_STATE)
  })

  it('a live contract alone is evidence', () => {
    const contract = {
      talentId: 't1',
      annualSalary: 100_000,
      signingBonus: 18_000,
      startWeek: 0,
      endWeekExclusive: 52,
      termWeeks: 52,
    }
    expect(migrateToV6(v5({ contracts: [contract] }, 'd-contract')).state.economyEngagedEver).toBe(true)
  })
})

describe('D-17A/D — determinism, idempotency, and what the converter must NOT touch', () => {
  it('rngState is carried through UNCHANGED for every class', () => {
    const saves = [
      v3({ studio: { ...(minimalV3('r1').studio as object), releasedFilms: [RELEASED_FILM] } }, 'r1'),
      v4({ ledger: [entry('payroll', 5, -1_000)] }, 'r2'),
      v5({ ledger: [entry('termination', 9, -20_000)] }, 'r3'),
    ]
    for (const s of saves) expect(migrateToV6(s).state.rngState).toBe(RNG_STATE)
  })

  it('is byte-stable across two independent conversions of the same input', () => {
    const save = v5({ ledger: [entry('overhead', 7, -15_000)] }, 'd-stable')
    expect(stableStringify(migrateToV6(save))).toBe(stableStringify(migrateToV6(save)))
  })

  it('is idempotent: migrating a V6 returns that same save, byte-identical', () => {
    const once = migrateToV6(v5({ ledger: [entry('payroll', 2, -900)] }, 'd-idem'))
    const twice = migrateToV6(once)
    expect(twice).toBe(once)
    expect(stableStringify(twice)).toBe(stableStringify(once))
    expect(stableStringify(migrateToV6(twice))).toBe(stableStringify(once))
  })

  it('never mutates the V5 input (the old file keeps its frozen shape)', () => {
    const save = v5({ ledger: [entry('payroll', 2, -900)] }, 'd-nomutate')
    const before = stableStringify(save)
    migrateToV6(save)
    expect(stableStringify(save)).toBe(before)
    expect('economyEngagedEver' in (save.state as object)).toBe(false)
    expect(save.saveVersion).toBe(5)
  })

  it('preserves everything else the save carried (cash, standing, market, ledger, films)', () => {
    const source = v5(
      {
        studio: { ...(minimalV3('d-carry').studio as object), releasedFilms: [RELEASED_FILM] },
        ledger: [entry('payroll', 5, -1_000), entry('studioRevenue', 12, 2_080_000)],
      },
      'd-carry',
    )
    const out = migrateToV6(source)
    // The only difference between the two states is the added regime fact.
    const stripped = { ...out.state } as Record<string, unknown>
    delete stripped.economyEngagedEver
    expect(stableStringify(stripped)).toBe(stableStringify(source.state))
  })
})

describe('D-17A/D — validateSave still guards the version boundary loudly', () => {
  const v6 = migrateToV6(v5({ ledger: [entry('payroll', 1, -1)] }, 'd-validate'))

  it('accepts version 6 and returns it narrowed', () => {
    expect(validateSave(v6)).toBe(v6)
    expect(validateSaveV6(v6)).toBe(v6)
  })

  // Property State V13 (C1-M1a): 13 is known, so the loud-rejection boundary is 14.
  it('rejects an unknown version 14 loudly', () => {
    expect(() => validateSave({ ...v6, saveVersion: 14 })).toThrow(/unknown saveVersion 14/)
  })

  it('rejects a V6 whose persisted regime fact is missing or not a boolean', () => {
    const noFlag = { ...v6, state: { ...v6.state } } as Record<string, unknown>
    delete (noFlag.state as Record<string, unknown>).economyEngagedEver
    expect(() => validateSave(noFlag)).toThrow(/economyEngagedEver/)
    expect(() =>
      validateSave({ ...v6, state: { ...v6.state, economyEngagedEver: 'true' } }),
    ).toThrow(/economyEngagedEver/)
    expect(() =>
      validateSave({ ...v6, state: { ...v6.state, economyEngagedEver: 1 } }),
    ).toThrow(/economyEngagedEver/)
  })
})
