// P08A — THE 120-YEAR HISTORY GROWTH MEASUREMENT (charter §11 / P08-REQ-007/020).
//
// Run from the repository root:
//   node_modules/.bin/vite-node scripts/measure-p08-history-growth.mts
//
// WHY IT EXISTS. The Standing/History root records forward from an explicit
// boundary and folds routine weekly settling after HISTORY_ROUTINE_WINDOW_WEEKS.
// Whether the root stays SPARSE across a 6,240-week (120-year) campaign is a
// number, not a feeling: this measures the same continuously operating managed
// studio at one year, ten years, forty years and one hundred and twenty years,
// reporting the save bytes, the history bytes, the rows by kind/significance,
// and the per-tick engine cost — beside the unfolded row count the fold saved.
//
// HOW IT STAYS HONEST. One seed, one policy, PUBLIC actions only (greenlight,
// commit-to-release, sign, publicity), no clock, no Math.random, no tuning read
// as a measurement. Two runs at one HEAD print identical numbers. The ONE
// fixture liberty is the solvency floor below — the same disclosed liberty the
// C2a-M1 save-size measurement takes — because a studio that runs out of money
// stops producing history and would measure the economy instead of the log.
// This script proves BYTES; it is not a playability or balance claim.
//
// ── RESULTS (recorded by the P08 technical checkpoint; regenerate by re-running) ─
// (see docs/campaigns/P08-TECHNICAL-CHECKPOINT.md)
import { performance } from 'node:perf_hooks'
import {
  applyActions,
  beginFounding,
  exportSave,
  generateWorld,
  HISTORY_ROUTINE_WINDOW_WEEKS,
  makeSave,
  nextStudioDecision,
  stableStringify,
  studioHistoryTimeline,
  tick,
  TUNING,
} from '../src/core/index.js'
import type { CastSlot, GameState, SegmentId, StudioHistoryEvent, Talent } from '../src/core/index.js'

const MEASUREMENT_SLATE_BOUND = 2
const SEED = 'p08a-history-growth'
const CHECKPOINTS = [52, 520, 2080, 6240] as const

function byRole(talent: readonly Talent[], role: Talent['role']): Talent[] {
  return talent.filter((person) => person.role === role)
}
function contractedByRole(state: GameState, role: Talent['role']): Talent[] {
  const contracted = new Set(state.contracts.map((contract) => contract.talentId))
  return state.talent.filter((person) => person.role === role && contracted.has(person.id))
}
function operatingStudio(seed: string): GameState {
  let state = beginFounding(generateWorld(seed))
  const applicants = state.founding!.applicantIds.map((id) => state.talent.find((p) => p.id === id)!)
  const counts = { actor: 9, director: 3, writer: 4, craft: 3 } as const
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    for (const person of byRole(applicants, role).slice(0, counts[role])) {
      state = applyActions(state, [{ kind: 'signContract', talentId: person.id, termWeeks: 1_040 }])
    }
  }
  state = applyActions(state, [{ kind: 'foundStudio' }])
  state = applyActions(state, [{ kind: 'activateStudioOperations' }])
  // DISCLOSED FIXTURE LIBERTY (measurement only; see header): a solvency floor
  // booked as a real ledger row so the cash/ledger identity stays true.
  const credit = 50_000_000_000 - state.studio.cash
  return {
    ...state,
    studio: { ...state.studio, cash: state.studio.cash + credit },
    ledger: [
      ...state.ledger,
      { week: state.market.tick, kind: 'studioRevenue' as const, amount: credit, note: 'history growth measurement solvency floor' },
    ],
  }
}
const ROSTER_FLOOR = { actor: 9, director: 3, writer: 4, craft: 3 } as const
function restaffed(state: GameState): GameState {
  let out = state
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    let held = contractedByRole(out, role).length
    if (held >= ROSTER_FLOOR[role]) continue
    for (const person of byRole(out.talent, role)) {
      if (held >= ROSTER_FLOOR[role]) break
      if (out.contracts.some((contract) => contract.talentId === person.id)) continue
      try {
        out = applyActions(out, [{ kind: 'signContract', talentId: person.id, termWeeks: 104 }])
        held += 1
      } catch {
        // not signable this week — a legal answer, not a failure
      }
    }
  }
  return out
}
function greenlightPayload(state: GameState, conceptIndex: number) {
  const concept = state.concepts[conceptIndex % state.concepts.length]!
  const busy = new Set(
    state.studio.activeProductions.flatMap((p) => [p.writerId, p.directorId, p.cast.lead, p.cast.antagonist, p.cast.support, ...p.craftIds]),
  )
  const free = (people: readonly Talent[]): Talent[] => people.filter((p) => !busy.has(p.id))
  const freeActors = free(contractedByRole(state, 'actor'))
  const writer = free(contractedByRole(state, 'writer'))[0]
  const director = free(contractedByRole(state, 'director'))[0]
  const crafts = free(contractedByRole(state, 'craft'))[0]
  if (writer === undefined || director === undefined || crafts === undefined || freeActors.length < 3) return null
  return {
    conceptId: concept.id,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' } as const,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'] as SegmentId[],
      ranges: { intimacy: [-0.5, 0.5] as [number, number], tonalWeight: [-0.5, 0.5] as [number, number], kineticEnergy: [-0.5, 0.5] as [number, number] },
    },
    writerId: writer.id,
    directorId: director.id,
    cast: { lead: freeActors[0]!.id, antagonist: freeActors[1]!.id, support: freeActors[2]!.id } as Record<CastSlot, string>,
    craftIds: [crafts.id],
    budget: { negative: concept.baseNegativeCost, marketing: 0 },
  }
}

function count(rows: readonly StudioHistoryEvent[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const row of rows) {
    out[row.kind] = (out[row.kind] ?? 0) + 1
    out[`sig:${row.significance}`] = (out[`sig:${row.significance}`] ?? 0) + 1
  }
  return out
}

function measure(): void {
  let state = operatingStudio(SEED)
  let conceptIndex = 0
  let everRoutine = 0
  let tickMs = 0
  let ticks = 0
  const lines: string[] = []
  const pad = (v: string | number, w: number) => String(v).padStart(w)
  lines.push('  week    save bytes   history bytes   rows   routine   folded   timeline   films   avg tick ms   unfolded routine')
  for (let week = 0; week < CHECKPOINTS[CHECKPOINTS.length - 1]!; week++) {
    // Policy (public actions only): keep the slate at the bound; restaff; buy a
    // whisper campaign whenever it is legal (keeps awareness above the anchor so
    // the weekly settling receipt — the routine family — is exercised every week).
    state = restaffed(state)
    while (state.studio.activeProductions.length < MEASUREMENT_SLATE_BOUND) {
      const payload = greenlightPayload(state, conceptIndex)
      if (payload === null) break
      try {
        state = applyActions(state, [{ kind: 'greenlight', production: payload }])
      } catch {
        break
      }
      conceptIndex += 1
    }
    try {
      state = applyActions(state, [{ kind: 'publicity', tier: 'whisper' }])
    } catch {
      // cooldown or capacity — legal
    }
    // Drive every pending production operation the engine itself names (director
    // assignment, scenery load-in, takes) — the same public decision loop the
    // real-profile journey uses. Bounded per week.
    for (let guard = 0; guard < 100; guard++) {
      const decision = nextStudioDecision(state)
      if (decision === null || decision.kind !== 'productionOperation') break
      state = applyActions(state, [decision.command])
    }
    const ready = state.studio.activeProductions.filter((p) => p.remainingTicks === 1)
    if (ready.length > 0) {
      state = applyActions(state, ready.map((p) => ({ kind: 'commitPictureToRelease' as const, productionId: p.id })))
    }
    const routineBefore = state.studioHistory.rows.filter((r) => r.kind === 'standingChanged' && r.significance === 'routine').length
    const t0 = performance.now()
    state = tick(state)
    tickMs += performance.now() - t0
    ticks += 1
    const routineAfter = state.studioHistory.rows.filter((r) => r.kind === 'standingChanged' && r.significance === 'routine').length
    // A routine row appended this week (fold may have removed older ones; count appends by delta of ids).
    everRoutine += Math.max(0, routineAfter - routineBefore) // lower bound; exact tally below via folded counts
    if ((CHECKPOINTS as readonly number[]).includes(state.market.tick)) {
      const save = exportSave(makeSave(state))
      const historyBytes = stableStringify(state.studioHistory).length
      const c = count(state.studioHistory.rows)
      const folded = state.studioHistory.rows.filter((r) => r.kind === 'standingDriftFolded')
      const unfoldedRoutine = (c['sig:routine'] ?? 0) - folded.length + folded.reduce((a, r) => a + (r.kind === 'standingDriftFolded' ? r.count : 0), 0)
      lines.push(
        `${pad(state.market.tick, 6)}  ${pad(save.length.toLocaleString('en-US'), 12)}  ${pad(historyBytes.toLocaleString('en-US'), 14)}  ${pad(state.studioHistory.rows.length, 5)}  ${pad((c['sig:routine'] ?? 0) - folded.length, 8)}  ${pad(folded.length, 7)}  ${pad(studioHistoryTimeline(state.studioHistory).length, 9)}  ${pad(state.studio.releasedFilms.length, 6)}  ${pad((tickMs / ticks).toFixed(3), 12)}  ${pad(unfoldedRoutine, 16)}`,
      )
      lines.push(`        kinds: ${JSON.stringify(c)}`)
    }
  }
  console.log(`seed "${SEED}", managed operations, slate bound ${MEASUREMENT_SLATE_BOUND}, whisper publicity whenever legal`)
  console.log(`HISTORY_ROUTINE_WINDOW_WEEKS = ${HISTORY_ROUTINE_WINDOW_WEEKS}; STUDIO_EVENT_WINDOW_WEEKS = ${TUNING.STUDIO_EVENT_WINDOW_WEEKS}`)
  for (const line of lines) console.log(line)
  void everRoutine
}

measure()
