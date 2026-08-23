// Economy Intervention Frontier 03 — focused behavioral preservation gates.

import type { PlayerPolicy } from '../d16/policies.js'
import {
  awarenessMaintenance,
  maximumPublicity,
  neverPublicize,
  publicitySpamAdversary,
} from '../d16/policies.js'
import { runOne } from '../d16/driver.js'
import {
  MACRO_HORIZON_WEEKS,
  MACRO_SLICE_WEEKS,
  compactMacroRun,
} from '../economy-truth-audit/macro.js'
import type { MacroRunCompact } from '../economy-truth-audit/macro.js'
import { choicePolicy } from './choice.js'
import type { ChoiceArm } from './choice.js'

export const CHOICE_PUBLICITY_GATE_IDS = [
  'never',
  'maximum',
  'maintenance',
  'spam',
] as const

export type ChoicePublicityGateId =
  (typeof CHOICE_PUBLICITY_GATE_IDS)[number]

const PUBLICITY_HOSTS: Readonly<Record<ChoicePublicityGateId, PlayerPolicy>> = {
  never: neverPublicize,
  maximum: maximumPublicity,
  maintenance: awarenessMaintenance,
  spam: publicitySpamAdversary,
}

export type ChoicePublicityGateCell = {
  seed: string
  choiceArm: ChoiceArm
  publicityGateId: ChoicePublicityGateId
  macro: MacroRunCompact
}

export function choicePublicityGatePolicy(
  choiceArm: ChoiceArm,
  publicityGateId: ChoicePublicityGateId,
): PlayerPolicy {
  const choice = choicePolicy(choiceArm)
  const host = PUBLICITY_HOSTS[publicityGateId]
  if (host.publicize === undefined) {
    throw new Error('economy frontier gates: publicity host lacks a publicize method')
  }
  return {
    ...choice,
    name: `${choiceArm}__publicity_${publicityGateId}`,
    kind: host.kind,
    description: `${choice.description} Publicity preservation host: ${host.name}.`,
    publicize: host.publicize,
  }
}

export function runChoicePublicityGateCell(
  seed: string,
  choiceArm: ChoiceArm,
  publicityGateId: ChoicePublicityGateId,
): ChoicePublicityGateCell {
  const record = runOne({
    seed,
    policy: choicePublicityGatePolicy(choiceArm, publicityGateId),
    horizonWeeks: MACRO_HORIZON_WEEKS,
    sliceWeeks: MACRO_SLICE_WEEKS,
    checkpointEvery: 26,
    productionD17b: true,
    awarenessStats: true,
    captureLedgerAtSlices: true,
  })
  return { seed, choiceArm, publicityGateId, macro: compactMacroRun(record) }
}
