// Economy Intervention Frontier 03 — selected choice × capital combinations.

import { compactMacroRun } from '../economy-truth-audit/macro.js'
import {
  CAPITAL_ESTATE_EQUIVALENT,
  capitalArm,
  createCapitalPlan,
} from './capital.js'
import type { CapitalArmId, CapitalCell } from './capital.js'
import { runChoiceRecord } from './choice.js'
import type { ChoiceArm, ChoiceDiagnostics } from './choice.js'

export type CombinationCell = CapitalCell & {
  choiceArm: ChoiceArm
  choiceDiagnostics: ChoiceDiagnostics
}

export function runCombinationCell(
  seed: string,
  choiceArm: ChoiceArm,
  capitalArmId: Exclude<CapitalArmId, 'none'>,
): CombinationCell {
  const arm = capitalArm(capitalArmId)
  const plan = createCapitalPlan(arm)
  if (plan === undefined) {
    throw new Error('economy frontier combination: treatment plan is absent')
  }
  const { record, diagnostics } = runChoiceRecord(seed, choiceArm, plan)
  const journal = record.analysisCash
  if (journal?.planId !== capitalArmId) {
    throw new Error('economy frontier combination: missing capital journal')
  }
  const totalEnterpriseCapital = journal.totalConverted
  return {
    seed,
    policy: record.policy,
    armId: capitalArmId,
    choiceArm,
    macro: compactMacroRun(record),
    choiceDiagnostics: diagnostics,
    rungCost: arm.estateEquivalentsPerRung * CAPITAL_ESTATE_EQUIVALENT,
    rungsPurchased: journal.conversions.length,
    totalEnterpriseCapital,
    enterpriseEndResources: record.endCash + totalEnterpriseCapital,
    conversionWeeks: journal.conversions.map((entry) => entry.week),
    shadowReconciliationOk: journal.shadowReconciliationOk,
  }
}
