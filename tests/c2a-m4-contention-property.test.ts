// ── C2a-M4 — the N-way contention property test (charter §12-M4 gate) ────────
//
// Seeded runs of a deliberately starved studio — one stage, one Post slot, more
// pictures than either can carry — with three properties asserted EVERY WEEK:
//
//   (a) THE WAIT-FOR GRAPH IS ACYCLIC. Under the declared acquisition order
//       (§3.2) that is a corollary of rank monotonicity, so the test proves it
//       the strong way: it builds the actual wait-for graph each week from the
//       blockers and the holdings, and looks for a cycle.
//   (b) RANK MONOTONICITY. No workflow waits on a resource ranked at or below
//       anything it holds — re-derived here rather than trusted from the
//       invariant, because a test that only calls the code under test proves
//       nothing about it.
//   (c) BOUNDED WAIT. No picture's accumulated wait exceeds a stated bound.
//
// Plus the idle-freight law (`00E`.16): waiting carries the freight of
// resources and contracts GENUINELY still committed, and NOTHING ELSE. A studio
// with pictures queued pays exactly what the same studio pays with nothing
// queued.

import { describe, expect, it } from 'vitest'
import {
  applyActions,
  assertNoDoubleBookedResourceSlots,
  assertStudioOperationsInvariants,
  productionWaitWeeks,
  stableStringify,
  tick,
} from '../src/core/index.js'
import type { FacilityCapability, GameState, LedgerEntry } from '../src/core/index.js'
import { hasQueuedGreenlightScriptProject } from '../src/core/productionQueue.js'
import { contendedStudio, freePackageOrNull } from './_m4Fixtures.js'

/** The charter's declared acquisition order (§3.2), restated by the test. */
const RANK: Readonly<Record<FacilityCapability, number>> = {
  'development-casting': 1,
  soundstage: 2,
  'set-scenery': 3,
  post: 4,
}

/** One stage, one Post slot: everything that can contend, does. */
function starvedStudio(seed: string): GameState {
  const { state } = contendedStudio(seed)
  return {
    ...state,
    operations: {
      ...state.operations,
      facilities: state.operations.facilities
        .filter((facility) => facility.id !== 'facility-soundstage-12')
        .map((facility) =>
          facility.capability === 'post' ? { ...facility, capacity: 1 } : facility,
        ),
    },
    sets: state.sets.filter((set) => set.mountedOn !== 'facility-soundstage-12'),
  }
}

function driveTakes(state: GameState): GameState {
  let next = state
  for (const workflow of state.operations.workflows) {
    if (workflow.phase !== 'shooting' || workflow.shootingTask === null) continue
    if (workflow.shootingTask.status !== 'unassigned') continue
    const production = state.studio.activeProductions.find(
      (candidate) => candidate.id === workflow.productionId,
    )!
    next = applyActions(next, [
      {
        kind: 'assignShootingDirector',
        productionId: production.id,
        directorId: production.directorId,
      },
      { kind: 'clearSceneryLoadIn', productionId: production.id },
      { kind: 'scheduleShootingTake', productionId: production.id },
    ])
  }
  return next
}

/** Greenlight each distinct ready project once, so the studio stays over-subscribed. */
function pressureGreenlights(state: GameState, readyProjectIds: readonly string[]): GameState {
  let next = state
  for (const projectId of readyProjectIds) {
    const project = next.scriptDevelopment.projects.find(
      (candidate) => candidate.id === projectId,
    )
    if (project === undefined || project.status !== 'ready') continue
    if (hasQueuedGreenlightScriptProject(next.productionQueue, projectId)) continue
    const payload = freePackageOrNull(next, projectId)
    // A studio with this many pictures in flight runs out of BODIES before it
    // runs out of rooms; this test is about the rooms.
    if (payload === null) continue
    next = applyActions(next, [{ kind: 'greenlightScriptProject', production: payload }])
  }
  return next
}

type WaitEdge = { waiter: string; waitedRank: number; heldRanks: number[]; heldBy: string[] }

/** The week's wait-for graph, read from authoritative state. */
function waitGraph(state: GameState): WaitEdge[] {
  const edges: WaitEdge[] = []
  for (const workflow of state.operations.workflows) {
    const blocker = workflow.blocker
    if (blocker === null) continue
    if (blocker.kind !== 'facility-capacity' && blocker.kind !== 'set-unavailable') continue
    const waitedCapability: FacilityCapability =
      blocker.kind === 'facility-capacity' ? blocker.capability : 'soundstage'
    // Who holds the thing it waits for: every OTHER workflow holding a
    // reservation of that capability.
    const heldBy = state.operations.workflows
      .filter(
        (candidate) =>
          candidate.productionId !== workflow.productionId &&
          candidate.reservations.some(
            (reservation) => reservation.capability === waitedCapability,
          ),
      )
      .map((candidate) => candidate.productionId)
    edges.push({
      waiter: workflow.productionId,
      waitedRank: RANK[waitedCapability],
      heldRanks: workflow.reservations.map((reservation) => RANK[reservation.capability]),
      heldBy,
    })
  }
  return edges
}

function hasCycle(edges: readonly WaitEdge[]): boolean {
  const out = new Map<string, string[]>()
  for (const edge of edges) out.set(edge.waiter, edge.heldBy)
  const state = new Map<string, 'visiting' | 'done'>()
  const visit = (node: string): boolean => {
    const mark = state.get(node)
    if (mark === 'visiting') return true
    if (mark === 'done') return false
    state.set(node, 'visiting')
    for (const next of out.get(node) ?? []) {
      if (visit(next)) return true
    }
    state.set(node, 'done')
    return false
  }
  for (const edge of edges) {
    if (visit(edge.waiter)) return true
  }
  return false
}

const SEEDS = ['m4-prop-a', 'm4-prop-b', 'm4-prop-c', 'm4-prop-d', 'm4-prop-e'] as const
const HORIZON_WEEKS = 26

describe('C2a-M4 §12 gate — N-way contention, seeded', () => {
  for (const seed of SEEDS) {
    it(`${seed}: acyclic wait-graph, rank monotonicity and bounded wait every week`, () => {
      const { readyProjectIds } = contendedStudio(seed)
      let state = starvedStudio(seed)
      let sawContention = false

      for (let week = 0; week < HORIZON_WEEKS; week++) {
        state = pressureGreenlights(driveTakes(state), readyProjectIds)
        state = tick(state)

        // The authority itself must accept every week of the run.
        assertStudioOperationsInvariants(state.operations, state.studio.activeProductions, {
          facilityPolicy: 'configured',
          sharedOccupancy: {
            scriptDevelopment: state.scriptDevelopment,
            castingSessions: state.castingSessions,
            sets: state.sets,
          },
        })
        assertNoDoubleBookedResourceSlots({
          operations: state.operations,
          scriptDevelopment: state.scriptDevelopment,
          castingSessions: state.castingSessions,
          sets: state.sets,
        })

        const edges = waitGraph(state)
        if (edges.length > 0) sawContention = true

        // (b) RANK MONOTONICITY — the law that makes (a) a theorem.
        for (const edge of edges) {
          for (const held of edge.heldRanks) {
            expect(held).toBeLessThan(edge.waitedRank)
          }
        }
        // (a) ACYCLIC, checked directly on the graph the week actually has.
        expect(hasCycle(edges)).toBe(false)

        // (c) BOUNDED WAIT. Every contended resource is released by its holder
        // within that holder's remaining run, and there are at most N holders, so
        // N × PRODUCTION_TICKS weeks is a real bound rather than a large number.
        const bound = Math.max(1, state.studio.activeProductions.length) * 8
        for (const production of state.studio.activeProductions) {
          expect(productionWaitWeeks(production, state.market.tick)).toBeLessThanOrEqual(bound)
        }
      }

      // The run has to have been genuinely contended, or it proved nothing.
      expect(sawContention).toBe(true)
    })
  }

  it('is deterministic under contention: same seed + same script → identical weeks', () => {
    const run = (): GameState => {
      const { readyProjectIds } = contendedStudio('m4-prop-determinism')
      let state = starvedStudio('m4-prop-determinism')
      for (let week = 0; week < 12; week++) {
        state = pressureGreenlights(driveTakes(state), readyProjectIds)
        state = tick(state)
      }
      return state
    }
    expect(stableStringify(run())).toBe(stableStringify(run()))
  })

  it('charges nothing for waiting — the idle-freight law (`00E`.16)', () => {
    // Payroll and overhead are facts about CONTRACTS and the estate, not about
    // the queue. Over a run in which pictures are variously running, blocked and
    // queued — with the roster and the facilities held constant — the weekly
    // standing outflow must be the SAME NUMBER every week. A queue-specific
    // charge of any size would show up here as a second value.
    const { readyProjectIds } = contendedStudio('m4-idle-freight')
    let state = starvedStudio('m4-idle-freight')
    const standingOutflowByWeek = new Map<number, number>()
    const waitingWeeks: number[] = []
    const quietWeeks: number[] = []

    for (let week = 0; week < 16; week++) {
      const before = state.ledger.length
      state = pressureGreenlights(driveTakes(state), readyProjectIds)
      state = tick(state)
      const added: LedgerEntry[] = state.ledger.slice(before)
      const standing = added
        .filter(
          (entry) =>
            entry.kind === 'payroll' ||
            entry.kind === 'overhead' ||
            entry.kind === 'facilityOpex',
        )
        .reduce((sum, entry) => sum + entry.amount, 0)
      const advancedWeek = state.market.tick
      standingOutflowByWeek.set(advancedWeek, standing)
      const waiting =
        state.operations.workflows.some((workflow) => workflow.blocker !== null) ||
        state.productionQueue.length > 0
      if (waiting) waitingWeeks.push(advancedWeek)
      else quietWeeks.push(advancedWeek)
    }

    // The run must contain both kinds of week or the comparison is vacuous.
    expect(waitingWeeks.length).toBeGreaterThan(0)
    expect(quietWeeks.length).toBeGreaterThan(0)
    const waitingCharges = new Set(waitingWeeks.map((week) => standingOutflowByWeek.get(week)!))
    const quietCharges = new Set(quietWeeks.map((week) => standingOutflowByWeek.get(week)!))
    expect(waitingCharges.size).toBe(1)
    expect(quietCharges.size).toBe(1)
    expect([...waitingCharges]).toEqual([...quietCharges])
  })
})
