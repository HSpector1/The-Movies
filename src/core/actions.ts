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

import {
  activeContract,
  canAfford,
  contractOffer,
  employmentEngaged,
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
  Genre,
  GenreExperience,
  LedgerEntry,
  PotentialTier,
  Production,
  Promise as FilmPromise,
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
// the base is already taken (by an active OR a released production), append the smallest
// free `-k` suffix. Deterministic; base id unchanged whenever it is free (i.e. always,
// in M0A). `taken` = every active + released production id.
function productionId(startTick: number, taken: ReadonlySet<string>): string {
  const base = `prod-${String(startTick).padStart(4, '0')}`
  if (!taken.has(base)) return base
  let k = 1
  while (taken.has(`${base}-${k}`)) k++
  return `${base}-${k}`
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
function applyGreenlight(state: GameState, prod: Action & { kind: 'greenlight' }): GameState {
  const p = prod.production
  const currentTick = state.market.tick

  // D-11.2 — no greenlight during the founding draft (assemble a roster first).
  if (state.founding !== null) {
    throw new Error('applyActions: greenlight rejected — the studio is still in its founding draft (D-11)')
  }

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
  for (const id of engagedIds) {
    if (busy.has(id)) {
      throw new Error(
        `applyActions: greenlight talent "${id}" is already engaged in an active production (exclusivity, M16)`,
      )
    }
  }

  // ── Apply ──────────────────────────────────────────────────────────────────
  // Unique id even for same-tick greenlights (D-11.A): base id unless already taken
  // by an active or released production. In M0A (≤1 greenlight/tick) the base is always
  // free, so ids are byte-identical to before.
  const takenIds = new Set<string>()
  for (const active of state.studio.activeProductions) takenIds.add(active.id)
  for (const f of state.studio.releasedFilms) takenIds.add(f.productionId)
  const id = productionId(currentTick, takenIds)
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
  // D-12: the greenlight forecast saturates fame→opening reach with the SAME helper as the
  // realized release when the economy is engaged (economyEngaged ≡ employmentEngaged), so
  // forecast and result stay consistent; M0A (not engaged) uses the legacy path (byte-identical).
  const forecastSnapshot: Forecast = computeForecast(inp, ctx, employmentEngaged(state))

  // ── Ledger + cash (D-1 unchanged when employment NOT engaged; D-11 economics
  // when engaged). Both paths keep the reconciliation invariant
  //   cash === INITIAL_CASH + Σ ledger.amount
  // by logging every cash movement. The production entry always covers
  // negative + marketing; the salary/fee treatment differs by mode.
  const productionCost = p.budget.negative + p.budget.marketing
  let cash: number
  const ledgerAdds: LedgerEntry[] = []

  if (employmentEngaged(state)) {
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
      const fee = freelancerFee(t)
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
  const participants: FilmParticipants | undefined = employmentEngaged(state)
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

  return {
    ...state,
    studio: {
      ...state.studio,
      cash,
      activeProductions: [...state.studio.activeProductions, production],
    },
    ledger: [...state.ledger, ...ledgerAdds],
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
      default: {
        // Exhaustiveness guard: an unknown action kind is a loud abort (M16).
        const _exhaustive: never = action
        throw new Error(`applyActions: unknown action kind ${JSON.stringify(_exhaustive)}`)
      }
    }
  }
  return next
}
