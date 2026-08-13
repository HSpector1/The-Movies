// ── D-17A / T10 + T11 — the persisted engagement fact, and the releaseTalent exception ──
//
// Contract sources:
//  - Owner ruling R2 (docs/D-16-OWNER-RULINGS.md): engagement becomes an EXPLICIT,
//    PERSISTED, MONOTONIC gameplay fact. Enduring regime membership is never re-derived
//    from mutable current collections. The D-16 defect: a founded studio that let every
//    contract expire (or fired everyone) silently fell back to the headless D-1 regime —
//    no overhead, no solvency gate, and an active theatrical run stopped being paid.
//  - Owner ruling R3: `releaseTalent` stays UNGATED; the D-12 §11 text is amended with
//    the explicit exception, and this file carries the regression proof.
//  - docs/D-17A-IMPLEMENTATION-CONTRACT.md §3 / §6: the V5→V6 reconstruction predicate,
//    proven exact for every existing save class, with `boxOffice` and `production`
//    DELIBERATELY excluded (the headless path writes both).
//
// Fixture values (cash overrides, stripped-shape casts) are chosen INPUTS, in the same
// style the D-12 suite already uses. Seeded RNG only; public core surface only.

import { describe, expect, it } from 'vitest'
import {
  applyActions,
  beginFounding,
  canAfford,
  convertV5ToV6,
  economyEngaged,
  employmentEngaged,
  exportSave,
  FOUNDING_MINIMUMS,
  generateWorld,
  hiringMarketIds,
  isContracted,
  makeSave,
  makeSaveV3,
  makeSaveV5,
  migrateToV6,
  OracleAgent,
  stableStringify,
  terminationCost,
  tick,
  TUNING,
  validateSaveV6,
} from '../src/core/index.js'
import type {
  CastSlot,
  CreativeRole,
  GameState,
  GameStateV3,
  GameStateV5,
  GameStateV6,
  LedgerEntry,
} from '../src/core/index.js'

// ── helpers ───────────────────────────────────────────────────────────────────

function foundStudio(seed: string): GameState {
  let s = beginFounding(generateWorld(seed))
  const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
  const byRole = (role: CreativeRole, n: number) => pool.filter((t) => t.role === role).slice(0, n)
  const toSign = [
    ...byRole('actor', FOUNDING_MINIMUMS.actor),
    ...byRole('director', FOUNDING_MINIMUMS.director),
    ...byRole('writer', FOUNDING_MINIMUMS.writer),
    ...byRole('craft', FOUNDING_MINIMUMS.craft),
  ]
  for (const t of toSign) s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: 156 }])
  return applyActions(s, [{ kind: 'foundStudio' }])
}

function rosterIds(s: GameState, role: CreativeRole): string[] {
  return s.contracts
    .map((c) => s.talent.find((t) => t.id === c.talentId)!)
    .filter((t) => t.role === role)
    .map((t) => t.id)
}

function greenlightOneFilm(s: GameState): GameState {
  const concept = s.concepts[0]!
  const actors = rosterIds(s, 'actor')
  const cast = { lead: actors[0]!, antagonist: actors[1]!, support: actors[2]! } as Record<CastSlot, string>
  return applyActions(s, [
    {
      kind: 'greenlight',
      production: {
        conceptId: concept.id,
        shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
        promise: {
          genre: concept.genre,
          intendedSegments: ['adult'],
          ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] },
        },
        writerId: rosterIds(s, 'writer')[0]!,
        directorId: rosterIds(s, 'director')[0]!,
        cast,
        craftIds: [rosterIds(s, 'craft')[0]!],
        budget: { negative: concept.baseNegativeCost, marketing: 100_000 },
      },
    },
  ])
}

function advance(s: GameState, n: number): GameState {
  let cur = s
  for (let i = 0; i < n; i++) cur = tick(cur)
  return cur
}

// Release EVERY contract — the D-16 "fire everyone" cliff.
function fireEveryone(s: GameState): GameState {
  let cur = s
  for (const c of [...cur.contracts]) {
    cur = applyActions(cur, [{ kind: 'releaseTalent', talentId: c.talentId }])
  }
  return cur
}

// A headless (never-engaged) run: generateWorld + the OracleAgent, exactly the M0A corpus
// shape. It releases films on the D-1 single-lump path, so its ledger carries `production`
// and `boxOffice` and NOTHING else — the two kinds the predicate must ignore.
function headlessRun(seed: string, weeks: number): GameState {
  let s = generateWorld(seed)
  for (let i = 0; i < weeks; i++) {
    s = applyActions(s, OracleAgent.chooseActions(s))
    s = tick(s)
  }
  return s
}

// D-17B/E4 (M8 fixture discipline): the live GameState gained `publicity`, so every frozen-shape
// strip helper below drops it EXPLICITLY. If it were left to leak, the migration tests would go
// VACUOUS — the "V5" fixture would already carry the field the migration is supposed to add, and
// a broken converter would still pass. The `Omit<>`-typed returns make an omission a type error.
// Strip the live state back to the FROZEN GameStateV6 shape a real V6 save carries.
function toV6(s: GameState): GameStateV6 {
  const { publicity: _publicity, operations: _operations, scriptDevelopment: _scripts, ...v6 } = s
  return v6
}

// Strip the live state back to the FROZEN GameStateV5 shape, as a real V5 save carries it.
function toV5(s: GameState): GameStateV5 {
  const { economyEngagedEver: _dropped, publicity: _publicity, operations: _operations, scriptDevelopment: _scripts, ...v5 } = s
  return v5
}

// Strip the live state back to the FROZEN GameStateV3 shape (a legacy D-11 save).
function toV3(s: GameState): GameStateV3 {
  const {
    economyEngagedEver: _economyEngagedEver,
    careerEvents: _careerEvents,
    theatricalRuns: _theatricalRuns,
    publicity: _publicity,
    operations: _operations,
    scriptDevelopment: _scriptDevelopment,
    ...v3
  } = s
  return v3
}

const ENGAGED_KINDS = ['payroll', 'overhead', 'signingBonus', 'termination', 'freelancerFee', 'studioRevenue']

// ══════════════════════════════════════════════════════════════════════════════
// PART 1 — the fact is set at exactly the intended moments, and never cleared
// ══════════════════════════════════════════════════════════════════════════════

describe('D-17A/R2: economyEngagedEver is seeded false and set only by founding / signing', () => {
  it('generateWorld seeds false — the headless world is never engaged', () => {
    const w = generateWorld('d17-seed')
    expect(w.economyEngagedEver).toBe(false)
    expect(economyEngaged(w)).toBe(false)
  })

  it('a headless run NEVER engages, however many films it releases', () => {
    const s = headlessRun('d17-headless-never', 30)
    expect(s.studio.releasedFilms.length).toBeGreaterThan(0)
    expect(s.economyEngagedEver).toBe(false)
    expect(economyEngaged(s)).toBe(false)
  })

  it('beginFounding engages (before a single contract exists)', () => {
    const f = beginFounding(generateWorld('d17-begin'))
    expect(f.contracts.length).toBe(0)
    expect(f.economyEngagedEver).toBe(true)
    expect(economyEngaged(f)).toBe(true)
  })

  it('a founded studio is engaged', () => {
    expect(economyEngaged(foundStudio('d17-founded'))).toBe(true)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// PART 2 — MONOTONICITY: the cliff is closed
// ══════════════════════════════════════════════════════════════════════════════

describe('D-17A/R2: firing everyone no longer disengages the D-12 economy', () => {
  // One shared post-cliff fixture: a founded studio with an ACTIVE theatrical run whose
  // entire roster has been released. Pre-D-17A this state read as "not engaged".
  function postCliff(seed: string): { before: GameState; bare: GameState } {
    const atRelease = advance(greenlightOneFilm(foundStudio(seed)), TUNING.PRODUCTION_TICKS + 1)
    expect(atRelease.theatricalRuns.some((r) => r.status === 'active')).toBe(true)
    const bare = fireEveryone(atRelease)
    expect(bare.contracts.length).toBe(0)
    return { before: atRelease, bare }
  }

  it('the OLD derived predicate goes false — the NEW persisted fact does not', () => {
    const { bare } = postCliff('d17-cliff-1')
    // employmentEngaged still answers "is there an employment relationship RIGHT NOW?"
    // (unchanged — the roster surfaces need it). It is no longer the regime.
    expect(employmentEngaged(bare)).toBe(false)
    expect(economyEngaged(bare)).toBe(true)
    expect(bare.economyEngagedEver).toBe(true)
  })

  it('overhead is STILL charged after the last contract is gone', () => {
    const { bare } = postCliff('d17-cliff-2')
    const stepped = tick(bare)
    const added: LedgerEntry[] = stepped.ledger.slice(bare.ledger.length)
    const overhead = added.filter((e) => e.kind === 'overhead')
    expect(overhead.length).toBe(1)
    // zero employees ⇒ the base charge only (OVERHEAD_PER_EMPLOYEE × 0)
    expect(overhead[0]!.amount).toBe(-TUNING.OVERHEAD_BASE)
  })

  it('tick step 3.5 STILL pays the active run its weekly Studio Revenue', () => {
    const { bare } = postCliff('d17-cliff-3')
    const stepped = tick(bare)
    const added: LedgerEntry[] = stepped.ledger.slice(bare.ledger.length)
    const revenue = added.filter((e) => e.kind === 'studioRevenue')
    expect(revenue.length).toBeGreaterThan(0)
    expect(revenue[0]!.amount).toBeGreaterThan(0)
    // and NOT the legacy single-lump credit the disengaged path would have used
    expect(added.some((e) => e.kind === 'boxOffice')).toBe(false)
  })

  it('the run keeps paying week after week — no lump, no silent stop', () => {
    const { bare } = postCliff('d17-cliff-4')
    const paidPerWeek: number[] = []
    let cur = bare
    for (let i = 0; i < TUNING.THEATRICAL_WEEKS; i++) {
      const next = tick(cur)
      paidPerWeek.push(next.ledger.slice(cur.ledger.length).filter((e) => e.kind === 'studioRevenue').length)
      cur = next
    }
    expect(paidPerWeek.filter((n) => n > 0).length).toBeGreaterThan(1)
    expect(cur.ledger.some((e) => e.kind === 'boxOffice')).toBe(false)
  })

  it('the solvency gate is STILL enforced post-cliff (voluntary commitments)', () => {
    const { bare } = postCliff('d17-cliff-5')
    // NOTE on what this does and does not prove: `canAfford` and the ops-phase
    // signContract gate are regime-INDEPENDENT (they never consulted economyEngaged), so
    // this documents that the gate survives the cliff — it does not by itself discriminate
    // old code from new. The regime-discriminating proof is the greenlight test below: the
    // greenlight's OWN solvency gate lives inside the engaged branch, and post-cliff that
    // branch is now reached (D-11.12 fires first, so the gate line itself is unreachable
    // with a released roster — by construction, not by omission).
    expect(canAfford(bare, bare.studio.cash).ok).toBe(true) // exactly to zero is legal
    expect(canAfford(bare, bare.studio.cash + 1).ok).toBe(false)
    // And a real voluntary action reachable from this state is rejected by it. (A poor
    // studio: cash is a chosen INPUT, per the D-12 suite's convention.)
    const broke: GameState = { ...bare, studio: { ...bare.studio, cash: 1 } }
    const signable = broke.freeAgents[0]!
    expect(() => applyActions(broke, [{ kind: 'signContract', talentId: signable, termWeeks: 104 }])).toThrow(
      /solvency gate/i,
    )
  })

  it('a greenlight post-cliff routes through the ENGAGED branch, not the D-1 fallback', () => {
    const { bare } = postCliff('d17-cliff-6')
    const concept = bare.concepts[0]!
    const actors = bare.talent.filter((t) => t.role === 'actor')
    // D-11.12 (every assignment must be contracted or an available freelancer) exists ONLY
    // on the engaged branch. Pre-D-17A this same greenlight was ACCEPTED on the D-1 path —
    // that acceptance WAS the exploit. Its rejection here is the closure.
    expect(() =>
      applyActions(bare, [
        {
          kind: 'greenlight',
          production: {
            conceptId: concept.id,
            shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
            promise: {
              genre: concept.genre,
              intendedSegments: ['adult'],
              ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] },
            },
            writerId: bare.talent.find((t) => t.role === 'writer')!.id,
            directorId: bare.talent.find((t) => t.role === 'director')!.id,
            cast: { lead: actors[0]!.id, antagonist: actors[1]!.id, support: actors[2]!.id },
            craftIds: [bare.talent.find((t) => t.role === 'craft')!.id],
            budget: { negative: concept.baseNegativeCost, marketing: 100_000 },
          },
        },
      ]),
    ).toThrow(/D-11\.12/)
    // no D-1 "+ salaries" production entry was ever written
    expect(bare.ledger.some((e) => e.kind === 'production' && e.note.includes('salaries'))).toBe(false)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// PART 3 — V5 → V6 reconstruction, per save class (§3 migration proof)
// ══════════════════════════════════════════════════════════════════════════════

describe('D-17A/R2: convertV5ToV6 reconstructs the fact correctly for every save class', () => {
  it('never-engaged headless (M0A) → false', () => {
    const v5 = makeSaveV5(toV5(generateWorld('d17-mig-headless')))
    expect(convertV5ToV6(v5).state.economyEngagedEver).toBe(false)
  })

  it('never-engaged headless WITH releases → false (production/boxOffice are excluded)', () => {
    const s = headlessRun('d17-mig-headless-films', 30)
    expect(s.ledger.some((e) => e.kind === 'production')).toBe(true)
    expect(s.ledger.some((e) => e.kind === 'boxOffice')).toBe(true)
    expect(s.ledger.some((e) => ENGAGED_KINDS.includes(e.kind))).toBe(false)
    expect(convertV5ToV6(makeSaveV5(toV5(s))).state.economyEngagedEver).toBe(false)
  })

  it('legacy V3-migrated never-engaged (economyModelVersion 0 runs) → false', () => {
    const s = headlessRun('d17-mig-legacy-v3', 30)
    expect(s.studio.releasedFilms.length).toBeGreaterThan(0)
    const v6 = migrateToV6(makeSaveV3(toV3(s)))
    // the V3→V4 step recorded each released film as a legacyCompleted run at model 0
    expect(v6.state.theatricalRuns.length).toBe(s.studio.releasedFilms.length)
    expect(v6.state.theatricalRuns.every((r) => r.economyModelVersion === 0)).toBe(true)
    // …which is NOT evidence of engagement
    expect(v6.state.economyEngagedEver).toBe(false)
  })

  it('mid-founding (founding open, no contracts, empty ledger) → true', () => {
    const f = beginFounding(generateWorld('d17-mig-founding'))
    expect(f.contracts.length).toBe(0)
    expect(f.ledger.length).toBe(0)
    expect(convertV5ToV6(makeSaveV5(toV5(f))).state.economyEngagedEver).toBe(true)
  })

  it('an engaged (founded, contracted) studio → true', () => {
    const s = foundStudio('d17-mig-engaged')
    expect(s.contracts.length).toBeGreaterThan(0)
    expect(convertV5ToV6(makeSaveV5(toV5(s))).state.economyEngagedEver).toBe(true)
  })

  it('a D-12 theatrical run at economyModelVersion ≥ 1 → true', () => {
    const s = advance(greenlightOneFilm(foundStudio('d17-mig-run')), TUNING.PRODUCTION_TICKS + 1)
    expect(s.theatricalRuns.some((r) => r.economyModelVersion >= 1)).toBe(true)
    // isolate the run clause: no founding, no contracts, no engaged ledger kinds
    const runOnly: GameState = {
      ...s,
      founding: null,
      contracts: [],
      ledger: s.ledger.filter((e) => !ENGAGED_KINDS.includes(e.kind)),
    }
    expect(convertV5ToV6(makeSaveV5(toV5(runOnly))).state.economyEngagedEver).toBe(true)
  })

  it('post-cliff (engaged ledger kinds, ZERO contracts, no runs) → true', () => {
    const bare = fireEveryone(foundStudio('d17-mig-postcliff'))
    expect(bare.contracts.length).toBe(0)
    // isolate the ledger clause: no founding, no contracts, no theatrical runs
    const ledgerOnly: GameState = { ...bare, founding: null, contracts: [], theatricalRuns: [] }
    expect(ledgerOnly.ledger.some((e) => ENGAGED_KINDS.includes(e.kind))).toBe(true)
    expect(convertV5ToV6(makeSaveV5(toV5(ledgerOnly))).state.economyEngagedEver).toBe(true)
  })

  it('each engaged-only ledger kind independently proves engagement', () => {
    const base = toV5(generateWorld('d17-mig-kinds'))
    for (const kind of ENGAGED_KINDS) {
      const entry = { week: 0, kind, amount: -1, note: `${kind} probe` } as LedgerEntry
      const withKind: GameStateV5 = { ...base, ledger: [entry] }
      expect(convertV5ToV6(makeSaveV5(withKind)).state.economyEngagedEver).toBe(true)
    }
    // …and the two excluded kinds do NOT
    for (const kind of ['production', 'boxOffice']) {
      const entry = { week: 0, kind, amount: -1, note: `${kind} probe` } as LedgerEntry
      const withKind: GameStateV5 = { ...base, ledger: [entry] }
      expect(convertV5ToV6(makeSaveV5(withKind)).state.economyEngagedEver).toBe(false)
    }
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// PART 4 — converter hygiene (§4.E: deterministic, idempotent, rngState, no mutation)
// ══════════════════════════════════════════════════════════════════════════════

describe('D-17A/R2: convertV5ToV6 is deterministic, idempotent, and non-mutating', () => {
  const engaged = advance(greenlightOneFilm(foundStudio('d17-hygiene')), TUNING.PRODUCTION_TICKS + 2)

  it('two independent conversions are byte-identical', () => {
    const a = convertV5ToV6(makeSaveV5(toV5(engaged)))
    const b = convertV5ToV6(makeSaveV5(toV5(engaged)))
    expect(exportSave(a)).toBe(exportSave(b))
  })

  it('rngState is carried through UNCHANGED (a resumed run replays identically)', () => {
    const v5 = makeSaveV5(toV5(engaged))
    expect(convertV5ToV6(v5).state.rngState).toBe(v5.state.rngState)
  })

  it('the V5 input is NEVER mutated', () => {
    const v5 = makeSaveV5(toV5(engaged))
    const before = stableStringify(v5)
    convertV5ToV6(v5)
    expect(stableStringify(v5)).toBe(before)
    expect('economyEngagedEver' in (v5.state as object)).toBe(false)
    // D-17B/E4 (M8): the fixture must NOT already carry the D-17B field either.
    expect('publicity' in (v5.state as object)).toBe(false)
  })

  it('migrateToV6 passes a V6 through unchanged and is idempotent', () => {
    const v6 = convertV5ToV6(makeSaveV5(toV5(engaged)))
    expect(migrateToV6(v6)).toBe(v6)
    expect(exportSave(migrateToV6(migrateToV6(v6)))).toBe(exportSave(v6))
  })

  it('a migrated save round-trips through export/import byte-identically', () => {
    const v6 = convertV5ToV6(makeSaveV5(toV5(engaged)))
    const json = exportSave(v6)
    expect(exportSave(migrateToV6(JSON.parse(json)))).toBe(json)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// PART 5 — validateSaveV6's ONE field check, and the invariant the predicate leans on
// ══════════════════════════════════════════════════════════════════════════════

describe('D-17A/R2: a V6 save without an explicit engagement fact is rejected LOUDLY', () => {
  it('a missing economyEngagedEver throws (it would silently disengage a real studio)', () => {
    const good = makeSave(foundStudio('d17-validate'))
    const stripped = { ...good, saveVersion: 6, state: toV5(good.state) }
    expect(() => validateSaveV6(stripped)).toThrow(/economyEngagedEver/)
  })

  it('a non-boolean economyEngagedEver throws', () => {
    const good = makeSave(foundStudio('d17-validate-2'))
    const bad = { ...good, saveVersion: 6, state: { ...toV6(good.state), economyEngagedEver: 'yes' } }
    expect(() => validateSaveV6(bad)).toThrow(/economyEngagedEver/)
  })

  it('new games save as V9 and carry the fact', () => {
    // Script Projects V1: makeSave writes V9; the R2 fact is still carried.
    const save = makeSave(foundStudio('d17-newgame'))
    expect(save.saveVersion).toBe(9)
    expect(save.state.economyEngagedEver).toBe(true)
  })
})

describe('D-17A: TUNING.ECONOMY_MODEL_VERSION ≥ 1 — the theatricalRun clause depends on it', () => {
  it('a D-12 run is stamped ≥ 1, so model 0 reliably means "migrated legacy"', () => {
    // If ECONOMY_MODEL_VERSION were ever dropped to 0, every live run would become
    // indistinguishable from a migrated V3 legacy run and convertV5ToV6 would under-report.
    expect(TUNING.ECONOMY_MODEL_VERSION).toBeGreaterThanOrEqual(1)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// PART 6 — T11 / R3: releaseTalent is intentionally ungated
// ══════════════════════════════════════════════════════════════════════════════

describe('T11 / R3 — releaseTalent is intentionally ungated', () => {
  // docs/D-12-economy-contract.md §11, R3 amendment: termination is the ONE immediate
  // debit that REMOVES a future obligation. Gating it would trap a studio that cannot
  // afford to shed the payroll that is making it poor — with no loans and no bankruptcy
  // to break the deadlock. This test is the guard against a future "consistency" cleanup
  // quietly adding canAfford() to applyReleaseTalent.
  it('a studio with cash just above zero CAN release, and goes negative doing it', () => {
    const founded = foundStudio('d17-t11-ungated')
    const contract = founded.contracts[0]!
    const week = founded.market.tick
    const cost = terminationCost(contract, week)
    expect(cost).toBeGreaterThan(0)

    // Cash just above zero — a chosen INPUT (the D-12 suite's convention).
    const poor: GameState = { ...founded, studio: { ...founded.studio, cash: 1 } }
    // The gate WOULD block this, if the gate applied. It does not.
    const wouldBlock = canAfford(poor, cost)
    expect(wouldBlock.ok).toBe(false)

    const after = applyActions(poor, [{ kind: 'releaseTalent', talentId: contract.talentId }])

    // the action SUCCEEDED
    expect(after.contracts.some((c) => c.talentId === contract.talentId)).toBe(false)
    expect(after.freeAgents).toContain(contract.talentId)
    // …and drove cash below zero, deliberately
    expect(after.studio.cash).toBe(1 - cost)
    expect(after.studio.cash).toBeLessThan(0)

    // the termination is recorded in full (reconciliation invariant intact)
    const entry = after.ledger[after.ledger.length - 1]!
    expect(entry.kind).toBe('termination')
    expect(entry.amount).toBe(-cost)
    expect(entry.talentId).toBe(contract.talentId)
    expect(entry.week).toBe(week)
  })

  it('releasing removes the future obligation — weekly payroll drops', () => {
    const founded = foundStudio('d17-t11-obligation')
    const contract = founded.contracts[0]!
    const poor: GameState = { ...founded, studio: { ...founded.studio, cash: 1 } }
    const after = applyActions(poor, [{ kind: 'releaseTalent', talentId: contract.talentId }])
    expect(after.contracts.length).toBe(poor.contracts.length - 1)
  })

  it('the other voluntary commitments are STILL gated (the exception is narrow)', () => {
    const founded = foundStudio('d17-t11-narrow')
    const poor: GameState = { ...founded, studio: { ...founded.studio, cash: 1 } }
    // signContract is the sibling voluntary commitment: it ADDS obligation, so it stays gated.
    const signable = hiringMarketIds(poor).find((id) => !isContracted(poor, id))
    expect(signable).toBeDefined()
    expect(() => applyActions(poor, [{ kind: 'signContract', talentId: signable!, termWeeks: 104 }])).toThrow(
      /solvency gate/i,
    )
    expect(canAfford(poor, 2).ok).toBe(false)
  })
})
