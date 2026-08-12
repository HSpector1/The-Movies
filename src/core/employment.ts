// ── D-11 Studio Employment, Contracts, Roster, Freelancer Market ──────────────
// A PURE module (like talentSummary/filmPackage): no React/DOM/async/IO, no time,
// no unseeded entropy. It derives employment status, prices deterministic contract
// offers, rotates the deterministic freelancer/hiring markets, opens the founding
// draft, and computes payroll/termination — all from state + the derived 'hiring'
// stream (never state.rngState). See docs/rev4-open-questions.md D-11.
//
// COMPATIBILITY (D-11.0): the employment system is ENGAGED only when the studio has
// entered it (founding open OR any contract exists). The headless M0A corpus never
// engages it, so it stays byte-identical; standing.ts is untouched.

import { clamp } from './math.js'
import { stream } from './rng.js'
import { TUNING } from './tuning.js'
import type {
  GameStateV3,
  Contract,
  CreativeRole,
  EmploymentStatus,
  FilmConcept,
  GameState,
  Talent,
} from './types.js'
import { salaryCurve } from './worldgen.js'

const iround = (x: number): number => Math.round(x)

// The fixed founding-draft role order (determinism: applicant ids appended here).
const DRAFT_ROLES: readonly { role: CreativeRole; count: keyof typeof TUNING }[] = [
  { role: 'actor', count: 'HIRING_DRAFT_ACTORS' },
  { role: 'director', count: 'HIRING_DRAFT_DIRECTORS' },
  { role: 'writer', count: 'HIRING_DRAFT_WRITERS' },
  { role: 'craft', count: 'HIRING_DRAFT_CRAFT' },
] as const

// Required starting-roster minimums, by primary role (D-11.2).
export const FOUNDING_MINIMUMS: Record<CreativeRole, number> = {
  actor: TUNING.HIRING_MIN_ACTORS,
  director: TUNING.HIRING_MIN_DIRECTORS,
  writer: TUNING.HIRING_MIN_WRITERS,
  craft: TUNING.HIRING_MIN_CRAFT,
}

// ── engagement gate (D-11.0) ─────────────────────────────────────────────────
// The employment system is engaged iff a founding draft is open OR any contract
// exists. Derived from real state — NOT a §11 SimulationFlags object.
export function employmentEngaged(state: GameStateV3): boolean {
  return state.founding !== null || state.contracts.length > 0
}

// ── D-12 economy gate (D-12.21, corrected by D-17A/R2) ───────────────────────
// The theatrical-run economy engages iff the studio is a real PLAYER studio. That is a
// PERSISTED, MONOTONIC fact (`economyEngagedEver`), not a re-derivation from the current
// collections: a studio that let every contract expire — or fired everyone — is still a
// player studio, and used to silently fall back to the headless D-1 regime (the D-16
// engagement cliff: overhead stopped, the solvency gate lapsed, an active run's weekly
// Studio Revenue stopped being paid). The headless M0A corpus never sets the flag, so it
// keeps the D-1 single-lump credit and stays byte-identical.
export function economyEngaged(state: GameState): boolean {
  return state.economyEngagedEver
}

// ── D-12 solvency gate (D-12.11) ─────────────────────────────────────────────
// One authoritative affordability check for a VOLUNTARY immediate commitment (signing,
// renewal, freelancer engagement, greenlight, marketing). Rule: cash AFTER this immediate
// transaction must be ≥ 0. Only the immediate transaction is checked — NOT future payroll
// or overhead (that is advisory runway, never a legality rule). Unavoidable weekly debits
// (payroll/overhead/existing commitments) may still push cash below zero. The engine rejects
// illegal commitments with this reason; the UI disables + shows the SAME reason.
export type Affordability = { ok: true } | { ok: false; reason: string }
export function canAfford(state: GameStateV3, amount: number): Affordability {
  const after = state.studio.cash - amount
  if (after >= 0) return { ok: true }
  return {
    ok: false,
    reason: `Insufficient cash — this ${Math.round(amount)} commitment would leave cash at ${Math.round(after)}. New commitments require cash to stay at or above zero (unavoidable weekly payroll and overhead may still run it negative).`,
  }
}

// ── contract lookups ─────────────────────────────────────────────────────────
// The active contract for a talent at the given week (default: current tick), or
// undefined. A contract is active while startWeek ≤ week < endWeekExclusive.
export function activeContract(
  state: GameState,
  talentId: string,
  week: number = state.market.tick,
): Contract | undefined {
  return state.contracts.find(
    (c) => c.talentId === talentId && c.startWeek <= week && week < c.endWeekExclusive,
  )
}

export function isContracted(state: GameState, talentId: string, week?: number): boolean {
  return activeContract(state, talentId, week) !== undefined
}

// Ids engaged in ANY active production (writer/director/cast/craft) — "busy".
export function busyTalentIds(state: GameState): Set<string> {
  const busy = new Set<string>()
  for (const p of state.studio.activeProductions) {
    busy.add(p.writerId)
    busy.add(p.directorId)
    busy.add(p.cast.lead)
    busy.add(p.cast.antagonist)
    busy.add(p.cast.support)
    for (const cid of p.craftIds) busy.add(cid)
  }
  return busy
}

// ── salary / payroll / termination math (D-11.4 / D-11.5 / D-11.9) ───────────
export function weeklySalary(annualSalary: number): number {
  return iround(annualSalary / TUNING.TICKS_PER_YEAR)
}

// Remaining guaranteed compensation from `week` to expiry (weekly × remaining weeks).
export function guaranteedComp(contract: Contract, week: number): number {
  const remainingWeeks = Math.max(0, contract.endWeekExclusive - week)
  return weeklySalary(contract.annualSalary) * remainingWeeks
}

// Early-release termination cost (D-11.9): fraction of remaining guaranteed salary.
export function terminationCost(contract: Contract, week: number): number {
  return iround(TUNING.HIRING_TERMINATION_FRACTION * guaranteedComp(contract, week))
}

// Total weekly payroll: Σ round(annualSalary/52) over contracts active at `week`.
export function weeklyPayroll(state: GameState, week: number = state.market.tick): number {
  let total = 0
  for (const c of state.contracts) {
    if (c.startWeek <= week && week < c.endWeekExclusive) total += weeklySalary(c.annualSalary)
  }
  return total
}

// Annual payroll (display): Σ annualSalary over contracts active at `week`.
export function annualPayroll(state: GameState, week: number = state.market.tick): number {
  let total = 0
  for (const c of state.contracts) {
    if (c.startWeek <= week && week < c.endWeekExclusive) total += c.annualSalary
  }
  return total
}

// Renewal window (D-11.7): open when 0 < (end − week) ≤ HIRING_RENEWAL_WINDOW_WEEKS.
export function renewalWindowOpen(contract: Contract, week: number): boolean {
  const remaining = contract.endWeekExclusive - week
  return remaining > 0 && remaining <= TUNING.HIRING_RENEWAL_WINDOW_WEEKS
}

// ── deterministic contract offer (D-11.6) ────────────────────────────────────
// askAnnualSalary = salaryCurve × ANNUAL_MULT × lengthFactor × ageFactor × jitter.
// Grounded in OVR+fame (salaryCurve), contract length, age/career stage, and a small
// per-talent scarcity jitter. Potential/Work-Ethic NEVER inflate current OVR.
export type ContractOffer = {
  talentId: string
  annualSalary: number
  signingBonus: number
  termWeeks: number
  startWeek: number
  endWeekExclusive: number
}

function ageFactor(age: number): number {
  const d = (age - TUNING.CONTRACT_AGE_PRIME) / TUNING.CONTRACT_AGE_SPREAD
  const bell = Math.max(0, 1 - d * d)
  return TUNING.CONTRACT_AGE_FACTOR_MIN + (1 - TUNING.CONTRACT_AGE_FACTOR_MIN) * bell
}

// Price an offer for a Talent OBJECT (does not require it to be in state) — so a
// Full-Custom creation PREVIEW can show terms before the person exists in the world.
export function offerForTalent(
  seed: string,
  talent: Talent,
  termWeeks: number,
  week: number,
): ContractOffer {
  const term = clamp(termWeeks, TUNING.CONTRACT_MIN_WEEKS, TUNING.CONTRACT_MAX_WEEKS)
  const lengthFactor = TUNING.CONTRACT_LENGTH_FACTOR[term] ?? 1.0
  // Per-talent scarcity jitter (stable per person; not per week/term).
  const jitterS = stream(seed, 'hiring', `offer-${talent.id}`)
  const jitter = 1 + (jitterS.next() * 2 - 1) * TUNING.CONTRACT_SCARCITY_JITTER
  const annual = iround(
    salaryCurve(talent) * TUNING.CONTRACT_ANNUAL_MULT * lengthFactor * ageFactor(talent.age) * jitter,
  )
  const signingBonus = iround(annual * TUNING.CONTRACT_SIGNING_BONUS_FRACTION)
  return {
    talentId: talent.id,
    annualSalary: annual,
    signingBonus,
    termWeeks: term,
    startWeek: week,
    endWeekExclusive: week + term,
  }
}

export function contractOffer(
  state: GameState,
  talentId: string,
  termWeeks: number,
  week: number = state.market.tick,
): ContractOffer {
  const talent = state.talent.find((t) => t.id === talentId)
  if (talent === undefined) {
    throw new Error(`contractOffer: unknown talent id "${talentId}"`)
  }
  return offerForTalent(state.seed, talent, termWeeks, week)
}

// The bounded set of term alternatives offered for a talent (D-11.6).
export function contractOfferOptions(
  state: GameState,
  talentId: string,
  week: number = state.market.tick,
): ContractOffer[] {
  return TUNING.CONTRACT_TERM_OPTIONS.map((t) => contractOffer(state, talentId, t, week))
}

// ── freelancer economics (D-11.10) ───────────────────────────────────────────
// One-film fee = round(salaryCurve × premium); a DIRECT project cost, never payroll.
export function freelancerFee(talent: Talent): number {
  return iround(salaryCurve(talent) * TUNING.FREELANCER_FEE_PREMIUM)
}

// ── deterministic markets (D-11.14) ──────────────────────────────────────────
// The "signable universe": talent neither contracted nor engaged in a production.
function signableUniverse(state: GameState): Talent[] {
  const busy = busyTalentIds(state)
  return state.talent.filter((t) => !busy.has(t.id) && !isContracted(state, t.id))
}

// Deterministic without-replacement sample of `n` ids from `pool`, drawing from
// `s` in a fixed order (partial Fisher–Yates). Returns ids in draw order.
function sampleIds(pool: readonly Talent[], n: number, s: ReturnType<typeof stream>): string[] {
  const work = pool.slice()
  const take = Math.min(n, work.length)
  for (let i = 0; i < take; i++) {
    const j = i + Math.floor(s.next() * (work.length - i))
    const tmp = work[i]!
    work[i] = work[j]!
    work[j] = tmp
  }
  return work.slice(0, take).map((t) => t.id)
}

// The current rotation epoch (D-11.14).
function marketEpoch(week: number): number {
  return Math.floor(week / TUNING.HIRING_MARKET_ROTATION_WEEKS)
}

// The rotating freelancer market: a deterministic subset of the signable universe
// for the current epoch. During a founding draft the freelancer market is empty
// (the player is assembling a roster, not staffing films yet).
export function freelancerMarketIds(state: GameState, week: number = state.market.tick): string[] {
  if (state.founding !== null) return []
  const epoch = marketEpoch(week)
  const pool = signableUniverse(state)
  const s = stream(state.seed, 'hiring', `freelancers-${epoch}`)
  return sampleIds(pool, TUNING.HIRING_FREELANCER_MARKET_SIZE, s)
}

// The rotating hiring (contract) market: free agents (always signable) FIRST, then
// a deterministic fresh subset of the signable universe, deduped and capped.
export function hiringMarketIds(state: GameState, week: number = state.market.tick): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  // free agents first (former employees), in stored order
  for (const id of state.freeAgents) {
    if (!seen.has(id) && !isContracted(state, id)) {
      seen.add(id)
      out.push(id)
    }
  }
  const epoch = marketEpoch(week)
  const pool = signableUniverse(state).filter((t) => !seen.has(t.id))
  const s = stream(state.seed, 'hiring', `market-${epoch}`)
  for (const id of sampleIds(pool, TUNING.HIRING_MARKET_SIZE, s)) {
    if (!seen.has(id)) {
      seen.add(id)
      out.push(id)
    }
  }
  return out
}

// ── employment status (D-11.1) — first-match priority, derived ────────────────
export function employmentStatus(
  state: GameState,
  talentId: string,
  week: number = state.market.tick,
): EmploymentStatus {
  if (isContracted(state, talentId, week)) return 'contracted'
  if (busyTalentIds(state).has(talentId)) return 'engagedFreelancer'
  if (freelancerMarketIds(state, week).includes(talentId)) return 'availableFreelancer'
  if (hiringMarketIds(state, week).includes(talentId)) return 'freeAgent'
  return 'unavailable'
}

// A talent is a legal film assignment (when employment is engaged, D-11.12) iff
// contracted OR currently an available freelancer. (Availability/exclusivity and
// role/discipline checks are enforced separately in applyGreenlight.)
export function assignableForFilm(
  state: GameState,
  talentId: string,
  week: number = state.market.tick,
): boolean {
  return isContracted(state, talentId, week) || freelancerMarketIds(state, week).includes(talentId)
}

// ── roster helpers (D-11.2 / D-11.3) ─────────────────────────────────────────
// The studio roster = contracted talent, in state.talent order (stable).
export function rosterTalent(state: GameState, week: number = state.market.tick): Talent[] {
  return state.talent.filter((t) => isContracted(state, t.id, week))
}

// Count of CONTRACTED talent by primary role.
export function rosterCoverage(
  state: GameState,
  week: number = state.market.tick,
): Record<CreativeRole, number> {
  const out: Record<CreativeRole, number> = { actor: 0, director: 0, writer: 0, craft: 0 }
  for (const t of rosterTalent(state, week)) out[t.role] += 1
  return out
}

// Founding minimums met iff every required discipline has ≥ its minimum (D-11.2).
export function foundingMinimumsMet(state: GameState): boolean {
  const cov = rosterCoverage(state)
  return (
    cov.actor >= FOUNDING_MINIMUMS.actor &&
    cov.director >= FOUNDING_MINIMUMS.director &&
    cov.writer >= FOUNDING_MINIMUMS.writer &&
    cov.craft >= FOUNDING_MINIMUMS.craft
  )
}

// Missing-discipline report for the founding UI (which minimums are unmet).
export function foundingGaps(state: GameState): Record<CreativeRole, number> {
  const cov = rosterCoverage(state)
  return {
    actor: Math.max(0, FOUNDING_MINIMUMS.actor - cov.actor),
    director: Math.max(0, FOUNDING_MINIMUMS.director - cov.director),
    writer: Math.max(0, FOUNDING_MINIMUMS.writer - cov.writer),
    craft: Math.max(0, FOUNDING_MINIMUMS.craft - cov.craft),
  }
}

// ── founding draft (D-11.2) — pure entry point, NOT part of generateWorld ─────
// Opens the founding draft over a freshly-generated (employment-free) world: pick a
// bounded, deterministic, varied applicant pool per role from the 'hiring' stream,
// and seed the recruitment fund. generateWorld itself stays employment-free (D-11.0),
// so the headless corpus never calls this and never engages the gate.
// D-12 script potential (capital-frontier fix): make a script's negative-cost a probabilistic
// MARKET SIGNAL of its baseline potential — higher-potential scripts tend to cost more — via a
// deterministic rank-blend (NO RNG). The generated cost MULTISET is preserved (a permutation at
// w=1); only the pairing shifts toward the strength order, and the blend weight (<1) keeps overlap
// so a cheap script can still be excellent and an expensive one mediocre. Downstream this makes a
// high-potential script MORE DEMANDING to fund (requiredNegative → budgetAdequacy), so the extra
// commercial upside is realized only when the film is properly funded, talented, and delivered.
export function correlateConceptCost(concepts: FilmConcept[]): FilmConcept[] {
  const n = concepts.length
  if (n < 2) return concepts
  const costsAsc = [...concepts.map((c) => c.baseNegativeCost)].sort((a, b) => a - b)
  const strengthRank = new Array<number>(n)
  concepts
    .map((c, i) => ({ i, s: c.baselineStrength }))
    .sort((a, b) => a.s - b.s || a.i - b.i)
    .forEach((o, rank) => {
      strengthRank[o.i] = rank
    })
  const w = TUNING.SCRIPT_COST_POTENTIAL_CORRELATION
  return concepts.map((c, i) => ({
    ...c,
    baseNegativeCost: Math.round(c.baseNegativeCost * (1 - w) + costsAsc[strengthRank[i]!]! * w),
  }))
}

export function beginFounding(state: GameState): GameState {
  if (state.founding !== null) return state
  const applicantIds: string[] = []
  for (const { role, count } of DRAFT_ROLES) {
    const pool = state.talent.filter((t) => t.role === role)
    const s = stream(state.seed, 'hiring', `draft-${role}`)
    for (const id of sampleIds(pool, TUNING[count] as number, s)) applicantIds.push(id)
  }
  return {
    ...state,
    // Engaged boundary: correlate script price with potential. M0A never reaches here, so the
    // non-engaged concept values (and the SaveFileV1 byte-identity corpus) are unchanged.
    concepts: correlateConceptCost(state.concepts),
    founding: {
      applicantIds,
      budget: TUNING.HIRING_FOUNDING_BUDGET,
      spentBonus: 0,
    },
    // D-17A/R2 — opening the founding draft is the moment this becomes a player studio.
    // Monotonic: nothing ever sets this back to false.
    economyEngagedEver: true,
  }
}
