import { applyActions } from '../../core/actions.js'
import { initializeHollywood } from '../../core/hollywood.js'
import { commitPlacement, queryPlacement } from '../../core/placement.js'
import { TUNING } from '../../core/tuning.js'
import { generateWorld } from '../../core/worldgen.js'
import type { GameState } from '../../core/types.js'
import { advanceTo } from '../p13a/fixtures.js'

// P13B-S4 shared evidence (test-author, additive; never edits `../p13a/fixtures.ts`
// or `./fixtures.ts`). Requirement-derived from "S4 — Direct gap-aware Office
// conversion" in docs/engineering/playability-launch-review/plans/
// P13B-HEADLESS-PLAN.md. Builders reused by more than one S4 test file live here,
// mirroring how `nextLaboratoryOrigin`/`p13bStaffedProject` live in `./fixtures.ts`
// for S1-S3.

/**
 * The first lawful origin `queryPlacement` accepts for ANY blueprint on this
 * generated lot — `nextLaboratoryOrigin` (./fixtures.ts) generalized beyond the
 * one blueprint S1-S3 ever needed. Never a guessed cell.
 */
export function s4NextOrigin(state: GameState, blueprintId: string): { gx: number; gy: number } {
  for (let gy = 0; gy < 24; gy++) {
    for (let gx = 0; gx < 24; gx++) {
      if (queryPlacement(state, { blueprintId, origin: { gx, gy } }).ok) return { gx, gy }
    }
  }
  throw new Error(`p13b-s4 fixture: no lawful site for "${blueprintId}" on this generated lot`)
}

/**
 * A BARE-LOT studio (P09 §16/§17) that builds its Development & Casting office
 * from scratch as a genuine `PlacedFacility` (`development-casting-office` —
 * `BASELINE_DEVELOPMENT_CASTING_BLUEPRINT`: $1.5M / 14 weeks / capacity 2 /
 * $5,500 weekly), advanced to operational.
 *
 * WHY NOT THE ENDOWED FOUNDING OFFICE (measured 2026-09-17, worth recording
 * precisely because it changes what a money-exact S4 test can assert): the
 * endowed lot's founding Development & Casting body (`INITIAL_STUDIO_FACILITIES`
 * id `facility-development-casting`) is a PROPERTY STRUCTURE, never a
 * `PlacedFacility` — `initializeManagedStudioOperations`/`initialManagedStudio
 * Placement` leave `state.placement.facilities` EMPTY on activation, and nothing
 * ever appends a row for the five founding bodies. `weeklyPlacementOperatingCost`
 * (placement.ts) sums ONLY `state.placement.facilities`, so the endowed founding
 * office pays NO weekly operating cost in this engine today —
 * `BASELINE_DEVELOPMENT_CASTING_WEEKLY_OPERATING_COST` (5,500) is wired to
 * `rivalCapacityOpex` (hollywood.ts, rivals only) and to this same baseline
 * BLUEPRINT's own `weeklyOperatingCost` field, never to the endowed structure.
 * Document 03's 52-week economics ("baseline $5,500 continues every week") is
 * therefore reachable ONLY through a genuinely PLACED `development-casting-office`
 * body. A bare lot is the lawful way to reach one without inventing a persisted
 * fact this engine does not have. Quote-only S4 tests (no money-over-time
 * reconciliation) still use the ENDOWED founding office through
 * `p13aLaboratorySlice()`, matching every other P13B slice's convention.
 */
export function s4BareOfficeStudio(seed: string): { state: GameState; officeFacilityId: string } {
  let state = initializeHollywood(
    applyActions(
      { ...generateWorld(seed, { regime: 'bare-lot' }), economyEngagedEver: true },
      [{ kind: 'activateStudioOperations' }],
    ),
    'fresh',
  )
  const origin = s4NextOrigin(state, 'development-casting-office')
  const quote = queryPlacement(state, { blueprintId: 'development-casting-office', origin })
  if (!quote.ok) {
    throw new Error(`s4BareOfficeStudio: development-casting-office refused at ${JSON.stringify(origin)}: ${JSON.stringify(quote.rejections)}`)
  }
  state = commitPlacement(state, { blueprintId: 'development-casting-office', origin })
  state = advanceTo(state, state.market.tick + TUNING.BASELINE_DEVELOPMENT_CASTING_BUILD_WEEKS)
  const officeFacilityId = state.placement.facilities.find(f => f.blueprintId === 'development-casting-office')!.facilityId
  return { state, officeFacilityId }
}
