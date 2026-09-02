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
  // P06A (charter W1, law 20): the release authority names productions; its
  // rows join the walk the week the root lands. `undefined` is a legitimate
  // input, not a defect — exactly the studioEvents rule above: this walk runs
  // inside invariants the save validators apply to FROZEN pre-V16 fragments,
  // and a state that predates the root reserves no identities through it.
  const releaseAuthority = (state as Partial<GameState>).releaseAuthority
  for (const row of releaseAuthority?.commitments ?? []) add(row.productionId)
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
 * EVERY PLACE A CONCEPT IDENTITY IS PERSISTED — the concept analogue of
 * `persistedProductionIds`, and the reservation the C2a-M3 screenplay mint checks
 * against so a `concept-orig-NNNN` id is never re-minted (charter §3.5; guardrail
 * `00B`.2 in its concept form; G17).
 *
 * FIVE ROOTS, and lane 14 §3.3 verified the list is exactly five by walking every
 * persisted type: the source of truth `state.concepts`, plus the four roots that
 * hold a `conceptId` after the concept itself is claimed —
 *
 *   * `studio.activeProductions[].conceptId` — a picture in flight;
 *   * `studio.releasedFilms[].conceptId` — a picture in the library, forever;
 *   * `theatricalRuns[].conceptId` — a run still on screens;
 *   * `scriptDevelopment.projects[].conceptId` — a screenplay in development.
 *
 * The roots that carry NO concept id are as load-bearing as the ones that do, so
 * they are named rather than left to a reader to re-derive: the cash ledger
 * (talent/production/construction ids only), `careerEvents` (whose `filmId` is a
 * PRODUCTION id and whose `filmTitle` is a frozen string), broadcast items and
 * coverage contexts (production ids), and the operations workflows. Over-reserving
 * against those would burn ids for no reason; under-reserving against the five
 * would re-mint a live identity.
 *
 * Read DEFENSIVELY, exactly as `persistedProductionIds` is, because the save
 * validators call identity checks over FROZEN V8–V13 fragments that genuinely
 * predate later roots.
 */
export function persistedConceptIds(state: GameState): Set<string> {
  const taken = new Set<string>()
  const add = (id: string | null | undefined): void => {
    if (id !== null && id !== undefined) taken.add(id)
  }

  for (const concept of state.concepts ?? []) add(concept.id)
  for (const active of state.studio.activeProductions) add(active.conceptId)
  for (const film of state.studio.releasedFilms) add(film.conceptId)
  for (const run of state.theatricalRuns ?? []) add(run.conceptId)
  for (const project of state.scriptDevelopment.projects) add(project.conceptId)
  // The blueprint root is a sixth witness rather than a fifth source: a blueprint
  // can only exist for a concept that exists. It joins the walk anyway, in BOTH
  // directions, because that is the rule every new identity-bearing root follows
  // the week it lands (§8.2, law 20).
  for (const blueprint of state.originalScreenplays?.blueprints ?? []) add(blueprint.conceptId)

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
