import { createHash } from 'node:crypto'

import {
  exportSaveJson,
  studioLotSnapshot,
} from '../ui/src/engine/adapter.ts'
import type { GameState } from '../ui/src/engine/adapter.ts'
import { developmentProjection } from './development.ts'
import { castingProjection } from './casting.ts'
import { releaseProjection } from './release.ts'
import { historyProjection } from './history.ts'

type StudioLotSnapshotResult = ReturnType<typeof studioLotSnapshot>
type DevelopmentProjectionResult = ReturnType<typeof developmentProjection>
type CastingProjectionResult = ReturnType<typeof castingProjection>
type ReleaseProjectionResult = ReturnType<typeof releaseProjection>
type HistoryProjectionResult = ReturnType<typeof historyProjection>

/**
 * W0 (CF-07 folding). One shared, lazily-computed set of validated
 * snapshot/serialization/hash/projection facts per authoritative GameState.
 *
 * Sharing law: every fact here is a pure function of the state object, and every
 * consumer either treats the fact as read-only (string facts, the lot snapshot's
 * `firstFilmJourney` read) or deep-copies it before it can escape the bridge
 * boundary (`projectStudioProjectionBundle` builds fresh objects from the lot /
 * development / casting inputs). Facts that end up embedded in served envelopes
 * by reference — founding projections and resolved intents — are deliberately
 * NOT memoized here, so no served envelope ever aliases a retained object.
 *
 * Invalidation law: facts are keyed by GameState object identity. The sim core
 * is pure — every accepted command, load, and rollover replaces the state
 * object — so a state object's facts can never go stale. There is no revision
 * bookkeeping to get wrong and no equality heuristic: a new state object simply
 * has no entry.
 */
export type SnapshotBuildContext = {
  readonly state: GameState
  /** Canonical validated save JSON (`exportSaveJson`), computed at most once per state. */
  saveJson(): string
  /** SHA-256 of `saveJson()` — the authoritative state digest. */
  stateDigest(): string
  /** The broad lot selector result, computed at most once per state. */
  lotSnapshot(): StudioLotSnapshotResult
  /** Development board projection, computed at most once per state. */
  development(): DevelopmentProjectionResult
  /** Casting board projection, computed at most once per state. */
  casting(): CastingProjectionResult
  /** P06A W2: the closed Release projection, computed at most once per state. */
  release(): ReleaseProjectionResult
  history(): HistoryProjectionResult
}

/**
 * Compute counters for focused duplication tests and wave evidence only.
 * Nothing player-facing or wire-visible reads these.
 */
export const snapshotBuildDiagnostics = {
  contextCreates: 0,
  saveJsonComputes: 0,
  digestComputes: 0,
  lotSnapshotComputes: 0,
  developmentComputes: 0,
  castingComputes: 0,
  releaseComputes: 0,
  historyComputes: 0,
}

export function resetSnapshotBuildDiagnostics(): void {
  snapshotBuildDiagnostics.contextCreates = 0
  snapshotBuildDiagnostics.saveJsonComputes = 0
  snapshotBuildDiagnostics.digestComputes = 0
  snapshotBuildDiagnostics.lotSnapshotComputes = 0
  snapshotBuildDiagnostics.developmentComputes = 0
  snapshotBuildDiagnostics.castingComputes = 0
  snapshotBuildDiagnostics.releaseComputes = 0
}

/**
 * A fact is computed on first use and remembered only on success. A computation
 * that throws leaves no memo, so the error surface of every consumer is exactly
 * the underlying function's — repeated calls re-throw exactly as before W0.
 */
function lazyFact<T>(compute: () => T): () => T {
  let computed = false
  let value: T
  return () => {
    if (!computed) {
      value = compute()
      computed = true
    }
    return value
  }
}

const contexts = new WeakMap<GameState, SnapshotBuildContext>()

export function snapshotBuildContextFor(state: GameState): SnapshotBuildContext {
  const existing = contexts.get(state)
  if (existing !== undefined) return existing
  snapshotBuildDiagnostics.contextCreates += 1
  const saveJson = lazyFact(() => {
    snapshotBuildDiagnostics.saveJsonComputes += 1
    return exportSaveJson(state)
  })
  const context: SnapshotBuildContext = {
    state,
    saveJson,
    stateDigest: lazyFact(() => {
      snapshotBuildDiagnostics.digestComputes += 1
      return createHash('sha256').update(saveJson()).digest('hex')
    }),
    lotSnapshot: lazyFact(() => {
      snapshotBuildDiagnostics.lotSnapshotComputes += 1
      return studioLotSnapshot(state)
    }),
    development: lazyFact(() => {
      snapshotBuildDiagnostics.developmentComputes += 1
      return developmentProjection(state)
    }),
    casting: lazyFact(() => {
      snapshotBuildDiagnostics.castingComputes += 1
      return castingProjection(state)
    }),
    release: lazyFact(() => {
      snapshotBuildDiagnostics.releaseComputes += 1
      return releaseProjection(state)
    }),
    history: lazyFact(() => {
      snapshotBuildDiagnostics.historyComputes += 1
      return historyProjection(state)
    }),
  }
  contexts.set(state, context)
  return context
}
