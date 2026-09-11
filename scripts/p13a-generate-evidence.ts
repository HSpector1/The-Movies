import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { BridgeSession } from '../bridge/session.ts'
import { p13aLaboratorySlice, p13aResearchEntry, p13aResearchReady, p13aGeneratedStudio, advanceTo, adoptExistingSoundChain } from '../src/harness/p13a/fixtures.js'
import { applyActions } from '../src/core/actions.js'
import { activeContract, busyTalentIds, hiringMarketIds } from '../src/core/employment.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { productionPayload } from '../tests/contracts/_contractFixtures.js'
import { SCHEMA_ID } from '../bridge/protocol.ts'

/** Recruit through the current hiring market; never fabricate staff or contracts. */
function employFilmTeam(state: GameState): GameState {
  const required = [['writer', 1], ['director', 1], ['actor', 3], ['craft', 1]] as const
  const deadline = state.market.tick + 16
  for (;;) {
    let complete = true
    for (const [role, count] of required) {
      const available = () => state.talent.filter(person => person.role === role && activeContract(state, person.id) && !busyTalentIds(state).has(person.id))
      while (available().length < count) {
        const candidate = hiringMarketIds(state).map(id => state.talent.find(person => person.id === id)!)
          .find(person => person.role === role && !busyTalentIds(state).has(person.id))
        if (!candidate) { complete = false; break }
        state = applyActions(state, [{kind: 'signContract', talentId: candidate.id, termWeeks: 208}])
      }
    }
    if (complete) return state
    if (state.market.tick >= deadline) throw new Error('Current hiring rotations could not lawfully staff the generated film within 16 weeks')
    state = tick(state)
  }
}

const scenario = process.argv[2] ?? 'early'
if (!['early', 'research-entry', 'research-active', 'research-complete', 'production-choice', 'sound-filming', 'commercial-entry'].includes(scenario)) {
  throw new Error('Unknown generated P13A scenario')
}
const directory = resolve('artifacts/p13a', scenario)
const path = resolve(directory, 'generated-laboratory.checkpoint.json')
const manifestPath = resolve(directory, 'manifest.json')
if (existsSync(path) || existsSync(manifestPath)) throw new Error('Generated evidence already exists; immutable outputs will not be overwritten')
mkdirSync(directory, {recursive: true})
let state = scenario === 'early' ? p13aLaboratorySlice()
  : scenario === 'research-entry' ? p13aResearchEntry()
    : scenario === 'commercial-entry' ? advanceTo(p13aGeneratedStudio('p13a-wait-control-01'), 416)
      : p13aResearchReady()
if (['research-active', 'research-complete', 'production-choice', 'sound-filming'].includes(scenario)) {
  state = applyActions(state, [{kind: 'beginResearch', projectId: state.technology.projects[0]!.id, budgetPerWeek: 10_000}])
  state = advanceTo(state, scenario === 'research-active' ? 261 : 303)
  if (scenario === 'production-choice' || scenario === 'sound-filming') {
    state = employFilmTeam(advanceTo(adoptExistingSoundChain(state), 315))
    state = applyActions(state, [{kind: 'greenlight', production: productionPayload(state)}])
    if (scenario === 'sound-filming') {
      const productionId = state.studio.activeProductions[0]!.id
      const adoption = state.technology.adoptions.find(row => row.studioId === state.hollywood!.playerStudioId && row.operationalWeek !== null)!
      state = applyActions(state, [{kind: 'setProductionTechnology', productionId, method: 'synchronized-dialogue', adoptionId: adoption.id}])
      const deadline = state.market.tick + 12
      while (state.operations.workflows.find(row => row.productionId === productionId)?.phase !== 'shooting') {
        if (state.market.tick >= deadline) throw new Error('Generated sound film did not reach first Shooting through normal engine advances')
        state = tick(state)
      }
      if (state.technology.productions.find(row => row.productionId === productionId)?.lockedWeek === null) {
        throw new Error('First Shooting must retain the actual locked technology choice')
      }
    }
  }
}
if (scenario === 'commercial-entry' && state.operations.facilities.some(facility => facility.capability === 'laboratory')) {
  throw new Error('Commercial entry must prove the route without a Laboratory')
}
const session = new BridgeSession(state, `p13a-generated-${scenario}-laboratory-01`)
const snapshot = session.snapshot()
const checkpoint = session.exportRuntimeCheckpointEncoded().encoded
const production = state.studio.activeProductions[0]
const own = state.hollywood!.playerStudioId
const manifest = {
  kind: 'p13a-generated-evidence/v1', source: 'live engine generated fixture; no user campaign input',
  scenario, seed: state.seed, week: state.market.tick,
  laboratoryFacilityId: state.operations.facilities.find(facility => facility.capability === 'laboratory')?.id ?? null,
  research: state.technology.projects.find(project => project.studioId === own) ?? null,
  adoption: state.technology.adoptions.find(adoption => adoption.studioId === own) ?? null,
  productionId: production?.id ?? null,
  productionPhase: state.operations.workflows.find(workflow => workflow.productionId === production?.id)?.phase ?? null,
  productionTechnology: state.technology.productions.find(row => row.productionId === production?.id) ?? null,
  checkpoint: path, sha256: createHash('sha256').update(checkpoint).digest('hex'), bytes: Buffer.byteLength(checkpoint),
  schemaId: SCHEMA_ID, stateDigest: snapshot.stateDigest, saveVersion: 20,
  generatorSha256: createHash('sha256').update(readFileSync(resolve('scripts/p13a-generate-evidence.ts'))).digest('hex'),
}
writeFileSync(path, checkpoint, {flag: 'wx'})
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', {flag: 'wx'})
console.log(JSON.stringify(manifest, null, 2))
