// ── P06A Release Authority (charter W1; frozen design = P06A recon r2 §6) ────
//
// The ONE owner of release-commitment truth. Package 06 law:
//
//   * `releaseReady` (remainingTicks === 1) HOLDS until an explicit
//     `commitPictureToRelease` for the exact production id;
//   * absence of a commitment row means UNCOMMITTED;
//   * committing advances no time, consumes no RNG, moves no cash, and creates
//     no result — it persists one row and one permanent `releaseCommitted`
//     studio event;
//   * only committed ready pictures may reach remainingTicks 0 and enter the
//     existing ID-sorted weekly release batch (operations.ts gates BOTH the
//     managed and the legacy advance arms; tick.ts checks the admission witness
//     against the zero-tick collection BEFORE any reception/RNG work);
//   * a row is pruned atomically when its production releases; durable history
//     lives in `studioEvents` and `releasedFilms`, never here.
//
// Commitment identity is DETERMINISTIC — derived from the never-reused
// production id under a frozen namespace. Minting consumes no RNG, wall clock,
// event sequence, insertion position or click order, so identical worlds
// commit to identical identities on every machine and every replay.

import type { GameState, GameStateV16, ReleaseCommitment, StudioReleaseAuthority } from './types.js'

export const RELEASE_COMMITMENT_NAMESPACE = 'release-commitment' as const

/** The empty authority every fresh, legacy-imported, or migrated world carries. */
export function initialReleaseAuthority(): StudioReleaseAuthority {
  return { commitments: [] }
}

/** Deterministic commitment identity: `release-commitment-<productionId>`. */
export function mintReleaseCommitmentId(productionId: string): string {
  return `${RELEASE_COMMITMENT_NAMESPACE}-${productionId}`
}

export function releaseCommitmentFor(
  authority: StudioReleaseAuthority,
  productionId: string,
): ReleaseCommitment | null {
  return authority.commitments.find((row) => row.productionId === productionId) ?? null
}

/** The exact committed id set — the ONLY input the weekly gate consults. */
export function committedReleaseIds(authority: StudioReleaseAuthority): ReadonlySet<string> {
  return new Set(authority.commitments.map((row) => row.productionId))
}

function titleFor(state: GameState, productionId: string): string {
  const production = state.studio.activeProductions.find((p) => p.id === productionId)
  if (production === undefined) return productionId
  const concept = state.concepts.find((c) => c.id === production.conceptId)
  return concept?.title ?? productionId
}

/**
 * The ONE commit-legality law. Returns the exact player-facing refusal sentence
 * or null when the commit is legal. Actions apply it; read models and the
 * bridge projection quote it — nobody re-derives legality.
 */
export function commitPictureToReleaseRefusal(
  state: GameState,
  productionId: string,
): string | null {
  const production = state.studio.activeProductions.find((p) => p.id === productionId)
  if (production === undefined) {
    return `no active production "${productionId}" exists`
  }
  const existing = releaseCommitmentFor(state.releaseAuthority, productionId)
  if (existing !== null) {
    return (
      `"${titleFor(state, productionId)}" is already committed to release ` +
      `(commitment ${existing.commitmentId}, week ${String(existing.committedAtWeek)})`
    )
  }
  if (production.remainingTicks !== 1) {
    return (
      `"${titleFor(state, productionId)}" is not Release Ready — ` +
      `${String(production.remainingTicks)} authoritative week(s) remain`
    )
  }
  if (state.operations.mode === 'managed') {
    const workflow = state.operations.workflows.find((w) => w.productionId === productionId)
    if (workflow === undefined) {
      return `managed production "${productionId}" has no authoritative workflow`
    }
    if (workflow.phase !== 'releaseReady') {
      return (
        `"${titleFor(state, productionId)}" workflow phase is ${workflow.phase}, ` +
        `not releaseReady`
      )
    }
  }
  return null
}

/**
 * Pure append in CANONICAL ascending-productionId order. Insertion order is
 * never semantic; two studios that committed the same set in different click
 * orders serialize byte-identical authority.
 */
export function withReleaseCommitment(
  authority: StudioReleaseAuthority,
  productionId: string,
  committedAtWeek: number,
): StudioReleaseAuthority {
  const row: ReleaseCommitment = {
    productionId,
    commitmentId: mintReleaseCommitmentId(productionId),
    committedAtWeek,
  }
  const commitments = [...authority.commitments, row].sort((a, b) =>
    a.productionId < b.productionId ? -1 : a.productionId > b.productionId ? 1 : 0,
  )
  return { commitments }
}

/**
 * Atomic prune for the weekly release transaction: remove exactly the released
 * rows, preserve every other row untouched.
 */
export function pruneReleasedCommitments(
  authority: StudioReleaseAuthority,
  releasedIds: ReadonlySet<string>,
): StudioReleaseAuthority {
  if (releasedIds.size === 0) return authority
  return { commitments: authority.commitments.filter((row) => !releasedIds.has(row.productionId)) }
}

/**
 * The public-boundary invariants (validated at save boundaries and tick entry;
 * every violation is a THROW — fail closed, never repair silently):
 *
 *   I1 canonical ascending-productionId order, no duplicates;
 *   I2 every commitmentId is exactly the deterministic mint for its row;
 *   I3 every row names an ACTIVE production at remainingTicks === 1 (in managed
 *      mode, with a `releaseReady` workflow);
 *   I4 no active production sits at remainingTicks === 0 (a zero-tick picture
 *      must have been collected by the same tick that produced it).
 */
// Accepts the frozen V16 shape (and therefore every later shape) so the frozen
// validateSaveV16 can keep delegating to it after later roots are added.
export function assertReleaseAuthorityInvariants(state: GameStateV16, context: string): void {
  const { commitments } = state.releaseAuthority
  for (let i = 0; i < commitments.length; i++) {
    const row = commitments[i]!
    if (i > 0) {
      const prev = commitments[i - 1]!
      if (!(prev.productionId < row.productionId)) {
        throw new Error(
          `${context}: releaseAuthority rows out of canonical order or duplicated ` +
            `("${prev.productionId}" then "${row.productionId}")`,
        )
      }
    }
    if (row.commitmentId !== mintReleaseCommitmentId(row.productionId)) {
      throw new Error(
        `${context}: commitment for "${row.productionId}" carries foreign identity ` +
          `"${row.commitmentId}"`,
      )
    }
    if (!Number.isInteger(row.committedAtWeek) || row.committedAtWeek < 0) {
      throw new Error(
        `${context}: commitment for "${row.productionId}" has malformed committedAtWeek ` +
          `${String(row.committedAtWeek)}`,
      )
    }
    const production = state.studio.activeProductions.find((p) => p.id === row.productionId)
    if (production === undefined) {
      throw new Error(
        `${context}: releaseAuthority row for "${row.productionId}" is an orphan — ` +
          `no such active production`,
      )
    }
    if (production.remainingTicks !== 1) {
      throw new Error(
        `${context}: committed production "${row.productionId}" is at remainingTicks ` +
          `${String(production.remainingTicks)}, not 1`,
      )
    }
    if (state.operations.mode === 'managed') {
      const workflow = state.operations.workflows.find(
        (w) => w.productionId === row.productionId,
      )
      if (workflow === undefined || workflow.phase !== 'releaseReady') {
        throw new Error(
          `${context}: committed production "${row.productionId}" lacks a releaseReady ` +
            `workflow`,
        )
      }
    }
  }
  for (const production of state.studio.activeProductions) {
    if (production.remainingTicks === 0) {
      throw new Error(
        `${context}: active production "${production.id}" sits at remainingTicks 0 — ` +
          `a zero-tick picture must release in the tick that produced it`,
      )
    }
  }
}

/**
 * Exact hold consequences for one uncommitted ready picture — the identities
 * that stay busy-for-assignment while the player holds. Weekly economic
 * exposure remains owned by the existing economy read models; this selector
 * never invents numbers.
 */
export function releaseHoldBusyTalentIds(
  state: GameState,
  productionId: string,
): readonly string[] {
  const production = state.studio.activeProductions.find((p) => p.id === productionId)
  if (production === undefined) return []
  const ids = [
    production.directorId,
    ...Object.values(production.cast),
    ...production.craftIds,
  ].filter((id): id is string => typeof id === 'string' && id.length > 0)
  return [...new Set(ids)]
}
