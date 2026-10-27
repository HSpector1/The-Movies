import { acquiredActiveRunFilms } from './absorbedRuns.js'
import { absorbedPromiseAuthority, type AbsorptionWithdrawalAuthority } from './absorbedObligations.js'
import { buyerOperatedProductions, buyerContinuedProductions } from './continuedWork.js'
// ── P15B Wave 4 (record 1370-ar): the actual closure, `closure/v1` ──────────────────────────────
// Authority (docs/engineering/playability-launch-review/evidence/p14b4-20260919/1367-stage/p15b-prep/
// P15B-WAVE4-CLOSURE-CONTRACT.md, adopted by 1367-G): §2 the boundary (closure week C is the first
// non-operating boundary; closure due at C is closed at C, after the condition step and before the Legacy
// freeze; the loan stops at C: an installment due at d is charged iff d < C), the phase table version 2
// and the Ranking closure cohort; §3 one capped claim per live employment interval, paid in ascending
// contract id then claim id from floor(max(0, cash)); §4 one typed disposition per live subject and the
// 13-week estate; §5 one atomic validated transaction, bidirectional completeness, a digest, ≤100-row
// query pages, era-gated roots, no lossy downgrade. 1353-A §7's end-of-run hook is typed here and
// disabled until the Legacy adapter amendment is adopted (1367-G).
//
// Nothing here imports `rng.js`. One law for every studio; the player's studio differs only in where
// its cash, contracts and work live, and in that its world is read-only from C (nothing ticks it).
//
// r3 (the 1370-ar review): staff released by any studio's closure become ordinary free agents at C; a market
// case whose subject studio closes is invalidated in the transaction and an in-flight adoption stops in place
// (the closed studio deploys nothing: technology.finishTechnologyWeek reads the operating state), so no
// reachable obligation makes the closure refuse inside a tick; the issuer's proposals leave the producer's own
// withdrawal receipt; estate receipts, distributions and archival are separate sequenced events and the closure
// record is immutable after creation; the save validator replays every distribution (cap and priority) and
// refuses claim money no claim accounts for; every transaction validates its result before it publishes.
//
// NARROW READINGS (flagged for the merger; REPORT.md "Contract gaps"):
// - "Cancel further work" on screenplays, productions and research is implemented as the terminal
//   operating-state gate (a closed business is never advanced again) with the records retained in place
//   and a typed disposition; no status is rewritten. The frozen arrays therefore stay recomputable, which
//   is what makes bidirectional completeness checkable without copying inventories into the record.
// - The operating state is DERIVED from this root (operatingState.closedWeekOf), not a new P12 identity field.
// - The estate-run adapter is the ordinary run loop of hollywoodTick.payRuns, run alone for a closed business
//   at the ordinary input week T − 1 (money, settledWeek and the filmSettled receipt at the due week, the
//   canonical schedule); the closure phase at T records each collected installment as an estate event.
// - After archival, a still-active estate run would keep collecting its genuinely scheduled receipts and pay
//   unpaid claims (amounts rule; `unpaidArchived` means zero paid). No run outlives a 13-week window today.

import { closureDue, conditionRecord, outstandingLoan, requireCorporateCondition } from './corporateConditionLive.js'
import { openTheatricalRun } from './economy.js'
import { terminationCost } from './employment.js'
import { moveRivalMoney } from './hollywood.js'
import { closedWeekOf } from './operatingState.js'
import { buildLegacyManifest, legacyFactsFromState, ENDED_LEGACY_DEFINITION, MODERN_LEGACY_DEFINITION, LEGACY_BOUNDARY_WEEK, type EndedLegacy, type OfficialLegacy } from './campaignLegacy.js'
import { validateSaveP15B, validateSaveP17, P15B_SAVE_VERSION, P17_SAVE_VERSION } from './save.js'
import { resolveTitles, subjectsHeldBy } from './rights.js'
import { buildEstateHandoff, finishEstateArchival, openEstate } from './estate.js'
import { P15_PHASE_TABLES, p15PhaseTriple } from './p15Phases.js'
import { breakPromisesOnCancel, breakPromisesOnTermination } from './promises.js'
import { CLOSURE_CASE_REASON, CLOSURE_PROPOSAL_REASON, invalidateCasesAtClosure, withdrawProposalAtClosure } from './talentMarket.js'
import { researchAfterEmploymentRelease } from './technology.js'
import { CLAIM_PAYMENT_LEDGER_NOTE, TUNING } from './tuning.js'
import type { HollywoodState, IndustryReceipt, LiveIndustryFilm, RivalBusiness } from './hollywoodTypes.js'
import type { ClosureClaim, ClosureDisposition, ClosureEstate, ClosureRecord, EstateEvent, EstateLot, GameState, LedgerEntry, StudioClosureRoot, StudioLoanRecord } from './types.js'

export { closedWeekOf, isOperatingStudio } from './operatingState.js'

export const CLOSURE_LAW_VERSION = 'closure/v1'
export const CLOSURE_PHASE_ID = 'p15b.closure'

/** The frozen law table (as the condition's): a validator judges a record by its own version's figures.
 * tests/p15b4-studio-closure.test.ts pins it equal to TUNING while both are v1. */
export const CLOSURE_LAWS = Object.freeze({
  'closure/v1': Object.freeze({ CLOSURE_ESTATE_WINDOW_WEEKS: 13 }),
})

/** 1353-A §7: the typed end-of-run hook point. Null until the prospective Legacy actual-closure adapter is
 * adopted (1367-G); when set, the transaction calls it after every disposition and stores the manifest id. */
export type EndOfRunHook = (state: GameState, closure: ClosureRecord) => { state: GameState; endOfRun: string }
export const CLOSURE_END_OF_RUN_HOOK: EndOfRunHook | null = null

export type ClosureDispositionsPage = { closureId: string; digest: string; total: number; cursor: number; rows: ClosureDisposition[]; nextCursor: number | null }
export type CloseStudioOptions = { endOfRunHook?: EndOfRunHook | null }
/** The closure phase's named options (one object, never positional). `deferPlayerClosure`: a surface that does
 * not present Wave 5 (the browser Studio Lot: no notices, no loan verb, no read-only closure screen) records the
 * player's closure due and leaves it due; its actual closure runs at the first closure phase of a surface that
 * presents it (Wave-4 contract §2 "do not enable playable closure until the Wave 5 compatibility route", 1367-G). */
export type ClosurePhaseOptions = { deferPlayerClosure?: boolean }

export const initialStudioClosure = (week: number): StudioClosureRoot =>
  ({ version: 1, recordedFromWeek: week, nextClosure: 1, nextClaim: 1, nextEstateEvent: 1, closures: [], claims: [], estateEvents: [] })

export function requireStudioClosure(state: GameState): StudioClosureRoot {
  const root = (state as Partial<GameState>).studioClosure
  if (root === undefined) throw new Error('studio closure: the state has no studioClosure root; migrate it to the P15B save step before ticking it')
  return root
}

export const closureRecordOf = (state: GameState, studioId: string): ClosureRecord | undefined =>
  requireStudioClosure(state).closures.find((c) => c.studioId === studioId)
export const claimsOfClosure = (state: GameState, closureId: string): ClosureClaim[] =>
  requireStudioClosure(state).claims.filter((c) => c.closureId === closureId)
export const estateEventsOf = (state: GameState, closureId: string): EstateEvent[] =>
  requireStudioClosure(state).estateEvents.filter((e) => e.closureId === closureId)

/** The P16 estate handoff reader (r3): the record's immutable window and R2 lots, with the status its archival
 * event decides. A player estate stays open in its saved world (nothing ticks it to D). */
export type EstateView = { closureId: string; studioId: string; opensWeek: number; closesWeek: number; status: 'open' | 'archived'; archivedWeek: number | null; lots: (EstateLot & { status: 'pending' | 'archived' })[] }
export function estateView(state: GameState, closure: ClosureRecord): EstateView {
  const archival = estateEventsOf(state, closure.closureId).find((e) => e.kind === 'archival')
  const archived = archival !== undefined
  return { closureId: closure.closureId, studioId: closure.studioId, opensWeek: closure.estate.opensWeek, closesWeek: closure.estate.closesWeek,
    status: archived ? 'archived' : 'open', archivedWeek: archival?.week ?? null, lots: closure.estate.lots.map((lot) => ({ ...lot, status: archived ? 'archived' : 'pending' })) }
}

/** The same map read from a raw state at the save boundary; null while nothing has closed. */
export function closureStops(raw: Record<string, unknown>): ReadonlyMap<string, number> | null {
  const root = raw.studioClosure
  if (root === null || typeof root !== 'object' || !Array.isArray((root as { closures?: unknown }).closures)) return null
  const closures = (root as { closures: unknown[] }).closures.filter((c): c is { studioId: string; closureWeek: number } =>
    c !== null && typeof c === 'object' && typeof (c as { studioId?: unknown }).studioId === 'string' && Number.isSafeInteger((c as { closureWeek?: unknown }).closureWeek))
  return closures.length === 0 ? null : new Map(closures.map((c) => [c.studioId, c.closureWeek]))
}

/** 1362-O §5.2: an actually closed player studio is read-only history; `tick` and `applyActions` refuse by name. */
export function assertOperatingPlayer(state: GameState, verb: string): void {
  const h = state.hollywood
  if (h === null) return
  const closedWeek = closedWeekOf(state).get(h.playerStudioId)
  if (closedWeek !== undefined) {
    throw new Error(`${verb}: the studio closed in week ${closedWeek} and is read-only history; nothing advances or acts after an actual closure (closure/v1)`)
  }
}

// ── pure laws ─────────────────────────────────────────────────────────────────────────────────
/** Contract §2: clamp(min(T, C) − contractedWeek − 1, 0, term). `stopWeek` null while the studio operates. */
export function installmentsPaid(loan: { contractedWeek: number; installments: readonly number[] }, week: number, stopWeek: number | null): number {
  const through = stopWeek === null ? week : Math.min(week, stopWeek)
  return Math.max(0, Math.min(loan.installments.length, through - loan.contractedWeek - 1))
}

/** FNV-1a over the canonical rows and the closure identity: tamper evidence beside the typed rows, never
 * a substitute for them (§5). Pure, dependency-free, browser-safe. */
export function closureDigest(closureId: string, dispositions: readonly ClosureDisposition[]): string {
  const text = [closureId, ...dispositions.map((d) => [d.subjectKind, d.subjectId, d.prior, d.result, d.status, d.claimId ?? '', d.lotId ?? '', d.lawVersion].join('\u001f'))].join('\u001e')
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}

const byContractThenClaim = (a: ClosureClaim, b: ClosureClaim): number =>
  a.sourceContractId < b.sourceContractId ? -1 : a.sourceContractId > b.sourceContractId ? 1 : a.claimId < b.claimId ? -1 : a.claimId > b.claimId ? 1 : 0

/** The status the amounts and the estate dictate (§3): they can never contradict each other. */
export function claimStatus(claim: Pick<ClosureClaim, 'original' | 'paid'>, archived: boolean): ClosureClaim['status'] {
  if (claim.paid === claim.original) return 'paid'
  if (claim.paid === 0) return archived ? 'unpaidArchived' : 'unpaid'
  return 'partiallyPaid'
}

/**
 * Contract §3: pay in ascending source contract id, then claim id, min(available, unpaid) each, in whole
 * currency units; a fractional residue stays in the account. Returns the claims in that canonical order
 * and the positive payments made, each to be booked by the caller as exactly one debit.
 */
export function distributeClaims(claims: readonly ClosureClaim[], available: number, week: number, reference: string, archived = false): { claims: ClosureClaim[]; payments: { claimId: string; talentId: string; amount: number }[] } {
  for (const claim of claims) {
    if (!(Number.isSafeInteger(claim.original) && Number.isSafeInteger(claim.paid) && claim.paid >= 0 && claim.paid <= claim.original && claim.original - claim.paid === claim.unpaid)) {
      throw new Error(`closure/v1: claim ${claim.claimId} does not satisfy original = paid + unpaid with whole non-negative amounts`)
    }
  }
  let remaining = Number.isFinite(available) ? Math.floor(Math.max(0, available)) : 0
  const payments: { claimId: string; talentId: string; amount: number }[] = []
  const paid = new Map<string, ClosureClaim>()
  for (const claim of [...claims].sort(byContractThenClaim)) {
    const amount = Math.min(remaining, claim.unpaid)
    if (amount <= 0) continue
    remaining -= amount
    payments.push({ claimId: claim.claimId, talentId: claim.claimantTalentId, amount })
    const next = { ...claim, paid: claim.paid + amount, unpaid: claim.unpaid - amount, payments: [...claim.payments, { week, amount, reference }] }
    paid.set(claim.claimId, { ...next, status: claimStatus(next, archived) })
  }
  return { claims: [...claims].sort(byContractThenClaim).map((c) => paid.get(c.claimId) ?? c), payments }
}

/** The canonical locked run of a live film (the hollywood validator's own derivation). */
function canonicalRun(film: LiveIndustryFilm) {
  const opening = film.result.boxOffice.opening
  return openTheatricalRun(film.result, opening, opening > 0 ? film.result.boxOffice.total / opening : 1, film.result.releaseTick)
}

/** Contract §4: the studio revenue of a live film's run installment due at input week `due`, null outside its
 * schedule. The estate-run adapter (hollywoodTick.payRuns) collects exactly this at T = due + 1. */
export function estateRunInstallment(film: LiveIndustryFilm, due: number): number | null {
  const run = canonicalRun(film)
  const index = due - run.releaseTick
  return index >= 0 && index < run.totalWeeks ? run.weeklyGross[index]! * run.studioShare : null
}

/** §5: a read-model page of at most CLOSURE_QUERY_PAGE_ROWS rows with a stable cursor; never the closure. */
export function closureDispositionsPage(record: Pick<ClosureRecord, 'closureId' | 'digest' | 'dispositions'>, cursor: number): ClosureDispositionsPage {
  const size = TUNING.CLOSURE_QUERY_PAGE_ROWS
  const total = record.dispositions.length
  if (!Number.isSafeInteger(cursor) || cursor < 0 || cursor % size !== 0 || (cursor > 0 && cursor >= total)) {
    throw new Error(`closure/v1: cursor ${String(cursor)} is not a page boundary of ${record.closureId} (pages of ${size} rows)`)
  }
  const rows = record.dispositions.slice(cursor, cursor + size)
  return { closureId: record.closureId, digest: record.digest, total, cursor, rows, nextCursor: cursor + size < total ? cursor + size : null }
}

// ── the transaction ───────────────────────────────────────────────────────────────────────────
type Kind = ClosureDisposition['subjectKind']
const byKindThenId = (a: ClosureDisposition, b: ClosureDisposition): number =>
  `${a.subjectKind}:${a.subjectId}` < `${b.subjectKind}:${b.subjectId}` ? -1 : `${a.subjectKind}:${a.subjectId}` > `${b.subjectKind}:${b.subjectId}` ? 1 : 0
const byId = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0)
const caseKey = (kase: { contractId: string; variant?: string }): string => `${kase.contractId}:${kase.variant ?? 'expiry'}`

/** Frozen48 creator-film ownership. Never consult a rights root at this boundary. */
function creatorFilmIds(state: GameState, h: HollywoodState, studioId: string): string[] {
  return (studioId === h.playerStudioId ? state.studio.releasedFilms.map((f) => f.productionId) : h.films.filter((f) => f.studioId === studioId).map((f) => f.filmId)).sort(byId)
}

function ownedFilmIds(state: GameState, h: HollywoodState, studioId: string, asOfWeek = state.market.tick): string[] {
  // Current ownership follows actual title history, including a bought creator's film
  // or a sold original film. Frozen48 keeps its original creator-film derivation.
  if (Object.hasOwn(state, 'rights')) {
    return subjectsHeldBy(resolveTitles(state), state.rights.estates, studioId, asOfWeek)
      .filter(subject => subject.right === 'R2').map(subject => subject.filmId).sort(byId)
  }
  return creatorFilmIds(state, h, studioId)
}

/** Whether a rival's started plan has produced its plant (completeRivalPlans' own receipts). */
function rivalPlanComplete(h: HollywoodState, planId: string, work: GameState['physicalPlans']['plans'][number]['work']): boolean {
  const commitment = h.receipts.find((r) => r.kind === 'laboratoryCommitted' && r.planId === planId)
  if (commitment?.kind === 'laboratoryCommitted') return h.receipts.some((r) => r.kind === 'laboratoryOperational' && r.facilityId === commitment.facilityId && r.studioId === commitment.studioId)
  if (work.kind === 'installation' && 'facilityId' in work.target) {
    const facilityId = work.target.facilityId
    return h.receipts.some((r) => r.kind === 'instrumentOperational' && r.facilityId === facilityId)
  }
  return false
}

/** §5 "final validation failure": a transaction validates its own result before it publishes. */
function validated(result: GameState, label: string): GameState {
  const rightsEstate=Object.hasOwn(result,'rights')
  const obligations=rightsEstate?absorbedPromiseAuthority(result):undefined
  validateStudioClosureRoot(result as unknown as Record<string, unknown>, label, { rightsEstate,
    ...(obligations===undefined?{}:{absorptionWithdrawals:obligations.withdrawalEvents}) })
  return result
}

/**
 * Contract §2–§5: one pure, validated closure transaction over the state at closure week C =
 * state.market.tick. Refuses by name (nothing written) when the studio is not closure due, is already
 * closed, or its result fails the root's own validation. Every reachable live subject has a disposition.
 */
/** Actual foreign paid scripts operated by this buyer; creator/project history remains original. */
function continuedBuyerRuns(state:GameState) {
  if(!state.rights || !state.hollywood)return []
  return state.rights.absorptions.filter(a=>a.buyerId===state.hollywood!.playerStudioId).flatMap(a=>state.hollywood!.businesses.find(b=>b.studioId===a.targetId)?.runs.filter(r=>a.runs.some(row=>row.productionId===r.productionId))??[])
}
function continuedBuyerScripts(state:GameState,buyerId=state.hollywood?.playerStudioId) {
  if(!state.rights || !state.hollywood)return []
  const player=buyerId===state.hollywood.playerStudioId
  const productions=new Set(buyerContinuedProductions(state,buyerId).map(p=>p.id))
  // Rival script IDs are local to their creator. Qualify only the new foreign rival
  // disposition subject; never rename a paid script or change historical player subjects.
  return [...state.hollywood.businesses.flatMap(b=>b.development.projects
    .filter(p=>p.productionId!==null && productions.has(p.productionId))
    .map(project=>({project,subjectId:player?project.id:`${b.studioId}:${project.id}`}))),
    ...state.rights.absorptions.flatMap(a=>((player&&(a.producerVersion==='absorption-scripts/v3'||a.producerVersion==='absorption-scripts/v4'||a.producerVersion==='absorption-scripts/v5'||a.producerVersion==='absorption-scripts/v6'||a.producerVersion==='absorption-obligations/v7'))||(!player&&(a.producerVersion==='absorption-rival-scripts/v8'||a.producerVersion==='absorption-rival-obligations/v9')))&&a.buyerId===buyerId
      ?a.continuedScripts.map(r=>({project:r.project,subjectId:r.project.id})):[])]
}

function prepareStudioClosure(state: GameState, studioId: string, causeEventId: string): GameState {
  const h = state.hollywood
  if (h === null) throw new Error('closure/v1: no industry to close a studio in')
  const week = state.market.tick
  const root = requireStudioClosure(state)
  if (root.closures.some((c) => c.studioId === studioId)) throw new Error(`closure/v1: ${studioId} is already closed; a retry is a duplicate refusal`)
  if (!closureDue(state, studioId)) throw new Error(`closure/v1: ${studioId} is not closure due at week ${week}`)
  const cause = requireCorporateCondition(state).events.find((e) => e.eventId === causeEventId)
  if (cause === undefined || cause.studioId !== studioId || cause.to !== 'closed' || cause.week > week) throw new Error(`closure/v1: ${causeEventId} is not ${studioId}'s closure-due event`)
  const identity = h.identities.find((s) => s.studioId === studioId)
  if (identity === undefined || identity.enteredWeek === null) throw new Error(`closure/v1: ${studioId} has not entered`)
  const player = studioId === h.playerStudioId
  const closureId = `studio-closure-${root.nextClosure}`
  const law = CLOSURE_LAW_VERSION
  const dispositions: ClosureDisposition[] = []
  const row = (subjectKind: Kind, subjectId: string, prior: string, result: string, status: ClosureDisposition['status'], claimId: string | null = null, lotId: string | null = null): void => {
    dispositions.push({ subjectKind, subjectId, prior, result, status, claimId, lotId, lawVersion: law })
  }

  // 1. Employment: end every live interval at C with a `closure` receipt; one capped claim each (§3).
  const hollywood: HollywoodState = { ...h, employment: [...h.employment], activeEmploymentOrdinals: [...h.activeEmploymentOrdinals], receipts: [...h.receipts], films: [...h.films],
    businesses: h.businesses.map((b) => (b.studioId === studioId ? { ...b, account: { ...b.account, periods: b.account.periods.map((p) => ({ ...p, movements: { ...p.movements } })) } } : b)) }
  const live = hollywood.activeEmploymentOrdinals.map((i) => ({ ordinal: i, row: hollywood.employment[i]! })).filter(({ row: e }) => e.studioId === studioId)
    .sort((a, b) => byId(a.row.contractId, b.row.contractId))
  let nextClaim = root.nextClaim
  const claims: ClosureClaim[] = []
  const released: string[] = []
  for (const { ordinal, row: e } of live) {
    if (e.terms.endWeekExclusive <= week) throw new Error(`closure/v1: interval ${e.contractId} should have expired at or before week ${week}`)
    const original = terminationCost(e.terms, week)
    const claimId = `closure-claim-${nextClaim}`
    nextClaim += 1
    claims.push({ claimId, closureId, studioId, kind: 'employment', sourceContractId: e.contractId, claimantTalentId: e.terms.talentId, lawVersion: law, original, paid: 0, unpaid: original,
      status: claimStatus({ original, paid: 0 }, false), payments: [] })
    hollywood.employment[ordinal] = { ...e, endedWeek: week }
    hollywood.receipts.push({ eventId: `industry-event-${hollywood.nextReceipt}`, week, studioId, kind: 'employment', talentId: e.terms.talentId, fromStudioId: studioId, toStudioId: null, contractId: e.contractId, reason: 'closure' } as IndustryReceipt)
    hollywood.nextReceipt += 1
    released.push(e.terms.talentId)
    row('employment', e.contractId, `talent ${e.terms.talentId}; through week ${e.terms.endWeekExclusive}`, `ended at week ${week}; claim ${claimId} for ${original}`, 'applied', claimId)
  }
  const releasedSet = new Set(released)
  hollywood.activeEmploymentOrdinals = hollywood.activeEmploymentOrdinals.filter((i) => !(hollywood.employment[i]!.studioId === studioId))
  let next: GameState = { ...state, hollywood }
  if (player) next = { ...next, contracts: next.contracts.filter((c) => !releasedSet.has(c.talentId)) }
  // §3 "People become ordinary free agents in week C", every studio alike (1362-O 5.1; the expiry path's order).
  next = { ...next, freeAgents: [...new Set([...next.freeAgents, ...released])] }
  const promiseAuthority=absorbedPromiseAuthority(next)
  for (const talentId of released) {
    next = { ...next, technology: researchAfterEmploymentRelease(next, talentId, studioId) }
    next = breakPromisesOnTermination(next, studioId, talentId,promiseAuthority)
  }

  // 2. The market: the studio's own proposals are withdrawn with the producer's receipt, then every open case whose
  // subject is this studio is invalidated (its interval ended at C, before the decision week): §4 row 1.
  for (const proposal of next.talentMarket.proposals.filter((p) => p.issuerStudioId === studioId)) {
    next = withdrawProposalAtClosure(next, proposal.talentId, studioId)
    row('proposal', `${studioId}:proposal:${proposal.talentId}`, `start week ${proposal.startWeek}; ${proposal.termWeeks} weeks`, 'withdrawn at closure with the market receipt', 'applied')
  }
  for (const kase of next.talentMarket.cases) {
    if (kase.outcome === null && kase.subjectStudioId === studioId) row('marketCase', caseKey(kase), `talent ${kase.talentId}; opened week ${kase.openedWeek}`, `invalidated at week ${week}: the employing studio closed`, 'applied')
  }
  next = invalidateCasesAtClosure(next, studioId)

  // 3. Work: screenplays, productions, runs, research, adoptions, plans, plant. Retained in place; the terminal
  // operating state stops them. Promises on cancelled pictures settle under the promise producer's own law.
  const business: RivalBusiness | undefined = player ? undefined : hollywood.businesses.find((b) => b.studioId === studioId)
  if (!player && business === undefined) throw new Error(`closure/v1: ${studioId} has no business`)
  const ownScripts = player ? state.scriptDevelopment.projects : business!.activeScriptOrdinals.map((i) => business!.development.projects[i]!)
  const scripts = [...ownScripts.map(project=>({project,subjectId:project.id})),...continuedBuyerScripts(state,studioId)]
  for (const {project,subjectId} of scripts) if (project.status !== 'produced') row('screenplay', subjectId, project.status, `work stopped at week ${week}; authored material, progress and spend retained; no completion`, 'applied')
  const productions = state.rights ? buyerOperatedProductions(state,studioId) : player ? state.studio.activeProductions : business!.productions
  for (const production of productions) {
    row('production', production.id, `remainingTicks ${production.remainingTicks}`, `cancelled terminally at week ${week}; footage, participants and spend frozen in place; no release`, 'applied')
    next = breakPromisesOnCancel(next, studioId, production,promiseAuthority)
  }
  if (player) {
    for (const run of [...state.theatricalRuns,...continuedBuyerRuns(state)]) if (run.status === 'active') row('theatricalRun', run.productionId, `weekIndex ${run.weekIndex} of ${run.totalWeeks}`, 'remaining scheduled receipts pending in this saved world', 'pending')
  } else {
    for (const run of business!.runs) row('theatricalRun', run.productionId, `weekIndex ${run.weekIndex} of ${run.totalWeeks}`, 'the estate collects the genuinely scheduled remaining receipts', 'applied')
    if(Object.hasOwn(state,'rights'))for(const film of acquiredActiveRunFilms(state,studioId,week))row('theatricalRun',film.filmId,`assigned run from ${film.studioId}`, 'the estate collects the genuinely assigned remaining receipts', 'applied')
  }
  for (const project of next.technology.projects) {
    if (project.studioId !== studioId || (project.status !== 'active' && project.status !== 'paused')) continue
    row('research', project.id, project.status, `stopped at week ${week}; seats released; verified progress, spend and labs retained`, 'applied')
  }
  // An adoption in flight (§4 facilities row: cancel future work, zero refund): the record stays in place and the
  // terminal operating state stops it, as for research (technology.finishTechnologyWeek reads closedWeekOf, so a
  // rival's deployment clock never runs again; nothing ticks a closed player's world). No cancellation stamp:
  // P13B-S6 reserves `cancelledWeek` for cancelled physical work (validateInstallationCancellation), and the
  // equipment stays held. A cancelled adoption is settled history, not a live subject.
  for (const adoption of next.technology.adoptions) {
    if (adoption.studioId !== studioId || adoption.operationalWeek !== null || (adoption.cancelledWeek ?? null) !== null) continue
    if (player) row('adoption', adoption.id, `committed week ${adoption.committedWeek}`, 'in flight; pending in this saved world; never operational after closure; zero refund', 'pending')
    else row('adoption', adoption.id, `committed week ${adoption.committedWeek}`, `deployment stopped at week ${week} by the terminal operating state; zero refund; equipment held in place`, 'applied')
  }
  let physicalPlans = next.physicalPlans
  for (const plan of state.physicalPlans.plans) {
    if (plan.studioId !== studioId || plan.status === 'cancelled') continue
    if (plan.status === 'started') {
      if (player) { row('physicalPlan', plan.id, plan.status, 'started placement pending in this saved world', 'pending'); continue }
      if (rivalPlanComplete(h, plan.id, plan.work)) { row('physicalPlan', plan.id, plan.status, 'complete; its plant is a terminal facility', 'applied'); continue }
      // r3: a rival build in progress stops in place, as an adoption does. The plan validator lets only a started plan
      // keep its commit receipt, and rivalResearch.completeRivalPlans reads the operating state, so it never completes.
      row('physicalPlan', plan.id, plan.status, `build stopped at week ${week} by the terminal operating state; zero refund`, 'applied')
      continue
    }
    physicalPlans = { ...physicalPlans, plans: physicalPlans.plans.map((p) => (p.id === plan.id ? { ...p, status: 'cancelled' as const, statusWeek: week, reason: 'the studio closed', pendingQuote: null } : p)) }
    row('physicalPlan', plan.id, plan.status, `cancelled at week ${week}; zero refund`, 'applied')
  }
  next = { ...next, physicalPlans }
  if (player) {
    for (const facility of state.placement.facilities) if (facility.status !== 'cancelled') row('facility', String(facility.id), facility.status, 'nonoperational in place; zero refund', 'applied')
    for (const set of state.sets) row('set', set.id, set.status, 'retained; nonoperational in place', 'applied')
    for (const project of state.construction.projects) row('construction', project.id, project.status, 'construction pending in this saved world; zero refund', 'pending')
    for (const session of state.castingSessions.sessions) row('castingSession', session.id, session.status, 'casting pending in this saved world', 'pending')
    state.productionQueue.forEach((entry, index) => {
      const id = (entry as { id?: unknown }).id
      row('queuedIntent', typeof id === 'string' ? id : `queue:${index}`, 'queued', 'queued intent pending in this saved world', 'pending')
    })
  } else {
    for (const facility of business!.operations.facilities) row('facility', facility.id, facility.capability, 'nonoperational in place; zero refund', 'applied')
  }

  // 4. Money: the loan stops at C; the closing cash is preserved as it is; claims are paid from floor(max(0, cash)).
  const loan = outstandingLoan(state, studioId, week)
  let loanRecord: ClosureRecord['loan'] = null
  if (loan !== undefined) {
    const paidInstallments = installmentsPaid(loan, week, week)
    const paidAmount = loan.installments.slice(0, paidInstallments).reduce((a, b) => a + b, 0)
    loanRecord = { loanId: loan.loanId, stopWeek: week, paidInstallments, paidAmount, remainder: loan.total - paidAmount }
    row('loan', loan.loanId, `total ${loan.total}; contracted week ${loan.contractedWeek}`, `stopped at week ${week}; ${paidInstallments} installments paid (${paidAmount}); remainder ${loanRecord.remainder} unpaid and non-distributable`, 'applied')
  }
  const closing = player ? next.studio.cash : business!.account.cash
  const distributable = Math.floor(Math.max(0, closing))
  const distribution = distributeClaims(claims, distributable, week, closureId)
  let ledger = next.ledger
  let cash = next.studio.cash
  for (const payment of distribution.payments) {
    if (player) {
      cash -= payment.amount
      ledger = [...ledger, { week, kind: 'claimPayment', amount: -payment.amount, talentId: payment.talentId, note: CLAIM_PAYMENT_LEDGER_NOTE } as LedgerEntry]
    } else {
      moveRivalMoney(business!.account, 'claimPayment', -payment.amount, week)
    }
  }
  const paidTotal = distribution.payments.reduce((sum, p) => sum + p.amount, 0)
  row('cash', studioId, `closing ${closing}`, `distributable ${distributable}; ${paidTotal} paid to claims at closure; balance preserved`, 'applied')
  if (player) next = { ...next, studio: { ...next.studio, cash }, ledger }

  // 5. Titles: one R2 lot per owned title, pending through the window; P16 reads estateView (§4).
  const estateLaw = CLOSURE_LAWS['closure/v1']
  const lots: EstateLot[] = ownedFilmIds(state, h, studioId).map((filmId, i) => ({ lotId: `${closureId}:lot:${i + 1}`, right: 'R2', subjectId: filmId }))
  for (const lot of lots) row('title', lot.subjectId, 'owned', `R2 lot ${lot.lotId}; sale route pending until the estate closes`, 'pending', null, lot.lotId)
  const estate: ClosureEstate = { opensWeek: week, closesWeek: week + estateLaw.CLOSURE_ESTATE_WINDOW_WEEKS, lots }

  // 6. The record, the digest, the one P15 sequence and the (disabled) end-of-run hook. Immutable from here on.
  dispositions.sort(byKindThenId)
  const counts: Record<string, number> = {}
  for (const d of dispositions) counts[d.subjectKind] = (counts[d.subjectKind] ?? 0) + 1
  const sequence = next.p15Sequence.next
  const receipts = distribution.payments.length > 0 ? [{ week, kind: 'distribution' as const, amount: paidTotal, reference: closureId }] : []
  let record: ClosureRecord = { closureId, studioId, closureWeek: week, causeEventId, lawVersion: law, p15DomainSequence: sequence, ...p15PhaseTriple(CLOSURE_PHASE_ID, Object.hasOwn(state, 'rights') ? 3 : 2),
    cash: { closing, distributable }, loan: loanRecord, dispositions, counts, digest: closureDigest(closureId, dispositions), estate, receipts, endOfRun: null }
  const closureRoot = requireStudioClosure(next)
  const prepared: GameState = {
    ...next,
    studioClosure: { ...closureRoot, nextClosure: closureRoot.nextClosure + 1, nextClaim, closures: [...closureRoot.closures, record], claims: [...closureRoot.claims, ...distribution.claims] },
    p15Sequence: { ...next.p15Sequence, next: sequence + 1 },
  }
  // Frozen48 has no rights root. Current49 handoff joins the actual record/claims
  // before any full-save/finale publication; no separate due-condition estate.
  return Object.hasOwn(prepared, 'rights')
    ? openEstate(prepared, buildEstateHandoff(prepared, record), week).state : prepared
}

/** Direct transactions share the boundary aggregate: no public path exposes an unlinked player closure. */
export function closeStudio(state: GameState, studioId: string, causeEventId: string, options: CloseStudioOptions = {}): GameState {
  const root = requireStudioClosure(state)
  if (root.closures.some(c => c.studioId === studioId)) throw new Error(`closure/v1: ${studioId} is already closed; a retry is a duplicate refusal`)
  const cause = requireCorporateCondition(state).events.find(e => e.eventId === causeEventId)
  if (!closureDue(state, studioId) || cause === undefined || cause.studioId !== studioId || cause.to !== 'closed' || cause.week > state.market.tick) {
    throw new Error(`closure/v1: ${causeEventId} is not ${studioId}'s closure-due event`)
  }
  return advanceClosureBoundary(state, {}, options.endOfRunHook)
}

/** Prepared rows stay private until all closures, official and ended share one validated publication. */
function publishClosureFinale(state: GameState, hook?: EndOfRunHook | null): GameState {
  const h = state.hollywood!
  let next = state
  const player = state.studioClosure.closures.find(c => c.studioId === h.playerStudioId)
  // The old option is only a throw-only historical fault seam; it cannot replace the production builder.
  if (player !== undefined && player.endOfRun === null && hook != null) {
    hook(next, player)
    throw new Error('closure/v1: legacy endOfRunHook cannot replace atomic modern Legacy publication')
  }
  if (next.market.tick === LEGACY_BOUNDARY_WEEK && next.campaignLegacy.official === null
    && h.originWeek < LEGACY_BOUNDARY_WEEK && next.campaignLegacy.recordedFromWeek < LEGACY_BOUNDARY_WEEK) {
    const sequence = next.p15Sequence.next
    const official: OfficialLegacy = { ...buildLegacyManifest(legacyFactsFromState(next, LEGACY_BOUNDARY_WEEK, MODERN_LEGACY_DEFINITION), 'official2040', MODERN_LEGACY_DEFINITION),
      legacySnapshotId: `campaign-legacy-${sequence}`, p15DomainSequence: sequence, ...p15PhaseTriple('p15c.finale', Object.hasOwn(next, 'rights') ? 3 : 2) }
    next = { ...next, campaignLegacy: { ...next.campaignLegacy, official }, p15Sequence: { ...next.p15Sequence, next: sequence + 1 } }
  }
  if (player !== undefined && player.endOfRun === null) {
    const sequence = next.p15Sequence.next
    // 12A (L-35): the cut stays C + 1; the v4 adapter settles a run only through the paid input week C − 1.
    // P16 rebase: the ended manifest keeps 12A's v4 and takes P16's estate phase table 3 under the rights era.
    const manifest = buildLegacyManifest(legacyFactsFromState(next, player.closureWeek + 1, ENDED_LEGACY_DEFINITION), 'endOfRun', ENDED_LEGACY_DEFINITION)
    const ended: EndedLegacy = { ...manifest, kind: 'endOfRun', definition: ENDED_LEGACY_DEFINITION, postFinaleMode: null,
      closureId: player.closureId, legacySnapshotId: `campaign-legacy-${sequence}`, p15DomainSequence: sequence, ...p15PhaseTriple('p15c.finale', Object.hasOwn(next, 'rights') ? 3 : 2) }
    next = { ...next, campaignLegacy: { ...next.campaignLegacy, endOfRun: ended },
      studioClosure: { ...next.studioClosure, closures: next.studioClosure.closures.map(c => c.closureId === player.closureId ? { ...c, endOfRun: ended.legacySnapshotId } : c) },
      p15Sequence: { ...next.p15Sequence, next: sequence + 1 } }
  }
  if (Object.hasOwn(next, 'rights')) {
    // the rights era's live reader (P17 Save50 over P16's Save49)
    validateSaveP17({ saveVersion: P17_SAVE_VERSION, seed: next.seed, state: next, broadcastCache: next.broadcastItems })
  } else {
    validateSaveP15B({ saveVersion: P15B_SAVE_VERSION, seed: next.seed, state: next, broadcastCache: next.broadcastItems })
  }
  return next
}

/** The films whose runs the estate collects: the closure's live-run dispositions (a rival's, `applied`). */
const estateRunFilms = (closure: ClosureRecord): string[] =>
  closure.dispositions.filter((d) => d.subjectKind === 'theatricalRun' && d.status === 'applied').map((d) => d.subjectId)

/** Whether an estate still has a run installment due at input week `due` (after archival, §4 narrow reading). */
function estateRunDue(h: HollywoodState, closure: ClosureRecord, due: number): boolean {
  return estateRunFilms(closure).some((filmId) => {
    const film = h.films.find((f): f is LiveIndustryFilm => f.provenance === 'simulation/v1' && f.filmId === filmId)
    return film !== undefined && estateRunInstallment(film, due) !== null
  })
}

/** @internal P15 owns the sole actual estate-account credit and keyed intake journal.
 * Sales preparation invokes this before ranking; final publication waits for claims and archival. */
export function receiveEstateSaleProceeds(state: GameState, closureId: string, transactionId: string): GameState {
  const root = requireStudioClosure(state), h = state.hollywood
  const closure = root.closures.find(c => c.closureId === closureId)
  const transaction = state.rights.transactions.find(t => t.id === transactionId)
  const estate = state.rights.estates.find(e => e.closureId === closureId)
  if (!h || !closure || !transaction || !estate || closure.studioId === h.playerStudioId
    || transaction.kind !== 'estateSale' || transaction.estateId !== estate.estateId || transaction.payeeId !== null
    || transaction.week !== state.market.tick || transaction.week !== closure.estate.closesWeek
    || !Number.isSafeInteger(transaction.amount) || transaction.amount <= 0
    || estate.proceeds.filter(p => p.transactionId === transactionId && p.amount === transaction.amount && p.lotId === transaction.lotId).length !== 1) {
    throw new Error('closure/v1: estate sale intake has no actual matching D transaction/proceeds')
  }
  if (root.estateEvents.some(e => e.kind === 'saleReceipt' && e.reference === transactionId)) throw new Error('closure/v1: duplicate estate sale intake')
  const index = h.businesses.findIndex(b => b.studioId === closure.studioId)
  if (index < 0) throw new Error('closure/v1: estate sale intake has no retained terminal account')
  const source = h.businesses[index]!
  const business: RivalBusiness = { ...source, account: { ...source.account, periods: source.account.periods.map(p => ({ ...p, movements: { ...p.movements } })) } }
  moveRivalMoney(business.account, 'estateSaleProceeds', transaction.amount, transaction.week)
  const event: EstateEvent = { eventId: `estate-event-${root.nextEstateEvent}`, closureId, studioId: closure.studioId,
    week: transaction.week, kind: 'saleReceipt', amount: transaction.amount, reference: transactionId,
    p15DomainSequence: state.p15Sequence.next, ...p15PhaseTriple('p16.estateSale', 3) }
  return { ...state, hollywood: { ...h, businesses: h.businesses.map((b, i) => i === index ? business : b) },
    studioClosure: { ...root, nextEstateEvent: root.nextEstateEvent + 1, estateEvents: [...root.estateEvents, event] },
    p15Sequence: { ...state.p15Sequence, next: state.p15Sequence.next + 1 } }
}

/**
 * The weekly estate service at produced boundary T for one open rival estate (§4, §5), each step its own
 * sequenced estate event: the run installments due at T − 1 the estate-run adapter collected in this advance,
 * one claims distribution from floor(max(0, cash)), and archival at D. The closure record is never rewritten.
 */
function serviceEstate(state: GameState, closure: ClosureRecord, week: number): GameState {
  const root = requireStudioClosure(state)
  const h = state.hollywood!
  const triple = p15PhaseTriple(CLOSURE_PHASE_ID, Object.hasOwn(state, 'rights') ? 3 : 2)
  let sequence = state.p15Sequence.next
  let nextEvent = root.nextEstateEvent
  const events: EstateEvent[] = []
  const event = (kind: EstateEvent['kind'], amount: number, reference: string): void => {
    events.push({ eventId: `estate-event-${nextEvent}`, closureId: closure.closureId, studioId: closure.studioId, week, kind, amount, reference, p15DomainSequence: sequence, ...triple })
    nextEvent += 1
    sequence += 1
  }
  const due = week - 1
  if (due >= closure.closureWeek) {
    for (const filmId of estateRunFilms(closure)) {
      const film = h.films.find((f): f is LiveIndustryFilm => f.provenance === 'simulation/v1' && f.filmId === filmId)
      if (film === undefined) throw new Error(`closure/v1: estate run ${filmId} has no film`)
      const amount = estateRunInstallment(film, due)
      if (amount !== null) event('runReceipt', amount, `${filmId}:due:${due}`)
    }
  }
  const bIndex = h.businesses.findIndex((b) => b.studioId === closure.studioId)
  const source = h.businesses[bIndex]!
  const business: RivalBusiness = { ...source, account: { ...source.account, periods: source.account.periods.map((p) => ({ ...p, movements: { ...p.movements } })) } }
  const archived = week >= closure.estate.closesWeek
  const own = root.claims.filter((c) => c.closureId === closure.closureId)
  const distributionId = `estate-event-${nextEvent}`
  const distribution = distributeClaims(own, Math.floor(Math.max(0, business.account.cash)), week, distributionId, archived)
  for (const payment of distribution.payments) moveRivalMoney(business.account, 'claimPayment', -payment.amount, week)
  const paidTotal = distribution.payments.reduce((sum, p) => sum + p.amount, 0)
  if (paidTotal > 0) event('distribution', paidTotal, closure.closureId)
  if (week === closure.estate.closesWeek) event('archival', 0, closure.closureId)
  const claimsAfter = new Map(distribution.claims.map((c) => [c.claimId, { ...c, status: claimStatus(c, archived) }]))
  const claimsChanged = own.some((c) => JSON.stringify(claimsAfter.get(c.claimId)) !== JSON.stringify(c))
  if (events.length === 0 && !claimsChanged) return state
  return {
    ...state,
    hollywood: paidTotal > 0 ? { ...h, businesses: h.businesses.map((b, i) => (i === bIndex ? business : b)) } : h,
    studioClosure: { ...root, nextEstateEvent: nextEvent, estateEvents: [...root.estateEvents, ...events], claims: root.claims.map((c) => claimsAfter.get(c.claimId) ?? c) },
    p15Sequence: sequence === state.p15Sequence.next ? state.p15Sequence : { ...state.p15Sequence, next: sequence },
  }
}

/**
 * The closure phase (§2), after the condition step and before the Legacy freeze: service every open rival
 * estate in ascending studio id, then close every studio whose condition record declares closure due and that
 * has no closure yet, in ascending studio id (the player's deferred while `options.deferPlayerClosure`).
 * No RNG; nothing before recordedFromWeek + 1. A closed player's world never ticks, so its estate is never serviced.
 */
export function advanceStudioClosureWeek(state: GameState, options: ClosurePhaseOptions = {}): GameState {
  return advanceClosureBoundary(state, options)
}
function advanceClosureBoundary(state: GameState, options: ClosurePhaseOptions, hook?: EndOfRunHook | null): GameState {
  const h = state.hollywood
  if (h === null) return state
  const week = state.market.tick
  const root = requireStudioClosure(state)
  if (week <= Math.max(root.recordedFromWeek, h.originWeek)) return state
  let next = state
  for (const closure of [...root.closures].filter((c) => c.closureWeek < week && c.studioId !== h.playerStudioId).sort((a, b) => byId(a.studioId, b.studioId))) {
    if (week <= closure.estate.closesWeek || estateRunDue(next.hollywood!, closure, week - 1)) next = serviceEstate(next, closure, week)
    if (Object.hasOwn(next, 'rights') && week === closure.estate.closesWeek) next = finishEstateArchival(next, closure.closureId, week)
  }
  // §5: the boundary's estate transactions validate together (every estate due at this boundary serviced) before
  // anything publishes; each new closure below validates its own transaction.
  if (next !== state) next = validated(next, 'closure/v1 estate service')
  const condition = requireCorporateCondition(next)
  const closed = new Set(requireStudioClosure(next).closures.map((c) => c.studioId))
  for (const record of [...condition.studios].sort((a, b) => byId(a.studioId, b.studioId))) {
    if (record.condition.stage !== 'closed' || closed.has(record.studioId)) continue
    if (record.studioId === h.playerStudioId && options.deferPlayerClosure === true) continue
    const cause = condition.events.filter((e) => e.studioId === record.studioId && e.to === 'closed').at(-1)
    if (cause === undefined) throw new Error(`closure/v1: ${record.studioId} is closure due without a closure event`)
    next = prepareStudioClosure(next, record.studioId, cause.eventId)
  }
  // Whole-save validation is paid only for actual new closure/finale publication, not ordinary ticks.
  if (requireStudioClosure(next).closures.length > root.closures.length) return publishClosureFinale(next, hook)
  // The current estate aggregate publishes only after sale intake, claims and both archivings agree.
  if (Object.hasOwn(next, 'rights') && next !== state) return publishClosureFinale(next, hook)
  return next
}

// ── the validator (§5) ────────────────────────────────────────────────────────────────────────
const ROOT_KEYS = ['claims', 'closures', 'estateEvents', 'nextClaim', 'nextClosure', 'nextEstateEvent', 'recordedFromWeek', 'version']
const RECORD_KEYS = ['cash', 'causeEventId', 'closureId', 'closureWeek', 'counts', 'digest', 'dispositions', 'endOfRun', 'estate', 'lawVersion', 'loan', 'p15DomainSequence', 'phaseId', 'phaseOrderVersion', 'phaseOrdinal', 'receipts', 'studioId']
const DISPOSITION_KEYS = ['claimId', 'lawVersion', 'lotId', 'prior', 'result', 'status', 'subjectId', 'subjectKind']
const CLAIM_KEYS = ['claimId', 'claimantTalentId', 'closureId', 'kind', 'lawVersion', 'original', 'paid', 'payments', 'sourceContractId', 'status', 'studioId', 'unpaid']
const ESTATE_KEYS = ['closesWeek', 'lots', 'opensWeek']
const EVENT_KEYS = ['amount', 'closureId', 'eventId', 'kind', 'p15DomainSequence', 'phaseId', 'phaseOrderVersion', 'phaseOrdinal', 'reference', 'studioId', 'week']
const KINDS: readonly Kind[] = ['employment', 'screenplay', 'production', 'theatricalRun', 'research', 'adoption', 'physicalPlan', 'facility', 'construction', 'set', 'castingSession', 'queuedIntent', 'proposal', 'marketCase', 'loan', 'cash', 'title']
const isRecord = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value)
const sameKeys = (value: Record<string, unknown>, keys: readonly string[]): boolean => {
  const own = Object.keys(value).sort()
  const want = [...keys].sort()
  return own.length === want.length && own.every((key, i) => key === want[i])
}
const isWeek = (value: unknown): value is number => Number.isSafeInteger(value) && (value as number) >= 0
const close = (a: number, b: number): boolean => Math.abs(a - b) <= 1e-6

/** Validates `studioClosure` against the whole state (the frozen chain and the condition root already proven). */
export function validateStudioClosureRoot(raw: Record<string, unknown>, label: string, policy: { rightsEstate: boolean; titleState?: GameState; absorptionWithdrawals?: AbsorptionWithdrawalAuthority } = { rightsEstate: false }): void {
  const fail = (message: string): never => { throw new Error(`${label}: studioClosure ${message}`) }
  const root = raw.studioClosure
  if (!isRecord(root)) return fail('root must be an object')
  if (!sameKeys(root, ROOT_KEYS)) fail(`root must have exactly the keys ${ROOT_KEYS.join(', ')}`)
  if (root.version !== 1) fail(`version ${String(root.version)} is unknown`)
  const state = raw as unknown as GameState
  const tick = state.market.tick
  const from = root.recordedFromWeek
  if (!isWeek(from) || from > tick) return fail('recordedFromWeek must be a whole week in [0, market.tick]')
  if (!Array.isArray(root.closures) || !Array.isArray(root.claims) || !Array.isArray(root.estateEvents)) return fail('closures, claims and estateEvents must be arrays')
  if (!isWeek(root.nextClosure) || root.nextClosure < 1 || !isWeek(root.nextClaim) || root.nextClaim < 1 || !isWeek(root.nextEstateEvent) || root.nextEstateEvent < 1) {
    fail('nextClosure, nextClaim and nextEstateEvent must be whole numbers of at least 1')
  }
  const closures = root.closures as unknown[]
  const claims = root.claims as unknown[]
  const estateEvents = root.estateEvents as unknown[]
  const h = state.hollywood
  if (h === null) {
    if (closures.length + claims.length + estateEvents.length > 0 || root.nextClosure !== 1 || root.nextClaim !== 1 || root.nextEstateEvent !== 1) fail('holds a closure, claim or estate event in a world with no industry')
    return
  }
  // Save49's predecessor proof removes only the rights root. Its actual owner passes
  // the original full title state; direct current root reads can use their own raw state.
  const titleState = policy.rightsEstate ? policy.titleState ?? (Object.hasOwn(raw, 'rights') ? state : undefined) : undefined
  if (policy.rightsEstate) {
    if (titleState === undefined || !Object.hasOwn(titleState, 'rights')) return fail('current held-title proof requires its original full title state')
    const full = titleState as unknown as Record<string, unknown>
    const fullKeys = Object.keys(full).filter(key => key !== 'rights').sort()
    const rawKeys = Object.keys(raw).filter(key => key !== 'rights').sort()
    // Stripping rights preserves every other value/reference. Bind ALL authentic-title
    // sources (studio, ledger, concepts, history etc.), not just selected sibling roots.
    if (fullKeys.length !== rawKeys.length || fullKeys.some((key, i) => key !== rawKeys[i] || !Object.is(full[key], raw[key]))
      || Object.hasOwn(raw, 'rights') && full.rights !== raw.rights) {
      return fail('current held-title context must match every non-rights key/value of the original state')
    }
  }
  const condition = state.corporateCondition
  const studios = new Set<string>()
  let largest = 0
  let previousSequence = 0
  let previousClosure: ClosureRecord | null = null
  const claimsByClosure = new Map<string, ClosureClaim[]>()
  for (const [i, value] of claims.entries()) {
    if (!isRecord(value) || !sameKeys(value, CLAIM_KEYS)) return fail(`claim ${i} must have exactly the keys ${CLAIM_KEYS.join(', ')}`)
    const claim = value as unknown as ClosureClaim
    const list = claimsByClosure.get(claim.closureId) ?? []
    list.push(claim)
    claimsByClosure.set(claim.closureId, list)
  }
  const closuresById = new Map<string, ClosureRecord>()
  for (const value of closures) if (isRecord(value) && typeof value.closureId === 'string') closuresById.set(value.closureId, value as unknown as ClosureRecord)

  // Estate events (§2, §5): stable ids and the one P15 sequence ascend in append order, weeks never go back, each
  // event follows its closure (week and sequence) and carries the closure phase's triple of its own version.
  const eventsByClosure = new Map<string, EstateEvent[]>()
  let largestEvent = 0
  let previousEvent: EstateEvent | null = null
  for (const [i, value] of estateEvents.entries()) {
    if (!isRecord(value) || !sameKeys(value, EVENT_KEYS)) return fail(`estate event ${i} must have exactly the keys ${EVENT_KEYS.join(', ')}`)
    const e = value as unknown as EstateEvent
    const match = /^estate-event-([1-9]\d*)$/.exec(e.eventId)
    if (match === null) return fail(`estate event ${i} id ${String(e.eventId)} is not estate-event-<n>`)
    const n = Number(match[1])
    if (n <= largestEvent || n >= (root.nextEstateEvent as number)) fail(`estate event ${e.eventId} is out of append order or at or above nextEstateEvent`)
    largestEvent = n
    const owner = closuresById.get(e.closureId)
    if (owner === undefined || owner.studioId !== e.studioId) return fail(`estate event ${e.eventId} names no closure of its studio`)
    if (!isWeek(e.week) || e.week <= owner.closureWeek || e.week > tick || (previousEvent !== null && e.week < previousEvent.week)) fail(`estate event ${e.eventId} week is outside (closureWeek, market.tick] or goes back`)
    if (!Number.isSafeInteger(e.p15DomainSequence) || e.p15DomainSequence <= owner.p15DomainSequence || (previousEvent !== null && e.p15DomainSequence <= previousEvent.p15DomainSequence)) fail(`estate event ${e.eventId} p15DomainSequence does not follow its closure and the previous event`)
    const phaseId = e.kind === 'saleReceipt' ? 'p16.estateSale' : CLOSURE_PHASE_ID
    const entry = Number.isSafeInteger(e.phaseOrderVersion) ? P15_PHASE_TABLES[e.phaseOrderVersion]?.find(p => p.phaseId === phaseId) : undefined
    if (!policy.rightsEstate && (e.kind === 'saleReceipt' || e.phaseOrderVersion > 2)) fail(`estate event ${e.eventId} uses current rights estate authority below its era`)
    if (e.phaseId !== phaseId || entry === undefined || entry.phaseOrdinal !== e.phaseOrdinal
      || e.kind === 'saleReceipt' && e.phaseOrderVersion !== 3) fail(`estate event ${e.eventId} phase triple does not match its phase-order version's table`)
    const kinds: readonly string[] = policy.rightsEstate ? ['runReceipt', 'distribution', 'archival', 'saleReceipt'] : ['runReceipt', 'distribution', 'archival']
    if (!kinds.includes(e.kind) || typeof e.amount !== 'number' || !Number.isFinite(e.amount) || typeof e.reference !== 'string') fail(`estate event ${e.eventId} is malformed`)
    if (previousEvent !== null && previousEvent.week === e.week && previousEvent.phaseOrdinal > e.phaseOrdinal
      && previousEvent.phaseOrderVersion === e.phaseOrderVersion) fail(`estate event ${e.eventId} goes back in its boundary phase order`)
    previousEvent = e
    const list = eventsByClosure.get(e.closureId) ?? []
    list.push(e)
    eventsByClosure.set(e.closureId, list)
  }
  if (root.nextEstateEvent !== largestEvent + 1) fail(`nextEstateEvent ${String(root.nextEstateEvent)} must be one more than the largest estate event (${largestEvent})`)

  const seenClaims = new Set<string>()
  let largestClaim = 0
  const closureEnds = new Set(h.receipts.filter((r) => r.kind === 'employment' && r.toStudioId === null && r.reason === 'closure').map((r) => (r as { contractId: string }).contractId))
  const films = new Map(h.films.filter((f): f is LiveIndustryFilm => f.provenance === 'simulation/v1').map((f) => [f.filmId, f]))
  const marketReceipts = state.talentMarket.receipts

  for (const [i, value] of closures.entries()) {
    if (!isRecord(value) || !sameKeys(value, RECORD_KEYS)) return fail(`closure ${i} must have exactly the keys ${RECORD_KEYS.join(', ')}`)
    const c = value as unknown as ClosureRecord
    const match = /^studio-closure-([1-9]\d*)$/.exec(c.closureId)
    if (match === null) fail(`closure ${i} id ${String(c.closureId)} is not studio-closure-<n>`)
    const n = Number(match![1])
    if (n <= largest || n >= (root.nextClosure as number)) fail(`closure ${c.closureId} is out of append order or at or above nextClosure`)
    largest = n
    if (typeof c.studioId !== 'string' || studios.has(c.studioId)) fail(`closure ${c.closureId} names no studio or a studio closed twice`)
    studios.add(c.studioId)
    const identity = h.identities.find((s) => s.studioId === c.studioId)
    if (identity === undefined || identity.enteredWeek === null) fail(`closure ${c.closureId} names a studio that has not entered`)
    const C = c.closureWeek
    if (!isWeek(C) || C <= from || C > tick) fail(`closure ${c.closureId} closureWeek is outside (recordedFromWeek, market.tick]`)
    if (previousClosure !== null && (previousClosure.closureWeek > C || (previousClosure.closureWeek === C && previousClosure.studioId >= c.studioId))) fail(`closure ${c.closureId} is out of (week, studioId) append order`)
    if (!Object.hasOwn(CLOSURE_LAWS, c.lawVersion)) fail(`closure ${c.closureId} lawVersion ${String(c.lawVersion)} is unknown`)
    const law = CLOSURE_LAWS[c.lawVersion]
    if (!policy.rightsEstate && c.phaseOrderVersion > 2) fail(`closure ${c.closureId} uses current estate phase table below its era`)
    const entry = Number.isSafeInteger(c.phaseOrderVersion) ? P15_PHASE_TABLES[c.phaseOrderVersion]?.find((p) => p.phaseId === CLOSURE_PHASE_ID) : undefined
    if (c.phaseId !== CLOSURE_PHASE_ID || entry === undefined || entry.phaseOrdinal !== c.phaseOrdinal) fail(`closure ${c.closureId} phase triple does not match its phase-order version's table`)
    const cause = condition.events.find((e) => e.eventId === c.causeEventId)
    if (cause === undefined || cause.studioId !== c.studioId || cause.to !== 'closed' || cause.week > C) fail(`closure ${c.closureId} causeEventId is not the studio's closure-due event at or before its closure week`)
    if (conditionRecord(state, c.studioId)?.condition.stage !== 'closed') fail(`closure ${c.closureId} studio's condition record is not closed`)
    if (!Number.isSafeInteger(c.p15DomainSequence) || c.p15DomainSequence <= cause!.p15DomainSequence || c.p15DomainSequence <= previousSequence) fail(`closure ${c.closureId} p15DomainSequence does not follow its cause and the previous closure`)
    previousSequence = c.p15DomainSequence
    previousClosure = c
    const player = c.studioId === h.playerStudioId
    if (player) {
      const ended = state.campaignLegacy?.endOfRun
      if (ended == null || c.endOfRun !== ended.legacySnapshotId || ended.closureId !== c.closureId) fail(`closure ${c.closureId} must join its player end-of-run Legacy manifest`)
    } else if (c.endOfRun !== null) fail(`closure ${c.closureId} rival cannot carry a player end-of-run manifest`)
    const business = player ? undefined : h.businesses.find((b) => b.studioId === c.studioId)
    if (!player && business === undefined) fail(`closure ${c.closureId} studio has no business`)
    const events = eventsByClosure.get(c.closureId) ?? []
    if (player && events.length > 0) fail(`closure ${c.closureId}: a closed player's world never ticks, so its estate holds no later event`)

    // Estate window and archival (§4): a rival estate archives exactly once at D, and only once D has arrived.
    if (!isRecord(c.estate) || !sameKeys(c.estate as unknown as Record<string, unknown>, ESTATE_KEYS)) return fail(`closure ${c.closureId} estate must have exactly the keys ${ESTATE_KEYS.join(', ')}`)
    if (c.estate.opensWeek !== C || c.estate.closesWeek !== C + law.CLOSURE_ESTATE_WINDOW_WEEKS) fail(`closure ${c.closureId} estate window is not [C, C + ${law.CLOSURE_ESTATE_WINDOW_WEEKS})`)
    const archivals = events.filter((e) => e.kind === 'archival')
    const shouldBeArchived = !player && tick >= c.estate.closesWeek
    if (shouldBeArchived ? (archivals.length !== 1 || archivals[0]!.week !== c.estate.closesWeek || archivals[0]!.amount !== 0 || archivals[0]!.reference !== c.closureId) : archivals.length !== 0) {
      fail(`closure ${c.closureId} estate archival does not match its window at week ${tick}`)
    }
    const archived = archivals.length === 1
    const titles = policy.rightsEstate ? ownedFilmIds(titleState!, h, c.studioId, C) : creatorFilmIds(state, h, c.studioId)
    if (!Array.isArray(c.estate.lots) || c.estate.lots.length !== titles.length) return fail(`closure ${c.closureId} estate lots do not cover the studio's titles`)
    c.estate.lots.forEach((lot, k) => {
      if (!isRecord(lot) || !sameKeys(lot, ['lotId', 'right', 'subjectId'])) return fail(`closure ${c.closureId} estate has a malformed lot`)
      if (lot.lotId !== `${c.closureId}:lot:${k + 1}` || lot.right !== 'R2' || lot.subjectId !== titles[k]) fail(`closure ${c.closureId} estate lot ${k} differs from the title handoff law`)
    })

    // Run receipts (§4, RED 5): exactly the canonical installments due from C on, each once, at the boundary after
    // its due week, for every run the closure found live; none accelerated, none lost, none paid twice.
    if (!Array.isArray(c.dispositions)) return fail(`closure ${c.closureId} dispositions must be an array`)
    const expectedReceipts = new Map<string, { week: number; amount: number }>()
    const acquiredRuns=policy.rightsEstate && !player ? acquiredActiveRunFilms(titleState!,c.studioId,C) : []
    if (!player) {
      for (const d of c.dispositions) {
        if (!isRecord(d) || d.subjectKind !== 'theatricalRun') continue
        const film = films.get(d.subjectId)
        if (film === undefined || (film.studioId !== c.studioId && !acquiredRuns.some(f=>f.filmId===film.filmId))) return fail(`closure ${c.closureId} run ${String(d.subjectId)} has no live film of its studio/assigned stream`)
        for (let due = C; due < tick; due++) {
          const amount = estateRunInstallment(film, due)
          if (amount !== null) expectedReceipts.set(`${film.filmId}:due:${due}`, { week: due + 1, amount })
        }
      }
    }
    const receiptsByWeek = new Map<number, number>()
    for (const e of events.filter((x) => x.kind === 'runReceipt')) {
      const want = expectedReceipts.get(e.reference)
      if (want === undefined || want.week !== e.week || !close(want.amount, e.amount)) fail(`closure ${c.closureId} estate run receipt ${e.eventId} is not a scheduled installment of a run live at closure`)
      expectedReceipts.delete(e.reference)
      receiptsByWeek.set(e.week, (receiptsByWeek.get(e.week) ?? 0) + e.amount)
    }
    if (expectedReceipts.size > 0) fail(`closure ${c.closureId} estate is missing the run receipt ${[...expectedReceipts.keys()][0]}`)
    const saleReferences = new Set<string>()
    const saleReceipts = events.filter(e => e.kind === 'saleReceipt')
    for (const e of saleReceipts) {
      if (!policy.rightsEstate || player || e.week !== c.estate.closesWeek || !Number.isSafeInteger(e.amount) || e.amount <= 0
        || e.reference.length === 0 || saleReferences.has(e.reference)) fail(`closure ${c.closureId} sale receipt is duplicated, foreign, mistimed or not positive whole proceeds`)
      saleReferences.add(e.reference)
      receiptsByWeek.set(e.week, (receiptsByWeek.get(e.week) ?? 0) + e.amount)
    }
    if (policy.rightsEstate && !player) {
      for (const [p, period] of business!.account.periods.entries()) {
        const expected = saleReceipts.filter(e => period.fromWeek <= e.week && e.week <= period.throughWeek).reduce((sum, e) => sum + e.amount, 0)
        if ((period.movements.estateSaleProceeds ?? 0) !== expected) fail(`closure ${c.closureId} estateSaleProceeds period ${p} does not match its actual intake receipts`)
      }
    }


    // Claims of this closure: one per interval ended at C by closure, in (contract, claim) order.
    const own = (claimsByClosure.get(c.closureId) ?? [])
    const endedByClosure = h.employment.filter((e) => e.studioId === c.studioId && e.endedWeek === C && closureEnds.has(e.contractId))
    if (own.length !== endedByClosure.length) fail(`closure ${c.closureId} has ${own.length} claims for ${endedByClosure.length} intervals ended by closure`)
    const sources = new Set<string>()
    const playerRows = player ? state.ledger.filter((r) => r.kind === 'claimPayment') : []
    const matchedRows = new Set<number>()
    const rivalPayments = new Map<number, number>()
    const paymentsByWeek = new Map<number, Map<string, number>>()
    const distributionEvents = events.filter(e => e.kind === 'distribution')
    const distributionIds = new Map(distributionEvents.map(e => [e.week, e]))
    if (distributionIds.size !== distributionEvents.length) fail(`closure ${c.closureId} has duplicate weekly distribution records`)
    let paidTotal = 0
    for (const [k, claim] of own.entries()) {
      const m = /^closure-claim-([1-9]\d*)$/.exec(claim.claimId)
      if (m === null || Number(m[1]) >= (root.nextClaim as number) || seenClaims.has(claim.claimId)) fail(`claim ${String(claim.claimId)} has a malformed, duplicate or above-allocator id`)
      seenClaims.add(claim.claimId)
      largestClaim = Math.max(largestClaim, Number(m![1]))
      if (k > 0 && byContractThenClaim(own[k - 1]!, claim) >= 0) fail(`claim ${claim.claimId} is out of (sourceContractId, claimId) order`)
      if (claim.studioId !== c.studioId || claim.kind !== 'employment' || claim.lawVersion !== c.lawVersion) fail(`claim ${claim.claimId} studio, kind or law differs from its closure`)
      const interval = endedByClosure.find((e) => e.contractId === claim.sourceContractId)
      if (interval === undefined || sources.has(claim.sourceContractId)) fail(`claim ${claim.claimId} source ${String(claim.sourceContractId)} is not a distinct interval ended by this closure`)
      sources.add(claim.sourceContractId)
      if (claim.claimantTalentId !== interval!.terms.talentId) fail(`claim ${claim.claimId} claimant differs from its interval`)
      if (claim.original !== terminationCost(interval!.terms, C)) fail(`claim ${claim.claimId} original differs from terminationCost(contract, C)`)
      if (!(Number.isSafeInteger(claim.paid) && Number.isSafeInteger(claim.unpaid) && claim.paid >= 0 && claim.unpaid >= 0 && claim.paid + claim.unpaid === claim.original)) fail(`claim ${claim.claimId} breaks original = paid + unpaid`)
      if (!Array.isArray(claim.payments)) return fail(`claim ${claim.claimId} payments must be an array`)
      let sum = 0
      let lastWeek = C
      for (const payment of claim.payments) {
        if (!isRecord(payment) || !sameKeys(payment, ['amount', 'reference', 'week'])) return fail(`claim ${claim.claimId} has a malformed payment`)
        if (!isWeek(payment.week) || payment.week < lastWeek || payment.week > tick || !Number.isSafeInteger(payment.amount) || (payment.amount as number) <= 0) fail(`claim ${claim.claimId} payment is before the closure week, out of order, out of range or not a positive whole amount`)
        const week = payment.week as number
        // Each payment is linked to its batch: the closure itself at C, the week's distribution event later.
        if (payment.reference !== (week === C ? c.closureId : distributionIds.get(week)?.eventId)) fail(`claim ${claim.claimId} payment at week ${week} is not linked to its distribution`)
        lastWeek = week
        sum += payment.amount as number
        const batch = paymentsByWeek.get(week) ?? new Map<string, number>()
        if (batch.has(claim.claimId)) fail(`claim ${claim.claimId} is paid twice in week ${week}`)
        batch.set(claim.claimId, payment.amount as number)
        paymentsByWeek.set(week, batch)
        if (player) {
          const index = playerRows.findIndex((r, j) => !matchedRows.has(j) && r.week === week && r.amount === -(payment.amount as number) && r.talentId === claim.claimantTalentId)
          if (index < 0) fail(`claim ${claim.claimId} payment at week ${week} has no claimPayment ledger row`)
          matchedRows.add(index)
        } else {
          rivalPayments.set(week, (rivalPayments.get(week) ?? 0) + (payment.amount as number))
        }
      }
      if (sum !== claim.paid) fail(`claim ${claim.claimId} paid differs from its payments`)
      if (claim.status !== claimStatus(claim, archived)) fail(`claim ${claim.claimId} status ${String(claim.status)} contradicts its amounts and the estate`)
      paidTotal += claim.paid
    }
    if (player && matchedRows.size !== playerRows.length) fail(`closure ${c.closureId}: the player ledger holds a claimPayment row no claim accounts for`)
    if (!player) {
      for (const [p, period] of business!.account.periods.entries()) {
        let expected = 0
        for (const [week, amount] of rivalPayments) if (period.fromWeek <= week && week <= period.throughWeek) expected += amount
        if (period.movements.claimPayment !== -expected) fail(`closure ${c.closureId}: rival claimPayment movements in period ${p} do not reconcile with the claim payments`)
      }
    }

    // Distribution replay (§3, RED 3): at C and after each receipt batch, floor(max(0, the cash before the batch)),
    // in (contract, claim) order, min(available, unpaid) each. Every recorded batch is exactly the replay.
    if (!isRecord(c.cash) || !sameKeys(c.cash as unknown as Record<string, unknown>, ['closing', 'distributable'])) return fail(`closure ${c.closureId} cash must have exactly the keys closing, distributable`)
    if (!Number.isFinite(c.cash.closing) || c.cash.distributable !== Math.floor(Math.max(0, c.cash.closing))) fail(`closure ${c.closureId} cash distributable is not floor(max(0, closing))`)
    const unpaid = new Map(own.map((claim) => [claim.claimId, claim.original]))
    let replayCash = c.cash.closing
    for (const week of [...new Set([C, ...receiptsByWeek.keys(), ...paymentsByWeek.keys()])].sort((a, b) => a - b)) {
      replayCash += receiptsByWeek.get(week) ?? 0
      let available = Math.floor(Math.max(0, replayCash))
      const actual = paymentsByWeek.get(week) ?? new Map<string, number>()
      let batch = 0
      for (const claim of own) {
        const amount = Math.min(available, unpaid.get(claim.claimId)!)
        if ((actual.get(claim.claimId) ?? 0) !== Math.max(0, amount)) fail(`closure ${c.closureId} distribution at week ${week} differs from the law's replay (cap and contract-then-claim priority)`)
        if (amount > 0) { available -= amount; unpaid.set(claim.claimId, unpaid.get(claim.claimId)! - amount); batch += amount }
      }
      replayCash -= batch
      const recorded = week === C ? (Array.isArray(c.receipts) ? c.receipts.reduce((sum, r) => sum + (isRecord(r) ? Number(r.amount) : 0), 0) : NaN) : (distributionIds.get(week)?.amount ?? 0)
      if (recorded !== batch) fail(`closure ${c.closureId} distribution record at week ${week} (${recorded}) differs from the claims paid (${batch})`)
    }
    for (const e of distributionIds.values()) if (!paymentsByWeek.has(e.week) || e.reference !== c.closureId) fail(`closure ${c.closureId} distribution event ${e.eventId} pays no claim or names another closure`)

    // The receipts inside the record: the distribution at C only.
    if (!Array.isArray(c.receipts) || c.receipts.length > 1) return fail(`closure ${c.closureId} receipts must hold at most the distribution at C`)
    for (const r of c.receipts) {
      if (!isRecord(r) || !sameKeys(r, ['amount', 'kind', 'reference', 'week'])) return fail(`closure ${c.closureId} has a malformed receipt`)
      if (r.kind !== 'distribution' || r.week !== C || r.reference !== c.closureId || !Number.isSafeInteger(r.amount) || (r.amount as number) <= 0) fail(`closure ${c.closureId} receipt is not the distribution at its closure week`)
    }
    const received = [...receiptsByWeek.values()].reduce((a, b) => a + b, 0)
    const cashNow = player ? state.studio.cash : business!.account.cash
    if (!close(cashNow, c.cash.closing + received - paidTotal)) fail(`closure ${c.closureId} cash does not reconcile: closing + estate receipts − claim payments`)

    // Loan stop (§2).
    const loan = condition.loans.find((l) => l.studioId === c.studioId && l.contractedWeek <= C && C <= l.contractedWeek + l.installments.length) as StudioLoanRecord | undefined
    if (loan === undefined) {
      if (c.loan !== null) fail(`closure ${c.closureId} records a loan the studio did not hold at closure`)
    } else {
      if (!isRecord(c.loan) || !sameKeys(c.loan as unknown as Record<string, unknown>, ['loanId', 'paidAmount', 'paidInstallments', 'remainder', 'stopWeek'])) return fail(`closure ${c.closureId} loan must have exactly the keys loanId, paidAmount, paidInstallments, remainder, stopWeek`)
      const paid = installmentsPaid(loan, C, C)
      const paidAmount = loan.installments.slice(0, paid).reduce((a, b) => a + b, 0)
      if (c.loan.loanId !== loan.loanId || c.loan.stopWeek !== C || c.loan.paidInstallments !== paid || c.loan.paidAmount !== paidAmount || c.loan.remainder !== loan.total - paidAmount) {
        fail(`closure ${c.closureId} loan stop does not reconcile with ${loan.loanId} at week ${C}`)
      }
    }

    // Dispositions (§5): exact-once, canonical order, bidirectional completeness against retained history.
    const expected = new Map<string, { status: ClosureDisposition['status']; claimId?: string; lotId?: string }>()
    const expect = (kind: Kind, id: string, status: ClosureDisposition['status'], extra: { claimId?: string; lotId?: string } = {}): void => { expected.set(`${kind}:${id}`, { status, ...extra }) }
    for (const e of endedByClosure) expect('employment', e.contractId, 'applied', { claimId: own.find((cl) => cl.sourceContractId === e.contractId)?.claimId ?? '' })
    const ownScripts = player ? state.scriptDevelopment.projects : business!.activeScriptOrdinals.map((k) => business!.development.projects[k]!)
    const scripts = [...ownScripts.map(project=>({project,subjectId:project.id})),...(policy.rightsEstate?continuedBuyerScripts(titleState!,c.studioId):[])]
    for (const {project,subjectId} of scripts) if (project.status !== 'produced') expect('screenplay', subjectId, 'applied')
    for (const p of policy.rightsEstate ? buyerOperatedProductions(titleState!,c.studioId) : player ? state.studio.activeProductions : business!.productions) expect('production', p.id, 'applied')
    if (player) for (const run of [...state.theatricalRuns,...(policy.rightsEstate?continuedBuyerRuns(titleState!):[])]) { if (run.status === 'active') expect('theatricalRun', run.productionId, 'pending') }
    else {
      for (const run of business!.runs) expect('theatricalRun', run.productionId, 'applied')
      for(const film of acquiredRuns)expect('theatricalRun',film.filmId,'applied')
      // A run the estate settled since C settles at its final due week, at or after C (hollywoodTick.payRuns).
      for (const f of films.values()) if (f.studioId === c.studioId && f.settledWeek !== null && f.settledWeek >= C) expect('theatricalRun', f.filmId, 'applied')
    }
    for (const p of state.technology.projects) if (p.studioId === c.studioId && (p.status === 'active' || p.status === 'paused')) expect('research', p.id, 'applied')
    for (const a of state.technology.adoptions) if (a.studioId === c.studioId && a.operationalWeek === null && (a.cancelledWeek ?? null) === null) expect('adoption', a.id, player ? 'pending' : 'applied')
    for (const plan of state.physicalPlans.plans) {
      if (plan.studioId !== c.studioId || (plan.status === 'cancelled' && plan.statusWeek !== C)) continue
      expect('physicalPlan', plan.id, player && plan.status === 'started' ? 'pending' : 'applied')
    }
    if (player) {
      for (const f of state.placement.facilities) if (f.status !== 'cancelled') expect('facility', String(f.id), 'applied')
      for (const s of state.sets) expect('set', s.id, 'applied')
      for (const p of state.construction.projects) expect('construction', p.id, 'pending')
      for (const s of state.castingSessions.sessions) expect('castingSession', s.id, 'pending')
      state.productionQueue.forEach((entry, index) => { const id = (entry as { id?: unknown }).id; expect('queuedIntent', typeof id === 'string' ? id : `queue:${index}`, 'pending') })
    } else {
      for (const f of business!.operations.facilities) expect('facility', f.id, 'applied')
    }
    // The market's own records of the closure's two market transitions (§4 row 1).
    for (const r of marketReceipts) if (r.kind === 'proposalWithdrawn' && r.studioId === c.studioId && r.week === C && r.reasons[0] === CLOSURE_PROPOSAL_REASON) expect('proposal', `${c.studioId}:proposal:${r.talentId}`, 'applied')
    for (const kase of state.talentMarket.cases) {
      if (kase.subjectStudioId !== c.studioId) continue
      if (kase.outcome === null) fail(`closure ${c.closureId} studio is still the subject of an open market case`)
      if (kase.outcome === 'invalidated' && kase.closedWeek === C && kase.reason === CLOSURE_CASE_REASON) expect('marketCase', caseKey(kase), 'applied')
    }
    if (c.loan !== null) expect('loan', c.loan.loanId, 'applied')
    expect('cash', c.studioId, 'applied')
    for (const lot of c.estate.lots) expect('title', lot.subjectId, 'pending', { lotId: lot.lotId })
    if (state.talentMarket.proposals.some((p) => p.issuerStudioId === c.studioId)) fail(`closure ${c.closureId} studio still holds a market proposal`)
    const seen = new Set<string>()
    const counts: Record<string, number> = {}
    for (const [k, d] of c.dispositions.entries()) {
      if (!isRecord(d) || !sameKeys(d, DISPOSITION_KEYS)) return fail(`closure ${c.closureId} disposition ${k} must have exactly the keys ${DISPOSITION_KEYS.join(', ')}`)
      if (!KINDS.includes(d.subjectKind) || typeof d.subjectId !== 'string' || typeof d.prior !== 'string' || typeof d.result !== 'string' || d.lawVersion !== c.lawVersion) fail(`closure ${c.closureId} disposition ${k} is malformed`)
      const key = `${d.subjectKind}:${d.subjectId}`
      if (seen.has(key)) fail(`closure ${c.closureId} disposes of ${key} twice`)
      if (k > 0 && byKindThenId(c.dispositions[k - 1]!, d) >= 0) fail(`closure ${c.closureId} dispositions are not in canonical (kind, id) order`)
      seen.add(key)
      counts[d.subjectKind] = (counts[d.subjectKind] ?? 0) + 1
      const want = expected.get(key)
      if (want === undefined) fail(`closure ${c.closureId} disposes of ${key}, which is not a subject the retained history knows`)
      if (d.status !== want!.status) fail(`closure ${c.closureId} disposition ${key} status ${String(d.status)} differs from the law's ${want!.status}`)
      if ((want!.claimId ?? null) !== d.claimId) fail(`closure ${c.closureId} disposition ${key} claim link differs from its claim`)
      if ((want!.lotId ?? null) !== d.lotId) fail(`closure ${c.closureId} disposition ${key} lot link differs from its lot`)
    }
    for (const key of expected.keys()) if (!seen.has(key)) fail(`closure ${c.closureId} has no disposition for live subject ${key}`)
    if (!isRecord(c.counts) || JSON.stringify(Object.entries(c.counts).sort()) !== JSON.stringify(Object.entries(counts).sort())) fail(`closure ${c.closureId} counts differ from its dispositions`)
    if (c.digest !== closureDigest(c.closureId, c.dispositions)) fail(`closure ${c.closureId} digest differs from its rows`)
    // No live employment and, for the player, no live contract after an actual closure.
    if (h.activeEmploymentOrdinals.some((k) => h.employment[k]!.studioId === c.studioId)) fail(`closure ${c.closureId} studio still employs someone`)
    if (player && state.contracts.some((k) => k.startWeek <= tick && tick < k.endWeekExclusive)) fail(`closure ${c.closureId} player still holds a live contract`)
  }
  if (root.nextClosure !== largest + 1) fail(`nextClosure ${String(root.nextClosure)} must be one more than the largest closure (${largest})`)
  if (root.nextClaim !== largestClaim + 1) fail(`nextClaim ${String(root.nextClaim)} must be one more than the largest claim (${largestClaim})`)
  for (const closureId of claimsByClosure.keys()) if (!closuresById.has(closureId)) fail(`a claim names unknown closure ${closureId}`)

  // Money and transitions only a closure produces belong to one (§3, §4): no claim payment, closure withdrawal or
  // closure invalidation exists for a studio that has not actually closed at that week.
  const closedAt = new Map([...closuresById.values()].map((c) => [c.studioId, c.closureWeek]))
  if (!closedAt.has(h.playerStudioId) && state.ledger.some((r) => r.kind === 'claimPayment')) fail('the player ledger holds a claimPayment row but the player has not closed')
  for (const b of h.businesses) {
    if (!closedAt.has(b.studioId) && b.account.periods.some((p) => ((p.movements as Record<string, number>).claimPayment ?? 0) !== 0)) fail(`rival ${b.studioId} holds claimPayment money but has not closed`)
  }
  for (const r of marketReceipts) if (r.kind === 'proposalWithdrawn' && (r.studioId === null || closedAt.get(r.studioId) !== r.week)) {
    // Current49's owner forwards only an exact event already proved by its full
    // v7 obligation join. A reason string or raw absorption row grants nothing.
    const absorbed=policy.rightsEstate?policy.absorptionWithdrawals?.get(r.eventId):undefined
    if (!absorbed || absorbed.kind !== r.kind || absorbed.eventId !== r.eventId || absorbed.week !== r.week
      || absorbed.studioId !== r.studioId || absorbed.talentId !== r.talentId
      || JSON.stringify(absorbed.reasons) !== JSON.stringify(r.reasons) || JSON.stringify(absorbed.dropped) !== JSON.stringify(r.dropped)) {
      fail(`market receipt ${r.eventId} withdraws a proposal for a closure that did not happen`)
    }
  }
  for (const kase of state.talentMarket.cases) if (kase.reason === CLOSURE_CASE_REASON && closedAt.get(kase.subjectStudioId) !== kase.closedWeek) fail(`a market case was invalidated for a closure that did not happen`)
}

/** The downgrade refusal (§5): null when nothing has closed. */
export function studioClosureDowngradeRefusal(state: Record<string, unknown>): string | null {
  const root = state.studioClosure
  if (!isRecord(root)) return null
  const reasons: string[] = []
  if (Array.isArray(root.closures) && root.closures.length > 0) reasons.push(`cannot downgrade or discard an actual studio closure (${root.closures.length} recorded)`)
  if (Array.isArray(root.claims) && root.claims.length > 0) reasons.push(`cannot downgrade or discard a closure claim (${root.claims.length} recorded)`)
  if (Array.isArray(root.estateEvents) && root.estateEvents.length > 0) reasons.push(`cannot downgrade or discard an estate event (${root.estateEvents.length} recorded)`)
  return reasons.length === 0 ? null : reasons.join('; ')
}
