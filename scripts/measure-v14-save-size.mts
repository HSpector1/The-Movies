// C2a-M1 — THE SAVE-SIZE MEASUREMENT (charter §5.7, §5 pin 7).
//
// Run from the repository root:
//   node_modules/.bin/vite-node scripts/measure-v14-save-size.mts
//
// WHY IT EXISTS. §5 pin 7: "A one-off save-size measurement (weeks 52/208/520)
// runs BEFORE the retention window is fixed." `TUNING.STUDIO_EVENT_WINDOW_WEEKS`
// is the one number in the event model that trades legibility against a
// 120-year save file, and picking it by feel would be exactly the gut tuning the
// campaign forbids. So this measures it: the same studio, played the same way,
// exported at one year, four years, and TEN years, with the windowed log the
// engine actually writes beside the unwindowed log it would have written.
//
// WHAT IT MEASURES. `exportSave(makeSave(state)).length` — the real bytes a
// player's save file costs — at weeks 52 / 208 / 520 of one continuously
// operating managed studio that greenlights a picture whenever it has capacity.
// The unwindowed figure is the same envelope with every row the studio ever
// appended put back, so the delta is the window's whole contribution and
// nothing else.
//
// HOW IT STAYS HONEST. One seed, one policy, public actions only, no clock, no
// `Math.random`, and no tuning constant read as if it were a measurement. Two
// runs at one HEAD print identical numbers.
//
// ── RESULTS (recorded here per §5.7; regenerate by re-running) ───────────────
//
//   seed "c2a-m1-save-size", managed operations, two pictures in flight
//   continuously, roster kept staffed, 114 films released by week 520.
//   TUNING.STUDIO_EVENT_WINDOW_WEEKS = 26
//
//   week   save bytes   studioEvents bytes   rows   unwindowed rows   unwindowed bytes
//   ----   ----------   ------------------   ----   ---------------   ----------------
//     52      284,689               10,968    108               198             20,136
//    208      425,067               17,133    175               784             80,216
//    520      715,193               30,473    316             1,966            202,925
//
//   WHAT THE NUMBERS SAY, and why 26 is the answer:
//
//   * WINDOWING IS WORTH IT, and by how much is now a number: at ten years the
//     log costs 30.5 kB instead of 202.9 kB. The window removes 1,650 of 1,966
//     rows — 84% of everything ever appended — and every one of them is Tier W
//     operating chatter (a reservation granted, a phase entered, scenery
//     arriving) that no consumer asks about after half a year.
//   * WHAT REMAINS GROWS, and SHOULD. The 316 surviving rows are dominated by
//     Tier D: 114 premieres and 114 wraps, one pair per film released. That is
//     identity-bearing history `persistedProductionIds` walks (law 20) and it is
//     permanent by design — the same reason the cash ledger is never pruned
//     (`00B`.5). The log is 4.3% of a 715 kB ten-year save; the other 96% is the
//     ledger, the released films, the theatrical runs, and the career events C2
//     never touches.
//   * 26 IS WHERE IT SHOULD SIT. It is half a game year, which answers every
//     recent-past question a consumer actually asks ("what is holding this
//     stage", "what happened while I was away", "why did this picture stall"),
//     and it is LARGER THAN THE LONGEST THING IT DESCRIBES — an 8-week
//     production, a 13-week build — so the window can never cut a story in half.
//     Doubling it to 52 would roughly double the Tier-W residue for no question
//     answered; halving it to 13 would put the window inside a single build.
//
import {
  applyActions,
  beginFounding,
  exportSave,
  generateWorld,
  makeSave,
  stableStringify,
  tick,
  TUNING,
} from '../src/core/index.js'
import type { CastSlot, GameState, SegmentId, StudioEvent, Talent } from '../src/core/index.js'

const SEED = 'c2a-m1-save-size'
const CHECKPOINTS = [52, 208, 520] as const

function byRole(talent: readonly Talent[], role: Talent['role']): Talent[] {
  return talent.filter((person) => person.role === role)
}

function contractedByRole(state: GameState, role: Talent['role']): Talent[] {
  const contracted = new Set(state.contracts.map((contract) => contract.talentId))
  return state.talent.filter((person) => person.role === role && contracted.has(person.id))
}

/** A founded, operations-managed studio with roster depth to keep shooting. */
function operatingStudio(seed: string): GameState {
  let state = beginFounding(generateWorld(seed))
  const applicants = state.founding!.applicantIds.map(
    (id) => state.talent.find((person) => person.id === id)!,
  )
  const counts = { actor: 9, director: 3, writer: 4, craft: 3 } as const
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    for (const person of byRole(applicants, role).slice(0, counts[role])) {
      state = applyActions(state, [
        { kind: 'signContract', talentId: person.id, termWeeks: 1_040 },
      ])
    }
  }
  state = applyActions(state, [{ kind: 'foundStudio' }])
  state = applyActions(state, [{ kind: 'activateStudioOperations' }])
  // A SOLVENCY FLOOR, not a balance claim. This script measures BYTES, and a
  // studio that runs out of money stops greenlighting and stops producing
  // history — which would measure the economy instead of the log. The credit is
  // booked as a real ledger row so the cash/ledger identity every validator
  // checks stays true.
  const credit = 5_000_000_000 - state.studio.cash
  return {
    ...state,
    studio: { ...state.studio, cash: state.studio.cash + credit },
    ledger: [
      ...state.ledger,
      {
        week: state.market.tick,
        kind: 'studioRevenue' as const,
        amount: credit,
        note: 'save-size measurement solvency floor',
      },
    ],
  }
}

const ROSTER_FLOOR = { actor: 9, director: 3, writer: 4, craft: 3 } as const

/** Sign available free agents back up to the roster floor, role by role. */
function restaffed(state: GameState): GameState {
  let out = state
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    let held = contractedByRole(out, role).length
    if (held >= ROSTER_FLOOR[role]) continue
    for (const person of byRole(out.talent, role)) {
      if (held >= ROSTER_FLOOR[role]) break
      if (out.contracts.some((contract) => contract.talentId === person.id)) continue
      try {
        out = applyActions(out, [
          { kind: 'signContract', talentId: person.id, termWeeks: 104 },
        ])
        held += 1
      } catch {
        // Not available to sign this week — a legal answer, not a failure.
      }
    }
  }
  return out
}

/** The plain greenlight door, packaged from whatever the studio has under contract. */
function greenlightPayload(state: GameState, conceptIndex: number) {
  const concept = state.concepts[conceptIndex % state.concepts.length]!
  const actors = contractedByRole(state, 'actor')
  const writers = contractedByRole(state, 'writer')
  const directors = contractedByRole(state, 'director')
  const craft = contractedByRole(state, 'craft')
  const busy = new Set(
    state.studio.activeProductions.flatMap((production) => [
      production.writerId,
      production.directorId,
      production.cast.lead,
      production.cast.antagonist,
      production.cast.support,
      ...production.craftIds,
    ]),
  )
  const free = (people: readonly Talent[]): Talent[] =>
    people.filter((person) => !busy.has(person.id))
  const freeActors = free(actors)
  const writer = free(writers)[0]
  const director = free(directors)[0]
  const crafts = free(craft)[0]
  if (
    writer === undefined ||
    director === undefined ||
    crafts === undefined ||
    freeActors.length < 3
  ) {
    return null
  }
  return {
    conceptId: concept.id,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' } as const,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'] as SegmentId[],
      ranges: {
        intimacy: [-0.5, 0.5] as [number, number],
        tonalWeight: [-0.5, 0.5] as [number, number],
        kineticEnergy: [-0.5, 0.5] as [number, number],
      },
    },
    writerId: writer.id,
    directorId: director.id,
    cast: {
      lead: freeActors[0]!.id,
      antagonist: freeActors[1]!.id,
      support: freeActors[2]!.id,
    } as Record<CastSlot, string>,
    craftIds: [crafts.id],
    budget: { negative: concept.baseNegativeCost, marketing: 0 },
  }
}

type Row = { readonly length: number; readonly line: string }

function measure(): Row[] {
  let state = operatingStudio(SEED)
  // Every row the studio ever appended, indexed by seq so a compaction cannot
  // remove one from the unwindowed tally. `nextSeq` never rewinds, so seq is a
  // stable key for the life of the campaign.
  const everAppended = new Map<number, StudioEvent>()
  const rows: Row[] = []
  let conceptIndex = 0

  const collect = (): void => {
    for (const row of state.studioEvents.rows) everAppended.set(row.seq, row)
  }
  collect()

  for (let week = 1; week <= CHECKPOINTS[CHECKPOINTS.length - 1]!; week++) {
    // KEEP THE ROSTER STAFFED. Contracts expire; a studio that lets its whole
    // roster walk stops making pictures, and a ten-year measurement of an empty
    // lot measures nothing. Re-signing available free agents is the ordinary
    // operating behaviour the harnesses already model.
    state = restaffed(state)

    if (state.studio.activeProductions.length < TUNING.MAX_CONCURRENT_PRODUCTIONS) {
      const payload = greenlightPayload(state, conceptIndex)
      if (payload !== null) {
        state = applyActions(state, [{ kind: 'greenlight', production: payload }])
        conceptIndex += 1
      }
    }
    // The three Shooting commands a managed picture needs from its studio. Left
    // undriven, every production stalls on its take and the studio produces no
    // history at all — which is a measurement of an idle lot, not of a working
    // one.
    for (const workflow of state.operations.workflows) {
      const task = workflow.shootingTask
      if (task === null) continue
      const productionId = workflow.productionId
      if (task.status === 'unassigned') {
        const production = state.studio.activeProductions.find((p) => p.id === productionId)!
        state = applyActions(state, [
          { kind: 'assignShootingDirector', productionId, directorId: production.directorId },
        ])
      }
    }
    for (const workflow of state.operations.workflows) {
      if (workflow.shootingTask?.status === 'blocked') {
        state = applyActions(state, [
          { kind: 'clearSceneryLoadIn', productionId: workflow.productionId },
        ])
      }
    }
    for (const workflow of state.operations.workflows) {
      if (workflow.shootingTask?.status === 'ready') {
        state = applyActions(state, [
          { kind: 'scheduleShootingTake', productionId: workflow.productionId },
        ])
      }
    }

    state = tick(state)
    collect()

    if (!(CHECKPOINTS as readonly number[]).includes(state.market.tick)) continue

    const save = makeSave(state)
    const saveBytes = exportSave(save).length
    const windowedBytes = stableStringify(state.studioEvents).length
    const unwindowed = [...everAppended.values()].sort((a, b) => a.seq - b.seq)
    const unwindowedBytes = stableStringify({
      nextSeq: state.studioEvents.nextSeq,
      rows: unwindowed,
    }).length
    rows.push({
      length: saveBytes,
      line: [
        String(state.market.tick).padStart(4),
        saveBytes.toLocaleString('en-US').padStart(12),
        windowedBytes.toLocaleString('en-US').padStart(20),
        String(state.studioEvents.rows.length).padStart(6),
        String(unwindowed.length).padStart(17),
        unwindowedBytes.toLocaleString('en-US').padStart(18),
      ].join(' '),
    })
  }
  return rows
}

const measured = measure()
process.stdout.write(
  `C2a-M1 save-size measurement — seed "${SEED}", STUDIO_EVENT_WINDOW_WEEKS = ${String(
    TUNING.STUDIO_EVENT_WINDOW_WEEKS,
  )}\n\n`,
)
process.stdout.write(
  'week   save bytes   studioEvents bytes   rows   unwindowed rows   unwindowed bytes\n',
)
process.stdout.write(
  '----   ----------   ------------------   ----   ---------------   ----------------\n',
)
for (const row of measured) process.stdout.write(`${row.line}\n`)
