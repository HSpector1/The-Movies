import type { GameState } from './types.js'

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

  return taken
}
