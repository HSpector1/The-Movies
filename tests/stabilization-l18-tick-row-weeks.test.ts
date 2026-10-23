// Stabilization 2026-10-22, audit finding L-18 (CORE-06 ≡ PROD-09), Owner decision 5A.
//
// The convention: every ledger row and studio-event row tick(t) appends carries week t, the
// week the advance started from. The allow-list below names every exception explicitly, so a
// new producer that dates its rows differently fails here instead of drifting in silently.
// Two kinds of exception exist. The completion-dated studio-event kinds carry their own week by
// design. Four ledger producers still write the arrived week t + 1; they are the remaining L-18
// gap, named for the Owner and not changed here (see the comment at the tick's event sink).
//
// The walk: the C2a-M4 contended studio (a founded operations studio whose two pictures hold
// both Development & Casting slots), a greenlight the front door therefore queues, and eight
// advances. Each advance first answers the take commands the week is waiting on, and the first
// picture standing in rehearsal gets the ordinary setup recipe, so the walk also writes the
// three setup rows of the allow-list. Rows a command writes before the advance are not the
// tick's and are not diffed.
import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions, tick } from '../src/core/index.js'
import type { GameState, GreenlightScriptProjectPayload } from '../src/core/index.js'
import { contendedStudio, freePackage } from './_m4Fixtures.js'
import { driveTakes } from './_p04a2WriterCreditFixtures.js'

const WEEKS = 8

/** Studio-event kinds dated by their own completion, never by the advance: t + 1 in this walk. */
const COMPLETION_DATED_EVENT_KINDS: ReadonlySet<string> = new Set([
  // A setup is admitted at the week the advance produces (operations.ts, the setup hold).
  'setupAdmitted',
  // A setup unit is credited at the week the advance produces.
  'setupUnitCredited',
  // A setup completes at the week the advance produces.
  'setupCompleted',
  // A placed facility opens at its committed completion week.
  'constructionCompleted',
  // A set stands at its committed completion week.
  'setBuilt',
])

/** Ledger kinds a tick still dates t + 1 (the arrived week): remaining L-18 producers for the Owner. */
const ARRIVED_WEEK_LEDGER_KINDS: ReadonlySet<string> = new Set([
  // Plan admission (tick step 1.06) commits against the arrived week; the placement validator
  // ties the capex row to the placement's committed week.
  'constructionCapex',
  // Talent-market settlement runs in the tick's tail, on the incremented week.
  'signingBonus',
  // Studio closure runs in the tick's tail, on the incremented week.
  'claimPayment',
])

/** A greenlight the queue admits during the advance (matched by its production id, so a
 * hand-played greenlight's rows are never excused) still dates these t + 1: the placement and
 * Annex reservation invariants (placement.ts:2291, construction.ts:342) tie them to its
 * `startTick`, which is the schedule gate. */
const ADMITTED_GREENLIGHT_LEDGER_KINDS: ReadonlySet<string> = new Set(['production', 'freelancerFee'])

type Advance = { week: number; before: GameState; after: GameState }

const walk: Advance[] = []
let queuedProjectId = ''
let payload: GreenlightScriptProjectPayload

beforeAll(() => {
  // The seed of c2a-m4-queue-admission's greenlight case, which queues and admits this package.
  const { state, readyProjectIds } = contendedStudio('m4-greenlight-queue')
  queuedProjectId = readyProjectIds[0]!
  payload = freePackage(state, queuedProjectId)
  let next = applyActions(state, [{ kind: 'greenlightScriptProject', production: payload }])
  expect(next.productionQueue, 'both slots are held, so the front door queues the greenlight').toHaveLength(1)
  let setupChosen = false
  for (let i = 0; i < WEEKS; i++) {
    let before = driveTakes(next)
    if (!setupChosen) {
      const rehearsing = before.operations.workflows.find((workflow) =>
        workflow.phase === 'rehearsal' && workflow.setup === null &&
        workflow.bindings.stageFacilityId !== null && workflow.bindings.setId !== null)
      if (rehearsing !== undefined) {
        before = applyActions(before, [{
          kind: 'setProductionSetupRecipe',
          productionId: rehearsing.productionId,
          recipeId: 'ordinary-interior-01',
          expectedPlanRevision: rehearsing.planRevision,
        }])
        setupChosen = true
      }
    }
    next = tick(before)
    walk.push({ week: before.market.tick, before, after: next })
  }
}, 120_000)

function ledgerAppended({ before, after }: Advance) {
  expect(after.ledger.slice(0, before.ledger.length), 'the ledger is append-only').toEqual(before.ledger)
  return after.ledger.slice(before.ledger.length)
}

function eventsAppended({ before, after }: Advance) {
  return after.studioEvents.rows.filter((row) => row.seq >= before.studioEvents.nextSeq)
}

/** Productions the advance created: a tick creates one only by admitting a queued greenlight. */
function admittedBy({ before, after }: Advance) {
  const known = new Set(before.studio.activeProductions.map((production) => production.id))
  return after.studio.activeProductions.filter((production) => !known.has(production.id))
}

describe('L-18 / Owner decision 5A — the week a tick row carries', () => {
  it('each of eight advances dates its ledger and studio-event rows t, outside the named allow-list', () => {
    expect(walk).toHaveLength(WEEKS)
    const kinds = new Set<string>()
    for (const step of walk) {
      expect(step.after.market.tick).toBe(step.week + 1)
      const admitted = new Set(admittedBy(step).map((production) => production.id))
      for (const row of ledgerAppended(step)) {
        const arrived = ARRIVED_WEEK_LEDGER_KINDS.has(row.kind) || (
          ADMITTED_GREENLIGHT_LEDGER_KINDS.has(row.kind) &&
          row.productionId !== undefined && admitted.has(row.productionId))
        expect({ kind: row.kind, week: row.week }).toEqual({ kind: row.kind, week: arrived ? step.week + 1 : step.week })
      }
      for (const row of eventsAppended(step)) {
        kinds.add(row.kind)
        const expected = COMPLETION_DATED_EVENT_KINDS.has(row.kind) ? step.week + 1 : step.week
        expect({ kind: row.kind, week: row.week }).toEqual({ kind: row.kind, week: expected })
      }
    }
    // The walk reached the rows the convention is about: a greenlight's formation, and the
    // setup rows the completion-dated allow-list exists for.
    expect([...kinds]).toEqual(expect.arrayContaining([
      'reservationGranted', 'phaseEntered', 'setupAdmitted', 'setupUnitCredited', 'setupCompleted',
    ]))
  })

  it('the queue-admitted greenlight, as it stands: the L-18 gap the Owner has not yet ruled on', () => {
    const index = walk.findIndex((step) =>
      step.before.productionQueue.length === 1 && step.after.productionQueue.length === 0)
    expect(index, 'the queue admits the greenlight inside the walk').toBeGreaterThanOrEqual(0)
    expect(index, 'with an advance left to watch it').toBeLessThan(WEEKS - 1)
    const admission = walk[index]!
    const { week, after } = admission
    const admitted = admittedBy(admission)
    expect(admitted).toHaveLength(1)
    const production = admitted[0]!
    expect(after.scriptDevelopment.projects.find((project) => project.id === queuedProjectId))
      .toMatchObject({ status: 'inProduction', productionId: production.id })

    // THE GAP, pinned by name so it cannot drift: the picture's schedule gate and its debit carry
    // the arrived week t + 1, while its formation rows went through the tick's sink at t.
    expect(production.startTick).toBe(week + 1)
    expect(ledgerAppended(admission).filter((row) => row.productionId === production.id)).toEqual([{
      week: week + 1,
      kind: 'production',
      amount: -(payload.budget.negative + payload.budget.marketing),
      productionId: production.id,
      note: 'negative + marketing',
    }])
    const formation = eventsAppended(admission).filter((row) =>
      (row.kind === 'reservationGranted' && row.ownerId === production.id) ||
      (row.kind === 'phaseEntered' && row.productionId === production.id))
    expect(formation.map((row) => [row.kind, row.week])).toEqual([
      ['reservationGranted', week],
      ['phaseEntered', week],
    ])
    expect(production.id).toBe(`prod-${String(week + 1).padStart(4, '0')}`)

    // The schedule the gate produces: dated t + 1, the picture also skips tick t + 1 (M1:
    // startTick >= currentTick), so it has not moved one advance after its admission.
    const following = walk[index + 1]!
    expect(following.after.studio.activeProductions.find((row) => row.id === production.id)?.remainingTicks)
      .toBe(8)
  })
})
