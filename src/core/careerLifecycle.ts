// P14C.2a — THE RETIREMENT LIFECYCLE CORE (records 773 D1–D16 and 777).
//
// A professional who reaches their profession's window idle, or its hard boundary at
// all, ANNOUNCES at a birthday. The announcement fixes an effective week at least a
// year out; nothing binds them past it; at it they retire as alumni, or finish the
// picture they are seated on first. Nothing is deleted: the record is the only new fact.
//
// Pure: no React/DOM/async/IO, no time, no module-level state, and no simulation RNG
// (`rngState` never moves; P14C.4's entrants draw only their own derived streams).
// Lifecycle facts live in `state.careerLifecycle` and nowhere else. The step reads the
// week the tick has already produced (`state.market.tick`), like the market step after it.
import { ageAt, anchorOf, withTalentProvenance } from './aging.js'
import { activeContract, busyTalentIds } from './employment.js'
import { uniqueIdentity } from './hollywood.js'
import { stream } from './rng.js'
import { TUNING } from './tuning.js'
import { generateIndustryTalent } from './worldgen.js'
import type {
  CareerLifecycleRootV35, CohortReceipt, CreativeRole, FilmCreativeRole, GameState, RetirementRecord, Talent, TalentProvenanceRow,
} from './types.js'

export type LifecycleStatus = 'active' | 'announced' | 'finishing_commitments' | 'retired'

/** Stamped on every record (companion §6.2: "a deterministic, versioned intent rule"). */
export const LIFECYCLE_INTENT_RULES_VERSION = 1 as const

/** 773 D3's recency horizon, and the record span it needs (PROVISIONAL TUNING). */
export const RETIREMENT_RECENT_WORK_WEEKS = TUNING.RETIREMENT_RECENT_WORK_WEEKS

/** `{start, hard}` for a profession (773 D1), `null` for a Scientist (773 D2). */
export function retirementWindow(role: CreativeRole): { start: number; hard: number } | null {
  if (role === 'scientist') return null
  const window = TUNING.RETIREMENT_WINDOWS[role]
  return { start: window.start, hard: window.hard }
}

/** The LIVE opener (793 §5): the empty V35 root a fresh world and the live lift open.
 * The frozen V33 → V34 conversion writes its own V34 literal and never calls this. */
export function initialCareerLifecycle(week: number): CareerLifecycleRootV35 {
  return { boundaryWeek: week, records: [], cohorts: [] }
}

/** The person's record, or `undefined`. A state with NO root is only ever a frozen
 * conversion's intermediate (V18 → V19 reaches `enterRival` through
 * `initializeHollywood`): the root travels with the state, and a state that predates
 * it holds no announcement. Every live state carries the root (the V34 validator). */
export function retirementRecordFor(state: Pick<GameState, 'careerLifecycle'>, personId: string): RetirementRecord | undefined {
  return state.careerLifecycle?.records.find((record) => record.personId === personId)
}

export function lifecycleStatus(state: Pick<GameState, 'careerLifecycle'>, personId: string): LifecycleStatus {
  return retirementRecordFor(state, personId)?.status ?? 'active'
}

/** The ids a listing must drop (773 D11): finishing and retired people. Built once
 * per listing so a whole-population filter stays one pass. */
export function withdrawnPersonIds(state: Pick<GameState, 'careerLifecycle'>): Set<string> {
  const ids = new Set<string>()
  for (const record of state.careerLifecycle?.records ?? []) if (record.status !== 'announced') ids.add(record.personId)
  return ids
}

/** The typed refusal for a person who holds a record (777 §3). Every sentence carries
 * its token and the effective week; `announcedClause` says why an announced person
 * cannot take what was asked. */
export function lifecycleRefusal(record: RetirementRecord, announcedClause: string): string {
  const who = `talent "${record.personId}"`
  switch (record.status) {
    case 'announced':
      return `${who} is retirementAnnounced (effective week ${record.effectiveWeek}) — ${announcedClause} (P14C.2a)`
    case 'finishing_commitments':
      return `${who} is finishingCommitments — they finish the work they hold and take no new contract, proposal, case or assignment (effective week ${record.effectiveWeek}) (P14C.2a)`
    case 'retired':
      return `${who} is retiredFromProfession — retired at week ${String(record.retiredWeek)} (effective week ${record.effectiveWeek}) (P14C.2a)`
  }
}

/** `null` when a contract ending at `endWeekExclusive` may bind this person; else a
 * reason carrying `retirementAnnounced`, `finishingCommitments` or
 * `retiredFromProfession` (777 §3). A term ending exactly AT the effective week binds. */
export function contractEndRefusal(state: Pick<GameState, 'careerLifecycle'>, personId: string, endWeekExclusive: number): string | null {
  const record = retirementRecordFor(state, personId)
  if (record === undefined) return null
  if (record.status === 'announced' && endWeekExclusive <= record.effectiveWeek) return null
  return lifecycleRefusal(record, `a contract ending at week ${endWeekExclusive} would bind them past it`)
}

/** `null` when a production seat assigned at `week` is lawful for this person (773 D9):
 * an announced person is seated only while `week + PRODUCTION_TICKS + 1 <= effectiveWeek`;
 * a finishing or retired person never. */
export function assignmentRefusal(state: Pick<GameState, 'careerLifecycle'>, personId: string, week: number): string | null {
  const record = retirementRecordFor(state, personId)
  if (record === undefined) return null
  if (record.status === 'announced' && week + TUNING.PRODUCTION_TICKS + 1 <= record.effectiveWeek) return null
  return lifecycleRefusal(record, `a production seat taken at week ${week} cannot release before it`)
}

/** An interval `[start, end)` is active at some week of `[from, to]`. */
function activeWithin(start: number, end: number, from: number, to: number): boolean {
  const first = Math.max(start, from)
  return first <= to && first < end
}

/** Every binding end in force for this person at `week`: the player contract active
 * then, and every P12 interval (player mirror or rival) active then. An interval is
 * active at `v` iff `terms.startWeek <= v < (endedWeek ?? terms.endWeekExclusive)`. */
function endsInForce(state: GameState, personId: string, week: number): number[] {
  const ends: number[] = []
  const contract = activeContract(state, personId, week)
  if (contract !== undefined) ends.push(contract.endWeekExclusive)
  for (const row of state.hollywood?.employment ?? []) {
    if (row.terms.talentId !== personId) continue
    const end = row.endedWeek ?? row.terms.endWeekExclusive
    if (activeWithin(row.terms.startWeek, end, week, week)) ends.push(end)
  }
  return ends
}

/** IDLE as 777 §4 states it (773 D3): no P12 interval and no player contract active at
 * any week of `[w − 104, w]`, not busy at `w`, and a provenance anchor at or before
 * `w − 104` (773 D3a: "no recorded work" must not be read as "no recent work" while the
 * record is younger than the horizon). NOTE (record 779): the T0 minter's paper
 * predictor tested P12 employment only AT the birthday and never tested the seat; the
 * rule text above is what is implemented. */
function idle(state: GameState, personId: string, week: number, busy: () => ReadonlySet<string>): boolean {
  const from = week - RETIREMENT_RECENT_WORK_WEEKS
  if (state.contracts.some((c) => c.talentId === personId && activeWithin(c.startWeek, c.endWeekExclusive, from, week))) return false
  for (const row of state.hollywood?.employment ?? []) {
    if (row.terms.talentId === personId && activeWithin(row.terms.startWeek, row.endedWeek ?? row.terms.endWeekExclusive, from, week)) return false
  }
  if (busy().has(personId)) return false
  const row = state.talentProvenance.rows.find((candidate) => candidate.personId === personId)
  if (row === undefined) throw new Error(`careerLifecycle: ${personId} has no talent provenance row to read a record span from`)
  return anchorOf(row).week <= from
}

/** 773 D10: the lifecycle NEVER ends a contract. D7 guarantees every contract ends by
 * the effective week, so the P10 expiry and `finishHollywoodWeek` have already written
 * those ends with their receipts; a binding still active here is a broken cap. */
function retire(state: GameState, record: RetirementRecord, week: number): RetirementRecord {
  const ends = endsInForce(state, record.personId, week)
  if (ends.length > 0) {
    throw new Error(
      `careerLifecycle: ${record.personId} cannot retire at week ${week} — a contract or employment interval ending at week ${Math.max(...ends)} ` +
      `is still active past the effective week ${record.effectiveWeek} the term cap guarantees`,
    )
  }
  return { ...record, status: 'retired', retiredWeek: week }
}

/**
 * The weekly step (777 §4), on the week the tick has produced. `birthdays` are the ids
 * whose age materialized this advance, in due-bucket order (`aging.birthdaysDueAt`,
 * captured before `materializeAges` consumes the buckets). Settlement first, in record
 * order; then intent, for `birthdays` only — never a population scan; then, at a cohort
 * week, the cohort (P14C.4). Never touches `rngState`. Idempotent: a second call finds
 * every announcer already recorded, every settlement already written and the week's
 * cohort receipt already present.
 */
export function advanceCareerLifecycleWeek(state: GameState, birthdays: readonly string[]): GameState {
  // 773 D6: the lifecycle engages iff the market does.
  if (state.hollywood === null) return state
  const root = state.careerLifecycle
  // Loud, never silent: a live state MUST carry the V34 root (the market's own rule).
  if (root === undefined) {
    throw new Error('careerLifecycle: the Save V34 lifecycle root is missing — migrate this state to V34 before ticking it')
  }
  const week = state.market.tick
  let busySet: Set<string> | undefined
  const busy = (): ReadonlySet<string> => (busySet ??= busyTalentIds(state))

  // 1. settlement
  let records: RetirementRecord[] | null = null
  for (const [index, record] of root.records.entries()) {
    let settled: RetirementRecord | null = null
    if (record.status === 'announced' && record.effectiveWeek <= week) {
      settled = busy().has(record.personId)
        ? { ...record, status: 'finishing_commitments', finishingFromWeek: record.effectiveWeek }
        : retire(state, record, week)
    } else if (record.status === 'finishing_commitments' && !busy().has(record.personId)) {
      settled = retire(state, record, week)
    }
    if (settled !== null) (records ??= [...root.records])[index] = settled
  }

  // 2. intent
  const announced: RetirementRecord[] = []
  if (birthdays.length > 0) {
    const recorded = new Set(root.records.map((record) => record.personId))
    for (const personId of birthdays) {
      if (recorded.has(personId)) continue
      const person = state.talent.find((candidate) => candidate.id === personId)
      if (person === undefined) continue
      const window = retirementWindow(person.role)
      if (window === null) continue
      const cause = person.age >= window.hard ? 'hardBoundary'
        : person.age >= window.start && idle(state, personId, week, busy) ? 'idleInWindow'
          : null
      if (cause === null) continue
      recorded.add(personId)
      announced.push({
        personId,
        profession: person.role,
        intentRulesVersion: LIFECYCLE_INTENT_RULES_VERSION,
        cause,
        announcedWeek: week,
        ageAtAnnouncement: person.age,
        effectiveWeek: Math.max(week + TUNING.RETIREMENT_NOTICE_WEEKS, ...endsInForce(state, personId, week)),
        status: 'announced',
        finishingFromWeek: null,
        retiredWeek: null,
      })
    }
  }

  const settled = records === null && announced.length === 0
    ? state
    : { ...state, careerLifecycle: { ...root, records: [...(records ?? root.records), ...announced] } }

  // 3. cohort (793 §4), on the post-settlement, post-intent state. Never skipped by the
  // "nothing changed" case above: an unchanged world still requests at a cohort week.
  return isCohortWeek(week) ? advanceCohort(settled, week) : settled
}

// ── P14C.4 — deterministic replenishment (records 782 §7-8 and 793 §4) ──────────
//
// Once a campaign year, at the week the tick produces with `week % 52 === 0`, the
// industry requests entrants per film profession: the deficit to the accepted
// population, or one person when nobody active in the profession is under 30. The
// request holds at most 32 people, allotted in profession order; a clipped remainder is
// recorded, never carried. Entrants are appended to `state.talent` as one contiguous
// block, anchored in provenance at the request week, and listed as free agents. The only
// randomness is each entrant's own derived stream: `rngState` never moves.

/** The request's profession order (782 §7.1): allotment, minting and `personIds`. */
export const COHORT_PROFESSIONS: readonly FilmCreativeRole[] = ['actor', 'director', 'writer', 'craft']

/** `week > 0 && week % COHORT_REQUEST_WEEKS === 0` (782 R2). */
export function isCohortWeek(week: number): boolean {
  return week > 0 && week % TUNING.COHORT_REQUEST_WEEKS === 0
}

/**
 * 782 §7.1 over an explicit population, shared by the live step and the V35 validator so
 * the two derivations cannot disagree. `prefix` is every person who existed before the
 * request's entrants; `active_p` counts those of `p` with no `retired` record whose
 * `retiredWeek <= week`; `young_p` asks whether one of them is under 30 at `week` by
 * `ageAt` over provenance. A prefix person without a provenance row throws.
 */
export function deriveCohortRequest(
  prefix: readonly Pick<Talent, 'id' | 'role'>[],
  records: readonly Pick<RetirementRecord, 'personId' | 'status' | 'retiredWeek'>[],
  rows: readonly TalentProvenanceRow[],
  week: number,
): { requested: Record<FilmCreativeRole, number>; clipped: number } {
  const retired = new Set<string>()
  for (const record of records) {
    if (record.status === 'retired' && record.retiredWeek !== null && record.retiredWeek <= week) retired.add(record.personId)
  }
  const rowOf = new Map(rows.map((row) => [row.personId, row]))
  const active: Record<FilmCreativeRole, number> = { actor: 0, director: 0, writer: 0, craft: 0 }
  const young: Record<FilmCreativeRole, boolean> = { actor: false, director: false, writer: false, craft: false }
  for (const person of prefix) {
    const row = rowOf.get(person.id)
    if (row === undefined) throw new Error(`careerLifecycle: ${person.id} has no talent provenance row to derive a cohort request from`)
    if (person.role === 'scientist' || retired.has(person.id)) continue
    active[person.role]++
    if (ageAt(row, week) < TUNING.COHORT_YOUTH_BELOW_AGE) young[person.role] = true
  }
  const requested: Record<FilmCreativeRole, number> = { actor: 0, director: 0, writer: 0, craft: 0 }
  let room = TUNING.COHORT_MAX_PER_REQUEST
  let clipped = 0
  for (const role of COHORT_PROFESSIONS) {
    const wanted = Math.max(TUNING.COHORT_ACCEPTED_POPULATION[role] - active[role], young[role] ? 0 : 1)
    requested[role] = Math.min(wanted, room)
    room -= requested[role]
    clipped += wanted - requested[role]
  }
  return { requested, clipped }
}

/** The request 782 §7.1 derives from `state` AS GIVEN (the caller passes the
 * post-settlement state): every person in it is the prefix. */
export function cohortRequest(state: GameState, week: number): {
  requested: Record<FilmCreativeRole, number>
  clipped: number
  talentCountBefore: number
} {
  return {
    ...deriveCohortRequest(state.talent, state.careerLifecycle.records, state.talentProvenance.rows, week),
    talentCountBefore: state.talent.length,
  }
}

/** The exact entrant age on the entrant's own stream (793 §4, 782 R5). */
export function cohortEntrantAge(seed: string, personId: string): number {
  const { mean, sd, lo, hi } = TUNING.COHORT_ENTRANT_AGE
  return stream(seed, 'worldgen', `p14c4-cohort-age/v1:${personId}`).truncatedNormal(mean, sd, lo, hi)
}

/** Step 3 at a cohort week: ONE receipt per request week, including an empty request.
 * Idempotent: a receipt for `week` already present means the step has run. */
function advanceCohort(state: GameState, week: number): GameState {
  const root = state.careerLifecycle
  // Loud, never silent: the step needs the V35 receipts to know whether it has run.
  if (root.cohorts === undefined) {
    throw new Error('careerLifecycle: the Save V35 cohort receipts are missing — migrate this state to V35 before ticking it')
  }
  if (root.cohorts.some((receipt) => receipt.week === week)) return state
  const { requested, clipped, talentCountBefore } = cohortRequest(state, week)
  const taken = new Set(state.talent.map((person) => person.id))
  const talent = [...state.talent]
  const entered: { id: string; age: number }[] = []
  for (const role of COHORT_PROFESSIONS) {
    for (let n = 0; n < requested[role]; n++) {
      const id = uniqueIdentity(`person-cohort-${week}-${role}-${n}`, taken)
      const exact = cohortEntrantAge(state.seed, id)
      // The committed person stores the floor; provenance below keeps the exact age.
      talent.push({ ...generateIndustryTalent(state.seed, id, role, undefined, exact), age: Math.floor(exact) })
      entered.push({ id, age: exact })
    }
  }
  const personIds = entered.map((person) => person.id)
  const receipt: CohortReceipt = { week, talentCountBefore, requested, clipped, personIds }
  let next: GameState = {
    ...state,
    talent,
    freeAgents: [...state.freeAgents, ...personIds],
    careerLifecycle: { ...root, cohorts: [...root.cohorts, receipt] },
  }
  // Anchored at `state.market.tick`, which is `week` here (the step reads the produced week).
  for (const person of entered) next = withTalentProvenance(next, person)
  return next
}
