/**
 * P04A.3 — REAL-CAMPAIGN GREENLIGHT LAW (§11 A/B/D).
 *
 * The Owner rejected P04 acceptance with a working casting surface and a dead
 * Greenlight button. Two laws come out of that, and both are asserted here
 * against the same one-writer/two-screenplay world the original playtest
 * failure happened in (`_p04a2WriterCreditFixtures.buildScenario`):
 *
 *   §11A — A package blocked ONLY by Development & Casting capacity is LEGAL.
 *          It queues; it does not refuse. Nothing — no money, no talent, no
 *          production identity — may be committed before the queue admits it.
 *
 *   §11D — A completed screenplay's credited Writer is a CREDIT, not new
 *          labour. Their contract state, freelancer-market membership and
 *          availability cannot gate a greenlight, and no one-film Writer fee is
 *          charged for the credit. Director, cast and Craft keep every existing
 *          eligibility rule and every existing cost.
 *
 * The §11D half is the one that had a real teeth-in-both-layers hazard: the
 * projection stopped publishing a writer-contract blocker, so the engine's own
 * `isContracted(project.writerId)` throw had to go with it. Had only one moved,
 * the board would have offered a greenlight the engine refused — a rejection
 * with no warning anywhere, which is the exact shape of the P04A.1 deadlock.
 * The tests below therefore assert BOTH layers, not just the read model.
 */
import { describe, expect, it } from 'vitest'

import {
  applyActions,
  assignmentProjectCost,
  isContracted,
  scriptCapacityView,
  scriptProjectsReadModel,
} from '../src/core/index.js'
import type { GameState } from '../src/core/index.js'
import {
  buildScenario,
  greenlightA,
  refusal,
  SEED,
} from './_p04a2WriterCreditFixtures.js'

/** The same world, with exactly ONE shared Development & Casting slot. */
function withSingleDevelopmentCastingSlot(state: GameState): GameState {
  return {
    ...state,
    operations: {
      ...state.operations,
      facilities: state.operations.facilities.map((facility) =>
        facility.capability === 'development-casting'
          ? { ...facility, capacity: 1 }
          : facility,
      ),
    },
  }
}

function packageFor(state: GameState, projectId: string) {
  const view = scriptProjectsReadModel(state).packages.find((p) => p.projectId === projectId)
  expect(view, `no Ready package view for ${projectId}`).toBeDefined()
  return view!
}

// ─────────────────────────────────────────────────────────────────────────────
// §11A — QUEUEABLE CAPACITY IS THE PRIMARY REGRESSION
// ─────────────────────────────────────────────────────────────────────────────
describe('P04A.3 §11A — a capacity-only blocker queues, it never refuses', () => {
  it('publishes facility-capacity as the ONLY blocker, and still permits submission', () => {
    const scenario = buildScenario(SEED)
    const state = withSingleDevelopmentCastingSlot(scenario.deadlock)

    const capacity = scriptCapacityView(state)
    expect(capacity.capacity).toBe(1)
    expect(capacity.available).toBe(0)

    const availability = packageFor(state, scenario.projectAId).availability
    const kinds = availability.blockers.map((b) => b.kind)

    // The writer is drafting B. That must produce NO blocker on A's package.
    expect(kinds).not.toContain('writer-contract')
    expect(kinds).not.toContain('writer-assignment')
    expect(availability.writerAvailable).toBe(true)

    // Capacity is the one and only thing standing in the way…
    expect(kinds).toEqual(['facility-capacity'])
    // …and it does not refuse.
    expect(availability.knownGatesClear).toBe(false)
    expect(availability.canSubmitGreenlightIntent).toBe(true)
    expect(availability.willQueueGreenlightIntent).toBe(true)
  })

  it('commits the greenlight to the QUEUE, committing no money, talent or production identity', () => {
    const scenario = buildScenario(SEED)
    const state = withSingleDevelopmentCastingSlot(scenario.deadlock)

    const cashBefore = state.studio.cash
    const productionsBefore = state.studio.activeProductions.length
    const queueBefore = state.productionQueue.length
    const ledgerBefore = state.ledger.length

    const next = applyActions(state, [greenlightA(scenario)])

    // It was accepted — it queued rather than throwing.
    expect(next.productionQueue.length).toBe(queueBefore + 1)
    expect(next.productionQueue.some((e) => e.kind === 'greenlightScriptProject')).toBe(true)

    // NOTHING is committed before admission. This is the whole promise the
    // queue copy makes to the player, so it is asserted on every axis.
    expect(next.studio.cash).toBe(cashBefore)
    expect(next.studio.activeProductions.length).toBe(productionsBefore)
    expect(next.ledger.length).toBe(ledgerBefore)
  })

  it('with a free slot the same package starts immediately instead', () => {
    const scenario = buildScenario(SEED)

    // readyOnly: A is Ready and the writer is drafting nothing, so the shared
    // slot is free. Same package, same seed — only capacity differs.
    const availability = packageFor(scenario.readyOnly, scenario.projectAId).availability
    expect(availability.blockers).toEqual([])
    expect(availability.knownGatesClear).toBe(true)
    expect(availability.willQueueGreenlightIntent).toBe(false)

    const next = applyActions(scenario.readyOnly, [greenlightA(scenario)])
    expect(next.studio.activeProductions.length).toBe(
      scenario.readyOnly.studio.activeProductions.length + 1,
    )
    expect(next.productionQueue.length).toBe(scenario.readyOnly.productionQueue.length)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// §11D — AN OUT-OF-CONTRACT CREDITED WRITER
// ─────────────────────────────────────────────────────────────────────────────
describe('P04A.3 §11D — a credited Writer out of contract cannot block a greenlight', () => {
  /** The same world with the credited writer's studio contract removed. */
  function withLapsedWriterContract(scenario: ReturnType<typeof buildScenario>): GameState {
    const state: GameState = {
      ...scenario.readyOnly,
      contracts: scenario.readyOnly.contracts.filter((c) => c.talentId !== scenario.writerId),
    }
    expect(isContracted(state, scenario.writerId)).toBe(false)
    return state
  }

  it('keeps the screenplay credit and publishes NO writer blocker', () => {
    const scenario = buildScenario(SEED)
    const state = withLapsedWriterContract(scenario)

    // The credit is permanent — it survives the contract lapsing.
    expect(state.scriptDevelopment.projects.find((p) => p.id === scenario.projectAId)!.writerId)
      .toBe(scenario.writerId)

    const availability = packageFor(state, scenario.projectAId).availability
    const kinds = availability.blockers.map((b) => b.kind)
    expect(kinds).not.toContain('writer-contract')
    expect(kinds).not.toContain('writer-assignment')
    expect(availability.writerAvailable).toBe(true)
    expect(availability.canSubmitGreenlightIntent).toBe(true)
  })

  it('greenlights successfully at the ENGINE layer too — the two surfaces agree', () => {
    const scenario = buildScenario(SEED)
    const state = withLapsedWriterContract(scenario)

    // Before P04A.3 this threw:
    //   "greenlightScriptProject rejected — writer ... must be currently studio-contracted"
    // A projection that published no blocker while this threw would have been
    // strictly worse than the deadlock it replaced.
    const next = applyActions(state, [greenlightA(scenario)])
    expect(next.studio.activeProductions.length).toBe(state.studio.activeProductions.length + 1)

    const production = next.studio.activeProductions[next.studio.activeProductions.length - 1]!
    expect(production.writerId).toBe(scenario.writerId)
  })

  it('charges NO one-film freelancer fee for the credited writer', () => {
    const scenario = buildScenario(SEED)
    const state = withLapsedWriterContract(scenario)

    // The assertion is only worth making if the fee is REAL. An out-of-contract
    // person in an engaged economy carries a positive one-film cost, so this is
    // a fee the old law would have charged and the new one must not.
    const writerFee = assignmentProjectCost(state, scenario.writerId)
    expect(writerFee).toBeGreaterThan(0)

    const next = applyActions(state, [greenlightA(scenario)])
    const fees = next.ledger
      .slice(state.ledger.length)
      .filter((entry) => entry.kind === 'freelancerFee')
    expect(fees.map((f) => f.talentId)).not.toContain(scenario.writerId)

    // And prove it by the money, not only by the absence of a ledger row: the
    // cash actually taken is the budget plus the FIVE SEATS' costs exactly, with
    // no room for the writer's fee in it.
    const seatIds = [
      scenario.packageA.directorId,
      scenario.packageA.cast.lead,
      scenario.packageA.cast.antagonist,
      scenario.packageA.cast.support,
      ...scenario.packageA.craftIds,
    ]
    const seatCost = seatIds.reduce((sum, id) => sum + assignmentProjectCost(state, id), 0)
    const budget = scenario.packageA.budget
    const debited = state.studio.cash - next.studio.cash
    expect(debited).toBe(budget.negative + budget.marketing + seatCost)
    expect(debited).not.toBe(budget.negative + budget.marketing + seatCost + writerFee)
  })

  it('leaves Director, cast and Craft eligibility and cost exactly as they were', () => {
    const scenario = buildScenario(SEED)

    // Baseline: the fully contracted world.
    const baseline = applyActions(scenario.readyOnly, [greenlightA(scenario)])
    const baselineFees = baseline.ledger
      .slice(scenario.readyOnly.ledger.length)
      .filter((e) => e.kind === 'freelancerFee')

    // Same greenlight, only the WRITER's contract lapsed.
    const lapsed = withLapsedWriterContract(scenario)
    const after = applyActions(lapsed, [greenlightA(scenario)])
    const afterFees = after.ledger
      .slice(lapsed.ledger.length)
      .filter((e) => e.kind === 'freelancerFee')

    // The seats' costs are identical — the writer's contract state is not an
    // input to anyone else's eligibility or fee.
    expect(afterFees.map((f) => ({ talentId: f.talentId, amount: f.amount })))
      .toEqual(baselineFees.map((f) => ({ talentId: f.talentId, amount: f.amount })))
    expect(after.studio.cash).toBe(baseline.studio.cash)
  })

  it('still refuses REAL writing work from an out-of-contract writer', () => {
    const scenario = buildScenario(SEED)
    const state = withLapsedWriterContract(scenario)

    // The correction is scoped to the CREDIT. Commissioning new writing from an
    // out-of-contract writer is real labour and stays refused.
    const message = refusal(() =>
      applyActions(state, [
        {
          kind: 'commissionScript',
          project: {
            conceptId: scenario.conceptB.id,
            writerId: scenario.writerId,
            shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
            promise: {
              genre: scenario.conceptB.genre,
              intendedSegments: ['adult'],
              ranges: {
                intimacy: [-0.4, 0.6],
                kineticEnergy: [-0.7, 0.2],
                tonalWeight: [0, 0.8],
              },
            },
          },
        } as never,
      ]),
    )
    expect(message).toMatch(/not currently studio-contracted/)
  })
})
