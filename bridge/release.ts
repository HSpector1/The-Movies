// ── P06A W2 — the closed Release projection (charter W2; recon r2 §6.3/§6.6) ─
//
// Pure, deterministic, RNG-free view over EXISTING core truth. One decision row
// per picture at Release Ready (uncommitted or committed), in ascending exact
// production-id order. Everything here is a direct read of core authority:
//
//   * legality is `commitPictureToReleaseRefusal` — the ONE shared law; the
//     bridge never re-derives it;
//   * the outlook is the FROZEN Greenlight `forecastSnapshot`, labeled by the
//     client as provenance, never recomputed;
//   * already-paid rows are the committed `Production.budget` values;
//   * hold consequences are the exact busy identities (`releaseHoldBusyTalentIds`)
//     — availability truth, never physical presence;
//   * `automaticWeekRollEligible` is the TypeScript-authored auto-roll fact:
//     false while ANY decision stop is live. Manual `advanceWeek` legality is a
//     SEPARATE fact (the W1 carve-out keeps it published at a release-review
//     stop); Unity consumes this field and never infers auto-roll permission
//     from intent presence again (W5).

import { commitPictureToReleaseRefusal, releaseCommitmentFor, releaseHoldBusyTalentIds } from '../src/core/releaseAuthority.js'
import { nextStudioDecision } from '../src/core/scriptReadModel.js'
import type { GameState } from '../src/core/types.js'

export type BridgeReleaseDecisionSnapshot = {
  productionId: string
  title: string
  genreLabel: string
  authorityState: 'ready-uncommitted' | 'committed'
  commitmentId: string | null
  committedAtWeek: number | null
  legalCommit: boolean
  refusal: string | null
  expectedCriticScore: number
  expectedOpening: number
  expectedTotal: number
  alreadyPaidProduction: number
  alreadyPaidMarketing: number
  holdBusyTalentIds: string[]
  holdBusyTalentNames: string[]
}

export type BridgeReleaseProjection = {
  decisions: BridgeReleaseDecisionSnapshot[]
  automaticWeekRollEligible: boolean
  nextDecisionKind:
    | 'scriptReview'
    | 'castingReview'
    | 'productionOperation'
    | 'releaseReview'
    | null
}

export function releaseProjection(state: GameState): BridgeReleaseProjection {
  const decisions: BridgeReleaseDecisionSnapshot[] = state.studio.activeProductions
    .filter((production) => production.remainingTicks === 1)
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map((production) => {
      const concept = state.concepts.find((candidate) => candidate.id === production.conceptId)
      const commitment = releaseCommitmentFor(state.releaseAuthority, production.id)
      const refusal =
        commitment !== null ? null : commitPictureToReleaseRefusal(state, production.id)
      const busyIds = releaseHoldBusyTalentIds(state, production.id)
      const nameOf = (talentId: string): string =>
        state.talent.find((candidate) => candidate.id === talentId)?.name ?? talentId
      return {
        productionId: production.id,
        title: concept?.title ?? production.id,
        genreLabel: concept?.genre ?? 'unknown',
        authorityState: commitment === null ? ('ready-uncommitted' as const) : ('committed' as const),
        commitmentId: commitment?.commitmentId ?? null,
        committedAtWeek: commitment?.committedAtWeek ?? null,
        legalCommit: commitment === null && refusal === null,
        refusal,
        expectedCriticScore: production.forecastSnapshot.expectedCriticScore,
        expectedOpening: production.forecastSnapshot.expectedOpening,
        expectedTotal: production.forecastSnapshot.expectedTotal,
        alreadyPaidProduction: production.budget.negative,
        alreadyPaidMarketing: production.budget.marketing,
        holdBusyTalentIds: [...busyIds],
        holdBusyTalentNames: busyIds.map(nameOf),
      }
    })
  const decision = nextStudioDecision(state)
  return {
    decisions,
    automaticWeekRollEligible: decision === null,
    nextDecisionKind: decision === null ? null : decision.kind,
  }
}
