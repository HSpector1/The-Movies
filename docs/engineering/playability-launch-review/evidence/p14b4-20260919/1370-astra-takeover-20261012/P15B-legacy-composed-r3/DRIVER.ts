// Scratch-only standalone diagnostic, NOT executed. Parent owns freeze/environment/lane.
// Two distinct constructed terminal controls, not all-authorities-in-one-envelope/natural-gameplay proof.
import assert from 'node:assert/strict'
import { performance } from 'node:perf_hooks'
import { generateWorld } from '/Users/zacheryspector/studio-specialists/p15b/src/core/worldgen.ts'
import { beginFounding, FOUNDING_MINIMUMS } from '/Users/zacheryspector/studio-specialists/p15b/src/core/employment.ts'
import { contractOfferOptions } from '/Users/zacheryspector/studio-specialists/p15b/src/core/index.ts'
import { applyActions } from '/Users/zacheryspector/studio-specialists/p15b/src/core/actions.ts'
import { CONDITION_LAWS } from '/Users/zacheryspector/studio-specialists/p15b/src/core/corporateConditionLive.ts'
import { CORPORATE_CONDITION_VERSION } from '/Users/zacheryspector/studio-specialists/p15b/src/core/corporateCondition.ts'
import { tick } from '/Users/zacheryspector/studio-specialists/p15b/src/core/tick.ts'
import { makeSave, stableStringify, convertFromP15BSave, migrateToV47, migrateToV46, migrateToV45 } from '/Users/zacheryspector/studio-specialists/p15b/src/core/save.ts'
import { rivalFacilityDisposalEligibility, disposeRivalFacility } from '/Users/zacheryspector/studio-specialists/p15b/src/core/rivalResearch.ts'
import { accepted45 } from '/Users/zacheryspector/studio-specialists/p15b/tests/helpers/1368-recovery-witnesses.ts'
import type { GameState } from '/Users/zacheryspector/studio-specialists/p15b/src/core/types.ts'

const canon = (v: unknown) => stableStringify(v)
function admitted(s: GameState) { const bytes = canon(s); try { return makeSave(s) } finally { assert.equal(canon(s), bytes, 'reader mutated caller, including refusal') } }
// Exact p15b-live labelled debit constructor; debit is whole and leaves original fractional cash untouched.
function debit(s: GameState): GameState {
  const amount = Math.floor(s.studio.cash) + 1
  if (!Number.isInteger(amount) || amount <= 0) throw new Error('drainPlayer: amount must be a positive integer')
  return { ...s, studio: { ...s.studio, cash: s.studio.cash - amount }, ledger: [...s.ledger,
    { week: s.market.tick, kind: 'publicity', amount: -amount, note: 'p15b test drain' }] }
}
function terminal(source: GameState, started: number, budget: number) {
  const bytes = canon(source); let state = debit(structuredClone(source)); assert(state.studio.cash < 0); admitted(state)
  const law = CONDITION_LAWS[CORPORATE_CONDITION_VERSION]
  // Fresh negative path: warning then distress (at most one transition/evaluation), entering distress counts1.
  // Current v1 yields max(4+1,8)+26−1=33 evaluations; first eligible boundary is above recording/origin.
  const evaluations = Math.max(law.CORPORATE_WARN_SUSTAIN_WEEKS + 1, law.CORPORATE_DISTRESS_SUSTAIN_WEEKS) + law.CORPORATE_CLOSURE_DISTRESS_WEEKS - 1
  const owner = state.hollywood!.identities.find(i => i.studioId === state.hollywood!.playerStudioId)!
  const firstEligible = Math.max(state.market.tick + 1, state.corporateCondition.recordedFromWeek + 1, state.hollywood!.originWeek + 1, owner.enteredWeek!)
  const limit = firstEligible + evaluations - 1
  while (state.market.tick < limit && !state.studioClosure.closures.some(c => c.studioId === state.hollywood!.playerStudioId)) {
    assert(performance.now() - started <= budget, 'original route/fixture elapsed budget')
    const before = canon(state); const next = tick(state); assert.equal(canon(state), before, 'tick mutated input'); state = next
  }
  const envelope = admitted(state)
  const c = state.studioClosure.closures.find(c => c.studioId === state.hollywood!.playerStudioId)
  assert(c, 'actual terminal premise absent within derived fresh-negative horizon; no history/timing rescue')
  const e = state.campaignLegacy.endOfRun; assert(e)
  assert.equal(e.closureId, c.closureId); assert.equal(c.endOfRun, e.legacySnapshotId)
  assert.equal(e.definition, 'campaign-legacy/v3'); assert.equal(e.boundaryWeek, c.closureWeek + 1)
  assert.equal(canon(source), bytes, 'source authority mutated')
  return { state, envelope, closure: c, ended: e, observation: { firstEligible, evaluations, limit, definition: CORPORATE_CONDITION_VERSION } }
}
function refusals(envelope: ReturnType<typeof makeSave>, required: string[]) {
  const bytes = canon(envelope); const messages: { target: string; message: string }[] = []
  for (const [target, convert] of [['48→47', convertFromP15BSave], ['migrate47', migrateToV47], ['migrate46', migrateToV46], ['migrate45', migrateToV45]] as const) {
    let message = ''
    try { convert(envelope) } catch (e) { message = e instanceof Error ? e.message : String(e) }
    assert(message, `${target} unexpectedly discarded terminal authority`)
    for (const reason of required) assert(message.includes(reason), `${target} missing actual reason '${reason}': ${message}`)
    const componentOrder = ['corporateCondition', 'cannot downgrade or discard an actual studio closure', 'modern Legacy v3 official authority', 'ended Legacy manifest', 'recorded founding fund', 'recovery authority', 'recorded shared-market assessment', 'recorded Power Ranking quarter', 'frozen 2040 Legacy']
    const positions = componentOrder.filter(reason => message.includes(reason)).map(reason => message.indexOf(reason))
    assert(positions.every((position, i) => i === 0 || positions[i - 1]! < position), `${target} composed authority order changed`)

    assert.equal(canon(envelope), bytes, `${target} mutated whole input`); messages.push({ target, message })
  }
  return messages
}
const results: Record<string, unknown>[] = []
function measure(label: string, budget: number, body: (row: Record<string, unknown>, started: number) => void) {
  const started = performance.now(); const row: Record<string, unknown> = { label, budgetMs: budget }; results.push(row)
  try { body(row, started); row.passed = true }
  catch (e) { row.passed = false; row.error = e instanceof Error ? e.stack : String(e); process.exitCode = 1 }
  finally { row.elapsedMs = performance.now() - started; row.budgetPassed = Number(row.elapsedMs) <= budget; if (!row.budgetPassed) { row.passed = false; process.exitCode = 1 } }
}
measure('Public lawful late founding at3 plus labelled debit terminal: nonempty fund composition', 90_000, (row, started) => {
  let state = generateWorld('p1364-opened-01'); admitted(state)
  while (state.market.tick < 3) state = tick(state)
  admitted(state); const sourceWorld = state; const prior = canon(state); state = beginFounding(state); assert.equal(canon(sourceWorld), prior, 'public founding opener mutated input'); admitted(state)
  // Actual minimum offers/signatures, same sequence as p1364 signMinimum; no transplanted fund.
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    let count = 0
    for (const id of state.founding!.applicantIds) {
      if (count === FOUNDING_MINIMUMS[role]) break
      if (state.talent.find(t => t.id === id)!.role !== role) continue
      const offer = contractOfferOptions(state, id)[0]; if (!offer) continue
      const priorState = state, priorBytes = canon(state)
      state = applyActions(state, [{ kind: 'signContract', talentId: id, termWeeks: offer.termWeeks }]); assert.equal(canon(priorState), priorBytes, 'signature mutated input'); count++
    }
    assert.equal(count, FOUNDING_MINIMUMS[role], `real offers fail minimum ${role}`)
  }
  admitted(state); const signedState = state, signedBytes = canon(state)
  state = applyActions(state, [{ kind: 'foundStudio' }, { kind: 'activateStudioOperations' }, { kind: 'activateScriptDevelopment' }, { kind: 'activateCastingSessions' }]); assert.equal(canon(signedState), signedBytes, 'found/activate mutated input'); admitted(state)
  const fund = state.foundingFunding.fund; assert(fund); assert.equal(fund.provenance, 'opened'); assert(fund.allocations.length > 0); assert.equal(fund.closedWeek, 3)
  const fundBytes = canon(state.foundingFunding); row.preparedWeek = state.market.tick; row.fundAllocations = fund.allocations.length; row.baselineAndPreparedAdmitted = true
  const result = terminal(state, started, 90_000)
  assert.equal(canon(result.state.foundingFunding), fundBytes, 'actual funding authority not preserved through terminal')
  row.finalAdmitted = true; row.actualClosureWeek = result.closure.closureWeek; row.observation = result.observation; row.endedId = result.ended.legacySnapshotId
  row.messages = refusals(result.envelope, ['corporateCondition', 'cannot downgrade or discard an actual studio closure', 'ended Legacy manifest', 'recorded founding fund', 'frozen 2040 Legacy'])
  row.openedBaselineBytes = prior.length // No payload publication.
})
measure('Accepted genuine45 current migration plus actual durable disposal and labelled player debit terminal', 120_000, (row, started) => {
  const witness = accepted45('ordinary'); const source = witness.current.state as GameState; const sourceBytes = canon(source); admitted(source)
  const studioId = witness.row.studioId, facilityId = witness.row.facilityId; assert(studioId && facilityId)
  let state = structuredClone(source); const owner = state.hollywood!.businesses.find(b => b.studioId === studioId); assert(owner)
  assert.equal(owner.costCutting.since, null)
  // Existing reviewed synthetic cutting-policy premise, not a natural decision or retroactive receipt.
  owner.costCutting.since = state.market.tick; admitted(state)
  const eligible = rivalFacilityDisposalEligibility(state, studioId, facilityId); assert(eligible.eligible, `actual disposal eligibility absent: ${JSON.stringify(eligible)}`)
  const before = canon(state); const disposed = disposeRivalFacility(state, studioId, facilityId); assert.equal(canon(state), before, 'real producer mutated caller'); admitted(disposed)
  const receipts = disposed.hollywood!.receipts.filter(r => r.kind === 'facilityDisposed' && r.studioId === studioId && r.facilityId === facilityId)
  assert.equal(receipts.length, 1); const receiptBytes = canon(receipts[0]); const body = disposed.hollywood!.businesses.find(b => b.studioId === studioId)!
  const refund = body.account.periods.reduce((sum, p) => sum + p.movements.facilityDemolitionRefund, 0); assert(refund > 0)
  assert(!body.operations.facilities.some(f => f.id === facilityId))
  row.baselineAndPreparedAdmitted = true; row.disposedWeek = disposed.market.tick; row.actualRefund = refund
  const result = terminal(disposed, started, 120_000)
  const held = result.state.hollywood!.receipts.find(r => r.kind === 'facilityDisposed' && r.studioId === studioId && r.facilityId === facilityId); assert(held)
  assert.equal(canon(held), receiptBytes, 'actual durable disposal receipt changed')
  const terminalOwner = result.state.hollywood!.businesses.find(b => b.studioId === studioId)!
  assert(terminalOwner.account.periods.reduce((sum, p) => sum + p.movements.facilityDemolitionRefund, 0) >= refund)
  assert(!terminalOwner.operations.facilities.some(f => f.id === facilityId)); assert.equal(canon(source), sourceBytes)
  const actualRecovery = ['facilityDemolitionRefund', 'facilityDisposed', ...(terminalOwner.costCutting.since === null ? [] : ['costCutting.since'])]
  row.finalAdmitted = true; row.actualClosureWeek = result.closure.closureWeek; row.observation = result.observation; row.actualPresentRecoveryReasons = actualRecovery
  row.messages = refusals(result.envelope, ['corporateCondition', 'cannot downgrade or discard an actual studio closure', 'ended Legacy manifest', 'frozen 2040 Legacy', 'recovery authority', ...actualRecovery])
})
console.log(JSON.stringify({ classification: 'Two proposed separately admitted authority composition witnesses; no full gameplay acceptance', results }, null, 2))
