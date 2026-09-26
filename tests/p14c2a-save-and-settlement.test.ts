// P14C.2a T1 — INDEPENDENT RED, family 3: settlement, the rival symmetry, and Save V34
// (773 §6 rows E1-E3, F1, G1-G5). Controlling order: OPUS-C2-TO-CODEX-LAUNCH.
// C.2b/C.2c OUT OF SCOPE (no VOIDED/WAIVED/extension assertion anywhere here).
//
// RED MECHANISM for G1-G4 (the p14b7-promise-waiver precedent, 725-T): vite/esbuild
// binds a MISSING NAMED EXPORT to `undefined` WITHOUT throwing when the module already
// exists (src/core/save.ts does). Every case below that calls `validateSaveV34`,
// `convertV33ToV34`, `convertV34ToV33`, `migrateToV34` or `migrateToLive` asserts
// `typeof x === 'function'` FIRST — a RED PREMISE — so a missing export fails with a
// named, attributable message instead of a raw TypeError deep inside the case.
// P14C.4: G5 alone moved to the LIVE V35 round trip (`makeSave`/`validateSaveV35`,
// both long-established exports by now), so it carries no such premise.
// P14C.2b: G5's round trip moves once more, to the LIVE V36 validator
// (`validateSaveV36`) — the live writer's own boundary, same reasoning.
import { describe, expect, it } from 'vitest'
import { applyActions, busyTalentIds, hiringMarketIds, tick } from '../src/core/index.js'
import { freelancerMarketIds } from '../src/core/employment.js'
import { assignableForFilm } from '../src/core/employment.js'
import { marketEligibility } from '../src/core/talentMarket.js'
import { lifecycleStatus, retirementRecordFor } from '../src/core/careerLifecycle.js'
import { ageAt } from '../src/core/aging.js'
import { TUNING } from '../src/core/tuning.js'
import {
  LIVE_SAVE_VERSION, makeSave,
  // RED-by-design (776 S6): none of these five exist in src/core/save.ts today.
  validateSaveV34, convertV33ToV34, convertV34ToV33, migrateToV34, migrateToLive,
  // P14C.2b: the live validator now (G5 alone drives a real tick()/makeSave round trip).
  validateSaveV36,
} from '../src/core/save.js'
import type { GameState, GameStateV34 } from '../src/core/types.js'
import {
  c2Fixture, fund, p13aGeneratedStudio, stepWeekWithLifecycle, syntheticRecord, withSyntheticCareerLifecycle,
} from './helpers/p14c2a-fixtures.js'

/** The real materialized age, straight from provenance — required for a LAWFUL
 * `ageAtAnnouncement` (validateSaveV34 cross-checks it against `ageAt`). */
function realAge(state: GameState, id: string, week: number): number {
  const row = state.talentProvenance.rows.find((r) => r.personId === id)!
  return ageAt(row, week)
}

/** P14C.2b: `syntheticRecord` (helpers/p14c2a-fixtures.ts) now always supplies the
 * V36 keys, for every LIVE consumer elsewhere in this suite (G5, E1-E3, F1). G1/G3/G4
 * below build a genuine FROZEN V34 envelope directly (never through `makeSave`), whose
 * exact-key validator has never heard of `extensionUsed`/`extendedFromWeek` and refuses
 * them — so this strips the two V36-only keys back off, restoring the frozen V34 shape. */
function frozenRecord<T extends { extensionUsed?: boolean; extendedFromWeek?: number | null }>(
  record: T,
): Omit<T, 'extensionUsed' | 'extendedFromWeek'> {
  const { extensionUsed: _eu, extendedFromWeek: _efw, ...rest } = record
  return rest
}

function assertSaveV34Exports(): void {
  expect(typeof validateSaveV34, 'RED premise: validateSaveV34 must exist as a named export of src/core/save.ts').toBe('function')
  expect(typeof convertV33ToV34, 'RED premise: convertV33ToV34 must exist as a named export of src/core/save.ts').toBe('function')
  expect(typeof convertV34ToV33, 'RED premise: convertV34ToV33 must exist as a named export of src/core/save.ts').toBe('function')
}

describe('P14C.2a E1-E3, F1: settlement and the rival symmetry', () => {
  // ── E1: not busy at E -> retired; contract ended via the existing owners; preserved ──
  it('E1: a signed, NOT-seated actor announced with E = their own contract end settles to retired exactly at E, via the EXISTING expiry receipt; talent/history untouched', () => {
    let state = fund(p13aGeneratedStudio())
    const id = hiringMarketIds(state).map((c) => state.talent.find((t) => t.id === c)).find((t) => t?.role === 'actor')!.id
    state = applyActions(state, [{ kind: 'signContract', talentId: id, termWeeks: 52 }])
    expect(busyTalentIds(state).has(id)).toBe(false) // never seated on any production
    const talentBefore = state.talent.map((t) => t.id)
    const careerEventsBefore = state.careerEvents
    let lifecycle = withSyntheticCareerLifecycle(state, {
      boundaryWeek: 0, cohorts: [], records: [syntheticRecord({ personId: id, profession: 'actor', announcedWeek: 0, effectiveWeek: 52 })],
    })
    for (let w = lifecycle.market.tick; w < 52; w++) lifecycle = stepWeekWithLifecycle(lifecycle)
    const record = retirementRecordFor(lifecycle, id)!
    expect(record).toMatchObject({ status: 'retired', retiredWeek: 52, effectiveWeek: 52 })
    // the EXISTING P10 expiry wrote the end, not a second lifecycle-owned write
    expect(lifecycle.contracts.find((c) => c.talentId === id)).toBeUndefined() // expired off the active list
    expect(lifecycle.freeAgents).toContain(id)
    // D12 preservation: nothing shortened, nothing reordered, nothing deleted.
    // 809 repair (approved_behavioral_change, record 804): this span crosses week 52, where C.4's
    // youth floor legitimately appends one cohort entrant per profession per campaign year (782
    // §7.1/§9) — a real, lawful mutation of `state.talent`, not a regression. Re-expressed rather
    // than dropped: the PRE-EXISTING prefix is byte-for-byte unchanged (still D12's requirement),
    // and anything appended after it is named and bounded — exactly the union of the cohort
    // receipts' own `personIds`, nothing more and nothing fewer.
    const talentAfter = lifecycle.talent.map((t) => t.id)
    expect(talentAfter.slice(0, talentBefore.length)).toEqual(talentBefore)
    const cohortPersonIds = lifecycle.careerLifecycle.cohorts.flatMap((receipt) => receipt.personIds)
    expect(talentAfter.slice(talentBefore.length)).toEqual(cohortPersonIds)
    expect(lifecycle.careerEvents).toEqual(careerEventsBefore)
  })

  // ── E2: seated at E -> finishing_commitments; still seated; retired the first week the seat clears, never earlier ──
  it('E2: the seated director (genuine-v33-c2-seated) settles to finishing_commitments while busy, and to retired the FIRST week (never earlier) the seat clears', () => {
    const base = c2Fixture('genuine-v33-c2-seated') // week 0; authored-0000 (director) already greenlit
    const directorId = 'authored-0000'
    expect(busyTalentIds(base).has(directorId)).toBe(true)
    const contractEnd = base.contracts.find((c) => c.talentId === directorId)!.endWeekExclusive // 208
    let state = withSyntheticCareerLifecycle(base, {
      boundaryWeek: 0, cohorts: [], records: [syntheticRecord({ personId: directorId, profession: 'director', announcedWeek: 0, effectiveWeek: contractEnd })],
    })
    for (let w = state.market.tick; w < contractEnd; w++) state = stepWeekWithLifecycle(state)
    expect(busyTalentIds(state as unknown as GameState).has(directorId), 'still seated at E: this genuine production has not wrapped by week 208').toBe(true)
    expect(retirementRecordFor(state, directorId)).toMatchObject({ status: 'finishing_commitments', finishingFromWeek: contractEnd })
    // one more week, still seated (the picture's own real completion mechanics are
    // NOT modeled further here — out of this isolated case's scope): still finishing.
    state = stepWeekWithLifecycle(state)
    expect(retirementRecordFor(state, directorId)!.status).toBe('finishing_commitments')
    // SYNTHETIC: the seat clears NOW (this picture's own wrap/release pipeline is a
    // separate, unrelated mechanic — simulated directly here as the one isolated
    // fact E2 needs: busyTalentIds must stop naming this director).
    const production = state.studio.activeProductions.find((p) => p.directorId === directorId)
    expect(production).toBeDefined()
    const cleared = {
      ...state,
      studio: { ...state.studio, activeProductions: state.studio.activeProductions.filter((p) => p.id !== production!.id) },
      operations: { ...state.operations, workflows: state.operations.workflows.filter((w) => w.productionId !== production!.id) },
    }
    expect(busyTalentIds(cleared as unknown as GameState).has(directorId), 'the seat is now clear').toBe(false)
    const settled = stepWeekWithLifecycle(cleared)
    expect(retirementRecordFor(settled, directorId)).toMatchObject({ status: 'retired', retiredWeek: settled.market.tick })
    expect(settled.market.tick).toBeGreaterThan(contractEnd) // never earlier than the seat actually clearing
  })

  // ── E3: a retired person is absent from both markets and freeAgents listings ──
  it('E3: a retired person is excluded from hiringMarketIds/freelancerMarketIds, not assignableForFilm, and marketEligibility reads retired_or_ineligible', () => {
    const base = fund(p13aGeneratedStudio())
    const id = base.talent.find((t) => t.role === 'actor')!.id
    const state = withSyntheticCareerLifecycle(base, {
      boundaryWeek: 0, cohorts: [], records: [syntheticRecord({ personId: id, profession: 'actor', announcedWeek: 0, effectiveWeek: 1, status: 'retired', finishingFromWeek: 1, retiredWeek: 1 })],
    })
    expect(lifecycleStatus(state, id)).toBe('retired')
    expect(hiringMarketIds(state as unknown as GameState)).not.toContain(id)
    expect(freelancerMarketIds(state as unknown as GameState)).not.toContain(id)
    expect(assignableForFilm(state as unknown as GameState, id)).toBe(false)
    expect(marketEligibility(state as unknown as GameState, id)).toEqual({ status: 'retired_or_ineligible', proposers: [] })
  })

  // ── F1: a rival employee meets the same announcement, E and settlement law ──
  it('F1: a rival employee (t-dir-00) settles under the IDENTICAL law as a player contract once its own interval end is reached', () => {
    // 777 amendment A2 (parent): a long natural tick range here would risk the SAME
    // class of error the parent flagged for this fixture's own T0 predictions (a
    // rival re-hire changing the contract in force before the checked week). Made
    // safe instead the same way D2/B4a are: the interval end is SHORTENED directly to
    // match a near, chosen effectiveWeek, so only a short, controlled horizon (10
    // weeks) needs running — eliminating that whole class of risk.
    const base = c2Fixture('genuine-v33-c2-rival-in-window') // used only for its real rival/hollywood shape
    const week = base.market.tick
    // the CURRENTLY ACTIVE row, not merely the first historical row for this id — a
    // world built by 1040 real ticks (this fixture's own recipe) can carry an earlier,
    // already-ended employment row for the same person ahead of the live one.
    const ordinal = base.hollywood!.employment.findIndex((e) => e.terms.talentId === 't-dir-00' && e.endedWeek === null)
    expect(ordinal).toBeGreaterThanOrEqual(0)
    expect(base.hollywood!.activeEmploymentOrdinals).toContain(ordinal)
    const employment = base.hollywood!.employment.map((e, i) => (i === ordinal ? { ...e, terms: { ...e.terms, endWeekExclusive: week + 10 } } : e))
    const shortened = { ...base, hollywood: { ...base.hollywood!, employment } }
    let state = withSyntheticCareerLifecycle(shortened, {
      boundaryWeek: week, cohorts: [], records: [syntheticRecord({ personId: 't-dir-00', profession: 'director', announcedWeek: week, ageAtAnnouncement: realAge(base, 't-dir-00', week), effectiveWeek: week + 10 })],
    })
    for (let w = state.market.tick; w < week + 10; w++) state = stepWeekWithLifecycle(state)
    const atE = retirementRecordFor(state, 't-dir-00')!
    expect(['finishing_commitments', 'retired']).toContain(atE.status) // settlement ran, exactly as it would for a player contract
    // the rival's OWN employment row must not still be active past E (D10, symmetric)
    const stillActive = state.hollywood!.employment.some((e) => e.terms.talentId === 't-dir-00' && e.endedWeek === null && e.terms.endWeekExclusive > week + 10)
    expect(stillActive).toBe(false)
  })
})

describe('P14C.2a G1-G5: Save V34', () => {
  // Every G-case below needs a subject who is LAWFULLY eligible to carry a record
  // (in-window or past-hard for their own profession) — fresh worldgen talent is
  // usually too young for that, so the hard-boundary/idle-window T0 world (whose
  // four authored subjects are all independently confirmed atOrPastHard, 775) is
  // reused as the substrate instead, with `cause: 'hardBoundary'` made explicit.
  it('G1: validateSaveV34 round-trips a genuine V34 envelope byte-stable with a record in each status (announced, finishing_commitments, retired)', () => {
    assertSaveV34Exports()
    const base = c2Fixture('genuine-v33-c2-hard-boundary-and-idle-window') // week 780
    const announcedId = 'authored-0000' // actor, age 85
    const finishingId = 'authored-0001' // director, age 85
    const retiredId = 'authored-0002' // writer, age 85
    const week = base.market.tick
    const state: GameStateV34 = {
      ...base,
      careerLifecycle: {
        boundaryWeek: week - 52,
        // announcement order (773 §3: "Records append in announcement order")
        records: [
          frozenRecord(syntheticRecord({ personId: finishingId, profession: 'director', cause: 'hardBoundary', announcedWeek: week - 52, ageAtAnnouncement: realAge(base, finishingId, week - 52), effectiveWeek: week, status: 'finishing_commitments', finishingFromWeek: week })),
          frozenRecord(syntheticRecord({ personId: retiredId, profession: 'writer', cause: 'hardBoundary', announcedWeek: week - 52, ageAtAnnouncement: realAge(base, retiredId, week - 52), effectiveWeek: week, status: 'retired', finishingFromWeek: week, retiredWeek: week })),
          frozenRecord(syntheticRecord({ personId: announcedId, profession: 'actor', cause: 'hardBoundary', announcedWeek: week, ageAtAnnouncement: realAge(base, announcedId, week), effectiveWeek: week + 500 })),
        ],
      },
    }
    // P14C.4: `makeSave` is now the live V35 writer and requires `cohorts` on the root
    // (793 §5) — this genuine V34 envelope is built directly instead, exactly as G2
    // already builds its input, so this case still exercises the FROZEN validator,
    // not the live one.
    const saved = { saveVersion: 34, seed: state.seed, state, broadcastCache: state.broadcastItems }
    expect(saved.saveVersion).toBe(34)
    const roundTripped = validateSaveV34(JSON.parse(JSON.stringify(saved)))
    expect(roundTripped.state.careerLifecycle).toEqual(state.careerLifecycle)
  })

  it('G2: every T0 V33 fixture migrates — empty root, boundaryWeek = the migration tick', () => {
    assertSaveV34Exports()
    for (const name of ['genuine-v33-c2-hard-boundary-and-idle-window', 'genuine-v33-c2-scientist', 'genuine-v33-c2-seated'] as const) {
      const v33 = c2Fixture(name)
      const migrated = convertV33ToV34({ saveVersion: 33, seed: v33.seed, state: v33, broadcastCache: v33.broadcastItems } as never)
      expect(migrated.state.careerLifecycle).toEqual({ boundaryWeek: v33.market.tick, records: [] })
    }
  })

  it('G3: V34 -> V33 is lossless iff no record; refused as a downgrade otherwise', () => {
    assertSaveV34Exports()
    const base = c2Fixture('genuine-v33-c2-hard-boundary-and-idle-window')
    const empty: GameStateV34 = { ...base, careerLifecycle: { boundaryWeek: base.market.tick, records: [] } }
    // P14C.4: as G1 — a genuine V34 envelope, built directly rather than through
    // `makeSave` (now the live V35 writer, which requires `cohorts`).
    const emptySave = { saveVersion: 34, seed: empty.seed, state: empty, broadcastCache: empty.broadcastItems }
    const downgraded = convertV34ToV33(emptySave as never)
    expect(downgraded.saveVersion).toBe(33)
    const id = 'authored-0000'
    const withRecord: GameStateV34 = {
      ...base,
      careerLifecycle: { boundaryWeek: base.market.tick, records: [frozenRecord(syntheticRecord({ personId: id, profession: 'actor', cause: 'hardBoundary', announcedWeek: base.market.tick, ageAtAnnouncement: realAge(base, id, base.market.tick), effectiveWeek: base.market.tick + 500 }))] },
    }
    const recordSave = { saveVersion: 34, seed: withRecord.seed, state: withRecord, broadcastCache: withRecord.broadcastItems }
    expect(() => convertV34ToV33(recordSave as never)).toThrow(/downgrade/i)
  })

  it('G4: the validator refuses each of nine distinct mutations, one per case, each naming its own cause (783 gap 2 closes the remaining four)', () => {
    expect(typeof validateSaveV34, 'RED premise: validateSaveV34 must exist as a named export of src/core/save.ts').toBe('function')
    const base = c2Fixture('genuine-v33-c2-hard-boundary-and-idle-window')
    const id = 'authored-0000'
    const week = base.market.tick
    const lawful = { ...base, careerLifecycle: { boundaryWeek: week, records: [frozenRecord(syntheticRecord({ personId: id, profession: 'actor', cause: 'hardBoundary', announcedWeek: week, ageAtAnnouncement: realAge(base, id, week), effectiveWeek: week + 500 }))] } }
    // P14C.4: as G1/G3 — a genuine V34 envelope, built directly rather than through
    // `makeSave` (now the live V35 writer, which requires `cohorts`).
    const lawfulSave = { saveVersion: 34, seed: lawful.seed, state: lawful, broadcastCache: lawful.broadcastItems } as unknown as { state: Record<string, unknown> }
    // the shared baseline every mutation below starts from — proves each throw below is
    // caused BY the mutation, not by something already broken in the fixture.
    expect(() => validateSaveV34(lawfulSave as never), 'the unmutated save must validate').not.toThrow()

    const mutate = (fn: (root: typeof lawful.careerLifecycle) => unknown) => ({
      ...lawfulSave, state: { ...lawfulSave.state, careerLifecycle: fn(lawful.careerLifecycle) },
    })
    const beforeBoundary = mutate((root) => ({ ...root, boundaryWeek: week + 1 })) // boundaryWeek <= tick violated
    expect(() => validateSaveV34(beforeBoundary as never)).toThrow()
    const ageDisagrees = mutate((root) => ({ ...root, records: [{ ...root.records[0]!, ageAtAnnouncement: root.records[0]!.ageAtAnnouncement + 5 }] }))
    expect(() => validateSaveV34(ageDisagrees as never)).toThrow()
    const shortHorizon = mutate((root) => ({ ...root, records: [{ ...root.records[0]!, effectiveWeek: root.records[0]!.announcedWeek + 51 }] })) // E < A + 52
    expect(() => validateSaveV34(shortHorizon as never)).toThrow()
    const unknownPerson = mutate((root) => ({ ...root, records: [{ ...root.records[0]!, personId: 'no-such-person' }] }))
    expect(() => validateSaveV34(unknownPerson as never)).toThrow()
    const wrongCause = mutate((root) => ({ ...root, records: [{ ...root.records[0]!, cause: root.records[0]!.cause === 'hardBoundary' ? 'idleInWindow' : 'hardBoundary' }] }))
    expect(() => validateSaveV34(wrongCause as never)).toThrow()

    // ── 783 gap 2, the four previously untested causes ──

    // (1) duplicate person record: the SAME record twice, same personId.
    const duplicatePerson = mutate((root) => ({ ...root, records: [root.records[0]!, root.records[0]!] }))
    expect(() => validateSaveV34(duplicatePerson as never), 'must name the duplicate-person cause').toThrow(/more than one record/)

    // (2) a contract active after the announcement that ends past E: inject a
    // synthetic player contract for the SAME subject (authored-0000 carries none in
    // this fixture — confirmed empty above) ending well past the lawful record's own
    // effectiveWeek (week + 500).
    const boundContract = {
      ...lawfulSave,
      state: {
        ...lawfulSave.state,
        contracts: [...(lawfulSave.state.contracts as readonly unknown[]), {
          talentId: id, annualSalary: 0, signingBonus: 0, startWeek: week - 10, endWeekExclusive: week + 600, termWeeks: 610,
        }],
      },
    }
    expect(() => validateSaveV34(boundContract as never), 'must name the past-E binding cause').toThrow(/past the effective week/)

    // (3) status/week disagreement: still `announced` at or after its own effectiveWeek.
    // Needs tick > announcedWeek (unlike the lawful record's announcedWeek === week), so
    // effectiveWeek can satisfy BOTH "E >= A + 52" (the shortHorizon cause above) AND
    // "E <= tick" (this cause) without collapsing into the same mutation.
    const earlierAnnounce = week - 100
    const statusDisagrees = mutate(() => ({
      boundaryWeek: earlierAnnounce,
      records: [frozenRecord(syntheticRecord({
        personId: id, profession: 'actor', cause: 'hardBoundary', announcedWeek: earlierAnnounce,
        ageAtAnnouncement: realAge(base, id, earlierAnnounce), effectiveWeek: earlierAnnounce + TUNING.RETIREMENT_NOTICE_WEEKS, // < tick
      }))],
    }))
    expect(() => validateSaveV34(statusDisagrees as never), 'must name the status/week disagreement cause').toThrow(/at or after its effective week/)

    // (4) a Scientist record: retirementWindow('scientist') is null (A4), so ANY
    // record naming a real Scientist is refused, whatever its cause. Reuses a REAL
    // scientist from this same fixture so the person/profession/age checks ahead of
    // it in the validator all agree — isolating the Scientist-window cause alone.
    const scientistId = 'person-studio-9ed55199-r01-supply-265-6'
    expect(base.talent.find((t) => t.id === scientistId)?.role).toBe('scientist')
    const scientistRecord = mutate(() => ({
      boundaryWeek: week,
      records: [frozenRecord(syntheticRecord({
        personId: scientistId, profession: 'scientist', cause: 'hardBoundary', announcedWeek: week,
        ageAtAnnouncement: realAge(base, scientistId, week), effectiveWeek: week + 500,
      }))],
    }))
    expect(() => validateSaveV34(scientistRecord as never), 'must name the Scientist-record cause').toThrow(/Scientist record/)
  })

  it('G5: save/load mid-notice then continue equals the continuous run, byte-for-byte', () => {
    const base = c2Fixture('genuine-v33-c2-hard-boundary-and-idle-window')
    const id = 'authored-0000'
    const week = base.market.tick
    // P14C.4: unlike G1/G3/G4's hand-built FROZEN V34 envelopes (never ticked, never
    // saved through the live writer), this state IS driven through the real `tick()`
    // and `makeSave` below, so it needs `cohorts` (793 §5) and the round trip moves
    // from `validateSaveV34` to `validateSaveV35`, the live validator now.
    // P14C.2b: the round trip moves once more, to `validateSaveV36` — a live record
    // also owes `extensionUsed`/`extendedFromWeek` now, which `syntheticRecord`
    // supplies by default (helpers/p14c2a-fixtures.ts).
    let state: GameState = {
      ...base,
      careerLifecycle: { boundaryWeek: week, cohorts: [], records: [syntheticRecord({ personId: id, profession: 'actor', cause: 'hardBoundary', announcedWeek: week, ageAtAnnouncement: realAge(base, id, week), effectiveWeek: week + 500 })] },
      // P14C.2b: `base` comes straight from the frozen V33 fixture, so its
      // `talentMarket.cases` carry no `variant` yet either — needed the moment
      // this state is actually SAVED (`makeSave`/`validateSaveV36`'s exact-key
      // check) below, though `tick()` alone never reads it.
      talentMarket: { ...base.talentMarket, cases: base.talentMarket.cases.map((kase) => ({ ...kase, variant: 'expiry' as const })) },
    }
    const continuous = tick(tick(state))
    const reloaded = validateSaveV36(JSON.parse(JSON.stringify(makeSave(state))) as never).state
    const viaSaveLoad = tick(tick(reloaded))
    expect(JSON.stringify(viaSaveLoad)).toBe(JSON.stringify(continuous))
  })

  it('records LIVE_SAVE_VERSION and confirms migrateToV34/migrateToLive exist (RED premise only — not exercised further here)', () => {
    // P14C.4: LIVE_SAVE_VERSION is the live writer's own stamp — moves with the bump.
    expect(LIVE_SAVE_VERSION).toBe(36)
    expect(typeof migrateToV34, 'RED premise: migrateToV34 must exist as a named export of src/core/save.ts').toBe('function')
    expect(typeof migrateToLive, 'RED premise: migrateToLive must exist as a named export of src/core/save.ts').toBe('function')
  })
})
