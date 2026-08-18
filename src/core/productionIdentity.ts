import { studioEventProductionIds } from './studioEvents.js'
import type { GameState, ProductionQueueEntry } from './types.js'

// A production identity remains authoritative after the live Production
// disappears. Cancellation deliberately keeps sunk greenlight entries in the
// ledger, and released-film consumers retain the same identity indefinitely.
// Any allocator or cross-domain reservation gate must therefore collide against
// every persisted consumer, not merely the active/released production arrays.
export function persistedProductionIds(state: GameState): Set<string> {
  const taken = new Set<string>()
  const add = (id: string | null | undefined): void => {
    if (id !== null && id !== undefined) taken.add(id)
  }

  for (const active of state.studio.activeProductions) add(active.id)
  for (const film of state.studio.releasedFilms) add(film.productionId)
  for (const run of state.theatricalRuns) add(run.productionId)
  for (const entry of state.ledger) add(entry.productionId)
  for (const event of state.careerEvents) add(event.filmId)
  for (const item of state.broadcastItems) {
    add(item.facts.filmId)
    if (item.topic === 'release') {
      add(item.subjectId)
      add(item.facts.subjectId)
    }
  }
  // CoverageContext predates the explicit `filmId` fact and retains only its
  // subject. Reserve it conservatively in case a legacy context's subject is a
  // production id.
  for (const context of state.coverageContexts) add(context.subjectId)
  for (const workflow of state.operations.workflows) {
    add(workflow.productionId)
    for (const reservation of workflow.reservations) add(reservation.productionId)
    add(workflow.shootingTask?.productionId)
  }
  for (const project of state.scriptDevelopment.projects) add(project.productionId)
  // C2a-M1 (charter §8.2, law 20): every new root that can carry a production
  // identity joins this walk in BOTH directions the week it lands.
  //
  //   * `studioEvents` Tier D — `wrapped` and `premiere` name a production, and
  //     Tier D is permanent, so a picture that wrapped in 1931 still owns its id
  //     in 2040. This is the ONE place in `src/core` allowed to read the event
  //     log (pin 2: witness, never input), and an invariant test enforces that.
  //   * `productionQueue` — DEFENSE IN DEPTH only. A queue row carries no
  //     production id by construction (§5.3: nothing is held while queued, and no
  //     production exists before greenlight), so this walk finds nothing today.
  //     It is here so the day a queue arm gains one, the identity is reserved
  //     rather than quietly re-mintable.
  //
  // BOTH ROOTS ARE READ DEFENSIVELY, and that is not paranoia: this function runs
  // inside the placement and construction invariants, which the save validators
  // call over FROZEN V11/V12/V13 fragments — states that genuinely predate these
  // roots and cannot be expected to carry them. A fragment with no history
  // reserves no identities, which is exactly right.
  for (const id of studioEventProductionIds(state.studioEvents)) add(id)
  for (const entry of state.productionQueue ?? []) add(queueEntryProductionId(entry))

  return taken
}

/**
 * The production identity a queue row carries — which is NONE, for every arm, on
 * purpose (§5.3): a queued intent references a script project, and no production
 * exists until greenlight commits one.
 *
 * This is written as an exhaustive switch rather than omitted, because the value
 * of a defense-in-depth walk is entirely in the day somebody adds an arm. The
 * `never` guard makes that day a compile error instead of a silent re-mint.
 */
function queueEntryProductionId(entry: ProductionQueueEntry): string | null {
  switch (entry.kind) {
    case 'commissionScript':
    case 'commissionOriginalScreenplay':
    case 'startCastingSession':
    case 'greenlightScriptProject':
      return null
    default: {
      const unreachable: never = entry
      return unreachable
    }
  }
}
