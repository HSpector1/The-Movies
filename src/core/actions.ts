// ── §3 applyActions ──────────────────────────────────────────────────────────
// `applyActions(state, actions): GameState` — pure; validates, then applies the
// three action kinds (greenlight / cancel / createTalent). This is the
// pre-simulation half of §3's `state = tick(applyActions(state, actions))` pair;
// `tick` is a separate step and is NOT implemented here.
//
// Rev. 4 references folded in:
//   M16 — validation (role matching, distinct cast, talent exclusivity,
//         concurrency) + loud rejection of any invalid action (a harness abort,
//         NOT a silent no-op and NOT a game event).
//   B3  — at most one greenlight per call. C2a-M4: the "under the cap" half of
//         this law is DELETED with the cap (owner law 1); a greenlight the
//         studio's rooms cannot carry is ADMITTED TO THE QUEUE (§3.3), never
//         refused for being the Nth.
//   D-1 — greenlight debits budget.negative + budget.marketing + Σ salaries
//         (writer + director + all cast + all craft). Cash may go negative with
//         no mechanical consequence. No credit here (release credits are in tick).
//   M1  — currentTick = state.market.tick; startTick = currentTick;
//         remainingTicks = PRODUCTION_TICKS; forecastSnapshot computed at
//         greenlight from the DERIVED forecast stream (never the sim stream).
//   M4  — promise.genre must equal concept.genre.
//   M15 — cancel: valid only for an active production; remove it; no refund, no
//         standing effect.
//   §10 — createTalent: perceived = actual; skill/fame are AUTHORED_START_*;
//         salary = salaryCurve(...); authored = true; player never sets skill/fame.
//
// Purity contract (per the role definition + §1):
//   - Returns a NEW GameState via spreads; never mutates `state`, `state.studio`,
//     `state.talent`, or `activeProductions` in place. Unchanged sub-objects are
//     shared by reference (immutability by construction).
//   - Never reads time / entropy; the ONLY randomness is the single gaussian the
//     forecast draws from stream(seed,'forecast',productionId) INSIDE
//     computeForecast — the derived forecast stream, NOT the sim stream. So the
//     returned state's `rngState` is byte-identical to the input's.
//   - Actions are processed in array order over an evolving state, so a
//     createTalent earlier in the list is visible to a later greenlight.

import {
  activeContract,
  busyTalentIds,
  canAfford,
  contractOffer,
  economyEngaged,
  foundingGaps,
  foundingMinimumsMet,
  freelancerFee,
  freelancerMarketIds,
  hiringMarketIds,
  isContracted,
  renewalWindowOpen,
  terminationCost,
} from './employment.js'
import { computeForecast, type ForecastContext } from './forecast.js'
import { clamp } from './math.js'
import { assertNoDoubleBookedResourceSlots, setOccupiedFacilitySlots } from './occupancy.js'
import {
  acknowledgeCastingSession,
  assertCastingSessionsInvariants,
  castingOccupiedFacilitySlots,
  initialManagedCastingSessions,
  startCastingSession,
} from './castingSessions.js'
import {
  annexCanonicalProductionIdCollision,
  initialManagedStudioConstruction,
} from './construction.js'
import {
  assertStudioPlacementInvariants,
  commitPlacement,
  demolishFacility,
  facilityDemolitionRefusal,
  facilityMoveRefusal,
  moveFacility,
  initialManagedStudioPlacement,
  legacyAnnexPlacementRequest,
  placementRegimeReady,
  queryPlacement,
} from './placement.js'
import { propertyOf } from './lot.js'
import {
  addManagedProductionWorkflow,
  assignShootingDirector,
  clearSceneryLoadIn,
  initialManagedStudioOperations,
  removeManagedProductionWorkflow,
  scheduleShootingTake,
} from './operations.js'
import { publicityLiftAt } from './publicity.js'
import { isSceneryLoadIn, sceneryLoadInFor } from './sceneryLoadIn.js'
import {
  ENDOWED_NEXT_SET_ID,
  assertSetsInvariants,
  commissionSet,
  commissionSetRefusal,
  endowedHouseSets,
  repairSet,
  repairSetRefusal,
  setById,
  setCommissionRefusalCopy,
  setRepairRefusalCopy,
  setStrikeRefusalCopy,
  strikeSet,
  strikeSetRefusal,
  type SetRefusalCopy,
} from './sets.js'
import {
  commitStudioEvents,
  disabledStudioEventSink,
  StudioEventSink,
} from './studioEvents.js'
import { persistedProductionIds } from './productionIdentity.js'
import {
  QueueableCapacityRefusal,
  gateSlotAvailable,
  hasQueuedCastingSession,
  hasQueuedGreenlightScriptProject,
  hasQueuedPoolCommissionForConcept,
  queueCommissionOriginalScreenplay,
  queueCommissionScript,
  queueGreenlightScriptProject,
  queueStartCastingSession,
  queueingActive,
  removeQueueEntry,
} from './productionQueue.js'
import {
  acceptScriptProject,
  activeScriptWriterAssignments,
  assertScriptDevelopmentInvariants,
  commissionScriptProject,
  initialManagedScriptDevelopment,
  joinScreenplayWriterPool,
  linkScriptProjectToProduction,
  nextScriptProjectId,
  requestScriptRewrite,
  returnScriptProjectToReady,
  screenplayFactsMatch,
  scriptOccupiedFacilitySlots,
  scriptProjectWriterIds,
} from './scriptDevelopment.js'
import {
  assertMovieBlueprintInvariants,
  blueprintForConcept,
  isOriginalScreenplay,
  mintOriginalConcept,
  movieBlueprint,
  normalizeScreenplayTitle,
  originalConceptId,
  persistedConceptIds,
  renameScreenplayRefusal,
  scriptDraftWeeks,
  writingPaceExperience,
} from './screenplay.js'
import { developmentOfficeTier } from './facilityEffects.js'
import type { ReceptionInputs } from './reception.js'
import { stream, type RngStream } from './rng.js'
import { resolveShape } from './shape.js'
import {
  AUTHORED_START_OVR,
  AUTHORED_TIER_COST,
  AUTHORED_TIER_RANGE,
  BALANCED_ARCHETYPES,
  DISCIPLINE_ORDER,
  GENRE_ORDER,
  ROLE_TO_DISCIPLINE,
  SKILL_ORDER,
  TUNING,
} from './tuning.js'
import { expectedPerformance, projectFit, roleOVR } from './talentSummary.js'
import type {
  Action,
  ArchetypePreset,
  AuthoredTalentInput,
  BalancedTalentInput,
  CastSlot,
  Ceilings,
  Contract,
  CreativeRole,
  CustomTalentInput,
  DevRates,
  Discipline,
  DisciplineSkills,
  FilmParticipant,
  FilmParticipants,
  Forecast,
  GameState,
  MovieBlueprint,
  OriginalScreenplays,
  Genre,
  GenreExperience,
  LedgerEntry,
  FacilityEngagement,
  PlacementMutationRefusal,
  PlacementRequest,
  PotentialTier,
  Production,
  ProductionQueueEntry,
  Promise as FilmPromise,
  ScriptProject,
  ShapeEffects,
  SkillBias,
  SkillProfiles,
  Talent,
  WorkHistory,
} from './types.js'
import { salaryCurve } from './worldgen.js'

// Fixed cast-slot iteration order (determinism: role matching, salary summation,
// exclusivity checks, and ReceptionInputs.cast assembly all walk this order).
const CAST_SLOTS: readonly CastSlot[] = ['lead', 'antagonist', 'support'] as const

// The valid §2 CreativeRole values (createTalent role validation).
const CREATIVE_ROLES: readonly CreativeRole[] = ['writer', 'director', 'actor', 'craft'] as const

// Production.id (D-11.A uniqueness fix). Base = `prod-${startTick padded}` — kept so
// the M0A corpus (≤1 greenlight/tick) is byte-identical. But the 2-concurrent rule
// (B3) lets a PLAYER greenlight two films at the SAME tick, which under the old scheme
// produced two `prod-0000` ids — the root cause of the duplicated-autopsy bug. So when
// the base is already taken, append the smallest free `-k` suffix. Deterministic; base
// id unchanged whenever it is free (i.e. always, in M0A).
function productionId(startTick: number, taken: ReadonlySet<string>): string {
  const base = `prod-${String(startTick).padStart(4, '0')}`
  if (!taken.has(base)) return base
  let k = 1
  while (taken.has(`${base}-${k}`)) k++
  return `${base}-${k}`
}

// The production id the NEXT greenlight at the current tick WILL allocate — the SAME
// collision-safe allocation applyGreenlight uses (currentTick + every persisted id).
// Exposed so the UI can preview a Review/Commercial-Outlook forecast on the SAME forecast
// stream the greenlight will persist. Without this, a same-week SECOND greenlight previews on
// the bare `prod-<tick>` stream but the engine persists a forecast drawn from `prod-<tick>-1`
// → the two diverge (D-12 beta P1). Pure; draws from no stream. Identical to the base id in
// M0A (≤1 greenlight/tick → no collision) so no headless behavior changes.
export function predictProductionId(state: GameState): string {
  return productionId(state.market.tick, persistedProductionIds(state))
}

// D-11.A — capture the film's immutable participant record at the LOCKED greenlight
// (perceived values). `freelancer` = engaged as a freelancer (not studio-contracted).
function buildParticipant(
  state: GameState,
  talent: Talent,
  role: FilmParticipant['role'],
  discipline: Discipline,
  slot: CastSlot | undefined,
  concept: FilmConceptLike,
  shapeEffects: ShapeEffects,
  promise: FilmPromise,
  shape: Production['shape'],
): FilmParticipant {
  const ep = expectedPerformance(talent, discipline, concept, slot, shapeEffects, promise, shape)
  return {
    talentId: talent.id,
    name: talent.name,
    role,
    discipline,
    greenlightOVR: Math.round(roleOVR(talent, discipline)),
    greenlightFit: Math.round(projectFit(talent, discipline, concept, slot, shapeEffects, promise, shape)),
    greenlightEP: { low: ep.low, high: ep.high, expected: ep.expected },
    freelancer: !isContracted(state, talent.id),
  }
}

// The FilmConcept shape the talentSummary helpers need (kept local to avoid a wide import).
type FilmConceptLike = Parameters<typeof projectFit>[2]

function buildFilmParticipants(
  state: GameState,
  parts: {
    writer: Talent
    director: Talent
    cast: Record<CastSlot, Talent>
    craftHires: Talent[]
  },
  concept: FilmConceptLike,
  shapeEffects: ShapeEffects,
  promise: FilmPromise,
  shape: Production['shape'],
): FilmParticipants {
  const P = (t: Talent, role: FilmParticipant['role'], d: Discipline, slot: CastSlot | undefined) =>
    buildParticipant(state, t, role, d, slot, concept, shapeEffects, promise, shape)
  return {
    writer: P(parts.writer, 'writer', 'writing', undefined),
    director: P(parts.director, 'director', 'directing', undefined),
    cast: {
      lead: P(parts.cast.lead, 'lead', 'acting', 'lead'),
      antagonist: P(parts.cast.antagonist, 'antagonist', 'acting', 'antagonist'),
      support: P(parts.cast.support, 'support', 'acting', 'support'),
    },
    craft: parts.craftHires.map((c) => P(c, 'craft', 'craft', undefined)),
  }
}

// Authored-talent id scheme (§10). Worldgen ids are `t-<role3>-NN` and `c-NN`;
// the `authored-` prefix cannot collide with either. The numeric suffix is the
// count of already-existing authored talent (authored === true) at creation
// time, zero-padded to 4 digits. Because createTalent only ever appends, this
// count is monotonic and yields a unique, deterministic, replay-stable id
// (`authored-0000`, `authored-0001`, …) with no GameState counter and no entropy.
function authoredTalentId(existing: readonly Talent[]): string {
  let authoredCount = 0
  for (const t of existing) if (t.authored) authoredCount++
  return `authored-${String(authoredCount).padStart(4, '0')}`
}

// Resolve a talent id to its Talent, or throw the loud M16 abort if absent.
function requireTalent(talent: readonly Talent[], id: string, label: string): Talent {
  const found = talent.find((t) => t.id === id)
  if (found === undefined) {
    throw new Error(`applyActions: ${label} references unknown talent id "${id}"`)
  }
  return found
}

// D-9 / OQ-1 — cross-discipline eligibility. The owner requires cross-discipline
// careers, so M16's role-TYPE check is RELAXED to a HAS-DISCIPLINE check: a talent
// is legal for any assignment because every D-9 talent carries all four skill sets
// (24 skills). This check therefore always passes (it exists as the legality point
// and a defensive guard that the talent's skills record is well-formed). The M0A
// candidate generator stays role-partitioned (candidates.ts), so the frozen
// D-2/economics corpus is unchanged; cross-discipline is exercised via tests +
// human play only. `role` names the discipline the assignment expects.
const ROLE_DISCIPLINE: Record<CreativeRole, Discipline> = {
  writer: 'writing',
  director: 'directing',
  actor: 'acting',
  craft: 'craft',
}

function requireRole(t: Talent, role: CreativeRole, label: string): void {
  const discipline = ROLE_DISCIPLINE[role]
  // Has-discipline check: every talent has all four skill sets, so this passes.
  if (t.skills[discipline] === undefined) {
    throw new Error(
      `applyActions: ${label} talent "${t.id}" lacks a "${discipline}" skill profile (has-discipline check)`,
    )
  }
}

// ── greenlight ───────────────────────────────────────────────────────────────
// Validate (throw on any failure per M16 + B3), then apply. `state` is the
// evolving state (may already reflect earlier actions in this call). Returns the
// next state; `state.rngState` is carried through unchanged.
function applyGreenlight(
  state: GameState,
  prod: Action & { kind: 'greenlight' },
  scriptProjectId?: string,
  // C2a-M4: the tick's OWN event sink, when this greenlight is being committed by
  // the queue's admission step rather than by a player action. Injected so the
  // week's rows keep one true order and one commit — an admission that opened its
  // own sink would stamp its rows into the log before the advance that freed the
  // slot had recorded a thing.
  injectedEvents?: StudioEventSink,
): GameState {
  const p = prod.production
  const currentTick = state.market.tick

  const scriptProject =
    scriptProjectId === undefined
      ? undefined
      : state.scriptDevelopment.projects.find((project) => project.id === scriptProjectId)
  if (state.scriptDevelopment.mode === 'managed') {
    if (scriptProject === undefined || scriptProject.status !== 'ready' || scriptProject.assessment === null) {
      throw new Error(
        'applyActions: greenlight rejected — managed studios must greenlight an authoritative Ready script project',
      )
    }
    if (!screenplayFactsMatch(scriptProject, p)) {
      throw new Error(
        `applyActions: greenlight rejected — package facts disagree with Ready script project "${scriptProject.id}"`,
      )
    }
    const castingSession = state.castingSessions.sessions.find(
      (session) => session.projectId === scriptProject.id,
    )
    if (
      state.castingSessions.mode === 'managed' &&
      castingSession !== undefined &&
      castingSession.status !== 'complete'
    ) {
      throw new Error(
        `applyActions: greenlightScriptProject rejected — casting session "${castingSession.id}" must be reviewed and acknowledged first`,
      )
    }
  } else if (scriptProjectId !== undefined) {
    throw new Error(
      'applyActions: greenlightScriptProject rejected — screenplay development is not managed',
    )
  }

  // D-11.2 — no greenlight during the founding draft (assemble a roster first).
  if (state.founding !== null) {
    throw new Error('applyActions: greenlight rejected — the studio is still in its founding draft (D-11)')
  }

  // M16.6 / B3 — THE CONCURRENCY CAP IS GONE (C2a-M4, owner law 1). What limits
  // a studio's slate is the rooms it has: this greenlight still has to acquire a
  // Development & Casting slot below, and if it cannot, the front door admits it
  // to the queue instead of throwing it away (§3.3). There is no global counter
  // left to consult.

  // M16.1 — conceptId refers to an existing concept.
  const concept = state.concepts.find((c) => c.id === p.conceptId)
  if (concept === undefined) {
    throw new Error(`applyActions: greenlight references unknown conceptId "${p.conceptId}"`)
  }

  // M16.4 / M4 — promise.genre must equal concept.genre.
  if (p.promise.genre !== concept.genre) {
    throw new Error(
      `applyActions: greenlight promise.genre "${p.promise.genre}" ≠ concept.genre "${concept.genre}"`,
    )
  }

  // M16.2 — role matching. Every referenced id must exist AND have the right role.
  const writer = requireTalent(state.talent, p.writerId, 'greenlight writerId')
  requireRole(writer, 'writer', 'greenlight writerId')

  const director = requireTalent(state.talent, p.directorId, 'greenlight directorId')
  requireRole(director, 'director', 'greenlight directorId')

  const cast = {} as Record<CastSlot, Talent>
  for (const slot of CAST_SLOTS) {
    const id = p.cast[slot]
    const actor = requireTalent(state.talent, id, `greenlight cast.${slot}`)
    requireRole(actor, 'actor', `greenlight cast.${slot}`)
    cast[slot] = actor
  }

  const craftHires: Talent[] = p.craftIds.map((id, i) => {
    const c = requireTalent(state.talent, id, `greenlight craftIds[${i}]`)
    requireRole(c, 'craft', `greenlight craftIds[${i}]`)
    return c
  })

  // M16.3 — no actor in two slots of the same film (the three cast ids distinct).
  const castIds = CAST_SLOTS.map((slot) => p.cast[slot])
  if (new Set(castIds).size !== castIds.length) {
    throw new Error(
      `applyActions: greenlight assigns the same actor to more than one cast slot (${castIds.join(', ')})`,
    )
  }

  // M16.7 — within-production single-role uniqueness (SETTLED OWNER RULING: "a
  // talent fills exactly one role in one production" / no simultaneous multi-role
  // credits this milestone). Cross-discipline eligibility (OQ-1) makes any talent
  // legal for any assignment, so nothing else stops the SAME id filling two roles
  // in ONE production (e.g. writerId === cast.lead), which would develop, salary,
  // and exclusivity-double-count them. Collect every assigned id for this
  // production in a FIXED order — writerId, directorId, each craftId (array order),
  // then each cast slot (lead → antagonist → support) — and reject loudly if any
  // id appears more than once.
  const roleAssignments: { id: string; role: string }[] = [
    { id: p.writerId, role: 'writerId' },
    { id: p.directorId, role: 'directorId' },
    ...p.craftIds.map((id, i) => ({ id, role: `craftIds[${i}]` })),
    ...CAST_SLOTS.map((slot) => ({ id: p.cast[slot], role: `cast.${slot}` })),
  ]
  const seenRoleById = new Map<string, string>()
  for (const { id, role } of roleAssignments) {
    const priorRole = seenRoleById.get(id)
    if (priorRole !== undefined) {
      throw new Error(
        `applyActions: greenlight assigns talent "${id}" to more than one role in the same production ` +
          `(${priorRole} and ${role}) — a talent fills exactly one role in one production (M16)`,
      )
    }
    seenRoleById.set(id, role)
  }

  // M16.5 — talent exclusivity: none of the engaged ids (writer, director, the
  // three cast, all craft) may already be engaged in ANY active production (as
  // its writerId/directorId/any cast/any craftId). Fixed-order id list.
  const engagedIds: string[] = [
    p.writerId,
    p.directorId,
    ...castIds,
    ...p.craftIds,
  ]
  const busy = new Set<string>()
  for (const active of state.studio.activeProductions) {
    busy.add(active.writerId)
    busy.add(active.directorId)
    for (const slot of CAST_SLOTS) busy.add(active.cast[slot])
    for (const cid of active.craftIds) busy.add(cid)
  }
  for (const assignment of activeScriptWriterAssignments(
    state.scriptDevelopment,
    state.concepts,
  )) {
    busy.add(assignment.talentId)
  }
  for (const id of engagedIds) {
    if (busy.has(id)) {
      throw new Error(
        `applyActions: greenlight talent "${id}" is already engaged in an active production (exclusivity, M16)`,
      )
    }
  }

  // ── Apply ──────────────────────────────────────────────────────────────────
  // One allocator serves both preview and apply. Historical persisted ids stay reserved
  // even after cancellation, so distinct films can never share an accounting identity.
  const id = predictProductionId(state)
  const startTick = currentTick
  const remainingTicks = TUNING.PRODUCTION_TICKS

  // Assemble the §5 ReceptionInputs the forecast reads at greenlight (M1/B16).
  const inp: ReceptionInputs = {
    concept,
    // RULING C: the shape being greenlit — becomes production.shape (locked) below.
    shape: p.shape,
    shapeEffects: resolveShape(p.shape),
    promise: p.promise,
    budget: p.budget,
    writer,
    director,
    cast,
    craftHires,
    market: state.market,
    standing: state.studio.standing,
    era: state.era,
    ...(scriptProject?.assessment
      ? {
          scriptStrengthOverride: {
            actual: scriptProject.assessment.actualStrength,
            perceived: scriptProject.assessment.perceivedStrength,
          },
        }
      : {}),
  }

  // forecastSnapshot — computed at greenlight (M1). computeForecast draws its ONE
  // gaussian from stream(seed,'forecast',id) internally — the DERIVED forecast
  // stream, NOT the sim stream. state.rngState is never touched here.
  const ctx: ForecastContext = {
    seed: state.seed,
    productionId: id,
    directorId: p.directorId,
    releasedFilms: state.studio.releasedFilms,
    concepts: state.concepts,
  }
  // D-12: the greenlight forecast saturates fame→opening reach AND applies the P2 economy
  // calibration (gross scale + awareness marketing) with the SAME helper as the realized release
  // when engaged, so forecast and result stay consistent; M0A (not engaged) uses the legacy path
  // (byte-identical). Both flags are the same production signal. D-17A/R2: the regime is the
  // PERSISTED fact, so a studio between contracts still forecasts on the engaged model — the
  // cliff must not survive at greenlight.
  const engaged = economyEngaged(state)
  const forecastSnapshot: Forecast = computeForecast(inp, ctx, engaged, engaged)

  // ── Ledger + cash (D-1 unchanged when employment NOT engaged; D-11 economics
  // when engaged). Both paths keep the reconciliation invariant: native games
  // begin from INITIAL_CASH; migrated pre-ledger games begin from their explicit
  // V11 cash/ledger checkpoint.
  // by logging every cash movement. The production entry always covers
  // negative + marketing; the salary/fee treatment differs by mode.
  const productionCost = p.budget.negative + p.budget.marketing
  let cash: number
  const ledgerAdds: LedgerEntry[] = []

  if (economyEngaged(state)) {
    // D-11.13 — every film requires exactly ONE Production/Craft Lead.
    if (p.craftIds.length !== 1) {
      throw new Error(
        `applyActions: greenlight rejected — a film requires exactly one Production/Craft Lead (got ${p.craftIds.length}) (D-11.13)`,
      )
    }
    // D-11.12 — each assigned talent must be Studio-Contracted OR an Available
    // Freelancer. Contracted talent cost nothing at greenlight (payroll covers
    // them, D-11.5); each freelancer costs a one-film fee (a direct project cost,
    // D-11.10), debited and logged separately from payroll.
    const freelancerMarket = new Set(freelancerMarketIds(state))
    const assigned: Talent[] = [writer, director, cast.lead, cast.antagonist, cast.support, ...craftHires]
    let freelancerFees = 0
    for (const t of assigned) {
      if (isContracted(state, t.id)) continue // payroll covers contracted talent
      if (!freelancerMarket.has(t.id)) {
        throw new Error(
          `applyActions: greenlight rejected — talent "${t.id}" is neither studio-contracted nor an available freelancer (D-11.12)`,
        )
      }
      const fee = freelancerFee(state, t)
      freelancerFees += fee
      ledgerAdds.push({
        week: currentTick,
        kind: 'freelancerFee',
        amount: -fee,
        talentId: t.id,
        productionId: id,
        note: 'freelancer one-film fee',
      })
    }
    // D-12 solvency gate — a voluntary greenlight (production + marketing + freelancer fees)
    // may not leave cash below zero. Unavoidable weekly costs may still go negative later.
    const aff = canAfford(state, productionCost + freelancerFees)
    if (!aff.ok) {
      throw new Error(`applyActions: greenlight rejected — ${aff.reason} (D-12 solvency gate)`)
    }
    cash = state.studio.cash - productionCost - freelancerFees
    ledgerAdds.unshift({
      week: currentTick,
      kind: 'production',
      amount: -productionCost,
      productionId: id,
      note: 'negative + marketing',
    })
  } else {
    // D-1 (open pool, headless corpus): debit negative + marketing + Σ salaries.
    let salaries = writer.salary + director.salary
    for (const slot of CAST_SLOTS) salaries += cast[slot].salary
    for (const c of craftHires) salaries += c.salary
    cash = state.studio.cash - (productionCost + salaries)
    ledgerAdds.push({
      week: currentTick,
      kind: 'production',
      amount: -(productionCost + salaries),
      productionId: id,
      note: 'negative + marketing + salaries (D-1)',
    })
  }

  // D-11.A — capture the immutable participant record at this LOCKED greenlight, but
  // ONLY when employment is engaged (so M0A/legacy productions carry no such field and
  // stay byte-identical). resolveShape(p.shape) matches the ReceptionInputs shapeEffects.
  const participants: FilmParticipants | undefined = economyEngaged(state)
    ? buildFilmParticipants(
        state,
        { writer, director, cast, craftHires },
        concept,
        resolveShape(p.shape),
        p.promise,
        p.shape,
      )
    : undefined

  const production: Production = {
    id,
    conceptId: p.conceptId,
    shape: p.shape,
    promise: p.promise,
    writerId: p.writerId,
    directorId: p.directorId,
    craftIds: p.craftIds,
    cast: p.cast,
    budget: p.budget,
    startTick,
    remainingTicks,
    forecastSnapshot,
    ...(participants ? { participants } : {}),
  }

  const next: GameState = {
    ...state,
    studio: {
      ...state.studio,
      cash,
      activeProductions: [...state.studio.activeProductions, production],
    },
    ledger: [...state.ledger, ...ledgerAdds],
  }
  const greenlightEvents = injectedEvents ?? studioEventSinkFor(state)
  const withOperations =
    state.operations.mode === 'managed'
      ? {
          ...next,
          operations: addManagedProductionWorkflow(
            state.operations,
            production,
            new Set([
              ...scriptOccupiedFacilitySlots(state.scriptDevelopment),
              ...castingOccupiedFacilitySlots(state.castingSessions),
              // C2a-M2: the scenery crews the sets root is holding. A greenlight
              // opens in Development and takes no scenery slot, so this changes
              // nothing today — it is passed because the allocator's occupancy
              // view must be the same view everywhere, not the view that happens
              // to matter at one call site.
              ...setOccupiedFacilitySlots(
                state.sets,
                state.operations,
                state.scriptDevelopment,
                state.castingSessions,
              ),
            ]),
            greenlightEvents,
            // ── THE MARKER (charter §3.1) ────────────────────────────────────
            //
            // "The requirement binds only productions greenlit in managed mode at
            // V14+; legacy/headless untouched; migrated in-flight grandfathered;
            // DIRECTLY-CONSTRUCTED TEST STATES UNTOUCHED."
            //
            // Three of those four are already true by construction — a legacy or
            // headless studio never reaches this call at all, and a migrated
            // in-flight workflow keeps the `false` its migration gave it. The
            // fourth needs a fact, and `nextSetId` is that fact: it counts the
            // sets this world has EVER minted, and it is > 0 for every studio
            // founded through `activateStudioOperations` (2, the endowment) and
            // for every managed save the V14 migrator has lifted (also 2).
            //
            // ZERO means no set has ever existed in this world — a state assembled
            // field by field rather than founded — and a picture cannot be
            // required to stand on a kind of thing its world has never had. The
            // moment such a world commissions its very first set, the counter
            // moves and every greenlight after it binds.
            state.nextSetId > 0,
          ),
          // An INJECTED sink belongs to the tick and is committed once, at the end
          // of the advance, with every other row of the week.
          studioEvents:
            injectedEvents === undefined
              ? commitStudioEvents(state.studioEvents, greenlightEvents, state.market.tick)
              : state.studioEvents,
        }
      : next
  return scriptProject === undefined
    ? withOperations
    : {
        ...withOperations,
        scriptDevelopment: linkScriptProjectToProduction(
          state.scriptDevelopment,
          scriptProject.id,
          production.id,
        ),
      }
}

// ── cancel (M15) ─────────────────────────────────────────────────────────────
// Valid only for a production in activeProductions (else throw). Remove it. No
// refund (cash unchanged), no standing effect.
function applyCancel(state: GameState, action: Action & { kind: 'cancel' }): GameState {
  const idx = state.studio.activeProductions.findIndex((pr) => pr.id === action.productionId)
  if (idx === -1) {
    throw new Error(
      `applyActions: cancel references productionId "${action.productionId}" not in activeProductions`,
    )
  }
  const scriptDevelopment =
    state.scriptDevelopment.mode === 'managed'
      ? returnScriptProjectToReady(state.scriptDevelopment, action.productionId)
      : state.scriptDevelopment
  return {
    ...state,
    studio: {
      ...state.studio,
      activeProductions: state.studio.activeProductions.filter(
        (pr) => pr.id !== action.productionId,
      ),
    },
    operations: removeManagedProductionWorkflow(state.operations, action.productionId),
    scriptDevelopment,
  }
}

// ── createTalent (§10 / D-9.14 creation budget) ──────────────────────────────
// Validate: age ∈ [18,70]; role is a valid CreativeRole; workEthic ∈ [1,99];
// potentialTier valid; the creation BUDGET is not overspent (loud reject, M16).
// Then construct the full D-9 talent deterministically from the authored input +
// seed + talent id: starting skills near AUTHORED_START_OVR (biased by skillBias),
// ceilings from the tier band, workEthic exactly as chosen, fame = AUTHORED_START_FAME.
// perceived = actual at creation (skills AND persona). The player NEVER sets skills
// or fame directly.

const POTENTIAL_TIERS: readonly PotentialTier[] = [
  'Limited',
  'Steady',
  'Promising',
  'HighUpside',
  'ExceptionalUpside',
  'GenerationalUpside',
] as const

const iround = (x: number): number => Math.round(x)

// Total creation-budget cost (D-9.14). Rejected loudly if > AUTHORED_BUDGET.
function authoredTotalCost(a: AuthoredTalentInput): number {
  const tierCost = AUTHORED_TIER_COST[a.potentialTier]
  const weCost = TUNING.AUTHORED_WE_COST * (a.workEthic / 99)
  const biasCost = a.skillBias ? TUNING.AUTHORED_BIAS_COST * a.skillBias.magnitude : 0
  const secondaryCost = a.secondaryDiscipline ? TUNING.AUTHORED_SECONDARY_COST : 0
  return tierCost + weCost + biasCost + secondaryCost
}

// Build a discipline's authored actual skills around a center, applying skillBias
// (spike one skill, sag the rest) when it targets this discipline. perceived = actual.
function buildAuthoredDisciplineSkills(
  discipline: Discipline,
  center: number,
  bias: SkillBias | undefined,
): DisciplineSkills {
  const keys = SKILL_ORDER[discipline]
  const out: DisciplineSkills = {}
  // Bias magnitude scales the spread: a sharp specialist spikes ~+25, sags ~−12.
  const spike = bias && bias.discipline === discipline ? 25 * bias.magnitude : 0
  const sag = bias && bias.discipline === discipline ? 12 * bias.magnitude : 0
  const spikeIdx = bias && bias.discipline === discipline ? clamp(bias.skillIndex, 0, 5) : -1
  for (let i = 0; i < keys.length; i++) {
    let v = center
    if (spikeIdx >= 0) v += i === spikeIdx ? spike : -sag
    const a = clamp(iround(v), 1, 99)
    out[keys[i]!] = { actual: a, perceived: a } // perceived = actual at creation
  }
  return out
}

// Distribute a target ceiling-OVR into per-skill ceilings around it (respecting
// skillBias), jittered by AUTHORED_CEILING_JITTER, floored at current actual, ≤99.
function buildAuthoredDisciplineCeilings(
  discipline: Discipline,
  skills: DisciplineSkills,
  ceilingOVRTarget: number,
  bias: SkillBias | undefined,
  jitterS: RngStream,
): Record<string, number> {
  const keys = SKILL_ORDER[discipline]
  const rec: Record<string, number> = {}
  const spikeIdx = bias && bias.discipline === discipline ? clamp(bias.skillIndex, 0, 5) : -1
  const spike = bias && bias.discipline === discipline ? 6 * bias.magnitude : 0
  for (let i = 0; i < keys.length; i++) {
    const a = skills[keys[i]!]!.actual
    let target = ceilingOVRTarget + (i === spikeIdx ? spike : 0)
    target += jitterS.uniform(-TUNING.AUTHORED_CEILING_JITTER, TUNING.AUTHORED_CEILING_JITTER)
    rec[keys[i]!] = clamp(iround(target), a, 99)
  }
  return rec
}

// Full D-9.14 authored talent construction (deterministic given input + seed + id).
function constructAuthoredTalent(
  a: AuthoredTalentInput,
  id: string,
  seed: string,
): Talent {
  const s = stream(seed, 'worldgen', `authored-${id}`)
  const primary = ROLE_TO_DISCIPLINE[a.role]
  const secondary = a.secondaryDiscipline ? ROLE_TO_DISCIPLINE[a.secondaryDiscipline] : null

  // Ceiling-OVR target drawn from the tier band (the range shown to the player).
  const tierRange = AUTHORED_TIER_RANGE[a.potentialTier]
  const ceilingOVRTarget = s.uniform(tierRange[0], tierRange[1])

  // Starting skills: primary near AUTHORED_START_OVR (biased); secondary near
  // start − penalty; the rest weak at start − a larger penalty (so authored talent
  // is not a superstar). perceived = actual.
  const skills = {} as SkillProfiles
  for (const d of DISCIPLINE_ORDER) {
    let center: number
    if (d === primary) center = AUTHORED_START_OVR
    else if (d === secondary) center = AUTHORED_START_OVR - TUNING.AUTHORED_SECONDARY_PENALTY
    else center = TUNING.GEN_WEAK_MEAN - 4 // weak, well below primary
    skills[d] = buildAuthoredDisciplineSkills(d, center, a.skillBias)
  }

  // Ceilings: primary from the tier band; secondary one-tier-lower band feel via a
  // reduced target; weak disciplines get a low target. Floored at current actual.
  const ceilings = {} as Ceilings
  for (const d of DISCIPLINE_ORDER) {
    let target: number
    if (d === primary) target = ceilingOVRTarget
    else if (d === secondary) target = Math.max(AUTHORED_START_OVR, ceilingOVRTarget - 15)
    else target = TUNING.GEN_WEAK_MEAN
    ceilings[d] = buildAuthoredDisciplineCeilings(d, skills[d], target, a.skillBias, s)
  }

  // Work ethic = the chosen number exactly (visible, no jitter).
  const workEthic = clamp(iround(a.workEthic), 1, 99)

  // Dev rates: independent per-discipline uniform draws (as generation).
  const devRate = {} as DevRates
  for (const d of DISCIPLINE_ORDER) {
    devRate[d] = clamp(
      s.uniform(TUNING.DEV_RATE_MIN, TUNING.DEV_RATE_MAX),
      TUNING.DEV_RATE_MIN,
      TUNING.DEV_RATE_MAX,
    )
  }

  // Genre experience: authored talent starts blank (no career yet) — all zeros.
  const genreExperience = {} as GenreExperience
  for (const d of DISCIPLINE_ORDER) {
    const g = {} as Record<Genre, { actual: number; perceived: number }>
    for (const genre of GENRE_ORDER) g[genre] = { actual: 0, perceived: 0 }
    genreExperience[d] = g
  }

  const workHistory = {} as WorkHistory
  for (const d of DISCIPLINE_ORDER) workHistory[d] = 0

  const t: Talent = {
    id,
    name: a.name,
    role: a.role,
    age: a.age,
    actual: { ...a.actual },
    perceived: { ...a.actual }, // temperament perceived = actual (§10)
    fame: TUNING.AUTHORED_START_FAME,
    salary: 0, // set below
    authored: true,
    skills,
    ceilings,
    devRate,
    workEthic,
    genreExperience,
    workHistory,
    skill: 0, // set below
  }
  t.skill = roleOVR(t, primary) // legacy proxy = primary perceived OVR
  t.salary = salaryCurve(t)
  return t
}

function applyCreateTalent(state: GameState, action: Action & { kind: 'createTalent' }): GameState {
  const a = action.talent

  // Validation: age in [18,70].
  if (a.age < 18 || a.age > 70) {
    throw new Error(`applyActions: createTalent age ${a.age} out of range [18, 70]`)
  }
  // Validation: role is a valid CreativeRole.
  if (!CREATIVE_ROLES.includes(a.role)) {
    throw new Error(`applyActions: createTalent role "${a.role}" is not a valid CreativeRole`)
  }
  // Validation: workEthic ∈ [1,99].
  if (!Number.isFinite(a.workEthic) || a.workEthic < 1 || a.workEthic > 99) {
    throw new Error(`applyActions: createTalent workEthic ${a.workEthic} out of range [1, 99]`)
  }
  // Validation: potentialTier is a valid tier.
  if (!POTENTIAL_TIERS.includes(a.potentialTier)) {
    throw new Error(`applyActions: createTalent potentialTier "${a.potentialTier}" is not valid`)
  }
  // Validation: skillBias magnitude ∈ [0,1] and skillIndex ∈ [0,5] when present.
  if (a.skillBias) {
    if (a.skillBias.magnitude < 0 || a.skillBias.magnitude > 1) {
      throw new Error(
        `applyActions: createTalent skillBias.magnitude ${a.skillBias.magnitude} out of range [0, 1]`,
      )
    }
    if (
      !Number.isInteger(a.skillBias.skillIndex) ||
      a.skillBias.skillIndex < 0 ||
      a.skillBias.skillIndex > 5
    ) {
      throw new Error(
        `applyActions: createTalent skillBias.skillIndex ${a.skillBias.skillIndex} out of range [0, 5]`,
      )
    }
  }
  // Validation: secondaryDiscipline is a valid CreativeRole when present.
  if (a.secondaryDiscipline !== undefined && !CREATIVE_ROLES.includes(a.secondaryDiscipline)) {
    throw new Error(
      `applyActions: createTalent secondaryDiscipline "${a.secondaryDiscipline}" is not a valid CreativeRole`,
    )
  }

  // D-9.14 budget: reject loudly if the request overspends the creation pool.
  const totalCost = authoredTotalCost(a)
  if (totalCost > TUNING.AUTHORED_BUDGET) {
    throw new Error(
      `applyActions: createTalent over budget — total cost ${totalCost.toFixed(2)} > AUTHORED_BUDGET ${TUNING.AUTHORED_BUDGET} ` +
        `(tier=${a.potentialTier}, workEthic=${a.workEthic}, bias=${a.skillBias ? a.skillBias.magnitude : 0}, secondary=${a.secondaryDiscipline ?? 'none'})`,
    )
  }

  const id = authoredTalentId(state.talent)
  const talent = constructAuthoredTalent(a, id, state.seed)
  return withCreatedTalent(state, talent)
}

// D-11.A — place a freshly-created talent into the industry WITHOUT auto-employing
// them (owner: "must not automatically become a free employee"). During founding →
// the founding applicant pool (signable under recruitment-fund rules, countable toward
// the minimum once signed). During operations → a Free Agent (signable via the Hiring
// Market). Idempotent (dedupe guard) so repeated confirm/back-nav never duplicates.
function withCreatedTalent(state: GameState, talent: Talent): GameState {
  const base: GameState = { ...state, talent: [...state.talent, talent] }
  if (state.founding !== null) {
    const applicantIds = state.founding.applicantIds.includes(talent.id)
      ? state.founding.applicantIds
      : [...state.founding.applicantIds, talent.id]
    return { ...base, founding: { ...state.founding, applicantIds } }
  }
  const freeAgents = state.freeAgents.includes(talent.id)
    ? state.freeAgents
    : [...state.freeAgents, talent.id]
  return { ...base, freeAgents }
}

// ── §10 / D-11.A createCustomTalent (Full Custom) ────────────────────────────
// Build a Talent from the player's DIRECT authoritative edits (no creation budget).
// perceived = actual (persona AND skills). Every value is clamped to its authoritative
// bound (defensive; the UI validates too). Ceilings default to the skill value (no
// hidden upside) unless supplied; genre experience defaults to 0. devRate is a neutral
// deterministic draw. Legacy `skill` = primary perceived OVR. OVR is NOT an input.
function constructCustomTalent(a: CustomTalentInput, id: string, seed: string): Talent {
  const primary = ROLE_TO_DISCIPLINE[a.role]
  const s = stream(seed, 'worldgen', `custom-${id}`)

  const skills = {} as SkillProfiles
  const ceilings = {} as Ceilings
  for (const d of DISCIPLINE_ORDER) {
    const keys = SKILL_ORDER[d]
    const skillVals = a.skills[d] ?? []
    const ceilVals = a.ceilings?.[d]
    const ds: DisciplineSkills = {}
    const dc: Record<string, number> = {}
    for (let i = 0; i < keys.length; i++) {
      const v = clamp(iround(Number(skillVals[i] ?? 1)), 1, 99)
      ds[keys[i]!] = { actual: v, perceived: v } // perceived = actual at creation
      const rawCeil = ceilVals?.[i]
      const c = rawCeil === undefined ? v : clamp(iround(Number(rawCeil)), v, 99)
      dc[keys[i]!] = c
    }
    skills[d] = ds
    ceilings[d] = dc
  }

  // Dev rates: neutral deterministic per-discipline draws (independent of skills).
  const devRate = {} as DevRates
  for (const d of DISCIPLINE_ORDER) {
    devRate[d] = clamp(s.uniform(TUNING.DEV_RATE_MIN, TUNING.DEV_RATE_MAX), TUNING.DEV_RATE_MIN, TUNING.DEV_RATE_MAX)
  }

  // Genre experience: from the input where supplied (perceived = actual), else 0.
  const genreExperience = {} as GenreExperience
  for (const d of DISCIPLINE_ORDER) {
    const rec = {} as Record<Genre, { actual: number; perceived: number }>
    const supplied = a.genreExperience?.[d]
    for (const g of GENRE_ORDER) {
      const v = clamp(iround(Number(supplied?.[g] ?? 0)), 0, 100)
      rec[g] = { actual: v, perceived: v }
    }
    genreExperience[d] = rec
  }

  const workHistory = {} as WorkHistory
  for (const d of DISCIPLINE_ORDER) workHistory[d] = 0

  const t: Talent = {
    id,
    name: a.name,
    role: a.role,
    age: clamp(iround(a.age), 18, 70),
    actual: { ...a.actual },
    perceived: { ...a.actual },
    fame: clamp(a.fame, 0, 100),
    salary: 0, // set below
    authored: true,
    skills,
    ceilings,
    devRate,
    workEthic: clamp(iround(a.workEthic), 1, 99),
    genreExperience,
    workHistory,
    skill: 0, // set below
  }
  t.skill = roleOVR(t, primary)
  t.salary = salaryCurve(t)
  return t
}

// Build a PREVIEW Talent from a Full-Custom input WITHOUT mutating state — for the
// creator's live OVR / salary / contract-offer preview (D-11.A A3). id is a stable
// placeholder so the preview offer's per-talent jitter is deterministic.
export function previewCustomTalent(input: CustomTalentInput, seed: string): Talent {
  return constructCustomTalent(input, 'authored-preview', seed)
}

function applyCreateCustomTalent(state: GameState, action: Action & { kind: 'createCustomTalent' }): GameState {
  const a = action.talent
  if (typeof a.name !== 'string' || a.name.trim() === '') {
    throw new Error('applyActions: createCustomTalent requires a non-empty name')
  }
  if (!CREATIVE_ROLES.includes(a.role)) {
    throw new Error(`applyActions: createCustomTalent role "${a.role}" is not a valid CreativeRole`)
  }
  if (!Number.isFinite(a.age) || a.age < 18 || a.age > 70) {
    throw new Error(`applyActions: createCustomTalent age ${a.age} out of range [18, 70]`)
  }
  if (!Number.isFinite(a.workEthic) || a.workEthic < 1 || a.workEthic > 99) {
    throw new Error(`applyActions: createCustomTalent workEthic ${a.workEthic} out of range [1, 99]`)
  }
  if (!Number.isFinite(a.fame) || a.fame < 0 || a.fame > 100) {
    throw new Error(`applyActions: createCustomTalent fame ${a.fame} out of range [0, 100]`)
  }
  for (const d of DISCIPLINE_ORDER) {
    const vals = a.skills[d]
    if (!Array.isArray(vals) || vals.length !== SKILL_ORDER[d].length) {
      throw new Error(`applyActions: createCustomTalent skills.${d} must be ${SKILL_ORDER[d].length} values`)
    }
    for (const v of vals) {
      if (!Number.isFinite(v)) {
        throw new Error(`applyActions: createCustomTalent skills.${d} contains a non-finite value`)
      }
    }
  }
  const id = authoredTalentId(state.talent)
  const talent = constructCustomTalent(a, id, state.seed)
  return withCreatedTalent(state, talent)
}

// ── §10 / D-11.C createBalancedTalent (Balanced specialization) ──────────────
// Baseline: every skill starts at the floor; the archetype preset shapes the primary
// discipline (OVR ≈ 38–45) + a secondary baseline (+ an adjacent multi-hyphenate boost)
// + a small primary-genre baseline. The player's 40-point allocation then adds +1 per
// authoritative skill/genre point (bounds-checked). Ceilings from the chosen tier;
// workEthic as chosen; fame from the preset. perceived = actual. OVR is DERIVED.

// Adjacent discipline for a multi-hyphenate boost when the boost role's discipline equals
// the primary (so the boost always lands on a DIFFERENT discipline).
export const ADJACENT_DISCIPLINE: Record<Discipline, Discipline> = {
  acting: 'directing',
  writing: 'directing',
  directing: 'writing',
  craft: 'directing',
}

// The discipline a preset's multi-hyphenate secondary boost actually lands on: the boost
// role's discipline, remapped to the ADJACENT discipline when it would collide with the
// primary (so the boost is always a DIFFERENT, genuinely-secondary discipline). Null when
// the preset has no secondary boost. SINGLE SOURCE OF TRUTH shared by the engine
// (constructBalancedTalent) and the creator UI baseline display, so the two cannot diverge.
export function balancedBoostDiscipline(preset: ArchetypePreset, primary: Discipline): Discipline | null {
  if (!preset.secondaryBoost) return null
  const d = ROLE_TO_DISCIPLINE[preset.secondaryBoost.role]
  return d === primary ? ADJACENT_DISCIPLINE[primary] : d
}

function findArchetype(presetId: string) {
  const p = BALANCED_ARCHETYPES.find((x) => x.id === presetId)
  if (p === undefined) throw new Error(`applyActions: createBalancedTalent unknown presetId "${presetId}"`)
  return p
}

// Total specialization points requested across skills + genre.
function balancedAllocationTotal(a: BalancedTalentInput): number {
  let total = 0
  const sk = a.allocation.skills
  if (sk) for (const d of DISCIPLINE_ORDER) for (const v of sk[d] ?? []) total += v
  const ge = a.allocation.genre
  if (ge) {
    for (const d of DISCIPLINE_ORDER) {
      const row = ge[d]
      if (row) for (const g of GENRE_ORDER) total += row[g] ?? 0
    }
  }
  return total
}

function constructBalancedTalent(a: BalancedTalentInput, id: string, seed: string): Talent {
  const preset = findArchetype(a.presetId)
  const primary = ROLE_TO_DISCIPLINE[a.role]
  const s = stream(seed, 'worldgen', `balanced-${id}`)
  const floor = TUNING.BALANCED_CREATOR_SKILL_FLOOR

  // 1–4. Baseline skill vectors per discipline (floor → preset primary → secondary
  // baseline → optional adjacent multi-hyphenate boost).
  const vec: Record<Discipline, number[]> = {
    acting: new Array(6).fill(floor),
    writing: new Array(6).fill(floor),
    directing: new Array(6).fill(floor),
    craft: new Array(6).fill(floor),
  }
  for (const d of DISCIPLINE_ORDER) {
    if (d === primary) vec[d] = preset.primarySkills.map((v) => Math.max(floor, v))
    else vec[d] = new Array(6).fill(Math.max(floor, preset.secondaryBaseline))
  }
  const boostD = balancedBoostDiscipline(preset, primary)
  if (boostD && preset.secondaryBoost) {
    vec[boostD] = preset.secondaryBoost.skills.map((v) => Math.max(floor, v))
  }

  // 5. Apply the specialization allocation to skills (+1 per point; clamp 1..99).
  const skAlloc = a.allocation.skills
  if (skAlloc) {
    for (const d of DISCIPLINE_ORDER) {
      const incs = skAlloc[d]
      if (!incs) continue
      for (let i = 0; i < 6; i++) vec[d][i] = clamp(vec[d]![i]! + Math.max(0, iround(incs[i] ?? 0)), 1, 99)
    }
  }

  // Build SkillProfiles (perceived = actual).
  const skills = {} as SkillProfiles
  for (const d of DISCIPLINE_ORDER) {
    const keys = SKILL_ORDER[d]
    const ds: DisciplineSkills = {}
    for (let i = 0; i < keys.length; i++) {
      const v = clamp(iround(vec[d]![i]!), 1, 99)
      ds[keys[i]!] = { actual: v, perceived: v }
    }
    skills[d] = ds
  }

  // 6. Genre experience: preset primary baseline + allocation increments (perceived = actual).
  const genreAlloc = a.allocation.genre
  const genreExperience = {} as GenreExperience
  for (const d of DISCIPLINE_ORDER) {
    const rec = {} as Record<Genre, { actual: number; perceived: number }>
    for (const g of GENRE_ORDER) {
      const baseline = d === primary ? preset.genreBaseline[g] ?? 0 : 0
      const inc = genreAlloc?.[d]?.[g] ?? 0
      const v = clamp(iround(baseline + Math.max(0, inc)), 0, 100)
      rec[g] = { actual: v, perceived: v }
    }
    genreExperience[d] = rec
  }

  // 7. Ceilings from the chosen tier (primary from the tier band; others lower), floored
  //    at the current actual — reuses the authored ceiling curve.
  const tierRange = AUTHORED_TIER_RANGE[a.potentialTier]
  const ceilingOVRTarget = s.uniform(tierRange[0], tierRange[1])
  const ceilings = {} as Ceilings
  for (const d of DISCIPLINE_ORDER) {
    const target = d === primary ? ceilingOVRTarget : Math.max(TUNING.GEN_WEAK_MEAN, ceilingOVRTarget - 20)
    ceilings[d] = buildAuthoredDisciplineCeilings(d, skills[d], target, undefined, s)
  }

  // 8. Dev rates (deterministic), workEthic (chosen), fame (from preset).
  const devRate = {} as DevRates
  for (const d of DISCIPLINE_ORDER) {
    devRate[d] = clamp(s.uniform(TUNING.DEV_RATE_MIN, TUNING.DEV_RATE_MAX), TUNING.DEV_RATE_MIN, TUNING.DEV_RATE_MAX)
  }
  const workHistory = {} as WorkHistory
  for (const d of DISCIPLINE_ORDER) workHistory[d] = 0

  const t: Talent = {
    id,
    name: a.name,
    role: a.role,
    age: clamp(iround(a.age), 18, 70),
    actual: { ...a.actual },
    perceived: { ...a.actual },
    fame: clamp(preset.fame, 0, 100),
    salary: 0,
    authored: true,
    skills,
    ceilings,
    devRate,
    workEthic: clamp(iround(a.workEthic), 1, 99),
    genreExperience,
    workHistory,
    skill: 0,
  }
  t.skill = roleOVR(t, primary)
  t.salary = salaryCurve(t)
  return t
}

// Preview a Balanced-Career talent WITHOUT mutating state (live OVR/salary/contract).
export function previewBalancedTalent(input: BalancedTalentInput, seed: string): Talent {
  return constructBalancedTalent(input, 'authored-preview', seed)
}

function applyCreateBalancedTalent(state: GameState, action: Action & { kind: 'createBalancedTalent' }): GameState {
  const a = action.talent
  if (typeof a.name !== 'string' || a.name.trim() === '') {
    throw new Error('applyActions: createBalancedTalent requires a non-empty name')
  }
  if (!CREATIVE_ROLES.includes(a.role)) {
    throw new Error(`applyActions: createBalancedTalent role "${a.role}" is not a valid CreativeRole`)
  }
  if (!Number.isFinite(a.age) || a.age < 18 || a.age > 70) {
    throw new Error(`applyActions: createBalancedTalent age ${a.age} out of range [18, 70]`)
  }
  if (!Number.isFinite(a.workEthic) || a.workEthic < 1 || a.workEthic > 99) {
    throw new Error(`applyActions: createBalancedTalent workEthic ${a.workEthic} out of range [1, 99]`)
  }
  if (!POTENTIAL_TIERS.includes(a.potentialTier)) {
    throw new Error(`applyActions: createBalancedTalent potentialTier "${a.potentialTier}" is not valid`)
  }
  findArchetype(a.presetId) // throws on unknown preset
  // Validate the specialization allocation: non-negative finite integers, total ≤ budget.
  const sk = a.allocation.skills
  if (sk) {
    for (const d of DISCIPLINE_ORDER) {
      const incs = sk[d]
      if (incs === undefined) continue
      if (!Array.isArray(incs) || incs.length !== 6) {
        throw new Error(`applyActions: createBalancedTalent allocation.skills.${d} must be 6 values`)
      }
      for (const v of incs) {
        if (!Number.isFinite(v) || v < 0 || !Number.isInteger(v)) {
          throw new Error(`applyActions: createBalancedTalent allocation.skills.${d} must be non-negative integers`)
        }
      }
    }
  }
  const ge = a.allocation.genre
  if (ge) {
    for (const d of DISCIPLINE_ORDER) {
      const row = ge[d]
      if (row === undefined) continue
      for (const g of GENRE_ORDER) {
        const v = row[g]
        if (v === undefined) continue
        if (!Number.isFinite(v) || v < 0 || !Number.isInteger(v)) {
          throw new Error(`applyActions: createBalancedTalent allocation.genre.${d}.${g} must be a non-negative integer`)
        }
      }
    }
  }
  const total = balancedAllocationTotal(a)
  if (total > TUNING.BALANCED_CREATOR_SPECIALIZATION_POINTS) {
    throw new Error(
      `applyActions: createBalancedTalent allocation ${total} exceeds ${TUNING.BALANCED_CREATOR_SPECIALIZATION_POINTS} specialization points`,
    )
  }
  const id = authoredTalentId(state.talent)
  const talent = constructBalancedTalent(a, id, state.seed)
  return withCreatedTalent(state, talent)
}

// ── D-11 foundStudio — close the founding draft ──────────────────────────────
// Valid only during a founding draft with every required-discipline minimum met.
function applyFoundStudio(state: GameState, _action: Action & { kind: 'foundStudio' }): GameState {
  if (state.founding === null) {
    throw new Error('applyActions: foundStudio rejected — no founding draft is open (D-11.2)')
  }
  if (!foundingMinimumsMet(state)) {
    const gaps = foundingGaps(state)
    throw new Error(
      `applyActions: foundStudio rejected — required roster incomplete (missing actors:${gaps.actor} directors:${gaps.director} writers:${gaps.writer} craft:${gaps.craft}) (D-11.2)`,
    )
  }
  return { ...state, founding: null }
}

// ── Production Operations V1 actions ────────────────────────────────────────
function applyActivateStudioOperations(
  state: GameState,
  _action: Action & { kind: 'activateStudioOperations' },
): GameState {
  // Activation changes construction authority from legacy-empty to the one
  // managed parcel registry plus a managed (empty) placement root. Validate the
  // complete pre-transition boundary first so a forged legacy capex row, cash
  // divergence, or malformed sibling workflow cannot be laundered into an
  // apparently vacant managed state.
  assertStudioPlacementInvariants(state)
  if (state.operations.mode !== 'legacy') {
    throw new Error('applyActions: activateStudioOperations rejected — studio operations are already managed')
  }
  if (state.operations.facilities.length !== 0 || state.operations.workflows.length !== 0) {
    throw new Error(
      'applyActions: activateStudioOperations rejected — legacy operations state is not an empty slate',
    )
  }
  if (
    state.construction.mode !== 'legacy' ||
    state.construction.parcels.length !== 0 ||
    state.construction.projects.length !== 0
  ) {
    throw new Error(
      'applyActions: activateStudioOperations rejected — legacy construction state is not an empty slate',
    )
  }
  if (state.placement.mode !== 'legacy' || state.placement.facilities.length !== 0) {
    throw new Error(
      'applyActions: activateStudioOperations rejected — legacy placement state is not an empty slate',
    )
  }
  if (!economyEngaged(state)) {
    throw new Error(
      'applyActions: activateStudioOperations rejected — the studio economy is not engaged',
    )
  }
  if (state.founding !== null) {
    throw new Error(
      'applyActions: activateStudioOperations rejected — the studio is still in its founding draft',
    )
  }
  if (state.studio.activeProductions.length !== 0) {
    throw new Error(
      'applyActions: activateStudioOperations rejected — the active production slate is not empty',
    )
  }
  if (state.sets.length !== 0 || state.nextSetId !== 0) {
    throw new Error(
      'applyActions: activateStudioOperations rejected — legacy set state is not an empty slate',
    )
  }
  return {
    ...state,
    operations: initialManagedStudioOperations(),
    construction: initialManagedStudioConstruction(),
    placement: initialManagedStudioPlacement(),
    // C2a-M1 (charter §3.1): the founding endowment — TWO generic house sets,
    // one mounted on each founding soundstage. Minted HERE alongside
    // INITIAL_STUDIO_FACILITIES and synthesized identically by `migrateToV14`
    // for managed-mode saves, so an activated studio and a migrated one are the
    // same studio. Ordinals 0 and 1 are consumed and never handed out again.
    sets: endowedHouseSets(),
    nextSetId: ENDOWED_NEXT_SET_ID,
  }
}

// ── Placement Core V12 actions ──────────────────────────────────────────────
//
// THE BOUNDARY, stated once because it is easy to get wrong: `queryPlacement`
// REPORTS illegality (a preview must never explode), and the pure
// `commitPlacement` helper returns the caller's state BY REFERENCE when the quote
// is not ok (a refused build is provably byte-neutral). The ACTION layer is
// different: like every other action in this file it THROWS on an illegal
// command, because an action is an assertion that the command was legal. The two
// are reconciled here — the action asks the same single query, throws with the
// quote's `primary` code when it is not ok, and otherwise delegates the mutation
// to the one commit implementation.
function rejectIllegalPlacement(
  state: GameState,
  actionName: string,
  request: PlacementRequest,
): GameState {
  // Reject malformed/stale state before deriving any transition, so a forged
  // capex row, cash divergence, or mismatched facility set cannot be laundered
  // into an apparently legal placement.
  assertStudioPlacementInvariants(state)
  if (!placementRegimeReady(state)) {
    throw new Error(
      `applyActions: ${actionName} rejected — placement requires managed operations, a founded studio, and an engaged economy`,
    )
  }
  const quote = queryPlacement(state, request)
  if (!quote.ok) {
    // The D-12 solvency gate keeps its exact player-facing reason; every domain
    // rejection reports its code and the full ordered rejection set.
    const affordability = canAfford(state, quote.cost)
    const detail =
      quote.primary === 'insufficientFunds' && !affordability.ok
        ? `${affordability.reason} (D-12 solvency gate)`
        : `${String(quote.primary)} (${quote.rejections.join(', ')})`
    throw new Error(`applyActions: ${actionName} rejected — ${detail}`)
  }
  const next = commitPlacement(state, request)
  if (next === state) {
    throw new Error(
      `applyActions: ${actionName} rejected — the commit refused a placement its own query accepted`,
    )
  }
  return next
}

function applyPlaceFacility(
  state: GameState,
  action: Action & { kind: 'placeFacility' },
): GameState {
  return rejectIllegalPlacement(state, 'placeFacility', action.placement)
}

/**
 * C1-M3a — the shared action-layer discipline for the two destructive verbs.
 *
 * Identical in shape to `rejectIllegalPlacement`: validate the whole state FIRST,
 * so a forged ledger or facility set cannot be laundered into an apparently legal
 * demolition; then ask the one refusal authority; then apply, and abort loudly if
 * the pure helper disagrees with the probe that just passed.
 *
 * The thrown message names the refusal CODE. The structured refusal is what the
 * UI should render (C1-M3b) — it reaches it through the exported probes, not by
 * parsing this string.
 */
function rejectRefusedMutation(
  state: GameState,
  actionName: string,
  refusal: PlacementMutationRefusal | null,
  apply: (state: GameState) => GameState,
): GameState {
  assertStudioPlacementInvariants(state)
  if (refusal !== null) {
    const detail =
      refusal.code === 'facilityEngaged'
        ? `${refusal.code} — "${refusal.facilityId}" is held by ${String(refusal.holders.length)} active engagement(s): ${refusal.holders
            .map((holder: FacilityEngagement) => `${holder.kind}:${holder.holderId}`)
            .join(', ')}`
        : refusal.code === 'illegalDestination'
          ? `${refusal.code} — ${String(refusal.quote.primary)} (${refusal.quote.rejections.join(', ')})`
          : refusal.code
    throw new Error(`applyActions: ${actionName} rejected — ${detail}`)
  }
  const next = apply(state)
  if (next === state) {
    throw new Error(
      `applyActions: ${actionName} rejected — the helper refused a mutation its own probe accepted`,
    )
  }
  return next
}

function applyMoveFacility(
  state: GameState,
  action: Action & { kind: 'moveFacility' },
): GameState {
  return rejectRefusedMutation(
    state,
    'moveFacility',
    facilityMoveRefusal(state, action.move),
    (current) => moveFacility(current, action.move),
  )
}

function applyDemolishFacility(
  state: GameState,
  action: Action & { kind: 'demolishFacility' },
): GameState {
  return rejectRefusedMutation(
    state,
    'demolishFacility',
    facilityDemolitionRefusal(state, action.demolition),
    (current) => demolishFacility(current, action.demolition),
  )
}

// The retained V11 action, now an ALIAS: it commits the Annex blueprint at the
// legacy expansion parcel's origin. There is exactly one Annex law in V12 and one
// implementation of it; this action is the shortcut a surface that already knows
// where the Annex goes can keep calling.
function applyStartDevelopmentCastingAnnex(
  state: GameState,
  _action: Action & { kind: 'startDevelopmentCastingAnnex' },
): GameState {
  const identityCollision = annexCanonicalProductionIdCollision(state)
  if (identityCollision !== null) {
    throw new Error(
      `applyActions: startDevelopmentCastingAnnex rejected — canonical Annex id ${JSON.stringify(identityCollision)} is already reserved by persisted production history`,
    )
  }
  return rejectIllegalPlacement(
    state,
    'startDevelopmentCastingAnnex',
    legacyAnnexPlacementRequest(propertyOf(state)),
  )
}

// ── C2a-M2 — the three Set verbs (charter §3.1) ─────────────────────────────
//
// Identical in shape to the placement verbs: validate the state FIRST so a forged
// ledger cannot launder an apparently legal build, then ask the ONE refusal
// authority, then apply — and abort loudly if the pure helper disagrees with the
// probe that just passed.
//
// The thrown message carries the refusal's own PLAYER SENTENCE, not a code. A set
// refusal is a thing a producer would say out loud ("Stage 7 already has the
// Graveyard on it — strike it first"), and it is the same sentence a surface
// renders, because a second copy of that sentence is a second chance to lie.
function rejectRefusedSetVerb(
  state: GameState,
  actionName: string,
  copy: SetRefusalCopy | null,
  apply: (state: GameState) => GameState,
): GameState {
  assertStudioPlacementInvariants(state)
  assertSetsInvariants(state)
  if (copy !== null) {
    throw new Error(`applyActions: ${actionName} rejected — ${copy.reason} ${copy.remedy}`)
  }
  const next = apply(state)
  if (next === state) {
    throw new Error(
      `applyActions: ${actionName} rejected — the helper refused a set verb its own probe accepted`,
    )
  }
  assertSetsInvariants(next)
  return next
}

function applyCommissionSet(
  state: GameState,
  action: Action & { kind: 'commissionSet' },
): GameState {
  // The SOLVENCY gate, not a bare cash comparison: a set is capital spending and
  // goes through the same D-12 gate every other capital verb does.
  const refusal = commissionSetRefusal(
    state,
    action.commission,
    (cost) => canAfford(state, cost).ok,
  )
  const stage = state.operations.facilities.find(
    (facility) => facility.id === action.commission.stageFacilityId,
  )
  return rejectRefusedSetVerb(
    state,
    'commissionSet',
    refusal === null
      ? null
      : setCommissionRefusalCopy(refusal, {
          ...(stage === undefined ? {} : { stageName: stage.name }),
        }),
    (current) => commissionSet(current, action.commission),
  )
}

function applyRepairSet(state: GameState, action: Action & { kind: 'repairSet' }): GameState {
  const refusal = repairSetRefusal(state, action.setId, (cost) => canAfford(state, cost).ok)
  const set = setById(state.sets, action.setId)
  return rejectRefusedSetVerb(
    state,
    'repairSet',
    refusal === null
      ? null
      : setRepairRefusalCopy(refusal, { ...(set === null ? {} : { setName: set.name }) }),
    (current) => repairSet(current, action.setId),
  )
}

function applyStrikeSet(state: GameState, action: Action & { kind: 'strikeSet' }): GameState {
  const refusal = strikeSetRefusal(state, action.setId)
  const set = setById(state.sets, action.setId)
  return rejectRefusedSetVerb(
    state,
    'strikeSet',
    refusal === null
      ? null
      : setStrikeRefusalCopy(refusal, { ...(set === null ? {} : { setName: set.name }) }),
    (current) => {
      // A struck set is PERMANENT history: the stage is clear, the studio has its
      // money back, and the record of what stood there survives the strike.
      const events = studioEventSinkFor(current)
      const next = strikeSet(current, action.setId, events)
      if (next === current) return current
      return {
        ...next,
        studioEvents: commitStudioEvents(next.studioEvents, events, next.market.tick),
      }
    },
  )
}

function requireActiveProductionForOperations(
  state: GameState,
  productionId: string,
  actionName: string,
): Production {
  const production = state.studio.activeProductions.find((candidate) => candidate.id === productionId)
  if (production === undefined) {
    throw new Error(
      `applyActions: ${actionName} references productionId "${productionId}" not in activeProductions`,
    )
  }
  return production
}

// ── C2a-M1 — the studioEvents gate on the ACTION path (charter §5) ──────────
// The same gate `tick` applies, in the same words: a studio with no managed
// operations has no studio history, so a legacy or headless caller collects a
// sink that keeps nothing. Action rows are stamped with `market.tick`, the week
// the command was actually given.
function studioEventSinkFor(state: GameState): StudioEventSink {
  return state.operations.mode === 'managed'
    ? new StudioEventSink(state.market.tick, true)
    : disabledStudioEventSink()
}

// ── THE THREE FRONT DOORS (charter §3.3) ────────────────────────────────────
//
// C2a-M4. "When capacity is unavailable: QUEUE, DON'T MAGICALLY FORBID" (owner
// law 2). Greenlight-on-dev-slot, commission (pool AND original), and casting
// start stop being refusals and become ADMISSIONS: the intent joins
// `state.productionQueue` with its full payload, its ordinal and the week it
// started waiting, and it is committed later — by the inserted tick step — the
// week a slot is actually free.
//
// WHAT IS QUEUED AND WHAT IS STILL REFUSED. Exactly one refusal converts: the
// NAMED `QueueableCapacityRefusal` the three allocators throw when the shared
// Development & Casting slot is gone. An unknown concept, an uncontracted writer,
// a busy writer, an ineligible slate, an unaffordable picture — every one of those
// still throws at the door, because waiting cannot fix any of them, and a queue
// that swallows illegal intents is a queue that lies about what will happen.
//
// NOTHING IS HELD WHILE QUEUED. The commit closure runs first and is discarded
// whole on refusal: no cash moved, no talent locked, no concept minted, no
// ordinal burned, no reservation written. That is only true because every one of
// these functions is pure — the state that comes back is the state that went in.

/** Append an admitted intent and record the Tier-W row that says so. */
function admitToQueue(
  state: GameState,
  queue: readonly ProductionQueueEntry[],
): GameState {
  const admitted = queue[queue.length - 1]!
  const events = studioEventSinkFor(state)
  events.append({
    kind: 'queueAdmitted',
    entryKind: admitted.kind,
    ordinal: admitted.ordinal,
  })
  return {
    ...state,
    productionQueue: queue,
    studioEvents: commitStudioEvents(state.studioEvents, events, state.market.tick),
  }
}

/**
 * Commit the verb, or — if and only if the shared slot is what stopped it — admit
 * it to the queue.
 *
 * `allowQueue` is FALSE on the dequeue path: the queue's own commit must let a
 * capacity refusal propagate, or an intent that cannot start yet would clone
 * itself onto the back of the queue it is already at the head of.
 */
function admitOrQueue(
  state: GameState,
  commit: () => GameState,
  enqueue: (queue: readonly ProductionQueueEntry[]) => readonly ProductionQueueEntry[],
  allowQueue = true,
): GameState {
  try {
    return commit()
  } catch (error) {
    if (
      !allowQueue ||
      !(error instanceof QueueableCapacityRefusal) ||
      !queueingActive(state.operations)
    ) {
      throw error
    }
    return admitToQueue(state, enqueue(state.productionQueue))
  }
}

/**
 * CANCEL A QUEUED INTENT (§3.3's `cancel-queued-intent` remedy).
 *
 * The one queue verb the player owns. A queued intent holds nothing — no slot,
 * no cash, no talent, no minted concept — so taking it out of the line releases
 * nothing and refunds nothing; it simply stops waiting. Recorded as a Tier-W
 * `queueIntentExpired` row with the studio itself as the stated reason, because
 * the log's job is to say why something left the queue, and "we changed our
 * minds" is a reason.
 */
function applyCancelQueuedIntent(
  state: GameState,
  action: Action & { kind: 'cancelQueuedIntent' },
): GameState {
  const entry = state.productionQueue.find((candidate) => candidate.ordinal === action.ordinal)
  if (entry === undefined) {
    throw new Error(
      `applyActions: cancelQueuedIntent references ordinal ${String(action.ordinal)}, which is not in the queue`,
    )
  }
  const events = studioEventSinkFor(state)
  events.append({
    kind: 'queueIntentExpired',
    entryKind: entry.kind,
    ordinal: entry.ordinal,
    reason: 'the studio withdrew the request before it reached the front of the queue',
  })
  return {
    ...state,
    productionQueue: removeQueueEntry(state.productionQueue, entry.ordinal),
    studioEvents: commitStudioEvents(state.studioEvents, events, state.market.tick),
  }
}

/** What one dequeue attempt did: it started, it is still waiting, or it expired. */
export type QueuedIntentOutcome =
  | { outcome: 'granted'; state: GameState }
  | { outcome: 'waiting' }
  | { outcome: 'expired'; reason: string }

/**
 * THE DEQUEUE COMMIT (§3.3) — the same verb, asked again.
 *
 * Revalidation is not a second copy of the front door's legality rules; it is the
 * front door's own commit, run against the state of THIS week. Whatever the
 * engine refuses, the intent expires on, and the engine's own sentence becomes
 * the `queueIntentExpired` row's stated reason. There is exactly one
 * implementation of every one of these verbs, which is the only way a queued
 * picture and a played picture can be the same picture.
 *
 * `week` is the week that has ARRIVED — the advance is already past this week's
 * script and casting completions, so an intent granted here is stamped with the
 * week the player will see it start in, not the week it was still waiting.
 */
export function commitQueuedIntent(
  state: GameState,
  entry: ProductionQueueEntry,
  week: number,
  events: StudioEventSink,
): QueuedIntentOutcome {
  try {
    switch (entry.kind) {
      case 'commissionScript':
        return {
          outcome: 'granted',
          state: applyCommissionScript(
            state,
            { kind: 'commissionScript', project: entry.payload },
            week,
            false,
          ),
        }
      case 'commissionOriginalScreenplay':
        return {
          outcome: 'granted',
          state: applyCommissionOriginalScreenplay(
            state,
            { kind: 'commissionOriginalScreenplay', screenplay: entry.payload },
            week,
            false,
          ),
        }
      case 'startCastingSession':
        return {
          outcome: 'granted',
          state: applyStartCastingSession(
            state,
            { kind: 'startCastingSession', session: entry.payload },
            week,
            false,
          ),
        }
      case 'greenlightScriptProject':
        return {
          outcome: 'granted',
          state: applyGreenlightScriptProject(
            state,
            { kind: 'greenlightScriptProject', production: entry.payload },
            week,
            false,
            events,
          ),
        }
    }
  } catch (error) {
    if (error instanceof QueueableCapacityRefusal) return { outcome: 'waiting' }
    return {
      outcome: 'expired',
      reason: error instanceof Error ? error.message : String(error),
    }
  }
}

function applyAssignShootingDirector(
  state: GameState,
  action: Action & { kind: 'assignShootingDirector' },
): GameState {
  const production = requireActiveProductionForOperations(
    state,
    action.productionId,
    'assignShootingDirector',
  )
  return {
    ...state,
    operations: assignShootingDirector(state.operations, production, action.directorId),
  }
}

function applyClearSceneryLoadIn(
  state: GameState,
  action: Action & { kind: 'clearSceneryLoadIn' },
): GameState {
  requireActiveProductionForOperations(state, action.productionId, 'clearSceneryLoadIn')
  // C2a-M5 (charter §4.2): THE SCENERY IS NOT THERE YET.
  //
  // Load-in has a distance now, so "clear the load-in" stopped being something a
  // player can assert into being true. A picture whose scenery is still on the
  // road is refused here, in the loud posture every other illegal command uses,
  // and the engine ends the load-in itself the week the trucks arrive
  // (`arriveDueScenery`, tick step 0.7).
  //
  // The refusal is scoped exactly as narrowly as the mechanic: a GRANDFATHERED
  // picture (no set binding — every migrated in-flight save) yields a withholding
  // rather than a load-in, so it is never refused and its click is untouched.
  const inFlight = state.operations.workflows.find(
    (workflow) => workflow.productionId === action.productionId,
  )
  if (inFlight !== undefined) {
    const loadIn = sceneryLoadInFor(state, inFlight, state.market.tick)
    if (isSceneryLoadIn(loadIn) && !loadIn.arrived) {
      throw new Error(
        `applyActions: clearSceneryLoadIn rejected — productionId "${action.productionId}" scenery is still in transit (${String(loadIn.weeksRemaining)} week(s) out)`,
      )
    }
  }
  const events = studioEventSinkFor(state)
  return {
    ...state,
    operations: clearSceneryLoadIn(state.operations, action.productionId, events),
    studioEvents: commitStudioEvents(state.studioEvents, events, state.market.tick),
  }
}

function applyScheduleShootingTake(
  state: GameState,
  action: Action & { kind: 'scheduleShootingTake' },
): GameState {
  requireActiveProductionForOperations(state, action.productionId, 'scheduleShootingTake')
  return {
    ...state,
    operations: scheduleShootingTake(state.operations, action.productionId),
  }
}

// ── Script Projects V1 actions ───────────────────────────────────────────────
function assertCurrentScriptState(state: GameState): GameState {
  assertScriptDevelopmentInvariants(state.scriptDevelopment, {
    currentWeek: state.market.tick,
    concepts: state.concepts,
    talent: state.talent,
    contracts: state.contracts,
    operations: state.operations,
    activeProductions: state.studio.activeProductions,
    releasedFilms: state.studio.releasedFilms,
  })
  assertCastingSessionsInvariants(state.castingSessions, {
    currentWeek: state.market.tick,
    operations: state.operations,
    scriptDevelopment: state.scriptDevelopment,
    talent: state.talent,
  })
  return state
}

function applyActivateScriptDevelopment(
  state: GameState,
  _action: Action & { kind: 'activateScriptDevelopment' },
): GameState {
  if (state.scriptDevelopment.mode !== 'legacy') {
    throw new Error(
      'applyActions: activateScriptDevelopment rejected — screenplay development is already managed',
    )
  }
  if (state.scriptDevelopment.projects.length !== 0) {
    throw new Error(
      'applyActions: activateScriptDevelopment rejected — legacy screenplay state is not empty',
    )
  }
  if (state.operations.mode !== 'managed') {
    throw new Error(
      'applyActions: activateScriptDevelopment rejected — managed Studio Operations must be active first',
    )
  }
  if (!economyEngaged(state) || state.founding !== null) {
    throw new Error(
      'applyActions: activateScriptDevelopment rejected — the studio must be founded with its economy engaged',
    )
  }
  if (state.studio.activeProductions.length !== 0) {
    throw new Error(
      'applyActions: activateScriptDevelopment rejected — the active production slate is not empty',
    )
  }
  return assertCurrentScriptState({
    ...state,
    scriptDevelopment: initialManagedScriptDevelopment(),
  })
}

/**
 * The gates EVERY screenplay commission passes, pool or original. One list, so
 * "who may write, and when" cannot answer differently depending on which verb
 * the player used.
 */
function requireCommissionableWriter(
  state: GameState,
  writerId: string,
  verb: string,
): Talent {
  if (state.founding !== null) {
    throw new Error(`applyActions: ${verb} rejected — the studio is still in its founding draft`)
  }
  const writer = requireTalent(state.talent, writerId, `${verb} writerId`)
  requireRole(writer, 'writer', `${verb} writerId`)
  if (!isContracted(state, writer.id)) {
    throw new Error(
      `applyActions: ${verb} rejected — writer "${writer.id}" is not currently studio-contracted`,
    )
  }
  if (busyTalentIds(state).has(writer.id)) {
    throw new Error(
      `applyActions: ${verb} rejected — writer "${writer.id}" already has an active assignment`,
    )
  }
  return writer
}

/**
 * THE BLUEPRINT EVERY COMMISSION MINTS (charter §3.5 — ONE PRODUCTION PATH).
 *
 * A pool concept gets one too, on its FIRST commission, with a null ordinal and
 * no generated title: it was authored by the world, not written by this studio.
 * That is what makes the thirty founding premises genuinely "templates" and it is
 * what stops two kinds of production existing — every managed picture has beats,
 * and therefore every managed picture has set demand.
 */
function appendBlueprint(
  state: GameState,
  blueprint: MovieBlueprint,
  nextOrdinal: number,
): OriginalScreenplays {
  return {
    nextOrdinal,
    blueprints: [...state.originalScreenplays.blueprints, blueprint],
  }
}

function assertCurrentScreenplayState(state: GameState): GameState {
  assertMovieBlueprintInvariants(state.originalScreenplays, {
    currentWeek: state.market.tick,
    concepts: state.concepts,
    projects: state.scriptDevelopment.projects,
  })
  return state
}

function applyCommissionScript(
  state: GameState,
  action: Action & { kind: 'commissionScript' },
  week: number = state.market.tick,
  allowQueue = true,
): GameState {
  requireCommissionableWriter(state, action.project.writerId, 'commissionScript')
  const projectId = nextScriptProjectId(state.scriptDevelopment)
  const concept = state.concepts.find((candidate) => candidate.id === action.project.conceptId)
  if (concept === undefined) {
    throw new Error(
      `applyActions: commissionScript references unknown concept "${action.project.conceptId}"`,
    )
  }
  if (
    allowQueue &&
    hasQueuedPoolCommissionForConcept(state.productionQueue, action.project.conceptId)
  ) {
    throw new Error(
      `applyActions: commissionScript rejected — concept "${action.project.conceptId}" already has a screenplay commission waiting in the production queue`,
    )
  }
  return admitOrQueue(
    state,
    () => {
      const scriptDevelopment = commissionScriptProject(
        state.scriptDevelopment,
        state.operations,
        action.project,
        week,
        castingOccupiedFacilitySlots(state.castingSessions),
        // Adapting a premise the market already owns is the fast path, and it is the
        // C1 clock to the week (`00E`.9's bounded blast radius).
        scriptDraftWeeks({
          origin: 'pool',
          officeTierAtMint: developmentOfficeTier(state),
          writerExperience: 0,
          writerCount: 1,
        }),
      )
      return assertCurrentScreenplayState(
        assertCurrentScriptState({
          ...state,
          scriptDevelopment,
          originalScreenplays: appendBlueprint(
            state,
            movieBlueprint({
              conceptId: concept.id,
              ordinal: null,
              mintedWeek: week,
              projectId,
              writerId: action.project.writerId,
              generatedTitle: null,
              genre: concept.genre,
              officeTierAtMint: developmentOfficeTier(state),
            }),
            state.originalScreenplays.nextOrdinal,
          ),
        }),
      )
    },
    (queue) => queueCommissionScript(queue, action.project, week),
    allowQueue,
  )
}

/**
 * COMMISSION AN ORIGINAL SCREENPLAY — the verb the whole milestone exists for
 * (charter §3.5). *A writer goes to work and eventually hands me a new movie.*
 *
 * THE MINT IS THE COMMIT. The concept, its identity, its latents, its working
 * title and its blueprint all come into existence here, in one action, at the
 * moment the Development & Casting slot is actually granted — and if the slot
 * cannot be granted, `commissionScriptProject` throws before any of it is
 * appended, so a refused commission burns no ordinal and orphans no concept.
 * That ordering is the whole cancellation story and it is why it needs no
 * abandon verb.
 *
 * THE IDENTITY IS RESERVED, not merely counted: the minted id is checked against
 * `persistedConceptIds`, which walks every root that holds a concept id, so an id
 * can never be re-minted onto a picture that already owns it (G17).
 */
function applyCommissionOriginalScreenplay(
  state: GameState,
  action: Action & { kind: 'commissionOriginalScreenplay' },
  week: number = state.market.tick,
  allowQueue = true,
): GameState {
  const payload = action.screenplay
  requireCommissionableWriter(state, payload.writerId, 'commissionOriginalScreenplay')
  if (!GENRE_ORDER.includes(payload.genre)) {
    throw new Error(
      `applyActions: commissionOriginalScreenplay rejected — "${payload.genre}" is not a genre this studio makes`,
    )
  }
  if (payload.promise.genre !== payload.genre) {
    throw new Error(
      'applyActions: commissionOriginalScreenplay rejected — the promise names a different genre than the screenplay',
    )
  }

  // ── THE QUEUE COMES BEFORE THE MINT (charter §3.3/§8.1) ───────────────────
  //
  // A queued original commission carries writer/genre/shape and NO conceptId,
  // because the mint IS the commit. Everything below this gate — the ordinal, the
  // concept id, the latents, the working title, the blueprint — comes into
  // existence only when the slot is actually granted, so an intent that waits and
  // then expires orphans no concept and burns no ordinal.
  if (allowQueue && queueingActive(state.operations) && !gateSlotAvailable(state)) {
    return admitToQueue(
      state,
      queueCommissionOriginalScreenplay(
        state.productionQueue,
        { writerId: payload.writerId, genre: payload.genre, shape: payload.shape, promise: payload.promise },
        week,
      ),
    )
  }

  const ordinal = state.originalScreenplays.nextOrdinal
  const conceptId = originalConceptId(ordinal)
  if (persistedConceptIds(state).has(conceptId)) {
    throw new Error(
      `applyActions: commissionOriginalScreenplay rejected — concept id "${conceptId}" is already in use`,
    )
  }
  const concept = mintOriginalConcept(state.seed, conceptId, payload.genre)
  const projectId = nextScriptProjectId(state.scriptDevelopment)
  const officeTierAtMint = developmentOfficeTier(state)
  const writer = requireTalent(state.talent, payload.writerId, 'commissionOriginalScreenplay')
  const draftWeeks = scriptDraftWeeks({
    origin: 'original',
    officeTierAtMint,
    writerExperience: writingPaceExperience([writer], payload.genre),
    writerCount: 1,
  })

  // The EXISTING draft machinery, unchanged: it allocates the slot, marks the
  // writer busy, and refuses if either is impossible. Nothing below this line is
  // new production behaviour.
  const scriptDevelopment = commissionScriptProject(
    state.scriptDevelopment,
    state.operations,
    {
      conceptId,
      writerId: payload.writerId,
      shape: payload.shape,
      promise: payload.promise,
    },
    week,
    castingOccupiedFacilitySlots(state.castingSessions),
    draftWeeks,
  )

  return assertCurrentScreenplayState(
    assertCurrentScriptState({
      ...state,
      // APPEND-ONLY, and world-shaped: eight fields, the same eight a worldgen
      // premise carries. Every studio-relative fact lives in the blueprint.
      concepts: [...state.concepts, concept],
      scriptDevelopment,
      originalScreenplays: appendBlueprint(
        state,
        movieBlueprint({
          conceptId,
          ordinal,
          mintedWeek: week,
          projectId,
          writerId: payload.writerId,
          generatedTitle: concept.title,
          genre: payload.genre,
          officeTierAtMint,
        }),
        ordinal + 1,
      ),
    }),
  )
}

/**
 * Put another writer on a screenplay in progress (`00E`.9's bounded pooling).
 * It buys time and touches nothing else — attribution, beats, latents and the
 * assessment are all out of its reach.
 */
function applyAssignScreenplayWriter(
  state: GameState,
  action: Action & { kind: 'assignScreenplayWriter' },
): GameState {
  const writer = requireCommissionableWriter(state, action.writerId, 'assignScreenplayWriter')
  const project = state.scriptDevelopment.projects.find(
    (candidate) => candidate.id === action.projectId,
  )
  if (project === undefined) {
    throw new Error(
      `applyActions: assignScreenplayWriter references unknown project "${action.projectId}"`,
    )
  }
  const blueprint = blueprintForConcept(state.originalScreenplays, project.conceptId)
  const concept = state.concepts.find((candidate) => candidate.id === project.conceptId)
  if (concept === undefined) {
    throw new Error(
      `applyActions: assignScreenplayWriter references unknown concept "${project.conceptId}"`,
    )
  }
  const pooled = [
    ...scriptProjectWriterIds(project)
      .map((id) => state.talent.find((person) => person.id === id))
      .filter((person): person is Talent => person !== undefined),
    writer,
  ]
  const draftWeeks = scriptDraftWeeks({
    origin: blueprint !== undefined && isOriginalScreenplay(blueprint) ? 'original' : 'pool',
    officeTierAtMint: blueprint?.officeTierAtMint ?? developmentOfficeTier(state),
    writerExperience: writingPaceExperience(pooled, concept.genre),
    writerCount: pooled.length,
  })
  return assertCurrentScriptState({
    ...state,
    scriptDevelopment: joinScreenplayWriterPool(
      state.scriptDevelopment,
      action.projectId,
      action.writerId,
      state.market.tick,
      draftWeeks,
    ),
  })
}

/**
 * RENAME — the player's title replaces the working one the studio's writers gave
 * it (charter §3.5).
 *
 * IT WRITES ONE FIELD. `FilmConcept.title` is the single stored display
 * authority and twenty-one live surfaces resolve it, so one write reaches all of
 * them and nothing has to be re-resolved.
 *
 * IDENTITY IS UNTOUCHED, BY THE SHAPE OF THE ACTION: it cannot name an id, a
 * project, an ordinal or a deterministic key, and the blueprint's
 * `generatedTitle` is immutable — a rename records the WEEK it happened beside
 * what the screenplay was originally called, and never overwrites it.
 *
 * TWO SURFACES KEEP THE OLD TITLE FOREVER, BY DESIGN — `TalentCareerEvent.
 * filmTitle` and `BroadcastItem.template`. A career record names the film as it
 * was called when the person made it, and a press clipping is a clipping. This is
 * stated here, in the contract, so a playtester who renames a released picture
 * and opens a talent profile reads a documented behaviour rather than filing a
 * bug. `tests/c2a-m3-rename.test.ts` asserts both stay frozen.
 */
function applyRenameScreenplay(
  state: GameState,
  action: Action & { kind: 'renameScreenplay' },
): GameState {
  const refusal = renameScreenplayRefusal(state.originalScreenplays, action.conceptId, action.title)
  if (refusal !== null) {
    throw new Error(`applyActions: renameScreenplay rejected — ${refusal.reason}`)
  }
  const title = normalizeScreenplayTitle(action.title)
  return assertCurrentScreenplayState({
    ...state,
    concepts: state.concepts.map((concept) =>
      concept.id === action.conceptId ? { ...concept, title } : concept,
    ),
    originalScreenplays: {
      ...state.originalScreenplays,
      blueprints: state.originalScreenplays.blueprints.map((blueprint) =>
        blueprint.conceptId === action.conceptId
          ? { ...blueprint, renamedWeek: state.market.tick }
          : blueprint,
      ),
    },
  })
}

function applyRequestScriptRewrite(
  state: GameState,
  action: Action & { kind: 'requestScriptRewrite' },
): GameState {
  const project = state.scriptDevelopment.projects.find(
    (candidate) => candidate.id === action.projectId,
  )
  if (project === undefined) {
    throw new Error(
      `applyActions: requestScriptRewrite references unknown project "${action.projectId}"`,
    )
  }
  if (!isContracted(state, project.writerId)) {
    throw new Error(
      `applyActions: requestScriptRewrite rejected — writer "${project.writerId}" is not currently studio-contracted`,
    )
  }
  if (busyTalentIds(state).has(project.writerId)) {
    throw new Error(
      `applyActions: requestScriptRewrite rejected — writer "${project.writerId}" already has an active assignment`,
    )
  }
  return assertCurrentScriptState({
    ...state,
    scriptDevelopment: requestScriptRewrite(
      state.scriptDevelopment,
      state.operations,
      action.projectId,
      state.market.tick,
      castingOccupiedFacilitySlots(state.castingSessions),
    ),
  })
}

function applyAcceptScript(
  state: GameState,
  action: Action & { kind: 'acceptScript' },
): GameState {
  return assertCurrentScriptState({
    ...state,
    scriptDevelopment: acceptScriptProject(
      state.scriptDevelopment,
      action.projectId,
    ),
  })
}

function applyGreenlightScriptProject(
  state: GameState,
  action: Action & { kind: 'greenlightScriptProject' },
  week: number = state.market.tick,
  allowQueue = true,
  injectedEvents?: StudioEventSink,
): GameState {
  const project = state.scriptDevelopment.projects.find(
    (candidate) => candidate.id === action.production.projectId,
  )
  if (project === undefined) {
    throw new Error(
      `applyActions: greenlightScriptProject references unknown project "${action.production.projectId}"`,
    )
  }
  if (!isContracted(state, project.writerId)) {
    throw new Error(
      `applyActions: greenlightScriptProject rejected — writer "${project.writerId}" must be currently studio-contracted`,
    )
  }
  if (
    allowQueue &&
    hasQueuedGreenlightScriptProject(state.productionQueue, action.production.projectId)
  ) {
    throw new Error(
      `applyActions: greenlightScriptProject rejected — screenplay project "${action.production.projectId}" already has a greenlight waiting in the production queue`,
    )
  }
  return admitOrQueue(
    state,
    () => applyGreenlightScriptProjectNow(state, action, project, injectedEvents),
    (queue) =>
      queueGreenlightScriptProject(queue, action.production.projectId, action.production, week),
    allowQueue,
  )
}

/**
 * The greenlight itself, once the Development & Casting slot is known to be
 * grantable. Split out so the front door and the queue's dequeue commit THE SAME
 * verb — a queued greenlight is not a second greenlight path, it is this one,
 * asked again later.
 */
function applyGreenlightScriptProjectNow(
  state: GameState,
  action: Action & { kind: 'greenlightScriptProject' },
  project: ScriptProject,
  injectedEvents?: StudioEventSink,
): GameState {
  const next = applyGreenlight(
    state,
    {
      kind: 'greenlight',
      production: {
        conceptId: project.conceptId,
        // Copy the screenplay facts into the production. The authoritative
        // append-only project and the production must never share mutable aliases.
        shape: { ...project.shape },
        promise: {
          genre: project.promise.genre,
          intendedSegments: [...project.promise.intendedSegments],
          ranges: {
            intimacy: [...project.promise.ranges.intimacy],
            tonalWeight: [...project.promise.ranges.tonalWeight],
            kineticEnergy: [...project.promise.ranges.kineticEnergy],
          },
        },
        writerId: project.writerId,
        directorId: action.production.directorId,
        craftIds: action.production.craftIds,
        cast: action.production.cast,
        budget: action.production.budget,
      },
    },
    project.id,
    injectedEvents,
  )
  return assertCurrentScriptState(next)
}

// ── Casting Sessions V1 actions ─────────────────────────────────────────────
function applyActivateCastingSessions(
  state: GameState,
  _action: Action & { kind: 'activateCastingSessions' },
): GameState {
  if (state.castingSessions.mode !== 'legacy') {
    throw new Error(
      'applyActions: activateCastingSessions rejected — Casting Sessions are already managed',
    )
  }
  if (state.castingSessions.sessions.length !== 0) {
    throw new Error(
      'applyActions: activateCastingSessions rejected — legacy casting state is not empty',
    )
  }
  if (state.operations.mode !== 'managed' || state.scriptDevelopment.mode !== 'managed') {
    throw new Error(
      'applyActions: activateCastingSessions rejected — managed Studio Operations and Script Development must be active first',
    )
  }
  if (!economyEngaged(state) || state.founding !== null) {
    throw new Error(
      'applyActions: activateCastingSessions rejected — the studio must be founded with its economy engaged',
    )
  }
  return assertCurrentScriptState({
    ...state,
    castingSessions: initialManagedCastingSessions(),
  })
}

function applyStartCastingSession(
  state: GameState,
  action: Action & { kind: 'startCastingSession' },
  week: number = state.market.tick,
  allowQueue = true,
): GameState {
  if (state.founding !== null) {
    throw new Error(
      'applyActions: startCastingSession rejected — the studio is still in its founding draft',
    )
  }
  // The retained clients may submit again before the queued state is rendered.
  // Dequeue replays this same verb with `allowQueue = false`, so it must be
  // allowed to commit the one row that is already present.
  if (allowQueue && hasQueuedCastingSession(state.productionQueue, action.session.projectId)) {
    throw new Error(
      `applyActions: startCastingSession rejected — screenplay project "${action.session.projectId}" already has auditions waiting in the production queue`,
    )
  }
  const assignableTalentIds = new Set<string>(freelancerMarketIds(state))
  for (const person of state.talent) {
    if (isContracted(state, person.id)) assignableTalentIds.add(person.id)
  }
  return admitOrQueue(
    state,
    () =>
      assertCurrentScriptState({
        ...state,
        castingSessions: startCastingSession(
          state.castingSessions,
          state.operations,
          state.scriptDevelopment,
          action.session,
          week,
          {
            talent: state.talent,
            assignableTalentIds,
            busyTalentIds: busyTalentIds(state),
          },
        ),
      }),
    (queue) => queueStartCastingSession(queue, action.session, week),
    allowQueue,
  )
}

function applyAcknowledgeCastingSession(
  state: GameState,
  action: Action & { kind: 'acknowledgeCastingSession' },
): GameState {
  return assertCurrentScriptState({
    ...state,
    castingSessions: acknowledgeCastingSession(
      state.castingSessions,
      action.sessionId,
    ),
  })
}

// ── D-11 signContract — sign a talent to a studio contract (D-11.4/.5/.6) ─────
// During founding: talent must be in the applicant pool; the signing bonus draws
// the recruitment fund (NOT cash), tracked in founding.spentBonus. During ops:
// talent must be signable (free agent / hiring market); the bonus debits cash and
// is logged. Rejected if already contracted. Terms are the deterministic offer.
function applySignContract(state: GameState, action: Action & { kind: 'signContract' }): GameState {
  const { talentId, termWeeks } = action
  const week = state.market.tick
  requireTalent(state.talent, talentId, 'signContract talentId')
  if (isContracted(state, talentId)) {
    throw new Error(`applyActions: signContract rejected — talent "${talentId}" is already contracted (D-11)`)
  }
  const offer = contractOffer(state, talentId, termWeeks, week)
  const contract: Contract = {
    talentId,
    annualSalary: offer.annualSalary,
    signingBonus: offer.signingBonus,
    startWeek: offer.startWeek,
    endWeekExclusive: offer.endWeekExclusive,
    termWeeks: offer.termWeeks,
  }

  if (state.founding !== null) {
    if (!state.founding.applicantIds.includes(talentId)) {
      throw new Error(
        `applyActions: signContract rejected — talent "${talentId}" is not in the founding applicant pool (D-11.2)`,
      )
    }
    const remaining = state.founding.budget - state.founding.spentBonus
    if (offer.signingBonus > remaining) {
      throw new Error(
        `applyActions: signContract rejected — signing bonus ${offer.signingBonus} exceeds remaining recruitment fund ${remaining} (D-11.2)`,
      )
    }
    return {
      ...state,
      founding: { ...state.founding, spentBonus: state.founding.spentBonus + offer.signingBonus },
      contracts: [...state.contracts, contract],
      freeAgents: state.freeAgents.filter((id) => id !== talentId),
      // D-17A/R2 — a signing is engagement; monotonic, never cleared.
      economyEngagedEver: true,
    }
  }

  // Operating phase: talent must be currently signable (hiring market ∪ free agents).
  if (!hiringMarketIds(state).includes(talentId)) {
    throw new Error(
      `applyActions: signContract rejected — talent "${talentId}" is not currently available to sign (D-11.14)`,
    )
  }
  // D-12 solvency gate — the signing bonus is a voluntary immediate commitment.
  const aff = canAfford(state, offer.signingBonus)
  if (!aff.ok) {
    throw new Error(`applyActions: signContract rejected — ${aff.reason} (D-12 solvency gate)`)
  }
  const entry: LedgerEntry = {
    week,
    kind: 'signingBonus',
    amount: -offer.signingBonus,
    talentId,
    note: 'contract signing bonus',
  }
  return {
    ...state,
    studio: { ...state.studio, cash: state.studio.cash - offer.signingBonus },
    contracts: [...state.contracts, contract],
    ledger: [...state.ledger, entry],
    freeAgents: state.freeAgents.filter((id) => id !== talentId),
    // D-17A/R2 — a signing is engagement; monotonic, never cleared.
    economyEngagedEver: true,
  }
}

// ── D-11 renewContract — extend during the renewal window (D-11.7) ────────────
function applyRenewContract(state: GameState, action: Action & { kind: 'renewContract' }): GameState {
  const { talentId, termWeeks } = action
  const week = state.market.tick
  const contract = activeContract(state, talentId)
  if (contract === undefined) {
    throw new Error(`applyActions: renewContract rejected — talent "${talentId}" has no active contract (D-11.7)`)
  }
  if (!renewalWindowOpen(contract, week)) {
    throw new Error(
      `applyActions: renewContract rejected — talent "${talentId}" is not in its renewal window (D-11.7)`,
    )
  }
  const offer = contractOffer(state, talentId, termWeeks, week)
  const renewed: Contract = {
    talentId,
    annualSalary: offer.annualSalary,
    signingBonus: offer.signingBonus,
    startWeek: week,
    endWeekExclusive: week + offer.termWeeks,
    termWeeks: offer.termWeeks,
  }
  // D-12 solvency gate — the renewal signing bonus is a voluntary immediate commitment.
  const affRenew = canAfford(state, offer.signingBonus)
  if (!affRenew.ok) {
    throw new Error(`applyActions: renewContract rejected — ${affRenew.reason} (D-12 solvency gate)`)
  }
  const entry: LedgerEntry = {
    week,
    kind: 'signingBonus',
    amount: -offer.signingBonus,
    talentId,
    note: 'renewal signing bonus',
  }
  return {
    ...state,
    studio: { ...state.studio, cash: state.studio.cash - offer.signingBonus },
    contracts: state.contracts.map((c) => (c === contract ? renewed : c)),
    ledger: [...state.ledger, entry],
  }
}

// ── D-11 releaseTalent — early release; financial consequence only (D-11.9) ───
function applyReleaseTalent(state: GameState, action: Action & { kind: 'releaseTalent' }): GameState {
  const { talentId } = action
  const week = state.market.tick
  const contract = activeContract(state, talentId)
  if (contract === undefined) {
    throw new Error(`applyActions: releaseTalent rejected — talent "${talentId}" has no active contract (D-11.9)`)
  }
  const scriptAssignment = activeScriptWriterAssignments(
    state.scriptDevelopment,
    state.concepts,
  ).find((assignment) => assignment.talentId === talentId)
  if (scriptAssignment !== undefined) {
    throw new Error(
      `applyActions: releaseTalent rejected — talent "${talentId}" is ${scriptAssignment.label} and must finish that screenplay task first`,
    )
  }
  const cost = terminationCost(contract, week)
  const entry: LedgerEntry = {
    week,
    kind: 'termination',
    amount: -cost,
    talentId,
    note: 'early-release termination cost',
  }
  return {
    ...state,
    studio: { ...state.studio, cash: state.studio.cash - cost },
    contracts: state.contracts.filter((c) => c !== contract),
    ledger: [...state.ledger, entry],
    freeAgents: state.freeAgents.includes(talentId) ? state.freeAgents : [...state.freeAgents, talentId],
  }
}

// ── D-17B §2 — the publicity campaign action ─────────────────────────────────
// The ONE authorized player-controlled paid awareness lever (Owner authorization §4 B;
// §5: it is a PUBLICITY CAMPAIGN, never a "Publicity Office facility"). Deterministic and
// immediate: no RNG, no scheduling, no persistence beyond the two cooldown clocks.
//
// Effect, exactly as measured (contract §2):
//     lift       = maxLift · (1 − awareness/100)^PUBLICITY_SHAPE_EXP        (round-free)
//     awareness' = clamp(awareness + lift, 0, 100)
//     cash      -= cost                                                     (integer)
// The convex shape is the whole design: the same money buys progressively less as the
// studio becomes visible, so a healthy studio rationally declines to press the button and
// a distressed one gets ONE lever rather than a guaranteed rescue (§8). It is NOT a
// bailout — it costs real cash a distressed studio may not have, and `canAfford` refuses
// to let it drive cash below zero (the D-12.11 solvency gate, same rule as a greenlight).
//
// Every rejection throws with a NAMED reason (house style: loud, specific, quotable by the
// UI verbatim).
function applyPublicity(state: GameState, action: Action & { kind: 'publicity' }): GameState {
  const { tier } = action
  const week = state.market.tick
  const spec = TUNING.PUBLICITY_TIERS[tier]
  if (spec === undefined) {
    throw new Error(`applyActions: publicity rejected — unknown tier "${String(tier)}"`)
  }

  // (1) ENGAGED-ONLY. Publicity is D-17B economy law; the headless/M0A regime has no such
  // action, which is what keeps the acceptance corpus byte-identical and makes a
  // `publicity` ledger entry valid evidence of engagement (save.ts ENGAGED_KINDS).
  if (!economyEngaged(state)) {
    throw new Error(
      'applyActions: publicity rejected — the studio economy is not engaged; a publicity campaign is only available to a founded studio (D-17B §2)',
    )
  }

  // (2) NOT during a founding draft — no operations before the studio exists (the same
  // posture as greenlight/payroll/overhead).
  if (state.founding !== null) {
    throw new Error(
      'applyActions: publicity rejected — the studio is still in its founding draft (D-17B §2)',
    )
  }

  // (3) The GLOBAL cooldown: no two campaigns inside PUBLICITY_GLOBAL_COOLDOWN_WEEKS,
  // whatever their tiers. This is what stops the ladder being climbed as one long purchase.
  const last = state.publicity.lastUsedWeek
  if (last !== null && week - last < TUNING.PUBLICITY_GLOBAL_COOLDOWN_WEEKS) {
    const readyAt = last + TUNING.PUBLICITY_GLOBAL_COOLDOWN_WEEKS
    throw new Error(
      `applyActions: publicity rejected — a campaign ran in week ${String(last)}; the next campaign of any tier is available in week ${String(readyAt)} (global cooldown ${String(TUNING.PUBLICITY_GLOBAL_COOLDOWN_WEEKS)} weeks, D-17B §2)`,
    )
  }

  // (4) The PER-TIER cooldown: a bigger campaign is unavailable for longer.
  const lastTier = state.publicity.byTier[tier]
  if (lastTier !== null && week - lastTier < spec.cooldownWeeks) {
    const readyAt = lastTier + spec.cooldownWeeks
    throw new Error(
      `applyActions: publicity rejected — a ${tier} campaign ran in week ${String(lastTier)}; the next ${tier} campaign is available in week ${String(readyAt)} (tier cooldown ${String(spec.cooldownWeeks)} weeks, D-17B §2)`,
    )
  }

  // (5) The D-12.11 solvency gate — the SAME authoritative check every other voluntary
  // commitment uses. Publicity may never drive cash below zero.
  const aff = canAfford(state, spec.cost)
  if (!aff.ok) {
    throw new Error(`applyActions: publicity rejected — ${aff.reason} (D-12 solvency gate)`)
  }

  const awareness = state.studio.standing.audienceAwareness
  const lift = publicityLiftAt(tier, awareness)

  // Integer dollars enforced AT THE WRITE SITE (contract §5). The tier costs are integer
  // literals, so this is a guard against a future non-integer tuning edit rather than a
  // rounding step — the allocator's whole-dollar partition never sees this kind, so nothing
  // downstream would catch it.
  const cost = spec.cost
  if (!Number.isInteger(cost)) {
    throw new Error(
      `applyActions: publicity rejected — tier "${tier}" cost ${String(cost)} is not a whole dollar amount (D-17B §5)`,
    )
  }

  const entry: LedgerEntry = {
    week,
    kind: 'publicity',
    amount: -cost,
    // NO productionId: publicity is a STUDIO-level cost, never a per-film commitment (§5).
    note: `publicity: ${tier}`,
  }

  return {
    ...state,
    studio: {
      ...state.studio,
      cash: state.studio.cash - cost,
      standing: {
        ...state.studio.standing,
        audienceAwareness: clamp(awareness + lift, 0, 100),
      },
    },
    ledger: [...state.ledger, entry],
    publicity: {
      lastUsedWeek: week,
      byTier: { ...state.publicity.byTier, [tier]: week },
    },
  }
}

// ── §3 applyActions ──────────────────────────────────────────────────────────
export function applyActions(state: GameState, actions: Action[]): GameState {
  // B3 — at most one greenlight per call. Reject two loudly (a harness abort).
  let greenlightCount = 0
  for (const action of actions) {
    if (action.kind === 'greenlight' || action.kind === 'greenlightScriptProject') {
      greenlightCount++
    }
  }
  if (greenlightCount > 1) {
    throw new Error(
      `applyActions: ${greenlightCount} greenlight actions in one call — at most one per call (B3)`,
    )
  }

  // Process in array order, threading the evolving state so a createTalent
  // earlier in the list is visible to a later greenlight.
  let next = state
  for (const action of actions) {
    switch (action.kind) {
      case 'greenlight':
        next = applyGreenlight(next, action)
        break
      case 'cancel':
        next = applyCancel(next, action)
        break
      case 'createTalent':
        next = applyCreateTalent(next, action)
        break
      case 'createCustomTalent':
        next = applyCreateCustomTalent(next, action)
        break
      case 'createBalancedTalent':
        next = applyCreateBalancedTalent(next, action)
        break
      case 'foundStudio':
        next = applyFoundStudio(next, action)
        break
      case 'signContract':
        next = applySignContract(next, action)
        break
      case 'renewContract':
        next = applyRenewContract(next, action)
        break
      case 'releaseTalent':
        next = applyReleaseTalent(next, action)
        break
      case 'publicity':
        next = applyPublicity(next, action)
        break
      case 'activateStudioOperations':
        next = applyActivateStudioOperations(next, action)
        break
      case 'assignShootingDirector':
        next = applyAssignShootingDirector(next, action)
        break
      case 'clearSceneryLoadIn':
        next = applyClearSceneryLoadIn(next, action)
        break
      case 'scheduleShootingTake':
        next = applyScheduleShootingTake(next, action)
        break
      case 'activateScriptDevelopment':
        next = applyActivateScriptDevelopment(next, action)
        break
      case 'commissionScript':
        next = applyCommissionScript(next, action)
        break
      case 'commissionOriginalScreenplay':
        next = applyCommissionOriginalScreenplay(next, action)
        break
      case 'assignScreenplayWriter':
        next = applyAssignScreenplayWriter(next, action)
        break
      case 'cancelQueuedIntent':
        next = applyCancelQueuedIntent(next, action)
        break
      case 'renameScreenplay':
        next = applyRenameScreenplay(next, action)
        break
      case 'requestScriptRewrite':
        next = applyRequestScriptRewrite(next, action)
        break
      case 'acceptScript':
        next = applyAcceptScript(next, action)
        break
      case 'greenlightScriptProject':
        next = applyGreenlightScriptProject(next, action)
        break
      case 'activateCastingSessions':
        next = applyActivateCastingSessions(next, action)
        break
      case 'startCastingSession':
        next = applyStartCastingSession(next, action)
        break
      case 'acknowledgeCastingSession':
        next = applyAcknowledgeCastingSession(next, action)
        break
      case 'startDevelopmentCastingAnnex':
        next = applyStartDevelopmentCastingAnnex(next, action)
        break
      case 'placeFacility':
        next = applyPlaceFacility(next, action)
        break
      case 'moveFacility':
        next = applyMoveFacility(next, action)
        break
      case 'demolishFacility':
        next = applyDemolishFacility(next, action)
        break
      case 'commissionSet':
        next = applyCommissionSet(next, action)
        break
      case 'repairSet':
        next = applyRepairSet(next, action)
        break
      case 'strikeSet':
        next = applyStrikeSet(next, action)
        break
      default: {
        // Exhaustiveness guard: an unknown action kind is a loud abort (M16).
        const _exhaustive: never = action
        throw new Error(`applyActions: unknown action kind ${JSON.stringify(_exhaustive)}`)
      }
    }
  }

  // FAIL-CLOSED at the action boundary (charter §3.2), the twin of the tick
  // boundary's check. Greenlight, commission, and startCastingSession each
  // allocate against the other owners' slots already; this asks the union producer
  // whether the batch as a WHOLE left any slot with two owners. It must never fire
  // on a legal state.
  assertNoDoubleBookedResourceSlots(next)
  return next
}
