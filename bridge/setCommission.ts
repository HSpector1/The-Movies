// ── P09A W5 — the Set commission quote family: preview → refusal copy → commit ──
//
// The bare lot's first film needs a mounted Set on its built soundstage (design
// §21/§24 beat 8; P09-REQ-025/041). The accepted engine law (`commissionSet`,
// `commissionSetRefusal`, `setCommissionRefusalCopy` — C2a-M2, unchanged here) had
// no route across the bridge because the endowed lot ships two house sets. This
// family is that route: the ONE conversion from a player's Set selection (a set
// blueprint on a named soundstage) to the engine's refusal authority, and the ONE
// quote snapshot Unity renders verbatim. A refused preview is an ACCEPTED answer
// with `ok:false` and the engine's own reason/remedy; a legal preview mints the
// ONE digest-bound `commissionSet` intent, and the commit re-asks the same
// authority against the live state and charges the engine's own price once.
import {
  canAfford,
  commissionSetRefusal,
  setCommissionRefusalCopy,
  type GameState,
  type SetCommissionRefusal,
} from '../src/core/index.ts'
import { applyActions } from '../src/core/index.ts'
import { setBlueprintById, type SetBlueprint } from '../src/core/tuning.ts'
import type { ActionOutcome } from '../ui/src/engine/adapter.ts'
import type {
  BridgeSetCommissionDraftPayload,
  BridgeSetCommissionQuoteSnapshot,
} from './schema/bridge-schema.ts'

export type SetCommissionDraftConversion =
  | {
      ok: true
      kind: 'commissionSet'
      apply: (state: GameState) => ActionOutcome
      commitLabel: string
      blueprint: SetBlueprint
      refusal: SetCommissionRefusal | null
    }
  | { ok: false; error: string }

function dollars(value: number): string {
  return `$${Math.round(value).toLocaleString('en-US')}`
}

/** The ONLY conversion from a Set commission draft to the engine. */
export function setCommissionDraftToEngine(
  state: GameState,
  draft: BridgeSetCommissionDraftPayload,
): SetCommissionDraftConversion {
  const blueprint = setBlueprintById(draft.blueprintId)
  if (blueprint === null) {
    return { ok: false, error: setCommissionRefusalCopy({ code: 'unknownBlueprint', blueprintId: draft.blueprintId }, {}).reason }
  }
  const payload = { blueprintId: draft.blueprintId, stageFacilityId: draft.stageFacilityId }
  const stageName = state.operations.facilities.find((facility) => facility.id === draft.stageFacilityId)?.name
  const copyContext = { blueprintName: blueprint.name, ...(stageName === undefined ? {} : { stageName }) }
  const refusal = commissionSetRefusal(state, payload)
  return {
    ok: true,
    kind: 'commissionSet',
    commitLabel: `COMMISSION ${blueprint.name.toUpperCase()} — ${dollars(blueprint.capex)}`,
    blueprint,
    refusal,
    apply: (current: GameState): ActionOutcome => {
      const live = commissionSetRefusal(current, payload)
      if (live !== null) {
        const copy = setCommissionRefusalCopy(live, copyContext)
        return { ok: false, error: `${copy.reason} ${copy.remedy}`.trim() }
      }
      try {
        return { ok: true, next: applyActions(current, [{ kind: 'commissionSet', commission: payload }]) }
      } catch (e) {
        return { ok: false, error: (e as Error).message }
      }
    },
  }
}

/** The quote Unity renders verbatim; the id is registered for commit only when `ok`. */
export function setCommissionQuoteSnapshot(
  state: GameState,
  draft: BridgeSetCommissionDraftPayload,
  conversion: Extract<SetCommissionDraftConversion, { ok: true }>,
  intentId: string,
): BridgeSetCommissionQuoteSnapshot {
  const { blueprint, refusal } = conversion
  const stage = state.operations.facilities.find((facility) => facility.id === draft.stageFacilityId)
  const cashBefore = Math.round(state.studio.cash)
  const copy = refusal === null
    ? null
    : setCommissionRefusalCopy(refusal, { blueprintName: blueprint.name, ...(stage === undefined ? {} : { stageName: stage.name }) })
  const ok = refusal === null
  const completesOnWeek = state.market.tick + blueprint.buildWeeks
  return {
    intentId,
    kind: 'commissionSet',
    commitLabel: conversion.commitLabel,
    startsNow: ok,
    queues: false,
    queueNote: null,
    ok,
    blueprintId: blueprint.id,
    name: blueprint.name,
    setType: blueprint.setType,
    quality: blueprint.quality,
    cost: blueprint.capex,
    buildWeeks: blueprint.buildWeeks,
    completesOnWeek,
    stageFacilityId: draft.stageFacilityId,
    stageName: stage?.name ?? null,
    refusal: refusal === null ? null : refusal.code,
    refusalReason: copy === null ? null : copy.reason,
    refusalRemedy: copy === null ? null : copy.remedy,
    cashBefore,
    cashAfter: cashBefore - blueprint.capex,
    affordable: canAfford(state, blueprint.capex).ok,
    consequence: ok
      ? `Costs ${dollars(blueprint.capex)} now; ${blueprint.name} stands on ${stage?.name ?? 'the stage'} from week ${String(completesOnWeek)} (${String(blueprint.buildWeeks)} weeks). A picture can shoot there once it stands.`
      : `${copy!.reason} ${copy!.remedy}`.trim(),
  }
}
