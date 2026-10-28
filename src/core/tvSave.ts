// ── P18 save step (Save51 over P17's Save50): the lazy `television` root ──────────────────────────────
//
// The Save50 guard pattern, one step up: the root is absent until the first commission and never empties (no row is
// deleted), so absence is the one encoding of "no season". Migration from Save50 writes nothing but the version — no
// series, grant, contract, advance or work is inferred from old facts — and a downgrade is lossless exactly while the
// root is absent and no television money row or counterparty licence exists; otherwise it refuses once, by name.
//
// The predecessor chain proves the state without the root under the Save51 era ("tv-p18" ledger policy, the
// counterparty licence law), so the cash is never rewritten for the proof (review P18-01): the television rows stay in
// the ledger and the studio cash reconciles with them as recorded. This module proves the root itself, exactly joined
// to the rest: P16 licence and title facts, the people and their P12 contracts, the adoption, the facilities and sets,
// and every television ledger row one-to-one with the receipt that records it.
//
// Sprint 13 slice 1 extends the root IN PLACE (still Save51): a delivered season carries `deliveredWeek`, a cancelled
// one `cancellation`, and its agreement `settlement`; each leaf is present exactly in its terminal state, so the root's
// absence/presence encoding and the downgrade guard are unchanged. The validator replays delivery (milestone less the
// late reduction), the distribution expiry receipt, the frozen U0/K settlement and every refund/charge payment.

import { assignmentBlockedTalentIds } from './employment.js'
import { assertNoDoubleBookedResourceSlots } from './occupancy.js'
import { RIGHTS_COUNTERPARTY_IDS, holderBeforeWrite, resolveTitles, type Licence } from './rights.js'
import { TUNING } from './tuning.js'
import { TV_WORK_BLOCKS, TV_WORK_UNITS_TOTAL, tvBlockDefinition, tvEngagedTalentIds, tvTermsFor, tvUnitsThrough } from './tvReaders.js'
import { TV_COMMISSIONER_ID, TV_LEDGER_KINDS, TV_RULESET_VERSION, TV_WORK_BLOCK_ORDER } from './tvTypes.js'
import type { TelevisionRoot, TvAgreement, TvAgreementTerms, TvMilestoneKind, TvReceipt, TvSeason } from './tvTypes.js'
import type { GameState } from './types.js'

export const P18_ROOT_KEYS = ['television'] as const
const ROOT_KEYS = ['agreements', 'nextId', 'receipts', 'seasons', 'series', 'version']
const SERIES_KEYS = ['createdWeek', 'producerStudioId', 'propertyId', 'seasonIds', 'seriesId', 'title']
const SEASON_KEYS = ['adoptionId', 'agreementId', 'commissionerId', 'commitWeek', 'credits', 'distributionLicenceId', 'dueWeek', 'episodes', 'finalWeek',
  'producerStudioId', 'productionAuthority', 'propertyId', 'reservations', 'roster', 'rulesetVersion', 'seasonId', 'seasonNumber', 'seriesId', 'setId',
  'status', 'work', 'workId', 'writerReleasedWeek']
const WORK_KEYS = ['block', 'blockCredited', 'creditedUnits', 'lastCreditedWeek', 'stageHeldSinceWeek', 'stall']
const AGREEMENT_KEYS = ['agreementId', 'commissionerId', 'earned', 'milestones', 'received', 'rulesetVersion', 'seasonId', 'studioId', 'terms']
const RECEIPT_KEYS: Record<TvReceipt['kind'], string[]> = {
  commissioned: ['seriesId', 'distributionLicenceId'],
  advancePaid: ['amount'],
  unitCredited: ['block', 'creditedUnits', 'amount'],
  blockCompleted: ['block'],
  writerReleased: ['talentId'],
  milestoneEarned: ['milestone', 'amount'],
  milestonePaid: ['milestone', 'amount'],
  delivered: ['lateWeeks'],
  deliveryReduction: ['amount'],
  distributionExpired: [],
  cancelled: ['cause', 'refundDue', 'chargeDue'],
  advanceRefundPaid: ['amount', 'source'],
  cancellationChargePaid: ['amount', 'source'],
}
const SETTLEMENT_KEYS = ['chargeDue', 'chargePaid', 'closureId', 'refundDue', 'refundPaid', 'week']
const TERMINAL_KEYS: Record<string, string[]> = { live: [], delivered: ['deliveredWeek'], cancelled: ['cancellation'] }

/** The state without the step's root, every other key kept in its order. */
export function stripP18Roots(raw: object): Record<string, unknown> {
  return Object.fromEntries(Object.entries(raw).filter(([key]) => !(P18_ROOT_KEYS as readonly string[]).includes(key)))
}

/** Recorded P18 authority refuses a downgrade, by name: the root, a television money row or a counterparty licence. */
export function p18DowngradeRefusal(state: Record<string, unknown>): string | null {
  const root = state.television as TelevisionRoot | undefined
  if (root !== undefined) return `cannot downgrade or discard ${root.seasons.length} recorded television season(s)`
  const ledger = state.ledger as readonly { kind: string }[] | undefined
  if (ledger?.some((row) => (TV_LEDGER_KINDS as readonly string[]).includes(row.kind))) return 'cannot downgrade or discard a television ledger row'
  const licences = (state.rights as { licences?: Licence[] } | undefined)?.licences ?? []
  if (licences.some((l) => RIGHTS_COUNTERPARTY_IDS.includes(l.granteeId))) return 'cannot downgrade or discard a counterparty television licence'
  return null
}

const sameKeys = (value: unknown, keys: readonly string[]): boolean =>
  value !== null && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).sort().join() === [...keys].sort().join()
const whole = (value: unknown): value is number => Number.isSafeInteger(value)

/** The root, when present, leaf-exact and exact-joined to the (already validated) rest of the state. */
export function validateP18Roots(raw: Record<string, unknown>, label: string): void {
  const fail = (rule: string): never => { throw new Error(`${label}: television ${rule}`) }
  const rest = stripP18Roots(raw) as unknown as GameState
  const tvRows = rest.ledger.filter((row) => (TV_LEDGER_KINDS as readonly string[]).includes(row.kind))
  const tvLicences = rest.rights.licences.filter((l) => RIGHTS_COUNTERPARTY_IDS.includes(l.granteeId))
  if (!Object.hasOwn(raw, 'television')) {
    if (tvRows.length > 0) fail('money rows exist but the root is absent')
    if (tvLicences.length > 0) fail('a counterparty licence exists but the root is absent')
    return
  }
  const root = raw.television as TelevisionRoot
  if (!sameKeys(root, ROOT_KEYS)) fail(`root must carry exactly ${ROOT_KEYS.join(', ')}`)
  if (root.version !== 1) fail('root version must be 1')
  if (!whole(root.nextId) || root.nextId < 1) fail('nextId must be a whole number of at least 1')
  for (const key of ['series', 'seasons', 'agreements', 'receipts'] as const) if (!Array.isArray(root[key])) fail(`${key} must be an array`)
  if (root.series.length === 0) fail('root is present but records nothing (absence is the empty encoding)')
  const h = rest.hollywood
  if (h === null) fail('a television root needs the living industry whose P16 rights it was commissioned under')
  const player = h!.playerStudioId
  const week = rest.market.tick
  const ids = new Set<string>()
  const id = (value: unknown, prefix: string): string => {
    const m = typeof value === 'string' ? new RegExp(`^${prefix}-(\\d+)$`).exec(value) : null
    if (m === null || Number(m[1]) < 1 || Number(m[1]) >= root.nextId || ids.has(value as string)) fail(`id ${String(value)} is not a fresh ${prefix} below nextId`)
    ids.add(value as string)
    return value as string
  }
  // series
  for (const s of root.series) {
    if (!sameKeys(s, SERIES_KEYS)) fail(`series must carry exactly ${SERIES_KEYS.join(', ')}`)
    id(s.seriesId, 'tv-series')
    if (typeof s.title !== 'string' || s.title.trim().length === 0) fail(`series ${s.seriesId} needs a title`)
    if (s.producerStudioId !== player) fail(`series ${s.seriesId} producer must be the player studio`)
    if (!whole(s.createdWeek) || s.createdWeek > week) fail(`series ${s.seriesId} createdWeek is not a past week`)
    if (!Array.isArray(s.seasonIds) || s.seasonIds.length !== 1) fail(`series ${s.seriesId} must name its one season`)
  }
  // seasons
  const live = root.seasons.filter((s) => s.status === 'live')
  if (live.length > 1) fail('one active season per studio')
  const talentIds = new Set(rest.talent.map((t) => t.id))
  for (const s of root.seasons) {
    const seasonKeys = [...SEASON_KEYS, ...(TERMINAL_KEYS[String(s.status)] ?? [])]
    if (!sameKeys(s, seasonKeys)) fail(`season must carry exactly ${seasonKeys.join(', ')}`)
    id(s.seasonId, 'tv-season')
    id(s.workId, 'tv-work')
    const series = root.series.find((row) => row.seriesId === s.seriesId)
    if (series === undefined || series.seasonIds[0] !== s.seasonId || series.propertyId !== s.propertyId) fail(`season ${s.seasonId} names no series that records it`)
    if (!Object.hasOwn(TERMINAL_KEYS, String(s.status))) fail(`season ${s.seasonId} status ${String(s.status)} is not live, delivered or cancelled`)
    if (s.producerStudioId !== player || s.commissionerId !== TV_COMMISSIONER_ID || s.rulesetVersion !== TV_RULESET_VERSION || s.seasonNumber !== 1 || s.episodes !== TUNING.TV_SEASON_EPISODES) {
      fail(`season ${s.seasonId} parties, ruleset or episode metadata are not the contract's`)
    }
    if (!whole(s.commitWeek) || s.commitWeek > week || s.commitWeek !== series!.createdWeek) fail(`season ${s.seasonId} commitWeek is not its series' creation week`)
    // The agreement's terms must be exactly the frozen v1 terms (contract §5; a change is a versioned contract amendment);
    // the season's schedule and licence term then read that exact record.
    const agreement = root.agreements.find((row) => row.agreementId === s.agreementId)
    if (agreement === undefined) fail(`season ${s.seasonId} names no agreement`)
    const terms = validateTerms(agreement!.terms, s.commitWeek, `agreement ${agreement!.agreementId}`, fail)
    if (s.dueWeek !== terms.dueWeek || s.finalWeek !== terms.finalWeek) fail(`season ${s.seasonId} schedule is not its agreement's frozen due and final weeks`)
    validateGrant(s, rest, terms, fail)
    // people and credits
    const roster = [s.roster.writerId, s.roster.directorId, s.roster.cast.lead, s.roster.cast.antagonist, s.roster.cast.support, s.roster.craftId]
    if (!sameKeys(s.roster, ['cast', 'craftId', 'directorId', 'writerId']) || !sameKeys(s.roster.cast, ['antagonist', 'lead', 'support'])) fail(`season ${s.seasonId} roster shape`)
    if (new Set(roster).size !== 6 || roster.some((t) => !talentIds.has(t))) fail(`season ${s.seasonId} roster must be six distinct known people`)
    const roles = ['writer', 'director', 'lead', 'antagonist', 'support', 'craft']
    if (!Array.isArray(s.credits) || s.credits.length !== 6 || s.credits.some((c, i) => !sameKeys(c, ['contractId', 'role', 'talentId']) || c.role !== roles[i] || c.talentId !== roster[i]
      || !h!.employment.some((row) => row.contractId === c.contractId && row.studioId === player && row.terms.talentId === c.talentId && row.terms.startWeek <= s.commitWeek
        && s.finalWeek <= row.terms.endWeekExclusive))) {
      fail(`season ${s.seasonId} credits must name each roster person's player contract covering [C, C + 20)`)
    }
    const adoption = rest.technology.adoptions.find((a) => a.id === s.adoptionId)
    if (adoption === undefined || adoption.studioId !== player || adoption.technologyId !== 'synchronized-sound' || adoption.postFacilityId === null) fail(`season ${s.seasonId} names no player synchronized-sound adoption`)
    validateWork(s, rest, adoption!.stageFacilityId, adoption!.postFacilityId!, fail)
    validateTerminal(s, rest, fail)
    // The admission's own union (review should-fix 5): every other engagement plus the reserved guest weeks in [C, C + 20).
    const engagedElsewhere = assignmentBlockedTalentIds(rest, s.commitWeek, s.finalWeek)
    for (const person of tvEngagedTalentIds({ ...root, seasons: [s] })) {
      if (engagedElsewhere.has(person)) fail(`season ${s.seasonId} engages ${person}, who also holds a production, writing or research assignment or a reserved guest week`)
    }
  }
  // agreements and receipts
  for (const a of root.agreements) {
    const agreementKeys = [...AGREEMENT_KEYS, ...(Object.hasOwn(a, 'settlement') ? ['settlement'] : [])]
    if (!sameKeys(a, agreementKeys)) fail(`agreement must carry exactly ${agreementKeys.join(', ')}`)
    id(a.agreementId, 'tv-agreement')
    const season = root.seasons.find((s) => s.seasonId === a.seasonId)
    if (season === undefined || season.agreementId !== a.agreementId) fail(`agreement ${a.agreementId} names no season that records it`)
    validateAgreement(a, season!, root, rest, fail)
  }
  for (const s of root.seasons) if (!root.agreements.some((a) => a.agreementId === s.agreementId)) fail(`season ${s.seasonId} names no agreement`)
  const receiptRows = new Map<string, TvReceipt>()
  for (const r of root.receipts) {
    if (!sameKeys(r, ['receiptId', 'kind', 'week', 'seasonId', 'agreementId', ...(RECEIPT_KEYS[r.kind] ?? ['?'])])) fail(`receipt ${String(r.receiptId)} shape for kind ${String(r.kind)}`)
    id(r.receiptId, 'tv-receipt')
    if (!whole(r.week) || r.week > week) fail(`receipt ${r.receiptId} week is in the future`)
    if (!root.seasons.some((s) => s.seasonId === r.seasonId && s.agreementId === r.agreementId)) fail(`receipt ${r.receiptId} names no season and agreement pair`)
    receiptRows.set(r.receiptId, r)
  }
  // Every television ledger row carries exactly one money receipt's effect, at its sign and week. A tick-written
  // receipt is dated at the boundary T and its row at the advance week T − 1; an action's receipt and row share a week.
  // A settlement payment is the deadline's (tick) only when the cancellation transaction itself wrote it.
  const paymentWeek = (r: Extract<TvReceipt, { source: string }>): number =>
    r.source === 'cancellation' && root.seasons.find((s) => s.seasonId === r.seasonId)?.cancellation?.cause === 'deadline' ? r.week - 1 : r.week
  const carried = new Set<string>()
  for (const row of tvRows) {
    const r = receiptRows.get(row.note)
    const expected = r === undefined ? null
      : r.kind === 'advancePaid' ? { kind: 'tvAdvance', amount: r.amount, week: r.week }
        : r.kind === 'unitCredited' ? { kind: 'tvProductionSpend', amount: -r.amount, week: r.week - 1 }
          : r.kind === 'milestonePaid' ? { kind: 'tvMilestonePayment', amount: r.amount, week: r.week - 1 }
            : r.kind === 'advanceRefundPaid' ? { kind: 'tvAdvanceRefund', amount: -r.amount, week: paymentWeek(r) }
              : r.kind === 'cancellationChargePaid' ? { kind: 'tvCancellationCharge', amount: -r.amount, week: paymentWeek(r) } : null
    if (expected === null || carried.has(row.note) || row.kind !== expected.kind || row.amount !== expected.amount || row.week !== expected.week) {
      fail(`ledger row ${row.kind} ${row.amount} (note ${row.note}) does not carry exactly one television receipt's effect`)
    }
    carried.add(row.note)
  }
  for (const r of root.receipts) {
    if ((r.kind === 'advancePaid' || r.kind === 'unitCredited' || r.kind === 'milestonePaid' || r.kind === 'advanceRefundPaid' || r.kind === 'cancellationChargePaid')
      && !carried.has(r.receiptId)) fail(`receipt ${r.receiptId} has no ledger row carrying it`)
  }
  for (const l of tvLicences) if (!root.seasons.some((s) => s.distributionLicenceId === l.id)) fail(`counterparty licence ${l.id} belongs to no season`)
  // No slot has two owners, the television owner included.
  assertNoDoubleBookedResourceSlots(raw as unknown as GameState, (b) => `${label}: television resource slot "${b.key}" is claimed by ${b.held.owner} "${b.held.ownerId}" and ${b.claimed.owner} "${b.claimed.ownerId}"`)
}

/** Key-order-insensitive JSON: exportSave writes sorted keys (stableStringify), so a reloaded record differs in order only. */
const canonical = (value: unknown): string => JSON.stringify(value, (_key, v: unknown) =>
  v !== null && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) : v)

/** The frozen v1 terms, exactly (contract §5): the producer froze tvTermsFor(C) at acceptance and the record must equal it. */
function validateTerms(t: TvAgreementTerms, commitWeek: number, label: string, fail: (rule: string) => never): TvAgreementTerms {
  if (canonical(t) !== canonical(tvTermsFor(commitWeek))) fail(`${label} terms are not the frozen v1 terms for week ${commitWeek}`)
  return t
}

/** The grant set the season was committed under (contract §3; 19A §3): P16's own records, never a payload. */
function validateGrant(s: TvSeason, rest: GameState, terms: TvAgreementTerms, fail: (rule: string) => never): void {
  const l = rest.rights.licences.find((x) => x.id === s.distributionLicenceId)
  if (l === undefined || l.right !== 'R4' || l.subject.right !== 'R1' || l.subject.propertyId !== s.propertyId || l.scope.use !== 'televisionDistribution' || l.exclusive !== true
    || l.granteeId !== TV_COMMISSIONER_ID || l.grantorId !== s.producerStudioId || l.startWeek !== s.commitWeek || l.endWeekExclusive !== s.finalWeek + terms.distributionWeeks || l.grantedWeek !== s.commitWeek) {
    fail(`season ${s.seasonId} distribution licence ${s.distributionLicenceId} is not the commissioner's exclusive term over [C, final week + distribution weeks) granted by the producer`)
  }
  // The producer held the property's R1 title when P16 minted the licence, and is its grantor (review blocking 4).
  // No NaN fallback (FIX-3, review note 6): a NaN order would quietly read the holder at the end of week C.
  const orderDigits = /-(\d+)$/.exec(l!.transactionId)?.[1]
  if (orderDigits === undefined) fail(`season ${s.seasonId} distribution licence transaction ${String(l!.transactionId)} carries no write order`)
  const order = Number(orderDigits)
  if (holderBeforeWrite(resolveTitles(rest), { right: 'R1', propertyId: s.propertyId }, s.commitWeek, order) !== s.producerStudioId) {
    fail(`season ${s.seasonId} producer did not hold R1 over ${s.propertyId} when the distribution licence was granted at week ${s.commitWeek}`)
  }
  const auth = s.productionAuthority
  if (!sameKeys(auth, ['licenceId', 'via']) || (auth.via === 'title') !== (auth.licenceId === null) || (auth.via !== 'title' && auth.via !== 'licence')) fail(`season ${s.seasonId} production authority shape`)
  // Admission's own licence test (review note 13). The branch is unreachable at this checkpoint: the distribution grant
  // requires the producer to hold the title, and a holder answers through `via: 'title'`.
  if (auth.via === 'licence') {
    const held = rest.rights.licences.find((x) => x.id === auth.licenceId)
    if (held === undefined || held.granteeId !== s.producerStudioId || held.right !== 'R4' || held.scope.use !== 'televisionProduction'
      || held.subject.right !== 'R1' || held.subject.propertyId !== s.propertyId || held.startWeek > s.commitWeek || held.endWeekExclusive <= s.finalWeek) {
      fail(`season ${s.seasonId} production licence ${String(auth.licenceId)} does not cover the producer's television production over [C, C + 20]`)
    }
  }
}

function validateWork(s: TvSeason, rest: GameState, stageId: string, postId: string, fail: (rule: string) => never): void {
  const w = s.work
  if (!sameKeys(w, WORK_KEYS) || !(TV_WORK_BLOCK_ORDER as readonly string[]).includes(w.block)) fail(`season ${s.seasonId} work shape`)
  const block = tvBlockDefinition(w.block)
  if (!whole(w.blockCredited) || w.blockCredited < 0 || w.blockCredited > block.units || w.creditedUnits !== tvUnitsThrough(w.block, w.blockCredited)) fail(`season ${s.seasonId} credited units disagree with the block table`)
  const complete = w.creditedUnits === TV_WORK_UNITS_TOTAL
  if (!complete && w.blockCredited === block.units) fail(`season ${s.seasonId} completed block ${w.block} did not move on`)
  if ((w.creditedUnits === 0) !== (w.lastCreditedWeek === null) || (w.lastCreditedWeek !== null && (!whole(w.lastCreditedWeek) || w.lastCreditedWeek > rest.market.tick
    || w.lastCreditedWeek < s.commitWeek + w.creditedUnits))) fail(`season ${s.seasonId} last credited week`)
  if ((s.writerReleasedWeek === null) !== (w.block === 'scripts')) fail(`season ${s.seasonId} writer release disagrees with the scripts block`)
  if (w.stall !== null && (typeof w.stall !== 'object' || typeof (w.stall as { kind?: unknown }).kind !== 'string')) fail(`season ${s.seasonId} stall shape`)
  const allowed = complete || s.status !== 'live' ? [] : block.capabilities
  const facilities = new Map(rest.operations.facilities.map((f) => [f.id, f]))
  for (const r of s.reservations) {
    const f = facilities.get(r.facilityId)
    if (!sameKeys(r, ['capability', 'facilityId', 'slot']) || f === undefined || f.capability !== r.capability || !whole(r.slot) || r.slot < 0 || r.slot >= f.capacity
      || !allowed.includes(r.capability) || s.reservations.filter((x) => x.capability === r.capability).length !== 1) fail(`season ${s.seasonId} reservation ${r.facilityId}:${r.slot} is not a held slot of its block`)
    if ((r.capability === 'soundstage' && r.facilityId !== stageId) || (r.capability === 'post' && r.facilityId !== postId)) fail(`season ${s.seasonId} holds ${r.capability} off its sound chain`)
  }
  const stage = s.reservations.find((r) => r.capability === 'soundstage')
  if (stage !== undefined && (s.setId === null || !rest.sets.some((set) => set.id === s.setId && set.mountedOn === stage.facilityId))) fail(`season ${s.seasonId} holds a stage without the set standing on it`)
  if (s.setId !== null && TV_WORK_BLOCKS.findIndex((b) => b.block === w.block) < 2) fail(`season ${s.seasonId} bound a set before rehearsal`)
  if (s.status === 'live' && (stage === undefined) !== (w.stageHeldSinceWeek === null) && !(stage === undefined && w.stageHeldSinceWeek !== null && (w.block === 'post' || complete))) fail(`season ${s.seasonId} stage tenure`)
}

/** Contract §6-§7: a terminal season's own leaf, its boundary and its release of every slot. */
function validateTerminal(s: TvSeason, rest: GameState, fail: (rule: string) => never): void {
  const week = rest.market.tick
  const last = s.work.lastCreditedWeek
  if (s.status === 'delivered') {
    const d = s.deliveredWeek
    if (!whole(d) || s.work.creditedUnits !== TV_WORK_UNITS_TOTAL || last === null || d < last || d > s.finalWeek || d > week) {
      fail(`season ${s.seasonId} delivered week ${String(d)} is not a boundary in [its twelfth unit, C + 20] at or before week ${week}`)
    }
  }
  if (s.status === 'cancelled') {
    const c = s.cancellation
    if (!sameKeys(c, ['cause', 'week']) || !whole(c!.week) || c!.week < s.commitWeek || c!.week > week || (last !== null && c!.week < last)) fail(`season ${s.seasonId} cancellation shape or week`)
    const onBoundary = c!.cause === 'deadline' ? c!.week === s.finalWeek : (c!.cause === 'producer' || c!.cause === 'closure') && c!.week < s.finalWeek
    if (!onBoundary) fail(`season ${s.seasonId} cancellation cause ${String(c!.cause)} at week ${c!.week} disagrees with its final boundary ${s.finalWeek}`)
  }
  if (s.status !== 'live' && (s.reservations.length > 0 || s.work.stall !== null)) fail(`season ${s.seasonId} is ${s.status} but still holds a slot or a stall`)
}

function validateAgreement(a: TvAgreement, s: TvSeason, root: TelevisionRoot, rest: GameState, fail: (rule: string) => never): void {
  if (a.studioId !== s.producerStudioId || a.commissionerId !== TV_COMMISSIONER_ID || a.rulesetVersion !== TV_RULESET_VERSION) fail(`agreement ${a.agreementId} parties`)
  // The terms themselves were proved (structure and arithmetic) with their season; the replay below reads them.
  // Milestones replay from the work: scripts after unit 3, picture lock after unit 9; each pays max(0, E − P).
  // Delivery is earned only by a delivered season, at its delivered week, less the frozen late reduction (contract §5).
  const reached: TvMilestoneKind[] = [...(s.work.creditedUnits >= tvUnitsThrough('preparation', 0) ? ['scripts' as const] : []),
    ...(s.work.creditedUnits >= tvUnitsThrough('post', 0) ? ['pictureLock' as const] : []), ...(s.status === 'delivered' ? ['delivery' as const] : [])]
  const lateWeeks = s.status === 'delivered' ? Math.max(0, s.deliveredWeek! - a.terms.dueWeek) : 0
  const reduction = Math.min(a.terms.lateDeductionMax, a.terms.lateDeductionPerWeek * lateWeeks)
  const milestoneEarned = (kind: TvMilestoneKind): number => kind === 'delivery' ? a.terms.milestones.delivery - reduction : a.terms.milestones[kind]
  let earned = 0
  let received = a.terms.advance
  if (!Array.isArray(a.milestones) || a.milestones.length !== reached.length) fail(`agreement ${a.agreementId} milestones disagree with the credited work`)
  for (const [i, m] of a.milestones.entries()) {
    const kind = reached[i]!
    earned += milestoneEarned(kind)
    const pay = Math.max(0, earned - received)
    received += pay
    if (!sameKeys(m, ['earned', 'kind', 'paid', 'week']) || m.kind !== kind || m.earned !== milestoneEarned(kind) || m.paid !== pay
      || (kind === 'delivery' && m.week !== s.deliveredWeek)) fail(`agreement ${a.agreementId} milestone ${String(m.kind)} does not replay`)
    const earnedReceipt = root.receipts.filter((r) => r.kind === 'milestoneEarned' && r.agreementId === a.agreementId && r.milestone === kind && r.amount === m.earned && r.week === m.week)
    const paidReceipt = root.receipts.filter((r) => r.kind === 'milestonePaid' && r.agreementId === a.agreementId && r.milestone === kind && r.amount === m.paid && r.week === m.week)
    if (earnedReceipt.length !== 1 || paidReceipt.length !== (pay > 0 ? 1 : 0)) fail(`agreement ${a.agreementId} milestone ${kind} receipts`)
  }
  if (a.earned !== earned || a.received !== received) fail(`agreement ${a.agreementId} E/P (${a.earned}/${a.received}) do not replay (${earned}/${received})`)
  const mine = root.receipts.filter((r) => r.agreementId === a.agreementId)
  const count = (kind: TvReceipt['kind']): number => mine.filter((r) => r.kind === kind).length
  if (count('commissioned') !== 1 || count('advancePaid') !== 1 || count('milestoneEarned') !== reached.length || count('milestonePaid') !== a.milestones.filter((m) => m.paid > 0).length) fail(`agreement ${a.agreementId} receipt counts`)
  const advance = mine.find((r) => r.kind === 'advancePaid')
  if (advance?.kind !== 'advancePaid' || advance.amount !== a.terms.advance || advance.week !== s.commitWeek) fail(`agreement ${a.agreementId} advance receipt`)
  const commissioned = mine.find((r) => r.kind === 'commissioned')
  if (commissioned?.kind !== 'commissioned' || commissioned.week !== s.commitWeek || commissioned.seriesId !== s.seriesId || commissioned.distributionLicenceId !== s.distributionLicenceId) fail(`agreement ${a.agreementId} commission receipt`)
  const units = mine.filter((r): r is Extract<TvReceipt, { kind: 'unitCredited' }> => r.kind === 'unitCredited')
  if (units.length !== s.work.creditedUnits || units.some((r, i) => r.creditedUnits !== i + 1 || r.amount !== a.terms.unitSpend || r.week <= s.commitWeek
    || (i > 0 && r.week <= units[i - 1]!.week) || r.block !== TV_WORK_BLOCKS.find((b) => tvUnitsThrough(b.block, b.units) >= i + 1)!.block)) {
    fail(`agreement ${a.agreementId} unit receipts do not replay one paid unit per advance in block order`)
  }
  const completedBlocks = TV_WORK_BLOCKS.filter((b) => s.work.creditedUnits >= tvUnitsThrough(b.block, b.units)).map((b) => b.block)
  const blockReceipts = mine.filter((r) => r.kind === 'blockCompleted').map((r) => (r as Extract<TvReceipt, { kind: 'blockCompleted' }>).block)
  if (blockReceipts.join() !== completedBlocks.join()) fail(`agreement ${a.agreementId} block receipts`)
  const writer = mine.filter((r) => r.kind === 'writerReleased')
  if (writer.length !== (s.writerReleasedWeek === null ? 0 : 1) || (writer[0] !== undefined && (writer[0].week !== s.writerReleasedWeek || (writer[0] as { talentId: string }).talentId !== s.roster.writerId))) fail(`agreement ${a.agreementId} writer release receipt`)
  validateDeliveryReceipts(a, s, mine, lateWeeks, reduction, rest.market.tick, fail)
  validateSettlement(a, s, mine, rest, fail)
}

/** The delivered receipt, the late reduction's own noncash receipt, and the distribution expiry at delivered + 52. */
function validateDeliveryReceipts(a: TvAgreement, s: TvSeason, mine: TvReceipt[], lateWeeks: number, reduction: number, week: number, fail: (rule: string) => never): void {
  const delivered = mine.filter((r): r is Extract<TvReceipt, { kind: 'delivered' }> => r.kind === 'delivered')
  const reductions = mine.filter((r): r is Extract<TvReceipt, { kind: 'deliveryReduction' }> => r.kind === 'deliveryReduction')
  const expired = mine.filter((r) => r.kind === 'distributionExpired')
  if (s.status !== 'delivered') {
    if (delivered.length + reductions.length + expired.length > 0) fail(`agreement ${a.agreementId} carries delivery receipts for a ${s.status} season`)
    return
  }
  if (delivered.length !== 1 || delivered[0]!.week !== s.deliveredWeek || delivered[0]!.lateWeeks !== lateWeeks) fail(`agreement ${a.agreementId} delivery receipt`)
  if (reductions.length !== (reduction > 0 ? 1 : 0) || (reductions[0] !== undefined && (reductions[0].amount !== reduction || reductions[0].week !== s.deliveredWeek))) {
    fail(`agreement ${a.agreementId} late reduction receipt (expected ${reduction} for ${lateWeeks} late weeks)`)
  }
  const end = s.deliveredWeek! + a.terms.distributionWeeks
  if (expired.length !== (week >= end ? 1 : 0) || (expired[0] !== undefined && expired[0].week !== end)) fail(`agreement ${a.agreementId} distribution expiry receipt (window ends at week ${end})`)
}

/**
 * Contract §7: a cancelled agreement freezes U0 = P − E and K at its cancellation week; every payment is replayed in
 * receipt order (refund first, then charge; the cancellation's own payments at its week, later ones by action), and a
 * closure-published agreement pays nothing and names an actual closure of its studio at that week.
 */
function validateSettlement(a: TvAgreement, s: TvSeason, mine: TvReceipt[], rest: GameState, fail: (rule: string) => never): void {
  const cancelledReceipts = mine.filter((r): r is Extract<TvReceipt, { kind: 'cancelled' }> => r.kind === 'cancelled')
  const payments = mine.filter((r): r is Extract<TvReceipt, { kind: 'advanceRefundPaid' | 'cancellationChargePaid' }> => r.kind === 'advanceRefundPaid' || r.kind === 'cancellationChargePaid')
  const st = a.settlement
  if (s.status !== 'cancelled') {
    if (st !== undefined || cancelledReceipts.length + payments.length > 0) fail(`agreement ${a.agreementId} carries a settlement for a ${s.status} season`)
    return
  }
  const c = s.cancellation!
  if (!sameKeys(st, SETTLEMENT_KEYS)) fail(`agreement ${a.agreementId} settlement must carry exactly ${SETTLEMENT_KEYS.join(', ')}`)
  if (st!.week !== c.week || st!.refundDue !== a.received - a.earned || st!.chargeDue !== a.terms.cancellationCharge) {
    fail(`agreement ${a.agreementId} settlement does not freeze U0 = P − E (${a.received - a.earned}) and K (${a.terms.cancellationCharge}) at week ${c.week}`)
  }
  if ((c.cause === 'closure') !== (st!.closureId !== null)) fail(`agreement ${a.agreementId} closure id disagrees with cancellation cause ${c.cause}`)
  if (st!.closureId !== null && !rest.studioClosure.closures.some((x) => x.closureId === st!.closureId && x.studioId === s.producerStudioId && x.closureWeek === c.week)) {
    fail(`agreement ${a.agreementId} names closure ${st!.closureId}, which is not ${s.producerStudioId}'s closure at week ${c.week}`)
  }
  const cancelled = cancelledReceipts[0]
  if (cancelledReceipts.length !== 1 || cancelled!.week !== c.week || cancelled!.cause !== c.cause || cancelled!.refundDue !== st!.refundDue || cancelled!.chargeDue !== st!.chargeDue) {
    fail(`agreement ${a.agreementId} cancellation receipt`)
  }
  let refund = 0
  let charge = 0
  let settlementSeen = false
  for (const p of payments) {
    const sourceOk = p.source === 'cancellation' ? !settlementSeen && p.week === c.week : p.source === 'settlement' && p.week >= c.week
    if (p.source === 'settlement') settlementSeen = true
    if (!whole(p.amount) || p.amount <= 0 || !sourceOk || st!.closureId !== null) fail(`agreement ${a.agreementId} payment ${p.receiptId} amount, source or week`)
    if (p.kind === 'advanceRefundPaid') refund += p.amount
    else {
      if (refund !== st!.refundDue) fail(`agreement ${a.agreementId} paid the cancellation charge before the advance refund (${p.receiptId})`)
      charge += p.amount
    }
  }
  if (refund !== st!.refundPaid || charge !== st!.chargePaid || refund > st!.refundDue || charge > st!.chargeDue) {
    fail(`agreement ${a.agreementId} settlement paid ${st!.refundPaid}/${st!.chargePaid} does not replay its receipts (${refund}/${charge})`)
  }
}
