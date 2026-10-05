// Original operated policy plus paid public set maintenance only. New 520-week qualification required.
import { createHash } from 'node:crypto'
import { performance } from 'node:perf_hooks'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { applyActions } from '../tree/src/core/actions.js'
import { repairSetRefusal, setIsUsable } from '../tree/src/core/sets.js'
import { activeContract, canAfford, contractOffer, hiringMarketIds, renewalWindowOpen } from '../tree/src/core/employment.js'
import { initializeHollywood } from '../tree/src/core/hollywood.js'
import { makeSave, stableStringify, validateSaveV45 } from '../tree/src/core/save.js'
import { tick } from '../tree/src/core/tick.js'
import { TUNING } from '../tree/src/core/tuning.js'
import { contractEndRefusal } from '../tree/src/core/careerLifecycle.js'
import { foundRosterWallStudio, runRosterWallOperatingWeek, ROSTER_WALL_OPERATING_POLICIES } from '../tree/src/harness/roster-wall/campaign.js'
import type { Action, GameState } from '../tree/src/core/types.js'

const horizon = Number(process.env.PROBE_HORIZON ?? 520)
if (![520, 6344].includes(horizon)) throw new Error('postrelease: horizon must be bounded trial520 or qualified full6344')
const policySha = createHash('sha256').update(readFileSync(fileURLToPath(import.meta.url))).digest('hex')
if (horizon === 6344 && process.env.QUALIFIED_POLICY_SHA !== policySha) throw new Error('postrelease: full route requires recorded trial qualification and exact policy SHA')
const ceiling = Number(process.env.PROBE_CEILING_MS)
if (!Number.isSafeInteger(ceiling) || ceiling <= 0) throw new Error('postrelease: parent must supply reviewed external/internal wall ceiling')
const started = performance.now()
const roles = ['actor', 'director', 'writer', 'craft'] as const
const desired = ROSTER_WALL_OPERATING_POLICIES['direct-package'].desiredRoster
const refusals: Record<string, number> = {}
const samples: { week: number; action: Action; reason: string }[] = []
const accepted = { hires: 0, renewals: 0 }
const replacementHires: { week: number; talentId: string; role: string; coverageBefore: number; target: number }[] = []
const checkpoints: unknown[] = []
const hash = (x: unknown) => createHash('sha256').update(stableStringify(x)).digest('hex')
let officialHash: string | null = null
let postRelease: unknown = null
let state = initializeHollywood(foundRosterWallStudio('seed-b', 'direct-package'), 'fresh')
for (const role of roles) {
  const opening = state.talent.filter(t => t.role === role && activeContract(state, t.id) !== undefined)
  if (opening.length < desired[role] || opening.some(t => activeContract(state, t.id)!.endWeekExclusive !== 208)) {
    throw new Error('postrelease: opening roster must meet published target with genuine initial208-week terms')
  }
}

function attempt(input: GameState, action: Action): GameState {
  try {
    const next = applyActions(input, [action])
    if (action.kind === 'signContract') {
      accepted.hires++
      const person = input.talent.find(t => t.id === action.talentId)!
      if ((roles as readonly string[]).includes(person.role)) {
        const role = person.role as typeof roles[number]
        const coverageBefore = input.talent.filter(t => t.role === role && activeContract(input, t.id) !== undefined).length
        if (input.market.tick >= 208 && coverageBefore < desired[role] && activeContract(input, person.id) === undefined) {
          replacementHires.push({ week: input.market.tick, talentId: person.id, role, coverageBefore, target: desired[role] })
        }
      }
    }
    if (action.kind === 'renewContract') accepted.renewals++
    return next
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (!message.startsWith(`applyActions: ${action.kind} rejected`)) throw error
    refusals[message] = (refusals[message] ?? 0) + 1
    if (samples.length < 32) samples.push({ week: input.market.tick, action, reason: message })
    return input
  }
}

function terms(input: GameState, id: string): number[] {
  return [...TUNING.CONTRACT_TERM_OPTIONS].sort((a, b) => b - a)
    .filter(term => contractEndRefusal(input, id, input.market.tick + term) === null)
}

function staff(input: GameState): GameState {
  let next = input
  // Stable employment order; no bid, retirement override, credit grant or cash mutation.
  for (const contract of input.contracts) {
    const current = activeContract(next, contract.talentId)
    if (current === undefined || current.startWeek !== contract.startWeek || current.endWeekExclusive !== contract.endWeekExclusive
      || !renewalWindowOpen(current, next.market.tick)) continue
    const term = terms(next, contract.talentId)[0]
    if (term !== undefined) next = attempt(next, { kind: 'renewContract', talentId: contract.talentId, termWeeks: term })
  }
  for (const role of roles) {
    const count = () => next.talent.filter(person => person.role === role && activeContract(next, person.id) !== undefined).length
    if (count() >= desired[role]) continue
    const pool = hiringMarketIds(next).flatMap(id => {
      const person = next.talent.find(t => t.id === id)
      const term = terms(next, id)[0]
      if (person?.role !== role || term === undefined) return []
      const offer = contractOffer(next, id, term)
      return [{ id, term, annualSalary: offer.annualSalary, signingBonus: offer.signingBonus }]
    }).sort((a, b) => a.annualSalary - b.annualSalary || a.signingBonus - b.signingBonus || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    for (const candidate of pool) {
      if (count() >= desired[role]) break
      next = attempt(next, { kind: 'signContract', talentId: candidate.id, termWeeks: candidate.term })
    }
  }
  return next
}

// This is controller maintenance, not a source/economic change. Existing public admission
// owns price, shared scenery capacity, set holders, solvency and the paid work clock.
type MaintenanceRecord = { week: number; setId: string; conditionBefore: number; quotedCost: number;
  cashBefore: number; cashAfter: number; predictedRefusal: ReturnType<typeof repairSetRefusal>;
  accepted: boolean; refusal: string | null; conditionAfter: number; statusAfter: string;
  completesWeek: number | null; paid: number; ledger: GameState['ledger'] }
const maintenance = { attempts: 0, accepted: 0, refused: 0, paid: 0, omittedRecords: 0,
  recordLimit: 512, records: [] as MaintenanceRecord[], refusalCounts: {} as Record<string, number> }
function maintainSets(input: GameState): GameState {
  let next = input
  // No proactive refurbishment, replacement, novel set, strike or policy-specific price.
  const ids = input.sets.filter(set => set.status === 'standing' && !setIsUsable(set))
    .map(set => set.id).sort((a, b) => a < b ? -1 : a > b ? 1 : 0)
  for (const id of ids) {
    const before = next
    const set = before.sets.find(candidate => candidate.id === id)
    if (set === undefined) throw new Error('postrelease maintenance: selected set disappeared')
    const quotedCost = TUNING.SET_REPAIR_COST
    const predictedRefusal = repairSetRefusal(before, id, cost => canAfford(before, cost).ok)
    let refusal: string | null = null
    try {
      next = applyActions(before, [{ kind: 'repairSet', setId: id }])
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (!message.startsWith('applyActions: repairSet rejected')) throw error
      refusal = message
      next = before
    }
    const acceptedRepair = refusal === null
    const after = next.sets.find(candidate => candidate.id === id)
    if (after === undefined) throw new Error('postrelease maintenance: public repair lost its set')
    const ledger = next.ledger.slice(before.ledger.length)
    if (acceptedRepair && (next === before || predictedRefusal !== null ||
      next.studio.cash !== before.studio.cash - quotedCost || ledger.length !== 1 ||
      ledger[0]!.kind !== 'setMaintenance' || ledger[0]!.amount !== -quotedCost ||
      ledger[0]!.week !== before.market.tick || after.status !== 'under-construction' ||
      after.completesWeek !== before.market.tick + TUNING.SET_REPAIR_WEEKS ||
      after.condition !== set.condition || after.novelty !== set.novelty || after.quality !== set.quality)) {
      throw new Error('postrelease maintenance: public paid repair did not match existing source law')
    }
    maintenance.attempts++
    if (acceptedRepair) { maintenance.accepted++; maintenance.paid += quotedCost }
    else {
      if (predictedRefusal === null) throw new Error('postrelease maintenance: public refusal disagrees with its source guard: ' + refusal)
      maintenance.refused++
      maintenance.refusalCounts[predictedRefusal.code] = (maintenance.refusalCounts[predictedRefusal.code] ?? 0) + 1
    }
    const row: MaintenanceRecord = { week: before.market.tick, setId: id, conditionBefore: set.condition,
      quotedCost, cashBefore: before.studio.cash, cashAfter: next.studio.cash, predictedRefusal,
      accepted: acceptedRepair, refusal, conditionAfter: after.condition, statusAfter: after.status,
      completesWeek: after.completesWeek, paid: acceptedRepair ? quotedCost : 0, ledger: structuredClone(ledger) }
    if (maintenance.records.length < maintenance.recordLimit) maintenance.records.push(row)
    else maintenance.omittedRecords++
  }
  return next
}

function timing(input: GameState) {
  const observations = []
  for (let i = 0; i < 3; i++) {
    const begin = performance.now(), save = makeSave(input), made = performance.now()
    validateSaveV45(save)
    const validated = performance.now()
    observations.push({ makeSaveMs: made - begin, additionalValidateMs: validated - made })
  }
  return { week: input.market.tick, bytes: Buffer.byteLength(stableStringify(makeSave(input))), observations }
}

while (state.market.tick < horizon) {
  if (performance.now() - started > ceiling) throw new Error(`postrelease: bounded wall ceiling at week${state.market.tick}`)
  const staffed = maintainSets(staff(state))
  const beforeFilms = staffed.studio.releasedFilms.length
  // Existing WaveR branch: helper's ordinary tick is discarded, actual route takes develop:true.
  const driven = runRosterWallOperatingWeek({ state: staffed, operatingPolicyId: 'direct-package', captureIntents: false })
  state = tick(driven.stateAfterActions, { develop: true })
  if (state.market.tick % 52 === 0 || state.market.tick === 6240) {
    checkpoints.push({ week: state.market.tick, cash: state.studio.cash, films: state.studio.releasedFilms.length,
      activeFilms: state.studio.activeProductions.length, roster: Object.fromEntries(roles.map(role => [role, state.talent.filter(t => t.role === role && activeContract(state, t.id) !== undefined).length])) })
    process.stderr.write(`postrelease week${state.market.tick}, films${state.studio.releasedFilms.length}\n`)
  }
  if (state.market.tick === 6240) {
    if (state.campaignLegacy.official === null) throw new Error('postrelease: missing genuine official freeze')
    officialHash = hash(state.campaignLegacy.official)
  }
  const film = state.studio.releasedFilms.slice(beforeFilms).find(f => f.releaseTick > 6240)
  if (film !== undefined) {
    if (officialHash === null || hash(state.campaignLegacy.official) !== officialHash) throw new Error('postrelease: official changed after freeze')
    postRelease = { productionId: film.productionId, releaseWeek: film.releaseTick, officialHash, timing: timing(state) }
    break
  }
}
validateSaveV45(makeSave(state))
const recentReleases = state.studio.releasedFilms.filter(f => f.releaseTick >= 312 && f.releaseTick < 520).length
const trialQualified = horizon === 520 && state.market.tick === 520 && recentReleases > 0 && replacementHires.length > 0
  && state.studio.cash > 0 && roles.every(role => state.talent.filter(t => t.role === role && activeContract(state, t.id) !== undefined).length >= desired[role])
process.stdout.write(JSON.stringify({ policySha, trialQualified, recentReleases, scope: 'distinct seed-b fully operated route; not idle G-P/K3', horizon,
  qualifiedPolicySha: process.env.QUALIFIED_POLICY_SHA ?? null, finalWeek: state.market.tick,
  elapsedMs: performance.now() - started, accepted, replacementHires, refusals, samples, checkpoints, maintenance, postRelease,
  postReleaseMeasured: postRelease !== null, finalStateHash: hash(state) }) + '\n')
if (horizon === 6344 && postRelease === null) throw new Error('postrelease: no lawful post2040 release within bounded route')
if (horizon === 520 && !trialQualified) throw new Error('postrelease: staffing/production trial did not qualify; full route is not authorized by this result')
