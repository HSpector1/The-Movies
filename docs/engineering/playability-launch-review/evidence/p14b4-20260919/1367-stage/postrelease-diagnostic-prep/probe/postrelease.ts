// Observation-only replay of the completed failed trial. Never a full-route qualification.
import { createHash } from 'node:crypto'
import { performance } from 'node:perf_hooks'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { applyActions } from '../tree/src/core/actions.js'
import { activeContract, contractOffer, hiringMarketIds, renewalWindowOpen } from '../tree/src/core/employment.js'
import { nextStudioDecision } from '../tree/src/core/scriptReadModel.js'
import { initializeHollywood } from '../tree/src/core/hollywood.js'
import { makeSave, stableStringify, validateSaveV45 } from '../tree/src/core/save.js'
import { tick } from '../tree/src/core/tick.js'
import { TUNING } from '../tree/src/core/tuning.js'
import { contractEndRefusal } from '../tree/src/core/careerLifecycle.js'
import { foundRosterWallStudio, runRosterWallOperatingWeek, ROSTER_WALL_OPERATING_POLICIES } from '../tree/src/harness/roster-wall/campaign.js'
import type { Action, GameState } from '../tree/src/core/types.js'

const horizon = Number(process.env.PROBE_HORIZON ?? 520)
function requireDiagnosticHorizon(value: number): void {
  if (value !== 520) throw new Error('postrelease diagnostic: only the identical 520-week trial is allowed')
}
requireDiagnosticHorizon(horizon)
const policySha = createHash('sha256').update(readFileSync(fileURLToPath(import.meta.url))).digest('hex')
if (process.env.QUALIFIED_POLICY_SHA !== undefined) throw new Error('postrelease diagnostic: qualification input is forbidden')
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

// The observer never supplies an action or modifies a state. Counts below are output bounds,
// not engine limits or evidence that omitted inventory does not exist.
const observationLimits = { snapshots: 25, previousWeeks: 12, followingWeeks: 12, stallTransitions: 8,
  productions: 4, reservations: 8, projects: 16, concepts: 16, sets: 16, facilities: 16,
  intentsPerWeek: 32, refusalGroups: 64, encodedChars: 8192, outputBytes: 16777216 } as const
const bounded = <T>(values: readonly T[], maximum: number) => ({
  total: values.length, omitted: Math.max(0, values.length - maximum), values: values.slice(0, maximum),
})
function encoded(value: unknown) {
  const canonical = stableStringify(value)
  return { sha256: hash(value), chars: canonical.length, truncated: canonical.length > observationLimits.encodedChars,
    json: canonical.slice(0, observationLimits.encodedChars) }
}
function inventory(input: GameState) {
  const usedConcepts = new Set(input.scriptDevelopment.projects.map(project => project.conceptId))
  const unused = input.concepts.filter(concept => !usedConcepts.has(concept.id))
  return structuredClone({ week: input.market.tick, cash: input.studio.cash, releasedFilms: input.studio.releasedFilms.length,
    nextDecision: encoded(nextStudioDecision(input)),
    productions: bounded(input.studio.activeProductions.map(production => {
      const workflow = input.operations.workflows.find(row => row.productionId === production.id)
      return { id: production.id, conceptId: production.conceptId, startTick: production.startTick,
        remainingTicks: production.remainingTicks, directorId: production.directorId, writerId: production.writerId,
        craftIds: bounded(production.craftIds, 8), cast: production.cast,
        releaseCommitted: input.releaseAuthority.commitments.some(row => row.productionId === production.id),
        workflow: workflow === undefined ? null : { phase: workflow.phase, planRevision: workflow.planRevision,
          blocker: workflow.blocker, bindings: workflow.bindings, shootingTask: workflow.shootingTask,
          reservations: bounded(workflow.reservations, observationLimits.reservations),
          setup: workflow.setup === null ? null : { recipeId: workflow.setup.recipeId, admittedWeek: workflow.setup.admittedWeek,
            route: workflow.setup.route, stageFacilityId: workflow.setup.stageFacilityId, setId: workflow.setup.setId,
            requiredUnits: workflow.setup.requiredUnits, creditedUnits: workflow.setup.creditedUnits,
            lastCreditedWeek: workflow.setup.lastCreditedWeek, completedWeek: workflow.setup.completedWeek,
            priorWorkCount: workflow.setup.priorWork.length } } }
    }), observationLimits.productions),
    projects: bounded(input.scriptDevelopment.projects.filter(project => project.status !== 'produced').map(project => ({
      id: project.id, conceptId: project.conceptId, writerId: project.writerId, status: project.status,
      dueWeek: project.dueWeek, productionId: project.productionId, reservation: project.reservation,
    })), observationLimits.projects),
    concepts: { total: input.concepts.length, used: usedConcepts.size,
      unused: bounded(unused.map(concept => ({ id: concept.id, baseNegativeCost: concept.baseNegativeCost })), observationLimits.concepts) },
    sets: bounded(input.sets.map(set => ({ id: set.id, blueprintId: set.blueprintId, mountedOn: set.mountedOn,
      status: set.status, completesWeek: set.completesWeek, condition: set.condition })), observationLimits.sets),
    facilities: bounded(input.operations.facilities.map(facility => ({ id: facility.id, capability: facility.capability,
      capacity: facility.capacity })), observationLimits.facilities) })
}
type Intent = ReturnType<typeof runRosterWallOperatingWeek>['intents'][number]
type Observation = { inputWeek: number; before: ReturnType<typeof inventory>; afterActions: ReturnType<typeof inventory>;
  afterTick: ReturnType<typeof inventory>; intents: { total: number; omitted: number; values: ReturnType<typeof encoded>[] } }
const recent: Observation[] = []
const aroundFirstStall: Observation[] = []
let firstStall: { inputWeek: number; reason: string; productionId: string | null } | null = null
const unchanged = new Map<string, number>()
const refusalGroups = new Map<string, { firstWeek: number; lastWeek: number; count: number; firstIntent: ReturnType<typeof encoded> }>()
let refusedIntents = 0, omittedRefusals = 0, totalIntents = 0
function progress(input: GameState, productionId: string): string | null {
  const production = input.studio.activeProductions.find(row => row.id === productionId)
  if (production === undefined) return null
  const workflow = input.operations.workflows.find(row => row.productionId === productionId)
  return hash({ remainingTicks: production.remainingTicks, phase: workflow?.phase ?? null,
    shootingStatus: workflow?.shootingTask?.status ?? null, planRevision: workflow?.planRevision ?? null,
    creditedUnits: workflow?.setup?.creditedUnits ?? null })
}
function observe(before: GameState, afterActions: GameState, afterTick: GameState, intents: readonly Intent[]): void {
  totalIntents += intents.length
  for (const intent of intents) {
    if (intent.accepted) continue
    refusedIntents++
    const key = hash({ intentKind: intent.intentKind, ownerId: intent.ownerId, reason: intent.reason, action: intent.action })
    const old = refusalGroups.get(key)
    if (old !== undefined) { old.count++; old.lastWeek = before.market.tick }
    else if (refusalGroups.size < observationLimits.refusalGroups) refusalGroups.set(key,
      { firstWeek: before.market.tick, lastWeek: before.market.tick, count: 1, firstIntent: encoded(intent) })
    else omittedRefusals++
  }
  for (const id of unchanged.keys()) if (!afterTick.studio.activeProductions.some(row => row.id === id)) unchanged.delete(id)
  let unchangedId: string | null = null
  for (const production of before.studio.activeProductions) {
    const oldProgress = progress(before, production.id), nextProgress = progress(afterTick, production.id)
    const count = nextProgress !== null && oldProgress === nextProgress ? (unchanged.get(production.id) ?? 0) + 1 : 0
    unchanged.set(production.id, count)
    if (unchangedId === null && count >= observationLimits.stallTransitions) unchangedId = production.id
  }
  const failedOperation = intents.find(intent => !intent.accepted &&
    (intent.intentKind === 'production-operation' || intent.intentKind === 'release-commitment'))
  // Detection is diagnostic only: an unchanged coarse work clock is a lead, not a proven refusal cause.
  const justTriggered = firstStall === null && (failedOperation !== undefined || unchangedId !== null)
  if (justTriggered) firstStall = { inputWeek: before.market.tick,
    reason: failedOperation !== undefined ? 'actual production/release intent refused' : 'eight unchanged coarse production-clock transitions',
    productionId: failedOperation?.ownerId ?? unchangedId }
  if (firstStall !== null && before.market.tick > firstStall.inputWeek + observationLimits.followingWeeks) return
  const row: Observation = { inputWeek: before.market.tick, before: inventory(before), afterActions: inventory(afterActions),
    afterTick: inventory(afterTick), intents: bounded(intents.map(encoded), observationLimits.intentsPerWeek) }
  if (justTriggered) aroundFirstStall.push(...recent, row)
  else if (firstStall !== null) aroundFirstStall.push(row)
  else { recent.push(row); if (recent.length > observationLimits.previousWeeks) recent.shift() }
  if (aroundFirstStall.length > observationLimits.snapshots) throw new Error('postrelease diagnostic: observation bound exceeded')
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
  const staffed = staff(state)
  const beforeFilms = staffed.studio.releasedFilms.length
  // Existing WaveR branch: helper's ordinary tick is discarded, actual route takes develop:true.
  const driven = runRosterWallOperatingWeek({ state: staffed, operatingPolicyId: 'direct-package', captureIntents: true })
  state = tick(driven.stateAfterActions, { develop: true })
  observe(staffed, driven.stateAfterActions, state, driven.intents)
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
const baselineBytes = readFileSync(new URL('./baseline-result.json', import.meta.url))
const baselineSha = createHash('sha256').update(baselineBytes).digest('hex')
if (baselineSha !== '4aec19502c0da86a9de96ac160526371d4d7041abb35f9f92b55edb9d34296dc') throw new Error('postrelease diagnostic: baseline bytes changed')
const baseline = JSON.parse(baselineBytes.toString('utf8')) as Record<string, unknown>
const compared = { trialQualified, recentReleases, horizon, finalWeek: state.market.tick, accepted,
  replacementHires, refusals, samples, checkpoints, postRelease, postReleaseMeasured: postRelease !== null, finalStateHash: hash(state) }
const parity = Object.fromEntries(Object.entries(compared).map(([key, value]) => [key, hash(value) === hash(baseline[key])]))
const diagnosticPassed = Object.values(parity).every(Boolean) && !trialQualified
const diagnostic = { mode: 'observation-only', neverQualifiesFullRoute: true, diagnosticPassed, baselineSha,
  originalPolicySha: baseline['policySha'], diagnosticProbeSha: policySha, parity, observationLimits,
  firstStall, aroundFirstStall, finalInventory: inventory(state), totalIntents, refusedIntents, omittedRefusals,
  refusalGroups: [...refusalGroups].map(([key, row]) => ({ key, ...row })) }
const output = JSON.stringify({ diagnostic, policySha, trialQualified, recentReleases, scope: 'distinct seed-b fully operated route; not idle G-P/K3', horizon,
  qualifiedPolicySha: process.env.QUALIFIED_POLICY_SHA ?? null, finalWeek: state.market.tick,
  elapsedMs: performance.now() - started, accepted, replacementHires, refusals, samples, checkpoints, postRelease,
  postReleaseMeasured: postRelease !== null, finalStateHash: hash(state) }) + '\n'
if (Buffer.byteLength(output) > observationLimits.outputBytes) throw new Error('postrelease diagnostic: bounded output exceeded')
process.stdout.write(output)
if (!diagnosticPassed) throw new Error('postrelease diagnostic: original state/result parity failed; no route qualification')
