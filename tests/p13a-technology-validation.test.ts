import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { makeSave } from '../src/core/save.js'
import type { GameState } from '../src/core/types.js'
import { advanceTo, adoptExistingSoundChain, p13aGeneratedStudio, p13aResearchReady } from '../src/harness/p13a/fixtures.js'

let research: GameState
let purchased: GameState
let operational: GameState
beforeAll(() => {
  const ready = p13aResearchReady()
  research = advanceTo(applyActions(ready, [{ kind: 'beginResearch', projectId: ready.technology.projects[0]!.id, budgetPerWeek: 10_000 }]), 261)
  purchased = adoptExistingSoundChain(applyActions(advanceTo(p13aGeneratedStudio('p13a-validation-purchase'), 416), [{ kind: 'purchaseTechnology', technologyId: 'synchronized-sound' }]))
  operational = advanceTo(purchased, 428)
  for (const lawful of [research, purchased, operational]) makeSave(lawful)
}, 30_000)

function rejected(source: GameState, change: (state: GameState) => void, message: RegExp) {
  const changed = structuredClone(source)
  change(changed)
  expect(() => makeSave(changed)).toThrow(message)
}

describe('P13A original-input technology validation', () => {
  it('rejects an invented one-week discovery even when expenditure and access receipts agree', () => {
    rejected(research, state => {
      const project = state.technology.projects[0]!
      Object.assign(project, { status: 'completed', verifiedWork: 64, completedWeek: 261 })
      state.technology.access.push({ studioId: project.studioId, technologyId: project.technologyId, route: 'research',
        chosenWeek: 260, acquiredWeek: 261, accessCost: 0, researchProjectId: project.id })
    }, /elapsed capacity/)
  })

  it('rejects duplicate researcher-week charges even after expenditure and cash are reconciled', () => {
    rejected(research, state => {
      state.ledger.push({ ...state.ledger.find(row => row.kind === 'researchSpend')! })
      state.technology.projects[0]!.expenditure += 10_000
      state.studio.cash -= 10_000
    }, /repeated research charge/)
  })

  it('rejects deleted researcher wages even when cash is adjusted by the same amount', () => {
    rejected(research, state => {
      state.ledger = state.ledger.filter(row => row.kind !== 'researchPayroll')
      state.studio.cash += 2_000
    }, /research payroll/)
  })

  it('rejects a research spend deletion that would retain its unpaid acceleration', () => {
    rejected(research, state => {
      state.ledger = state.ledger.filter(row => row.kind !== 'researchSpend')
      state.studio.cash += 10_000
      state.technology.projects[0]!.expenditure = 0
    }, /work|spend|expenditure|acceleration/)
  })

  it('rejects an invented inventor discount on a real purchased installation', () => {
    rejected(purchased, state => {
      const adoption = state.technology.adoptions.find(row => row.studioId === state.hollywood!.playerStudioId)!
      adoption.route = 'research'
      adoption.equipmentCost = 225_000
      state.ledger.find(row => row.kind === 'technologyAdoption' && row.note === `technology-equipment:${adoption.id}`)!.amount = -225_000
      state.studio.cash += 75_000
    }, /misrepresents acquired access/)
  })

  it('rejects adoption dated before its real purchase even when the equipment charge is redated', () => {
    rejected(purchased, state => {
      const adoption = state.technology.adoptions.find(row => row.studioId === state.hollywood!.playerStudioId)!
      adoption.committedWeek = 415
      state.ledger.find(row => row.kind === 'technologyAdoption' && row.note === `technology-equipment:${adoption.id}`)!.week = 415
    }, /precedes.*access/)
  })

  it('rejects removal of purchase cash authority without granting free access', () => {
    rejected(purchased, state => {
      const own = state.hollywood!.playerStudioId
      state.ledger = state.ledger.filter(row => row.note !== `technology-access:${own}:synchronized-sound`)
      state.studio.cash += 200_000
    }, /access not paid exactly once/)
  })

  it('rejects changing an exact stage/Post physical chain or dropping its Post job', () => {
    rejected(purchased, state => {
      const adoption = state.technology.adoptions.find(row => row.studioId === state.hollywood!.playerStudioId)!
      adoption.stageFacilityId = state.operations.facilities.find(facility => facility.capability === 'soundstage' && facility.id !== adoption.stageFacilityId)!.id
    }, /stage job mismatch/)
    rejected(purchased, state => {
      const adoption = state.technology.adoptions.find(row => row.studioId === state.hollywood!.playerStudioId)!
      adoption.physicalProjectIds = adoption.physicalProjectIds.filter(id => state.placement.facilities.find(placement => placement.projectId === id)!.blueprintId !== 'synchronized-sound-post')
      adoption.installationCost -= 300_000
    }, /compatible Post commitment/)
  })

  it('rejects deleting or delaying the exact completed physical capability receipt', () => {
    rejected(operational, state => {
      state.technology.adoptions.find(row => row.studioId === state.hollywood!.playerStudioId)!.operationalWeek = null
    }, /exact physical completion/)
    rejected(operational, state => {
      state.technology.adoptions.find(row => row.studioId === state.hollywood!.playerStudioId)!.operationalWeek = 427
    }, /exact physical completion/)
  })
})
