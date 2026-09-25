// P14C.2a T1 — INDEPENDENT RED, family 2: the CONSUMERS of the retirement predicate
// (773 §6 rows B1-B5, C1-C3, D1-D2, W1, P1) plus the parent's mid-task Amendment A1
// (777 §7: hiringMarketIds post-filter + signContract/renewContract token priority).
// Controlling order: OPUS-C2-TO-CODEX-LAUNCH. C.2b/C.2c remain OUT OF SCOPE.
//
// Every retirement FACT here is a LABELED SYNTHETIC overlay (`withSyntheticCareerLifecycle`)
// on a REAL engine state, since no natural route can yet produce one (the scaffold has
// not wired the intent step into `tick()`). The CONSUMER under test — `applyActions`,
// `submitProposal`, `marketEligibility`, `advanceTalentMarketWeek`, `hiringMarketIds`,
// `decide()` via real `tick()` — always runs for real, never mocked or reimplemented.
import { describe, expect, it } from 'vitest'
import { applyActions, freelancerMarketIds, hiringMarketIds, tick } from '../src/core/index.js'
import { caseForTalent, currentProposals, marketEligibility, submitProposal, advanceTalentMarketWeek } from '../src/core/talentMarket.js'
import { lifecycleStatus } from '../src/core/careerLifecycle.js'
import { TUNING } from '../src/core/tuning.js'
import type { CastSlot, GameState, SegmentId } from '../src/core/types.js'
import {
  advanceTo, c2Fixture, fund, p13aGeneratedStudio, player, prependSyntheticCandidate, syntheticRecord, withSyntheticCareerLifecycle,
} from './helpers/p14c2a-fixtures.js'

const snapshot = (state: GameState): string => JSON.stringify(state)

/** Ticks forward, if needed, until a candidate of `role` rotates into the hiring
 * market (the accepted p14b2-fixtures retry-loop pattern — the deterministic
 * epoch sample does not always carry every role in week 0's draw). */
function findSignable(state: GameState, role: 'actor' | 'writer' | 'director' | 'craft'): { state: GameState; id: string } {
  for (let i = 0; i < 60; i++) {
    const id = hiringMarketIds(state).map((c) => state.talent.find((t) => t.id === c)).find((t) => t?.role === role)?.id
    if (id !== undefined) return { state, id }
    state = tick(state)
  }
  throw new Error(`P14C.2a fixture: no signable ${role}`)
}

/** As `findSignable`, but from the FREELANCER rotation — greenlight's D-11.12 gate
 * (productionAdmission.ts) accepts an engaged (non-writer) seat only if the person is
 * studio-contracted OR in THIS list; `hiringMarketIds` alone is not sufficient. */
function findFreelancer(state: GameState, role: 'actor' | 'director' | 'craft'): { state: GameState; id: string } {
  for (let i = 0; i < 60; i++) {
    const id = freelancerMarketIds(state).map((c) => state.talent.find((t) => t.id === c)).find((t) => t?.role === role)?.id
    if (id !== undefined) return { state, id }
    state = tick(state)
  }
  throw new Error(`P14C.2a fixture: no freelance ${role}`)
}

/** Signs the first available candidate of `role` for `termWeeks` (a real `signContract`,
 * the same natural route every other core suite uses). */
function sign(state: GameState, role: 'actor' | 'writer' | 'director' | 'craft', termWeeks = 208): { state: GameState; id: string } {
  const found = findSignable(state, role)
  return { state: applyActions(found.state, [{ kind: 'signContract', talentId: found.id, termWeeks }]), id: found.id }
}

describe('P14C.2a B1-B5, C1-C3, D1-D2: retirement consumers (SYNTHETIC record, real consumer)', () => {
  // ── B1: renewContract refused past E, typed, no mutation; allowed ending exactly at E ──
  it('B1: renewContract on an announced person — refused past E with retirementAnnounced, byte-identical state; allowed ending exactly at E', () => {
    let state = fund(p13aGeneratedStudio())
    const actor = sign(state, 'actor', 52)
    // Reach the renewal window (52-12=40) by SETTING the clock directly rather than
    // real-ticking through it: 40 real ticks would also run the market's OWN existing
    // discovery step for this contract and open an ordinary P14A case, which redirects
    // renewContract for an unrelated, pre-existing reason (case-aware admission) — a
    // confound this isolated case does not want. The contract law under test
    // (`contractEndRefusal`) reads only `state.market.tick`, so this is a lawful,
    // narrowly-scoped simplification, not a change to the renewal-window math itself.
    state = { ...actor.state, market: { ...actor.state.market, tick: 40 } }
    const announced = withSyntheticCareerLifecycle(state, {
      boundaryWeek: 0, records: [syntheticRecord({ personId: actor.id, profession: 'actor', announcedWeek: 0, effectiveWeek: 150 })],
    })
    const before = snapshot(announced)
    expect(() => applyActions(announced, [{ kind: 'renewContract', talentId: actor.id, termWeeks: 208 }])).toThrow(/retirementAnnounced/)
    expect(snapshot(announced)).toBe(before) // refusal never mutates the input
    const renewed = applyActions(announced, [{ kind: 'renewContract', talentId: actor.id, termWeeks: 150 - 40 }])
    const contract = renewed.contracts.find((c) => c.talentId === actor.id)!
    expect(contract.endWeekExclusive).toBe(150) // exactly E: allowed
  })

  // ── B2: signContract likewise ──
  it('B2: signContract on an announced free agent — refused past E with retirementAnnounced, byte-identical state; allowed ending exactly at E', () => {
    const found = findSignable(fund(p13aGeneratedStudio()), 'writer')
    const { state, id } = found
    const week = state.market.tick
    const announced = withSyntheticCareerLifecycle(state, {
      boundaryWeek: week, records: [syntheticRecord({ personId: id, profession: 'writer', announcedWeek: week, effectiveWeek: week + 110 })],
    })
    const before = snapshot(announced)
    expect(() => applyActions(announced, [{ kind: 'signContract', talentId: id, termWeeks: 208 }])).toThrow(/retirementAnnounced/)
    expect(snapshot(announced)).toBe(before)
    const signed = applyActions(announced, [{ kind: 'signContract', talentId: id, termWeeks: 110 }])
    expect(signed.contracts.find((c) => c.talentId === id)!.endWeekExclusive).toBe(week + 110)
  })

  // ── B3: submitProposal refused; marketEligibility -> retirement_announced, proposers: [] ──
  it('B3: an announced person under an open case reads retirement_announced with no proposers, and submitProposal is refused without mutation', () => {
    const base = c2Fixture('genuine-v33-c2-contract-and-case') // week 48; authored-0001 has an OPEN case
    expect(caseForTalent(base, 'authored-0001')).not.toBeNull()
    const state = withSyntheticCareerLifecycle(base, {
      boundaryWeek: 48, records: [syntheticRecord({ personId: 'authored-0001', profession: 'director', announcedWeek: 48, effectiveWeek: 208 })],
    })
    expect(marketEligibility(state, 'authored-0001')).toEqual({ status: 'retirement_announced', proposers: [] })
    const before = snapshot(state)
    expect(() => submitProposal(state, { talentId: 'authored-0001', issuerStudioId: player(state), termWeeks: 52, premiumTier: 1 }))
      .toThrow()
    expect(snapshot(state)).toBe(before)
  })

  // ── C1: an open case is invalidated AT the announcement week, typed receipt; proposals dropped ──
  it('C1: announcing retirement invalidates the open case the same week, with a receipt naming "announced retirement", and drops its proposals', () => {
    const base = c2Fixture('genuine-v33-c2-contract-and-case') // week 48
    expect(caseForTalent(base, 'authored-0001')!.status).toBe('proposals_open')
    const state = withSyntheticCareerLifecycle(base, {
      boundaryWeek: 48, records: [syntheticRecord({ personId: 'authored-0001', profession: 'director', announcedWeek: 48, effectiveWeek: 208 })],
    })
    const next = advanceTalentMarketWeek(state)
    const kase = next.talentMarket.cases.find((c) => c.talentId === 'authored-0001')!
    expect(kase.outcome).toBe('invalidated')
    expect(kase.closedWeek).toBe(48)
    expect((kase.reason ?? '').toLowerCase()).toMatch(/announced retirement/)
    const receipt = next.talentMarket.receipts.find((r) => r.kind === 'invalidated' && r.talentId === 'authored-0001')
    expect(receipt).toBeDefined()
    expect(currentProposals(next, 'authored-0001')).toEqual([])
  })

  // ── C2: no case discovered later for an announced person ──
  it('C2: an announced person under an active contract never opens a market case, through its own real renewal window (natural route via tick)', () => {
    const base = c2Fixture('genuine-v33-c2-contract-and-case') // week 48; authored-0000: 208wk contract (end 208)
    const state = withSyntheticCareerLifecycle(base, {
      boundaryWeek: 48, records: [syntheticRecord({ personId: 'authored-0000', profession: 'actor', announcedWeek: 48, effectiveWeek: 208 })],
    })
    expect(caseForTalent(state, 'authored-0000')).toBeNull()
    const ticked = advanceTo(state as unknown as GameState, 208) // real ticks through the renewal window (196-207)
    expect(caseForTalent(ticked, 'authored-0000'), 'no case ever discovered for an announced person').toBeNull()
  })

  // ── C3: eligibility rows for finishing and retired ──
  it('C3: finishing_commitments and retired read their own eligibility rows, both with proposers: []', () => {
    const base = fund(p13aGeneratedStudio())
    const finishingId = hiringMarketIds(base).map((c) => base.talent.find((t) => t.id === c)!).find((t) => t.role === 'actor')!.id
    const retiredId = hiringMarketIds(base).map((c) => base.talent.find((t) => t.id === c)!).find((t) => t.role === 'director')!.id
    const state = withSyntheticCareerLifecycle(base, {
      boundaryWeek: 0,
      records: [
        syntheticRecord({ personId: finishingId, profession: 'actor', announcedWeek: 0, effectiveWeek: 10, status: 'finishing_commitments', finishingFromWeek: 10 }),
        syntheticRecord({ personId: retiredId, profession: 'director', announcedWeek: 0, effectiveWeek: 10, status: 'retired', finishingFromWeek: 10, retiredWeek: 20 }),
      ],
    })
    expect(marketEligibility(state, finishingId)).toEqual({ status: 'finishing_commitments', proposers: [] })
    expect(marketEligibility(state, retiredId)).toEqual({ status: 'retired_or_ineligible', proposers: [] })
  })

  // ── D1: player greenlight refuses when g + 9 > E, allows at equality, typed, no mutation ──
  it('D1: greenlight refuses an announced director when week + PRODUCTION_TICKS + 1 > E; allows it at exact equality; no mutation on refusal', () => {
    let state = fund(p13aGeneratedStudio())
    // Greenlight requires the credited writer to be a real Talent (any status); the
    // director/cast/craft it ENGAGES need only be idle (`assertGreenlightStaffingIdle`
    // checks `busyTalentIds` only, never a contract) — so none of them need signing,
    // which sidesteps D5/D7's own "no contract may end after E" law entirely for this
    // isolated boundary (a lawfully small E on a CONTRACTED person would itself require
    // shortening their contract to match, which E2 covers instead).
    const writer = sign(state, 'writer'); state = writer.state
    // Cast/craft are signed normally (any long term is fine; they carry no
    // retirement record). The director is drawn from the FREELANCER rotation LAST,
    // immediately before use — deliberately staying uncontracted (D5: a lawful small
    // E can never be smaller than a contract already in force) and drawn last so no
    // FURTHER tick can rotate it out of that epoch's freelancer sample before use.
    const lead = sign(state, 'actor'); state = lead.state
    const antagonist = sign(state, 'actor'); state = antagonist.state
    const support = sign(state, 'actor'); state = support.state
    const craft = sign(state, 'craft'); state = craft.state
    const director = findFreelancer(state, 'director'); state = director.state
    const concept = state.concepts[0]!
    const production = {
      conceptId: concept.id, shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' } as const,
      promise: { genre: concept.genre, intendedSegments: ['adult'] as SegmentId[], ranges: { intimacy: [-0.5, 0.5] as [number, number], tonalWeight: [-0.5, 0.5] as [number, number], kineticEnergy: [-0.5, 0.5] as [number, number] } },
      writerId: writer.id, directorId: director.id,
      cast: { lead: lead.id, antagonist: antagonist.id, support: support.id } as Record<CastSlot, string>,
      craftIds: [craft.id], budget: { negative: concept.baseNegativeCost, marketing: 0 },
    }
    const week = state.market.tick
    const cap = week + TUNING.PRODUCTION_TICKS + 1 // g + 9
    // refused: E one week short of the cap
    const refusedState = withSyntheticCareerLifecycle(state, {
      boundaryWeek: week, records: [syntheticRecord({ personId: director.id, profession: 'director', announcedWeek: week, effectiveWeek: cap - 1 })],
    })
    const before = snapshot(refusedState)
    expect(() => applyActions(refusedState, [{ kind: 'greenlight', production }])).toThrow(/retirementAnnounced/)
    expect(snapshot(refusedState)).toBe(before)
    // allowed: E exactly at the cap
    const allowedState = withSyntheticCareerLifecycle(state, {
      boundaryWeek: week, records: [syntheticRecord({ personId: director.id, profession: 'director', announcedWeek: week, effectiveWeek: cap })],
    })
    expect(() => applyActions(allowedState, [{ kind: 'greenlight', production }])).not.toThrow()
  })

  // ── B4: a rival neither renews nor hires an announced person (natural route through tick) ──
  it('B4a (staff() fresh-hire re-hire after natural expiry): r01\'s only director, announced with E = its own (shortened) contract end, is never re-hired past E once that seat naturally opens', () => {
    // MEASURED (probe against the scaffold, no retirement record at all): the existing
    // P14A.1 case-aware admission (`caseOpenForTalent` in the renewal loop, unrelated
    // to this feature) makes `staff()`'s RENEWAL branch structurally unreachable for
    // a rival employee whose window has been open more than one week — a case opens
    // the very week the window opens and pre-empts every later renewal attempt.
    // trap 1 (773 §5) instead names `staff()`'s FRESH-HIRE branch — the one PROVEN
    // reachable: once this contract expires NATURALLY (finishHollywoodWeek), the
    // vacancy is filled by re-hiring the same still-qualifying person for a fresh
    // 208-week term (measured: reason 'replacement', end = expiry + 208). The
    // contract is shortened here only so that natural expiry is reached in a few
    // ticks rather than 208, avoiding the unrelated long-run market churn a fresh
    // world produces over hundreds of weeks.
    const base = p13aGeneratedStudio() // default seed; r01's director person-studio-aca408ec-r01-1
    const directorId = 'person-studio-aca408ec-r01-1'
    const ordinal = base.hollywood!.employment.findIndex((e) => e.terms.talentId === directorId)
    expect(ordinal).toBeGreaterThanOrEqual(0)
    const contractEnd = 13
    const employment = base.hollywood!.employment.map((e, i) => (i === ordinal ? { ...e, terms: { ...e.terms, startWeek: 0, endWeekExclusive: contractEnd } } : e))
    const shortened = { ...base, hollywood: { ...base.hollywood!, employment } }
    let state: GameState = withSyntheticCareerLifecycle(shortened, {
      boundaryWeek: 0, records: [syntheticRecord({ personId: directorId, profession: 'director', announcedWeek: 0, effectiveWeek: contractEnd })],
    }) as unknown as GameState
    for (let w = 0; w < 16; w++) state = tick(state) // past the natural expiry at week 13
    const stillActive = state.hollywood!.employment.some((e) => e.terms.talentId === directorId && e.endedWeek === null)
    expect(stillActive, 'the ineligible director must never be re-hired into a fresh term').toBe(false)
  })

  it('B4b (staff() fresh hire): an announced free candidate, made the ONLY non-busy craft in the world, is never hired to fill r01\'s (synthetically vacated) craft seat', () => {
    let state = p13aGeneratedStudio() as GameState
    const r01Craft = state.hollywood!.employment.findIndex((e) => e.studioId === 'studio-aca408ec-r01' && state.talent.find((t) => t.id === e.terms.talentId)?.role === 'craft')
    expect(r01Craft).toBeGreaterThanOrEqual(0)
    const vacatedId = state.hollywood!.employment[r01Craft]!.terms.talentId
    // vacate the seat SYNTHETICALLY (this test isolates staff()'s fresh-hire branch,
    // not the natural mechanics of how a seat becomes vacant, which E1/E2 already cover)
    const employment = state.hollywood!.employment.map((e, i) => (i === r01Craft ? { ...e, endedWeek: 0 } : e))
    const activeEmploymentOrdinals = state.hollywood!.activeEmploymentOrdinals.filter((i) => i !== r01Craft)
    // the vacated occupant is REMOVED from `talent` entirely (not merely un-reserved):
    // staff()'s fresh-hire tries the EXPIRED occupant of the SAME role/studio first
    // (`next.find(t=>t.id===expired.terms.talentId)`, MEASURED against the scaffold —
    // without this it re-hires that same old occupant and never reaches the
    // `next.find(role,!unavailable)` fallback this case actually isolates).
    const talent = state.talent.filter((t) => t.id !== vacatedId)
    state = { ...state, talent, hollywood: { ...state.hollywood!, employment, activeEmploymentOrdinals } }
    state = prependSyntheticCandidate(state, 'synthetic-b4b-craft', 'craft', 40)
    let lifecycle: GameState = withSyntheticCareerLifecycle(state, {
      boundaryWeek: 0, records: [syntheticRecord({ personId: 'synthetic-b4b-craft', profession: 'craft', announcedWeek: 0, effectiveWeek: 52, status: 'retired', finishingFromWeek: 52, retiredWeek: 52 })],
    }) as unknown as GameState
    for (let w = 0; w < 10; w++) lifecycle = tick(lifecycle)
    expect(lifecycle.hollywood!.employment.some((e) => e.terms.talentId === 'synthetic-b4b-craft'), 'the retired candidate must never be freshly hired').toBe(false)
  })

  // ── B5: enterRival skips announced, finishing and retired people (natural route via tick's scheduled entry) ──
  it('B5: a retired free candidate, made the FIRST match for r05\'s scheduled entry (week 520), is skipped — r05 mints a fresh person instead, exactly as it does with no candidate at all', () => {
    let state = prependSyntheticCandidate(p13aGeneratedStudio(), 'synthetic-b5-writer', 'writer', 40)
    let lifecycle: GameState = withSyntheticCareerLifecycle(state, {
      boundaryWeek: 0, records: [syntheticRecord({ personId: 'synthetic-b5-writer', profession: 'writer', announcedWeek: 0, effectiveWeek: 52, status: 'retired', finishingFromWeek: 52, retiredWeek: 52 })],
    }) as unknown as GameState
    for (let w = 0; w < 520; w++) lifecycle = tick(lifecycle)
    const r05 = lifecycle.hollywood!.businesses.find((b) => b.studioId === 'studio-aca408ec-r05')!
    const writerHire = lifecycle.hollywood!.employment.find((e) => e.studioId === r05.studioId && lifecycle.talent.find((t) => t.id === e.terms.talentId)?.role === 'writer')
    expect(writerHire?.terms.talentId).not.toBe('synthetic-b5-writer')
    expect(writerHire, 'r05 still fills its writer seat — from a freshly minted person, not the retired candidate').toBeDefined()
  }, 30000)

  // ── D2: a rival does not cast an announced employee past the cap (natural route) ──
  it('D2: r01\'s only director, announced with E=4, is never cast into r01\'s first production (an established accepted fact: r01 forms film:0 by tick 3 on this seed unmodified)', () => {
    const base = p13aGeneratedStudio() // default seed; r01 = studio-aca408ec-r01, its ONLY director person-studio-aca408ec-r01-1
    const directorId = 'person-studio-aca408ec-r01-1'
    expect(base.talent.find((t) => t.id === directorId)?.role).toBe('director')
    // D5: E can never be smaller than the director's own contract in force, so the
    // real employment row is shortened to match (endWeekExclusive: 4) — otherwise
    // this SYNTHETIC record would be unlawful and the settlement fail-loud guard
    // (773 D10) correctly refuses it, as it did before this fix.
    const ordinal = base.hollywood!.employment.findIndex((e) => e.terms.talentId === directorId)
    expect(ordinal).toBeGreaterThanOrEqual(0)
    const employment = base.hollywood!.employment.map((e, i) => (i === ordinal ? { ...e, terms: { ...e.terms, endWeekExclusive: 4 } } : e))
    const shortened = { ...base, hollywood: { ...base.hollywood!, employment } }
    let state: GameState = withSyntheticCareerLifecycle(shortened, {
      boundaryWeek: 0, records: [syntheticRecord({ personId: directorId, profession: 'director', announcedWeek: 0, effectiveWeek: 4 })],
    }) as unknown as GameState
    for (let w = 0; w < 10; w++) state = tick(state)
    const r01 = state.hollywood!.businesses.find((b) => b.studioId === 'studio-aca408ec-r01')!
    expect(r01.productions.some((p) => p.directorId === directorId), 'the ineligible director must never be cast').toBe(false)
  })
})

describe('P14C.2a Amendment A1 (777 §7, parent mid-flight): hiringMarketIds post-filter', () => {
  it('omits an announced person once no catalogue term can end by E; every OTHER id keeps its place (the sampling pool is unchanged)', () => {
    const state = fund(p13aGeneratedStudio())
    const before = hiringMarketIds(state)
    expect(before.length).toBeGreaterThan(0)
    const target = before[0]!
    const person = state.talent.find((t) => t.id === target)!
    const announced = withSyntheticCareerLifecycle(state, {
      // E = 10: fewer than CONTRACT_MIN_WEEKS (52) remain, so NO catalogue term can
      // end by E — this person must leave the listing entirely, per amendment rule 1.
      boundaryWeek: 0, records: [syntheticRecord({ personId: target, profession: person.role, announcedWeek: 0, effectiveWeek: 10 })],
    })
    const after = hiringMarketIds(announced as unknown as GameState)
    expect(after).not.toContain(target)
    expect(after).toEqual(before.filter((id) => id !== target)) // no reshuffle, no backfill — a pure omission
  })
})

describe('P14C.2a W1: the writing-verb gate already refuses finishing/retired (amendment log item 1)', () => {
  it('a writer holding no current contract (the D7/D10 consequence of finishing/retired) is refused commissionScript, commissionOriginalScreenplay and assignScreenplayWriter by the EXISTING gate', () => {
    const state = fund(p13aGeneratedStudio())
    // Never signed: exactly the shape D7 guarantees for a finishing/retired writer
    // (no contract survives past E). `lifecycleStatus` itself is exercised directly
    // too, once real, against a SYNTHETIC record for the same person.
    const writerId = state.talent.find((t) => t.role === 'writer' && !state.freeAgents.includes(t.id))?.id
      ?? state.talent.find((t) => t.role === 'writer')!.id
    const withRecord = withSyntheticCareerLifecycle(state, {
      boundaryWeek: 0, records: [syntheticRecord({ personId: writerId, profession: 'writer', announcedWeek: 0, effectiveWeek: 1, status: 'retired', finishingFromWeek: 1, retiredWeek: 1 })],
    })
    expect(lifecycleStatus(withRecord, writerId)).toBe('retired')
    const concept = state.concepts[0]!
    expect(() => applyActions(withRecord as unknown as GameState, [{ kind: 'activateScriptDevelopment' }, { kind: 'commissionScript', project: {
      conceptId: concept.id, writerId,
      shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
      promise: { genre: concept.genre, intendedSegments: ['adult'] as SegmentId[], ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] } },
    } }])).toThrow(/not currently studio-contracted/)
  })

  it('an ANNOUNCED but still-contracted writer may be commissioned (announced alone is not a writing refusal)', () => {
    let state = fund(p13aGeneratedStudio())
    const writer = sign(state, 'writer'); state = writer.state
    const week = state.market.tick
    const announced = withSyntheticCareerLifecycle(state, {
      boundaryWeek: week, records: [syntheticRecord({ personId: writer.id, profession: 'writer', announcedWeek: week, effectiveWeek: week + 500 })],
    })
    expect(lifecycleStatus(announced, writer.id)).toBe('announced')
    const concept = state.concepts[0]!
    expect(() => applyActions(announced as unknown as GameState, [{ kind: 'activateScriptDevelopment' }, { kind: 'commissionScript', project: {
      conceptId: concept.id, writerId: writer.id,
      shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
      promise: { genre: concept.genre, intendedSegments: ['adult'] as SegmentId[], ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] } },
    } }])).not.toThrow()
  })
})

describe('P14C.2a P1: every open promise to an announced person has dueWeekExclusive <= E', () => {
  // 777 amendment A2 (parent): the T0 predictor for THIS fixture's personB assumed
  // idleInWindow at week 156 without checking whether the OPEN CASE (proposals_open
  // at week 48) settles into a new contract first — a known prediction error, not
  // asserted here. Re-derived instead from 773 D3/D5 on FACTS ALREADY FIXED at the
  // save week (week 48 itself, the person's real current age, and their REAL
  // original contract's own end) — nothing here depends on any later natural event.
  it('genuine-v33-c2-contract-and-case: promise-0 (open, on the director authored-0001) sits inside E derived from the save week\'s own fixed facts', () => {
    const base = c2Fixture('genuine-v33-c2-contract-and-case') // week 48
    const promise = base.promises.find((p) => p.promiseId === 'promise-0')!
    expect(promise.beneficiaryPersonId).toBe('authored-0001')
    const week = base.market.tick // 48
    const contractEnd = base.contracts.find((c) => c.talentId === 'authored-0001')!.endWeekExclusive
    const age = base.talent.find((t) => t.id === 'authored-0001')!.age // the real, already-materialized age at week 48
    const effectiveWeek = Math.max(week + 52, contractEnd) // 773 D5, on facts fixed at week 48 only
    const state = withSyntheticCareerLifecycle(base, {
      boundaryWeek: week, records: [syntheticRecord({ personId: 'authored-0001', profession: 'director', announcedWeek: week, ageAtAnnouncement: age, effectiveWeek })],
    })
    const record = state.careerLifecycle.records[0]!
    expect(promise.dueWeekExclusive).toBeLessThanOrEqual(record.effectiveWeek)
  })
})
