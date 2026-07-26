// ── Integration proof: GameState → StudioLotSnapshot (types-only) ─────────────
//
// This file is the promise the spike makes about integration. It shows EXACTLY
// how the host would fill a StudioLotSnapshot from the real, validated GameState
// after Phase 5 — WITHOUT importing the simulation core and WITHOUT re-deriving
// any rule.
//
// Two disciplines are enforced here on purpose:
//
//   1. NO import from ../../../src/core. Instead we declare a *structural* view of
//      only the GameState fields we read (`GameStateFacts`). The real GameState is
//      a superset of this shape, so at integration time you delete these local
//      types and import the real ones — the function body is unchanged. (The field
//      names below match src/core/types.ts as of baseline 279e58e.)
//
//   2. NO simulation formulas. We never compute reception, box office, standing,
//      forecasts, or production timing. We only READ values the engine already
//      produced and CLASSIFY them into coarse *display* bands, or do trivial
//      presentation arithmetic (elapsed / total) on already-stored fields. Every
//      threshold below is a display choice the host may retune freely — none is a
//      simulation constant.

import type {
  StudioLotSnapshot,
  ProductionCard,
  ReleasedCard,
  StandingBand,
  CashBand,
  ReceptionBand,
} from './StudioLotSnapshot'
import { ALL_BUILDING_IDS } from './StudioLotSnapshot'

// ── Structural view of GameState (subset actually read) ───────────────────────
// Mirrors src/core/types.ts field names. Replace with the real import at wire-up.

type StandingFacts = {
  audienceAwareness: number // 0..100
  industryPrestige: number // 0..100
  commercialConfidence: number // 0..100
}

type ProductionFacts = {
  id: string
  conceptId: string
  startTick: number
  remainingTicks: number
}

type FilmResultFacts = {
  productionId: string
  conceptId: string
  releaseTick: number
  criticScore: number // 0..100, already computed by the engine
}

type ConceptFacts = {
  id: string
  title: string
  genre: string // sim Genre union widens to string for display
}

/** The only GameState fields the lot boundary reads. */
export type GameStateFacts = {
  seed: string
  market: { tick: number }
  studio: {
    cash: number
    standing: StandingFacts
    activeProductions: ProductionFacts[]
    releasedFilms: FilmResultFacts[]
  }
  concepts: ConceptFacts[]
}

// ── Presentation-only classifiers (display bands, NOT simulation thresholds) ───

/** Coarse studio standing for the lot's dressing. Retune freely. */
function toStandingBand(s: StandingFacts): StandingBand {
  const prestige = s.industryPrestige
  if (prestige >= 70) return 'prestige'
  if (prestige >= 45) return 'established'
  if (prestige >= 20) return 'finding-footing'
  return 'struggling'
}

/** Coarse cash position for the top bar. Retune freely. */
function toCashBand(cash: number): CashBand {
  if (cash < 0) return 'in-the-red'
  if (cash < 250_000) return 'tight'
  if (cash < 2_000_000) return 'stable'
  return 'flush'
}

/** Coarse reception badge from an already-computed critic score. Retune freely. */
function toReceptionBand(criticScore: number): ReceptionBand {
  if (criticScore >= 80) return 'smash'
  if (criticScore >= 60) return 'hit'
  if (criticScore >= 40) return 'mixed'
  return 'flop'
}

/**
 * Translate a GameState (as facts) into a StudioLotSnapshot.
 *
 * Pure, side-effect free, deterministic. No engine call, no RNG, no formula.
 * The stage assignment (which production sits on stage-a vs stage-b) is a
 * PRESENTATION decision made here at the boundary — GameState has no notion of
 * stages, so the host chooses. Buildings default to available; per-building
 * availability is likewise a host presentation policy layered on studio facts.
 */
export function snapshotFromGameState(
  state: GameStateFacts,
  opts: { studioName: string; selectedBuildingId?: StudioLotSnapshot['selectedBuildingId'] },
): StudioLotSnapshot {
  const conceptById = new Map(state.concepts.map((c) => [c.id, c]))
  const now = state.market.tick

  // Map up to two active productions onto the two stages, in order.
  const stageIds = ['stage-a', 'stage-b'] as const
  const activeProductions: ProductionCard[] = state.studio.activeProductions
    .slice(0, stageIds.length)
    .map((p, i): ProductionCard => {
      const concept = conceptById.get(p.conceptId)
      const elapsed = Math.max(0, now - p.startTick)
      const total = Math.max(1, elapsed + p.remainingTicks)
      return {
        id: p.id,
        title: concept?.title ?? 'Untitled',
        genre: concept ? capitalize(concept.genre) : 'Feature',
        stageId: stageIds[i],
        // presentation arithmetic on stored fields — not a timing rule:
        progress01: clamp01(elapsed / total),
        weeksRemaining: Math.max(0, Math.round(p.remainingTicks)),
        active: true,
      }
    })

  const releasedFilms: ReleasedCard[] = state.studio.releasedFilms
    .slice()
    .sort((a, b) => b.releaseTick - a.releaseTick)
    .slice(0, 6)
    .map((f): ReleasedCard => {
      const concept = conceptById.get(f.conceptId)
      return {
        id: f.productionId,
        title: concept?.title ?? 'Untitled',
        reception: toReceptionBand(f.criticScore),
        weeksAgo: Math.max(0, now - f.releaseTick),
      }
    })

  const stagesInUse = new Set(activeProductions.map((p) => p.stageId))

  return {
    studioName: opts.studioName,
    week: now,
    standing: toStandingBand(state.studio.standing),
    cashBand: toCashBand(state.studio.cash),
    activeProductions,
    releasedFilms,
    // Host availability policy: an idle stage still exists but reads as inactive.
    buildings: ALL_BUILDING_IDS.map((id) => ({
      id,
      available: id === 'stage-b' ? stagesInUse.has('stage-b') || stagesInUse.size < 2 : true,
    })),
    selectedBuildingId: opts.selectedBuildingId ?? null,
    sceneSeed: state.seed,
  }
}

function clamp01(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : n
}

function capitalize(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s
}
