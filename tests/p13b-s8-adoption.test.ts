// ── P13B-S8 test 3: rival adoption per technology — clock-based timing
// pinned; commercial purchase unchanged where no plant exists ─────────────
//
// Requirement-derived from "S8 — Symmetric rival research and finance" scope
// record ("Rival adoption per technology (S5): the P09 query clause applies
// to the rival's bodies once they exist; first-prototype entitlement, later
// inventor, commercial purchase — identical; the rival's commercial purchase
// keeps its current shape until its plant exists"), the plan's own "Tests"
// item 3 ("rival adoption per technology with the P09 clause on rival
// bodies; commercial purchase unchanged where no plant exists"), and the
// Audit's adjudicated coverage item 11: "Rival adoption timing (coverage 3,
// adjudicated): finishTechnologyWeek's clock branch is UNCHANGED for rivals
// (no placements -> no P09 body query); the scope's 'P09 clause on rival
// bodies' is satisfied by the rival's stage facility existing and the
// receipt; recorded, not extended."
//
// Because item 11 names the clock branch UNCHANGED, this file's core claims
// (cases 1-2 below) are provable against TODAY's real, existing
// `finishTechnologyWeek` — no engine change is a precondition for THEM. The
// file still fails at module resolution (the mandatory `rivalResearch.ts`
// import, case 3) before any of that real-code proof runs, exactly as every
// other P13B-S8-T1 file does.
//
// RED-by-design: `src/core/rivalResearch.ts` does not exist yet.
// `RIVAL_RESEARCH_POLICY` is the import from that new module and is READ
// (array iteration counts as use; the identical-file gotcha this repository
// already names — tests/p13b-s6-save-v26.test.ts's header — is about an
// import eliminated by a bundler for being wholly unused, not about the
// shape of the read), so this file fails at module resolution before any
// test body runs.
//
// PREMISES NAMED:
//   1. `RIVAL_RESEARCH_POLICY` is assumed to be a readonly array of
//      `{technologyId, interestFromWeek, seats, budgetPerWeek}` rows, one per
//      catalogue technology — the Refinement block's own words: "per
//      technology an `interestFromWeek` (= `researchableWeek`), `seats` (<=
//      4), `budgetPerWeek` (<= the S2 usable ceiling)". `interestFromWeek` is
//      PINNED exactly (the plan states the equality); `seats`/`budgetPerWeek`
//      are BOUNDED only (the plan states no exact figure — "Policy numbers...
//      are CANDIDATE").
//   2. Case 2 hand-constructs a rival `TechnologyAdoption` row directly on
//      the shared `technology.adoptions` root (route: 'research') rather
//      than through a not-yet-existing rival research completion producer —
//      the plan states adoption law is "identical" once access exists;
//      constructing the row directly isolates finishTechnologyWeek's own
//      clock law from S8's separate research-completion machinery (test 2's
//      own concern).

import { describe, expect, it } from 'vitest'
import { finishTechnologyWeek } from '../src/core/technology.js'
import { technologyEntry, TECHNOLOGY_CATALOGUE } from '../src/core/technologyCatalogue.js'
import { considerRivalSoundPurchase } from '../src/core/technologyRival.js'
import { advanceTo, p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import type { GameState } from '../src/core/types.js'
import type { TechnologyAdoption } from '../src/core/technologyTypes.js'
// RED-by-design: src/core/rivalResearch.ts does not exist yet. This is the
// ONE import from that new module in this file.
import { RIVAL_RESEARCH_POLICY } from '../src/core/rivalResearch.js'

const SEED = 'p13b-s8-adoption-01'

/** The same small helper duplicated across this repository's own test files (e.g. tests/bridge-p13b-s7-disclosure.test.ts) — narrows a possibly-undefined lookup or throws loudly. */
function required<T>(value: T | null | undefined, message: string): T {
  if (value === null || value === undefined) throw new Error(message)
  return value
}

/** Real rival commercial sound purchase, looped exactly as tests/p13a-rival-adoption.test.ts and tests/p13b-s7-independence.test.ts already do. */
function withRivalPurchase(state: GameState): { state: GameState; studioId: string } {
  const hollywood = structuredClone(state.hollywood)!
  let result = state.technology
  let studioId: string | null = null
  for (const business of hollywood.businesses) {
    result = considerRivalSoundPurchase(state, hollywood, business)
    if (result !== state.technology) { studioId = business.studioId; break }
  }
  if (studioId === null) throw new Error('p13b-s8-adoption fixture: no rival business purchased sound technology at week 416 — widen the seed/business pool')
  return { state: { ...state, hollywood, technology: result }, studioId }
}

describe('P13B-S8 rival adoption per technology: clock timing pinned, commercial purchase unchanged (test 3)', () => {
  it('REGRESSION (today, real code): a rival\'s commercial sound purchase — no plant of its own — still becomes operational EXACTLY at committedWeek + deploymentWeeks through the unchanged clock branch', () => {
    const { state: committed, studioId } = withRivalPurchase(advanceTo(p13aGeneratedStudio(SEED), 416))
    const deploymentWeeks = technologyEntry('synchronized-sound').deploymentWeeks
    expect(deploymentWeeks).toBe(12)
    const adoption = committed.technology.adoptions.find(a => a.studioId === studioId)!
    expect(adoption.committedWeek).toBe(416)
    expect(adoption.operationalWeek).toBeNull()

    // One week early: still not operational (the clock, not a placement, gates it).
    const oneEarly = finishTechnologyWeek({ ...committed, market: { ...committed.market, tick: 416 + deploymentWeeks - 1 } })
    expect(oneEarly.technology.adoptions.find(a => a.studioId === studioId)!.operationalWeek).toBeNull()

    // Exactly at the deployment boundary: operational, with its public receipt.
    const onTime = finishTechnologyWeek({ ...committed, market: { ...committed.market, tick: 416 + deploymentWeeks } })
    const finished = onTime.technology.adoptions.find(a => a.studioId === studioId)!
    expect(finished.operationalWeek).toBe(428)
    expect(onTime.hollywood!.receipts.some(r => r.kind === 'technologyAdopted' && r.studioId === studioId && r.adoptionId === finished.id)).toBe(true)
  }, 30_000)

  it('core: a rival RESEARCH-route adoption (no player placement at all) becomes operational through the SAME unchanged clock branch — "the rival\'s stage facility existing and the receipt" satisfies the P09 clause on rival bodies', () => {
    const base = advanceTo(p13aGeneratedStudio(SEED), 780) // lighting-control-01 researchableWeek
    const hollywood = base.hollywood!
    const identity = hollywood.identities.find(s => s.row === 1)!
    const business = hollywood.businesses.find(b => b.studioId === identity.studioId)!
    const stage = business.operations.facilities.find(f => f.capability === 'soundstage')!
    const committedWeek = base.market.tick
    const deploymentWeeks = technologyEntry('lighting-control-01').deploymentWeeks
    expect(deploymentWeeks).toBe(4)
    const adoption: TechnologyAdoption = {
      id: `${business.studioId}:lighting-control-01:adoption:0`, studioId: business.studioId, technologyId: 'lighting-control-01',
      stageFacilityId: stage.id, postFacilityId: null, route: 'research', committedWeek, operationalWeek: null, cancelledWeek: null,
      equipmentCost: 0, installationCost: 0, physicalProjectIds: [], prototypeProjectId: `${business.studioId}:research:lighting-control-01`,
      components: [], equipmentAssetId: null,
    }
    const withAdoption: GameState = { ...base, technology: { ...base.technology, adoptions: [...base.technology.adoptions, adoption] } }

    const oneEarly = finishTechnologyWeek({ ...withAdoption, market: { ...withAdoption.market, tick: committedWeek + deploymentWeeks - 1 } })
    expect(oneEarly.technology.adoptions.find(a => a.id === adoption.id)!.operationalWeek).toBeNull()

    const onTime = finishTechnologyWeek({ ...withAdoption, market: { ...withAdoption.market, tick: committedWeek + deploymentWeeks } })
    const finished = onTime.technology.adoptions.find(a => a.id === adoption.id)!
    expect(finished.operationalWeek).toBe(committedWeek + deploymentWeeks)
    expect(onTime.hollywood!.receipts.some(r => r.kind === 'technologyAdopted' && r.studioId === business.studioId && r.adoptionId === adoption.id)).toBe(true)
  })

  it('RIVAL_RESEARCH_POLICY: one row per catalogue technology, interestFromWeek pinned to researchableWeek, seats/budgetPerWeek within the stated bounds', () => {
    expect(RIVAL_RESEARCH_POLICY.length).toBe(TECHNOLOGY_CATALOGUE.length)
    for (const entry of TECHNOLOGY_CATALOGUE) {
      const found = RIVAL_RESEARCH_POLICY.find((p: { technologyId: string }) => p.technologyId === entry.id)
      const row = required(found, `RIVAL_RESEARCH_POLICY names no row for ${entry.id}`)
      expect(row.interestFromWeek).toBe(entry.researchableWeek) // "interestFromWeek (= researchableWeek)"
      expect(row.seats).toBeGreaterThan(0)
      expect(row.seats).toBeLessThanOrEqual(4) // "seats (<= 4)"
      expect(row.budgetPerWeek).toBeLessThanOrEqual(entry.usableBudgetPerScientist * row.seats) // "<= the S2 usable ceiling"
    }
  })
})
