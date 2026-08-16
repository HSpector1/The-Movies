// Week-208 roster-wall observatory: canonical Week-196 campaign entry harvest.
//
// ANALYSIS ONLY. This module deliberately owns a mechanical copy of the frozen
// Facilities & Construction operating-policy controller. The facilities harness
// has no final-state/checkpoint seam, and changing it would alter reviewed evidence
// tooling. Vacant-estate parity tests therefore compare this copy against
// runFacilitiesArm at the exact Week-196 boundary.

import { createHash } from 'node:crypto'
import {
  FOUNDING_MINIMUMS,
  NEGATIVE_BUDGET_MULTIPLIERS,
  TUNING,
  applyActions,
  beginFounding,
  busyTalentIds,
  canAfford,
  contractOffer,
  expectedWeeklyRunRevenue,
  exportSave,
  freelancerFee,
  freelancerMarketIds,
  generateWorld,
  importSave,
  isContracted,
  makeSaveV12,
  marketingLevelsFor,
  nextStudioDecision,
  readyScriptPerceivedStrength,
  renewalWindowOpen,
  resolveShape,
  runway,
  stableStringify,
  tick,
  validateSaveV12,
  weeklyOverhead,
  weeklyPayroll,
  weeklySalary,
} from '../../core/index.js'
import type {
  Action,
  CastingSession,
  CastingSlate,
  CastSlot,
  CommissionScriptPayload,
  ContractOffer,
  CreativeRole,
  FacilityCapability,
  GameState,
  GreenlightScriptProjectPayload,
  LedgerEntry,
  ReceptionInputs,
  SaveFileV12,
  ScriptProject,
  Talent,
} from '../../core/index.js'

export const ROSTER_WALL_ENTRY_WEEK = 196 as const
export const ROSTER_WALL_FOUNDING_TERM_WEEKS = 208 as const
export const ROSTER_WALL_TIMING_SHADOW_WEEKS = [156, 182, 196] as const
export const ROSTER_WALL_OPERATING_POLICY_IDS = [
  'direct-package',
  'development-casting',
  'scaled-two-team',
] as const
export const ROSTER_WALL_ESTATE_POLICY_IDS = [
  'vacant',
  'annex-start-week-0',
] as const
export const ROSTER_WALL_FOUNDING_TERM_POLICY_IDS = [
  'all-208',
  'round-robin-mixed',
] as const

export type RosterWallOperatingPolicyId =
  (typeof ROSTER_WALL_OPERATING_POLICY_IDS)[number]
export type RosterWallEstatePolicyId = (typeof ROSTER_WALL_ESTATE_POLICY_IDS)[number]
export type RosterWallFoundingTermPolicyId =
  (typeof ROSTER_WALL_FOUNDING_TERM_POLICY_IDS)[number]

type PolicyDefinition = {
  id: RosterWallOperatingPolicyId
  targetActiveProductions: 1 | 2
  targetPipeline: number
  auditions: boolean
  rewriteBelow: number | null
  desiredRoster: Record<CreativeRole, number>
}

// Mechanical identity with src/harness/facilities/index.ts POLICY.
export const ROSTER_WALL_OPERATING_POLICIES: Readonly<
  Record<RosterWallOperatingPolicyId, PolicyDefinition>
> = {
  'direct-package': {
    id: 'direct-package',
    targetActiveProductions: 1,
    targetPipeline: 2,
    auditions: false,
    rewriteBelow: null,
    desiredRoster: { actor: 3, director: 1, writer: 2, craft: 1 },
  },
  'development-casting': {
    id: 'development-casting',
    targetActiveProductions: 1,
    targetPipeline: 3,
    auditions: true,
    rewriteBelow: 55,
    desiredRoster: { actor: 3, director: 1, writer: 3, craft: 1 },
  },
  'scaled-two-team': {
    id: 'scaled-two-team',
    targetActiveProductions: 2,
    targetPipeline: 4,
    auditions: true,
    rewriteBelow: 60,
    desiredRoster: { actor: 6, director: 2, writer: 3, craft: 2 },
  },
}

export type RosterWallPolicyIntentKind =
  | 'script-commission'
  | 'script-rewrite'
  | 'script-accept'
  | 'casting-session'
  | 'casting-acknowledgement'
  | 'production-greenlight'
  | 'production-operation'

export type RosterWallPolicyIntentProjection = {
  week: number
  intentKind: RosterWallPolicyIntentKind
  ownerId: string
  action: Action | null
  accepted: boolean
  reason: string | null
  capacityBound: boolean
  capability: FacilityCapability | null
}

export type RosterWallWeeklyParityProjection = {
  week: number
  sampleKind: 'interval-start' | 'horizon-arrival'
  stateHash: string
  rngState: string
  cash: number
}

export type RosterWallCampaignParityProjection = {
  seed: string
  operatingPolicyId: RosterWallOperatingPolicyId
  estatePolicyId: RosterWallEstatePolicyId
  horizonWeeks: typeof ROSTER_WALL_ENTRY_WEEK
  initialSaveHash: string
  initialStateHash: string
  finalStateHash: string
  finalRngState: string
  finalWeek: typeof ROSTER_WALL_ENTRY_WEEK
  weekly: RosterWallWeeklyParityProjection[]
  intents: RosterWallPolicyIntentProjection[]
}

export type RosterWallShadowOwnerQuote = {
  talentId: string
  role: CreativeRole
  contractStartWeek: number
  contractEndWeekExclusive: number
  renewalWindowOpen: boolean
  quote: ContractOffer
  affordableNow: boolean
  earliestLaterLegalFeasibleWeek: number | null
}

export type RosterWallMinimumCoverageObligation = {
  talentIds: string[]
  signingBonus: number
  missingRoles: CreativeRole[]
  affordableNow: boolean
}

export type RosterWallTimingShadow = {
  week: (typeof ROSTER_WALL_TIMING_SHADOW_WEEKS)[number]
  warningRelation: 'warning-52' | 'warning-26' | 'window-arrival'
  expiryWeek: 208
  weeksToExpiry: number
  actionLegal: boolean
  owners: RosterWallShadowOwnerQuote[]
  aggregateAllRenewalSigningBonus: number
  allRenewalsAffordableNow: boolean
  minimumRoleCoverage: RosterWallMinimumCoverageObligation
  cash: number
  weeklyPayroll: number
  weeklyOverhead: number
  weeklyBurn: number
  expectedWeeklyRunRevenue: number
  runwayWeeks: number | null
  runwayInfinite: boolean
  activeCommitments: {
    activeProductions: number
    activeTheatricalRuns: number
    screenplayProjects: number
    castingSessions: number
    constructionMode: GameState['construction']['mode']
  }
  noActionStateHashBefore: string
  noActionStateHashAfter: string
  rngBefore: string
  rngAfter: string
  observationConsumedRng: false
}

export type RosterWallBoundaryCashReconciliation = {
  authority: 'initial-cash-full-ledger' | 'save-v11-checkpoint-suffix'
  initialCash: number
  checkpointCash: number | null
  checkpointLedgerLength: number | null
  ledgerLength: number
  fullLedgerTotal: number
  suffixLedgerTotal: number
  expectedCash: number
  actualCash: number
  delta: number
}

export type RosterWallBoundaryStateProjection = {
  week: number
  stateHash: string
  rngState: string
  cash: number
  cashReconciliation: RosterWallBoundaryCashReconciliation
  activeContractTalentIds: string[]
  cohortRetainedTalentIds: string[]
  cohortReleasedTalentIds: string[]
  cohortRoleCoverage: Record<CreativeRole, number>
  missingFoundingRoles: CreativeRole[]
  weeklyPayroll: number
  baseOverhead: number
  employeeOverhead: number
  totalOverhead: number
  activeTheatricalReceipts: number
  activeProductions: number
  screenplayProjects: number
  castingSessions: number
  readyScreenplays: number
  packageReadyScreenplays: number
}

export type RosterWallPreEntryBoundaryProjection = {
  relation: 'window-eve'
  before: RosterWallBoundaryStateProjection & { week: 195 }
  after: RosterWallBoundaryStateProjection & { week: typeof ROSTER_WALL_ENTRY_WEEK }
  operatingIntents: RosterWallPolicyIntentProjection[]
  transitionLedgerRows: LedgerEntry[]
}

export type RosterWallEntryCohortMember = {
  talentId: string
  role: CreativeRole
  startWeek: number
  endWeekExclusive: number
  termWeeks: number
  annualSalary: number
  weeklySalary: number
  signingBonus: number
  renewalQuote208: ContractOffer
}

export type RunRosterWallEntryCampaignInput = {
  seed: string
  operatingPolicyId: RosterWallOperatingPolicyId
  estatePolicyId: RosterWallEstatePolicyId
}

export type RosterWallEntryHarvest = {
  seed: string
  operatingPolicyId: RosterWallOperatingPolicyId
  estatePolicyId: RosterWallEstatePolicyId
  entryWeek: typeof ROSTER_WALL_ENTRY_WEEK
  foundingTermWeeks: typeof ROSTER_WALL_FOUNDING_TERM_WEEKS
  initialSaveHash: string
  initialStateHash: string
  entrySave: SaveFileV12
  entrySaveBytes: string
  entrySaveHash: string
  entryStateHash: string
  entryRngState: string
  replay: {
    importedSaveVersion: 12
    importedReexportByteIdentical: true
    remadeReexportByteIdentical: true
  }
  cohort: RosterWallEntryCohortMember[]
  shadows: RosterWallTimingShadow[]
  preEntryWindowEve: RosterWallPreEntryBoundaryProjection
  parity: RosterWallCampaignParityProjection
}

export type RosterWallEntryObserverNeutrality = {
  byteIdentical: true
  stateHashIdentical: true
  rngStateIdentical: true
  observedEntrySaveHash: string
  observerDisabledEntrySaveHash: string
  observedEntryStateHash: string
  observerDisabledEntryStateHash: string
  observedRngState: string
  observerDisabledRngState: string
}

export type RosterWallNeutralEntryHarvest = {
  harvest: RosterWallEntryHarvest
  observerNeutrality: RosterWallEntryObserverNeutrality
}

type CampaignRuntime = {
  state: GameState
  seed: string
  policy: PolicyDefinition
  estatePolicyId: RosterWallEstatePolicyId
  captureObserver: boolean
  intents: RosterWallPolicyIntentProjection[]
  weekly: RosterWallWeeklyParityProjection[]
  shadows: RosterWallTimingShadow[]
  preEntryWindowEve: RosterWallPreEntryBoundaryProjection | null
}

type CampaignExecution = {
  runtime: CampaignRuntime
  initialSaveHash: string
  initialStateHash: string
}

type AttemptResult = {
  accepted: boolean
  capability: FacilityCapability | null
}

type PackageCastResult =
  | { ok: true; cast: Record<CastSlot, Talent> }
  | { ok: false; reason: string }

type PackageBuildResult =
  | { ok: true; production: GreenlightScriptProjectPayload }
  | { ok: false; reason: string }

type FacilitiesParityReference = {
  initialSaveHash: string
  initialStateHash: string
  rows: readonly RosterWallWeeklyParityProjection[]
  intents: readonly {
    week: number
    intentKind: string
    ownerId: string
    action: Action | null
    accepted: boolean
    reason: string | null
  }[]
  summary: {
    finalStateHash: string
    finalRngState: string
    finalWeek: number
  }
}

export type RosterWallFacilitiesParityComparison = {
  byteIdentical: boolean
  rosterWallProjectionHash: string
  facilitiesProjectionHash: string
  rosterWallProjection: Omit<
    RosterWallCampaignParityProjection,
    'seed' | 'operatingPolicyId' | 'estatePolicyId' | 'horizonWeeks'
  >
  facilitiesProjection: Omit<
    RosterWallCampaignParityProjection,
    'seed' | 'operatingPolicyId' | 'estatePolicyId' | 'horizonWeeks'
  >
}

const ROLES = ['actor', 'director', 'writer', 'craft'] as const

function compareId(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function stateHash(state: GameState): string {
  return sha256(stableStringify(state))
}

function assertInput(input: RunRosterWallEntryCampaignInput): void {
  if (!(ROSTER_WALL_OPERATING_POLICY_IDS as readonly string[]).includes(input.operatingPolicyId)) {
    throw new Error(
      `roster-wall observatory: unknown operatingPolicyId "${String(input.operatingPolicyId)}"`,
    )
  }
  if (!(ROSTER_WALL_ESTATE_POLICY_IDS as readonly string[]).includes(input.estatePolicyId)) {
    throw new Error(
      `roster-wall observatory: unknown estatePolicyId "${String(input.estatePolicyId)}"`,
    )
  }
}

function applicantsByRole(state: GameState, role: CreativeRole): Talent[] {
  if (state.founding === null) {
    throw new Error('roster-wall observatory: founding draft is absent')
  }
  const applicantIds = new Set(state.founding.applicantIds)
  return state.talent
    .filter((person) => person.role === role && applicantIds.has(person.id))
    .sort((a, b) => {
      const aOffer = contractOffer(state, a.id, ROSTER_WALL_FOUNDING_TERM_WEEKS)
      const bOffer = contractOffer(state, b.id, ROSTER_WALL_FOUNDING_TERM_WEEKS)
      return aOffer.signingBonus - bOffer.signingBonus || compareId(a.id, b.id)
    })
}

function foundManagedStudio(seed: string, policy: PolicyDefinition): GameState {
  let state = beginFounding(generateWorld(seed))
  const hired = new Set<string>()
  const sign = (person: Talent): boolean => {
    if (state.founding === null) return false
    const offer = contractOffer(state, person.id, ROSTER_WALL_FOUNDING_TERM_WEEKS)
    const remaining = state.founding.budget - state.founding.spentBonus
    if (offer.signingBonus > remaining) return false
    state = applyActions(state, [
      {
        kind: 'signContract',
        talentId: person.id,
        termWeeks: ROSTER_WALL_FOUNDING_TERM_WEEKS,
      },
    ])
    hired.add(person.id)
    return true
  }

  for (const role of ROLES) {
    const candidates = applicantsByRole(state, role)
    for (const person of candidates.slice(0, FOUNDING_MINIMUMS[role])) {
      if (!sign(person)) {
        throw new Error(
          `roster-wall observatory: recruitment fund cannot satisfy ${role} minimum`,
        )
      }
    }
  }

  for (const role of ['writer', 'actor', 'director', 'craft'] as const) {
    const desired = policy.desiredRoster[role]
    const candidates = applicantsByRole(state, role).filter((person) => !hired.has(person.id))
    let current = [...hired].filter(
      (id) => state.talent.find((person) => person.id === id)?.role === role,
    ).length
    for (const person of candidates) {
      if (current >= desired) break
      if (sign(person)) current++
    }
  }

  state = applyActions(state, [{ kind: 'foundStudio' }])
  return applyActions(state, [
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
    { kind: 'activateCastingSessions' },
  ])
}

function activateManagedSystems(state: GameState): GameState {
  return applyActions(state, [
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
    { kind: 'activateCastingSessions' },
  ])
}

/**
 * Found the reviewed operating-policy roster under either the canonical all-208
 * authority or the contract's separate descriptive mixed-term player policy.
 * Mixed terms retain the exact reviewed hire identities, sort those identities by
 * canonical talent ID, then assign 52/104/156/208 round-robin through public
 * founding actions. The shorter terms cannot increase recruitment-fund cost.
 */
export function foundRosterWallStudio(
  seed: string,
  operatingPolicyId: RosterWallOperatingPolicyId,
  foundingTermPolicyId: RosterWallFoundingTermPolicyId = 'all-208',
): GameState {
  if (
    !(ROSTER_WALL_OPERATING_POLICY_IDS as readonly string[]).includes(operatingPolicyId)
  ) {
    throw new Error(
      `roster-wall observatory: unknown operatingPolicyId "${String(operatingPolicyId)}"`,
    )
  }
  if (
    !(ROSTER_WALL_FOUNDING_TERM_POLICY_IDS as readonly string[]).includes(
      foundingTermPolicyId,
    )
  ) {
    throw new Error(
      `roster-wall observatory: unknown foundingTermPolicyId "${String(foundingTermPolicyId)}"`,
    )
  }
  const policy = ROSTER_WALL_OPERATING_POLICIES[operatingPolicyId]
  const all208 = foundManagedStudio(seed, policy)
  if (foundingTermPolicyId === 'all-208') return all208

  const talentIds = all208.contracts.map((contract) => contract.talentId).sort(compareId)
  const terms = [52, 104, 156, 208] as const
  let mixed = beginFounding(generateWorld(seed))
  for (let index = 0; index < talentIds.length; index++) {
    mixed = applyActions(mixed, [
      {
        kind: 'signContract',
        talentId: talentIds[index]!,
        termWeeks: terms[index % terms.length]!,
      },
    ])
  }
  mixed = applyActions(mixed, [{ kind: 'foundStudio' }])
  return activateManagedSystems(mixed)
}

function initializeCampaign(
  input: RunRosterWallEntryCampaignInput,
  captureObserver: boolean,
): CampaignExecution {
  assertInput(input)
  const policy = ROSTER_WALL_OPERATING_POLICIES[input.operatingPolicyId]
  let state = foundRosterWallStudio(input.seed, input.operatingPolicyId)
  if (input.estatePolicyId === 'annex-start-week-0') {
    state = applyActions(state, [{ kind: 'startDevelopmentCastingAnnex' }])
  }
  const initialStateHash = stateHash(state)
  const initialSaveHash = sha256(exportSave(makeSaveV12(structuredClone(state))))
  return {
    runtime: {
      state,
      seed: input.seed,
      policy,
      estatePolicyId: input.estatePolicyId,
      captureObserver,
      intents: [],
      weekly: [],
      shadows: [],
      preEntryWindowEve: null,
    },
    initialSaveHash,
    initialStateHash,
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function capacityFromReason(reason: string): FacilityCapability | null {
  if (/Development & Casting slot|development-casting capacity/i.test(reason)) {
    return 'development-casting'
  }
  if (/soundstage capacity/i.test(reason)) return 'soundstage'
  if (/set-scenery capacity|scenery capacity/i.test(reason)) return 'set-scenery'
  if (/post capacity/i.test(reason)) return 'post'
  return null
}

function attemptAction(
  runtime: CampaignRuntime,
  intentKind: RosterWallPolicyIntentKind,
  ownerId: string,
  action: Action,
): AttemptResult {
  const before = runtime.state
  let accepted = false
  let reason: string | null = null
  let capability: FacilityCapability | null = null
  try {
    runtime.state = applyActions(before, [action])
    accepted = true
  } catch (error) {
    reason = errorMessage(error)
    capability = capacityFromReason(reason)
  }
  if (runtime.captureObserver) {
    runtime.intents.push({
      week: runtime.state.market.tick,
      intentKind,
      ownerId,
      action: structuredClone(action),
      accepted,
      reason,
      capacityBound: capability !== null,
      capability,
    })
  }
  return { accepted, capability }
}

function recordUnavailableIntent(
  runtime: CampaignRuntime,
  intentKind: RosterWallPolicyIntentKind,
  ownerId: string,
  reason: string,
): void {
  if (!runtime.captureObserver) return
  runtime.intents.push({
    week: runtime.state.market.tick,
    intentKind,
    ownerId,
    action: null,
    accepted: false,
    reason,
    capacityBound: false,
    capability: null,
  })
}

function projectById(state: GameState, projectId: string): ScriptProject {
  const project = state.scriptDevelopment.projects.find((candidate) => candidate.id === projectId)
  if (project === undefined) {
    throw new Error(`roster-wall observatory: unknown screenplay project "${projectId}"`)
  }
  return project
}

function resolveDecisions(runtime: CampaignRuntime): void {
  for (let guard = 0; guard < 100; guard++) {
    const decision = nextStudioDecision(runtime.state)
    if (decision === null) return
    if (decision.kind === 'scriptReview') {
      const project = projectById(runtime.state, decision.projectId)
      const rewrite =
        runtime.policy.rewriteBelow !== null &&
        project.rewriteCount === 0 &&
        project.assessment !== null &&
        project.assessment.perceivedStrength < runtime.policy.rewriteBelow
      const action: Action = rewrite
        ? { kind: 'requestScriptRewrite', projectId: project.id }
        : { kind: 'acceptScript', projectId: project.id }
      const result = attemptAction(
        runtime,
        rewrite ? 'script-rewrite' : 'script-accept',
        project.id,
        action,
      )
      if (!result.accepted) return
      continue
    }
    if (decision.kind === 'castingReview') {
      const result = attemptAction(
        runtime,
        'casting-acknowledgement',
        decision.sessionId,
        { kind: 'acknowledgeCastingSession', sessionId: decision.sessionId },
      )
      if (!result.accepted) return
      continue
    }
    const result = attemptAction(
      runtime,
      'production-operation',
      decision.productionId,
      decision.command,
    )
    if (!result.accepted) return
  }
  throw new Error('roster-wall observatory: decision-resolution guard exhausted')
}

function availableRoleTalent(
  state: GameState,
  role: CreativeRole,
  excluded: ReadonlySet<string>,
): Talent[] {
  const busy = busyTalentIds(state)
  const market = new Set(freelancerMarketIds(state))
  return state.talent
    .filter(
      (person) =>
        person.role === role &&
        !excluded.has(person.id) &&
        !busy.has(person.id) &&
        (isContracted(state, person.id) || market.has(person.id)),
    )
    .sort((a, b) => {
      const aContracted = isContracted(state, a.id)
      const bContracted = isContracted(state, b.id)
      if (aContracted !== bContracted) return aContracted ? -1 : 1
      const feeDelta =
        (aContracted ? 0 : freelancerFee(a)) - (bContracted ? 0 : freelancerFee(b))
      return feeDelta || compareId(a.id, b.id)
    })
}

function castingSlate(state: GameState, project: ScriptProject): CastingSlate | null {
  const actors = availableRoleTalent(state, 'actor', new Set([project.writerId]))
  if (actors.length < 3) return null
  return {
    lead: [actors[0]!.id, actors[1]!.id],
    antagonist: [actors[0]!.id, actors[2]!.id],
    support: [actors[1]!.id, actors[2]!.id],
  }
}

function packageCast(
  state: GameState,
  project: ScriptProject,
  actors: readonly Talent[],
): PackageCastResult {
  const session: CastingSession | undefined = state.castingSessions.sessions.find(
    (candidate) => candidate.projectId === project.id,
  )
  if (session?.status !== 'complete') {
    if (actors.length < 3) {
      return {
        ok: false,
        reason: `Package for ${project.id} needs three currently assignable primary Actors; ${String(actors.length)} are available`,
      }
    }
    return {
      ok: true,
      cast: { lead: actors[0]!, antagonist: actors[1]!, support: actors[2]! },
    }
  }
  if (session.results === null) {
    throw new Error(
      `roster-wall observatory: complete casting session "${session.id}" has no results`,
    )
  }
  const available = new Map(actors.map((actor) => [actor.id, actor]))
  const candidates: {
    cast: Record<CastSlot, Talent>
    estimate: number
    fee: number
    key: string
  }[] = []
  for (const lead of session.results.lead) {
    for (const antagonist of session.results.antagonist) {
      for (const support of session.results.support) {
        if (new Set([lead.talentId, antagonist.talentId, support.talentId]).size !== 3) continue
        const leadTalent = available.get(lead.talentId)
        const antagonistTalent = available.get(antagonist.talentId)
        const supportTalent = available.get(support.talentId)
        if (
          leadTalent === undefined ||
          antagonistTalent === undefined ||
          supportTalent === undefined
        ) {
          continue
        }
        const cast = {
          lead: leadTalent,
          antagonist: antagonistTalent,
          support: supportTalent,
        }
        const fee = Object.values(cast).reduce(
          (total, actor) =>
            total + (isContracted(state, actor.id) ? 0 : freelancerFee(actor)),
          0,
        )
        candidates.push({
          cast,
          estimate: lead.estimate + antagonist.estimate + support.estimate,
          fee,
          key: `${lead.talentId}|${antagonist.talentId}|${support.talentId}`,
        })
      }
    }
  }
  candidates.sort(
    (a, b) => b.estimate - a.estimate || a.fee - b.fee || compareId(a.key, b.key),
  )
  const selected = candidates[0]
  if (selected === undefined) {
    return {
      ok: false,
      reason: `Camera-test evidence for ${project.id} has no currently assignable three-Actor slate combination`,
    }
  }
  return { ok: true, cast: selected.cast }
}

function packageForReadyProject(
  state: GameState,
  project: ScriptProject,
): PackageBuildResult {
  if (project.status !== 'ready' || project.assessment === null) {
    return { ok: false, reason: `Screenplay ${project.id} is not an assessed Ready project` }
  }
  const excluded = new Set([project.writerId])
  const directors = availableRoleTalent(state, 'director', excluded)
  const craft = availableRoleTalent(state, 'craft', excluded)
  const actors = availableRoleTalent(state, 'actor', excluded)
  if (directors.length < 1) {
    return { ok: false, reason: `Package for ${project.id} has no assignable primary Director` }
  }
  if (craft.length < 1) {
    return { ok: false, reason: `Package for ${project.id} has no assignable primary Craft lead` }
  }
  const castResult = packageCast(state, project, actors)
  if (!castResult.ok) return castResult
  const concept = state.concepts.find((candidate) => candidate.id === project.conceptId)
  const writer = state.talent.find((person) => person.id === project.writerId)
  if (concept === undefined || writer === undefined) {
    throw new Error(`roster-wall observatory: ${project.id} lost its concept or writer authority`)
  }
  const castTalent = castResult.cast
  const multiplier = NEGATIVE_BUDGET_MULTIPLIERS[0]!
  const negative =
    multiplier *
    concept.baseNegativeCost *
    resolveShape(project.shape).budgetDemandMultiplier *
    state.era.costScale
  const inputs: ReceptionInputs = {
    concept,
    shape: project.shape,
    shapeEffects: resolveShape(project.shape),
    promise: project.promise,
    budget: { negative, marketing: 0 },
    writer,
    director: directors[0]!,
    cast: castTalent,
    craftHires: [craft[0]!],
    market: state.market,
    standing: state.studio.standing,
    era: state.era,
    scriptStrengthOverride: {
      perceived: readyScriptPerceivedStrength(state.scriptDevelopment, project.id),
    },
  }
  const marketing = marketingLevelsFor(state, inputs)[0]
  return {
    ok: true,
    production: {
      projectId: project.id,
      directorId: directors[0]!.id,
      craftIds: [craft[0]!.id],
      cast: {
        lead: castTalent.lead.id,
        antagonist: castTalent.antagonist.id,
        support: castTalent.support.id,
      },
      budget: { negative, marketing },
    },
  }
}

function readyProjects(state: GameState): ScriptProject[] {
  return state.scriptDevelopment.projects
    .filter((project) => project.status === 'ready')
    .sort((a, b) => compareId(a.id, b.id))
}

/** Read-only package-readiness projection under the selected frozen film policy. */
export function rosterWallPackageReadiness(
  state: GameState,
  operatingPolicyId: RosterWallOperatingPolicyId,
): { readyScreenplays: number; packageReadyScreenplays: number } {
  const policy = ROSTER_WALL_OPERATING_POLICIES[operatingPolicyId]
  if (policy === undefined) {
    throw new Error(
      `roster-wall observatory: unknown operatingPolicyId "${String(operatingPolicyId)}"`,
    )
  }
  const ready = readyProjects(state)
  const packageReadyScreenplays = ready.filter((project) => {
    if (!isContracted(state, project.writerId)) return false
    const session = sessionForProject(state, project.id)
    if (policy.auditions && session?.status !== 'complete') return false
    return packageForReadyProject(state, project).ok
  }).length
  return { readyScreenplays: ready.length, packageReadyScreenplays }
}

function boundaryCashReconciliation(state: GameState): RosterWallBoundaryCashReconciliation {
  const checkpoint = state.cashLedgerCheckpoint
  const checkpointLedgerLength = checkpoint?.ledgerLength ?? 0
  if (
    !Number.isInteger(checkpointLedgerLength) ||
    checkpointLedgerLength < 0 ||
    checkpointLedgerLength > state.ledger.length
  ) {
    throw new Error('roster-wall observatory: invalid pre-entry cash-ledger checkpoint length')
  }
  let fullLedgerTotal = 0
  for (const row of state.ledger) fullLedgerTotal += row.amount
  let suffixLedgerTotal = 0
  let expectedCash = checkpoint?.cash ?? TUNING.INITIAL_CASH
  for (let index = checkpointLedgerLength; index < state.ledger.length; index++) {
    const amount = state.ledger[index]!.amount
    suffixLedgerTotal += amount
    // Preserve the authoritative cash fold's floating-point association. Adding a
    // regrouped suffix subtotal to the opening balance can manufacture a residual.
    expectedCash += amount
  }
  const delta = state.studio.cash - expectedCash
  if (delta !== 0) {
    throw new Error(
      `roster-wall observatory: pre-entry boundary cash failed reconciliation by ${String(delta)}`,
    )
  }
  return {
    authority:
      checkpoint === undefined
        ? 'initial-cash-full-ledger'
        : 'save-v11-checkpoint-suffix',
    initialCash: TUNING.INITIAL_CASH,
    checkpointCash: checkpoint?.cash ?? null,
    checkpointLedgerLength: checkpoint?.ledgerLength ?? null,
    ledgerLength: state.ledger.length,
    fullLedgerTotal,
    suffixLedgerTotal,
    expectedCash,
    actualCash: state.studio.cash,
    delta,
  }
}

function boundaryStateProjection(
  state: GameState,
  operatingPolicyId: RosterWallOperatingPolicyId,
): RosterWallBoundaryStateProjection {
  const hashBefore = stateHash(state)
  const rngBefore = state.rngState
  const activeContractTalentIds = state.contracts
    .filter(
      (contract) =>
        contract.startWeek <= state.market.tick && state.market.tick < contract.endWeekExclusive,
    )
    .map((contract) => contract.talentId)
    .sort(compareId)
  const active = new Set(activeContractTalentIds)
  const cohortIds = state.contracts
    .filter(
      (contract) =>
        contract.startWeek === 0 &&
        contract.endWeekExclusive === ROSTER_WALL_FOUNDING_TERM_WEEKS,
    )
    .map((contract) => contract.talentId)
    .sort(compareId)
  const retained = cohortIds.filter((talentId) => active.has(talentId))
  const released = cohortIds.filter((talentId) => !active.has(talentId))
  const coverage: Record<CreativeRole, number> = {
    actor: 0,
    director: 0,
    writer: 0,
    craft: 0,
  }
  const retainedSet = new Set(retained)
  for (const talent of state.talent) {
    if (retainedSet.has(talent.id)) coverage[talent.role]++
  }
  const totalOverhead = weeklyOverhead(state)
  const packageReadiness = rosterWallPackageReadiness(state, operatingPolicyId)
  const projection: RosterWallBoundaryStateProjection = {
    week: state.market.tick,
    stateHash: hashBefore,
    rngState: rngBefore,
    cash: state.studio.cash,
    cashReconciliation: boundaryCashReconciliation(state),
    activeContractTalentIds,
    cohortRetainedTalentIds: retained,
    cohortReleasedTalentIds: released,
    cohortRoleCoverage: coverage,
    missingFoundingRoles: ROLES.filter(
      (role) => coverage[role] < FOUNDING_MINIMUMS[role],
    ),
    weeklyPayroll: weeklyPayroll(state),
    baseOverhead: totalOverhead === 0 ? 0 : TUNING.OVERHEAD_BASE,
    employeeOverhead:
      totalOverhead === 0
        ? 0
        : TUNING.OVERHEAD_PER_EMPLOYEE * state.contracts.length,
    totalOverhead,
    activeTheatricalReceipts: state.theatricalRuns.filter((run) => run.status === 'active').length,
    activeProductions: state.studio.activeProductions.length,
    screenplayProjects: state.scriptDevelopment.projects.length,
    castingSessions: state.castingSessions.sessions.length,
    ...packageReadiness,
  }
  if (stateHash(state) !== hashBefore || state.rngState !== rngBefore) {
    throw new Error('roster-wall observatory: pre-entry boundary observation mutated state')
  }
  return projection
}

function sessionForProject(state: GameState, projectId: string): CastingSession | undefined {
  return state.castingSessions.sessions.find((session) => session.projectId === projectId)
}

function attemptGreenlights(runtime: CampaignRuntime): void {
  for (const project of readyProjects(runtime.state)) {
    if (runtime.state.studio.activeProductions.length >= runtime.policy.targetActiveProductions) {
      return
    }
    const session = sessionForProject(runtime.state, project.id)
    if (runtime.policy.auditions && session?.status !== 'complete') continue
    const packageResult = packageForReadyProject(runtime.state, project)
    if (!packageResult.ok) {
      recordUnavailableIntent(runtime, 'production-greenlight', project.id, packageResult.reason)
      continue
    }
    const result = attemptAction(runtime, 'production-greenlight', project.id, {
      kind: 'greenlightScriptProject',
      production: packageResult.production,
    })
    if (!result.accepted) return
  }
}

function attemptCasting(runtime: CampaignRuntime): void {
  if (!runtime.policy.auditions) return
  for (const project of readyProjects(runtime.state)) {
    if (sessionForProject(runtime.state, project.id) !== undefined) continue
    const slate = castingSlate(runtime.state, project)
    if (slate === null) {
      recordUnavailableIntent(
        runtime,
        'casting-session',
        project.id,
        `Camera tests for ${project.id} need three currently assignable primary Actors`,
      )
      continue
    }
    const result = attemptAction(runtime, 'casting-session', project.id, {
      kind: 'startCastingSession',
      session: { projectId: project.id, slate },
    })
    if (!result.accepted && result.capability !== null) return
  }
}

function unusedConcepts(state: GameState): GameState['concepts'] {
  const used = new Set(state.scriptDevelopment.projects.map((project) => project.conceptId))
  return state.concepts
    .filter((concept) => !used.has(concept.id))
    .sort(
      (a, b) => a.baseNegativeCost - b.baseNegativeCost || compareId(a.id, b.id),
    )
}

function commissionPayload(
  state: GameState,
  writerId: string,
): CommissionScriptPayload | null {
  const concept = unusedConcepts(state)[0]
  if (concept === undefined) return null
  return {
    conceptId: concept.id,
    writerId,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult', 'prestige'],
      ranges: {
        intimacy: [-0.4, 0.6],
        tonalWeight: [0, 0.8],
        kineticEnergy: [-0.7, 0.2],
      },
    },
  }
}

function attemptCommissions(runtime: CampaignRuntime): void {
  const outstanding = (): number =>
    runtime.state.scriptDevelopment.projects.filter(
      (project) => project.status !== 'inProduction' && project.status !== 'produced',
    ).length
  while (outstanding() < runtime.policy.targetPipeline) {
    const busy = busyTalentIds(runtime.state)
    const writers = runtime.state.talent
      .filter(
        (person) =>
          person.role === 'writer' &&
          isContracted(runtime.state, person.id) &&
          !busy.has(person.id),
      )
      .sort((a, b) => compareId(a.id, b.id))
    const writer = writers[0]
    if (writer === undefined) {
      recordUnavailableIntent(
        runtime,
        'script-commission',
        'pipeline',
        'Desired screenplay commission has no currently contracted, unassigned primary Writer',
      )
      return
    }
    const project = commissionPayload(runtime.state, writer.id)
    if (project === null) {
      recordUnavailableIntent(
        runtime,
        'script-commission',
        'pipeline',
        'Desired screenplay commission has no unused Film Concept remaining',
      )
      return
    }
    const result = attemptAction(runtime, 'script-commission', project.conceptId, {
      kind: 'commissionScript',
      project,
    })
    if (!result.accepted) return
  }
}

function driveWeek(runtime: CampaignRuntime): void {
  resolveDecisions(runtime)
  // Deliberately no renewal action through the Week-196 entry boundary.
  attemptGreenlights(runtime)
  attemptCasting(runtime)
  // Fresh camera tests consume their full week; only a start-of-week completed
  // decision can open a same-week package. This preserves facilities ordering.
  attemptCommissions(runtime)
}

function warningRelation(
  week: (typeof ROSTER_WALL_TIMING_SHADOW_WEEKS)[number],
): RosterWallTimingShadow['warningRelation'] {
  if (week === 156) return 'warning-52'
  if (week === 182) return 'warning-26'
  return 'window-arrival'
}

function missingCoverageRoles(
  members: readonly RosterWallShadowOwnerQuote[],
): CreativeRole[] {
  const counts: Record<CreativeRole, number> = { actor: 0, director: 0, writer: 0, craft: 0 }
  for (const member of members) counts[member.role]++
  return ROLES.filter((role) => counts[role] < FOUNDING_MINIMUMS[role])
}

function minimumCoverageObligation(
  owners: readonly RosterWallShadowOwnerQuote[],
): RosterWallMinimumCoverageObligation {
  let best: RosterWallShadowOwnerQuote[] | null = null
  let bestCost = Number.POSITIVE_INFINITY
  let bestKey = ''
  const combinations = 2 ** owners.length
  for (let mask = 0; mask < combinations; mask++) {
    const selected = owners.filter((_owner, index) => (mask & 2 ** index) !== 0)
    if (missingCoverageRoles(selected).length !== 0) continue
    const cost = selected.reduce((sum, owner) => sum + owner.quote.signingBonus, 0)
    const ids = selected.map((owner) => owner.talentId).sort(compareId)
    const key = ids.join('|')
    if (cost < bestCost || (cost === bestCost && (best === null || compareId(key, bestKey) < 0))) {
      best = selected
      bestCost = cost
      bestKey = key
    }
  }
  if (best === null) {
    return {
      talentIds: [],
      signingBonus: 0,
      missingRoles: missingCoverageRoles(owners),
      affordableNow: false,
    }
  }
  return {
    talentIds: best.map((owner) => owner.talentId).sort(compareId),
    signingBonus: bestCost,
    missingRoles: [],
    // Filled against the exact shadow cash at capture time below.
    affordableNow: false,
  }
}

function captureTimingShadow(
  runtime: CampaignRuntime,
  week: (typeof ROSTER_WALL_TIMING_SHADOW_WEEKS)[number],
): void {
  if (!runtime.captureObserver) return
  if (runtime.state.market.tick !== week) {
    throw new Error('roster-wall observatory: timing shadow clock diverged')
  }
  const beforeHash = stateHash(runtime.state)
  const rngBefore = runtime.state.rngState
  const owners = runtime.state.contracts
    .filter(
      (contract) =>
        contract.startWeek === 0 &&
        contract.endWeekExclusive === ROSTER_WALL_FOUNDING_TERM_WEEKS,
    )
    .map((contract): RosterWallShadowOwnerQuote => {
      const person = runtime.state.talent.find((candidate) => candidate.id === contract.talentId)
      if (person === undefined) {
        throw new Error(
          `roster-wall observatory: contract references unknown talent "${contract.talentId}"`,
        )
      }
      const quote = contractOffer(
        runtime.state,
        contract.talentId,
        ROSTER_WALL_FOUNDING_TERM_WEEKS,
      )
      return {
        talentId: contract.talentId,
        role: person.role,
        contractStartWeek: contract.startWeek,
        contractEndWeekExclusive: contract.endWeekExclusive,
        renewalWindowOpen: renewalWindowOpen(contract, week),
        quote,
        affordableNow: canAfford(runtime.state, quote.signingBonus).ok,
        earliestLaterLegalFeasibleWeek: null,
      }
    })
    .sort((a, b) => compareId(a.talentId, b.talentId))
  const aggregateAllRenewalSigningBonus = owners.reduce(
    (sum, owner) => sum + owner.quote.signingBonus,
    0,
  )
  const payroll = weeklyPayroll(runtime.state)
  const overhead = weeklyOverhead(runtime.state)
  const revenue = expectedWeeklyRunRevenue(runtime.state)
  const currentRunway = runway(runtime.state)
  const afterHash = stateHash(runtime.state)
  const rngAfter = runtime.state.rngState
  if (beforeHash !== afterHash || rngBefore !== rngAfter) {
    throw new Error('roster-wall observatory: read-only timing shadow mutated campaign state')
  }
  const minimumRoleCoverage = minimumCoverageObligation(owners)
  minimumRoleCoverage.affordableNow =
    minimumRoleCoverage.missingRoles.length === 0 &&
    canAfford(runtime.state, minimumRoleCoverage.signingBonus).ok
  runtime.shadows.push({
    week,
    warningRelation: warningRelation(week),
    expiryWeek: 208,
    weeksToExpiry: 208 - week,
    actionLegal: owners.length > 0 && owners.every((owner) => owner.renewalWindowOpen),
    owners,
    aggregateAllRenewalSigningBonus,
    allRenewalsAffordableNow: canAfford(runtime.state, aggregateAllRenewalSigningBonus).ok,
    minimumRoleCoverage,
    cash: runtime.state.studio.cash,
    weeklyPayroll: payroll,
    weeklyOverhead: overhead,
    weeklyBurn: payroll + overhead,
    expectedWeeklyRunRevenue: revenue,
    runwayWeeks: currentRunway.weeks,
    runwayInfinite: currentRunway.infinite,
    activeCommitments: {
      activeProductions: runtime.state.studio.activeProductions.length,
      activeTheatricalRuns: runtime.state.theatricalRuns.filter((run) => run.status === 'active')
        .length,
      screenplayProjects: runtime.state.scriptDevelopment.projects.length,
      castingSessions: runtime.state.castingSessions.sessions.length,
      constructionMode: runtime.state.construction.mode,
    },
    noActionStateHashBefore: beforeHash,
    noActionStateHashAfter: afterHash,
    rngBefore,
    rngAfter,
    observationConsumedRng: false,
  })
}

function earliestLaterLegalFeasibility(
  execution: CampaignExecution,
): ReadonlyMap<string, number | null> {
  const initialTalentIds = execution.runtime.state.contracts
    .filter(
      (contract) =>
        contract.startWeek === 0 &&
        contract.endWeekExclusive === ROSTER_WALL_FOUNDING_TERM_WEEKS,
    )
    .map((contract) => contract.talentId)
    .sort(compareId)
  const result = new Map<string, number | null>(
    initialTalentIds.map((talentId) => [talentId, null]),
  )
  const reference: CampaignRuntime = {
    state: structuredClone(execution.runtime.state),
    seed: execution.runtime.seed,
    policy: execution.runtime.policy,
    estatePolicyId: execution.runtime.estatePolicyId,
    captureObserver: false,
    intents: [],
    weekly: [],
    shadows: [],
    preEntryWindowEve: null,
  }
  while (reference.state.market.tick < ROSTER_WALL_FOUNDING_TERM_WEEKS) {
    for (const contract of reference.state.contracts) {
      if (!result.has(contract.talentId) || result.get(contract.talentId) !== null) continue
      if (!renewalWindowOpen(contract, reference.state.market.tick)) continue
      const quote = contractOffer(
        reference.state,
        contract.talentId,
        ROSTER_WALL_FOUNDING_TERM_WEEKS,
      )
      if (canAfford(reference.state, quote.signingBonus).ok) {
        result.set(contract.talentId, reference.state.market.tick)
      }
    }
    driveWeek(reference)
    reference.state = tick(reference.state)
  }
  return result
}

function shadowsWithLaterFeasibility(
  execution: CampaignExecution,
): RosterWallTimingShadow[] {
  const feasibility = earliestLaterLegalFeasibility(execution)
  return execution.runtime.shadows.map((shadow) => ({
    ...structuredClone(shadow),
    owners: shadow.owners.map((owner) => ({
      ...structuredClone(owner),
      earliestLaterLegalFeasibleWeek: feasibility.get(owner.talentId) ?? null,
    })),
  }))
}

function captureWeekly(
  runtime: CampaignRuntime,
  sampleKind: RosterWallWeeklyParityProjection['sampleKind'],
): void {
  if (!runtime.captureObserver) return
  runtime.weekly.push({
    week: runtime.state.market.tick,
    sampleKind,
    stateHash: stateHash(runtime.state),
    rngState: runtime.state.rngState,
    cash: runtime.state.studio.cash,
  })
}

function executeCampaign(runtime: CampaignRuntime): void {
  for (let week = 0; week < ROSTER_WALL_ENTRY_WEEK; week++) {
    if (runtime.state.market.tick !== week) {
      throw new Error('roster-wall observatory: weekly controller clock diverged from market.tick')
    }
    if (week === 156 || week === 182) captureTimingShadow(runtime, week)
    const captureWindowEve = week === 195 && runtime.captureObserver
    const windowEveBefore = captureWindowEve
      ? boundaryStateProjection(runtime.state, runtime.policy.id)
      : null
    const windowEveLedgerStart = captureWindowEve ? runtime.state.ledger.length : 0
    const windowEveIntentStart = captureWindowEve ? runtime.intents.length : 0
    driveWeek(runtime)
    captureWeekly(runtime, 'interval-start')
    runtime.state = tick(runtime.state)
    if (windowEveBefore !== null) {
      const windowEveAfter = boundaryStateProjection(runtime.state, runtime.policy.id)
      if (windowEveBefore.week !== 195 || windowEveAfter.week !== ROSTER_WALL_ENTRY_WEEK) {
        throw new Error('roster-wall observatory: pre-entry window-eve transition clock diverged')
      }
      runtime.preEntryWindowEve = {
        relation: 'window-eve',
        before: windowEveBefore as RosterWallPreEntryBoundaryProjection['before'],
        after: windowEveAfter as RosterWallPreEntryBoundaryProjection['after'],
        operatingIntents: runtime.intents
          .slice(windowEveIntentStart)
          .map((intent) => ({
            ...intent,
            action: intent.action === null ? null : structuredClone(intent.action),
          })),
        transitionLedgerRows: runtime.state.ledger
          .slice(windowEveLedgerStart)
          .map((row) => ({ ...row })),
      }
    }
  }
  if (runtime.state.market.tick !== ROSTER_WALL_ENTRY_WEEK) {
    throw new Error('roster-wall observatory: Week-196 arrival disagrees with market.tick')
  }
  captureTimingShadow(runtime, ROSTER_WALL_ENTRY_WEEK)
  captureWeekly(runtime, 'horizon-arrival')
}

function executeEntryCampaign(
  input: RunRosterWallEntryCampaignInput,
  captureObserver: boolean,
): CampaignExecution {
  const execution = initializeCampaign(input, captureObserver)
  executeCampaign(execution.runtime)
  return execution
}

function harvestSave(state: GameState): {
  entrySave: SaveFileV12
  entrySaveBytes: string
  entrySaveHash: string
  entryStateHash: string
} {
  const stateHashBefore = stateHash(state)
  const made = makeSaveV12(structuredClone(state))
  const entrySaveBytes = exportSave(made)
  const imported = importSave(entrySaveBytes)
  if (imported.saveVersion !== 12) {
    throw new Error('roster-wall observatory: Week-196 import did not return SaveFileV12')
  }
  const validated = validateSaveV12(imported)
  const importedReexport = exportSave(validated)
  if (importedReexport !== entrySaveBytes) {
    throw new Error('roster-wall observatory: imported SaveFileV12 re-export changed bytes')
  }
  const remade = makeSaveV12(structuredClone(validated.state))
  const remadeReexport = exportSave(remade)
  if (remadeReexport !== entrySaveBytes) {
    throw new Error('roster-wall observatory: re-made SaveFileV12 changed entry bytes')
  }
  const entryStateHash = stateHash(validated.state)
  if (entryStateHash !== stateHashBefore) {
    throw new Error('roster-wall observatory: SaveFileV12 replay changed entry state')
  }
  return {
    entrySave: validated,
    entrySaveBytes,
    entrySaveHash: sha256(entrySaveBytes),
    entryStateHash,
  }
}

function cohortAtEntry(state: GameState): RosterWallEntryCohortMember[] {
  return state.contracts
    .map((contract): RosterWallEntryCohortMember => {
      const person = state.talent.find((candidate) => candidate.id === contract.talentId)
      if (person === undefined) {
        throw new Error(
          `roster-wall observatory: contract references unknown talent "${contract.talentId}"`,
        )
      }
      return {
        talentId: contract.talentId,
        role: person.role,
        startWeek: contract.startWeek,
        endWeekExclusive: contract.endWeekExclusive,
        termWeeks: contract.termWeeks,
        annualSalary: contract.annualSalary,
        weeklySalary: weeklySalary(contract.annualSalary),
        signingBonus: contract.signingBonus,
        renewalQuote208: contractOffer(
          state,
          contract.talentId,
          ROSTER_WALL_FOUNDING_TERM_WEEKS,
        ),
      }
    })
    .sort((a, b) => compareId(a.talentId, b.talentId))
}

function parityProjection(
  input: RunRosterWallEntryCampaignInput,
  execution: CampaignExecution,
): RosterWallCampaignParityProjection {
  return {
    seed: input.seed,
    operatingPolicyId: input.operatingPolicyId,
    estatePolicyId: input.estatePolicyId,
    horizonWeeks: ROSTER_WALL_ENTRY_WEEK,
    initialSaveHash: execution.initialSaveHash,
    initialStateHash: execution.initialStateHash,
    finalStateHash: stateHash(execution.runtime.state),
    finalRngState: execution.runtime.state.rngState,
    finalWeek: ROSTER_WALL_ENTRY_WEEK,
    weekly: execution.runtime.weekly.map((row) => ({ ...row })),
    intents: execution.runtime.intents.map((intent) => ({
      ...intent,
      action: intent.action === null ? null : structuredClone(intent.action),
    })),
  }
}

/**
 * Build the canonical all-208 founding campaign, apply the optional real Annex
 * public action at Week 0, run the frozen film policy without renewals, and harvest
 * the exact validated/replayed Week-196 SaveFileV12 entry.
 */
export function runRosterWallEntryCampaign(
  input: RunRosterWallEntryCampaignInput,
): RosterWallEntryHarvest {
  const execution = executeEntryCampaign(input, true)
  const harvested = harvestSave(execution.runtime.state)
  if (execution.runtime.preEntryWindowEve === null) {
    throw new Error('roster-wall observatory: Week-195 window-eve boundary was not captured')
  }
  const cohort = cohortAtEntry(harvested.entrySave.state)
  if (
    cohort.some(
      (member) =>
        member.startWeek !== 0 ||
        member.endWeekExclusive !== 208 ||
        member.termWeeks !== ROSTER_WALL_FOUNDING_TERM_WEEKS,
    )
  ) {
    throw new Error('roster-wall observatory: Week-196 cohort is not canonical all-208 founding')
  }
  return {
    seed: input.seed,
    operatingPolicyId: input.operatingPolicyId,
    estatePolicyId: input.estatePolicyId,
    entryWeek: ROSTER_WALL_ENTRY_WEEK,
    foundingTermWeeks: ROSTER_WALL_FOUNDING_TERM_WEEKS,
    initialSaveHash: execution.initialSaveHash,
    initialStateHash: execution.initialStateHash,
    ...harvested,
    entryRngState: harvested.entrySave.state.rngState,
    replay: {
      importedSaveVersion: 12,
      importedReexportByteIdentical: true,
      remadeReexportByteIdentical: true,
    },
    cohort,
    shadows: shadowsWithLaterFeasibility(execution),
    preEntryWindowEve: structuredClone(execution.runtime.preEntryWindowEve),
    parity: parityProjection(input, execution),
  }
}

/**
 * Accepted-corpus seam: run the observed campaign once, run the same controller
 * without observation once, and reject the harvest unless their exact Week-196
 * state/save/RNG authority is identical.
 */
export function runRosterWallNeutralEntryCampaign(
  input: RunRosterWallEntryCampaignInput,
): RosterWallNeutralEntryHarvest {
  const harvest = runRosterWallEntryCampaign(input)
  const disabled = executeEntryCampaign(input, false)
  const disabledHarvest = harvestSave(disabled.runtime.state)
  const stateHashIdentical = disabledHarvest.entryStateHash === harvest.entryStateHash
  const byteIdentical = disabledHarvest.entrySaveBytes === harvest.entrySaveBytes
  const rngStateIdentical = disabled.runtime.state.rngState === harvest.entryRngState
  if (!byteIdentical || !stateHashIdentical || !rngStateIdentical) {
    throw new Error('roster-wall observatory: observer changed accepted entry campaign behavior')
  }
  return {
    harvest,
    observerNeutrality: {
      byteIdentical: true,
      stateHashIdentical: true,
      rngStateIdentical: true,
      observedEntrySaveHash: harvest.entrySaveHash,
      observerDisabledEntrySaveHash: disabledHarvest.entrySaveHash,
      observedEntryStateHash: harvest.entryStateHash,
      observerDisabledEntryStateHash: disabledHarvest.entryStateHash,
      observedRngState: harvest.entryRngState,
      observerDisabledRngState: disabled.runtime.state.rngState,
    },
  }
}

export type RunRosterWallOperatingWeekInput = {
  state: GameState
  operatingPolicyId: RosterWallOperatingPolicyId
  captureIntents?: boolean
}

export type RosterWallOperatingWeekResult = {
  startWeek: number
  stateAfterActions: GameState
  stateAfterTick: GameState
  intents: RosterWallPolicyIntentProjection[]
}

/**
 * Execute one reviewed film-policy week from an already-loaded continuation state.
 * Renewal decisions deliberately remain outside this seam and therefore can run
 * first under C0–C6. The weekly tick is the ordinary public core tick.
 */
export function runRosterWallOperatingWeek(
  input: RunRosterWallOperatingWeekInput,
): RosterWallOperatingWeekResult {
  if (
    !(ROSTER_WALL_OPERATING_POLICY_IDS as readonly string[]).includes(
      input.operatingPolicyId,
    )
  ) {
    throw new Error(
      `roster-wall observatory: unknown operatingPolicyId "${String(input.operatingPolicyId)}"`,
    )
  }
  const runtime: CampaignRuntime = {
    state: structuredClone(input.state),
    seed: input.state.seed,
    policy: ROSTER_WALL_OPERATING_POLICIES[input.operatingPolicyId],
    estatePolicyId: 'vacant',
    captureObserver: input.captureIntents ?? true,
    intents: [],
    weekly: [],
    shadows: [],
    preEntryWindowEve: null,
  }
  const startWeek = runtime.state.market.tick
  driveWeek(runtime)
  const stateAfterActions = runtime.state
  runtime.state = tick(runtime.state)
  if (runtime.state.market.tick !== startWeek + 1) {
    throw new Error('roster-wall observatory: operating-week tick did not advance exactly once')
  }
  return {
    startWeek,
    stateAfterActions,
    stateAfterTick: runtime.state,
    intents: runtime.intents.map((intent) => ({
      ...intent,
      action: intent.action === null ? null : structuredClone(intent.action),
    })),
  }
}

/** Prove that timing/intent/weekly observation does not alter campaign bytes or RNG. */
export function verifyRosterWallEntryObserverNeutrality(
  input: RunRosterWallEntryCampaignInput,
): {
  byteIdentical: boolean
  observedStateHash: string
  observerDisabledStateHash: string
  observedEntrySaveHash: string
  observerDisabledEntrySaveHash: string
  observedRngState: string
  observerDisabledRngState: string
  finalWeek: typeof ROSTER_WALL_ENTRY_WEEK
} {
  const observed = executeEntryCampaign(input, true).runtime
  const observerDisabled = executeEntryCampaign(input, false).runtime
  const observedBytes = stableStringify(observed.state)
  const observerDisabledBytes = stableStringify(observerDisabled.state)
  const observedSaveHash = harvestSave(observed.state).entrySaveHash
  const observerDisabledSaveHash = harvestSave(observerDisabled.state).entrySaveHash
  return {
    byteIdentical:
      observedBytes === observerDisabledBytes && observedSaveHash === observerDisabledSaveHash,
    observedStateHash: sha256(observedBytes),
    observerDisabledStateHash: sha256(observerDisabledBytes),
    observedEntrySaveHash: observedSaveHash,
    observerDisabledEntrySaveHash: observerDisabledSaveHash,
    observedRngState: observed.state.rngState,
    observerDisabledRngState: observerDisabled.state.rngState,
    finalWeek: ROSTER_WALL_ENTRY_WEEK,
  }
}

function parityComparable(
  projection: RosterWallCampaignParityProjection,
): Omit<
  RosterWallCampaignParityProjection,
  'seed' | 'operatingPolicyId' | 'estatePolicyId' | 'horizonWeeks'
> {
  const { seed: _seed, operatingPolicyId: _policy, estatePolicyId: _estate, horizonWeeks: _horizon, ...rest } =
    projection
  return rest
}

/**
 * Normalize a frozen runFacilitiesArm result and compare its complete weekly
 * state/RNG/cash plus public-action intent sequence with a vacant Week-196 harvest.
 */
export function compareRosterWallWithFacilitiesVacantW196(
  harvest: RosterWallEntryHarvest,
  facilities: FacilitiesParityReference,
): RosterWallFacilitiesParityComparison {
  if (harvest.estatePolicyId !== 'vacant' || harvest.entryWeek !== ROSTER_WALL_ENTRY_WEEK) {
    throw new Error('roster-wall observatory: facilities parity requires vacant Week-196 entry')
  }
  const facilitiesProjection: RosterWallCampaignParityProjection = {
    seed: harvest.seed,
    operatingPolicyId: harvest.operatingPolicyId,
    estatePolicyId: 'vacant',
    horizonWeeks: ROSTER_WALL_ENTRY_WEEK,
    initialSaveHash: facilities.initialSaveHash,
    initialStateHash: facilities.initialStateHash,
    finalStateHash: facilities.summary.finalStateHash,
    finalRngState: facilities.summary.finalRngState,
    finalWeek: ROSTER_WALL_ENTRY_WEEK,
    weekly: facilities.rows.map((row) => ({
      week: row.week,
      sampleKind: row.sampleKind,
      stateHash: row.stateHash,
      rngState: row.rngState,
      cash: row.cash,
    })),
    intents: facilities.intents.map((intent) => ({
      week: intent.week,
      intentKind: intent.intentKind as RosterWallPolicyIntentKind,
      ownerId: intent.ownerId,
      action: intent.action === null ? null : structuredClone(intent.action),
      accepted: intent.accepted,
      reason: intent.reason,
      capacityBound: false,
      capability: null,
    })),
  }
  const rosterWallProjection = parityComparable(harvest.parity)
  const facilitiesComparable = parityComparable(facilitiesProjection)
  // Capacity classification is a derived evidence field, not controller behavior;
  // the frozen structural input above intentionally supplies no such field. Strip
  // it symmetrically before the parity byte comparison.
  const stripClassification = (
    projection: typeof rosterWallProjection,
  ): typeof rosterWallProjection => ({
    ...projection,
    intents: projection.intents.map(({ capacityBound: _bound, capability: _capability, ...intent }) => ({
      ...intent,
      capacityBound: false,
      capability: null,
    })),
  })
  const rosterComparable = stripClassification(rosterWallProjection)
  const facilitiesStripped = stripClassification(facilitiesComparable)
  const rosterBytes = stableStringify(rosterComparable)
  const facilitiesBytes = stableStringify(facilitiesStripped)
  return {
    byteIdentical: rosterBytes === facilitiesBytes,
    rosterWallProjectionHash: sha256(rosterBytes),
    facilitiesProjectionHash: sha256(facilitiesBytes),
    rosterWallProjection: rosterComparable,
    facilitiesProjection: facilitiesStripped,
  }
}
