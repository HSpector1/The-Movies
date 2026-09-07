import {
  applyActions, castingPackageReadModel, exportSave, importSave, makeSave,
  nextStudioDecision, tick, type GameState,
} from '../../src/core/index.js'
import { commissionPayload, contractedByRole, minimalManagedStudio } from './_contractFixtures.js'

// OPS-P08P10-FOUNDATION-RECOVERY-01 / AUD-002. Every durable transition is a
// legal action or tick. No cash injection, edited contract, or forced project.
export function foundationRecoveryReadyFilm(): GameState {
  let state = minimalManagedStudio('p00p07-audit-contract-expiry')
  const writer = contractedByRole(state, 'writer')[0]!
  state = applyActions(state, [{ kind: 'commissionScript', project: commissionPayload(state, state.concepts[0]!.id, writer.id) }])
  const projectId = state.scriptDevelopment.projects[0]!.id
  state = tick(state)
  state = applyActions(state, [{ kind: 'acceptScript', projectId }])
  const project = castingPackageReadModel(state).projects.find(p => p.projectId === projectId)!
  const actors = contractedByRole(state, 'actor')
  state = applyActions(state, [{ kind: 'greenlightScriptProject', production: {
    projectId, directorId: contractedByRole(state, 'director')[0]!.id,
    craftIds: [contractedByRole(state, 'craft')[0]!.id],
    cast: { lead: actors[0]!.id, antagonist: actors[1]!.id, support: actors[2]!.id },
    budget: { negative: project.negativeOptions[0]!.amount, marketing: project.marketingOptions[0]!.amount },
  } }])
  for (let week = 0; week < 25; week++) {
    if (state.studio.activeProductions[0]?.remainingTicks === 1) return state
    for (let decision = 0; decision < 8; decision++) {
      const next = nextStudioDecision(state)
      if (next?.kind !== 'productionOperation') break
      state = applyActions(state, [next.command])
    }
    state = tick(state)
  }
  throw new Error('Legal recovery fixture did not reach Release Ready')
}

export function foundationRecoveryStudio(): GameState {
  let state = foundationRecoveryReadyFilm()
  const productionId = state.studio.activeProductions[0]!.id
  while (state.market.tick < 104) state = tick(state)
  if (state.contracts.length !== 0) throw new Error('Founding contracts have not expired')
  state = applyActions(state, [{ kind: 'commitPictureToRelease', productionId }])
  state = tick(state)
  importSave(exportSave(makeSave(state)))
  return state
}
