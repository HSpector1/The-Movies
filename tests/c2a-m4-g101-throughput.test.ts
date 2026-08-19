// ── G10.1 — THE CAMPAIGN'S REAL ACCEPTANCE TEST, AS A GATE ───────────────────
//
// Charter §3.3: *"G10.1 is the campaign's real acceptance test: the C1 snapshot proved
// purchased slots inert at the ceiling; post-C2a the same measurement must show them no
// longer inert on ≥4 of 5 seeds."*
//
// `docs/economy/C2-E2-THROUGHPUT.md` RECORDS that measurement. This file ENFORCES it, so
// that a later change which quietly re-introduces a throughput ceiling — a cap by another
// name, a policy that cannot spend capacity, a regression in the release law that makes a
// slot un-reusable — fails here instead of being discovered by a player.
//
// It is deliberately the same instrument, seeds, horizon and arms as the C1 study
// (`src/harness/facilities`, `c1-economy-001…005`, 104 weeks, +0/+1/+2 shared slots at the
// Annex and Hall build weeks), because a gate measured differently from the finding it
// guards is not guarding it.

import { describe, expect, it } from 'vitest'

import { FACILITY_BLUEPRINTS, TUNING } from '../src/core/index.js'
import { runFacilitiesArm } from '../src/harness/facilities/index.js'
import type { FacilitiesArmResult, FacilitiesPolicyId } from '../src/harness/facilities/index.js'

const SOURCE = {
  sourceCommit: 'test-commit',
  sourceTree: 'test-tree',
  worktreeDirty: false,
  runtime: 'node test',
} as const

/** C1's capacity-study seeds. Changing them forfeits the comparison the gate is about. */
const SEEDS = ['c1-economy-001', 'c1-economy-002', 'c1-economy-003', 'c1-economy-004', 'c1-economy-005'] as const
/** C1's capacity-study horizon. */
const HORIZON_WEEKS = 104
/** Charter §3.3's bar, quoted. */
const SEED_BAR = 4

function buildWeeks(id: string): number {
  const entry = FACILITY_BLUEPRINTS.find((candidate) => candidate.id === id)
  if (entry === undefined) throw new Error(`g10.1 gate: no blueprint ${id}`)
  return entry.buildWeeks
}

function arms(seed: string, policyId: FacilitiesPolicyId): FacilitiesArmResult[] {
  return [
    runFacilitiesArm({ seed, policyId, mode: 'current', horizonWeeks: HORIZON_WEEKS, source: SOURCE }),
    runFacilitiesArm({
      seed,
      policyId,
      mode: 'counterfactual',
      capacityDelta: 1,
      availableWeek: buildWeeks('development-casting-annex'),
      horizonWeeks: HORIZON_WEEKS,
      source: SOURCE,
    }),
    runFacilitiesArm({
      seed,
      policyId,
      mode: 'counterfactual',
      capacityDelta: 2,
      availableWeek: buildWeeks('development-casting-hall'),
      horizonWeeks: HORIZON_WEEKS,
      source: SOURCE,
    }),
  ]
}

/**
 * C1's OWN inertness definition, quoted from `C1-ECONOMY-SNAPSHOT.md` §4: *"every arm
 * released exactly the same pictures and finished with exactly the same cash, to the
 * byte."*
 *
 * Final STATE hashes are deliberately NOT the criterion. A counterfactual arm carries an
 * extra facility in state, so its hash differs whether or not anything economic moved —
 * a "not inert" test built on hashes could never fail and would prove nothing.
 */
function inert(results: readonly FacilitiesArmResult[]): boolean {
  const base = results[0]!.summary
  return results
    .slice(1)
    .every((result) => result.summary.releases === base.releases && result.summary.finalCash === base.finalCash)
}

function peakActive(result: FacilitiesArmResult): number {
  return result.rows.reduce((peak, row) => Math.max(peak, row.activeProductions), 0)
}

describe('C2a-M4 · G10.1 — purchased capacity is no longer inert', () => {
  const measured = SEEDS.map((seed) => {
    const results = arms(seed, 'scaled-four-team')
    return { seed, results, inert: inert(results), peak: Math.max(...results.map(peakActive)) }
  })

  it(`moves releases or cash on at least ${String(SEED_BAR)} of ${String(SEEDS.length)} seeds`, () => {
    const moved = measured.filter((entry) => !entry.inert)
    expect(
      moved.map((entry) => entry.seed),
      'seeds where a purchased Development & Casting slot changed the outcome',
    ).toHaveLength(SEEDS.length)
    expect(moved.length).toBeGreaterThanOrEqual(SEED_BAR)
  })

  it('reaches more simultaneous pictures than the deleted cap ever permitted', () => {
    // THE CONCURRENCY FACT. `MAX_CONCURRENT_PRODUCTIONS` was 2 and it threw, so this
    // number could not have exceeded 2 on any seed, any policy, any horizon. That it
    // exceeds 2 is owner law 1 observed rather than asserted.
    for (const entry of measured) {
      expect(entry.peak, `${entry.seed} peak simultaneous productions`).toBeGreaterThan(2)
    }
  })

  it('leaves the C1 two-picture policy measurably less relieved, which is why the arm exists', () => {
    // The pair is the finding (see `docs/economy/C2-E2-THROUGHPUT.md` §1). If BOTH
    // policies passed identically, the four-picture arm would be redundant and this gate
    // would be measuring the seeds rather than the capacity. This asserts the arm earns
    // its place: a studio that wants two pictures is relieved on strictly fewer seeds
    // than one that wants four.
    const twoTeamMoved = SEEDS.filter((seed) => !inert(arms(seed, 'scaled-two-team'))).length
    const fourTeamMoved = measured.filter((entry) => !entry.inert).length
    expect(fourTeamMoved).toBeGreaterThan(twoTeamMoved)
  })

  it('bounds the agents by a policy constant and the studio by nothing', () => {
    // The one surviving descendant of the deleted cap, and the reason the sealed M0A
    // corpus stayed byte-identical across owner law 1. It bounds the harness AGENTS'
    // appetite; no engine path consults it, and the four-picture policy above proves a
    // studio is not held to it.
    expect(TUNING.AGENT_MAX_SLATE).toBe(2)
    expect(Object.prototype.hasOwnProperty.call(TUNING, 'MAX_CONCURRENT_PRODUCTIONS')).toBe(false)
    expect(Math.max(...measured.map((entry) => entry.peak))).toBeGreaterThan(TUNING.AGENT_MAX_SLATE)
  })
})
