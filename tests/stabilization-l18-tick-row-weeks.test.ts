// Stabilization 2026-10-22, audit finding L-18 (CORE-06 ≡ PROD-09), Owner ruling 2026-10-23.
//
// The rule: a row for what happens DURING an advance carries the week the advance started
// from (t); a row for what the advance PRODUCES at the arrived week carries t + 1. The t + 1
// producers are named below, one entry each, so a new producer that dates its rows differently
// fails here instead of drifting in silently. A queue admission is a week t + 1 act in every
// row it writes: its ledger rows, its `startTick` and its studio-event rows.
//
// The walk: the C2a-M4 contended studio (a founded operations studio whose two pictures hold
// both Development & Casting slots), a greenlight the front door therefore queues, and eight
// advances. Each advance first answers the take commands the week is waiting on, and the first
// picture standing in rehearsal gets the ordinary setup recipe, so the walk also writes the
// three setup rows. Rows a command writes before the advance are not the tick's and are not
// diffed.
import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions, tick, TUNING } from '../src/core/index.js'
import type { GameState, GreenlightScriptProjectPayload } from '../src/core/index.js'
import { contendedStudio, freePackage } from './_m4Fixtures.js'
import { driveTakes } from './_p04a2WriterCreditFixtures.js'

const WEEKS = 8

/** Studio-event kinds a tick dates t + 1 whatever they concern. */
const ARRIVED_WEEK_EVENT_KINDS: ReadonlySet<string> = new Set([
  // A setup is admitted at the week the advance produces (operations.ts, the setup hold).
  'setupAdmitted',
  // A setup unit is credited at the week the advance produces.
  'setupUnitCredited',
  // A setup completes at the week the advance produces.
  'setupCompleted',
  // A placed facility opens at its committed completion week, the week the advance produces.
  'constructionCompleted',
  // A set stands at its committed completion week, the week the advance produces.
  'setBuilt',
  // A tick writes an expiry only in the queue's admission (a cancellation is a command row).
  'queueIntentExpired',
])

/** Studio-event kinds a queue admission writes for the picture it creates: t + 1 for that
 * production only, matched by the production the tick created. */
const ADMISSION_EVENT_KINDS: ReadonlySet<string> = new Set([
  // The admitted picture takes its first Development & Casting slot.
  'reservationGranted',
  // The admitted picture enters Development.
  'phaseEntered',
])

/** Ledger kinds a tick dates t + 1 whatever they concern. */
const ARRIVED_WEEK_LEDGER_KINDS: ReadonlySet<string> = new Set([
  // Plan admission (tick step 1.06) commits against the arrived week; the placement validator
  // ties the capex row to the placement's committed week.
  'constructionCapex',
  // Talent-market settlement runs in the tick's tail, on the incremented week.
  'signingBonus',
  // Studio closure runs in the tick's tail, on the incremented week.
  'claimPayment',
])

/** Ledger kinds a queue admission writes for the picture it creates: t + 1 for that production
 * only, so a hand-played greenlight's rows are never excused. */
const ADMISSION_LEDGER_KINDS: ReadonlySet<string> = new Set([
  // The admitted greenlight's negative and marketing.
  'production',
  // The admitted greenlight's one-film freelancer fees.
  'freelancerFee',
])

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

describe('L-18 / Owner ruling 2026-10-23 — the week a tick row carries', () => {
  it('each of eight advances dates its rows t, and only the named arrived-week producers t + 1', () => {
    expect(walk).toHaveLength(WEEKS)
    const kinds = new Set<string>()
    for (const step of walk) {
      expect(step.after.market.tick).toBe(step.week + 1)
      const admitted = new Set(admittedBy(step).map((production) => production.id))
      for (const row of ledgerAppended(step)) {
        const arrived = ARRIVED_WEEK_LEDGER_KINDS.has(row.kind) || (
          ADMISSION_LEDGER_KINDS.has(row.kind) &&
          row.productionId !== undefined && admitted.has(row.productionId))
        expect({ kind: row.kind, week: row.week }).toEqual({ kind: row.kind, week: arrived ? step.week + 1 : step.week })
      }
      for (const row of eventsAppended(step)) {
        kinds.add(row.kind)
        const subject = row.kind === 'reservationGranted' ? row.ownerId
          : row.kind === 'phaseEntered' ? row.productionId
            : null
        const arrived = ARRIVED_WEEK_EVENT_KINDS.has(row.kind) || (
          ADMISSION_EVENT_KINDS.has(row.kind) && subject !== null && admitted.has(subject))
        expect({ kind: row.kind, week: row.week }).toEqual({ kind: row.kind, week: arrived ? step.week + 1 : step.week })
      }
    }
    // The walk reached the rows the rule is about: formation rows during the advance, and the
    // setup rows the advance produces.
    expect([...kinds]).toEqual(expect.arrayContaining([
      'reservationGranted', 'phaseEntered', 'setupAdmitted', 'setupUnitCredited', 'setupCompleted',
    ]))
  })

  it('the queue-admitted greenlight is a week t + 1 greenlight in every row it writes', () => {
    const index = walk.findIndex((step) =>
      step.before.productionQueue.length === 1 && step.after.productionQueue.length === 0)
    expect(index, 'the queue admits the greenlight inside the walk').toBeGreaterThanOrEqual(0)
    expect(index, 'with an advance left to watch it').toBeLessThan(WEEKS - 1)
    const admission = walk[index]!
    const { week, after } = admission
    const arrived = week + 1
    const admitted = admittedBy(admission)
    expect(admitted).toHaveLength(1)
    const production = admitted[0]!
    expect(after.scriptDevelopment.projects.find((project) => project.id === queuedProjectId))
      .toMatchObject({ status: 'inProduction', productionId: production.id })

    expect(production.startTick).toBe(arrived)
    expect(ledgerAppended(admission).filter((row) => row.productionId === production.id)).toEqual([{
      week: arrived,
      kind: 'production',
      amount: -(payload.budget.negative + payload.budget.marketing),
      productionId: production.id,
      note: 'negative + marketing',
    }])
    const formation = eventsAppended(admission).filter((row) =>
      (row.kind === 'reservationGranted' && row.ownerId === production.id) ||
      (row.kind === 'phaseEntered' && row.productionId === production.id))
    expect(formation.map((row) => [row.kind, row.week])).toEqual([
      ['reservationGranted', arrived],
      ['phaseEntered', arrived],
    ])
    expect(production.id).toBe(`prod-${String(arrived).padStart(4, '0')}`)

    // The schedule is the one a week t + 1 greenlight has: admitted at the full countdown, and
    // skipped by the advance out of t + 1 (M1: startTick >= currentTick), so it has not moved.
    expect(production.remainingTicks).toBe(TUNING.PRODUCTION_TICKS)
    const following = walk[index + 1]!
    expect(following.after.studio.activeProductions.find((row) => row.id === production.id)?.remainingTicks)
      .toBe(TUNING.PRODUCTION_TICKS)
  })
})
