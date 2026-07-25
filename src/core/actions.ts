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
//   B3  — at most one greenlight per call; greenlight valid only while
//         activeProductions.length < MAX_CONCURRENT_PRODUCTIONS.
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

import { computeForecast, type ForecastContext } from './forecast.js'
import type { ReceptionInputs } from './reception.js'
import { resolveShape } from './shape.js'
import { TUNING } from './tuning.js'
import type {
  Action,
  CastSlot,
  CreativeRole,
  Forecast,
  GameState,
  Production,
  Talent,
} from './types.js'
import { salaryCurve } from './worldgen.js'

// Fixed cast-slot iteration order (determinism: role matching, salary summation,
// exclusivity checks, and ReceptionInputs.cast assembly all walk this order).
const CAST_SLOTS: readonly CastSlot[] = ['lead', 'antagonist', 'support'] as const

// The valid §2 CreativeRole values (createTalent role validation).
const CREATIVE_ROLES: readonly CreativeRole[] = ['writer', 'director', 'actor', 'craft'] as const

// Production.id / startTick padding (SETTLED OWNER RULING):
//   Production.id = `prod-${String(startTick).padStart(4,'0')}`
// startTick is unique per run (≤1 greenlight/tick), so the id is unique,
// monotonic, and lexically ordered without a GameState counter.
function productionId(startTick: number): string {
  return `prod-${String(startTick).padStart(4, '0')}`
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

// Enforce a talent's declared CreativeRole (M16 role-type matching).
function requireRole(t: Talent, role: CreativeRole, label: string): void {
  if (t.role !== role) {
    throw new Error(
      `applyActions: ${label} talent "${t.id}" has role "${t.role}", expected "${role}"`,
    )
  }
}

// ── greenlight ───────────────────────────────────────────────────────────────
// Validate (throw on any failure per M16 + B3), then apply. `state` is the
// evolving state (may already reflect earlier actions in this call). Returns the
// next state; `state.rngState` is carried through unchanged.
function applyGreenlight(state: GameState, prod: Action & { kind: 'greenlight' }): GameState {
  const p = prod.production
  const currentTick = state.market.tick

  // M16.6 / B3 — concurrency: greenlight valid only while under the cap.
  if (state.studio.activeProductions.length >= TUNING.MAX_CONCURRENT_PRODUCTIONS) {
    throw new Error(
      `applyActions: greenlight rejected — activeProductions at capacity (${state.studio.activeProductions.length}/${TUNING.MAX_CONCURRENT_PRODUCTIONS})`,
    )
  }

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
  for (const id of engagedIds) {
    if (busy.has(id)) {
      throw new Error(
        `applyActions: greenlight talent "${id}" is already engaged in an active production (exclusivity, M16)`,
      )
    }
  }

  // ── Apply ──────────────────────────────────────────────────────────────────
  const id = productionId(currentTick)
  const startTick = currentTick
  const remainingTicks = TUNING.PRODUCTION_TICKS

  // Assemble the §5 ReceptionInputs the forecast reads at greenlight (M1/B16).
  const inp: ReceptionInputs = {
    concept,
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
  const forecastSnapshot: Forecast = computeForecast(inp, ctx)

  // D-1 ledger: debit negative + marketing + Σ salaries (writer, director, all
  // cast, all craft — summed in fixed order). Cash may go negative; no credit here.
  let salaries = writer.salary + director.salary
  for (const slot of CAST_SLOTS) salaries += cast[slot].salary
  for (const c of craftHires) salaries += c.salary
  const cash = state.studio.cash - (p.budget.negative + p.budget.marketing + salaries)

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
  }

  return {
    ...state,
    studio: {
      ...state.studio,
      cash,
      activeProductions: [...state.studio.activeProductions, production],
    },
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
  return {
    ...state,
    studio: {
      ...state.studio,
      activeProductions: state.studio.activeProductions.filter(
        (pr) => pr.id !== action.productionId,
      ),
    },
  }
}

// ── createTalent (§10) ───────────────────────────────────────────────────────
// Validate: age ∈ [18,70]; role is a valid CreativeRole. Apply: append a Talent
// with perceived = {...actual}, skill/fame = AUTHORED_START_*, salary from the
// curve, authored = true, and a deterministic unique authored-* id. The player
// NEVER sets skill or fame.
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

  const skill = TUNING.AUTHORED_START_SKILL
  const fame = TUNING.AUTHORED_START_FAME

  const talent: Talent = {
    id: authoredTalentId(state.talent),
    name: a.name,
    role: a.role,
    age: a.age,
    actual: { ...a.actual },
    perceived: { ...a.actual }, // perceived = actual (§10)
    skill,
    fame,
    salary: salaryCurve(skill, fame),
    authored: true,
  }

  return {
    ...state,
    talent: [...state.talent, talent],
  }
}

// ── §3 applyActions ──────────────────────────────────────────────────────────
export function applyActions(state: GameState, actions: Action[]): GameState {
  // B3 — at most one greenlight per call. Reject two loudly (a harness abort).
  let greenlightCount = 0
  for (const action of actions) {
    if (action.kind === 'greenlight') greenlightCount++
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
      default: {
        // Exhaustiveness guard: an unknown action kind is a loud abort (M16).
        const _exhaustive: never = action
        throw new Error(`applyActions: unknown action kind ${JSON.stringify(_exhaustive)}`)
      }
    }
  }
  return next
}
