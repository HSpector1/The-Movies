// ── Casting Package V1 — the role-first package-assembly projection ─────────
// Pure projection over GameState for a Ready screenplay's package assembly: one
// candidate pool per role (director / lead / antagonist / support / craftLead),
// each candidate carrying only SAFE PERCEIVED facts (OVR/Fit/Expected-Performance,
// genre experience, availability, contract/fee status, role-specific audition
// evidence for actors only), plus the closed negative/marketing budget menus and
// a per-project greenlight-readiness summary. Hidden execution truth, persona,
// temperament decomposition, RNG state, the run seed, and hidden ceilings never
// cross this boundary.
//
// Composes ONLY existing Core authority: talentSummary (roleOVR/projectFit/
// expectedPerformance/genreExperience/workHistoryCount/roleTier), employment
// (activeContract/isContracted/busyTalentIds/freelancerMarketIds/freelancerFee/
// economyEngaged/assignmentProjectCost), filmPackage (requiredNegative),
// marketingMenu (marketingLevelsFor), grid (NEGATIVE_BUDGET_MULTIPLIERS),
// scriptReadModel (the Ready-package projection: concept/writer/lockedShape/
// lockedPromise/availability), and castingSessions (castingSessionForProject,
// for role-specific audition evidence). No formula here is new; every quantity
// is a direct call into one of those modules.
//
// Role-pool law (mirrors the semantics `castingReadModel.ts`'s `currentAvailability`
// and `ui/src/engine/adapter.ts`'s `studioPool` already apply to actors/director/
// craft): a candidate appears in a pool only if their PRIMARY role matches the
// pool (director→'director', lead/antagonist/support→'actor', craftLead→'craft'),
// and they are either currently signable (studio-contracted OR in the current
// freelancer market) or carry persisted audition evidence for that exact slot on
// this exact project (so a tested candidate who later becomes busy keeps their
// evidence, marked unavailable, rather than vanishing). The screenplay's own
// locked writer never appears in any pool for their own project, even when their
// primary role happens to coincide with one (a multi-hyphenate writer).
//
// Pools are sorted by `fit` descending (ties broken by ascending talentId) — that
// IS the data order; any "Best Fit first" style label is client copy over it.

import {
  assignmentProjectCost,
  busyTalentIds,
  economyEngaged,
  freelancerMarketIds,
  isContracted,
} from './employment.js'
import { requiredNegative } from './filmPackage.js'
import { NEGATIVE_BUDGET_MULTIPLIERS } from './grid.js'
import { marketingLevelsFor } from './marketingMenu.js'
import { castingSessionForProject } from './castingSessions.js'
import { activeScriptWriterAssignments } from './scriptDevelopment.js'
import { resolveShape } from './shape.js'
import {
  scriptProjectsReadModel,
  type ReadyScriptPackageView,
  type ScriptPlayerBlockerKind,
} from './scriptReadModel.js'
import {
  expectedPerformance,
  genreExperience,
  projectFit,
  roleOVR,
  roleTier,
  workHistoryCount,
  type PerformanceBand,
} from './talentSummary.js'
import { CASTING_SESSION_WEEKS, ROLE_TO_DISCIPLINE } from './tuning.js'
import type {
  CastSlot,
  CastingSession,
  CreativeRole,
  FilmConcept,
  FilmShape,
  GameState,
  Genre,
  Promise as FilmPromise,
  ShapeEffects,
  Talent,
} from './types.js'

export type PublicSignalView = { kind: 'positive' | 'concern' | 'action'; text: string }

export type AuditionEvidenceRef = {
  talentId: string
  slot: CastSlot
  estimate: number
  low: number
  high: number
  testedWeek: number | null
  sessionId: string
}

export type PackageCandidateView = {
  talentId: string
  name: string
  professionLabel: string
  contractBadge: 'studio' | 'freelancer'
  ovr: number
  fit: number
  ep: PerformanceBand
  genreExperienceLabel: string
  starPower: number
  available: boolean
  availabilityLabel: string
  currentWorkLabel: string | null
  projectCostAmount: number
  projectCostLabel: string
  signals: PublicSignalView[]
  evidence: AuditionEvidenceRef | null
}

export type RolePoolView = {
  role: 'director' | 'lead' | 'antagonist' | 'support' | 'craftLead'
  candidates: PackageCandidateView[]
}

export type PackageBlockerView = {
  code: string
  role:
    | 'screenTest'
    | 'director'
    | 'lead'
    | 'antagonist'
    | 'support'
    | 'craftLead'
    | 'budget'
    | 'capacity'
    | 'session'
    | 'project'
  talentId: string | null
  message: string
  currentHolderId: string | null
  remedy: string
}

export type CastingPackageProjectView = {
  projectId: string
  title: string
  genre: Genre
  writerId: string
  writerName: string
  pools: RolePoolView[]
  negativeOptions: { amount: number; label: string }[]
  marketingOptions: { amount: number; label: string }[]
  readiness: { knownGatesClear: boolean; willQueue: boolean; blockers: PackageBlockerView[] }
}

// ── fixed tables (display-only; no engine math) ─────────────────────────────

const PROFESSION_LABEL: Record<CreativeRole, string> = {
  actor: 'Actor',
  director: 'Director',
  writer: 'Writer',
  craft: 'Craft',
}

const ROLE_POOL_ORDER: readonly RolePoolView['role'][] = [
  'director',
  'lead',
  'antagonist',
  'support',
  'craftLead',
] as const

const POOL_PRIMARY_ROLE: Record<RolePoolView['role'], CreativeRole> = {
  director: 'director',
  lead: 'actor',
  antagonist: 'actor',
  support: 'actor',
  craftLead: 'craft',
}

const POOL_SLOT: Partial<Record<RolePoolView['role'], CastSlot>> = {
  lead: 'lead',
  antagonist: 'antagonist',
  support: 'support',
}

const POOL_LABEL: Record<RolePoolView['role'], string> = {
  director: 'Director',
  lead: 'Lead actor',
  antagonist: 'Antagonist actor',
  support: 'Support actor',
  craftLead: 'Craft Lead',
}

// Every `ScriptPlayerBlockerKind` mapped onto the richer casting-package blocker
// role vocabulary. `package-staffing` is never emitted here — this projection
// replaces it with the finer per-pool emptiness blockers below, which name WHICH
// role is short rather than bundling every shortage into one sentence.
const SCRIPT_BLOCKER_ROLE: Record<ScriptPlayerBlockerKind, PackageBlockerView['role']> = {
  'script-mode': 'project',
  'operations-mode': 'project',
  'studio-founding': 'project',
  'facility-capacity': 'capacity',
  'writer-contract': 'project',
  'writer-assignment': 'project',
  'package-staffing': 'project',
  'casting-session': 'screenTest',
  'greenlight-queued': 'project',
  'no-concepts': 'project',
  'no-writers': 'project',
}

function compareId(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

function requireConcept(state: GameState, conceptId: string): FilmConcept {
  const concept = state.concepts.find((candidate) => candidate.id === conceptId)
  if (concept === undefined) {
    throw new Error(`castingPackageReadModel: unknown concept "${conceptId}"`)
  }
  return concept
}

function requireTalent(state: GameState, talentId: string): Talent {
  const talent = state.talent.find((candidate) => candidate.id === talentId)
  if (talent === undefined) {
    throw new Error(`castingPackageReadModel: unknown talent "${talentId}"`)
  }
  return talent
}

function formatMoney(n: number): string {
  return `$${Math.round(n).toLocaleString('en-US')}`
}

function formatMultiplier(m: number): string {
  return `${m}×`
}

// ── per-candidate availability (mirrors castingReadModel's currentAvailability,
// generalized from 'actor'-only to any primary role) ────────────────────────

function poolAvailability(
  state: GameState,
  talentId: string,
  requiredRole: CreativeRole,
  writerId: string,
): { available: boolean; label: string } {
  const talent = requireTalent(state, talentId)
  if (talent.role !== requiredRole) {
    return { available: false, label: `Outside the primary ${PROFESSION_LABEL[requiredRole]} pool` }
  }
  if (talentId === writerId) {
    return { available: false, label: 'Locked screenplay writer' }
  }
  if (busyTalentIds(state).has(talentId)) {
    return { available: false, label: 'Currently assigned to another production or screenplay' }
  }
  if (isContracted(state, talentId)) {
    return { available: true, label: 'Studio-contracted and currently available' }
  }
  if (freelancerMarketIds(state).includes(talentId)) {
    return { available: true, label: 'Available in the current freelancer market' }
  }
  return { available: false, label: 'Not currently contracted or in the freelancer market' }
}

// A real, non-fabricated "what are they doing instead" label: the active
// production or screenplay-writing assignment this talent currently holds (both
// already-authoritative Core facts), or a generic fallback when busy for a reason
// neither collection names (never invents a specific credit).
function currentWorkLabel(state: GameState, talentId: string): string | null {
  if (!busyTalentIds(state).has(talentId)) return null
  // P04A.2 — SEATS ONLY, no `p.writerId`. A writer credit is not work, so it
  // must never win this lookup: a writer drafting their next screenplay while a
  // picture they wrote shoots has to read "Drafting <title>", not "Working on
  // <the old picture>" (Owner ruling §10 — current work outranks credit).
  const production = state.studio.activeProductions.find(
    (p) =>
      p.directorId === talentId ||
      p.cast.lead === talentId ||
      p.cast.antagonist === talentId ||
      p.cast.support === talentId ||
      p.craftIds.includes(talentId),
  )
  if (production !== undefined) {
    const concept = state.concepts.find((c) => c.id === production.conceptId)
    return concept === undefined ? 'Working on an active production' : `Working on ${concept.title}`
  }
  const writing = activeScriptWriterAssignments(state.scriptDevelopment, state.concepts).find(
    (assignment) => assignment.talentId === talentId,
  )
  if (writing !== undefined) return writing.label
  return 'Currently otherwise engaged'
}

function genreExperienceLabel(exp: number): string {
  if (exp >= 70) return 'Extensive genre experience'
  if (exp >= 40) return 'Some genre experience'
  if (exp > 0) return 'Limited genre experience'
  return 'No experience in this genre'
}

// ── cost (promoted assignmentProjectCost semantics, verbatim amount + a plain label) ─

function candidateCost(
  state: GameState,
  talentId: string,
): { amount: number; label: string } {
  const amount = assignmentProjectCost(state, talentId)
  if (!economyEngaged(state)) {
    return { amount, label: `Salary: ${formatMoney(amount)} per production` }
  }
  if (isContracted(state, talentId)) {
    return { amount, label: 'On studio payroll' }
  }
  return { amount, label: `Freelancer fee: ${formatMoney(amount)}` }
}

// ── public signals — 0-2 positive + <=1 concern + <=1 action, SAFE PERCEIVED
// facts only (role tier, genre experience, availability/conflict, contract/fee
// status). Never reads talent.actual, persona, temperament decomposition, or
// anything named teamDirection*. ────────────────────────────────────────────

function buildSignals(params: {
  tier: string
  workHistory: number
  genreExp: number
  available: boolean
  availabilityLabel: string
  badge: 'studio' | 'freelancer'
  costAmount: number
}): PublicSignalView[] {
  const { tier, workHistory, genreExp, available, availabilityLabel, badge, costAmount } = params

  const positiveCandidates: PublicSignalView[] = []
  if (tier === 'Generational' || tier === 'Elite' || tier === 'Major-studio') {
    positiveCandidates.push({ kind: 'positive', text: `${tier} talent for this role.` })
  }
  if (badge === 'studio') {
    positiveCandidates.push({ kind: 'positive', text: 'On studio payroll — no added project cost.' })
  }
  if (workHistory > 0 && genreExp >= 60) {
    positiveCandidates.push({ kind: 'positive', text: 'Proven track record in this genre.' })
  }

  const concernCandidates: PublicSignalView[] = []
  if (!available) {
    concernCandidates.push({ kind: 'concern', text: availabilityLabel })
  }
  if (tier === 'Highly unproven' || tier === 'Raw prospect') {
    concernCandidates.push({ kind: 'concern', text: `${tier} for this role.` })
  }
  if (workHistory === 0) {
    concernCandidates.push({ kind: 'concern', text: 'Unproven in this genre.' })
  }

  const actionCandidates: PublicSignalView[] = []
  if (badge === 'freelancer') {
    actionCandidates.push({
      kind: 'action',
      text: `Signs for a one-film freelance fee of ${formatMoney(costAmount)}.`,
    })
  }

  return [
    ...positiveCandidates.slice(0, 2),
    ...concernCandidates.slice(0, 1),
    ...actionCandidates.slice(0, 1),
  ]
}

// ── candidate + pool assembly ────────────────────────────────────────────────

function buildCandidate(
  state: GameState,
  talentId: string,
  requiredRole: CreativeRole,
  slot: CastSlot | undefined,
  writerId: string,
  concept: FilmConcept,
  shape: FilmShape,
  shapeEffects: ShapeEffects,
  promise: FilmPromise,
  evidence: AuditionEvidenceRef | null,
): PackageCandidateView {
  const talent = requireTalent(state, talentId)
  const discipline = ROLE_TO_DISCIPLINE[requiredRole]
  const availability = poolAvailability(state, talentId, requiredRole, writerId)
  const ovr = roleOVR(talent, discipline)
  const fit = projectFit(talent, discipline, concept, slot, shapeEffects, promise, shape)
  const ep = expectedPerformance(talent, discipline, concept, slot, shapeEffects, promise, shape)
  const badge: 'studio' | 'freelancer' = isContracted(state, talentId) ? 'studio' : 'freelancer'
  const cost = candidateCost(state, talentId)
  const genreExp = genreExperience(talent, discipline, concept.genre, 'perceived')
  const workHistory = workHistoryCount(talent, discipline)
  const tier = roleTier(ovr)

  return {
    talentId: talent.id,
    name: talent.name,
    professionLabel: PROFESSION_LABEL[requiredRole],
    contractBadge: badge,
    ovr,
    fit,
    ep,
    genreExperienceLabel: genreExperienceLabel(genreExp),
    starPower: talent.fame,
    available: availability.available,
    availabilityLabel: availability.label,
    currentWorkLabel: currentWorkLabel(state, talentId),
    projectCostAmount: cost.amount,
    projectCostLabel: cost.label,
    signals: buildSignals({
      tier,
      workHistory,
      genreExp,
      available: availability.available,
      availabilityLabel: availability.label,
      badge,
      costAmount: cost.amount,
    }),
    evidence,
  }
}

function buildPool(
  state: GameState,
  poolRole: RolePoolView['role'],
  writerId: string,
  concept: FilmConcept,
  shape: FilmShape,
  promise: FilmPromise,
  session: CastingSession | undefined,
): RolePoolView {
  const requiredRole = POOL_PRIMARY_ROLE[poolRole]
  const slot = POOL_SLOT[poolRole]
  const shapeEffects = resolveShape(shape)

  const evidenceByTalent = new Map<string, AuditionEvidenceRef>()
  if (slot !== undefined && session !== undefined && session.results !== null) {
    const testedWeek = session.startedWeek + CASTING_SESSION_WEEKS
    for (const result of session.results[slot]) {
      evidenceByTalent.set(result.talentId, {
        talentId: result.talentId,
        slot,
        estimate: result.estimate,
        low: result.low,
        high: result.high,
        testedWeek,
        sessionId: session.id,
      })
    }
  }

  const eligibleIds = state.talent
    .filter((t) => t.role === requiredRole)
    .filter((t) => poolAvailability(state, t.id, requiredRole, writerId).available)
    .map((t) => t.id)

  const allIds = new Set<string>(eligibleIds)
  for (const id of evidenceByTalent.keys()) allIds.add(id)

  const candidates = [...allIds]
    .sort(compareId)
    .map((id) =>
      buildCandidate(
        state,
        id,
        requiredRole,
        slot,
        writerId,
        concept,
        shape,
        shapeEffects,
        promise,
        evidenceByTalent.get(id) ?? null,
      ),
    )
    .sort((a, b) => b.fit - a.fit || compareId(a.talentId, b.talentId))

  return { role: poolRole, candidates }
}

function poolBlocker(pool: RolePoolView): PackageBlockerView | null {
  if (pool.candidates.some((c) => c.available)) return null
  const label = POOL_LABEL[pool.role]
  return {
    code: 'no-available-candidate',
    role: pool.role,
    talentId: null,
    message: `No available ${label} candidate for this package.`,
    currentHolderId: null,
    remedy: `Sign a ${label}, or wait for one to become available in the studio roster or freelancer market.`,
  }
}

function buildProjectView(state: GameState, pkg: ReadyScriptPackageView): CastingPackageProjectView {
  const concept = requireConcept(state, pkg.concept.id)
  const writerId = pkg.writer.id
  const session = castingSessionForProject(state.castingSessions, pkg.projectId)

  const pools = ROLE_POOL_ORDER.map((role) =>
    buildPool(state, role, writerId, concept, pkg.lockedShape, pkg.lockedPromise, session),
  )

  const mappedBlockers: PackageBlockerView[] = pkg.availability.blockers
    .filter((b) => b.kind !== 'package-staffing')
    .map((b) => ({
      code: b.kind,
      role: SCRIPT_BLOCKER_ROLE[b.kind],
      talentId: null,
      message: b.headline,
      currentHolderId: null,
      remedy: b.remedy,
    }))
  const poolBlockers = pools
    .map(poolBlocker)
    .filter((b): b is PackageBlockerView => b !== null)
  const blockers = [...mappedBlockers, ...poolBlockers]
  const knownGatesClear = blockers.length === 0
  const willQueue = blockers.length > 0 && blockers.every((b) => b.code === 'facility-capacity')

  const reqNeg = requiredNegative(concept, pkg.lockedShape, state)
  const negativeOptions = NEGATIVE_BUDGET_MULTIPLIERS.map((m) => {
    const amount = Math.round(m * reqNeg)
    return { amount, label: `${formatMoney(amount)} (${formatMultiplier(m)} of required negative)` }
  })
  const marketingOptions = marketingLevelsFor(state, null).map((amount) => ({
    amount,
    label: formatMoney(amount),
  }))

  return {
    projectId: pkg.projectId,
    title: concept.title,
    genre: concept.genre,
    writerId,
    writerName: pkg.writer.name,
    pools,
    negativeOptions,
    marketingOptions,
    readiness: { knownGatesClear, willQueue, blockers },
  }
}

/**
 * The role-first Casting Package projection: one entry per Ready screenplay,
 * each with role pools (director/lead/antagonist/support/craftLead), the closed
 * negative/marketing budget menus, and a greenlight-readiness summary. Pure over
 * `state`; deterministic; consumes zero RNG.
 */
export function castingPackageReadModel(state: GameState): {
  mode: 'legacy' | 'managed'
  projects: CastingPackageProjectView[]
} {
  const scriptRM = scriptProjectsReadModel(state)
  const projects = scriptRM.packages
    .slice()
    .sort((a, b) => compareId(a.projectId, b.projectId))
    .map((pkg) => buildProjectView(state, pkg))
  return { mode: state.castingSessions.mode, projects }
}
