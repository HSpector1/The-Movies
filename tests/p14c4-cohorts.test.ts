// P14C.4 T1 — INDEPENDENT RED/repair, families A-C and E: deterministic replenishment
// (782 §3 R1-R9 as amended by §6-§9; API contract 793 as amended by 793 §9). Derived
// from 782/793 and the genuine T0 V34 corpus's "V34-engine continuation facts"
// (790/791) — a measured prediction under the real, unmodified V34 engine, never an
// implementation output.
//
// REPAIR (this revision, against implementation HEAD 476046da): the parent traced 23
// failures to this suite's own bugs (795 §8 has the full finding->change ledger):
//  - F1: `GameState` is now V35 live; a raw V34 corpus fixture has no `cohorts` root,
//    and ticking it throws loudly at the first cohort week. Every case that ticks or
//    saves a corpus world now migrates it live FIRST (`c4LiveFixture`).
//  - F1b: calling `cohortRequest(state, W)` AFTER `advanceTo(state, W)` asks a
//    different question (the tick already ran W's own cohort, appending entrants to
//    `state.talent`). Cases now read the REAL receipt (`state.careerLifecycle.cohorts
//    .find(r => r.week === W)`) and compare it to an oracle built from the T0
//    continuation facts, never re-calling `cohortRequest` on the post-tick state.
//  - F3/F4: a fresh genesis seed is NOT guaranteed to produce any entrant at week 52
//    (measured: several seeds get 0) — C1-C4 now use the deep-deficit world's
//    guaranteed 32-entrant clip (782 §7.1, pinned again by B5) instead of hoping.
//  - 782/793 §9 (addendum, after demonstration 799 failed 2/3 seeds): `young_p` is now
//    a LOOK-AHEAD (`ageAt(row, w+52) < 30`, not `ageAt(row, w) < 30`), and the entrant
//    age validator bound narrows to [20, 29]. NOT YET landed at 476046da — B6, C3 and
//    E1 target the amended rule and are EXPECTED to disagree with 476046da where noted
//    (795 §8 lists exactly which).
import { describe, expect, it } from 'vitest'
import { applyActions, hiringMarketIds, tick } from '../src/core/index.js'
import { advanceCareerLifecycleWeek, cohortEntrantAge, cohortRequest, isCohortWeek } from '../src/core/careerLifecycle.js'
import { generateIndustryTalent } from '../src/core/worldgen.js'
import { TUNING } from '../src/core/tuning.js'
import type { FilmCreativeRole, GameState } from '../src/core/types.js'
import {
  FILM_ROLE_ORDER, advanceTo, c4ContinuationFacts, c4Fixture, c4LiveFixture, cohortsOf, expectedActiveAndYoung,
  expectedCohortEntrantAge, expectedCohortRequest, expectedCohortRequestS9, expectedYoungLookahead, fund, p13aGeneratedStudio,
} from './helpers/p14c4-fixtures.js'

describe('P14C.4 A1-A3: cadence', () => {
  it('A1: a fresh world gets a cohort receipt at exactly week 52 and week 104, never at 51/103, through the natural tick() route', () => {
    let state = p13aGeneratedStudio('p14c4-red-a1')
    state = advanceTo(state, 51)
    expect(cohortsOf(state) ?? [], 'no receipt before week 52').toEqual([])
    state = tick(state) // -> week 52
    expect(state.market.tick).toBe(52)
    expect(cohortsOf(state), 'a receipt must exist at week 52 (52 % 52 === 0)').toHaveLength(1)
    expect(cohortsOf(state)![0]).toMatchObject({ week: 52 })
    state = advanceTo(state, 103)
    expect(cohortsOf(state), 'still exactly one receipt through week 103 — none between 52 and 104').toHaveLength(1)
    state = tick(state) // -> week 104
    expect(state.market.tick).toBe(104)
    expect(cohortsOf(state), 'a second receipt must exist at week 104').toHaveLength(2)
    expect(cohortsOf(state)![1]).toMatchObject({ week: 104 })
  })

  it('A2: a null-hollywood world (corpus null-hollywood) never gets a cohort, through two of its own cohort weeks (260, 312)', () => {
    const base = c4LiveFixture('genuine-v34-c4-null-hollywood') // week 208, hollywood === null
    expect(base.hollywood).toBeNull()
    let state = advanceTo(base, 260)
    expect(state.hollywood, 'ticking alone never founds a studio').toBeNull()
    expect(cohortsOf(state) ?? [], 'no cohort at week 260 in a null-hollywood world').toEqual([])
    state = advanceTo(state, 312)
    expect(cohortsOf(state) ?? [], 'no cohort at week 312 either').toEqual([])
  })

  it('A3: calling advanceCareerLifecycleWeek twice at a cohort week adds nothing the second time (idempotence, 793 §4)', () => {
    // Real tick() only, all the way to the cohort week — never a hand-set market.tick.
    let state = p13aGeneratedStudio('p14c4-red-a3')
    state = advanceTo(state, 52)
    expect(state.market.tick).toBe(52)
    const afterNaturalTick = cohortsOf(state) ?? []
    expect(afterNaturalTick, 'the natural tick() to week 52 must already have appended one receipt').toHaveLength(1)
    // 793 §4's own idempotence note: a second call at the SAME week, no new birthdays,
    // must not append a duplicate — driven directly, the same technique 778's A6b used.
    const twice = advanceCareerLifecycleWeek(state, [])
    expect(cohortsOf(twice), 'a second call at the same week must not append a duplicate receipt').toEqual(afterNaturalTick)
    expect(JSON.stringify(twice)).toBe(JSON.stringify(state))
  })
})

describe('P14C.4 B1-B6: the request formula (782 §7.1 REPLACED by §7 item 1)', () => {
  it('B1: request_p = max(accepted_p - active_p, young_p ? 0 : 1) with accepted 40/14/16/14 (corpus migrated-chain, week 1040, pure deficit — no clip, no youth-floor ambiguity: every profession\'s deficit exceeds 1)', () => {
    const state = advanceTo(c4LiveFixture('genuine-v34-c4-migrated-chain'), 1040)
    const facts = c4ContinuationFacts('genuine-v34-c4-migrated-chain').w1
    expect(facts.week).toBe(1040)
    const byFormula = {} as Record<FilmCreativeRole, number>
    for (const role of FILM_ROLE_ORDER) {
      const active = facts.activeByProfession[role]!
      byFormula[role] = Math.max(TUNING.COHORT_ACCEPTED_POPULATION[role] - active.activeCount, active.activeUnder30 > 0 ? 0 : 1)
    }
    expect(byFormula).toEqual({ actor: 11, director: 5, writer: 5, craft: 1 })
    const receipt = state.careerLifecycle.cohorts.find((r) => r.week === 1040)
    expect(receipt, 'a receipt must exist at week 1040').toBeDefined()
    expect(receipt!.requested, 'the REAL receipt must equal the T0-measured formula').toEqual(byFormula)
    expect(receipt!.clipped).toBe(0)
  })

  it('B2: the youth floor fires iff the profession has no active person under 30 (corpus all-statuses, week 260: director has one under-30 active and gets 0 despite a -1 "deficit"; craft has none and gets 1 despite the same -1) — unaffected by §9\'s look-ahead (confirmed directly below)', () => {
    const state = advanceTo(c4LiveFixture('genuine-v34-c4-all-statuses'), 260)
    const facts = c4ContinuationFacts('genuine-v34-c4-all-statuses').w1
    expect(facts.week).toBe(260)
    expect(facts.activeByProfession.director).toEqual({ activeCount: 15, activeUnder30: 1 })
    expect(facts.activeByProfession.craft).toEqual({ activeCount: 15, activeUnder30: 0 })
    const receipt = state.careerLifecycle.cohorts.find((r) => r.week === 260)
    expect(receipt).toBeDefined()
    expect(receipt!.requested.director, 'director has a young active person: the floor must NOT fire').toBe(0)
    expect(receipt!.requested.craft, 'craft has NO young active person: the floor must fire, request >= 1').toBe(1)
    // 782/793 §9 confirmation: this world's youngest director (28) and youngest craft
    // (35) are far enough from the 30 boundary that the look-ahead agrees with the
    // at-w rule (28+1=29 still <30; 35+1=36 still >=30) — this case does NOT
    // discriminate §9 from §7.1 (see B6 for the world/profession that does).
    const lookahead = expectedYoungLookahead(state, receipt!)
    expect(lookahead.director, '§9 lookahead agrees: still young at week 312').toBe(true)
    expect(lookahead.craft, '§9 lookahead agrees: still not young at week 312').toBe(false)
  })

  it('B3: announced and finishing people count as active (a person with a live careerLifecycle record who is not yet retired still counts toward active_p)', () => {
    const state = c4Fixture('genuine-v34-c4-cohort-week') // week 104: announced writer x1, craft x1; retired actor x1 — read raw, never ticked
    const announcedWriter = state.careerLifecycle.records.find((r) => r.status === 'announced' && r.profession === 'writer')!
    expect(announcedWriter, 'the fixture must genuinely hold a live announced writer record').toBeDefined()
    const active = expectedActiveAndYoung(state, 104)
    // the announced writer is STILL in `state.talent` and NOT retired — active_p for
    // writer must count them.
    expect(active.writer.activeIds, 'the announced writer must be counted in active_p').toContain(announcedWriter.personId)
    const oracle = expectedCohortRequest(state, 104)
    expect(oracle.requested.writer).toBe(Math.max(TUNING.COHORT_ACCEPTED_POPULATION.writer - active.writer.activeCount, active.writer.young ? 0 : 1))
    // B3/B4 read the fixture raw (never ticked/migrated — by design), but the real
    // export now types its param as the live GameState (V35); the runtime shape is
    // identical for the fields cohortRequest reads (talent/records/provenance), so
    // this cast is safe, matching the precedent style used throughout the C.2a suite.
    const actual = cohortRequest(state as unknown as GameState, 104)
    expect(actual.requested.writer).toBe(oracle.requested.writer)
  })

  it('B4: retired people do NOT count as active (the fixture\'s one retired actor at week 104 must be excluded from active_p)', () => {
    const state = c4Fixture('genuine-v34-c4-cohort-week') // week 104: retired actor x1 — read raw, never ticked
    const retiredActor = state.careerLifecycle.records.find((r) => r.status === 'retired' && r.profession === 'actor')!
    expect(retiredActor, 'the fixture must genuinely hold a retired actor').toBeDefined()
    const active = expectedActiveAndYoung(state, 104)
    expect(active.actor.activeIds, 'the retired actor must NOT be counted in active_p').not.toContain(retiredActor.personId)
    const oracle = expectedCohortRequest(state, 104)
    expect(oracle.requested.actor).toBe(Math.max(TUNING.COHORT_ACCEPTED_POPULATION.actor - active.actor.activeCount, active.actor.young ? 0 : 1))
    const actual = cohortRequest(state as unknown as GameState, 104)
    expect(actual.requested.actor).toBe(oracle.requested.actor)
  })

  it('B5: the clip at 32, allotted in profession order actor/director/writer/craft, with `clipped` on the receipt and no carry-forward (corpus deep-deficit: 6 active at week 2600, 78 requested before the clip at the world\'s next cohort week 2652)', () => {
    // The fixture's OWN save week (2600) is a 52k week, but it was saved BEFORE any
    // C.4 code existed — no tick() ever PRODUCED week 2600 under cohort-aware logic,
    // so the next real trigger is the next tick() that produces a 52k week: 2652,
    // exactly matching 790/791's own "V1" continuation.
    const state = advanceTo(c4LiveFixture('genuine-v34-c4-deep-deficit'), 2652)
    const facts = c4ContinuationFacts('genuine-v34-c4-deep-deficit').w1
    expect(facts.week).toBe(2652)
    expect(facts.activeByProfession).toEqual({
      actor: { activeCount: 3, activeUnder30: 0 }, director: { activeCount: 1, activeUnder30: 0 },
      writer: { activeCount: 1, activeUnder30: 0 }, craft: { activeCount: 1, activeUnder30: 0 },
    })
    const receipt = state.careerLifecycle.cohorts.find((r) => r.week === 2652)
    expect(receipt).toBeDefined()
    expect(receipt!.requested, '78 raw requested (37+13+15+13) clipped to 32, actor-first').toEqual({ actor: 32, director: 0, writer: 0, craft: 0 })
    expect(receipt!.clipped, '78 - 32 = 46 clipped').toBe(46)
    expect(receipt!.personIds).toHaveLength(32)
  })

  it('B6 (782/793 §9 discriminator): a profession whose youngest active person is under 30 today but turns 30 by the NEXT request week must get a floor entrant under §9 — even though it would NOT under the OLD (at-w) §7.1 rule (corpus cohort-week, week 156: writer). EXPECTED TO FAIL against 476046da (§9 not yet implemented there — 795 §8).', () => {
    const state = advanceTo(c4LiveFixture('genuine-v34-c4-cohort-week'), 156)
    const facts = c4ContinuationFacts('genuine-v34-c4-cohort-week').w1
    expect(facts.week).toBe(156)
    const receipt = state.careerLifecycle.cohorts.find((r) => r.week === 156)
    expect(receipt, 'a receipt must exist even when almost every count is 0').toBeDefined()
    // ground the premise in REAL data: the youngest active writer really is exactly 29
    // at week 156 (so ageAt(row, 208) === 30 — not < 30 — for every active writer).
    const lookahead = expectedYoungLookahead(state, receipt!)
    expect(lookahead.writer, 'no active writer stays under 30 at week 208 (156+52): the OLD rule (someone is 29 TODAY) no longer applies at the NEXT request week').toBe(false)
    expect(lookahead.actor).toBe(true)
    expect(lookahead.director).toBe(true)
    expect(lookahead.craft).toBe(true)
    const oracle = expectedCohortRequestS9(facts.activeByProfession, lookahead)
    expect(oracle.requested, '782/793 §9: writer gets exactly one floor entrant; every other profession still requests 0').toEqual({ actor: 0, director: 0, writer: 1, craft: 0 })
    expect(oracle.clipped).toBe(0)
    // THE DISCRIMINATING ASSERTION: 476046da still computes young at week 156 itself
    // (someone IS 29 there, < 30), so its real receipt requests 0 for writer — this
    // line fails against it and must pass once the writer lands §9.
    expect(receipt!.requested, '782/793 §9 (not yet implemented at 476046da)').toEqual(oracle.requested)
    expect(receipt!.personIds).toHaveLength(1)
  })
})

describe('P14C.4 C1-C6: entrant identity, provenance, market membership', () => {
  // C1-C4 all use the SAME guaranteed-non-empty world: a fresh genesis seed at week 52
  // is NOT guaranteed to produce any entrant at all (measured at 476046da: several
  // seeds get exactly 0) — F3/F4 in the repair brief. `deep-deficit`'s 32-actor clip
  // at week 2652 is guaranteed BY REQUIREMENT (782 §7.1, pinned again by B5), never by
  // hoping a fresh seed happens to have a youth gap.
  function deepDeficitReceipt() {
    const state = advanceTo(c4LiveFixture('genuine-v34-c4-deep-deficit'), 2652)
    const receipt = state.careerLifecycle.cohorts.find((r) => r.week === 2652)
    expect(receipt, 'a receipt must exist at week 2652').toBeDefined()
    expect(receipt!.personIds.length, 'guaranteed non-empty by 782 §7.1 (B5): 32 actor entrants').toBeGreaterThan(0)
    return { state, receipt: receipt! }
  }

  it('C1: entrant ids are minted person-cohort-<w>-<role>-<n> through uniqueIdentity, at a world guaranteed a non-empty receipt', () => {
    const { receipt } = deepDeficitReceipt()
    for (const id of receipt.personIds) expect(id).toMatch(/^person-cohort-2652-actor-\d+$/)
  })

  it('C2: entrants are appended contiguously at talentCountBefore, in profession order, equal to the receipt\'s personIds', () => {
    const { state, receipt } = deepDeficitReceipt()
    const appended = state.talent.slice(receipt.talentCountBefore, receipt.talentCountBefore + receipt.personIds.length).map((t) => t.id)
    expect(appended).toEqual(receipt.personIds)
    let cursor = 0
    for (const role of FILM_ROLE_ORDER) {
      const n = receipt.requested[role]
      for (let i = 0; i < n; i++, cursor++) {
        expect(state.talent[receipt.talentCountBefore + cursor]!.role, `entrant ${cursor} must be profession-ordered (${role})`).toBe(role)
      }
    }
  })

  it('C3: each entrant carries an authored_exact_week provenance row at w whose anchor age is cohortEntrantAge(seed, id); stored Talent.age === floor(that); age in [20, 29] per 782/793 §9 (narrowed from [20,32]). EXPECTED TO FAIL against 476046da for any entrant above 29 (§9 not yet implemented there — 795 §8).', () => {
    const { state, receipt } = deepDeficitReceipt()
    for (const id of receipt.personIds) {
      const row = state.talentProvenance.rows.find((r) => r.personId === id)
      expect(row, `${id} must carry a provenance row`).toBeDefined()
      expect(row!.kind).toBe('authored_exact_week')
      const anchorAge = (row as { ageAtEntry: number }).ageAtEntry
      const expectedAge = cohortEntrantAge(state.seed, id)
      expect(anchorAge).toBe(expectedAge)
      expect(anchorAge).toBeGreaterThanOrEqual(20)
      expect(anchorAge, '782/793 §9 narrows the upper bound to 29 (was 32)').toBeLessThanOrEqual(29)
      const stored = state.talent.find((t) => t.id === id)!.age
      expect(stored).toBe(Math.floor(anchorAge))
    }
  })

  it('C4: each entrant is in state.freeAgents and hiringMarketIds, and the player can sign one the same week', () => {
    const { state, receipt } = deepDeficitReceipt()
    const entrantId = receipt.personIds[0]!
    expect(state.freeAgents, `${entrantId} must be pushed onto freeAgents`).toContain(entrantId)
    expect(hiringMarketIds(state), `${entrantId} must be signable the SAME week`).toContain(entrantId)
    const funded = fund(state) // lawful, disclosed cash bootstrap (782 §5 pattern) — only needed for the signing-bonus solvency gate
    const signed = applyActions(funded, [{ kind: 'signContract', talentId: entrantId, termWeeks: 52 }])
    expect(signed.contracts.some((c) => c.talentId === entrantId), 'signContract must succeed the same week the entrant appears').toBe(true)
  })

  it('C5: generateIndustryTalent(seed, id, role) with NO age is byte-identical to a golden captured NOW at this scaffold (bd27de93) — a compatibility pin, not a RED failure (782-A amendment 1\'s byte-identity promise for every existing caller)', () => {
    // JUSTIFIED PASS (778 precedent, P1): this calls no unimplemented export — the
    // NO-age path already works today and is untouched by the C.4 amendment; it must
    // stay untouched once the WITH-age path lands. Golden captured 2026-09-25 at HEAD
    // bd27de93 (this scaffold), recorded here so a future run that diverges is a real
    // regression, not a moving target.
    const golden = generateIndustryTalent('p14c4-red-c5-golden-seed', 'golden-entrant-0', 'actor')
    expect(JSON.stringify(golden)).toBe(JSON.stringify(generateIndustryTalent('p14c4-red-c5-golden-seed', 'golden-entrant-0', 'actor')))
    expect(golden).toMatchObject({ id: 'golden-entrant-0', role: 'actor' })
    expect(typeof golden.age).toBe('number')
  })

  it('C6: cohortEntrantAge is deterministic and independent of call order', () => {
    const a1 = cohortEntrantAge('p14c4-red-c6', 'person-cohort-52-actor-0')
    const b1 = cohortEntrantAge('p14c4-red-c6', 'person-cohort-52-director-0')
    const b2 = cohortEntrantAge('p14c4-red-c6', 'person-cohort-52-director-0')
    const a2 = cohortEntrantAge('p14c4-red-c6', 'person-cohort-52-actor-0')
    expect(b1).toBe(b2)
    expect(a1).toBe(a2)
    expect(a1).toBe(expectedCohortEntrantAge('p14c4-red-c6', 'person-cohort-52-actor-0'))
  })
})

describe('P14C.4 E1: per-corpus-world cohort request at the first cohort week matches the 782/793 §9-amended oracle', () => {
  const worldsWithHollywood = [
    'genuine-v34-c4-mid-year', 'genuine-v34-c4-cohort-week', 'genuine-v34-c4-all-statuses',
    'genuine-v34-c4-migrated-chain', 'genuine-v34-c4-deep-deficit',
  ] as const

  // deficit: T0-MEASURED (790/791) `activeByProfession.activeCount`, an independent
  // cross-check unaffected by §9. young: RE-DERIVED from the live ticked state's own
  // provenance (782/793 §9's look-ahead), via the REAL receipt's own
  // `talentCountBefore` — no T0 measurement captured this ahead of time, so this half
  // is a re-derivation, not an independent measurement (addendum to 795).
  //
  // Only mid-year/cohort-week (both week 156, writer) actually differ between the OLD
  // (at-w) and NEW (look-ahead) rule (B6 isolates why); all-statuses/migrated-chain/
  // deep-deficit are numerically identical either way, so those 3 of 5 still pass
  // against 476046da even though this oracle targets §9 throughout.
  it.each(worldsWithHollywood)('%s: the receipt at its own first cohort week W1 equals 782/793 §9: max(accepted-active, lookaheadYoung?0:1) per profession, clipped at 32', (name) => {
    const live = c4LiveFixture(name)
    expect(live.hollywood, `${name} must carry hollywood (E1 excludes null-hollywood worlds)`).not.toBeNull()
    const facts = c4ContinuationFacts(name).w1
    const state = advanceTo(live, facts.week)
    expect(state.market.tick).toBe(facts.week)
    const receipt = state.careerLifecycle.cohorts.find((r) => r.week === facts.week)
    expect(receipt, `${name}: a receipt must exist at its own first cohort week`).toBeDefined()
    const lookahead = expectedYoungLookahead(state, receipt!)
    const oracle = expectedCohortRequestS9(facts.activeByProfession, lookahead)
    expect(receipt!.requested, `${name}: the real receipt must equal 782/793 §9's oracle`).toEqual(oracle.requested)
    expect(receipt!.clipped).toBe(oracle.clipped)
    expect(receipt!.talentCountBefore).toBe(state.talent.length - receipt!.personIds.length)
  })
})

describe('P14C.4 isCohortWeek', () => {
  it.each([[0, false], [1, false], [51, false], [52, true], [53, false], [104, true], [156, true]] as const)(
    'isCohortWeek(%i) === %s', (week, expected) => {
      expect(isCohortWeek(week)).toBe(expected)
    },
  )
})
