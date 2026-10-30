// ── P16B: licence.ts — the ONE licence producer for the four rights ──
//
// Authority: P16 integration contract §3 ("P16 is the sole title/licence writer. P17/P18 request and
// consume its facts. Use one Licence instrument with subject/right/scope, current lawful grantor,
// grantee, exclusivity, start/end-exclusive weeks, consideration, expiry/reversion terms and
// transaction provenance. No territorial subdivisions in the initial slice. Refuse overlapping
// exclusive scopes, unknown subjects, expired permission, grants wider than the grantor holds and
// sublicensing absent explicit authority"; R1/R2 "Whole-title sale" only; R3 "Exclusive term licence
// only ... Scope explicitly enumerates the permitted continuation use"; R4 "no executable grant
// before the P18 consumer exists"), §7 group R; P16A r3 four-right table; 1362-O §5.9 (no territory
// subdivision in the first licence slices); 1370-as REVIEW finding 7 (the four-right licence producer).
//
// Pure. Title truth is read through rights.ts (`currentHolder`, `rightsAuthority`, `licenceInForce`);
// `rights.licences` is written by `mintLicence` ALONE — assetSale's atomic close calls it with the
// transaction it records, and nothing else appends a licence. Consideration is the transaction's; a
// licence carries its provenance (`transactionId`), never a second price.
//
// P17 (continuations, cameos) and P18 (television) call `permissionFor` at EVERY boundary at which they
// consume a right — admission, each week of work, release, delivery, distribution — against the live
// state. A stored copy of a grant is provenance, not present permission (1370-as REVIEW finding 4).

import { allocateRightsId, counterpartyGrantRefusal, currentHolder, parseStoryPropertyId, R3_USES, R4_CONSUMER_LIVE, R4_USES, RIGHTS_COUNTERPARTY_IDS, sameSubject,
  type Licence, type LicenceScope, type RightsTransaction, type RightSubject } from './rights.js'
import type { GameState } from './types.js'

// The use enumerations, the R4 gate and the live permission read live in rights.ts (the validator reads them too).
export { permissionFor, R3_USES, R4_USES, type Permission } from './rights.js'

/** The grant law's one switch (r2, review F10/F35): R4 grants stay refused until P18's consumer is live.
 * P18 (19A §3): `televisionCounterparty` opens exactly one R4 instrument, the counterparty's exclusive television
 * distribution licence on a property; every other R4 grant, and the bilateral offer route, stays closed. */
export type LicenceLaw = { r4ConsumerLive: boolean; televisionCounterparty?: boolean }
export const P16_LICENCE_LAW: LicenceLaw = Object.freeze({ r4ConsumerLive: R4_CONSUMER_LIVE })

/** One grant as the producer evaluates it: the instrument plus its two parties. */
export type LicenceGrant = {
  right: 'R3' | 'R4'
  subject: RightSubject
  scope: LicenceScope
  exclusive: boolean
  /** Half-open [startWeek, endWeekExclusive); whole weeks; starts no earlier than the grant week. */
  startWeek: number
  endWeekExclusive: number
  grantorId: string
  granteeId: string
}

/** A property is encumbered by live work on its concept, or by a live continuation it links (the player's or any rival's). */
export function activeProductionOn(state: GameState, propertyId: string): boolean {
  const conceptId = parseStoryPropertyId(propertyId)
  if (conceptId === null) return false
  const linked = new Set(state.rights?.properties.find((p) => p.propertyId === propertyId)?.workLinks ?? [])
  const live = [...state.studio.activeProductions, ...(state.hollywood?.businesses ?? []).flatMap((b) => b.productions)]
  return live.some((p) => p.conceptId === conceptId || linked.has(p.id))
}

/** A film is encumbered while its theatrical run is live (the player's or any rival's). */
export function activeRunOn(state: GameState, filmId: string): boolean {
  if (state.theatricalRuns.some((r) => r.productionId === filmId && r.status === 'active')) return true
  return (state.hollywood?.businesses ?? []).some((b) => b.runs.some((r) => r.productionId === filmId))
}

/**
 * The encumbrance the sale law refuses for a whole-title transfer (contract §3: an R1 sale touching an active production;
 * an R2 sale during an active run until a receipt-assignment producer exists), or null. ONE law for the bilateral path and
 * the estate path (r2, review F4/F29).
 */
export function blockingEncumbrance(state: GameState, subject: RightSubject): 'activeProduction' | 'activeRun' | null {
  if (subject.right === 'R1') return activeProductionOn(state, subject.propertyId) ? 'activeProduction' : null
  return activeRunOn(state, subject.filmId) ? 'activeRun' : null
}

function overlapsExclusive(licences: readonly Licence[], grant: LicenceGrant): boolean {
  return licences.some((l) => l.right === grant.right && sameSubject(l.subject, grant.subject) && l.scope.use === grant.scope.use
    && (l.exclusive || grant.exclusive) && l.startWeek < grant.endWeekExclusive && grant.startWeek < l.endWeekExclusive)
}

/**
 * The four-right instrument law for one grant at `week`; null when lawful. Order: the right's own boundary — R3: on a
 * property, exclusive, an enumerated continuation use; R4 (r2, review F10/F35): its consumer live, an R1 or R2 subject,
 * exclusive or nonexclusive, television or merchandise — then the term, the parties, the title (unknown / unresolvable /
 * archived or in an estate / a grantor who is not the current holder, which is also every sublicence, since no explicit
 * sublicensing authority exists in this slice), the active-production encumbrance of an R3 grant (contract §3 names the
 * exclusive R3 grant only), and finally overlap with a live exclusive grant of the same use (or any grant, for an
 * exclusive one).
 */
export function licenceGrantRefusal(state: GameState, grant: LicenceGrant, week: number, law: LicenceLaw = P16_LICENCE_LAW): string | null {
  const counterparty = counterpartyGrantRefusal(grant)
  if (counterparty !== null) return counterparty
  if (grant.right === 'R4') {
    if (!law.r4ConsumerLive && !(law.televisionCounterparty === true && RIGHTS_COUNTERPARTY_IDS.includes(grant.granteeId))) return 'r4ConsumerNotLive'
    if (grant.subject.right !== 'R1' && grant.subject.right !== 'R2') return 'unknownSubject'
    if (typeof grant.exclusive !== 'boolean') return 'invalidExclusivity'
    if (!(R4_USES as readonly string[]).includes(grant.scope.use)) return 'invalidScope'
  } else if (grant.right === 'R3') {
    if (grant.subject.right !== 'R1') return 'r3RequiresProperty'
    if (grant.exclusive !== true) return 'r3RequiresExclusive'
    if (!(R3_USES as readonly string[]).includes(grant.scope.use)) return 'invalidScope'
  } else {
    return 'invalidRight'
  }
  if (!Number.isSafeInteger(grant.startWeek) || !Number.isSafeInteger(grant.endWeekExclusive) || grant.startWeek < week || grant.endWeekExclusive <= grant.startWeek) return 'invalidTerm'
  if (grant.grantorId === grant.granteeId) return 'selfGrant'
  const holder = currentHolder(state, grant.subject, week)
  if (holder.kind === 'unavailable') return holder.reason === 'unknownSubject' ? 'unknownSubject' : `holderUnavailable:${holder.reason}`
  if (holder.archived || holder.estate !== undefined || !holder.tradeable) return 'notTradeable'
  if (holder.holderId !== grant.grantorId) return 'grantorNotHolder'
  if (grant.right === 'R3' && grant.subject.right === 'R1' && activeProductionOn(state, grant.subject.propertyId)) return 'activeProductionEncumbrance'
  if (overlapsExclusive(state.rights.licences, grant)) return 'exclusiveOverlap'
  return null
}

/**
 * The one writer of `rights.licences`: refuses loudly by the law above, else appends exactly one licence
 * with the next `rights-licence-<n>` id, dated `week`, citing the transaction that paid for it.
 */
export function mintLicence(state: GameState, grant: LicenceGrant, week: number, transactionId: string, law: LicenceLaw = P16_LICENCE_LAW): { state: GameState; licence: Licence } {
  const refusal = licenceGrantRefusal(state, grant, week, law)
  if (refusal !== null) throw new Error(`licence grant refused: ${refusal}`)
  const allocated = allocateRightsId(state.rights, 'rights-licence')
  const licence: Licence = { id: allocated.id, right: grant.right, subject: grant.subject, scope: grant.scope, exclusive: grant.exclusive,
    grantorId: grant.grantorId, granteeId: grant.granteeId, startWeek: grant.startWeek, endWeekExclusive: grant.endWeekExclusive, grantedWeek: week, transactionId }
  return { state: { ...state, rights: { ...allocated.root, licences: [...allocated.root.licences, licence] } }, licence }
}

/** Where a licence stands at `week`: before its term, in force, or expired (reverted to the grantor's title). */
export function licenceStatus(licence: Pick<Licence, 'startWeek' | 'endWeekExclusive'>, week: number): 'pending' | 'inForce' | 'expired' {
  return week < licence.startWeek ? 'pending' : week < licence.endWeekExclusive ? 'inForce' : 'expired'
}

/** The licences in force at `week` whose grantee is `studioId`, in root order. */
export function licencesHeldBy(state: GameState, studioId: string, week: number): Licence[] {
  return state.rights.licences.filter((l) => l.granteeId === studioId && licenceStatus(l, week) === 'inForce')
}

/**
 * P18 (19A §3; contract §3 "P16 must accept this actual party type for a lawful TV grant before admission"): the one
 * producer of a counterparty licence. The grantor must be the property's current R1 holder (the law above); the
 * licence is minted by `mintLicence` under the counterparty law and recorded with its own `licenceGrant` transaction,
 * offer-less because the counterparty is no studio and makes no offer. `consideration` is the transaction amount; at
 * this checkpoint it is the disclosed zero of the unresolved 19A assumption, so no ledger row and no cash move. A
 * refusal throws before anything is written.
 */
export function grantCounterpartyLicence(state: GameState, grant: LicenceGrant, week: number, consideration: number): { state: GameState; licence: Licence; transaction: RightsTransaction } {
  if (!RIGHTS_COUNTERPARTY_IDS.includes(grant.granteeId)) throw new Error(`licence grant refused: ${grant.granteeId} is not a contractual counterparty`)
  if (consideration !== 0) throw new Error('licence grant refused: a counterparty licence has no paying account; only the disclosed zero consideration is lawful at this checkpoint')
  const txAllocated = allocateRightsId(state.rights, 'rights-tx')
  const minted = mintLicence({ ...state, rights: txAllocated.root }, grant, week, txAllocated.id, { r4ConsumerLive: false, televisionCounterparty: true })
  const transaction: RightsTransaction = { id: txAllocated.id, week, kind: 'licenceGrant', payerId: grant.granteeId, payeeId: grant.grantorId, estateId: null,
    amount: consideration, subject: grant.subject, licenceId: minted.licence.id, offerId: null, lotId: null, bidId: null, titleEventIds: [] }
  return { state: { ...minted.state, rights: { ...minted.state.rights, transactions: [...minted.state.rights.transactions, transaction] } }, licence: minted.licence, transaction }
}
