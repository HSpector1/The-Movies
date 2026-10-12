// ── 1364: the recruitment-fund authority `foundingFunding` (1364-A §3; 1362-O third response) ──
//
// Authority (docs/engineering/playability-launch-review/evidence/p14b4-20260919/): 1364-R (the
// supported browser import accepts an open draft past week 0), 1362-O "The third response" (the
// Owner: fix both invariant failures; invent no payment, backdate nothing, charge nothing twice,
// weaken no validator; preserve week-0 founding and existing supported saves), 1364-A §3 (this
// representation) and §5 (the RED cases).
//
// A founding signature draws the recruitment fund, never cash (actions.ts, D-11.2). After week 0
// the live industry records that signature as a `player-contract` row, and the Hollywood validator
// demands an operating-cash signing row for every such row except the observed migration
// contracts and the fresh week-0 draft. Closing the draft discards the fund, so a lawful late
// signature had no durable proof of its payment source (1364-A §2.A). This root persists that
// proof: the fund the draft opened with, and one allocation per funded signature, joined to the
// employment recorder's own contract id. It is pure data; it invents no payment and backdates
// nothing. It is not a P15 root and never joins P15_ROOT_KEYS or p15Sequence.
//
// Scope (parent ruling 2026-10-11 R-A, an amendment to 1364-A §3): the fund is recorded only for a
// draft opened or observed open after week 0 over a living industry (the migration-origin late
// founding the Owner's third response names). A week-0 opening keeps the ordinary cash path and a
// null fund (the Owner: "preserve normal week-0 founding"), and the validator refuses a fund
// recorded at week 0.
//
// One founding per campaign (parent ruling 2026-10-11 R-B): a campaign whose player studio has
// founded, at any week, never opens another draft or receives another grant. The refusal rests on
// the campaign's founding facts (`campaignHasFounded`), never on the fund alone, because a week-0
// founding records no fund. The action and the save validator read the same predicate.
//
// Conservation (parent ruling 2026-10-11 R-D, amended by R-E item 4): a save founded before P08A
// studio history recorded keeps no landmark, no fund and no fresh industry. No supported surface opens
// a founding on it or on a never-founded campaign that signed outside a draft (the browser adapter and
// the Bridge open one only through newGame over a fresh world), so both refuse on the fact they share:
// an economy engaged with no draft open. The weekly overhead amounts do separate the two (each row
// charges OVERHEAD_BASE plus OVERHEAD_PER_EMPLOYEE per contract, a head count), but a forger can edit
// a derived value, and a rule on it would serve only that unreachable population.
//
// Lawful-history invariants (integrator ruling R-E, 2026-10-11): on every campaign with a recorded fund
// or an open draft the reader holds I1 (a fund closes in its recording week, and an open fund exists only
// in it), I2 (no player employment precedes an opened fund's first signature), I3 (the fund's interval
// holds only its allocated signatures) and I4 (payroll and overhead once a week, before the current
// week). The reader is not an authenticator: a save that satisfies them and that a lawful history could
// write loads as lawful.
import type { GameState } from './types.js'

export type FoundingFundingAllocation = { contractId: string; week: number; amount: number }
export type FoundingFund = {
  /** `opened`: a public beginFounding opened this draft and recorded its fund at once.
   * `observed-open-draft`: the fund was observed on an already-open draft (a migration, or a
   * public beginFounding over a draft the historical control opened): a present balance only. */
  provenance: 'opened' | 'observed-open-draft'
  budget: number
  /** Spending already on the draft when recording began. Observed, never attributed to a row. */
  spentAtRecording: number
  /** spentAtRecording plus every allocation, advanced with each signature; mirrors founding.spentBonus while open. */
  spentBonus: number
  /** The industry employment register's length when recording began: the covered interval starts here. */
  openingEmploymentCount: number
  closedWeek: number | null
  closingEmploymentCount: number | null
  allocations: FoundingFundingAllocation[]
}
export type FoundingFundingRoot = { version: 1; recordedFromWeek: number; fund: FoundingFund | null }
/** What the frozen validator chain needs from a validated root: the funded contract ids. */
export type FoundingFundingContext = Readonly<{ fundedContractIds: ReadonlySet<string> }>

export const TICK_OPEN_DRAFT_REFUSAL = 'tick: complete studio founding before advancing the campaign'
/** R-B: the stem every second-founding refusal carries, at the action and in the save validator. */
export const SECOND_FOUNDING_REFUSAL = 'a founded campaign never opens a second founding draft or receives a second founding grant'

/** R-D: the stem of the action's refusal for a campaign that records no founding but engaged its economy
 * outside a founding draft (a pre-history founding or a signing outside any draft; r6 verification M5). */
export const ENGAGED_FOUNDING_REFUSAL = 'a campaign whose economy engaged outside a founding draft never opens one (parent ruling R-D)'

/** R-B: the founding facts a save records. The player studio has founded once the save holds any of:
 * - its P08A `studioFounded` landmark (foundStudio writes it whenever the economy is engaged, and
 *   every draft opening engages it);
 * - its recorded fund's closure (1364: closed in the same transition as the draft);
 * - with no draft open, a fresh industry (`hollywood.origin` 'fresh', whose player identity carries
 *   the campaign founding record {kind: 'campaign', week: 0}): a campaign mints one only with its
 *   week-0 draft (beginFounding at week 0), and foundStudio is a draft's only exit. (The p13a/s4
 *   evidence fixtures mint one with no draft and engagement forced; they count as founded, as at r4.)
 * Read defensively, so the validator applies it to the raw save before the frozen chain proves the rest. */
export function campaignRecordsFounding(state: { founding?: unknown; studioHistory?: unknown; foundingFunding?: unknown; hollywood?: unknown }): boolean {
  const fund = isRecord(state.foundingFunding) ? state.foundingFunding.fund : null
  const draftOpen = state.founding !== null && state.founding !== undefined
  return foundedWeeks(state).length > 0 || (isRecord(fund) && fund.closedWeek !== null) ||
    (!draftOpen && isRecord(state.hollywood) && state.hollywood.origin === 'fresh')
}

/** R-B with R-D: the one predicate the action (`beginFoundingDraft`) and the save validator both read.
 * It adds to the recorded founding facts, with no draft open, `economyEngagedEver`: every draft opening
 * and every signing sets it, and nothing clears it. Every save founded before studio history recorded
 * keeps it; so does a never-founded campaign that signed outside a draft (an operating-phase signing or
 * a talent-market settlement). R-D refuses both on purpose, on unreachability alone (R-E item 4): no
 * supported surface opens a founding on such a campaign. The validator cannot re-read this fact at a
 * draft's opening (the opening engages the economy), so it reads the save's witnesses of that engagement
 * instead (`chargeBefore`, the pre-draft employment and R-E's I2 in `validateFoundingFunding`). */
export function campaignHasFounded(state: { founding?: unknown; studioHistory?: unknown; foundingFunding?: unknown; hollywood?: unknown; economyEngagedEver?: unknown }): boolean {
  const draftOpen = state.founding !== null && state.founding !== undefined
  return campaignRecordsFounding(state) || (!draftOpen && state.economyEngagedEver === true)
}
export const FOUNDING_FUNDING_ROOT_KEYS = ['fund', 'recordedFromWeek', 'version'] as const
const FUND_KEYS = ['allocations', 'budget', 'closedWeek', 'closingEmploymentCount', 'openingEmploymentCount', 'provenance', 'spentAtRecording', 'spentBonus'] as const
const ALLOCATION_KEYS = ['amount', 'contractId', 'week'] as const

/** The root a fresh world, a migration of a closed or week-0 campaign and a historical lift write:
 * no fund recorded, recording from `week`. It makes no claim about any past founding. */
export const initialFoundingFunding = (week: number): FoundingFundingRoot => ({ version: 1, recordedFromWeek: week, fund: null })

type Recorded = Pick<GameState, 'founding' | 'hollywood' | 'market'> & { foundingFunding?: FoundingFundingRoot }

/** Whether a state's open draft is one this authority records: open, after week 0, over a living industry. */
export function recordsFoundingFund(state: Pick<GameState, 'founding' | 'hollywood' | 'market'>): boolean {
  return state.founding !== null && state.hollywood !== null && state.market.tick > 0
}

/** The root an open draft receives when recording begins: `opened` with nothing spent, or
 * `observed-open-draft` with the draft's present balance observed in both spending fields. The
 * covered interval starts at the register's current length. No allocation is inferred. */
export function recordFoundingFund(state: Recorded, provenance: FoundingFund['provenance']): FoundingFundingRoot {
  if (!recordsFoundingFund(state)) throw new Error('foundingFunding: only an open draft after week 0 over a living industry records a fund')
  const founding = state.founding!
  if (provenance === 'opened' && founding.spentBonus !== 0) throw new Error('foundingFunding: an opened fund records no spending')
  return {
    version: 1,
    recordedFromWeek: state.market.tick,
    fund: {
      provenance, budget: founding.budget, spentAtRecording: founding.spentBonus, spentBonus: founding.spentBonus,
      openingEmploymentCount: state.hollywood!.employment.length, closedWeek: null, closingEmploymentCount: null, allocations: [],
    },
  }
}

/** The one allocation of a founding signature: the recorder's own contract id for `talentId`, at
 * its actual start week, for its actual signing bonus, appended after the recorder has written the
 * row. A state with no recorded open fund is returned unchanged (week 0, or a headless draft). */
export function allocateFoundingSignature(state: GameState, talentId: string): GameState {
  const root = state.foundingFunding
  const fund = root.fund
  if (fund === null || fund.closedWeek !== null) return state
  const h = state.hollywood
  if (h === null) throw new Error('foundingFunding: a recorded fund requires a living industry')
  const week = state.market.tick
  const allocated = new Set(fund.allocations.map((a) => a.contractId))
  const row = h.employment.find((e, ordinal) => ordinal >= fund.openingEmploymentCount && e.studioId === h.playerStudioId &&
    e.reason === 'player-contract' && e.terms.talentId === talentId && e.terms.startWeek === week && !allocated.has(e.contractId))
  if (row === undefined) throw new Error(`foundingFunding: the founding signature of ${talentId} at week ${week} was not recorded as a player contract`)
  const allocation: FoundingFundingAllocation = { contractId: row.contractId, week: row.terms.startWeek, amount: row.terms.signingBonus }
  return { ...state, foundingFunding: { ...root, fund: { ...fund, spentBonus: fund.spentBonus + allocation.amount, allocations: [...fund.allocations, allocation] } } }
}

/** Closes the fund in the same pure transition that closes the draft; allocations stay forever. */
export function closeFoundingFund(state: GameState): GameState {
  const root = state.foundingFunding
  if (root.fund === null || root.fund.closedWeek !== null) return state
  if (state.hollywood === null) throw new Error('foundingFunding: a recorded fund requires a living industry')
  return { ...state, foundingFunding: { ...root, fund: { ...root.fund, closedWeek: state.market.tick, closingEmploymentCount: state.hollywood.employment.length } } }
}

// ── the validator (1364-A §3 invariants; §5 item 7 mutants) ─────────────────────────────
const isRecord = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value)
const sameKeys = (value: Record<string, unknown>, keys: readonly string[]): boolean => {
  const own = Object.keys(value).sort()
  return own.length === keys.length && own.every((key, i) => key === keys[i])
}
const isWeek = (value: unknown): value is number => Number.isSafeInteger(value) && (value as number) >= 0
const isAmount = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0

type RegisterRow = { contractId: string; studioId: string; reason: string; talentId: string; startWeek: number; signingBonus: number }

/** The employment register, read defensively from the raw state: the frozen chain proves the rest
 * of the industry afterwards; this only needs the joins to fail by name. */
function register(raw: Record<string, unknown>, fail: (message: string) => never): { playerStudioId: string; rows: RegisterRow[] } {
  const h = raw.hollywood
  if (!isRecord(h) || typeof h.playerStudioId !== 'string' || !Array.isArray(h.employment)) return fail('a recorded fund requires a living industry with an employment register')
  const rows = (h.employment as unknown[]).map((row, i): RegisterRow => {
    const e = row as { contractId?: unknown; studioId?: unknown; reason?: unknown; terms?: { talentId?: unknown; startWeek?: unknown; signingBonus?: unknown } }
    if (typeof e.contractId !== 'string' || typeof e.studioId !== 'string' || typeof e.reason !== 'string' || !isRecord(e.terms) ||
      typeof e.terms.talentId !== 'string' || !isWeek(e.terms.startWeek) || !isAmount(e.terms.signingBonus)) {
      return fail(`cannot join to employment row ${i}`)
    }
    return { contractId: e.contractId, studioId: e.studioId, reason: e.reason, talentId: e.terms.talentId, startWeek: e.terms.startWeek, signingBonus: e.terms.signingBonus }
  })
  return { playerStudioId: h.playerStudioId, rows }
}

/** R-B: the weeks of the save's P08A `studioFounded` landmarks, read defensively (the frozen chain
 * proves the history root afterwards). A campaign founded before its history began recording carries
 * none (P08A's honest absence). */
function foundedWeeks(raw: { studioHistory?: unknown }): number[] {
  const history = raw.studioHistory
  const rows: unknown[] = isRecord(history) && Array.isArray(history.rows) ? history.rows : []
  return rows.flatMap((row) => (isRecord(row) && row.kind === 'studioFounded' && isWeek(row.week) ? [row.week] : []))
}

/** R-D: the first payroll or overhead row dated before `week`, read defensively. A tick charges both
 * only while no draft is open, and a draft stays open until foundStudio, so such a row witnesses the
 * campaign operating as a studio before the draft that is open now or that a fund recorded. */
function chargeBefore(raw: Record<string, unknown>, week: number): { kind: string; week: number } | undefined {
  const ledger: unknown[] = Array.isArray(raw.ledger) ? raw.ledger : []
  return ledger.find((row): row is { kind: string; week: number } => isRecord(row) && (row.kind === 'payroll' || row.kind === 'overhead') && isWeek(row.week) && row.week < week)
}

/**
 * Validates `foundingFunding` against the raw state and returns the context the frozen chain
 * threads to `validateHollywood`. Refuses by name: root shape and version; `recordedFromWeek` in
 * [0, tick]; the pairing of fund and draft (an open draft after week 0 over an industry requires an
 * open fund; an open fund requires that draft and mirrors its budget and spending; a closed fund
 * requires a closed draft); fund shape, provenance, finite non-negative money, spending within
 * budget, `opened` with nothing spent at recording; the interval counts within the register; closure
 * fields both null or both set, closure within [recordedFromWeek, tick]; allocations with exact
 * keys, unique ids, signing order, weeks within the fund's life, each naming a player
 * `player-contract` row inside the covered interval with exactly its start week and signing bonus;
 * every such row in the interval allocated exactly once; and the spending arithmetic. Parent rulings
 * 2026-10-11: a recorded fund is recorded after week 0 (R-A); the campaign founds once (R-B), so each
 * of these is a second founding draft or grant: more than one `studioFounded` landmark; an open draft
 * or open fund on a campaign whose founding facts hold (`campaignHasFounded`); a closed fund whose
 * landmark is not exactly its own closure; an `opened` fund over an industry that is not of migration
 * origin; and (R-D) an open draft or a fund over a campaign whose save witnesses an economy engaged
 * before the draft opened: a payroll or overhead charge dated before it (before the fund's recording
 * week), or player contracts (employment recorded before the fund) whose signing bonuses exceed what
 * the draft had spent. R-E's lawful-history invariants, on every recorded fund: I1, a closed fund closed
 * in its recording week and an open fund lives only in it; I2, under `opened`, no player employment row
 * precedes the first allocation; I3, every row in [openingEmploymentCount, end) is a player
 * `player-contract` row the fund allocates; I4, no payroll or overhead row at or after market.tick and
 * none repeated within its week (an open draft with no fund admits no charge at all).
 */
export function validateFoundingFunding(raw: Record<string, unknown>, label: string): FoundingFundingContext {
  const fail = (message: string): never => { throw new Error(`${label}: foundingFunding ${message}`) }
  const root = raw.foundingFunding
  if (!isRecord(root)) return fail('root must be an object')
  if (!sameKeys(root, FOUNDING_FUNDING_ROOT_KEYS)) fail(`root must have exactly the keys ${FOUNDING_FUNDING_ROOT_KEYS.join(', ')}`)
  if (root.version !== 1) fail(`version ${String(root.version)} is unknown`)
  const market = raw.market
  const tick = isRecord(market) && isWeek(market.tick) ? market.tick : fail('requires market.tick')
  const recordedFromWeek = root.recordedFromWeek
  if (!isWeek(recordedFromWeek) || recordedFromWeek > tick) return fail(`recordedFromWeek ${String(recordedFromWeek)} is not a week in [0, ${tick}]`)
  const founding = raw.founding
  const draftOpen = founding !== null && founding !== undefined
  const founded = foundedWeeks(raw)
  if (founded.length > 1) fail(`the campaign founded more than once (studioFounded at weeks ${founded.join(', ')}): ${SECOND_FOUNDING_REFUSAL}`)
  const fund = root.fund
  if (fund === null) {
    if (draftOpen && isRecord(raw.hollywood) && tick > 0) fail('an open founding draft after week 0 requires an open recruitment fund')
    // The action's predicate: with a draft open and no fund, only a landmark can hold, an earlier founding.
    if (draftOpen && campaignHasFounded(raw)) fail(`an open founding draft on a campaign that founded at week ${founded[0]}: ${SECOND_FOUNDING_REFUSAL}`)
    if (draftOpen) {
      // R-D: the witnesses of an economy engaged before this draft opened. Every charge predates an
      // open draft; every contract was paid in cash or by a draft, so bonuses beyond this draft's
      // spending were paid before it opened.
      const charge = chargeBefore(raw, Number.POSITIVE_INFINITY)
      if (charge !== undefined) fail(`an open founding draft on a campaign whose ledger charged ${charge.kind} at week ${charge.week} (a tick charges only a studio operating outside a draft): ${SECOND_FOUNDING_REFUSAL}`)
      const contracts: unknown[] = Array.isArray(raw.contracts) ? raw.contracts : []
      const employed = contracts.reduce<number>((sum, c) => sum + (isRecord(c) && isAmount(c.signingBonus) ? c.signingBonus : 0), 0)
      const spent = (founding as { spentBonus?: unknown }).spentBonus
      if (isAmount(spent) && employed > spent) fail(`an open founding draft on a campaign whose player contracts carry signing bonuses of ${employed}, more than the ${spent} its draft has spent: ${SECOND_FOUNDING_REFUSAL}`)
    }
    return { fundedContractIds: new Set() }
  }
  if (!isRecord(fund)) return fail('fund must be null or an object')
  if (!sameKeys(fund, FUND_KEYS)) fail(`fund must have exactly the keys ${FUND_KEYS.join(', ')}`)
  if (fund.provenance !== 'opened' && fund.provenance !== 'observed-open-draft') fail(`fund.provenance ${String(fund.provenance)} is unknown`)
  for (const key of ['budget', 'spentAtRecording', 'spentBonus'] as const) if (!isAmount(fund[key])) fail(`fund.${key} must be a finite non-negative amount`)
  const budget = fund.budget as number, spentAtRecording = fund.spentAtRecording as number, spentBonus = fund.spentBonus as number
  if (spentAtRecording > budget) fail(`fund.spentAtRecording ${spentAtRecording} exceeds the budget ${budget}`)
  if (spentBonus > budget) fail(`fund.spentBonus ${spentBonus} exceeds the budget ${budget}`)
  if (fund.provenance === 'opened' && spentAtRecording !== 0) fail('an opened fund records no spending at recording (spentAtRecording must be 0)')
  if (recordedFromWeek === 0) fail('a fund is recorded only for a draft after week 0 (a week-0 draft keeps the ordinary cash path)')
  const { playerStudioId, rows } = register(raw, fail)
  const opening = fund.openingEmploymentCount
  if (!isWeek(opening) || opening > rows.length) return fail(`fund.openingEmploymentCount ${String(opening)} is not within the employment register (0..${rows.length})`)
  const closed = fund.closedWeek !== null
  if (closed !== (fund.closingEmploymentCount !== null)) fail('fund.closedWeek and fund.closingEmploymentCount must both be null (open) or both be set (closed)')
  if (closed) {
    if (!isWeek(fund.closedWeek) || fund.closedWeek < recordedFromWeek || fund.closedWeek > tick) fail(`fund.closedWeek ${String(fund.closedWeek)} is not a week in [${recordedFromWeek}, ${tick}]`)
    // R-E I1: foundStudio closes the fund in the week recordFoundingFund stamped (no tick runs between them).
    if (fund.closedWeek !== recordedFromWeek) fail(`a fund recorded from week ${recordedFromWeek} closed at week ${String(fund.closedWeek)} (foundStudio closes a fund in its recording week, and a tick refuses an open draft): ${SECOND_FOUNDING_REFUSAL}`)
    const closing = fund.closingEmploymentCount
    if (!isWeek(closing) || closing < opening || closing > rows.length) fail(`fund.closingEmploymentCount ${String(closing)} is not within [${opening}, ${rows.length}]`)
    if (draftOpen) fail('a closed fund requires a closed founding draft')
  } else {
    if (!draftOpen) fail('an open fund requires an open founding draft')
    const draft = founding as { budget?: unknown; spentBonus?: unknown }
    if (draft.budget !== budget) fail(`fund.budget ${budget} differs from founding.budget ${String(draft.budget)}`)
    if (draft.spentBonus !== spentBonus) fail(`fund.spentBonus ${spentBonus} differs from founding.spentBonus ${String(draft.spentBonus)}`)
    // R-E I1: only a tick advances the week, and a tick refuses an open draft.
    if (tick !== recordedFromWeek) fail(`an open fund recorded from week ${recordedFromWeek} at week ${tick} (a tick refuses an open draft, so an open fund stays in its recording week): ${SECOND_FOUNDING_REFUSAL}`)
  }
  // The fund's draft is the campaign's one founding. While it is open the action's predicate must not
  // hold (only a landmark can: an earlier founding); once closed, its landmark is exactly the closure.
  if (!closed && campaignHasFounded(raw)) fail(`a fund recorded from week ${recordedFromWeek} on a campaign that founded at week ${founded[0]}: ${SECOND_FOUNDING_REFUSAL}`)
  if (closed && founded.length === 0) fail(`a fund closed at week ${String(fund.closedWeek)} without its own studioFounded landmark: ${SECOND_FOUNDING_REFUSAL}`)
  if (closed && founded[0] !== fund.closedWeek) fail(`a fund recorded from week ${recordedFromWeek} on a campaign that founded at week ${founded[0]}: ${SECOND_FOUNDING_REFUSAL}`)
  // An `opened` fund records the draft a public beginFounding opened at recordedFromWeek. The action's
  // predicate refuses a fresh industry (its week-0 draft founded the campaign), so the industry under
  // an opened fund is of migration origin.
  const origin = (raw.hollywood as Record<string, unknown>).origin
  if (fund.provenance === 'opened' && origin !== 'migration') fail(`an opened fund recorded from week ${recordedFromWeek} over a ${String(origin)}-origin industry (beginFounding opens a fund only over a migration-origin industry): ${SECOND_FOUNDING_REFUSAL}`)
  // R-D: the fund's draft opened on a campaign whose economy had not engaged outside a draft. Its
  // witnesses: a tick charge dated before the recording week, or player employment recorded before the
  // fund whose bonuses exceed what the draft had spent by then (an opened draft had spent nothing).
  const charge = chargeBefore(raw, recordedFromWeek)
  if (charge !== undefined) fail(`a fund recorded from week ${recordedFromWeek} on a campaign whose ledger charged ${charge.kind} at week ${charge.week} before the draft opened (a tick charges only a studio operating outside a draft): ${SECOND_FOUNDING_REFUSAL}`)
  const employed = rows.slice(0, opening).reduce((sum, row) => sum + (row.studioId === playerStudioId ? row.signingBonus : 0), 0)
  if (employed > spentAtRecording) fail(`a fund recorded from week ${recordedFromWeek} on a campaign whose player employment recorded before the fund carries signing bonuses of ${employed}, more than the ${spentAtRecording} its draft had spent by then: ${SECOND_FOUNDING_REFUSAL}`)
  const end = closed ? (fund.closingEmploymentCount as number) : rows.length
  const lastWeek = closed ? (fund.closedWeek as number) : tick
  if (!Array.isArray(fund.allocations)) return fail('fund.allocations must be an array')
  const covered = new Map<string, RegisterRow & { ordinal: number }>()
  for (let ordinal = opening; ordinal < end; ordinal++) {
    const row = rows[ordinal]!
    if (row.studioId === playerStudioId && row.reason === 'player-contract') covered.set(row.contractId, { ...row, ordinal })
  }
  const seen = new Set<string>()
  let sum = spentAtRecording
  // Signing order is the register's order: the recorder appends one row per signature.
  let previousOrdinal = -1
  let firstOrdinal = end
  for (const [i, value] of (fund.allocations as unknown[]).entries()) {
    if (!isRecord(value) || !sameKeys(value, ALLOCATION_KEYS)) return fail(`allocation ${i} must have exactly the keys ${ALLOCATION_KEYS.join(', ')}`)
    const { contractId, week, amount } = value
    if (typeof contractId !== 'string') return fail(`allocation ${i} contractId must be a string`)
    if (!isAmount(amount)) return fail(`allocation ${contractId} amount must be a finite non-negative amount`)
    if (!isWeek(week) || week < recordedFromWeek || week > lastWeek) return fail(`allocation ${contractId} week ${String(week)} is outside the fund's life [${recordedFromWeek}, ${lastWeek}]`)
    if (seen.has(contractId)) fail(`duplicate allocation for contract ${contractId}`)
    seen.add(contractId)
    const row = covered.get(contractId)
    if (row === undefined) return fail(`allocation ${contractId} names no player founding signature in the fund's interval [${opening}, ${end})`)
    if (row.ordinal <= previousOrdinal) fail(`allocations are out of signing order at ${contractId}`)
    if (i === 0) firstOrdinal = row.ordinal
    previousOrdinal = row.ordinal
    if (row.startWeek !== week) fail(`allocation ${contractId} week ${week} differs from the contract's start week ${row.startWeek}`)
    if (row.signingBonus !== amount) fail(`allocation ${contractId} amount ${amount} differs from the contract's signing bonus ${row.signingBonus}`)
    sum += amount
  }
  for (const contractId of covered.keys()) if (!seen.has(contractId)) fail(`founding signature ${contractId} has no recruitment allocation`)
  if (sum !== spentBonus) fail(`fund.spentBonus ${spentBonus} must equal spentAtRecording plus the allocations (${sum})`)
  // R-E I2: beginFounding opens a fund only on a campaign that never engaged, and every contract (so every
  // player employment row) engages; while the draft is open it adds only its own signatures.
  if (fund.provenance === 'opened') {
    const prior = rows.findIndex((row, ordinal) => ordinal < firstOrdinal && row.studioId === playerStudioId)
    if (prior >= 0) fail(`an opened fund recorded from week ${recordedFromWeek} on a campaign whose player employment row ${prior} (${rows[prior]!.reason}) precedes the fund's first founding signature (beginFounding opens a fund only on a campaign that never engaged): ${SECOND_FOUNDING_REFUSAL}`)
  }
  // R-E I3: while the draft is open no tick runs and nothing but its signatures employs anybody (release
  // and renewal wait for the founding), so the interval holds exactly the allocated rows. This pins the
  // opening count.
  for (let ordinal = opening; ordinal < end; ordinal++) {
    const row = rows[ordinal]!
    if (row.studioId !== playerStudioId || row.reason !== 'player-contract') fail(`employment row ${ordinal} (${row.studioId === playerStudioId ? 'player' : 'rival'} ${row.reason}) lies inside the fund's interval [${opening}, ${end}), which holds only its draft's founding signatures`)
  }
  // R-E I4: tick.ts writes one payroll and one overhead row a week, dated the week it advances from.
  const charged = new Set<string>()
  for (const row of Array.isArray(raw.ledger) ? (raw.ledger as unknown[]) : []) {
    if (!isRecord(row) || (row.kind !== 'payroll' && row.kind !== 'overhead') || !isWeek(row.week)) continue
    if (row.week >= tick) fail(`the ledger charged ${row.kind} at week ${row.week}, not before the current week ${tick} (a tick charges the week it advances from)`)
    if (charged.has(`${row.kind}@${row.week}`)) fail(`the ledger charged ${row.kind} twice at week ${row.week} (a tick charges it once a week)`)
    charged.add(`${row.kind}@${row.week}`)
  }
  return { fundedContractIds: seen }
}
