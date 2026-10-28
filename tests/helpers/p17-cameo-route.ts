// ── P17 Shape A routes: a lawful engaged studio at the 1956 cameo unlock (no state surgery) ──────────────
//
// Not a test file. The world is the headless world ticked naturally to week 1871, a studio founded there by the
// historical-control route p15c2-route-l.ts uses at 6188 (1356-C3 `foundMidGame`: the roster signed in the draft and
// the draft closed before the industry exists, then the industry opens by `migration` at that week), and one ordinary
// tick to week 1872 (1956 Week 1). The founding signs two pictures' worth of seated people, so a second package exists
// while the first is in production. Imports only modules the parent 2c50c9df has, so every law pinned on this route runs
// RED there by assertion: the parent ignores `cameos` on the greenlight and keeps no cameo root.

import { applyActions } from '../../src/core/actions.js'
import { assignmentRefusal, contractEndRefusal, retirementRecordFor } from '../../src/core/careerLifecycle.js'
import { beginFoundingHistoricalControl, busyTalentIds } from '../../src/core/employment.js'
import { MARKETING_BUDGET_LEVELS } from '../../src/core/grid.js'
import { initializeHollywood, studioEmployerId } from '../../src/core/hollywood.js'
import { studioWeeklyFixedCost } from '../../src/core/powerRankingArchive.js'
import { resolveShape } from '../../src/core/shape.js'
import { loanMaxPrincipal } from '../../src/core/studioLoan.js'
import { roleOVR } from '../../src/core/talentSummary.js'
import { tick } from '../../src/core/tick.js'
import { TUNING } from '../../src/core/tuning.js'
import { generateWorld } from '../../src/core/worldgen.js'
import type { Action, FilmConcept, FilmShape, GameState, Talent } from '../../src/core/types.js'

/** The adopted unlock (contract §2: 1956 Week 1, absolute week 1872), spelled here so this helper imports nothing new. */
export const UNLOCK_WEEK = 1872

/** The booking a greenlight carries (src/core/cameo.ts CameoBookingRequest), spelled locally. */
export type Ask = { talentId: string; workWeek: number; fee: number; basis: 'employee' | 'freelance' }
/** The persisted booking (src/core/types.ts CameoBooking), the fields these tests read. */
export type Booking = {
  bookingId: string; studioId: string; productionId: string; talentId: string; workWeek: number; bookedWeek: number
  basis: 'employee' | 'freelance'; profession: string; fee: number; retained: number; status: 'reserved' | 'completed' | 'cancelled'
  completedWeek: number | null; completedExecution: number | null; cancelledWeek: number | null; cancelReason: string | null
  refund: number | null; releasedWeek: number | null; careerEvent: Record<string, unknown> | null
}
export type Root = { version: number; nextOrdinal: number; bookings: Booking[] }
export const rootOf = (s: GameState): Root | undefined => (s as GameState & { cameos?: Root }).cameos

export type Package = { director: string; cast: [string, string, string]; craft: string }
export type CameoRoute = { before: GameState; world: GameState; a: Package; b: Package; writer: string }

const SHAPE: FilmShape = { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' }

/** The headless world ticked to `week`, never surgically dated. */
function headlessAt(seed: string, week: number): GameState {
  let world = generateWorld(seed)
  while (world.market.tick < week) world = tick(world)
  return world
}

/** The route above. A premise the seed cannot meet throws instead of passing vacuously. */
export function cameoRoute(seed: string): CameoRoute {
  const headless = headlessAt(seed, UNLOCK_WEEK - 1)
  const draft = beginFoundingHistoricalControl(headless)
  const week = draft.market.tick
  const need = { actor: 6, director: 2, writer: 1, craft: 2 } as const
  const signed: Record<keyof typeof need, string[]> = { actor: [], director: [], writer: [], craft: [] }
  let state = draft
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    const applicants = draft.founding!.applicantIds.map((id) => draft.talent.find((t) => t.id === id)!)
      .filter((t) => t.role === role && contractEndRefusal(draft, t.id, week + TUNING.CONTRACT_MAX_WEEKS) === null
        && (role === 'writer' || assignmentRefusal(draft, t.id, UNLOCK_WEEK + 1, role) === null))
    for (const person of applicants.slice(0, need[role])) {
      state = applyActions(state, [{ kind: 'signContract', talentId: person.id, termWeeks: TUNING.CONTRACT_MAX_WEEKS }])
      signed[role].push(person.id)
    }
    if (signed[role].length !== need[role]) throw new Error(`premise: the week-${week} founding draft lacks ${need[role]} seatable ${role} applicant(s)`)
  }
  const before = initializeHollywood(applyActions(state, [{ kind: 'foundStudio' }]), 'migration')
  const world = tick(before)
  if (world.market.tick !== UNLOCK_WEEK || !world.economyEngagedEver || world.hollywood === null) throw new Error('premise: the founded studio must stand engaged in the living industry at week 1872')
  const pkg = (i: number): Package => ({ director: signed.director[i]!, cast: [signed.actor[3 * i]!, signed.actor[3 * i + 1]!, signed.actor[3 * i + 2]!], craft: signed.craft[i]! })
  return { before, world, a: pkg(0), b: pkg(1), writer: signed.writer[0]! }
}

/** An engaged legacy greenlight of `concept` staffed by `pkg` (contracted, so no freelancer fee), carrying `cameos`.
 * `budget` replaces the fully funded default (the core accepts any finite, non-negative amount). */
export function greenlight(state: GameState, concept: FilmConcept, pkg: Package, writer: string, cameos?: Ask[], budget?: { negative: number; marketing: number }): Action {
  return {
    kind: 'greenlight',
    production: {
      conceptId: concept.id,
      shape: SHAPE,
      promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: { intimacy: [-1, 1], tonalWeight: [-1, 1], kineticEnergy: [-1, 1] } },
      writerId: writer,
      directorId: pkg.director,
      craftIds: [pkg.craft],
      cast: { lead: pkg.cast[0], antagonist: pkg.cast[1], support: pkg.cast[2] },
      budget: budget ?? { negative: concept.baseNegativeCost * resolveShape(SHAPE).budgetDemandMultiplier * state.era.costScale, marketing: MARKETING_BUDGET_LEVELS[0] },
    },
    ...(cameos === undefined ? {} : { cameos }),
  } as Action
}

/** The adopted fee, computed independently here (contract §4): round(0.35·(BASE + SKILL·(ovr/100)² + FAME·(fame/100)²)). */
export function expectedFee(t: Talent): number {
  const ovr = Math.min(100, Math.max(0, roleOVR(t, 'acting'))) / 100
  const fame = Math.min(100, Math.max(0, t.fame)) / 100
  return Math.round(0.35 * (TUNING.SALARY_BASE + TUNING.SALARY_SKILL_COEF * ovr * ovr + TUNING.SALARY_FAME_COEF * fame * fame))
}

export const ask = (t: Talent, workWeek: number, basis: Ask['basis'] = 'freelance'): Ask => ({ talentId: t.id, workWeek, fee: expectedFee(t), basis })

/** The most famous existing person of `role` free for a week-`week + 1 … + 8` appearance: nobody's employee now or
 * then, in no actual work, holding no retirement record (current or actor), never in `exclude`. */
export function freeGuest(state: GameState, role: Talent['role'], exclude: ReadonlySet<string>): Talent {
  const busy = busyTalentIds(state)
  const week = state.market.tick
  const guest = state.talent
    .filter((t) => t.role === role && !exclude.has(t.id) && !busy.has(t.id) && t.fame > 0
      && studioEmployerId(state, t.id) === null && studioEmployerId(state, t.id, week + TUNING.PRODUCTION_TICKS) === null
      && retirementRecordFor(state, t.id) === undefined && retirementRecordFor(state, t.id, 'actor') === undefined)
    .sort((x, y) => y.fame - x.fame || (x.id < y.id ? -1 : x.id > y.id ? 1 : 0))[0]
  if (guest === undefined) throw new Error(`premise: no free ${role} with any fame at week ${week}`)
  return guest
}

/** Run the newest active production to Release Ready, commit it and release it; the release tick runs the careers step. */
export function releaseNewest(state: GameState): GameState {
  const id = state.studio.activeProductions[state.studio.activeProductions.length - 1]!.id
  let s = state
  for (let guard = 0; guard < 2 * TUNING.PRODUCTION_TICKS && s.studio.activeProductions.find((p) => p.id === id)!.remainingTicks > 1; guard++) s = tick(s)
  if (s.studio.activeProductions.find((p) => p.id === id)?.remainingTicks !== 1) throw new Error(`premise: ${id} never reached Release Ready`)
  s = tick(applyActions(s, [{ kind: 'commitPictureToRelease', productionId: id }]), { develop: true })
  if (!s.studio.releasedFilms.some((f) => f.productionId === id)) throw new Error(`premise: ${id} did not release`)
  return s
}

// ── the player's closure while a booking is reserved (no state surgery beyond the p15b drain device) ─────────────
type ConditionView = { stage: string; distressWeeks: number; week: number }
const conditionOf = (s: GameState): ConditionView | undefined =>
  (s as unknown as { corporateCondition: { studios: { studioId: string; condition: ConditionView }[] } }).corporateCondition.studios.find((r) => r.studioId === s.hollywood!.playerStudioId)?.condition
export const closuresOf = (s: GameState): { studioId: string; closureWeek: number }[] =>
  (s as unknown as { studioClosure: { closures: { studioId: string; closureWeek: number }[] } }).studioClosure.closures

/** The p15b drain device (tests/helpers/p15b-live.ts `drainPlayer`): one test ledger row lowers cash by `amount`. */
function drain(state: GameState, amount: number): GameState {
  if (!Number.isInteger(amount) || amount <= 0) throw new Error('drain: amount must be a positive integer')
  return { ...state, studio: { ...state.studio, cash: state.studio.cash - amount },
    ledger: [...state.ledger, { week: state.market.tick, kind: 'publicity', amount: -amount, note: 'p17 cameo test drain' }] }
}

export type ClosureRoute = { booked: GameState; closed: GameState; guest: Talent; week: number }

/**
 * The player drained to -1 at week 1872 walks the corporate condition law (warning, distress) to the last distress week
 * before closure. That week it takes the lawful distress loan, is drained to exactly the guest's fee, and greenlights
 * `pkg` at zero budget with one booking four weeks out (contracted staff, so the fee is the only spend). The ordinary
 * tick then charges payroll, the condition closes the studio and the closure phase runs while the booking is reserved.
 */
export function closureRoute(world: GameState, pkg: Package, writer: string, exclude: ReadonlySet<string>): ClosureRoute {
  let s = drain(world, world.studio.cash + 1)
  for (let guard = 0; guard < 80; guard++) {
    const c = conditionOf(s)
    if (c?.stage === 'distress' && c.distressWeeks === TUNING.CORPORATE_CLOSURE_DISTRESS_WEEKS - 1) break
    s = tick(s)
  }
  const c = conditionOf(s)
  if (!(c?.stage === 'distress' && c.distressWeeks === TUNING.CORPORATE_CLOSURE_DISTRESS_WEEKS - 1)) throw new Error(`premise: the drained player never reached distress week ${TUNING.CORPORATE_CLOSURE_DISTRESS_WEEKS - 1} (at week ${s.market.tick}: ${JSON.stringify(c)})`)
  const week = s.market.tick
  const busy = busyTalentIds(s)
  const guest = s.talent
    .filter((t) => !exclude.has(t.id) && !busy.has(t.id) && t.fame > 0 && studioEmployerId(s, t.id) === null && studioEmployerId(s, t.id, week + 4) === null
      && retirementRecordFor(s, t.id) === undefined && retirementRecordFor(s, t.id, 'actor') === undefined)
    .sort((x, y) => expectedFee(x) - expectedFee(y) || (x.id < y.id ? -1 : x.id > y.id ? 1 : 0))[0]
  if (guest === undefined) throw new Error(`premise: no free guest at week ${week}`)
  const principal = loanMaxPrincipal(studioWeeklyFixedCost(s, s.hollywood!.playerStudioId))
  s = applyActions(s, [{ kind: 'takeLoan', principal }])
  const fee = expectedFee(guest)
  if (s.studio.cash < fee) throw new Error(`premise: the distress loan (${principal}) leaves cash ${s.studio.cash}, below the cheapest guest fee ${fee}`)
  if (s.studio.cash > fee) s = drain(s, s.studio.cash - fee)
  const booked = applyActions(s, [greenlight(s, s.concepts[0]!, pkg, writer, [ask(guest, week + 4)], { negative: 0, marketing: 0 })])
  return { booked, closed: tick(booked), guest, week }
}
