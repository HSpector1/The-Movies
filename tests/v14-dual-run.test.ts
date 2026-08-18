// ── C2a-M1 · DUAL-RUN EQUALITY + PRESENTATION PARITY (§5.6, §12-M1 gate) ────
//
// CHARTER (r3.2 §5.6): the event migration is five phases, and phase 2 is
// "dual-run equality vs all 17 diff-detectors" — the engine's new ledger and the
// UI's existing state-diffs must agree about what happened before any detector
// is allowed to flip to reading the log.
//
// WHAT THIS SUITE IS, and why it lives in `tests/` rather than `ui/`. A
// diff-detector is a pure derivation: it looks at the state before an advance
// and the state after it, and reports the transition it can see. The DERIVATION
// is the thing that has to agree with the ledger — not any particular file that
// implements it — so it is re-implemented here from the state pair alone, with
// no import from `ui/` and no knowledge of how any detector is written. If the
// engine's row and the state-diff's answer ever part company, one of them is
// lying about the same week, and this suite says which transition it was.
//
// THE FAMILIES COVERED are exactly the ones M1's producers write (§12-M1):
// greenlight formation, phase entry, wrap, construction completion, premiere,
// and the reservation grants and releases underneath them.
//
// THE PRESENTATION-PARITY ASSERTION (§12-M1, charter-owned; also PF1 §2's
// obligation once PF1 ships). Engine-side it is two claims:
//   * the log is a WITNESS, never an input — reading it, serialising it, or
//     projecting it any number of times changes not one byte of the run;
//   * two identical runs export identical saves, and the ONLY run option the
//     engine exposes is `develop`, which is a simulation gate rather than a
//     presentation one. There is no presentation flag to differ on, and this
//     suite is what would notice if one were ever added.
//
// Seeded RNG only; no wall clock; no unseeded entropy.

import { describe, expect, it } from 'vitest'

import {
  applyActions,
  exportSave,
  generateWorld,
  isTierDStudioEventKind,
  makeSave,
  OracleAgent,
  stableStringify,
  tick,
  TUNING,
} from '../src/core/index.js'
import type {
  GameState,
  ProductionWorkflow,
  StudioEvent,
} from '../src/core/index.js'

import {
  advance,
  operationsStudio,
  productionPayload,
  withCash,
} from './contracts/_contractFixtures.js'

// ── the run: one managed studio, two pictures, carried through to release ───

/** A picture's three Shooting commands, issued the week the workflow is ready for them. */
function driveShooting(state: GameState): GameState {
  let out = state
  for (const workflow of out.operations.workflows) {
    if (workflow.shootingTask?.status !== 'unassigned') continue
    const production = out.studio.activeProductions.find(
      (candidate) => candidate.id === workflow.productionId,
    )
    if (production === undefined) continue
    out = applyActions(out, [
      {
        kind: 'assignShootingDirector',
        productionId: workflow.productionId,
        directorId: production.directorId,
      },
    ])
  }
  for (const workflow of out.operations.workflows) {
    if (workflow.shootingTask?.status === 'blocked') {
      out = applyActions(out, [
        { kind: 'clearSceneryLoadIn', productionId: workflow.productionId },
      ])
    }
  }
  for (const workflow of out.operations.workflows) {
    if (workflow.shootingTask?.status === 'ready') {
      out = applyActions(out, [
        { kind: 'scheduleShootingTake', productionId: workflow.productionId },
      ])
    }
  }
  return out
}

type Week = {
  readonly before: GameState
  readonly after: GameState
  /** Exactly the rows this advance appended, in append order. */
  readonly appended: readonly StudioEvent[]
}

/**
 * Play a managed studio for `weeks`, capturing every advance as a (before,
 * after, rows-appended) triple. Rows are identified by `seq >= before.nextSeq`,
 * which is exact because `nextSeq` only ever counts up.
 */
function scriptedRun(seed: string, weeks: number): { weeks: Week[]; final: GameState } {
  let state = withCash(operationsStudio(seed), 500_000_000)
  const captured: Week[] = []
  let conceptIndex = 0

  for (let week = 0; week < weeks; week++) {
    if (state.studio.activeProductions.length < TUNING.MAX_CONCURRENT_PRODUCTIONS) {
      const payload = productionPayload(state, conceptIndex % 2)
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
      const clashes =
        busy.has(payload.writerId) ||
        busy.has(payload.directorId) ||
        Object.values(payload.cast).some((id) => busy.has(id)) ||
        payload.craftIds.some((id) => busy.has(id))
      if (!clashes) {
        state = applyActions(state, [{ kind: 'greenlight', production: payload }])
        conceptIndex += 1
      }
    }
    state = driveShooting(state)
    const before = state
    const after = tick(state)
    captured.push({
      before,
      after,
      appended: after.studioEvents.rows.filter((row) => row.seq >= before.studioEvents.nextSeq),
    })
    state = after
  }
  return { weeks: captured, final: state }
}

// ── the diff-detectors, re-derived from the state pair alone ────────────────

type Derived = { kind: string; subject: string }

function workflowsById(state: GameState): Map<string, ProductionWorkflow> {
  return new Map(state.operations.workflows.map((workflow) => [workflow.productionId, workflow]))
}

function slotKeys(workflow: ProductionWorkflow | undefined): string[] {
  return (workflow?.reservations ?? []).map(
    (reservation) => `${reservation.facilityId}:${String(reservation.slot)}`,
  )
}

/**
 * What a state-diff can SEE happened across one advance, stated in the same
 * vocabulary the ledger uses. This is the detectors' derivation, written once.
 */
function detectorView(before: GameState, after: GameState): Derived[] {
  const derived: Derived[] = []
  const beforeWorkflows = workflowsById(before)
  const afterWorkflows = workflowsById(after)

  // Greenlight formation is visible to the ACTION, not to the tick: a workflow
  // that exists in `before` but not in the state the previous advance produced
  // was formed by a command in between. The run captures `before` AFTER those
  // commands, so a formation shows up as a workflow the tick did not create.
  for (const [productionId, workflow] of afterWorkflows) {
    const previous = beforeWorkflows.get(productionId)
    if (previous === undefined) continue
    if (previous.phase !== workflow.phase) {
      // WRAP is the shooting→post transition, and it is the ONE transition that
      // is two facts: the work finished, and the next phase began.
      if (previous.phase === 'shooting' && workflow.phase === 'postProduction') {
        derived.push({ kind: 'wrapped', subject: productionId })
      }
      derived.push({ kind: 'phaseEntered', subject: `${productionId}:${workflow.phase}` })
    }
    const held = slotKeys(previous)
    const now = slotKeys(workflow)
    for (const key of held) {
      if (!now.includes(key)) derived.push({ kind: 'reservationReleased', subject: `${productionId}:${key}` })
    }
    for (const key of now) {
      if (!held.includes(key)) derived.push({ kind: 'reservationGranted', subject: `${productionId}:${key}` })
    }
  }
  // A workflow that LEFT released its remaining slots with it.
  for (const [productionId, workflow] of beforeWorkflows) {
    if (afterWorkflows.has(productionId)) continue
    for (const key of slotKeys(workflow)) {
      derived.push({ kind: 'reservationReleased', subject: `${productionId}:${key}` })
    }
  }

  // A building that flipped from site to facility.
  const beforePlaced = new Map(before.placement.facilities.map((placed) => [placed.id, placed]))
  for (const placed of after.placement.facilities) {
    const previous = beforePlaced.get(placed.id)
    if (previous?.status === 'underConstruction' && placed.status === 'operational') {
      derived.push({ kind: 'constructionCompleted', subject: String(placed.id) })
    }
  }

  // A film that reached the screen.
  const released = new Set(before.studio.releasedFilms.map((film) => film.productionId))
  for (const film of after.studio.releasedFilms) {
    if (!released.has(film.productionId)) {
      derived.push({ kind: 'premiere', subject: film.productionId })
    }
  }
  return derived
}

/** The same vocabulary, read off the rows the engine actually appended. */
function ledgerView(rows: readonly StudioEvent[]): Derived[] {
  const view: Derived[] = []
  for (const row of rows) {
    switch (row.kind) {
      case 'wrapped':
        view.push({ kind: 'wrapped', subject: row.productionId })
        break
      case 'phaseEntered':
        view.push({ kind: 'phaseEntered', subject: `${row.productionId}:${row.phase}` })
        break
      case 'reservationGranted':
      case 'reservationReleased':
        view.push({ kind: row.kind, subject: `${row.ownerId}:${row.resourceKey}` })
        break
      case 'constructionCompleted':
        view.push({ kind: 'constructionCompleted', subject: row.placementId })
        break
      case 'premiere':
        view.push({ kind: 'premiere', subject: row.filmId })
        break
      default:
        // sceneryArrived is an ACTION-path row, not a tick transition; queue and
        // set rows have no producer at M1. Neither is a tick-diff family.
        break
    }
  }
  return view
}

function sorted(view: readonly Derived[]): string[] {
  return view.map((entry) => `${entry.kind}|${entry.subject}`).sort()
}

const RUN = scriptedRun('c2a-m1-dual-run', 40)

describe('C2a-M1 · dual-run equality — the ledger says exactly what a state-diff says', () => {
  it('produces a run with every covered transition family in it', () => {
    const families = new Set(RUN.weeks.flatMap((week) => week.appended.map((row) => row.kind)))
    for (const family of [
      'phaseEntered',
      'reservationGranted',
      'reservationReleased',
      'wrapped',
      'premiere',
    ] as const) {
      expect(families.has(family), `the run never produced a ${family} row`).toBe(true)
    }
  })

  it('agrees with the detector derivation on every advance, week by week', () => {
    for (const week of RUN.weeks) {
      expect(
        sorted(ledgerView(week.appended)),
        `week ${String(week.before.market.tick)}: the ledger and the state-diff disagree`,
      ).toEqual(sorted(detectorView(week.before, week.after)))
    }
  })

  it('records the wrap on the shooting-completion boundary and nowhere else', () => {
    for (const week of RUN.weeks) {
      const wraps = week.appended.filter((row) => row.kind === 'wrapped')
      for (const wrap of wraps) {
        if (wrap.kind !== 'wrapped') continue
        const before = workflowsById(week.before).get(wrap.productionId)
        const after = workflowsById(week.after).get(wrap.productionId)
        expect(before?.phase, 'a wrap that did not leave Shooting').toBe('shooting')
        expect(after?.phase, 'a wrap that did not arrive in Post').toBe('postProduction')
        const production = week.before.studio.activeProductions.find(
          (candidate) => candidate.id === wrap.productionId,
        )
        // The charter's own boundary, stated as the countdown position it is.
        expect(production?.remainingTicks, 'a wrap off the 4 → 3 boundary').toBe(4)
        // The stage it names is the stage it was actually standing on.
        expect(
          before?.reservations.some(
            (reservation) =>
              reservation.capability === 'soundstage' &&
              reservation.facilityId === wrap.stageFacilityId,
          ),
          'the wrap names a stage the picture did not hold',
        ).toBe(true)
        // C2a-M2: the wrap now names the SET the picture shot on as well as the
        // stage it stood in — and it names the one the picture was actually bound
        // to, never a set that merely happens to be standing there.
        expect(wrap.setId, 'the wrap names a set the picture did not hold').toBe(
          before?.bindings.setId ?? null,
        )
      }
    }
    // Every picture that reached Post wrapped exactly once.
    const wrapped = RUN.weeks
      .flatMap((week) => week.appended)
      .filter((row) => row.kind === 'wrapped')
      .map((row) => (row.kind === 'wrapped' ? row.productionId : ''))
    expect(new Set(wrapped).size, 'a picture wrapped twice').toBe(wrapped.length)
  })

  it('keeps every wrap and premiere permanently, and prunes only the windowed tier', () => {
    const everAppended = RUN.weeks.flatMap((week) => week.appended)
    const tierD = everAppended.filter((row) => isTierDStudioEventKind(row.kind))
    expect(tierD.length, 'the run produced no permanent history').toBeGreaterThan(0)
    const surviving = new Set(RUN.final.studioEvents.rows.map((row) => row.seq))
    for (const row of tierD) {
      expect(surviving.has(row.seq), `Tier-D ${row.kind} row ${String(row.seq)} was pruned`).toBe(
        true,
      )
    }
    const oldest = RUN.final.market.tick - (TUNING.STUDIO_EVENT_WINDOW_WEEKS - 1)
    for (const row of RUN.final.studioEvents.rows) {
      if (isTierDStudioEventKind(row.kind)) continue
      expect(row.week, `a Tier-W row survived outside the window`).toBeGreaterThanOrEqual(oldest)
    }
  })
})

describe('C2a-M1 · presentation parity — the ledger is a witness, never an input', () => {
  it('exports byte-identical saves for two identical runs', () => {
    const a = scriptedRun('c2a-m1-parity', 24)
    const b = scriptedRun('c2a-m1-parity', 24)
    expect(exportSave(makeSave(a.final))).toBe(exportSave(makeSave(b.final)))
    expect(a.final.rngState).toBe(b.final.rngState)
  })

  it('changes not one byte when the log is read, projected, and serialised each week', () => {
    // The "presentation on" arm: a consumer that reads the ledger every week,
    // exactly as a live UI would. Reading is the whole of what presentation does
    // with this root, so if reading could move a byte, this is where it would.
    const quiet = scriptedRun('c2a-m1-parity-read', 24)
    let observed = 0
    const watched = (() => {
      let state = withCash(operationsStudio('c2a-m1-parity-read'), 500_000_000)
      let conceptIndex = 0
      for (let week = 0; week < 24; week++) {
        if (state.studio.activeProductions.length < TUNING.MAX_CONCURRENT_PRODUCTIONS) {
          const payload = productionPayload(state, conceptIndex % 2)
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
          const clashes =
            busy.has(payload.writerId) ||
            busy.has(payload.directorId) ||
            Object.values(payload.cast).some((id) => busy.has(id)) ||
            payload.craftIds.some((id) => busy.has(id))
          if (!clashes) {
            state = applyActions(state, [{ kind: 'greenlight', production: payload }])
            conceptIndex += 1
          }
        }
        state = driveShooting(state)
        state = tick(state)
        // Read it hard: serialise it, project it, count it, sort a copy of it.
        stableStringify(state.studioEvents)
        observed += state.studioEvents.rows.filter((row) =>
          isTierDStudioEventKind(row.kind),
        ).length
        void [...state.studioEvents.rows].sort((x, y) => y.seq - x.seq)
      }
      return state
    })()
    expect(observed, 'the reading arm never observed anything').toBeGreaterThan(0)
    expect(exportSave(makeSave(watched))).toBe(exportSave(makeSave(quiet.final)))
  })

  it('never writes a consumption marker into any row', () => {
    for (const row of RUN.final.studioEvents.rows) {
      expect(Object.keys(row)).not.toContain('seen')
      expect(Object.keys(row)).not.toContain('consumed')
    }
    expect(exportSave(makeSave(RUN.final))).not.toContain('"seen"')
    expect(exportSave(makeSave(RUN.final))).not.toContain('"consumed"')
  })

  it('leaves the legacy/headless path with no history at all', () => {
    // The M0A gate, restated as the thing it protects: a world with no managed
    // operations records nothing, so the acceptance corpus is byte-identical
    // across this bump without being re-baselined.
    const headless = generateWorld('c2a-m1-parity-legacy')
    expect(headless.operations.mode).toBe('legacy')
    const played = advance(applyActions(headless, OracleAgent.chooseActions(headless)), 12)
    expect(played.studio.releasedFilms.length, 'the legacy arm never released a film').toBeGreaterThan(
      0,
    )
    expect(played.studioEvents).toEqual({ nextSeq: 0, rows: [] })
  })
})
